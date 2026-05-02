import Groq from 'groq-sdk';

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    console.warn('GROQ_API_KEY not set in .env.local');
    return null;
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

export async function analyzeStockWithNews(
  ticker: string,
  companyName: string,
  technicalSummary: string
): Promise<string> {
  const groq = getGroqClient();
  if (!groq) return 'Add GROQ_API_KEY to .env.local to enable AI analysis.';

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000,
      messages: [
        {
          role: 'system',
          content: `You are a senior Indian equity research analyst at a top Mumbai brokerage 
          with 15 years experience. You give HONEST analysis — you are not a bull or bear, 
          you follow the data. You have covered NSE/BSE markets through multiple cycles.
          
          Your analysis style:
          - You call out overvalued stocks even if popular
          - You identify hidden risks others miss
          - You distinguish between different stock types
          - You always mention position sizing and risk
          - You never say BUY just to sound positive
          - You compare current levels to historical ranges
          - You mention FII/DII activity patterns for large caps
          - You factor in sector tailwinds/headwinds`
        },
        {
          role: 'user',
          content: `Analyze ${companyName} (${ticker}) for Indian retail investors.

          Technical data: ${technicalSummary}

          Provide HONEST analysis covering:

          1. STOCK CHARACTER: What type of stock is this? 
             (momentum/dividend/defensive/cyclical/news-driven/turnaround)
             What drives this stock — earnings, news, FII flows, sector cycle?

          2. CURRENT TECHNICAL PICTURE: 
             Describe what the charts are actually saying — bullish, bearish or mixed?
             Are there any warning signs even if trend looks up?
             
          3. KEY CATALYSTS (only real ones):
             What specific upcoming events could move this stock?
             Earnings date, sector policy, global factors?
             
          4. REAL RISKS (be specific):
             - What could go wrong with this trade?
             - Is the stock overextended or near resistance?
             - Any fundamental concerns for this company?
             
          5. TIMEFRAME OUTLOOK:
             SHORT (1-4 weeks): Specific price range expected
             MEDIUM (1-3 months): Key level to watch
             LONG (6-12 months): Only if fundamentals support
             
          6. HONEST RECOMMENDATION:
             Give a clear call with specific entry zone, not just "looks good"
             If mixed signals — say WAIT/AVOID clearly
             Mention ideal position size (small/medium/full) based on conviction
             
             Format: CALL: [BUY/SELL/HOLD/AVOID] | ENTRY: ₹xxx-xxx | 
             TARGET: ₹xxx | SL: ₹xxx | CONVICTION: [LOW/MEDIUM/HIGH] | 
             POSITION: [25%/50%/FULL]`
        }
      ]
    });
    return response.choices[0]?.message?.content ?? 'Analysis unavailable.';
  } catch (err) {
    console.error('Groq analysis error:', err);
    return 'AI analysis temporarily unavailable. Technical signals still active.';
  }
}

export async function getMarketSentiment(): Promise<{ sentiment: string; reasoning: string }> {
  const groq = getGroqClient();
  if (!groq) return { sentiment: 'NEUTRAL', reasoning: 'Add GROQ_API_KEY to enable market sentiment.' };

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: 'You are an Indian stock market expert. Respond only in valid JSON.'
        },
        {
          role: 'user',
          content: `Based on your knowledge of Indian markets (NSE/BSE), current global macro trends, 
          FII/DII activity patterns, and Nifty50/Sensex behavior, what is the current overall 
          market sentiment?
          
          Respond in this exact JSON format only, no other text:
          {
            "sentiment": "BULLISH" or "BEARISH" or "NEUTRAL",
            "reasoning": "One sentence explanation under 20 words"
          }`
        }
      ]
    });

    const text = response.choices[0]?.message?.content ?? '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return {
      sentiment: parsed.sentiment ?? 'NEUTRAL',
      reasoning: parsed.reasoning ?? 'Market analysis unavailable.'
    };
  } catch (err) {
    console.error('Groq sentiment error:', err);
    return { sentiment: 'NEUTRAL', reasoning: 'Sentiment analysis temporarily unavailable.' };
  }
}

export async function analyzeNewsForStock(
  ticker: string,
  companyName: string
): Promise<{ headline: string; sentiment: string; source: string }[]> {
  const groq = getGroqClient();
  if (!groq) return [];

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: 'You are an Indian financial news analyst. Respond only in valid JSON array format.'
        },
        {
          role: 'user',
          content: `Generate 4 realistic recent news headlines for ${companyName} (${ticker}) 
          based on your knowledge of this Indian company.
          
          Respond in this exact JSON array format only, no other text:
          [
            { "headline": "headline text", "sentiment": "POSITIVE", "source": "Economic Times" },
            { "headline": "headline text", "sentiment": "NEGATIVE", "source": "Moneycontrol" },
            { "headline": "headline text", "sentiment": "NEUTRAL", "source": "Business Standard" },
            { "headline": "headline text", "sentiment": "POSITIVE", "source": "NDTV Profit" }
          ]
          
          Use only these sources: Economic Times, Moneycontrol, Business Standard, NDTV Profit, Mint.
          Sentiment must be exactly POSITIVE, NEGATIVE, or NEUTRAL.`
        }
      ]
    });

    const text = response.choices[0]?.message?.content ?? '[]';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Groq news error:', err);
    return [];
  }
}
