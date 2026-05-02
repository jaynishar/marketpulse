import { NextRequest, NextResponse } from "next/server";
import { getStockData, getOHLCV } from "@/lib/yahoo-finance";
import { getAllIndicators } from "@/lib/technical-analysis";
import { generateTradeSignal } from "@/lib/signal-generator";
import { analyzeStockWithNews, analyzeNewsForStock } from "@/lib/groq-client";
import { NSE_WATCHLIST } from "@/lib/market-watchlist";
import { MarketCall } from "@/types";

export const revalidate = 900; // 15 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const timeframe = (searchParams.get("timeframe") as 'SHORT' | 'MEDIUM' | 'LONG') || 'SHORT';

  try {
    // 1. Scan top 30 stocks
    const tickers = NSE_WATCHLIST.slice(0, 30);
    
    const candidates = await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const stockData = await getStockData(ticker);
          if (!stockData) return null;
          const ohlcv = await getOHLCV(ticker, '3mo');
          if (!ohlcv || ohlcv.length === 0) return null;
          
          const indicators = getAllIndicators(ohlcv);
          const signal = generateTradeSignal(stockData, indicators, timeframe);
          
          return { stockData, indicators, signal, ticker };
        } catch (e) {
          return null;
        }
      })
    );

    const validCandidates = candidates.filter(c => c !== null);

    // 2. Strict Filtering
    let filtered = validCandidates.filter(c => {
      const s = c!.signal;
      const price = c!.stockData.price;
      
      if (s.signal === 'HOLD') return false;
      if (s.confidence < 55) return false;
      if (s.riskReward < 2.0) return false;
      
      const slPercent = s.signal.includes('BUY') 
        ? (price - s.stopLoss) / price 
        : (s.stopLoss - price) / price;
        
      if (slPercent > 0.08) return false;
      
      return true;
    });

    // 3. Sort by primary: confidence descending, secondary: R:R descending
    filtered.sort((a, b) => {
      if (b!.signal.confidence !== a!.signal.confidence) {
        return b!.signal.confidence - a!.signal.confidence;
      }
      return b!.signal.riskReward - a!.signal.riskReward;
    });

    // 4. Cap SELL calls to maximum 3
    let sellCount = 0;
    filtered = filtered.filter(c => {
      if (c!.signal.signal.includes('SELL')) {
        sellCount++;
        return sellCount <= 3;
      }
      return true;
    });

    // Take top 5 for deep AI analysis after all filters
    const topCandidates = filtered.slice(0, 5);

    const marketCalls = await Promise.all(
      topCandidates.map(async (c) => {
        const technicalSummary = `RSI: ${c!.indicators.rsi14.toFixed(2)}, Signal: ${c!.signal.signal}, Confidence: ${c!.signal.confidence}%, Risk/Reward: ${c!.signal.riskReward.toFixed(2)}`;
        
        let aiAnalysis = "AI analysis unavailable. Technical signals active.";
        let newsItems: any[] = [];

        try {
          [aiAnalysis, newsItems] = await Promise.all([
            analyzeStockWithNews(c!.ticker, c!.stockData.name, technicalSummary),
            analyzeNewsForStock(c!.ticker, c!.stockData.name)
          ]);
        } catch (err) {
          console.error(`AI analysis failed for ${c!.ticker}:`, err);
        }

        return {
          stockData: c!.stockData,
          technicalIndicators: c!.indicators,
          tradeSignal: c!.signal,
          newsHeadlines: newsItems.map(n => n.headline),
          aiAnalysis,
          generatedAt: new Date().toISOString()
        } as MarketCall;
      })
    );

    const scanSummary = {
      scanned: tickers.length,
      passed_filters: filtered.length,
      showing: topCandidates.length,
      scan_time: new Date().toISOString(),
      market_note: filtered.length > 0 
        ? `${filtered.length} of ${tickers.length} stocks show actionable setups today.`
        : `MARKET SCAN: No high-confidence setups today. Check back tomorrow or search specific stocks.`
    };

    return NextResponse.json({
      summary: scanSummary,
      calls: marketCalls
    });
  } catch (error: any) {
    console.error("Market-calls API Error:", error);
    return NextResponse.json({ error: "Failed to scan market" }, { status: 500 });
  }
}
