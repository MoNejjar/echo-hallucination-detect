from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict
import json
from services.llm import OpenAILLM
from services.sanitizer import PromptSanitizer

router = APIRouter()
llm = OpenAILLM()
sanitizer = PromptSanitizer()

class RefineRequest(BaseModel):
    prompt: str
    conversation_history: List[Dict[str, str]]
    user_message: str

class RefineResponse(BaseModel):
    assistant_message: str

@router.post("/", response_model=RefineResponse)
async def refine_prompt(request: RefineRequest):
    """Non-streaming refine for initial rewrite"""
    try:
        if not sanitizer.is_safe(request.prompt) or not sanitizer.is_safe(request.user_message):
            raise HTTPException(status_code=400, detail="Input contains unsafe content")

        assistant_message = await llm.chat_once(request.prompt, request.user_message)
        return RefineResponse(assistant_message=assistant_message)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refinement failed: {str(e)}")

@router.get("/stream")
async def refine_stream(prompt: str, user_message: str, history_json: str = "[]"):
    """Streaming endpoint for conversational refinement"""
    try:
        conversation_history = json.loads(history_json)
        
        if not sanitizer.is_safe(prompt) or not sanitizer.is_safe(user_message):
            raise HTTPException(status_code=400, detail="Input contains unsafe content")
        
        async def generate():
            try:
                async for chunk in llm.chat_stream(prompt, conversation_history, user_message):
                    yield f"data: {chunk}\n\n"
                yield "event: done\ndata: \n\n"
            except Exception as e:
                yield f"event: error\ndata: {str(e)}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stream failed: {str(e)}")