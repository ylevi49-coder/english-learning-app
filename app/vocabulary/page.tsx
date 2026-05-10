"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, RotateCcw, Star } from "lucide-react";
import { LESSONS } from "@/lib/curriculum";
import { getProgress, markWordKnown } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import LevelBadge from "@/components/LevelBadge";
import BottomNav from "@/components/BottomNav";
import { VocabWord, CEFRLevel } from "@/types";
import { cn } from "@/lib/utils";

interface CardWithLevel extends VocabWord {
  level: CEFRLevel;
}

export default function VocabularyPage() {
  const [allWords, setAllWords] = useState<CardWithLevel[]>([]);
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [filterLevel, setFilterLevel] = useState<CEFRLevel | "all">("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<"flashcard" | "list">("flashcard");

  useEffect(() => {
    const words: CardWithLevel[] = LESSONS.flatMap((l) =>
      l.vocabulary.map((w) => ({ ...w, level: l.level }))
    );
    setAllWords(words);
    setKnownWords(getProgress().vocabularyKnown);
  }, []);

  const filtered = filterLevel === "all"
    ? allWords
    : allWords.filter((w) => w.level === filterLevel);

  const unknown = filtered.filter((w) => !knownWords.includes(w.id));
  const card = unknown[currentIdx] ?? filtered[currentIdx];

  function handleKnow() {
    if (!card) return;
    markWordKnown(card.id);
    setKnownWords((prev) => [...prev, card.id]);
    setFlipped(false);
    if (currentIdx >= unknown.length - 1) setCurrentIdx(0);
  }

  function handleNext() {
    setFlipped(false);
    setCurrentIdx((i) => (i + 1) % Math.max(filtered.length, 1));
  }

  function handlePrev() {
    setFlipped(false);
    setCurrentIdx((i) => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1));
  }

  const levels: (CEFRLevel | "all")[] = ["all", "A1", "A2", "B1", "B2", "C1", "C2"];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Vocabulary</h1>
          <p className="text-sm text-gray-500 mb-3">
            {knownWords.length} words mastered out of {allWords.length}
          </p>

          {/* Level filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {levels.map((l) => (
              <button
                key={l}
                onClick={() => { setFilterLevel(l); setCurrentIdx(0); setFlipped(false); }}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filterLevel === l ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {l === "all" ? "All" : l}
              </button>
            ))}
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setMode("flashcard")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === "flashcard" ? "bg-primary-100 text-primary-700" : "text-gray-500 hover:bg-gray-100"}`}
            >
              Flashcards
            </button>
            <button
              onClick={() => setMode("list")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === "list" ? "bg-primary-100 text-primary-700" : "text-gray-500 hover:bg-gray-100"}`}
            >
              Word List
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-5 animate-fadeIn">
        {mode === "flashcard" ? (
          <>
            {filtered.length === 0 ? (
              <p className="text-center text-gray-400 mt-20">No words in this level yet.</p>
            ) : (
              <FlashcardMode
                card={card}
                flipped={flipped}
                onFlip={() => setFlipped((f) => !f)}
                onKnow={handleKnow}
                onPrev={handlePrev}
                onNext={handleNext}
                known={card ? knownWords.includes(card.id) : false}
                current={currentIdx + 1}
                total={filtered.length}
                unknownCount={unknown.length}
              />
            )}
          </>
        ) : (
          <WordList words={filtered} knownWords={knownWords} onMarkKnown={(id) => {
            markWordKnown(id);
            setKnownWords((prev) => [...prev, id]);
          }} />
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function FlashcardMode({
  card, flipped, onFlip, onKnow, onPrev, onNext, known, current, total, unknownCount
}: {
  card: CardWithLevel | undefined;
  flipped: boolean;
  onFlip: () => void;
  onKnow: () => void;
  onPrev: () => void;
  onNext: () => void;
  known: boolean;
  current: number;
  total: number;
  unknownCount: number;
}) {
  if (!card) return <p className="text-center text-gray-400 mt-20">No words available.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{current} / {total}</span>
        <span className="flex items-center gap-1 text-green-600 font-medium">
          <CheckCircle size={14} />
          {total - unknownCount} known
        </span>
      </div>

      {/* Flashcard */}
      <button
        onClick={onFlip}
        className="w-full min-h-56 card border-2 border-primary-100 flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
      >
        {known && (
          <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
            <Star size={12} fill="currentColor" /> Known
          </div>
        )}
        {!flipped ? (
          <>
            <LevelBadge level={card.level} />
            <p className="text-3xl font-bold text-gray-900">{card.word}</p>
            <p className="text-sm text-gray-400">Tap to reveal translation</p>
          </>
        ) : (
          <>
            <p className="text-xl font-bold text-primary-600">{card.translation}</p>
            <p className="text-gray-600 text-sm italic">"{card.example}"</p>
          </>
        )}
      </button>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onPrev} className="flex-1">
          <ChevronLeft size={18} />
        </Button>
        {!known && (
          <Button onClick={onKnow} className="flex-[2] bg-green-600 hover:bg-green-700">
            <CheckCircle size={16} className="mr-1" /> I know this
          </Button>
        )}
        <Button variant="secondary" onClick={onNext} className="flex-1">
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}

function WordList({ words, knownWords, onMarkKnown }: {
  words: CardWithLevel[];
  knownWords: string[];
  onMarkKnown: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {words.map((w) => {
        const known = knownWords.includes(w.id);
        return (
          <div
            key={w.id}
            className={`card flex items-center gap-3 border-2 ${known ? "border-green-200 bg-green-50/40" : "border-transparent"}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{w.word}</span>
                <LevelBadge level={w.level} />
              </div>
              <p className="text-primary-600 text-sm">{w.translation}</p>
              <p className="text-gray-400 text-xs italic truncate">{w.example}</p>
            </div>
            {!known && (
              <button
                onClick={() => onMarkKnown(w.id)}
                className="p-2 rounded-xl hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors flex-shrink-0"
              >
                <CheckCircle size={20} />
              </button>
            )}
            {known && <CheckCircle size={20} className="text-green-500 flex-shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}
