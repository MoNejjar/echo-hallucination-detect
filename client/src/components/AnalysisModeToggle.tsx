import React from 'react';
import { Switch } from './ui/switch';
import { Zap, Target, Info } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

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
      <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {analysisMode === 'comprehensive' ? (
            <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Analysis Depth:
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-sm ${analysisMode === 'simple' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            Simple
          </span>
          <Switch
            checked={analysisMode === 'comprehensive'}
            onCheckedChange={(checked) => onAnalysisModeChange(checked ? 'comprehensive' : 'simple')}
          />
          <span className={`text-sm ${analysisMode === 'comprehensive' ? 'text-purple-600 dark:text-purple-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            Comprehensive
          </span>
        </div>

        {analysisMode === 'comprehensive' && (
          <Badge className="bg-purple-500 text-white flex items-center gap-1">
            <Target className="w-3 h-3" />
            Full Analysis
          </Badge>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 dark:bg-gray-700 text-white max-w-xs">
            <p>
              {analysisMode === 'comprehensive' 
                ? 'Includes risk assessment, high-risk tokens, and detailed highlighting'
                : 'Basic highlighting only, no risk assessment or high-risk token analysis'
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default AnalysisModeToggle;
