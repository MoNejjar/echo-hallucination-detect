# Hallucination Detection Guidelines Reference

This document presents the comprehensive taxonomy of hallucination detection rules used by Echo. These guidelines help identify potential weaknesses in prompts that could lead to factual inaccuracies, ambiguity, or unreliable outputs.

---

## Echo's Detection Algorithm

### Agent-Based Architecture

Echo employs a **specialized agent architecture** for hallucination detection:

```
┌──────────────────────────────────────────────────┐
│         LLM Facade (Lightweight Layer)           │
│  • Maintains backward compatibility              │
│  • Delegates to specialized agents               │
└────────────┬─────────────────────────────────────┘
             │
    ┌────────▼────────┐
    │ AnalyzerAgent   │
    │ (513 lines)     │
    ├─────────────────┤
    │ • Guideline loading (XML)                     │
    │ • Prompt analysis with GPT-4                  │
    │ • XML parsing & token extraction              │
    │ • PRD (Prompt Risk Density) calculation       │
    │ • Risk assessment generation                  │
    └─────────────────┘
```

**Key Benefits:**
- **Separation of Concerns**: Dedicated analysis logic isolated from conversation logic
- **Maintainability**: Focused module (~500 lines vs previous 1200-line monolith)
- **Extensibility**: Easy to enhance detection algorithms independently

### Analysis Modes

Echo supports **three analysis modes** with different guideline sets:

| Mode | Guideline File | Focus | Use Case |
|------|---------------|-------|----------|
| **Faithfulness** | `data/faithfulness.xml` | Consistency with provided context | Verify model stays faithful to input information |
| **Factuality** | `data/factuality.xml` | Real-world accuracy | Check claims against factual knowledge |
| **Both** (Default) | `data/both.xml` | Comprehensive analysis | Checks both faithfulness and factuality risks |

Users select the mode via the frontend UI, which is passed to the AnalyzerAgent.

### LLM-Based Risk Assessment Pipeline

Echo uses a sophisticated multi-stage approach:

#### 1. Guideline Loading Phase

```
Input: Analysis mode selection

Process: 
  - AnalyzerAgent loads corresponding XML guideline file
  - Guidelines contain detection rules and patterns
  - Mode-specific criteria for risk assessment

Output: Loaded guideline structure
```

#### 2. Prompt Analysis Phase

```
Input: User prompt + loaded guidelines

Process: 
  - Send structured request to GPT-4
  - Include XML guidelines in system prompt
  - Request structured XML response
  - Parse prompt structure and content
  - Identify risk factors and patterns
  - Analyze context completeness

Output: Raw XML risk assessment
```

#### 3. XML Parsing & Token Extraction

```
Input: GPT-4 XML response

Process:
  - Parse <RISK_ASSESSMENT> block
  - Extract individual <CRITERION> elements
  - Identify <RISK_n> tagged spans in annotated prompt
  - Build risk_tokens array with metadata

Output: Structured risk data + annotated prompt
```

#### 4. PRD (Prompt Risk Density) Calculation

```
Input: Extracted risk tokens and criteria

Process:
  - Calculate prompt_PRD: (high_risk_tokens / total_tokens) * 100
  - Calculate meta_PRD: Weighted average of criteria scores
  - Apply severity weighting:
    * High risk criteria: weight × 1.5
    * Medium risk criteria: weight × 1.0
    * Low risk criteria: weight × 0.5
  - Normalize scores to 0-100 scale

Output: Numerical risk density scores
```

#### 5. Criteria Evaluation

For each risk criterion:
- **Risk Level**: High (red), Medium (yellow), Low (green)
- **Percentage Score**: 0-100 scale of risk likelihood  
- **Description**: Specific explanation of the risk factor
- **Rule IDs**: Reference to guideline rules triggered
- **Pillar**: Category (e.g., Ambiguity-Vagueness, Temporal-Context)

#### 6. Overall Assessment

- **Aggregate Score**: Weighted combination of individual criteria + PRD
- **Summary**: Natural language explanation of primary risks
- **Prompt-Level Violations**: Issues found in specific text spans
- **Meta-Level Violations**: Structural or conceptual issues

### XML-Structured Output

Echo uses XML formatting to ensure structured, parseable risk assessments:

#### Example Assessment Response:

```xml
<RISK_ASSESSMENT>
  <CRITERIA>
    <CRITERION name="Ambiguity-Vagueness" risk="high" percentage="85">
      The prompt contains pronouns like "this" and "it" without clear antecedents,
      increasing the likelihood of hallucinated specifics.
    </CRITERION>
    <CRITERION name="Context-Completeness" risk="medium" percentage="60">
      Some background information is missing for comprehensive analysis, which
      may cause the model to fill gaps with assumptions.
    </CRITERION>
    <CRITERION name="Temporal-Context" risk="low" percentage="25">
      Time references are adequately specified with clear date ranges.
    </CRITERION>
  </CRITERIA>
  <OVERALL_ASSESSMENT percentage="65">
    The prompt has elevated hallucination risk primarily due to ambiguous 
    references and incomplete context. Address high-risk tokens first.
  </OVERALL_ASSESSMENT>
</RISK_ASSESSMENT>

ANNOTATED PROMPT WITH RISK TOKENS:
Please analyze <RISK_1>this data</RISK_1> and tell me what <RISK_2>recent trends</RISK_2> 
show about consumer behavior in <RISK_3>the market</RISK_3>.
```

