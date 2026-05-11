import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { messages, scenario, level } = await req.json();

    const scenarioPrompts: Record<string, string> = {
      free:     "Have a friendly, natural conversation on any topic.",
      coffee:   "You are sitting together at a coffee shop. Talk about daily life, hobbies, and light topics.",
      work:     "You are in a professional setting. Discuss work, careers, and professional topics.",
      travel:   "You are planning a trip or talking about travel experiences and destinations.",
      shopping: "You are at a store or market. Help the student practice shopping phrases and vocabulary.",
    };

    const levelGuide: Record<string, string> = {
      A1: "Use ONLY very simple words and short sentences.",
      A2: "Use simple, common vocabulary about daily routines, family, likes/dislikes.",
      B1: "Use intermediate vocabulary. Discuss past events, future plans, opinions.",
      B2: "Use varied vocabulary. Discuss complex topics, current events, abstract ideas.",
      C1: "Use advanced, nuanced language with precision.",
      C2: "Speak naturally as a native. Use idioms, humor, and complex structures freely.",
    };

    const systemPrompt = `You are Emma, a warm and encouraging English teacher and conversation partner.

Current scenario: ${scenarioPrompts[scenario] ?? scenarioPrompts.free}
Student level: ${levelGuide[level] ?? levelGuide.B1}

ALWAYS respond in EXACTLY this format (two sections separated by a blank line):

💬 **Emma:** [Your natural, friendly reply. 2-3 sentences max. End with a question to keep the conversation going.]

📝 **Corrections:**
[If the student made NO mistakes: write only "✓ Perfect!"]
[If there were mistakes: list each one on its own line in EXACTLY this format:
❌ "[exact wrong phrase]" → ✅ "[corrected phrase]" · [one short reason why]]

Rules:
- Be warm and encouraging. Never embarrass the student.
- Correct grammar, wrong verb tense, wrong word choice, and missing articles.
- Highlight the KEY changed word by putting it in CAPS in the correction.
- Maximum 3 corrections per message.
- Match language complexity to the student level.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
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
