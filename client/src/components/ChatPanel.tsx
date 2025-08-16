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
  ArrowRight
} from 'lucide-react';
import { ChatMessage } from '../types';
import toast from 'react-hot-toast';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading }) => {
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
    // Enhanced markdown-to-HTML formatting for better readability
    let formatted = content
      // Handle code blocks first (triple backticks)
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg my-3 overflow-x-auto border"><code class="text-sm font-mono">$1</code></pre>')
      
      // Handle inline code (single backticks)
      .replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      
      // Handle blockquotes
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 my-2 bg-gray-50 dark:bg-gray-800/50 italic">$1</blockquote>')
      
      // Handle special purple headers for key sections
      .replace(/^(Improved Prompt:)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2 text-purple-600 dark:text-purple-400">$1</h2>')
      .replace(/^(Explanations:)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2 text-purple-600 dark:text-purple-400">$1</h2>')
      
      // Handle regular headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">$1</h1>')
      
      // Handle bold text (both **text** and __text__)
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/__(.*?)__/g, '<strong class="font-semibold">$1</strong>')
      
      // Handle italic text (both *text* and _text_, but not inside other formatting)
      .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em class="italic">$1</em>')
      .replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em class="italic">$1</em>');

    // Process lists and sections properly by working with lines
    const lines = formatted.split('\n');
    const processedLines: string[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;
    let orderedListCounter = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isUnorderedItem = /^[\s]*[-*+]\s(.+)$/.test(line);
      const isOrderedItem = /^[\s]*\d+\.\s(.+)$/.test(line);
      const isNumberedSection = /^[\s]*\d+\.\s([^:]*:)/.test(line); // Section headers ending with ':'

      if (isNumberedSection) {
        // Close any open lists first
        if (inUnorderedList) {
          processedLines.push('</ul>');
          inUnorderedList = false;
        }
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
        
        // Convert numbered sections to styled headers with consistent numbering
        const content = line.replace(/^[\s]*\d+\.\s(.+)$/, '$1');
        processedLines.push(`<div class="font-semibold text-gray-900 dark:text-gray-100 mt-3 mb-1">${orderedListCounter}. ${content}</div>`);
        orderedListCounter++;
      } else if (isUnorderedItem) {
        if (!inUnorderedList) {
          if (inOrderedList) {
            processedLines.push('</ol>');
            inOrderedList = false;
          }
          processedLines.push('<ul class="list-disc ml-4 mb-1 space-y-0">');
          inUnorderedList = true;
        }
        const content = line.replace(/^[\s]*[-*+]\s(.+)$/, '$1');
        processedLines.push(`<li class="ml-2">${content}</li>`);
      } else if (isOrderedItem && !isNumberedSection) {
        // Regular ordered list items (not section headers)
        if (!inOrderedList) {
          if (inUnorderedList) {
            processedLines.push('</ul>');
            inUnorderedList = false;
          }
          processedLines.push('<ol class="list-decimal ml-4 mb-2 space-y-0.5">');
          inOrderedList = true;
        }
        const content = line.replace(/^[\s]*\d+\.\s(.+)$/, '$1');
        processedLines.push(`<li class="ml-2">${content}</li>`);
      } else {
        // Regular content - close any open lists
        if (inUnorderedList) {
          processedLines.push('</ul>');
          inUnorderedList = false;
        }
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
        processedLines.push(line);
      }
    }

    // Close any remaining open lists
    if (inUnorderedList) {
      processedLines.push('</ul>');
    }
    if (inOrderedList) {
      processedLines.push('</ol>');
    }

    formatted = processedLines.join('\n');

    // Handle line breaks (double newlines become paragraphs, single newlines become <br>)
    formatted = formatted
      .split('\n\n').map(paragraph => {
        if (paragraph.trim()) {
          // Don't wrap if it's already a block element
          if (/^<(h[1-6]|pre|blockquote|ul|ol)/.test(paragraph.trim())) {
            return paragraph.replace(/\n/g, '<br>');
          }
          return `<p class="mb-3">${paragraph.replace(/\n/g, '<br>')}</p>`;
        }
        return '';
      }).join('')
      
      // Handle links (basic URL detection)
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
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
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Messages Area with enhanced styling */}
      <ScrollArea className="flex-1 p-6 min-h-0 overflow-y-auto bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50">
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
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl p-4">
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
                className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
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
                  <Star className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">Smart Detection</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">AI Refinement</span>
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
                <div className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <motion.div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
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
              
              <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
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
                        ? 'px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20 ml-auto max-w-fit'
                        : 'p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 shadow-lg backdrop-blur-sm shadow-gray-500/10'
                    }`}
                  >
                    {message.role === 'assistant' && message.content === '' && isTyping ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="w-4 h-4 text-purple-600" />
                        </motion.div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Crafting response...</span>
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
        {messages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4"
          >
            <div className="flex flex-wrap gap-2">
              {[
                { text: "Make this more specific", icon: Star },
                { text: "Reduce ambiguity", icon: MessageSquare },
                { text: "Explain the changes", icon: Sparkles }
              ].map(({ text, icon: Icon }, index) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setInputMessage(text)}
                    className="h-8 px-3 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 text-xs"
                  >
                    <Icon className="w-3 h-3 mr-1.5" />
                    {text.replace("Make this more specific", "Make more specific").replace("Explain the changes", "Explain changes")}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

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
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 w-[44px] h-[44px] rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-0"
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
          <span className="font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Echo AI</span> - 
          <span className="ml-1">Intelligent prompt analysis may contain inaccuracies</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ChatPanel;