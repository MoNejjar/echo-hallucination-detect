from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class RiskLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class HighlightSegment(BaseModel):
    start: int
    end: int
    text: str
    risk_level: RiskLevel
    confidence: float
    reason: str
    category: str

class PromptAnalysis(BaseModel):
    prompt_text: str
    highlighted_segments: List[HighlightSegment]
    overall_confidence: float
    total_flagged: int
    categories: Dict[str, int]
    analysis_summary: str

class AnalyzeRequest(BaseModel):
    prompt: str
    analysis_type: Optional[str] = "comprehensive"