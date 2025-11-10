import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Info, Sparkles, RefreshCw, Wand2 } from 'lucide-react';
import { AnalysisLoadingDialog } from './AnalysisLoadingDialog';

import type { PrepareVariation } from '../types';

interface ReanalyzeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPrompt: string;
  priorAnalysis: any;
  conversationHistory: { role: string; content: string }[];
  onGeneratePreview: (additionalChanges: string) => Promise<number>;
  onReanalyze: (refinedPrompt: string) => void;
  isLoading?: boolean;
  preparedVariations?: PrepareVariation[];
}

export function ReanalyzeDialog({
  open,
  onOpenChange,
  currentPrompt,
  priorAnalysis,
  conversationHistory,
  onGeneratePreview,
  onReanalyze,
  isLoading = false,
  preparedVariations
}: ReanalyzeDialogProps) {
  const [additionalChanges, setAdditionalChanges] = useState('');
  const [previewPrompt, setPreviewPrompt] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [hasGeneratedPreview, setHasGeneratedPreview] = useState(false);

  const handleGeneratePreview = async (baseOverride?: string) => {
    setIsGeneratingPreview(true);
    try {
      const variantCount = await onGeneratePreview(additionalChanges || "");
      setHasGeneratedPreview(true);
      if (!variantCount) {
        setPreviewPrompt('');
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
      setPreviewPrompt('');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleConfirm = () => {
    if (!hasGeneratedPreview || !previewPrompt) return;
    onReanalyze(previewPrompt);
  };

  const handleClose = () => {
    if (!isLoading && !isGeneratingPreview) {
      setAdditionalChanges('');
      setPreviewPrompt('');
      setHasGeneratedPreview(false);
      onOpenChange(false);
    }
  };

  // Show loading dialog when analyzing
  if (isLoading) {
    return (
      <AnalysisLoadingDialog
        open={isLoading}
        title="Re-analyzing Prompt"
        description="Please wait while we analyze the refined prompt for potential hallucination risks..."
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <RefreshCw className="w-6 h-6 text-purple-600" />
            Re-analyze Prompt
          </DialogTitle>
          <DialogDescription className="text-base">
            Generate a refined version of your prompt with AI-assisted improvements
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-2">
          {/* Section 1: Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg"
          >
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Before re-analysis, you can make final changes
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Add any last-minute adjustments below, then generate a preview. 
                This will update the analysis and restart the conversation with fresh context.
              </p>
            </div>
          </motion.div>

          {/* Section 2: Current Prompt & Variations (Initiator + Prepared) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Current Prompt:
            </label>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg max-h-40 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-200">
                {currentPrompt}
              </pre>
            </div>

            {hasGeneratedPreview && preparedVariations && preparedVariations.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4">
                  Prepared Variations (after your edits):
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {preparedVariations.map(v => (
                    <motion.button
                      key={`prep-${v.id}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isGeneratingPreview || isLoading}
                      onClick={() => {
                        setPreviewPrompt(v.prompt);
                        setHasGeneratedPreview(true);
                      }}
                      className="text-left p-3 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300">#{v.id}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 rounded">
                          {v.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-300 mb-1">Focus: {v.focus}</div>
                      <div className="text-xs text-gray-700 dark:text-gray-200 line-clamp-4 whitespace-pre-wrap font-mono">
                        {v.prompt}
                      </div>
                      <div className="mt-2 text-[10px] text-emerald-700 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">Click to use as preview</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Additional Changes */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Additional Changes (Optional):
            </label>
            <Textarea
              placeholder="Enter any final changes you want to make to the prompt..."
              value={additionalChanges}
              onChange={(e) => setAdditionalChanges(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isLoading || isGeneratingPreview}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              These changes will be considered by the AI when generating the refined prompt
            </p>
          </div>

          {/* Section 4: Preview Generation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Preview of Refined Prompt:
              </label>
              <Button
                onClick={() => handleGeneratePreview()}
                disabled={isGeneratingPreview || isLoading}
                size="sm"
                className="gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {isGeneratingPreview ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {hasGeneratedPreview ? 'Regenerate Variants' : 'Generate Variants'}
                  </>
                )}
              </Button>
            </div>

            {!hasGeneratedPreview ? (
              <div className="p-8 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
                <Wand2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  No preview generated yet
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Click "Generate Variants" to generate 5 refined options based on your edits, conversation history, mitigation guidelines, and prior analysis. Then choose one to preview below.
                </p>
              </div>
            ) : preparedVariations && preparedVariations.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-md">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    Select one of the generated variants above to preview it here.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg max-h-60 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-200">
                    {previewPrompt || 'No variant selected yet.'}
                  </pre>
                </div>
              </motion.div>
            ) : (
              <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg text-center">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">No variants returned</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">The generation succeeded but produced zero variants. Try regenerating or adjust your additional changes.</p>
                <Button
                  onClick={() => handleGeneratePreview()}
                  disabled={isGeneratingPreview || isLoading}
                  size="sm"
                  variant="outline"
                  className="border-yellow-400 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-800/30"
                >
                  Regenerate Variants
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading || isGeneratingPreview}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!hasGeneratedPreview || isLoading || isGeneratingPreview}
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className="w-4 h-4" />
            Confirm & Re-analyze
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
