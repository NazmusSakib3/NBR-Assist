"use client";

import { useEffect, useState } from "react";

type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

type Checklist = {
  id: string;
  title: string;
  businessType: string;
  items: ChecklistItem[];
};

const businessTypes = ["retail", "restaurant", "freelancer", "export"];

export function ChecklistsPanel() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [businessType, setBusinessType] = useState("retail");
  const [loading, setLoading] = useState(true);

  async function loadChecklists() {
    const response = await fetch("/api/checklists");
    const data = await response.json();
    setChecklists(data.checklists ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadChecklists();
  }, []);

  async function createChecklist() {
    const response = await fetch("/api/checklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessType }),
    });
    const data = await response.json();
    if (data.checklist) {
      setChecklists((prev) => [data.checklist, ...prev]);
    }
  }

  async function toggleItem(checklist: Checklist, itemId: string) {
    const items = checklist.items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item,
    );
    await fetch("/api/checklists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: checklist.id, items }),
    });
    setChecklists((prev) =>
      prev.map((entry) => (entry.id === checklist.id ? { ...entry, items } : entry)),
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Compliance Checklists</h1>
        <p className="text-sm text-slate-400">
          Generate a tailored checklist for your business type
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <div>
          <label className="mb-1 block text-xs text-slate-400">Business type</label>
          <select
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          >
            {businessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={createChecklist}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
        >
          Generate checklist
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading checklists...</p>
      ) : (
        <div className="grid gap-4">
          {checklists.map((checklist) => (
            <div
              key={checklist.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
            >
              <div className="mb-4">
                <h2 className="font-medium">{checklist.title}</h2>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {checklist.businessType}
                </p>
              </div>
              <div className="space-y-2">
                {checklist.items.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-950/60 p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleItem(checklist, item.id)}
                      className="mt-1"
                    />
                    <span className={item.completed ? "text-slate-500 line-through" : ""}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
