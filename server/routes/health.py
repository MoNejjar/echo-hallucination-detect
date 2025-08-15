from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def health_check():
    return {
        "status": "healthy", 
        "service": "echo-hallucination-detect",
        "version": "1.0.0"
    }