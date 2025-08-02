import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Brain } from 'lucide-react';
import { PromptAnalysis } from '../App';

interface EditorProps {
  prompt: string;
  onChange: (prompt: string) => void;
  analysis: PromptAnalysis | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onToggleOverview: () => void;
}

const Editor: React.FC<EditorProps> = ({
  prompt,
  onChange,
  analysis,
  onAnalyze,
  isAnalyzing,
  onToggleOverview
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const renderHighlightedText = () => {
    if (!analysis) return null;

    const segments = [...analysis.highlightedSegments].sort((a, b) => a.start - b.start);
    let lastIndex = 0;
    const result = [];

    segments.forEach((segment, index) => {
      if (segment.start > lastIndex) {
        result.push(<span key={`text-${index}`}>{prompt.slice(lastIndex, segment.start)}</span>);
      }

      const bgColor =
        segment.riskLevel === 'high'
          ? 'bg-red-200 border-red-400 dark:bg-red-900 dark:border-red-500'
          : segment.riskLevel === 'medium'
          ? 'bg-yellow-200 border-yellow-400 dark:bg-yellow-800 dark:border-yellow-500'
          : 'bg-orange-200 border-orange-400 dark:bg-orange-800 dark:border-orange-500';

      result.push(
        <span
          key={`highlight-${index}`}
          className={`${bgColor} border-b-2 cursor-pointer relative`}
          onMouseEnter={() => setHoveredSegment(index)}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          {segment.text}
          {hoveredSegment === index && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 w-64">
              <div className="font-semibold">{segment.reason}</div>
              <div className="mt-1">
                <span className="text-gray-300">Confidence: </span>
                <span className="text-yellow-300">
                  {Math.round(segment.confidence * 100)}%
                </span>
              </div>
              <div>
                <span className="text-gray-300">Category: </span>
                <span className="text-blue-300">{segment.category.replace('_', ' ')}</span>
              </div>
            </div>
          )}
        </span>
      );

      lastIndex = segment.end;
    });

    if (lastIndex < prompt.length) {
      result.push(<span key="text-final">{prompt.slice(lastIndex)}</span>);
    }

    return result;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Prompt Editor</h3>
        <div className="flex gap-2">
          <Button
            onClick={onAnalyze}
            disabled={!prompt.trim() || isAnalyzing}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            size="sm"
          >
            <Search className="mr-2 h-4 w-4" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Button>

          {analysis && (
            <Button
              onClick={onToggleOverview}
              variant="outline"
              size="sm"
              className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20 transition-all duration-300"
            >
              <Brain className="mr-2 h-4 w-4" />
              Overview
            </Button>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-4">
        {!analysis ? (
          <textarea
            value={prompt}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your prompt here to begin analysis..."
            className="w-full h-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        ) : (
          <>
            <textarea
              value={prompt}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-[60%] p-4 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 transition-all duration-200"
            />

            <div className="h-[35%] border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
              <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Analysis Results
              </h4>
              <div className="text-sm leading-relaxed font-mono">
                {renderHighlightedText()}
              </div>
            </div>
          </>
        )}
      </div>

      {analysis && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Issues Found: {analysis.totalFlagged}</span>
            <span>Confidence: {Math.round(analysis.overallConfidence * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;