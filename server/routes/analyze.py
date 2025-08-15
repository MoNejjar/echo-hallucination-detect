from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services.llm import OpenAILLM
from ..models.response import RiskAssessment

router = APIRouter()

class AnalyzeRequest(BaseModel):
    prompt: str

class AnalyzeResponse(BaseModel):
    annotated_prompt: str
    analysis_summary: str
    risk_assessment: Optional[RiskAssessment] = None

# Initialize LLM service
llm_service = OpenAILLM()

@router.post("/", response_model=AnalyzeResponse)
async def analyze_prompt(request: AnalyzeRequest):
    """Analyze a prompt for hallucination risks with detailed risk assessment."""
    try:
        print(f"Analyzing prompt: {request.prompt[:50]}...")
        
        # Check if prompt is provided
        if not request.prompt or not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        # Use LLM service for analysis
        result = await llm_service.analyze_prompt(request.prompt)
        
        # Convert risk assessment to Pydantic model if present
        risk_assessment = None
        if "risk_assessment" in result:
            risk_data = result["risk_assessment"]
            risk_assessment = RiskAssessment(**risk_data)
        
        return AnalyzeResponse(
            annotated_prompt=result["annotated_prompt"],
            analysis_summary=result["analysis_summary"],
            risk_assessment=risk_assessment
        )
        
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        
        error_msg = f"Analysis failed: {str(e)}"
        if "api key" in str(e).lower():
            error_msg = "OpenAI API key is invalid or missing"
        elif "rate limit" in str(e).lower():
            error_msg = "OpenAI API rate limit exceeded"
        elif "network" in str(e).lower():
            error_msg = "Network connection error"
            
        raise HTTPException(status_code=500, detail=error_msg)