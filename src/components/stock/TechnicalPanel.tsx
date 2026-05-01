"use client";

import { TechnicalIndicators } from "@/types";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface TechnicalPanelProps {
  indicators: TechnicalIndicators;
  price: number;
}

export default function TechnicalPanel({ indicators, price }: TechnicalPanelProps) {
  const { rsi14, macd, macdSignal, macdHistogram, supertrend, supertrendDirection, atr14, adx, ema20, ema50, ema200 } = indicators;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-secondary flex items-center space-x-2">
        <Activity size={16} className="text-primary" />
        <span>Technical Indicators</span>
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {/* RSI */}
        <IndicatorCard 
          label="RSI (14)" 
          value={rsi14.toFixed(2)}
          status={rsi14 > 70 ? "Overbought" : rsi14 < 30 ? "Oversold" : "Neutral"}
          color={rsi14 > 70 ? "text-red" : rsi14 < 30 ? "text-green" : "text-amber"}
        />

        {/* Supertrend */}
        <div className="bg-card border border-border rounded-xl p-3">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Supertrend</p>
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
              supertrendDirection === 'UP' ? "bg-green/10 text-green" : "bg-red/10 text-red"
            )}>
              {supertrendDirection}
            </span>
            <span className="text-xs font-bold mono">₹{supertrend.toFixed(0)}</span>
          </div>
        </div>

        {/* MACD */}
        <div className="bg-card border border-border rounded-xl p-3 col-span-2">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">MACD</p>
            <div className="flex items-center space-x-1">
              {macdHistogram > 0 ? <TrendingUp size={12} className="text-green" /> : <TrendingDown size={12} className="text-red" />}
              <span className={cn("text-[10px] font-bold mono", macdHistogram > 0 ? "text-green" : "text-red")}>
                {macdHistogram.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex justify-between text-xs mono font-bold">
            <div className="text-green">M: {macd.toFixed(2)}</div>
            <div className="text-amber">S: {macdSignal.toFixed(2)}</div>
          </div>
        </div>

        {/* ADX & ATR */}
        <IndicatorCard 
          label="ADX (Strength)" 
          value={adx.toFixed(2)}
          status={adx > 25 ? "Strong" : "Weak"}
          color={adx > 25 ? "text-green" : "text-muted"}
        />
        <IndicatorCard 
          label="ATR (Volatility)" 
          value={atr14.toFixed(2)}
          status="Neutral"
          color="text-secondary"
        />

        {/* EMA Stack */}
        <div className="bg-card border border-border rounded-xl p-3 col-span-2">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">EMA Stack Analysis</p>
          <div className="grid grid-cols-3 gap-2">
            <EMATag label="20" val={ema20} price={price} />
            <EMATag label="50" val={ema50} price={price} />
            <EMATag label="200" val={ema200} price={price} />
          </div>
        </div>
      </div>
    </div>
  );
}

function IndicatorCard({ label, value, status, color }: { label: string, value: string, status: string, color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-bold mono mb-1">{value}</p>
      <p className={cn("text-[10px] font-black uppercase tracking-widest", color)}>{status}</p>
    </div>
  );
}

function EMATag({ label, val, price }: { label: string, val: number, price: number }) {
  const isAbove = price > val;
  return (
    <div className="flex flex-col items-center p-1.5 rounded-lg bg-background border border-border">
      <span className="text-[9px] font-bold text-muted mb-1">EMA{label}</span>
      <div className={cn(
        "h-1.5 w-1.5 rounded-full mb-1",
        isAbove ? "bg-green shadow-[0_0_8px_#00ff8844]" : "bg-red shadow-[0_0_8px_#ff3b5c44]"
      )} />
      <span className="text-[10px] font-bold mono">₹{val.toFixed(0)}</span>
    </div>
  );
}
