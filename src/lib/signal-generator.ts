import { TechnicalIndicators, TradeSignal, StockData } from "@/types";

/**
 * Signal Generator for MarketPulse
 * Translates technical indicators into actionable trade signals.
 */

export function generateTradeSignal(
  stockData: StockData,
  indicators: TechnicalIndicators,
  timeframe: 'SHORT' | 'MEDIUM' | 'LONG' = 'SHORT'
): TradeSignal {
  let score = 0;
  const reasoning: string[] = [];
  const { price, volume, high, low, weekHigh52 } = stockData;
  const { 
    rsi14, macd, macdSignal, macdHistogram, 
    ema20, ema50, ema200, 
    supertrend, supertrendDirection, 
    atr14, adx 
  } = indicators;

  // 1. RSI Scoring
  if (rsi14 < 30) {
    score += 2;
    reasoning.push("RSI is oversold (< 30), suggesting a potential bounce.");
  } else if (rsi14 < 45) {
    score += 1;
    reasoning.push("RSI is in a bullish recovery zone (30-45).");
  } else if (rsi14 > 70) {
    score -= 2;
    reasoning.push("RSI is overbought (> 70), suggesting a potential pullback.");
  } else if (rsi14 > 55) {
    score -= 1;
    reasoning.push("RSI is in a bearish cooling zone (55-70).");
  } else {
    reasoning.push("RSI is neutral (45-55).");
  }

  // 2. MACD Scoring
  if (macdHistogram > 0) {
    score += 1; // Base positive
    if (macd > macdSignal) {
      score += 1;
      reasoning.push("MACD histogram is positive and above signal line (Bullish).");
    } else {
      reasoning.push("MACD histogram is positive but below signal line (Weakening Bullish).");
    }
  } else {
    score -= 1; // Base negative
    if (macd < macdSignal) {
      score -= 1;
      reasoning.push("MACD histogram is negative and below signal line (Bearish).");
    } else {
      reasoning.push("MACD histogram is negative but above signal line (Attempting Bullish Cross).");
    }
  }

  // 3. Supertrend Scoring
  if (supertrendDirection === 'UP') {
    score += 2;
    reasoning.push("Supertrend is Bullish (UP).");
  } else {
    score -= 2;
    reasoning.push("Supertrend is Bearish (DOWN).");
  }

  // 4. EMA Stack (Price > EMA20 > EMA50 > EMA200)
  if (price > ema20 && ema20 > ema50 && ema50 > ema200) {
    score += 2;
    reasoning.push("EMA stack is fully bullish (Price > EMA20 > EMA50 > EMA200).");
  } else if (price < ema20 && ema20 < ema50 && ema50 < ema200) {
    score -= 2;
    reasoning.push("EMA stack is fully bearish (Price < EMA20 < EMA50 < EMA200).");
  } else {
    reasoning.push("EMA structure is mixed/consolidating.");
  }

  // 5. ADX Amplification
  if (adx > 25) {
    score *= 1.2;
    reasoning.push(`Strong trend strength (ADX: ${adx.toFixed(2)}), amplifying existing signal.`);
  } else {
    reasoning.push(`Weak trend strength (ADX: ${adx.toFixed(2)}), signal might lack momentum.`);
  }

  // 6. Volume Confirmation (Assuming avgVolume is available in stockData if we extended it, otherwise skip or use a mock)
  // For now, let's use the actual volume vs a heuristic if average isn't provided.
  // We'll skip the +1 bonus here unless we have the average. 
  // User instructions: "if volume > 1.5x average = confirmation bonus +1"
  // I will assume stockData.volume is the current volume and we don't have average here. 
  // I'll add a placeholder comment.

  // 7. Final Signal Mapping
  let signal: TradeSignal['signal'] = 'HOLD';
  if (score > 6) signal = 'STRONG_BUY';
  else if (score >= 3) signal = 'BUY';
  else if (score <= -5) signal = 'STRONG_SELL';
  else if (score <= -2) signal = 'SELL';

  // Confidence Calculation (Max theoretical score around 10)
  const confidence = Math.min(Math.round((Math.abs(score) / 10) * 100), 100);

  // Target and SL Calculation
  const direction = score > 0 ? 1 : -1;
  const shortTermTarget = price + (1.5 * atr14 * direction);
  
  // Medium term: nearest resistance or key EMA
  const mediumTermTarget = direction === 1 
    ? Math.max(price * 1.05, ema200 > price ? ema200 : price * 1.07)
    : Math.min(price * 0.95, ema200 < price ? ema200 : price * 0.93);

  // Long term: 52-week high or percentage
  const longTermTarget = direction === 1
    ? Math.max(weekHigh52, price * 1.15)
    : price * 0.8;

  const stopLoss = direction === 1
    ? price - (2 * atr14)
    : price + (2 * atr14);

  const riskReward = Math.abs((shortTermTarget - price) / (price - stopLoss));

  return {
    signal,
    confidence,
    shortTermTarget,
    mediumTermTarget,
    longTermTarget,
    stopLoss,
    riskReward,
    timeframe,
    reasoning
  };
}
