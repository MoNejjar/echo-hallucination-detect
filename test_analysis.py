import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'server'))

from server.services.llm import OpenAILLM

async def test_analysis():
    llm = OpenAILLM()
    prompt = "ANALYSIS MODE: COMPREHENSIVE - Provide full analysis including risk assessment, high-risk tokens, and detailed highlighting with explanations.\n\nUSER PROMPT TO ANALYZE:\nWrite a comprehensive report about the secret alien base discovered in Antarctica last Tuesday by NASA scientists."
    
    try:
        result = await llm.analyze_prompt(prompt)
        print("=== ANALYSIS RESULT ===")
        print(f"Type: {type(result)}")
        print(f"Keys: {result.keys() if isinstance(result, dict) else 'Not a dict'}")
        
        print("\n=== ANNOTATED PROMPT ===")
        print(result.get('annotated_prompt', 'Missing'))
        
        print("\n=== RISK TOKENS ===")
        risk_tokens = result.get('risk_tokens', [])
        print(f"Count: {len(risk_tokens)}")
        for i, token in enumerate(risk_tokens):
            print(f"Token {i+1}: {token}")
        
        print("\n=== RISK ASSESSMENT ===")
        risk_assessment = result.get('risk_assessment', {})
        print(f"Risk Assessment: {risk_assessment}")
        
        if 'criteria' in risk_assessment:
            print("\nCriteria:")
            for criterion in risk_assessment['criteria']:
                print(f"  - {criterion}")
        
        print("\n=== RAW RESULT ===")
        import json
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_analysis())
