"use client";

import { cn } from "@/lib/utils";

type Timeframe = 'SHORT' | 'MEDIUM' | 'LONG';

interface TimeframeSelectorProps {
  selected: Timeframe;
  onSelect: (t: Timeframe) => void;
}

export default function TimeframeSelector({ selected, onSelect }: TimeframeSelectorProps) {
  const options: { id: Timeframe; label: string; sub: string }[] = [
    { id: 'SHORT', label: 'SHORT', sub: '1-4W' },
    { id: 'MEDIUM', label: 'MEDIUM', sub: '1-3M' },
    { id: 'LONG', label: 'LONG', sub: '6-12M' },
  ];

  return (
    <div className="flex w-full border border-border rounded-lg overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className={cn(
            "flex-1 py-3 px-4 transition-all text-center mono font-bold text-xs border-r border-border last:border-r-0",
            selected === opt.id 
              ? "bg-green/10 text-green border-green" 
              : "bg-transparent text-muted hover:text-secondary"
          )}
        >
          {opt.label} &nbsp; <span className="opacity-60">{opt.sub}</span>
        </button>
      ))}
    </div>
  );
}
