import type { UserProgress } from "@/types";

export interface Achievement {
  id: string;
  label: string;
  desc: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_lesson",  icon: "🎯", label: "First Step",         desc: "Complete your first lesson"   },
  { id: "lessons_10",    icon: "📚", label: "Dedicated Learner",   desc: "Complete 10 lessons"           },
  { id: "lessons_25",    icon: "🎓", label: "Knowledge Seeker",    desc: "Complete 25 lessons"           },
  { id: "first_word",    icon: "📝", label: "Word Collector",      desc: "Master your first word"        },
  { id: "words_25",      icon: "⭐", label: "Vocabulary Builder",  desc: "Master 25 words"               },
  { id: "words_100",     icon: "🏆", label: "Word Master",         desc: "Master 100 words"              },
  { id: "streak_3",      icon: "🔥", label: "On a Roll",           desc: "3-day learning streak"         },
  { id: "streak_7",      icon: "💪", label: "Week Warrior",        desc: "7-day learning streak"         },
  { id: "xp_500",        icon: "⚡", label: "XP Hunter",           desc: "Earn 500 XP"                   },
  { id: "xp_1000",       icon: "👑", label: "XP Champion",         desc: "Earn 1000 XP"                  },
  { id: "chat_first",    icon: "💬", label: "Conversation Starter",desc: "Have your first AI chat"       },
  { id: "placement_done",icon: "🧭", label: "Level Set",           desc: "Complete the placement test"  },
];

export function checkNewAchievements(p: UserProgress): string[] {
  const earned = new Set(p.achievements ?? []);
  const newOnes: string[] = [];

  function check(id: string, condition: boolean) {
    if (condition && !earned.has(id)) newOnes.push(id);
  }

  check("first_lesson",   p.completedLessons.length >= 1);
  check("lessons_10",     p.completedLessons.length >= 10);
  check("lessons_25",     p.completedLessons.length >= 25);
  check("first_word",     p.vocabularyKnown.length >= 1);
  check("words_25",       p.vocabularyKnown.length >= 25);
  check("words_100",      p.vocabularyKnown.length >= 100);
  check("streak_3",       p.streak >= 3);
  check("streak_7",       p.streak >= 7);
  check("xp_500",         p.xp >= 500);
  check("xp_1000",        p.xp >= 1000);
  check("placement_done", !!p.placementDone);

  return newOnes;
}
