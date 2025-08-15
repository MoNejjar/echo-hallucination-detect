export interface HighlightSegment {
  start: number;
  end: number;
  text: string;
  riskLevel: 'high' | 'medium' | 'low';
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
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysisId?: string;
  id?: string;
}

// Risk Assessment types
export interface RiskCriterion {
  name: string;
  risk: 'high' | 'medium' | 'low';
  percentage: number;
  description: string;
}

export interface OverallAssessment {
  percentage: number;
  description: string;
}

export interface RiskAssessment {
  criteria: RiskCriterion[];
  overall_assessment: OverallAssessment;
}

// Backend API response types
export interface AnalyzePromptResponse {
  annotated_prompt: string;
  analysis_summary: string;
  risk_assessment?: RiskAssessment;
}

export interface RefineOnceResponse {
  assistant_message: string;
}