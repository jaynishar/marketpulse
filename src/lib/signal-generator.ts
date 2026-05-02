import { TechnicalIndicators, TradeSignal, StockData } from "@/types";

type StockType = 'DIVIDEND' | 'MOMENTUM' | 'NEWS_DRIVEN' | 'CYCLICAL' | 'DEFENSIVE' | 'OVERSOLD_WATCH' | 'STANDARD';

function classifyStock(data: StockData, indicators: TechnicalIndicators): StockType {
  const { price, pe, weekHigh52, weekLow52, exchange } = data;
  const { atr14, ema20, ema50, ema200, adx } = indicators;
  
  const atrRatio = atr14 / price;
  const isNear52wHigh = price >= weekHigh52 * 0.95;
  const isNear52wLow = price <= weekLow52 * 1.05;

  if (pe > 0 && pe < 15 && isNear52wHigh && atrRatio < 0.02) {
    return 'DIVIDEND';
  }
  
  if (price > ema20 && ema20 > ema50 && ema50 > ema200 && adx > 25 && atrRatio > 0.02) {
    return 'MOMENTUM';
  }
  
  if (atrRatio > 0.035) {
    return 'NEWS_DRIVEN';
  }
  
  if (isNear52wLow && indicators.rsi14 < 35) {
    return 'OVERSOLD_WATCH';
  }
  
  if (atrRatio < 0.02 && price > ema50) {
    return 'DEFENSIVE';
  }
  
  // Cyclical could be further refined with sector mappings if available
  return 'STANDARD';
}

