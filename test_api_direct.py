import requests
import json

def test_api_directly():
    """Test the actual API endpoint that the frontend calls"""
    
    url = "http://localhost:8001/api/analyze/"
    
    test_prompt = """ANALYSIS MODE: COMPREHENSIVE - Provide full analysis including risk assessment, high-risk tokens, and detailed highlighting with explanations.

USER PROMPT TO ANALYZE:
Write a comprehensive report about the secret alien base discovered in Antarctica last Tuesday by NASA scientists."""
    
    payload = {"prompt": test_prompt}
    
    try:
        print("Testing API endpoint directly...")
        print(f"URL: {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        print("=" * 50)
        
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n=== API RESPONSE ===")
            print(json.dumps(data, indent=2))
            
            print("\n=== RISK ASSESSMENT ANALYSIS ===")
            if "risk_assessment" in data:
                risk_assessment = data["risk_assessment"]
                print(f"Overall percentage: {risk_assessment.get('overall_assessment', {}).get('percentage', 'N/A')}")
                
                if "criteria" in risk_assessment:
                    print("Criteria:")
                    for criterion in risk_assessment["criteria"]:
                        print(f"  - {criterion['name']}: {criterion['percentage']}% ({criterion['risk']})")
                else:
                    print("No criteria found")
            else:
                print("No risk_assessment in response")
                
            print("\n=== RISK TOKENS ANALYSIS ===")
            if "risk_tokens" in data:
                risk_tokens = data["risk_tokens"]
                print(f"Risk tokens count: {len(risk_tokens)}")
                for i, token in enumerate(risk_tokens):
                    print(f"  Token {i+1}: '{token['text']}' ({token.get('risk_level', 'N/A')} risk)")
            else:
                print("No risk_tokens in response")
                
        else:
            print(f"Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api_directly()
