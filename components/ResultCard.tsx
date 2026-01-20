import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Bot, User, CheckCircle2, AlertTriangle, Code2, Download, Bug, Copy, Check } from 'lucide-react';
import { jsPDF } from "jspdf";

interface ResultCardProps {
  result: AnalysisResult;
  isDark: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, isDark }) => {
  const [copied, setCopied] = useState(false);
  const isLikelyAI = result.aiProbability > 50;
  
  // Data for the chart
  const data = [
    { name: 'AI', value: result.aiProbability },
    { name: 'Human', value: 100 - result.aiProbability },
  ];

  // Dynamic colors based on theme for the chart
  const COLORS = ['#6366f1', isDark ? '#1e293b' : '#e2e8f0']; // Indigo for AI, Slate-800/200 for Human/Empty

  const handleCopy = () => {
    navigator.clipboard.writeText(result.correctedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("CodeOrigin AI Report", 20, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, 25, { align: 'right' });

    // Verdict Section
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.text("Analysis Summary", 20, 60);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 65, pageWidth - 20, 65);

    doc.setFontSize(12);
    doc.text(`Language Detected:`, 20, 80);
    doc.setFont("helvetica", "bold");
    doc.text(result.language, 70, 80);
    
    doc.setFont("helvetica", "normal");
    doc.text(`AI Probability:`, 20, 90);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(result.aiProbability > 50 ? 99 : 0, result.aiProbability > 50 ? 102 : 128, result.aiProbability > 50 ? 241 : 0);
    doc.text(`${result.aiProbability}%`, 70, 90);

    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.text(`Verdict:`, 20, 100);
    doc.setFont("helvetica", "bold");
    doc.text(isLikelyAI ? "Likely AI-Generated" : "Likely Human-Written", 70, 100);

    // Reasoning Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Reasoning", 20, 125);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const splitReasoning = doc.splitTextToSize(result.reasoning, pageWidth - 40);
    doc.text(splitReasoning, 20, 135);

    // Features Section
    let yPos = 135 + (splitReasoning.length * 6) + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Key Features Detected", 20, yPos);

    yPos += 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    result.keyFeatures.forEach((feature) => {
      doc.text(`• ${feature}`, 25, yPos);
      yPos += 8;
    });

    // Note about corrected code
    yPos += 15;
    if (yPos < pageHeight - 30) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "italic");
        doc.text("Note: An optimized and bug-fixed version of the code is available in the web view.", 20, yPos);
    }

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Analyzed by CodeOrigin AI", pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save("CodeOrigin_Analysis_Report.pdf");
  };

  return (
    <div className="w-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-2xl animate-fade-in-up transition-all duration-500 hover:shadow-indigo-500/10 rounded-xl overflow-hidden">
      <div className="p-5 md:p-8">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
          
          {/* Chart Section */}
          <div className="w-full lg:w-1/3 flex flex-col items-center justify-center relative">
            <div className="h-56 md:h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    startAngle={220}
                    endAngle={-40}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={5}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 pointer-events-none">
                <span className={`text-4xl md:text-5xl font-extrabold ${isLikelyAI ? 'text-indigo-500 dark:text-indigo-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                  {result.aiProbability}%
                </span>
                <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 font-semibold">AI Score</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-[-20px]">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${isLikelyAI ? 'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                <Bot className="w-3.5 h-3.5" />
                <span>AI</span>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${!isLikelyAI ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                <User className="w-3.5 h-3.5" />
                <span>Human</span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-2/3 space-y-5 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700/50 pb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Analysis Report</h2>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mt-1">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Detected:</span>
                  <span className="text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded text-[10px] md:text-xs border border-indigo-100 dark:border-indigo-500/20 font-mono font-medium">
                    {result.language}
                  </span>
                </div>
              </div>
              <button 
                onClick={generatePDF}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs md:text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 transition-all active:scale-95 group"
              >
                <Download className="w-4 h-4 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                Export PDF
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 md:p-5 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <h3 className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                AI Reasoning
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs md:text-sm">
                {result.reasoning}
              </p>
            </div>

            <div>
              <h3 className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 pl-1">Key Identifiers</h3>
              <ul className="space-y-2.5">
                {result.keyFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 group">
                    <div className="mt-0.5 p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-cyan-500/50 transition-colors">
                      <CheckCircle2 className="w-3 h-3 text-cyan-600 dark:text-cyan-500" />
                    </div>
                    <span className="leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Smart Fix Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Bug className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                        Smart Fix & Optimize
                    </h3>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-[10px] md:text-xs text-slate-600 dark:text-slate-300 transition-colors active:scale-95"
                    >
                        {copied ? <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied" : "Copy Fix"}
                    </button>
                </div>
                <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3 md:p-4 border border-slate-800 dark:border-slate-800 overflow-x-auto shadow-inner relative group">
                    <pre className="font-mono text-[11px] md:text-sm text-indigo-100 leading-relaxed whitespace-pre">
                        {result.correctedCode}
                    </pre>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
