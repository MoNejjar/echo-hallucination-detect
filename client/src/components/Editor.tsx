import React, { useState, useRef, useEffect } from 'react';
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
  const editorRef = useRef<HTMLDivElement>(null);

  const renderHighlightedText = () => {
    if (!analysis || !analysis.highlightedSegments) {
      return prompt;
    }

    const segments = [...analysis.highlightedSegments].sort((a, b) => a.start - b.start);
    let lastIndex = 0;
    const result = [];

    segments.forEach((segment, index) => {
      // Add text before the highlight
      if (segment.start > lastIndex) {
        result.push(
          <span key={`text-${index}`}>
            {prompt.slice(lastIndex, segment.start)}
          </span>
        );
      }

      // Add highlighted segment
      const bgColor = segment.riskLevel === 'high' 
        ? 'bg-red-200 border-red-400' 
        : segment.riskLevel === 'medium' 
        ? 'bg-yellow-200 border-yellow-400' 
        : 'bg-orange-200 border-orange-400';

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
                <span className="text-yellow-300">{Math.round(segment.confidence * 100)}%</span>
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

    // Add remaining text
    if (lastIndex < prompt.length) {
      result.push(
        <span key="text-end">
          {prompt.slice(lastIndex)}
        </span>
      );
    }

    return result;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Prompt Editor</h3>
        <div className="flex gap-2">
          <button
            onClick={onAnalyze}
            disabled={!prompt.trim() || isAnalyzing}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            🔍 {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
          
          {analysis && (
            <button
              onClick={onToggleOverview}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors flex items-center gap-1"
            >
              🧠 Overview
            </button>
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
            className="w-full h-full p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
          <>
            <textarea
              value={prompt}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-[60%] p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            
            <div className="h-[35%] border border-gray-300 rounded-lg p-4 bg-gray-50 overflow-y-auto">
              <div className="text-sm font-semibold text-gray-700 mb-2">Analysis View:</div>
              <div 
                ref={editorRef}
                className="font-mono text-sm leading-relaxed whitespace-pre-wrap"
              >
                {renderHighlightedText()}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Status Bar */}
      {analysis && (
        <div className="border-t border-gray-200 p-2 bg-gray-50 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Issues: {analysis.totalFlagged}</span>
            <span>Risk Score: {Math.round(analysis.overallConfidence * 100)}%</span>
            <span>Characters: {prompt.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;