"use client";

import { useEffect, useState, useCallback } from "react";
import { Zap, Trophy, RefreshCw, MessageCircle } from "lucide-react";
import { LESSONS } from "@/lib/curriculum";
import { completeLesson } from "@/lib/progress";
import ExerciseView from "@/components/ExerciseView";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Exercise, CEFRLevel } from "@/types";
import Link from "next/link";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sessionKey, setSessionKey] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | "all">("all");

  const buildExercises = useCallback((level: CEFRLevel | "all") => {
    setSelectedLevel(level);
    const filtered = level === "all" ? LESSONS : LESSONS.filter((l) => l.level === level);
    const pool: Exercise[] = filtered.flatMap((l) => l.exercises);
    const picked = shuffle(pool).slice(0, Math.min(10, pool.length));
    setExercises(picked);
    setSessionKey((k) => k + 1);
    setStarted(false);
    setDone(false);
    setFinalScore(0);
  }, []);

  useEffect(() => { buildExercises("all"); }, [buildExercises]);

  function handleComplete(score: number) {
    setFinalScore(score);
    setDone(true);
    completeLesson(`practice-${Date.now()}`, score * 3);
  }

  const levels: (CEFRLevel | "all")[] = ["all", "A1", "A2", "B1", "B2", "C1", "C2"];

  if (done) {
    const pct = exercises.length > 0 ? Math.round((finalScore / exercises.length) * 100) : 0;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <Trophy size={64} className="text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Practice Complete!</h1>
          <p className="text-gray-500 mb-2">
            Score: <span className="font-bold text-primary-600">{finalScore}/{exercises.length}</span> ({pct}%)
          </p>
          <p className="text-sm text-green-600 font-medium mb-8">+{finalScore * 3} XP earned!</p>
          <Button onClick={() => buildExercises(selectedLevel)} className="w-full max-w-xs mb-3">
            <RefreshCw size={16} className="mr-2" /> Practice Again
          </Button>
          <Link href="/chat" className="w-full max-w-xs">
            <Button variant="secondary" className="w-full">
              <MessageCircle size={16} className="mr-2" /> Chat with Emma
            </Button>
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Daily Practice</h1>
          <p className="text-sm text-gray-500 mb-3">{exercises.length} random exercises</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {levels.map((l) => (
              <button
                key={l}
                onClick={() => buildExercises(l)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  selectedLevel === l ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {l === "all" ? "All Levels" : l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-5 space-y-4">
        {!started ? (
          <div className="animate-fadeIn space-y-4">
            <div className="card text-center py-8">
              <Zap size={48} className="mx-auto mb-3 text-primary-500" />
              <h2 className="text-lg font-bold text-gray-900 mb-2">Ready to practice?</h2>
              <p className="text-gray-500 text-sm mb-4">
                {exercises.length} exercises · {selectedLevel === "all" ? "All levels" : `Level ${selectedLevel}`}
              </p>
              <Button onClick={() => setStarted(true)} size="lg">Start Practice</Button>
            </div>

            {/* Chat with Emma promo */}
            <Link href="/chat">
              <div className="card border-2 border-purple-100 bg-purple-50 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-full bg-purple-200 flex items-center justify-center text-2xl flex-shrink-0">
                  👩‍🏫
                </div>
                <div>
                  <p className="font-bold text-purple-900">Chat with Emma</p>
                  <p className="text-sm text-purple-700">Practice real conversations – Emma corrects your mistakes</p>
                </div>
              </div>
            </Link>

            <div className="card border-2 border-gray-100">
              <h3 className="font-bold text-gray-900 mb-1">✍️ AI Writing Check</h3>
              <p className="text-sm text-gray-500 mb-3">Write a sentence and get instant feedback</p>
              <AIWritingPractice />
            </div>
          </div>
        ) : (
          <ExerciseView key={sessionKey} exercises={exercises} onComplete={handleComplete} />
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function AIWritingPractice() {
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setFeedback(data.feedback);
    } catch {
      setFeedback("Could not get feedback. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='e.g. "Yesterday I go to the market and buyed vegetables."'
        rows={3}
        className="input resize-none"
      />
      <Button onClick={handleSubmit} disabled={loading || !text.trim()} className="w-full" variant="secondary">
        {loading ? "Checking..." : "Get AI Feedback"}
      </Button>
      {feedback && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-sm text-purple-900">
          <p className="font-semibold mb-1">Feedback:</p>
          <p className="whitespace-pre-line">{feedback}</p>
        </div>
      )}
    </div>
  );
}
