"use client";

import { MarketCall } from "@/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MarketCallCardProps {
  call: MarketCall;
}

export default function MarketCallCard({ call }: MarketCallCardProps) {
  const { stockData, tradeSignal } = call;

  const getSignalColor = (signal: string) => {
    if (signal.includes('BUY')) return 'green';
    if (signal.includes('SELL')) return 'red';
    return 'amber';
  };

  const signalColor = getSignalColor(tradeSignal.signal);
  const borderColorClass = {
    green: 'border-l-green hover:border-green',
    red: 'border-l-red hover:border-red',
    amber: 'border-l-amber hover:border-amber',
  }[signalColor];

  const textColorClass = {
    green: 'text-green',
    red: 'text-red',
    amber: 'text-amber',
  }[signalColor];

  const bgColorClass = {
    green: 'bg-green/10',
    red: 'bg-red/10',
    amber: 'bg-amber/10',
  }[signalColor];

  return (
    <Link 
      href={`/stock/${stockData.ticker}`}
      className={cn(
        "group relative bg-card border border-border border-l-[3px] rounded-xl p-5 transition-all hover:scale-[1.01] hover:shadow-2xl overflow-hidden",
        borderColorClass
      )}
    >
      {/* Header Row */}
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-xl font-bold tracking-tight text-green mono uppercase">{stockData.ticker}</h3>
        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-[9px] font-black tracking-widest uppercase">
          {stockData.exchange}
        </span>
      </div>
      <p className="text-xs text-secondary mb-4 truncate">{stockData.name}</p>

      {/* Signal Badge */}
      <div className={cn(
        "mb-5 py-1.5 px-3 rounded-md text-center text-[10px] font-black tracking-[0.2em] uppercase",
        bgColorClass,
        textColorClass
      )}>
        {tradeSignal.signal.replace('_', ' ')}
      </div>

      {/* Price Row */}
      <div className="flex items-baseline space-x-2 mb-6">
        <span className="text-2xl font-bold text-foreground mono tracking-tighter">
          ₹{stockData.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
        <span className={cn(
          "text-xs font-bold mono",
          stockData.change >= 0 ? "text-green" : "text-red"
        )}>
          {stockData.change >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%
        </span>
      </div>

      {/* Targets Row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <TargetPill label="SHORT" price={tradeSignal.shortTermTarget} current={stockData.price} />
        <TargetPill label="MED" price={tradeSignal.mediumTermTarget} current={stockData.price} />
        <TargetPill label="LONG" price={tradeSignal.longTermTarget} current={stockData.price} />
      </div>

      {/* Stop Loss Row */}
      <div className="mb-6 flex items-center space-x-2 text-red font-bold text-[10px] mono">
        <span>⚠ SL ₹{tradeSignal.stopLoss.toFixed(0)}</span>
        <span>-{Math.abs(((tradeSignal.stopLoss - stockData.price) / stockData.price) * 100).toFixed(1)}%</span>
      </div>

      {/* View Full Analysis */}
      <div className="text-right">
        <span className="text-[10px] font-bold text-muted uppercase tracking-widest group-hover:text-secondary transition-colors">
          VIEW FULL ANALYSIS →
        </span>
      </div>

      {/* Confidence Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-muted/20">
        <div 
          className={cn("h-full transition-all duration-500", {
            'bg-green': signalColor === 'green',
            'bg-red': signalColor === 'red',
            'bg-amber': signalColor === 'amber',
          })}
          style={{ width: `${tradeSignal.confidence}%` }}
        />
      </div>
    </Link>
  );
}

function TargetPill({ label, price, current }: { label: string, price: number, current: number }) {
  const upside = ((price - current) / current) * 100;
  return (
    <div className="bg-[#1a1f2e] rounded-md p-2 flex flex-col items-center justify-center">
      <span className="text-[8px] font-bold text-muted uppercase mb-0.5">{label}</span>
      <span className="text-[10px] font-bold text-foreground mono">₹{price.toFixed(0)}</span>
      <span className="text-[9px] font-bold text-green mono">+{upside.toFixed(0)}%</span>
    </div>
  );
}
