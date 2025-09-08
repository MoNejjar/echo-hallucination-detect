import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { analyzePrompt, refineOnce, refineStream } from "./lib/api";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import { Input } from "./components/ui/input";
import { ScrollArea } from "./components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Progress } from "./components/ui/progress";
import { Badge } from "./components/ui/badge";
import { Separator } from "./components/ui/separator";
import { Loader2, Brain, MessageSquare, Sparkles, ChevronDown, ChevronUp, AlertTriangle, Tag, Lightbulb, FileText, Search, Zap, Target, Shield, ShieldAlert, ShieldX } from "lucide-react";
import type { ChatMessage, PromptAnalysis, RiskAssessment } from "./types";
import Sidebar from "./components/Sidebar";
import AnalysisSection from "./components/AnalysisSection";
import ChatPanel from "./components/ChatPanel";
import { Toaster } from 'react-hot-toast';
import ExpandableEditor from "./components/ExpandableEditor";
import Settings, { type Domain, type AnalysisMode, DOMAIN_CONFIG } from "./components/Settings";

// Render the annotated prompt by converting RISK_ID tags to styled spans
const renderAnnotated = (text: string, analysisData?: PromptAnalysis | null) => {
  console.log('🎬 [App.tsx renderAnnotated] FUNCTION CALLED with text:', text ? text.substring(0, 100) + '...' : 'null');
  console.log('🎬 [App.tsx renderAnnotated] FUNCTION CALLED with analysisData:', analysisData);
  
  if (!text) return null;

  // Get risk level colors helper function
  const getRiskColors = (riskLevel: string) => {
    console.log('🎨 Getting colors for risk level:', riskLevel);
    
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-800 dark:text-red-200',
          border: 'border-red-200 dark:border-red-700'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-800 dark:text-yellow-200',
          border: 'border-yellow-200 dark:border-yellow-700'
        };
      default:
        return null; // No highlighting for low/unknown risk
    }
  };

  console.log('🔍 [App.tsx renderAnnotated] Starting render with text:', text.substring(0, 100) + '...');
  console.log('🔍 [App.tsx renderAnnotated] Analysis data:', analysisData);
  console.log('🔍 [App.tsx renderAnnotated] Risk tokens:', analysisData?.risk_tokens);

  // First, decode HTML entities
  const decodedText = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Split by RISK_ID tags and render with highlighting
  const parts = decodedText.split(/(<RISK_\d+>.*?<\/RISK_\d+>)/g);
  
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
      {parts.map((part, index) => {
        const riskMatch = part.match(/<RISK_(\d+)>(.*?)<\/RISK_\d+>/);
        if (riskMatch) {
          const [, riskId, riskText] = riskMatch;
          
          console.log('🏷️ [App.tsx renderAnnotated] Processing risk token:', { riskId, riskText: riskText.substring(0, 50) });
          console.log('🔍 [App.tsx renderAnnotated] Available risk tokens:');
          analysisData?.risk_tokens?.forEach((token, index) => {
            console.log(`  Token ${index}:`, {
              id: token.id, 
              idType: typeof token.id,
              text: token.text?.substring(0, 30) || 'no text', 
              risk_level: token.risk_level,
              classification: token.classification
            });
          });
          
          // Find the corresponding risk token in the analysis
          const riskToken = analysisData?.risk_tokens?.find(token => token.id === `RISK_${riskId}`);
          console.log('🔍 [App.tsx renderAnnotated] Searching for riskId:', `RISK_${riskId}`, 'type:', typeof `RISK_${riskId}`);
          console.log('📊 [App.tsx renderAnnotated] Found risk token:', riskToken);
          const riskLevel = riskToken?.risk_level || 'high';
          
          console.log('🎯 [App.tsx renderAnnotated] Using risk level:', riskLevel);
          
          const colors = getRiskColors(riskLevel);
          
          if (!colors) {
            console.log('⚪ [App.tsx renderAnnotated] No highlighting for risk level:', riskLevel);
            // Return unstyled text for low/unknown risk
            return <span key={index}>{riskText}</span>;
          }
          
          console.log('🎨 [App.tsx renderAnnotated] Applying colors:', colors);
          
          return (
            <span
              key={index}
              className={`${colors.bg} ${colors.text} ${colors.border} px-1 py-0.5 rounded border font-medium`}
              title={`Risk Token ${riskId} (${riskLevel.toUpperCase()} RISK)`}
            >
              {riskText}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

// Strip tags helper for clean text
const stripTags = (text: string) => text.replace(/<\/?(?:r|y|RISK_\d+)>/gi, "");

function App() {
  console.log('🟢 APP COMPONENT LOADED - This log should always appear');
  
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isInitialRewrite, setIsInitialRewrite] = useState(false);
  const [showAnalysisSection, setShowAnalysisSection] = useState(false);
  const [riskDetailsExpanded, setRiskDetailsExpanded] = useState(false);
  const [tokensExpanded, setTokensExpanded] = useState(false);
  const [analysisResultsExpanded, setAnalysisResultsExpanded] = useState(false);
  const [domain, setDomain] = useState<Domain>('general');
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('comprehensive');

  const canAnalyze = useMemo(() => currentPrompt.trim().length > 10, [currentPrompt]);

  // Function to get risk color based on percentage
  const getRiskColor = (percentage: number) => {
    if (percentage < 50) {
      return "text-green-500"; // Low risk - Green (0-49)
    } else if (percentage < 70) {
      return "text-yellow-500"; // Medium risk - Yellow (50-69)
    } else {
      return "text-red-500"; // High risk - Red (70-100)
    }
  };

  // Function to get risk icon based on percentage
  const getRiskIcon = (percentage: number) => {
    if (percentage < 50) {
      return <Shield className="w-4 h-4 text-green-500" />; // Low risk
    } else if (percentage < 70) {
      return <ShieldAlert className="w-4 h-4 text-yellow-500" />; // Medium risk
    } else {
      return <ShieldX className="w-4 h-4 text-red-500" />; // High risk
    }
  };

  const currentRiskPercentage = riskAssessment?.overall_assessment?.percentage || 0;

  // Debug: Log riskAssessment whenever it changes
  React.useEffect(() => {
    console.log("=== RISK ASSESSMENT STATE CHANGED ===");
    console.log("riskAssessment:", riskAssessment);
    if (riskAssessment?.criteria) {
      console.log("Criteria percentages:", riskAssessment.criteria.map(c => `${c.name}: ${c.percentage}%`));
    }
    console.log("=====================================");
  }, [riskAssessment]);

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;

    // Reset session
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysis(null);
    setChatMessages([]);
    // Don't immediately show analysis section - let animation show first
    setIsInitialRewrite(false);

    try {
      // Step 1: Analysis with progress simulation
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Perform analysis with mode-specific context
      const domainContext = DOMAIN_CONFIG[domain].context;
      const analysisInstructions = analysisMode === 'simple' 
        ? '\n\nANALYSIS MODE: SIMPLE - Provide only text highlighting for potential issues. Do not include risk assessment scores or high-risk token analysis. Focus only on identifying and highlighting problematic segments in the text.'
        : '\n\nANALYSIS MODE: COMPREHENSIVE - Provide full analysis including risk assessment, high-risk tokens, and detailed highlighting with explanations.';
      
      const promptWithContext = domainContext 
        ? `${domainContext}${analysisInstructions}\n\nUSER PROMPT TO ANALYZE:\n${currentPrompt}`
        : `${analysisInstructions}\n\nUSER PROMPT TO ANALYZE:\n${currentPrompt}`;
      
      const result = await analyzePrompt(promptWithContext);
      
      // Debug: Log the actual API response
      console.log("=== API RESPONSE DEBUG ===");
      console.log("Full result:", result);
      console.log("Risk assessment:", result.risk_assessment);
      console.log("Risk tokens:", result.risk_tokens);
      console.log("=========================");
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);

      // Set risk assessment only for comprehensive mode
      if (analysisMode === 'comprehensive' && result.risk_assessment) {
        console.log("=== SETTING RISK ASSESSMENT ===");
        console.log("Analysis mode:", analysisMode);
        console.log("Result has risk_assessment:", !!result.risk_assessment);
        console.log("Risk assessment data:", JSON.stringify(result.risk_assessment, null, 2));
        console.log("Setting riskAssessment to:", result.risk_assessment);
        setRiskAssessment(result.risk_assessment);
      } else {
        console.log("=== NOT SETTING RISK ASSESSMENT ===");
        console.log("Analysis mode:", analysisMode);
        console.log("Result has risk_assessment:", !!result.risk_assessment);
        console.log("Clearing riskAssessment (simple mode or no data)");
        setRiskAssessment(null); // Clear risk assessment for simple mode
      }

      // Map to PromptAnalysis format
      const mapped: PromptAnalysis = {
        promptText: stripTags(result.annotated_prompt || currentPrompt),
        highlightedSegments: [],
        overallConfidence: 0.0,
        totalFlagged: result.risk_tokens?.length || 0,
        categories: {},
        analysisSummary: result.analysis_summary,
        annotated_prompt: result.annotated_prompt,
        risk_tokens: result.risk_tokens,
        risk_assessment: result.risk_assessment,
      };
      setAnalysis(mapped);

      // Wait a moment to show completed analysis, then switch to analysis section
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowAnalysisSection(true);

      // Step 2: Initial conversational rewrite
      setIsInitialRewrite(true);
      const initial = await refineOnce(
        currentPrompt,
        [],
        "Please rewrite this prompt to be clearer and reduce hallucination risks. Explain what changes you made and why. Format your response with clear sections showing the improved prompt and explanations."
      );

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: initial.assistant_message,
        timestamp: new Date(), // Changed from string to Date object
      };
      setChatMessages([assistantMsg]);

    } catch (err) {
      console.error("Analyze sequence failed:", err);
    } finally {
      setIsAnalyzing(false);
      setIsInitialRewrite(false);
      setAnalysisProgress(0);
    }
  }, [canAnalyze, currentPrompt]);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      const userChat: ChatMessage = {
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, userChat]);

      const id = String(Date.now());
      const placeholder: ChatMessage = {
        role: "assistant",
        content: "Thinking...",
        timestamp: new Date(),
        id,
      };
      setChatMessages((prev) => [...prev, placeholder]);

      try {
        const historyCompact = [...chatMessages, userChat].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await refineStream(currentPrompt, userMessage, historyCompact);
        
        setChatMessages((prev) => 
          prev.map((m) => 
            m.id === id ? { ...m, content: response.assistant_message } : m
          )
        );
      } catch (error) {
        setChatMessages((prev) => 
          prev.map((m) => 
            m.id === id ? { ...m, content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` } : m
          )
        );
      }
    },
    [chatMessages, currentPrompt]
  );

  const onSendMessage = (message: string) => {
    if (!message.trim()) return;
    sendMessage(message);
  };

  const handleNewAnalysis = () => {
    setCurrentPrompt("");
    setAnalysis(null);
    setChatMessages([]);
    setShowAnalysisSection(false);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setIsInitialRewrite(false);
    setRiskDetailsExpanded(false);
    setTokensExpanded(false);
    setAnalysisResultsExpanded(false);
  };

  const handleFileUpload = async (file: File) => {
    console.log('📁 File upload initiated:', file.name, file.type);
    
    // Check file type and size
    const isTextFile = file.type === 'text/plain' || 
                       file.name.endsWith('.txt') || 
                       file.name.endsWith('.md') ||
                       file.name.endsWith('.prompt');
    
    if (!isTextFile) {
      console.error('❌ Unsupported file type:', file.type);
      alert('Please upload a text file (.txt, .md, or .prompt)');
      return;
    }

    if (file.size > 1024 * 1024) { // 1MB limit
      console.error('❌ File too large:', file.size);
      alert('File size must be less than 1MB');
      return;
    }

    try {
      console.log('📖 Reading file contents...');
      const text = await file.text();
      console.log('✅ File read successfully, length:', text.length);
      
      if (text.trim().length === 0) {
        alert('The file appears to be empty');
        return;
      }
      
      setCurrentPrompt(text);
      console.log('✅ Prompt updated in editor');
      
      // Optional: show success message
      // You could add a toast notification here
      
    } catch (error) {
      console.error('❌ Error reading file:', error);
      alert('Error reading file. Please try again.');
    }
  };

  const onSend = () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatInput("");
    sendMessage(msg);
  };

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        messages={chatMessages}
        onNewAnalysis={handleNewAnalysis} 
        onUploadFile={handleFileUpload}
        isAnalyzing={isAnalyzing}
        analysis={analysis}
        riskAssessment={riskAssessment}
        originalPrompt={currentPrompt}
        improvedPrompt={chatMessages.find(msg => msg.role === 'assistant')?.content || ''}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Echo - Hallucination Detector
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered prompt analysis and refinement
                </p>
              </div>
            </div>
            {analysis && (
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <Sparkles className="w-3 h-3 mr-1" />
                Analysis Complete
              </Badge>
            )}
          </div>
        </header>

        {/* Main Interface */}
        <div className="flex-1 p-6 gap-6 grid grid-cols-1 lg:grid-cols-5 min-h-0 overflow-hidden">
          {/* Chat Panel */}
          <div className={showAnalysisSection ? "lg:col-span-3 min-h-0 overflow-hidden" : "lg:col-span-3 min-h-0 overflow-hidden"}>
            <ChatPanel 
              messages={chatMessages}
              onSendMessage={onSendMessage}
              isLoading={isInitialRewrite}
            />
          </div>

          {/* Analysis Results */}
          {showAnalysisSection && (
            <Card className="lg:col-span-2 flex flex-col overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                {analysis?.annotated_prompt ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Annotated Prompt
                          <ShieldX className="w-4 h-4 text-red-500 ml-4" />
                          High Risk
                          <ShieldAlert className="w-4 h-4 text-yellow-500 ml-2" />
                          Medium Risk
                        </h4>
                        <button 
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm flex items-center gap-1"
                          onClick={() => setAnalysisResultsExpanded(!analysisResultsExpanded)}
                        >
                          {analysisResultsExpanded ? (
                            <>Collapse <ChevronUp className="w-4 h-4" /></>
                          ) : (
                            <>Expand <ChevronDown className="w-4 h-4" /></>
                          )}
                        </button>
                      </div>
                      <ScrollArea className={analysisResultsExpanded ? "h-auto max-h-[600px]" : "h-[150px]"}>
                        <div className={`${!analysisResultsExpanded ? 'relative' : ''}`}>
                          {renderAnnotated(analysis.annotated_prompt, analysis)}
                          {!analysisResultsExpanded && (
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 dark:from-gray-800/50 to-transparent pointer-events-none" />
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                    
                    {/* Comprehensive Analysis Only - Risk Assessment and High Risk Tokens */}
                    {analysisMode === 'comprehensive' && (
                      <>
                        {/* Hallucination Risk Section */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                              <Target className="w-4 h-4 text-blue-500" />
                              Hallucination Risk Score
                            </h4>
                            <button 
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm flex items-center gap-1"
                              onClick={() => setRiskDetailsExpanded(!riskDetailsExpanded)}
                            >
                              {riskDetailsExpanded ? (
                                <>Collapse Details <ChevronUp className="w-4 h-4" /></>
                              ) : (
                                <>Expand Details <ChevronDown className="w-4 h-4" /></>
                              )}
                            </button>
                          </div>
                      <div className="bg-gray-100/50 dark:bg-gray-700/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Overall Risk Assessment
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-16">
                              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="transparent"
                                  className="text-gray-200 dark:text-gray-600"
                                />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="transparent"
                                  strokeDasharray={`${2 * Math.PI * 40}`}
                                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - currentRiskPercentage / 100)}`}
                                  className={`${getRiskColor(currentRiskPercentage)} transition-all duration-1000`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                  {currentRiskPercentage}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded Risk Details */}
                      {riskDetailsExpanded && (
                        <div className="mt-4 space-y-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                          <h5 className="font-semibold text-gray-800 dark:text-gray-200">Risk Assessment Criteria</h5>
                          
                          <div className="space-y-3">
                            {riskAssessment?.criteria?.length ? (
                              riskAssessment.criteria.map((criterion, index) => {
                                return (
                                  <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900/50 rounded-lg">
                                    <div className="flex-1 pr-4">
                                      <div className="font-medium text-sm text-gray-800 dark:text-gray-200">{criterion.name}</div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400">{criterion.description}</div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <div className="relative w-12 h-12">
                                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 100 100">
                                          <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-gray-200 dark:text-gray-600"
                                          />
                                          <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={`${2 * Math.PI * 40}`}
                                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - criterion.percentage / 100)}`}
                                            className={`${getRiskColor(criterion.percentage)} transition-all duration-1000`}
                                            strokeLinecap="round"
                                          />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                            {criterion.percentage}%
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900/50 rounded-lg">
                                <div>
                                  <div className="font-medium text-sm text-gray-800 dark:text-gray-200">No risk criteria available</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">Run analysis to see detailed risk assessment</div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Overall Assessment</div>
                            <div className="text-xs text-blue-700 dark:text-blue-400">
                              {riskAssessment?.overall_assessment?.description || 
                               "Run analysis to see detailed assessment of hallucination risks."}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* High Risk Tokens Section */}
                    {analysis.risk_tokens && analysis.risk_tokens.length > 0 ? (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            High Risk Tokens ({analysis.risk_tokens.length})
                          </h4>
                          <button 
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm flex items-center gap-1"
                            onClick={() => setTokensExpanded(!tokensExpanded)}
                          >
                            {tokensExpanded ? (
                              <>Collapse Analysis <ChevronUp className="w-4 h-4" /></>
                            ) : (
                              <>Expand Analysis <ChevronDown className="w-4 h-4" /></>
                            )}
                          </button>
                        </div>
                        
                        {!tokensExpanded ? (
                          <div className="space-y-2">
                            {analysis.risk_tokens.slice(0, 3).map((token, index) => (
                              <div key={token.id} className="flex items-center gap-2 text-sm">
                                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded font-mono">
                                  "{token.text}"
                                </span>
                                <span className="text-gray-700 dark:text-gray-300">
                                  {token.classification}
                                </span>
                              </div>
                            ))}
                            {analysis.risk_tokens.length > 3 && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                ... and {analysis.risk_tokens.length - 3} more tokens
                              </div>
                            )}
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              Click expand to see detailed analysis and suggestions
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {analysis.risk_tokens.map((token) => {
                              const getRiskBadgeVariant = (riskLevel?: string) => {
                                switch (riskLevel) {
                                  case 'high':
                                    return 'destructive' as const;
                                  case 'medium':
                                    return 'secondary' as const;
                                  case 'low':
                                    return 'outline' as const;
                                  default:
                                    return 'secondary' as const;
                                }
                              };

                              const getRiskColors = (riskLevel?: string) => {
                                switch (riskLevel) {
                                  case 'high':
                                    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
                                  case 'medium':
                                    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
                                  case 'low':
                                    return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
                                  default:
                                    return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
                                }
                              };

                              return (
                                <div key={token.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                  <div className="flex items-center gap-3 mb-4">
                                    <span className={`px-3 py-1 ${getRiskColors(token.risk_level)} rounded font-mono text-lg`}>
                                      "{token.text}"
                                    </span>
                                    {token.risk_level && (
                                      <Badge variant={getRiskBadgeVariant(token.risk_level)} className="text-xs">
                                        {token.risk_level.charAt(0).toUpperCase() + token.risk_level.slice(1)} Risk
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-4">
                                    {/* Reasoning Section */}
                                    <div className="flex gap-3">
                                      <div className="flex-shrink-0 mt-0.5">
                                        <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                      </div>
                                      <div>
                                        <div className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1">Reasoning</div>
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                          {token.reasoning}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Classification Section */}
                                    <div className="flex gap-3">
                                      <div className="flex-shrink-0 mt-0.5">
                                        <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <div>
                                        <div className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1">Classification</div>
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                          {token.classification}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Mitigation Section */}
                                    <div className="flex gap-3">
                                      <div className="flex-shrink-0 mt-0.5">
                                        <Lightbulb className="w-4 h-4 text-green-600 dark:text-green-400" />
                                      </div>
                                      <div>
                                        <div className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1">Mitigation</div>
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                          {token.mitigation}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : analysisMode === 'comprehensive' ? (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-gray-400" />
                          <h4 className="font-medium text-gray-600 dark:text-gray-400">High Risk Tokens</h4>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          No high-risk tokens identified in this prompt.
                        </div>
                      </div>
                    ) : null}
                    </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Run analysis to see highlighted results
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Prompt Editor - Only shown when analysis section is not visible */}
          {!showAnalysisSection && (
            <>
              <Card className="lg:col-span-2 flex flex-col overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Prompt Editor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 overflow-auto">
                  <ExpandableEditor
                    prompt={currentPrompt}
                    onChange={setCurrentPrompt}
                    placeholder="Enter your prompt here for hallucination analysis..."
                    disabled={isAnalyzing}
                    className="flex-1"
                  />

                  {/* Settings Panel - Compact version below editor */}
                  <Settings
                    domain={domain}
                    onDomainChange={setDomain}
                    analysisMode={analysisMode}
                    onAnalysisModeChange={setAnalysisMode}
                  />
                  
                  <div className="flex items-center justify-end">
                    <Button
                      onClick={handleAnalyze}
                      disabled={!canAnalyze || isAnalyzing}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Analyze
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Analysis Progress in Prompt Editor */}
                  {isAnalyzing && (
                    <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
                          <div className="absolute inset-0 w-6 h-6 border-2 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-blue-900 dark:text-blue-100">
                            AI Analysis in Progress
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-300">
                            {analysisProgress < 20 ? (
                              <span className="flex items-center gap-1">
                                <Search className="w-3 h-3" />
                                Analyzing referential ambiguity...
                              </span>
                            ) : analysisProgress < 40 ? (
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                Checking context sufficiency...
                              </span>
                            ) : analysisProgress < 60 ? (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Evaluating instruction structure...
                              </span>
                            ) : analysisProgress < 80 ? (
                              <span className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Verifying factual claims...
                              </span>
                            ) : analysisProgress < 90 ? (
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Assessing reasoning patterns...
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Brain className="w-3 h-3" />
                                {isInitialRewrite ? "Generating improvements..." : "Finalizing analysis..."}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {Math.round(analysisProgress)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Progress value={analysisProgress} className="h-3 bg-blue-100 dark:bg-blue-900/50" />
                        
                        {/* Analysis Steps */}
                        <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mt-2">
                          <div className={`flex items-center gap-1 ${analysisProgress >= 25 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-2 h-2 rounded-full ${analysisProgress >= 25 ? 'bg-blue-500' : 'bg-blue-200 dark:bg-blue-800'}`}></div>
                            <span>Scan</span>
                          </div>
                          <div className={`flex items-center gap-1 ${analysisProgress >= 50 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-2 h-2 rounded-full ${analysisProgress >= 50 ? 'bg-blue-500' : 'bg-blue-200 dark:bg-blue-800'}`}></div>
                            <span>Analyze</span>
                          </div>
                          <div className={`flex items-center gap-1 ${analysisProgress >= 75 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-2 h-2 rounded-full ${analysisProgress >= 75 ? 'bg-blue-500' : 'bg-blue-200 dark:bg-blue-800'}`}></div>
                            <span>Calculate</span>
                          </div>
                          <div className={`flex items-center gap-1 ${analysisProgress >= 100 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-2 h-2 rounded-full ${analysisProgress >= 100 ? 'bg-green-500' : 'bg-blue-200 dark:bg-blue-800'}`}></div>
                            <span>Complete</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;