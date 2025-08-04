import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Sparkles, 
  MessageCircle, 
  Star, 
  HelpCircle, 
  Library,
  Plus,
  Settings,
  X,
  Search,
  Target,
  MessageSquare,
  Users,
  GraduationCap,
  Mail
} from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

interface SidebarProps {
  onNewAnalysis: () => void;
  onUploadFile: (file: File) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewAnalysis, onUploadFile }) => {
  const [showHelp, setShowHelp] = useState(false);

  const handleFeedback = () => {
    window.open('mailto:mohamed.nejjar@tum.de?subject=Echo Feedback', '_blank');
  };

  const showRating = () => {
    alert('Rating feature coming soon!');
  };

  const showLibrary = () => {
    alert('Library: Access to hallucination detection rules and research findings.');
  };

  const showSettings = () => {
    alert('Settings feature coming soon!');
  };

  // Help Content Modal/Panel
  const HelpPanel = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                About Echo
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered hallucination detection and prompt refinement
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowHelp(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="p-6 space-y-8">
            {/* What Is Echo Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-6 h-6 text-purple-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  What Is Echo?
                </h3>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  <strong className="text-purple-600 dark:text-purple-400">Echo</strong> is a lightweight tool designed to{' '}
                  <strong>detect hallucination potential</strong> in user-written prompts and{' '}
                  <strong>guide users through a conversational refinement process</strong>. It empowers non-experts to create clearer, more faithful instructions for LLMs — without needing to fine-tune models or write advanced prompt logic.
                </p>
              </div>
            </div>

            {/* Motivation Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Motivation
                </h3>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  LLMs are impressive — but they often generate <em>hallucinations</em>: factually incorrect, logically inconsistent, or unfaithful outputs. A major cause? Poorly structured or ambiguous prompts.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-800 dark:text-blue-300 font-medium mb-2">
                    Echo tackles this challenge head-on by:
                  </p>
                  <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">🧩</span>
                      <span>Identifying hallucination-prone segments of prompts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">🗣️</span>
                      <span>Explaining why those segments are risky</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">🔄</span>
                      <span>Helping users rewrite prompts via an intuitive feedback loop</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-green-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  How It Works
                </h3>
              </div>
              <div className="grid gap-4">
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">
                      Prompt Submission
                    </h4>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      Users submit a prompt into a simple web interface.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">
                      Token Analysis
                    </h4>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      Echo uses an LLM-based backend to assess segments that could mislead or confuse the model.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">
                      Feedback Loop
                    </h4>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      The system flags issues and explains them clearly, then enters a conversational refinement process with the user.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">
                      Iteration
                    </h4>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      With each iteration, the prompt becomes clearer and more model-aligned — reducing hallucination risk.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Research Foundations Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Research Foundations
                </h3>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
                <p className="text-orange-800 dark:text-orange-300 leading-relaxed mb-4">
                  This project is based on a bachelor's thesis at the{' '}
                  <strong>Technical University of Munich</strong>, exploring:
                </p>
                <ul className="space-y-2 text-orange-700 dark:text-orange-300">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Causes of faithfulness hallucinations in LLMs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Model-agnostic techniques for hallucination detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Interactive systems for prompt optimization</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Use Cases Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-indigo-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Use Cases
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                    Researchers
                  </h4>
                  <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                    Testing LLM prompts for robustness and reliability
                  </p>
                </div>
                
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                    Developers
                  </h4>
                  <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                    Building prompt-based applications with confidence
                  </p>
                </div>
                
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                    Educators
                  </h4>
                  <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                    Guiding students in AI literacy and best practices
                  </p>
                </div>
                
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                    Everyone
                  </h4>
                  <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                    Anyone writing prompts for LLMs!
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-purple-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Let's Talk!
                </h3>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                <p className="text-purple-800 dark:text-purple-300 leading-relaxed mb-4">
                  Have ideas, feedback, or want to collaborate? Please reach out via{' '}
                  <a 
                    href="mailto:mohamed.nejjar@tum.de" 
                    className="font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    mohamed.nejjar@tum.de
                  </a>
                </p>
                <Button 
                  onClick={() => window.open('mailto:mohamed.nejjar@tum.de', '_blank')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="w-[5%] min-w-[80px] bg-gradient-to-b from-gray-800 via-gray-850 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 text-white flex flex-col relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 p-6 border-b border-gray-700/50 dark:border-gray-600/50 backdrop-blur-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center mb-3 cursor-pointer">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                    <img 
                      src="/logo.png" 
                      alt="Echo Logo" 
                      className="h-6 w-6 object-contain"
                    />
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Echo - AI Hallucination Detector</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex justify-center">
            <DarkModeToggle />
          </div>
        </div>

        {/* Navigation */}
        <div className="relative z-10 flex-1 flex flex-col p-4 space-y-4">
          {/* Primary Action */}
          <div className="space-y-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onNewAnalysis}
                  className="group relative w-full h-auto p-4 bg-gradient-to-r from-purple-600 via-purple-650 to-purple-700 hover:from-purple-500 hover:via-purple-550 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl overflow-hidden"
                  size="lg"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/20 to-purple-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  <div className="relative flex flex-col items-center gap-2">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg group-hover:bg-white/30 transition-colors duration-300 group-hover:scale-110">
                      <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                    </div>
                    <span className="text-xs font-semibold tracking-wide">New</span>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Start a new analysis session</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator className="bg-white/10" />

          {/* Secondary Actions */}
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleFeedback}
                  variant="ghost"
                  className="group w-full h-auto p-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-105 border border-white/10 hover:border-white/20 rounded-lg backdrop-blur-sm"
                  size="sm"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="p-1 rounded-md group-hover:bg-white/10 transition-colors duration-300">
                      <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="text-xs font-medium">Feedback</span>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Send feedback to our team</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={showRating}
                  variant="ghost"
                  className="group w-full h-auto p-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-105 border border-white/10 hover:border-white/20 rounded-lg backdrop-blur-sm relative"
                  size="sm"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="p-1 rounded-md group-hover:bg-white/10 transition-colors duration-300">
                      <Star className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="text-xs font-medium">Rate</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-1.5 py-0.5 h-5 min-w-[20px] rounded-full border border-white/20 shadow-lg animate-pulse"
                  >
                    New
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Rate your experience (Coming Soon!)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setShowHelp(true)}
                  variant="ghost"
                  className="group w-full h-auto p-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-105 border border-white/10 hover:border-white/20 rounded-lg backdrop-blur-sm"
                  size="sm"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="p-1 rounded-md group-hover:bg-white/10 transition-colors duration-300">
                      <HelpCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="text-xs font-medium">Help</span>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Get help and documentation</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={showLibrary}
                  variant="ghost"
                  className="group w-full h-auto p-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-105 border border-white/10 hover:border-white/20 rounded-lg backdrop-blur-sm"
                  size="sm"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="p-1 rounded-md group-hover:bg-white/10 transition-colors duration-300">
                      <Library className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="text-xs font-medium">Library</span>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Access detection rules and research</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Bottom Section */}
          <div className="flex-1"></div>
          
          <Separator className="bg-white/10" />
          
          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={showSettings}
                variant="ghost"
                className="group w-full h-auto p-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-105 border border-white/10 hover:border-white/20 rounded-lg backdrop-blur-sm"
                size="sm"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="p-1 rounded-md group-hover:bg-white/10 transition-colors duration-300">
                    <Settings className="h-4 w-4 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-90" />
                  </div>
                  <span className="text-xs font-medium">Settings</span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Application settings (Coming Soon!)</p>
            </TooltipContent>
          </Tooltip>
        
          {/* Footer accent */}
          <div className="h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full mt-2"></div>
        </div>
      </div>

      {/* Help Panel Modal */}
      {showHelp && <HelpPanel />}
    </TooltipProvider>
  );
};

export default Sidebar;