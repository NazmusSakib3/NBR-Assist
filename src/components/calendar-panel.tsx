"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

type Deadline = {
  id: string;
  title: string;
  type: string;
  description: string | null;
  dueDate: string;
  status: string;
};

const statusStyles: Record<string, string> = {
  UPCOMING: "bg-blue-500/15 text-blue-300",
  DUE_SOON: "bg-amber-500/15 text-amber-300",
  OVERDUE: "bg-red-500/15 text-red-300",
  COMPLETED: "bg-emerald-500/15 text-emerald-300",
};

export function CalendarPanel() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calendar")
      .then((res) => res.json())
      .then((data) => setDeadlines(data.deadlines ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function markComplete(id: string) {
    await fetch("/api/calendar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "COMPLETED" }),
    });
    setDeadlines((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "COMPLETED" } : item,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Compliance Calendar</h1>
        <p className="text-sm text-slate-400">
          Track VAT, income tax, TIN, and license deadlines
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading deadlines...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {deadlines.map((deadline) => (
            <div
              key={deadline.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{deadline.title}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {deadline.type.replace("_", " ")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${statusStyles[deadline.status]}`}
                >
                  {deadline.status.replace("_", " ")}
                </span>
              </div>
              <p className="mb-4 text-sm text-slate-300">{deadline.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-emerald-300">
                  Due {formatDate(deadline.dueDate)}
                </p>
                {deadline.status !== "COMPLETED" ? (
                  <button
                    onClick={() => markComplete(deadline.id)}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs hover:bg-slate-700"
                  >
                    Mark done
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
