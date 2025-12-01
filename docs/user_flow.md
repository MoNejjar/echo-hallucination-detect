<div align="center">

# Echo: User Experience & Interaction Flow

### A Human-Centered Design for AI-Guided Prompt Refinement

*Mohamed Nejjar — Bachelor Thesis: "Mitigating Hallucination Potential in User Prompts Through AI-Guided Iterative Refinement"*

</div>

---

## Abstract

This document describes the experiential journey through Echo's shift-left hallucination mitigation workflow. It details how users interact with the multi-agent pipeline—from initial prompt submission through analysis, interpretation, iterative refinement, and export—to systematically reduce hallucination risk before LLM generation occurs.

The design philosophy prioritizes **progressive disclosure**, **cognitive accessibility**, and **traceable decision-making**, enabling users of varying technical sophistication to improve their prompts through structured human-AI collaboration.

---

## 1. Design Philosophy

### 1.1 Scientific Refinement Loop

Echo's user flow mirrors the empirical scientific method:

```
┌──────────────────────────────────────────────────────────────────────┐
│                   SCIENTIFIC REFINEMENT PARADIGM                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│    OBSERVE          HYPOTHESIZE        APPLY           RE-MEASURE   │
│       │                  │               │                 │        │
│       ▼                  ▼               ▼                 ▼        │
│  ┌─────────┐       ┌──────────┐    ┌──────────┐     ┌──────────┐   │
│  │ Analyze │──────▶│ Identify │───▶│ Refine   │────▶│ Re-analyze│   │
│  │ Prompt  │       │ Risks    │    │ via Chat │     │ Prompt    │   │
│  └─────────┘       └──────────┘    └──────────┘     └──────────┘   │
│       ▲                                                    │        │
│       └────────────────────────────────────────────────────┘        │
│                         Iterate until PRD acceptable                │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.2 Core UX Principles

| Principle | Implementation | User Benefit |
|-----------|---------------|--------------|
| **Traceability** | Every highlight links to specific guideline rules | Users understand *why* something is risky |
| **Progressive Disclosure** | Collapsible sections reveal detail on demand | Prevents information overload |
| **Actionable Feedback** | Mitigation strategies accompany each detection | Users know *how* to fix issues |
| **Non-judgmental Tone** | Risk framing, not error messaging | Encourages experimentation |
| **Preserved Agency** | All refinements require user approval | Human judgment remains paramount |

---

## 2. Interface Overview

### 2.1 Layout Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ╔════════════════════════════════════════════════════════════════════════╗ │
│  ║  ECHO                                              [☀️/🌙] Theme Toggle  ║ │
│  ╚════════════════════════════════════════════════════════════════════════╝ │
├─────────────────┬───────────────────────────────────────────────────────────┤
│                 │                                                           │
│   ╔═══════════╗ │  ┌─────────────────────────────────────────────────────┐  │
│   ║ SIDEBAR   ║ │  │                 PROMPT EDITOR                       │  │
│   ╠═══════════╣ │  │  ┌─────────────────────────────────────────────┐   │  │
│   ║ Analysis  ║ │  │  │                                             │   │  │
│   ║           ║ │  │  │   [User prompt text area]                   │   │  │
│   ║ Chat      ║ │  │  │                                             │   │  │
│   ║           ║ │  │  └─────────────────────────────────────────────┘   │  │
│   ║ Library   ║ │  │                                                     │  │
│   ║           ║ │  │  [Upload] [Analyze] [Mode: Both ▼] [Export]        │  │
│   ╚═══════════╝ │  └─────────────────────────────────────────────────────┘  │
│                 │                                                           │
│                 │  ┌─────────────────────────────────────────────────────┐  │
│                 │  │               ANALYSIS RESULTS                      │  │
│                 │  │  ┌──────────────────────────────────────────────┐  │  │
│                 │  │  │  HIGHLIGHTED PROMPT                          │  │  │
│                 │  │  │  Text with [yellow] [orange] [red] spans     │  │  │
│                 │  │  └──────────────────────────────────────────────┘  │  │
│                 │  │  ┌─────────────┐  ┌─────────────┐                  │  │
│                 │  │  │ Prompt PRD  │  │  Meta PRD   │   ◀─ Dual Gauges │  │
│                 │  │  │    42%      │  │    28%      │                  │  │
│                 │  │  └─────────────┘  └─────────────┘                  │  │
│                 │  │  ┌──────────────────────────────────────────────┐  │  │
│                 │  │  │  VIOLATION DETAILS  [▼ Expand]               │  │  │
│                 │  │  └──────────────────────────────────────────────┘  │  │
│                 │  └─────────────────────────────────────────────────────┘  │
│                 │                                                           │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

### 2.2 Component Zones

| Zone | Primary Components | Function |
|------|-------------------|----------|
| **Header** | Logo, title, theme toggle | Branding, accessibility |
| **Sidebar** | Analysis/Chat/Library tabs | Mode navigation |
| **Editor** | Textarea, toolbar | Prompt input and actions |
| **Visualization** | Highlighted prompt, PRD gauges | Risk communication |
| **Detail Panels** | Violation cards, mitigation lists | Deep analysis |
| **Chat Interface** | Conversation thread, input | Interactive refinement |

---

## 3. The Echo Workflow

### Phase 1: Prompt Composition

#### 3.1.1 Input Methods

**Direct Entry:**
```
User Action:
1. Click in editor area
2. Type or paste prompt
3. Observe character count
4. Proceed to analysis
```

**File Upload:**
```
User Action:
1. Click "Upload" or drag file
2. Supported: .txt, .md (plain text)
3. Content populates editor
4. Review and modify if needed
```

### Phase 2: Analysis Mode Selection

#### 3.2.1 Mode Options

Before analysis, users select a detection focus:

```
┌──────────────────────────────────────────────────────────┐
│           ANALYSIS MODE SELECTION                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ○ Faithfulness                                          │
│    └─ Focus: Will the LLM stay true to my context?       │
│    └─ Use when: Providing reference documents/data       │
│                                                          │
│  ○ Factuality                                            │
│    └─ Focus: Will the LLM generate false claims?         │
│    └─ Use when: Asking for factual information           │
│                                                          │
│  ● Both (Default)                                        │
│    └─ Focus: Comprehensive risk assessment               │
│    └─ Use when: General-purpose prompt improvement       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Theoretical Mapping:**
| Mode | Taxonomy Level | Guideline File |
|------|----------------|----------------|
| Faithfulness | User-Sided → Prompt/Meta → Faithfulness | `faithfulness.xml` |
| Factuality | User-Sided → Prompt/Meta → Factuality | `factuality.xml` |
| Both | User-Sided → All paths | `both.xml` |

