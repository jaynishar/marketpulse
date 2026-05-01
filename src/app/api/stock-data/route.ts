import { NextRequest, NextResponse } from "next/server";
import { getStockData, getOHLCV } from "@/lib/yahoo-finance";
import { getAllIndicators } from "@/lib/technical-analysis";
import { generateTradeSignal } from "@/lib/signal-generator";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker");
  const period = (searchParams.get("period") as '1mo' | '3mo' | '6mo' | '1y') || "3mo";

  if (!ticker) {
    return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
  }

  try {
    const stockData = await getStockData(ticker);
    const ohlcv = await getOHLCV(ticker, period);
    
    if (!ohlcv || ohlcv.length === 0) {
      return NextResponse.json({ error: `No historical data found for ${ticker}` }, { status: 404 });
    }

    const indicators = getAllIndicators(ohlcv);
    const signal = generateTradeSignal(stockData, indicators, 'SHORT');

    return NextResponse.json({
      stockData,
      ohlcv,
      indicators,
      signal
    });
  } catch (error: any) {
    console.error('stock-data error:', error);
    return NextResponse.json({ 
      error: error.message || "Failed to fetch data",
      ticker 
    }, { status: 500 });
  }
}
