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
    analysis_mode: Optional[str] = "both"


class Variation(BaseModel):
    id: int
    label: str
    focus: str
    prompt: str

class PrepareResponse(BaseModel):
    refined_prompt: str
    variations: List[Variation]
    success: bool
    message: Optional[str] = None
    debug_source: Optional[str] = None


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
        logger.info(f"Preparing refined prompt (current length: {len(request.current_prompt)}, mode: {request.analysis_mode})")
        
        # Validate analysis_mode
        valid_modes = ["faithfulness", "factuality", "both"]
        analysis_mode = request.analysis_mode or "both"
        if analysis_mode not in valid_modes:
            raise HTTPException(status_code=400, detail=f"Invalid analysis_mode. Must be one of: {', '.join(valid_modes)}")
        
        refine_data = await preparator.refine_prompt(
            current_prompt=request.current_prompt,
            prior_analysis=request.prior_analysis,
            conversation_history=request.conversation_history,
            user_final_edits=request.user_final_edits or "",
            analysis_mode=analysis_mode
        )
        refined_prompt = refine_data.get("refined_prompt", "")
        variations_raw = refine_data.get("variations", [])

        # Route-level safety net: if no variations returned, synthesize deterministic ones
        if not variations_raw:
            logger.warning("[PrepareRoute] No variations from preparator; synthesizing route-level fallbacks.")
            # Minimal deterministic synthesis (mirrors preparator local synthesis pattern)
            base = refined_prompt or request.current_prompt
            edits = (request.user_final_edits or "").strip()
            if edits and edits not in base:
                base = f"{base}\n\n[User Final Edits Applied]\n{edits}"
            variations_raw = [
                {"id":1,"label":"Minimal Patch","focus":"minimal fixes; preserve surface","prompt": base},
                {"id":2,"label":"Structured","focus":"stepwise structure & formatting","prompt": base + "\n\nOutput Format:\n- Summary\n- Key Points\n- Answer"},
                {"id":3,"label":"Context-Enriched","focus":"add actors/time/domain assumptions","prompt": base + "\n\nAdd: Actors, timeframe, domain, assumptions."},
                {"id":4,"label":"Precision-Constrained","focus":"add quantitative bounds & success criteria","prompt": base + "\n\nConstraints: define metrics, length, success tests."},
                {"id":5,"label":"Source-Grounded","focus":"evidence placeholders & citation markers","prompt": base + "\n\nInclude placeholders: [SOURCE: description]"}
            ]
        variations: List[Variation] = []
        for v in variations_raw[:5]:
            try:
                variations.append(Variation(
                    id=int(v.get("id", len(variations)+1)),
                    label=str(v.get("label", "Unknown")),
                    focus=str(v.get("focus", "")),
                    prompt=str(v.get("prompt", ""))
                ))
            except Exception:
                continue

        logger.info(f"Successfully refined prompt (len={len(refined_prompt)}), generated {len(variations)} variations (raw={len(variations_raw)})")

        return PrepareResponse(
            refined_prompt=refined_prompt,
            variations=variations,
            success=True,
            message="Prompt successfully refined with variations" if variations else "Refinement succeeded but variations unavailable",
            debug_source=refine_data.get("source") if variations_raw else "route_synthesis"
        )
    except Exception as e:
        logger.error(f"Error preparing prompt: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to prepare prompt: {str(e)}"
        )


@router.post("/", response_model=PrepareResponse)
async def prepare_prompt_root(request: PrepareRequest):
    """Alias endpoint to support /api/prepare/ in addition to /api/prepare/prepare."""
    return await prepare_prompt(request)
