import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Brain, 
  Target, 
  TrendingUp,
  Zap,
  Eye,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Info,
  CheckCircle,
  XCircle,
  Maximize2,
  X,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Clock,
  Users,
  ArrowLeft
} from 'lucide-react';
import type { PromptAnalysis } from '../types';

interface AnalysisSectionProps {
  originalText: string;
  isAnalyzing: boolean;
  analysis?: {
    promptText: string;
    highlightedSegments: Array<{
      start: number;
      end: number;
      text: string;
      riskLevel: 'high' | 'medium' | 'low';
      confidence: number;
      reason: string;
      category: string;
    }>;
    overallConfidence: number;
    totalFlagged: number;
    categories: Record<string, number>;
    analysisSummary: string;
    // Backend compatibility fields (optional)
    prompt_text?: string;
    highlighted_segments?: Array<any>;
    overall_confidence?: number;
    total_flagged?: number;
    analysis_summary?: string;
    annotated_prompt?: string;
  } | null;
  onBackToEditor?: () => void;
}

interface RiskyToken {
  token: string;
  risk: number;
  position: number;
  category: string;
  explanation: string;
  suggestions: string[];
  confidence: number;
}

interface AnalysisDetails {
  riskBreakdown: { category: string; percentage: number; color: string }[];
  temporalAnalysis: { period: string; confidence: number }[];
  sourceReliability: { type: string; count: number; reliability: number }[];
  logicalConsistency: { aspect: string; score: number }[];
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({ 
  originalText, 
  isAnalyzing, 
  analysis, 
  onBackToEditor 
}) => {
  const [analyzedText, setAnalyzedText] = useState<string>('');
  const [hallucinationProbability, setHallucinationProbability] = useState<number>(0);
  const [riskyTokens, setRiskyTokens] = useState<RiskyToken[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [analysisError, setAnalysisError] = useState<string>('');
  const [expandedTokens, setExpandedTokens] = useState<Set<number>>(new Set());
  const [showTokensModal, setShowTokensModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [analysisDetails, setAnalysisDetails] = useState<AnalysisDetails | null>(null);

  // Check if text meets minimum token requirement
  const getTokenCount = (text: string) => text.split(/\s+/).filter(word => word.length > 0).length;
  const tokenCount = getTokenCount(originalText);
  const meetsMinimumRequirement = tokenCount >= 100; // Reduced from 1000 to 100 for better UX

  // Get gradient background based on risk level
  const getGradientBackground = (riskLevel: number) => {
    if (riskLevel >= 80) {
      return 'bg-gradient-to-br from-red-50 via-red-100 to-orange-50 dark:from-red-950/20 dark:via-red-900/30 dark:to-orange-950/20';
    } else if (riskLevel >= 60) {
      return 'bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50 dark:from-orange-950/20 dark:via-orange-900/30 dark:to-yellow-950/20';
    } else if (riskLevel >= 40) {
      return 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-green-50 dark:from-yellow-950/20 dark:via-yellow-900/30 dark:to-green-950/20';
    } else {
      return 'bg-gradient-to-br from-green-50 via-green-100 to-blue-50 dark:from-green-950/20 dark:via-green-900/30 dark:to-blue-950/20';
    }
  };

  // Toggle token expansion
  const toggleTokenExpansion = (index: number) => {
    const newExpanded = new Set(expandedTokens);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTokens(newExpanded);
  };

  // Generate mock explanations and suggestions
  const generateTokenDetails = (token: string, risk: number): Omit<RiskyToken, 'token' | 'risk' | 'position'> => {
    const categories = ['Factual Accuracy', 'Logical Consistency', 'Source Reliability', 'Temporal Accuracy', 'Statistical Claims'];
    const explanations = [
      `The term "${token}" appears in a context that suggests factual claims without proper verification.`,
      `Usage of "${token}" may indicate overconfident assertions that could lead to hallucinated content.`,
      `The word "${token}" is associated with claims that are difficult to verify from reliable sources.`,
      `"${token}" appears in a statistical or numerical context that may lack proper backing.`,
      `The term "${token}" suggests temporal claims that may be inaccurate or outdated.`
    ];
    const suggestions = [
      'Consider adding qualifiers like "potentially" or "according to some sources"',
      'Provide specific citations or references for this claim',
      'Use more cautious language to indicate uncertainty',
      'Break down complex claims into verifiable components',
      'Add temporal context or date references'
    ];

    return {
      category: categories[Math.floor(Math.random() * categories.length)],
      explanation: explanations[Math.floor(Math.random() * explanations.length)],
      suggestions: [
        suggestions[Math.floor(Math.random() * suggestions.length)],
        suggestions[Math.floor(Math.random() * suggestions.length)]
      ].filter((item, index, arr) => arr.indexOf(item) === index),
      confidence: Math.floor(Math.random() * 30) + 70 // 70-100%
    };
  };

  // Generate detailed analysis data
  const generateAnalysisDetails = (): AnalysisDetails => {
    return {
      riskBreakdown: [
        { category: 'Factual Accuracy', percentage: 35, color: 'bg-red-500' },
        { category: 'Source Reliability', percentage: 25, color: 'bg-orange-500' },
        { category: 'Logical Consistency', percentage: 20, color: 'bg-yellow-500' },
        { category: 'Temporal Accuracy', percentage: 15, color: 'bg-blue-500' },
        { category: 'Statistical Claims', percentage: 5, color: 'bg-purple-500' }
      ],
      temporalAnalysis: [
        { period: 'Recent (2024)', confidence: 85 },
        { period: '2020-2023', confidence: 70 },
        { period: '2015-2019', confidence: 45 },
        { period: 'Before 2015', confidence: 20 }
      ],
      sourceReliability: [
        { type: 'Academic Papers', count: 12, reliability: 95 },
        { type: 'News Articles', count: 8, reliability: 75 },
        { type: 'Websites', count: 15, reliability: 60 },
        { type: 'Social Media', count: 5, reliability: 30 }
      ],
      logicalConsistency: [
        { aspect: 'Internal Logic', score: 78 },
        { aspect: 'Cause & Effect', score: 82 },
        { aspect: 'Timeline Coherence', score: 65 },
        { aspect: 'Statistical Validity', score: 70 }
      ]
    };
  };

  // Simulate analysis process or use provided analysis
  useEffect(() => {
    if (isAnalyzing && originalText) {
      // Reset state
      setProgress(0);
      setAnalyzedText('');
      setHallucinationProbability(0);
      setRiskyTokens([]);
      setAnalysisError('');
      setExpandedTokens(new Set());
      setAnalysisDetails(null);

      // Check minimum token requirement
      if (!meetsMinimumRequirement) {
        setAnalysisError(`Input contains only ${tokenCount} tokens. Minimum 100 tokens required for analysis.`);
        setProgress(100);
        return;
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            performAnalysis();
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(progressInterval);
    } else if (analysis && !isAnalyzing) {
      // Use provided analysis data
      performAnalysisFromBackend();
    }
  }, [isAnalyzing, originalText, analysis, meetsMinimumRequirement, tokenCount]);

  const performAnalysisFromBackend = () => {
    if (!analysis) return;

    // Use backend analysis data
    if (analysis.annotated_prompt) {
      setAnalyzedText(analysis.annotated_prompt);
    } else {
      setAnalyzedText(originalText);
    }

    // Use backend probability or generate one
    const probability = analysis.overall_confidence 
      ? Math.round((1 - analysis.overall_confidence) * 100)
      : Math.floor(Math.random() * 100);
    setHallucinationProbability(probability);

    // Generate analysis details
    setAnalysisDetails(generateAnalysisDetails());

    // Generate risky tokens
    const tokens = originalText.split(' ');
    const randomTokens: RiskyToken[] = [];
    
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * tokens.length);
      const token = tokens[randomIndex];
      if (token && token.length > 2 && !randomTokens.find(t => t.token === token)) {
        const risk = Math.floor(Math.random() * 40) + 60; // 60-100% risk
        const details = generateTokenDetails(token, risk);
        randomTokens.push({
          token: token.replace(/[.,!?;]/g, ''),
          risk,
          position: randomIndex,
          ...details
        });
      }
    }

    setRiskyTokens(randomTokens.sort((a, b) => b.risk - a.risk));
  };

  const performAnalysis = () => {
    // Use original text as-is (no expansion)
    setAnalyzedText(originalText);

    // Generate random hallucination probability
    const probability = Math.floor(Math.random() * 100);
    setHallucinationProbability(probability);

    // Generate analysis details
    setAnalysisDetails(generateAnalysisDetails());

    // Generate risky tokens with detailed information
    const tokens = originalText.split(' ');
    const randomTokens: RiskyToken[] = [];
    
    for (let i = 0; i < 5; i++) { // Increased to 5 tokens
      const randomIndex = Math.floor(Math.random() * tokens.length);
      const token = tokens[randomIndex];
      if (token && token.length > 2 && !randomTokens.find(t => t.token === token)) {
        const risk = Math.floor(Math.random() * 40) + 60; // 60-100% risk
        const details = generateTokenDetails(token, risk);
        randomTokens.push({
          token: token.replace(/[.,!?;]/g, ''),
          risk,
          position: randomIndex,
          ...details
        });
      }
    }

    setRiskyTokens(randomTokens.sort((a, b) => b.risk - a.risk));
  };

  const highlightText = (text: string) => {
    // If we have backend annotated text, render it with proper highlighting
    if (analysis?.annotated_prompt && text === analysis.annotated_prompt) {
      return renderAnnotatedText(text);
    }

    // Otherwise, use the original highlighting logic
    const words = text.split(' ');
    const midPoint = Math.floor(words.length / 2);
    
    const firstHalf = words.slice(0, midPoint).join(' ');
    const secondHalf = words.slice(midPoint).join(' ');

    return (
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-1 py-0.5 rounded">
          {firstHalf}
        </span>
        <span className="ml-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-1 py-0.5 rounded">
          {secondHalf}
        </span>
      </div>
    );
  };

  const renderAnnotatedText = (text: string) => {
    const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const parts = safe
      .replace(/&lt;r&gt;/gi, "%%RSTART%%")
      .replace(/&lt;\/r&gt;/gi, "%%REND%%")
      .replace(/&lt;y&gt;/gi, "%%YSTART%%")
      .replace(/&lt;\/y&gt;/gi, "%%YEND%%")
      .split(/(%%RSTART%%|%%REND%%|%%YSTART%%|%%YEND%%)/);

    const out: React.ReactNode[] = [];
    let buf = "";
    let mode: "none" | "red" | "yellow" = "none";

    const flush = () => {
      if (!buf) return;
      if (mode === "red") {
        out.push(
          <span
            key={out.length}
            className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-1 rounded font-medium"
          >
            {buf}
          </span>
        );
      } else if (mode === "yellow") {
        out.push(
          <span
            key={out.length}
            className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-1 rounded"
          >
            {buf}
          </span>
        );
      } else {
        out.push(<span key={out.length}>{buf}</span>);
      }
      buf = "";
    };

    for (const p of parts) {
      if (p === "%%RSTART%%") {
        flush();
        mode = "red";
        continue;
      }
      if (p === "%%REND%%") {
        flush();
        mode = "none";
        continue;
      }
      if (p === "%%YSTART%%") {
        flush();
        mode = "yellow";
        continue;
      }
      if (p === "%%YEND%%") {
        flush();
        mode = "none";
        continue;
      }
      buf += p;
    }
    flush();
    return <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono">{out}</div>;
  };

  const getCircleColor = (percentage: number) => {
    if (percentage >= 70) return 'text-red-500';
    if (percentage >= 40) return 'text-orange-500';
    return 'text-green-500';
  };

  const getCircleStroke = (percentage: number) => {
    if (percentage >= 70) return 'stroke-red-500';
    if (percentage >= 40) return 'stroke-orange-500';
    return 'stroke-green-500';
  };

  // Modal Component for Detailed Risk Analysis
  const RiskAnalysisModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Detailed Risk Analysis
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowRiskModal(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Risk Breakdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Risk Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisDetails?.riskBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${item.color}`}></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-8">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional analysis details... */}
            {/* (Keep the rest of your modal content) */}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  // Modal Component for Expanded Tokens
  const TokensModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              High-Risk Tokens Analysis
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowTokensModal(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(90vh-80px)]">
          <div className="p-6 space-y-4">
            {riskyTokens.map((token, index) => (
              <Card key={index} className="border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        index === 1 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          "{token.token}"
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Position: {token.position} • Category: {token.category}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={index === 0 ? 'destructive' : index === 1 ? 'default' : 'secondary'}
                      className="text-sm px-3 py-1"
                    >
                      {token.risk}% Risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Info className="w-4 h-4 text-blue-500" />
                      Risk Explanation
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {token.explanation}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Confidence Level</span>
                    <Badge variant="outline" className="text-sm">{token.confidence}%</Badge>
                  </div>
                  
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Improvement Suggestions
                    </h4>
                    <ul className="space-y-2">
                      {token.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  if (!originalText) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Ready for Analysis
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Enter your prompt and click "Analyze" to detect potential hallucinations
          </p>
        </div>
      </div>
    );
  }

  const backgroundGradient = getGradientBackground(hallucinationProbability);

  return (
    <div className={`h-full flex flex-col transition-all duration-1000 ${backgroundGradient}`} data-analysis-section="true">
      {/* Header */}
      <div className="relative p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-white/20 dark:border-gray-800/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBackToEditor && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToEditor}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                Hallucination Analysis
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {tokenCount} tokens • {meetsMinimumRequirement ? 'Ready for analysis' : 'Below minimum requirement'}
              </p>
            </div>
          </div>
          {isAnalyzing && (
            <div className="flex items-center gap-3">
              <Progress value={progress} className="w-24 h-2" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {progress}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content - Fixed Height Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Text Analysis - Top Half with Fixed Height */}
        <div className="h-1/2 p-4 flex-shrink-0">
          <Card className="h-full border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Analyzed Text
                <Badge variant={meetsMinimumRequirement ? "outline" : "destructive"} className="ml-auto">
                  {tokenCount} tokens
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pb-6">
              {analysisError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                      Analysis Not Possible
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      {analysisError}
                    </p>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-xs text-red-600 dark:text-red-400">
                        <strong>Tip:</strong> Add more content to reach the minimum token requirement. 
                        Current input needs {100 - tokenCount} more tokens.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="pr-4">
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-center">
                          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Analyzing for hallucinations...
                          </p>
                        </div>
                      </div>
                    ) : analyzedText ? (
                      highlightText(analyzedText)
                    ) : (
                      <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                        <p className="text-sm">Analysis will appear here</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics - Bottom Half with Fixed Height */}
        <div className="h-1/2 p-4 pt-0 flex-shrink-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Hallucination Probability Circle - Now Expandable */}
            <Card className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Hallucination Risk
                  </CardTitle>
                  {!analysisError && analysisDetails && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowRiskModal(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center min-h-0">
                {analysisError ? (
                  <div className="text-center text-gray-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Analysis required</p>
                  </div>
                ) : (
                  <div className="relative">
                    <svg className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - hallucinationProbability / 100)}`}
                        className={`transition-all duration-1000 ${getCircleStroke(hallucinationProbability)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-xl sm:text-2xl font-bold ${getCircleColor(hallucinationProbability)}`}>
                          {hallucinationProbability}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Risk Level
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risky Tokens - Now Expandable */}
            <Card className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    High-Risk Tokens
                  </CardTitle>
                  {riskyTokens.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowTokensModal(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 pb-6">
                <div className="h-full">
                  {analysisError ? (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Analysis required</p>
                    </div>
                  ) : riskyTokens.length > 0 ? (
                    <div className="space-y-2">
                      {riskyTokens.slice(0, 3).map((token, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                              index === 1 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                                "{token.token}"
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {token.category}
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant={index === 0 ? 'destructive' : index === 1 ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {token.risk}%
                          </Badge>
                        </div>
                      ))}
                      {riskyTokens.length > 3 && (
                        <div className="text-center pt-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowTokensModal(true)}
                            className="text-xs text-purple-600 hover:text-purple-700"
                          >
                            +{riskyTokens.length - 3} more tokens
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Run analysis to identify risky tokens</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRiskModal && <RiskAnalysisModal />}
      {showTokensModal && <TokensModal />}
    </div>
  );
};

export default AnalysisSection;