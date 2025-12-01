import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Zap,
  PenLine,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Code,
  Heading1,
  Heading2,
  Quote
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
  const expandedTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Markdown formatting helper
  const applyMarkdown = (format: string) => {
    const textarea = expandedTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = prompt.substring(start, end);
    let newText = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        newText = prompt.substring(0, start) + `**${selectedText || 'bold text'}**` + prompt.substring(end);
        cursorOffset = selectedText ? 2 : 2;
        break;
      case 'italic':
        newText = prompt.substring(0, start) + `*${selectedText || 'italic text'}*` + prompt.substring(end);
        cursorOffset = selectedText ? 1 : 1;
        break;
      case 'h1':
        newText = prompt.substring(0, start) + `# ${selectedText || 'Heading 1'}` + prompt.substring(end);
        cursorOffset = 2;
        break;
      case 'h2':
        newText = prompt.substring(0, start) + `## ${selectedText || 'Heading 2'}` + prompt.substring(end);
        cursorOffset = 3;
        break;
      case 'list':
        newText = prompt.substring(0, start) + `- ${selectedText || 'List item'}` + prompt.substring(end);
        cursorOffset = 2;
        break;
      case 'orderedList':
        newText = prompt.substring(0, start) + `1. ${selectedText || 'List item'}` + prompt.substring(end);
        cursorOffset = 3;
        break;
      case 'code':
        newText = prompt.substring(0, start) + `\`${selectedText || 'code'}\`` + prompt.substring(end);
        cursorOffset = selectedText ? 1 : 1;
        break;
      case 'quote':
        newText = prompt.substring(0, start) + `> ${selectedText || 'Quote'}` + prompt.substring(end);
        cursorOffset = 2;
        break;
      case 'link':
        newText = prompt.substring(0, start) + `[${selectedText || 'link text'}](url)` + prompt.substring(end);
        cursorOffset = selectedText ? selectedText.length + 3 : 11;
        break;
      default:
        return;
    }

    onChange(newText);
    
    // Restore cursor position after update
    setTimeout(() => {
      if (textarea) {
        const newPosition = selectedText ? end + (format === 'bold' ? 4 : format === 'italic' || format === 'code' ? 2 : cursorOffset) : start + cursorOffset;
        textarea.focus();
        textarea.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  // Calculate stats with estimated API cost
  const stats = useMemo(() => {
    const characters = prompt.length;
    const words = prompt.split(/\s+/).filter(w => w.length > 0).length;
    const tokens = estimateTokens(prompt);
    // Rough estimation: ~$0.01 per 1000 tokens for GPT-4o-mini
    const estimatedCost = (tokens / 1000) * 0.01;

    return { characters, words, tokens, estimatedCost };
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

  // Simple markdown renderer for preview
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    return text.split('\n').map((line, i) => {
      // Headings
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-bold mt-3 mb-2">{line.substring(4)}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.substring(3)}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-2xl font-bold mt-4 mb-3">{line.substring(2)}</h1>;
      }
      
      // Lists
      if (line.match(/^\d+\.\s/)) {
        return <li key={i} className="ml-6 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="ml-6 list-disc">{line.substring(2)}</li>;
      }
      
      // Quote
      if (line.startsWith('> ')) {
        return <blockquote key={i} className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-2">{line.substring(2)}</blockquote>;
      }
      
      // Process inline markdown
      let processedLine = line;
      
      // Bold
      processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-purple-700 dark:text-purple-300">$1</strong>');
      
      // Italic
      processedLine = processedLine.replace(/\*(.+?)\*/g, '<em class="italic text-purple-600 dark:text-purple-400">$1</em>');
      
      // Inline code
      processedLine = processedLine.replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm font-mono">$1</code>');
      
      // Links
      processedLine = processedLine.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300" target="_blank" rel="noopener noreferrer">$1</a>');
      
      return <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: processedLine }} />;
    });
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
          {/* Editor Header */}
          <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-purple-600 dark:text-purple-600" />
            <h3 className="text-lg font-bold text-purple-600 dark:text-purple-600 tracking-tight">
              Prompt Editor
            </h3>
          </div>
        </motion.div>


          <motion.div 
            whileHover={{ scale: 1.002 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative group"
          >
            {/* Markdown Preview Overlay - only visible when not editing */}
            {prompt && (
              <div className="absolute inset-0 pointer-events-none z-10 p-6 overflow-auto rounded-2xl group-focus-within:opacity-0 transition-opacity duration-200">
                <div className="prose prose-sm prose-purple dark:prose-invert max-w-none text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                  {renderMarkdown(prompt)}
                </div>
              </div>
            )}
            
            <Textarea
              value={prompt}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[300px] resize-none pr-16 text-sm leading-relaxed bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-xl hover:shadow-2xl transition-all duration-500 focus:border-purple-300 dark:focus:border-purple-600 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30 p-6 text-transparent focus:text-current selection:bg-purple-200 dark:selection:bg-purple-800"
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
                    className="h-10 w-10 p-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/50 dark:hover:to-purple-700/50 border border-purple-200/60 dark:border-purple-700/60 rounded-xl backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
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
            className="flex items-center justify-between text-sm bg-gradient-to-r from-gray-50 to-purple-50/50 dark:from-gray-900/80 dark:to-purple-900/20 backdrop-blur-lg rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-3 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white/60 dark:bg-gray-800/60 rounded-lg"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{stats.words}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">words</span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Word count</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white/60 dark:bg-gray-800/60 rounded-lg"
                  >
                    <Hash className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{stats.tokens}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">tokens</span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Estimated tokens (approximate)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/20 rounded-lg border border-purple-200/50 dark:border-purple-700/50"
                >
                  <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="text-purple-700 dark:text-purple-300 font-semibold">~${stats.estimatedCost.toFixed(4)}</span>
                  <span className="text-purple-500/70 dark:text-purple-400/70 text-xs">est. cost</span>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Estimated API cost based on token count</p>
              </TooltipContent>
            </Tooltip>
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
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-900 dark:text-white">Prompt Editor</span>
                    </DialogTitle>
                  </motion.div>
                </DialogHeader>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="flex-1 flex flex-col space-y-6 min-h-0"
                >
                  {/* Markdown Toolbar */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 via-purple-50/80 to-purple-50 dark:from-purple-950/30 dark:via-purple-950/20 dark:to-purple-950/30 rounded-xl border border-purple-200/50 dark:border-purple-800/50"
                  >
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900"
                            onClick={() => applyMarkdown('bold')}
                          >
                            <Bold className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Bold</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900"
                            onClick={() => applyMarkdown('italic')}
                          >
                            <Italic className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Italic</p></TooltipContent>
                      </Tooltip>

                      <div className="w-px h-6 bg-purple-300 dark:bg-purple-700 mx-1" />

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900"
                            onClick={() => applyMarkdown('h1')}
                          >
                            <Heading1 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Heading 1</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900"
                            onClick={() => applyMarkdown('h2')}
                          >
                            <Heading2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Heading 2</p></TooltipContent>
                      </Tooltip>

                      <div className="w-px h-6 bg-purple-300 dark:bg-purple-700 mx-1" />

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900"
                            onClick={() => applyMarkdown('list')}
                          >
                            <List className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Bullet List</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900"
                            onClick={() => applyMarkdown('orderedList')}
                          >
                            <ListOrdered className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Numbered List</p></TooltipContent>
                      </Tooltip>

                      <div className="w-px h-6 bg-purple-300 dark:bg-purple-700 mx-1" />

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900"
                            onClick={() => applyMarkdown('code')}
                          >
                            <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Inline Code</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900"
                            onClick={() => applyMarkdown('quote')}
                          >
                            <Quote className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Quote</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900"
                            onClick={() => applyMarkdown('link')}
                          >
                            <Link className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Link</p></TooltipContent>
                      </Tooltip>
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
                        className="h-8 px-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        <span className="font-medium text-sm">
                          {copied ? 'Copied!' : 'Copy'}
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
                    <Textarea
                      ref={expandedTextareaRef}
                      value={prompt}
                      onChange={(e) => onChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`${placeholder}\n\nTip: Press Escape to minimize this editor.`}
                      disabled={disabled}
                      className="w-full h-full min-h-[400px] resize-none text-sm leading-relaxed"
                    />
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
