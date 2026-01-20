import React from 'react';
import { HistoryItem } from '../types';
import { X, Clock, Trash2, ChevronRight, Bot, User, History } from 'lucide-react';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelect,
  onClear 
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 border-l border-slate-200 dark:border-slate-800 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Analysis</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-center p-4">
              <History className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">No history yet</p>
              <p className="text-xs mt-1">Run an analysis to see it here</p>
            </div>
          ) : (
            history.map((item) => {
              const isAI = item.result.aiProbability > 50;
              return (
                <div 
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="group relative bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 cursor-pointer transition-all hover:shadow-lg hover:border-indigo-500/30 dark:hover:border-indigo-500/30 overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isAI ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                  
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${isAI ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300'}`}>
                        {isAI ? 'AI' : 'HUMAN'} {item.result.aiProbability}%
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-500 bg-slate-200 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                      {item.result.language}
                    </span>
                  </div>

                  <div className="pl-2">
                     <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded border border-slate-200 dark:border-slate-800/50">
                        {item.code.slice(0, 40).replace(/\n/g, ' ')}...
                     </p>
                     <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            {isAI ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-indigo-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                            Load <ChevronRight className="w-3 h-3 ml-0.5" />
                        </span>
                     </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <button 
              onClick={onClear}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>
        )}
      </div>
    </>
  );
};
