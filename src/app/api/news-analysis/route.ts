import { NextResponse } from "next/server";
import { getMarketSentiment } from "@/lib/groq-client";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { sentiment, reasoning } = await getMarketSentiment();

    return NextResponse.json({
      sentiment,
      reasoning,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("News Analysis API Error:", error);
    return NextResponse.json({ error: "Failed to fetch market sentiment" }, { status: 500 });
  }
}
