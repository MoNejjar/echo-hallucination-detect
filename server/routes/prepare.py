"""
Prepare Route - Refine prompts for re-analysis
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging

from ..services.preparator import AnalysisPreparator

logger = logging.getLogger(__name__)

router = APIRouter()
preparator = AnalysisPreparator()


class PrepareRequest(BaseModel):
    current_prompt: str
    prior_analysis: Dict[str, Any]
    conversation_history: List[Dict[str, str]]
    user_final_edits: Optional[str] = ""


class PrepareResponse(BaseModel):
    refined_prompt: str
    success: bool
    message: Optional[str] = None


@router.post("/prepare", response_model=PrepareResponse)
async def prepare_prompt(request: PrepareRequest):
    """
    Refine a prompt based on prior analysis and conversation history.
    
    This endpoint is used before re-analysis to:
    1. Incorporate insights from previous analysis
    2. Apply mitigation strategies from conversation
    3. Integrate user's final manual edits
    """
    try:
        logger.info(f"Preparing refined prompt (current length: {len(request.current_prompt)})")
        
        refined_prompt = await preparator.refine_prompt(
            current_prompt=request.current_prompt,
            prior_analysis=request.prior_analysis,
            conversation_history=request.conversation_history,
            user_final_edits=request.user_final_edits or ""
        )
        
        logger.info(f"Successfully refined prompt (new length: {len(refined_prompt)})")
        
        return PrepareResponse(
            refined_prompt=refined_prompt,
            success=True,
            message="Prompt successfully refined"
        )
        
    except Exception as e:
        logger.error(f"Error preparing prompt: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to prepare prompt: {str(e)}"
        )
