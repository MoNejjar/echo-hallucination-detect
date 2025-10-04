from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import json
from ..services.llm import OpenAILLM

router = APIRouter()

class RefineRequest(BaseModel):
    prompt: str
    conversation_history: List[Dict[str, str]]
    user_message: str
    analysis_output: Optional[Dict[str, Any]] = None

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
        print(f"DEBUG: Analysis output provided: {request.analysis_output is not None}")
        
        # Check if prompt is provided
        if not request.prompt or not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        # Use LLM service for refinement with conversation
        if request.conversation_history:
            print("DEBUG: Using chat_stream with conversation history")
            # Use the non-streaming chat function
            assistant_message = await llm_service.chat_stream(
                current_prompt=request.prompt,
                conversation_history=request.conversation_history,
                user_message=request.user_message,
                analysis_output=request.analysis_output
            )
        else:
            print("DEBUG: Using chat_once without conversation history")
            # No conversation history, use chat_once
            assistant_message = await llm_service.chat_once(
                current_prompt=request.prompt,
                user_message=request.user_message,
                analysis_output=request.analysis_output
            )
        
        print(f"DEBUG: Response length: {len(assistant_message)}")
        return RefineResponse(assistant_message=assistant_message)
        
    except Exception as e:
        print(f"Refinement error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Refinement failed: {str(e)}")

@router.get("/stream")
async def refine_stream(prompt: str, user_message: str, history_json: str = "[]", analysis_json: str = "null"):
    """Refinement suggestions for a prompt (converted from streaming to regular response)."""
    try:
        print("=== REFINE STREAM CALLED ===")
        print(f"DEBUG: Prompt: {prompt[:50]}...")
        print(f"DEBUG: User message: {user_message}")
        print(f"DEBUG: History JSON: {history_json[:100]}...")
        print(f"DEBUG: Analysis JSON: {analysis_json[:100] if analysis_json != 'null' else 'null'}...")
        
        conversation_history = json.loads(history_json)
        print(f"DEBUG: Parsed history length: {len(conversation_history)}")
        
        # Parse analysis_json if provided
        analysis_output = None
        if analysis_json and analysis_json != "null":
            try:
                analysis_output = json.loads(analysis_json)
                print(f"DEBUG: Parsed analysis output successfully")
            except json.JSONDecodeError:
                print("DEBUG: Failed to parse analysis_json, proceeding without it")
        
        # Use the non-streaming chat function
        assistant_message = await llm_service.chat_stream(
            current_prompt=prompt,
            conversation_history=conversation_history,
            user_message=user_message,
            analysis_output=analysis_output
        )
        
        return {"assistant_message": assistant_message}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stream failed: {str(e)}")