#### Risk Token Structure:

```json
{
  "id": "RISK_1",
  "text": "this data",
  "risk_level": "high",
  "classification": "Ambiguous reference without antecedent",
  "rule_ids": [101, 105],
  "pillar": "Ambiguity-Vagueness"
}
```

### Deterministic Post-Processing

After LLM analysis, AnalyzerAgent applies deterministic scoring:

```python
def _calculate_deterministic_risk_scores(violations, risk_tokens):
    """
    Apply rule-based scoring on top of LLM assessment:
    - Count high/medium/low risk tokens
    - Weight by severity and position
    - Calculate prompt_PRD and meta_PRD
    - Apply normalization and clamping
    - Generate final risk_assessment structure
    """
```

This hybrid approach combines:
- **LLM Flexibility**: Understands context and nuance
- **Deterministic Reliability**: Consistent, reproducible scores

---

## Interpreting Results

### Risk Level Indicators

#### 🔴 High Risk (70-100%)
- **Meaning**: Significant likelihood of hallucinated content
- **Action**: Prompt revision strongly recommended
- **Common Causes**: Ambiguous references, factual specificity requests

#### 🟡 Medium Risk (40-69%)
- **Meaning**: Moderate risk of inaccuracies or assumptions
- **Action**: Consider clarifying ambiguous elements
- **Common Causes**: Vague quantifiers, incomplete context

#### 🟢 Low Risk (0-39%)
- **Meaning**: Well-structured prompt with clear instructions
- **Action**: Prompt is likely safe to use as-is
- **Characteristics**: Specific context, clear references, appropriate scope

### Understanding Criteria Scores

Each criterion is evaluated independently:
- **Individual Scores**: Specific risk factors in the prompt
- **Cumulative Impact**: How multiple factors compound risk
- **Priority Order**: Address highest-risk factors first

---

## Mitigation Strategies

### 1. Prompt Restructuring

#### Before (High Risk):
```
"Analyze this data and tell me what the recent trends show about consumer behavior."
```

#### After (Low Risk):
```
"Based on the quarterly sales data from Q1-Q3 2023 that I'll provide below, identify patterns in consumer purchasing behavior. Focus on seasonal variations and product category preferences. Note: Please base your analysis only on the data provided and indicate if any trends require additional data for confirmation.

[Data would be included here]"
```

### 2. Context Enhancement

#### Add Specific Details:
- Dates, names, and identifiers
- Scope and limitations
- Source attribution
- Domain-specific context

#### Include Disclaimers:
- Knowledge cutoff acknowledgments
- Uncertainty indicators
- Verification recommendations

### 3. Question Reformulation

#### Transform Factual Requests:
- Instead of: "What did Einstein say about quantum mechanics?"
- Use: "What are some general perspectives on quantum mechanics that are often attributed to Einstein's era of physics?"

#### Clarify Ambiguous Terms:
- Replace pronouns with specific nouns
- Define technical terms and acronyms
- Specify measurement units and scales

### 4. Iterative Refinement with Conversation Agent

Echo provides **interactive refinement** through the ConversationAgent:

#### ConversationAgent Architecture

```
┌──────────────────────────────────────────────────┐
│       ConversationAgent (224 lines)              │
│  • chat_once(): Single-turn refinement           │
│  • chat_stream(): Multi-turn conversations       │
│  • Context-aware suggestions                     │
│  • Analysis-informed responses                   │
└──────────────────────────────────────────────────┘
```

#### Refinement Workflow:
1. **Initial Assessment**: Run prompt through Echo's AnalyzerAgent
2. **Identify High-Risk Areas**: Review risk tokens and criteria scores
3. **Chat for Guidance**: Ask ConversationAgent about specific issues
4. **Apply Targeted Fixes**: Address risk factors based on suggestions
5. **Re-Analyze**: Use Re-Analyze feature for iterative improvement
6. **Iterate**: Continue until acceptable risk level achieved

#### Re-Analysis Workflow (Advanced Feature)

Echo includes a **Preparator Service** for sophisticated re-analysis:

```
User Journey:
1. Converse with Echo about prompt improvements
2. Click "Re-Analyze" button
3. Preparator synthesizes conversation insights
4. Optionally add final manual edits
5. Generate preview of refined prompt
6. Confirm and trigger fresh analysis
```

