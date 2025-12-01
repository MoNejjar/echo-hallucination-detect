<div align="center">

# Contributing to Echo

### Guidelines for Extending a Research Platform for Hallucination Mitigation

*Mohamed Nejjar — Bachelor Thesis: "Mitigating Hallucination Potential in User Prompts Through AI-Guided Iterative Refinement"*

</div>

---

## Abstract

This document provides comprehensive guidelines for contributing to Echo, a research-oriented platform implementing shift-left hallucination mitigation through multi-agent iterative refinement. Contributors are expected to maintain both the **academic rigor** of the underlying theoretical framework and the **engineering quality** of the implementation.

Echo is not merely a software project—it is an experimental validation of a novel taxonomy for user-sided hallucination risks. Contributions should respect this dual nature.

---

## Table of Contents

1. [Research Context](#1-research-context)
2. [Development Environment](#2-development-environment)
3. [System Architecture Overview](#3-system-architecture-overview)
4. [Coding Standards](#4-coding-standards)
5. [Contribution Workflow](#5-contribution-workflow)
6. [Testing Protocol](#6-testing-protocol)
7. [Documentation Requirements](#7-documentation-requirements)
8. [Deployment Guidelines](#8-deployment-guidelines)
9. [Common Issues](#9-common-issues)
10. [Community Standards](#10-community-standards)

---

## 1. Research Context

### 1.1 Theoretical Foundation

Echo implements concepts from the thesis:

> **"Mitigating Hallucination Potential in User Prompts Through AI-Guided Iterative Refinement"**

Contributors should familiarize themselves with:

| Concept | Description | Documentation |
|---------|-------------|---------------|
| **User-Sided Taxonomy** | Novel classification of hallucination risks originating from prompt characteristics | `hallucination_documentation.md` |
| **Prompt vs Meta Risk Dichotomy** | Token-addressable vs structural risk categorization | `architecture.md` §2 |
| **Prompt Risk Density (PRD)** | Quantitative metric for hallucination potential | `architecture.md` §3 |
| **12-Pillar Framework** | Comprehensive guideline system (Pillars A–L) | `hallucination_documentation.md` |

### 1.2 Contribution Philosophy

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   CONTRIBUTION EVALUATION CRITERIA                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   DOES THIS CONTRIBUTION:                                                │
│                                                                          │
│   ✓ Maintain theoretical consistency with the taxonomy?                  │
│   ✓ Improve PRD accuracy or coverage?                                    │
│   ✓ Enhance user experience without sacrificing rigor?                   │
│   ✓ Include appropriate documentation updates?                           │
│   ✓ Follow established architectural patterns?                           │
│                                                                          │
│   CONTRIBUTIONS SHOULD NOT:                                              │
│                                                                          │
│   ✗ Conflate user-sided and LLM-sided hallucination                      │
│   ✗ Bypass the structured analysis pipeline                              │
│   ✗ Hard-code hallucination rules (use XML guidelines)                   │
│   ✗ Remove existing guideline coverage                                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Development Environment

### 2.1 Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18.x | Frontend runtime |
| Python | ≥ 3.11 | Backend runtime |
| Git | ≥ 2.30 | Version control |
| OpenAI API Key | — | LLM integration |

### 2.2 Repository Setup

```powershell
# Clone the repository
git clone https://github.com/YOUR_USERNAME/echo-hallucination-detect.git
cd echo-hallucination-detect

# Backend setup
cd server
python -m venv venv
.\venv\Scripts\Activate  # Windows
pip install -r requirements.txt

# Frontend setup
cd ../client
npm install
```

### 2.3 Environment Configuration

Create `.env` in the project root:

```env
# Required
OPENAI_API_KEY=sk-...your-key...

# Optional (defaults shown)
OPENAI_MODEL=gpt-4
OPENAI_API_BASE=https://api.openai.com/v1
```

### 2.4 Starting Development Servers

**Backend** (port 8001):
```powershell
cd server
python -m server.main
```

**Frontend** (port 5174):
```powershell
cd client
npm run dev
```

---

## 3. System Architecture Overview

### 3.1 High-Level Topology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ECHO ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   FRONTEND (React/TypeScript)                                           │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  App.tsx                                                        │  │
│   │  ├── InitiationPanel      ← Entry point, mode selection         │  │
│   │  ├── AnalysisSection      ← PRD display, highlighting           │  │
│   │  └── ChatPanel            ← Conversational refinement           │  │
│   │                                                                 │  │
│   │  lib/api.ts               ← HTTP client for backend             │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                              │ HTTP/JSON                                │
│                              ▼                                          │
│   BACKEND (FastAPI/Python)                                              │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  routes/                                                        │  │
│   │  ├── analyze.py           ← /api/analyze endpoint               │  │
│   │  ├── initiate.py          ← /api/initiate endpoint              │  │
│   │  ├── refine.py            ← /api/refine endpoint                │  │
│   │  └── prepare.py           ← /api/prepare endpoint               │  │
│   │                                                                 │  │
│   │  services/                                                      │  │
│   │  ├── analyzer_agent.py    ← Risk detection, PRD calculation     │  │
│   │  ├── initiator_agent.py   ← Question generation                 │  │
│   │  ├── conversation_agent.py← Critical dialogue management        │  │
│   │  ├── preparator.py        ← Prompt synthesis                    │  │
│   │  └── llm.py               ← OpenAI API abstraction              │  │
│   │                                                                 │  │
│   │  data/                                                          │  │
│   │  ├── both.xml             ← Combined guidelines                 │  │
│   │  ├── faithfulness.xml     ← Faithfulness-focused rules          │  │
│   │  └── factuality.xml       ← Factuality-focused rules            │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Agent Responsibilities

| Agent | Service File | Primary Function | Key Outputs |
|-------|--------------|------------------|-------------|
| **Analyzer** | `analyzer_agent.py` | Risk scanning, PRD computation | Violations, highlights, PRD values |
| **Initiator** | `initiator_agent.py` | Entry-point question generation | One question per broken rule |
| **Conversational** | `conversation_agent.py` | Critical dialogue, non-yes-man | Refinement suggestions |
| **Preparator** | `preparator.py` | Prompt synthesis for re-analysis | Refined prompt preview |

---

## 4. Coding Standards

### 4.1 TypeScript/React (Frontend)

**Component Structure:**
```typescript
// Naming: PascalCase for components
// Props interface always defined
interface AnalysisPanelProps {
  promptPRD: number;
  metaPRD: number;
  violations: Violation[];
  onReanalyze: () => void;
}

// Functional components with explicit return type
export function AnalysisPanel({ 
  promptPRD, 
  metaPRD, 
  violations,
  onReanalyze 
}: AnalysisPanelProps): JSX.Element {
  // Hooks at top
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Derived state with useMemo for expensive computations
  const sortedViolations = useMemo(
    () => [...violations].sort((a, b) => b.severity - a.severity),
    [violations]
  );
  
  // Event handlers with useCallback if passed to children
  const handleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  return (
    <div className="p-4 rounded-lg border">
      {/* Tailwind classes for styling */}
      <h2 className="text-lg font-semibold">Analysis Results</h2>
      {/* Component content */}
    </div>
  );
}
```

**Type Definitions:**
```typescript
// types.ts - Centralized type definitions
export interface Violation {
  id: string;
  pillar: string;           // A, B, C, ... L
  rule: string;             // A1, B2, etc.
  severity: "medium" | "high" | "critical";
  span: string;             // Highlighted text
  spanStart: number;        // Character offset
  spanEnd: number;
  explanation: string;
  mitigation: string;
  isPromptLevel: boolean;   // true = prompt-level, false = meta-level
}

export interface AnalysisResult {
  promptPRD: number;
  metaPRD: number;
  violations: Violation[];
  highlightedPrompt: string;
}
```

### 4.2 Python (Backend)

**Service Pattern:**
```python
# services/analyzer_agent.py

from typing import Optional
from pydantic import BaseModel, Field
from services.llm import LLMClient

class AnalysisRequest(BaseModel):
    """Input model for prompt analysis."""
    prompt: str = Field(..., min_length=1, description="User prompt to analyze")
    mode: str = Field(default="both", pattern="^(both|faithfulness|factuality)$")

class Violation(BaseModel):
    """Single hallucination risk detection."""
    pillar: str
    rule: str
    severity: str
    span: str
    span_start: int
    span_end: int
    explanation: str
    mitigation: str
    is_prompt_level: bool

class AnalysisResult(BaseModel):
    """Complete analysis output."""
    prompt_prd: float = Field(..., ge=0, le=1)
    meta_prd: float = Field(..., ge=0, le=1)
    violations: list[Violation]

class AnalyzerAgent:
    """
    Analyzer Agent: Scans prompts for hallucination risk indicators.
    
    Implements PRD calculation:
        PRD = Σ(span_i × severity_weight_i) / prompt_length
        
    Where severity_weight:
        - medium = 1
        - high = 2  
        - critical = 3
    """
    
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client
        self._severity_weights = {"medium": 1, "high": 2, "critical": 3}
    
    async def analyze(self, request: AnalysisRequest) -> AnalysisResult:
        """
        Perform hallucination risk analysis on the given prompt.
        
        Args:
            request: Analysis request containing prompt and mode
            
        Returns:
            AnalysisResult with PRD scores and violation list
        """
        guidelines = self._load_guidelines(request.mode)
        raw_response = await self.llm_client.complete(
            system_prompt=self._build_system_prompt(guidelines),
            user_message=request.prompt
        )
        violations = self._parse_violations(raw_response)
        prompt_prd, meta_prd = self._compute_prd(violations, len(request.prompt))
        
        return AnalysisResult(
            prompt_prd=prompt_prd,
            meta_prd=meta_prd,
            violations=violations
        )
    
    def _compute_prd(
        self, 
        violations: list[Violation], 
        prompt_length: int
    ) -> tuple[float, float]:
        """
        Compute Prompt Risk Density for prompt-level and meta-level risks.
        """
        prompt_sum = sum(
            len(v.span) * self._severity_weights[v.severity]
            for v in violations if v.is_prompt_level
        )
        meta_sum = sum(
            len(v.span) * self._severity_weights[v.severity]
            for v in violations if not v.is_prompt_level
        )
        
        return (
            min(prompt_sum / prompt_length, 1.0) if prompt_length > 0 else 0.0,
            min(meta_sum / prompt_length, 1.0) if prompt_length > 0 else 0.0
        )
```

**Route Pattern:**
```python
# routes/analyze.py

from fastapi import APIRouter, HTTPException, Depends
from models.request import AnalyzeRequest
from models.response import AnalyzeResponse
from services.analyzer_agent import AnalyzerAgent
from dependencies import get_analyzer_agent

router = APIRouter(prefix="/api", tags=["analysis"])

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_prompt(
    request: AnalyzeRequest,
    analyzer: AnalyzerAgent = Depends(get_analyzer_agent)
) -> AnalyzeResponse:
    """
    Analyze a user prompt for hallucination risk.
    
    Returns PRD scores and detailed violation information.
    """
    try:
        result = await analyzer.analyze(request)
        return AnalyzeResponse(
            prompt_prd=result.prompt_prd,
            meta_prd=result.meta_prd,
            violations=result.violations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 4.3 XML Guidelines Format

When adding or modifying hallucination guidelines:

```xml
<!-- data/both.xml -->
<guidelines>
  <pillar id="A" name="Referential Clarity" type="prompt">
    <description>
      Rules addressing ambiguous, unclear, or missing referents 
      that may cause LLM to fabricate context.
    </description>
    <rule id="A1" severity="critical">
      <name>Ambiguous Pronouns</name>
      <description>
        Pronouns without clear antecedents force LLM to assume context.
      </description>
      <examples>
        <bad>Summarize this and compare it to that.</bad>
        <good>Summarize the Q3 report and compare it to the Q2 report.</good>
      </examples>
      <detection_prompt>
        Identify pronouns (this, that, it, they) lacking explicit referents.
      </detection_prompt>
    </rule>
    <!-- Additional rules -->
  </pillar>
</guidelines>
```

---

## 5. Contribution Workflow

### 5.1 Branch Naming Convention

```
<type>/<scope>-<description>

Types:
  feat     → New feature
  fix      → Bug fix
  docs     → Documentation only
  refactor → Code restructuring
  test     → Adding tests
  perf     → Performance improvement

Examples:
  feat/analyzer-pillar-m-support
  fix/prd-calculation-overflow
  docs/taxonomy-clarification
  refactor/conversation-agent-async
```

### 5.2 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example:**
```
feat(analyzer): add support for Pillar M meta-level rules

Implements detection for structural prompt issues that cannot
be localized to specific tokens, including:
- Missing domain context (M1)
- Contradictory constraints (M2)
- Implicit assumptions (M3)

Closes #42
```

### 5.3 Pull Request Template

```markdown
## Summary
Brief description of changes.

## Theoretical Impact
- [ ] Adds new pillar/rules
- [ ] Modifies PRD calculation
- [ ] Changes taxonomy classification
- [ ] No theoretical impact (implementation only)

## Changes
- List of specific changes

## Testing
- [ ] Backend tests pass
- [ ] Frontend builds successfully
- [ ] Manual testing completed
- [ ] Documentation updated

## Screenshots (if UI changes)
<!-- Attach before/after screenshots -->

## Related Issues
Fixes #...
```

---

## 6. Testing Protocol

### 6.1 Backend Testing

```powershell
cd server

# Unit tests
python -m pytest tests/ -v

# Coverage report
python -m pytest tests/ --cov=services --cov-report=html

# Type checking
mypy services/ --strict

# Linting
flake8 services/ routes/ --max-line-length=100
```

### 6.2 Frontend Testing

```powershell
cd client

# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

### 6.3 Integration Testing Checklist

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      INTEGRATION TEST MATRIX                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ANALYSIS PIPELINE:                                                      │
│  □ Empty prompt → graceful error                                         │
│  □ Short prompt (<10 chars) → valid analysis                             │
│  □ Long prompt (>5000 chars) → handling/warning                          │
│  □ Unicode/emoji → correct span offsets                                  │
│  □ All modes (faithfulness/factuality/both) → correct guidelines loaded  │
│                                                                          │
│  PRD CALCULATION:                                                        │
│  □ Zero violations → PRD = 0                                             │
│  □ All severities present → correct weighting                            │
│  □ Overlapping spans → no double-counting                                │
│  □ Prompt-level vs meta-level → correct separation                       │
│                                                                          │
│  CONVERSATION FLOW:                                                      │
│  □ Initiate generates one question per broken rule                       │
│  □ Conversation agent challenges vague responses                         │
│  □ Preparator synthesizes (not copies) conversation                      │
│  □ Re-analysis shows metric improvement                                  │
│                                                                          │
│  UI/UX:                                                                  │
│  □ Highlighting colors match severity                                    │
│  □ Dark mode maintains readability                                       │
│  □ Export includes all selected artifacts                                │
│  □ Error states display user-friendly messages                           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Documentation Requirements

### 7.1 Code Documentation Standards

**Python:**
```python
def compute_prd(violations: list[Violation], prompt_length: int) -> float:
    """
    Compute Prompt Risk Density using weighted span summation.
    
    The PRD formula is:
        PRD = Σ(span_i × weight_i) / prompt_length
    
    Where weight mapping:
        - medium → 1
        - high → 2
        - critical → 3
    
    Args:
        violations: List of detected violations with severity and span.
        prompt_length: Total character count of original prompt.
    
    Returns:
        Float in range [0, 1] representing risk density.
    
    Example:
        >>> violations = [Violation(severity="high", span="this data")]
        >>> compute_prd(violations, 100)
        0.18  # (9 chars × 2 weight) / 100
    """
```

**TypeScript:**
```typescript
/**
 * Computes the severity weight for PRD calculation.
 * 
 * @param severity - The violation severity level
 * @returns Numeric weight: medium=1, high=2, critical=3
 * @throws Error if severity is not recognized
 * 
 * @example
 * getSeverityWeight("high") // returns 2
 */
function getSeverityWeight(severity: ViolationSeverity): number {
  // implementation
}
```

### 7.2 Architecture Documentation

When modifying system architecture:

1. Update `docs/architecture.md` with changes
2. Modify relevant `.mmd` diagrams in `docs/diagrams/`
3. Ensure theoretical consistency is maintained
4. Add migration notes if breaking changes

---

## 8. Deployment Guidelines

### 8.1 Production Checklist

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    PRE-DEPLOYMENT CHECKLIST                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ENVIRONMENT:                                                            │
│  □ OPENAI_API_KEY is production key (not development)                    │
│  □ CORS origins restricted to production domains                         │
│  □ Debug mode disabled                                                   │
│  □ Rate limiting configured                                              │
│                                                                          │
│  BUILD:                                                                  │
│  □ Frontend: npm run build succeeds                                      │
│  □ Backend: All tests pass                                               │
│  □ No console.log/print statements in production code                    │
│  □ Sensitive data not logged                                             │
│                                                                          │
│  MONITORING:                                                             │
│  □ Health endpoint (/api/health) accessible                              │
│  □ Error tracking configured                                             │
│  □ API usage monitoring in place                                         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Docker Deployment

```dockerfile
# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY server/ .
EXPOSE 8001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: 
      context: .
      dockerfile: server/Dockerfile
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    ports:
      - "8001:8001"
  
  frontend:
    build:
      context: .
      dockerfile: client/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
```

---

## 9. Common Issues

### 9.1 Development Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| CORS errors | Backend not running | Start backend on port 8001 |
| API key invalid | Wrong key format | Verify key starts with `sk-` |
| Import errors | Wrong working directory | Run from `server/` directory |
| TypeScript errors | Missing types | Run `npm install` in client |
| PRD always 0 | No violations detected | Check guideline XML loading |

### 9.2 Debugging Tips

```python
# Backend: Enable verbose logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Check LLM response
logger.debug(f"Raw LLM response: {response}")
```

```typescript
// Frontend: Debug state changes
useEffect(() => {
  console.log("Analysis result updated:", analysisResult);
}, [analysisResult]);
```

---

## 10. Community Standards

### 10.1 Code of Conduct

As an academic research project, Echo maintains high standards of:

- **Intellectual honesty**: Proper attribution of ideas and code
- **Constructive discourse**: Critique ideas, not people
- **Inclusivity**: Welcome contributors of all backgrounds
- **Transparency**: Open discussion of design decisions

### 10.2 Getting Help

| Channel | Use For |
|---------|---------|
| GitHub Issues | Bug reports, feature requests |
| GitHub Discussions | Questions, design proposals |
| Pull Request Comments | Code-specific feedback |

### 10.3 Recognition

Contributors are acknowledged in:

- Release notes for significant contributions
- GitHub contributors section
- Thesis acknowledgments (for substantial contributions)

---

## Appendix: Quick Reference

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analyze` | POST | Analyze prompt, return PRD |
| `/api/initiate` | POST | Generate starter questions |
| `/api/refine` | POST | Process conversation turn |
| `/api/prepare` | POST | Synthesize refined prompt |
| `/api/health` | GET | Health check |

### Key Files

| File | Purpose |
|------|---------|
| `services/analyzer_agent.py` | Core analysis logic |
| `services/llm.py` | OpenAI API wrapper |
| `data/*.xml` | Hallucination guidelines |
| `client/src/App.tsx` | Main React application |
| `client/src/lib/api.ts` | Frontend API client |

---

*Thank you for contributing to Echo and advancing research in hallucination mitigation!*

*© 2025 Mohamed Nejjar — Bachelor Thesis Implementation*
