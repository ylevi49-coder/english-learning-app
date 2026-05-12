"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, LogIn, Trophy } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { getProgress, setCurrentLevel } from "@/lib/progress";
import { ACHIEVEMENTS } from "@/lib/achievements";
import type { CEFRLevel, UserProgress } from "@/types";

const LEVELS: { level: CEFRLevel; name: string; color: string }[] = [
  { level: "A1", name: "Beginner",          color: "bg-green-100 text-green-700 border-green-300"   },
  { level: "A2", name: "Elementary",        color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { level: "B1", name: "Intermediate",      color: "bg-blue-100 text-blue-700 border-blue-300"     },
  { level: "B2", name: "Upper Intermediate",color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
  { level: "C1", name: "Advanced",          color: "bg-purple-100 text-purple-700 border-purple-300" },
  { level: "C2", name: "Proficient",        color: "bg-rose-100 text-rose-700 border-rose-300"     },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [levelSaved, setLevelSaved] = useState(false);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  function handleLevelChange(level: CEFRLevel) {
    setCurrentLevel(level);
    setProgress(p => p ? { ...p, level } : p);
    setLevelSaved(true);
    setTimeout(() => setLevelSaved(false), 1500);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  const earned = progress?.achievements ?? [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 mb-3 text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-5 space-y-4">

        {/* Account */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-3">Account</h2>
          {user ? (
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-500 font-medium mb-0.5">Signed in as</p>
                <p className="font-bold text-blue-900">{user.user_metadata?.name || user.email}</p>
                <p className="text-xs text-blue-600">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Sign in to sync your progress across devices.</p>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
              >
                <LogIn size={16} /> Sign in / Create account
              </Link>
            </div>
          )}
        </div>

        {/* Level selector */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Current Level</h2>
            {levelSaved && <span className="text-xs text-green-600 font-semibold">✓ Saved</span>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map(({ level, name, color }) => (
              <button
                key={level}
                onClick={() => handleLevelChange(level)}
                className={`border-2 rounded-xl py-3 font-bold text-sm transition-all ${
                  progress?.level === level
                    ? color + " border-current scale-105 shadow-sm"
                    : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                <div className="text-lg font-black">{level}</div>
                <div className="text-xs font-medium mt-0.5 leading-tight">{name.split(" ")[0]}</div>
              </button>
            ))}
          </div>
          <Link
            href="/placement"
            className="mt-3 block text-center text-sm text-primary-600 font-semibold hover:underline"
          >
            🧭 Retake placement test
          </Link>
        </div>

        {/* Achievements */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} className="text-yellow-500" />
            <h2 className="font-bold text-gray-900">Achievements</h2>
            <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full ml-auto">
              {earned.length} / {ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ACHIEVEMENTS.map(ach => {
              const done = earned.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`rounded-xl p-3 border ${done ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-100 opacity-50"}`}
                >
                  <span className={`text-2xl ${!done ? "grayscale" : ""}`}>{ach.icon}</span>
                  <p className="text-xs font-bold text-gray-800 mt-1">{ach.label}</p>
                  <p className="text-xs text-gray-500 leading-tight">{ach.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Install PWA */}
        <div className="card bg-primary-50 border border-primary-100">
          <h3 className="font-bold text-primary-900 mb-1">📱 Install on your phone</h3>
          <p className="text-sm text-primary-700 mb-2">
            Add EnglishUp to your home screen — works like a real app!
          </p>
          <div className="text-xs text-primary-600 space-y-1">
            <p><strong>iPhone:</strong> Tap Share → "Add to Home Screen"</p>
            <p><strong>Android:</strong> Tap menu (⋮) → "Add to Home Screen"</p>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-2">About EnglishUp</h2>
          <div className="space-y-1 text-sm text-gray-500">
            <p>Version 1.1.0</p>
            <p>CEFR Levels: A1 → C2</p>
            <p>Powered by Claude AI (Anthropic)</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
