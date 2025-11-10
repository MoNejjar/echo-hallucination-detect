"""
InitiatorAgent
Generates a SINGLE clarifying question (if needed), a mitigation plan summary, and 5 prompt variations
based on prior analysis risk tokens & mitigation guidelines.

Variation strategy:
 1. Minimal Fix – only patch critical/high spans locally.
 2. Structured – enumerate steps and add explicit formatting constraints.
 3. Context-Enriched – inject missing explicit referents, temporal, domain context.
 4. Precision-Constrained – adds quantitative bounds & units for vague descriptors.
 5. Source-Grounded – adds placeholders for required sources / citations.

Each variation preserves original intent and does NOT hallucinate new objectives.
"""

import os
import json
import openai
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from ..config import OPENAI_MODEL, TEMPERATURE

load_dotenv()


class InitiatorAgent:
    def __init__(self):
        self.client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = OPENAI_MODEL
        self.temperature = TEMPERATURE
        self.max_tokens = int(os.getenv("MAX_TOKENS", "20000"))
        self.timeout = int(os.getenv("LLM_REQUEST_TIMEOUT", "60"))

    def _load_mitigation_guidelines(self, analysis_mode: str = "both") -> str:
        """Load mitigation XML file; fall back gracefully if not found."""
        mode_files = {
            "faithfulness": "m_faithfulness.xml",
            "factuality": "m_factuality.xml",
            "both": "m_both.xml",
        }
        filename = mode_files.get(analysis_mode, "m_both.xml")
        # Look for a server-local data folder first; otherwise fall back
        data_dir = Path(__file__).parent.parent / "data"
        file_path = data_dir / filename
        if file_path.exists():
            return file_path.read_text(encoding="utf-8")
        # Fallback: embed a minimal skeleton to keep model deterministic
        return f"""<mitigation_guidelines mode='{analysis_mode}'>
<pillars>
    <pillar id='referential' principle='Explicit Referents'>Replace pronouns with explicit nouns where ambiguous.</pillar>
    <pillar id='factuality' principle='Source Grounding'>Request source citations for unverifiable claims.</pillar>
    <pillar id='constraints' principle='Quantitative Specificity'>Add measurable bounds for vague descriptors.</pillar>
</pillars>
</mitigation_guidelines>"""

    def _build_system_prompt(
        self,
        original_prompt: str,
        analysis_output: Dict[str, Any],
        analysis_mode: str = "both",
    ) -> str:
        mitigation_xml = self._load_mitigation_guidelines(analysis_mode)
        risk_tokens = analysis_output.get("risk_tokens", []) if analysis_output else []
        # Compact JSON to reduce token usage
        risk_json = json.dumps(risk_tokens, ensure_ascii=False)
        return f"""<system>
<role>
    You are EchoAI-Initiator. ONE TURN ONLY.
    Tasks:
        1. If essential info is missing for any HIGH or CRITICAL risk span, ask ONE clarifying question.
        2. Produce a brief mitigation_plan referencing rule IDs and grouping by principle.
    You NEVER produce analysis again and NEVER chat beyond this turn.
</role>
<constraints>
    - Preserve user intent.
    - Do NOT fabricate domain facts or sources; use placeholders like [SOURCE] if needed.
    - No verbose explanations; mitigation_plan is concise.
    - No chain-of-thought.
</constraints>
<input_prompt>{original_prompt}</input_prompt>
<risk_tokens_json>{risk_json}</risk_tokens_json>
{mitigation_xml}
<output_schema>
{{
    "clarifying_question": "string | null",
    "mitigation_plan": {{
         "overview": "<=3 sentences",
         "rules_addressed": ["R1","R2",...],
         "principles": [{{"name": "Explicit Referents", "rules": ["R1"], "summary": "..."}}]
    }}
}}
</output_schema>
<rules>
    - OUTPUT ONLY JSON matching schema.
    - null clarifying_question if nothing critical/high missing.
    - No extra keys. No comments.
</rules>
</system>"""

    async def initiate(
        self,
        prompt: str,
        analysis_output: Optional[Dict[str, Any]] = None,
        analysis_mode: str = "both"
    ) -> Dict[str, Any]:
        """Run single-turn initiation and return structured JSON."""
        system_prompt = self._build_system_prompt(prompt, analysis_output or {}, analysis_mode)
        logger = logging.getLogger("uvicorn.error")
        try:
            logger.info("[initiator] calling LLM model=%s prompt_len=%d", self.model, len(system_prompt))
            # Keep it simple: single system message like other services
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "system", "content": system_prompt}],
                    max_completion_tokens=self.max_tokens,
                    temperature=self.temperature,
                ),
                timeout=self.timeout
            )
            content = response.choices[0].message.content
            logger.info("[initiator] raw_content_len=%d", len(content or ""))
        except Exception as e:
            logger.exception("[initiator] LLM call failed")
            raise Exception(f"Initiation LLM call failed: {e}")

        # Cleanup formatting artifacts
        cleaned = (content or "").replace("\n", " ").replace("\t", " ").strip()
        # Strip common code fences
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            cleaned = cleaned.replace("json", "", 1).strip()
        if cleaned.endswith('.{"'):
            cleaned = cleaned.rstrip('.')
        cleaned = cleaned.replace(', }', ' }').replace(', ]', ' ]')

        try:
            result = json.loads(cleaned)
        except json.JSONDecodeError:
            # Attempt substring extraction between first { and last }
            try:
                start = cleaned.find('{')
                end = cleaned.rfind('}')
                if start != -1 and end != -1 and end > start:
                    subset = cleaned[start:end+1]
                    result = json.loads(subset)
                else:
                    raise ValueError("No JSON object detected")
            except Exception:
                result = {
                    "clarifying_question": None,
                    "mitigation_plan": {"overview": "Parsing failed", "rules_addressed": [], "principles": []}
                }

        # Minimal normalization only; no hardcoded content
        if "clarifying_question" not in result:
            result["clarifying_question"] = None
        if "mitigation_plan" not in result:
            result["mitigation_plan"] = {"overview": "", "rules_addressed": [], "principles": []}
        logger.info("[initiator] parsed_success=%s clarifying_question_len=%s overview_len=%s", bool(result), len(result.get("clarifying_question") or ""), len(result.get("mitigation_plan", {}).get("overview", "")))
        return result
