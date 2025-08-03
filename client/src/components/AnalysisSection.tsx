import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Brain, 
  Target, 
  TrendingUp,
  Zap,
  Eye,
  AlertCircle
} from 'lucide-react';

interface AnalysisSectionProps {
  originalText: string;
  isAnalyzing: boolean;
}

interface RiskyToken {
  token: string;
  risk: number;
  position: number;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({ originalText, isAnalyzing }) => {
  const [analyzedText, setAnalyzedText] = useState<string>('');
  const [hallucinationProbability, setHallucinationProbability] = useState<number>(0);
  const [riskyTokens, setRiskyTokens] = useState<RiskyToken[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [analysisError, setAnalysisError] = useState<string>('');

  // Check if text meets minimum token requirement
  const getTokenCount = (text: string) => text.split(/\s+/).filter(word => word.length > 0).length;
  const tokenCount = getTokenCount(originalText);
  const meetsMinimumRequirement = tokenCount >= 1000;

  // Simulate analysis process
  useEffect(() => {
    if (isAnalyzing && originalText) {
      // Reset state
      setProgress(0);
      setAnalyzedText('');
      setHallucinationProbability(0);
      setRiskyTokens([]);
      setAnalysisError('');

      // Check minimum token requirement
      if (!meetsMinimumRequirement) {
        setAnalysisError(`Input contains only ${tokenCount} tokens. Minimum 1000 tokens required for analysis.`);
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
    }
  }, [isAnalyzing, originalText, meetsMinimumRequirement, tokenCount]);

  const performAnalysis = () => {
    // Use original text as-is (no expansion)
    setAnalyzedText(originalText);

    // Generate random hallucination probability
    const probability = Math.floor(Math.random() * 100);
    setHallucinationProbability(probability);

    // Generate risky tokens
    const tokens = originalText.split(' ');
    const randomTokens: RiskyToken[] = [];
    
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * tokens.length);
      const token = tokens[randomIndex];
      if (token && token.length > 2 && !randomTokens.find(t => t.token === token)) {
        randomTokens.push({
          token: token.replace(/[.,!?;]/g, ''),
          risk: Math.floor(Math.random() * 40) + 60, // 60-100% risk
          position: randomIndex
        });
      }
    }

    setRiskyTokens(randomTokens.sort((a, b) => b.risk - a.risk));
  };

  const highlightText = (text: string) => {
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

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="relative p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-white/20 dark:border-gray-800/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          <Card className="h-full border-gray-200 dark:border-gray-700 flex flex-col">
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
                        Current input needs {1000 - tokenCount} more tokens.
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
                          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
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
            {/* Hallucination Probability Circle */}
            <Card className="border-gray-200 dark:border-gray-700 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Hallucination Risk
                </CardTitle>
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

            {/* Risky Tokens */}
            <Card className="border-gray-200 dark:border-gray-700 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  High-Risk Tokens
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 pb-6">
                <ScrollArea className="h-full">
                  <div className="space-y-3 pr-4">
                    {analysisError ? (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Analysis required</p>
                      </div>
                    ) : riskyTokens.length > 0 ? (
                      riskyTokens.map((token, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              index === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                              index === 1 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                "{token.token}"
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Position: {token.position}
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant={index === 0 ? 'destructive' : index === 1 ? 'default' : 'secondary'}
                            className="flex-shrink-0 ml-2"
                          >
                            {token.risk}%
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Run analysis to identify risky tokens</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSection;