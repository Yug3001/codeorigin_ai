import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { ResultCard } from './components/ResultCard';
import { HistoryPanel } from './components/HistoryPanel';
import { analyzeCode } from './services/geminiService';
import { AnalysisState, HistoryItem } from './types';
import { Sparkles, Trash2, Code, Loader2, ScanLine, ChevronDown } from 'lucide-react';

const SAMPLE_CODE_HUMAN = `function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}`;

const SAMPLE_CODE_AI = `import React from 'react';

const Button = ({ label, onClick }) => {
  return (
    <button 
      onClick={onClick}
      style={{
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      {label}
    </button>
  );
};

export default Button;`;

const App: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    result: null,
    error: null,
  });

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    // Load history
    const savedHistory = localStorage.getItem('analysis_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  // Auto-scroll to results on mobile after analysis
  useEffect(() => {
    if (analysisState.status === 'complete' && window.innerWidth < 1024) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [analysisState.status]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newTheme;
    });
  };

  const addToHistory = (code: string, result: any) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      code,
      result
    };
    const newHistory = [newItem, ...history];
    setHistory(newHistory);
    localStorage.setItem('analysis_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('analysis_history');
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setCode(item.code);
    setAnalysisState({
      status: 'complete',
      result: item.result,
      error: null
    });
    setIsHistoryOpen(false);
  };

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setAnalysisState({ status: 'analyzing', result: null, error: null });
    try {
      const result = await analyzeCode(code);
      setAnalysisState({ status: 'complete', result, error: null });
      addToHistory(code, result);
    } catch (err: any) {
      setAnalysisState({ 
        status: 'error', 
        result: null, 
        error: err.message || "Something went wrong during analysis." 
      });
    }
  };

  const clearInput = () => {
    setCode('');
    setAnalysisState({ status: 'idle', result: null, error: null });
  };

  // Shared classes for glass effect
  const glassPanelClass = "backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xl";

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-500/30 pb-12 transition-colors duration-300 ${isDark ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-50'}`}>
      <Navbar 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        onHistoryClick={() => setIsHistoryOpen(true)}
      />

      <HistoryPanel 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleHistorySelect}
        onClear={clearHistory}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-10 md:mb-16 space-y-4 md:space-y-6 animate-fade-in-up">
          <div className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[10px] md:text-xs font-semibold tracking-wider uppercase mb-2">
            AI CODE DETECTION ENGINE
          </div>
          <h1 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight px-2">
            Analyze Code DNA <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 dark:from-cyan-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Reveal the Author
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed px-4">
            Heuristic engine that identifies logic patterns and syntax flow to detect AI authorship in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Input Column */}
          <div className="space-y-6 group order-1">
            <div className={`${glassPanelClass} rounded-xl p-1 transition-all duration-300 hover:shadow-indigo-500/10 ring-1 ring-slate-200 dark:ring-slate-800 group-hover:ring-indigo-500/30`}>
              <div className="bg-slate-100 dark:bg-slate-900/50 rounded-t-lg px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="ml-2 text-[10px] md:text-xs text-slate-500 font-mono">source.in</span>
                </div>
                <div className="flex items-center space-x-2">
                  {code.length > 0 && (
                    <span className="hidden sm:inline text-[10px] text-slate-500 dark:text-slate-600 font-mono mr-2">{code.length} chars</span>
                  )}
                  <button 
                    onClick={clearInput}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                    title="Clear Code"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Paste code snippet here..."
                className="w-full h-[300px] md:h-[450px] bg-transparent text-slate-800 dark:text-slate-300 p-4 md:p-5 font-mono text-sm focus:outline-none resize-none code-font rounded-b-lg placeholder:text-slate-400 dark:placeholder:text-slate-700 leading-relaxed transition-all"
                spellCheck={false}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setCode(SAMPLE_CODE_HUMAN)}
                  className="flex-1 sm:flex-none px-3 py-2.5 md:px-4 md:py-2 text-[10px] md:text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-all shadow-sm active:scale-95"
                >
                  Human Sample
                </button>
                <button
                  onClick={() => setCode(SAMPLE_CODE_AI)}
                  className="flex-1 sm:flex-none px-3 py-2.5 md:px-4 md:py-2 text-[10px] md:text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-all shadow-sm active:scale-95"
                >
                  AI Sample
                </button>
              </div>
              
              <button
                onClick={handleAnalyze}
                disabled={!code.trim() || analysisState.status === 'analyzing'}
                className={`
                  w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 md:py-3 rounded-lg font-bold text-white shadow-xl transition-all active:scale-95
                  ${!code.trim() || analysisState.status === 'analyzing' 
                    ? 'bg-slate-200 dark:bg-slate-800 cursor-not-allowed text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700' 
                    : 'bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 hover:border-indigo-400 shadow-indigo-600/20 transform md:hover:-translate-y-0.5'}
                `}
              >
                {analysisState.status === 'analyzing' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing DNA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Run Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Column */}
          <div ref={resultsRef} className="relative order-2 lg:order-2 scroll-mt-24">
            {analysisState.status === 'idle' && (
              <div className="h-[400px] md:h-[520px] flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 p-8 text-center transition-all">
                <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-full mb-6 border border-slate-200 dark:border-slate-800 animate-pulse">
                  <ScanLine className="w-10 h-10 text-indigo-500/50" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Ready to Scan</h3>
                <p className="text-sm text-slate-500 max-w-xs px-4">
                  Paste your code and let the engine hunt for automated patterns.
                </p>
                <div className="mt-8 flex flex-col items-center gap-2 animate-bounce lg:hidden">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Scroll Up to Start</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 rotate-180" />
                </div>
              </div>
            )}

            {analysisState.status === 'analyzing' && (
              <div className={`h-[400px] md:h-[520px] flex flex-col items-center justify-center ${glassPanelClass} rounded-2xl p-8 relative overflow-hidden transition-all`}>
                <div className="scanner-line"></div>
                <div className="text-center space-y-4 z-10">
                  <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Scanning Patterns...</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Mapping logic flow & syntax structures</p>
                  </div>
                </div>
              </div>
            )}

            {analysisState.status === 'error' && (
              <div className="h-[400px] md:h-[520px] flex flex-col items-center justify-center text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/5 rounded-2xl p-8 text-center backdrop-blur-sm transition-all">
                <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full mb-4">
                  <Trash2 className="w-8 h-8 text-red-500 dark:text-red-400" />
                </div>
                <p className="text-xl font-bold mb-2 text-red-800 dark:text-red-200">Analysis Failed</p>
                <p className="text-sm opacity-80 max-w-xs mx-auto">{analysisState.error}</p>
                <button 
                  onClick={() => handleAnalyze()}
                  className="mt-8 px-6 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-lg text-sm transition-colors text-red-700 dark:text-red-200 font-medium active:scale-95"
                >
                  Try Again
                </button>
              </div>
            )}

            {analysisState.status === 'complete' && analysisState.result && (
              <ResultCard result={analysisState.result} isDark={isDark} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;