import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { 
  Plus, 
  Upload, 
  MessageSquare,
  HelpCircle,
  BookOpen,
  Settings,
  Download,
  Archive,
  Sparkles,
  Zap,
  FileText,
  Heart,
  Info,
  Library,
  Star,
  Mail,
  Check,
  Image,
  FileJson,
  Tornado,
  ScanEye,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import DarkModeToggle from './DarkModeToggle';
import { LibraryDialog } from './LibraryDialog';
import { ExportDialog } from './ExportDialog';
import type { ChatMessage, PromptAnalysis, RiskAssessment } from '../types';

interface SidebarProps {
  messages: ChatMessage[];
  onNewAnalysis: () => void;
  onUploadFile?: (file: File) => void;
  isAnalyzing: boolean;
  analysis: PromptAnalysis | null;
  riskAssessment: RiskAssessment | null;
  originalPrompt: string;
  improvedPrompt: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  messages,
  onNewAnalysis,
  onUploadFile,
  isAnalyzing,
  analysis,
  riskAssessment,
  originalPrompt,
  improvedPrompt
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [goodFeedback, setGoodFeedback] = useState('');
  const [badFeedback, setBadFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Reset file input when a new analysis starts (originalPrompt becomes empty)
  useEffect(() => {
    if (originalPrompt === '' && fileInputRef.current) {
      fileInputRef.current.value = '';
      console.log('🔄 File input reset for new analysis');
    }
  }, [originalPrompt]);

  const handleFeedback = () => {
    setShowFeedbackDialog(true);
    setRating(0);
    setGoodFeedback('');
    setBadFeedback('');
    setFeedbackSubmitted(false);
  };

  const handleLibrary = () => {
    setLibraryOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('🎯 Upload triggered, file:', file?.name);
    
    if (file && onUploadFile) {
      console.log('📤 Passing file to parent component');
      onUploadFile(file);
      
      // Reset the input value so the same file can be selected again
      event.target.value = '';
    } else {
      console.warn('⚠️ No file selected or onUploadFile not available');
    }
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return "Needs Work";
      case 2: return "Could Be Better";
      case 3: return "Helpful";
      case 4: return "Very Helpful";
      case 5: return "Exceptional";
      default: return "";
    }
  };

  const getRatingMessage = (rating: number) => {
    switch (rating) {
      case 1: return "We'll work on making Echo more useful";
      case 2: return "Your input helps us refine the experience";
      case 3: return "Glad Echo is helping with your prompts!";
      case 4: return "Great to hear Echo is making a difference!";
      case 5: return "Amazing! Echo is achieving its mission! 🎯";
      default: return "";
    }
  };

  const submitFeedback = () => {
    if (rating === 0) return;
    
    const subject = encodeURIComponent(`Echo AI Feedback - ${rating}/5 Stars`);
    
    // Create the email body with user's custom feedback
    let emailBody = `Hi Mohamed,

⭐ Rating: ${rating}/5 Stars`;

    // Add good things if provided
    if (goodFeedback.trim()) {
      emailBody += `

👍 What I liked:
${goodFeedback.trim()}`;
    }

    // Add bad things if provided
    if (badFeedback.trim()) {
      emailBody += `

👎 What could be improved:
${badFeedback.trim()}`;
    }

    // Add simple closing
    emailBody += `

Best regards,
An Echo AI User`;

    const body = encodeURIComponent(emailBody);
    
    window.open(`mailto:mohamed.nejjar@tum.de?subject=${subject}&body=${body}`, '_blank');
    
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setShowFeedbackDialog(false);
    }, 3000);
  };

  const handleExport = () => {
    setShowExportDialog(true);
  };

  return (
    <TooltipProvider>
      <div className="w-20 bg-transparent border-r border-transparent flex flex-col backdrop-blur-sm">
        {/* Logo Section */}
        <div className="p-3 flex flex-col items-center border-b border-transparent bg-transparent backdrop-blur-lg">
          <div className="relative mb-3 group ml-4">
            {/* Enhanced purple aura background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-purple-300/30 rounded-full blur-2xl scale-150 group-hover:scale-175 transition-transform duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 to-purple-400/40 rounded-full blur-xl scale-125 group-hover:scale-150 transition-transform duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-500/20 rounded-full blur-lg scale-110 animate-pulse"></div>
            {/* Logo */}
            <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-2xl ring-2 ring-purple-200/50 dark:ring-purple-800/50 group-hover:shadow-purple-500/25 transition-all duration-300">
              <img src="/logo.png" alt="Echo Logo" className="w-7 h-7 drop-shadow-lg" />
            </div>
          </div>
          
          {/* Dark Mode Toggle */}
          <div className="ml-4">
            <DarkModeToggle />
          </div>
        </div>
        
        {/* Main Actions */}
        <div className="flex-1 p-3 space-y-2">
          {/* Primary Action */}
          <div className="mb-3">
            <Button 
              onClick={onNewAnalysis}
              className="h-20 w-20 mx-auto block bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 hover:from-purple-500 hover:via-purple-400 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 rounded-xl group relative overflow-hidden border border-purple-400/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
              <div className="relative flex flex-col items-center justify-center">
                <div className="p-2 rounded-lg bg-white/15 backdrop-blur-sm mb-1.5 group-hover:bg-white/25 group-hover:scale-110 transition-all duration-300 shadow-inner">
                  <Plus className="w-5 h-5 group-hover:rotate-180 transition-all duration-500" />
                </div>
                <span className="text-xs font-semibold tracking-wide">New</span>
              </div>
            </Button>
          </div>

          {/* Subtle separator */}
          <div className="relative mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/30 to-transparent dark:via-purple-700/30 h-px"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/20 to-transparent dark:via-purple-600/20 h-px blur-sm"></div>
          </div>

          {/* Secondary Actions */}
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-20 w-20 mx-auto block border-2 border-gray-200/60 dark:border-gray-700/60 hover:border-purple-400 dark:hover:border-purple-500 bg-white/50 dark:bg-gray-800/50 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100/80 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 rounded-xl group shadow-sm hover:shadow-md hover:shadow-purple-500/10"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-purple-100 dark:group-hover:bg-purple-800/60 group-hover:scale-110 transition-all duration-300 mb-1.5 shadow-sm">
                      <Upload className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:-translate-y-0.5 transition-all duration-300" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 tracking-wide">Upload</span>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 dark:bg-gray-700 text-white">
                <p>Upload text or markdown file</p>
              </TooltipContent>
            </Tooltip>

            {/* Export Button - Purple themed */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleExport}
                  variant="outline" 
                  disabled={!analysis || !riskAssessment}
                  className="h-20 w-20 mx-auto block border-2 border-gray-200/60 dark:border-gray-700/60 hover:border-purple-400 dark:hover:border-purple-500 bg-white/50 dark:bg-gray-800/50 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100/80 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 rounded-xl group shadow-sm hover:shadow-md hover:shadow-purple-500/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-purple-100 dark:group-hover:bg-purple-800/60 group-hover:scale-110 transition-all duration-300 mb-1.5 shadow-sm">
                      <Download className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-y-0.5 transition-all duration-300" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 tracking-wide">Export</span>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 dark:bg-gray-700 text-white">
                <p>{!analysis || !riskAssessment ? 'Run analysis first to export' : 'Export as PDF or JSON'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleLibrary}
                  variant="outline"
                  className="h-20 w-20 mx-auto block border-2 border-gray-200/60 dark:border-gray-700/60 hover:border-amber-400 dark:hover:border-amber-500 bg-white/50 dark:bg-gray-800/50 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 rounded-xl group relative shadow-sm hover:shadow-md hover:shadow-amber-500/10"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-amber-100 dark:group-hover:bg-amber-800/60 group-hover:scale-110 transition-all duration-300 mb-1.5 shadow-sm">
                      <Library className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:rotate-[-8deg] transition-all duration-300" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 group-hover:text-amber-700 dark:group-hover:text-amber-300 tracking-wide">Library</span>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 dark:bg-gray-700 text-white">
                <p>Browse hallucination detection guidelines (v3.0)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Bottom Section - Feedback & Help */}
        <div className="pb-6 pt-3 px-3 border-t border-gray-200/30 dark:border-gray-800/30 bg-gradient-to-t from-gray-50/50 to-transparent dark:from-gray-950/50">
          <div className="space-y-2">
            {/* Feedback Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleFeedback}
                  variant="outline"
                  className="h-20 w-20 mx-auto block border-2 border-gray-200/60 dark:border-gray-700/60 hover:border-pink-400 dark:hover:border-pink-500 bg-white/50 dark:bg-gray-800/50 hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50 dark:hover:from-pink-900/30 dark:hover:to-rose-900/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 rounded-xl group shadow-sm hover:shadow-md hover:shadow-pink-500/10"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-pink-100 dark:group-hover:bg-pink-800/60 group-hover:scale-110 transition-all duration-300 mb-1.5 relative shadow-sm">
                      <Heart className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 group-hover:scale-110 transition-all duration-300" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse group-hover:animate-ping"></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 group-hover:text-pink-700 dark:group-hover:text-pink-300 tracking-wide">Feedback</span>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 dark:bg-gray-700 text-white">
                <p>Send feedback to the developer</p>
              </TooltipContent>
            </Tooltip>

            {/* About Button */}
            <Dialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="h-20 w-20 mx-auto block border-2 border-gray-200/60 dark:border-gray-700/60 hover:border-cyan-400 dark:hover:border-cyan-500 bg-white/50 dark:bg-gray-800/50 hover:bg-gradient-to-br hover:from-cyan-50 hover:to-sky-50 dark:hover:from-cyan-900/30 dark:hover:to-sky-900/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 rounded-xl group shadow-sm hover:shadow-md hover:shadow-cyan-500/10"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-800/60 group-hover:scale-110 transition-all duration-300 mb-1.5 relative shadow-sm">
                          <Tornado className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:rotate-12 transition-all duration-300" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity"></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 tracking-wide">About</span>
                      </div>
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 dark:bg-gray-700 text-white">
                  <p>Learn about Echo</p>
                </TooltipContent>
              </Tooltip>
              <DialogContent className="max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 border-gray-200 dark:border-purple-800/50 p-0 overflow-hidden">
                <VisuallyHidden>
                  <DialogTitle>About Echo - Mitigating AI Hallucinations</DialogTitle>
                </VisuallyHidden>
                <DialogDescription className="sr-only">
                  Learn about Echo's approach to mitigating hallucination potential in user prompts
                </DialogDescription>
                
                {/* Hero Header */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-purple-700/90 to-purple-900/90"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                  
                  <div className="relative px-8 py-10">
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl scale-110 group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="relative w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                          <ScanEye className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Echo</h2>
                        <p className="text-purple-200 text-lg font-medium">AI-Guided Prompt Risk Analysis</p>
                        <p className="text-purple-300/70 text-sm mt-1">Bachelor Thesis Solution Design</p>
                      </div>
                      <div className="hidden sm:block">
                        <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                          <p className="text-white/80 text-xs font-medium">Research by</p>
                          <p className="text-white font-semibold">Mohamed Nejjar</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <ScrollArea className="h-[calc(90vh-200px)] max-h-[600px]">
                  <div className="p-8 space-y-8">
                    
                    {/* The Problem Section */}
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-purple-300 rounded-full"></div>
                      <div className="pl-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm font-bold">1</span>
                          The Problem: AI Hallucinations
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                          Large Language Models can generate confident yet <strong className="text-gray-900 dark:text-white">factually incorrect or inconsistent responses</strong>—a phenomenon known as hallucination. 
                          While current research focuses on detecting hallucinations in AI outputs, Echo takes a <strong className="text-purple-600 dark:text-purple-400">proactive approach</strong>: analyzing prompts <em>before</em> they trigger problematic responses.
                        </p>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
                          <p className="text-sm text-purple-800 dark:text-purple-200 italic">
                            "Mitigating Hallucination Potential in User Prompts Through AI-Guided Iterative Refinement"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Novel Taxonomy Section */}
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-purple-300 rounded-full"></div>
                      <div className="pl-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm font-bold">2</span>
                          Novel Risk Taxonomy
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                          Echo introduces a structured classification for hallucination triggers:
                        </p>
                        
                        {/* Taxonomy Visualization - Natural Tree Style */}
                        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
                          <div className="min-w-[380px]">
                            {/* Tree using SVG for clean lines */}
                            <svg viewBox="0 0 380 260" className="w-full h-auto" style={{ maxHeight: '280px' }}>
                              {/* Tree Lines */}
                              <g className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" fill="none">
                                {/* Root to Level 1 split */}
                                <path d="M190 42 L190 68 M190 68 L100 68 M190 68 L280 68 M100 68 L100 85 M280 68 L280 85" />
                                {/* User-Sided to children */}
                                <path d="M100 125 L100 148 M100 148 L55 148 M100 148 L145 148 M55 148 L55 168 M145 148 L145 168" className="stroke-purple-400" strokeWidth="2" />
                                {/* LLM-Sided to child */}
                                <path d="M280 125 L280 168" />
                              </g>
                              
                              {/* Root Node - Hallucinations */}
                              <g transform="translate(190, 22)">
                                <rect x="-60" y="-18" width="120" height="36" rx="8" className="fill-gray-900 dark:fill-white" />
                                <text textAnchor="middle" y="6" className="fill-white dark:fill-gray-900 text-[13px] font-semibold">Hallucinations</text>
                              </g>
                              
                              {/* User-Sided Node */}
                              <g transform="translate(100, 105)">
                                <rect x="-48" y="-18" width="96" height="36" rx="8" className="fill-purple-100 dark:fill-purple-900/60 stroke-purple-300 dark:stroke-purple-600" strokeWidth="2" />
                                <text textAnchor="middle" y="6" className="fill-purple-700 dark:fill-purple-300 text-[12px] font-medium">User-Sided</text>
                              </g>
                              
                              {/* LLM-Sided Node */}
                              <g transform="translate(280, 105)">
                                <rect x="-48" y="-18" width="96" height="36" rx="8" className="fill-gray-100 dark:fill-gray-700 stroke-gray-300 dark:stroke-gray-600" strokeWidth="2" />
                                <text textAnchor="middle" y="6" className="fill-gray-600 dark:fill-gray-400 text-[12px] font-medium">LLM-Sided</text>
                              </g>
                              
                              {/* Prompt Risk Node */}
                              <g transform="translate(55, 198)">
                                <rect x="-42" y="-18" width="84" height="36" rx="7" className="fill-purple-500" />
                                <text textAnchor="middle" y="6" className="fill-white text-[11px] font-medium">Prompt Risk</text>
                              </g>
                              
                              {/* Meta Risk Node */}
                              <g transform="translate(145, 198)">
                                <rect x="-38" y="-18" width="76" height="36" rx="7" className="fill-purple-400" />
                                <text textAnchor="middle" y="6" className="fill-white text-[11px] font-medium">Meta Risk</text>
                              </g>
                              
                              {/* Training/Data/Arch Node */}
                              <g transform="translate(280, 200)">
                                <rect x="-48" y="-22" width="96" height="44" rx="7" className="fill-gray-300 dark:fill-gray-600" opacity="0.7" />
                                <text textAnchor="middle" y="-2" className="fill-gray-600 dark:fill-gray-300 text-[10px]">Training, Data,</text>
                                <text textAnchor="middle" y="12" className="fill-gray-600 dark:fill-gray-300 text-[10px]">Architecture</text>
                              </g>
                            </svg>
                            
                            {/* Faithfulness/Factuality Footer */}
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center mb-3">Any hallucination type can be classified as:</p>
                              <div className="flex justify-center gap-3">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <span className="text-[11px] font-medium text-orange-700 dark:text-orange-300">Faithfulness</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-[11px] font-medium text-green-700 dark:text-green-300">Factuality</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PRD Section */}
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-300 to-purple-200 rounded-full"></div>
                      <div className="pl-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm font-bold">3</span>
                          Prompt Risk Density (PRD)
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                          A novel metric that quantifies hallucination potential by measuring the concentration of risky tokens:
                        </p>
                        
                        {/* PRD Formula */}
                        <div className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 mb-4 shadow-lg border border-purple-200/50 dark:border-transparent">
                          <div className="text-center">
                            <p className="text-purple-600 dark:text-gray-400 text-xs uppercase tracking-wider mb-3">Formula</p>
                            <div className="bg-white dark:bg-white/5 rounded-lg py-4 px-6 backdrop-blur-sm border border-purple-200 dark:border-white/10 shadow-sm dark:shadow-none">
                              <p className="text-gray-900 dark:text-white font-mono text-lg">
                                PRD = <span className="text-purple-600 dark:text-purple-400">Σ</span>(severity<sub className="text-purple-500 dark:text-purple-300">i</sub> × token<sub className="text-purple-500 dark:text-purple-300">i</sub>) <span className="text-purple-600 dark:text-purple-400">/</span> total_tokens
                              </p>
                            </div>
                            <p className="text-gray-500 dark:text-gray-500 text-xs mt-3">
                              Where severity weights: <span className="text-red-600 dark:text-red-400">Critical=4</span>, <span className="text-orange-600 dark:text-orange-400">High=3</span>, <span className="text-yellow-600 dark:text-yellow-400">Medium=2</span>, <span className="text-green-600 dark:text-green-400">Low=1</span>
                            </p>
                          </div>
                        </div>
                        
                        {/* PRD Gauge Example */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200/50 dark:border-green-700/50 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">0-30%</div>
                            <div className="text-xs text-green-700 dark:text-green-300 font-medium">Low Risk</div>
                            <div className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Safe to use</div>
                          </div>
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200/50 dark:border-yellow-700/50 text-center">
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">31-60%</div>
                            <div className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">Moderate Risk</div>
                            <div className="text-xs text-yellow-600/70 dark:text-yellow-400/70 mt-1">Review suggested</div>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200/50 dark:border-red-700/50 text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">61-100%</div>
                            <div className="text-xs text-red-700 dark:text-red-300 font-medium">High Risk</div>
                            <div className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">Refinement needed</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Agent Pipeline Section */}
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-200 to-purple-100 rounded-full"></div>
                      <div className="pl-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm font-bold">4</span>
                          Multi-Agent Architecture
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                          Four specialized AI agents work in sequence to analyze and refine your prompts:
                        </p>
                        
                        {/* Agent Flow */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200/50 dark:border-purple-700/50 group hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">1</div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">Analyzer Agent</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Detects risky tokens, calculates PRD, annotates prompt</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-purple-50/80 dark:bg-purple-900/15 rounded-lg border border-purple-200/40 dark:border-purple-700/40 group hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold shrink-0">2</div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">Initiator Agent</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Summarizes analysis, prepares context for conversation</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-purple-50/60 dark:bg-purple-900/10 rounded-lg border border-purple-200/30 dark:border-purple-700/30 group hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                            <div className="w-10 h-10 bg-purple-400 rounded-lg flex items-center justify-center text-white font-bold shrink-0">3</div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">Conversational Agent</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Guides iterative refinement through natural dialogue</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-purple-50/40 dark:bg-purple-900/5 rounded-lg border border-purple-200/20 dark:border-purple-700/20 group hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                            <div className="w-10 h-10 bg-purple-300 rounded-lg flex items-center justify-center text-purple-900 font-bold shrink-0">4</div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">Preparator Agent</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Generates refined prompt for re-analysis cycle</p>
                            </div>
                            <RefreshCw className="w-4 h-4 text-purple-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Section */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Contact: <a href="mailto:mohamed.nejjar@tum.de" className="text-purple-600 dark:text-purple-400 hover:underline">mohamed.nejjar@tum.de</a>
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Echo — AI-Guided Prompt Risk Mitigation
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-purple-800/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">Rate Your Experience</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">Help improve Echo's hallucination detection</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {!feedbackSubmitted ? (
            <div className="space-y-5 pt-2">
              {/* Star Rating */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">How well did Echo help you refine your prompts?</p>
                <div className="flex justify-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const isSelected = value <= rating;
                    const isHovered = value <= hoveredStar;
                    
                    return (
                      <button
                        key={value}
                        onClick={() => setRating(value)}
                        onMouseEnter={() => setHoveredStar(value)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="group transition-all duration-300 ease-out transform hover:scale-110 focus:outline-none p-1"
                      >
                        <Star 
                          className={`w-9 h-9 transition-all duration-300 ${
                            isSelected 
                              ? 'text-purple-500 fill-purple-500 drop-shadow-lg scale-110' 
                              : isHovered
                              ? 'text-purple-400 fill-purple-400 scale-105'
                              : 'text-gray-300 dark:text-gray-600 hover:text-purple-300 hover:scale-105'
                          }`} 
                          strokeWidth={1.5}
                        />
                      </button>
                    );
                  })}
                </div>
                
                {/* Message Area */}
                <div className="h-14 flex flex-col justify-center">
                  {hoveredStar > 0 && (
                    <div className="text-center animate-in fade-in duration-200">
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-0.5">
                        {getRatingLabel(hoveredStar)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getRatingMessage(hoveredStar)}
                      </p>
                    </div>
                  )}
                  {rating > 0 && hoveredStar === 0 && (
                    <div className="text-center">
                      <p className="text-base font-bold text-purple-600 dark:text-purple-400 mb-0.5">
                        {getRatingLabel(rating)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getRatingMessage(rating)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback Text Areas */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center text-xs">✓</span>
                    What worked well? <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <Textarea
                    value={goodFeedback}
                    onChange={(e) => setGoodFeedback(e.target.value)}
                    placeholder="e.g., Risk detection was accurate, the improved prompt was helpful..."
                    className="resize-none h-20 border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-2">
                    <span className="w-5 h-5 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center text-xs">!</span>
                    What could be improved? <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <Textarea
                    value={badFeedback}
                    onChange={(e) => setBadFeedback(e.target.value)}
                    placeholder="e.g., Missed some risks, suggestions for new features..."
                    className="resize-none h-20 border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFeedbackDialog(false)}
                  className="flex-1 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitFeedback}
                  disabled={rating === 0}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-40 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Feedback
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-2xl flex items-center justify-center shadow-lg">
                <Check className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Your feedback helps make Echo better at detecting hallucination risks.
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                {rating}/5 stars sent to the developer 💜
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <LibraryDialog open={libraryOpen} onOpenChange={setLibraryOpen} />
      
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        analysis={analysis}
        riskAssessment={riskAssessment}
        originalPrompt={originalPrompt}
        improvedPrompt={improvedPrompt}
      />
    </TooltipProvider>
  );
};

export default Sidebar;
