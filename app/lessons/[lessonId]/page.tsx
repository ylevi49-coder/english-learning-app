"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, MessageSquare, ChevronRight, CheckCircle, Printer, Volume2 } from "lucide-react";
import { getLessonById } from "@/lib/curriculum";
import { completeLesson, markWordKnown, getProgress } from "@/lib/progress";
import LevelBadge from "@/components/LevelBadge";
import ExerciseView from "@/components/ExerciseView";
import { Button } from "@/components/ui/button";
import { Lesson, Exercise } from "@/types";

type Tab = "vocabulary" | "grammar" | "exercises" | "reading";

function speakText(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-US";
  utt.rate = 0.85;
  const voices = window.speechSynthesis.getVoices();
  const eng = voices.find((v) => v.lang.startsWith("en"));
  if (eng) utt.voice = eng;
  window.speechSynthesis.speak(utt);
}

function printWorksheet(lesson: Lesson) {
  const answers = lesson.exercises.map(
    (ex, i) => `${i + 1}. ${Array.isArray(ex.answer) ? ex.answer.join(", ") : ex.answer}`
  );

  const vocabRows = lesson.vocabulary
    .map(
      (w, i) => `<tr style="background:${i % 2 === 1 ? "#f9f9f9" : "#fff"}">
        <td style="border:1px solid #ccc;padding:5px 8px">${i + 1}</td>
        <td style="border:1px solid #ccc;padding:5px 8px;font-weight:bold">${w.word}</td>
        <td style="border:1px solid #ccc;padding:5px 8px;color:#444">${w.translation}</td>
        <td style="border:1px solid #ccc;padding:5px 8px;font-style:italic">${w.example}</td>
      </tr>`
    )
    .join("");

  const exercisesHtml = lesson.exercises
    .map((ex, i) => {
      const optionsHtml = ex.options
        ? `<ol type="A" style="padding-left:24px;margin:4px 0">${ex.options.map((o) => `<li style="margin-bottom:2px">${o}</li>`).join("")}</ol>`
        : "";
      const answerLine =
        ex.type === "fill_blank" || ex.type === "reorder_words"
          ? `<div style="margin-top:4px">Answer: <span style="display:inline-block;border-bottom:1.5px solid black;min-width:${ex.type === "reorder_words" ? 200 : 120}px;margin-left:4px">&nbsp;</span></div>`
          : "";
      return `<div style="margin-bottom:16px;page-break-inside:avoid;font-size:11pt">
        <div style="font-weight:bold;margin-bottom:4px">${i + 1}. ${ex.question}</div>
        ${optionsHtml}${answerLine}
      </div>`;
    })
    .join("");

  const readingHtml = lesson.readingText
    ? `<div style="margin-top:14px">
        <div style="font-size:13pt;font-weight:bold;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #aaa;margin-bottom:10px;padding-bottom:3px">Part 4 – Reading</div>
        <div style="border:1px solid #ccc;padding:12px;background:#fefefe;font-size:11pt;line-height:1.7">
          ${lesson.readingText.split("\n\n").map((p) => `<p style="margin:0 0 10px">${p}</p>`).join("")}
        </div>
        <p style="font-weight:bold;font-size:11pt;margin-top:10px">Comprehension – answer in your own words:</p>
        ${[1, 2, 3].map((n) => `<div style="margin-bottom:12px;font-size:11pt">${n}. <div style="border-bottom:1px solid #aaa;margin-top:4px;min-height:24px"></div></div>`).join("")}
      </div>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Worksheet – ${lesson.level}: ${lesson.title}</title>
  <style>
    body { font-family: Georgia, serif; color: #000; margin: 24px; }
    @media print { @page { margin: 20mm; } }
  </style>
</head>
<body>
  <div style="border-bottom:2px solid black;padding-bottom:8px;margin-bottom:20px">
    <h1 style="font-size:22pt;margin:0 0 4px">${lesson.level}: ${lesson.title}</h1>
    <p style="font-size:11pt;color:#555;margin:0">${lesson.description} &nbsp;|&nbsp; Name: _________________________ &nbsp;|&nbsp; Date: _____________</p>
  </div>

  <div style="font-size:13pt;font-weight:bold;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #aaa;margin-bottom:10px;padding-bottom:3px">Part 1 – Vocabulary</div>
  <table style="width:100%;border-collapse:collapse;font-size:11pt;margin-bottom:12px">
    <thead><tr>
      <th style="border:1px solid #ccc;padding:5px 8px;background:#eee;text-align:left">#</th>
      <th style="border:1px solid #ccc;padding:5px 8px;background:#eee;text-align:left">English</th>
      <th style="border:1px solid #ccc;padding:5px 8px;background:#eee;text-align:left">Hebrew</th>
      <th style="border:1px solid #ccc;padding:5px 8px;background:#eee;text-align:left">Example</th>
    </tr></thead>
    <tbody>${vocabRows}</tbody>
  </table>

  <div style="font-size:13pt;font-weight:bold;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #aaa;margin-bottom:10px;padding-bottom:3px">Part 2 – Grammar: ${lesson.grammar.title}</div>
  <div style="border:1px solid #bbb;padding:10px 14px;background:#fafafa;margin-bottom:10px;font-size:11pt">
    <div style="white-space:pre-line;line-height:1.6">${lesson.grammar.explanation}</div>
    ${lesson.grammar.tip ? `<div style="margin-top:8px;border-top:1px solid #ddd;padding-top:6px;color:#555;font-size:10pt">💡 Tip: ${lesson.grammar.tip}</div>` : ""}
  </div>
  <p style="font-size:10pt;font-weight:bold;margin:0 0 4px">Examples:</p>
  ${lesson.grammar.examples.map((ex) => `<div style="font-size:11pt;margin-bottom:3px">→ <em>${ex}</em></div>`).join("")}

  <div style="font-size:13pt;font-weight:bold;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #aaa;margin:14px 0 10px;padding-bottom:3px">Part 3 – Exercises</div>
  ${exercisesHtml}
  ${readingHtml}

  <div style="font-size:9pt;color:#666;border-top:1px dashed #aaa;margin-top:20px;padding-top:8px">
    <strong>Answer Key:</strong> ${answers.join(" | ")}
  </div>

  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

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
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm">
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={() => printWorksheet(lesson)}
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

      <div className="max-w-lg mx-auto px-4 py-4 animate-fadeIn">
        {/* VOCABULARY */}
        {tab === "vocabulary" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-2">Tap a card to mark it as learned · 🔊 to hear pronunciation</p>
            {lesson.vocabulary.map((word) => {
              const known = knownWords.includes(word.id);
              return (
                <div
                  key={word.id}
                  className={`card border-2 transition-all ${known ? "border-green-300 bg-green-50" : "border-transparent hover:border-primary-200"}`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      className="flex-1 text-left"
                      onClick={() => handleMarkWord(word.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-lg">{word.word}</span>
                        {known && <CheckCircle size={16} className="text-green-500" />}
                      </div>
                      <span className="text-primary-600 font-medium text-sm">{word.translation}</span>
                      <p className="text-gray-500 text-sm mt-1 italic">"{word.example}"</p>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); speakText(word.word); }}
                      className="flex-shrink-0 mt-1 p-2 rounded-xl text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Hear pronunciation"
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                </div>
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
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-primary-600 font-bold mt-0.5 text-sm">→</span>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-gray-800 italic text-sm">{ex}</span>
                      <button
                        onClick={() => speakText(ex)}
                        className="flex-shrink-0 p-1 rounded-lg text-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Hear example"
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
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
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-primary-600" />
                  <h2 className="font-bold text-gray-900">Reading Passage</h2>
                </div>
                <button
                  onClick={() => speakText(lesson.readingText!)}
                  className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-1.5 transition-colors"
                >
                  <Volume2 size={14} /> Listen
                </button>
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
