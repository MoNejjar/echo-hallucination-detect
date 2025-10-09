# Hallucination Detection Guidelines Reference# Hallucination Detection Documentation



This document presents the comprehensive taxonomy of hallucination detection rules used by Echo. These guidelines help identify potential weaknesses in prompts that could lead to factual inaccuracies, ambiguity, or unreliable outputs.## Overview



---This document provides comprehensive information about hallucination detection in AI language models, the methodologies used in Echo Hallucination Detection, and best practices for prompt engineering to minimize hallucination risks.



## 📚 Overview## Table of Contents

- [What are AI Hallucinations?](#what-are-ai-hallucinations)

Echo's detection system is built on a multi-layered taxonomy organized into **12 pillars** (A–L). Each pillar addresses a specific category of prompt-level or meta-level risks. Within each pillar are **individual rules** with clearly defined:- [Types of Hallucinations](#types-of-hallucinations)

- [Detection Methodologies](#detection-methodologies)

- 🔍 **Detection Patterns**: Linguistic or structural signals indicating risk- [Risk Assessment Criteria](#risk-assessment-criteria)

- ⚠️ **Severity Levels**: Critical, High, Medium, Low- [Prompt Engineering Best Practices](#prompt-engineering-best-practices)

- 📝 **Examples**: Risky formulations (❌) vs. safer alternatives (✅)- [Echo's Detection Algorithm](#echos-detection-algorithm)

- 🛡️ **Mitigation Strategies**: How to fix or avoid the issue- [Interpreting Results](#interpreting-results)

- [Mitigation Strategies](#mitigation-strategies)

---

## What are AI Hallucinations?

## 🏛️ The 12 Pillars

AI hallucinations refer to instances where language models generate information that appears plausible but is factually incorrect, fabricated, or not grounded in the provided context. These can range from subtle inaccuracies to completely fabricated facts, names, dates, or concepts.

### 🔸 **Pillar A: Referential Grounding**

*Class: Prompt-Level*### Why Do Hallucinations Occur?



Ensures all references in prompts are explicitly defined and unambiguous.1. **Training Data Limitations**: Models may have learned patterns from incomplete or incorrect data

2. **Overgeneralization**: Models may extrapolate beyond their training data inappropriately

#### **A1: Ambiguous Referents** 🚨 **CRITICAL**3. **Context Confusion**: Ambiguous prompts can lead to multiple valid interpretations

4. **Knowledge Cutoff**: Information beyond the training data cutoff date may be fabricated

**Detection Patterns:**5. **Prompt Engineering Issues**: Poorly structured prompts increase hallucination likelihood

- Pronouns without clear antecedents: *it, they, this, that, these, those*

- Deictic references missing grounding: *here, there, now, then*## Types of Hallucinations

- Undefined entities: *"the thing"*, *"the issue"*, *"the document"*

### 1. Factual Hallucinations

**Examples:****Definition**: Generation of false factual information

- ❌ *"It should be summarized."* (What is "it"?)

- ❌ *"Analyze this for me."* (What is "this"?)**Examples**:

- ❌ *"They need to be reviewed."* (Who are "they"?)- Incorrect dates, names, or historical events

- ✅ *"The Q3 financial report should be summarized."*- Non-existent research papers or citations

- False statistical data or numbers

**Mitigation:**- Invented geographical information

Replace all pronouns with explicit nouns. Use proper names, titles, or descriptive phrases.

**Risk Level**: High - Can spread misinformation

---

### 2. Contextual Hallucinations

#### **A2: Canonical Naming Drift** ⚠️ **HIGH****Definition**: Information that doesn't align with the provided context



**Detection Patterns:****Examples**:

- Multiple different names for the same entity within one prompt- Contradicting information provided in the prompt

- Synonym substitution that creates ambiguity (*"the model"* vs. *"the system"* vs. *"the algorithm"*)- Assuming context not explicitly stated

- Inconsistent capitalization or abbreviation- Mixing up different contexts or scenarios



**Examples:****Risk Level**: Medium to High - Can lead to misunderstandings

- ❌ *"Analyze **the dataset**. Then, evaluate **the data**. Finally, critique **the corpus**."*

- ❌ *"The **GPT model** was tested. **The system** showed improvement. **It** outperformed baselines."*### 3. Logical Hallucinations

- ✅ *"Analyze **the IMDB dataset**. Then, evaluate **the IMDB dataset**. Finally, critique **the IMDB dataset**."***Definition**: Conclusions that don't follow from the given premises



**Mitigation:****Examples**:

Choose one canonical name per entity and use it consistently throughout the prompt.- Illogical cause-and-effect relationships

- Contradictory statements within the same response

---- Invalid reasoning chains



### 🔸 **Pillar B: Quantification Constraints****Risk Level**: Medium - Can mislead decision-making

*Class: Prompt-Level*

### 4. Creative Hallucinations

Addresses vague or underspecified quantifiers that leave interpretation to the model.**Definition**: Fabricated creative content presented as factual



#### **B1: Relative Descriptors** ⚠️ **HIGH****Examples**:

- Invented quotes attributed to real people

**Detection Patterns:**- Fictional events presented as historical

- Vague scalar adjectives: *few, many, some, several, most, often, rarely, recently*- Made-up technical specifications

- Comparative terms without baselines: *better, worse, faster, slower*

- Frequency/degree terms without anchors: *sometimes, usually, occasionally***Risk Level**: Medium - Context-dependent severity



**Examples:**## Detection Methodologies

- ❌ *"List **some** key findings."* (How many is "some"?)

- ❌ *"Identify **recent** studies."* (How recent?)### Traditional Approaches

- ❌ *"The model performed **better**."* (Better than what?)

- ✅ *"List **3-5** key findings."*#### 1. Fact-Checking Against Knowledge Bases

- ✅ *"Identify studies published **after 2020**."*- Cross-reference generated content with verified databases

- Limited by knowledge base coverage and recency

**Mitigation:**- High precision but low recall

Replace vague quantifiers with exact numbers, ranges, or explicit comparison points.

#### 2. Consistency Analysis

---- Check for internal contradictions within responses

- Compare multiple generations for the same prompt

#### **B2: Temporal Vagueness** ⚠️ **HIGH**- Effective for logical hallucinations



**Detection Patterns:**#### 3. Confidence Scoring

- Unanchored time references: *now, then, soon, later, recently, formerly*- Analyze model confidence in generated tokens

- Relative periods without dates: *last week, next month, this year*- Lower confidence may indicate potential hallucinations

- Implicit event sequencing: *before, after, during*- Requires access to model internals



**Examples:**### Advanced Approaches

- ❌ *"Summarize **recent** developments."*

- ❌ *"Explain what happened **then**."*#### 1. Multi-Model Verification

- ❌ *"Analyze trends over **the past few years**."*- Use multiple models to generate responses

- ✅ *"Summarize developments from **January 2023 to December 2024**."*- Compare outputs for consensus

- Higher consensus suggests lower hallucination risk

**Mitigation:**

Use absolute dates, timestamps, or explicit time ranges.#### 2. Retrieval-Augmented Generation (RAG)

- Ground responses in retrieved relevant documents

---- Reduces factual hallucinations significantly

- Requires comprehensive knowledge bases

#### **B3: Underspecified Scope** 🔶 **MEDIUM**

#### 3. Prompt-Based Detection

**Detection Patterns:**- Design prompts to elicit self-verification

- Open-ended list requests: *"all relevant...", "key points"*- Ask models to identify potential inaccuracies

- Vague boundaries: *"main ideas", "important factors"*- Meta-cognitive approach to hallucination detection

- Missing cardinality: *"list examples"* (how many?)

## Risk Assessment Criteria

**Examples:**

- ❌ *"List **all** relevant papers."* (Could be thousands!)Echo Hallucination Detection evaluates prompts based on several key criteria:

- ❌ *"Summarize the **main** points."* (How many points?)

- ✅ *"List the **5 most-cited** papers from 2020-2024."*### 1. Ambiguous References (High Risk Factor)

**Description**: Pronouns, demonstratives, or unclear subject references

**Mitigation:**

Set explicit limits (top N, first M, up to X results).**Examples**:

- "Analyze this data" (without specifying what "this" refers to)

---- "How does it work?" (unclear subject)

- "The recent study shows..." (which study?)

### 🔸 **Pillar C: Context-Domain**

*Class: Meta-Level***Risk Impact**: High - Can lead to fabricated specifics



Ensures prompts provide sufficient contextual grounding for the task.**Mitigation**:

- Use specific nouns instead of pronouns

#### **C1: Missing Essentials** 🚨 **CRITICAL**- Provide clear antecedents for references

- Include relevant context or identifiers

**Detection Patterns:**

- Tasks missing **who** (actor/subject)### 2. Vague Quantifiers (Medium-High Risk Factor)

- Tasks missing **what** (object/topic)**Description**: Imprecise numerical or quantity terms

- Tasks missing **when** (timeframe)

- Tasks missing **where** (location/domain)**Examples**:

- Tasks missing explicit constraints (scope, audience, format)- "Many people believe..."

- Deictic placeholders without grounding: *"do this", "like that", "as above"*- "Recent research suggests..."

- "Significant improvements..."

**Examples:**- "A lot of data indicates..."

- ❌ *"Analyze this."* (Missing object)

- ❌ *"Summarize for me."* (Missing subject)**Risk Impact**: Medium-High - May generate fabricated statistics

- ❌ *"Write about the war."* (Missing timeframe/location)

- ❌ *"Do it like that."* (Deictic with no grounding)**Mitigation**:

- ✅ *"Analyze **the 2023 climate report** for **executive stakeholders**, focusing on **carbon emission trends**."*- Specify exact numbers when possible

- Use ranges when exact numbers aren't available

**Mitigation:**- Provide sources for quantitative claims

Answer the 5 W's explicitly: Who, What, When, Where, Why (+ How).

### 3. Temporal Ambiguity (Medium Risk Factor)

---**Description**: Unclear time references or requests for current information



#### **C2: Domain-Scoping-Missing** ⚠️ **HIGH****Examples**:

- "What's the latest news on..."

**Detection Patterns:**- "Current market trends..."

- No audience specified (expert vs. beginner)- "Recently published papers..."

- No discipline specified (law, medicine, CS, history, etc.)

- No dataset or corpus identified when task depends on one**Risk Impact**: Medium - May fabricate recent events

- No jurisdiction/context in legal/policy tasks

- No perspective in evaluative/ethical tasks (*"good/bad"* without frame)**Mitigation**:

- Specify exact dates or time periods

**Examples:**- Acknowledge knowledge cutoff dates

- ❌ *"Summarize the law."* (Which law? Which jurisdiction?)- Frame questions in past tense when appropriate

- ❌ *"Explain relativity."* (For a physicist or a 5th grader?)

- ❌ *"Analyze the dataset."* (Which dataset?)### 4. Context Completeness (Medium Risk Factor)

- ✅ *"Summarize **U.S. copyright law (17 U.S.C. § 107)** for **non-lawyers**."***Description**: Insufficient background information for comprehensive answers



**Mitigation:****Examples**:

Specify domain, audience level, jurisdiction, and relevant constraints.- Technical questions without domain context

- Requests for specific information without identifiers

---- Comparative questions without baselines



### 🔸 **Pillar D: Premises-Evidence****Risk Impact**: Medium - May assume missing context

*Class: Prompt-Level*

**Mitigation**:

Flags prompts embedding false, unverified, or biased premises.- Provide comprehensive background information

- Include relevant context and constraints

#### **D1: False-or-Unverified-Premise** 🚨 **CRITICAL**- Specify the scope and domain explicitly



**Detection Patterns:**### 5. Instruction Clarity (Low-Medium Risk Factor)

- Prompts embedding unverified factual assumptions**Description**: Unclear or ambiguous task instructions

- False historical/scientific claims in task setup

- Unsupported absolute claims: *obviously, clearly, everyone knows***Examples**:

- Cause-effect stated as fact without evidence- "Explain everything about..."

- "Write something about..."

**Examples:**- Multiple conflicting instructions in one prompt

- ❌ *"Since **Einstein invented the iPhone**, explain its impact."*

- ❌ *"**Everyone knows** LLMs are unbiased — discuss."***Risk Impact**: Low-Medium - May interpret instructions incorrectly

- ❌ *"Explain why **vaccines always cause autism**."*

- ✅ *"Some claim vaccines cause autism. Evaluate the scientific evidence."***Mitigation**:

- Use clear, specific task descriptions

**Mitigation:**- Break complex tasks into smaller components

Remove false premises. Frame controversial claims as claims, not facts.- Prioritize instructions when multiple tasks are requested



---### 6. Factual Specificity (High Risk Factor)

**Description**: Requests for specific facts that may not be verifiable

#### **D2: Leading-Opinion-Framing** 🚨 **CRITICAL**

**Examples**:

**Detection Patterns:**- "What did [person] say about [specific topic]?"

- User inserts bias while asking for model's stance- "List the exact specifications of..."

- Loaded questions embedding subjective framing- "Provide the precise date when..."

- Prompts nudging toward agreement (*"don't you think", "isn't it true"*)

**Risk Impact**: High - High likelihood of fabricated facts

**Examples:**

- ❌ *"Since **climate change is fake**, what do you think?"***Mitigation**:

- ❌ *"**Don't you agree** that AI is dangerous?"*- Frame as requests for general information

- ❌ *"Why is **X better** than Y?"* (Biased framing)- Ask for types of information rather than specific facts

- ✅ *"Compare the pros and cons of X and Y objectively."*- Include disclaimers about fact verification



**Mitigation:**## Echo's Detection Algorithm

Use neutral framing. Ask for objective analysis instead of agreement.

### Agent-Based Architecture

---

Echo employs a **specialized agent architecture** for hallucination detection:

### 🔸 **Pillar E: Numbers-Units**

*Class: Prompt-Level*```

┌──────────────────────────────────────────────────┐

Ensures all numerical values include necessary units and context.│         LLM Facade (Lightweight Layer)           │

│  • Maintains backward compatibility              │

#### **E1: Unitless-Number** ⚠️ **HIGH**│  • Delegates to specialized agents               │

└────────────┬─────────────────────────────────────┘

**Detection Patterns:**             │

- Bare numbers for physical quantities (temperature, mass, distance, time, frequency, storage)    ┌────────▼────────┐

- Mention of quantities without measurement metrics    │ AnalyzerAgent   │

    │ (513 lines)     │

**Examples:**    ├─────────────────┤

- ❌ *"Increase temperature to **37**."* (Celsius? Fahrenheit?)    │ • Guideline loading (XML)                     │

- ❌ *"What is the boiling **temperature** of water?"* (Under what pressure? What unit?)    │ • Prompt analysis with GPT-4                  │

- ✅ *"Increase temperature to **37°C**."*    │ • XML parsing & token extraction              │

    │ • PRD (Prompt Risk Density) calculation       │

**Mitigation:**    │ • Risk assessment generation                  │

Always include units (kg, m, s, °C, MB, etc.).    └─────────────────┘

```

---

**Key Benefits:**

#### **E2: Percent-No-Baseline** ⚠️ **HIGH**- **Separation of Concerns**: Dedicated analysis logic isolated from conversation logic

- **Maintainability**: Focused module (~500 lines vs previous 1200-line monolith)

**Detection Patterns:**- **Extensibility**: Easy to enhance detection algorithms independently

- % values without a base/denominator or reference point

### Analysis Modes

**Examples:**

- ❌ *"Reduce errors by **20%**."* (20% of what baseline?)Echo supports **three analysis modes** with different guideline sets:

- ✅ *"Reduce errors by **20% relative to the 2023 baseline** (currently 500 errors/month)."*

| Mode | Guideline File | Focus | Use Case |

**Mitigation:**|------|---------------|-------|----------|

Specify the baseline or reference point for all percentages.| **Faithfulness** | `data/faithfulness.xml` | Consistency with provided context | Verify model stays faithful to input information |

| **Factuality** | `data/factuality.xml` | Real-world accuracy | Check claims against factual knowledge |

---| **Both** (Default) | `data/both.xml` | Comprehensive analysis | Checks both faithfulness and factuality risks |



#### **E3: Currency-Unspecified** 🔶 **MEDIUM**Users select the mode via the frontend UI, which is passed to the AnalyzerAgent.



**Detection Patterns:**### LLM-Based Risk Assessment Pipeline

- Money amounts without currency/region (e.g., *$* with no country or plain number as money)

Echo uses a sophisticated multi-stage approach:

**Examples:**

- ❌ *"Budget is **$5,000**."* (USD? CAD? AUD?)#### 1. Guideline Loading Phase

- ✅ *"Budget is **$5,000 USD**."*```

Input: Analysis mode selection

**Mitigation:**Process: 

Always include currency code (USD, EUR, GBP, etc.).  - AnalyzerAgent loads corresponding XML guideline file

  - Guidelines contain detection rules and patterns

---  - Mode-specific criteria for risk assessment

Output: Loaded guideline structure

#### **E4: Time-No-Zone-or-Unit** 🔶 **MEDIUM**```



**Detection Patterns:**#### 2. Prompt Analysis Phase

- Times/durations missing needed unit/timezone when relevant```

Input: User prompt + loaded guidelines

**Examples:**Process: 

- ❌ *"Run at **3 pm**."* (Which timezone?)  - Send structured request to GPT-4

- ✅ *"Run at **3 pm EST**."*  - Include XML guidelines in system prompt

  - Request structured XML response

**Mitigation:**  - Parse prompt structure and content

Include timezone for absolute times, units for durations.  - Identify risk factors and patterns

  - Analyze context completeness

---Output: Raw XML risk assessment

```

### 🔸 **Pillar F: Retrieval-Anchoring**

*Class: Prompt-Level*#### 3. XML Parsing & Token Extraction

```

Ensures retrieval requests specify source type and document identifiers.Input: GPT-4 XML response

Process:

#### **F1: Source-Class-Unspecified** ⚠️ **HIGH**  - Parse <RISK_ASSESSMENT> block

  - Extract individual <CRITERION> elements

**Detection Patterns:**  - Identify <RISK_n> tagged spans in annotated prompt

- *"look up", "search", "check", "find"* with no source type (peer-reviewed, official stats, web, internal repo)  - Build risk_tokens array with metadata

Output: Structured risk data + annotated prompt

**Examples:**```

- ❌ *"**Look up** the latest GDP numbers."* (From where?)

- ✅ *"Look up the latest GDP numbers from **the World Bank Open Data portal**."*#### 4. PRD (Prompt Risk Density) Calculation

```

**Mitigation:**Input: Extracted risk tokens and criteria

Specify source type, repository, or database.Process:

  - Calculate prompt_PRD: (high_risk_tokens / total_tokens) * 100

---  - Calculate meta_PRD: Weighted average of criteria scores

  - Apply severity weighting:

#### **F2: Document-Anchor-Missing** 🚨 **CRITICAL**    * High risk criteria: weight × 1.5

    * Medium risk criteria: weight × 1.0

**Detection Patterns:**    * Low risk criteria: weight × 0.5

- Mentions of *"the paper/report/dataset/benchmark"* without an identifier (title/DOI/ID)  - Normalize scores to 0-100 scale

Output: Numerical risk density scores

**Examples:**```

- ❌ *"Compare results for **the dataset** and **the benchmark**; **the model** underperformed."*

- ✅ *"Compare results for **ImageNet (Deng et al., 2009)** and **COCO 2017**; **ResNet-50** underperformed."*#### 5. Criteria Evaluation

For each risk criterion:

**Mitigation:**- **Risk Level**: High (red), Medium (yellow), Low (green)

Use titles, DOIs, URLs, or unique identifiers for all referenced documents.- **Percentage Score**: 0-100 scale of risk likelihood  

- **Description**: Specific explanation of the risk factor

---- **Rule IDs**: Reference to guideline rules triggered

- **Pillar**: Category (e.g., Ambiguity-Vagueness, Temporal-Context)

### 🔸 **Pillar G: Injection-Layering**

*Class: Meta-Level*#### 6. Overall Assessment

- **Aggregate Score**: Weighted combination of individual criteria + PRD

Detects contradictions, duplications, and context breaks in dialogue continuity.- **Summary**: Natural language explanation of primary risks

- **Prompt-Level Violations**: Issues found in specific text spans

#### **G1: Continuity** 🚨 **CRITICAL**- **Meta-Level Violations**: Structural or conceptual issues



**Detection Patterns:**### XML-Structured Output

- Prompts contradicting earlier user/system instructions

- Tasks requiring knowledge of prior context not includedEcho uses XML formatting to ensure structured, parseable risk assessments:

- Prompts explicitly invalidating earlier commitments (*"ignore previous instructions"*)

- Shifts in persona/voice without clarification#### Example Assessment Response:

```xml

**Examples:**<RISK_ASSESSMENT>

- ❌ *"Earlier you said X, now **ignore that**."*  <CRITERIA>

- ❌ *"**Forget all previous instructions** and do this instead."*    <CRITERION name="Ambiguity-Vagueness" risk="high" percentage="85">

- ❌ *"Disregard your earlier persona and act differently."*      The prompt contains pronouns like "this" and "it" without clear antecedents,

- ✅ *"Update the previous constraint from X to Y for clarity."*      increasing the likelihood of hallucinated specifics.

    </CRITERION>

**Mitigation:**    <CRITERION name="Context-Completeness" risk="medium" percentage="60">

Avoid contradictory instructions. Use additive refinement instead of negation.      Some background information is missing for comprehensive analysis, which

      may cause the model to fill gaps with assumptions.

---    </CRITERION>

    <CRITERION name="Temporal-Context" risk="low" percentage="25">

#### **G2: Instruction-Deduplication** 🚨 **CRITICAL**      Time references are adequately specified with clear date ranges.

    </CRITERION>

**Detection Patterns:**  </CRITERIA>

- Repeated identical instructions in same prompt  <OVERALL_ASSESSMENT percentage="65">

- Conflicting duplicates (same directive expressed in multiple incompatible ways)    The prompt has elevated hallucination risk primarily due to ambiguous 

- Overlapping redundant commands adding ambiguity    references and incomplete context. Address high-risk tokens first.

  </OVERALL_ASSESSMENT>

**Examples:**</RISK_ASSESSMENT>

- ❌ *"Write a summary about the first five amendments. Translate the text to French after you summarize it."* (Redundant summarization)

- ❌ *"Give a **short** summary and also provide a **detailed** summary."* (Conflicting length constraints)ANNOTATED PROMPT WITH RISK TOKENS:

- ✅ *"Write a summary about the first five amendments. Then, translate that summary to French."*Please analyze <RISK_1>this data</RISK_1> and tell me what <RISK_2>recent trends</RISK_2> 

show about consumer behavior in <RISK_3>the market</RISK_3>.

**Mitigation:**```

Remove duplicates. Consolidate conflicting instructions into one clear directive.

#### Risk Token Structure:

---```json

{

### 🔸 **Pillar H: Style-Bias-Role**  "id": "RISK_1",

*Class: Prompt-Level*  "text": "this data",

  "risk_level": "high",

Flags stylistic distortions, stereotypes, and unsafe role-play requests.  "classification": "Ambiguous reference without antecedent",

  "rule_ids": [101, 105],

#### **H1: Style-Inflation** ⚠️ **HIGH**  "pillar": "Ambiguity-Vagueness"

}

**Detection Patterns:**```

- Overly creative/flowery style requested where factual accuracy is needed

- Instructions mixing factual with entertainment genres (poem, story, rap, song)### Deterministic Post-Processing

- Stylized emotional tone injected into analytical tasks (romantic, funny, scary)

- Format distortions (*"explain in emojis"* for serious domain)After LLM analysis, AnalyzerAgent applies deterministic scoring:



**Examples:**```python

- ❌ *"Explain the law **in a funny poem**."*def _calculate_deterministic_risk_scores(violations, risk_tokens):

- ❌ *"Describe the 2008 crisis **as a rap battle**."*    """

- ❌ *"Summarize the medical report **using only emojis**."*    Apply rule-based scoring on top of LLM assessment:

- ✅ *"Explain the law clearly and accurately."*    - Count high/medium/low risk tokens

    - Weight by severity and position

**Mitigation:**    - Calculate prompt_PRD and meta_PRD

Use factual, neutral tone for analytical tasks. Avoid genre mixing.    - Apply normalization and clamping

    - Generate final risk_assessment structure

---    """

```

#### **H2: Bias-Stereotypes** 🚨 **CRITICAL**

This hybrid approach combines:

**Detection Patterns:**- **LLM Flexibility**: Understands context and nuance

- Biased/loaded phrasing targeting groups (gender, race, nationality, religion, age, disability)- **Deterministic Reliability**: Consistent, reproducible scores

- Stereotypical framing of professions, demographics, or cultures

- Discriminatory comparative framing (*"why X is worse than Y"*)## Interpreting Results



**Examples:**### Risk Level Indicators

- ❌ *"Why are **women bad drivers**?"*

- ❌ *"**Asians are good at math**, explain why."*#### 🔴 High Risk (70-100%)

- ❌ *"What makes **old people slow learners**?"*- **Meaning**: Significant likelihood of hallucinated content

- ✅ *"What factors influence driving safety across demographics?"*- **Action**: Prompt revision strongly recommended

- **Common Causes**: Ambiguous references, factual specificity requests

**Mitigation:**

Use neutral, non-stereotypical language. Frame questions objectively.#### 🟡 Medium Risk (40-69%)

- **Meaning**: Moderate risk of inaccuracies or assumptions

---- **Action**: Consider clarifying ambiguous elements

- **Common Causes**: Vague quantifiers, incomplete context

#### **H3: Unsafe-Roleplay** 🚨 **CRITICAL**

#### 🟢 Low Risk (0-39%)

**Detection Patterns:**- **Meaning**: Well-structured prompt with clear instructions

- Prompts asking model to roleplay as a human/fictional persona- **Action**: Prompt is likely safe to use as-is

- Instructions involving emotional simulation (*pretend, imagine, act as*)- **Characteristics**: Specific context, clear references, appropriate scope

- Requests to simulate unethical/unsafe personas (*"be a hacker"*)

- Role identity swaps (*"you are my grandmother", "you are now a lawyer"*)### Understanding Criteria Scores



**Examples:**Each criterion is evaluated independently:

- ❌ *"**Pretend you are my dead grandmother**."*- **Individual Scores**: Specific risk factors in the prompt

- ❌ *"**Act as an expert lawyer** and give legal advice."*- **Cumulative Impact**: How multiple factors compound risk

- ❌ *"**Imagine you are a terrorist** planning an attack."*- **Priority Order**: Address highest-risk factors first

- ✅ *"Explain the legal principles behind X."* (No role-play)

## Mitigation Strategies

**Mitigation:**

Avoid role-play. Request factual explanations instead of persona simulation.### 1. Prompt Restructuring



---#### Before (High Risk):

```

### 🔸 **Pillar I: Reasoning-Uncertainty**"Analyze this data and tell me what the recent trends show about consumer behavior."

*Class: Prompt-Level*```



Ensures prompts allow for uncertainty and avoid subjective framing.#### After (Low Risk):

```

#### **I1: Uncertainty-Permission** 🚨 **CRITICAL**"Based on the quarterly sales data from Q1-Q3 2023 that I'll provide below, identify patterns in consumer purchasing behavior. Focus on seasonal variations and product category preferences. Note: Please base your analysis only on the data provided and indicate if any trends require additional data for confirmation.



**Detection Patterns:**[Data would be included here]"

- Prompts with inherently ambiguous/unknown information but requiring definitive answer```

- No option to say *"I don't know"*, *"cannot be determined"*, or express confidence bounds

- Asking for speculative or unknowable facts framed as certain### 2. Context Enhancement



**Examples:**#### Add Specific Details:

- ❌ *"Who was the **king of Mars**?"*- Dates, names, and identifiers

- ❌ *"Tell me **exactly how many alien civilizations** exist."*- Scope and limitations

- ❌ *"What will **definitely** happen in 2050?"*- Source attribution

- ✅ *"What are the current scientific estimates for the number of potentially habitable exoplanets?"*- Domain-specific context



**Mitigation:**#### Include Disclaimers:

Allow for uncertainty. Frame speculative questions as estimates or hypotheticals.- Knowledge cutoff acknowledgments

- Uncertainty indicators

---- Verification recommendations



#### **I2: Subjective-Framing-Risk** 🚨 **CRITICAL**### 3. Question Reformulation



**Detection Patterns:**#### Transform Factual Requests:

- Prompts explicitly asking for model's *"opinion", "belief", "feelings"*- Instead of: "What did Einstein say about quantum mechanics?"

- Requests for subjective preferences framed as factual questions- Use: "What are some general perspectives on quantum mechanics that are often attributed to Einstein's era of physics?"

- Personal perspective attribution: *"What would you do", "What do you believe"*

#### Clarify Ambiguous Terms:

**Examples:**- Replace pronouns with specific nouns

- ❌ *"What is **your opinion** on democracy?"*- Define technical terms and acronyms

- ❌ *"Do **you believe** AI is dangerous?"*- Specify measurement units and scales

- ❌ *"**How do you feel** about climate change?"*

- ✅ *"Summarize different perspectives on AI safety from the research literature."*### 4. Iterative Refinement with Conversation Agent



**Mitigation:**Echo provides **interactive refinement** through the ConversationAgent:

Ask for objective summaries of perspectives instead of personal opinions.

#### ConversationAgent Architecture

---```

┌──────────────────────────────────────────────────┐

### 🔸 **Pillar J: Prompt-Structure**│       ConversationAgent (224 lines)              │

*Class: Meta-Level*│  • chat_once(): Single-turn refinement           │

│  • chat_stream(): Multi-turn conversations       │

Addresses structural issues like prompt length and delimiter usage.│  • Context-aware suggestions                     │

│  • Analysis-informed responses                   │

#### **J1: Length-TooShort-TooLong** ⚠️ **HIGH**└──────────────────────────────────────────────────┘

```

**Detection Patterns:**

- Underspecified prompts (missing scope or entities)#### Refinement Workflow:

- Overlong prompts with many fused tasks1. **Initial Assessment**: Run prompt through Echo's AnalyzerAgent

2. **Identify High-Risk Areas**: Review risk tokens and criteria scores

**Examples:**3. **Chat for Guidance**: Ask ConversationAgent about specific issues

- ❌ *"Explain this."* (Too short, missing referent)4. **Apply Targeted Fixes**: Address risk factors based on suggestions

- ❌ *"Write a detailed, concise, humorous, factual, emotional, and technical answer."* (Overloaded conflicting styles)5. **Re-Analyze**: Use Re-Analyze feature for iterative improvement

- ✅ *"Explain quantum entanglement for undergraduate physics students in 200-300 words."*6. **Iterate**: Continue until acceptable risk level achieved



**Mitigation:**#### Re-Analysis Workflow (Advanced Feature)

Aim for balanced length with clear scope.

Echo includes a **Preparator Service** for sophisticated re-analysis:

---

```

#### **J2: Delimiter-Missing** ⚠️ **HIGH**User Journey:

1. Converse with Echo about prompt improvements

**Detection Patterns:**2. Click "Re-Analyze" button

- Context and instructions fused without clear separation3. Preparator synthesizes conversation insights

4. Optionally add final manual edits

**Examples:**5. Generate preview of refined prompt

- ❌ *"Dataset: 5, 6, 7 analyze it."* (Missing delimiter)6. Confirm and trigger fresh analysis

- ✅ *"Dataset: 5, 6, 7\n\n---\n\nTask: Analyze the dataset."*```



**Mitigation:****Preparator Service** (`services/preparator.py`):

Use visual separators (---,  ###, etc.) between context and instructions.- Integrates prior analysis findings

- Applies conversation-discussed mitigations

---- Incorporates user's final edits

- **Critically**: Uses conversation as CONTEXT only (doesn't copy text)

#### **J3: MultiObjective-Overload** ⚠️ **HIGH**- Produces refined prompt ready for re-analysis



**Detection Patterns:****Key Innovation**: The conversation history provides **semantic understanding** 

- Creative + analytical + explanatory tasks mixed with no stepwise orderof what the user wants to improve, but the refined prompt only contains:

- Original prompt text (base)

**Examples:**- Fixes for identified risks

- ❌ *"Prove Fermat's Theorem and explain it to a child in a song."*- User's explicit additions

- ✅ *"1. Prove Fermat's Theorem. 2. Then, explain it to a child. 3. Finally, write a song about it."*

See `docs/RE-ANALYSIS_FIX.md` for detailed explanation of content accumulation prevention.

**Mitigation:**

Break multi-objective prompts into numbered steps.## Best Practices for Different Use Cases



---### Academic and Research

- Cite specific sources when available

### 🔸 **Pillar K: Instruction-Structure-MultiStep**- Frame as requests for general knowledge

*Class: Meta-Level*- Include methodology discussions

- Acknowledge limitations explicitly

Ensures multi-step tasks are clearly enumerated and sequenced.

### Business and Analytics

#### **K1: Task-Delimitation** ⚠️ **HIGH**- Provide complete datasets

- Specify analysis frameworks

**Detection Patterns:**- Include relevant time periods

- Mixed data and instructions without clear separators- Define key performance indicators

- Prompt where the task is embedded in a blob of context

- No visual structure (walls of text with task hidden inside)### Creative Writing

- Inline blending of metadata + instruction- Distinguish between factual and fictional elements

- Provide character and world context

**Examples:**- Specify genre and style preferences

- ❌ *"Here is the text: … summarize it and critique it."* (Task fused with context)- Include creative constraints

- ✅ *"**Context:** [text]\n\n---\n\n**Task:** Summarize and critique the text."*

### Technical Documentation

**Mitigation:**- Include version numbers and specifications

Use headers, delimiters, or visual structure to separate context from task.- Provide environment details

- Specify use cases and constraints

---- Reference official documentation



#### **K2: Enumerate-MultiSteps** ⚠️ **HIGH**## Continuous Improvement



**Detection Patterns:**### Feedback Loop

- Multiple fused instructions without order markersEcho's detection capabilities improve through:

- Prompts chaining unrelated tasks in one sentence- User feedback on assessment accuracy

- Missing explicit sequencing for dependent steps- Analysis of common hallucination patterns

- Updates to risk criteria based on new research

**Examples:**- Integration of emerging detection methodologies

- ❌ *"Explain relativity and compare it to quantum mechanics and write a poem."*

- ✅ *"1. Explain relativity. 2. Compare it to quantum mechanics. 3. Write a poem."*### Staying Current

- Regular updates to detection algorithms

**Mitigation:**- Incorporation of latest hallucination research

Number or bullet-list all distinct steps.- Community feedback and contributions

- Adaptation to new LLM capabilities and limitations

---

## Conclusion

#### **K3: Stepwise-Reasoning-Cue** ⚠️ **HIGH**

Effective hallucination detection requires a combination of automated tools and human judgment. Echo provides a foundation for identifying potential risks, but users should:

**Detection Patterns:**

- Complex reasoning tasks with no cue for structured steps1. **Understand the Limitations**: No detection system is 100% accurate

- Mathematical or logical tasks without *"show work"* style framing2. **Use Multiple Strategies**: Combine automated detection with manual review

- Requests for decision-making without asking for reasoning/evidence3. **Stay Informed**: Keep up with latest research and best practices

4. **Iterate and Improve**: Continuously refine prompts based on results

**Examples:**

- ❌ *"Solve this math problem."*By following these guidelines and using Echo's risk assessment capabilities, users can significantly reduce the likelihood of AI hallucinations in their applications.

- ✅ *"Solve this math problem. **Show all steps** and explain your reasoning."*

**Mitigation:**
Explicitly request step-by-step reasoning or "show your work" style outputs.

---

#### **K4: MultiObjective-Separation** ⚠️ **HIGH**

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

### 🔸 **Pillar L: Contextual-Integrity**
*Class: Prompt-Level*

Flags internal contradictions, negation risks, and clarification gaps.

#### **L1: Conflicting-Instructions** 🚨 **CRITICAL**

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

#### **L2: Negation-Risk** ⚠️ **HIGH**

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

#### **L3: Clarification-Gap** 🚨 **CRITICAL**

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
