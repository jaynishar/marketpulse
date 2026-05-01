"use client";

import { StockData } from "@/types";
import { Info, BarChart } from "lucide-react";

interface FundamentalPanelProps {
  data: StockData;
}

export default function FundamentalPanel({ data }: FundamentalPanelProps) {
  const formatValue = (val: number) => {
    if (val >= 100000000000) return `₹${(val / 100000000000).toFixed(2)} Lakh Cr`;
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-foreground flex items-center space-x-2 mb-6">
        <BarChart size={16} className="text-primary" />
        <span>Fundamental Statistics</span>
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
        <DataPoint label="Market Cap" value={formatValue(data.marketCap)} />
        <DataPoint label="P/E Ratio" value={data.pe?.toFixed(2) || "N/A"} />
        <DataPoint label="52W High" value={`₹${data.weekHigh52.toLocaleString('en-IN')}`} />
        <DataPoint label="52W Low" value={`₹${data.weekLow52.toLocaleString('en-IN')}`} />
        <DataPoint label="Day High" value={`₹${data.high.toLocaleString('en-IN')}`} />
        <DataPoint label="Day Low" value={`₹${data.low.toLocaleString('en-IN')}`} />
        <DataPoint label="Volume" value={data.volume.toLocaleString('en-IN')} />
      </div>
    </div>
  );
}

function DataPoint({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold mono truncate">{value}</p>
    </div>
  );
}
