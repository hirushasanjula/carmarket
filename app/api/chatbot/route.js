import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(request) {
  try {
    const { message, userId } = await request.json();

    // Enhanced prompt with specific context
    const prompt = `
      You are a knowledgeable assistant for CarMarket, a website where users buy, sell, and trade cars.
      Your role is to help users navigate the site, answer car-related questions, and assist with features like:
      - Listing a car for sale (direct them to /sell).
      - Messaging sellers (explain the Messages page).
      - Signing in or up (guide to /sign-in).
      - Viewing car listings (suggest /listings).
      If the user’s question is unclear or unrelated, ask for clarification politely.
      User message: "${message}"
      Provide a concise, friendly, and accurate response relevant to CarMarket.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let reply = result.response.text().trim();

    // Optional: Post-process to ensure relevance
    if (!reply.toLowerCase().includes("carmarket") && !reply.match(/sell|buy|message|listing|sign/i)) {
      reply = "I’m here to help with CarMarket! Could you clarify your question about buying, selling, or messaging about cars?";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json({ reply: "Sorry, I couldn’t process that. How can I assist with CarMarket?" }, { status: 500 });
  }
}