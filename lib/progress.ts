"use client";

import { UserProgress, CEFRLevel } from "@/types";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "englishup_progress";

function defaultProgress(): UserProgress {
  return {
    userId: "local",
    level: "A1",
    completedLessons: [],
    vocabularyKnown: [],
    vocabularyHard: [],
    xp: 0,
    streak: 0,
    lastActivity: new Date().toISOString(),
  };
}

// ── Local (guest) ─────────────────────────────────────────────

export function getProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const p = raw ? JSON.parse(raw) : defaultProgress();
    if (!p.vocabularyHard) p.vocabularyHard = [];
    return p;
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(p: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

// ── Cloud (logged-in) ─────────────────────────────────────────

export async function loadCloudProgress(userId: string): Promise<UserProgress | null> {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error || !data) return null;
  return {
    userId,
    level: data.level as CEFRLevel,
    completedLessons: data.completed_lessons ?? [],
    vocabularyKnown: data.vocabulary_known ?? [],
    vocabularyHard: data.vocabulary_hard ?? [],
    xp: data.xp ?? 0,
    streak: data.streak ?? 0,
    lastActivity: data.last_activity ?? new Date().toISOString(),
  };
}

export async function saveCloudProgress(userId: string, p: UserProgress): Promise<void> {
  await supabase.from("user_progress").upsert({
    user_id: userId,
    level: p.level,
    completed_lessons: p.completedLessons,
    vocabulary_known: p.vocabularyKnown,
    vocabulary_hard: p.vocabularyHard,
    xp: p.xp,
    streak: p.streak,
    last_activity: new Date().toISOString(),
  }, { onConflict: "user_id" });
}

// Merge local guest progress into cloud on first login
export async function mergeLocalToCloud(userId: string): Promise<void> {
  const local = getProgress();
  if (local.xp === 0 && local.completedLessons.length === 0) return;
  const cloud = await loadCloudProgress(userId);
  if (cloud && cloud.xp >= local.xp) return; // Cloud is ahead, skip merge
  const merged: UserProgress = {
    userId,
    level: cloud ? cloud.level : local.level,
    completedLessons: [...new Set([...(cloud?.completedLessons ?? []), ...local.completedLessons])],
    vocabularyKnown: [...new Set([...(cloud?.vocabularyKnown ?? []), ...local.vocabularyKnown])],
    vocabularyHard: [...new Set([...(cloud?.vocabularyHard ?? []), ...local.vocabularyHard])],
    xp: Math.max(cloud?.xp ?? 0, local.xp),
    streak: Math.max(cloud?.streak ?? 0, local.streak),
    lastActivity: new Date().toISOString(),
  };
  await saveCloudProgress(userId, merged);
}

// ── Mutations (work for both guest and cloud) ─────────────────

export function completeLesson(lessonId: string, xpEarned = 20): void {
  const p = getProgress();
  if (!p.completedLessons.includes(lessonId)) {
    p.completedLessons.push(lessonId);
    p.xp += xpEarned;
  }
  p.lastActivity = new Date().toISOString();
  saveProgress(p);
  syncToCloud(p);
}

export function markWordKnown(wordId: string): void {
  const p = getProgress();
  if (!p.vocabularyKnown.includes(wordId)) {
    p.vocabularyKnown.push(wordId);
    p.xp += 2;
  }
  p.vocabularyHard = (p.vocabularyHard ?? []).filter(id => id !== wordId);
  saveProgress(p);
  syncToCloud(p);
}

export function markWordHard(wordId: string): void {
  const p = getProgress();
  if (!(p.vocabularyHard ?? []).includes(wordId)) {
    p.vocabularyHard = [...(p.vocabularyHard ?? []), wordId];
  }
  saveProgress(p);
  syncToCloud(p);
}

export function unmarkWordHard(wordId: string): void {
  const p = getProgress();
  p.vocabularyHard = (p.vocabularyHard ?? []).filter(id => id !== wordId);
  saveProgress(p);
  syncToCloud(p);
}

export function setCurrentLevel(level: CEFRLevel): void {
  const p = getProgress();
  p.level = level;
  saveProgress(p);
  syncToCloud(p);
}

// Fire-and-forget cloud sync
function syncToCloud(p: UserProgress) {
  supabase.auth.getUser().then(({ data }) => {
    if (data.user) saveCloudProgress(data.user.id, p);
  });
}

export function getXPForNextLevel(xp: number): { current: number; needed: number; label: string } {
  const thresholds = [
    { needed: 100,  label: "Beginner"  },
    { needed: 300,  label: "Explorer"  },
    { needed: 600,  label: "Learner"   },
    { needed: 1000, label: "Achiever"  },
    { needed: 1500, label: "Advanced"  },
    { needed: 2500, label: "Expert"    },
    { needed: Infinity, label: "Master" },
  ];
  for (const t of thresholds) {
    if (xp < t.needed) return { current: xp, needed: t.needed, label: t.label };
  }
  return { current: xp, needed: 2500, label: "Master" };
}
