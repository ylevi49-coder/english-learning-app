import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { checkRateLimit } from "@/lib/rateLimit";
import { createHmac, timingSafeEqual } from "crypto";

const client = new Anthropic();
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "englishup_verify";
const APP_SECRET   = process.env.WHATSAPP_APP_SECRET ?? "";

// WhatsApp webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// Verify Meta's X-Hub-Signature-256 header
function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!APP_SECRET || !signature) return !APP_SECRET; // skip if no secret configured
  try {
    const expected = "sha256=" + createHmac("sha256", APP_SECRET).update(rawBody).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody  = await req.text();
  const sig      = req.headers.get("x-hub-signature-256");

  if (!verifySignature(rawBody, sig)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = JSON.parse(rawBody); }
  catch { return NextResponse.json({ status: "ok" }); }

  try {
    const entry   = (body?.entry as Record<string, unknown>[])?.[0];
    const changes = (entry?.changes as Record<string, unknown>[])?.[0];
    const value   = changes?.value as Record<string, unknown>;
    const message = (value?.messages as Record<string, unknown>[])?.[0];

    if (!message) return NextResponse.json({ status: "ok" });

    const from = message.from as string;
    const text = ((message?.text as Record<string, unknown>)?.body as string) ?? "";

    // Rate limit per WhatsApp number: 10 messages/minute
    const { allowed } = checkRateLimit(`wa:${from}`, 10, 60_000);
    if (!allowed) {
      await sendWhatsAppMessage(from, "⏳ You're sending messages too fast. Please wait a moment.");
      return NextResponse.json({ status: "ok" });
    }

    const reply = await generateWhatsAppReply(text);
    await sendWhatsAppMessage(from, reply);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

async function generateWhatsAppReply(userMessage: string): Promise<string> {
  const lower = userMessage.toLowerCase().trim();

  if (lower === "word" || lower === "word of the day" || lower === "מילה") {
    const words = [
      { word: "Resilient",    translation: "עמיד/חסין",      example: "She is very resilient – nothing stops her!" },
      { word: "Grateful",     translation: "אסיר תודה",      example: "I'm grateful for your help." },
      { word: "Opportunity",  translation: "הזדמנות",        example: "This is a great opportunity to learn." },
      { word: "Confident",    translation: "בטוח בעצמו",     example: "Speak with confidence!" },
      { word: "Achieve",      translation: "להשיג/להצליח",   example: "You can achieve anything you set your mind to." },
    ];
    const w = words[Math.floor(Math.random() * words.length)];
    return `📚 *Word of the Day*\n\n*${w.word}* = ${w.translation}\n\n_"${w.example}"_\n\nSend *quiz* for a quick question or *help* for all commands.`;
  }

  if (lower === "quiz" || lower === "חידון") {
    const quizzes = [
      { q: "Fill in the blank: She ___ to work every day. (go)", a: "goes", tip: "He/She/It → add -s/-es to the verb!" },
      { q: "Which is correct?\na) I doesn't like coffee\nb) I don't like coffee", a: "b) I don't like coffee", tip: "With 'I', we use DON'T, not doesn't." },
      { q: "Translate to English: 'ראיתי סרט אתמול'", a: "I saw a film yesterday", tip: "'see' is irregular: see → saw" },
    ];
    const q = quizzes[Math.floor(Math.random() * quizzes.length)];
    return `🎯 *Quick Quiz!*\n\n${q.q}\n\nSend your answer and I'll check it!\n\n_(Answer: ${q.a} — ${q.tip})_`;
  }

  if (lower === "tip" || lower === "טיפ") {
    const tips = [
      "💡 *Grammar Tip*\nWith He/She/It, always add -s to the verb!\n✅ She WORKS | He LIKES | It COSTS",
      "💡 *Vocabulary Tip*\nLearn words in context, not in isolation!\nInstead of just 'angry', learn: 'I'm angry ABOUT the traffic'.",
      "💡 *Study Tip*\n15 minutes every day beats 2 hours once a week. Consistency is everything!",
      "💡 *Pronunciation Tip*\nThe 'th' sound doesn't exist in Hebrew. Put your tongue between your teeth and blow air!",
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  if (lower === "help" || lower === "עזרה") {
    return `🇬🇧 *EnglishUp Bot*\n\n📚 *word* – Word of the Day\n🎯 *quiz* – Quick grammar quiz\n💡 *tip* – Study tip\n\nOr write anything in English and I'll correct it!`;
  }

  // Input length guard
  if (userMessage.length > 500) {
    return "✏️ Please keep your message under 500 characters so I can give better feedback!";
  }

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: "You are a WhatsApp English tutor. Give very brief, friendly feedback in 2-3 sentences max. Use simple language. Add 1 emoji. The user is a Hebrew speaker learning English.",
      messages: [{ role: "user", content: `Check my English: "${userMessage}"` }],
    });
    return (msg.content[0] as { type: string; text: string }).text;
  } catch {
    return "✅ Got your message! Send *help* to see available commands.";
  }
}
