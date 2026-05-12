"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Lightbulb, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { GRAMMAR } from "@/lib/grammar";
import { LEVEL_INFO } from "@/lib/curriculum";
import LevelBadge from "@/components/LevelBadge";
import BottomNav from "@/components/BottomNav";
import type { CEFRLevel } from "@/types";

export default function GrammarPage() {
  const router = useRouter();
  const [activeLevel, setActiveLevel] = useState<CEFRLevel>("A1");
  const [openRule, setOpenRule] = useState<string | null>(null);

  const section = GRAMMAR.find(s => s.level === activeLevel);
  const levelInfo = LEVEL_INFO.find(l => l.level === activeLevel)!;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={22} className="text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Grammar Guide</h1>
          </div>

          {/* Level tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {LEVEL_INFO.map(({ level }) => (
              <button
                key={level}
                onClick={() => { setActiveLevel(level); setOpenRule(null); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeLevel === level
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-4 space-y-3 animate-fadeIn">
        {/* Level header */}
        <div className={`card ${levelInfo.bgColor} border ${levelInfo.borderColor}`}>
          <div className="flex items-center gap-2 mb-1">
            <LevelBadge level={activeLevel} />
            <span className={`font-bold ${levelInfo.color}`}>{levelInfo.name}</span>
          </div>
          <p className="text-sm text-gray-600">
            {section?.rules.length ?? 0} grammar rules for this level
          </p>
        </div>

        {/* Rules */}
        {section?.rules.map(rule => {
          const isOpen = openRule === rule.id;
          return (
            <div key={rule.id} className="card overflow-hidden">
              {/* Rule header — always visible */}
              <button
                className="w-full flex items-center justify-between text-left"
                onClick={() => setOpenRule(isOpen ? null : rule.id)}
              >
                <div>
                  <p className="font-bold text-gray-900">{rule.title}</p>
                  <p className="text-sm text-gray-500">{rule.subtitle}</p>
                </div>
                {isOpen
                  ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
                  : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                }
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
                  {/* Explanation */}
                  <p className="text-sm text-gray-700 leading-relaxed">{rule.explanation}</p>

                  {/* Structure */}
                  {rule.structure && (
                    <div className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Structure</p>
                      <p className="text-sm font-mono text-primary-700 font-semibold">{rule.structure}</p>
                    </div>
                  )}

                  {/* Examples */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Examples</p>
                    <div className="space-y-2">
                      {rule.examples.map((ex, i) => (
                        <div key={i} className="bg-blue-50 rounded-xl px-4 py-3">
                          <p className="text-sm font-semibold text-blue-900">{ex.en}</p>
                          <p className="text-xs text-blue-600 mt-0.5">{ex.he}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tip */}
                  {rule.tip && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex gap-2">
                      <Lightbulb size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-800">{rule.tip}</p>
                    </div>
                  )}

                  {/* Common mistakes */}
                  {rule.common_mistakes && rule.common_mistakes.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <AlertTriangle size={14} className="text-red-400" />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Common mistakes</p>
                      </div>
                      <div className="space-y-1.5">
                        {rule.common_mistakes.map((m, i) => (
                          <div key={i} className="bg-red-50 rounded-xl px-4 py-2">
                            <p className="text-sm text-red-700 font-mono">{m}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
