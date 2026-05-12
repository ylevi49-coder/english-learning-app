"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Star, BarChart2, MessageCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/lessons", icon: BookOpen, label: "Lessons" },
  { href: "/vocabulary", icon: Star, label: "Vocab" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/progress", icon: BarChart2, label: "Progress" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom z-50">
      <div className="flex items-stretch max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors",
                active ? "text-primary-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
        <Link
          href="/settings"
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors",
            pathname === "/settings" ? "text-primary-600" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <div className="relative">
            <Settings size={22} strokeWidth={pathname === "/settings" ? 2.5 : 1.8} />
            {user && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
            )}
          </div>
          <span>Settings</span>
        </Link>
      </div>
    </nav>
  );
}
