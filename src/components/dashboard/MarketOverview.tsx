"use client";

import { useEffect, useState } from "react";

interface IndexData {
  name: string;
  price: number | string;
  change: number;
  changePercent: number;
}

export default function MarketOverview() {
  const [indices, setIndices] = useState<IndexData[]>([]);

  const fetchIndices = async () => {
    try {
      const [niftyRes, sensexRes] = await Promise.all([
        fetch('/api/stock-data?ticker=%5ENSEI&period=1mo'),
        fetch('/api/stock-data?ticker=%5EBSESN&period=1mo')
      ]);

      const niftyJson = await niftyRes.json();
      const sensexJson = await sensexRes.json();

      const nifty = niftyJson?.stockData ?? niftyJson ?? {};
      const sensex = sensexJson?.stockData ?? sensexJson ?? {};

      setIndices([
        {
          name: "NIFTY 50",
          price: nifty?.price || "--",
          change: nifty?.change || 0,
          changePercent: nifty?.changePercent || 0
        },
        {
          name: "SENSEX",
          price: sensex?.price || "--",
          change: sensex?.change || 0,
          changePercent: sensex?.changePercent || 0
        }
      ]);
    } catch (error) {
      console.error("Failed to fetch indices", error);
    }
  };

  useEffect(() => {
    fetchIndices();
    const interval = setInterval(fetchIndices, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (indices.length === 0) {
     return (
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-card border border-border rounded-xl animate-shimmer" />
          ))}
        </div>
     );
  }

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {indices.map((idx) => (
        <div key={idx.name} className="bg-card border border-border rounded-xl p-5">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1 mono">{idx.name}</p>
          <p className="text-2xl font-bold mono tracking-tight text-foreground">
            {typeof idx.price === 'number' 
              ? `₹${idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` 
              : idx.price}
          </p>
          <div className={`mt-1 flex items-center space-x-2 text-xs font-bold mono ${idx.change >= 0 ? 'text-green' : 'text-red'}`}>
            <span>{idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}</span>
            <span>({idx.change >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%)</span>
          </div>
        </div>
      ))}
    </div>
  );
}
