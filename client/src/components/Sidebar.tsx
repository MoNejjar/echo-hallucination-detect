import React from 'react';

interface SidebarProps {
  onNewAnalysis: () => void;
  onUploadFile: (file: File) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewAnalysis, onUploadFile }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  const handleFeedback = () => {
    window.open('mailto:feedback@echo-app.com?subject=Echo Feedback', '_blank');
  };

  const showRating = () => {
    alert('Rating feature coming soon!');
  };

  const showHelp = () => {
    alert('Help: Echo analyzes your prompts for hallucination risks and provides AI-guided refinement.');
  };

  const showLibrary = () => {
    alert('Library: Access to hallucination detection rules and research findings.');
  };

  return (
    <div className="w-[5%] min-w-[80px] bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-serif font-bold text-center">Echo</h1>
        <p className="text-xs text-gray-300 text-center mt-1 italic">
          Refine before you align
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex-1 flex flex-col gap-2 p-3">
        <button
          onClick={onNewAnalysis}
          className="w-full p-3 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex flex-col items-center gap-1"
        >
          <span className="text-lg">➕</span>
          <span className="text-xs">New Analysis</span>
        </button>

        <label className="w-full p-3 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex flex-col items-center gap-1 cursor-pointer">
          <span className="text-lg">📁</span>
          <span className="text-xs text-center">Upload File</span>
          <input
            type="file"
            accept=".txt,.md"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <button
          onClick={handleFeedback}
          className="w-full p-3 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex flex-col items-center gap-1"
        >
          <span className="text-lg">💬</span>
          <span className="text-xs text-center">Give Feedback</span>
        </button>

        <button
          onClick={showRating}
          className="w-full p-3 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex flex-col items-center gap-1"
        >
          <span className="text-lg">⭐</span>
          <span className="text-xs text-center">Rate Tool</span>
        </button>

        <button
          onClick={showHelp}
          className="w-full p-3 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex flex-col items-center gap-1"
        >
          <span className="text-lg">❓</span>
          <span className="text-xs text-center">Help</span>
        </button>

        <button
          onClick={showLibrary}
          className="w-full p-3 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex flex-col items-center gap-1"
        >
          <span className="text-lg">📚</span>
          <span className="text-xs text-center">Library</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;