import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import Editor from './components/Editor';
import AnalysisView from './components/AnalysisView';
import './index.css';

export interface HighlightSegment {
  start: number;
  end: number;
  text: string;
  riskLevel: 'high' | 'medium' | 'low';
  confidence: number;
  reason: string;
  category: string;
}

export interface PromptAnalysis {
  promptText: string;
  highlightedSegments: HighlightSegment[];
  overallConfidence: number;
  totalFlagged: number;
  categories: Record<string, number>;
  analysisSummary: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysisId?: string;
}

function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="absolute top-4 right-4 z-50 px-3 py-1 rounded text-sm font-medium border dark:text-white dark:border-white"
    >
      {darkMode ? '🌞 Light' : '🌙 Dark'}
    </button>
  );
}

function App() {
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showAnalysisOverview, setShowAnalysisOverview] = useState<boolean>(false);

  const handleNewAnalysis = () => {
    setCurrentPrompt('');
    setAnalysis(null);
    setChatMessages([]);
    setShowAnalysisOverview(false);
  };

  const handlePromptUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCurrentPrompt(content);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!currentPrompt.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:8000/api/analyze/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt })
      });

      if (!response.ok) throw new Error('Analysis failed');

      const analysisResult = await response.json();
      setAnalysis(analysisResult);

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: analysisResult.analysisSummary,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('http://localhost:8000/api/refine/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          conversationHistory: chatMessages,
          userMessage: message
        })
      });

      if (!response.ok) throw new Error('Refinement failed');

      const result = await response.json();

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: result.assistantMessage,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Refinement failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white transition-colors duration-300">
      <DarkModeToggle />

      <Sidebar 
        onNewAnalysis={handleNewAnalysis}
        onUploadFile={handlePromptUpload}
      />

      <div className="flex-1 flex">
        <div className="w-[55%] border-r border-gray-300 dark:border-gray-700">
          <ChatPanel 
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isAnalyzing}
          />
        </div>

        <div className="w-[40%] flex flex-col">
          <Editor 
            prompt={currentPrompt}
            onChange={setCurrentPrompt}
            analysis={analysis}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            onToggleOverview={() => setShowAnalysisOverview(!showAnalysisOverview)}
          />

          {showAnalysisOverview && analysis && (
            <AnalysisView 
              analysis={analysis}
              onClose={() => setShowAnalysisOverview(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;