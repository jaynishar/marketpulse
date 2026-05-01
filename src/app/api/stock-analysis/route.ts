import { NextRequest, NextResponse } from "next/server";
import { getStockData, getOHLCV } from "@/lib/yahoo-finance";
import { getAllIndicators } from "@/lib/technical-analysis";
import { generateTradeSignal } from "@/lib/signal-generator";
import { analyzeStockWithNews, analyzeNewsForStock } from "@/lib/groq-client";
import { MarketCall } from "@/types";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
  }

  try {
    const stockData = await getStockData(ticker);
    const ohlcv = await getOHLCV(ticker, '3mo');
    const indicators = getAllIndicators(ohlcv);
    const signal = generateTradeSignal(stockData, indicators, 'SHORT');

    const technicalSummary = `
      Price: ${stockData.price}, Change: ${stockData.changePercent.toFixed(2)}%
      RSI: ${indicators.rsi14.toFixed(2)}, Supertrend: ${indicators.supertrendDirection}
      MACD: ${indicators.macd.toFixed(2)}, Signal: ${indicators.macdSignal.toFixed(2)}
      Signal Recommendation: ${signal.signal} with ${signal.confidence}% confidence.
    `;

    // Fetch AI Analysis and News in parallel
    let aiAnalysis = "AI analysis unavailable. Technical signals active.";
    let newsItems: any[] = [];

    try {
      [aiAnalysis, newsItems] = await Promise.all([
        analyzeStockWithNews(ticker, stockData.name, technicalSummary),
        analyzeNewsForStock(ticker, stockData.name)
      ]);
    } catch (err) {
      console.error(`AI analysis failed for ${ticker}:`, err);
    }

    const marketCall: MarketCall = {
      stockData,
      technicalIndicators: indicators,
      tradeSignal: signal,
      newsHeadlines: newsItems.map(n => n.headline),
      aiAnalysis,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(marketCall, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error: any) {
    console.error(`Error in stock-analysis API:`, error);
    return NextResponse.json({ error: error.message || "Analysis failed" }, { status: 500 });
  }
}
