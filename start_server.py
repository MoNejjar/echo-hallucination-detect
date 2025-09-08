#!/usr/bin/env python3
"""
Simple startup script for the echo-hallucination-detect server.
Run this from the project root directory.
"""

import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Set environment
os.environ.setdefault('PYTHONPATH', str(project_root))

if __name__ == "__main__":
    import uvicorn
    
    print("Starting Echo Hallucination Detection Server...")
    print(f"Project root: {project_root}")
    print(f"Python path: {sys.path[:3]}...")
    
    uvicorn.run(
        "server.main:app",  # Use import string for proper reload
        host="0.0.0.0",
        port=8001,
        reload=True,
        reload_dirs=[str(project_root / "server")]
    )
