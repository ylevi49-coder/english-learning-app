"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Star, Flame, Zap, ChevronRight, Trophy } from "lucide-react";
import { getProgress, getXPForNextLevel } from "@/lib/progress";
import { LEVEL_INFO, getLessonsByLevel } from "@/lib/curriculum";
import LevelBadge from "@/components/LevelBadge";
import BottomNav from "@/components/BottomNav";
import type { UserProgress } from "@/types";

export default function HomePage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  if (!progress) return null;

  const levelInfo = LEVEL_INFO.find((l) => l.level === progress.level)!;
  const levelLessons = getLessonsByLevel(progress.level);
  const completedInLevel = levelLessons.filter((l) =>
    progress.completedLessons.includes(l.id)
  ).length;
  const xpInfo = getXPForNextLevel(progress.xp);
  const xpPercent = Math.min((xpInfo.current / xpInfo.needed) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 pt-12 pb-20 px-5">
        <div className="max-w-lg mx-auto">
          <p className="text-primary-200 text-sm font-medium mb-1">Welcome back 👋</p>
          <h1 className="text-white text-2xl font-bold mb-6">Keep learning English!</h1>

          {/* XP bar */}
          <div className="bg-primary-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                <span className="text-white text-sm font-semibold">{xpInfo.label}</span>
              </div>
              <span className="text-primary-200 text-sm">{xpInfo.current} / {xpInfo.needed} XP</span>
            </div>
            <div className="h-2 bg-primary-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-12 space-y-4 animate-slideUp">
        {/* Current Level Card */}
        <div className={`card border-2 ${levelInfo.borderColor}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Current Level</p>
              <div className="flex items-center gap-2">
                <LevelBadge level={progress.level} />
                <span className="font-bold text-gray-900">{levelInfo.name}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{completedInLevel}/{levelInfo.totalLessons}</p>
              <p className="text-xs text-gray-500">lessons done</p>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${(completedInLevel / levelInfo.totalLessons) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{levelInfo.description}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center py-4">
            <Flame className="mx-auto mb-1 text-orange-500" size={22} />
            <p className="text-xl font-bold text-gray-900">{progress.streak}</p>
            <p className="text-xs text-gray-500">Day streak</p>
          </div>
          <div className="card text-center py-4">
            <Trophy className="mx-auto mb-1 text-yellow-500" size={22} />
            <p className="text-xl font-bold text-gray-900">{progress.xp}</p>
            <p className="text-xs text-gray-500">Total XP</p>
          </div>
          <div className="card text-center py-4">
            <Star className="mx-auto mb-1 text-blue-500" size={22} />
            <p className="text-xl font-bold text-gray-900">{progress.vocabularyKnown.length}</p>
            <p className="text-xs text-gray-500">Words known</p>
          </div>
        </div>

        {/* Quick actions */}
        <h2 className="text-gray-900 font-bold text-lg pt-2">Quick Start</h2>

        <Link href="/lessons" className="card flex items-center gap-4 hover:border-primary-200 border-2 border-transparent transition-colors">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="text-primary-600" size={22} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Continue Lessons</p>
            <p className="text-sm text-gray-500">{levelInfo.name} level • {levelLessons.length} lessons</p>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </Link>

        <Link href="/vocabulary" className="card flex items-center gap-4 hover:border-yellow-200 border-2 border-transparent transition-colors">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Star className="text-yellow-600" size={22} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Vocabulary Flashcards</p>
            <p className="text-sm text-gray-500">{progress.vocabularyKnown.length} words mastered</p>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </Link>

        <Link href="/practice" className="card flex items-center gap-4 hover:border-green-200 border-2 border-transparent transition-colors">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="text-green-600" size={22} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Daily Practice</p>
            <p className="text-sm text-gray-500">Mixed exercises from all topics</p>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </Link>

        {/* All levels */}
        <h2 className="text-gray-900 font-bold text-lg pt-2">All Levels</h2>

        <div className="grid grid-cols-2 gap-3">
          {LEVEL_INFO.map((level) => {
            const done = getLessonsByLevel(level.level).filter((l) =>
              progress.completedLessons.includes(l.id)
            ).length;
            const total = level.totalLessons;
            return (
              <Link
                key={level.level}
                href={`/lessons?level=${level.level}`}
                className={`card ${level.bgColor} border ${level.borderColor} hover:shadow-md transition-all`}
              >
                <LevelBadge level={level.level} className="mb-2" />
                <p className={`font-bold ${level.color} text-sm`}>{level.name}</p>
                <p className="text-xs text-gray-500 mt-1">{done}/{total} lessons</p>
                <div className="h-1 bg-white/70 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-current rounded-full opacity-60 transition-all"
                    style={{ width: `${(done / total) * 100}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
