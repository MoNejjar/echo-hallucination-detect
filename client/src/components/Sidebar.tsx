import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Settings
} from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

interface SidebarProps {
  onNewAnalysis: () => void;
  onUploadFile: (file: File) => void; // Keep for backward compatibility, but won't use
}

const Sidebar: React.FC<SidebarProps> = ({ onNewAnalysis, onUploadFile }) => {
  const handleFeedback = () => {
    window.open('mailto:feedback@echo-app.com?subject=Echo Feedback', '_blank');
  };

  const showRating = () => {
    alert('Rating feature coming soon!');
  };

  const showHelp = () => {
    alert('Help: Echo analyzes your prompts for hallucination risks and provides AI-guided refinement.');
  };

  const showLibrary = () => {
    alert('Library: Access to hallucination detection rules and research findings.');
  };

  const showSettings = () => {
    alert('Settings feature coming soon!');
  };

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
                  className="group relative w-full h-auto p-4 bg-gradient-to-r from-blue-600 via-blue-650 to-blue-700 hover:from-blue-500 hover:via-blue-550 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl overflow-hidden"
                  size="lg"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
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
                  onClick={showHelp}
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
    </TooltipProvider>
  );
};

export default Sidebar;