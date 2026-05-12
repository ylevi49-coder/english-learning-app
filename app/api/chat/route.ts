import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  // Rate limit: 30 requests per minute per IP
  const ip = getClientIP(req);
  const { allowed } = checkRateLimit(`chat:${ip}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { messages, scenario, level } = body;

    // Input validation
    if (!Array.isArray(messages) || messages.length > 50) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }
    for (const m of messages) {
      if (typeof m.content !== "string" || m.content.length > 2000) {
        return NextResponse.json({ error: "Message too long" }, { status: 400 });
      }
    }

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

    const safeScenario = scenarioPrompts[scenario] ?? scenarioPrompts.free;
    const safeLevel    = levelGuide[level]          ?? levelGuide.B1;

    const systemPrompt = `You are Emma, a warm and encouraging English teacher and conversation partner.

Current scenario: ${safeScenario}
Student level: ${safeLevel}

ALWAYS respond in EXACTLY this format — two sections, nothing else:

💬 **Emma:** [Your reply. 2-3 sentences. End with a question.]

📝 **Corrections:**
[If NO mistakes: write exactly: ✓ Perfect!]
[If mistakes exist: each on its own line like this:]
❌ "wrong phrase" → ✅ "correct phrase" · reason

IMPORTANT RULES FOR CORRECTIONS:
- Use straight ASCII double quotes " around both phrases. No curly quotes.
- Always include the · symbol before the reason.
- Correct grammar errors, wrong verb tense, wrong word order, missing articles.
- Put the KEY fixed word in CAPS inside the correction.
- Maximum 3 corrections.
- Even small mistakes must be corrected — do not skip errors.

Example correction line:
❌ "I go yesterday" → ✅ "I WENT yesterday" · past tense needs 'went'`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
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
