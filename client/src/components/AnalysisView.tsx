import React from 'react';
import { PromptAnalysis } from '../App';

interface AnalysisViewProps {
  analysis: PromptAnalysis;
  onClose: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, onClose }) => {
  const getRiskColorClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const totalHighRisk = analysis.highlightedSegments.filter(s => s.riskLevel === 'high').length;
  const totalMediumRisk = analysis.highlightedSegments.filter(s => s.riskLevel === 'medium').length;
  const totalLowRisk = analysis.highlightedSegments.filter(s => s.riskLevel === 'low').length;

  return (
    <div className="absolute top-0 right-0 w-full h-full bg-white border-l border-gray-300 shadow-lg z-10 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Analysis Overview</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Overview Stats */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{analysis.totalFlagged}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{Math.round(analysis.overallConfidence * 100)}%</div>
            <div className="text-sm text-gray-600">Risk Score</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-600">{totalHighRisk}</div>
            <div className="text-red-500">High Risk</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <div className="font-semibold text-yellow-600">{totalMediumRisk}</div>
            <div className="text-yellow-500">Medium Risk</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded">
            <div className="font-semibold text-orange-600">{totalLowRisk}</div>
            <div className="text-orange-500">Low Risk</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-3">Issue Categories</h4>
        <div className="space-y-2">
          {Object.entries(analysis.categories).map(([category, count]) => (
            <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
              <span className="text-sm font-semibold text-gray-600">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Issues */}
      <div className="p-4">
        <h4 className="font-semibold text-gray-700 mb-3">Detailed Issues</h4>
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
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-2">Summary</h4>
        <p className="text-sm text-gray-600">{analysis.analysisSummary}</p>
      </div>
    </div>
  );
};

export default AnalysisView;