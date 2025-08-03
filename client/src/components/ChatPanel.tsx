import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Send, 
  Paperclip, 
  X, 
  Bot,
  User,
  Clock,
  CheckCheck,
  MoreVertical,
  Copy,
  Trash2,
  Edit,
  Download,
  Zap,
  Sparkles
} from 'lucide-react';
import { ChatMessage } from '../App';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onUploadFile?: (file: File) => void;
  isLoading: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, onUploadFile, isLoading }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
      
      if (attachedFile && onUploadFile) {
        onUploadFile(attachedFile);
        setAttachedFile(null);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/(R\d+\.\d+)/g, '<span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">$1</span>');
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 transition-all duration-300">
        {/* Modern Header with blur effect */}
        <div className="relative p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-white/20 dark:border-gray-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Echo AI
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Response time: ~2s
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export conversation</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>More options</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="relative inline-block">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full flex items-center justify-center border border-blue-200/50 dark:border-blue-800/50">
                    <img 
                      src="/logo.png" 
                      alt="Echo Logo" 
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">
                  Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Echo AI</span>!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Your intelligent assistant for hallucination detection and prompt improvement. Start a conversation to get AI-powered insights.
                </p>
                
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                    <Zap className="w-3 h-3 mr-1" />
                    Real-time Analysis
                  </Badge>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 group ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                onMouseEnter={() => setHoveredMessage(index)}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                    <AvatarImage src="/logo.png" alt="Echo" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex flex-col max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`relative p-4 rounded-2xl shadow-sm border transition-all duration-200 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500/20 shadow-blue-500/10'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-gray-900/5 dark:shadow-gray-100/5'
                    }`}
                  >
                    {hoveredMessage === index && (
                      <div className={`absolute -top-2 flex gap-1 ${
                        message.role === 'user' ? '-left-2' : '-right-2'
                      }`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-6 w-6 p-0 bg-white dark:bg-gray-800 border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyMessage(message.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy message</TooltipContent>
                        </Tooltip>

                        {message.role === 'user' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-6 w-6 p-0 bg-white dark:bg-gray-800 border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit message</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    )}

                    <div
                      className={`text-sm leading-relaxed ${
                        message.role === 'user' ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(message.content)
                      }}
                    />
                  </div>

                  <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <Clock className="h-3 w-3" />
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.role === 'user' && (
                      <CheckCheck className="h-3 w-3 text-blue-500" />
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                    <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-sm">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                  <AvatarImage src="/logo.png" alt="Echo" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Echo is analyzing...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Modern Input Area with blur effect */}
        <div className="relative p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-white/20 dark:border-gray-800/30">
          {attachedFile && (
            <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Paperclip className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    {attachedFile.name}
                  </span>
                  <div className="text-xs text-blue-500 dark:text-blue-400">
                    {Math.round(attachedFile.size / 1024)} KB • Ready to upload
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeAttachedFile}
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-stretch gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[44px] w-11 p-0 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-blue-400 transition-all duration-200 self-stretch"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach file</TooltipContent>
            </Tooltip>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex-1 relative">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="min-h-[44px] max-h-[120px] resize-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-4"
                disabled={isLoading}
              />
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSend}
                  disabled={!inputMessage.trim() || isLoading}
                  className="min-h-[44px] w-11 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100 self-stretch"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message (Enter)</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              {inputMessage.length > 0 && (
                <span className="flex items-center gap-1">
                  <span>{inputMessage.length} characters</span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span>{inputMessage.split(/\s+/).filter(word => word.length > 0).length} words</span>
                </span>
              )}
            </div>
            <span className="text-gray-400 dark:text-gray-500">
              Press Enter to send • Shift+Enter for new line
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ChatPanel;