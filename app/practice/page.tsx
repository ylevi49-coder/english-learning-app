"use client";

import { useEffect, useState } from "react";
import { Zap, Trophy, RefreshCw } from "lucide-react";
import { LESSONS } from "@/lib/curriculum";
import { getProgress, completeLesson } from "@/lib/progress";
import ExerciseView from "@/components/ExerciseView";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Exercise, CEFRLevel } from "@/types";

export default function PracticePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | "all">("all");

  useEffect(() => {
    buildExercises("all");
  }, []);

  function buildExercises(level: CEFRLevel | "all") {
    setSelectedLevel(level);
    const filtered = level === "all" ? LESSONS : LESSONS.filter((l) => l.level === level);
    const pool: Exercise[] = filtered.flatMap((l) => l.exercises);
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 10);
    setExercises(shuffled);
    setStarted(false);
    setDone(false);
  }

  function handleComplete(score: number) {
    setFinalScore(score);
    setDone(true);
    completeLesson(`practice-${Date.now()}`, score * 3);
  }

  const levels: (CEFRLevel | "all")[] = ["all", "A1", "A2", "B1", "B2", "C1", "C2"];

  if (done) {
    const pct = Math.round((finalScore / exercises.length) * 100);
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <Trophy size={64} className="text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Practice Complete!</h1>
          <p className="text-gray-500 mb-2">
            Score: <span className="font-bold text-primary-600">{finalScore}/{exercises.length}</span> ({pct}%)
          </p>
          <p className="text-sm text-green-600 font-medium mb-8">+{finalScore * 3} XP earned!</p>
          <Button onClick={() => buildExercises(selectedLevel)} className="w-full max-w-xs">
            <RefreshCw size={16} className="mr-2" /> Practice Again
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Daily Practice</h1>
          <p className="text-sm text-gray-500 mb-3">10 random exercises from all your lessons</p>

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

      <div className="max-w-lg mx-auto px-5 py-5">
        {!started ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="card text-center py-8">
              <Zap size={48} className="mx-auto mb-3 text-primary-500" />
              <h2 className="text-lg font-bold text-gray-900 mb-2">Ready to practice?</h2>
              <p className="text-gray-500 text-sm mb-4">
                {exercises.length} exercises from {selectedLevel === "all" ? "all levels" : `Level ${selectedLevel}`}
              </p>
              <Button onClick={() => setStarted(true)} size="lg" className="mx-auto">
                Start Practice
              </Button>
            </div>

            {/* AI Writing Practice */}
            <div className="card border-2 border-purple-100">
              <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="text-lg">✍️</span> AI Writing Practice
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Write a sentence or paragraph and get instant feedback from AI
              </p>
              <AIWritingPractice />
            </div>
          </div>
        ) : (
          <ExerciseView exercises={exercises} onComplete={handleComplete} />
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
        placeholder="Write something in English... e.g., 'Yesterday I go to the market and buyed some vegetables.'"
        rows={3}
        className="input resize-none"
      />
      <Button onClick={handleSubmit} disabled={loading || !text.trim()} className="w-full" variant="secondary">
        {loading ? "Getting feedback..." : "Get AI Feedback"}
      </Button>
      {feedback && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-sm text-purple-900">
          <p className="font-semibold mb-1">AI Feedback:</p>
          <p className="whitespace-pre-line">{feedback}</p>
        </div>
      )}
    </div>
  );
}
