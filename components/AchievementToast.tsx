"use client";

import { useEffect, useState } from "react";
import { ACHIEVEMENTS } from "@/lib/achievements";

interface Props {
  newIds: string[];
  onDone: () => void;
}

export default function AchievementToast({ newIds, onDone }: Props) {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!newIds.length) { onDone(); return; }
    const t = setTimeout(() => {
      if (index + 1 < newIds.length) setIndex(i => i + 1);
      else { setVisible(false); setTimeout(onDone, 300); }
    }, 2500);
    return () => clearTimeout(t);
  }, [index, newIds, onDone]);

  if (!newIds.length) return null;
  const ach = ACHIEVEMENTS.find(a => a.id === newIds[index]);
  if (!ach) return null;

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="bg-gray-900 text-white rounded-2xl px-5 py-3 flex items-center gap-3 shadow-2xl">
        <span className="text-2xl">{ach.icon}</span>
        <div>
          <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">Achievement unlocked!</p>
          <p className="font-bold text-sm">{ach.label}</p>
          <p className="text-xs text-gray-400">{ach.desc}</p>
        </div>
      </div>
    </div>
  );
}
