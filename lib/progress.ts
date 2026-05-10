"use client";

import { UserProgress, CEFRLevel } from "@/types";

const STORAGE_KEY = "englishup_progress";

function defaultProgress(): UserProgress {
  return {
    userId: "local",
    level: "A1",
    completedLessons: [],
    vocabularyKnown: [],
    xp: 0,
    streak: 0,
    lastActivity: new Date().toISOString(),
  };
}

export function getProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultProgress();
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(p: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function completeLesson(lessonId: string, xpEarned = 20): void {
  const p = getProgress();
  if (!p.completedLessons.includes(lessonId)) {
    p.completedLessons.push(lessonId);
    p.xp += xpEarned;
  }
  p.lastActivity = new Date().toISOString();
  saveProgress(p);
}

export function markWordKnown(wordId: string): void {
  const p = getProgress();
  if (!p.vocabularyKnown.includes(wordId)) {
    p.vocabularyKnown.push(wordId);
    p.xp += 2;
  }
  saveProgress(p);
}

export function setCurrentLevel(level: CEFRLevel): void {
  const p = getProgress();
  p.level = level;
  saveProgress(p);
}

export function getXPForNextLevel(xp: number): { current: number; needed: number; label: string } {
  const thresholds = [
    { needed: 100, label: "Beginner" },
    { needed: 300, label: "Explorer" },
    { needed: 600, label: "Learner" },
    { needed: 1000, label: "Achiever" },
    { needed: 1500, label: "Advanced" },
    { needed: 2500, label: "Expert" },
    { needed: Infinity, label: "Master" },
  ];
  for (const t of thresholds) {
    if (xp < t.needed) return { current: xp, needed: t.needed, label: t.label };
  }
  return { current: xp, needed: 2500, label: "Master" };
}