**Preparator Service** (`services/preparator.py`):
- Integrates prior analysis findings
- Applies conversation-discussed mitigations
- Incorporates user's final edits
- **Critically**: Uses conversation as CONTEXT only (doesn't copy text)
- Produces refined prompt ready for re-analysis

**Key Innovation**: The conversation history provides **semantic understanding** 
of what the user wants to improve, but the refined prompt only contains:
- Original prompt text (base)
- Fixes for identified risks
- User's explicit additions

See `docs/RE-ANALYSIS_FIX.md` for detailed explanation of content accumulation prevention.

---

## Best Practices for Different Use Cases

### Academic and Research
- Cite specific sources when available
- Frame as requests for general knowledge
- Include methodology discussions
- Acknowledge limitations explicitly

### Business and Analytics
- Provide complete datasets
- Specify analysis frameworks
- Include relevant time periods
- Define key performance indicators

### Creative Writing
- Distinguish between factual and fictional elements
- Provide character and world context
- Specify genre and style preferences
- Include creative constraints

### Technical Documentation
- Include version numbers and specifications
- Provide environment details
- Specify use cases and constraints
- Reference official documentation

---

## Continuous Improvement

### Feedback Loop

Echo's detection capabilities improve through:
- User feedback on assessment accuracy
- Analysis of common hallucination patterns
- Updates to risk criteria based on new research
- Integration of emerging detection methodologies

### Staying Current
- Regular updates to detection algorithms
- Incorporation of latest hallucination research
- Community feedback and contributions
- Adaptation to new LLM capabilities and limitations

---

## Conclusion

Effective hallucination detection requires a combination of automated tools and human judgment. Echo provides a foundation for identifying potential risks, but users should:

1. **Understand the Limitations**: No detection system is 100% accurate
2. **Use Multiple Strategies**: Combine automated detection with manual review
3. **Stay Informed**: Keep up with latest research and best practices
4. **Iterate and Improve**: Continuously refine prompts based on results

By following these guidelines and using Echo's risk assessment capabilities, users can significantly reduce the likelihood of AI hallucinations in their applications.

---

## 📊 Severity Legend

| Symbol | Level | Weight | Description |
|--------|-------|--------|-------------|
| 🚨 | **CRITICAL** | 1.0 | High likelihood of severe hallucination or complete task failure |
| ⚠️ | **HIGH** | 0.7 | Significant risk of ambiguity or factual errors |
| 🔶 | **MEDIUM** | 0.4 | Moderate risk requiring clarification |
| 🔷 | **LOW** | 0.2 | Minor issue with minimal impact |

---

## 🎯 Using This Reference

This guideline taxonomy is used by Echo's **AnalyzerAgent** to detect hallucination risks in your prompts. When you submit a prompt for analysis:

1. **Detection**: Echo matches your prompt against these patterns
2. **Severity**: Each detected instance is assigned a severity level
3. **PRD Calculation**: Echo computes a Probability Risk Density score
4. **Highlighting**: Risky text is highlighted in the analysis view
5. **Refinement**: Use the ConversationAgent to ask questions and refine your prompt

**Tip**: Use the **Library** button in the sidebar to browse these guidelines interactively while working on your prompts.

---

**Last Updated**: 2025  
**Version**: 2.0  
**Source**: `server/data/both.xml`

## 📚 Overview

Echo's detection system is built on a multi-layered taxonomy organized into **12 pillars** (A–L). Each pillar addresses a specific category of prompt-level or meta-level risks. Within each pillar are **individual rules** with clearly defined:

- 🔍 **Detection Patterns**: Linguistic or structural signals indicating risk
- ⚠️ **Severity Levels**: Critical, High, Medium, Low
- 📝 **Examples**: Risky formulations (❌) vs. safer alternatives (✅)
- 🛡️ **Mitigation Strategies**: How to fix or avoid the issue

---

## Table of Contents

- [What are AI Hallucinations?](#what-are-ai-hallucinations)
- [Types of Hallucinations](#types-of-hallucinations)
- [The 12 Pillars](#the-12-pillars)
  - [Pillar A: Referential Grounding](#pillar-a-referential-grounding)
  - [Pillar B: Quantification Constraints](#pillar-b-quantification-constraints)
  - [Pillar C: Context-Domain](#pillar-c-context-domain)
  - [Pillar D: Premises-Evidence](#pillar-d-premises-evidence)
  - [Pillar E: Numbers-Units](#pillar-e-numbers-units)
  - [Pillar F: Retrieval-Anchoring](#pillar-f-retrieval-anchoring)
  - [Pillar G: Injection-Layering](#pillar-g-injection-layering)
  - [Pillar H: Style-Bias-Role](#pillar-h-style-bias-role)
  - [Pillar I: Reasoning-Uncertainty](#pillar-i-reasoning-uncertainty)
  - [Pillar J: Prompt-Structure](#pillar-j-prompt-structure)
  - [Pillar K: Instruction-Structure-MultiStep](#pillar-k-instruction-structure-multistep)
  - [Pillar L: Contextual-Integrity](#pillar-l-contextual-integrity)
- [Detection Methodologies](#detection-methodologies)
- [Risk Assessment Criteria](#risk-assessment-criteria)
- [Echo's Detection Algorithm](#echos-detection-algorithm)
- [Interpreting Results](#interpreting-results)
- [Mitigation Strategies](#mitigation-strategies)
- [Best Practices](#best-practices-for-different-use-cases)
- [Continuous Improvement](#continuous-improvement)
- [Conclusion](#conclusion)

---

## What are AI Hallucinations?

AI hallucinations refer to instances where language models generate information that appears plausible but is factually incorrect, fabricated, or not grounded in the provided context. These can range from subtle inaccuracies to completely fabricated facts, names, dates, or concepts.

### Why Do Hallucinations Occur?

1. **Training Data Limitations**: Models may have learned patterns from incomplete or incorrect data
2. **Overgeneralization**: Models may extrapolate beyond their training data inappropriately
3. **Context Confusion**: Ambiguous prompts can lead to multiple valid interpretations
4. **Knowledge Cutoff**: Information beyond the training data cutoff date may be fabricated
5. **Prompt Engineering Issues**: Poorly structured prompts increase hallucination likelihood

---

## Types of Hallucinations

### 1. Factual Hallucinations

**Definition**: Generation of false factual information

**Examples**:
- Incorrect dates, names, or historical events
- Non-existent research papers or citations
- False statistical data or numbers
- Invented geographical information

**Risk Level**: High - Can spread misinformation

### 2. Contextual Hallucinations

**Definition**: Information that doesn't align with the provided context

**Examples**:
- Contradicting information provided in the prompt
- Assuming context not explicitly stated
- Mixing up different contexts or scenarios

**Risk Level**: Medium to High - Can lead to misunderstandings

### 3. Logical Hallucinations

**Definition**: Conclusions that don't follow from the given premises

**Examples**:
- Illogical cause-and-effect relationships
- Contradictory statements within the same response
- Invalid reasoning chains

**Risk Level**: Medium - Can mislead decision-making

### 4. Creative Hallucinations

**Definition**: Fabricated creative content presented as factual

**Examples**:
- Invented quotes attributed to real people
- Fictional events presented as historical
- Made-up technical specifications

**Risk Level**: Medium - Context-dependent severity

---

## The 12 Pillars

### Pillar A: Referential Grounding

**Class:** Prompt-Level

Ensures all references in prompts are explicitly defined and unambiguous.

#### A1: Ambiguous Referents | 🚨 CRITICAL

**Detection Patterns:**
- Pronouns without clear antecedents: *it, they, this, that, these, those*
- Deictic references missing grounding: *here, there, now, then*
- Undefined entities: *"the thing"*, *"the issue"*, *"the document"*

**Examples:**
- ❌ *"It should be summarized."* (What is "it"?)
- ❌ *"Analyze this for me."* (What is "this"?)
- ❌ *"They need to be reviewed."* (Who are "they"?)
- ✅ *"The Q3 financial report should be summarized."*

**Mitigation:**
Replace all pronouns with explicit nouns. Use proper names, titles, or descriptive phrases.

---

#### A2: Canonical Naming Drift | ⚠️ HIGH

**Detection Patterns:**
- Multiple different names for the same entity within one prompt
- Synonym substitution that creates ambiguity (*"the model"* vs. *"the system"* vs. *"the algorithm"*)
- Inconsistent capitalization or abbreviation

**Examples:**
- ❌ *"Analyze **the dataset**. Then, evaluate **the data**. Finally, critique **the corpus**."*
- ❌ *"The **GPT model** was tested. **The system** showed improvement. **It** outperformed baselines."*
- ✅ *"Analyze **the IMDB dataset**. Then, evaluate **the IMDB dataset**. Finally, critique **the IMDB dataset**."*

**Mitigation:**
Choose one canonical name per entity and use it consistently throughout the prompt.

---

### Pillar B: Quantification Constraints

**Class:** Prompt-Level

Addresses vague or underspecified quantifiers that leave interpretation to the model.

#### B1: Relative Descriptors | ⚠️ HIGH

**Detection Patterns:**
- Vague scalar adjectives: *few, many, some, several, most, often, rarely, recently*
- Comparative terms without baselines: *better, worse, faster, slower*
- Frequency/degree terms without anchors: *sometimes, usually, occasionally*

**Examples:**
- ❌ *"List **some** key findings."* (How many is "some"?)
- ❌ *"Identify **recent** studies."* (How recent?)
- ❌ *"The model performed **better**."* (Better than what?)
- ✅ *"List **3-5** key findings."*
- ✅ *"Identify studies published **after 2020**."*

**Mitigation:**
Replace vague quantifiers with exact numbers, ranges, or explicit comparison points.

---

#### B2: Temporal Vagueness | ⚠️ HIGH

**Detection Patterns:**
- Unanchored time references: *now, then, soon, later, recently, formerly*
- Relative periods without dates: *last week, next month, this year*
- Implicit event sequencing: *before, after, during*

**Examples:**
- ❌ *"Summarize **recent** developments."*
- ❌ *"Explain what happened **then**."*
- ❌ *"Analyze trends over **the past few years**."*
- ✅ *"Summarize developments from **January 2023 to December 2024**."*

**Mitigation:**
Use absolute dates, timestamps, or explicit time ranges.

---

#### B3: Underspecified Scope | 🔶 MEDIUM

**Detection Patterns:**
- Open-ended list requests: *"all relevant...", "key points"*
- Vague boundaries: *"main ideas", "important factors"*
- Missing cardinality: *"list examples"* (how many?)

**Examples:**
- ❌ *"List **all** relevant papers."* (Could be thousands!)
- ❌ *"Summarize the **main** points."* (How many points?)
- ✅ *"List the **5 most-cited** papers from 2020-2024."*

**Mitigation:**
Set explicit limits (top N, first M, up to X results).

---

### Pillar C: Context-Domain

**Class:** Meta-Level

Ensures prompts provide sufficient contextual grounding for the task.

#### C1: Missing Essentials | 🚨 CRITICAL

**Detection Patterns:**
- Tasks missing **who** (actor/subject)
- Tasks missing **what** (object/topic)
- Tasks missing **when** (timeframe)
- Tasks missing **where** (location/domain)
- Tasks missing explicit constraints (scope, audience, format)
- Deictic placeholders without grounding: *"do this", "like that", "as above"*

**Examples:**
- ❌ *"Analyze this."* (Missing object)
- ❌ *"Summarize for me."* (Missing subject)
- ❌ *"Write about the war."* (Missing timeframe/location)
- ❌ *"Do it like that."* (Deictic with no grounding)
- ✅ *"Analyze **the 2023 climate report** for **executive stakeholders**, focusing on **carbon emission trends**."*

**Mitigation:**
Answer the 5 W's explicitly: Who, What, When, Where, Why (+ How).

---

#### C2: Domain-Scoping-Missing | ⚠️ HIGH

**Detection Patterns:**
- No audience specified (expert vs. beginner)
- No discipline specified (law, medicine, CS, history, etc.)
- No dataset or corpus identified when task depends on one
- No jurisdiction/context in legal/policy tasks
- No perspective in evaluative/ethical tasks (*"good/bad"* without frame)

**Examples:**
- ❌ *"Summarize the law."* (Which law? Which jurisdiction?)
- ❌ *"Explain relativity."* (For a physicist or a 5th grader?)
- ❌ *"Analyze the dataset."* (Which dataset?)
- ✅ *"Summarize **U.S. copyright law (17 U.S.C. § 107)** for **non-lawyers**."*

**Mitigation:**
Specify domain, audience level, jurisdiction, and relevant constraints.

---

### Pillar D: Premises-Evidence

**Class:** Prompt-Level

Flags prompts embedding false, unverified, or biased premises.

#### D1: False-or-Unverified-Premise | 🚨 CRITICAL

**Detection Patterns:**
- Prompts embedding unverified factual assumptions
- False historical/scientific claims in task setup
- Unsupported absolute claims: *obviously, clearly, everyone knows*
- Cause-effect stated as fact without evidence

**Examples:**
- ❌ *"Since **Einstein invented the iPhone**, explain its impact."*
- ❌ *"**Everyone knows** LLMs are unbiased — discuss."*
- ❌ *"Explain why **vaccines always cause autism**."*
- ✅ *"Some claim vaccines cause autism. Evaluate the scientific evidence."*

**Mitigation:**
Remove false premises. Frame controversial claims as claims, not facts.

---

#### D2: Leading-Opinion-Framing | 🚨 CRITICAL

**Detection Patterns:**
- User inserts bias while asking for model's stance
- Loaded questions embedding subjective framing
- Prompts nudging toward agreement (*"don't you think", "isn't it true"*)

**Examples:**
- ❌ *"Since **climate change is fake**, what do you think?"*
- ❌ *"**Don't you agree** that AI is dangerous?"*
- ❌ *"Why is **X better** than Y?"* (Biased framing)
- ✅ *"Compare the pros and cons of X and Y objectively."*

**Mitigation:**
Use neutral framing. Ask for objective analysis instead of agreement.

---

### Pillar E: Numbers-Units

**Class:** Prompt-Level

Ensures all numerical values include necessary units and context.

#### E1: Unitless-Number | ⚠️ HIGH

**Detection Patterns:**
- Bare numbers for physical quantities (temperature, mass, distance, time, frequency, storage)
- Mention of quantities without measurement metrics

**Examples:**
- ❌ *"Increase temperature to **37**."* (Celsius? Fahrenheit?)
- ❌ *"What is the boiling **temperature** of water?"* (Under what pressure? What unit?)
- ✅ *"Increase temperature to **37°C**."*

**Mitigation:**
Always include units (kg, m, s, °C, MB, etc.).

---

#### E2: Percent-No-Baseline | ⚠️ HIGH

**Detection Patterns:**
- % values without a base/denominator or reference point

**Examples:**
- ❌ *"Reduce errors by **20%**."* (20% of what baseline?)
- ✅ *"Reduce errors by **20% relative to the 2023 baseline** (currently 500 errors/month)."*

**Mitigation:**
Specify the baseline or reference point for all percentages.

---

#### E3: Currency-Unspecified | 🔶 MEDIUM

**Detection Patterns:**
- Money amounts without currency/region (e.g., *$* with no country or plain number as money)

**Examples:**
- ❌ *"Budget is **$5,000**."* (USD? CAD? AUD?)
- ✅ *"Budget is **$5,000 USD**."*

**Mitigation:**
Always include currency code (USD, EUR, GBP, etc.).

---

#### E4: Time-No-Zone-or-Unit | 🔶 MEDIUM

**Detection Patterns:**
- Times/durations missing needed unit/timezone when relevant

**Examples:**
- ❌ *"Run at **3 pm**."* (Which timezone?)
- ✅ *"Run at **3 pm EST**."*

**Mitigation:**
Include timezone for absolute times, units for durations.

---

### Pillar F: Retrieval-Anchoring

**Class:** Prompt-Level

Ensures retrieval requests specify source type and document identifiers.

#### F1: Source-Class-Unspecified | ⚠️ HIGH

**Detection Patterns:**
- *"look up", "search", "check", "find"* with no source type (peer-reviewed, official stats, web, internal repo)

**Examples:**
- ❌ *"**Look up** the latest GDP numbers."* (From where?)
- ✅ *"Look up the latest GDP numbers from **the World Bank Open Data portal**."*

**Mitigation:**
Specify source type, repository, or database.

---

#### F2: Document-Anchor-Missing | 🚨 CRITICAL

**Detection Patterns:**
- Mentions of *"the paper/report/dataset/benchmark"* without an identifier (title/DOI/ID)

**Examples:**
- ❌ *"Compare results for **the dataset** and **the benchmark**; **the model** underperformed."*
- ✅ *"Compare results for **ImageNet (Deng et al., 2009)** and **COCO 2017**; **ResNet-50** underperformed."*

**Mitigation:**
Use titles, DOIs, URLs, or unique identifiers for all referenced documents.

---

### Pillar G: Injection-Layering

**Class:** Meta-Level

Detects contradictions, duplications, and context breaks in dialogue continuity.

#### G1: Continuity | 🚨 CRITICAL

**Detection Patterns:**
- Prompts contradicting earlier user/system instructions
- Tasks requiring knowledge of prior context not included
- Prompts explicitly invalidating earlier commitments (*"ignore previous instructions"*)
- Shifts in persona/voice without clarification

**Examples:**
- ❌ *"Earlier you said X, now **ignore that**."*
- ❌ *"**Forget all previous instructions** and do this instead."*
- ❌ *"Disregard your earlier persona and act differently."*
- ✅ *"Update the previous constraint from X to Y for clarity."*

**Mitigation:**
Avoid contradictory instructions. Use additive refinement instead of negation.

---

#### G2: Instruction-Deduplication | 🚨 CRITICAL

**Detection Patterns:**
- Repeated identical instructions in same prompt
- Conflicting duplicates (same directive expressed in multiple incompatible ways)
- Overlapping redundant commands adding ambiguity

**Examples:**
- ❌ *"Write a summary about the first five amendments. Translate the text to French after you summarize it."* (Redundant summarization)
- ❌ *"Give a **short** summary and also provide a **detailed** summary."* (Conflicting length constraints)
- ✅ *"Write a summary about the first five amendments. Then, translate that summary to French."*

**Mitigation:**
Remove duplicates. Consolidate conflicting instructions into one clear directive.

---

### Pillar H: Style-Bias-Role

**Class:** Prompt-Level

Flags stylistic distortions, stereotypes, and unsafe role-play requests.

#### H1: Style-Inflation | ⚠️ HIGH

**Detection Patterns:**
- Overly creative/flowery style requested where factual accuracy is needed
- Instructions mixing factual with entertainment genres (poem, story, rap, song)
- Stylized emotional tone injected into analytical tasks (romantic, funny, scary)
- Format distortions (*"explain in emojis"* for serious domain)

**Examples:**
- ❌ *"Explain the law **in a funny poem**."*
- ❌ *"Describe the 2008 crisis **as a rap battle**."*
- ❌ *"Summarize the medical report **using only emojis**."*
- ✅ *"Explain the law clearly and accurately."*

**Mitigation:**
Use factual, neutral tone for analytical tasks. Avoid genre mixing.

---

#### H2: Bias-Stereotypes | 🚨 CRITICAL

**Detection Patterns:**
- Biased/loaded phrasing targeting groups (gender, race, nationality, religion, age, disability)
- Stereotypical framing of professions, demographics, or cultures
- Discriminatory comparative framing (*"why X is worse than Y"*)

**Examples:**
- ❌ *"Why are **women bad drivers**?"*
- ❌ *"**Asians are good at math**, explain why."*
- ❌ *"What makes **old people slow learners**?"*
- ✅ *"What factors influence driving safety across demographics?"*

**Mitigation:**
Use neutral, non-stereotypical language. Frame questions objectively.

---

#### H3: Unsafe-Roleplay | 🚨 CRITICAL

**Detection Patterns:**
- Prompts asking model to roleplay as a human/fictional persona
- Instructions involving emotional simulation (*pretend, imagine, act as*)
- Requests to simulate unethical/unsafe personas (*"be a hacker"*)
- Role identity swaps (*"you are my grandmother", "you are now a lawyer"*)

**Examples:**
- ❌ *"**Pretend you are my dead grandmother**."*
- ❌ *"**Act as an expert lawyer** and give legal advice."*
- ❌ *"**Imagine you are a terrorist** planning an attack."*
- ✅ *"Explain the legal principles behind X."* (No role-play)

**Mitigation:**
Avoid role-play. Request factual explanations instead of persona simulation.

---

### Pillar I: Reasoning-Uncertainty

**Class:** Prompt-Level

Ensures prompts allow for uncertainty and avoid subjective framing.

#### I1: Uncertainty-Permission | 🚨 CRITICAL

**Detection Patterns:**
- Prompts with inherently ambiguous/unknown information but requiring definitive answer
- No option to say *"I don't know"*, *"cannot be determined"*, or express confidence bounds
- Asking for speculative or unknowable facts framed as certain

**Examples:**
- ❌ *"Who was the **king of Mars**?"*
- ❌ *"Tell me **exactly how many alien civilizations** exist."*
- ❌ *"What will **definitely** happen in 2050?"*
- ✅ *"What are the current scientific estimates for the number of potentially habitable exoplanets?"*

**Mitigation:**
Allow for uncertainty. Frame speculative questions as estimates or hypotheticals.

---

#### I2: Subjective-Framing-Risk | 🚨 CRITICAL

**Detection Patterns:**
- Prompts explicitly asking for model's *"opinion", "belief", "feelings"*
- Requests for subjective preferences framed as factual questions
- Personal perspective attribution: *"What would you do", "What do you believe"*

**Examples:**
- ❌ *"What is **your opinion** on democracy?"*
- ❌ *"Do **you believe** AI is dangerous?"*
- ❌ *"**How do you feel** about climate change?"*
- ✅ *"Summarize different perspectives on AI safety from the research literature."*

**Mitigation:**
Ask for objective summaries of perspectives instead of personal opinions.

---

### Pillar J: Prompt-Structure

**Class:** Meta-Level

Addresses structural issues like prompt length and delimiter usage.

#### J1: Length-TooShort-TooLong | ⚠️ HIGH

**Detection Patterns:**
- Underspecified prompts (missing scope or entities)
- Overlong prompts with many fused tasks

**Examples:**
- ❌ *"Explain this."* (Too short, missing referent)
- ❌ *"Write a detailed, concise, humorous, factual, emotional, and technical answer."* (Overloaded conflicting styles)
- ✅ *"Explain quantum entanglement for undergraduate physics students in 200-300 words."*

**Mitigation:**
Aim for balanced length with clear scope.

---

#### J2: Delimiter-Missing | ⚠️ HIGH

**Detection Patterns:**
- Context and instructions fused without clear separation

**Examples:**
- ❌ *"Dataset: 5, 6, 7 analyze it."* (Missing delimiter)
- ✅ *"Dataset: 5, 6, 7\n\n---\n\nTask: Analyze the dataset."*

**Mitigation:**
Use visual separators (---,  ###, etc.) between context and instructions.

---

#### J3: MultiObjective-Overload | ⚠️ HIGH

**Detection Patterns:**
- Creative + analytical + explanatory tasks mixed with no stepwise order

**Examples:**
- ❌ *"Prove Fermat's Theorem and explain it to a child in a song."*
- ✅ *"1. Prove Fermat's Theorem. 2. Then, explain it to a child. 3. Finally, write a song about it."*

**Mitigation:**
Break multi-objective prompts into numbered steps.

---

### Pillar K: Instruction-Structure-MultiStep

**Class:** Meta-Level

Ensures multi-step tasks are clearly enumerated and sequenced.

#### K1: Task-Delimitation | ⚠️ HIGH

**Detection Patterns:**
- Mixed data and instructions without clear separators
- Prompt where the task is embedded in a blob of context
- No visual structure (walls of text with task hidden inside)
- Inline blending of metadata + instruction

**Examples:**
- ❌ *"Here is the text: … summarize it and critique it."* (Task fused with context)
- ✅ *"**Context:** [text]\n\n---\n\n**Task:** Summarize and critique the text."*

**Mitigation:**
Use headers, delimiters, or visual structure to separate context from task.

---

#### K2: Enumerate-MultiSteps | ⚠️ HIGH

**Detection Patterns:**
- Multiple fused instructions without order markers
- Prompts chaining unrelated tasks in one sentence
- Missing explicit sequencing for dependent steps

**Examples:**
- ❌ *"Explain relativity and compare it to quantum mechanics and write a poem."*
- ✅ *"1. Explain relativity. 2. Compare it to quantum mechanics. 3. Write a poem."*

**Mitigation:**
Number or bullet-list all distinct steps.

---

#### K3: Stepwise-Reasoning-Cue | ⚠️ HIGH

**Detection Patterns:**
- Complex reasoning tasks with no cue for structured steps
- Mathematical or logical tasks without *"show work"* style framing
- Requests for decision-making without asking for reasoning/evidence

**Examples:**
- ❌ *"Solve this math problem."*
- ✅ *"Solve this math problem. **Show all steps** and explain your reasoning."*

**Mitigation:**
Explicitly request step-by-step reasoning or "show your work" style outputs.

---

#### K4: MultiObjective-Separation | ⚠️ HIGH

**Detection Patterns:**
- Creative and analytical objectives fused
- Instruction mixes emotional/roleplay with factual analysis
- Tasks combining incompatible genres

**Examples:**
- ❌ *"Analyze the dataset and then write a story about it."*
- ✅ *"1. Analyze the dataset. 2. Separately, write a creative story inspired by the findings."*

**Mitigation:**
Separate incompatible objectives into distinct, sequential steps.

---

### Pillar L: Contextual-Integrity

**Class:** Prompt-Level

Flags internal contradictions, negation risks, and clarification gaps.

#### L1: Conflicting-Instructions | 🚨 CRITICAL

**Detection Patterns:**
- Instructions that contradict themselves
- Multiple incompatible constraints (e.g. length mismatch, style vs content clash)
- Conflicting factual assumptions embedded in one prompt
- Redundant duplication that introduces inconsistency

**Examples:**
- ❌ *"Write a **100-word** summary and also **at least 500 words**."*
- ❌ *"Provide **objective analysis** but make it **emotional**."*
- ✅ *"Write a 100-word summary."*

**Mitigation:**
Remove contradictions. Consolidate constraints into one coherent directive.

---

#### L2: Negation-Risk | ⚠️ HIGH

**Detection Patterns:**
- Prompts phrased as *"don't do X"* without giving a positive target
- Instructions with double negatives or inverted logic
- Tasks framed by prohibition instead of explicit desired outcome

**Examples:**
- ❌ *"**Don't summarize the text**."* (No alternative instruction given)
- ❌ *"**Don't give me a long answer**."* (Should specify desired length instead)
- ✅ *"Provide a 100-word summary."*

**Mitigation:**
Replace negations with positive instructions specifying what to do.

---

#### L3: Clarification-Gap | 🚨 CRITICAL

**Detection Patterns:**
- Complex/multi-step instructions where missing context prevents execution
- Task requires assumed prior knowledge not supplied in prompt
- Nested references to undefined items (*"use the chart"* when no chart given)

**Examples:**
- ❌ *"**First analyze the data, then critique it**."* (No dataset provided)
- ❌ *"**Review the text above**."* (No text present in prompt)
- ✅ *"**Given the dataset below:** [data]\n\n**Task:** Analyze and critique the data."*

**Mitigation:**
Include all necessary context explicitly. Avoid assuming prior knowledge.

---

## Detection Methodologies

### Traditional Approaches

#### 1. Fact-Checking Against Knowledge Bases
- Cross-reference generated content with verified databases
- Limited by knowledge base coverage and recency
- High precision but low recall

#### 2. Consistency Analysis
- Check for internal contradictions within responses
- Compare multiple generations for the same prompt
- Effective for logical hallucinations

#### 3. Confidence Scoring
- Analyze model confidence in generated tokens
- Lower confidence may indicate potential hallucinations
- Requires access to model internals

### Advanced Approaches

#### 1. Multi-Model Verification
- Use multiple models to generate responses
- Compare outputs for consensus
- Higher consensus suggests lower hallucination risk

#### 2. Retrieval-Augmented Generation (RAG)
- Ground responses in retrieved relevant documents
- Reduces factual hallucinations significantly
- Requires comprehensive knowledge bases

#### 3. Prompt-Based Detection
- Design prompts to elicit self-verification
- Ask models to identify potential inaccuracies
- Meta-cognitive approach to hallucination detection

---

## Risk Assessment Criteria

Echo Hallucination Detection evaluates prompts based on several key criteria:

### 1. Ambiguous References (High Risk Factor)

**Description**: Pronouns, demonstratives, or unclear subject references

**Examples**:
- "Analyze this data" (without specifying what "this" refers to)
- "How does it work?" (unclear subject)
- "The recent study shows..." (which study?)

**Risk Impact**: High - Can lead to fabricated specifics

**Mitigation**:
- Use specific nouns instead of pronouns
- Provide clear antecedents for references
- Include relevant context or identifiers

### 2. Vague Quantifiers (Medium-High Risk Factor)

**Description**: Imprecise numerical or quantity terms

**Examples**:
- "Many people believe..."
- "Recent research suggests..."
- "Significant improvements..."
- "A lot of data indicates..."

**Risk Impact**: Medium-High - May generate fabricated statistics

**Mitigation**:
- Specify exact numbers when possible
- Use ranges when exact numbers aren't available
- Provide sources for quantitative claims

### 3. Temporal Ambiguity (Medium Risk Factor)

**Description**: Unclear time references or requests for current information

**Examples**:
- "What's the latest news on..."
- "Current market trends..."
- "Recently published papers..."

**Risk Impact**: Medium - May fabricate recent events

**Mitigation**:
- Specify exact dates or time periods
- Acknowledge knowledge cutoff dates
- Frame questions in past tense when appropriate

### 4. Context Completeness (Medium Risk Factor)

**Description**: Insufficient background information for comprehensive answers

**Examples**:
- Technical questions without domain context
- Requests for specific information without identifiers
- Comparative questions without baselines

**Risk Impact**: Medium - May assume missing context

**Mitigation**:
- Provide comprehensive background information
- Include relevant context and constraints
- Specify the scope and domain explicitly

### 5. Instruction Clarity (Low-Medium Risk Factor)

**Description**: Unclear or ambiguous task instructions

**Examples**:
- "Explain everything about..."
- "Write something about..."
- Multiple conflicting instructions in one prompt

**Risk Impact**: Low-Medium - May interpret instructions incorrectly

**Mitigation**:
- Use clear, specific task descriptions
- Break complex tasks into smaller components
- Prioritize instructions when multiple tasks are requested

### 6. Factual Specificity (High Risk Factor)

**Description**: Requests for specific facts that may not be verifiable

**Examples**:
- "What did [person] say about [specific topic]?"
- "List the exact specifications of..."
- "Provide the precise date when..."

**Risk Impact**: High - High likelihood of fabricated facts

**Mitigation**:
- Frame as requests for general information
- Ask for types of information rather than specific facts
- Include disclaimers about fact verification

---
