export interface HighlightSegment {
  start: number;
  end: number;
  text: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  reason: string;
  category: string;
}

export interface PromptAnalysis {
  promptText: string;
  highlightedSegments: HighlightSegment[];
  overallConfidence: number;
  totalFlagged: number;
  categories: Record<string, number>;
  analysisSummary: string;
  // Backend compatibility fields (optional)
  prompt_text?: string;
  highlighted_segments?: HighlightSegment[];
  overall_confidence?: number;
  total_flagged?: number;
  analysis_summary?: string;
  annotated_prompt?: string;
  risk_tokens?: RiskToken[];
  risk_assessment?: RiskAssessment;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysisId?: string;
  id?: string;
}

// Risk Assessment types - PRD-based structure
export interface PromptViolation {
  rule_id: string;
  pillar: string;
  severity: 'critical' | 'high' | 'medium';
  span: string;
}

export interface MetaViolation {
  rule_id: string;
  pillar: string;
  severity: 'critical' | 'high' | 'medium';
  explanation: string;
}

export interface PromptRiskAssessment {
  prompt_PRD: number | string;  // Can be number or empty string from backend
  prompt_violations: PromptViolation[];
  prompt_overview: string;
}

export interface MetaRiskAssessment {
  meta_PRD: number | string;  // Can be number or empty string from backend
  meta_violations: MetaViolation[];
  meta_overview: string;
}

export interface RiskAssessment {
  prompt: PromptRiskAssessment;
  meta: MetaRiskAssessment;
}

// Legacy types for backward compatibility (deprecated)
export interface RiskCriterion {
  name: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  percentage: number;
  description: string;
}

export interface OverallAssessment {
  percentage: number;
  description: string;
}

// Risk Token types for detailed token analysis
export interface RiskToken {
  id: string;
  text: string;
  reasoning: string;
  // Backend may append rule_ids or use free-form strings; keep this flexible
  classification: string;
  mitigation: string;
  risk_level?: 'critical' | 'high' | 'medium' | 'low';
}

// Analysis mode type
export type AnalysisMode = 'faithfulness' | 'factuality' | 'both';

// Backend API response types
export interface AnalyzePromptResponse {
  annotated_prompt: string;
  analysis_summary: string;
  risk_assessment?: RiskAssessment;
  risk_tokens?: RiskToken[];
}

export interface RefineOnceResponse {
  assistant_message: string;
}

// Initiator integration types (variations removed; now only clarifying question + mitigation plan)

export interface InitiatorMitigationPlanPrinciple {
  name: string;
  rules: string[];
  summary: string;
}

export interface InitiatorMitigationPlan {
  overview: string;
  rules_addressed: string[];
  principles: InitiatorMitigationPlanPrinciple[];
}

export interface InitiateResponse {
  clarifying_question: string | null;
  mitigation_plan: InitiatorMitigationPlan;
  success: boolean;
}

// Prepare integration types
export interface PrepareVariation {
  id: number;
  label: string;
  focus: string;
  prompt: string;
}

export interface PrepareResponse {
  refined_prompt: string;
  variations: PrepareVariation[];
  success: boolean;
  message?: string;
}
