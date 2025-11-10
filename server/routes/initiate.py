from fastapi import APIRouter, HTTPException
import logging
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from ..services.llm import OpenAILLM

router = APIRouter()
llm_service = OpenAILLM()


class InitiateRequest(BaseModel):
    prompt: str
    analysis_output: Optional[Dict[str, Any]] = None
    analysis_mode: Optional[str] = "both"


class InitiateResponse(BaseModel):
    clarifying_question: Optional[str]
    mitigation_plan: Dict[str, Any]
    variations: Optional[List[Dict[str, Any]]] = None
    success: bool


@router.post("/", response_model=InitiateResponse)
async def initiate_prompt(request: InitiateRequest):
    """Initiate refinement: single clarifying question + mitigation plan + 5 prompt variations."""
    try:
        if not request.prompt or not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt is required")
        valid_modes = ["faithfulness", "factuality", "both"]
        if request.analysis_mode not in valid_modes:
            raise HTTPException(status_code=400, detail=f"Invalid analysis_mode. Must be one of: {', '.join(valid_modes)}")

        # Debug: log a compact view of incoming sizes
        risk_tokens = (request.analysis_output or {}).get("risk_tokens") or []
        logging.getLogger("uvicorn.error").info(
            "[initiate] prompt_len=%s risk_tokens=%s mode=%s",
            len(request.prompt),
            len(risk_tokens),
            request.analysis_mode,
        )

        result = await llm_service.initiate(
            prompt=request.prompt,
            analysis_output=request.analysis_output,
            analysis_mode=request.analysis_mode
        )

        return InitiateResponse(
            clarifying_question=result.get("clarifying_question"),
            mitigation_plan=result.get("mitigation_plan", {}),
            variations=result.get("variations", []),
            success=True
        )
    except Exception as e:
        logging.getLogger("uvicorn.error").exception("[initiate] Initiation failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Initiation failed: {e}")
