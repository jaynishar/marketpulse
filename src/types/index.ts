export interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  marketCap: number;
  pe: number | null;
  weekHigh52: number;
  weekLow52: number;
  exchange: string;
}

export interface OHLCVBar {
  time: string | number | Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi14: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  ema20: number;
  ema50: number;
  ema200: number;
  supertrend: number;
  supertrendDirection: 'UP' | 'DOWN';
  atr14: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  vwap: number;
  adx: number;
  stochasticK: number;
  stochasticD: number;
}

export interface TradeSignal {
  signal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  shortTermTarget: number;
  mediumTermTarget: number;
  longTermTarget: number;
  stopLoss: number;
  riskReward: number;
  timeframe: 'SHORT' | 'MEDIUM' | 'LONG';
  reasoning: string[];
}

export interface MarketCall {
  stockData: StockData;
  technicalIndicators: TechnicalIndicators;
  tradeSignal: TradeSignal;
  newsHeadlines: string[];
  aiAnalysis: string;
  generatedAt: string;
}

export interface NewsItem {
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}