### Phase 3: Analysis Execution

#### 3.3.1 Processing Stages

```
User clicks "Analyze" →
│
├── Stage 1: Sanitization
│   └─ Input cleaning, encoding verification
│
├── Stage 2: Guideline Loading
│   └─ Mode-specific XML rules loaded
│
├── Stage 3: LLM Analysis
│   └─ Structured prompt sent to Analyzer Agent
│   └─ GPT-4 returns XML-formatted assessment
│
├── Stage 4: Parsing & PRD Calculation
│   └─ Extract RISK_n tokens
│   └─ Compute Prompt PRD and Meta PRD
│
├── Stage 5: Visualization Rendering
│   └─ Apply highlighting colors
│   └─ Populate gauge values
│   └─ Generate violation cards
│
└── Display: Interactive risk dashboard
```

#### 3.3.2 Progress Feedback

```
┌──────────────────────────────────────────────────────────┐
│                   ANALYZING PROMPT                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ████████████████████████░░░░░░░░░░░░░░  65%            │
│                                                          │
│  Current stage: Evaluating risk criteria...              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Phase 4: Results Interpretation

#### 3.4.1 Highlighted Prompt Display

The original prompt reappears with color-coded risk spans:

```
Example Output:

"Analyze ███████████ and tell me what ██████████████ 
          this data                    recent trends
          [HIGH - Red]                 [HIGH - Orange]

show about consumer behavior in ████████████."
                                the market
                                [MEDIUM - Yellow]
