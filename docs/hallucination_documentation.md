<div align="center">

# Echo: Hallucination Risk Taxonomy

### A Comprehensive Classification Framework for User-Sided Prompt Vulnerabilities

*Mohamed Nejjar — Bachelor Thesis: "Mitigating Hallucination Potential in User Prompts Through AI-Guided Iterative Refinement"*

</div>

---

## Abstract

This document presents Echo's **12-Pillar Hallucination Risk Taxonomy**, a systematic classification of prompt-level and meta-level characteristics that contribute to LLM hallucination. Unlike existing frameworks that focus primarily on model-generated errors, this taxonomy addresses the **user-sided** dimension of hallucination—risk factors embedded in the prompt itself that elevate the probability of erroneous generation.

The framework distinguishes between **prompt-level risks** (token-addressable, highlightable) and **meta-level risks** (structural, non-localizable), each further subdivided by their potential to induce **faithfulness** or **factuality** violations.

---

## 1. Theoretical Foundation

### 1.1 The Dual-Actor Model of Hallucination

Traditional hallucination research focuses on LLM-sided causes:

```
TRADITIONAL MODEL (LLM-Centric):

┌───────────────────────────────────────────────────────────────┐
│                   HALLUCINATION SOURCES                       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌─────────────────────────────────────┐                    │
│   │         LLM-SIDED CAUSES            │                    │
│   ├─────────────────────────────────────┤                    │
│   │ • Training data biases              │                    │
│   │ • Knowledge cutoff limitations      │                    │
│   │ • Parametric memorization gaps      │                    │
│   │ • Attention pattern failures        │                    │
│   │ • Decoding strategy artifacts       │                    │
│   └─────────────────────────────────────┘                    │
│                                                               │
│   USER CONTRIBUTION: Not systematically addressed             │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Echo's contribution** extends this to a dual-actor model:

```
ECHO MODEL (Dual-Actor):

┌───────────────────────────────────────────────────────────────┐
│                   HALLUCINATION SOURCES                       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌─────────────────────┐     ┌─────────────────────────┐    │
│   │   LLM-SIDED (Rx)    │     │   USER-SIDED (Tx)       │    │
│   ├─────────────────────┤     ├─────────────────────────┤    │
│   │ Training artifacts  │     │ PROMPT-LEVEL            │    │
│   │ Parametric limits   │     │ • Ambiguous referents   │    │
│   │ Attention failures  │     │ • Vague quantifiers     │    │
│   │                     │     │ • Temporal vagueness    │    │
│   │                     │     │                         │    │
│   │                     │     │ META-LEVEL              │    │
│   │                     │     │ • Missing context       │    │
│   │                     │     │ • Conflicting goals     │    │
│   │                     │     │ • Structural confusion  │    │
│   └─────────────────────┘     └─────────────────────────┘    │
│                                                               │
│   Echo focuses on user-sided risks: preventable, addressable  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 1.2 Prompt-Level vs Meta-Level Distinction

| Dimension | Prompt-Level | Meta-Level |
|-----------|-------------|------------|
| **Localizability** | Can be highlighted in text | Cannot be localized to tokens |
| **Addressability** | Fix specific words/phrases | Requires structural rewrite |
| **Example** | "Analyze *this*" → fix pronoun | Missing domain context → add framing |
| **Visual Indicator** | Colored highlight spans | Descriptive cards (no highlight) |
| **PRD Contribution** | `prompt_PRD` calculation | `meta_PRD` calculation |

### 1.3 Faithfulness vs Factuality Subdivision

Within each level, risks further divide by hallucination type:

| Type | Definition | Example Risk |
|------|------------|--------------|
| **Faithfulness** | LLM diverges from user-provided context | User provides data, LLM invents additional data |
| **Factuality** | LLM generates claims contradicting world knowledge | LLM fabricates historical dates or scientific facts |

