import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Brain, AlertTriangle, CheckCircle } from 'lucide-react';
import RiskTokensSection from './RiskTokensSection';
import type { PromptAnalysis } from '../types'; // Changed from "../App"

interface AnalysisViewProps {
  analysis: PromptAnalysis | null;
  isLoading?: boolean;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Analyzing prompt...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No analysis available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Function to render annotated prompt with risk token highlighting
  const renderAnnotatedPrompt = (annotatedPrompt: string) => {
    if (!annotatedPrompt) return null;

    // First, decode HTML entities
    const decodedPrompt = annotatedPrompt
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Helper function to get risk level colors
    const getRiskColors = (riskLevel?: string) => {
      switch (riskLevel) {
        case 'high':
          return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
        case 'medium':
          return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
        default:
          // For low risk or unknown, don't highlight - just return normal text styling
          return '';
      }
    };

    // Replace RISK_ID tags with highlighted spans
    const parts = decodedPrompt.split(/(<RISK_\d+>.*?<\/RISK_\d+>)/g);
    
    return (
      <div className="whitespace-pre-wrap text-sm">
        {parts.map((part, index) => {
          const riskMatch = part.match(/<RISK_(\d+)>(.*?)<\/RISK_\d+>/);
          if (riskMatch) {
            const [, riskId, text] = riskMatch;
            
            // Debug: Log all risk tokens on first render
            if (index === 0 && analysis?.risk_tokens) {
              console.log('=== DEBUGGING RISK TOKENS ===');
              console.log('All risk tokens:', analysis.risk_tokens.map(t => ({id: t.id, risk_level: t.risk_level, text: t.text})));
              console.log('Annotated prompt sample:', annotatedPrompt.substring(0, 200));
            }
            
            // Find the corresponding risk token to get the risk level
            const riskToken = analysis?.risk_tokens?.find(token => token.id === riskId);
            const riskLevel = riskToken?.risk_level;
            const colors = getRiskColors(riskLevel);
            
            // Debug logging to understand what's happening
            console.log(`Risk Token ${riskId}: level="${riskLevel}", found=${!!riskToken}, colors="${colors}", hasColors=${!!colors}`);
            
            // Only apply highlighting for high and medium risk
            if (colors && colors.length > 0) {
              console.log(`→ Highlighting ${riskId} as ${riskLevel}`);
              return (
                <span
                  key={index}
                  className={`${colors} px-1 py-0.5 rounded border font-medium`}
                  title={`Risk Token ${riskId} (${riskLevel} risk)`}
                >
                  {text}
                </span>
              );
            } else {
              console.log(`→ NOT highlighting ${riskId} (level: ${riskLevel})`);
              // For low risk or no highlighting needed, return plain text
              return <span key={index}>{text}</span>;
            }
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.analysisSummary && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm">{analysis.analysisSummary}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Badge variant="outline">
              Confidence: {Math.round(analysis.overallConfidence * 100)}%
            </Badge>
            <Badge variant="secondary">
              Issues: {analysis.totalFlagged}
            </Badge>
            {analysis.risk_tokens && (
              <Badge variant="destructive">
                Risk Tokens: {analysis.risk_tokens.length}
              </Badge>
            )}
          </div>

          {analysis.annotated_prompt && (
            <div className="border rounded-lg p-4 bg-muted/20">
              <h3 className="text-sm font-medium mb-2">Highlighted Prompt:</h3>
              <ScrollArea className="h-[200px]">
                {renderAnnotatedPrompt(analysis.annotated_prompt)}
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Tokens Section */}
      {analysis.risk_tokens && analysis.risk_tokens.length > 0 && (
        <RiskTokensSection riskTokens={analysis.risk_tokens} />
      )}
    </div>
  );
};

export default AnalysisView;