"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, RefreshCw, Mic, MicOff, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getProgress } from "@/lib/progress";
import { CEFRLevel } from "@/types";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";

type Scenario = "free" | "coffee" | "work" | "travel" | "shopping";
type ChatMode = "setup" | "voice" | "text";

interface Message {
  role: "user" | "assistant";
  content: string;
  display?: string;
}

const SCENARIOS: { key: Scenario; emoji: string; label: string; desc: string }[] = [
  { key: "free",     emoji: "💬", label: "Free Chat",   desc: "Any topic you like" },
  { key: "coffee",   emoji: "☕", label: "Coffee Shop", desc: "Casual daily life chat" },
  { key: "work",     emoji: "💼", label: "Work Talk",   desc: "Professional English" },
  { key: "travel",   emoji: "✈️", label: "Travel",      desc: "Plan trips & adventures" },
  { key: "shopping", emoji: "🛍️", label: "Shopping",    desc: "Buy things in English" },
];

export default function ChatPage() {
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario>("free");
  const [level, setLevel] = useState<CEFRLevel>("B1");
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<ChatMode>("setup");
  const [textInput, setTextInput] = useState("");

  const [voiceSupported, setVoiceSupported] = useState(false);
  const [userStatus, setUserStatus] = useState<"idle" | "listening" | "thinking">("idle");
  const [emmaStatus, setEmmaStatus] = useState<"idle" | "speaking">("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [emmaTyping, setEmmaTyping] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoRestartRef = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // accumulate final results across continuous recognition chunks
  const accumulatedRef = useRef("");

  useEffect(() => {
    setLevel(getProgress().level);
    const w = window as unknown as Record<string, unknown>;
    setVoiceSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveTranscript, emmaTyping]);

  // ── TTS with typewriter ───────────────────────────────────────
  const speakWithTypewriter = useCallback((text: string, onDone?: () => void) => {
    window.speechSynthesis?.cancel();
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setEmmaTyping("");
    setEmmaStatus("speaking");

    const words = text.split(" ");
    let i = 0;
    const msPerWord = Math.max(160, Math.min(260, (text.length / words.length) * 38));
    typingTimerRef.current = setInterval(() => {
      if (i < words.length) {
        setEmmaTyping(prev => prev ? prev + " " + words[i++] : words[i++]);
      } else {
        clearInterval(typingTimerRef.current!);
      }
    }, msPerWord);

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-US";
    utt.rate = 0.88;
    utt.pitch = 1.05;
    const pickVoice = () => {
      const vs = window.speechSynthesis.getVoices();
      utt.voice =
        vs.find(v => v.lang.startsWith("en") && /samantha|karen|moira|victoria|zira|susan|female/i.test(v.name)) ??
        vs.find(v => v.lang.startsWith("en-GB")) ??
        vs.find(v => v.lang.startsWith("en")) ?? null;
    };
    if (window.speechSynthesis.getVoices().length) pickVoice();
    else window.speechSynthesis.onvoiceschanged = pickVoice;

    utt.onend = () => {
      clearInterval(typingTimerRef.current!);
      setEmmaTyping("");
      setEmmaStatus("idle");
      onDone?.();
    };
    window.speechSynthesis.speak(utt);
  }, []);

  // ── Session-based recognition (continuous:false + manual restart) ──
  // Each session captures ONE utterance → no word duplication across sessions.
  // We restart immediately after onend and use a 1.8s silence timer to send.
  const startListening = useCallback(() => {
    const w = window as unknown as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as any;
    if (!SR) return;

    accumulatedRef.current = "";
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
    setLiveTranscript("");
    setUserStatus("listening");

    function doSend() {
      silenceTimerRef.current = null;
      autoRestartRef.current = false;
      recognitionRef.current?.abort();
      const text = accumulatedRef.current.trim();
      accumulatedRef.current = "";
      setLiveTranscript("");
      setUserStatus("idle");
      if (text) sendVoiceMessage(text);
    }

    function runSession() {
      if (!autoRestartRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rec = new SR();
      rec.lang = "en-US";
      rec.interimResults = true;
      rec.continuous = false;   // one utterance → no duplication
      rec.maxAlternatives = 1;
      recognitionRef.current = rec;

      let sessionFinal = "";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onresult = (e: any) => {
        // User is speaking → cancel silence countdown
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript.trim();
          if (e.results[i].isFinal) {
            sessionFinal += (sessionFinal ? " " : "") + t;
          } else {
            interim = t;
          }
        }

        const displayed = [accumulatedRef.current, sessionFinal || interim]
          .filter(Boolean).join(" ");
        setLiveTranscript(displayed);
      };

      rec.onerror = (e: { error: string }) => {
        if (e.error === "aborted") return;
        if (e.error === "no-speech") return; // onend fires next, handles restart
        setUserStatus("idle");
        autoRestartRef.current = false;
      };

      rec.onend = () => {
        // Commit this session's final text
        if (sessionFinal) {
          accumulatedRef.current = [accumulatedRef.current, sessionFinal]
            .filter(Boolean).join(" ");
        }
        sessionFinal = "";

        if (!autoRestartRef.current) {
          setLiveTranscript("");
          setUserStatus("idle");
          return;
        }

        // Start silence countdown (only if not already running)
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(doSend, 1800);
        }

        // Restart immediately to keep the mic open
        setTimeout(runSession, 150);
      };

      rec.start();
    }

    runSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function stopListening() {
    autoRestartRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
    recognitionRef.current?.abort();
    setUserStatus("idle");
    setLiveTranscript("");
    accumulatedRef.current = "";
  }

  function stopEverything() {
    autoRestartRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    window.speechSynthesis?.cancel();
    recognitionRef.current?.stop();
    setUserStatus("idle");
    setEmmaStatus("idle");
    setLiveTranscript("");
    setEmmaTyping("");
  }

  // ── Send to Emma ──────────────────────────────────────────────
  function sendVoiceMessage(text: string) {
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => {
      const updated = [...prev, userMsg];
      callEmma(updated);
      return updated;
    });
  }

  async function handleSendText() {
    const text = textInput.trim();
    if (!text) return;
    setTextInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => {
      const updated = [...prev, userMsg];
      callEmma(updated);
      return updated;
    });
  }

  async function callEmma(msgs: Message[]) {
    setUserStatus("thinking");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: msgs.map(m => ({
            role: m.role,
            content: m.role === "assistant" ? extractConversation(m.content) : m.content,
          })),
          scenario,
          level,
        }),
      });
      const data = await res.json();
      const reply: string = data.reply ?? "💬 **Emma:** Sorry, connection issue. Try again?\n\n📝 **Corrections:**\n✓ Perfect!";
      const conv = extractConversation(reply);

      setUserStatus("idle");
      setMessages(prev => [...prev, { role: "assistant", content: reply, display: "" }]);

      speakWithTypewriter(conv, () => {
        setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, display: conv } : m));
        if (autoRestartRef.current) setTimeout(startListening, 500);
      });
    } catch {
      setUserStatus("idle");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "💬 **Emma:** Connection issue – please try again.\n\n📝 **Corrections:**\n✓ Perfect!",
        display: "Connection issue – please try again.",
      }]);
    }
  }

  function startConversation(chosenMode: "voice" | "text") {
    setMode(chosenMode);
    setMessages([]);
    autoRestartRef.current = chosenMode === "voice";

    const openings: Record<Scenario, string> = {
      free:     "Hi! I'm Emma, your English conversation partner! What would you like to talk about today?",
      coffee:   "Hi! Welcome, grab a seat. What can I get you? Or shall we just chat?",
      work:     "Good morning! I'm your colleague Emma. How was your weekend?",
      travel:   "Hey! I heard you're planning a trip! Where are you thinking of going?",
      shopping: "Hi there! Welcome to the store. Can I help you find something today?",
    };
    const openingText = openings[scenario];
    setMessages([{ role: "assistant", content: `💬 **Emma:** ${openingText}\n\n📝 **Corrections:**\n✓ Perfect!`, display: "" }]);
    speakWithTypewriter(openingText, () => {
      setMessages(prev => prev.map((m, i) => i === 0 ? { ...m, display: openingText } : m));
      if (chosenMode === "voice") setTimeout(startListening, 500);
    });
  }

  function resetChat() {
    stopEverything();
    setMode("setup");
    setMessages([]);
    setTextInput("");
  }

  function extractConversation(text: string): string {
    const m = text.match(/💬 \*\*Emma:\*\* ([\s\S]*?)(?=\n\n📝|\n📝|$)/);
    return m ? m[1].trim() : text;
  }

  function extractCorrections(text: string): string {
    const m = text.match(/📝 \*\*Corrections:\*\*\n?([\s\S]*?)$/);
    return m ? m[1].trim() : "";
  }

  const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const isBusy = userStatus === "thinking" || emmaStatus === "speaking";

  // ── Setup screen ──────────────────────────────────────────────
  if (mode === "setup") {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
          <div className="max-w-lg mx-auto">
            <button onClick={() => router.back()} className="text-gray-500 text-sm flex items-center gap-1 mb-1">
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-5 py-5 space-y-5 animate-fadeIn">
          <div className="text-center pt-2">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-4xl mx-auto mb-3">👩‍🏫</div>
            <h1 className="text-2xl font-bold text-gray-900">Chat with Emma</h1>
            <p className="text-gray-500 text-sm mt-1">Speak or type in English – Emma corrects your mistakes</p>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 mb-2">Choose a scenario</h2>
            <div className="grid grid-cols-1 gap-2">
              {SCENARIOS.map(s => (
                <button key={s.key} onClick={() => setScenario(s.key)}
                  className={cn("flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                    scenario === s.key ? "border-primary-500 bg-primary-50" : "border-gray-200 bg-white hover:border-primary-200")}>
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
              {levels.map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  className={cn("px-4 py-2 rounded-full text-sm font-bold border-2 transition-all",
                    level === l ? "border-primary-500 bg-primary-600 text-white" : "border-gray-200 bg-white text-gray-600")}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {voiceSupported && (
              <button onClick={() => startConversation("voice")}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 shadow-md">
                <Mic size={24} />
                <span className="text-sm">Voice Chat</span>
                <span className="text-xs opacity-75">Hands-free</span>
              </button>
            )}
            <button onClick={() => startConversation("text")}
              className={cn("bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 shadow-md",
                !voiceSupported && "col-span-2")}>
              <MessageCircle size={24} />
              <span className="text-sm">Text Chat</span>
              <span className="text-xs opacity-75">Type to chat</span>
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Chat screen ───────────────────────────────────────────────
  const isVoice = mode === "voice";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-3 flex-shrink-0">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={resetChat} className="text-gray-500 p-1"><ArrowLeft size={20} /></button>
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg">👩‍🏫</div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">Emma</p>
            <p className="text-xs font-medium text-green-500">
              {emmaStatus === "speaking" ? "● Speaking..." :
               userStatus === "listening" ? "● Listening..." :
               userStatus === "thinking" ? "● Thinking..." : "● Ready"}
            </p>
          </div>
          <button onClick={resetChat} className="text-gray-400 p-1"><RefreshCw size={18} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-44">
        <div className="max-w-lg mx-auto space-y-4">
          {messages.map((msg, i) => {
            const isLastEmma = i === messages.length - 1 && msg.role === "assistant" && emmaStatus === "speaking";
            return (
              <ChatBubble key={i} message={msg} liveText={isLastEmma ? emmaTyping : undefined}
                extractConversation={extractConversation} extractCorrections={extractCorrections} />
            );
          })}
          {userStatus === "listening" && (
            <div className="flex justify-end">
              <div className="bg-primary-100 border-2 border-primary-300 text-primary-800 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-base">
                <span className="flex items-center gap-1 text-xs text-primary-500 mb-1 font-semibold">
                  <Mic size={10} /> Listening...
                </span>
                {liveTranscript || <span className="opacity-40 italic text-sm">Say something in English...</span>}
              </div>
            </div>
          )}
          {userStatus === "thinking" && (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm flex-shrink-0">👩‍🏫</div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                <span className="flex gap-1">
                  {[0,150,300].map(d => <span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3 pb-4 safe-bottom">
        <div className="max-w-lg mx-auto">
          {isVoice ? (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => {
                  if (userStatus === "listening") { stopListening(); }
                  else if (emmaStatus === "speaking") { stopEverything(); setTimeout(startListening, 300); }
                  else if (!isBusy) { autoRestartRef.current = true; startListening(); }
                }}
                className={cn(
                  "w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1 text-white font-bold shadow-lg transition-all active:scale-95",
                  userStatus === "listening" ? "bg-red-500 scale-110 shadow-red-200" :
                  emmaStatus === "speaking"  ? "bg-purple-400" :
                  isBusy ? "bg-gray-300" : "bg-purple-600 hover:bg-purple-700"
                )}>
                {userStatus === "listening" ? <MicOff size={28} /> : <Mic size={28} />}
                <span className="text-[10px]">
                  {userStatus === "listening" ? "Stop" : emmaStatus === "speaking" ? "Interrupt" : "Speak"}
                </span>
              </button>
              <p className="text-xs text-gray-400 text-center">
                {userStatus === "listening" ? "Speaking... will send after you pause" :
                 emmaStatus === "speaking" ? "Emma is speaking – tap to interrupt" :
                 isBusy ? "Please wait..." : "Tap to speak · stops automatically after pause"}
              </p>
              <button onClick={() => setMode("text")} className="text-xs text-gray-400 underline">Switch to text mode</button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input value={textInput} onChange={e => setTextInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !isBusy && handleSendText()}
                  placeholder="Write in English..." disabled={isBusy}
                  className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all" />
                <button onClick={handleSendText} disabled={!textInput.trim() || isBusy}
                  className="w-12 h-12 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-all">
                  <ArrowLeft size={18} className="rotate-180" />
                </button>
              </div>
              {voiceSupported && (
                <button onClick={() => setMode("voice")} className="w-full text-center text-xs text-purple-500 underline">Switch to voice mode</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Chat bubble ────────────────────────────────────────────────
function ChatBubble({ message, liveText, extractConversation, extractCorrections }: {
  message: Message;
  liveText?: string;
  extractConversation: (t: string) => string;
  extractCorrections: (t: string) => string;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-primary-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-base leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  const fullConv = extractConversation(message.content);
  const displayText = liveText !== undefined ? liveText : (message.display ?? fullConv);
  const corrections = extractCorrections(message.content);
  const isPerfect = corrections.startsWith("✓");
  const showFeedback = liveText === undefined;

  const correctionLines = corrections
    .split("\n")
    .filter(l => l.includes("❌") && l.includes("✅"))
    .map(line => {
      // Support both quoted ("phrase") and unquoted formats, and curly quotes
      const quotePattern = /[""«]([^"""»]+)[""»]/;
      const wrongMatch = line.match(/❌\s*[""«]?([^"""»→✅]+?)[""»]?\s*→/);
      const rightMatch = line.match(/✅\s*[""«]?([^"""»·•\n]+?)[""»]?\s*[·•]/);
      const rightFallback = line.match(/✅\s*[""«]?([^"""»\n]+)/);
      const wrong = (wrongMatch?.[1] ?? "").trim().replace(/^[""]|[""]$/g, "");
      const right = (rightMatch?.[1] ?? rightFallback?.[1] ?? "").trim().replace(/^[""]|[""]$/g, "");
      const reason = (line.match(/[·•]\s*(.+)/)?.[1] ?? "").trim();
      return { wrong, right, reason };
    })
    .filter(c => c.wrong || c.right);

  return (
    <div className="flex items-start gap-2">
      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-base flex-shrink-0 mt-1">👩‍🏫</div>
      <div className="space-y-1.5 max-w-[85%]">
        {/* Emma's reply */}
        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 text-base text-gray-800 leading-relaxed">
          {displayText || <span className="opacity-0">·</span>}
          {liveText !== undefined && (
            <span className="inline-block w-0.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-middle" />
          )}
        </div>

        {/* Corrections */}
        {showFeedback && isPerfect && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-1.5 text-sm text-green-700 font-medium">
            ✓ Perfect English!
          </div>
        )}
        {showFeedback && correctionLines.length > 0 && (
          <div className="space-y-1.5">
            {correctionLines.map((c, i) => (
              <div key={i} className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-sm">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="line-through text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded">{c.wrong}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200">{c.right}</span>
                </div>
                {c.reason && <p className="text-gray-500 mt-1 text-xs">{c.reason}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
