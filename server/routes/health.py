from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def health_check():
    return {"status": "healthy", "service": "Echo API"}

@router.get("/status")
async def get_status():
    return {
        "status": "online",
        "version": "1.0.0",
        "services": {
            "analyzer": "operational",
            "assistant": "operational",
            "sanitizer": "operational"
        }
    }