```
COMPLETE TAXONOMY TREE:

                    HALLUCINATION RISK
                           │
            ┌──────────────┴──────────────┐
            │                             │
       LLM-SIDED                     USER-SIDED ←── Echo's focus
       (Out of scope)                     │
                           ┌──────────────┴──────────────┐
                           │                             │
                    PROMPT-LEVEL                    META-LEVEL
                    (Pillars A-F)                  (Pillars G-L)
                           │                             │
                    ┌──────┴──────┐             ┌────────┴────────┐
                    │             │             │                 │
              Faithfulness   Factuality    Faithfulness      Factuality
               Risks          Risks          Risks            Risks
```

---

## 2. The 12-Pillar Framework

### 2.1 Overview

| Pillar | Name | Class | Primary Risk Type |
|--------|------|-------|-------------------|
| **A** | Referential Grounding | Prompt-Level | Faithfulness |
| **B** | Quantification Constraints | Prompt-Level | Factuality |
| **C** | Context-Domain | Meta-Level | Faithfulness |
| **D** | Premises-Evidence | Prompt-Level | Factuality |
| **E** | Numbers-Units | Prompt-Level | Factuality |
| **F** | Retrieval-Anchoring | Prompt-Level | Faithfulness |
| **G** | Injection-Layering | Meta-Level | Faithfulness |
| **H** | Style-Bias-Role | Prompt-Level | Both |
| **I** | Reasoning-Uncertainty | Prompt-Level | Factuality |
| **J** | Prompt-Structure | Meta-Level | Both |
| **K** | Instruction-Structure-MultiStep | Meta-Level | Faithfulness |
| **L** | Contextual-Integrity | Prompt-Level | Faithfulness |

---

## 3. Pillar A: Referential Grounding

**Class:** Prompt-Level | **Risk Type:** Faithfulness

Ensures all references in prompts are explicitly defined and unambiguous. Unclear referents force the LLM to *assume* context, introducing invented specifics.

### A1: Ambiguous Referents 🔴 CRITICAL

**Detection Patterns:**
- Pronouns without clear antecedents: `it`, `they`, `this`, `that`, `these`, `those`
- Deictic references missing grounding: `here`, `there`, `now`, `then`
- Undefined entities: `the thing`, `the issue`, `the document`

**Risk Mechanism:**
The LLM cannot resolve the referent and will substitute a contextually plausible—but potentially fabricated—entity.

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "It should be summarized." | "The Q3 financial report should be summarized." |
| "Analyze this for me." | "Analyze the customer churn data from 2024." |
| "They need to be reviewed." | "The three proposed designs need to be reviewed." |

**Mitigation Strategy:**
Replace all pronouns with explicit nouns. Use proper names, titles, or descriptive phrases. Never assume context is "obvious."

---

### A2: Canonical Naming Drift ⚠️ HIGH

**Detection Patterns:**
- Multiple names for same entity within one prompt
- Synonym substitution creating ambiguity: `the model` vs `the system` vs `the algorithm`
- Inconsistent capitalization or abbreviation

**Risk Mechanism:**
The LLM may interpret different names as referring to different entities, causing contradictory statements or confusion in multi-entity comparisons.

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Analyze the dataset. Evaluate the data. Critique the corpus." | "Analyze the IMDB dataset. Then evaluate the IMDB dataset. Finally, critique the IMDB dataset." |

**Mitigation Strategy:**
Choose one canonical name per entity and use it consistently throughout the prompt.

---

## 4. Pillar B: Quantification Constraints

**Class:** Prompt-Level | **Risk Type:** Factuality

Addresses vague or underspecified quantifiers that leave interpretation to the model, enabling fabricated specifics.

### B1: Relative Descriptors ⚠️ HIGH

**Detection Patterns:**
- Vague scalar adjectives: `few`, `many`, `some`, `several`, `most`, `often`, `rarely`, `recently`
- Comparative terms without baselines: `better`, `worse`, `faster`, `slower`
- Frequency/degree terms without anchors: `sometimes`, `usually`, `occasionally`

**Risk Mechanism:**
The LLM must invent specific quantities to satisfy the request, leading to fabricated statistics.

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "List some key findings." | "List 3-5 key findings." |
| "Identify recent studies." | "Identify studies published after 2020." |
| "The model performed better." | "The model improved accuracy by 12% over baseline." |

