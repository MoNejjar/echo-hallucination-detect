import openai
import os
import asyncio
import re
import json
import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Optional, AsyncGenerator
from dotenv import load_dotenv
from ..config import OPENAI_MODEL

load_dotenv()

class OpenAILLM:
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.model = OPENAI_MODEL
        self.max_tokens = int(os.getenv("MAX_TOKENS", "4000"))
        self.temperature = float(os.getenv("TEMPERATURE", "0.3"))
        self.timeout = int(os.getenv("LLM_REQUEST_TIMEOUT", "60"))
        
    def _parse_risk_assessment(self, content: str) -> Dict[str, Any]:
        """Extract and parse the risk assessment XML from the response."""
        try:
            print(f"Parsing risk assessment from content length: {len(content)}")  # Debug
            
            # Extract the XML block
            risk_pattern = r'<RISK_ASSESSMENT>(.*?)</RISK_ASSESSMENT>'
            match = re.search(risk_pattern, content, re.DOTALL)
            
            if not match:
                print("No RISK_ASSESSMENT XML found in content")  # Debug
                print(f"Content sample: {content[:500]}...")  # Debug
                return None
                
            xml_content = f"<RISK_ASSESSMENT>{match.group(1)}</RISK_ASSESSMENT>"
            print(f"Found XML content: {xml_content[:200]}...")  # Debug
            
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
            
            print(f"Successfully parsed risk assessment with {len(criteria)} criteria")  # Debug
            
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
        return f"""You are an expert AI hallucination detector. Your job is to analyze prompts and identify specific tokens that might lead to hallucinations in LLM responses.

IMPORTANT: You must respond with valid JSON in the exact format specified below.

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

YOU MUST RESPOND WITH VALID JSON IN THIS EXACT FORMAT:

{{
  "annotated_prompt": "The original prompt with <RISK_1>risky token 1</RISK_1> and <RISK_2>risky token 2</RISK_2> marked",
  "analysis_summary": "Brief explanation of the risks found",
  "risk_tokens": [
    {{
      "id": "RISK_1",
      "text": "exact text of the risky token",
      "risk_level": "high",
      "reasoning": "Detailed explanation of why this token is risky",
      "classification": "Category of the risk (e.g., 'Ambiguous Reference', 'Vague Quantifier')",
      "mitigation": "Specific suggestion on how to fix this issue"
    }}
  ],
  "risk_assessment": {{
    "criteria": [
      {{
        "name": "Ambiguous References",
        "risk": "high",
        "percentage": 75,
        "description": "Description of this risk category"
      }},
      {{
        "name": "Vague Quantifiers", 
        "risk": "medium",
        "percentage": 50,
        "description": "Description of this risk category"
      }},
      {{
        "name": "Context Completeness",
        "risk": "low", 
        "percentage": 25,
        "description": "Description of this risk category"
      }},
      {{
        "name": "Instruction Clarity",
        "risk": "medium",
        "percentage": 60,
        "description": "Description of this risk category"
      }}
    ],
    "overall_assessment": {{
      "percentage": 65,
      "description": "Overall explanation of the risk level and main concerns"
    }}
  }}
}}

CRITICAL RULES:
1. Use only <RISK_1>, <RISK_2>, etc. tags in annotated_prompt
2. Each risk token must have a corresponding entry in risk_tokens array
3. risk_level must be exactly "high", "medium", or "low"
4. Respond with ONLY the JSON, no additional text
5. Ensure valid JSON syntax"""
    
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
        """Analyze prompt for hallucination risks and return structured JSON response."""
        try:
            # Extract the actual user prompt from the full context
            user_prompt = prompt
            
            print(f"Original prompt received: {prompt[:200]}...")  # Debug
            
            # If the prompt contains "USER PROMPT TO ANALYZE:", extract only that part
            if "USER PROMPT TO ANALYZE:" in prompt:
                user_prompt = prompt.split("USER PROMPT TO ANALYZE:")[-1].strip()
                print(f"Extracted user prompt: {user_prompt[:100]}...")  # Debug
            else:
                print("No 'USER PROMPT TO ANALYZE:' found, using full prompt")  # Debug
            
            # Create the analysis prompt with the clean user prompt
            analysis_prompt = self._get_hallucination_analysis_prompt(user_prompt)
            
            print(f"Analyzing clean user prompt: {user_prompt[:100]}...")  # Debug
            
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": analysis_prompt}
                    ],
                    max_completion_tokens=self.max_tokens,
                    temperature=0.3,  # Lower temperature for analysis consistency
                ),
                timeout=self.timeout
            )
            
            content = response.choices[0].message.content
            print(f"Raw LLM response: {content[:300]}...")  # Debug logging
            
            try:
                # Parse the JSON response
                parsed_response = json.loads(content)
                print(f"Successfully parsed JSON response")  # Debug
                
                # Validate required fields
                if not all(key in parsed_response for key in ["annotated_prompt", "analysis_summary", "risk_tokens", "risk_assessment"]):
                    raise ValueError("Missing required fields in JSON response")
                
                return parsed_response
                
            except json.JSONDecodeError as e:
                print(f"JSON parsing failed: {e}")
                print(f"Content that failed to parse: {content}")
                
                # Fallback to create a basic response
                return self._create_fallback_response(user_prompt, content)
            
        except Exception as e:
            print(f"Analysis failed: {str(e)}")
            raise Exception(f"Analysis failed: {str(e)}")
    
    def _create_fallback_response(self, user_prompt: str, llm_content: str) -> Dict[str, Any]:
        """Create a fallback response when JSON parsing fails."""
        print("Creating fallback response due to JSON parsing failure")
        
        return {
            "annotated_prompt": user_prompt,  # Return clean prompt without highlighting
            "analysis_summary": "Analysis completed but response format was invalid. Please try again.",
            "risk_tokens": [],
            "risk_assessment": {
                "criteria": [
                    {"name": "Ambiguous References", "risk": "medium", "percentage": 60, "description": "Some ambiguous references may be present"},
                    {"name": "Vague Quantifiers", "risk": "medium", "percentage": 50, "description": "Vague terms may be present"},
                    {"name": "Context Completeness", "risk": "low", "percentage": 30, "description": "Context appears adequate"},
                    {"name": "Instruction Clarity", "risk": "medium", "percentage": 55, "description": "Instructions could be more precise"}
                ],
                "overall_assessment": {
                    "percentage": 50,
                    "description": "Moderate risk level - analysis format error occurred"
                }
            }
        }
    
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
                    max_completion_tokens=self.max_tokens,
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
                max_completion_tokens=self.max_tokens,
                temperature=self.temperature,
                stream=True
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            yield f"Error: {str(e)}"