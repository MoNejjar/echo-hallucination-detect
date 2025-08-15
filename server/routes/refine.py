from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict
import json
import os
from openai import AsyncOpenAI

router = APIRouter()

class RefineRequest(BaseModel):
    prompt: str
    conversation_history: List[Dict[str, str]]
    user_message: str

class RefineResponse(BaseModel):
    assistant_message: str

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@router.post("/", response_model=RefineResponse)
async def refine_prompt(request: RefineRequest):
    try:
        system_prompt = f"""You are Echo, an AI assistant specialized in improving prompts to reduce hallucination risks.

CURRENT PROMPT: {request.prompt}

Help the user improve their prompt through conversation."""

        messages = [{"role": "system", "content": system_prompt}]
        
        for msg in request.conversation_history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        
        messages.append({"role": "user", "content": request.user_message})
        
        response = await client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            max_tokens=int(os.getenv("MAX_TOKENS", "4000")),
            temperature=float(os.getenv("TEMPERATURE", "0.7")),
        )
        
        return RefineResponse(assistant_message=response.choices[0].message.content)
        
    except Exception as e:
        print(f"Refinement error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Refinement failed: {str(e)}")

@router.get("/stream")
async def refine_stream(prompt: str, user_message: str, history_json: str = "[]"):
    try:
        conversation_history = json.loads(history_json)
        
        system_prompt = f"You are Echo, helping improve this prompt: {prompt}"
        messages = [{"role": "system", "content": system_prompt}]
        
        for msg in conversation_history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        
        messages.append({"role": "user", "content": user_message})
        
        async def generate():
            try:
                stream = await client.chat.completions.create(
                    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                    messages=messages,
                    max_tokens=int(os.getenv("MAX_TOKENS", "4000")),
                    temperature=float(os.getenv("TEMPERATURE", "0.7")),
                    stream=True
                )
                
                async for chunk in stream:
                    if chunk.choices[0].delta.content is not None:
                        yield f"data: {chunk.choices[0].delta.content}\n\n"
                        
                yield "event: done\ndata: \n\n"
                
            except Exception as e:
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