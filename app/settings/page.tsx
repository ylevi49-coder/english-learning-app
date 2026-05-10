"use client";

import { useState } from "react";
import { ArrowLeft, MessageCircle, Bell, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

export default function SettingsPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [dailyTip, setDailyTip] = useState(true);
  const [wordOfDay, setWordOfDay] = useState(true);
  const [quizzes, setQuizzes] = useState(false);

  function handleSave() {
    localStorage.setItem("whatsapp_phone", phone);
    localStorage.setItem("whatsapp_settings", JSON.stringify({ dailyTip, wordOfDay, quizzes }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 mb-3 text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-5 space-y-4">
        {/* WhatsApp section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="text-green-600" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">WhatsApp Integration</h2>
              <p className="text-xs text-gray-500">Receive lessons and tips on WhatsApp</p>
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">Your WhatsApp number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+972501234567"
            className="input mb-3"
          />

          <div className="space-y-2 mb-4">
            <ToggleRow label="Daily grammar tip" checked={dailyTip} onChange={setDailyTip} />
            <ToggleRow label="Word of the Day" checked={wordOfDay} onChange={setWordOfDay} />
            <ToggleRow label="Daily quiz question" checked={quizzes} onChange={setQuizzes} />
          </div>

          <Button onClick={handleSave} className="w-full" disabled={!phone}>
            {saved ? <><Check size={16} className="mr-1" /> Saved!</> : "Save Settings"}
          </Button>

          <div className="mt-4 bg-green-50 rounded-xl p-3">
            <p className="text-xs text-green-700 font-semibold mb-1">How to connect:</p>
            <ol className="text-xs text-green-700 space-y-1 list-decimal list-inside">
              <li>Save this number in your contacts: <strong>+1 (555) ENGLISH</strong></li>
              <li>Send "hi" to start the conversation</li>
              <li>Send <strong>help</strong> to see all commands</li>
            </ol>
            <p className="text-xs text-green-600 mt-2">Commands: <code>word</code> · <code>quiz</code> · <code>tip</code> · <code>check [text]</code></p>
          </div>
        </div>

        {/* App info */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-3">About EnglishUp</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Version 1.0.0</p>
            <p>CEFR Levels: A1 → C2</p>
            <p>Powered by Claude AI (Anthropic)</p>
          </div>
        </div>

        {/* Install PWA */}
        <div className="card bg-primary-50 border border-primary-100">
          <h3 className="font-bold text-primary-900 mb-1">📱 Install on your phone</h3>
          <p className="text-sm text-primary-700 mb-2">
            Add EnglishUp to your home screen for easy access – works like a real app!
          </p>
          <div className="text-xs text-primary-600 space-y-1">
            <p><strong>iPhone:</strong> Tap the Share button → "Add to Home Screen"</p>
            <p><strong>Android:</strong> Tap the menu (⋮) → "Add to Home Screen"</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? "bg-primary-500" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-4" : ""}`}
        />
      </button>
    </div>
  );
}