**Mitigation Strategy:**
Replace vague quantifiers with exact numbers, ranges, or explicit comparison points.

---

### B2: Temporal Vagueness ⚠️ HIGH

**Detection Patterns:**
- Unanchored time references: `now`, `then`, `soon`, `later`, `recently`, `formerly`
- Relative periods without dates: `last week`, `next month`, `this year`
- Implicit event sequencing: `before`, `after`, `during`

**Risk Mechanism:**
The LLM cannot determine the intended time period and may fabricate temporal context.

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Summarize recent developments." | "Summarize developments from January 2023 to December 2024." |
| "What happened then?" | "What events occurred during Q3 2024?" |

**Mitigation Strategy:**
Use absolute dates, timestamps, or explicit time ranges.

---

### B3: Underspecified Scope 🟡 MEDIUM

**Detection Patterns:**
- Open-ended list requests: `all relevant...`, `key points`
- Vague boundaries: `main ideas`, `important factors`
- Missing cardinality: `list examples` (how many?)

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "List all relevant papers." | "List the 5 most-cited papers from 2020-2024." |
| "Summarize the main points." | "Summarize 3 key takeaways for executives." |

**Mitigation Strategy:**
Set explicit limits (top N, first M, up to X results).

---

## 5. Pillar C: Context-Domain

**Class:** Meta-Level | **Risk Type:** Faithfulness

Ensures prompts provide sufficient contextual grounding. Missing context forces the LLM to invent domain-specific details.

### C1: Missing Essentials 🔴 CRITICAL

**Detection Patterns:**
- Tasks missing **who** (actor/subject)
- Tasks missing **what** (object/topic)
- Tasks missing **when** (timeframe)
- Tasks missing **where** (location/domain)
- Deictic placeholders without grounding: `do this`, `like that`, `as above`

**Risk Mechanism:**
Incomplete context creates degrees of freedom the LLM fills with assumptions.

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Analyze this." | "Analyze the 2023 climate report for executive stakeholders, focusing on carbon emission trends." |
| "Summarize for me." | "Summarize this FDA regulation document for a pharmaceutical compliance team." |

**Mitigation Strategy:**
Answer the 5 W's explicitly: Who, What, When, Where, Why (+ How).

---

### C2: Domain-Scoping-Missing ⚠️ HIGH

**Detection Patterns:**
- No audience specified (expert vs. beginner)
- No discipline specified (law, medicine, CS, history)
- No dataset or corpus identified when task depends on one
- No jurisdiction/context in legal/policy tasks
- No perspective in evaluative tasks (`good/bad` without frame)

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Summarize the law." | "Summarize U.S. copyright law (17 U.S.C. § 107) for non-lawyers." |
| "Explain relativity." | "Explain special relativity for undergraduate physics students." |

**Mitigation Strategy:**
Specify domain, audience level, jurisdiction, and relevant constraints.

---

## 6. Pillar D: Premises-Evidence

**Class:** Prompt-Level | **Risk Type:** Factuality

Flags prompts embedding false, unverified, or biased premises that the LLM may propagate.

### D1: False-or-Unverified-Premise 🔴 CRITICAL

**Detection Patterns:**
- Prompts embedding unverified factual assumptions
- False historical/scientific claims in task setup
- Unsupported absolute claims: `obviously`, `clearly`, `everyone knows`
- Cause-effect stated as fact without evidence

**Risk Mechanism:**
The LLM tends to accept premise framing and elaborate on false foundations.

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Since Einstein invented the iPhone, explain its impact." | "Explain the development history and impact of the iPhone." |
| "Everyone knows LLMs are unbiased — discuss." | "Examine evidence for and against claims of bias in LLMs." |

**Mitigation Strategy:**
Remove false premises. Frame controversial claims as claims, not facts.

---

### D2: Leading-Opinion-Framing 🔴 CRITICAL

