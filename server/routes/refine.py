from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict
import json
from ..services.llm import OpenAILLM

router = APIRouter()

class RefineRequest(BaseModel):
    prompt: str
    conversation_history: List[Dict[str, str]]
    user_message: str

class RefineResponse(BaseModel):
    assistant_message: str

# Initialize LLM service
llm_service = OpenAILLM()

@router.post("/", response_model=RefineResponse)
async def refine_prompt(request: RefineRequest):
    """Refine a prompt through conversation with the user."""
    try:
        print(f"DEBUG: Refining prompt: {request.prompt[:50]}...")
        print(f"DEBUG: User message: {request.user_message}")
        print(f"DEBUG: Conversation history length: {len(request.conversation_history)}")
        
        # Check if prompt is provided
        if not request.prompt or not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        # Use LLM service for refinement with conversation
        if request.conversation_history:
            print("DEBUG: Using chat_stream with conversation history")
            # If there's conversation history, collect the streamed response
            assistant_message = ""
            async for chunk in llm_service.chat_stream(
                current_prompt=request.prompt,
                conversation_history=request.conversation_history,
                user_message=request.user_message
            ):
                assistant_message += chunk
        else:
            print("DEBUG: Using chat_once without conversation history")
            # No conversation history, use chat_once
            assistant_message = await llm_service.chat_once(
                current_prompt=request.prompt,
                user_message=request.user_message
            )
        
        print(f"DEBUG: Response length: {len(assistant_message)}")
        return RefineResponse(assistant_message=assistant_message)
        
    except Exception as e:
        print(f"Refinement error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Refinement failed: {str(e)}")

@router.get("/stream")
async def refine_stream(prompt: str, user_message: str, history_json: str = "[]"):
    """Stream refinement suggestions for a prompt."""
    try:
        print("=== REFINE STREAM CALLED ===")
        print(f"STREAM DEBUG: Prompt: {prompt[:50]}...")
        print(f"STREAM DEBUG: User message: {user_message}")
        print(f"STREAM DEBUG: History JSON: {history_json[:100]}...")
        
        conversation_history = json.loads(history_json)
        print(f"STREAM DEBUG: Parsed history length: {len(conversation_history)}")
        
        async def generate():
            try:
                print("STREAM DEBUG: Starting llm_service.chat_stream")
                # Use the llm service for streaming
                async for chunk in llm_service.chat_stream(
                    current_prompt=prompt,
                    conversation_history=conversation_history,
                    user_message=user_message
                ):
                    yield f"data: {chunk}\n\n"
                        
                yield "event: done\ndata: \n\n"
                
            except Exception as e:
                print(f"STREAM DEBUG ERROR: {str(e)}")
                yield f"event: error\ndata: {str(e)}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive", 
                "Content-Type": "text/event-stream",
                "Access-Control-Allow-Origin": "*",
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stream failed: {str(e)}")