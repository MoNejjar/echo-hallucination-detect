import React from 'react';

interface ToolbarProps {
  onAnalyze: () => void;
  onToggleOverview: () => void;
  isAnalyzing: boolean;
  hasAnalysis: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onAnalyze, 
  onToggleOverview, 
  isAnalyzing, 
  hasAnalysis 
}) => {
  return (
    <div className="flex gap-2 p-2 border-b border-gray-200 bg-gray-50">
      <button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
      >
        🔍 {isAnalyzing ? 'Analyzing...' : 'Analyze Again'}
      </button>
      
      {hasAnalysis && (
        <button
          onClick={onToggleOverview}
          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors flex items-center gap-1"
        >
          🧠 View Analysis Overview
        </button>
      )}
    </div>
  );
};

export default Toolbar;