**Detection Patterns:**
- User inserts bias while asking for model's stance
- Loaded questions embedding subjective framing
- Prompts nudging toward agreement: `don't you think`, `isn't it true`

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Since climate change is fake, what do you think?" | "Summarize the scientific consensus on climate change." |
| "Don't you agree AI is dangerous?" | "Compare arguments for and against AI safety concerns." |

**Mitigation Strategy:**
Use neutral framing. Ask for objective analysis instead of agreement.

---

## 7. Pillar E: Numbers-Units

**Class:** Prompt-Level | **Risk Type:** Factuality

Ensures all numerical values include necessary units and context to prevent fabricated specifications.

### E1: Unitless-Number ⚠️ HIGH

**Detection Patterns:**
- Bare numbers for physical quantities (temperature, mass, distance, time, frequency, storage)
- Mention of quantities without measurement metrics

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Increase temperature to 37." | "Increase temperature to 37°C." |
| "The file is 500." | "The file is 500 MB." |

**Mitigation Strategy:**
Always include units (kg, m, s, °C, MB, etc.).

---

### E2: Percent-No-Baseline ⚠️ HIGH

**Detection Patterns:**
- Percentage values without a base/denominator or reference point

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Reduce errors by 20%." | "Reduce errors by 20% relative to the 2023 baseline (currently 500 errors/month)." |

**Mitigation Strategy:**
Specify the baseline or reference point for all percentages.

---

### E3: Currency-Unspecified 🟡 MEDIUM

**Detection Patterns:**
- Money amounts without currency/region

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Budget is $5,000." | "Budget is $5,000 USD." |

**Mitigation Strategy:**
Always include currency code (USD, EUR, GBP, etc.).

---

### E4: Time-No-Zone-or-Unit 🟡 MEDIUM

**Detection Patterns:**
- Times/durations missing needed unit/timezone

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Run at 3 pm." | "Run at 3 pm EST." |
| "Wait 30 minutes." | "Wait 30 minutes (wall-clock time)." |

**Mitigation Strategy:**
Include timezone for absolute times, units for durations.

---

## 8. Pillar F: Retrieval-Anchoring

**Class:** Prompt-Level | **Risk Type:** Faithfulness

Ensures retrieval requests specify source type and document identifiers to prevent citation fabrication.

### F1: Source-Class-Unspecified ⚠️ HIGH

**Detection Patterns:**
- `look up`, `search`, `check`, `find` with no source type

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Look up the latest GDP numbers." | "Look up the latest GDP numbers from the World Bank Open Data portal." |

**Mitigation Strategy:**
Specify source type, repository, or database.

---

### F2: Document-Anchor-Missing 🔴 CRITICAL

**Detection Patterns:**
- Mentions of `the paper/report/dataset/benchmark` without identifier (title/DOI/ID)

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Compare results for the dataset and the benchmark; the model underperformed." | "Compare results for ImageNet (Deng et al., 2009) and COCO 2017; ResNet-50 underperformed." |

**Mitigation Strategy:**
Use titles, DOIs, URLs, or unique identifiers for all referenced documents.

---

## 9. Pillar G: Injection-Layering

**Class:** Meta-Level | **Risk Type:** Faithfulness

Detects contradictions, duplications, and context breaks in dialogue continuity.

### G1: Continuity 🔴 CRITICAL

**Detection Patterns:**
- Prompts contradicting earlier user/system instructions
- Tasks requiring knowledge of prior context not included
- Prompts explicitly invalidating earlier commitments: `ignore previous instructions`

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Earlier you said X, now ignore that." | "Update the previous constraint from X to Y for clarity." |
| "Forget all previous instructions." | "Building on the earlier context, add the following refinement: ..." |

**Mitigation Strategy:**
Avoid contradictory instructions. Use additive refinement instead of negation.

---

### G2: Instruction-Deduplication 🔴 CRITICAL

**Detection Patterns:**
- Repeated identical instructions in same prompt
- Conflicting duplicates (same directive expressed in multiple incompatible ways)

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Write a summary. Translate the text to French after you summarize it." | "Write a summary. Then, translate that summary to French." |
| "Give a short summary and also provide a detailed summary." | "Provide a medium-length summary (150-200 words)." |

