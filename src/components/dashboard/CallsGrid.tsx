"use client";

import { useEffect, useState } from "react";
import { MarketCall } from "@/types";
import MarketCallCard from "./MarketCallCard";

interface CallsGridProps {
  timeframe: 'SHORT' | 'MEDIUM' | 'LONG';
}

export default function CallsGrid({ timeframe }: CallsGridProps) {
  const [calls, setCalls] = useState<MarketCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/market-calls?timeframe=${timeframe}`);
        const data = await res.json();
        setCalls(data);
      } catch (error) {
        console.error("Failed to fetch market calls", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 h-[300px] flex flex-col space-y-4">
              <div className="h-6 w-24 bg-[#1a1f2e] rounded animate-shimmer" />
              <div className="h-4 w-full bg-[#1a1f2e] rounded animate-shimmer" />
              <div className="h-12 w-full bg-[#1a1f2e] rounded animate-shimmer" />
              <div className="flex-1" />
              <div className="h-10 w-full bg-[#1a1f2e] rounded animate-shimmer" />
            </div>
          ))}
        </div>
        <div className="text-center">
           <p className="text-xs font-bold text-green/60 uppercase tracking-widest animate-pulse mono">
             Scanning NSE/BSE watchlist...
           </p>
        </div>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="text-center py-24 bg-card border border-border rounded-xl">
        <p className="text-muted uppercase tracking-widest text-xs font-bold mono">No high-confidence calls found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
      {calls.map((call) => (
        <MarketCallCard key={call.stockData.ticker} call={call} />
      ))}
    </div>
  );
}
