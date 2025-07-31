import re
from typing import List, Dict, Any

class PromptSanitizer:
    def __init__(self):
        self.injection_patterns = self._load_injection_patterns()
        self.max_length = 10000  # Maximum prompt length
        
    def _load_injection_patterns(self) -> List[str]:
        return [
            # Common prompt injection patterns
            r"ignore\s+(?:previous|all|the)\s+(?:instructions?|prompts?|rules?)",
            r"forget\s+(?:everything|all|your)\s+(?:instructions?|training|rules?)",
            r"you\s+are\s+now\s+(?:a|an)\s+\w+",
            r"pretend\s+(?:you\s+are|to\s+be)",
            r"roleplay\s+as",
            r"act\s+as\s+(?:if|though|a|an)",
            r"system\s*:\s*",
            r"\\n\\n(?:human|assistant|user)\s*:",
            r"<\s*(?:human|assistant|user|system)\s*>",
            # Script injection attempts
            r"<script[^>]*>.*?</script>",
            r"javascript\s*:",
            r"data\s*:\s*text/html",
            # Command injection
            r";\s*(?:rm|del|format|sudo|su)\s+",
            r"\$\([^)]+\)",
            r"`[^`]+`",
        ]
    
    def is_safe(self, text: str) -> bool:
        """Check if the input text is safe from injection attacks."""
        if not text or len(text.strip()) == 0:
            return False
            
        if len(text) > self.max_length:
            return False
        
        # Check against injection patterns
        for pattern in self.injection_patterns:
            if re.search(pattern, text, re.IGNORECASE | re.DOTALL):
                return False
        
        # Check for excessive repetition (potential DoS)
        if self._has_excessive_repetition(text):
            return False
        
        # Check for suspicious encoding
        if self._has_suspicious_encoding(text):
            return False
            
        return True
    
    def sanitize(self, text: str) -> str:
        """Sanitize input text by removing or escaping dangerous content."""
        if not self.is_safe(text):
            raise ValueError("Input contains unsafe content")
        
        # Basic sanitization
        sanitized = text.strip()
        
        # Remove or escape HTML-like tags
        sanitized = re.sub(r'<[^>]+>', '', sanitized)
        
        # Normalize whitespace
        sanitized = re.sub(r'\s+', ' ', sanitized)
        
        return sanitized
    
    def _has_excessive_repetition(self, text: str) -> bool:
        """Check for patterns that might cause processing issues."""
        # Check for repeated characters
        if re.search(r'(.)\1{50,}', text):
            return True
        
        # Check for repeated words
        words = text.split()
        if len(words) > 10:
            for i in range(len(words) - 5):
                word_sequence = ' '.join(words[i:i+3])
                remaining_text = ' '.join(words[i+3:])
                if remaining_text.count(word_sequence) > 5:
                    return True
        
        return False
    
    def _has_suspicious_encoding(self, text: str) -> bool:
        """Check for suspicious encoding patterns."""
        # Check for excessive unicode escapes
        unicode_escapes = re.findall(r'\\u[0-9a-fA-F]{4}', text)
        if len(unicode_escapes) > len(text) * 0.1:  # More than 10% unicode escapes
            return True
        
        # Check for hex encoding attempts
        hex_patterns = re.findall(r'%[0-9a-fA-F]{2}', text)
        if len(hex_patterns) > 10:
            return True
        
        return False
    
    def get_safety_report(self, text: str) -> Dict[str, Any]:
        """Generate a detailed safety report for the input."""
        report = {
            "is_safe": True,
            "length": len(text),
            "issues": []
        }
        
        if len(text) > self.max_length:
            report["is_safe"] = False
            report["issues"].append(f"Text too long: {len(text)} > {self.max_length}")
        
        for pattern in self.injection_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
            if matches:
                report["is_safe"] = False
                report["issues"].append(f"Injection pattern detected: {pattern}")
        
        if self._has_excessive_repetition(text):
            report["is_safe"] = False
            report["issues"].append("Excessive repetition detected")
        
        if self._has_suspicious_encoding(text):
            report["is_safe"] = False
            report["issues"].append("Suspicious encoding patterns detected")
        
        return report