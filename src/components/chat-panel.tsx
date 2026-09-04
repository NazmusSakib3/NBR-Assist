"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

type Citation = {
  title: string;
  excerpt: string;
  score: number;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};

const SUGGESTIONS_EN = [
  "When is my VAT return due?",
  "Do I need a TIN for freelancing?",
  "What documents are needed for trade license?",
];

const SUGGESTIONS_BN = [
  "ভ্যাট রিটার্ন কবে জমা দিতে হয়?",
  "ফ্রিল্যান্সিংয়ের জন্য TIN লাগবে কি?",
  "ট্রেড লাইসেন্সের জন্য কী কী কাগজ লাগে?",
];

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm NBR Assist. Ask in English or Bangla about VAT, TIN, income tax, or trade license compliance in Bangladesh.\n\nহ্যালো! ভ্যাট, টিআইএন, আয়কর বা ট্রেড লাইসেন্স সম্পর্কে ইংরেজি বা বাংলায় জিজ্ঞাসা করতে পারেন।",
    },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<"en" | "bn">("en");

  async function sendMessage(event?: React.FormEvent, preset?: string) {
    event?.preventDefault();
    const question = (preset ?? input).trim();
    if (!question || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: question, sessionId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to generate response",
        );
      }

      setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          citations: data.citations,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Sorry, I couldn't process that. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = lang === "bn" ? SUGGESTIONS_BN : SUGGESTIONS_EN;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col rounded-2xl border border-slate-800 bg-slate-900/50">
      <div className="border-b border-slate-800 px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">AI Compliance Chat</h1>
            <p className="text-sm text-slate-400">
              RAG-powered answers in English or Bangla
            </p>
          </div>
          <div className="inline-flex rounded-xl border border-slate-700 p-1 text-xs">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`rounded-lg px-3 py-1.5 ${
                lang === "en" ? "bg-emerald-500 text-slate-950" : "text-slate-300"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("bn")}
              className={`rounded-lg px-3 py-1.5 ${
                lang === "bn" ? "bg-emerald-500 text-slate-950" : "text-slate-300"
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-3xl rounded-2xl px-4 py-3 text-sm leading-6 ${
              message.role === "user"
                ? "ml-auto bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-100"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.citations?.length ? (
              <div className="mt-3 space-y-2 border-t border-slate-700 pt-3">
                <p className="text-xs font-medium text-emerald-300">Sources</p>
                {message.citations.map((citation, citationIndex) => (
                  <div key={citationIndex} className="rounded-lg bg-slate-900/70 p-2 text-xs">
                    <p className="font-medium">{citation.title}</p>
                    <p className="text-slate-400">{citation.excerpt}...</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching regulations and generating answer...
          </div>
        ) : null}
      </div>

      <div className="space-y-3 border-t border-slate-800 p-4">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => sendMessage(undefined, suggestion)}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <form onSubmit={sendMessage}>
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                lang === "bn"
                  ? "জিজ্ঞাসা করুন: ভ্যাট রিটার্ন কবে জমা দিতে হয়?"
                  : "Ask: When is my VAT return due?"
              }
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none ring-emerald-500 focus:ring-2"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
