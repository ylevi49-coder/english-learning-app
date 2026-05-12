"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Star, Volume2, RotateCcw, Pencil } from "lucide-react";

function speakWord(word: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(word);
  utt.lang = "en-US";
  utt.rate = 0.85;
  const voices = window.speechSynthesis.getVoices();
  const eng = voices.find(v => v.lang.startsWith("en"));
  if (eng) utt.voice = eng;
  window.speechSynthesis.speak(utt);
}

import { LESSONS } from "@/lib/curriculum";
import { VOCAB_BANK } from "@/lib/vocab-bank";
import { getProgress, markWordKnown, markWordHard, unmarkWordHard } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import LevelBadge from "@/components/LevelBadge";
import BottomNav from "@/components/BottomNav";
import { VocabWord, CEFRLevel } from "@/types";
import { cn } from "@/lib/utils";

interface CardWithLevel extends VocabWord {
  level: CEFRLevel;
  source?: "lesson" | "bank";
}

type ViewMode = "flashcard" | "recall" | "list";

export default function VocabularyPage() {
  const [allWords, setAllWords] = useState<CardWithLevel[]>([]);
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [hardWords, setHardWords] = useState<string[]>([]);
  const [filterLevel, setFilterLevel] = useState<CEFRLevel | "all" | "hard">("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<ViewMode>("flashcard");

  useEffect(() => {
    const lessonWords: CardWithLevel[] = LESSONS.flatMap((l) =>
      l.vocabulary.map((w) => ({ ...w, level: l.level, source: "lesson" as const }))
    );
    const bankWords: CardWithLevel[] = VOCAB_BANK.map((w) => ({ ...w, source: "bank" as const }));
    // deduplicate by id
    const seen = new Set<string>();
    const combined = [...lessonWords, ...bankWords].filter((w) => {
      if (seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });
    setAllWords(combined);
    const p = getProgress();
    setKnownWords(p.vocabularyKnown);
    setHardWords(p.vocabularyHard ?? []);
  }, []);

  const filtered =
    filterLevel === "all" ? allWords :
    filterLevel === "hard" ? allWords.filter(w => hardWords.includes(w.id)) :
    allWords.filter(w => w.level === filterLevel);

  // Hard words first, then unknown, then known
  const sorted = [
    ...filtered.filter(w => hardWords.includes(w.id) && !knownWords.includes(w.id)),
    ...filtered.filter(w => !hardWords.includes(w.id) && !knownWords.includes(w.id)),
    ...filtered.filter(w => knownWords.includes(w.id)),
  ];

  const card = sorted[currentIdx] ?? sorted[0];

  function handleKnow() {
    if (!card) return;
    markWordKnown(card.id);
    setKnownWords(prev => [...prev, card.id]);
    setHardWords(prev => prev.filter(id => id !== card.id));
    setFlipped(false);
    setCurrentIdx(i => (i >= sorted.length - 1 ? 0 : i));
  }

  function handleHard() {
    if (!card) return;
    markWordHard(card.id);
    setHardWords(prev => prev.includes(card.id) ? prev : [...prev, card.id]);
    setFlipped(false);
    handleNext();
  }

  function handleUnhard() {
    if (!card) return;
    unmarkWordHard(card.id);
    setHardWords(prev => prev.filter(id => id !== card.id));
  }

  function handleNext() {
    setFlipped(false);
    setCurrentIdx(i => (i + 1) % Math.max(sorted.length, 1));
  }

  function handlePrev() {
    setFlipped(false);
    setCurrentIdx(i => (i - 1 + Math.max(sorted.length, 1)) % Math.max(sorted.length, 1));
  }

  const levels: (CEFRLevel | "all" | "hard")[] = ["all", "hard", "A1", "A2", "B1", "B2", "C1", "C2"];
  const hardCount = allWords.filter(w => hardWords.includes(w.id) && !knownWords.includes(w.id)).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Vocabulary</h1>
          <p className="text-sm text-gray-500 mb-3">
            {knownWords.length} known · {hardCount} to review · <span className="font-semibold text-gray-700">{allWords.length}</span> total words
          </p>

          {/* Level filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {levels.map((l) => (
              <button
                key={l}
                onClick={() => { setFilterLevel(l); setCurrentIdx(0); setFlipped(false); }}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filterLevel === l
                    ? l === "hard" ? "bg-orange-500 text-white" : "bg-primary-600 text-white"
                    : l === "hard" ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {l === "all" ? "All" : l === "hard" ? `🔁 Review (${hardCount})` : l}
              </button>
            ))}
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 mt-3">
            {(["flashcard", "recall", "list"] as ViewMode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === m ? "bg-primary-100 text-primary-700" : "text-gray-500 hover:bg-gray-100"
                }`}>
                {m === "flashcard" ? "Flashcards" : m === "recall" ? "✍️ Recall" : "Word List"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-5 animate-fadeIn">
        {sorted.length === 0 ? (
          <p className="text-center text-gray-400 mt-20">
            {filterLevel === "hard" ? "No words marked for review yet." : "No words in this level yet."}
          </p>
        ) : mode === "flashcard" ? (
          <FlashcardMode
            card={card}
            flipped={flipped}
            onFlip={() => setFlipped(f => !f)}
            onKnow={handleKnow}
            onHard={handleHard}
            onUnhard={handleUnhard}
            onPrev={handlePrev}
            onNext={handleNext}
            isKnown={card ? knownWords.includes(card.id) : false}
            isHard={card ? hardWords.includes(card.id) : false}
            current={currentIdx + 1}
            total={sorted.length}
          />
        ) : mode === "recall" ? (
          <RecallMode
            card={card}
            onKnow={handleKnow}
            onHard={handleHard}
            onNext={handleNext}
            isKnown={card ? knownWords.includes(card.id) : false}
            current={currentIdx + 1}
            total={sorted.length}
          />
        ) : (
          <WordList
            words={sorted}
            knownWords={knownWords}
            hardWords={hardWords}
            onMarkKnown={(id) => { markWordKnown(id); setKnownWords(p => [...p, id]); setHardWords(p => p.filter(x => x !== id)); }}
            onMarkHard={(id) => { markWordHard(id); setHardWords(p => p.includes(id) ? p : [...p, id]); }}
            onUnmarkHard={(id) => { unmarkWordHard(id); setHardWords(p => p.filter(x => x !== id)); }}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function FlashcardMode({ card, flipped, onFlip, onKnow, onHard, onUnhard, onPrev, onNext, isKnown, isHard, current, total }: {
  card: CardWithLevel | undefined;
  flipped: boolean; onFlip: () => void; onKnow: () => void; onHard: () => void; onUnhard: () => void;
  onPrev: () => void; onNext: () => void;
  isKnown: boolean; isHard: boolean; current: number; total: number;
}) {
  if (!card) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{current} / {total}</span>
        <div className="flex items-center gap-3">
          {isHard && <span className="text-orange-500 text-xs font-bold flex items-center gap-1"><RotateCcw size={12} /> Review</span>}
          {isKnown && <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><CheckCircle size={12} /> Known</span>}
        </div>
      </div>

      <button onClick={onFlip}
        className={cn("w-full min-h-56 card border-2 flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]",
          isHard ? "border-orange-200" : "border-primary-100")}>
        {!flipped ? (
          <>
            <div className="flex items-center gap-2">
              <LevelBadge level={card.level} />
              {(card as CardWithLevel & { topic?: string }).topic && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{(card as CardWithLevel & { topic?: string }).topic}</span>
              )}
            </div>
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

      <button onClick={() => speakWord(card.word)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm transition-all active:scale-95">
        <Volume2 size={16} /> Hear pronunciation
      </button>

      {/* Action buttons */}
      {!isKnown && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={isHard ? onUnhard : onHard}
            className={cn("py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5",
              isHard ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200")}>
            <RotateCcw size={15} /> {isHard ? "Remove review" : "Hard – review"}
          </button>
          <button onClick={onKnow}
            className="py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5">
            <CheckCircle size={15} /> I know this
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onPrev} className="flex-1"><ChevronLeft size={18} /></Button>
        <Button variant="secondary" onClick={onNext} className="flex-1"><ChevronRight size={18} /></Button>
      </div>
    </div>
  );
}

function RecallMode({ card, onKnow, onHard, onNext, isKnown, current, total }: {
  card: CardWithLevel | undefined;
  onKnow: () => void; onHard: () => void; onNext: () => void;
  isKnown: boolean; current: number; total: number;
}) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput("");
    setResult(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [card?.id]);

  if (!card) return null;

  function checkAnswer() {
    if (!input.trim()) return;
    const correct = card!.word.toLowerCase().trim();
    const given = input.toLowerCase().trim();
    setResult(given === correct ? "correct" : "wrong");
  }

  function handleNext() {
    setInput("");
    setResult(null);
    onNext();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{current} / {total}</span>
        <div className="flex items-center gap-1 text-purple-600 text-xs font-semibold">
          <Pencil size={12} /> Active Recall
        </div>
      </div>

      {/* Card showing translation */}
      <div className="w-full min-h-48 card border-2 border-primary-100 flex flex-col items-center justify-center text-center gap-3">
        <LevelBadge level={card.level} />
        <p className="text-2xl font-bold text-primary-600">{card.translation}</p>
        <p className="text-gray-400 text-sm italic">"{card.example.replace(card.word, "___")}"</p>
        <p className="text-xs text-gray-400">Type the English word ↓</p>
      </div>

      {/* Input */}
      {result === null ? (
        <div className="space-y-3">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && checkAnswer()}
            placeholder="Type the English word..."
            className="w-full bg-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-center font-semibold"
          />
          <Button onClick={checkAnswer} disabled={!input.trim()} className="w-full">Check answer</Button>
        </div>
      ) : result === "correct" ? (
        <div className="space-y-3">
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4 text-center">
            <p className="text-green-700 font-bold text-lg">✓ Correct!</p>
            <p className="text-green-600 text-sm mt-1">{card.word}</p>
          </div>
          <button onClick={() => speakWord(card.word)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold">
            <Volume2 size={14} /> Hear it
          </button>
          <div className="grid grid-cols-2 gap-3">
            {!isKnown && (
              <button onClick={onKnow}
                className="py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm flex items-center justify-center gap-1.5">
                <Star size={14} /> Mark as known
              </button>
            )}
            <button onClick={handleNext}
              className={cn("py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm flex items-center justify-center gap-1.5",
                isKnown && "col-span-2")}>
              Next word <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
            <p className="text-red-600 font-bold">✗ Not quite</p>
            <p className="text-gray-500 text-sm mt-1">The word was:</p>
            <p className="text-gray-900 font-bold text-xl mt-0.5">{card.word}</p>
          </div>
          <button onClick={() => speakWord(card.word)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold">
            <Volume2 size={14} /> Hear it
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { onHard(); setResult(null); setInput(""); }}
              className="py-2.5 rounded-xl bg-orange-100 text-orange-700 font-semibold text-sm flex items-center justify-center gap-1.5">
              <RotateCcw size={14} /> Add to review
            </button>
            <button onClick={handleNext}
              className="py-2.5 rounded-xl bg-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-1.5">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WordList({ words, knownWords, hardWords, onMarkKnown, onMarkHard, onUnmarkHard }: {
  words: CardWithLevel[];
  knownWords: string[];
  hardWords: string[];
  onMarkKnown: (id: string) => void;
  onMarkHard: (id: string) => void;
  onUnmarkHard: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {words.map((w) => {
        const known = knownWords.includes(w.id);
        const hard = hardWords.includes(w.id);
        return (
          <div key={w.id}
            className={cn("card flex items-center gap-3 border-2",
              known ? "border-green-200 bg-green-50/40" :
              hard ? "border-orange-200 bg-orange-50/40" : "border-transparent")}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{w.word}</span>
                <LevelBadge level={w.level} />
                {(w as CardWithLevel & { topic?: string }).topic && (
                  <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">{(w as CardWithLevel & { topic?: string }).topic}</span>
                )}
                {hard && !known && <span className="text-xs text-orange-500 font-bold">🔁</span>}
                <button onClick={() => speakWord(w.word)}
                  className="p-1 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0">
                  <Volume2 size={14} />
                </button>
              </div>
              <p className="text-primary-600 text-sm">{w.translation}</p>
              <p className="text-gray-400 text-xs italic truncate">{w.example}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!known && (
                <>
                  <button onClick={() => hard ? onUnmarkHard(w.id) : onMarkHard(w.id)}
                    className={cn("p-2 rounded-xl transition-colors",
                      hard ? "text-orange-500 bg-orange-100" : "text-gray-300 hover:text-orange-500 hover:bg-orange-50")}>
                    <RotateCcw size={18} />
                  </button>
                  <button onClick={() => onMarkKnown(w.id)}
                    className="p-2 rounded-xl hover:bg-green-100 text-gray-300 hover:text-green-600 transition-colors">
                    <CheckCircle size={20} />
                  </button>
                </>
              )}
              {known && <CheckCircle size={20} className="text-green-500" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
