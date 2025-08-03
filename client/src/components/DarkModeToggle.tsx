import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const DarkModeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  // Determine if we're in dark mode (considering system preference)
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
          >
            <div className="relative overflow-hidden w-4 h-4">
              <Sun className={`absolute inset-0 h-4 w-4 rotate-0 scale-100 transition-all duration-300 ${
                isDark ? 'rotate-90 scale-0' : ''
              }`} />
              <Moon className={`absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all duration-300 ${
                isDark ? 'rotate-0 scale-100' : ''
              }`} />
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={5}>
          <p>Toggle {isDark ? 'light' : 'dark'} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DarkModeToggle;