export function generateTradeSignal(
  stockData: StockData,
  indicators: TechnicalIndicators,
  timeframe: 'SHORT' | 'MEDIUM' | 'LONG' = 'SHORT'
): TradeSignal {
  let score = 0;
  const reasoning: string[] = [];
  const { price, volume, high, low, weekHigh52, weekLow52 } = stockData;
  const { 
    rsi14, macd, macdSignal, macdHistogram, 
    ema20, ema50, ema200, 
    supertrend, supertrendDirection, 
    atr14, adx 
  } = indicators;

  const stockType = classifyStock(stockData, indicators);
  const atrRatio = atr14 / price;

  // TREND FACTORS (weight: 35%)
  let trendScore = 0;
  if (price > ema20 && ema20 > ema50 && ema50 > ema200) {
    trendScore = 3;
    reasoning.push("Price above all 3 EMAs — confirmed uptrend.");
  } else if (price > ema20 && ema20 > ema50 && price < ema200) {
    trendScore = 1;
    reasoning.push("Partial bullish stack (Price > EMA20/50, but below EMA200).");
  } else if (price < ema20 && price > ema50) {
    trendScore = -1;
    reasoning.push("Price below EMA20 but holding EMA50 support.");
  } else if (price < ema50 && price > ema200) {
    trendScore = -2;
    reasoning.push("Price below EMA50 — short/medium term trend is weak.");
  } else if (price < ema20 && ema20 < ema50 && ema50 < ema200) {
    trendScore = -3;
    reasoning.push("Full bearish stack (Price < EMA20 < EMA50 < EMA200) — strong downtrend.");
  }

  if (adx > 30) {
    trendScore *= 1.3;
    reasoning.push(`Strong trend confirmed by ADX (${adx.toFixed(2)} > 30).`);
  } else if (adx < 20) {
    trendScore *= 0.7;
    reasoning.push(`Weak trend structure (ADX ${adx.toFixed(2)} < 20).`);
  }
  score += trendScore;

  // MOMENTUM FACTORS (weight: 25%)
  if (rsi14 >= 45 && rsi14 <= 60) {
    score += 2;
    reasoning.push(`RSI at ${rsi14.toFixed(1)} — healthy momentum zone, not overbought.`);
  } else if (rsi14 > 60 && rsi14 <= 70) {
    score += 1;
    reasoning.push(`RSI at ${rsi14.toFixed(1)} — strong momentum but watch for cooling.`);
  } else if (rsi14 > 75) {
    score -= 2;
    reasoning.push(`WARNING: RSI is overbought (${rsi14.toFixed(1)} > 75) — danger of pullback.`);
  } else if (rsi14 < 30) {
    score += 1;
    reasoning.push(`RSI is oversold (${rsi14.toFixed(1)} < 30) — potential reversal if other factors confirm.`);
  } else if (rsi14 >= 30 && rsi14 < 45) {
    score -= 1;
    reasoning.push(`RSI at ${rsi14.toFixed(1)} indicates weak momentum.`);
  }

  if (macdHistogram > 0 && macd > macdSignal) {
    score += 2;
    reasoning.push("MACD histogram positive and rising (Bullish).");
  } else if (macdHistogram > 0 && macd < macdSignal) {
    score += 0;
    reasoning.push("MACD histogram positive but falling (Momentum slowing).");
  } else if (macdHistogram < 0 && macd < macdSignal) {
    score -= 2;
    reasoning.push("MACD histogram negative and falling (Bearish).");
  } else if (macdHistogram < 0 && macd > macdSignal) {
    score -= 3; // treating recent cross below zero as bearish setup for simplicity, could refine
    reasoning.push("MACD is negative (Bearish).");
  }

  // SUPERTREND (weight: 20%)
  if (supertrendDirection === 'UP') {
    score += 3;
    reasoning.push(`Supertrend is bullish (Support: ₹${supertrend.toFixed(2)}).`);
  } else {
    score -= 3;
    reasoning.push(`Supertrend is bearish (Resistance: ₹${supertrend.toFixed(2)}).`);
  }

  // VOLUME (weight: 10%)
  // Since average volume isn't natively in OHLCV directly without heavy calculation, we use heuristics.
  // For the sake of this robust implementation, we assume a mock check based on current volume vs a simplistic mean or just raw volume spikes if we had historical array.
  // We'll add a placeholder heuristic: if volume is significantly higher than 0. (Requires historical avg for true accuracy)
  if (volume > 1000000) { // Naive heuristic, ideally should compare to 20-day SMA
     score += 1; 
  }

  // RISK/VALUATION (weight: 10%)
  if (price >= weekHigh52 * 0.95) {
    score -= 1;
    reasoning.push("WARNING: Price within 5% of 52-week HIGH — limited upside, high risk.");
  } else if (price <= weekLow52 * 1.10) {
    score += 1;
    reasoning.push("Price within 10% of 52-week LOW — potential value if setup confirms.");
  }

  if (atrRatio > 0.05) {
    score -= 1;
    reasoning.push("WARNING: Very high volatility (ATR/Price > 5%) — conservative sizing required.");
  }

  // STOCK TYPE OVERRIDES
  if (stockType === 'DIVIDEND' && rsi14 > 70) {
    score = 0; // Force HOLD
    reasoning.push("Dividend stock is overbought — overriding to HOLD.");
  }
  if (stockType === 'MOMENTUM' && rsi14 < 50) {
    score = 0; // Force HOLD
    reasoning.push("Momentum stock RSI < 50 — overriding to HOLD.");
  }
  if (stockType === 'NEWS_DRIVEN') {
    reasoning.push("WARNING: News/Event driven volatility — use smaller position size.");
  }

  // TARGET AND STOP LOSS CALCULATION
  const direction = score > 0 ? 1 : -1;
  let slDistance = direction === 1 
    ? Math.max(price - (2.5 * atr14), price * 0.98) // min 2% away
    : Math.min(price + (2.5 * atr14), price * 1.02);

  if (atrRatio > 0.03) {
    slDistance = direction === 1 ? price - (3 * atr14) : price + (3 * atr14);
  }

  // Enforce max 8% SL distance
  if (direction === 1 && (price - slDistance) / price > 0.08) {
    slDistance = price * 0.92;
  }

  const shortTermTarget = price + (1.5 * atr14 * direction);
  const mediumTermTarget = direction === 1 ? weekHigh52 : weekLow52;
  const longTermTarget = direction === 1 ? price * 1.2 : price * 0.8;

  const stopLoss = slDistance;
  const riskReward = Math.abs((shortTermTarget - price) / (price - stopLoss));

  if (riskReward < 1.5 && score > 0) {
    score = 0; // Force HOLD
    reasoning.push(`Risk/Reward ratio is poor (${riskReward.toFixed(2)}:1) — automatic HOLD.`);
  } else if (score > 0) {
    reasoning.push(`Risk/Reward ${riskReward.toFixed(2)}:1 — Target ₹${shortTermTarget.toFixed(2)}, SL ₹${stopLoss.toFixed(2)}.`);
  }

  // STRICT SIGNAL THRESHOLDS
  let signal: TradeSignal['signal'] = 'HOLD';
  let confidence = 0;

  if (score > 7.0 && riskReward > 2.5) {
    signal = 'STRONG_BUY';
    confidence = 85;
  } else if (score >= 5.0 && score <= 7.0 && riskReward > 2.0) {
    signal = 'BUY';
    confidence = 70;
  } else if (score >= -1.0 && score < 5.0) {
    signal = 'HOLD'; // or weak, skip
    confidence = 50;
  } else if (score < -1.0 && score >= -4.0) {
    signal = 'SELL';
    confidence = 65;
  } else if (score < -4.0) {
    signal = 'STRONG_SELL';
    confidence = 80;
  }

  // Confidence Penalties/Bonuses
  if (price >= weekHigh52 * 0.95) confidence -= 10;
  if (adx < 20) confidence -= 15;
  if (score > 8) confidence += 10;
  
  confidence = Math.min(Math.max(confidence, 0), 92); // Cap at 92%

  // Ensure at least one risk warning if buying
  if (signal.includes('BUY') && !reasoning.some(r => r.includes('WARNING'))) {
    reasoning.push("WARNING: Market conditions can change rapidly. Always respect stop loss.");
  }
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
