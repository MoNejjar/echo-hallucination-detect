import json
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.llm import OpenAILLM

# Test prompt with temporal ambiguity
test_prompt = "Write a detailed analysis of recent market trends and briefly explain the implications."

# Mock risk tokens that the LLM would have generated
mock_risk_tokens = [
    {
        "text": "recent",
        "classification": "Ambiguity-Vagueness | rule_ids: [1]",
        "risk_level": "high",
        "reasoning": "Temporal reference 'recent' is vague without specific timeframe"
    },
    {
        "text": "briefly",
        "classification": "Ambiguity-Vagueness | rule_ids: [17]", 
        "risk_level": "medium",
        "reasoning": "Imprecise descriptor 'briefly' lacks specific length constraint"
    }
]

# Test the deterministic calculation
llm = OpenAILLM()
result = llm._calculate_deterministic_risk_scores(test_prompt, mock_risk_tokens)

print("=== DETERMINISTIC SCORES TEST ===")
print(f"Overall: {result['overall_percentage']}%")
print(f"Critical hits: {result['critical_hits']}")
print("\nCategory breakdown:")
for category, data in result["category_scores"].items():
    if data["span_count"] > 0:
        print(f"  {category}: {data['percentage']}% ({data['span_count']} spans)")

print("\n=== SHOULD NOW USE LLM DESCRIPTIONS ===")
print("The system will now keep whatever descriptions the LLM generates")
print("instead of replacing them with hardcoded templates!")
