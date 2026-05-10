"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, CheckCircle, ChevronRight } from "lucide-react";
import { LEVEL_INFO, getLessonsByLevel } from "@/lib/curriculum";
import { getProgress } from "@/lib/progress";
import LevelBadge from "@/components/LevelBadge";
import BottomNav from "@/components/BottomNav";
import { CEFRLevel, Lesson } from "@/types";

export default function LessonsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LessonsContent />
    </Suspense>
  );
}

function LessonsContent() {
  const searchParams = useSearchParams();
  const [activeLevel, setActiveLevel] = useState<CEFRLevel>("A1");
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    const lvl = (searchParams.get("level") as CEFRLevel) || getProgress().level;
    setActiveLevel(lvl);
    setCompletedLessons(getProgress().completedLessons);
  }, [searchParams]);

  const lessons = getLessonsByLevel(activeLevel);
  const levelInfo = LEVEL_INFO.find((l) => l.level === activeLevel)!;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lessons</h1>

          {/* Level tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {LEVEL_INFO.map(({ level }) => (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeLevel === level
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-4 space-y-4 animate-fadeIn">
        {/* Level description */}
        <div className={`card ${levelInfo.bgColor} border ${levelInfo.borderColor}`}>
          <div className="flex items-center gap-2 mb-1">
            <LevelBadge level={activeLevel} />
            <span className={`font-bold ${levelInfo.color}`}>{levelInfo.name}</span>
          </div>
          <p className="text-sm text-gray-600">{levelInfo.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            {completedLessons.filter((id) => id.startsWith(activeLevel.toLowerCase())).length} / {lessons.length} completed
          </p>
        </div>

        {/* Lessons list */}
        <div className="space-y-3">
          {lessons.length === 0 ? (
            <div className="card text-center py-10">
              <BookOpen className="mx-auto mb-3 text-gray-300" size={40} />
              <p className="text-gray-500">More lessons coming soon!</p>
            </div>
          ) : (
            lessons.map((lesson, idx) => {
              const done = completedLessons.includes(lesson.id);
              return (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  done={done}
                  index={idx + 1}
                />
              );
            })
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function LessonCard({ lesson, done, index }: { lesson: Lesson; done: boolean; index: number }) {
  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className={`card flex items-center gap-4 border-2 transition-all hover:shadow-md ${
        done ? "border-green-200 bg-green-50/50" : "border-transparent hover:border-primary-100"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          done ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"
        }`}
      >
        {done ? <CheckCircle size={20} /> : index}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{lesson.title}</p>
        <p className="text-sm text-gray-500 truncate">{lesson.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">{lesson.exercises.length} exercises</span>
          <span className="text-xs text-gray-300">•</span>
          <span className="text-xs text-gray-400">{lesson.vocabulary.length} words</span>
          {lesson.readingText && (
            <>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-400">Reading</span>
            </>
          )}
        </div>
      </div>
      <ChevronRight className="text-gray-400 flex-shrink-0" size={18} />
    </Link>
  );
}
