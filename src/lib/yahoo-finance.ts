import { StockData, OHLCVBar } from '@/types';

const YF_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const YF_SEARCH = 'https://query1.finance.yahoo.com/v1/finance/search';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
};

export async function getStockData(ticker: string): Promise<StockData | null> {
  try {
    const url = `${YF_BASE}/${ticker}?interval=1d&range=5d`;
    const res = await fetch(url, { headers, next: { revalidate: 900 } });
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    return {
      ticker,
      name: meta.longName ?? meta.shortName ?? ticker,
      price: meta.regularMarketPrice ?? 0,
      change: meta.regularMarketChange ?? (meta.regularMarketPrice - meta.chartPreviousClose) ?? 0,
      changePercent: meta.regularMarketChangePercent ?? 0,
      volume: meta.regularMarketVolume ?? 0,
      high: meta.regularMarketDayHigh ?? 0,
      low: meta.regularMarketDayLow ?? 0,
      open: meta.regularMarketOpen ?? 0,
      previousClose: meta.previousClose ?? 0,
      marketCap: meta.marketCap ?? 0,
      pe: 0,
      weekHigh52: meta.fiftyTwoWeekHigh ?? 0,
      weekLow52: meta.fiftyTwoWeekLow ?? 0,
      exchange: meta.exchangeName ?? 'NSE',
    };
  } catch (err) {
    console.error(`getStockData error for ${ticker}:`, err);
    return null;
  }
}

export async function getOHLCV(ticker: string, period: '1mo' | '3mo' | '6mo' | '1y'): Promise<OHLCVBar[]> {
  try {
    const rangeMap = { '1mo': '1mo', '3mo': '3mo', '6mo': '6mo', '1y': '1y' };
    const url = `${YF_BASE}/${ticker}?interval=1d&range=${rangeMap[period]}`;
    const res = await fetch(url, { headers, next: { revalidate: 900 } });
    if (!res.ok) return [];
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return [];

    const timestamps: number[] = result.timestamp ?? [];
    const quotes = result.indicators?.quote?.[0] ?? {};
    const opens: number[] = quotes.open ?? [];
    const highs: number[] = quotes.high ?? [];
    const lows: number[] = quotes.low ?? [];
    const closes: number[] = quotes.close ?? [];
    const volumes: number[] = quotes.volume ?? [];

    return timestamps
      .map((t, i) => ({
        time: t,
        open: opens[i] ?? 0,
        high: highs[i] ?? 0,
        low: lows[i] ?? 0,
        close: closes[i] ?? 0,
        volume: volumes[i] ?? 0,
      }))
      .filter(bar => bar.close > 0);
  } catch (err) {
    console.error(`getOHLCV error for ${ticker}:`, err);
    return [];
  }
}

export async function searchStocks(query: string): Promise<{ ticker: string; name: string; exchange: string }[]> {
  try {
    const url = `${YF_SEARCH}?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
    const res = await fetch(url, { headers });
    if (!res.ok) return [];
    const json = await res.json();
    const quotes = json?.quotes ?? [];

    return quotes
      .filter((q: any) => 
        q.symbol?.endsWith('.NS') || 
        q.symbol?.endsWith('.BO')
      )
      .map((q: any) => ({
        ticker: q.symbol,
        name: q.longname ?? q.shortname ?? q.symbol,
        exchange: q.symbol.endsWith('.NS') ? 'NSE' : 'BSE',
      }))
      .slice(0, 10);
  } catch (err) {
    console.error('searchStocks error:', err);
    return [];
  }
}
