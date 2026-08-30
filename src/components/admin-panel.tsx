"use client";

import { useEffect, useState } from "react";

type Document = {
  id: string;
  title: string;
  category: string;
  source: string | null;
  _count: { chunks: number };
};

export function AdminPanel() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("VAT");
  const [source, setSource] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  async function loadDocuments() {
    const response = await fetch("/api/admin/documents");
    const data = await response.json();
    setDocuments(data.documents ?? []);
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function createDocument(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/admin/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, source, content }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Failed to ingest document");
      return;
    }

    setMessage(`Ingested ${data.chunkCount} chunks successfully.`);
    setTitle("");
    setSource("");
    setContent("");
    loadDocuments();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin — Regulation Library</h1>
        <p className="text-sm text-slate-400">
          Upload NBR guidelines and circulars for the RAG knowledge base
        </p>
      </div>

      <form
        onSubmit={createDocument}
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Document title"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
            required
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
          >
            {["VAT", "INCOME_TAX", "TIN", "TRADE_LICENSE", "CUSTOMS", "OTHER"].map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ),
            )}
          </select>
        </div>
        <input
          value={source}
          onChange={(event) => setSource(event.target.value)}
          placeholder="Source URL or reference"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Paste regulation text here..."
          rows={8}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
          required
        />
        <button
          type="submit"
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
        >
          Ingest document
        </button>
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      </form>

      <div className="grid gap-3">
        {documents.map((document) => (
          <div
            key={document.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
          >
            <p className="font-medium">{document.title}</p>
            <p className="text-xs text-slate-400">
              {document.category} · {document._count.chunks} chunks
              {document.source ? ` · ${document.source}` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