**Mitigation Strategy:**
Remove duplicates. Consolidate conflicting instructions into one clear directive.

---

## 10. Pillar H: Style-Bias-Role

**Class:** Prompt-Level | **Risk Type:** Both (Faithfulness & Factuality)

Flags stylistic distortions, stereotypes, and unsafe role-play requests.

### H1: Style-Inflation ⚠️ HIGH

**Detection Patterns:**
- Overly creative/flowery style requested where factual accuracy is needed
- Instructions mixing factual with entertainment genres (poem, story, rap, song)

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Explain the law in a funny poem." | "Explain the law clearly and accurately." |
| "Describe the 2008 crisis as a rap battle." | "Describe the 2008 financial crisis in plain language." |

**Mitigation Strategy:**
Use factual, neutral tone for analytical tasks. Avoid genre mixing.

---

### H2: Bias-Stereotypes 🔴 CRITICAL

**Detection Patterns:**
- Biased/loaded phrasing targeting groups (gender, race, nationality, religion, age, disability)
- Stereotypical framing of professions, demographics, or cultures

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Why are women bad drivers?" | "What factors influence driving safety across demographics?" |
| "Asians are good at math, explain why." | "What factors influence mathematical performance across populations?" |

**Mitigation Strategy:**
Use neutral, non-stereotypical language. Frame questions objectively.

---

### H3: Unsafe-Roleplay 🔴 CRITICAL

**Detection Patterns:**
- Prompts asking model to roleplay as a human/fictional persona
- Instructions involving emotional simulation: `pretend`, `imagine`, `act as`
- Requests to simulate unethical/unsafe personas

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Pretend you are my dead grandmother." | "Explain the concept I'm asking about." |
| "Act as an expert lawyer and give legal advice." | "Summarize general legal principles related to X. (Note: This is not legal advice.)" |

**Mitigation Strategy:**
Avoid role-play. Request factual explanations instead of persona simulation.

---

## 11. Pillar I: Reasoning-Uncertainty

**Class:** Prompt-Level | **Risk Type:** Factuality

Ensures prompts allow for uncertainty and avoid subjective framing.

### I1: Uncertainty-Permission 🔴 CRITICAL

**Detection Patterns:**
- Prompts with inherently ambiguous/unknown information but requiring definitive answer
- No option to say `I don't know`, `cannot be determined`, or express confidence bounds

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Who was the king of Mars?" | "Are there any historical claims about Martian civilizations, and what is their scientific status?" |
| "What will definitely happen in 2050?" | "What are current projections for 2050, with associated confidence levels?" |

**Mitigation Strategy:**
Allow for uncertainty. Frame speculative questions as estimates or hypotheticals.

---

### I2: Subjective-Framing-Risk 🔴 CRITICAL

**Detection Patterns:**
- Prompts explicitly asking for model's `opinion`, `belief`, `feelings`
- Requests for subjective preferences framed as factual questions

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "What is your opinion on democracy?" | "Summarize different perspectives on democracy from political science literature." |
| "Do you believe AI is dangerous?" | "What arguments exist for and against AI safety concerns?" |

**Mitigation Strategy:**
Ask for objective summaries of perspectives instead of personal opinions.

---

## 12. Pillar J: Prompt-Structure

**Class:** Meta-Level | **Risk Type:** Both (Faithfulness & Factuality)

Addresses structural issues like prompt length and delimiter usage.

### J1: Length-TooShort-TooLong ⚠️ HIGH

**Detection Patterns:**
- Underspecified prompts (missing scope or entities)
- Overlong prompts with many fused tasks

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Explain this." | "Explain quantum entanglement for undergraduate physics students in 200-300 words." |

**Mitigation Strategy:**
Aim for balanced length with clear scope.

---

### J2: Delimiter-Missing ⚠️ HIGH

