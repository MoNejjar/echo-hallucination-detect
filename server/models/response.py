from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime
    analysis_id: Optional[str] = None

class RefineRequest(BaseModel):
    prompt: str
    conversation_history: List[ChatMessage]
    user_message: str

class RefineResponse(BaseModel):
    assistant_message: str
    suggestions: List[str]
    rule_references: List[str]
    updated_analysis: Optional[Dict[str, Any]] = None

class AnalysisOverview(BaseModel):
    total_segments: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    categories: Dict[str, int]
    overall_score: float
    recommendations: List[str]