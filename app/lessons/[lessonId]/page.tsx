"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, MessageSquare, ChevronRight, CheckCircle, Printer } from "lucide-react";
import { getLessonById } from "@/lib/curriculum";
import { completeLesson, markWordKnown, getProgress } from "@/lib/progress";
import LevelBadge from "@/components/LevelBadge";
import ExerciseView from "@/components/ExerciseView";
import { Button } from "@/components/ui/button";
import { Lesson, Exercise } from "@/types";

type Tab = "vocabulary" | "grammar" | "exercises" | "reading";

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [tab, setTab] = useState<Tab>("vocabulary");
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const l = getLessonById(lessonId);
    if (!l) { router.push("/lessons"); return; }
    setLesson(l);
    const p = getProgress();
    setKnownWords(p.vocabularyKnown);
    setCompleted(p.completedLessons.includes(lessonId));
  }, [lessonId, router]);

  if (!lesson) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "vocabulary", label: "Words" },
    { key: "grammar", label: "Grammar" },
    { key: "exercises", label: "Practice" },
    ...(lesson.readingText ? [{ key: "reading" as Tab, label: "Reading" }] : []),
  ];

  function handleMarkWord(wordId: string) {
    markWordKnown(wordId);
    setKnownWords((prev) => [...prev, wordId]);
  }

  function handleCompleteLesson() {
    completeLesson(lesson!.id, 20);
    setCompleted(true);
    setTimeout(() => router.push("/lessons"), 1200);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Hidden printable worksheet – shown only on print */}
      <WorksheetPrint lesson={lesson} />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 print-hide">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm">
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 border border-gray-200 rounded-xl px-3 py-1.5 hover:border-primary-300 transition-colors"
            >
              <Printer size={14} /> Worksheet
            </button>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <LevelBadge level={lesson.level} />
            {completed && <span className="text-xs text-green-600 font-semibold flex items-center gap-1"><CheckCircle size={12} /> Completed</span>}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{lesson.title}</h1>
          <p className="text-sm text-gray-500">{lesson.description}</p>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  tab === key ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 animate-fadeIn print-hide">
        {/* VOCABULARY */}
        {tab === "vocabulary" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-2">Tap a card to mark it as learned (+ 2 XP)</p>
            {lesson.vocabulary.map((word) => {
              const known = knownWords.includes(word.id);
              return (
                <button
                  key={word.id}
                  onClick={() => handleMarkWord(word.id)}
                  className={`w-full text-left card border-2 transition-all ${known ? "border-green-300 bg-green-50" : "border-transparent hover:border-primary-200"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-lg">{word.word}</span>
                        {known && <CheckCircle size={16} className="text-green-500" />}
                      </div>
                      <span className="text-primary-600 font-medium text-sm">{word.translation}</span>
                      <p className="text-gray-500 text-sm mt-1 italic">"{word.example}"</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* GRAMMAR */}
        {tab === "grammar" && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} className="text-primary-600" />
                <h2 className="font-bold text-gray-900">{lesson.grammar.title}</h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{lesson.grammar.explanation}</p>
              </div>

              <h3 className="font-semibold text-gray-700 text-sm mb-2">Examples:</h3>
              <div className="space-y-2">
                {lesson.grammar.examples.map((ex, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary-600 font-bold mt-0.5">→</span>
                    <span className="text-gray-800 italic">{ex}</span>
                  </div>
                ))}
              </div>

              {lesson.grammar.tip && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <p className="text-yellow-800 text-sm">
                    <span className="font-bold">💡 Tip: </span>{lesson.grammar.tip}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EXERCISES */}
        {tab === "exercises" && (
          <div>
            <ExerciseView
              exercises={lesson.exercises}
              onComplete={handleCompleteLesson}
            />
          </div>
        )}

        {/* READING */}
        {tab === "reading" && lesson.readingText && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={18} className="text-primary-600" />
                <h2 className="font-bold text-gray-900">Reading Passage</h2>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">{lesson.readingText}</p>
            </div>
            <Button onClick={() => setTab("exercises")} className="w-full">
              Go to Exercises <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Printable Worksheet ─────────────────────────────────
function WorksheetPrint({ lesson }: { lesson: Lesson }) {
  const answers = lesson.exercises.map((ex, i) => `${i + 1}. ${Array.isArray(ex.answer) ? ex.answer.join(", ") : ex.answer}`);

  return (
    <div className="print-worksheet" style={{ display: "none", padding: "24px", fontFamily: "Georgia, serif", color: "#000" }}>
      {/* Header */}
      <div className="ws-header">
        <h1 style={{ fontSize: 22, fontWeight: "bold", margin: "0 0 4px" }}>
          English Worksheet – {lesson.level}: {lesson.title}
        </h1>
        <p style={{ fontSize: 11, color: "#555", margin: 0 }}>
          {lesson.description} &nbsp;|&nbsp; Name: _________________________ &nbsp;|&nbsp; Date: _____________
        </p>
      </div>

      {/* Vocabulary */}
      <div className="ws-section">
        <div className="ws-section-title">Part 1 – Vocabulary</div>
        <table className="ws-vocab-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "5px 8px", background: "#eee", textAlign: "left" }}>#</th>
              <th style={{ border: "1px solid #ccc", padding: "5px 8px", background: "#eee", textAlign: "left" }}>English</th>
              <th style={{ border: "1px solid #ccc", padding: "5px 8px", background: "#eee", textAlign: "left" }}>Hebrew</th>
              <th style={{ border: "1px solid #ccc", padding: "5px 8px", background: "#eee", textAlign: "left" }}>Example Sentence</th>
            </tr>
          </thead>
          <tbody>
            {lesson.vocabulary.map((w, i) => (
              <tr key={w.id}>
                <td style={{ border: "1px solid #ccc", padding: "5px 8px", background: i % 2 === 1 ? "#f9f9f9" : undefined }}>{i + 1}</td>
                <td style={{ border: "1px solid #ccc", padding: "5px 8px", fontWeight: "bold", background: i % 2 === 1 ? "#f9f9f9" : undefined }}>{w.word}</td>
                <td style={{ border: "1px solid #ccc", padding: "5px 8px", color: "#444", background: i % 2 === 1 ? "#f9f9f9" : undefined }}>{w.translation}</td>
                <td style={{ border: "1px solid #ccc", padding: "5px 8px", fontStyle: "italic", background: i % 2 === 1 ? "#f9f9f9" : undefined }}>{w.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grammar */}
      <div className="ws-section">
        <div className="ws-section-title">Part 2 – Grammar: {lesson.grammar.title}</div>
        <div className="ws-grammar-box" style={{ border: "1px solid #bbb", padding: "10px 14px", background: "#fafafa", marginBottom: 10, fontSize: 11 }}>
          <div style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>{lesson.grammar.explanation}</div>
          {lesson.grammar.tip && (
            <div style={{ marginTop: 8, borderTop: "1px solid #ddd", paddingTop: 6, color: "#555", fontSize: 10 }}>
              💡 Tip: {lesson.grammar.tip}
            </div>
          )}
        </div>
        <p style={{ fontSize: 10, fontWeight: "bold", margin: "0 0 4px" }}>Examples:</p>
        {lesson.grammar.examples.map((ex, i) => (
          <div key={i} style={{ fontSize: 11, marginBottom: 3 }}>→ <em>{ex}</em></div>
        ))}
      </div>

      {/* Exercises */}
      <div className="ws-section" style={{ marginTop: 12 }}>
        <div className="ws-section-title">Part 3 – Exercises</div>
        {lesson.exercises.map((ex, i) => (
          <div key={ex.id} className="ws-exercise" style={{ marginBottom: 16, fontSize: 11 }}>
            <div className="ws-exercise-q" style={{ fontWeight: "bold", marginBottom: 4 }}>
              {i + 1}. {ex.question}
            </div>
            {ex.options && (
              <ol type="A" style={{ paddingLeft: 24, margin: "4px 0" }}>
                {ex.options.map((opt, j) => (
                  <li key={j} style={{ marginBottom: 2 }}>{opt}</li>
                ))}
              </ol>
            )}
            {ex.type === "fill_blank" && (
              <div style={{ marginTop: 4 }}>
                Answer: <span style={{ display: "inline-block", borderBottom: "1.5px solid black", minWidth: 120, marginLeft: 4 }}>&nbsp;</span>
              </div>
            )}
            {ex.type === "reorder_words" && (
              <div style={{ marginTop: 4 }}>
                Your answer: <span style={{ display: "inline-block", borderBottom: "1.5px solid black", minWidth: 200, marginLeft: 4 }}>&nbsp;</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reading */}
      {lesson.readingText && (
        <div className="ws-section" style={{ marginTop: 12 }}>
          <div className="ws-section-title">Part 4 – Reading</div>
          <div className="ws-reading" style={{ fontSize: 11, lineHeight: 1.7, border: "1px solid #ccc", padding: 12, background: "#fefefe" }}>
            {lesson.readingText.split("\n\n").map((para, i) => (
              <p key={i} style={{ margin: "0 0 10px" }}>{para}</p>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 11 }}>
            <p style={{ fontWeight: "bold", marginBottom: 4 }}>Reading Comprehension – write your answers below:</p>
            {[1, 2, 3].map(n => (
              <div key={n} style={{ marginBottom: 8 }}>
                {n}. _______________________________________________________________
                <div style={{ borderBottom: "1px solid #aaa", marginTop: 2 }}></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer Key */}
      <div className="ws-answer-key" style={{ fontSize: 9, color: "#666", borderTop: "1px dashed #aaa", marginTop: 20, paddingTop: 8 }}>
        <strong>Answer Key:</strong> {answers.join(" | ")}
      </div>
    </div>
  );
}