```

**Color Semantics:**
| Color | Severity | PRD Weight | Interpretation |
|-------|----------|------------|----------------|
| 🔴 Red | Critical | ×3 | High probability of severe hallucination |
| 🟠 Orange | High | ×2 | Significant hallucination likelihood |
| 🟡 Yellow | Medium | ×1 | Potential for minor hallucination |

#### 3.4.2 PRD Gauge Interpretation

```
┌──────────────────────────────────────────────────────────┐
│              PROMPT RISK DENSITY (PRD)                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  PROMPT PRD                    META PRD                  │
│  Token-level risks             Structural risks          │
│                                                          │
│     ┌────────┐                    ┌────────┐             │
│     │  42%   │                    │  28%   │             │
│     │ ██████ │                    │ ████░░ │             │
│     │ ░░░░░░ │                    │ ░░░░░░ │             │
│     └────────┘                    └────────┘             │
│                                                          │
│  INTERPRETATION:                                         │
│  • Prompt PRD 42%: Moderate token-level issues           │
│    (ambiguous references, vague quantifiers)             │
│                                                          │
│  • Meta PRD 28%: Lower structural risk                   │
│    (context mostly complete, some gaps)                  │
│                                                          │
│  RECOMMENDATION: Focus on highlighted tokens first       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### 3.4.3 Violation Detail Cards

Each detected risk expands into actionable detail:

```
┌──────────────────────────────────────────────────────────┐
│ 🔴 CRITICAL: Ambiguous Referent                         │
│    Pillar A | Rule A1                                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  DETECTED SPAN: "this data"                              │
│                                                          │
│  ISSUE: The pronoun "this" lacks a clear antecedent.     │
│         The LLM cannot determine which specific data     │
│         source is intended, likely leading to:           │
│         • Fabricated dataset references                  │
│         • Assumed context not provided                   │
│         • Inconsistent interpretations across responses  │
│                                                          │
│  MITIGATION:                                             │
│  Replace "this data" with specific identifier:           │
│  ✗ "this data"                                           │
│  ✓ "the Q3 2024 sales report"                            │
│  ✓ "the customer survey results from Appendix B"         │
│  ✓ "the following dataset: [paste data]"                 │
│                                                          │
│  [Ask Echo about this] [Mark as addressed]               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Phase 5: Initiator-Guided Entry Points

#### 3.5.1 Guided Questions

The Initiator Agent generates one question per broken rule:

```
┌──────────────────────────────────────────────────────────┐
│           REFINEMENT STARTING POINTS                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Based on the analysis, consider these questions:        │
│                                                          │
│  1. [CRITICAL] What specific dataset or document does    │
│     "this data" refer to? (Rule A1 - Ambiguous Referent) │
│                                                          │
│  2. [HIGH] What time period should "recent trends"       │
│     cover? E.g., last quarter, YTD, specific dates?      │
│     (Rule B2 - Temporal Vagueness)                       │
│                                                          │
│  3. [HIGH] Which market segment does "the market"        │
│     refer to? Geographic region, industry vertical,      │
│     or specific competitive landscape?                   │
│     (Rule A1 - Ambiguous Referent)                       │
│                                                          │
│  4. [MEDIUM] Who is the intended audience for this       │
│     analysis? Technical analysts, executives, or         │
│     general readers? (Rule C2 - Domain Scoping)          │
│                                                          │
│  [Start Conversation with Echo]                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Phase 6: Conversational Refinement

#### 3.6.1 Chat Interface

