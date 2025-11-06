from dotenv import load_dotenv
import os

# Load environment variables FIRST
load_dotenv()

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

# Try relative imports first (when running from server dir), fall back to absolute
try:
    from routes import health, analyze, refine, prepare
except ImportError:
    from server.routes import health, analyze, refine, prepare

# Create FastAPI app
app = FastAPI(
    title="Echo Hallucination Detection API",
    description="AI-powered prompt analysis for hallucination detection",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create main API router
api_router = APIRouter()

# Include route modules
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(analyze.router, prefix="/analyze", tags=["analyze"])
api_router.include_router(refine.router, prefix="/refine", tags=["refine"])
api_router.include_router(prepare.router, prefix="/prepare", tags=["prepare"])

# Include the main API router
app.include_router(api_router, prefix="/api")

# Debug router for development
debug_router = APIRouter()

@debug_router.get("/test")
async def debug_test():
    return {"status": "ok", "message": "Debug endpoint working"}

@debug_router.get("/env")
async def debug_env():
    return {
        "has_openai_key": bool(os.getenv("OPENAI_API_KEY")),
        "api_base": os.getenv("OPENAI_API_BASE", "default"),
    }

app.include_router(debug_router, prefix="/api/debug", tags=["debug"])

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Echo Hallucination Detection API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)