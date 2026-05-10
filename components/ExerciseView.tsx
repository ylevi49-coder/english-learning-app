"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ChevronRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Exercise } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  exercises: Exercise[];
  onComplete?: (score: number) => void;
}

export default function ExerciseView({ exercises, onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const ex = exercises[current];
  const isCorrect = showResult ? checkAnswer(ex, selected) : null;

  function checkAnswer(e: Exercise, answer: string): boolean {
    if (Array.isArray(e.answer)) return e.answer.includes(answer);
    return e.answer.toLowerCase().trim() === answer.toLowerCase().trim();
  }

  function handleSubmit() {
    if (!selected) return;
    const correct = checkAnswer(ex, selected);
    if (correct) setScore((s) => s + 1);
    setShowResult(true);
  }

  function handleNext() {
    if (current + 1 >= exercises.length) {
      setDone(true);
      onComplete?.(score + (isCorrect ? 1 : 0));
    } else {
      setCurrent((c) => c + 1);
      setSelected("");
      setShowResult(false);
    }
  }

  if (done) {
    const finalScore = score;
    const total = exercises.length;
    const pct = Math.round((finalScore / total) * 100);
    return (
      <div className="card text-center py-8 animate-fadeIn">
        <Trophy size={48} className="mx-auto mb-3 text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-900 mb-1">Lesson Complete!</h2>
        <p className="text-gray-500 mb-4">
          You got <span className="font-bold text-primary-600">{finalScore}/{total}</span> correct ({pct}%)
        </p>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4 mx-8">
          <div
            className={cn("h-full rounded-full transition-all", pct >= 70 ? "bg-green-500" : "bg-orange-400")}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-sm text-gray-500">+20 XP earned!</p>
      </div>
    );
  }

  const options = ex.options ?? ["True", "False"];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all"
            style={{ width: `${(current / exercises.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">{current + 1}/{exercises.length}</span>
      </div>

      {/* Question card */}
      <div className="card">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">
          {ex.type === "multiple_choice" ? "Multiple Choice" :
           ex.type === "fill_blank" ? "Fill in the Blank" :
           ex.type === "true_false" ? "True or False" :
           ex.type === "reorder_words" ? "Reorder Words" : "Exercise"}
        </p>
        <p className="text-gray-900 font-semibold text-base leading-snug">{ex.question}</p>
      </div>

      {/* Fill in blank */}
      {ex.type === "fill_blank" ? (
        <div>
          <input
            value={selected}
            onChange={(e) => !showResult && setSelected(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !showResult && handleSubmit()}
            placeholder="Type your answer..."
            disabled={showResult}
            className={cn(
              "input",
              showResult && isCorrect ? "border-2 border-green-400 bg-green-50" : "",
              showResult && !isCorrect ? "border-2 border-red-400 bg-red-50" : ""
            )}
          />
        </div>
      ) : (
        /* Multiple choice / true-false / reorder */
        <div className="space-y-2">
          {options.map((opt) => {
            const isSelected = selected === opt;
            const isRight = showResult && opt === (Array.isArray(ex.answer) ? ex.answer[0] : ex.answer);
            const isWrong = showResult && isSelected && !checkAnswer(ex, opt);
            return (
              <button
                key={opt}
                onClick={() => !showResult && setSelected(opt)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all",
                  !showResult && isSelected ? "border-primary-500 bg-primary-50 text-primary-700" : "",
                  !showResult && !isSelected ? "border-gray-200 bg-white hover:border-primary-300 text-gray-700" : "",
                  isRight ? "border-green-400 bg-green-50 text-green-800" : "",
                  isWrong ? "border-red-400 bg-red-50 text-red-800" : "",
                )}
              >
                <div className="flex items-center gap-2">
                  {showResult && isRight && <CheckCircle size={16} className="text-green-600 flex-shrink-0" />}
                  {showResult && isWrong && <XCircle size={16} className="text-red-600 flex-shrink-0" />}
                  {opt}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Explanation */}
      {showResult && ex.explanation && (
        <div className={cn("rounded-xl p-3 text-sm", isCorrect ? "bg-green-50 text-green-800" : "bg-orange-50 text-orange-800")}>
          <span className="font-semibold">{isCorrect ? "✓ Correct! " : "✗ Not quite. "}</span>
          {ex.explanation}
        </div>
      )}

      {/* Buttons */}
      {!showResult ? (
        <Button onClick={handleSubmit} disabled={!selected} className="w-full">
          Check Answer
        </Button>
      ) : (
        <Button onClick={handleNext} className="w-full">
          {current + 1 >= exercises.length ? "Finish Lesson" : "Next Question"}
          <ChevronRight size={16} className="ml-1" />
        </Button>
      )}
    </div>
  );
}
