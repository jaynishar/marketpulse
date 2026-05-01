import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const APP_PASSWORD = process.env.APP_PASSWORD;

    if (!APP_PASSWORD) {
      console.error("APP_PASSWORD not set in environment");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    if (password === APP_PASSWORD) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
