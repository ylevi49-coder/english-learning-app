"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Flame, Star, BookOpen, Zap, LogIn, LogOut } from "lucide-react";
import { getProgress, getXPForNextLevel, loadCloudProgress, saveProgress } from "@/lib/progress";
import { LEVEL_INFO, getLessonsByLevel } from "@/lib/curriculum";
import LevelBadge from "@/components/LevelBadge";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";
import type { UserProgress } from "@/types";

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) {
      loadCloudProgress(user.id).then((cloud) => {
        if (cloud) { saveProgress(cloud); setProgress(cloud); }
        else setProgress(getProgress());
      });
    } else {
      setProgress(getProgress());
    }
  }, [user, loading]);

  if (!progress) return null;

  const xpInfo = getXPForNextLevel(progress.xp);
  const xpPercent = Math.min((xpInfo.current / xpInfo.needed) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 px-5 pt-12 pb-8">
        <div className="max-w-lg mx-auto">
          <h1 className="text-white text-2xl font-bold mb-1">Your Progress</h1>
          <p className="text-purple-200 text-sm">Keep going – every lesson counts!</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-4 space-y-4 animate-slideUp pb-6">
        {/* XP & Level */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="text-yellow-500" size={20} />
              <span className="font-bold text-gray-900">Level: {xpInfo.label}</span>
            </div>
            <span className="text-sm text-gray-500">{xpInfo.current} XP</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-700"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">{xpInfo.needed - xpInfo.current} XP to next level</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<BookOpen size={22} className="text-primary-600" />} label="Lessons Completed" value={progress.completedLessons.length} />
          <StatCard icon={<Star size={22} className="text-yellow-500" />} label="Words Mastered" value={progress.vocabularyKnown.length} />
          <StatCard icon={<Flame size={22} className="text-orange-500" />} label="Day Streak" value={progress.streak} />
          <StatCard icon={<Trophy size={22} className="text-purple-500" />} label="Total XP" value={progress.xp} />
        </div>

        {/* Per-level breakdown */}
        <h2 className="font-bold text-gray-900 text-lg">Progress by Level</h2>
        {LEVEL_INFO.map((level) => {
          const lessons = getLessonsByLevel(level.level);
          const done = lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
          const total = level.totalLessons;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <div key={level.level} className={`card border ${level.borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <LevelBadge level={level.level} />
                  <span className={`font-semibold text-sm ${level.color}`}>{level.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-700">{done}/{total}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    level.level === "A1" ? "bg-green-500" :
                    level.level === "A2" ? "bg-emerald-500" :
                    level.level === "B1" ? "bg-blue-500" :
                    level.level === "B2" ? "bg-indigo-500" :
                    level.level === "C1" ? "bg-purple-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{pct}% complete</p>
            </div>
          );
        })}

        {/* Account */}
        {user ? (
          <div className="card bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-500 font-medium uppercase tracking-wide mb-0.5">Signed in as</p>
                <p className="font-bold text-blue-900 text-sm">{user.user_metadata?.name || user.email}</p>
                <p className="text-xs text-blue-600">Progress saved to cloud ☁️</p>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 bg-white border border-blue-200 text-blue-700 text-sm font-semibold px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="card bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Sign in to save your progress to the cloud and continue on any device.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <LogIn size={15} />
              Sign in / Create account
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="card flex flex-col items-center text-center py-4">
      {icon}
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
