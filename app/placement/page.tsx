"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { markPlacementDone } from "@/lib/progress";
import { ACHIEVEMENTS } from "@/lib/achievements";
import type { CEFRLevel } from "@/types";

interface Question {
  id: number;
  level: CEFRLevel;
  question: string;
  options: string[];
  answer: string;
}

const QUESTIONS: Question[] = [
  { id: 1,  level: "A1", question: "What ___ your name?",                                         options: ["is","are","am","be"],                                          answer: "is"              },
  { id: 2,  level: "A1", question: "She ___ three cats.",                                          options: ["have","has","had","having"],                                   answer: "has"             },
  { id: 3,  level: "A2", question: "He ___ to work every day.",                                    options: ["go","goes","going","gone"],                                    answer: "goes"            },
  { id: 4,  level: "A2", question: "___ you ever been to Paris?",                                  options: ["Have","Did","Are","Do"],                                       answer: "Have"            },
  { id: 5,  level: "B1", question: "If I ___ rich, I would travel the world.",                    options: ["am","was","were","be"],                                        answer: "were"            },
  { id: 6,  level: "B1", question: "The report ___ finished by Monday.",                           options: ["must","must be","must have","must to be"],                     answer: "must be"         },
  { id: 7,  level: "B2", question: "By next year, I ___ here for a decade.",                      options: ["will live","will have lived","have lived","am living"],         answer: "will have lived" },
  { id: 8,  level: "B2", question: "It's high time you ___ a decision.",                          options: ["make","made","making","have made"],                            answer: "made"            },
  { id: 9,  level: "C1", question: "No sooner ___ than it started to rain.",                      options: ["we left","had we left","we had left","did we leave"],           answer: "had we left"     },
  { id: 10, level: "C1", question: "She is said ___ the best in her field.",                      options: ["to be","being","that she is","to have been being"],             answer: "to be"           },
  { id: 11, level: "C2", question: "___ not for your help, I would have failed.",                 options: ["Was","Were","Had","If"],                                       answer: "Were"            },
  { id: 12, level: "C2", question: "The extent ___ climate change affects crops is debated.",     options: ["that","to which","which","of that"],                           answer: "to which"        },
];

const LEVEL_ORDER: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function getRecommendedLevel(answers: Record<number, string>): CEFRLevel {
  for (const level of LEVEL_ORDER) {
    const qs = QUESTIONS.filter(q => q.level === level);
    const correct = qs.filter(q => answers[q.id] === q.answer).length;
    if (correct < qs.length) return level;
  }
  return "C2";
}

export default function PlacementTestPage() {
  const router = useRouter();
  const [step, setStep]       = useState<"intro" | "quiz" | "result">("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [newAch, setNewAch]   = useState<string[]>([]);

  const q = QUESTIONS[current];
  const recommendedLevel = step === "result" ? getRecommendedLevel(answers) : "A1";

  function handleSelect(opt: string) {
    if (confirmed) return;
    setSelected(opt);
  }

  function handleConfirm() {
    if (!selected) return;
    setAnswers(prev => ({ ...prev, [q.id]: selected }));
    setConfirmed(true);
    setTimeout(() => {
      if (current + 1 < QUESTIONS.length) {
        setCurrent(c => c + 1);
        setSelected(null);
        setConfirmed(false);
      } else {
        setStep("result");
      }
    }, 800);
  }

  function handleAccept() {
    const level = getRecommendedLevel(answers);
    const earned = markPlacementDone(level);
    setNewAch(earned);
    setTimeout(() => router.push("/"), 200);
  }

  if (step === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center px-5">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
          <div className="text-5xl mb-4">🧭</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Placement Test</h1>
          <p className="text-gray-500 text-sm mb-6">
            Answer 12 quick grammar questions and we'll find the perfect starting level for you.
            Takes about 3 minutes.
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 text-left mb-6 space-y-2">
            <p className="text-sm text-gray-600">✅ 12 questions</p>
            <p className="text-sm text-gray-600">✅ Multiple choice</p>
            <p className="text-sm text-gray-600">✅ Covers A1 → C2</p>
          </div>
          <button
            onClick={() => setStep("quiz")}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
          >
            Start Test
          </button>
          <button onClick={() => router.push("/")} className="mt-3 text-sm text-gray-400 underline">
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  if (step === "result") {
    const levelColors: Record<CEFRLevel, string> = {
      A1: "text-green-600 bg-green-50 border-green-200",
      A2: "text-emerald-600 bg-emerald-50 border-emerald-200",
      B1: "text-blue-600 bg-blue-50 border-blue-200",
      B2: "text-indigo-600 bg-indigo-50 border-indigo-200",
      C1: "text-purple-600 bg-purple-50 border-purple-200",
      C2: "text-rose-600 bg-rose-50 border-rose-200",
    };
    const correct = QUESTIONS.filter(q => answers[q.id] === q.answer).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center px-5">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Test Complete!</h1>
          <p className="text-gray-500 text-sm mb-6">{correct} / {QUESTIONS.length} correct</p>

          <p className="text-sm text-gray-600 mb-2">Your recommended level:</p>
          <div className={`inline-block border-2 rounded-2xl px-6 py-3 mb-6 ${levelColors[recommendedLevel]}`}>
            <p className="text-3xl font-black">{recommendedLevel}</p>
            <p className="text-sm font-semibold">
              {{ A1:"Beginner", A2:"Elementary", B1:"Intermediate", B2:"Upper Intermediate", C1:"Advanced", C2:"Proficient" }[recommendedLevel]}
            </p>
          </div>

          <button
            onClick={handleAccept}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 mb-3"
          >
            Start at {recommendedLevel} →
          </button>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-400 underline"
          >
            Choose my own level
          </button>

          {newAch.map(id => {
            const a = ACHIEVEMENTS.find(x => x.id === id);
            return a ? (
              <div key={id} className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 flex items-center gap-2">
                <span>{a.icon}</span>
                <span className="text-sm font-semibold text-yellow-800">{a.label} unlocked!</span>
              </div>
            ) : null;
          })}
        </div>
      </div>
    );
  }

  // Quiz step
  const progress = ((current) / QUESTIONS.length) * 100;
  const isCorrect = confirmed && selected === q.answer;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200 w-full">
        <div
          className="h-full bg-primary-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-400">{current + 1} / {QUESTIONS.length}</span>
          <span className="text-xs bg-primary-100 text-primary-700 font-bold px-3 py-1 rounded-full">
            Level {q.level}
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-8 leading-relaxed">
          {q.question.replace("___", "______")}
        </h2>

        <div className="space-y-3 flex-1">
          {q.options.map(opt => {
            let style = "border-gray-200 bg-white text-gray-800";
            if (confirmed) {
              if (opt === q.answer) style = "border-green-400 bg-green-50 text-green-800";
              else if (opt === selected) style = "border-red-400 bg-red-50 text-red-700";
              else style = "border-gray-100 bg-gray-50 text-gray-400";
            } else if (opt === selected) {
              style = "border-primary-400 bg-primary-50 text-primary-800";
            }

            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-medium transition-all ${style}`}
              >
                <div className="flex items-center justify-between">
                  <span>{opt}</span>
                  {confirmed && opt === q.answer && <CheckCircle size={18} className="text-green-500" />}
                  {confirmed && opt === selected && opt !== q.answer && <XCircle size={18} className="text-red-500" />}
                </div>
              </button>
            );
          })}
        </div>

        {!confirmed && (
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="mt-6 w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Confirm <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
