import json
import re
from typing import List, Dict, Any
from models.prompt import PromptAnalysis, HighlightSegment, RiskLevel
from models.response import AnalysisOverview

class HallucinationChecker:
    def __init__(self):
        self.patterns = self._load_patterns()
        
    def _load_patterns(self) -> Dict[str, Any]:
        try:
            with open("data/patterns.json", "r") as f:
                return json.load(f)
        except FileNotFoundError:
            return self._default_patterns()
    
    def _default_patterns(self) -> Dict[str, Any]:
        return {
            "ambiguous_entities": [
                r"\b(it|this|that|they|them)\b(?!\s+(?:is|are|was|were|will|should|can|could))",
                r"\bthe\s+(?:thing|item|person|place|concept)\b",
                r"\bsuch\s+(?:things?|items?|people?)\b"
            ],
            "vague_quantifiers": [
                r"\b(?:many|several|some|few|most|various|numerous)\b(?!\s+specific)",
                r"\ba\s+(?:lot|bunch|number)\s+of\b",
                r"\bmore\s+or\s+less\b"
            ],
            "unsupported_claims": [
                r"\b(?:obviously|clearly|certainly|definitely|absolutely)\b",
                r"\beveryone\s+(?:knows|agrees|thinks)\b",
                r"\bit\s+is\s+(?:well-known|common\s+knowledge)\b"
            ],
            "temporal_ambiguity": [
                r"\b(?:recently|lately|soon|eventually|sometime)\b",
                r"\bin\s+the\s+(?:past|future|near\s+future)\b",
                r"\ba\s+(?:while|long\s+time)\s+ago\b"
            ]
        }
    
    async def analyze_prompt(self, prompt: str) -> PromptAnalysis:
        segments = []
        categories = {}
        
        for category, pattern_list in self.patterns.items():
            category_count = 0
            for pattern in pattern_list:
                matches = re.finditer(pattern, prompt, re.IGNORECASE)
                for match in matches:
                    segment = HighlightSegment(
                        start=match.start(),
                        end=match.end(),
                        text=match.group(),
                        risk_level=self._determine_risk_level(category, match.group()),
                        confidence=self._calculate_confidence(category, match.group()),
                        reason=self._get_reason(category),
                        category=category
                    )
                    segments.append(segment)
                    category_count += 1
            
            if category_count > 0:
                categories[category] = category_count
        
        # Sort segments by position
        segments.sort(key=lambda x: x.start)
        
        # Calculate overall confidence
        overall_confidence = self._calculate_overall_confidence(segments)
        
        # Generate analysis summary
        analysis_summary = self._generate_summary(segments, categories)
        
        return PromptAnalysis(
            prompt_text=prompt,
            highlighted_segments=segments,
            overall_confidence=overall_confidence,
            total_flagged=len(segments),
            categories=categories,
            analysis_summary=analysis_summary
        )
    
    async def get_analysis_overview(self, prompt: str) -> AnalysisOverview:
        analysis = await self.analyze_prompt(prompt)
        
        risk_counts = {"high": 0, "medium": 0, "low": 0}
        for segment in analysis.highlighted_segments:
            risk_counts[segment.risk_level.value] += 1
        
        recommendations = self._generate_recommendations(analysis)
        
        return AnalysisOverview(
            total_segments=len(analysis.highlighted_segments),
            high_risk_count=risk_counts["high"],
            medium_risk_count=risk_counts["medium"],
            low_risk_count=risk_counts["low"],
            categories=analysis.categories,
            overall_score=analysis.overall_confidence,
            recommendations=recommendations
        )
    
    def _determine_risk_level(self, category: str, text: str) -> RiskLevel:
        high_risk_categories = ["unsupported_claims", "ambiguous_entities"]
        if category in high_risk_categories:
            return RiskLevel.HIGH
        elif len(text) > 15:  # Longer matches are typically more problematic
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW
    
    def _calculate_confidence(self, category: str, text: str) -> float:
        base_confidence = {
            "ambiguous_entities": 0.85,
            "vague_quantifiers": 0.70,
            "unsupported_claims": 0.90,
            "temporal_ambiguity": 0.75
        }
        
        confidence = base_confidence.get(category, 0.60)
        
        # Adjust based on text length and context
        if len(text) > 20:
            confidence += 0.05
        if text.lower() in ["it", "this", "that"]:
            confidence += 0.10
            
        return min(confidence, 0.99)
    
    def _calculate_overall_confidence(self, segments: List[HighlightSegment]) -> float:
        if not segments:
            return 0.0
        
        total_confidence = sum(seg.confidence for seg in segments)
        return min(total_confidence / len(segments), 1.0)
    
    def _get_reason(self, category: str) -> str:
        reasons = {
            "ambiguous_entities": "Ambiguous reference - unclear what this refers to",
            "vague_quantifiers": "Vague quantifier - lacks specific measurement",
            "unsupported_claims": "Unsupported claim - requires evidence or qualification",
            "temporal_ambiguity": "Temporal ambiguity - time reference is unclear"
        }
        return reasons.get(category, "Potential hallucination risk detected")
    
    def _generate_summary(self, segments: List[HighlightSegment], categories: Dict[str, int]) -> str:
        if not segments:
            return "No hallucination risks detected in this prompt."
        
        high_risk = sum(1 for s in segments if s.risk_level == RiskLevel.HIGH)
        medium_risk = sum(1 for s in segments if s.risk_level == RiskLevel.MEDIUM)
        
        summary = f"Found {len(segments)} potential issues: {high_risk} high-risk, {medium_risk} medium-risk. "
        
        if categories:
            top_category = max(categories.items(), key=lambda x: x[1])
            summary += f"Primary concern: {top_category[0].replace('_', ' ')} ({top_category[1]} instances)."
        
        return summary
    
    def _generate_recommendations(self, analysis: PromptAnalysis) -> List[str]:
        recommendations = []
        
        if analysis.categories.get("ambiguous_entities", 0) > 0:
            recommendations.append("Replace ambiguous pronouns with specific nouns")
        
        if analysis.categories.get("vague_quantifiers", 0) > 0:
            recommendations.append("Use specific numbers instead of vague quantifiers")
        
        if analysis.categories.get("unsupported_claims", 0) > 0:
            recommendations.append("Remove absolute statements or provide supporting context")
        
        if analysis.categories.get("temporal_ambiguity", 0) > 0:
            recommendations.append("Specify exact dates or time periods")
        
        if not recommendations:
            recommendations.append("Prompt looks good! No major issues detected.")
        
        return recommendations