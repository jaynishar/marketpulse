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
    // 1. Scan top 15 stocks to stay within free tier limits
    const tickers = NSE_WATCHLIST.slice(0, 15);
    
    const candidates = await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const stockData = await getStockData(ticker);
          const ohlcv = await getOHLCV(ticker, '3mo');
          const indicators = getAllIndicators(ohlcv);
          const signal = generateTradeSignal(stockData, indicators, timeframe);
          
          return { stockData, indicators, signal, ticker };
        } catch (e) {
          return null;
        }
      })
    );

    const validCandidates = candidates.filter(c => c !== null);

    // 2. Filter by signal strength/relevance to timeframe
    // Lowered confidence threshold to 30
    let filtered = validCandidates.filter(c => c!.signal.confidence >= 30);
    
    if (timeframe === 'SHORT') {
      // Prioritize high RSI momentum or reversals
      filtered = filtered.filter(c => c!.indicators.rsi14 > 60 || c!.indicators.rsi14 < 35);
    } else if (timeframe === 'MEDIUM') {
      // Prioritize trend following (Price > EMA50)
      filtered = filtered.filter(c => c!.stockData.price > c!.indicators.ema50);
    }

    // Always return minimum 5 stocks regardless of signal strength if possible
    if (filtered.length < 5) {
      filtered = validCandidates
        .sort((a, b) => b!.signal.confidence - a!.signal.confidence)
        .slice(0, 5);
    }

    // 3. Sort by confidence and take top 5 for deep AI analysis
    const topCandidates = filtered
      .sort((a, b) => b!.signal.confidence - a!.signal.confidence)
      .slice(0, 5);

    const marketCalls = await Promise.all(
      topCandidates.map(async (c) => {
        const technicalSummary = `RSI: ${c!.indicators.rsi14.toFixed(2)}, Signal: ${c!.signal.signal}, Confidence: ${c!.signal.confidence}%`;
        
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

    return NextResponse.json(marketCalls);
  } catch (error: any) {
    console.error("Market-calls API Error:", error);
    return NextResponse.json({ error: "Failed to scan market" }, { status: 500 });
  }
}
