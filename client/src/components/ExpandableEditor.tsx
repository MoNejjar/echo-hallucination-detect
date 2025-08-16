import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Maximize2, 
  Minimize2, 
  Copy, 
  FileText, 
  Hash,
  Type,
  Zap
} from 'lucide-react';

// Simple token estimation function (approximates OpenAI's tokenization)
const estimateTokens = (text: string): number => {
  if (!text || text.trim().length === 0) return 0;
  
  // More accurate estimation based on OpenAI's tokenization patterns
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  let tokens = 0;
  
  for (const word of words) {
    // Most common English words are 1 token
    if (word.length <= 4) {
      tokens += 1;
    }
    // Longer words typically 1-2 tokens
    else if (word.length <= 8) {
      tokens += Math.ceil(word.length / 4);
    }
    // Very long words can be 2-3 tokens
    else {
      tokens += Math.ceil(word.length / 3);
    }
  }
  
  // Add tokens for punctuation and special characters
  const punctuation = text.match(/[.,!?;:()[\]{}'"]/g);
  if (punctuation) {
    tokens += punctuation.length * 0.5; // Punctuation is often merged with words
  }
  
  // Add a small buffer for subword tokenization
  tokens = Math.ceil(tokens * 1.1);
  
  return Math.max(tokens, 1);
};

interface ExpandableEditorProps {
  prompt: string;
  onChange: (prompt: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const ExpandableEditor: React.FC<ExpandableEditorProps> = ({
  prompt,
  onChange,
  placeholder = "Enter your prompt here...",
  disabled = false,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const characters = prompt.length;
    const words = prompt.split(/\s+/).filter(w => w.length > 0).length;
    const tokens = estimateTokens(prompt);

    return { characters, words, tokens };
  }, [prompt]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to expand
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      setIsExpanded(true);
    }
    // Escape to collapse (when in expanded mode)
    if (e.key === 'Escape' && isExpanded) {
      e.preventDefault();
      setIsExpanded(false);
    }
  };

  return (
    <TooltipProvider>
      <div className={`relative ${className}`}>
        {/* Compact Editor */}
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[300px] resize-none pr-12 text-sm leading-relaxed font-mono"
            />
            
            {/* Expand Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsExpanded(true)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Expand editor (Ctrl+Enter)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <Type className="w-3 h-3" />
                    <span>{stats.characters}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Characters</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>{stats.words}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Words</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    <span className="font-medium text-blue-600 dark:text-blue-400">{stats.tokens}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Estimated Tokens (GPT-4 compatible)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleCopy}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  disabled={!prompt}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy prompt to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Expanded Editor Dialog */}
        <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Prompt Editor
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 flex flex-col space-y-4 min-h-0">
              {/* Expanded Stats Bar */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{stats.characters}</span>
                    <span className="text-xs text-gray-500">characters</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{stats.words}</span>
                    <span className="text-xs text-gray-500">words</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{stats.tokens}</span>
                    <span className="text-xs text-gray-500">tokens</span>
                  </div>

                  {/* Token cost estimation */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      GPT-4: ~${((stats.tokens / 1000) * 0.03).toFixed(4)}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      GPT-3.5: ~${((stats.tokens / 1000) * 0.002).toFixed(4)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  disabled={!prompt}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy All'}
                </Button>
              </div>

              {/* Large Editor */}
              <div className="flex-1 min-h-0">
                <Textarea
                  value={prompt}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`${placeholder}\n\nTip: Press Escape to minimize this editor.`}
                  disabled={disabled}
                  className="w-full h-full min-h-[400px] resize-none text-sm leading-relaxed font-mono"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-xs text-gray-500">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Ctrl+Enter</kbd> to expand • 
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs ml-2">Esc</kbd> to minimize
                </div>
                
                <Button
                  onClick={() => setIsExpanded(false)}
                  variant="outline"
                  size="sm"
                >
                  <Minimize2 className="w-4 h-4 mr-2" />
                  Minimize
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default ExpandableEditor;
