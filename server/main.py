from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from routes.analyze import router as analyze_router
from routes.refine import router as refine_router
from routes.health import router as health_router

app = FastAPI(title="Echo - Hallucination Mitigation Tool", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router, prefix="/api/health")
app.include_router(analyze_router, prefix="/api/analyze")
app.include_router(refine_router, prefix="/api/refine")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)