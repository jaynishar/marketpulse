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
          content: `You are an expert Indian stock market analyst specializing in NSE and BSE equities. 
          Provide structured, accurate analysis based on technical data and your knowledge of the company.
          Always respond in this exact format with these section headers:
          NEWS SENTIMENT | KEY CATALYSTS | RISK FACTORS | SHORT TERM OUTLOOK | MEDIUM TERM OUTLOOK | LONG TERM OUTLOOK | RECOMMENDATION`
        },
        {
          role: 'user',
          content: `Analyze ${companyName} (${ticker}) listed on NSE/BSE India.
          
          Technical Summary: ${technicalSummary}
          
          Provide:
          1. NEWS SENTIMENT: Current market sentiment and recent news impact
          2. KEY CATALYSTS: Top 3 bullish factors driving the stock
          3. RISK FACTORS: Top 3 risks to watch
          4. SHORT TERM OUTLOOK (1-4 weeks): Price direction and key levels
          5. MEDIUM TERM OUTLOOK (1-3 months): Trend and targets
          6. LONG TERM OUTLOOK (6-12 months): Fundamental view
          7. RECOMMENDATION: Final call with confidence percentage
          
          Base analysis on fundamental business knowledge of this Indian company and the technical data provided.`
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
