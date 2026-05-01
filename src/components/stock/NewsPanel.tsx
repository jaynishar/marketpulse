"use client";

import { Newspaper, ExternalLink, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsItem {
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

interface NewsPanelProps {
  news: NewsItem[];
}

export default function NewsPanel({ news }: NewsPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-foreground flex items-center space-x-2">
        <Newspaper size={16} className="text-primary" />
        <span>Market Intelligence</span>
      </h3>

      <div className="space-y-3">
        {news.length > 0 ? (
          news.map((item, i) => (
            <a 
              key={i} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                "block bg-background/40 border-l-4 rounded-r-xl p-4 hover:bg-muted/50 transition-all border-y border-r border-border",
                item.sentiment === 'POSITIVE' ? "border-l-[--bullish]" : 
                item.sentiment === 'NEGATIVE' ? "border-l-[--bearish]" : 
                "border-l-muted-foreground"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter",
                  item.sentiment === 'POSITIVE' ? "bg-[--bullish]/10 text-[--bullish]" : 
                  item.sentiment === 'NEGATIVE' ? "bg-[--bearish]/10 text-[--bearish]" : 
                  "bg-muted text-muted-foreground"
                )}>
                  {item.sentiment}
                </span>
                <ExternalLink size={12} className="text-muted-foreground" />
              </div>
              <h4 className="text-sm font-bold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {item.headline}
              </h4>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                <span>{item.source}</span>
                <div className="flex items-center space-x-1">
                  <Calendar size={10} />
                  <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </a>
          ))
        ) : (
          <div className="p-8 text-center bg-background/20 rounded-xl border border-dashed border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No recent headlines found</p>
          </div>
        )}
      </div>
    </div>
  );
}
