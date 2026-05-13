import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const { allowed } = checkRateLimit(`exam:${ip}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { level, completedVocab, completedGrammar, mode } = body;

    if (!level || !["A1","A2","B1","B2","C1","C2"].includes(level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    const vocabList = (completedVocab as string[]).slice(0, 40).join(", ");
    const grammarList = (completedGrammar as string[]).slice(0, 12).join("; ");

    if (mode === "generate") {
      // ── Generate exam questions ──────────────────────────────
      const prompt = `You are an experienced English teacher creating a level ${level} exam for a Hebrew-speaking student.

The student has studied these vocabulary words: ${vocabList || "basic vocabulary"}
They have covered these grammar topics: ${grammarList || "basic grammar"}

Create a JSON exam object with EXACTLY this structure. Return ONLY valid JSON, no markdown, no extra text:

{
  "title": "Level ${level} English Exam",
  "instructions": "Short encouraging sentence in Hebrew",
  "sections": [
    {
      "id": "grammar",
      "title": "Part 1 – Grammar",
      "questions": [
        {
          "id": "g1",
          "type": "multiple_choice",
          "question": "question text",
          "options": ["A", "B", "C", "D"],
          "correct": "correct option text"
        }
      ]
    },
    {
      "id": "vocabulary",
      "title": "Part 2 – Vocabulary",
      "questions": [
        {
          "id": "v1",
          "type": "fill_blank",
          "question": "Sentence with ___ where the word goes",
          "hint": "Hebrew translation hint",
          "correct": "the missing word"
        }
      ]
    },
    {
      "id": "reading",
      "title": "Part 3 – Reading",
      "passage": "A short ${level}-level paragraph (4-6 sentences) on an interesting topic",
      "questions": [
        {
          "id": "r1",
          "type": "comprehension",
          "question": "Question about the passage",
          "correct": "expected answer"
        }
      ]
    },
    {
      "id": "writing",
      "title": "Part 4 – Writing",
      "questions": [
        {
          "id": "w1",
          "type": "open",
          "question": "Write 2-3 sentences about [relevant topic for ${level}]",
          "guidance": "what to include / grammar structure to use",
          "correct": "example model answer"
        }
      ]
    }
  ]
}

Rules:
- Grammar section: 4 multiple_choice questions testing grammar points from ${level}
- Vocabulary section: 4 fill_blank questions using words the student has studied (from: ${vocabList || "common words"})
- Reading section: 1 passage + 3 comprehension questions (answer in 1-2 sentences each)
- Writing section: 1 open question (student writes freely)
- All questions must be appropriate for CEFR level ${level}
- Make it feel like a real school exam, not too easy
- The passage in reading should be original and engaging`;

      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2500,
        messages: [{ role: "user", content: prompt }],
      });

      const text = (response.content[0] as { type: string; text: string }).text.trim();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json({ error: "Failed to generate exam" }, { status: 500 });
      }

      const exam = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ exam });

    } else if (mode === "grade") {
      // ── Grade student answers ────────────────────────────────
      const { answers, exam } = body;

      if (!answers || !exam) {
        return NextResponse.json({ error: "Missing answers or exam" }, { status: 400 });
      }

      const answerSummary = Object.entries(answers as Record<string, string>)
        .map(([id, answer]) => `Question ${id}: "${answer}"`)
        .join("\n");

      const questionSummary = (exam.sections as Array<{ id: string; questions?: Array<{ id: string; question: string; correct: string; type: string }>; passage?: string }>)
        .flatMap((s) =>
          (s.questions || []).map((q) => ({
            id: q.id,
            question: q.question,
            correct: q.correct,
            type: q.type,
            passage: s.id === "reading" ? s.passage : undefined,
          }))
        )
        .map((q) => `ID: ${q.id} | Type: ${q.type} | Q: ${q.question} | Expected: ${q.correct}`)
        .join("\n");

      const gradingPrompt = `You are a supportive English teacher grading a Level ${level} exam for a Hebrew-speaking student.

EXAM QUESTIONS AND EXPECTED ANSWERS:
${questionSummary}

STUDENT'S ANSWERS:
${answerSummary}

Grade each answer and return ONLY valid JSON with this structure:
{
  "results": [
    {
      "id": "question_id",
      "score": 0, 1, or 2,
      "verdict": "correct" | "partial" | "wrong",
      "feedback": "Brief feedback in English (1 sentence). For wrong/partial: explain the correct answer."
    }
  ],
  "totalScore": number (sum of all scores),
  "maxScore": number (2 × number of questions),
  "percentage": number (0-100),
  "grade": "A" | "B" | "C" | "D" | "F",
  "summary": "2-3 sentence personalised feedback in English. Mention specific strengths and weaknesses. End with encouragement.",
  "hebrewSummary": "Same summary translated to Hebrew",
  "recommendation": "pass" | "practice_more",
  "strongAreas": ["list of topics student did well"],
  "weakAreas": ["list of topics needing work"]
}

Scoring guide:
- multiple_choice / fill_blank / true_false: 2 = correct, 0 = wrong
- comprehension: 2 = correct & complete, 1 = partially correct/incomplete, 0 = wrong
- open (writing): 2 = good attempt with correct grammar for level, 1 = understandable but errors, 0 = too short or off-topic
- Be encouraging but honest. recommendation = "pass" if percentage >= 65.`;

      const gradeResponse = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: [{ role: "user", content: gradingPrompt }],
      });

      const gradeText = (gradeResponse.content[0] as { type: string; text: string }).text.trim();
      const gradeJsonMatch = gradeText.match(/\{[\s\S]*\}/);
      if (!gradeJsonMatch) {
        return NextResponse.json({ error: "Failed to grade exam" }, { status: 500 });
      }

      const grading = JSON.parse(gradeJsonMatch[0]);
      return NextResponse.json({ grading });

    } else {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

  } catch (err) {
    console.error("Exam error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
