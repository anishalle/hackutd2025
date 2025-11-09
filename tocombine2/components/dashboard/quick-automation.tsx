"use client";

import { useState } from "react";

type QuickAction = {
  id: string;
  title: string;
  description: string;
  buttonLabel: string;
  footprint: "low" | "medium" | "high";
};

const credentialPool = [
  { username: "ops-vela", password: "Q8JX-91PA-LM42" },
  { username: "ops-halo", password: "F4ZT-07QK-VS90" },
  { username: "ops-zeno", password: "X2MK-55LF-BR73" },
  { username: "ops-aura", password: "L9DN-33XP-QW18" },
];

const footprintColor = {
  low: "text-emerald-200 bg-emerald-500/10 border border-emerald-400/20",
  medium: "text-amber-200 bg-amber-500/10 border border-amber-400/30",
  high: "text-rose-200 bg-rose-500/10 border border-rose-400/40",
};

type QuickAutomationProps = {
  actions: QuickAction[];
};

export function QuickAutomation({ actions }: QuickAutomationProps) {
  const [results, setResults] = useState<Record<string, string>>({});
  const [cursor, setCursor] = useState(0);

  const handleRun = (id: string) => {
    const pair = credentialPool[cursor % credentialPool.length];

    setResults((prev) => ({
      ...prev,
      [id]: `${pair.username} / ${pair.password}`,
    }));
    setCursor((prev) => (prev + 1) % credentialPool.length);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {actions.map((action) => (
      <div
          key={action.id}
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
            <span>{action.id}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] ${
                footprintColor[action.footprint as keyof typeof footprintColor] ??
                "border-white/30 text-white/70"
              }`}
            >
              {action.footprint} footprint
            </span>
          </div>
          <h5 className="mt-3 text-lg font-semibold text-white">
            {action.title}
          </h5>
          <p className="text-sm text-white/70">{action.description}</p>
          <button
            onClick={() => handleRun(action.id)}
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_15px_45px_-25px_rgba(59,130,246,1)] transition hover:opacity-90"
          >
            {action.buttonLabel}
          </button>
          {results[action.id] && (
            <div className="mt-3 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm font-mono text-cyan-100">
              {results[action.id]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
