import { CEFRLevel } from "@/types";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<CEFRLevel, string> = {
  A1: "bg-green-100 text-green-700",
  A2: "bg-emerald-100 text-emerald-700",
  B1: "bg-blue-100 text-blue-700",
  B2: "bg-indigo-100 text-indigo-700",
  C1: "bg-purple-100 text-purple-700",
  C2: "bg-rose-100 text-rose-700",
};

export default function LevelBadge({ level, className }: { level: CEFRLevel; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold", COLOR_MAP[level], className)}>
      {level}
    </span>
  );
}
