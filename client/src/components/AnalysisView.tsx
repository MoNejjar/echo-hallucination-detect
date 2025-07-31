import React from 'react';
import { PromptAnalysis } from '../App';

interface AnalysisViewProps {
  analysis: PromptAnalysis;
  onClose: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, onClose }) => {
  const getRiskColorClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900';
      case 'medium': return 'text-yellow-600 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900';
      case 'low': return 'text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-900';
      default: return 'text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800';
    }
  };

  const totalHighRisk = analysis.highlightedSegments.filter(s => s.riskLevel === 'high').length;
  const totalMediumRisk = analysis.highlightedSegments.filter(s => s.riskLevel === 'medium').length;
  const totalLowRisk = analysis.highlightedSegments.filter(s => s.riskLevel === 'low').length;

  return (
    <div className="absolute top-0 right-0 w-full h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-l border-gray-300 dark:border-gray-700 shadow-lg z-10 overflow-y-auto transition-colors">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Analysis Overview</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-100 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Overview Stats */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{analysis.totalFlagged}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Issues</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{Math.round(analysis.overallConfidence * 100)}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Risk Score</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center p-2 bg-red-50 dark:bg-red-900 rounded">
            <div className="font-semibold text-red-600 dark:text-red-300">{totalHighRisk}</div>
            <div className="text-red-500 dark:text-red-400">High Risk</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900 rounded">
            <div className="font-semibold text-yellow-600 dark:text-yellow-300">{totalMediumRisk}</div>
            <div className="text-yellow-500 dark:text-yellow-400">Medium Risk</div>
          </div>
          <div className="text-center p-2 bg-orange-50 dark:bg-orange-900 rounded">
            <div className="font-semibold text-orange-600 dark:text-orange-300">{totalLowRisk}</div>
            <div className="text-orange-500 dark:text-orange-400">Low Risk</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Issue Categories</h4>
        <div className="space-y-2">
          {Object.entries(analysis.categories).map(([category, count]) => (
            <div key={category} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm capitalize text-gray-700 dark:text-gray-200">{category.replace('_', ' ')}</span>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Issues */}
      <div className="p-4">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Detailed Issues</h4>
        <div className="space-y-3">
          {analysis.highlightedSegments.map((segment, index) => (
            <div key={index} className={`p-3 rounded-lg border ${getRiskColorClass(segment.riskLevel)}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-sm font-semibold">"{segment.text}"</span>
                <span className="text-xs font-semibold uppercase">{segment.riskLevel}</span>
              </div>
              <div className="text-sm mb-1">{segment.reason}</div>
              <div className="flex justify-between text-xs">
                <span>Category: {segment.category.replace('_', ' ')}</span>
                <span>Confidence: {Math.round(segment.confidence * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Summary</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">{analysis.analysisSummary}</p>
      </div>
    </div>
  );
};

export default AnalysisView;