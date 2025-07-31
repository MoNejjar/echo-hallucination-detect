import json
from typing import List, Dict, Any
from models.response import ChatMessage, RefineResponse
from services.checker import HallucinationChecker

class ConversationalAssistant:
    def __init__(self):
        self.checker = HallucinationChecker()
        self.rules = self._load_rules()
        
    def _load_rules(self) -> Dict[str, str]:
        try:
            with open("data/patterns.json", "r") as f:
                data = json.load(f)
                return data.get("rules", self._default_rules())
        except FileNotFoundError:
            return self._default_rules()
    
    def _default_rules(self) -> Dict[str, str]:
        return {
            "R1.1": "Avoid ambiguous pronouns without clear antecedents",
            "R1.2": "Replace vague references with specific entities",
            "R2.1": "Use precise quantifiers instead of vague terms",
            "R2.2": "Provide specific measurements when possible",
            "R3.1": "Support claims with evidence or context",
            "R3.2": "Avoid absolute statements without justification",
            "R4.1": "Specify exact timeframes instead of relative terms",
            "R4.2": "Use concrete dates when referring to events"
        }
    
    async def respond(self, prompt: str, conversation_history: List[ChatMessage], user_message: str) -> RefineResponse:
        # Analyze the current prompt
        analysis = await self.checker.analyze_prompt(prompt)
        
        # Generate contextual response based on user message and analysis
        assistant_message = await self._generate_response(user_message, analysis, conversation_history)
        
        # Extract suggestions and rule references
        suggestions = self._extract_suggestions(analysis)
        rule_references = self._extract_rule_references(analysis)
        
        # Determine if we need to provide updated analysis
        updated_analysis = None
        if "analyze" in user_message.lower() or "check" in user_message.lower():
            updated_analysis = {
                "total_issues": len(analysis.highlighted_segments),
                "confidence": analysis.overall_confidence,
                "summary": analysis.analysis_summary
            }
        
        return RefineResponse(
            assistant_message=assistant_message,
            suggestions=suggestions,
            rule_references=rule_references,
            updated_analysis=updated_analysis
        )
    
    async def _generate_response(self, user_message: str, analysis, conversation_history: List[ChatMessage]) -> str:
        # This is a simplified response generator. In a real implementation, 
        # you would integrate with an actual LLM API (OpenAI, Anthropic, etc.)
        
        if "help" in user_message.lower() or "how" in user_message.lower():
            return self._generate_help_response(analysis)
        
        elif "why" in user_message.lower():
            return self._generate_explanation_response(analysis)
        
        elif "fix" in user_message.lower() or "improve" in user_message.lower():
            return self._generate_improvement_response(analysis)
        
        elif len(analysis.highlighted_segments) == 0:
            return "Great! Your prompt looks clean with no major hallucination risks detected. The language is precise and specific."
        
        else:
            return self._generate_critique_response(analysis)
    
    def _generate_help_response(self, analysis) -> str:
        if len(analysis.highlighted_segments) == 0:
            return "Your prompt is already well-structured! No issues detected. You can continue refining or ask me specific questions about prompt writing."
        
        high_risk_count = sum(1 for s in analysis.highlighted_segments if s.risk_level.value == "high")
        
        return f"""I found {len(analysis.highlighted_segments)} areas that could cause hallucinations. Here's how I can help:

🔍 **Analysis**: I've highlighted {high_risk_count} high-risk and {len(analysis.highlighted_segments) - high_risk_count} medium/low-risk segments.

💡 **My approach**: I'm designed to be direct and critical about potential issues. I won't just agree with changes - I'll verify they actually improve the prompt.

🎯 **Next steps**: You can:
- Ask me to explain specific highlighted sections
- Propose changes and I'll evaluate them
- Request specific improvement suggestions

What would you like to focus on first?"""
    
    def _generate_explanation_response(self, analysis) -> str:
        if not analysis.highlighted_segments:
            return "No issues to explain - your prompt is clear and specific!"
        
        # Focus on the highest confidence issue
        top_issue = max(analysis.highlighted_segments, key=lambda x: x.confidence)
        
        return f"""The highlighted text "{top_issue.text}" is flagged because: {top_issue.reason}

**Risk Level**: {top_issue.risk_level.value.upper()} ({top_issue.confidence:.0%} confidence)
**Category**: {top_issue.category.replace('_', ' ').title()}

This type of language can lead to hallucinations because the model might:
- Make assumptions about what you're referring to
- Fill in missing details with plausible but incorrect information
- Generate inconsistent responses across similar prompts

Would you like me to suggest specific improvements for this section?"""
    
    def _generate_improvement_response(self, analysis) -> str:
        if not analysis.highlighted_segments:
            return "Your prompt is already optimized! No improvements needed."
        
        # Get the most critical issues
        critical_issues = [s for s in analysis.highlighted_segments if s.risk_level.value == "high"]
        if not critical_issues:
            critical_issues = analysis.highlighted_segments[:2]  # Top 2 issues
        
        improvements = []
        for issue in critical_issues:
            improvement = self._suggest_specific_improvement(issue)
            improvements.append(f"• **\"{issue.text}\"** → {improvement}")
        
        response = "Here are specific improvements for your highest-risk segments:\n\n"
        response += "\n".join(improvements)
        response += f"\n\nThese changes should reduce hallucination risk by targeting {', '.join(set(i.category.replace('_', ' ') for i in critical_issues))}."
        
        return response
    
    def _generate_critique_response(self, analysis) -> str:
        critique = f"I've analyzed your prompt and found **{len(analysis.highlighted_segments)} potential issues** that could lead to hallucinations.\n\n"
        
        # Categorize issues
        categories = {}
        for segment in analysis.highlighted_segments:
            category = segment.category.replace('_', ' ').title()
            if category not in categories:
                categories[category] = []
            categories[category].append(segment)
        
        critique += "**Issues by category:**\n"
        for category, segments in categories.items():
            high_risk = sum(1 for s in segments if s.risk_level.value == "high")
            critique += f"• {category}: {len(segments)} instances ({high_risk} high-risk)\n"
        
        critique += f"\n**Overall Risk Score**: {analysis.overall_confidence:.1%}\n\n"
        critique += "I recommend addressing the high-risk segments first. Would you like specific suggestions or explanations for any highlighted sections?"
        
        return critique
    
    def _suggest_specific_improvement(self, issue) -> str:
        improvements = {
            "ambiguous_entities": {
                "it": "specify the exact subject",
                "this": "replace with the specific item/concept",
                "that": "name the particular thing you mean",
                "they": "identify the specific group/people"
            },
            "vague_quantifiers": {
                "many": "provide an approximate number",
                "several": "specify how many exactly",
                "some": "give a range or percentage",
                "most": "provide statistical support"
            },
            "unsupported_claims": {
                "obviously": "remove or provide evidence",
                "clearly": "explain why it's clear",
                "certainly": "qualify with sources",
                "everyone knows": "specify who or provide data"
            }
        }
        
        category_improvements = improvements.get(issue.category, {})
        text_lower = issue.text.lower()
        
        for key, improvement in category_improvements.items():
            if key in text_lower:
                return improvement
        
        # Default improvements by category
        if "ambiguous" in issue.category:
            return "replace with specific noun or entity"
        elif "vague" in issue.category:
            return "use precise numbers or measurements"
        elif "unsupported" in issue.category:
            return "add evidence or remove absolute language"
        else:
            return "make more specific and concrete"
    
    def _extract_suggestions(self, analysis) -> List[str]:
        suggestions = []
        
        if analysis.categories.get("ambiguous_entities", 0) > 0:
            suggestions.append("Replace pronouns with specific nouns")
        
        if analysis.categories.get("vague_quantifiers", 0) > 0:
            suggestions.append("Use exact numbers instead of vague terms")
        
        if analysis.categories.get("unsupported_claims", 0) > 0:
            suggestions.append("Remove absolute statements or add supporting context")
        
        return suggestions[:3]  # Limit to top 3 suggestions
    
    def _extract_rule_references(self, analysis) -> List[str]:
        rule_refs = []
        
        for category in analysis.categories.keys():
            if category == "ambiguous_entities":
                rule_refs.extend(["R1.1", "R1.2"])
            elif category == "vague_quantifiers":
                rule_refs.extend(["R2.1", "R2.2"])
            elif category == "unsupported_claims":
                rule_refs.extend(["R3.1", "R3.2"])
            elif category == "temporal_ambiguity":
                rule_refs.extend(["R4.1", "R4.2"])
        
        return list(set(rule_refs))  # Remove duplicates