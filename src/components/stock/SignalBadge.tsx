"use client";

import { cn } from "@/lib/utils";

interface SignalBadgeProps {
  signal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  size?: 'sm' | 'md' | 'lg';
}

export default function SignalBadge({ signal, size = 'md' }: SignalBadgeProps) {
  const isStrong = signal.includes('STRONG');
  
  const config = {
    STRONG_BUY: "bg-green text-background border-none animate-pulse shadow-[0_0_20px_#00ff8844]",
    BUY: "border-green/50 text-green bg-green/10",
    HOLD: "border-amber/50 text-amber bg-amber/10",
    SELL: "border-red/50 text-red bg-red/10",
    STRONG_SELL: "bg-red text-white border-none animate-pulse shadow-[0_0_20px_#ff3b5c44]",
  };

  return (
    <div className={cn(
      "inline-flex items-center justify-center font-black uppercase tracking-[0.1em] border rounded-md mono",
      size === 'sm' ? "text-[8px] px-2 py-0.5" : size === 'lg' ? "text-sm px-6 py-2.5" : "text-[10px] px-4 py-1.5",
      config[signal]
    )}>
      {signal.replace('_', ' ')}
    </div>
  );
}
