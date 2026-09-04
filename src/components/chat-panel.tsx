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

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm NBR Assist. Ask me about VAT returns, TIN registration, income tax deadlines, or trade license compliance in Bangladesh.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
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

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col rounded-2xl border border-slate-800 bg-slate-900/50">
      <div className="border-b border-slate-800 px-6 py-4">
        <h1 className="text-xl font-semibold">AI Compliance Chat</h1>
        <p className="text-sm text-slate-400">
          RAG-powered answers grounded in Bangladesh tax regulations
        </p>
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

      <form onSubmit={sendMessage} className="border-t border-slate-800 p-4">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask: When is my VAT return due?"
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
  );
}
