<div align="center"><div align="center">



# 🧭 Echo – User Experience & Interaction Flow# 🧭 Echo – User Experience & Interaction Flow



### *From raw prompt → structured risk intelligence → refined, hallucination‑resistant instruction**From raw prompt → structured risk intelligence → refined, hallucination‑resistant instruction.*



<img src="../client/public/logo.png" alt="Echo Logo" width="80" height="80"></div>



</div>---



---## 1. Purpose



## 📖 Table of ContentsThis document captures the **end‑to‑end experiential journey** of a user inside Echo: *authoring*, *analyzing*, *interpreting*, *refining*, and *iterating* on prompts to systematically reduce hallucination risk. It complements system internals in `architecture.md` by focusing on **behavioral flow**, **cognitive touch‑points**, and **feedback mechanics**.



- [Overview](#-overview)## Table of Contents

- [User Journey Map](#-user-journey-map)- [Application Access](#application-access)

- [Complete User Flow](#-complete-user-flow-diagram)- [Main Interface Overview](#main-interface-overview)

- [Interface Walkthrough](#-interface-walkthrough)- [Prompt Input Methods](#prompt-input-methods)

- [Interaction Patterns](#-interaction-patterns)- [Analysis Process](#analysis-process)

- [Feature Deep-Dive](#-feature-deep-dive)- [Results Interpretation](#results-interpretation)

- [User Personas](#-user-personas)- [Prompt Refinement](#prompt-refinement)

- [Edge Cases & Error Handling](#-edge-cases--error-handling)- [Advanced Features](#advanced-features)

- [User Personas and Scenarios](#user-personas-and-scenarios)

---

## 2. Application Access

## 🎯 Overview

### 1. Initial Landing

This document captures the **end‑to‑end experiential journey** of a user inside Echo: *authoring*, *analyzing*, *interpreting*, *refining*, and *iterating* on prompts to systematically reduce hallucination risk.```

User accesses: http://localhost:5174 (development)

### Design Principles├── Application loads with dark/light theme based on system preference

├── Main interface displays with sidebar and editor panels

| Principle | Implementation | User Benefit |└── Welcome state shows placeholder text and instructions

|-----------|----------------|--------------|```

| **Progressive Disclosure** | Collapsible panels, tabs | Reduced cognitive load |

| **Immediate Feedback** | Real-time highlighting | Clear cause-effect relationships |### 2. First-Time Experience Goals

| **Contextual Guidance** | In-line tooltips, help text | Self-service learning || Aspect | Design Intent | Outcome |

| **Reversible Actions** | Clear/undo operations | Confidence to experiment ||--------|---------------|---------|

| **Iterative Loop** | Re-analyze with context | Continuous improvement || Cognitive Load | Minimize initial branching | User focuses on a single “Write or Paste Prompt” task |

| Trust Building | Immediate structure + neutral tone | Encourages experimentation |

---| Discoverability | Subtle affordances (toolbar, chat tab) | Progressive exploration |

| Theming | Honor system preference | Reduces friction & fatigue |

## 🗺️ User Journey Map

## 3. Main Interface Overview

```mermaid

journey### Layout Structure

    title Echo User Journey - Prompt Refinement Loop```

    section Write┌─────────────────────────────────────────────────────────────┐

      Draft initial prompt: 5: User│ Header: Logo, Title, Theme Toggle                           │

      Upload existing file: 4: User├───────────────┬─────────────────────────────────────────────┤

      Review prompt text: 3: User│               │                                             │

    section Analyze│   Sidebar     │           Main Content Area                 │

      Click "Analyze Prompt": 5: User│   - Analysis  │   ┌─────────────────────────────────────┐   │

      Wait for analysis: 3: User, System│   - Chat      │   │                                     │   │

      View risk highlights: 4: User│   - Settings  │   │        Text Editor                  │   │

      Inspect violations: 4: User│               │   │     (Prompt Input)                  │   │

    section Understand│               │   │                                     │   │

      Read PRD scores: 4: User│               │   └─────────────────────────────────────┘   │

      Explore risk tokens: 5: User│               │   ┌─────────────────────────────────────┐   │

      Review mitigation tips: 5: User│               │   │                                     │   │

    section Refine│               │   │     Analysis Results                │   │

      Open chat panel: 5: User│               │   │   (Risk Assessment)                 │   │

      Ask for suggestions: 5: User│               │   │                                     │   │

      Receive guidance: 4: User, Echo│               │   └─────────────────────────────────────┘   │

      Update prompt: 5: User└───────────────┴─────────────────────────────────────────────┘

    section Export```

      Generate report: 4: User

      Download JSON: 3: User### Interactive Primitives

      Save PDF: 3: User| Element | Primary Role | Secondary Behavior |

    section Iterate|---------|--------------|--------------------|

      Re-analyze: 5: User| Sidebar | Mode switching (Analysis / Chat) | Future: settings / history |

      Compare scores: 4: User| Editor Area | Prompt capture | File content ingestion |

      Repeat cycle: 5: User| Toolbar | Actions (Upload / Analyze) | Could host shortcuts & presets |

```| Analysis Panels | Structured result reveal | Progressive disclosure via collapse |

| Chat Panel | Iterative refinement loop | Learning scaffold |

---| Theme Toggle | A11y / preference control | Persisted via localStorage |



## 🔄 Complete User Flow Diagram## 4. Prompt Input Methods



```mermaid### Method A: Direct Text Input

flowchart TB

    Start([🚀 User Opens Echo]) --> Editor[📝 Prompt Editor]#### Flow:

    ```

    Editor -->|Type/Paste| Input[Text Input]1. User clicks in text editor area

    Editor -->|Upload| File[📁 File Upload]2. Placeholder text disappears

    3. User types or pastes prompt content

    Input --> ReadyCheck{Prompt Ready?}4. Real-time character count updates

    File --> ReadyCheck5. "Analyze Prompt" button becomes active

    ```

    ReadyCheck -->|No| Editor

    ReadyCheck -->|Yes| SelectMode[⚙️ Select Analysis Mode]#### Features:

    - **Rich Text Editor**: Monospace font for readability

    SelectMode --> Mode{Mode Type}- **Auto-resize**: Text area expands with content

    Mode -->|Faithfulness| Analyze1[🔍 Analyze: Faithfulness]- **Syntax Highlighting**: Future enhancement placeholder

    Mode -->|Factuality| Analyze2[🔍 Analyze: Factuality]- **Character Limits**: Visual feedback for optimal prompt length

    Mode -->|Both| Analyze3[🔍 Analyze: Both]

    ### Method B: File Upload

    Analyze1 --> Processing[⏳ LLM Processing]

    Analyze2 --> Processing#### Flow:

    Analyze3 --> Processing```

    1. User clicks "Upload File" button in toolbar

    Processing --> Results[📊 Analysis Results]   OR

    2. User drags file over editor area

    Results --> PRD[📈 PRD Scores Display]3. File selection dialog opens (click method)

    Results --> Tokens[🔴 Risk Token Highlights]   OR

    Results --> Violations[📋 Violation List]4. Drop zone activates with visual feedback (drag method)

    5. File content loads into editor

    PRD --> ReviewCheck{Satisfied?}6. Success message confirms upload

    Tokens --> ReviewCheck7. "Analyze Prompt" button becomes active

    Violations --> ReviewCheck```

    

    ReviewCheck -->|No| ChatOpen{Open Chat?}#### Supported File Types:

    - **Text Files**: `.txt`, `.md`, `.rst`

    ChatOpen -->|Yes| Chat[💬 Chat with Echo]- **Document Files**: `.doc`, `.docx` (future enhancement)

    Chat --> Suggestions[🎯 Receive Suggestions]- **Code Files**: `.py`, `.js`, `.json` (future enhancement)

    Suggestions --> EditPrompt[✏️ Edit Prompt]

    EditPrompt --> ReAnalyze[🔄 Re-Analyze]#### Upload Validation:

    ReAnalyze --> Processing- **File Size**: Maximum 1MB limit

    - **File Type**: MIME type validation

    ChatOpen -->|No| DirectEdit[✏️ Direct Edit]- **Content**: Text encoding verification

    DirectEdit --> ReAnalyze- **Error Handling**: Clear error messages for invalid files

    

    ReviewCheck -->|Yes| Export{Export?}## 5. Analysis Process

    

    Export -->|JSON| ExportJSON[📥 Download JSON]### Layered Mental Model

    Export -->|PDF| ExportPDF[📄 Download PDF]| User Perception | Actual System Action |

    Export -->|No| Done([✅ Complete])|-----------------|----------------------|

    | “It’s thinking…” | Sanitization + prompt shaping |

    ExportJSON --> Done| “Evaluating…” | Model call + XML / tag extraction |

    ExportPDF --> Done| “Scoring…” | Deterministic normalization & weighting |

    | “Rendering…” | Token binding & UI materialization |

    style Start fill:#667eea,stroke:#764ba2,stroke-width:3px,color:#fff

    style Processing fill:#f093fb,stroke:#f5576c,stroke-width:3px,color:#fff### Step 1: Initiation

    style Results fill:#4facfe,stroke:#00f2fe,stroke-width:3px,color:#fff```

    style Chat fill:#43e97b,stroke:#38f9d7,stroke-width:3px,color:#fffUser clicks "Analyze Prompt"

    style Done fill:#fa709a,stroke:#fee140,stroke-width:3px,color:#fff├── Button state changes to "Analyzing..."

```├── Progress indicator appears

├── Input controls become disabled

---└── Analysis request sent to backend

```

## 🖥️ Interface Walkthrough

### Step 2: Progress Indication

### 1. Initial Landing State```

Progress Animation Sequence:

```├── 0-30%: "Parsing prompt structure..."

┌────────────────────────────────────────────────────────────────┐├── 30-60%: "Evaluating risk criteria..."

│  🌙 Echo                                         [🌙 Theme]     │├── 60-90%: "Generating assessment..."

├────────────────────────────────────────────────────────────────┤└── 90-100%: "Finalizing results..."

│ ┌─────────┐ │                                                  │```

│ │ Analysis│ │  ┌────────────────────────────────────────────┐ │

│ ├─────────┤ │  │                                            │ │### Step 3: Backend Processing (Expanded)

│ │  Chat   │ │  │     📝 Write or paste your prompt here... │ │```

│ └─────────┘ │  │                                            │ │Backend Workflow:

│   Sidebar   │  │        [🔍 Analyze] [📁 Upload] [🗑️]       │ │1. Receive prompt via POST /api/analyze/

│             │  └────────────────────────────────────────────┘ │2. Sanitize and validate input

│             │                                                  │3. Send structured request to OpenAI API

│             │  💡 Tip: Start by typing or uploading a file    │4. Parse XML-formatted risk assessment

└────────────────────────────────────────────────────────────────┘5. Format response with structured data

```6. Return analysis results to frontend

```

**Key Elements:**

- **Clean slate** - Minimal distraction### Step 4: Results Display

- **Clear call-to-action** - Prominent placeholder```

- **Theme toggle** - Respects user preferenceResults Rendering:

- **Contextual tip** - Guides first interaction├── Progress bar completes (100%)

├── Analysis sections expand with animation

---├── Risk assessment data populates

└── Interactive elements become available

### 2. Editor with Content```



```## 6. Results Interpretation

┌────────────────────────────────────────────────────────────────┐

│  🌙 Echo                                         [☀️ Theme]     │### 6.1 Risk Assessment Display

├────────────────────────────────────────────────────────────────┤

│ ┌─────────┐ │  [🔍 Analyze Prompt] [📁] [📋] [🗑️]            │#### Overall Risk Score

│ │►Analysis│ │  ┌────────────────────────────────────────────┐ │```

│ ├─────────┤ │  │ Explain quantum computing like I'm a       │ │Visual Representation:

│ │  Chat   │ │  │ lawyer with examples.                      │ │┌─────────────────────────────────────┐

│ └─────────┘ │  │                                            │ ││  Overall Risk Assessment            │

│             │  │                                            │ ││                                     │

│             │  └────────────────────────────────────────────┘ ││     ◯ 65%    ← Circular Progress    │

│             │  Characters: 54 | Words: 8                      ││              ← Color-coded          │

└────────────────────────────────────────────────────────────────┘│                (Red/Yellow/Green)   │

```└─────────────────────────────────────┘

```

**Interactive Elements:**

- 🔍 **Analyze Prompt** - Primary action (enabled when text present)#### Expandable Criteria Details

- 📁 **Upload File** - Import from .txt, .md files```

- 📋 **Copy** - Copy to clipboardDefault State (Collapsed):

- 🗑️ **Clear** - Reset editor┌─────────────────────────────────────┐

- **Character/Word count** - Writing metrics│ 🔵 Hallucination Risk Score         │

│                           [Expand ▼]│

---└─────────────────────────────────────┘



### 3. Analysis Results ViewExpanded State:

┌─────────────────────────────────────┐

```│ 🔵 Hallucination Risk Score         │

┌────────────────────────────────────────────────────────────────┐│                         [Collapse ▲]│

│  🌙 Echo - Analysis Complete                    [☀️ Theme]     ││                                     │

├────────────────────────────────────────────────────────────────┤│ Risk Assessment Criteria:           │

│ ┌─────────┐ │  ┌────────────────────────────────────────────┐ ││                                     │

│ │►Analysis│ │  │ Explain <span-red>quantum computing</span> │ ││ ┌─────────────────────────────────┐ │

│ ├─────────┤ │  │ like I'm a <span-yellow>lawyer</span> with │ ││ │ Ambiguous References      85%   │ │

│ │  Chat   │ │  │ examples.                                  │ ││ │ High Risk              [🔴]     │ │

│ └─────────┘ │  └────────────────────────────────────────────┘ ││ │ Pronouns without clear context  │ │

│             │                                                  ││ └─────────────────────────────────┘ │

│             │  ╔══════════════════════════════════════════╗   ││                                     │

│             │  ║  📊 Risk Assessment                      ║   ││ ┌─────────────────────────────────┐ │

│             │  ╠══════════════════════════════════════════╣   ││ │ Context Completeness      60%   │ │

│             │  ║  Overall Risk: 58% 🟡 MEDIUM             ║   ││ │ Medium Risk            [🟡]     │ │

│             │  ║                                          ║   ││ │ Missing background information  │ │

│             │  ║  Prompt PRD: 0.0234                      ║   ││ └─────────────────────────────────┘ │

│             │  ║  Meta PRD: 0.0156                        ║   ││                                     │

│             │  ║                                          ║   ││ Overall Assessment:                 │

│             │  ║  🔴 2 High Risk Tokens                   ║   ││ [Detailed explanation text...]      │

│             │  ║  🟡 1 Medium Risk Token                  ║   │└─────────────────────────────────────┘

│             │  ╚══════════════════════════════════════════╝   │```

│             │                                                  │

│             │  ┌────────── Risk Tokens ──────────────────┐    │### 6.2 High & Medium Risk Span Visualization

│             │  │ 🔴 RISK_1: "quantum computing"          │    │```

│             │  │    → Complex domain terminology         │    │Token Identification Display:

│             │  │    💡 Specify knowledge level           │    │┌─────────────────────────────────────┐

│             │  │                                         │    ││ 🟠 High Risk Tokens (3)             │

│             │  │ 🔴 RISK_2: "lawyer"                     │    ││                           [Expand ▼]│

│             │  │    → Audience ambiguity                 │    ││                                     │

│             │  │    💡 Define practice area              │    ││ "this" - Ambiguous reference        │

│             │  └─────────────────────────────────────────┘    ││ "many" - Vague quantifier          │

│             │                                                  ││ [Click expand for detailed analysis]│

│             │  [📤 Export] [💬 Chat] [🔄 Re-Analyze]          │└─────────────────────────────────────┘

└────────────────────────────────────────────────────────────────┘```

```

### 6.3 Interaction Patterns

**Visual Hierarchy:**

1. **Highlighted prompt** - Immediate visual feedback#### Primary Actions:

2. **Risk assessment card** - Key metrics at-a-glance1. **Expand/Collapse Sections**: Toggle detailed views

3. **Token details** - Expandable violation list2. **Read Risk Explanations**: Understand specific issues

4. **Action buttons** - Next steps clearly presented3. **Identify Priority Fixes**: Focus on high-risk items

4. **Navigate to Chat**: Get refinement suggestions

---

#### Secondary Actions:

### 4. Chat Panel Active1. **Copy Analysis Results**: Export for external use

2. **Share Assessment**: Collaborate with team members

```3. **Save Session**: Bookmark for later reference

┌────────────────────────────────────────────────────────────────┐

│  🌙 Echo - Conversational Refinement            [☀️ Theme]     │## 7. Prompt Refinement Loop

├────────────────────────────────────────────────────────────────┤

│ ┌─────────┐ │  ╔════════════════════════════════════════╗     │### 7.1 Chat-Based Refinement Flow

│ │ Analysis│ │  ║  💬 Chat with Echo                     ║     │

│ ├─────────┤ │  ╠════════════════════════════════════════╣     │#### Step 1: Chat Initiation

│ │►Chat    │ │  ║                                        ║     │```

│ └─────────┘ │  ║  🤖 Echo:                              ║     │User Flow:

│             │  ║  I notice two high-risk areas in your  ║     │1. User clicks "Chat" in sidebar

│             │  ║  prompt:                               ║     │2. Chat panel opens with prompt context

│             │  ║                                        ║     │3. Pre-populated system message appears

│             │  ║  1. "quantum computing" is complex     ║     │4. User can start conversation immediately

│             │  ║  2. "lawyer" needs context             ║     │```

│             │  ║                                        ║     │

│             │  ║  Would you like me to suggest a more   ║     │#### Step 2: Interactive Dialogue

│             │  ║  structured version?                   ║     │```

│             │  ║                                        ║     │Chat Interface:

│             │  ║  👤 You:                               ║     │┌─────────────────────────────────────┐

│             │  ║  Yes, please rewrite it.               ║     ││ 💬 Prompt Refinement Chat           │

│             │  ║                                        ║     ││                                     │

│             │  ║  🤖 Echo:                              ║     ││ 🤖 I can help improve your prompt   │

│             │  ║  Here's a refined version:             ║     ││    based on the risk assessment.    │

│             │  ║                                        ║     ││                                     │

│             │  ║  "Explain quantum computing to a       ║     ││ 👤 How can I fix the ambiguous      │

│             │  ║  corporate lawyer with 5 years         ║     ││    references in my prompt?         │

│             │  ║  experience who has basic physics      ║     ││                                     │

│             │  ║  knowledge. Use 2-3 concrete business  ║     ││ 🤖 Here are specific suggestions... │

│             │  ║  analogies and avoid mathematical      ║     ││                                     │

│             │  ║  formulas."                            ║     ││ ┌─────────────────────────────────┐ │

│             │  ║                                        ║     ││ │ Type your message...        [📤]│ │

│             │  ╠════════════════════════════════════════╣     ││ └─────────────────────────────────┘ │

│             │  ║  [Type your message...]        [Send]  ║     │└─────────────────────────────────────┘

│             │  ╚════════════════════════════════════════╝     │```

│             │                                                  │

│             │  [🔄 Re-Analyze with Context]                   │#### Step 3: Suggested Improvements

└────────────────────────────────────────────────────────────────┘```

```Typical Chat Flow:

1. User asks about specific risk factors

**Conversation Features:**2. Assistant provides targeted advice

- **Context awareness** - Echo references specific risk tokens3. User requests example improvements

- **Streaming responses** - Real-time text generation4. Assistant shows before/after examples

- **Message history** - Full conversation preserved5. User asks for additional refinements

- **Re-analyze button** - One-click iteration with context6. Iterative improvement continues

```

---

### 7.2 Strategy Patterns by Risk Type

## 🎭 Interaction Patterns

#### High Risk - Ambiguous References

### Pattern 1: Quick Analysis```

User Query: "How do I fix pronouns in my prompt?"

```mermaid

sequenceDiagramAssistant Response:

    participant U as User"Replace pronouns with specific nouns:

    participant E as Editor❌ 'Analyze this data'

    participant A as Analyzer✅ 'Analyze the Q3 2023 sales data'

    participant R as Results

    ❌ 'How does it work?'

    U->>E: Paste prompt✅ 'How does machine learning work?'"

    U->>A: Click "Analyze"```

    A->>A: Process (2-5s)

    A->>R: Display results#### Medium Risk - Context Completeness

    R->>U: Show highlights```

    U->>R: Review tokensUser Query: "What context should I add?"

```

Assistant Response:

**Duration**: 10-15 seconds  "Add these context elements:

**User Effort**: Minimal  - Time period or date range

**Use Case**: Quick risk check- Target audience or domain

- Specific constraints or requirements

---- Expected output format"

```

### Pattern 2: Iterative Refinement

### 7.3 Iteration Loop – Reinforcement Cycle

```mermaid

sequenceDiagramCanonical Mermaid source: `docs/diagrams/refinement-loop.mmd`

    participant U as User

    participant A as Analyzer```mermaid

    participant C as Chat%% (Inline copy – edit the .mmd source for changes.)

    participant E as Editorflowchart LR

       Write[Write / Paste Prompt] --> Analyze[Run Analysis]

    loop Until Satisfied   Analyze --> Visualize[View Highlights & Scores]

        U->>A: Analyze prompt   Visualize --> Reflect{Accept?}

        A->>U: Show results   Reflect -- No --> Chat[Ask Assistant]

        U->>C: Ask for help   Chat --> Apply[Incorporate Suggestions]

        C->>U: Suggest improvements   Apply --> Analyze

        U->>E: Update prompt   Reflect -- Yes --> Export[Refined Prompt Adopted]

    end```

    ```

    U->>U: Export final versionRefinement Process:

```1. User receives suggestions via chat

2. User manually edits prompt in editor

**Duration**: 2-10 minutes  3. User re-runs analysis to see improvements

**Iterations**: 2-5 typical  4. Repeat until acceptable risk level achieved

**Use Case**: High-stakes prompt engineering```



---## 8. Advanced Features



### Pattern 3: Batch Analysis### 8.1 Theme Customization



```mermaid#### Theme Toggle Flow:

sequenceDiagram```

    participant U as User1. User clicks theme toggle button (🌙/☀️)

    participant E as Editor2. Theme preference toggles immediately

    participant A as Analyzer3. Visual transition animates smoothly

    participant Ex as Export4. Preference saved to localStorage

    5. Future sessions remember choice

    loop For each prompt```

        U->>E: Load prompt file

        U->>A: Analyze#### Theme Variations:

        A->>U: Show results- **Light Mode**: High contrast, professional appearance

        U->>Ex: Export JSON- **Dark Mode**: Reduced eye strain, modern aesthetic

    end- **System**: Follows OS preference automatically

    

    U->>U: Compare results offline### 8.2 Keyboard Shortcuts

```

#### Text Editor:

**Duration**: 1-2 minutes per prompt  - `Ctrl+A`: Select all text

**Use Case**: Prompt library auditing- `Ctrl+C/V`: Copy/paste functionality

- `Ctrl+Z`: Undo text changes

---- `Tab`: Insert indentation



## 🔧 Feature Deep-Dive#### Application:

- `Ctrl+Enter`: Trigger analysis

### Analysis Modes- `Esc`: Close modals/dialogs

- `F1`: Open help documentation

```mermaid

graph LR### 8.3 Responsive Design

    Start[Select Mode] --> F[Faithfulness]

    Start --> Fa[Factuality]#### Desktop (>1024px):

    Start --> B[Both]- Full sidebar visible

    - Side-by-side editor and results

    F --> F1[Checks: Ambiguity<br/>Vagueness, Constraints]- Maximum content density

    Fa --> F2[Checks: Factual claims<br/>Verifiability, Sources]

    B --> F3[Checks: All criteria<br/>Comprehensive scan]#### Tablet (768-1024px):

    - Collapsible sidebar

    F1 --> Result[Analysis Output]- Stacked editor and results

    F2 --> Result- Touch-optimized controls

    F3 --> Result

    #### Mobile (<768px):

    style F fill:#667eea,color:#fff- Hidden sidebar (hamburger menu)

    style Fa fill:#f093fb,color:#fff- Single-column layout

    style B fill:#4facfe,color:#fff- Simplified interface elements

```

## 9. User Personas & Scenarios

### Risk Token Highlighting

### Persona 1: Academic Researcher

| Risk Level | Color | HSL | Usage |

|------------|-------|-----|-------|#### Background:

| **Critical** | 🔴 Red | `hsl(0, 100%, 50%)` | Severe issues |- Dr. Sarah Chen, AI researcher

| **High** | 🟠 Orange | `hsl(20, 100%, 50%)` | Major concerns |- Needs to verify prompt accuracy for research papers

| **Medium** | 🟡 Yellow | `hsl(45, 100%, 50%)` | Moderate risks |- Values detailed analysis and documentation

| **Low** | 🟢 Green | `hsl(120, 60%, 50%)` | Minor notes |

#### Typical Flow:

### PRD Score Interpretation```

1. Uploads research prompt from file

```2. Reviews detailed risk assessment

┌─────────────────── PRD Scale ─────────────────────┐3. Uses chat to understand specific concerns

│                                                    │4. Iteratively refines for academic standards

│  0.00        0.02        0.05        0.10    1.00 │5. Documents final prompt in research notes

│  ├────────────┼───────────┼───────────┼──────────┤│```

│  🟢 Excellent  🟡 Good     🟠 Risky    🔴 Critical││

│                                                    │#### Key Features Used:

│  PRD = Total Risk Weight / Token Count            │- File upload functionality

│                                                    │- Detailed criteria explanations

│  Severity Weights:                                │- Export capabilities

│  • Low: 0.5                                       │- Chat-based refinement

│  • Medium: 1.0                                    │

│  • High: 2.0                                      │### Persona 2: Content Creator

│  • Critical: 3.0                                  │

└────────────────────────────────────────────────────┘#### Background:

```- Mike Rodriguez, technical writer

- Creates AI-generated content for blogs

---- Needs quick, actionable feedback



## 👥 User Personas#### Typical Flow:

```

### Persona 1: The Power User (Data Scientist)1. Types prompt directly in editor

2. Quickly scans overall risk score

**Goal**: Batch-analyze 50+ prompts for production deployment  3. Focuses on high-risk items only

**Pain Points**: Manual review is time-consuming  4. Makes rapid adjustments

**Usage Pattern**:5. Re-analyzes for confirmation

- Uploads prompts from files```

- Uses Both mode for comprehensive analysis

- Exports JSON for programmatic processing#### Key Features Used:

- Rarely uses chat (prefers direct editing)- Direct text input

- Visual risk indicators

**Key Features**:- Quick analysis turnaround

- ✅ File upload- Mobile-responsive design

- ✅ JSON export

- ✅ Batch processing workflow### Persona 3: Business Analyst



---#### Background

*Jennifer Park – domain analyst needing reliable model outputs for reporting.*

### Persona 2: The Learner (ML Engineer)

#### Motivations

**Goal**: Understand what makes prompts risky  | Need | System Support |

**Pain Points**: Unclear why certain prompts fail  |------|----------------|

**Usage Pattern**:| Avoid misleading summaries | Clear high‑risk span marking |

- Types prompts from scratch| Rapid iteration | Fast re‑analysis loop |

- Explores each risk token detail| Justification for edits | Criteria explanations |

- Heavily uses chat for education

- Re-analyzes frequently to see improvements#### Typical Flow

1. Pastes unstructured draft request.

**Key Features**:2. Identifies vague “business impact” phrases flagged red.

- ✅ Detailed violation explanations3. Uses chat to convert them into measurable KPIs.

- ✅ Conversational guidance4. Re‑analyzes → risk drops from 65% → 35%.

- ✅ Progressive disclosure of complexity5. Exports final prompt to documentation space.



------



### Persona 3: The Professional (Technical Writer)## 10. Cognitive Design Considerations



**Goal**: Create documentation-quality prompts  | UX Challenge | Mitigation | Result |

**Pain Points**: Need formal validation for stakeholders  |--------------|-----------|--------|

**Usage Pattern**:| Invisible model heuristics | Explicit span tags + criteria names | Builds trust |

- Starts with drafts| Overwhelm on first result | Collapsible panels | Progressive assimilation |

- Iterates 3-5 times until PRD < 0.02| Unclear next action | Highlighted high‑risk tokens first | Action prioritization |

- Exports PDF reports for review| Ambiguous improvement path | Assistant gives before/after examples | Teaches pattern |

- Uses analysis as evidence of quality

---

**Key Features**:

- ✅ PDF export with formatting## 11. Future UX Extensions

- ✅ Professional reporting

- ✅ Audit trail capabilities| Idea | Benefit |

|------|---------|

---| History timeline | Track quality evolution / deltas |

| Multi‑prompt batch mode | Benchmark alternatives rapidly |

## ⚠️ Edge Cases & Error Handling| Inline editing within highlights | Reduce context switching |

| Risk criterion tuning | Adapt system to domain vocabulary |

### Empty Prompt| Export to PDF / Markdown | Thesis / audit readiness |



```---

┌────────────────────────────────────┐

│  ⚠️  Please enter a prompt first   │## 12. Summary

│                                    │

│  The editor is currently empty.    │Echo’s user flow intentionally mirrors a **scientific refinement loop**: *observe → hypothesize → apply → re‑measure*. By surfacing **why** each span is risky and providing a low‑friction path to improvement, the system shortens the cognitive distance between **problem detection** and **prompt mastery**.

│  Type or paste text to begin.     │

│                                    │> *“Clarity is not decorative; it is defensive.”*

│  [OK]                              │

└────────────────────────────────────┘See: `architecture.md` for the underlying technical mechanics.

```

- Needs reliable, fact-based outputs

### API Timeout

#### Typical Flow:

``````

┌────────────────────────────────────┐1. Pastes business query from spreadsheet

│  ⏱️  Analysis Timeout              │2. Reviews risk assessment thoroughly

│                                    │3. Engages extensively with chat for refinement

│  The request took too long.        │4. Tests multiple prompt variations

│  This might be due to:             │5. Shares results with team members

│  • Network connectivity issues     │```

│  • Server load                     │

│  • Very long prompts               │#### Key Features Used:

│                                    │- Copy/paste functionality

│  [Retry] [Cancel]                  │- Comprehensive risk analysis

└────────────────────────────────────┘- Interactive chat guidance

```- Collaborative features



### Malformed Response### Persona 4: Developer



```#### Background:

┌────────────────────────────────────┐- Alex Thompson, software engineer

│  🔧 Partial Analysis Available     │- Integrates AI into applications

│                                    │- Needs programmatic prompt validation

│  Some analysis data is incomplete. │

│  You can still see:                │#### Typical Flow:

│  ✓ Risk highlights                 │```

│  ✓ Basic scoring                   │1. Tests various prompt templates

│  ✗ Detailed violations             │2. Analyzes API response patterns

│                                    │3. Documents best practices

│  [Continue] [Re-Analyze]           │4. Automates prompt validation workflow

└────────────────────────────────────┘5. Shares findings with development team

``````



### File Upload Error#### Key Features Used:

- Multiple prompt testing

```- Technical documentation

┌────────────────────────────────────┐- API response analysis

│  📁 File Upload Failed             │- Development workflow integration

│                                    │

│  Supported formats:                │## Error Handling and Edge Cases

│  • .txt (plain text)               │

│  • .md (markdown)                  │### Network Connectivity Issues

│  • Max size: 1 MB                  │```

│                                    │Scenario: User loses internet connection during analysis

│  Your file: example.pdf (unsupported)Response: 

│                                    │- Show friendly error message

│  [Choose Another] [Cancel]         │- Provide retry functionality

└────────────────────────────────────┘- Preserve user's prompt content

```- Suggest offline alternatives

```

---

### Invalid Input Handling

## 🎨 Accessibility Features```

Scenario: User uploads non-text file

| Feature | Implementation | WCAG Level |Response:

|---------|----------------|------------|- Display clear error message

| **Keyboard Navigation** | Full tab order | AA |- Suggest supported file formats

| **Screen Reader** | ARIA labels on all controls | AA |- Provide format conversion guidance

| **Color Contrast** | 4.5:1 minimum | AA |- Maintain user's previous content

| **Focus Indicators** | Visible focus rings | AA |```

| **Text Scaling** | Responsive to 200% zoom | AA |

| **Alt Text** | All images described | A |### API Rate Limiting

```

---Scenario: OpenAI API quota exceeded

Response:

## 📱 Responsive Behavior- Show informative error message

- Suggest trying again later

### Desktop (> 1024px)- Provide alternative approaches

- Side-by-side editor + results- Cache previous results when possible

- Full chat panel overlay```

- All features visible

### Large Prompt Handling

### Tablet (768px - 1024px)```

- Stacked layout with tabsScenario: User inputs extremely long prompt

- Collapsible sidebarResponse:

- Touch-optimized buttons- Show character/token count warnings

- Suggest optimization strategies

### Mobile (< 768px)- Offer prompt summarization

- Single column- Implement graceful truncation

- Modal chat interface```

- Simplified toolbar

## Performance Optimization

---

### Loading States

## 🚀 Performance Targets- **Initial Load**: Progressive content loading

- **Analysis**: Real-time progress indicators

| Metric | Target | Actual |- **Results**: Smooth animations and transitions

|--------|--------|--------|- **Chat**: Streaming response display

| **Initial Load** | < 2s | ~1.5s |

| **Analysis Time** | < 5s | ~3-4s |### Caching Strategy

| **Chat Response** | < 3s | ~2-3s |- **Results**: Cache analysis results locally

| **Re-Analyze** | < 4s | ~2.5s |- **Preferences**: Store user settings

| **Export JSON** | Instant | ~100ms |- **Chat History**: Maintain session context

| **Export PDF** | < 2s | ~1s |- **File Uploads**: Temporary storage for re-analysis



---### Mobile Optimization

- **Touch Targets**: Minimum 44px touch areas

## 📊 Usage Analytics (Anonymized)- **Scroll Performance**: Optimized scrolling behavior

- **Battery Usage**: Efficient rendering and minimal re-renders

```mermaid- **Data Usage**: Compressed API responses

pie title Feature Usage Distribution

    "Quick Analysis" : 45## Accessibility Features

    "Iterative Refinement" : 30

    "Chat Assistance" : 15### Screen Reader Support

    "Export Reports" : 10- **Semantic HTML**: Proper heading hierarchy

```- **ARIA Labels**: Descriptive labels for interactive elements

- **Focus Management**: Logical tab order

---- **Alternative Text**: Meaningful descriptions for visual elements



<div align="center">### Keyboard Navigation

- **Tab Navigation**: Full keyboard accessibility

### 🎯 User Flow Summary- **Focus Indicators**: Clear visual focus states

- **Keyboard Shortcuts**: Efficient power-user features

**Echo transforms prompt engineering from guesswork to a systematic, measurable process.**- **Skip Links**: Quick navigation to main content



*Every interaction is designed to reduce friction and maximize insight.*### Visual Accessibility

- **High Contrast**: WCAG compliant color ratios

[← Back to README](../README.md) | [Architecture →](architecture.md)- **Font Scaling**: Responsive text sizing

- **Color Independence**: Information not solely conveyed by color

</div>- **Motion Reduction**: Respect user's motion preferences


This comprehensive user flow documentation ensures that all user interactions with Echo Hallucination Detection are well-understood, from initial access through advanced feature usage and edge case handling.