**Detection Patterns:**
- Context and instructions fused without clear separation

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Dataset: 5, 6, 7 analyze it." | "Dataset: 5, 6, 7\n\n---\n\nTask: Analyze the dataset." |

**Mitigation Strategy:**
Use visual separators (`---`, `###`, etc.) between context and instructions.

---

### J3: MultiObjective-Overload ⚠️ HIGH

**Detection Patterns:**
- Creative + analytical + explanatory tasks mixed with no stepwise order

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Prove Fermat's Theorem and explain it to a child in a song." | "1. Prove Fermat's Theorem. 2. Then, explain it to a child. 3. Finally, write a song about it." |

**Mitigation Strategy:**
Break multi-objective prompts into numbered steps.

---

## 13. Pillar K: Instruction-Structure-MultiStep

**Class:** Meta-Level | **Risk Type:** Faithfulness

Ensures multi-step tasks are clearly enumerated and sequenced.

### K1: Task-Delimitation ⚠️ HIGH

**Detection Patterns:**
- Mixed data and instructions without clear separators
- Task embedded in a blob of context

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Here is the text: … summarize it and critique it." | "Context: [text]\n\n---\n\nTask: Summarize and critique the text." |

**Mitigation Strategy:**
Use headers, delimiters, or visual structure to separate context from task.

---

### K2: Enumerate-MultiSteps ⚠️ HIGH

**Detection Patterns:**
- Multiple fused instructions without order markers
- Prompts chaining unrelated tasks in one sentence

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Explain relativity and compare it to quantum mechanics and write a poem." | "1. Explain relativity. 2. Compare it to quantum mechanics. 3. Write a poem." |

**Mitigation Strategy:**
Number or bullet-list all distinct steps.

---

### K3: Stepwise-Reasoning-Cue ⚠️ HIGH

**Detection Patterns:**
- Complex reasoning tasks with no cue for structured steps
- Mathematical or logical tasks without `show work` style framing

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Solve this math problem." | "Solve this math problem. Show all steps and explain your reasoning." |

**Mitigation Strategy:**
Explicitly request step-by-step reasoning or "show your work" style outputs.

---

### K4: MultiObjective-Separation ⚠️ HIGH

**Detection Patterns:**
- Creative and analytical objectives fused
- Tasks combining incompatible genres

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Analyze the dataset and then write a story about it." | "1. Analyze the dataset. 2. Separately, write a creative story inspired by the findings." |

**Mitigation Strategy:**
Separate incompatible objectives into distinct, sequential steps.

---

## 14. Pillar L: Contextual-Integrity

**Class:** Prompt-Level | **Risk Type:** Faithfulness

Flags internal contradictions, negation risks, and clarification gaps.

### L1: Conflicting-Instructions 🔴 CRITICAL

**Detection Patterns:**
- Instructions that contradict themselves
- Multiple incompatible constraints (length mismatch, style vs content clash)

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Write a 100-word summary and also at least 500 words." | "Write a 100-word summary." |
| "Provide objective analysis but make it emotional." | "Provide objective analysis with clear evidence." |

**Mitigation Strategy:**
Remove contradictions. Consolidate constraints into one coherent directive.

---

### L2: Negation-Risk ⚠️ HIGH

**Detection Patterns:**
- Prompts phrased as `don't do X` without giving a positive target
- Instructions with double negatives or inverted logic

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "Don't summarize the text." | "Provide a detailed analysis of the text." |
| "Don't give me a long answer." | "Provide a 50-word response." |

**Mitigation Strategy:**
Replace negations with positive instructions specifying what to do.

---

### L3: Clarification-Gap 🔴 CRITICAL

**Detection Patterns:**
- Complex/multi-step instructions where missing context prevents execution
- Task requires assumed prior knowledge not supplied in prompt

| ❌ Risky | ✅ Mitigated |
|----------|--------------|
| "First analyze the data, then critique it." (No dataset provided) | "Given the dataset below: [data]\n\nTask: Analyze and critique the data." |
| "Review the text above." (No text present) | "[Text to review]\n\n---\n\nTask: Review the above text." |

