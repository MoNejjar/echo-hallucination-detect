import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { analyzePrompt, refineOnce, openRefineSSE } from "./lib/api";
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
import ExpandableEditor from "./components/ExpandableEditor";
import Settings, { type Domain, DOMAIN_CONFIG } from "./components/Settings";

// Render the annotated prompt by converting <r>/<y> tags to styled spans
const renderAnnotated = (text: string) => {
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

// Strip tags helper for clean text
const stripTags = (text: string) => text.replace(/<\/?(?:r|y)>/gi, "");

function App() {
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

  const eventSourceRef = useRef<EventSource | null>(null);

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

  const currentRiskPercentage = riskAssessment?.overall_assessment?.percentage || 65;

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

      // Perform analysis
      const domainContext = DOMAIN_CONFIG[domain].context;
      const promptWithContext = domainContext 
        ? `${domainContext}\n\nUSER PROMPT TO ANALYZE:\n${currentPrompt}`
        : currentPrompt;
      
      const result = await analyzePrompt(promptWithContext);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);

      // Set risk assessment if available
      if (result.risk_assessment) {
        setRiskAssessment(result.risk_assessment);
      }

      // Map to PromptAnalysis format
      const mapped: PromptAnalysis = {
        promptText: stripTags(result.annotated_prompt || currentPrompt),
        highlightedSegments: [],
        overallConfidence: 0.0,
        totalFlagged: 0,
        categories: {},
        analysisSummary: result.analysis_summary,
        annotated_prompt: result.annotated_prompt,
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

  const startStream = useCallback(
    (userMessage: string) => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      const userChat: ChatMessage = {
        role: "user",
        content: userMessage,
        timestamp: new Date(), // Changed from string to Date object
      };
      setChatMessages((prev) => [...prev, userChat]);

      const id = String(Date.now());
      const placeholder: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date(), // Changed from string to Date object
        id,
      };
      setChatMessages((prev) => [...prev, placeholder]);

      const historyCompact = [...chatMessages, userChat].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const es = openRefineSSE(currentPrompt, userMessage, historyCompact);
      eventSourceRef.current = es;

      let acc = "";
      es.onmessage = (e) => {
        acc += e.data;
        setChatMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: acc } : m)));
      };
      es.addEventListener("done", () => {
        es.close();
        eventSourceRef.current = null;
      });
      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
      };
    },
    [chatMessages, currentPrompt]
  );

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  const onSendMessage = (message: string) => {
    if (!message.trim()) return;
    startStream(message);
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
    startStream(msg);
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
                          {renderAnnotated(analysis.annotated_prompt)}
                          {!analysisResultsExpanded && (
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 dark:from-gray-800/50 to-transparent pointer-events-none" />
                          )}
                        </div>
                      </ScrollArea>
                    </div>
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
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          High Risk Tokens (3)
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
                          <div className="flex items-center gap-2 text-sm">
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded font-mono">
                              "this"
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">
                              Ambiguous reference
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded font-mono">
                              "many"
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">
                              Vague quantifier
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                            Click expand to see detailed analysis and suggestions
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Token 1: "this" */}
                          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded font-mono text-lg">
                                "this"
                              </span>
                              <Badge variant="destructive" className="text-xs">High Risk</Badge>
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
                                    Ambiguous pronoun that lacks clear antecedent, making it unclear what specific object or concept is being referenced.
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
                                    Ambiguous Reference
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
                                    Replace "this" with the specific noun or concept being referenced. For example: "this algorithm" to "the sorting algorithm" or "this approach" to "the machine learning approach"
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Token 2: "many" */}
                          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded font-mono text-lg">
                                "many"
                              </span>
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Medium Risk</Badge>
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
                                    Vague quantifier that provides no specific numerical information, leading to subjective interpretation.
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
                                    Vague Quantifier
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
                                    Specify exact numbers or ranges. For example: "many users" to "over 1,000 users" or "many options" to "5-10 different options"
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Token 3: "significant" */}
                          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded font-mono text-lg">
                                "significant"
                              </span>
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Medium Risk</Badge>
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
                                    Subjective adjective that can be interpreted differently depending on context and perspective.
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
                                    Subjective Qualifier
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
                                    Define what constitutes "significant" with measurable criteria. For example: "significant improvement" to "20% performance improvement" or "statistically significant with p less than 0.05"
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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
                            {analysisProgress < 30 ? (
                              <span className="flex items-center gap-1">
                                <Search className="w-3 h-3" />
                                Scanning for ambiguous references...
                              </span>
                            ) : analysisProgress < 60 ? (
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                Identifying vague quantifiers...
                              </span>
                            ) : analysisProgress < 90 ? (
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Calculating hallucination risk...
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
    </div>
  );
}

export default App;