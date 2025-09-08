#!/usr/bin/env python3

import asyncio
import sys
sys.path.append('.')
from server.services.llm import OpenAILLM

async def test_analysis():
    print("Testing full analysis pipeline...")
    llm = OpenAILLM()
    
    # Test with a simple prompt that should trigger some risks
    test_prompt = 'Tell me about recent developments briefly and give some examples.'
    print(f"Input: {test_prompt}")
    
    try:
        result = await llm.analyze_prompt(test_prompt)
        print('\nAnalysis result:')
        print('Overall percentage:', result.get('risk_assessment', {}).get('overall_assessment', {}).get('percentage'))
        
        print('\nCriteria percentages:')
        for criterion in result.get('risk_assessment', {}).get('criteria', []):
            name = criterion.get('name', 'Unknown')
            pct = criterion.get('percentage', 'N/A')
            risk = criterion.get('risk', 'N/A')
            print(f'  {name}: {pct}% ({risk})')
        
        risk_tokens = result.get('risk_tokens', [])
        print(f'\nRisk tokens count: {len(risk_tokens)}')
        
        if risk_tokens:
            print('Risk tokens:')
            for token in risk_tokens:
                print(f'  - "{token.get("text", "")}" ({token.get("risk_level", "")}) - {token.get("classification", "")}')
        
        return result
    except Exception as e:
        print(f'Error during analysis: {e}')
        import traceback
        traceback.print_exc()
        return None

if __name__ == '__main__':
    asyncio.run(test_analysis())
