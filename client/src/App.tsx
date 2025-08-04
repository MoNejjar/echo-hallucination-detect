import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import Editor from './components/Editor';
import AnalysisSection from './components/AnalysisSection';
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

function App() {
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showAnalysisOverview, setShowAnalysisOverview] = useState<boolean>(false);
  const [showAnalysisSection, setShowAnalysisSection] = useState<boolean>(false); // New state

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
    setShowAnalysisSection(true); // Show analysis section
    setShowAnalysisOverview(false); // Hide overview if open

    try {
      // Your existing API call logic here
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
      // Keep analyzing state for the animation to complete
      setTimeout(() => setIsAnalyzing(false), 2000);
    }
  };

  const handleNewAnalysis = () => {
    setCurrentPrompt('');
    setAnalysis(null);
    setChatMessages([]);
    setShowAnalysisOverview(false);
    setShowAnalysisSection(false); // Reset analysis section
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

// Auto-add Echo's "coming soon" response
  setTimeout(() => {
    const echoResponse: ChatMessage = {
      role: 'assistant',
      content: 'The conversation feature is coming soon!',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, echoResponse]);
  }, 1500); // 1.5 second delay to simulate thinking

  /* COMMENTED OUT: Original API call
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
  */
};

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white transition-colors duration-300">
      <Sidebar 
        onNewAnalysis={handleNewAnalysis}
        onUploadFile={handlePromptUpload}
      />

      <div className="flex-1 flex">
        <div className="w-[55%] border-r border-gray-300 dark:border-gray-700">
          <ChatPanel 
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onUploadFile={handlePromptUpload}
            isLoading={isAnalyzing}
          />
        </div>

        <div className="w-[45%] flex flex-col">
          {showAnalysisSection ? (
            <AnalysisSection 
              originalText={currentPrompt}
              isAnalyzing={isAnalyzing}
            />
          ) : (
            <Editor 
              prompt={currentPrompt}
              onChange={setCurrentPrompt}
              analysis={analysis}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              onToggleOverview={() => setShowAnalysisOverview(!showAnalysisOverview)}
            />
          )}

          {showAnalysisOverview && analysis && !showAnalysisSection && (
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