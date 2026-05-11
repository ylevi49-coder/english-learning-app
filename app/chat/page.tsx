"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { getProgress } from "@/lib/progress";
import { CEFRLevel } from "@/types";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";

type Scenario = "free" | "coffee" | "work" | "travel" | "shopping";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SCENARIOS: { key: Scenario; emoji: string; label: string; desc: string }[] = [
  { key: "free",     emoji: "💬", label: "Free Chat",    desc: "Any topic you like" },
  { key: "coffee",   emoji: "☕", label: "Coffee Shop",  desc: "Casual daily life chat" },
  { key: "work",     emoji: "💼", label: "Work Talk",    desc: "Professional English" },
  { key: "travel",   emoji: "✈️", label: "Travel",       desc: "Plan trips and adventures" },
  { key: "shopping", emoji: "🛍️", label: "Shopping",     desc: "Buy things in English" },
];

export default function ChatPage() {
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario>("free");
  const [level, setLevel] = useState<CEFRLevel>("B1");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = getProgress();
    setLevel(p.level);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function startChat() {
    setStarted(true);
    setMessages([]);
    setLoading(true);

    const opening: Record<Scenario, string> = {
      free:     "Hi! I'm Emma, your English conversation partner 😊 What would you like to talk about today?",
      coffee:   "Hi! Welcome to my favourite coffee shop ☕ What can I get you? Or shall we just sit and chat?",
      work:     "Good morning! I'm Emma, your colleague. How was your weekend? Ready for the week ahead? 💼",
      travel:   "Hey! I heard you're planning a trip ✈️ Where are you thinking of going?",
      shopping: "Hi there! Welcome to the shop 🛍️ Can I help you find something?",
    };

    const firstMessage: Message = { role: "assistant", content: `💬 **Emma:** ${opening[scenario]}\n\n📝 **Corrections:** ✓ Perfect English!` };
    setMessages([firstMessage]);
    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.role === "assistant" ? extractConversation(m.content) : m.content,
          })),
          scenario,
          level,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "💬 **Emma:** Sorry, I had a connection issue. Can you try again?\n\n📝 **Corrections:** –" }]);
    } finally {
      setLoading(false);
    }
  }

  function extractConversation(text: string): string {
    const match = text.match(/💬 \*\*Emma:\*\* ([\s\S]*?)(?:\n\n📝|$)/);
    return match ? match[1].trim() : text;
  }

  function resetChat() {
    setStarted(false);
    setMessages([]);
    setInput("");
  }

  const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
          <div className="max-w-lg mx-auto">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 text-sm mb-3">
              <ArrowLeft size={16} /> Back
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">👩‍🏫</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chat with Emma</h1>
                <p className="text-sm text-gray-500">Your AI English conversation partner</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-5 py-5 space-y-5 animate-fadeIn">
          {/* Scenario */}
          <div>
            <h2 className="font-bold text-gray-900 mb-3">Choose a scenario</h2>
            <div className="grid grid-cols-1 gap-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setScenario(s.key)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                    scenario === s.key ? "border-primary-500 bg-primary-50" : "border-gray-200 bg-white hover:border-primary-200"
                  )}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <p className={cn("font-semibold text-sm", scenario === s.key ? "text-primary-700" : "text-gray-900")}>{s.label}</p>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <h2 className="font-bold text-gray-900 mb-3">Your level</h2>
            <div className="flex gap-2 flex-wrap">
              {levels.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold border-2 transition-all",
                    level === l ? "border-primary-500 bg-primary-600 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-primary-300"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startChat}
            className="w-full btn-primary text-base py-4 rounded-2xl flex items-center justify-center gap-2"
          >
            <span className="text-xl">👩‍🏫</span> Start Chatting with Emma
          </button>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-purple-800">
            <p className="font-semibold mb-1">How it works:</p>
            <ul className="space-y-1 text-xs">
              <li>💬 Emma replies naturally to what you write</li>
              <li>📝 She points out grammar mistakes gently</li>
              <li>🎯 Difficulty adapts to your level</li>
              <li>🔄 You can change scenario anytime</li>
            </ul>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Chat header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-3 flex-shrink-0">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={resetChat} className="text-gray-500 hover:text-gray-900 p-1">
            <ArrowLeft size={20} />
          </button>
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg">👩‍🏫</div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">Emma</p>
            <p className="text-xs text-green-500 font-medium">● Online • {SCENARIOS.find(s => s.key === scenario)?.label} • {level}</p>
          </div>
          <button onClick={resetChat} className="text-gray-400 hover:text-gray-600 p-1" title="New chat">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
        <div className="max-w-lg mx-auto space-y-4">
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} />
          ))}
          {loading && (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm flex-shrink-0">👩‍🏫</div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-bottom">
        <div className="max-w-lg mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Write in English..."
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-primary-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  // Parse Emma's reply into conversation + corrections
  const convMatch = message.content.match(/💬 \*\*Emma:\*\* ([\s\S]*?)(?=\n\n📝|\n📝|$)/);
  const corrMatch = message.content.match(/📝 \*\*Corrections:\*\* ([\s\S]*?)$/);

  const conversation = convMatch ? convMatch[1].trim() : message.content;
  const corrections = corrMatch ? corrMatch[1].trim() : null;
  const isPerfect = corrections?.startsWith("✓");

  return (
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm flex-shrink-0 mt-1">👩‍🏫</div>
      <div className="space-y-2 max-w-[85%]">
        {/* Emma's reply */}
        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 text-sm text-gray-800 leading-relaxed">
          {conversation}
        </div>
        {/* Corrections */}
        {corrections && (
          <div className={cn(
            "rounded-xl px-3 py-2 text-xs",
            isPerfect ? "bg-green-50 text-green-700 border border-green-200" : "bg-orange-50 text-orange-800 border border-orange-200"
          )}>
            <span className="font-semibold">📝 </span>
            <span className="whitespace-pre-line">{corrections}</span>
          </div>
        )}
      </div>
    </div>
  );
}
