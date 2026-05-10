export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface Lesson {
  id: string;
  level: CEFRLevel;
  unit: number;
  title: string;
  description: string;
  vocabulary: VocabWord[];
  grammar: GrammarPoint;
  exercises: Exercise[];
  readingText?: string;
}

export interface VocabWord {
  id: string;
  word: string;
  translation: string;
  example: string;
  pronunciation?: string;
}

export interface GrammarPoint {
  title: string;
  explanation: string;
  examples: string[];
  tip?: string;
}

export type ExerciseType =
  | "multiple_choice"
  | "fill_blank"
  | "match_words"
  | "reorder_words"
  | "true_false";

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  answer: string | string[];
  explanation?: string;
}

export interface UserProgress {
  userId: string;
  level: CEFRLevel;
  completedLessons: string[];
  vocabularyKnown: string[];
  xp: number;
  streak: number;
  lastActivity: string;
}

export interface LevelInfo {
  level: CEFRLevel;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  totalLessons: number;
}
