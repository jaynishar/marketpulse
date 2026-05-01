import { OHLCVBar, TechnicalIndicators } from "@/types";

/**
 * Technical Analysis Library for MarketPulse
 * Implements standard financial formulas for stock indicators.
 */

export function calculateEMA(closes: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  
  if (closes.length === 0) return [];
  
  // First EMA is often initialized as SMA
  let sum = 0;
  for (let i = 0; i < Math.min(period, closes.length); i++) {
    sum += closes[i];
  }
  let prevEma = sum / Math.min(period, closes.length);
  ema[Math.min(period, closes.length) - 1] = prevEma;

  for (let i = period; i < closes.length; i++) {
    const currentEma = (closes[i] - prevEma) * k + prevEma;
    ema[i] = currentEma;
    prevEma = currentEma;
  }
  
  return ema;
}

export function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length <= period) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    let currentGain = 0;
    let currentLoss = 0;
    
    if (diff >= 0) currentGain = diff;
    else currentLoss = -diff;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

export function calculateMACD(closes: number[]): { macd: number, signal: number, histogram: number } {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  
  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (ema12[i] !== undefined && ema26[i] !== undefined) {
      macdLine.push(ema12[i] - ema26[i]);
    } else {
      macdLine.push(0);
    }
  }

  const signalLine = calculateEMA(macdLine, 9);
  const lastIdx = closes.length - 1;
  
  const macdVal = macdLine[lastIdx] || 0;
  const signalVal = signalLine[lastIdx] || 0;
  
  return {
    macd: macdVal,
    signal: signalVal,
    histogram: macdVal - signalVal
  };
}

export function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
  if (closes.length < 2) return 0;
  
  const tr: number[] = [highs[0] - lows[0]];
  for (let i = 1; i < closes.length; i++) {
    tr.push(Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    ));
  }

  // Wilder's Smoothing for ATR
  let atr = tr.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < tr.length; i++) {
    atr = (atr * (period - 1) + tr[i]) / period;
  }
  
  return atr;
}

export function calculateSupertrend(highs: number[], lows: number[], closes: number[], period: number = 10, multiplier: number = 3): { value: number, direction: 'UP' | 'DOWN' } {
  const atr = calculateATR(highs, lows, closes, period);
  const lastIdx = closes.length - 1;
  
  const hl2 = (highs[lastIdx] + lows[lastIdx]) / 2;
  const basicUpperBand = hl2 + multiplier * atr;
  const basicLowerBand = hl2 - multiplier * atr;

  // For a stateless calculation of the current Supertrend, we approximate based on the current close
  // In a full stream, we would track previous values
  const direction = closes[lastIdx] > basicUpperBand ? 'DOWN' : (closes[lastIdx] < basicLowerBand ? 'UP' : 'UP');
  const value = direction === 'UP' ? basicLowerBand : basicUpperBand;

  return { value, direction: direction === 'UP' ? 'UP' : 'DOWN' };
}

export function calculateBollingerBands(closes: number[], period: number = 20, stdDev: number = 2): { upper: number, middle: number, lower: number } {
  if (closes.length < period) return { upper: 0, middle: 0, lower: 0 };
  
  const lastPeriod = closes.slice(-period);
  const middle = lastPeriod.reduce((a, b) => a + b, 0) / period;
  
  const variance = lastPeriod.reduce((a, b) => a + Math.pow(b - middle, 2), 0) / period;
  const sd = Math.sqrt(variance);
  
  return {
    upper: middle + stdDev * sd,
    middle: middle,
    lower: middle - stdDev * sd
  };
}

export function calculateVWAP(highs: number[], lows: number[], closes: number[], volumes: number[]): number {
  let totalPV = 0;
  let totalV = 0;
  
  for (let i = 0; i < closes.length; i++) {
    const typicalPrice = (highs[i] + lows[i] + closes[i]) / 3;
    totalPV += typicalPrice * volumes[i];
    totalV += volumes[i];
  }
  
  return totalV === 0 ? 0 : totalPV / totalV;
}

export function calculateADX(highs: number[], lows: number[], closes: number[], period: number = 14): number {
  if (closes.length < period * 2) return 25;

  const plusDM: number[] = [];
  const minusDM: number[] = [];
  const tr: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const upMove = highs[i] - highs[i - 1];
    const downMove = lows[i - 1] - lows[i];
    
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
    tr.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
  }

  const smooth = (vals: number[], p: number) => {
    let s = vals.slice(0, p).reduce((a, b) => a + b, 0);
    const res = [s];
    for (let i = p; i < vals.length; i++) {
      s = s - (s / p) + vals[i];
      res.push(s);
    }
    return res;
  };

  const str = smooth(tr, period);
  const sPlusDM = smooth(plusDM, period);
  const sMinusDM = smooth(minusDM, period);

  const dx: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const plusDI = 100 * (sPlusDM[i] / str[i]);
    const minusDI = 100 * (sMinusDM[i] / str[i]);
    dx.push(100 * Math.abs(plusDI - minusDI) / (plusDI + minusDI));
  }

  return dx.slice(-period).reduce((a, b) => a + b, 0) / period;
}

export function calculateStochastic(highs: number[], lows: number[], closes: number[], kPeriod: number = 14, dPeriod: number = 3): { k: number, d: number } {
  const kValues: number[] = [];
  
  for (let i = kPeriod - 1; i < closes.length; i++) {
    const periodHigh = Math.max(...highs.slice(i - kPeriod + 1, i + 1));
    const periodLow = Math.min(...lows.slice(i - kPeriod + 1, i + 1));
    const k = ((closes[i] - periodLow) / (periodHigh - periodLow)) * 100;
    kValues.push(k);
  }
  
  const k = kValues[kValues.length - 1] || 50;
  const d = kValues.slice(-dPeriod).reduce((a, b) => a + b, 0) / dPeriod;
  
  return { k, d };
}

export function getAllIndicators(ohlcv: OHLCVBar[]): TechnicalIndicators {
  const highs = ohlcv.map(b => b.high);
  const lows = ohlcv.map(b => b.low);
  const closes = ohlcv.map(b => b.close);
  const volumes = ohlcv.map(b => b.volume);

  const macdData = calculateMACD(closes);
  const stData = calculateSupertrend(highs, lows, closes);
  const bbData = calculateBollingerBands(closes);
  const stochData = calculateStochastic(highs, lows, closes);

  return {
    rsi14: calculateRSI(closes),
    macd: macdData.macd,
    macdSignal: macdData.signal,
    macdHistogram: macdData.histogram,
    ema20: calculateEMA(closes, 20).slice(-1)[0] || 0,
    ema50: calculateEMA(closes, 50).slice(-1)[0] || 0,
    ema200: calculateEMA(closes, 200).slice(-1)[0] || 0,
    supertrend: stData.value,
    supertrendDirection: stData.direction,
    atr14: calculateATR(highs, lows, closes),
    bollingerUpper: bbData.upper,
    bollingerMiddle: bbData.middle,
    bollingerLower: bbData.lower,
    vwap: calculateVWAP(highs, lows, closes, volumes),
    adx: calculateADX(highs, lows, closes),
    stochasticK: stochData.k,
    stochasticD: stochData.d
  };
}
