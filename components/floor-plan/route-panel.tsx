import { useMemo } from "react";

import { PathNode } from "@/lib/floor-plan/types";

type RoutePanelProps = {
  route: PathNode[];
  activePreset?: string | null;
  shell: {
    prioritizeCritical: () => void;
    minimizeWalking: () => void;
    resetBaseline: () => void;
  };
};

const badgeClasses = {
  critical: "bg-orange-500/10 text-orange-300",
  high: "bg-sky-500/10 text-sky-300",
  standard: "bg-slate-500/10 text-slate-200",
};

export function RoutePanel({ route, activePreset, shell }: RoutePanelProps) {
  const summary = useMemo(() => {
    const floors = Array.from(new Set(route.map((node) => node.floorId)));
    const critical = route.filter((node) => node.priority === "critical").length;
    const distance =
      route.reduce((acc, node) => acc + (node.distanceMeters ?? 0), 0) ??
      0;

    return {
      floors,
      critical,
      distance,
    };
  }, [route]);

  return (
    <div className="rounded-3xl border border-white/5 bg-slate-950/70 p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Technician loop
          </p>
          <p className="text-sm text-white/70">
            Active preset:{" "}
            <span className="font-semibold text-white">
              {activePreset ?? "baseline"}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={shell.prioritizeCritical}
            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
          >
            Priority rank
          </button>
          <button
            type="button"
            onClick={shell.minimizeWalking}
            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
          >
            Shortest walk
          </button>
          <button
            type="button"
            onClick={shell.resetBaseline}
            className="rounded-full border border-white/10 bg-slate-800 px-3 py-1 text-xs text-white hover:bg-slate-700"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-white/70">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Floors
          </p>
          <p className="text-lg font-semibold text-white">
            {summary.floors.join(" → ")}
          </p>
        </div>
        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Critical stops
          </p>
          <p className="text-lg font-semibold text-orange-200">
            {summary.critical}
          </p>
        </div>
        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Route distance
          </p>
          <p className="text-lg font-semibold text-sky-200">
            ~{Math.round(summary.distance)} m
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm">
        {route.map((node, index) => (
          <div
            key={`${node.id}-${index}`}
            className="flex items-start justify-between rounded-2xl border border-white/5 bg-white/5 p-3"
          >
            <div>
              <p className="text-xs uppercase text-white/40">{node.floorId}</p>
              <p className="font-semibold text-white">{node.label}</p>
              <p className="text-white/60">{node.action ?? "Transit"}</p>
            </div>
            {node.priority ? (
              <span
                className={`rounded-full px-2 py-1 text-[10px] uppercase ${badgeClasses[node.priority]}`}
              >
                {node.priority}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
