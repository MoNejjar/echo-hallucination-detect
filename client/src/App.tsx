import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { analyzePrompt, refineStream, preparePrompt, initiatePrompt } from "./lib/api";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import { ScrollArea } from "./components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Progress } from "./components/ui/progress";
import { Badge } from "./components/ui/badge";
import { Separator } from "./components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { Loader2, Brain, MessageSquare, Sparkles, ChevronDown, ChevronUp, AlertTriangle, Tag, Lightbulb, FileText, Search, Zap, Target, Shield, ShieldAlert, ShieldX, Highlighter, MessageSquareWarning, Atom, Filter, ChartSpline, HelpCircle, X, WholeWord, ScrollText } from "lucide-react";
import type { ChatMessage, PromptAnalysis, RiskAssessment, InitiateResponse, PrepareVariation } from "./types";
import Sidebar from "./components/Sidebar";
import AnalysisSection from "./components/AnalysisSection";
import ChatPanel from "./components/ChatPanel";
import Toolbar from "./components/Toolbar";
import AnalysisModeToggle, { type AnalysisMode } from "./components/AnalysisModeToggle";
import { ReanalyzeDialog } from "./components/ReanalyzeDialog";
import { AnalysisLoadingDialog } from "./components/AnalysisLoadingDialog";
import ExpandableEditor from "./components/ExpandableEditor";
import { motion, AnimatePresence } from "framer-motion";

