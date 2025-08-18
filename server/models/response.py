from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class RiskCriterion(BaseModel):
    name: str
    risk: str  # "high", "medium", "low"
    percentage: int
    description: str

class OverallAssessment(BaseModel):
    percentage: int
    description: str

class RiskAssessment(BaseModel):
    criteria: List[RiskCriterion]
    overall_assessment: OverallAssessment

class RiskToken(BaseModel):
    id: str
    text: str
    reasoning: str
    classification: str
    mitigation: str
    risk_level: Optional[str] = None

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime
    analysis_id: Optional[str] = None

class RefineRequest(BaseModel):
    prompt: str
    conversation_history: List[ChatMessage]
    user_message: str
    stream: Optional[bool] = False  # If true, client should use /api/refine/stream

class RefineResponse(BaseModel):
    assistant_message: str
    suggestions: List[str] = []
    rule_references: List[str] = []
    updated_analysis: Optional[Dict[str, Any]] = None
    annotated_prompt: Optional[str] = None  # optional mirror of latest annotations

class AnalysisOverview(BaseModel):
    total_segments: int = 0
    high_risk_count: int = 0
    medium_risk_count: int = 0
    low_risk_count: int = 0
    categories: Dict[str, int] = {}
    overall_score: float = 0.0
    recommendations: List[str] = []