```
┌──────────────────────────────────────────────────────────┐
│             REFINEMENT CONVERSATION                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🤖 ECHO                                                 │
│  I've analyzed your prompt and found several areas       │
│  where hallucination risk could be reduced. Let's work   │
│  through them. What would you like to address first?     │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  👤 USER                                                 │
│  The "this data" refers to our Q3 sales figures.         │
│  Should I just replace the phrase?                       │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  🤖 ECHO                                                 │
│  Yes, but let's be more specific. Consider:              │
│                                                          │
│  Instead of: "Analyze this data"                         │
│  Use: "Analyze the Q3 2024 sales data provided below"    │
│                                                          │
│  This accomplishes:                                      │
│  ✓ Explicit temporal anchor (Q3 2024)                    │
│  ✓ Domain specification (sales)                          │
│  ✓ Reference to inline context ("provided below")        │
│                                                          │
│  However, I notice you haven't specified the format.     │
│  Will you paste a table, CSV, or summary statistics?     │
│  The LLM performs differently with each format.          │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  [Type your message...]                         [Send]   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### 3.6.2 Conversational Agent Behavior

**Design Principle**: The agent is explicitly **NOT a yes-man**. It:

| Behavior | Example |
|----------|---------|
| **Challenges vague fixes** | "Replacing 'recent' with 'current' doesn't add temporal specificity." |
| **Requests clarification** | "You mentioned 'the report'—which specific report?" |
| **Suggests alternatives** | "Instead of listing all constraints, consider a structured format." |
| **Maintains guideline adherence** | "This phrasing still violates Rule B1 (vague quantifiers)." |
| **Tracks progress** | "We've addressed 3 of 5 high-risk items. Let's tackle the remaining two." |

### Phase 7: Re-Analysis Cycle

#### 3.7.1 Re-Analysis Trigger

After significant conversation, Echo suggests re-analysis:

```
┌──────────────────────────────────────────────────────────┐
│  ⚠️ CONSIDER RE-ANALYZING                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  You've had 6 conversation exchanges. Re-analyzing       │
│  will apply your refinements and provide fresh           │
│  metrics on the improved prompt.                         │
│                                                          │
│  [Re-analyze Now]  [Continue Conversation]               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### 3.7.2 Preparator-Mediated Refinement

When re-analyzing, the Preparator Agent:

1. **Synthesizes** conversation insights
2. **Applies** discussed mitigations to original prompt
3. **Generates** refined prompt preview
4. **Avoids** copying conversation text verbatim

```
┌──────────────────────────────────────────────────────────┐
│            RE-ANALYSIS PREVIEW                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ORIGINAL PROMPT:                                        │
│  "Analyze this data and tell me what recent trends       │
│   show about consumer behavior in the market."           │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  REFINED PROMPT (Preview):                               │
│  "Analyze the Q3 2024 North American retail sales        │
│   data provided below. Identify purchasing trends        │
│   from July through September 2024, focusing on:         │
│   1. Seasonal variation patterns                         │
│   2. Category-specific changes                           │
│   3. Comparison to Q3 2023 baseline                      │
│                                                          │
│   Present findings for a non-technical executive         │
│   audience in 300-500 words.                             │
│                                                          │
│   [Data to be inserted here]"                            │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  [Edit Preview]  [Confirm & Analyze]                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Phase 8: Export & Application

#### 3.8.1 Export Options

```
┌──────────────────────────────────────────────────────────┐
│               EXPORT REFINED PROMPT                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  FORMAT:                                                 │
│  ○ Plain Text (.txt)                                     │
│  ○ Markdown (.md)                                        │
│  ● JSON (includes metadata)                              │
│  ○ PDF Report (full analysis)                            │
│                                                          │
│  INCLUDE:                                                │
│  ☑ Original prompt                                       │
│  ☑ Refined prompt                                        │
│  ☑ PRD scores (before/after)                             │
│  ☐ Full conversation history                             │
│  ☐ Violation details                                     │
│                                                          │
│  [Export]                                                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Cognitive Design Rationale

### 4.1 Information Architecture

| Challenge | Solution | Cognitive Benefit |
|-----------|----------|-------------------|
| Overwhelming detail | Collapsible sections | User controls depth |
| Abstract metrics | Color-coded highlighting | Visceral understanding |
| Unclear next steps | Initiator questions | Guided entry points |
| Expert-only language | Plain-language mitigations | Accessibility |
| Analysis paralysis | Prioritized violations | Focus on high-impact |

### 4.2 Trust-Building Mechanisms

| Mechanism | Implementation |
|-----------|---------------|
| **Transparency** | Every highlight traces to specific XML rule |
| **Consistency** | Same input always produces same output |
| **Fallibility acknowledgment** | "This analysis is suggestive, not definitive" |
| **User override** | All refinements require explicit approval |

---

## 5. Interaction Patterns by User Type

