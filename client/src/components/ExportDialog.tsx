// ExportDialog Component - PDF and JSON export functionality
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FileJson, FileText, Download, Loader2, CheckCircle2 } from 'lucide-react';
import type { PromptAnalysis, RiskAssessment, RiskToken } from '../types';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: PromptAnalysis | null;
  riskAssessment: RiskAssessment | null;
  originalPrompt: string;
  improvedPrompt: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  analysis,
  riskAssessment,
  originalPrompt,
  improvedPrompt,
}: ExportDialogProps) {
  const [exportingFormat, setExportingFormat] = useState<'pdf' | 'json' | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportJSON = () => {
    setExportingFormat('json');
    setExportSuccess(false);

    try {
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          tool: 'Echo - Hallucination Detector',
        },
        originalPrompt,
        improvedPrompt: improvedPrompt || null,
        analysis: {
          annotated_prompt: analysis?.annotated_prompt,
          analysis_summary: analysis?.analysisSummary,
          total_flagged: analysis?.totalFlagged,
          overall_confidence: analysis?.overallConfidence,
          risk_tokens: analysis?.risk_tokens,
        },
        riskAssessment: {
          prompt: riskAssessment?.prompt
            ? {
                prompt_PRD: riskAssessment.prompt.prompt_PRD,
                prompt_violations: riskAssessment.prompt.prompt_violations,
              }
            : null,
          meta: riskAssessment?.meta
            ? {
                meta_PRD: riskAssessment.meta.meta_PRD,
                meta_violations: riskAssessment.meta.meta_violations,
              }
            : null,
        },
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `echo-analysis-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => {
        setExportingFormat(null);
        setExportSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Failed to export JSON. Please try again.');
      setExportingFormat(null);
    }
  };

  const handleExportPDF = async () => {
    setExportingFormat('pdf');
    setExportSuccess(false);

    try {
      if (!analysis || !riskAssessment) {
        alert('No analysis data available to export.');
        setExportingFormat(null);
        return;
      }

      // Calculate analysis metrics (PRD scores are 0.0 to 1.0, not percentages)
      const promptPRD = typeof riskAssessment.prompt?.prompt_PRD === 'number' ? riskAssessment.prompt.prompt_PRD : 0;
      const metaPRD = typeof riskAssessment.meta?.meta_PRD === 'number' ? riskAssessment.meta.meta_PRD : 0;
      
      // Gauge displays range 0.00 to 0.30 (Critical threshold)
      // Convert PRD scores to gauge positioning (0.0-0.30 -> 0-100%)
      const maxDisplay = 0.30;
      const promptPRDPercent = Math.min((promptPRD / maxDisplay) * 100, 100);
      const metaPRDPercent = Math.min((metaPRD / maxDisplay) * 100, 100);
      
      // Calculate overall risk score as average (median) of both PRD scores
      const riskScoreDecimal = (promptPRD + metaPRD) / 2;
      const riskLevel = riskScoreDecimal >= 0.30 ? 'Critical' : riskScoreDecimal >= 0.15 ? 'High' : riskScoreDecimal >= 0.05 ? 'Medium' : 'Low';
      
      // Get actual token counts from risk_tokens array
      const allRiskTokens = analysis.risk_tokens || [];
      const totalRiskTokens = allRiskTokens.length;
      
      // Count by risk level
      const criticalTokens = allRiskTokens.filter((token: RiskToken) => token.risk_level === 'critical').length;
      const highRiskTokens = allRiskTokens.filter((token: RiskToken) => token.risk_level === 'high').length;
      const mediumRiskTokens = allRiskTokens.filter((token: RiskToken) => token.risk_level === 'medium').length;
      const lowRiskTokens = allRiskTokens.filter((token: RiskToken) => token.risk_level === 'low').length;

      // Calculate word/token count of original prompt
      const promptWordCount = originalPrompt.split(/\s+/).filter(word => word.length > 0).length;
      const promptCharCount = originalPrompt.length;

      // Group tokens by classification
      const tokensByClassification: Record<string, RiskToken[]> = {};
      allRiskTokens.forEach((token: RiskToken) => {
        if (!tokensByClassification[token.classification]) {
          tokensByClassification[token.classification] = [];
        }
        tokensByClassification[token.classification].push(token);
      });

      // Count violations by severity (including both prompt and meta violations)
      const allViolations = [
        ...riskAssessment.prompt.prompt_violations,
        ...riskAssessment.meta.meta_violations
      ];
      const criticalViolations = allViolations.filter(v => v.severity === 'critical').length;
      const highViolations = allViolations.filter(v => v.severity === 'high').length;
      const mediumViolations = allViolations.filter(v => v.severity === 'medium').length;
      const totalViolations = criticalViolations + highViolations + mediumViolations;

      // Parse annotated prompt if available (XML format)
      let annotatedTokens: Array<{text: string; category: string}> = [];
      if (analysis.annotated_prompt) {
        const tokenRegex = /<token[^>]*category="([^"]*)"[^>]*>([^<]*)<\/token>/g;
        let match;
        while ((match = tokenRegex.exec(analysis.annotated_prompt)) !== null) {
          annotatedTokens.push({
            category: match[1],
            text: match[2]
          });
        }
      }

      // Create a new window for the PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow pop-ups to export as PDF');
        setExportingFormat(null);
        return;
      }

      // Generate comprehensive HTML document with graphs and text
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Echo Analysis Report - ${new Date().toLocaleDateString()}</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              background: #0f172a;
              color: #e2e8f0;
            }
            .page {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              page-break-after: always;
              background: #1e293b;
            }
            .page:last-child {
              page-break-after: auto;
            }
            
            /* Guide Page Styles */
            .guide-header {
              text-align: center;
              margin-bottom: 25px;
              padding-bottom: 15px;
              border-bottom: 3px solid #a78bfa;
            }
            .guide-header h1 {
              font-size: 30px;
              color: #c4b5fd;
              margin-bottom: 8px;
              font-weight: 700;
            }
            .guide-header .subtitle {
              font-size: 15px;
              color: #94a3b8;
              font-weight: 500;
            }
            .guide-header .date {
              font-size: 13px;
              color: #64748b;
              margin-top: 5px;
            }
            
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              margin: 25px 0;
            }
            .metric-card {
              background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
              padding: 18px;
              border-radius: 10px;
              border-left: 4px solid #a78bfa;
              border: 1px solid #334155;
            }
            .metric-card.risk-critical {
              border-left-color: #ef4444;
              background: linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%);
              border-color: #991b1b;
            }
            .metric-card.risk-high {
              border-left-color: #ea580c;
              background: linear-gradient(135deg, #431407 0%, #7c2d12 100%);
              border-color: #9a3412;
            }
            .metric-card.risk-medium {
              border-left-color: #eab308;
              background: linear-gradient(135deg, #422006 0%, #713f12 100%);
              border-color: #854d0e;
            }
            .metric-card.risk-low {
              border-left-color: #10b981;
              background: linear-gradient(135deg, #022c22 0%, #064e3b 100%);
              border-color: #065f46;
            }
            .metric-label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #94a3b8;
              font-weight: 600;
              margin-bottom: 4px;
            }
            .metric-value {
              font-size: 26px;
              font-weight: 700;
              color: #e2e8f0;
            }
            .metric-desc {
              font-size: 11px;
              color: #cbd5e1;
              margin-top: 4px;
            }
            
            .section {
              margin: 20px 0;
            }
            .section-title {
              font-size: 16px;
              font-weight: 700;
              color: #c4b5fd;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .section-content {
              font-size: 12px;
              line-height: 1.6;
              color: #cbd5e1;
              background: #0f172a;
              padding: 12px;
              border-radius: 8px;
              border: 1px solid #334155;
            }
            .section-content p {
              margin-bottom: 8px;
            }
            .section-content p:last-child {
              margin-bottom: 0;
            }
            .section-content strong {
              color: #e2e8f0;
              font-weight: 600;
            }
            
            .prompt-box {
              background: #0f172a;
              border: 2px solid #334155;
              border-radius: 6px;
              padding: 12px;
              font-family: 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.5;
              color: #e2e8f0;
              margin: 12px 0;
              max-height: 100px;
              overflow-y: auto;
            }
            
            .legend {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
              margin: 12px 0;
            }
            .legend-item {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 10px;
              color: #4b5563;
            }
            .legend-color {
              width: 16px;
              height: 16px;
              border-radius: 3px;
              border: 2px solid white;
              box-shadow: 0 1px 2px rgba(0,0,0,0.2);
              flex-shrink: 0;
            }
            .legend-color.factual { background: #ef4444; }
            .legend-color.opinion { background: #f59e0b; }
            .legend-color.exaggeration { background: #eab308; }
            .legend-color.unverifiable { background: #8b5cf6; }
            .legend-color.contradictory { background: #ec4899; }
            .legend-color.safe { background: #10b981; }
            
            .footer-note {
              margin-top: 20px;
              padding-top: 15px;
              border-top: 2px solid #334155;
              text-align: center;
              font-size: 10px;
              color: #64748b;
            }
            
            /* Chart and Graph Styles */
            .chart-container {
              margin: 20px 0;
              background: #0f172a;
              border: 1px solid #334155;
              border-radius: 8px;
              padding: 15px;
            }
            .chart-title {
              font-size: 14px;
              font-weight: 700;
              color: #e2e8f0;
              margin-bottom: 12px;
            }
            .bar-chart {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            .bar-item {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .bar-label {
              min-width: 100px;
              font-size: 11px;
              color: #cbd5e1;
              font-weight: 500;
            }
            .bar-track {
              flex: 1;
              height: 24px;
              background: #1e293b;
              border-radius: 4px;
              overflow: hidden;
              position: relative;
              border: 1px solid #334155;
            }
            .bar-fill {
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              padding-right: 8px;
              font-size: 10px;
              font-weight: 600;
              color: white;
              transition: width 0.3s ease;
            }
            .bar-fill.critical { background: #ef4444; }
            .bar-fill.high { background: #ea580c; }
            .bar-fill.medium { background: #eab308; }
            .bar-fill.low { background: #10b981; }
            
            /* Risk Token Card */
            .token-card {
              background: #0f172a;
              border: 1px solid #334155;
              border-radius: 8px;
              padding: 12px;
              margin: 10px 0;
              page-break-inside: avoid;
            }
            .token-card-header {
              display: flex;
              justify-content: space-between;
              align-items: start;
              margin-bottom: 8px;
            }
            .token-text {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              font-weight: 600;
              color: #e2e8f0;
              background: #1e293b;
              padding: 4px 8px;
              border-radius: 4px;
            }
            .token-risk-badge {
              font-size: 9px;
              font-weight: 700;
              padding: 3px 8px;
              border-radius: 3px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: white;
            }
            .token-risk-badge.critical { background: #ef4444; }
            .token-risk-badge.high { background: #ea580c; }
            .token-risk-badge.medium { background: #eab308; }
            .token-risk-badge.low { background: #10b981; }
            .token-classification {
              font-size: 11px;
              color: #c4b5fd;
              font-weight: 600;
              margin-bottom: 6px;
            }
            .token-reasoning {
              font-size: 10px;
              color: #cbd5e1;
              line-height: 1.5;
              margin-bottom: 6px;
            }
            .token-mitigation {
              font-size: 10px;
              color: #6ee7b7;
              background: #022c22;
              padding: 6px 8px;
              border-radius: 4px;
              border-left: 3px solid #10b981;
            }
            .token-mitigation-label {
              font-weight: 700;
              color: #34d399;
            }
            
            /* Violation Card */
            .violation-card {
              background: #450a0a;
              border-left: 4px solid #ef4444;
              border-radius: 6px;
              padding: 10px;
              margin: 8px 0;
              page-break-inside: avoid;
              border: 1px solid #7f1d1d;
            }
            .violation-card.high {
              background: #431407;
              border-left-color: #ea580c;
              border-color: #7c2d12;
            }
            .violation-card.medium {
              background: #422006;
              border-left-color: #eab308;
              border-color: #713f12;
            }
            .violation-card.low {
              background: #022c22;
              border-left-color: #10b981;
              border-color: #064e3b;
            }
            .violation-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 6px;
            }
            .violation-pillar {
              font-size: 11px;
              font-weight: 700;
              color: #e2e8f0;
            }
            .violation-severity {
              font-size: 9px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 3px;
              text-transform: uppercase;
              background: #ef4444;
              color: white;
            }
            .violation-severity.high { background: #ea580c; }
            .violation-severity.medium { background: #eab308; }
            .violation-severity.low { background: #10b981; }
            .violation-span {
              font-family: 'Courier New', monospace;
              font-size: 10px;
              color: #cbd5e1;
              background: #1e293b;
              padding: 4px 6px;
              border-radius: 3px;
              margin-top: 4px;
              display: inline-block;
            }
            
            /* Annotated Prompt */
            .annotated-prompt {
              background: #0f172a;
              border: 2px solid #334155;
              border-radius: 8px;
              padding: 15px;
              font-family: 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.8;
              color: #e2e8f0;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            
            /* PRD Gauge */
            .prd-gauge-container {
              margin: 20px 0;
            }
            .gauge-wrapper {
              position: relative;
              height: 60px;
              margin: 20px 0;
            }
            .gauge-track {
              height: 40px;
              border-radius: 20px;
              overflow: hidden;
              display: flex;
              border: 2px solid #334155;
              box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
            }
            .gauge-segment {
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: 700;
              color: rgba(255,255,255,0.8);
              transition: all 0.3s ease;
            }
            .gauge-segment.low {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              width: 25%;
            }
            .gauge-segment.medium {
              background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
              width: 25%;
            }
            .gauge-segment.high {
              background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
              width: 25%;
            }
            .gauge-segment.critical {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              width: 25%;
            }
            .gauge-labels {
              display: flex;
              justify-content: space-between;
              margin-top: 5px;
              font-size: 9px;
              color: #94a3b8;
            }
            .gauge-marker {
              position: absolute;
              top: -5px;
              width: 3px;
              height: 50px;
              transform: translateX(-50%);
              z-index: 10;
            }
            .gauge-marker::before {
              content: '';
              position: absolute;
              top: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 8px solid currentColor;
            }
            .gauge-marker::after {
              content: attr(data-label);
              position: absolute;
              bottom: -18px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 10px;
              font-weight: 700;
              white-space: nowrap;
              color: currentColor;
            }
            .gauge-marker.prompt {
              color: #ec4899;
            }
            .gauge-marker.prompt::after {
              bottom: -30px;
            }
            .gauge-marker.meta {
              color: #06b6d4;
            }
            .gauge-legend {
              display: flex;
              gap: 20px;
              justify-content: center;
              margin-top: 15px;
              font-size: 11px;
            }
            .gauge-legend-item {
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .gauge-legend-color {
              width: 12px;
              height: 12px;
              border-radius: 2px;
              flex-shrink: 0;
            }
            
            /* Risk Type Badge */
            .risk-type-badge {
              display: inline-block;
              font-size: 9px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 3px;
              text-transform: uppercase;
              margin-left: 6px;
            }
            .risk-type-badge.prompt-risk {
              background: #ec4899;
              color: white;
            }
            .risk-type-badge.meta-risk {
              background: #06b6d4;
              color: white;
            }
            
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .page { page-break-after: always; }
              .page:last-child { page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          <!-- Page 1: Executive Summary & Guide -->
          <div class="page">
            <div class="guide-header">
              <h1>🔍 Echo Hallucination Analysis Report</h1>
              <div class="subtitle">Prompt Risk Detection (PRD) Assessment</div>
              <div class="date">${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
            </div>

            <div class="metrics-grid">
              <div class="metric-card risk-${riskLevel.toLowerCase()}">
                <div class="metric-label">Overall Risk Score</div>
                <div class="metric-value">${riskScoreDecimal.toFixed(4)}</div>
                <div class="metric-desc">${riskLevel} Risk Level</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Prompt Length</div>
                <div class="metric-value">${promptWordCount}</div>
                <div class="metric-desc">${promptWordCount} tokens (${promptCharCount} chars)</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Flagged Tokens</div>
                <div class="metric-value" style="color: #ef4444;">${totalRiskTokens}</div>
                <div class="metric-desc">Risk tokens identified</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Total Violations</div>
                <div class="metric-value" style="color: #f59e0b;">${totalViolations}</div>
                <div class="metric-desc">Critical, High, Medium</div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">📝 Analyzed Prompt</div>
              <div class="prompt-box">${(originalPrompt || 'No prompt provided').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
            
            <div class="section">
              <div class="section-title">📊 Understanding This Report</div>
              <div class="section-content">
                <p><strong>What is Echo?</strong> Echo is an AI-powered hallucination detection system that analyzes prompts using PRD (Prompt Risk Detection) methodology. It identifies potential risks across 5 key pillars: Referential Ambiguity, Context Sufficiency, Instruction Structure, Verifiability & Factuality, and Reasoning & Uncertainty Handling.</p>
                
                <p><strong>PRD Scores:</strong> Prompt PRD and Meta PRD are decimal scores (0.00-1.00+) measuring different risk aspects. Low: 0.00-0.05, Medium: 0.05-0.15, High: 0.15-0.30, Critical: 0.30+. The gauge displays scores up to 0.30+ for clarity. Overall risk is the average of both scores.</p>
                
                <p><strong>Risk Tokens:</strong> Individual words or phrases flagged for potential issues, categorized by severity (Critical, High, Medium, Low) and classification type.</p>
                
                <p><strong>Violations:</strong> Specific instances where the prompt violates best practices, categorized by pillar and severity. Prompt-Level (pink) violations relate to specific text spans; Meta-Level (cyan) violations concern overall prompt structure.</p>
              </div>
            </div>
          </div>
          
          <!-- Page 2: Risk Assessment Overview -->
          <div class="page">
            
            ${Object.keys(tokensByClassification).length > 0 ? `
            <div class="chart-container">
              <div class="chart-title">Risk Token Distribution by Classification</div>
              <div class="bar-chart">
                ${Object.entries(tokensByClassification).slice(0, 5).map(([classification, tokens]) => `
                  <div class="bar-item">
                    <div class="bar-label" style="min-width: 140px; font-size: 10px;">${classification.substring(0, 30)}${classification.length > 30 ? '...' : ''}</div>
                    <div class="bar-track">
                      <div class="bar-fill medium" style="width: ${totalRiskTokens > 0 ? ((tokens as RiskToken[]).length / totalRiskTokens * 100) : 0}%">
                        ${(tokens as RiskToken[]).length}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}
            
            <div class="section-title" style="margin-bottom: 20px;">📈 Risk Assessment Overview</div>
            
            <div class="chart-container">
              <div class="chart-title">PRD Score Gauge (Prompt Risk Detection) - Range 0.00 to 0.30+</div>
              <div class="prd-gauge-container">
                <div class="gauge-wrapper">
                  <div class="gauge-track">
                    <div class="gauge-segment low">
                      <span style="font-size: 9px;">Low</span>
                    </div>
                    <div class="gauge-segment medium">
                      <span style="font-size: 9px;">Medium</span>
                    </div>
                    <div class="gauge-segment high">
                      <span style="font-size: 9px;">High</span>
                    </div>
                    <div class="gauge-segment critical">
                      <span style="font-size: 9px;">Critical</span>
                    </div>
                  </div>
                  ${(() => {
                    // Prevent marker overlap by adjusting positions if scores are too close
                    let promptPos = promptPRDPercent;
                    let metaPos = metaPRDPercent;
                    const minDistance = 5; // Minimum 5% distance to avoid overlap
                    
                    if (Math.abs(promptPRDPercent - metaPRDPercent) < minDistance) {
                      // If scores are very close, offset them slightly
                      if (promptPRDPercent < metaPRDPercent) {
                        promptPos = Math.max(0, metaPRDPercent - minDistance);
                      } else {
                        metaPos = Math.max(0, promptPRDPercent - minDistance);
                      }
                    }
                    
                    return `
                      <div class="gauge-marker prompt" style="left: ${promptPos}%;" data-label="Prompt: ${promptPRD.toFixed(4)}"></div>
                      <div class="gauge-marker meta" style="left: ${metaPos}%;" data-label="Meta: ${metaPRD.toFixed(4)}"></div>
                    `;
                  })()}
                </div>
                <div class="gauge-labels">
                  <span>0.00</span>
                  <span>0.05</span>
                  <span>0.15</span>
                  <span>0.30+</span>
                </div>
                <div class="gauge-legend">
                  <div class="gauge-legend-item">
                    <div class="gauge-legend-color" style="background: #ec4899;"></div>
                    <span>Prompt PRD: ${promptPRD.toFixed(4)}</span>
                  </div>
                  <div class="gauge-legend-item">
                    <div class="gauge-legend-color" style="background: #06b6d4;"></div>
                    <span>Meta PRD: ${metaPRD.toFixed(4)}</span>
                  </div>
                  <div class="gauge-legend-item">
                    <div class="gauge-legend-color" style="background: ${riskScoreDecimal >= 0.30 ? '#ef4444' : riskScoreDecimal >= 0.15 ? '#ea580c' : riskScoreDecimal >= 0.05 ? '#eab308' : '#10b981'};"></div>
                    <span>Overall Risk: ${riskScoreDecimal.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="chart-container">
              <div class="chart-title">Risk Tokens by Severity (${totalRiskTokens} total)</div>
              <div class="bar-chart">
                <div class="bar-item">
                  <div class="bar-label">Critical</div>
                  <div class="bar-track">
                    <div class="bar-fill critical" style="width: ${totalRiskTokens > 0 ? (criticalTokens / totalRiskTokens * 100) : 0}%">
                      ${criticalTokens}
                    </div>
                  </div>
                </div>
                <div class="bar-item">
                  <div class="bar-label">High</div>
                  <div class="bar-track">
                    <div class="bar-fill high" style="width: ${totalRiskTokens > 0 ? (highRiskTokens / totalRiskTokens * 100) : 0}%">
                      ${highRiskTokens}
                    </div>
                  </div>
                </div>
                <div class="bar-item">
                  <div class="bar-label">Medium</div>
                  <div class="bar-track">
                    <div class="bar-fill medium" style="width: ${totalRiskTokens > 0 ? (mediumRiskTokens / totalRiskTokens * 100) : 0}%">
                      ${mediumRiskTokens}
                    </div>
                  </div>
                </div>
                <div class="bar-item">
                  <div class="bar-label">Low</div>
                  <div class="bar-track">
                    <div class="bar-fill low" style="width: ${totalRiskTokens > 0 ? (lowRiskTokens / totalRiskTokens * 100) : 0}%">
                      ${lowRiskTokens}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="chart-container">
              <div class="chart-title">Violations by Severity (${totalViolations} total)</div>
              <div class="bar-chart">
                <div class="bar-item">
                  <div class="bar-label">Critical</div>
                  <div class="bar-track">
                    <div class="bar-fill critical" style="width: ${totalViolations > 0 ? (criticalViolations / totalViolations * 100) : 0}%">
                      ${criticalViolations}
                    </div>
                  </div>
                </div>
                <div class="bar-item">
                  <div class="bar-label">High</div>
                  <div class="bar-track">
                    <div class="bar-fill high" style="width: ${totalViolations > 0 ? (highViolations / totalViolations * 100) : 0}%">
                      ${highViolations}
                    </div>
                  </div>
                </div>
                <div class="bar-item">
                  <div class="bar-label">Medium</div>
                  <div class="bar-track">
                    <div class="bar-fill medium" style="width: ${totalViolations > 0 ? (mediumViolations / totalViolations * 100) : 0}%">
                      ${mediumViolations}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="section" style="margin-top: 20px;">
              <div class="section-title">🎯 Prompt Risk Overview</div>
              <div class="section-content">
                ${riskAssessment.prompt.prompt_overview}
              </div>
            </div>
            
            ${riskAssessment.meta.meta_overview ? `
            <div class="section">
              <div class="section-title">🔍 Meta Risk Overview</div>
              <div class="section-content">
                ${riskAssessment.meta.meta_overview}
              </div>
            </div>
            ` : ''}
          </div>
          
          <!-- Page 3: Violations Details -->
          ${riskAssessment.prompt.prompt_violations.length > 0 || riskAssessment.meta.meta_violations.length > 0 ? `
          <div class="page">
            <div class="section-title" style="margin-bottom: 20px;">⚠️ Detected Violations</div>
            
            ${riskAssessment.prompt.prompt_violations.length > 0 ? `
              <div style="margin-bottom: 15px;">
                <div class="section-title" style="font-size: 14px; color: #ec4899;">📝 Prompt-Level Violations (${riskAssessment.prompt.prompt_violations.length})</div>
                ${riskAssessment.prompt.prompt_violations.map((violation, idx) => `
                  <div class="violation-card ${violation.severity}">
                    <div class="violation-header">
                      <div class="violation-pillar">
                        ${idx + 1}. ${violation.pillar}
                        <span class="risk-type-badge prompt-risk">PROMPT</span>
                      </div>
                      <div class="violation-severity ${violation.severity}">${violation.severity}</div>
                    </div>
                    <div class="violation-span">"${violation.span.replace(/</g, '&lt;').replace(/>/g, '&gt;')}"</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${riskAssessment.meta.meta_violations.length > 0 ? `
              <div style="margin-top: 20px;">
                <div class="section-title" style="font-size: 14px; color: #06b6d4;">🔍 Meta-Level Violations (${riskAssessment.meta.meta_violations.length})</div>
                ${riskAssessment.meta.meta_violations.map((violation, idx) => `
                  <div class="violation-card ${violation.severity}">
                    <div class="violation-header">
                      <div class="violation-pillar">
                        ${idx + 1}. ${violation.pillar}
                        <span class="risk-type-badge meta-risk">META</span>
                      </div>
                      <div class="violation-severity ${violation.severity}">${violation.severity}</div>
                    </div>
                    <div class="section-content" style="margin-top: 6px; font-size: 10px;">
                      ${violation.explanation}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
          ` : ''}
          
          <!-- Pages 4-5: Detailed Token Analysis (up to 12 tokens, 6 per page) -->
          ${allRiskTokens.length > 0 ? allRiskTokens.slice(0, 12).reduce((pages: string[], token: RiskToken, idx: number) => {
            const pageIndex = Math.floor(idx / 6);
            if (!pages[pageIndex]) {
              pages[pageIndex] = `
                <div class="page">
                  <div class="section-title" style="margin-bottom: 20px;">🔬 Detailed Token Analysis ${pageIndex > 0 ? `(Page ${pageIndex + 1})` : ''}</div>
              `;
            }
            
            pages[pageIndex] += `
              <div class="token-card">
                <div class="token-card-header">
                  <div class="token-text">"${token.text}"</div>
                  <div class="token-risk-badge ${token.risk_level || 'medium'}">${token.risk_level || 'MEDIUM'}</div>
                </div>
                <div class="token-classification">${token.classification}</div>
                <div class="token-reasoning"><strong>Reasoning:</strong> ${token.reasoning}</div>
                <div class="token-mitigation"><span class="token-mitigation-label">💡 Mitigation:</span> ${token.mitigation}</div>
              </div>
            `;
            
            // Close page after 6 tokens or on last token
            if ((idx + 1) % 6 === 0 || idx === Math.min(allRiskTokens.length - 1, 11)) {
              pages[pageIndex] += '</div>';
            }
            
            return pages;
          }, []).join('') : ''}
          
          <!-- Page: Annotated Prompt (if available) -->
          ${analysis.annotated_prompt ? `
          <div class="page">
            <div class="section-title" style="margin-bottom: 20px;">🎨 Annotated Prompt</div>
            <div class="annotated-prompt">${analysis.annotated_prompt.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            
            ${annotatedTokens.length > 0 ? `
            <div class="legend" style="margin-top: 15px;">
              ${Array.from(new Set(annotatedTokens.map(t => t.category))).slice(0, 6).map(category => `
                <div class="legend-item">
                  <div class="legend-color ${category.toLowerCase()}"></div>
                  <span>${category}</span>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <!-- Final Page: Summary -->
          <div class="page">
            <div class="section-title" style="margin-bottom: 20px;">📋 Analysis Summary</div>
            <div class="section-content">
              ${analysis.analysisSummary || 'No summary available'}
            </div>
            
            ${Object.keys(tokensByClassification).length > 0 ? `
            <div class="section" style="margin-top: 20px;">
              <div class="section-title">📊 Risk Classification Breakdown</div>
              <div class="section-content">
                <ul style="list-style: none; padding: 0;">
                  ${Object.entries(tokensByClassification).map(([classification, tokens]) => `
                    <li style="margin-bottom: 8px;">
                      <strong>${classification}:</strong> ${(tokens as RiskToken[]).length} token${(tokens as RiskToken[]).length !== 1 ? 's' : ''}
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
            ` : ''}
            
            <div class="footer-note" style="margin-top: 40px;">
              Generated by Echo Hallucination Detector • ${new Date().toLocaleString()} • For research and educational purposes
            </div>
          </div>
        </body>
        </html>
      `;

      // Write to new window and trigger print
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then trigger print dialog
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setExportSuccess(true);
          setTimeout(() => {
            setExportingFormat(null);
            setExportSuccess(false);
          }, 2000);
        }, 500);
      };

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      setExportingFormat(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Export Analysis
          </DialogTitle>
          <DialogDescription>
            Choose your preferred export format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* PDF Export */}
          <button
            onClick={handleExportPDF}
            disabled={exportingFormat !== null}
            className="w-full p-4 rounded-lg border-2 border-red-200 dark:border-red-900/50 hover:border-red-400 dark:hover:border-red-700 bg-red-50/30 dark:bg-red-950/30 hover:bg-red-100/50 dark:hover:bg-red-950/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                {exportingFormat === 'pdf' ? (
                  <Loader2 className="w-6 h-6 text-red-600 dark:text-red-400 animate-spin" />
                ) : exportSuccess && exportingFormat === null ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  Export as PDF
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Professional report with charts and graphs
                </div>
              </div>
            </div>
          </button>

          {/* JSON Export */}
          <button
            onClick={handleExportJSON}
            disabled={exportingFormat !== null}
            className="w-full p-4 rounded-lg border-2 border-green-200 dark:border-green-900/50 hover:border-green-400 dark:hover:border-green-700 bg-green-50/30 dark:bg-green-950/30 hover:bg-green-100/50 dark:hover:bg-green-950/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                {exportingFormat === 'json' ? (
                  <Loader2 className="w-6 h-6 text-green-600 dark:text-green-400 animate-spin" />
                ) : exportSuccess && exportingFormat === null ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <FileJson className="w-6 h-6 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  Export as JSON
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Raw data for further analysis
                </div>
              </div>
            </div>
          </button>
        </div>

        {exportSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">
                Export successful!
              </span>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