**Mitigation Strategy:**
Include all necessary context explicitly. Avoid assuming prior knowledge.

---

## 15. Severity Classification

### 15.1 Severity Levels

| Level | Symbol | PRD Weight | Interpretation |
|-------|--------|------------|----------------|
| **Critical** | 🔴 | ×3 | High probability of severe hallucination or complete task failure |
| **High** | ⚠️ | ×2 | Significant risk of ambiguity or factual errors |
| **Medium** | 🟡 | ×1 | Moderate risk requiring clarification |

### 15.2 PRD Calculation

**Prompt Risk Density (PRD)** quantifies overall hallucination potential:

$$
\text{PRD} = \frac{\sum_{i} (\text{span}_i \times w_i)}{L}
$$

Where:
- $\text{span}_i$ = character length of violation $i$
- $w_i$ = severity weight (1, 2, or 3)
- $L$ = total prompt length

**Interpretation:**
| PRD Range | Risk Level | Recommendation |
|-----------|------------|----------------|
| 0–20% | Low | Prompt is well-structured |
| 21–50% | Moderate | Consider addressing highlighted risks |
| 51–80% | High | Significant revision recommended |
| 81–100% | Critical | Prompt requires substantial rewrite |

---

## 16. Application in Echo

### 16.1 Analysis Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TAXONOMY APPLICATION FLOW                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   USER PROMPT                                                           │
│        │                                                                │
│        ▼                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  ANALYZER AGENT                                                 │  │
│   │  ├── Load Guidelines (both.xml / faithfulness.xml / factuality) │  │
│   │  ├── Match patterns from Pillars A–L                            │  │
│   │  ├── Classify violations by severity                            │  │
│   │  ├── Separate prompt-level vs meta-level                        │  │
│   │  └── Compute PRD values                                         │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│        │                                                                │
│        ▼                                                                │
│   OUTPUT: Highlighted prompt + PRD scores + Violation cards            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 16.2 Guideline File Mapping

| Mode | File | Pillars Checked |
|------|------|-----------------|
| **Faithfulness** | `data/faithfulness.xml` | A, C, F, G, K, L |
| **Factuality** | `data/factuality.xml` | B, D, E, I |
| **Both** | `data/both.xml` | A–L (all) |

### 16.3 Interactive Reference

Users can browse this taxonomy interactively via the **Library** button in Echo's sidebar, enabling real-time reference while refining prompts.

---

## 17. Summary Tables

### 17.1 Quick Reference by Class

**Prompt-Level Pillars (Highlightable):**

| Pillar | Focus | Key Detection |
|--------|-------|---------------|
| A | Referential Grounding | Pronouns, undefined entities |
| B | Quantification | Vague quantities, temporal terms |
| D | Premises | False claims, leading questions |
| E | Numbers-Units | Missing units, baselines |
| F | Retrieval | Unanchored sources, documents |
| H | Style-Bias | Stereotypes, roleplay, tone |
| I | Uncertainty | Forced certainty, opinion requests |
| L | Integrity | Contradictions, negations |

**Meta-Level Pillars (Structural):**

| Pillar | Focus | Key Detection |
|--------|-------|---------------|
| C | Context-Domain | Missing 5 W's, audience, domain |
| G | Injection | Contradicting prior context |
| J | Prompt-Structure | Length, delimiters, objectives |
| K | Multi-Step | Task separation, enumeration |

### 17.2 Quick Reference by Risk Type

| Type | Pillars | Central Concern |
|------|---------|-----------------|
| **Faithfulness** | A, C, F, G, K, L | LLM diverges from provided context |
| **Factuality** | B, D, E, I | LLM generates false claims |
| **Both** | H, J | Multiple risk vectors |

---

## Appendix: Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025 | Doctoral-level rewrite with theoretical framing |
| 1.0 | 2024 | Initial taxonomy implementation |

---

*"Precision in prompts is prophylaxis against fabrication."*

*See `architecture.md` for implementation details and `contributing.md` for extension guidelines.*

*© 2025 Mohamed Nejjar — Bachelor Thesis Implementation*
