"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Brain, ChevronRight, CheckCircle, XCircle, AlertCircle,
  Trophy, ArrowLeft, Loader2, BookOpen, Star, TrendingUp
} from "lucide-react";
import { LEVEL_INFO, LESSONS } from "@/lib/curriculum";
import { getProgress, completeLesson } from "@/lib/progress";
import BottomNav from "@/components/BottomNav";
import { CEFRLevel } from "@/types";

// ── Types ─────────────────────────────────────────────────
interface ExamQuestion {
  id: string;
  type: "multiple_choice" | "fill_blank" | "comprehension" | "open";
  question: string;
  options?: string[];
  hint?: string;
  guidance?: string;
  correct: string;
}

interface ExamSection {
  id: string;
  title: string;
  passage?: string;
  questions: ExamQuestion[];
}

interface Exam {
  title: string;
  instructions: string;
  sections: ExamSection[];
}

interface GradeResult {
  id: string;
  score: number;
  verdict: "correct" | "partial" | "wrong";
  feedback: string;
}

interface Grading {
  results: GradeResult[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  summary: string;
  hebrewSummary: string;
  recommendation: "pass" | "practice_more";
  strongAreas: string[];
  weakAreas: string[];
}

type Stage = "intro" | "generating" | "taking" | "grading" | "results";

// ── Main Component ────────────────────────────────────────
export default function ExamPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("intro");
  const [level, setLevel] = useState<CEFRLevel>("A1");
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grading, setGrading] = useState<Grading | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = getProgress();
    setLevel(p.level);
  }, []);

  const levelInfo = LEVEL_INFO.find((l) => l.level === level)!;

  // Collect vocab & grammar from completed lessons for this level
  function getStudiedContent() {
    const p = getProgress();
    const completed = LESSONS.filter(
      (l) => l.level === level && p.completedLessons.includes(l.id)
    );
    const vocab = completed.flatMap((l) => l.vocabulary.map((w) => w.word));
    const grammar = completed.map((l) => l.grammar.title);
    // Also include known vocab IDs → words
    const knownWords = LESSONS.flatMap((l) => l.vocabulary)
      .filter((w) => p.vocabularyKnown.includes(w.id))
      .map((w) => w.word)
      .slice(0, 30);
    return {
      vocab: [...new Set([...vocab, ...knownWords])],
      grammar,
      completedCount: completed.length,
    };
  }

  async function generateExam() {
    setStage("generating");
    setError(null);
    const { vocab, grammar } = getStudiedContent();
    try {
      const res = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate",
          level,
          completedVocab: vocab,
          completedGrammar: grammar,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate exam");
      setExam(data.exam);
      setAnswers({});
      setCurrentSection(0);
      setStage("taking");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate exam");
      setStage("intro");
    }
  }

  async function submitExam() {
    if (!exam) return;
    setStage("grading");
    setError(null);
    try {
      const res = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "grade", level, answers, exam }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to grade exam");
      setGrading(data.grading);
      setStage("results");
      // Award XP for taking the exam
      const p = getProgress();
      if (data.grading.recommendation === "pass" && !p.completedLessons.includes(`exam-${level}`)) {
        completeLesson(`exam-${level}`, 50);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to grade exam");
      setStage("taking");
    }
  }

  const allQuestions = exam?.sections.flatMap((s) => s.questions) ?? [];
  const answeredCount = allQuestions.filter((q) => answers[q.id]?.trim()).length;
  const totalQuestions = allQuestions.length;

  if (stage === "generating" || stage === "grading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24">
        <div className="text-center space-y-4 px-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Brain size={36} className="text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {stage === "generating" ? "Creating your exam..." : "Grading your answers..."}
          </h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            {stage === "generating"
              ? "Our AI teacher is building a personalised exam based on your progress"
              : "Claude is reviewing each answer and preparing detailed feedback"}
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stage === "intro") {
    const { completedCount } = getStudiedContent();
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-5 pt-12 pb-10">
          <div className="max-w-lg mx-auto">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-white/70 hover:text-white mb-4 text-sm">
              <ArrowLeft size={16} /> Back
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Brain size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Level Exam</h1>
                <p className="text-indigo-200 text-sm">Just like a real teacher</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-5 -mt-4 space-y-4 animate-slideUp">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Level selector */}
          <div className="card">
            <p className="text-sm font-semibold text-gray-700 mb-3">Choose level to test:</p>
            <div className="grid grid-cols-3 gap-2">
              {LEVEL_INFO.map((l) => (
                <button
                  key={l.level}
                  onClick={() => setLevel(l.level)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                    level === l.level
                      ? `${l.bgColor} ${l.color} ${l.borderColor} shadow-sm`
                      : "bg-gray-50 text-gray-500 border-transparent hover:border-gray-200"
                  }`}
                >
                  {l.level}
                </button>
              ))}
            </div>
            <div className={`mt-3 p-3 rounded-xl ${levelInfo.bgColor} border ${levelInfo.borderColor}`}>
              <p className={`text-sm font-semibold ${levelInfo.color}`}>{levelInfo.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{levelInfo.description}</p>
              <p className="text-xs text-gray-400 mt-1">{completedCount} lessons completed at this level</p>
            </div>
          </div>

          {/* What to expect */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-primary-600" /> What&apos;s in the exam?
            </h3>
            <div className="space-y-2.5">
              {[
                { icon: "✏️", title: "Grammar", desc: "4 multiple-choice questions on grammar you've studied" },
                { icon: "📝", title: "Vocabulary", desc: "4 fill-in-the-blank using words from your lessons" },
                { icon: "📖", title: "Reading", desc: "Short passage + 3 comprehension questions" },
                { icon: "✍️", title: "Writing", desc: "1 open question – write in your own words" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-blue-50 border border-blue-100">
            <p className="text-sm text-blue-800">
              <span className="font-bold">🤖 AI Grading:</span> Claude will grade each answer – including your writing – and give you personalised feedback in Hebrew and English.
            </p>
          </div>

          <button
            onClick={generateExam}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
          >
            <Brain size={20} /> Start the Exam
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (stage === "taking" && exam) {
    const section = exam.sections[currentSection];
    const isLastSection = currentSection === exam.sections.length - 1;
    const sectionAnswered = section.questions.every((q) => answers[q.id]?.trim());

    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 sticky top-0 z-10">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-bold text-gray-900 text-lg">{exam.title}</h1>
              <span className="text-sm text-gray-500">{answeredCount}/{totalQuestions} answered</span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
              />
            </div>
            {/* Section tabs */}
            <div className="flex gap-1.5 mt-3 overflow-x-auto">
              {exam.sections.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSection(i)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    i === currentSection
                      ? "bg-indigo-600 text-white"
                      : s.questions.every((q) => answers[q.id]?.trim())
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {s.questions.every((q) => answers[q.id]?.trim()) && i !== currentSection ? "✓ " : ""}{s.title.split("–")[1]?.trim() || s.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-5 space-y-5 animate-fadeIn">
          <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>

          {/* Passage for reading section */}
          {section.passage && (
            <div className="card bg-blue-50 border border-blue-100">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Read this passage:</p>
              <p className="text-gray-800 text-sm leading-relaxed">{section.passage}</p>
            </div>
          )}

          {/* Questions */}
          {section.questions.map((q, qIdx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={qIdx + 1}
              answer={answers[q.id] ?? ""}
              onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
            />
          ))}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            {currentSection > 0 && (
              <button
                onClick={() => setCurrentSection((i) => i - 1)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
              >
                ← Previous
              </button>
            )}
            {!isLastSection ? (
              <button
                onClick={() => setCurrentSection((i) => i + 1)}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  sectionAnswered
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-100 text-gray-400 cursor-default"
                }`}
                disabled={!sectionAnswered}
              >
                Next Part <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={submitExam}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  answeredCount === totalQuestions
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-default"
                }`}
                disabled={answeredCount !== totalQuestions}
              >
                <CheckCircle size={16} />
                Submit Exam ({answeredCount}/{totalQuestions})
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (stage === "results" && grading && exam) {
    const passed = grading.recommendation === "pass";
    const gradeColor =
      grading.grade === "A" ? "text-green-600" :
      grading.grade === "B" ? "text-blue-600" :
      grading.grade === "C" ? "text-yellow-600" :
      grading.grade === "D" ? "text-orange-600" : "text-red-600";

    const resultMap: Record<string, GradeResult> = {};
    grading.results.forEach((r) => { resultMap[r.id] = r; });

    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Score header */}
        <div className={`px-5 pt-12 pb-8 ${passed ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-orange-400 to-rose-500"}`}>
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              {passed ? <Trophy size={36} className="text-white" /> : <TrendingUp size={36} className="text-white" />}
            </div>
            <div className="text-5xl font-black text-white mb-1">{grading.percentage}%</div>
            <div className={`text-2xl font-bold text-white/90 mb-2`}>Grade: {grading.grade}</div>
            <div className="text-white/80 text-sm">{grading.totalScore} / {grading.maxScore} points</div>
            <div className={`mt-3 inline-block px-4 py-1.5 rounded-full text-sm font-bold ${passed ? "bg-white text-green-700" : "bg-white text-orange-700"}`}>
              {passed ? "✅ Level Passed!" : "📚 Keep Practising"}
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-5 -mt-4 space-y-4 animate-slideUp">
          {/* Summary */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Star size={16} className="text-yellow-500" /> Feedback
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{grading.summary}</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed text-right" dir="rtl">{grading.hebrewSummary}</p>
            </div>
          </div>

          {/* Strong / Weak areas */}
          {(grading.strongAreas.length > 0 || grading.weakAreas.length > 0) && (
            <div className="grid grid-cols-2 gap-3">
              {grading.strongAreas.length > 0 && (
                <div className="card bg-green-50 border border-green-100">
                  <p className="text-xs font-bold text-green-700 mb-2">💪 Strengths</p>
                  {grading.strongAreas.map((a, i) => (
                    <p key={i} className="text-xs text-green-800">• {a}</p>
                  ))}
                </div>
              )}
              {grading.weakAreas.length > 0 && (
                <div className="card bg-orange-50 border border-orange-100">
                  <p className="text-xs font-bold text-orange-700 mb-2">📌 Work on</p>
                  {grading.weakAreas.map((a, i) => (
                    <p key={i} className="text-xs text-orange-800">• {a}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Detailed results per section */}
          {exam.sections.map((section) => (
            <div key={section.id} className="card">
              <h4 className="font-bold text-gray-900 mb-3">{section.title}</h4>
              <div className="space-y-3">
                {section.questions.map((q, qi) => {
                  const res = resultMap[q.id];
                  if (!res) return null;
                  return (
                    <div key={q.id} className={`rounded-xl p-3 border ${
                      res.verdict === "correct" ? "bg-green-50 border-green-200" :
                      res.verdict === "partial" ? "bg-yellow-50 border-yellow-200" :
                      "bg-red-50 border-red-200"
                    }`}>
                      <div className="flex items-start gap-2">
                        {res.verdict === "correct" ? <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" /> :
                         res.verdict === "partial" ? <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" /> :
                         <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 mb-0.5">Q{qi + 1}: {q.question.slice(0, 80)}{q.question.length > 80 ? "…" : ""}</p>
                          <p className="text-xs text-gray-500 italic mb-1">Your answer: &ldquo;{answers[q.id] || "(no answer)"}&rdquo;</p>
                          <p className="text-xs text-gray-700">{res.feedback}</p>
                          {res.verdict !== "correct" && (
                            <p className="text-xs text-gray-500 mt-0.5">✓ Expected: <em>{q.correct}</em></p>
                          )}
                        </div>
                        <span className={`text-xs font-bold flex-shrink-0 ${
                          res.verdict === "correct" ? "text-green-600" :
                          res.verdict === "partial" ? "text-yellow-600" : "text-red-500"
                        }`}>{res.score}/{2}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="space-y-3 pb-6">
            <button
              onClick={generateExam}
              className="w-full border-2 border-indigo-200 text-indigo-700 font-bold py-3.5 rounded-2xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
            >
              <Brain size={18} /> Retake Exam
            </button>
            <button
              onClick={() => router.push("/lessons")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <BookOpen size={18} /> Back to Lessons
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return null;
}

// ── Single Question Card ──────────────────────────────────
function QuestionCard({
  question,
  index,
  answer,
  onChange,
}: {
  question: ExamQuestion;
  index: number;
  answer: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="card">
      <p className="text-sm font-bold text-gray-800 mb-3">
        <span className="text-indigo-600 mr-1">Q{index}.</span> {question.question}
      </p>

      {/* Multiple choice */}
      {question.type === "multiple_choice" && question.options && (
        <div className="space-y-2">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onChange(opt)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                answer === opt
                  ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                  : "border-gray-100 hover:border-indigo-200 text-gray-700"
              }`}
            >
              <span className="font-bold text-indigo-400 mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Fill blank */}
      {question.type === "fill_blank" && (
        <div>
          {question.hint && (
            <p className="text-xs text-gray-400 mb-2 italic">Hint: {question.hint}</p>
          )}
          <input
            type="text"
            value={answer}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer..."
            className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
          />
        </div>
      )}

      {/* Comprehension / Open */}
      {(question.type === "comprehension" || question.type === "open") && (
        <div>
          {question.guidance && (
            <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mb-2">{question.guidance}</p>
          )}
          <textarea
            value={answer}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.type === "open" ? "Write your answer here..." : "Answer in 1-2 sentences..."}
            rows={question.type === "open" ? 4 : 3}
            className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all resize-none"
          />
          <p className="text-right text-xs text-gray-400 mt-1">{answer.length} chars</p>
        </div>
      )}
    </div>
  );
}
