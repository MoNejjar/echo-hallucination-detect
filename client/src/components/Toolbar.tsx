import React, { useState } from 'react';
import { Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { AnalysisMode } from '../types';

interface ToolbarProps {
  onAnalyze: (mode: AnalysisMode) => void;
  onToggleOverview: () => void;
  isAnalyzing: boolean;
  hasAnalysis: boolean;
}

const modes = [
  {
    id: 'faithfulness' as AnalysisMode,
    name: 'Faithfulness',
    description: 'Detects misalignment with user intent, unfaithful interpretations, and deviations from the original request',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    bgLight: 'bg-orange-50',
    bgDark: 'bg-orange-950/30',
    borderLight: 'border-orange-300',
    borderDark: 'border-orange-700',
    textLight: 'text-orange-900',
    textDark: 'text-orange-100',
  },
  {
    id: 'factuality' as AnalysisMode,
    name: 'Factuality',
    description: 'Identifies untrue, ungrounded, or fabricated content that lacks factual basis or verifiable evidence',
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    bgLight: 'bg-green-50',
    bgDark: 'bg-green-950/30',
    borderLight: 'border-green-300',
    borderDark: 'border-green-700',
    textLight: 'text-green-900',
    textDark: 'text-green-100',
  },
  {
    id: 'both' as AnalysisMode,
    name: 'Comprehensive',
    description: 'Complete analysis covering both faithfulness and factuality hallucinations for thorough detection',
    color: 'gray',
    gradient: 'from-gray-600 to-gray-700',
    bgLight: 'bg-gray-50',
    bgDark: 'bg-gray-800/50',
    borderLight: 'border-gray-300',
    borderDark: 'border-gray-600',
    textLight: 'text-gray-900',
    textDark: 'text-gray-100',
  },
];

const Toolbar: React.FC<ToolbarProps> = ({ 
  onAnalyze, 
  isAnalyzing, 
  hasAnalysis 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(2); // Start with "Both"

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? modes.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setSelectedIndex((prev) => (prev === modes.length - 1 ? 0 : prev + 1));
  };

  const currentMode = modes[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Instruction Box */}
      <div className="flex justify-center">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700 rounded-lg shadow-sm">
          <div className="flex items-center justify-center gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Choose the type of hallucinations to check, then click <span className="font-semibold">Analyze</span>
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="relative">
        <div className={`p-6 rounded-xl border-2 transition-all duration-500 shadow-lg
          ${currentMode.id === 'faithfulness' ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700' : ''}
          ${currentMode.id === 'factuality' ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700' : ''}
          ${currentMode.id === 'both' ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600' : ''}
        `}>
          {/* Navigation Arrows */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={handlePrevious}
              disabled={isAnalyzing}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              aria-label="Previous mode"
            >
              <ChevronLeft className={`w-5 h-5
                ${currentMode.id === 'faithfulness' ? 'text-orange-900 dark:text-orange-100' : ''}
                ${currentMode.id === 'factuality' ? 'text-green-900 dark:text-green-100' : ''}
                ${currentMode.id === 'both' ? 'text-gray-900 dark:text-gray-100' : ''}
              `} />
            </button>
          </div>

          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={handleNext}
              disabled={isAnalyzing}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              aria-label="Next mode"
            >
              <ChevronRight className={`w-5 h-5
                ${currentMode.id === 'faithfulness' ? 'text-orange-900 dark:text-orange-100' : ''}
                ${currentMode.id === 'factuality' ? 'text-green-900 dark:text-green-100' : ''}
                ${currentMode.id === 'both' ? 'text-gray-900 dark:text-gray-100' : ''}
              `} />
            </button>
          </div>

          {/* Mode Content */}
          <div className="text-center space-y-3 px-12">
            <div className="space-y-2">
              <h3 className={`text-2xl font-bold transition-all duration-500
                ${currentMode.id === 'faithfulness' ? 'text-orange-900 dark:text-orange-100' : ''}
                ${currentMode.id === 'factuality' ? 'text-green-900 dark:text-green-100' : ''}
                ${currentMode.id === 'both' ? 'text-gray-900 dark:text-gray-100' : ''}
              `}>
                {currentMode.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {currentMode.description}
              </p>
            </div>

            {/* Mode Indicator Dots */}
            <div className="flex justify-center gap-2 pt-2">
              {modes.map((mode, index) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedIndex(index)}
                  disabled={isAnalyzing}
                  className="transition-all duration-300 disabled:cursor-not-allowed"
                  aria-label={`Select ${mode.name}`}
                >
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === selectedIndex
                        ? 'w-8 bg-current opacity-100'
                        : 'w-2 bg-gray-400 dark:bg-gray-600 opacity-50 hover:opacity-75'
                    }`}
                    style={index === selectedIndex ? { color: mode.color === 'orange' ? '#f97316' : mode.color === 'green' ? '#22c55e' : '#6b7280' } : {}}
                  />
                </button>
              ))}
            </div>

            {/* Analyze Button */}
            <div className="pt-2">
              <Button
                onClick={() => onAnalyze(currentMode.id)}
                disabled={isAnalyzing}
                className={`relative overflow-hidden bg-gradient-to-r ${currentMode.gradient} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 px-8 py-2.5`}
                size="lg"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
