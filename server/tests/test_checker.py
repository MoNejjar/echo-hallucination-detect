import pytest
import asyncio
from server.services.checker import HallucinationChecker
from server.models.prompt import RiskLevel

@pytest.fixture
def checker():
    return HallucinationChecker()

@pytest.mark.asyncio
async def test_analyze_clean_prompt(checker):
    prompt = "Generate a summary of Apple Inc.'s Q3 2024 financial results, focusing on iPhone sales figures."
    analysis = await checker.analyze_prompt(prompt)
    
    assert analysis.prompt_text == prompt
    assert len(analysis.highlighted_segments) == 0
    assert analysis.overall_confidence == 0.0

@pytest.mark.asyncio
async def test_analyze_risky_prompt(checker):
    prompt = "Write about the thing that happened recently. Everyone knows it was important."
    analysis = await checker.analyze_prompt(prompt)
    
    assert len(analysis.highlighted_segments) > 0
    assert analysis.overall_confidence > 0
    assert any(segment.risk_level == RiskLevel.HIGH for segment in analysis.highlighted_segments)

@pytest.mark.asyncio
async def test_ambiguous_entities_detection(checker):
    prompt = "It seems like they are working on this project."
    analysis = await checker.analyze_prompt(prompt)
    
    ambiguous_segments = [s for s in analysis.highlighted_segments if s.category == "ambiguous_entities"]
    assert len(ambiguous_segments) >= 2  # Should detect "It" and "they" and "this"

@pytest.mark.asyncio
async def test_vague_quantifiers_detection(checker):
    prompt = "Many people think several companies will show various improvements."
    analysis = await checker.analyze_prompt(prompt)
    
    vague_segments = [s for s in analysis.highlighted_segments if s.category == "vague_quantifiers"]
    assert len(vague_segments) >= 3  # Should detect "Many", "several", "various"

@pytest.mark.asyncio
async def test_unsupported_claims_detection(checker):
    prompt = "Obviously, everyone knows that this is clearly the best approach."
    analysis = await checker.analyze_prompt(prompt)
    
    claim_segments = [s for s in analysis.highlighted_segments if s.category == "unsupported_claims"]
    assert len(claim_segments) >= 2  # Should detect multiple unsupported claims

# tests/test_assistant.py
import pytest
import asyncio
from server.services.assistant import ConversationalAssistant
from server.models.response import ChatMessage
from datetime import datetime

@pytest.fixture
def assistant():
    return ConversationalAssistant()

@pytest.mark.asyncio
async def test_help_response(assistant):
    prompt = "Write about the thing that happened recently."
    conversation_history = []
    user_message = "Can you help me improve this?"
    
    response = await assistant.respond(prompt, conversation_history, user_message)
    
    assert "help" in response.assistant_message.lower() or "improve" in response.assistant_message.lower()
    assert len(response.suggestions) > 0
    assert len(response.rule_references) > 0

@pytest.mark.asyncio
async def test_explanation_response(assistant):
    prompt = "Obviously, this is the best approach."
    conversation_history = []
    user_message = "Why is this flagged?"
    
    response = await assistant.respond(prompt, conversation_history, user_message)
    
    assert "because" in response.assistant_message.lower()
    assert "risk level" in response.assistant_message.lower() or "confidence" in response.assistant_message.lower()

@pytest.mark.asyncio
async def test_clean_prompt_response(assistant):
    prompt = "Generate a technical specification for a REST API with authentication endpoints."
    conversation_history = []
    user_message = "How does this look?"
    
    response = await assistant.respond(prompt, conversation_history, user_message)
    
    assert "clean" in response.assistant_message.lower() or "good" in response.assistant_message.lower()