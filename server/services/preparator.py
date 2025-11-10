"""
Analysis Preparator Service
Refines prompts based on prior analysis, conversation history, and mitigation strategies.
"""

import openai
import os
import asyncio
from typing import Dict, Any, List, Tuple
import logging
from dotenv import load_dotenv
from ..config import OPENAI_MODEL, TEMPERATURE

load_dotenv()


class AnalysisPreparator:
    """Service that prepares refined prompts for re-analysis.

    Enhancement: now also generates 5 strategic variation suggestions AFTER applying
    user final edits and mitigation logic. These variations each emphasize a different
    mitigation dimension while preserving original intent.
    """
    
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.model = OPENAI_MODEL
        self.temperature = TEMPERATURE
        self.max_tokens = int(os.getenv("MAX_TOKENS", "20000"))
        self.timeout = int(os.getenv("LLM_REQUEST_TIMEOUT", "60"))
        self.logger = logging.getLogger(__name__)
    
    async def refine_prompt(
        self,
        current_prompt: str,
        prior_analysis: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        user_final_edits: str = ""
    ) -> Dict[str, Any]:
        """Refine the prompt and generate 5 mitigation-informed variations.

        Incorporates:
          - Current prompt
          - Prior analysis (risk tokens + violations)
          - Conversation history (context only)
          - User's final edits (must be applied exactly)
          - Mitigation guidelines (embedded in system prompt)

        Returns dict with keys:
          refined_prompt: str  (primary recommended prompt)
          variations: List[ {id,label,prompt,focus} ] (5 items)
        """

        # Build conversation context
        conversation_context = self._format_conversation(conversation_history)

        # Extract key findings from prior analysis
        analysis_context = self._format_analysis(prior_analysis)

        # Create the refinement prompt (inside the async method scope)
        system_prompt = """You are an expert prompt engineer specializing in hallucination mitigation.

TASKS (SEQUENTIAL):
    A. Produce a PRIMARY refined prompt applying only necessary mitigation changes + user's final edits.
    B. Then produce EXACTLY 5 strategic VARIATIONS, each with a distinct mitigation focus:
             1. Minimal Patch – applies only critical/high fixes; minimal surface change.
             2. Structured – enumerated steps, explicit sections, output formatting.
             3. Context-Enriched – resolves all ambiguity (actors, temporal, domain) explicitly.
             4. Precision-Constrained – injects quantitative bounds, units, and success criteria.
             5. Source-Grounded – adds placeholders for citations/sources/evidence blocks.

HARD RULES:
    - Start from CURRENT PROMPT (not conversation text) + apply USER FINAL EDITS verbatim.
    - Never import assistant prior wording or hallucinate new objectives.
    - Preserve original intent & scope; do NOT broaden unless required to fix a risk.
    - Keep lexical overlap >=60% except where ambiguity removal demands substitution.
    - No chain-of-thought explanations; output only JSON per schema.

MITIGATION PLAYBOOK (apply only if relevant):
    - Referential clarity, structural delimitation, verifiability, factual grounding,
        constraint specificity, reasoning disambiguation, uncertainty handling.

OUTPUT CONTRACT:
    1) PRIMARY: JSON per schema (STRICT) — this should be the first thing in your response.
    2) MIRROR: Also include an XML mirror AFTER the JSON to maximize parser robustness:
       <REFINED_PROMPT>...</REFINED_PROMPT>
       <VARIATIONS_JSON>[{{...}}, {{...}}, {{...}}, {{...}}, {{...}}]</VARIATIONS_JSON>

OUTPUT JSON SCHEMA (STRICT):
{
    "refined_prompt": "string",
    "variations": [
         {"id":1, "label":"Minimal Patch", "focus":"what risk focus it addresses", "prompt":"..."},
         {"id":2, "label":"Structured", "focus":"...", "prompt":"..."},
         {"id":3, "label":"Context-Enriched", "focus":"...", "prompt":"..."},
         {"id":4, "label":"Precision-Constrained", "focus":"...", "prompt":"..."},
         {"id":5, "label":"Source-Grounded", "focus":"...", "prompt":"..."}
    ]
}

VALIDATION RULES:
    - EXACTLY 5 variations.
    - All fields present; no trailing commas; no extra top-level keys.
    - Each variation prompt must integrate user_final_edits where semantically applicable.
"""

        user_prompt = f"""CURRENT_PROMPT:\n{current_prompt}\n\nPRIOR_ANALYSIS_SUMMARY:\n{analysis_context}\n\nCONVERSATION_HISTORY_CONTEXT:\n{conversation_context}\n\nUSER_FINAL_EDITS:\n{user_final_edits if user_final_edits else '(None)'}\n\nRespond with the JSON per schema FIRST. Then include the XML mirror tags with the same content as a fallback, like:\n<REFINED_PROMPT>...</REFINED_PROMPT>\n<VARIATIONS_JSON>[{{...}}, {{...}}, {{...}}, {{...}}, {{...}}]</VARIATIONS_JSON>"""

        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=self.temperature,
                    max_completion_tokens=self.max_tokens
                ),
                timeout=self.timeout
            )

            raw = response.choices[0].message.content.strip()
            self.logger.info("[Preparator] Raw LLM length=%d", len(raw) if raw else 0)
            cleaned = self._extract_json(raw)
            source = "primary_or_xml"

            # Ensure we have refined_prompt as string
            if not isinstance(cleaned.get("refined_prompt", ""), str):
                cleaned["refined_prompt"] = str(cleaned.get("refined_prompt", ""))

            # Validate and repair variations to guarantee 5 items
            variations = cleaned.get("variations", [])
            if not isinstance(variations, list):
                variations = []

            if len(variations) != 5:
                self.logger.warning("[Preparator] Expected 5 variations, got %d. Attempting fallback generation.", len(variations))
                try:
                    generated = await self._generate_variations_from_refined(
                        refined_prompt=cleaned.get("refined_prompt", ""),
                        prior_analysis=prior_analysis,
                        conversation_history=conversation_history,
                        user_final_edits=user_final_edits
                    )
                    variations = generated
                    source = "fallback_llm"
                except Exception as e:
                    self.logger.error("[Preparator] Fallback variation generation failed: %s", str(e))
            # If still not 5, synthesize locally as last resort
            if len(variations) != 5:
                self.logger.warning("[Preparator] Still have %d variations after fallback. Using local synthesis.", len(variations))
                variations = self._synthesize_variations_locally(
                    refined_prompt=cleaned.get("refined_prompt", ""),
                    user_final_edits=user_final_edits
                )
                source = "local_synthesis"
            # Normalize and enforce schema/id/labels
            variations = self._normalize_variations(variations)
            cleaned["variations"] = variations
            cleaned["source"] = source
            self.logger.info("[Preparator] Returning refined prompt and %d variations", len(variations))
            return cleaned
            
        except asyncio.TimeoutError:
            raise Exception(f"Prompt refinement timed out after {self.timeout}s")
        except Exception as e:
            raise Exception(f"Error refining prompt: {str(e)}")
    
    def _format_conversation(self, history: List[Dict[str, str]]) -> str:
        """Format conversation history for context only - not for copying into prompt."""
        if not history:
            return "(No prior conversation)"
        
        formatted = ["(Context: This is what was discussed - DO NOT copy this text into the prompt)"]
        for msg in history[-10:]:  # Last 10 messages for context
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')
            # Truncate long messages to avoid overwhelming context
            if len(content) > 200:
                content = content[:200] + "... [truncated]"
            formatted.append(f"{role.upper()}: {content}")
        
        return "\n".join(formatted)
    
    def _format_analysis(self, analysis: Dict[str, Any]) -> str:
        """Format analysis findings for context."""
        if not analysis:
            return "(No prior analysis)"
        
        parts = []
        
        # Prompt-level violations
        risk_assessment = analysis.get('risk_assessment', {})
        if risk_assessment:
            prompt_data = risk_assessment.get('prompt', {})
            meta_data = risk_assessment.get('meta', {})
            
            prompt_violations = prompt_data.get('prompt_violations', [])
            meta_violations = meta_data.get('meta_violations', [])
            
            if prompt_violations:
                parts.append(f"PROMPT-LEVEL RISKS ({len(prompt_violations)} violations):")
                for v in prompt_violations[:5]:  # Top 5
                    parts.append(f"  - {v.get('rule_id', 'Unknown')}: {v.get('pillar', '')} (severity: {v.get('severity', 'unknown')})")
                    parts.append(f"    Span: \"{v.get('span', '')}\"")
            
            if meta_violations:
                parts.append(f"\nMETA-LEVEL RISKS ({len(meta_violations)} violations):")
                for v in meta_violations[:5]:  # Top 5
                    parts.append(f"  - {v.get('rule_id', 'Unknown')}: {v.get('pillar', '')} (severity: {v.get('severity', 'unknown')})")
                    parts.append(f"    Issue: {v.get('explanation', '')}")
        
        return "\n".join(parts) if parts else "(No violations detected)"
    
    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Attempt to parse JSON from model output robustly.

        Strategy:
          1) Strip code fences and markdown prelude.
          2) Attempt a direct json.loads.
          3) If fails, locate the largest balanced-brace JSON object substring.
          4) Remove trailing commas and retry.
        """
        import json, re

        original = text or ""
        # Strip markdown-style fences
        # Remove ```json ... ``` or ``` ... ``` wrappers if present
        fence_match = re.match(r"^```[a-zA-Z0-9]*\n([\s\S]*?)\n```\s*$", original)
        if fence_match:
            text = fence_match.group(1)
        else:
            text = original

        # First attempt: direct parse
        try:
            return json.loads(text)
        except Exception:
            pass

        # Second attempt: find substring from first '{' to last '}' with simple balancing
        start = text.find('{')
        end = text.rfind('}')
        candidate = text[start:end+1] if start != -1 and end != -1 and end > start else text

        # Attempt to fix common issues: trailing commas
        candidate_clean = re.sub(r",(\s*[}\]])", r"\1", candidate)

        try:
            return json.loads(candidate_clean)
        except Exception:
            # As a last resort, try to extract the first JSON-looking object with regex
            match = re.search(r"\{[\s\S]*\}", text)
            if match:
                alt = re.sub(r",(\s*[}\]])", r"\1", match.group(0))
                try:
                    return json.loads(alt)
                except Exception:
                    pass

        # Fallback: try to recover from XML mirrors
        data_from_xml = self._extract_from_xml(text)
        if data_from_xml:
            return data_from_xml

        # Fallback minimal structure
        return {"refined_prompt": "PARSE_FAILURE", "variations": []}

    def _extract_from_xml(self, text: str) -> Dict[str, Any] | None:
        """Extract refined_prompt and variations from XML mirror tags when present."""
        import json, re
        refined_prompt = None
        variations: List[Dict[str, Any]] = []

        rp_match = re.search(r"<REFINED_PROMPT>([\s\S]*?)</REFINED_PROMPT>", text)
        if rp_match:
            refined_prompt = rp_match.group(1).strip()

        var_match = re.search(r"<VARIATIONS_JSON>([\s\S]*?)</VARIATIONS_JSON>", text)
        if var_match:
            inner = var_match.group(1).strip()
            # Remove code fences inside XML if any
            inner = re.sub(r"^```[a-zA-Z0-9]*\n|\n```$", "", inner)
            try:
                parsed = json.loads(inner)
                if isinstance(parsed, list):
                    variations = parsed
                elif isinstance(parsed, dict) and "variations" in parsed:
                    v = parsed.get("variations", [])
                    if isinstance(v, list):
                        variations = v
            except Exception:
                pass

        if refined_prompt or variations:
            return {
                "refined_prompt": refined_prompt or "",
                "variations": variations or []
            }
        return None

    def _normalize_variations(self, variations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Ensure variations adhere to expected schema and exactly 5 items if possible."""
        normalized: List[Dict[str, Any]] = []
        labels = ["Minimal Patch", "Structured", "Context-Enriched", "Precision-Constrained", "Source-Grounded"]
        for idx, v in enumerate(variations[:5]):
            try:
                label = str(v.get("label") or (labels[idx] if idx < len(labels) else f"Variant {idx+1}"))
                focus = str(v.get("focus") or "")
                prompt = str(v.get("prompt") or "")
                normalized.append({
                    "id": idx + 1,
                    "label": label,
                    "focus": focus,
                    "prompt": prompt
                })
            except Exception:
                continue
        return normalized

    async def _generate_variations_from_refined(
        self,
        refined_prompt: str,
        prior_analysis: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        user_final_edits: str = ""
    ) -> List[Dict[str, Any]]:
        """Fallback: Ask the LLM to generate exactly 5 variations given a refined prompt and context."""
        convo = self._format_conversation(conversation_history)
        analysis_ctx = self._format_analysis(prior_analysis)

        system = (
            "You generate EXACTLY 5 mitigation-focused prompt variants (JSON only). "
            "Follow the labels and focuses strictly. No explanations, just JSON per schema."
        )
        user = f"""REFINED_PROMPT:\n{refined_prompt}\n\nPRIOR_ANALYSIS_SUMMARY:\n{analysis_ctx}\n\nCONVERSATION_HISTORY_CONTEXT:\n{convo}\n\nUSER_FINAL_EDITS:\n{user_final_edits or '(None)'}\n\nSCHEMA:\n{{\n  \"variations\": [\n    {{\"id\":1, \"label\":\"Minimal Patch\", \"focus\":\"...\", \"prompt\":\"...\"}},\n    {{\"id\":2, \"label\":\"Structured\", \"focus\":\"...\", \"prompt\":\"...\"}},\n    {{\"id\":3, \"label\":\"Context-Enriched\", \"focus\":\"...\", \"prompt\":\"...\"}},\n    {{\"id\":4, \"label\":\"Precision-Constrained\", \"focus\":\"...\", \"prompt\":\"...\"}},\n    {{\"id\":5, \"label\":\"Source-Grounded\", \"focus\":\"...\", \"prompt\":\"...\"}}\n  ]\n}}\n\nOutput JSON ONLY."""

        response = await asyncio.wait_for(
            self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user}
                ],
                temperature=self.temperature,
                max_completion_tokens=min(self.max_tokens, 1500)
            ),
            timeout=self.timeout
        )
        raw = response.choices[0].message.content.strip()
        self.logger.info("[Preparator] Fallback raw length=%d", len(raw) if raw else 0)
        data = self._extract_json(raw)
        variations = data.get("variations", []) if isinstance(data, dict) else []
        return variations

    def _synthesize_variations_locally(self, refined_prompt: str, user_final_edits: str = "") -> List[Dict[str, Any]]:
        """Deterministic last-resort synthesis of 5 variants when LLM outputs are unavailable.

        This preserves user_final_edits verbatim where possible and applies heuristic transformations.
        """
        base = refined_prompt or "".strip()
        edits = (user_final_edits or "").strip()
        if edits:
            # If edits aren't already present, append in a controlled block
            if edits not in base:
                base_with_edits = f"{base}\n\n[User Final Edits Applied]\n{edits}"
            else:
                base_with_edits = base
        else:
            base_with_edits = base

        def clamp_len(text: str, max_len: int = 8000) -> str:
            return text if len(text) <= max_len else text[:max_len] + "\n..."

        minimal_patch = clamp_len(base_with_edits)

        structured = clamp_len(
            """
You will perform the following steps:
1) Understand the objective and scope precisely.
2) Identify required inputs and assumptions explicitly.
3) Produce the output in a clearly delimited format.
4) Validate facts and highlight any uncertainties.

Prompt:
"""
            .strip()
            + "\n" + base_with_edits + "\n\nOutput Format:\n- Summary\n- Key Points (bulleted)\n- Final Answer"
        )

        context_enriched = clamp_len(
            f"{base_with_edits}\n\nDisambiguation:\n- Actors: specify who is involved.\n- Timeframe: define temporal context.\n- Domain: clarify terminology and scope.\n- Assumptions: list explicit assumptions." 
        )

        precision_constrained = clamp_len(
            f"{base_with_edits}\n\nConstraints:\n- Quantify targets where possible (units, thresholds).\n- Bound the answer length and level of detail.\n- Provide success criteria and acceptance tests." 
        )

        source_grounded = clamp_len(
            f"{base_with_edits}\n\nEvidence Requirements:\n- Include citations as [SOURCE: ...] placeholders.\n- Distinguish known facts vs. inferences.\n- Provide references or links where applicable." 
        )

        return [
            {"id": 1, "label": "Minimal Patch", "focus": "minimal fixes applied; preserves surface", "prompt": minimal_patch},
            {"id": 2, "label": "Structured", "focus": "stepwise structure and explicit formatting", "prompt": structured},
            {"id": 3, "label": "Context-Enriched", "focus": "remove ambiguity by defining context", "prompt": context_enriched},
            {"id": 4, "label": "Precision-Constrained", "focus": "tight constraints, metrics, success criteria", "prompt": precision_constrained},
            {"id": 5, "label": "Source-Grounded", "focus": "evidence placeholders and verifiability", "prompt": source_grounded},
        ]
