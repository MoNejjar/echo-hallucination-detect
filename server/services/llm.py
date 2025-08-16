import openai
import os
import asyncio
import re
import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Optional, AsyncGenerator
from dotenv import load_dotenv

load_dotenv()

class OpenAILLM:
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        # Force the model to gpt-5-mini, ignoring environment variable
        self.model = "gpt-5-mini"
        print(f"🤖 LLM initialized with model: {self.model}")
        self.max_tokens = int(os.getenv("MAX_TOKENS", "4000"))
        self.temperature = float(os.getenv("TEMPERATURE", "0.3"))
        self.timeout = int(os.getenv("LLM_REQUEST_TIMEOUT", "60"))
        
    def _parse_risk_assessment(self, content: str) -> Dict[str, Any]:
        """Extract and parse the risk assessment XML from the response."""
        try:
            # Extract the XML block
            risk_pattern = r'<RISK_ASSESSMENT>(.*?)</RISK_ASSESSMENT>'
            match = re.search(risk_pattern, content, re.DOTALL)
            
            if not match:
                return None
                
            xml_content = f"<RISK_ASSESSMENT>{match.group(1)}</RISK_ASSESSMENT>"
            root = ET.fromstring(xml_content)
            
            # Parse criteria
            criteria = []
            criteria_elem = root.find('CRITERIA')
            if criteria_elem is not None:
                for criterion in criteria_elem.findall('CRITERION'):
                    criteria.append({
                        'name': criterion.get('name', ''),
                        'risk': criterion.get('risk', 'medium'),
                        'percentage': int(criterion.get('percentage', 50)),
                        'description': criterion.text or ''
                    })
            
            # Parse overall assessment
            overall_elem = root.find('OVERALL_ASSESSMENT')
            overall_assessment = {
                'percentage': int(overall_elem.get('percentage', 50)) if overall_elem is not None else 50,
                'description': overall_elem.text if overall_elem is not None else ''
            }
            
            return {
                'criteria': criteria,
                'overall_assessment': overall_assessment
            }
            
        except Exception as e:
            print(f"Error parsing risk assessment: {e}")
            return None
    
    def _remove_risk_assessment_from_content(self, content: str) -> str:
        """Remove the risk assessment XML block from the content for display."""
        risk_pattern = r'<RISK_ASSESSMENT>.*?</RISK_ASSESSMENT>'
        return re.sub(risk_pattern, '', content, flags=re.DOTALL).strip()
        
    def _get_hallucination_analysis_prompt(self, prompt: str) -> str:
        return f"""You are an expert AI hallucination detector. Your job is to analyze prompts and identify sections that might lead to hallucinations in LLM responses.

IMPORTANT FORMATTING RULES:
- Wrap HIGH RISK sections (very unclear, ambiguous, or likely to cause hallucinations) with <r></r> tags
- Wrap MEDIUM RISK sections (somewhat unclear or could be improved) with <y></y> tags  
- Keep all other text exactly as provided
- Do not change the original text content, only add highlighting tags

HIGH RISK indicators:
- Ambiguous pronouns without clear antecedents ("it", "this", "that", "they")
- Vague quantifiers ("many", "several", "some", "most")
- Unsupported absolute claims ("obviously", "clearly", "everyone knows")
- Temporal ambiguity ("recently", "lately", "soon")

MEDIUM RISK indicators:
- Slightly unclear references
- Could benefit from more specificity
- Minor ambiguities

ANALYZE THIS PROMPT:
{prompt}

RESPONSE FORMAT:
1. First, return the prompt with appropriate <r></r> and <y></y> tags around risky sections
2. Then provide a brief analysis summary
3. Finally, include a structured risk assessment in the following XML format by using your own judgment (this will be parsed separately):

<RISK_ASSESSMENT>
<CRITERIA>
<CRITERION name="Ambiguous References" risk="high|medium|low" percentage="0-100">Description of why this is risky</CRITERION>
<CRITERION name="Vague Quantifiers" risk="high|medium|low" percentage="0-100">Description of vague terms found</CRITERION>
<CRITERION name="Context Completeness" risk="high|medium|low" percentage="0-100">Assessment of context provided</CRITERION>
<CRITERION name="Instruction Clarity" risk="high|medium|low" percentage="0-100">How clear the instructions are</CRITERION>
</CRITERIA>
<OVERALL_ASSESSMENT percentage="65">Overall explanation of the risk level and main concerns</OVERALL_ASSESSMENT>
</RISK_ASSESSMENT>"""
    
    def _get_conversation_system_prompt(self, current_prompt: str) -> str:
        return f"""You are Echo, an AI assistant specialized in improving prompts to reduce hallucination risks. You are conversational, helpful, and focused on making prompts clearer and more specific.

CURRENT PROMPT STATE:
{current_prompt}

Your role:
- Help users improve their prompts through conversation
- Suggest specific, actionable changes
- Explain why certain phrasings might cause hallucinations
- Be conversational but professional
- Focus on clarity, specificity, and reducing ambiguity

Always reference the current prompt state when making suggestions."""

    async def analyze_prompt(self, prompt: str) -> Dict[str, Any]:
        """Analyze prompt for hallucination risks and return annotated version."""
        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": self._get_hallucination_analysis_prompt(prompt)}
                    ],
                    max_tokens=self.max_tokens,
                    temperature=0.3,  # Lower temperature for analysis consistency
                ),
                timeout=self.timeout
            )
            
            content = response.choices[0].message.content
            
            # Parse and extract risk assessment
            risk_assessment = self._parse_risk_assessment(content)
            
            # Remove risk assessment XML from content for display
            display_content = self._remove_risk_assessment_from_content(content)
            
            # Split the display content to get annotated prompt and summary
            parts = display_content.split('\n\n')
            annotated_prompt = parts[0] if parts else display_content
            summary = '\n\n'.join(parts[1:]) if len(parts) > 1 else "Analysis complete."
            
            result = {
                "annotated_prompt": annotated_prompt,
                "analysis_summary": summary
            }
            
            # Add risk assessment if parsed successfully
            if risk_assessment:
                result["risk_assessment"] = risk_assessment
            
            return result
            
        except Exception as e:
            raise Exception(f"Analysis failed: {str(e)}")
    
    async def chat_once(self, current_prompt: str, user_message: str = None) -> str:
        """Generate a conversational response for prompt improvement."""
        try:
            messages = [
                {"role": "system", "content": self._get_conversation_system_prompt(current_prompt)}
            ]
            
            if user_message:
                messages.append({"role": "user", "content": user_message})
            else:
                # Initial rewrite suggestion
                messages.append({
                    "role": "user", 
                    "content": "Please rewrite this prompt to be clearer and reduce hallucination risks. Explain what changes you made and why."
                })
            
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    max_tokens=self.max_tokens,
                    temperature=self.temperature,
                ),
                timeout=self.timeout
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Chat response failed: {str(e)}")
    
    async def chat_stream(
        self, 
        current_prompt: str, 
        conversation_history: List[Dict[str, str]], 
        user_message: str
    ) -> AsyncGenerator[str, None]:
        """Stream conversational responses for iterative prompt improvement."""
        try:
            messages = [
                {"role": "system", "content": self._get_conversation_system_prompt(current_prompt)}
            ]
            
            # Add conversation history
            for msg in conversation_history:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            # Add current user message
            messages.append({"role": "user", "content": user_message})
            
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                stream=True
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            yield f"Error: {str(e)}"