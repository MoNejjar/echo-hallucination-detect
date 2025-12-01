import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
import { 
  Send, 
  Bot,
  User,
  Sparkles,
  MessageSquare,
  Loader2,
  Copy,
  Check,
  Star,
  Zap,
  Brain,
  ArrowRight,
  BotMessageSquare,
  Radar,
  UserRound,
  RefreshCw
} from 'lucide-react';
import { ChatMessage } from '../types';
import toast from 'react-hot-toast';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onReanalyze?: () => void;
  hasAnalysis?: boolean;
  isLoading?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, onReanalyze, hasAnalysis = false, isLoading }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Check if the last message is still being typed (streaming)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.content === '') {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim() || isLoading || isTyping) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, messageIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIndex(messageIndex);
    toast.success('Copied to clipboard!', {
      icon: '📋',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedMessageIndex(null);
    }, 2000);
  };

  const formatMessage = (content: string) => {
    // Enhanced markdown-to-HTML formatting with visual hierarchy
    let formatted = content
      // Handle code blocks first (triple backticks with optional language)
      .replace(/```(\w*)\n?([\s\S]*?)```/g, '<div class="relative group"><div class="absolute right-2 top-2 text-xs text-gray-400 font-mono">$1</div><pre class="bg-slate-900 text-slate-50 p-3 rounded-xl my-1 overflow-x-auto shadow-sm border border-slate-800"><code class="text-sm font-mono leading-relaxed">$2</code></pre></div>')
      
      // Handle inline code (single backticks)
      .replace(/`([^`]+)`/g, '<code class="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-md text-sm font-mono border border-purple-100 dark:border-purple-800/50">$1</code>')
      
      // Handle blockquotes with a more distinct visual style
      .replace(/^> (.+)$/gm, '<div class="flex gap-3 my-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-r-xl border-l-4 border-blue-500"><div class="text-blue-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div><div class="italic text-gray-800 dark:text-gray-100">$1</div></div>')
      
      // Handle special purple headers for key sections with icons and boxes
      .replace(/^(Improved Prompt:?)$/gm, '<div class="flex items-center gap-2 mt-4 mb-2 pb-2 border-b-2 border-purple-100 dark:border-purple-900/50"><span class="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg></span><h2 class="text-xl font-bold text-purple-700 dark:text-purple-300">Improved Prompt</h2></div>')
      .replace(/^(Explanations:?)$/gm, '<div class="flex items-center gap-2 mt-4 mb-2 pb-2 border-b-2 border-blue-100 dark:border-blue-900/50"><span class="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><h2 class="text-xl font-bold text-blue-700 dark:text-blue-300">Explanations</h2></div>')
      
      // Handle regular headers with better spacing and visual weight
      .replace(/^#### (.*$)/gm, '<h4 class="text-base font-bold mt-2 mb-1 text-gray-800 dark:text-gray-200 flex items-center gap-2"><span class="w-1 h-4 bg-slate-300 rounded-full"></span>$1</h4>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-3 mb-1 text-gray-800 dark:text-gray-200 border-b border-slate-100 dark:border-slate-800 pb-1">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100 border-b border-slate-200 dark:border-slate-700 pb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-extrabold mt-4 mb-3 text-gray-900 dark:text-gray-100 border-b-2 border-slate-200 dark:border-slate-700 pb-3">$1</h1>')
      
      // Handle bold + italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="font-bold text-gray-900 dark:text-gray-100"><em class="italic">$1</em></strong>')
      .replace(/___(.+?)___/g, '<strong class="font-bold text-gray-900 dark:text-gray-100"><em class="italic">$1</em></strong>')
      
      // Handle bold text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-gray-100">$1</strong>')
      .replace(/__(.+?)__/g, '<strong class="font-bold text-gray-900 dark:text-gray-100">$1</strong>')
      
      // Handle italic text
      .replace(/\*(.+?)\*/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>')
      .replace(/_(.+?)_/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>');

    // Process lists with enhanced visual structure
    const lines = formatted.split('\n');
    const processedLines: string[] = [];
    
    interface ListContext {
      type: 'ul' | 'ol';
      indent: number;
    }
    
    const listStack: ListContext[] = [];
    let skippedEmptyLine = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle empty lines first to control spacing
      if (!line.trim()) {
        if (listStack.length > 0) {
          skippedEmptyLine = true;
        } else {
          processedLines.push('');
        }
        continue;
      }

      // Measure indentation
      const indentMatch = line.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1].replace(/\t/g, '  ').length : 0;
      
      // Check what type of line this is
      const unorderedMatch = line.match(/^(\s*)[-*+]\s(.+)$/);
      const orderedMatch = line.match(/^(\s*)(\d+)\.\s(.+)$/);
      const isNumberedSection = orderedMatch && orderedMatch[3].match(/^[^:]*:$/);

      if (isNumberedSection) {
        // Close all open lists
        while (listStack.length > 0) {
          const ctx = listStack.pop()!;
          if (ctx.type === 'ul') processedLines.push('</ul>');
          else if (ctx.type === 'ol') processedLines.push('</ol>');
        }
        if (skippedEmptyLine) processedLines.push('');
        skippedEmptyLine = false;
        
        // Convert numbered sections to styled cards/boxes
        const sectionNum = orderedMatch![2];
        const content = orderedMatch![3];
        processedLines.push(`
          <div class="mt-2 mb-1 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div class="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span class="flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 text-xs border border-purple-200 dark:border-purple-800">${sectionNum}</span>
              <span>${content}</span>
            </div>
          </div>
        `);
        
      } else if (unorderedMatch || (orderedMatch && !isNumberedSection)) {
        // List item - consume skipped line (don't output it) to keep list tight
        skippedEmptyLine = false;

        const listType = unorderedMatch ? 'ul' : 'ol';
        const content = unorderedMatch ? unorderedMatch[2] : orderedMatch![3];
        
        // Close lists with greater indentation
        while (listStack.length > 0 && listStack[listStack.length - 1].indent >= indent) {
          const ctx = listStack.pop()!;
          if (ctx.type === 'ul') processedLines.push('</ul>');
          else if (ctx.type === 'ol') processedLines.push('</ol>');
        }
        
        // Open new list if needed
        const currentContext = listStack[listStack.length - 1];
        if (!currentContext || currentContext.type !== listType || currentContext.indent < indent) {
          const marginLeft = Math.floor(indent / 2) + 2;
          if (listType === 'ul') {
            // Enhanced unordered list styling - ultra tight spacing
            processedLines.push(`<ul class="list-none ml-${marginLeft} my-0 space-y-0">`);
          } else {
            // Enhanced ordered list styling - ultra tight spacing
            processedLines.push(`<ol class="list-none ml-${marginLeft} my-0 space-y-0">`);
          }
          listStack.push({ type: listType, indent });
        }
        
        // Styled list items - with breathing room
        if (listType === 'ul') {
          processedLines.push(`<li class="flex items-start gap-2 mb-2 leading-normal"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></span><span class="text-gray-800 dark:text-gray-100">${content}</span></li>`);
        } else {
          processedLines.push(`<li class="flex items-start gap-2 mb-2 leading-normal"><span class="font-mono text-xs text-gray-500 font-bold pt-0.5 select-none flex-shrink-0">${orderedMatch![2]}.</span><span class="text-gray-800 dark:text-gray-100">${content}</span></li>`);
        }
        
      } else {
        // Regular content - close all open lists
        if (listStack.length > 0) {
          while (listStack.length > 0) {
            const ctx = listStack.pop()!;
            if (ctx.type === 'ul') processedLines.push('</ul>');
            else if (ctx.type === 'ol') processedLines.push('</ol>');
          }
          // If we skipped an empty line before this paragraph, restore it for separation
          if (skippedEmptyLine) processedLines.push('');
        }
        skippedEmptyLine = false;
        
        processedLines.push(line);
      }
    }

    // Close any remaining open lists
    while (listStack.length > 0) {
      const ctx = listStack.pop()!;
      if (ctx.type === 'ul') processedLines.push('</ul>');
      else if (ctx.type === 'ol') processedLines.push('</ol>');
    }

    formatted = processedLines.join('\n');

    // Handle line breaks and paragraphs with better typography
    formatted = formatted
      .split('\n\n').map(paragraph => {
        const trimmed = paragraph.trim();
        if (trimmed) {
          // Don't wrap if it's already a block element
          if (/^<(h[1-6]|pre|blockquote|ul|ol|div)/.test(trimmed)) {
            // For block elements, we don't want to replace internal newlines with <br>
            // as it breaks the layout (especially for lists)
            return trimmed;
          }
          return `<p class="mb-2 leading-relaxed text-gray-800 dark:text-gray-100">${paragraph.replace(/\n/g, '<br>')}</p>`;
        }
        return '';
      }).join('')
      
      // Handle links
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" class="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">$1 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>');
    
    return { __html: formatted };
  };

  const formatTimestamp = (timestamp: Date) => {
    try {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      // Fallback if timestamp is not a valid Date
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden rounded-3xl relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            x: [-48, 48, -48],
            y: [-48, 48, -48],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Messages Area with enhanced styling */}
      <ScrollArea className="flex-1 p-6 min-h-0 overflow-y-auto bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50 relative z-10">
        <div className={`${messages.length === 0 && !isLoading ? 'min-h-[400px] flex items-center justify-center' : 'space-y-6'}`}>
          {messages.length === 0 && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 mx-auto mb-6 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-purple-400/30 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl p-4">
                  <img 
                    src="/logo.png" 
                    alt="Echo AI Logo" 
                    className="w-full h-full object-contain invert brightness-0 contrast-100"
                  />
                </div>
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent"
              >
                Welcome to Echo AI
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed"
              >
                After analyzing your prompt, I'll provide an improved version and help you refine it through intelligent conversation.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center gap-4 mt-8"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                  <Radar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">Risk Detection</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  <BotMessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">AI Refinement</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-full">
                  <UserRound className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">User Friendliness</span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {isLoading && messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-6"
              >
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <motion.div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        delay: i * 0.2 
                      }}
                    />
                  ))}
                </motion.div>
              </div>
              
              <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                Analyzing your prompt...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Detecting patterns and improving clarity
              </p>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={`${message.role}-${index}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%]`}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`${
                      message.role === 'user'
                        ? 'px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/20 ml-auto max-w-fit'
                        : 'p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 shadow-lg backdrop-blur-sm shadow-gray-500/10'
                    }`}
                  >
                    {message.role === 'assistant' && message.content === '' && isTyping ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-purple-600 rounded-full"
                              animate={{
                                y: [0, -8, 0],
                                opacity: [0.4, 1, 0.4]
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeInOut"
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
                      </motion.div>
                    ) : (
                      <div className="space-y-3">
                        <div 
                          className={`text-sm leading-relaxed ${
                            message.role === 'user' 
                              ? 'text-white [&_strong]:text-white [&_em]:text-white [&_code]:text-white [&_code]:bg-white/20 [&_a]:text-white [&_a]:underline' 
                              : 'text-gray-900 dark:text-gray-100 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:hover:underline'
                          }`}
                          dangerouslySetInnerHTML={formatMessage(message.content)}
                        />
                        
                        {message.role === 'assistant' && message.content && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700"
                          >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={`h-8 px-3 text-xs transition-all duration-200 rounded-full ${
                                  copiedMessageIndex === index 
                                    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                                onClick={() => copyToClipboard(message.content, index)}
                              >
                                {copiedMessageIndex === index ? (
                                  <>
                                    <Check className="w-3 h-3 mr-1" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy
                                  </>
                                )}
                              </Button>
                            </motion.div>
                            
                            {hasAnalysis && onReanalyze && (
                              <motion.div 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                              >
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-3 text-xs transition-all duration-200 rounded-full hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                                  onClick={onReanalyze}
                                >
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Re-analyze
                                </Button>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={`text-xs text-gray-500 mt-2 ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {formatTimestamp(message.timestamp)}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Enhanced Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex-shrink-0 p-6 border-t border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl"
      >
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                messages.length === 0 
                  ? "You will be able to chat to me after analyzing your prompt..." 
                  : "Ask me to refine the prompt further..."
              }
              disabled={isLoading || isTyping || messages.length === 0}
              className="min-h-[44px] max-h-32 resize-none rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200/60 dark:border-purple-500/40 shadow-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/70 transition-all duration-200 hover:border-purple-300/70 dark:hover:border-purple-400/50"
            />
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0">
            <Button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isLoading || isTyping || messages.length === 0}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 w-[44px] h-[44px] rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
        
        {/* Enhanced AI Disclaimer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3"
        >
          <span className="font-medium text-purple-600 dark:text-purple-400">Echo AI</span> - 
          <span className="ml-1">Intelligent prompt analysis may contain inaccuracies</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ChatPanel;