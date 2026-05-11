"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Send, RefreshCw, Mic, MicOff, Volume2 } from "lucide-react";
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
  { key: "free",     emoji: "💬", label: "Free Chat",   desc: "Any topic you like" },
  { key: "coffee",   emoji: "☕", label: "Coffee Shop", desc: "Casual daily life chat" },
  { key: "work",     emoji: "💼", label: "Work Talk",   desc: "Professional English" },
  { key: "travel",   emoji: "✈️", label: "Travel",      desc: "Plan trips and adventures" },
  { key: "shopping", emoji: "🛍️", label: "Shopping",    desc: "Buy things in English" },
];

export default function ChatPage() {
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario>("free");
  const [level, setLevel] = useState<CEFRLevel>("B1");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  // Voice
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = getProgress();
    setLevel(p.level);
    // Check browser support
    const SR = (window as unknown as { SpeechRecognition?: // eslint-disable-next-line @typescript-eslint/no-explicit-any
new () => any; webkitSpeechRecognition?: // eslint-disable-next-line @typescript-eslint/no-explicit-any
new () => any }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: // eslint-disable-next-line @typescript-eslint/no-explicit-any
new () => any }).webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, liveTranscript]);

  function speakText(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-US";
    utt.rate = 0.9;
    utt.pitch = 1.1;
    // prefer a female voice
    const voices = window.speechSynthesis.getVoices();
    const female = voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
      ?? voices.find(v => v.lang.startsWith("en") && (v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Moira") || v.name.includes("Victoria")))
      ?? voices.find(v => v.lang.startsWith("en"));
    if (female) utt.voice = female;
    window.speechSynthesis.speak(utt);
  }

  const startListening = useCallback(() => {
    const SR = (window as unknown as { SpeechRecognition?: // eslint-disable-next-line @typescript-eslint/no-explicit-any
new () => any; webkitSpeechRecognition?: // eslint-disable-next-line @typescript-eslint/no-explicit-any
new () => any }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: // eslint-disable-next-line @typescript-eslint/no-explicit-any
new () => any }).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setLiveTranscript("");
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setLiveTranscript(final || interim);
      if (final) {
        setInput(final);
        setLiveTranscript("");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setLiveTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  async function startChat() {
    setStarted(true);
    setMessages([]);
    setInput("");
    setLoading(true);

    const opening: Record<Scenario, string> = {
      free:     "Hi! I'm Emma, your English conversation partner 😊 What would you like to talk about today?",
      coffee:   "Hi! Welcome, grab a seat ☕ What can I get you? Or shall we just chat for a while?",
      work:     "Good morning! I'm Emma, your colleague. How was your weekend? Ready for the week? 💼",
      travel:   "Hey! I heard you're planning a trip ✈️ Where are you thinking of going?",
      shopping: "Hi there! Welcome to the store 🛍️ Can I help you find something today?",
    };

    const firstMessage: Message = {
      role: "assistant",
      content: `💬 **Emma:** ${opening[scenario]}\n\n📝 **Corrections:** ✓ Perfect English!`,
    };
    setMessages([firstMessage]);
    setLoading(false);
    setTimeout(() => speakText(opening[scenario]), 300);
  }

  async function sendMessage(textToSend?: string) {
    const text = (textToSend ?? input).trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLiveTranscript("");
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
        const conv = extractConversation(data.reply);
        if (conv) speakText(conv);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "💬 **Emma:** Sorry, I had a connection issue. Try again?\n\n📝 **Corrections:** –",
      }]);
    } finally {
      setLoading(false);
    }
  }

  function extractConversation(text: string): string {
    const match = text.match(/💬 \*\*Emma:\*\* ([\s\S]*?)(?=\n\n📝|\n📝|$)/);
    return match ? match[1].trim() : text;
  }

  function resetChat() {
    window.speechSynthesis?.cancel();
    stopListening();
    setStarted(false);
    setMessages([]);
    setInput("");
    setLiveTranscript("");
  }

  const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

  // ── Setup screen ──────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-500 text-sm flex items-center gap-1">
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-5 py-5 space-y-5 animate-fadeIn">
          <div className="text-center pt-2">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-4xl mx-auto mb-3">👩‍🏫</div>
            <h1 className="text-2xl font-bold text-gray-900">Chat with Emma</h1>
            <p className="text-gray-500 text-sm mt-1">Speak or type in English – Emma corrects your mistakes</p>
            {voiceSupported && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-2 font-medium">
                <Mic size={11} /> Voice chat supported
              </span>
            )}
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">Choose a scenario</h2>
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

          <div>
            <h2 className="font-bold text-gray-900 mb-2">Your level</h2>
            <div className="flex gap-2 flex-wrap">
              {levels.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold border-2 transition-all",
                    level === l ? "border-primary-500 bg-primary-600 text-white" : "border-gray-200 bg-white text-gray-600"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button onClick={startChat} className="w-full btn-primary text-base py-4 rounded-2xl flex items-center justify-center gap-2">
            <span className="text-xl">👩‍🏫</span> Start Chatting with Emma
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Chat screen ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-3 flex-shrink-0">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={resetChat} className="text-gray-500 p-1"><ArrowLeft size={20} /></button>
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg">👩‍🏫</div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">Emma</p>
            <p className="text-xs text-green-500 font-medium">
              ● {SCENARIOS.find(s => s.key === scenario)?.emoji} {SCENARIOS.find(s => s.key === scenario)?.label} · {level}
            </p>
          </div>
          <button onClick={resetChat} className="text-gray-400 p-1"><RefreshCw size={18} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-36">
        <div className="max-w-lg mx-auto space-y-4">
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} onSpeak={speakText} />
          ))}

          {/* Live transcript bubble */}
          {isListening && (
            <div className="flex justify-end">
              <div className="bg-primary-100 border-2 border-primary-300 text-primary-800 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm italic">
                <span className="flex items-center gap-1 text-xs text-primary-500 mb-1 font-semibold not-italic">
                  <Mic size={11} /> Listening...
                </span>
                {liveTranscript || <span className="opacity-50">Say something in English...</span>}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm flex-shrink-0">👩‍🏫</div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                <span className="flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-bottom">
        <div className="max-w-lg mx-auto">
          {/* Text input row */}
          <div className="flex gap-2 mb-2">
            <input
              value={isListening ? liveTranscript : input}
              onChange={(e) => !isListening && setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isListening && sendMessage()}
              placeholder={isListening ? "Listening..." : "Type in English..."}
              disabled={isListening || loading}
              className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
            <button
              onClick={() => sendMessage()}
              disabled={(!input.trim() && !liveTranscript) || loading || isListening}
              className="w-12 h-12 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-all"
            >
              <Send size={18} />
            </button>
          </div>

          {/* Voice button */}
          {voiceSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={cn(
                "w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95",
                isListening
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                  : "bg-purple-100 hover:bg-purple-200 text-purple-800"
              )}
            >
              {isListening ? (
                <><MicOff size={18} /> Stop Recording</>
              ) : (
                <><Mic size={18} /> Hold to Speak in English</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message, onSpeak }: { message: Message; onSpeak: (text: string) => void }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-primary-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  const convMatch = message.content.match(/💬 \*\*Emma:\*\* ([\s\S]*?)(?=\n\n📝|\n📝|$)/);
  const corrMatch = message.content.match(/📝 \*\*Corrections:\*\* ([\s\S]*?)$/);
  const conversation = convMatch ? convMatch[1].trim() : message.content;
  const corrections = corrMatch ? corrMatch[1].trim() : null;
  const isPerfect = corrections?.startsWith("✓");

  return (
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm flex-shrink-0 mt-1">👩‍🏫</div>
      <div className="space-y-1.5 max-w-[85%]">
        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 text-sm text-gray-800 leading-relaxed">
          {conversation}
          <button
            onClick={() => onSpeak(conversation)}
            className="ml-2 text-gray-300 hover:text-primary-500 transition-colors inline-flex items-center"
            title="Listen again"
          >
            <Volume2 size={13} />
          </button>
        </div>
        {corrections && (
          <div className={cn(
            "rounded-xl px-3 py-2 text-xs leading-relaxed",
            isPerfect
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-orange-50 text-orange-800 border border-orange-200"
          )}>
            <span className="font-semibold">📝 </span>
            <span className="whitespace-pre-line">{corrections}</span>
          </div>
        )}
      </div>
    </div>
  );
}
