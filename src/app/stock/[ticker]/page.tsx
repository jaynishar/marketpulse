"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, RefreshCw, Zap, TrendingUp, TrendingDown, Target, ShieldAlert, LayoutDashboard, Search as SearchIcon } from "lucide-react";
import TechnicalPanel from "@/components/stock/TechnicalPanel";
import AIAnalysisPanel from "@/components/stock/AIAnalysisPanel";
import NewsPanel from "@/components/stock/NewsPanel";
import FundamentalPanel from "@/components/stock/FundamentalPanel";
import SignalBadge from "@/components/stock/SignalBadge";
import { MarketCall, OHLCVBar } from "@/types";
import { cn } from "@/lib/utils";

// Lazy load chart for performance
const StockChart = dynamic(() => import("@/components/stock/StockChart"), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-card animate-pulse rounded-2xl" />
});

export default function StockAnalysisPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params);
  const [data, setData] = useState<MarketCall | null>(null);
  const [ohlcv, setOhlcv] = useState<OHLCVBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchAnalysis = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [analysisRes, chartRes] = await Promise.all([
        fetch(`/api/stock-analysis?ticker=${ticker}`),
        fetch(`/api/stock-data?ticker=${ticker}&period=1y`)
      ]);

      const analysisData = await analysisRes.json();
      const chartData = await chartRes.json();

      setData(analysisData);
      setOhlcv(chartData.ohlcv);
    } catch (error) {
      console.error("Analysis fetch failed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [ticker]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Zap className="h-12 w-12 text-primary animate-bounce" />
        <div className="text-center">
          <p className="text-lg font-bold tracking-tight uppercase">Initializing Deep Research</p>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Fetching Technicals & AI Grounding...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stockData, technicalIndicators, tradeSignal, aiAnalysis, generatedAt } = data;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12">
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-10"></div>
      
      {/* Top Header Strip */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border py-4">
        <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-6">
            <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-muted rounded-full transition-colors hidden md:block">
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center space-x-2 md:space-x-3">
                <h1 className="text-lg md:text-2xl font-bold tracking-tight truncate max-w-[150px] md:max-w-none">{stockData.name}</h1>
                <span className="text-[10px] md:text-xs font-bold bg-muted px-2 py-0.5 rounded text-secondary-foreground mono">{stockData.ticker}</span>
              </div>
              <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{stockData.exchange}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 md:space-x-8 text-right">
            <div className="hidden md:block">
              <p className="text-[9px] font-bold text-muted uppercase tracking-widest mono">AI Analysis: Groq LLaMA 3.3-70B</p>
              <p className="text-[9px] font-bold text-muted uppercase tracking-widest mono">Data: Yahoo Finance</p>
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold mono tracking-tighter">₹{stockData.price.toLocaleString('en-IN')}</p>
              <div className={cn("flex items-center justify-end space-x-1 text-[10px] md:text-xs font-bold mono", stockData.change >= 0 ? "text-[--bullish]" : "text-[--bearish]")}>
                {stockData.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{Math.abs(stockData.changePercent).toFixed(2)}%</span>
              </div>
            </div>
            <button 
              onClick={() => fetchAnalysis(true)} 
              disabled={refreshing}
              className="p-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      <main className="container max-w-7xl mx-auto px-4 mt-8 space-y-8">
        {/* Signal & Targets Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={cn(
            "lg:col-span-1 rounded-2xl p-6 border flex flex-col justify-center items-center text-center",
            tradeSignal.signal.includes('BUY') ? "bg-[--bullish]/5 border-[--bullish]/20" : 
            tradeSignal.signal.includes('SELL') ? "bg-[--bearish]/5 border-[--bearish]/20" : 
            "bg-muted/30 border-border"
          )}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Primary Signal</p>
            <SignalBadge signal={tradeSignal.signal} size="lg" />
            <div className="flex items-center space-x-2 mt-4">
              <Zap size={14} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest">{tradeSignal.confidence}% Confidence</span>
            </div>
          </div>

          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <TargetBox label="Short Term" price={tradeSignal.shortTermTarget} current={stockData.price} />
            <TargetBox label="Medium Term" price={tradeSignal.mediumTermTarget} current={stockData.price} />
            <TargetBox label="Long Term" price={tradeSignal.longTermTarget} current={stockData.price} />
            <div className="flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-6 col-span-2 md:col-span-1">
              <ShieldAlert size={20} className="text-[--bearish] mb-2" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Stop Loss</p>
              <p className="text-lg font-bold mono">₹{tradeSignal.stopLoss.toFixed(0)}</p>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <StockChart data={ohlcv} indicators={technicalIndicators} ticker={stockData.ticker} />

        {/* Triple Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <TechnicalPanel indicators={technicalIndicators} price={stockData.price} />
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2">
            <AIAnalysisPanel 
              analysis={aiAnalysis} 
              generatedAt={generatedAt} 
              onRefresh={() => fetchAnalysis(true)} 
              loading={refreshing}
            />
          </div>
          <div className="lg:col-span-4 order-3">
            <NewsPanel news={data.newsHeadlines.map(h => ({ 
              headline: h, source: "Market Intelligence", url: "#", publishedAt: new Date().toISOString(), sentiment: 'NEUTRAL' 
            }))} />
          </div>
        </div>

        {/* Fundamentals Section */}
        <FundamentalPanel data={stockData} />
      </main>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-background/80 backdrop-blur-lg border-t border-border px-6 py-3 flex justify-between items-center">
        <button onClick={() => router.push('/dashboard')} className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-primary transition-colors">
          <LayoutDashboard size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Dashboard</span>
        </button>
        <button onClick={() => router.push('/dashboard')} className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-primary transition-colors">
          <SearchIcon size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Search</span>
        </button>
        <button onClick={() => fetchAnalysis(true)} className="flex flex-col items-center space-y-1 text-primary animate-pulse">
          <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Refresh</span>
        </button>
      </div>
    </div>
  );
}

function TargetBox({ label, price, current }: { label: string, price: number, current: number }) {
  const upside = ((price - current) / current) * 100;
  return (
    <div className="flex flex-col justify-center items-center text-center">
      <Target size={20} className="text-primary mb-2" />
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-bold mono mb-1">₹{price.toFixed(0)}</p>
      <span className={cn("text-[10px] font-black mono", upside >= 0 ? "text-[--bullish]" : "text-[--bearish]")}>
        {upside >= 0 ? '+' : ''}{upside.toFixed(0)}%
      </span>
    </div>
  );
}
