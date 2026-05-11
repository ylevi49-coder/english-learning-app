import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { messages, scenario, level } = await req.json();

    const scenarioPrompts: Record<string, string> = {
      free: "Have a friendly, natural conversation on any topic.",
      coffee: "You are sitting together at a coffee shop. Talk about daily life, hobbies, and light topics.",
      work: "You are in a professional setting. Discuss work, careers, and professional topics.",
      travel: "You are planning a trip or talking about travel experiences and destinations.",
      shopping: "You are at a store or market. Help the student practice shopping phrases and vocabulary.",
    };

    const levelGuide: Record<string, string> = {
      A1: "Use ONLY very simple words. Short sentences. Greet, ask name, age, where they are from.",
      A2: "Use simple, common vocabulary. Talk about daily routines, family, likes/dislikes.",
      B1: "Use intermediate vocabulary. Discuss past events, future plans, opinions on everyday topics.",
      B2: "Use varied vocabulary. Discuss complex topics, current events, abstract ideas.",
      C1: "Use advanced, nuanced language. Discuss sophisticated topics with precision.",
      C2: "Speak naturally as a native speaker would. Use idioms, humor, and complex structures freely.",
    };

    const systemPrompt = `You are Emma, a warm and encouraging English teacher and conversation partner.

Your goal: Have a NATURAL conversation in English while subtly helping the student improve.

Current scenario: ${scenarioPrompts[scenario] ?? scenarioPrompts.free}
Student level: ${levelGuide[level] ?? levelGuide.B1}

Rules:
1. ALWAYS respond in two clearly separated parts:

💬 **Emma:** [Your natural conversational reply here. Keep it friendly, genuine, and engaging. Ask a follow-up question to keep the conversation going.]

📝 **Corrections:** [ONLY if the student made grammar or vocabulary mistakes, list them briefly. Format: "You said: '...' → Better: '...' (short explanation)". If their English was perfect, write "✓ Perfect English!" instead.]

2. Match your language complexity to the student's level.
3. Be encouraging and warm – never make the student feel bad about mistakes.
4. Keep replies concise (2-4 sentences for Emma's part).
5. Always end Emma's reply with a question to keep the conversation going.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const reply = (response.content[0] as { type: string; text: string }).text;
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}