### 5.1 Academic Researcher

**Goal**: Reduce hallucination risk in literature review prompts

**Typical Flow**:
```
1. Paste draft prompt for summarizing papers
2. Select "Factuality" mode (concern: fabricated citations)
3. Review: High PRD due to vague paper references
4. Chat: Clarify specific paper identifiers (DOIs, titles)
5. Re-analyze: PRD drops from 65% → 22%
6. Export: JSON with before/after metrics for methods section
```

### 5.2 Business Analyst

**Goal**: Generate reliable market analysis without fabricated statistics

**Typical Flow**:
```
1. Type prompt requesting market analysis
2. Select "Both" mode (comprehensive assessment)
3. Review: Multiple "the market" references flagged
4. Chat: Specify geographic region, time period, data sources
5. Add: Explicit uncertainty handling ("if data unavailable, state so")
6. Re-analyze: Verify improvements
7. Export: Refined prompt for team use
```

### 5.3 Developer

**Goal**: Create robust system prompts for production AI features

**Typical Flow**:
```
1. Upload existing system prompt file
2. Select "Faithfulness" mode (concern: instruction adherence)
3. Review: Conflicting constraints detected (Rule L1)
4. Chat: Resolve constraint conflicts, add explicit priorities
5. Iterate: Multiple re-analysis cycles
6. Export: Final prompt + all analysis artifacts
7. Integrate: Use exported prompt in application
```

---

## 6. Accessibility & Responsive Design

### 6.1 Accessibility Features

| Feature | Implementation |
|---------|---------------|
| **Keyboard navigation** | Full tab-order support |
| **Screen reader** | ARIA labels on all interactive elements |
| **Color independence** | Severity also conveyed via icons/text |
| **Motion sensitivity** | Respect `prefers-reduced-motion` |
| **Font scaling** | Responsive to browser zoom |

### 6.2 Responsive Breakpoints

| Viewport | Layout Adaptation |
|----------|-------------------|
| Desktop (>1024px) | Full three-column layout |
| Tablet (768-1024px) | Collapsible sidebar |
| Mobile (<768px) | Single-column, stacked sections |

---

## 7. Error Handling & Edge Cases

### 7.1 Graceful Degradation

| Scenario | User Experience |
|----------|----------------|
| Network failure | Cached analysis retained, retry button |
| LLM timeout | Partial results shown, retry option |
| Empty prompt | Gentle validation message |
| Very long prompt | Warning about token limits |
| Unsupported language | Notification with language guidance |

### 7.2 Feedback Loop

```
┌──────────────────────────────────────────────────────────┐
│  📊 WAS THIS ANALYSIS HELPFUL?                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [👍 Yes, accurate]  [👎 No, missed issues]              │
│                                                          │
│  Your feedback improves Echo's detection accuracy.       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 8. Summary: The Echo Experience

Echo transforms prompt quality improvement from an opaque, intuition-driven process into a **systematic, measurable, and collaborative workflow**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        THE ECHO EXPERIENCE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   WRITE                                                                 │
│   └─ Compose or upload your prompt                                      │
│                                                                         │
│   ANALYZE                                                               │
│   └─ Receive quantified risk assessment (PRD)                           │
│   └─ View token-level highlighting                                      │
│   └─ Understand specific violations                                     │
│                                                                         │
│   UNDERSTAND                                                            │
│   └─ Review initiator questions                                         │
│   └─ Trace risks to guideline rules                                     │
│   └─ Read mitigation strategies                                         │
│                                                                         │
│   REFINE                                                                │
│   └─ Converse with Echo's critical assistant                            │
│   └─ Apply targeted improvements                                        │
│   └─ Re-analyze to measure progress                                     │
│                                                                         │
│   EXPORT                                                                │
│   └─ Deploy hallucination-resistant prompt                              │
│   └─ Document improvement metrics                                       │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════   │
│   Result: Reduced PRD → Lower hallucination risk → Better LLM outputs   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

*"Clarity is not decorative; it is defensive."*

*See `architecture.md` for technical implementation details.*

*© 2025 Mohamed Nejjar — Bachelor Thesis Implementation*
