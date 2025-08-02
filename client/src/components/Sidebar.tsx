import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Upload, 
  MessageCircle, 
  Star, 
  HelpCircle, 
  Library 
} from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

interface SidebarProps {
  onNewAnalysis: () => void;
  onUploadFile: (file: File) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewAnalysis, onUploadFile }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

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

  return (
    <div className="w-[5%] min-w-[80px] bg-gradient-to-b from-gray-800 to-gray-900 dark:from-gray-950 dark:to-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 dark:border-gray-600">
        <div className="flex justify-center mb-2">
          <img 
            src="/logo.png" 
            alt="Echo Logo" 
            className="h-8 w-8 object-contain"
          />
        </div>
        <div className="mt-1 flex justify-center">
          <DarkModeToggle />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex-1 flex flex-col gap-3 p-4">
        {/* New Analysis Button - Primary Action */}
        <Button
          onClick={onNewAnalysis}
          className="group relative w-full h-auto p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          size="lg"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
              <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="text-xs font-medium">New</span>
          </div>
        </Button>

        {/* Upload File Button */}
        <div className="relative">
          <Button
            className="group relative w-full h-auto p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            size="lg"
            asChild
          >
            <label className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                  <Upload className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-xs font-medium text-center">Upload</span>
              </div>
              <input
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="space-y-2 mt-2">
          <Button
            onClick={handleFeedback}
            variant="ghost"
            className="group w-full h-auto p-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-105 border border-white/10 hover:border-white/20"
            size="sm"
          >
            <div className="flex flex-col items-center gap-1">
              <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs">Feedback</span>
            </div>
          </Button>

          <Button
            onClick={showRating}
            variant="ghost"
            className="group w-full h-auto p-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-105 border border-white/10 hover:border-white/20 relative"
            size="sm"
          >
            <div className="flex flex-col items-center gap-1">
              <Star className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs">Rate</span>
            </div>
            <Badge 
              variant="secondary" 
              className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1 py-0 h-4 min-w-[16px]"
            >
              New
            </Badge>
          </Button>

          <Button
            onClick={showHelp}
            variant="ghost"
            className="group w-full h-auto p-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-105 border border-white/10 hover:border-white/20"
            size="sm"
          >
            <div className="flex flex-col items-center gap-1">
              <HelpCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs">Help</span>
            </div>
          </Button>

          <Button
            onClick={showLibrary}
            variant="ghost"
            className="group w-full h-auto p-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-105 border border-white/10 hover:border-white/20"
            size="sm"
          >
            <div className="flex flex-col items-center gap-1">
              <Library className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs">Library</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;