// Render the annotated prompt by converting RISK_ID tags to styled spans
const renderAnnotated = (text: string, analysisData?: PromptAnalysis | null, filter: Set<'medium' | 'high' | 'critical'> = new Set(['medium', 'high', 'critical'])) => {
  console.log('🎬 [App.tsx renderAnnotated] FUNCTION CALLED with text:', text ? text.substring(0, 100) + '...' : 'null');
  console.log('🎬 [App.tsx renderAnnotated] FUNCTION CALLED with analysisData:', analysisData);
  console.log('🔍 [App.tsx renderAnnotated] Filter:', Array.from(filter));
  
  if (!text) return null;

  // Get risk level colors helper function
  const getRiskColors = (riskLevel: string) => {
    console.log('🎨 Getting colors for risk level:', riskLevel);
    
    switch (riskLevel.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-800 dark:text-red-200',
          border: 'border-red-200 dark:border-red-700'
        };
      case 'high':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/30',
          text: 'text-orange-800 dark:text-orange-200',
          border: 'border-orange-200 dark:border-orange-700'
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
          
          // Apply filter: only highlight tokens matching the active filters
          if (!filter.has(riskLevel.toLowerCase() as 'medium' | 'high' | 'critical')) {
            console.log('🚫 [App.tsx renderAnnotated] Filtered out - not in active filters:', Array.from(filter));
            return <span key={index}>{riskText}</span>;
          }
          
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
  const [metaDetailsExpanded, setMetaDetailsExpanded] = useState(false);
  const [tokensExpanded, setTokensExpanded] = useState(false);
  const [analysisResultsExpanded, setAnalysisResultsExpanded] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('comprehensive');
  const [riskLevelFilter, setRiskLevelFilter] = useState<Set<'medium' | 'high' | 'critical'>>(new Set(['medium', 'high', 'critical']));
  const [currentHallucinationMode, setCurrentHallucinationMode] = useState<'faithfulness' | 'factuality' | 'both'>('both');
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showReanalyzeDialog, setShowReanalyzeDialog] = useState(false);
  const [isPreparingReanalysis, setIsPreparingReanalysis] = useState(false);
  const [showConversationWarning, setShowConversationWarning] = useState(false);
  // Initiator outputs
  const [initiatorClarifyingQuestion, setInitiatorClarifyingQuestion] = useState<string | null>(null);
  const [initiatorMitigationOverview, setInitiatorMitigationOverview] = useState<string | null>(null);
  const [preparedVariations, setPreparedVariations] = useState<PrepareVariation[] | null>(null);

  // Check if prompt has at least 3 tokens (words) to enable analyze button
  const canAnalyze = useMemo(() => {
    const tokens = currentPrompt.trim().split(/\s+/).filter(t => t.length > 0);
    return tokens.length >= 3;
  }, [currentPrompt]);
  
  // Track conversation length for warning
  React.useEffect(() => {
    const userMessages = chatMessages.filter(m => m.role === 'user').length;
    setShowConversationWarning(userMessages >= 5 && analysis !== null);
  }, [chatMessages, analysis]);

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

  // Run initiator
  

  // Debug: Log riskAssessment whenever it changes
  React.useEffect(() => {
    console.log("=== RISK ASSESSMENT STATE CHANGED (PRD) ===");
    console.log("riskAssessment:", riskAssessment);
    if (riskAssessment?.prompt) {
      console.log("Prompt PRD:", riskAssessment.prompt.prompt_PRD);
      console.log("Prompt violations:", riskAssessment.prompt.prompt_violations?.length || 0);
    }
    if (riskAssessment?.meta) {
      console.log("Meta PRD:", riskAssessment.meta.meta_PRD);
      console.log("Meta violations:", riskAssessment.meta.meta_violations?.length || 0);
    }
    console.log("=====================================");
  }, [riskAssessment]);

  const handleAnalyze = useCallback(async (hallucinationMode: 'faithfulness' | 'factuality' | 'both' = 'both', promptOverride?: string) => {
    if (!canAnalyze) return;

    // Use the override prompt if provided, otherwise use currentPrompt
  const promptToAnalyze = promptOverride !== undefined ? promptOverride : currentPrompt;
  const originalUserPrompt = promptToAnalyze; // used for initiator

    // Track the current hallucination mode
    setCurrentHallucinationMode(hallucinationMode);

    // Reset session
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysis(null);
  setChatMessages([]);
  setInitiatorClarifyingQuestion(null);
  setInitiatorMitigationOverview(null);
  setPreparedVariations(null);
    // Don't immediately show analysis section - let animation show first
    setIsInitialRewrite(false);

    try {
      // Add 6 seconds delay before starting actual analysis
      await new Promise(resolve => setTimeout(resolve, 6000));

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

      // Perform analysis with mode-specific instructions
      const analysisInstructions = analysisMode === 'simple' 
        ? '\n\nANALYSIS MODE: SIMPLE - Provide only text highlighting for potential issues. Do not include risk assessment scores or high-risk token analysis. Focus only on identifying and highlighting problematic segments in the text.'
        : '\n\nANALYSIS MODE: COMPREHENSIVE - Provide full analysis including risk assessment, high-risk tokens, and detailed highlighting with explanations.';
      
      const promptWithContext = `${analysisInstructions}\n\nUSER PROMPT TO ANALYZE:\n${promptToAnalyze}`;
      
  const result = await analyzePrompt(promptWithContext, hallucinationMode);
      
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

      // Step 2: Initiator - seamlessly start the conversation with mitigation + optional clarifying question
      let initiation: InitiateResponse | null = null;
      try {
        initiation = await initiatePrompt(originalUserPrompt, mapped, hallucinationMode);
        const clarQ = initiation.clarifying_question;
        const overview = initiation.mitigation_plan?.overview;
        setInitiatorClarifyingQuestion(clarQ || null);
        setInitiatorMitigationOverview(overview || null);

        // Compose an assistant message summarizing initiator outputs
        const parts: string[] = [];
        if (clarQ) {
          parts.push(`Clarifying question: ${clarQ}`);
        }
        if (overview) {
          parts.push(`Mitigation plan: ${overview}`);
        }
        if (parts.length) {
          setChatMessages([{
            role: 'assistant',
            content: parts.join("\n\n"),
            timestamp: new Date(),
          }]);
        }
      } catch (e) {
        console.warn('Initiator failed or unavailable:', e);
      }

      // Do NOT generate conversational agent output yet.
      // Wait for user reply; sendMessage will invoke refineStream accordingly.

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
      console.log('📨 sendMessage called with:');
      console.log('  currentPrompt:', currentPrompt?.substring(0, 100) + '...');
      console.log('  analysis available:', !!analysis);
      if (analysis) {
        console.log('  analysis.annotated_prompt:', analysis.annotated_prompt?.substring(0, 100) + '...');
        console.log('  risk_tokens count:', analysis.risk_tokens?.length || 0);
      }
      
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

        // Pass the analysis output to the conversation so the assistant knows what was detected
        console.log('🔄 Calling refineStream with analysis context');
        const response = await refineStream(currentPrompt, userMessage, historyCompact, analysis);
        
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
    [chatMessages, currentPrompt, analysis]
  );

  const onSendMessage = (message: string) => {
    if (!message.trim()) return;
    sendMessage(message);
  };

  const handleNewAnalysis = () => {
    setCurrentPrompt("");
    setAnalysis(null);
    setRiskAssessment(null);
    setChatMessages([]);
    setShowAnalysisSection(false);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setIsInitialRewrite(false);
    setRiskDetailsExpanded(false);
    setMetaDetailsExpanded(false);
    setTokensExpanded(false);
    setAnalysisResultsExpanded(false);
    setShowConversationWarning(false);
  };

  // Generate preview of refined prompt using AI-assisted improvements
  const handleGeneratePreview = async (additionalChanges: string): Promise<number> => {
    console.log('🎨 Generating refined prompt preview');
    
    // Prepare the analysis context
    const priorAnalysisContext = {
      annotated_prompt: analysis?.annotated_prompt || analysis?.promptText || "",
      risk_assessment: riskAssessment,
      risk_tokens: analysis?.risk_tokens || [],
    };
    
    // Call the preparator service to refine the prompt
    const response = await preparePrompt(
      currentPrompt,
      priorAnalysisContext,
      chatMessages.map(m => ({ role: m.role, content: m.content })),
      additionalChanges
    );
    
    if (response.success) {
      // Store prepared variations for selection in dialog (5 variants)
      setPreparedVariations(response.variations || []);
      const count = response.variations?.length || 0;
      console.log(`✨ Variants generated successfully: ${count}`);
      return count;
    } else {
      throw new Error('Failed to generate preview');
    }
  };

  const handleReanalyze = async (refinedPrompt: string) => {
    try {
      setIsPreparingReanalysis(true);
      
      console.log('🔄 Re-analyzing with refined prompt:', refinedPrompt.substring(0, 100) + '...');
      
      // Update the prompt in the editor
      setCurrentPrompt(refinedPrompt);
      
      // Reset conversation
      setChatMessages([]);
      setShowConversationWarning(false);
      
      // Add extra 3 seconds to loading time by delaying the start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Trigger re-analysis
      // Pass the refined prompt directly to avoid race condition with state update
      await handleAnalyze(currentHallucinationMode, refinedPrompt);
      
      // Analysis complete - close the dialog
      console.log('✅ Re-analysis complete');
      setShowReanalyzeDialog(false);
      setIsPreparingReanalysis(false);
      
    } catch (error) {
      console.error('❌ Error during re-analysis:', error);
      alert(`Failed to complete re-analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowReanalyzeDialog(false);
      setIsPreparingReanalysis(false);
    }
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
        <header className="flex-shrink-0 bg-transparent backdrop-blur-md border-b border-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-purple-800 dark:text-purple-500 drop-shadow-sm">
                  Echo — Hallucination Detector
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium tracking-wide">
                  AI-powered prompt analysis and refinement
                </p>
              </div>
            </div>
            {analysis && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHelpGuide(true)}
                className="flex items-center gap-2 px-4 py-2 bg-transparent backdrop-blur-md border border-purple-300 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300"
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </motion.div>
                <span className="font-medium text-sm text-purple-600 dark:text-purple-400">Guide</span>
              </motion.button>
            )}
          </div>
        </header>

        {/* Interactive Help Guide Overlay */}
        <AnimatePresence>
          {showHelpGuide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
              onClick={() => setShowHelpGuide(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-gray-900 dark:bg-gray-950 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gray-800 dark:bg-gray-900 p-6 border-b border-gray-700 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <HelpCircle className="w-8 h-8 text-purple-400" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Interactive Guide</h2>
                        <p className="text-gray-400 text-sm">Learn how to use Echo effectively</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowHelpGuide(false)}
                      className="p-2 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-6">
                    {/* Section 1: Getting Started */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="group"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-blue-600 transition-all duration-300">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 15 }}
                          className="flex-shrink-0 p-3 bg-blue-600/80 rounded-xl text-white"
                        >
                          <ScrollText className="w-6 h-6" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-blue-400 mb-2">
                            1. Write Your Prompt
                          </h3>
                          <p className="text-gray-300 mb-3">
                            Type or paste your prompt in the editor. You need at least <strong className="text-white">3 tokens</strong> (words) before the Analyze button becomes active.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-gray-700 text-blue-300 border-blue-600">
                              3+ tokens required
                            </Badge>
                            <Badge className="bg-gray-700 text-blue-300 border-blue-600">
                              Auto-validation
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Section 2: Analysis Modes */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="group"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-purple-600 transition-all duration-300">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: -15 }}
                          className="flex-shrink-0 p-3 bg-purple-600/80 rounded-xl text-white"
                        >
                          <Target className="w-6 h-6" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-purple-400 mb-2">
                            2. Choose Analysis Mode
                          </h3>
                          <p className="text-gray-300 mb-3">
                            Select your preferred analysis mode using the toolbar buttons:
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg">
                              <Badge className="bg-orange-600 text-white">Faithfulness</Badge>
                              <span className="text-gray-300">Detects internal consistency issues</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg">
                              <Badge className="bg-green-600 text-white">Factuality</Badge>
                              <span className="text-gray-300">Checks external world knowledge</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg">
                              <Badge className="bg-gray-600 text-white">Comprehensive</Badge>
                              <span className="text-gray-300">Both modes combined</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Section 3: Analysis Loading */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="group"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-teal-600 transition-all duration-300">
                        <div className="flex-shrink-0 p-3 bg-teal-600/80 rounded-xl text-white">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Loader2 className="w-6 h-6" />
                          </motion.div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-teal-400 mb-2">
                            3. Analysis Progress
                          </h3>
                          <p className="text-gray-300 mb-3">
                            Watch the analysis unfold through <strong className="text-white">5 checkpoints</strong>:
                          </p>
                          <div className="space-y-1.5 text-sm">
                            <div className="flex items-center gap-2 text-gray-300">
                              <span className="text-teal-400">📖</span>
                              <span><strong>Reading</strong> the prompt structure</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <span className="text-teal-400">🎯</span>
                              <span><strong>Detecting</strong> risky tokens</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <span className="text-teal-400">🧮</span>
                              <span><strong>Calculating</strong> PRD scores</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <span className="text-teal-400">✅</span>
                              <span><strong>Finalizing</strong> analysis</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <span className="text-teal-400">💬</span>
                              <span><strong>Summarizing</strong> for chat agent</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Section 4: Analysis Results */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="group"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-green-600 transition-all duration-300">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="flex-shrink-0 p-3 bg-green-600/80 rounded-xl text-white"
                        >
                          <ChartSpline className="w-6 h-6" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-green-400 mb-2">
                            4. Review Analysis Results
                          </h3>
                          <p className="text-gray-300 mb-3">
                            The right panel shows comprehensive analysis with:
                          </p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge className="bg-gray-700 text-green-300 border-green-600">
                              Annotated Prompt
                            </Badge>
                            <Badge className="bg-gray-700 text-green-300 border-green-600">
                              Risk Scores
                            </Badge>
                            <Badge className="bg-gray-700 text-green-300 border-green-600">
                              Token Details
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">
                            💡 Use filter buttons to show/hide risk levels: <span className="text-red-400">Critical</span>, <span className="text-orange-400">High</span>, <span className="text-yellow-400">Medium</span>
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Section 5: Conversational Agent */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="group"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-pink-600 transition-all duration-300">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex-shrink-0 p-3 bg-pink-600/80 rounded-xl text-white"
                        >
                          <MessageSquare className="w-6 h-6" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-pink-400 mb-2">
                            5. Chat with AI Assistant
                          </h3>
                          <p className="text-gray-300 mb-3">
                            After analysis, an AI assistant provides an initial rewrite. Continue the conversation to:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-gray-700 text-pink-300 border-pink-600">
                              Ask questions
                            </Badge>
                            <Badge className="bg-gray-700 text-pink-300 border-pink-600">
                              Request changes
                            </Badge>
                            <Badge className="bg-gray-700 text-pink-300 border-pink-600">
                              Get explanations
                            </Badge>
                            <Badge className="bg-gray-700 text-pink-300 border-pink-600">
                              Iterative refinement
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Section 6: Re-Analysis */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="group"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-yellow-600 transition-all duration-300">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex-shrink-0 p-3 bg-yellow-600/80 rounded-xl text-white"
                        >
                          <Zap className="w-6 h-6" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-yellow-400 mb-2">
                            6. Re-Analyze with Refinements
                          </h3>
                          <p className="text-gray-300 mb-3">
                            Click <strong className="text-white">Re-Analyze</strong> to generate a refined prompt based on your conversation:
                          </p>
                          <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex items-start gap-2">
                              <span className="text-yellow-400">1.</span>
                              <span>Add optional changes you want to see</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-yellow-400">2.</span>
                              <span>Click <strong className="text-white">Generate Preview</strong> to see the refined prompt</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-yellow-400">3.</span>
                              <span>Review and click <strong className="text-white">Confirm & Re-Analyze</strong></span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-yellow-400">4.</span>
                              <span>Watch the same 5-checkpoint loading animation</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Quick Tips */}
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-4 rounded-xl border border-purple-600/50"
                    >
                      <h3 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Pro Tips
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400">💡</span>
                          <span>The loading dialog shows real-time progress through 5 analysis stages</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400">💡</span>
                          <span>Conversation context is automatically included in re-analysis</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400">💡</span>
                          <span>Expand token cards to see detailed reasoning and mitigation strategies</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400">💡</span>
                          <span>Use the sidebar to access guidelines library and export results</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400">💡</span>
                          <span>Switch between light/dark mode using the theme toggle</span>
                        </li>
                      </ul>
                    </motion.div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-700 dark:border-gray-800 p-4 bg-gray-800 dark:bg-gray-900">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowHelpGuide(false)}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-all duration-300"
                  >
                    Got it! Let's get started
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Interface */}
        <div className="flex-1 pt-3 px-6 pb-6 gap-6 grid grid-cols-1 lg:grid-cols-5 min-h-0 overflow-hidden">
          {/* Chat Panel */}
          <div className={showAnalysisSection ? "lg:col-span-3 min-h-0 overflow-hidden" : "lg:col-span-3 min-h-0 overflow-hidden"}>
            <ChatPanel 
              messages={chatMessages}
              onSendMessage={onSendMessage}
              onReanalyze={() => setShowReanalyzeDialog(true)}
              hasAnalysis={!!analysis}
              isLoading={isInitialRewrite}
            />
          </div>

          {/* Analysis Results */}
          {showAnalysisSection && (
            <Card className="lg:col-span-2 flex flex-col overflow-hidden" data-analysis-section="true">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartSpline className="w-5 h-5" />
                  Analysis Results
                  {/* Hallucination Type Indicator */}
                  <div className="flex items-center gap-1 ml-2">
                    {currentHallucinationMode === 'faithfulness' && (
                      <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700 text-xs">
                        Faithfulness
                      </Badge>
                    )}
                    {currentHallucinationMode === 'factuality' && (
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700 text-xs">
                        Factuality
                      </Badge>
                    )}
                    {currentHallucinationMode === 'both' && (
                      <>
                        <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700 text-xs">
                          Faithfulness
                        </Badge>
                        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700 text-xs">
                          Factuality
                        </Badge>
                      </>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                {analysis?.annotated_prompt ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Highlighter className="w-4 h-4" />
                          Annotated Prompt
                        </h4>
                        <div className="flex items-center gap-3">
                          {/* Risk Level Filter - Clickable Icons */}
                          <TooltipProvider>
                            <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded">
                              <Filter className="w-3 h-3 text-gray-500 mr-1" />
                              {/* Medium Risk Filter */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => setRiskLevelFilter(prev => {
                                      const newSet = new Set(prev);
                                      if (newSet.has('medium')) {
                                        newSet.delete('medium');
                                      } else {
                                        newSet.add('medium');
                                      }
                                      return newSet;
                                    })}
                                    className={`p-1 rounded transition-all ${
                                      riskLevelFilter.has('medium')
                                        ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                  >
                                    <ShieldAlert className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{riskLevelFilter.has('medium') ? 'Medium Risk (On)' : 'Medium Risk (Off)'}</p>
                                </TooltipContent>
                              </Tooltip>
                              
                              {/* High Risk Filter */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => setRiskLevelFilter(prev => {
                                      const newSet = new Set(prev);
                                      if (newSet.has('high')) {
                                        newSet.delete('high');
                                      } else {
                                        newSet.add('high');
                                      }
                                      return newSet;
                                    })}
                                    className={`p-1 rounded transition-all ${
                                      riskLevelFilter.has('high')
                                        ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                  >
                                    <ShieldX className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{riskLevelFilter.has('high') ? 'High Risk (On)' : 'High Risk (Off)'}</p>
                                </TooltipContent>
                              </Tooltip>
                              
                              {/* Critical Risk Filter */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => setRiskLevelFilter(prev => {
                                      const newSet = new Set(prev);
                                      if (newSet.has('critical')) {
                                        newSet.delete('critical');
                                      } else {
                                        newSet.add('critical');
                                      }
                                      return newSet;
                                    })}
                                    className={`p-1 rounded transition-all ${
                                      riskLevelFilter.has('critical')
                                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                  >
                                    <Shield className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{riskLevelFilter.has('critical') ? 'Critical Risk (On)' : 'Critical Risk (Off)'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        </div>
                      </div>
                      <div className="flex items-center justify-end mb-2">
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
                        <div className={`${!analysisResultsExpanded ? 'relative' : ''} pt-2`}>
                          {renderAnnotated(analysis.annotated_prompt, analysis, riskLevelFilter)}
                          {!analysisResultsExpanded && (
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 dark:from-gray-800/50 to-transparent pointer-events-none" />
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                    
                    {/* Comprehensive Analysis Only - Risk Assessment and High Risk Tokens */}
                    {analysisMode === 'comprehensive' && (
                      <>
                        {/* Hallucination Risk Section - PRD Based */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                              <MessageSquareWarning className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                              Prompt Risk Density (PRD)
                            </h4>
                          </div>

                          {/* PRD Explanation */}
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
                          >
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                              <strong className="text-blue-700 dark:text-blue-300">Prompt Risk Density (PRD)</strong> quantifies the concentration of hallucination-inducing patterns in your prompt. 
                              It's calculated as the sum of severity-weighted violations divided by total tokens:
                            </p>
                            <div className="flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-gray-800/50 rounded border border-blue-300 dark:border-blue-600 mb-3">
                              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                PRD =
                              </span>
                              <div className="flex flex-col items-center">
                                <div className="flex items-baseline gap-0.5 mb-1">
                                  <span className="text-3xl font-normal text-gray-800 dark:text-gray-200">Σ</span>
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">(severity_weights)</span>
                                </div>
                                <div className="w-full border-t-2 border-gray-800 dark:border-gray-200 mb-1" style={{ minWidth: '160px' }}></div>
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  total_tokens
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                              Lower values indicate safer prompts, while higher values suggest increased risk of model hallucination.
                            </p>
                          </motion.div>

                          {/* Unified PRD Gauge */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-600"
                          >
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
                              Risk Assessment Gauge
                            </div>
                            
                            {(() => {
                              const promptPRD = typeof riskAssessment?.prompt?.prompt_PRD === 'number' ? riskAssessment.prompt.prompt_PRD : 0;
                              const metaPRD = typeof riskAssessment?.meta?.meta_PRD === 'number' ? riskAssessment.meta.meta_PRD : 0;
                              const maxDisplay = 0.30;
                              const promptPercentage = Math.min((promptPRD / maxDisplay) * 100, 100);
                              const metaPercentage = Math.min((metaPRD / maxDisplay) * 100, 100);
                              
                              return (
                                <div className="space-y-4">
                                  <div className="relative">
                                    {/* Gradient Bar */}
                                    <div className="h-12 rounded-full overflow-hidden shadow-inner relative" style={{
                                      background: 'linear-gradient(to right, #4ade80 0%, #facc15 16.7%, #fb923c 50%, #ef4444 100%)'
                                    }}>
                                      <div className="absolute inset-0 flex items-center justify-between px-3 text-[11px] font-bold text-white/90">
                                        <span className="drop-shadow">0.00</span>
                                        <span className="drop-shadow">0.05</span>
                                        <span className="drop-shadow">0.15</span>
                                        <span className="drop-shadow">0.30+</span>
                                      </div>
                                    </div>
                                    
                                    {/* Prompt-Level Indicator (Rose/Pink) */}
                                    <motion.div
                                      initial={{ left: '0%', opacity: 0 }}
                                      animate={{ left: `${promptPercentage}%`, opacity: 1 }}
                                      transition={{ delay: 0.4, duration: 1, type: "spring", stiffness: 100 }}
                                      className="absolute top-0 bottom-0 transform -translate-x-1/2"
                                      style={{ left: `${promptPercentage}%` }}
                                    >
                                      <div className="relative h-full">
                                        <div className="absolute inset-y-0 w-1.5 bg-rose-600 dark:bg-rose-400" style={{ 
                                          boxShadow: '0 0 12px rgba(225, 29, 72, 0.6)' 
                                        }}></div>
                                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-1.5 py-0.5 bg-rose-600 dark:bg-rose-500 text-white text-[10px] font-bold rounded shadow-lg whitespace-nowrap">
                                          {promptPRD.toFixed(4)}
                                        </div>
                                      </div>
                                    </motion.div>
                                    
                                    {/* Meta-Level Indicator (Teal) */}
                                    <motion.div
                                      initial={{ left: '0%', opacity: 0 }}
                                      animate={{ left: `${metaPercentage}%`, opacity: 1 }}
                                      transition={{ delay: 0.6, duration: 1, type: "spring", stiffness: 100 }}
                                      className="absolute top-0 bottom-0 transform -translate-x-1/2"
                                      style={{ left: `${metaPercentage}%` }}
                                    >
                                      <div className="relative h-full">
                                        <div className="absolute inset-y-0 w-1.5 bg-teal-600 dark:bg-teal-400" style={{ 
                                          boxShadow: '0 0 12px rgba(13, 148, 136, 0.6)' 
                                        }}></div>
                                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-1.5 py-0.5 bg-teal-600 dark:bg-teal-500 text-white text-[10px] font-bold rounded shadow-lg whitespace-nowrap">
                                          {metaPRD.toFixed(4)}
                                        </div>
                                      </div>
                                    </motion.div>
                                  </div>
                                  
                                  {/* Legend */}
                                  <div className="flex items-center justify-center gap-4 pt-8 text-xs">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-rose-600 dark:bg-rose-400 rounded-sm shadow-sm"></div>
                                      <span className="text-gray-700 dark:text-gray-300">
                                        Prompt-Level ({riskAssessment?.prompt?.prompt_violations?.length || 0} violations)
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-teal-600 dark:bg-teal-400 rounded-sm shadow-sm"></div>
                                      <span className="text-gray-700 dark:text-gray-300">
                                        Meta-Level ({riskAssessment?.meta?.meta_violations?.length || 0} violations)
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </motion.div>

                          {/* Prompt-Level Violations Section */}
                          {riskAssessment?.prompt && (
                            <div className="mb-3">
                              <button
                                onClick={() => setRiskDetailsExpanded(!riskDetailsExpanded)}
                                className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-900/50 rounded-lg border border-rose-200 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <ScrollText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                  <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                    Prompt-Level Risks
                                  </span>
                                </div>
                                <motion.div
                                  animate={{ rotate: riskDetailsExpanded ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </motion.div>
                              </button>

                              <AnimatePresence>
                                {riskDetailsExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-2 p-3 bg-rose-50/50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-800">
                                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                                        {riskAssessment.prompt.prompt_overview}
                                      </p>
                                      
                                      {riskAssessment.prompt.prompt_violations && riskAssessment.prompt.prompt_violations.length > 0 ? (
                                        <>
                                          {/* Category Distribution */}
                                          <div className="mb-3 p-3 bg-white dark:bg-gray-900/50 rounded-lg border border-rose-200 dark:border-rose-700">
                                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Violations by Category</div>
                                            {(() => {
                                              const SEVERITY_WEIGHTS = { critical: 3, high: 2, medium: 1 };
                                              const pillarData: Record<string, number> = {};
                                              
                                              riskAssessment.prompt.prompt_violations.forEach(v => {
                                                const pillar = v.pillar;
                                                const weight = SEVERITY_WEIGHTS[v.severity as keyof typeof SEVERITY_WEIGHTS] || 1;
                                                pillarData[pillar] = (pillarData[pillar] || 0) + weight;
                                              });
                                              
                                              const maxWeight = Math.max(...Object.values(pillarData), 1);
                                              const pillars = Object.entries(pillarData);
                                              
                                              if (pillars.length === 0) {
                                                return <div className="text-xs text-gray-500 dark:text-gray-400 italic text-center py-2">No violations detected</div>;
                                              }
                                              
                                              return (
                                                <div className="grid grid-cols-1 gap-2">
                                                  {pillars.map(([pillar, weight], idx) => {
                                                    const percentage = (weight / maxWeight) * 100;
                                                    const getColorByWeight = (w: number) => {
                                                      if (w >= 3) return { bg: 'bg-red-500', text: 'text-red-700 dark:text-red-300' };
                                                      if (w >= 2) return { bg: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300' };
                                                      return { bg: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-300' };
                                                    };
                                                    const colors = getColorByWeight(weight);
                                                    
                                                    return (
                                                      <motion.div
                                                        key={pillar}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.1, duration: 0.3 }}
                                                        className="space-y-1"
                                                      >
                                                        <div className="flex items-center justify-between text-xs">
                                                          <span className={`font-medium ${colors.text}`}>
                                                            {pillar.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                          </span>
                                                          <span className="text-gray-600 dark:text-gray-400 font-mono text-[10px]">
                                                            Weight: {weight}
                                                          </span>
                                                        </div>
                                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                          <motion.div
                                                            className={colors.bg}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percentage}%` }}
                                                            transition={{ delay: idx * 0.1 + 0.2, duration: 0.8, ease: "easeOut" }}
                                                            style={{ height: '100%' }}
                                                          />
                                                        </div>
                                                      </motion.div>
                                                    );
                                                  })}
                                                </div>
                                              );
                                            })()}
                                          </div>
                                          
                                          {/* Violation Details */}
                                          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Detailed Violations</div>
                                          <div className="space-y-2">
                                          {riskAssessment.prompt.prompt_violations.map((violation, index) => {
                                            const severityColors = {
                                              critical: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
                                              high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700',
                                              medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
                                            };
                                            
                                            return (
                                              <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="p-2 bg-white dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700"
                                              >
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                                                      {violation.rule_id}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded border ${severityColors[violation.severity as keyof typeof severityColors]}`}>
                                                      {violation.severity}
                                                    </span>
                                                  </div>
                                                  <span className="text-xs text-gray-500 dark:text-gray-500">
                                                    {violation.pillar}
                                                  </span>
                                                </div>
                                                <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-1.5 rounded text-gray-800 dark:text-gray-200">
                                                  "{violation.span}"
                                                </div>
                                              </motion.div>
                                            );
                                          })}
                                        </div>
                                        </>
                                      ) : (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                                          No prompt-level violations detected
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* Meta-Level Violations Section */}
                          {riskAssessment?.meta && (
                            <div>
                              <button
                                onClick={() => setMetaDetailsExpanded(!metaDetailsExpanded)}
                                className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-900/50 rounded-lg border border-teal-200 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Atom className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                  <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                    Meta-Level Risks
                                  </span>
                                </div>
                                <motion.div
                                  animate={{ rotate: metaDetailsExpanded ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </motion.div>
                              </button>

                              <AnimatePresence>
                                {metaDetailsExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-2 p-3 bg-teal-50/50 dark:bg-teal-900/10 rounded-lg border border-teal-100 dark:border-teal-800">
                                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                                        {riskAssessment.meta.meta_overview}
                                      </p>
                                      
                                      {riskAssessment.meta.meta_violations && riskAssessment.meta.meta_violations.length > 0 ? (
                                        <>
                                          {/* Category Distribution */}
                                          <div className="mb-3 p-3 bg-white dark:bg-gray-900/50 rounded-lg border border-teal-200 dark:border-teal-700">
                                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Violations by Category</div>
                                            {(() => {
                                              const SEVERITY_WEIGHTS = { critical: 3, high: 2, medium: 1 };
                                              const pillarData: Record<string, number> = {};
                                              
                                              riskAssessment.meta.meta_violations.forEach(v => {
                                                const pillar = v.pillar;
                                                const weight = SEVERITY_WEIGHTS[v.severity as keyof typeof SEVERITY_WEIGHTS] || 1;
                                                pillarData[pillar] = (pillarData[pillar] || 0) + weight;
                                              });
                                              
                                              const maxWeight = Math.max(...Object.values(pillarData), 1);
                                              const pillars = Object.entries(pillarData);
                                              
                                              if (pillars.length === 0) {
                                                return <div className="text-xs text-gray-500 dark:text-gray-400 italic text-center py-2">No violations detected</div>;
                                              }
                                              
                                              return (
                                                <div className="grid grid-cols-1 gap-2">
                                                  {pillars.map(([pillar, weight], idx) => {
                                                    const percentage = (weight / maxWeight) * 100;
                                                    const getColorByWeight = (w: number) => {
                                                      if (w >= 3) return { bg: 'bg-red-500', text: 'text-red-700 dark:text-red-300' };
                                                      if (w >= 2) return { bg: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300' };
                                                      return { bg: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-300' };
                                                    };
                                                    const colors = getColorByWeight(weight);
                                                    
                                                    return (
                                                      <motion.div
                                                        key={pillar}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.1, duration: 0.3 }}
                                                        className="space-y-1"
                                                      >
                                                        <div className="flex items-center justify-between text-xs">
                                                          <span className={`font-medium ${colors.text}`}>
                                                            {pillar.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                          </span>
                                                          <span className="text-gray-600 dark:text-gray-400 font-mono text-[10px]">
                                                            Weight: {weight}
                                                          </span>
                                                        </div>
                                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                          <motion.div
                                                            className={colors.bg}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percentage}%` }}
                                                            transition={{ delay: idx * 0.1 + 0.2, duration: 0.8, ease: "easeOut" }}
                                                            style={{ height: '100%' }}
                                                          />
                                                        </div>
                                                      </motion.div>
                                                    );
                                                  })}
                                                </div>
                                              );
                                            })()}
                                          </div>
                                          
                                          {/* Violation Details */}
                                          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Detailed Violations</div>
                                          <div className="space-y-2">
                                          {riskAssessment.meta.meta_violations.map((violation, index) => {
                                            const severityColors = {
                                              critical: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
                                              high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700',
                                              medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
                                            };
                                            
                                            return (
                                              <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="p-2 bg-white dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700"
                                              >
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                                                      {violation.rule_id}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded border ${severityColors[violation.severity as keyof typeof severityColors]}`}>
                                                      {violation.severity}
                                                    </span>
                                                  </div>
                                                  <span className="text-xs text-gray-500 dark:text-gray-500">
                                                    {violation.pillar}
                                                  </span>
                                                </div>
                                                <div className="text-xs text-gray-700 dark:text-gray-300">
                                                  {violation.explanation}
                                                </div>
                                              </motion.div>
                                            );
                                          })}
                                        </div>
                                        </>
                                      ) : (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                                          No meta-level violations detected
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>

                    {/* High Risk Tokens Section */}
                    {analysis.risk_tokens && analysis.risk_tokens.length > 0 ? (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <WholeWord className="w-4 h-4 text-gray-800 dark:text-gray-200" />
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
                                  case 'critical':
                                    return 'destructive' as const;
                                  case 'high':
                                    return 'destructive' as const;
                                  case 'medium':
                                    return 'secondary' as const;
                                  case 'low':
                                    return 'default' as const;
                                  default:
                                    return 'secondary' as const;
                                }
                              };

                              const getRiskColors = (riskLevel?: string) => {
                                switch (riskLevel) {
                                  case 'critical':
                                    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
                                  case 'high':
                                    return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
                                  case 'medium':
                                    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
                                  case 'low':
                                    return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
                                  default:
                                    return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
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
              <Card className="lg:col-span-2 flex flex-col">
                <CardContent className="space-y-4 flex-1 p-6">
                  <ExpandableEditor
                    prompt={currentPrompt}
                    onChange={setCurrentPrompt}
                    placeholder="Enter your prompt here for hallucination analysis..."
                    disabled={isAnalyzing}
                    className="flex-1"
                  />
                  
                  <div className="flex items-center justify-end">
                    <Toolbar
                      onAnalyze={handleAnalyze}
                      onToggleOverview={() => {}}
                      onReanalyze={() => setShowReanalyzeDialog(true)}
                      isAnalyzing={isAnalyzing}
                      hasAnalysis={!!analysis}
                      canAnalyze={canAnalyze}
                    />
                  </div>
                  
                  {/* Conversation Warning Banner */}
                  {showConversationWarning && !isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-300 dark:border-yellow-700 rounded-lg"
                    >
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                          Consider Re-analyzing
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          You've had {chatMessages.filter(m => m.role === 'user').length} exchanges. 
                          Re-analyzing will keep the analysis and assistant's responses most relevant to your updated prompt.
                        </p>
                        <Button
                          onClick={() => setShowReanalyzeDialog(true)}
                          variant="outline"
                          size="sm"
                          className="mt-2 border-yellow-400 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-900/30"
                        >
                          Re-analyze Now
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConversationWarning(false)}
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      
      {/* Re-analyze Dialog */}
      <ReanalyzeDialog
        open={showReanalyzeDialog}
        onOpenChange={setShowReanalyzeDialog}
        currentPrompt={currentPrompt}
        priorAnalysis={analysis}
        conversationHistory={chatMessages.map(m => ({ role: m.role, content: m.content }))}
        onGeneratePreview={handleGeneratePreview}
        onReanalyze={handleReanalyze}
        isLoading={isPreparingReanalysis}
        preparedVariations={preparedVariations || undefined}
      />
      
      {/* Analysis Loading Dialog - shown during initial analysis */}
      <AnalysisLoadingDialog
        open={isAnalyzing && !showReanalyzeDialog}
        title="Analyzing Your Prompt"
        description="Please wait while we analyze your prompt for potential hallucination risks..."
      />
      
    </div>
  );
}

export default App;