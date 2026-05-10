import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: `You are a friendly and encouraging English teacher.
The user is an adult Hebrew speaker learning English.
When given a sentence or paragraph in English:
1. First correct any grammar, spelling, or vocabulary mistakes.
2. Explain each correction briefly and simply (in English, but keep it very easy to understand).
3. Give one tip to remember the rule.
4. End with encouragement.
Be concise – keep your response under 150 words.`,
      messages: [
        {
          role: "user",
          content: `Please check my English and give me feedback:\n\n"${text}"`,
        },
      ],
    });

    const feedback = (message.content[0] as { type: string; text: string }).text;
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("AI feedback error:", error);
    return NextResponse.json({ error: "Failed to get feedback" }, { status: 500 });
  }
}
