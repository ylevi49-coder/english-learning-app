"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, CheckCircle, ChevronRight, GraduationCap, Map, List } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"list" | "path">("path");

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
          {/* Page tabs */}
          <div className="flex gap-2 mb-4">
            <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-primary-600 text-white">
              Lessons
            </span>
            <Link
              href="/grammar"
              className="px-4 py-1.5 rounded-full text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            >
              <GraduationCap size={14} /> Grammar Guide
            </Link>
          </div>

          {/* Level tabs + view toggle */}
          <div className="flex items-center gap-2">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
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
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => setViewMode("path")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "path" ? "bg-primary-100 text-primary-700" : "text-gray-400 hover:text-gray-600"}`}
                title="Course path view"
              ><Map size={16} /></button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-primary-100 text-primary-700" : "text-gray-400 hover:text-gray-600"}`}
                title="List view"
              ><List size={16} /></button>
            </div>
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

        {/* Lessons */}
        {lessons.length === 0 ? (
          <div className="card text-center py-10">
            <BookOpen className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="text-gray-500">More lessons coming soon!</p>
          </div>
        ) : viewMode === "path" ? (
          <CoursePath lessons={lessons} completedLessons={completedLessons} />
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, idx) => {
              const done = completedLessons.includes(lesson.id);
              return (
                <LessonCard key={lesson.id} lesson={lesson} done={done} index={idx + 1} />
              );
            })}
          </div>
        )}
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

// ─── Visual Course Path ───────────────────────────────────
function CoursePath({
  lessons,
  completedLessons,
}: {
  lessons: Lesson[];
  completedLessons: string[];
}) {
  // Arrange lessons in a zigzag: columns alternate left / centre / right
  const positions = ["left", "center", "right", "center"] as const;

  return (
    <div className="flex flex-col items-center gap-0 py-2">
      {lessons.map((lesson, idx) => {
        const done = completedLessons.includes(lesson.id);
        const isLast = idx === lessons.length - 1;
        const pos = positions[idx % 4];

        const nodeAlignClass =
          pos === "left" ? "self-start ml-4" :
          pos === "right" ? "self-end mr-4" :
          "self-center";

        const connectorAlignClass =
          pos === "left" ? "items-start pl-10" :
          pos === "right" ? "items-end pr-10" :
          "items-center";

        return (
          <div key={lesson.id} className="w-full flex flex-col">
            {/* Node */}
            <Link
              href={`/lessons/${lesson.id}`}
              className={`${nodeAlignClass} flex flex-col items-center gap-1 group`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all group-hover:scale-105 border-4 ${
                  done
                    ? "bg-green-500 border-green-300 text-white"
                    : "bg-white border-gray-200 group-hover:border-primary-400 text-gray-600"
                }`}
              >
                {done ? (
                  <CheckCircle size={28} className="text-white" />
                ) : (
                  <span className="text-lg font-bold">{idx + 1}</span>
                )}
              </div>
              <div className={`text-center max-w-[110px] ${nodeAlignClass}`}>
                <p className={`text-xs font-semibold leading-tight ${done ? "text-green-700" : "text-gray-700"}`}>
                  {lesson.title}
                </p>
                {lesson.readingText && (
                  <span className="text-[10px] text-blue-500">📖 Reading</span>
                )}
              </div>
            </Link>

            {/* Connector line */}
            {!isLast && (
              <div className={`flex flex-col ${connectorAlignClass} h-10`}>
                <div className="w-0.5 h-full bg-gray-200" />
              </div>
            )}
          </div>
        );
      })}

      {/* Completion badge */}
      {lessons.every((l) => completedLessons.includes(l.id)) && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-2xl px-6 py-3 text-center">
          <p className="text-lg">🏆</p>
          <p className="text-sm font-bold text-yellow-700">Level Complete!</p>
        </div>
      )}
    </div>
  );
}
