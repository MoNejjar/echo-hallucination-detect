import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { BookOpen, Target, Calculator, CheckCircle, MessageSquare, Brain } from 'lucide-react';
import { Progress } from './ui/progress';

interface AnalysisLoadingDialogProps {
  open: boolean;
  title?: string;
  description?: string;
}

const checkpoints = [
  { icon: BookOpen, label: 'Reading the prompt', description: 'Parsing and understanding prompt structure...' },
  { icon: Target, label: 'Detecting risky tokens', description: 'Identifying potential hallucination triggers...' },
  { icon: Calculator, label: 'Calculating PRD', description: 'Computing Prompt Risk Distribution scores...' },
  { icon: CheckCircle, label: 'Finalizing analysis', description: 'Completing comprehensive risk assessment...' },
  { icon: MessageSquare, label: 'Summarizing changes', description: 'Preparing insights for conversation agent...' }
];

export function AnalysisLoadingDialog({
  open,
  title = 'Analyzing Your Prompt',
  description = 'Please wait while we analyze your prompt for potential hallucination risks...'
}: AnalysisLoadingDialogProps) {
  const [progress, setProgress] = useState(0);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate progress with checkpoints
  useEffect(() => {
    if (open) {
      setProgress(0);
      setCurrentCheckpoint(0);

      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            return 95; // Hold at 95% until actually complete
          }
          return prev + Math.random() * 5;
        });
      }, 250);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      // Reset when closed and clear any running intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setProgress(0);
      setCurrentCheckpoint(0);
    }
  }, [open]);

  // Update current checkpoint based on progress
  useEffect(() => {
    if (!open) return; // Don't update if dialog is closed
    
    if (progress < 20) setCurrentCheckpoint(0);
    else if (progress < 40) setCurrentCheckpoint(1);
    else if (progress < 60) setCurrentCheckpoint(2);
    else if (progress < 80) setCurrentCheckpoint(3);
    else if (progress < 100) setCurrentCheckpoint(4);
    else setCurrentCheckpoint(4); // Stay at last checkpoint if 100%
  }, [progress, open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-6 h-6 text-blue-600" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Main spinner animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 border-4 border-blue-200 dark:border-blue-800 rounded-full border-t-blue-600 dark:border-t-blue-400"
              />
              {/* Middle ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 w-28 h-28 border-4 border-purple-200 dark:border-purple-800 rounded-full border-b-purple-600 dark:border-b-purple-400"
              />
              {/* Center icon - changes based on checkpoint */}
              <motion.div
                key={currentCheckpoint}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {checkpoints[currentCheckpoint] && React.createElement(checkpoints[currentCheckpoint].icon, {
                  className: "w-12 h-12 text-blue-600 dark:text-blue-400"
                })}
              </motion.div>
              {/* Pulse effect */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 w-32 h-32 border-4 border-blue-400 dark:border-blue-600 rounded-full"
              />
            </div>
          </motion.div>

          {/* Current checkpoint info */}
          {checkpoints[currentCheckpoint] && (
            <motion.div
              key={currentCheckpoint}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-2"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {checkpoints[currentCheckpoint].label}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {checkpoints[currentCheckpoint].description}
              </p>
            </motion.div>
          )}

          {/* Progress bar */}
          <div className="space-y-2 px-4">
            <Progress value={progress} className="h-3 bg-blue-100 dark:bg-blue-900/50" />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Progress</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Checkpoint gauges */}
          <div className="space-y-2 px-4">
            {checkpoints.map((checkpoint, index) => {
              const Icon = checkpoint.icon;
              const isCompleted = index < currentCheckpoint;
              const isCurrent = index === currentCheckpoint;
              const isPending = index > currentCheckpoint;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500 shadow-md'
                      : isCompleted
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  {/* Checkpoint icon */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isCurrent
                        ? 'bg-blue-200 dark:bg-blue-800'
                        : isCompleted
                        ? 'bg-green-200 dark:bg-green-800'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' }}
                      >
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </motion.div>
                    ) : (
                      <Icon
                        className={`w-6 h-6 ${
                          isCurrent
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-400'
                        }`}
                      />
                    )}
                  </div>

                  {/* Checkpoint label */}
                  <div className="flex-1">
                    <div
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? 'text-blue-900 dark:text-blue-100'
                          : isCompleted
                          ? 'text-green-900 dark:text-green-100'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {checkpoint.label}
                    </div>
                  </div>

                  {/* Progress gauge for current checkpoint */}
                  {isCurrent && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100px' }}
                      className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                    >
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-full w-1/2 bg-gradient-to-r from-blue-400 to-blue-600"
                      />
                    </motion.div>
                  )}

                  {/* Checkmark for completed */}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="text-green-600 dark:text-green-400 font-bold text-lg"
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
