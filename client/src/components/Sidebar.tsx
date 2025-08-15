import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
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
  Trash2,
  Sparkles,
  Zap,
  FileText,
  Heart,
  Info,
  Library,
  MoreHorizontal
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import DarkModeToggle from './DarkModeToggle';
import type { ChatMessage } from '../types';

interface SidebarProps {
  messages: ChatMessage[];
  onNewAnalysis: () => void;
  onUploadFile: (file: File) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  messages, 
  onNewAnalysis, 
  onUploadFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt'))) {
      onUploadFile(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFeedback = () => {
    const subject = encodeURIComponent('Echo - Feedback');
    const body = encodeURIComponent('Hi Mohamed,\n\nI have feedback about Echo:\n\n[Please share your thoughts here]\n\nBest regards');
    window.open(`mailto:mohamed.nejjar@tum.de?subject=${subject}&body=${body}`, '_blank');
  };

  const handleLibrary = () => {
    // Placeholder for library functionality
    alert('Hallucination Detection Best Practices library coming soon!');
  };

  const exportConversations = () => {
    if (messages.length === 0) {
      alert('No conversations to export');
      return;
    }
    
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `echo-conversations-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearAllConversations = () => {
    if (window.confirm('Are you sure you want to clear all conversations? This action cannot be undone.')) {
      console.log('Clear all conversations requested');
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

                    <section>
                      <h2 className="text-xl font-semibold mb-3 text-purple-600 dark:text-purple-400">
                        🛠️ How It Works
                      </h2>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                        <li><strong>Prompt Submission</strong>: Users submit a prompt into a simple web interface.</li>
                        <li><strong>Token Analysis</strong>: Echo uses an LLM-based backend to assess segments that could mislead or confuse the model.</li>
                        <li><strong>Feedback Loop</strong>: The system flags issues and explains them clearly, then enters a conversational refinement process with the user.</li>
                        <li><strong>Iteration</strong>: With each iteration, the prompt becomes clearer and more model-aligned — reducing hallucination risk.</li>
                      </ol>
                    </section>

                    <section>
                      <h2 className="text-xl font-semibold mb-3 text-purple-600 dark:text-purple-400">
                        🧪 Research Foundations
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                        This project is based on a bachelor's thesis at the <strong>Technical University of Munich</strong>, exploring:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                        <li>Causes of faithfulness hallucinations in LLMs</li>
                        <li>Model-agnostic techniques for hallucination detection</li>
                        <li>Interactive systems for prompt optimization</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-semibold mb-3 text-purple-600 dark:text-purple-400">
                        🌐 Use Cases
                      </h2>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                        <li>Researchers testing LLM prompts for robustness</li>
                        <li>Developers building prompt-based applications</li>
                        <li>Educators guiding students in AI literacy</li>
                        <li>Anyone writing prompts for LLMs!</li>
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

        {/* Bottom Options Section */}
        <div className="p-3 border-t border-gray-200/60 dark:border-gray-800/60 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="h-20 w-20 mx-auto block border-2 border-gray-200/60 dark:border-gray-700/60 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-violet-50 dark:hover:from-indigo-900/20 dark:hover:to-violet-900/20 transition-all duration-300 transform hover:scale-[1.01] rounded-lg group"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-1.5 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 group-hover:from-indigo-100 group-hover:to-violet-100 dark:group-hover:from-indigo-800/50 dark:group-hover:to-violet-800/50 transition-all duration-200 mb-1 relative">
                        <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200" />
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">Options</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 dark:bg-gray-700 text-white">
                <p>Settings & Options</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-gray-200/60 dark:border-gray-700/60 shadow-xl">
              <DropdownMenuItem 
                onClick={exportConversations}
                className="flex items-center p-2.5 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200 group"
              >
                <div className="p-1 rounded-md bg-green-100 dark:bg-green-800/50 mr-2.5 group-hover:bg-green-200 dark:group-hover:bg-green-700/50 transition-colors">
                  <Download className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Export</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Download JSON</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 group">
                <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-800/50 mr-2.5 group-hover:bg-blue-200 dark:group-hover:bg-blue-700/50 transition-colors">
                  <Archive className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Archive</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Clean up data</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200/60 dark:bg-gray-700/60" />
              <DropdownMenuItem 
                onClick={clearAllConversations}
                className="flex items-center p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 group"
              >
                <div className="p-1 rounded-md bg-red-100 dark:bg-red-800/50 mr-2.5 group-hover:bg-red-200 dark:group-hover:bg-red-700/50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="font-medium text-sm text-red-600 dark:text-red-400">Clear All</div>
                  <div className="text-xs text-red-500/70 dark:text-red-400/70">Permanent deletion</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    </TooltipProvider>
  );
};
export default Sidebar;