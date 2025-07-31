from fastapi import APIRouter, HTTPException
from models.response import RefineRequest, RefineResponse
from services.assistant import ConversationalAssistant
from services.sanitizer import PromptSanitizer

router = APIRouter()
assistant = ConversationalAssistant()
sanitizer = PromptSanitizer()

@router.post("/", response_model=RefineResponse)
async def refine_prompt(request: RefineRequest):
    try:
        # Sanitize inputs
        if not sanitizer.is_safe(request.prompt) or not sanitizer.is_safe(request.user_message):
            raise HTTPException(status_code=400, detail="Input contains unsafe content")
        
        # Get AI response
        response = await assistant.respond(
            prompt=request.prompt,
            conversation_history=request.conversation_history,
            user_message=request.user_message
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refinement failed: {str(e)}")