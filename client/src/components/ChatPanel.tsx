import React, { useState, useEffect, useRef } from 'react';
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
  Check
} from 'lucide-react';
import { ChatMessage } from '../types';

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
    <Card className="h-full flex flex-col overflow-hidden">
      <CardContent className="flex-1 flex flex-col min-h-0 p-0 overflow-hidden">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 min-h-0 overflow-y-auto">
          <div className={`${messages.length === 0 && !isLoading ? 'min-h-[400px] flex items-center justify-center' : 'space-y-4'}`}>
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
                  <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg border border-purple-200 dark:border-purple-800">
                    <img src="/logo.png" alt="Echo Logo" className="w-10 h-10 dark:invert-0 invert" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Welcome to <span className="text-purple-600 dark:text-purple-400">Echo AI</span>!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                  After analyzing your prompt, I'll provide an improved version and continue helping you refine it through conversation.
                </p>
              </div>
            )}

            {isLoading && messages.length === 0 && (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Bot className="w-8 h-8 text-purple-500" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generating improved version of your prompt...
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                    <AvatarImage src="/logo.png" alt="Echo" className="dark:invert-0 invert" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-sm">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white ml-auto'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'
                    }`}
                  >
                    {message.role === 'assistant' && message.content === '' && isTyping ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-500">Typing...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div 
                          className={`text-sm leading-relaxed ${
                            message.role === 'user' 
                              ? 'text-white [&_strong]:text-white [&_em]:text-white [&_code]:text-white [&_code]:bg-white/20 [&_a]:text-white [&_a]:underline' 
                              : 'text-gray-900 dark:text-gray-100 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:hover:underline'
                          }`}
                          dangerouslySetInnerHTML={formatMessage(message.content)}
                        />
                        
                        {message.role === 'assistant' && message.content && (
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`h-6 px-2 text-xs transition-all duration-200 ${
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
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className={`text-xs text-gray-500 mt-1 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          {messages.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInputMessage("Make this more specific")}
                  className="text-xs"
                >
                  Make more specific
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInputMessage("Reduce ambiguity")}
                  className="text-xs"
                >
                  Reduce ambiguity
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInputMessage("Explain the changes")}
                  className="text-xs"
                >
                  Explain changes
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                messages.length === 0 
                  ? "You will be able to chat to me after analyzing your prompt..." 
                  : "Ask me to refine the prompt further..."
              }
              className="min-h-[44px] max-h-32 resize-none"
              disabled={isLoading || isTyping || messages.length === 0}
            />
            <Button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isLoading || isTyping || messages.length === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Subtle AI Disclaimer */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            <span className="font-medium">Echo Hallucination Detector</span> - AI responses may contain inaccuracies
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;