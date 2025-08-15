import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Search, 
  Brain, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Type,
  Palette,
  Undo2,
  Redo2,
  Copy,
  ClipboardPaste,
  Scissors,
  Save,
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff
} from 'lucide-react';
import { PromptAnalysis } from '../types';

interface EditorProps {
  prompt: string;
  onChange: (prompt: string) => void;
  analysis: PromptAnalysis | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onToggleOverview: () => void;
}

const Editor: React.FC<EditorProps> = ({
  prompt,
  onChange,
  analysis,
  onAnalyze,
  isAnalyzing,
  onToggleOverview
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState('14');
  const [fontFamily, setFontFamily] = useState('mono');
  const [showPreview, setShowPreview] = useState(false);
  const [zoom, setZoom] = useState(100);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Text formatting states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderlined, setIsUnderlined] = useState(false);
  const [textAlign, setTextAlign] = useState('left');

  const renderHighlightedText = () => {
    if (!analysis) return null;

    const segments = [...analysis.highlightedSegments].sort((a, b) => a.start - b.start);
    let lastIndex = 0;
    const result = [];

    segments.forEach((segment, index) => {
      if (segment.start > lastIndex) {
        result.push(<span key={`text-${index}`}>{prompt.slice(lastIndex, segment.start)}</span>);
      }

      const bgColor =
        segment.riskLevel === 'high'
          ? 'bg-red-200 border-red-400 dark:bg-red-900 dark:border-red-500'
          : segment.riskLevel === 'medium'
          ? 'bg-yellow-200 border-yellow-400 dark:bg-yellow-800 dark:border-yellow-500'
          : 'bg-orange-200 border-orange-400 dark:bg-orange-800 dark:border-orange-500';

      result.push(
        <span
          key={`highlight-${index}`}
          className={`${bgColor} border-b-2 cursor-pointer relative`}
          onMouseEnter={() => setHoveredSegment(index)}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          {segment.text}
          {hoveredSegment === index && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 w-64">
              <div className="font-semibold">{segment.reason}</div>
              <div className="mt-1">
                <span className="text-gray-300">Confidence: </span>
                <span className="text-yellow-300">
                  {Math.round(segment.confidence * 100)}%
                </span>
              </div>
              <div>
                <span className="text-gray-300">Category: </span>
                <span className="text-blue-300">{segment.category.replace('_', ' ')}</span>
              </div>
            </div>
          )}
        </span>
      );

      lastIndex = segment.end;
    });

    if (lastIndex < prompt.length) {
      result.push(<span key="text-final">{prompt.slice(lastIndex)}</span>);
    }

    return result;
  };

  const handleFormatText = (command: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = prompt.substring(start, end);
      
      let formattedText = '';
      switch (command) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          setIsBold(!isBold);
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          setIsItalic(!isItalic);
          break;
        case 'code':
          formattedText = `\`${selectedText}\``;
          break;
        case 'quote':
          formattedText = `> ${selectedText}`;
          break;
        default:
          formattedText = selectedText;
      }
      
      const newText = prompt.substring(0, start) + formattedText + prompt.substring(end);
      onChange(newText);
    }
  };

  const handleInsert = (type: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      let insertText = '';
      
      switch (type) {
        case 'list':
          insertText = '\n- ';
          break;
        case 'numbered-list':
          insertText = '\n1. ';
          break;
        case 'link':
          insertText = '[Link Text](URL)';
          break;
        default:
          insertText = '';
      }
      
      const newText = prompt.substring(0, start) + insertText + prompt.substring(start);
      onChange(newText);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? Math.min(prev + 10, 200) : Math.max(prev - 10, 50);
      return newZoom;
    });
  };

  const getTextAreaStyle = () => ({
    fontSize: `${fontSize}px`,
    fontFamily: fontFamily === 'mono' ? 'Monaco, Consolas, monospace' : fontFamily === 'serif' ? 'Georgia, serif' : 'Arial, sans-serif',
    textAlign: textAlign as any,
    zoom: `${zoom}%`,
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
    textDecoration: isUnderlined ? 'underline' : 'none',
  });

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header with blur effect */}
        <div className="relative p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-white/20 dark:border-gray-800/30">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Prompt Editor
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={onAnalyze}
                disabled={!prompt.trim() || isAnalyzing}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="sm"
              >
                <Search className="mr-2 h-4 w-4" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>

              {analysis && (
                <Button
                  onClick={onToggleOverview}
                  variant="outline"
                  size="sm"
                  className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20 transition-all duration-300"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Overview
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar with blur effect */}
        <div className="relative p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-white/20 dark:border-gray-800/30">
          <div className="flex flex-wrap items-center gap-1">
            {/* File Operations */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Save</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Export</p></TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Undo</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Redo</p></TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Clipboard */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Copy</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ClipboardPaste className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Paste</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Scissors className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Cut</p></TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Text Formatting */}
            <div className="flex items-center gap-1">
              <Toggle pressed={isBold} onPressedChange={() => handleFormatText('bold')}>
                <Bold className="h-4 w-4" />
              </Toggle>
              
              <Toggle pressed={isItalic} onPressedChange={() => handleFormatText('italic')}>
                <Italic className="h-4 w-4" />
              </Toggle>
              
              <Toggle pressed={isUnderlined} onPressedChange={setIsUnderlined}>
                <Underline className="h-4 w-4" />
              </Toggle>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Font Settings */}
            <div className="flex items-center gap-2">
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mono">Mono</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="sans">Sans</SelectItem>
                </SelectContent>
              </Select>

              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12px</SelectItem>
                  <SelectItem value="14">14px</SelectItem>
                  <SelectItem value="16">16px</SelectItem>
                  <SelectItem value="18">18px</SelectItem>
                  <SelectItem value="20">20px</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Alignment */}
            <div className="flex items-center gap-1">
              <Toggle pressed={textAlign === 'left'} onPressedChange={() => setTextAlign('left')}>
                <AlignLeft className="h-4 w-4" />
              </Toggle>
              <Toggle pressed={textAlign === 'center'} onPressedChange={() => setTextAlign('center')}>
                <AlignCenter className="h-4 w-4" />
              </Toggle>
              <Toggle pressed={textAlign === 'right'} onPressedChange={() => setTextAlign('right')}>
                <AlignRight className="h-4 w-4" />
              </Toggle>
              <Toggle pressed={textAlign === 'justify'} onPressedChange={() => setTextAlign('justify')}>
                <AlignJustify className="h-4 w-4" />
              </Toggle>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Lists and Special */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleInsert('list')}>
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Bullet List</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleInsert('numbered-list')}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Numbered List</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleFormatText('quote')}>
                    <Quote className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Quote</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleFormatText('code')}>
                    <Code className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Code</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleInsert('link')}>
                    <Link className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Insert Link</p></TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* View Options */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleZoom('out')}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Zoom Out</p></TooltipContent>
              </Tooltip>
              
              <span className="text-xs text-gray-500 dark:text-gray-400 px-1 min-w-[45px] text-center">
                {zoom}%
              </span>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleZoom('in')}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Zoom In</p></TooltipContent>
              </Tooltip>
              
              <Toggle pressed={showPreview} onPressedChange={setShowPreview}>
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Toggle>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 p-4">
          {!analysis ? (
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter your prompt here to begin analysis..."
              className="w-full h-full resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border border-gray-300 dark:border-gray-700"
              style={getTextAreaStyle()}
            />
          ) : (
            <>
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-[60%] resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 transition-all duration-200 border border-gray-300 dark:border-gray-700"
                style={getTextAreaStyle()}
              />

              <div className="h-[35%] border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
                <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Analysis Results
                </h4>
                <div className="text-sm leading-relaxed font-mono">
                  {renderHighlightedText()}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Status Bar with blur effect */}
        {analysis && (
          <div className="relative p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-white/20 dark:border-gray-800/30">
            <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span>Issues Found: {analysis.totalFlagged}</span>
                <span>Confidence: {Math.round(analysis.overallConfidence * 100)}%</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Characters: {prompt.length}</span>
                <span>Words: {prompt.split(/\s+/).filter(word => word.length > 0).length}</span>
                <span>Lines: {prompt.split('\n').length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default Editor;