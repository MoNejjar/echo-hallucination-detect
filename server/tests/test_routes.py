import pytest
from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_analyze_endpoint():
    response = client.post(
        "/api/analyze/",
        json={"prompt": "Write about the thing that happened recently."}
    )
    assert response.status_code == 200
    data = response.json()
    assert "promptText" in data
    assert "highlightedSegments" in data
    assert "overallConfidence" in data

def test_analyze_empty_prompt():
    response = client.post(
        "/api/analyze/",
        json={"prompt": ""}
    )
    assert response.status_code == 422 or response.status_code == 400

def test_refine_endpoint():
    response = client.post(
        "/api/refine/",
        json={
            "prompt": "Write about the thing that happened recently.",
            "conversationHistory": [],
            "userMessage": "How can I improve this?"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "assistantMessage" in data
    assert "suggestions" in data

def test_analyze_overview():
    response = client.post(
        "/api/analyze/overview",
        json={"prompt": "Obviously, many people think this is clearly important."}
    )
    assert response.status_code == 200
    data = response.json()
    assert "totalSegments" in data
    assert "overallScore" in data
    assert "recommendations" in data