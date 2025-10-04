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

interface ReanalyzeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPrompt: string;
  priorAnalysis: any;
  conversationHistory: { role: string; content: string }[];
  onGeneratePreview: (additionalChanges: string) => Promise<string>;
  onReanalyze: (refinedPrompt: string) => void;
  isLoading?: boolean;
}

export function ReanalyzeDialog({
  open,
  onOpenChange,
  currentPrompt,
  priorAnalysis,
  conversationHistory,
  onGeneratePreview,
  onReanalyze,
  isLoading = false
}: ReanalyzeDialogProps) {
  const [additionalChanges, setAdditionalChanges] = useState('');
  const [previewPrompt, setPreviewPrompt] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [hasGeneratedPreview, setHasGeneratedPreview] = useState(false);

  const handleGeneratePreview = async () => {
    setIsGeneratingPreview(true);
    try {
      const refinedPrompt = await onGeneratePreview(additionalChanges);
      setPreviewPrompt(refinedPrompt);
      setHasGeneratedPreview(true);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      setPreviewPrompt('Error generating preview. Please try again.');
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

          {/* Section 2: Current Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Current Prompt:
            </label>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg max-h-40 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-200">
                {currentPrompt}
              </pre>
            </div>
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
                onClick={handleGeneratePreview}
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
                    Generate Preview
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
                  Click "Generate Preview" to create a refined version of your prompt using AI-assisted improvements 
                  based on the conversation history, hallucination mitigation guidelines, and prior analysis.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-md">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    This refined prompt incorporates insights from your conversation, the hallucination mitigation guidelines, and the prior analysis to provide guided improvements.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg max-h-60 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-200">
                    {previewPrompt}
                  </pre>
                </div>
              </motion.div>
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
