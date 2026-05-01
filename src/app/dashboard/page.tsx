"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MarketOverview from "@/components/dashboard/MarketOverview";
import TimeframeSelector from "@/components/dashboard/TimeframeSelector";
import CallsGrid from "@/components/dashboard/CallsGrid";
import StockSearchBar from "@/components/search/StockSearchBar";
import { LogOut, LayoutDashboard, Search, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState<'SHORT' | 'MEDIUM' | 'LONG'>('SHORT');
  const [marketSentiment, setMarketSentiment] = useState<{ sentiment: string, reasoning: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const res = await fetch("/api/news-analysis");
        const data = await res.json();
        setMarketSentiment(data);
      } catch (e) {
        console.error("Sentiment fetch failed");
      }
    };
    fetchSentiment();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("mp_token");
    document.cookie = "mp_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/");
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'BULLISH': return 'bg-green';
      case 'BEARISH': return 'bg-red';
      case 'NEUTRAL': return 'bg-amber';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-green mono">⚡ MARKETPULSE</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green animate-blink"></div>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mono">NSE · BSE · LIVE</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-border rounded-full text-secondary hover:text-foreground transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-12">
        {/* Nifty/Sensex strip */}
        <MarketOverview />

        {/* Market Mood Bar */}
        {marketSentiment && (
          <div className="mb-8 overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-col md:flex-row items-stretch">
              <div className={`px-6 py-3 flex items-center justify-center md:justify-start ${getSentimentColor(marketSentiment.sentiment)} text-background font-black mono text-sm min-w-[140px]`}>
                {marketSentiment.sentiment}
              </div>
              <div className="flex-1 px-6 py-3 flex items-center border-t md:border-t-0 md:border-l border-border">
                <p className="text-xs text-secondary truncate">
                  {marketSentiment.reasoning.includes('REASONING:') 
                    ? marketSentiment.reasoning.split('REASONING:')[1].trim() 
                    : marketSentiment.reasoning.replace(/MOOD:.*REASONING:/i, '').trim()}
                </p>
              </div>
            </div>
            <div className="px-6 py-2 bg-background/50 border-t border-border flex justify-between items-center text-[9px] font-bold text-muted uppercase tracking-widest mono">
              <span>Analysis: Groq LLaMA 3.3 · Data: Yahoo Finance</span>
              <span>15-min delayed</span>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-10 max-w-3xl mx-auto w-full">
          <StockSearchBar />
        </div>

        {/* Scanners */}
        <div className="space-y-6">
          <TimeframeSelector selected={timeframe} onSelect={setTimeframe} />
          <CallsGrid timeframe={timeframe} />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-card/80 backdrop-blur-lg border-t border-border px-8 py-4 flex justify-between items-center">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center space-y-1 text-primary">
          <LayoutDashboard size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Dashboard</span>
        </button>
        <button onClick={() => {}} className="flex flex-col items-center space-y-1 text-secondary">
          <Search size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Search</span>
        </button>
        <button onClick={() => window.location.reload()} className="flex flex-col items-center space-y-1 text-secondary">
          <RefreshCw size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Refresh</span>
        </button>
      </div>
    </div>
  );
}
