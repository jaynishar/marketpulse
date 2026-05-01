import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

export const geminiSearchModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  // Note: Search grounding is often enabled via specific tools/parameters in the request
});
