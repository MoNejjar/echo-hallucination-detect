"""
OpenAILLM - Lightweight facade for hallucination detection and prompt refinement.

This class delegates to specialized agents:
- AnalyzerAgent: Handles hallucination detection and prompt analysis
- ConversationAgent: Handles conversational prompt refinement

Maintains backward compatibility with existing code.
"""

import openai
import os
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from ..config import OPENAI_MODEL, TEMPERATURE
from .analyzer_agent import AnalyzerAgent
from .conversation_agent import ConversationAgent
from .initiator_agent import InitiatorAgent

load_dotenv()


class OpenAILLM:
    """Facade class that delegates to specialized agents for analysis and conversation."""
    
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.model = OPENAI_MODEL
        self.max_tokens = int(os.getenv("MAX_TOKENS", "20000"))
        self.temperature = TEMPERATURE
        self.timeout = int(os.getenv("LLM_REQUEST_TIMEOUT", "60"))
        # Initialize specialized agents
        self.analyzer = AnalyzerAgent()
        self.conversation = ConversationAgent()
        self.initiator = InitiatorAgent()
    
    async def analyze_prompt(self, prompt: str, analysis_mode: str = "both") -> Dict[str, Any]:
        """
        Analyze prompt for hallucination risks.
        
        Delegates to AnalyzerAgent for all analysis logic.
        """
        return await self.analyzer.analyze_prompt(prompt, analysis_mode)
    
    async def chat_once(
        self, 
        current_prompt: str, 
        user_message: str = None, 
        analysis_output: Optional[Dict[str, Any]] = None,
        analysis_mode: str = "both"
    ) -> str:
        """
        Generate a conversational response for prompt improvement.
        
        Delegates to ConversationAgent for all conversation logic.
        """
        return await self.conversation.chat_once(current_prompt, user_message, analysis_output, analysis_mode)
    
    async def chat_stream(
        self, 
        current_prompt: str, 
        conversation_history: List[Dict[str, str]], 
        user_message: str,
        analysis_output: Optional[Dict[str, Any]] = None,
        analysis_mode: str = "both"
    ) -> str:
        """
        Conversational responses for iterative prompt improvement.
        
        Delegates to ConversationAgent for all conversation logic.
        """
        return await self.conversation.chat_stream(current_prompt, conversation_history, user_message, analysis_output, analysis_mode)

    async def initiate(self, prompt: str, analysis_output: Optional[Dict[str, Any]] = None, analysis_mode: str = "both") -> str:
        """Single-turn initiation producing clarifying question and mitigation plan as markdown text."""
        return await self.initiator.initiate(prompt, analysis_output, analysis_mode)
