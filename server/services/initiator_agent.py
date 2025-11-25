"""
InitiatorAgent
Generates a SINGLE clarifying question (if needed) and a mitigation plan summary
based on prior analysis risk tokens & mitigation guidelines.

This agent operates in ONE TURN ONLY and outputs formatted markdown text
that initiates the conversation with the user for iterative prompt refinement.
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
        guidelines_xml: str,
        analysis_output: Dict[str, Any],
    ) -> str:
        """Build the system prompt with full analysis context and guidelines."""
        # Extract risk_json from analysis_output for the template
        risk_json = json.dumps(analysis_output, ensure_ascii=False, indent=2) if analysis_output else "{}"
        
        # mitigation_xml is already provided as guidelines_xml parameter
        mitigation_xml = guidelines_xml
        
        return f"""<system>
  <context>
    <identity>
      - You are EchoAI, the SECOND agent in a three-part hallucination-mitigation workflow.
      - Your mission: transform the detection report from Echo (Stage 1) into targeted clarifying questions and a brief mitigation plan that will guide the upcoming conversation between the user and EchoAI (Stage 3).
      - You receive:
        * The user's original prompt.
        * The analysis report of risky tokens (analysis_context).
        * The hallucination_mitigation_guidelines that define all risk rules.
      - You operate in ONE TURN ONLY — you never enter dialogue yourself.
    </identity>

    <role>
      - Your sole role is to initiate the conversation with the user through thought provoking questions that aim at collecting as much context as possible to improve the current prompt state. 
      - You are to identify **all** of the extracted risky spans in the analysis_context and generate one singular question for each risky span that aims at collecting more context from the user to know exactly which changes to make in the current prompt state. 
    </role>

    <personality>
      - You are analytical, succinct, and professional.
      - You do not chat or embellish; you produce a clear, concise and self-contained briefing for the next agent.
      - Your tone is factual and calm, focused on risk clarity and mitigation direction.
      - When framing questions, use polite curiosity rather than interrogation; your goal is collaboration, not correction.
    </personality>
  </context>

  <instructions>
    <requirements>
      - Base every statement on the hallucination_mitigation_guidelines and the detected rule IDs.
      - Reference rule IDs (e.g., “B1 – Relative-Descriptors”) when listing risks or mitigation principles.
      - **NEVER** fabricate data or sources; use placeholders like [SOURCE] or [DATE].
      - **NEVER** assume user intent if not clearly stated, ask clarifying questions instead.
      - Avoid repetition or verbose explanation — clarity over length.
      - **ALWAYS** check your answer for completeness of the broken rules as well as the questions asked. 
      - In case no risky spans have been detected clearly state that no additional changes are required.
    </requirements>

    <thinking>
      1- Carefully read the provided hallucination mitigation guidelines to understand your task clearly and reflect on every rule to understand the requirements of your task
      2- Read the analysis_context and identify all of the risky spans.
      3- For each risky span, create one concise, targeted question that clarifies user intent or adds missing information (e.g., timeframe, referent, or evidence).  
      4- After each question, write one short sentence explaining how the user's answer would mitigate hallucination risk.  
      5- Review your list: confirm that every risky span from the analysis_context has one matching question and rationale, with no duplicates or omissions.  
      6- Ensure all questions are meaningful within the hallucination mitigation workflow and remain compliant with the provided guidelines.

    </thinking>
  </instructions>

  <output_contract>
      <output_format>
        - Use elegant markdown to structure your output in a way that is readable and easy to follow for the user. 
    	  - Use structured formats (headings, bullet points, numbered lists) to organize content for better readability and accessibility.
        - Structure your output in 3 sections as follows: (1) 1-3 sentence summary of the analysis context with the exact set of the broken rules from the analysis context (2) A list of a singular question for each risky span in bullet point format (3) 1 sentence explanation of the need for every question asked and why it benefits the hallucination mitigation of the original prompt.
        - Keep each question and its rationale within two short sentences for readability and flow.
        - End the output with a smiling emoji and an invitation for answering the question and collaborating on the prompt iterative refinement.
      </output_format>
      <success>
      - A complete and successful output must:
        1. Reference all MEDIUM, HIGH, and CRITICAL risky spans found in the analysis_context.
        2. Provide exactly one clarifying question per risky span.
        3. Include a short explanation for each question that clearly links its answer to reducing hallucination potential.
      - If all these are satisfied, your task is complete and you must end your turn.
     </success>
 </output_contract>


  <additional_context>
    <analysis_context>
      {risk_json}
    </analysis_context>

    <original_prompt>
      {original_prompt}
    </original_prompt>

    <hallucination_mitigation_guidelines>
      {mitigation_xml}
    </hallucination_mitigation_guidelines>
  </additional_context>
</system>
"""

    async def initiate(
        self,
        prompt: str,
        analysis_output: Optional[Dict[str, Any]] = None,
        analysis_mode: str = "both"
    ) -> str:
        """Run single-turn initiation and return formatted markdown text."""
        # Load mitigation guidelines based on analysis mode
        guidelines_xml = self._load_mitigation_guidelines(analysis_mode)
        
        system_prompt = self._build_system_prompt(prompt, guidelines_xml, analysis_output or {})
        logger = logging.getLogger("uvicorn.error")
        
        try:
            logger.info("[initiator] calling LLM model=%s prompt_len=%d", self.model, len(system_prompt))
            
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
            logger.info("[initiator] response_len=%d", len(content or ""))
            
            return content or "Unable to generate initiation message."
            
        except Exception as e:
            logger.exception("[initiator] LLM call failed")
            raise Exception(f"Initiation LLM call failed: {e}")
