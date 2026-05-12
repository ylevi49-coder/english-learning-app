"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";

interface Word {
  word: string;
  heb: string;
  type: string;
  example: string;
}

const WORDS: Word[] = [
  { word: "Resilient",    heb: "עמיד / חסין",        type: "adj", example: "She is resilient — nothing stops her." },
  { word: "Grateful",     heb: "אסיר תודה",           type: "adj", example: "I'm so grateful for your help." },
  { word: "Opportunity",  heb: "הזדמנות",             type: "n",   example: "This is a great opportunity to learn." },
  { word: "Confident",    heb: "בטוח בעצמו",          type: "adj", example: "Speak in a confident voice." },
  { word: "Achieve",      heb: "להשיג / להצליח",      type: "v",   example: "You can achieve anything you set your mind to." },
  { word: "Persist",      heb: "להתמיד",              type: "v",   example: "Persist even when it gets hard." },
  { word: "Fluent",       heb: "שוטף (בשפה)",         type: "adj", example: "She is fluent in three languages." },
  { word: "Determine",    heb: "לקבוע / לבחור",       type: "v",   example: "Hard work determines your success." },
  { word: "Enthusiasm",   heb: "התלהבות",             type: "n",   example: "He showed great enthusiasm for learning." },
  { word: "Curious",      heb: "סקרן",                type: "adj", example: "Be curious — always ask questions." },
  { word: "Accomplish",   heb: "להשלים / להשיג",      type: "v",   example: "I accomplished all my goals this week." },
  { word: "Challenge",    heb: "אתגר",                type: "n",   example: "Every challenge makes you stronger." },
  { word: "Patient",      heb: "סבלני",               type: "adj", example: "Be patient with yourself while learning." },
  { word: "Communicate",  heb: "לתקשר",               type: "v",   example: "It's important to communicate clearly." },
  { word: "Vocabulary",   heb: "אוצר מילים",          type: "n",   example: "Reading every day builds your vocabulary." },
  { word: "Dedicate",     heb: "להקדיש",              type: "v",   example: "He dedicates one hour a day to English." },
  { word: "Improve",      heb: "לשפר",                type: "v",   example: "You improve every time you practice." },
  { word: "Ambitious",    heb: "שאפתן",               type: "adj", example: "She has ambitious goals for her career." },
  { word: "Encourage",    heb: "לעודד",               type: "v",   example: "Good teachers always encourage their students." },
  { word: "Consistent",   heb: "עקבי / קבוע",         type: "adj", example: "Consistent practice leads to fluency." },
  { word: "Overcome",     heb: "להתגבר על",           type: "v",   example: "She overcame her fear of speaking English." },
  { word: "Progress",     heb: "התקדמות",             type: "n",   example: "Your progress this week is impressive!" },
  { word: "Inspire",      heb: "לעורר השראה",         type: "v",   example: "Great speakers inspire their audience." },
  { word: "Fluency",      heb: "שטף (בדיבור)",        type: "n",   example: "Fluency comes with practice and confidence." },
  { word: "Remarkable",   heb: "מרשים / יוצא דופן",   type: "adj", example: "Your improvement is remarkable!" },
  { word: "Effort",       heb: "מאמץ",                type: "n",   example: "Every effort you make counts." },
  { word: "Fluent",       heb: "שוטף",                type: "adj", example: "He speaks fluent English." },
  { word: "Strategy",     heb: "אסטרטגיה",            type: "n",   example: "What is your study strategy?" },
  { word: "Essential",    heb: "חיוני / הכרחי",       type: "adj", example: "Practice is essential for learning." },
  { word: "Hesitate",     heb: "להסס",                type: "v",   example: "Don't hesitate to ask for help." },
  { word: "Dedicated",    heb: "מסור",                type: "adj", example: "She is a dedicated student." },
];

function getTodayWord(): Word {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return WORDS[dayOfYear % WORDS.length];
}

export default function WordOfDay() {
  const word = getTodayWord();
  const [revealed, setRevealed] = useState(false);

  function speak() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utt = new SpeechSynthesisUtterance(word.word);
      utt.lang = "en-US";
      window.speechSynthesis.speak(utt);
    }
  }

  return (
    <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider">⭐ Word of the Day</p>
        <button onClick={speak} className="text-yellow-500 hover:text-yellow-700 transition-colors">
          <Volume2 size={16} />
        </button>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <h3 className="text-2xl font-black text-gray-900">{word.word}</h3>
        <span className="text-xs text-gray-400 font-medium">{word.type}.</span>
      </div>
      <p className="text-sm font-semibold text-yellow-800 mb-2">{word.heb}</p>
      <button
        onClick={() => setRevealed(r => !r)}
        className="text-xs text-yellow-600 underline mb-1"
      >
        {revealed ? "Hide example" : "See example sentence"}
      </button>
      {revealed && (
        <p className="text-sm text-gray-600 italic mt-1">"{word.example}"</p>
      )}
    </div>
  );
}
