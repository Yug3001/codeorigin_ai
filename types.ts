export interface AnalysisResult {
  language: string;
  aiProbability: number; // 0 to 100
  reasoning: string;
  keyFeatures: string[];
  correctedCode: string;
}

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  result: AnalysisResult | null;
  error: string | null;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  code: string;
  result: AnalysisResult;
}