"""
Analysis Preparator Service
Refines prompts based on prior analysis, conversation history, and mitigation strategies.
"""

import openai
import os
import asyncio
from typing import Dict, Any, List
from dotenv import load_dotenv
from ..config import OPENAI_MODEL, TEMPERATURE

load_dotenv()


class AnalysisPreparator:
    """Service that prepares refined prompts for re-analysis."""
    
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.model = OPENAI_MODEL
        self.temperature = TEMPERATURE
        self.max_tokens = int(os.getenv("MAX_TOKENS", "4000"))
        self.timeout = int(os.getenv("LLM_REQUEST_TIMEOUT", "60"))
        
    async def refine_prompt(
        self,
        current_prompt: str,
        prior_analysis: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        user_final_edits: str = ""
    ) -> str:
        """
        Refine the prompt by incorporating:
        1. Current prompt state
        2. Prior analysis findings (violations, risk tokens)
        3. Conversation history with user
        4. User's final manual edits
        5. Hallucination mitigation strategies
        
        Returns the refined prompt ready for re-analysis.
        """
        
        # Build conversation context
        conversation_context = self._format_conversation(conversation_history)
        
        # Extract key findings from prior analysis
        analysis_context = self._format_analysis(prior_analysis)
        
        # Create the refinement prompt
        system_prompt = """You are an expert prompt engineer specializing in hallucination mitigation.

Your task is to refine a user's prompt by:
1. Incorporating insights from the previous hallucination risk analysis
2. Applying mitigation strategies discussed in the conversation
3. Integrating the user's final manual edits
4. Following best practices to minimize hallucination risks

HALLUCINATION MITIGATION GUIDELINES:
- Remove ambiguous referents (it, this, that) - provide explicit nouns
- Add specific constraints (word count, format, scope)
- Specify temporal context (dates, timeframes instead of "recently")
- Include domain/audience specification
- Remove or clarify vague descriptors (short, detailed, comprehensive)
- Add units to numbers (temperature, distance, currency with region)
- Specify document sources when referencing external materials
- Structure multi-step tasks with clear enumeration
- Avoid loaded language and biased framing
- Separate creative from analytical objectives
- Provide clear delimiters between data and instructions

OUTPUT:
Return ONLY the refined prompt text, without any meta-commentary, explanations, or wrapper text.
The output should be ready to use directly as a prompt.
"""

        user_prompt = f"""CURRENT PROMPT:
{current_prompt}

PRIOR ANALYSIS FINDINGS:
{analysis_context}

CONVERSATION HISTORY:
{conversation_context}

USER'S FINAL EDITS:
{user_final_edits if user_final_edits else "(No additional edits)"}

Based on all of the above, produce a refined version of the prompt that:
- Addresses the identified hallucination risks
- Incorporates suggestions from the conversation
- Includes the user's final edits
- Maintains the user's original intent and requirements
- Is clear, specific, and hallucination-resistant

REFINED PROMPT:"""

        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=self.temperature,
                    max_tokens=self.max_tokens
                ),
                timeout=self.timeout
            )
            
            refined_prompt = response.choices[0].message.content.strip()
            
            # Remove common wrapper phrases if present
            refined_prompt = self._clean_response(refined_prompt)
            
            return refined_prompt
            
        except asyncio.TimeoutError:
            raise Exception(f"Prompt refinement timed out after {self.timeout}s")
        except Exception as e:
            raise Exception(f"Error refining prompt: {str(e)}")
    
    def _format_conversation(self, history: List[Dict[str, str]]) -> str:
        """Format conversation history for context."""
        if not history:
            return "(No prior conversation)"
        
        formatted = []
        for msg in history[-10:]:  # Last 10 messages for context
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')
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
    
    def _clean_response(self, text: str) -> str:
        """Remove common wrapper phrases from LLM response."""
        # Remove common prefixes
        prefixes_to_remove = [
            "Here is the refined prompt:",
            "Here's the refined prompt:",
            "Refined prompt:",
            "Here is a refined version:",
            "Here's a refined version:",
            "REFINED PROMPT:",
        ]
        
        for prefix in prefixes_to_remove:
            if text.lower().startswith(prefix.lower()):
                text = text[len(prefix):].strip()
        
        # Remove markdown code blocks if present
        if text.startswith("```") and text.endswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1]).strip()
        
        return text
