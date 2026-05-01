import yahooFinance from 'yahoo-finance2';
import { StockData, OHLCVBar } from '@/types';

/**
 * Yahoo Finance Service for MarketPulse
 * Robust data fetching for NSE/BSE stocks and Indices.
 */

export async function getStockData(ticker: string): Promise<StockData> {
  try {
    const result = await yahooFinance.quote(ticker) as any;
    
    if (!result) {
      throw new Error(`No data found for ${ticker}`);
    }

    return {
      ticker: result.symbol,
      name: result.longName ?? result.shortName ?? ticker,
      price: result.regularMarketPrice ?? 0,
      change: result.regularMarketChange ?? 0,
      changePercent: result.regularMarketChangePercent ?? 0,
      volume: result.regularMarketVolume ?? 0,
      high: result.regularMarketDayHigh ?? 0,
      low: result.regularMarketDayLow ?? 0,
      open: result.regularMarketOpen ?? 0,
      previousClose: result.regularMarketPreviousClose ?? 0,
      marketCap: result.marketCap ?? 0,
      pe: result.trailingPE ?? 0,
      weekHigh52: result.fiftyTwoWeekHigh ?? 0,
      weekLow52: result.fiftyTwoWeekLow ?? 0,
      exchange: result.exchange ?? 'NSE',
    };
  } catch (error) {
    console.error(`Error fetching stock data for ${ticker}:`, error);
    throw error;
  }
}

export async function getOHLCV(ticker: string, period: '1mo' | '3mo' | '6mo' | '1y' = '3mo'): Promise<OHLCVBar[]> {
  const periodMap = {
    '1mo': 30,
    '3mo': 90,
    '6mo': 180,
    '1y': 365,
  };

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - periodMap[period]);

  try {
    const result = await yahooFinance.historical(ticker, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    }) as any[];

    return result.map(bar => ({
      time: bar.date.toISOString().split('T')[0],
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
      volume: bar.volume,
    })).sort((a, b) => new Date(a.time as string).getTime() - new Date(b.time as string).getTime());
  } catch (error) {
    console.error(`Error fetching OHLCV for ${ticker}:`, error);
    return [];
  }
}

export async function searchStocks(query: string): Promise<{ticker: string, name: string, exchange: string}[]> {
  try {
    const result = await yahooFinance.search(query, {
      quotesCount: 10,
      newsCount: 0,
    }) as any;

    return result.quotes
      .filter((q: any) => q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO'))
      .map((q: any) => ({
        ticker: q.symbol,
        name: (q as any).shortname || (q as any).longname || q.symbol,
        exchange: q.symbol.endsWith('.NS') ? 'NSE' : 'BSE',
      }));
  } catch (error) {
    console.error(`Error searching stocks for ${query}:`, error);
    return [];
  }
}

export default yahooFinance;
