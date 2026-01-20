import React from 'react';
import { Terminal, Moon, Sun, History } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  onHistoryClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme, onHistoryClick }) => {
  return (
    <nav className="w-full bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-50 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-md shadow-indigo-600/20">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent transition-all duration-300">
              CodeOrigin AI
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Human vs AI Detector</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onHistoryClick}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:shadow-md group"
            aria-label="View History"
            title="View History"
          >
            <History className="w-5 h-5 group-hover:text-indigo-500 transition-colors" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:shadow-md"
            aria-label="Toggle Theme"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
};
