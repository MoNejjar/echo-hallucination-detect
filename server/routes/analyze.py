from fastapi import APIRouter, HTTPException
from models.prompt import AnalyzeRequest, PromptAnalysis
from models.response import AnalysisOverview
from services.checker import HallucinationChecker
from services.sanitizer import PromptSanitizer

router = APIRouter()
checker = HallucinationChecker()
sanitizer = PromptSanitizer()

@router.post("/", response_model=PromptAnalysis)
async def analyze_prompt(request: AnalyzeRequest):
    try:
        # Sanitize input
        if not sanitizer.is_safe(request.prompt):
            raise HTTPException(status_code=400, detail="Prompt contains unsafe content")
        
        # Perform analysis
        analysis = await checker.analyze_prompt(request.prompt)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/overview", response_model=AnalysisOverview)
async def get_analysis_overview(request: AnalyzeRequest):
    try:
        if not sanitizer.is_safe(request.prompt):
            raise HTTPException(status_code=400, detail="Prompt contains unsafe content")
        
        overview = await checker.get_analysis_overview(request.prompt)
        return overview
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Overview generation failed: {str(e)}")