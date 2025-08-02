import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then check if dark class exists
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    console.log('Dark mode state changed:', darkMode); // Debug log
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const handleToggle = () => {
    console.log('Toggle clicked, current darkMode:', darkMode); // Debug log
    setDarkMode(!darkMode);
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        darkMode ? 'bg-blue-500' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          darkMode ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
      <span className="sr-only">Toggle dark mode</span>
    </button>
  );
}