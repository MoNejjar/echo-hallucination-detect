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
  FileJson
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import DarkModeToggle from './DarkModeToggle';
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
    alert('Feature coming soon! This will include best practices for prompt writing and hallucination detection patterns.');
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
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Amazing";
      default: return "";
    }
  };

  const getRatingMessage = (rating: number) => {
    switch (rating) {
      case 1: return "Ok, we'll try to make it better";
      case 2: return "Thanks for the feedback, we'll improve";
      case 3: return "Great! We're glad it worked well";
      case 4: return "Awesome! Thanks for the positive feedback";
      case 5: return "Fantastic! You made our day! 🎉";
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

  const exportAnalysisAsJSON = () => {
    if (!analysis || !riskAssessment || !originalPrompt) {
      alert('No analysis data available to export');
      return;
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      originalPrompt,
      improvedPrompt: improvedPrompt || null,
      analysis: {
        annotated_prompt: analysis.annotated_prompt,
        // Add other analysis fields you want to export
      },
      riskAssessment: {
        overall_assessment: riskAssessment.overall_assessment,
        criteria: riskAssessment.criteria
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `echo-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const exportAnalysisAsImage = async () => {
    if (!analysis || !riskAssessment || !originalPrompt) {
      alert('No analysis data available to export');
      return;
    }

    try {
      // For now, let's create a simple HTML export that can be saved manually
      const exportWindow = window.open('', '_blank', 'width=1200,height=800');
      if (!exportWindow) {
        alert('Please allow pop-ups to export as image');
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Echo AI Analysis Report</title>
          <style>
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
              color: #1e293b; 
              padding: 16px;
              line-height: 1.4;
              min-height: 100vh;
              font-size: 12px;
            }
            .container { 
              max-width: 100%; 
              margin: 0 auto; 
              background: white;
              border-radius: 12px;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 12px;
              border-bottom: 2px solid #e2e8f0;
            }
            .header h1 {
              font-size: 20px;
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 4px;
            }
            .header p {
              color: #64748b;
              font-size: 12px;
            }
            .grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 16px; 
              margin-bottom: 16px; 
            }
            .card { 
              border: 2px solid #e2e8f0; 
              border-radius: 8px; 
              padding: 12px; 
              background: white;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .card h3 { 
              margin: 0 0 8px 0; 
              font-size: 14px; 
              font-weight: 600; 
              color: #1e293b;
            }
            .prompt-content { 
              font-size: 11px; 
              background: #fef2f2;
              padding: 12px; 
              border-radius: 6px; 
              white-space: pre-wrap;
              border: 1px solid #fecaca;
              font-family: monospace;
            }
            .highlight-red { 
              background: #fecaca;
              color: #7f1d1d;
              padding: 2px 4px;
              border-radius: 3px;
              font-weight: 500;
            }
            .highlight-yellow { 
              background: #fef3c7;
              color: #92400e;
              padding: 2px 4px;
              border-radius: 3px;
              font-weight: 500;
            }
            .footer { 
              margin-top: 16px; 
              text-align: center; 
              font-size: 10px; 
              color: #64748b;
              padding-top: 12px;
              border-top: 1px solid #e2e8f0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧠 Echo AI Analysis Report</h1>
              <p>Comprehensive Hallucination Risk Assessment</p>
            </div>
            
            <div class="grid">
              <div class="card">
                <h3>📝 Original Prompt</h3>
                <div class="prompt-content">${(analysis.annotated_prompt || originalPrompt)
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/&lt;r&gt;/g, '<span class="highlight-red">')
                  .replace(/&lt;\/r&gt;/g, '</span>')
                  .replace(/&lt;y&gt;/g, '<span class="highlight-yellow">')
                  .replace(/&lt;\/y&gt;/g, '</span>')}</div>
              </div>
              
              <div class="card">
                <h3>✨ Improved Prompt</h3>
                <div class="prompt-content">${(improvedPrompt || 'No improved version available').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
              </div>
            </div>
            
            <div class="footer">
              Generated by Echo AI Hallucination Detection System - ${new Date().toLocaleDateString()}
            </div>
          </div>
          
          <script>
            // Auto-print dialog for easy saving as PDF
            setTimeout(() => {
              window.print();
            }, 1500);
          </script>
        </body>
        </html>
      `;

      exportWindow.document.write(htmlContent);
      exportWindow.document.close();
    } catch (error) {
      console.error('Error generating export:', error);
      alert('Error generating export. Please try again.');
    }
  };

  return (
    <TooltipProvider>
      <div className="w-28 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-950/50 dark:to-gray-900 border-r border-gray-200/60 dark:border-gray-800/60 flex flex-col shadow-xl backdrop-blur-sm">
        {/* Logo Section */}
        <div className="p-4 flex flex-col items-center border-b border-gray-200/60 dark:border-gray-800/60 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg">
          <div className="relative mb-3 group">
            {/* Enhanced purple aura background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-full blur-2xl scale-150 group-hover:scale-175 transition-transform duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 to-blue-500/40 rounded-full blur-xl scale-125 group-hover:scale-150 transition-transform duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-lg scale-110 animate-pulse"></div>
            {/* Logo */}
            <div className="relative w-12 h-12 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl ring-2 ring-purple-200/50 dark:ring-purple-800/50 group-hover:shadow-purple-500/25 transition-all duration-300">
              <img src="/logo.png" alt="Echo Logo" className="w-7 h-7 drop-shadow-lg" />
            </div>
          </div>
          
          {/* Dark Mode Toggle */}
          <DarkModeToggle />
        </div>
        
        {/* Main Actions */}
        <div className="flex-1 p-3 space-y-2">
          {/* Primary Action */}
          <div className="mb-3">
            <Button 
              onClick={onNewAnalysis}
              className="h-20 w-20 mx-auto block bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:via-purple-400 hover:to-blue-500 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] rounded-lg group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex flex-col items-center justify-center">
                <div className="p-1.5 rounded-md bg-white/10 backdrop-blur-sm mb-1 group-hover:bg-white/20 transition-all duration-200">
                  <Plus className="w-4 h-4 group-hover:rotate-90 group-hover:scale-110 transition-all duration-300" />
                </div>
                <span className="text-xs font-medium">New</span>
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
                  className="h-20 w-20 mx-auto block border-2 border-gray-200/60 dark:border-gray-700/60 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 transform hover:scale-[1.01] rounded-lg group"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-1.5 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 group-hover:from-purple-100 group-hover:to-blue-100 dark:group-hover:from-purple-800/50 dark:group-hover:to-blue-800/50 transition-all duration-200 mb-1">
                      <Upload className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300">Upload</span>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 dark:bg-gray-700 text-white">
                <p>Upload text or markdown file</p>
              </TooltipContent>
            </Tooltip>

            {/* Export Button with Light Blue Colors */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      disabled={!analysis || !riskAssessment}
                      className="h-20 w-20 mx-auto block border-2 border-gray-200/60 dark:border-gray-700/60 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-sky-50 dark:hover:from-blue-900/20 dark:hover:to-sky-900/20 transition-all duration-300 transform hover:scale-[1.01] rounded-lg group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-1.5 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 group-hover:from-blue-100 group-hover:to-sky-100 dark:group-hover:from-blue-800/50 dark:group-hover:to-sky-800/50 transition-all duration-200 mb-1">
                          <Download className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">Export</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 dark:bg-gray-700 text-white">
                  <p>{!analysis || !riskAssessment ? 'Run analysis first to export' : 'Export analysis results'}</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-gray-200/60 dark:border-gray-700/60 shadow-xl">
                <DropdownMenuItem 
                  onClick={exportAnalysisAsJSON}
                  disabled={!analysis || !riskAssessment}
                  className="flex items-center p-2.5 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="p-1 rounded-md bg-green-100 dark:bg-green-800/50 mr-2.5 group-hover:bg-green-200 dark:group-hover:bg-green-700/50 transition-colors">
                    <FileJson className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Export JSON</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Download analysis data</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={exportAnalysisAsImage}
                  disabled={!analysis || !riskAssessment}
                  className="flex items-center p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-800/50 mr-2.5 group-hover:bg-blue-200 dark:group-hover:bg-blue-700/50 transition-colors">
                    <Image className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Export Report</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Save as PDF/image</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleLibrary}
                  variant="outline"
                  className="h-20 w-20 mx-auto block border-2 border-gray-200/60 dark:border-gray-700/60 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 transition-all duration-300 transform hover:scale-[1.01] rounded-lg group relative"
                >
                  <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-amber-500 text-white text-[8px] font-bold rounded-full z-10">
                    SOON
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-1.5 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 group-hover:from-amber-100 group-hover:to-orange-100 dark:group-hover:from-amber-800/50 dark:group-hover:to-orange-800/50 transition-all duration-200 mb-1">
                      <Library className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-700 dark:group-hover:text-amber-300">Library</span>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 dark:bg-gray-700 text-white">
                <p>Hallucination detection best practices (Coming Soon)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Bottom Section - Feedback & Help */}
        <div className="p-3 border-t border-gray-200/30 dark:border-gray-800/30 bg-gradient-to-t from-gray-50/50 to-transparent dark:from-gray-950/50">
          <div className="space-y-2">
            {/* Feedback Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleFeedback}
                  variant="outline"
                  className="h-20 w-20 mx-auto block border-2 border-gray-200/60 dark:border-gray-700/60 hover:border-pink-300 dark:hover:border-pink-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 dark:hover:from-pink-900/20 dark:hover:to-rose-900/20 transition-all duration-300 transform hover:scale-[1.01] rounded-lg group"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-1.5 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 group-hover:from-pink-100 group-hover:to-rose-100 dark:group-hover:from-pink-800/50 dark:group-hover:to-rose-800/50 transition-all duration-200 mb-1 relative">
                      <Heart className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-200" />
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse group-hover:animate-bounce"></div>
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-pink-700 dark:group-hover:text-pink-300">Feedback</span>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 dark:bg-gray-700 text-white">
                <p>Send feedback to the developer</p>
              </TooltipContent>
            </Tooltip>

            {/* Help Button */}
            <Dialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="h-20 w-20 mx-auto block border-2 border-gray-200/60 dark:border-gray-700/60 hover:border-green-300 dark:hover:border-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-all duration-300 transform hover:scale-[1.01] rounded-lg group"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-1.5 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 group-hover:from-green-100 group-hover:to-emerald-100 dark:group-hover:from-green-800/50 dark:group-hover:to-emerald-800/50 transition-all duration-200 mb-1 relative">
                          <Info className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200" />
                          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity"></div>
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-300">Help</span>
                      </div>
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 dark:bg-gray-700 text-white">
                  <p>Learn about Echo</p>
                </TooltipContent>
              </Tooltip>
              <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    Echo: Prompt Refinement for Hallucination-Free LLMs
                  </DialogTitle>
                  <DialogDescription>
                    Learn how Echo helps you write better prompts
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 overflow-auto pr-4" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                  <div className="space-y-6 py-4">
                    <section>
                      <h2 className="text-xl font-semibold mb-3 text-purple-600 dark:text-purple-400">
                        🔍 What Is Echo?
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        <strong>Echo</strong> is a lightweight tool designed to <strong>detect hallucination potential</strong> in user-written prompts and <strong>guide users through a conversational refinement process</strong>. It empowers non-experts to create clearer, more faithful instructions for LLMs — without needing to fine-tune models or write advanced prompt logic.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-semibold mb-3 text-purple-600 dark:text-purple-400">
                        🎯 Motivation
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        LLMs are impressive — but they often generate <em>hallucinations</em>: factually incorrect, logically inconsistent, or unfaithful outputs. A major cause? Poorly structured or ambiguous prompts.
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                        <strong>Echo</strong> tackles this challenge head-on by:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                        <li>Identifying hallucination-prone segments of prompts 🧩</li>
                        <li>Explaining why those segments are risky 🗣️</li>
                        <li>Helping users rewrite prompts via an intuitive feedback loop 🔄</li>
                      </ul>
                    </section>

                    <section className="border-t pt-4">
                      <h2 className="text-xl font-semibold mb-3 text-purple-600 dark:text-purple-400">
                        💬 Let's Talk!
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Have ideas, feedback, or want to collaborate? Please reach out via{' '}
                        <a 
                          href="mailto:mohamed.nejjar@tum.de" 
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          mohamed.nejjar@tum.de
                        </a>
                      </p>
                    </section>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Share Your Experience
            </DialogTitle>
            <DialogDescription>
              Your feedback helps improve Echo for everyone!
            </DialogDescription>
          </DialogHeader>
          
          {!feedbackSubmitted ? (
            <div className="space-y-4">
              {/* Star Rating */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">How would you rate your experience?</p>
                <div className="flex justify-center gap-3 mb-4">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const isSelected = value <= rating;
                    const isHovered = value <= hoveredStar;
                    
                    return (
                      <button
                        key={value}
                        onClick={() => setRating(value)}
                        onMouseEnter={() => setHoveredStar(value)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="group transition-all duration-300 ease-out transform hover:scale-110 focus:outline-none"
                      >
                        <Star 
                          className={`w-8 h-8 transition-all duration-300 ${
                            isSelected 
                              ? 'text-yellow-400 fill-yellow-400 drop-shadow-lg scale-110' 
                              : isHovered
                              ? 'text-yellow-300 fill-yellow-300 scale-105'
                              : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300 hover:scale-105'
                          }`} 
                          strokeWidth={1.5}
                        />
                      </button>
                    );
                  })}
                </div>
                
                {/* Message Area */}
                <div className="h-16 flex flex-col justify-center">
                  {hoveredStar > 0 && (
                    <div className="text-center animate-in fade-in duration-200">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {getRatingLabel(hoveredStar)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getRatingMessage(hoveredStar)}
                      </p>
                    </div>
                  )}
                  {rating > 0 && hoveredStar === 0 && (
                    <div className="text-center">
                      <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-1">
                        {getRatingLabel(rating)} ⭐
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Thanks for your feedback! This helps us improve.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback Text Areas */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    👍 What did you like? (Optional)
                  </label>
                  <Textarea
                    value={goodFeedback}
                    onChange={(e) => setGoodFeedback(e.target.value)}
                    placeholder="Tell us what worked well..."
                    className="resize-none h-20"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    👎 What could be improved? (Optional)
                  </label>
                  <Textarea
                    value={badFeedback}
                    onChange={(e) => setBadFeedback(e.target.value)}
                    placeholder="Help us make Echo better..."
                    className="resize-none h-20"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFeedbackDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitFeedback}
                  disabled={rating === 0}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Feedback
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Your {rating}-star rating has been sent to Mohamed.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                We truly appreciate your feedback! ❤️
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default Sidebar;
