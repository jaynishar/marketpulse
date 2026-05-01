"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchResult {
  ticker: string;
  name: string;
  exchange: string;
}

export default function StockSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const r = await fetch(`/api/stocks/search?q=${query}`);
        if (r.ok) {
          const data = await r.json();
          setResults(data);
        }
      } catch (e) {
        console.error("Search failed");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (stock: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/stock/${stock.ticker}`);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="SEARCH NSE/BSE — RELIANCE, TCS, INFY..."
          className="w-full bg-card border border-border rounded-lg px-6 py-4 text-foreground mono placeholder:text-muted focus:outline-none focus:border-green transition-all"
        />
        {loading && (
          <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-green animate-spin" />
        )}
      </div>

      {isOpen && (query.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-2xl z-[100] overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            {results.length > 0 ? (
              results.map((res) => (
                <button
                  key={res.ticker}
                  onClick={() => handleSelect(res)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#1a1f2e] transition-colors text-left border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-green font-bold mono w-24 truncate">{res.ticker}</span>
                    <span className="text-secondary text-sm truncate max-w-[200px] md:max-w-none">{res.name}</span>
                  </div>
                  <span className="text-[9px] font-black px-2 py-1 rounded bg-muted text-muted-foreground uppercase tracking-widest">
                    {res.exchange}
                  </span>
                </button>
              ))
            ) : !loading && (
              <div className="px-6 py-8 text-center text-muted">
                <p className="text-xs font-bold uppercase tracking-widest mono">No matching assets found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
