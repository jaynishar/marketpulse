"use client";

import { useEffect, useRef, useState } from "react";
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  CandlestickData, 
  LineData,
  CandlestickSeries,
  LineSeries,
  HistogramSeries
} from "lightweight-charts";
import { OHLCVBar, TechnicalIndicators } from "@/types";
import { calculateEMA, calculateSupertrend } from "@/lib/technical-analysis";

interface StockChartProps {
  data: OHLCVBar[];
  indicators: TechnicalIndicators;
  ticker: string;
}

export default function StockChart({ data, indicators, ticker }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [range, setRange] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0a0e1a" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "rgba(31, 41, 55, 0.5)" },
        horzLines: { color: "rgba(31, 41, 55, 0.5)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        borderColor: "rgba(31, 41, 55, 0.5)",
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00d084",
      downColor: "#ff4757",
      borderVisible: false,
      wickUpColor: "#00d084",
      wickDownColor: "#ff4757",
    });

    const formattedData: CandlestickData[] = data.map(d => ({
      time: d.time as string,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candlestickSeries.setData(formattedData);

    // EMA Overlays
    const closes = data.map(d => d.close);
    const ema20Data = calculateEMA(closes, 20);
    const ema50Data = calculateEMA(closes, 50);
    const ema200Data = calculateEMA(closes, 200);

    const createLine = (color: string, width: number) => chart.addSeries(LineSeries, {
      color,
      lineWidth: width as any,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const ema20Series = createLine("#3b82f6", 1);
    const ema50Series = createLine("#f59e0b", 1);
    const ema200Series = createLine("#ef4444", 2);

    ema20Series.setData(data.map((d, i) => ({ time: d.time as string, value: ema20Data[i] || d.close })));
    ema50Series.setData(data.map((d, i) => ({ time: d.time as string, value: ema50Data[i] || d.close })));
    ema200Series.setData(data.map((d, i) => ({ time: d.time as string, value: ema200Data[i] || d.close })));

    // Volume Histogram
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#1f2937",
      priceFormat: { type: "volume" },
      priceScaleId: "", // overlay
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    volumeSeries.setData(data.map(d => ({
      time: d.time as string,
      value: d.volume,
      color: d.close >= d.open ? "rgba(0, 208, 132, 0.3)" : "rgba(255, 71, 87, 0.3)",
    })));

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="bg-card border border-border rounded-2xl p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-secondary-foreground">{ticker} Technical Chart</h3>
          <div className="flex items-center space-x-2">
            <LegendItem color="#3b82f6" label="EMA20" />
            <LegendItem color="#f59e0b" label="EMA50" />
            <LegendItem color="#ef4444" label="EMA200" />
          </div>
        </div>
        <div className="flex bg-background border border-border rounded-lg p-1">
          {['1M', '3M', '6M', '1Y'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as any)}
              className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${
                range === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center space-x-1">
      <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
    </div>
  );
}
