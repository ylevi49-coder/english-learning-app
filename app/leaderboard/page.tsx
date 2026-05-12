"use client";

import { useEffect, useState } from "react";
import { Trophy, Flame, BookOpen, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";
import LevelBadge from "@/components/LevelBadge";
import type { CEFRLevel } from "@/types";

interface LeaderboardEntry {
  display_name: string;
  level: CEFRLevel;
  xp: number;
  streak: number;
  lessons_count: number;
  is_me?: boolean;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data, error } = await supabase.rpc("get_leaderboard");
      if (error) { console.error(error); setLoading(false); return; }
      const rows = (data as LeaderboardEntry[]).map(row => ({
        ...row,
        is_me: false,
      }));
      // Mark current user if signed in
      if (user) {
        const { data: mine } = await supabase
          .from("user_progress")
          .select("display_name")
          .eq("user_id", user.id)
          .single();
        if (mine) {
          for (const row of rows) {
            if (row.display_name === mine.display_name) { row.is_me = true; break; }
          }
        }
      }
      setEntries(rows);
      setLoading(false);
    }
    fetchLeaderboard();
  }, [user]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 px-5 pt-12 pb-8">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-yellow-100 hover:text-white mb-3 text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            <Trophy size={28} className="text-white" />
            <div>
              <h1 className="text-white text-2xl font-bold">Leaderboard</h1>
              <p className="text-yellow-100 text-sm">Top learners by XP</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-4 space-y-2 animate-slideUp">
        {loading ? (
          <div className="card text-center py-10 text-gray-400">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-gray-500 text-sm">No data yet — be the first to sign up and practice!</p>
          </div>
        ) : (
          entries.map((entry, i) => (
            <div
              key={i}
              className={`card flex items-center gap-3 ${
                entry.is_me ? "border-2 border-primary-400 bg-primary-50" : ""
              }`}
            >
              <div className="w-8 text-center">
                {i < 3 ? (
                  <span className="text-xl">{medals[i]}</span>
                ) : (
                  <span className="text-sm font-bold text-gray-400">#{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 truncate">
                    {entry.display_name}
                    {entry.is_me && <span className="text-xs text-primary-600 font-normal ml-1">(you)</span>}
                  </p>
                  <LevelBadge level={entry.level} />
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <BookOpen size={11} /> {entry.lessons_count} lessons
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Flame size={11} className="text-orange-400" /> {entry.streak} streak
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-yellow-600">{entry.xp.toLocaleString()}</p>
                <p className="text-xs text-gray-400">XP</p>
              </div>
            </div>
          ))
        )}

        {!user && (
          <div className="card bg-primary-50 border border-primary-200 text-center py-4">
            <p className="text-sm text-primary-700 mb-2">Sign in to appear on the leaderboard!</p>
            <button onClick={() => router.push("/login")} className="bg-primary-600 text-white text-sm font-bold px-4 py-2 rounded-xl">
              Sign in
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
