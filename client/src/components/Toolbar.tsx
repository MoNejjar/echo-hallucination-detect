import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Anchor, BookCheck, Scan } from 'lucide-react';
import { Button } from './ui/button';
import { AnalysisMode } from '../types';

interface ToolbarProps {
  onAnalyze: (mode: AnalysisMode) => void;
  onToggleOverview: () => void;
  onReanalyze?: () => void;
  isAnalyzing: boolean;
  hasAnalysis: boolean;
  canAnalyze?: boolean;
}

const modes = [
  {
    id: 'faithfulness' as AnalysisMode,
    name: 'Faithfulness',
    shortDesc: 'Context Adherence',
    description: 'Detects when the AI might diverge from your provided context, misinterpret instructions, or introduce information not present in your source material.',
    icon: Anchor, // Anchor = staying grounded/faithful to the source
    accentColor: 'purple',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    id: 'factuality' as AnalysisMode,
    name: 'Factuality',
    shortDesc: 'Real-World Accuracy',
    description: 'Identifies prompts that may lead the AI to fabricate facts, cite non-existent sources, or make claims that contradict established knowledge.',
    icon: BookCheck, // BookCheck = verified facts/knowledge
    accentColor: 'purple',
    gradient: 'from-purple-600 to-purple-700',
  },
  {
    id: 'both' as AnalysisMode,
    name: 'Comprehensive',
    shortDesc: 'Full Analysis',
    description: 'Complete risk assessment combining both faithfulness and factuality checks for maximum hallucination prevention coverage.',
    icon: Scan, // Scan = thorough scanning/analysis
    accentColor: 'purple',
    gradient: 'from-purple-500 to-purple-700',
  },
];

const Toolbar: React.FC<ToolbarProps> = ({ 
  onAnalyze, 
  onReanalyze,
  isAnalyzing, 
  hasAnalysis,
  canAnalyze = true
}) => {
  const [selectedIndex, setSelectedIndex] = useState(2); // Start with "Comprehensive"

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? modes.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setSelectedIndex((prev) => (prev === modes.length - 1 ? 0 : prev + 1));
  };

  const currentMode = modes[selectedIndex];
  const IconComponent = currentMode.icon;

  return (
    <div className="space-y-4 w-full">
      {/* Mode Selector Card */}
      <div className="relative">
        <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 shadow-sm transition-all duration-300">
          {/* Navigation Arrows */}
          <button
            onClick={handlePrevious}
            disabled={isAnalyzing}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
            aria-label="Previous mode"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
          </button>

          <button
            onClick={handleNext}
            disabled={isAnalyzing}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
            aria-label="Next mode"
          >
            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
          </button>

          {/* Mode Content */}
          <div className="text-center space-y-3 px-10">
            {/* Icon + Title Row */}
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <IconComponent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {currentMode.name}
                </h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {currentMode.shortDesc}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
              {currentMode.description}
            </p>

            {/* Mode Indicator Dots */}
            <div className="flex justify-center gap-1.5 pt-1">
              {modes.map((mode, index) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedIndex(index)}
                  disabled={isAnalyzing}
                  className="transition-all duration-200 disabled:cursor-not-allowed p-1"
                  aria-label={`Select ${mode.name}`}
                >
                  <div
                    className={`rounded-full transition-all duration-200 ${
                      index === selectedIndex
                        ? 'w-6 h-1.5 bg-purple-500'
                        : 'w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-purple-300 dark:hover:bg-purple-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-center gap-3">
              <Button
                onClick={() => onAnalyze(currentMode.id)}
                disabled={isAnalyzing || !canAnalyze}
                className={`relative overflow-hidden bg-gradient-to-r ${currentMode.gradient} hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-2`}
                size="default"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Prompt'}
              </Button>
              
              {hasAnalysis && !isAnalyzing && onReanalyze && (
                <Button
                  onClick={onReanalyze}
                  disabled={isAnalyzing}
                  variant="outline"
                  className="border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 gap-2"
                  size="default"
                >
                  <RefreshCw className="w-4 h-4" />
                  Re-analyze
                </Button>
              )}
            </div>

            {/* Helpful Hint */}
            <p className="text-xs text-gray-500 dark:text-gray-500 pt-1">
              Use arrow keys or dots to switch between analysis modes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
