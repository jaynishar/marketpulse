"use client";

import { useEffect, useState } from "react";
import { Zap, RefreshCcw, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AIAnalysisPanelProps {
  analysis: string;
  generatedAt: string;
  onRefresh: () => void;
  loading: boolean;
}

export default function AIAnalysisPanel({ analysis, generatedAt, onRefresh, loading }: AIAnalysisPanelProps) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!analysis) return;
    
    let currentIdx = 0;
    const interval = setInterval(() => {
      setDisplayText(analysis.slice(0, currentIdx));
      currentIdx += 20; // Typewriter speed
      if (currentIdx > analysis.length) clearInterval(interval);
    }, 10);

    return () => clearInterval(interval);
  }, [analysis]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-foreground flex items-center space-x-2">
          <Sparkles size={16} className="text-primary" />
          <span>Groq AI Deep Research</span>
        </h3>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-background/40 border border-border rounded-xl p-5 min-h-[400px] prose prose-invert prose-sm max-w-none">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[300px] space-y-4">
            <div className="relative">
              <Zap className="h-8 w-8 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Scouring web for latest catalysts...</p>
          </div>
        ) : (
          <div className="relative">
            <ReactMarkdown className="markdown-content">
              {displayText || analysis}
            </ReactMarkdown>
            <div className="mt-8 pt-4 border-t border-border/50 flex justify-between items-center text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>Model: Groq LLaMA 3.3</span>
              <span>Refreshed: {new Date(generatedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
