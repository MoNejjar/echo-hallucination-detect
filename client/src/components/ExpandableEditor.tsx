import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative ${className}`}
      >
        {/* Enhanced Compact Editor */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <motion.div 
            whileHover={{ scale: 1.002 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative"
          >
            <Textarea
              value={prompt}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[300px] resize-none pr-16 text-sm leading-relaxed font-mono bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-xl hover:shadow-2xl transition-all duration-500 focus:border-purple-300 dark:focus:border-purple-600 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30 p-6"
            />
            
            {/* Enhanced Expand Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute top-4 right-4"
                >
                  <Button
                    onClick={() => setIsExpanded(true)}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-800/50 dark:hover:to-blue-800/50 border border-purple-200/60 dark:border-purple-700/60 rounded-xl backdrop-blur-sm transition-all duration-300"
                  >
                    <Maximize2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Expand editor (Ctrl+Enter)</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>

          {/* Enhanced Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between text-sm bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-4 shadow-lg"
          >
            <div className="flex items-center gap-6">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2"
                  >
                    <Type className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">{stats.characters}</span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Characters</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent font-medium">{stats.words}</span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Words</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2"
                  >
                    <Hash className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-medium">{stats.tokens}</span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Estimated Tokens (GPT-4 compatible)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleCopy}
                    variant="ghost"
                    size="sm"
                    className="h-9 px-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-800/50 dark:hover:to-blue-800/50 border border-purple-200/60 dark:border-purple-700/60 rounded-lg backdrop-blur-sm transition-all duration-300"
                    disabled={!prompt}
                  >
                    <Copy className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-medium">
                      {copied ? 'Copied!' : 'Copy'}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy prompt to clipboard</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Expanded Editor Dialog */}
        <AnimatePresence>
          {isExpanded && (
            <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
              <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DialogTitle className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-xl font-semibold">
                      <Zap className="w-6 h-6 text-purple-600" />
                      Prompt Editor
                    </DialogTitle>
                  </motion.div>
                </DialogHeader>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="flex-1 flex flex-col space-y-6 min-h-0"
                >
                  {/* Enhanced Expanded Stats Bar */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border"
                  >
                    <div className="flex items-center gap-8">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2"
                      >
                        <Type className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats.characters}</span>
                        <span className="text-sm text-gray-500">characters</span>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2"
                      >
                        <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-lg font-semibold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">{stats.words}</span>
                        <span className="text-sm text-gray-500">words</span>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2"
                      >
                        <Hash className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <span className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{stats.tokens}</span>
                        <span className="text-sm text-gray-500">tokens</span>
                      </motion.div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleCopy}
                        variant="ghost"
                        size="sm"
                        disabled={!prompt.trim()}
                        className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-800/50 dark:hover:to-blue-800/50 border border-purple-200/60 dark:border-purple-700/60 rounded-lg backdrop-blur-sm transition-all duration-300"
                      >
                        <Copy className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-medium">
                          {copied ? 'Copied!' : 'Copy All'}
                        </span>
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Enhanced Large Editor */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex-1 min-h-0"
                  >
                    <motion.div
                      whileHover={{ scale: 1.001 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="h-full"
                    >
                      <Textarea
                        value={prompt}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`${placeholder}\n\nTip: Press Escape to minimize this editor.`}
                        disabled={disabled}
                        className="w-full h-full min-h-[400px] resize-none text-sm leading-relaxed font-mono"
                      />
                    </motion.div>
                  </motion.div>

                  {/* Enhanced Footer Actions */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-between pt-4 border-t"
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4">
                      <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
                        <kbd className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Ctrl+Enter</kbd>
                        <span>to expand</span>
                      </motion.div>
                      <span className="text-gray-400">•</span>
                      <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
                        <kbd className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Esc</kbd>
                        <span>to minimize</span>
                      </motion.div>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => setIsExpanded(false)}
                        variant="outline"
                        size="sm"
                      >
                        <Minimize2 className="w-4 h-4 mr-2" />
                        Minimize
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
};

export default ExpandableEditor;
