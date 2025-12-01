import React from 'react';
import { Zap, Target, Info, ChevronRight, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { motion } from 'framer-motion';

export type AnalysisMode = 'simple' | 'comprehensive';

interface AnalysisModeToggleProps {
  analysisMode: AnalysisMode;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
}

const AnalysisModeToggle: React.FC<AnalysisModeToggleProps> = ({ 
  analysisMode, 
  onAnalysisModeChange 
}) => {
  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Mode Toggle Cards */}
        <div className="flex gap-2">
          {/* Simple Mode Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAnalysisModeChange('simple')}
            className={`flex-1 p-3 rounded-xl border-2 transition-all duration-300 ${
              analysisMode === 'simple'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md shadow-purple-500/10'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-purple-300 dark:hover:border-purple-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                analysisMode === 'simple'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <div className={`font-semibold text-sm ${
                  analysisMode === 'simple'
                    ? 'text-purple-700 dark:text-purple-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Simple
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Quick scan
                </div>
              </div>
              {analysisMode === 'simple' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                />
              )}
            </div>
          </motion.button>

          {/* Arrow Indicator */}
          <div className="flex items-center px-1">
            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
          </div>

          {/* Comprehensive Mode Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAnalysisModeChange('comprehensive')}
            className={`flex-1 p-3 rounded-xl border-2 transition-all duration-300 ${
              analysisMode === 'comprehensive'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md shadow-purple-500/10'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-purple-300 dark:hover:border-purple-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                analysisMode === 'comprehensive'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                <Target className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <div className={`font-semibold text-sm ${
                  analysisMode === 'comprehensive'
                    ? 'text-purple-700 dark:text-purple-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Comprehensive
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Full analysis
                </div>
              </div>
              {analysisMode === 'comprehensive' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Badge className="bg-purple-500 text-white text-[10px] px-1.5 py-0.5">
                    PRD
                  </Badge>
                </motion.div>
              )}
            </div>
          </motion.button>
        </div>

        {/* Info Bar */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/30 rounded-lg"
        >
          <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <p className="text-xs text-gray-500 dark:text-gray-400 flex-1">
            {analysisMode === 'comprehensive' 
              ? 'Full PRD scoring, risk tokens, and detailed mitigation strategies'
              : 'Basic annotation only — enable Comprehensive for full risk analysis'
            }
          </p>
          {analysisMode === 'simple' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-700 text-white max-w-xs">
                <p className="text-sm">
                  Simple mode skips PRD calculation and risk token analysis. Switch to Comprehensive for full insights.
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default AnalysisModeToggle;
