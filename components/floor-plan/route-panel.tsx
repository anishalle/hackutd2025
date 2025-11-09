import { useMemo } from "react";

import type {
  TechnicianBundle,
  TechnicianTask,
} from "@/lib/floor-plan/technician-routing";
import { PathNode } from "@/lib/floor-plan/types";

type RoutePanelProps = {
  route: PathNode[];
  bundle: TechnicianBundle | null;
  totalDistance: number;
  unresolvedTasks: TechnicianTask[];
};

const priorityBadge = {
  critical: "bg-orange-500/15 text-orange-200",
  high: "bg-sky-500/15 text-sky-200",
  standard: "bg-slate-500/20 text-slate-100",
};

const severityBadge: Record<
  TechnicianTask["severity"],
  string
> = {
  critical: "bg-rose-500/15 text-rose-100",
  high: "bg-amber-500/15 text-amber-100",
  medium: "bg-emerald-500/15 text-emerald-100",
};

export function RoutePanel({
  route,
  bundle,
  totalDistance,
  unresolvedTasks,
}: RoutePanelProps) {
  const summary = useMemo(() => {
    const floors = Array.from(new Set(route.map((node) => node.floorId))).join(
      " → ",
    );
    const critical = route.filter((node) => node.priority === "critical").length;
    const inventoryStops = route.filter(
      (node) => node.type === "inventory",
    ).length;
    return { floors, critical, inventoryStops };
  }, [route]);

  return (
    <div className="rounded-3xl border border-white/5 bg-slate-950/70 p-5 shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Technician loop
          </p>
          <p className="text-base font-semibold text-white">
            {bundle?.label ?? "No bundle selected"}
          </p>
          {bundle ? (
            <p className="text-xs text-white/60">
              {bundle.score}% similarity · {bundle.tasks.length} task
              {bundle.tasks.length === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
          {route.length} stop{route.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-white/70">
        <StatCard label="Floors" value={summary.floors || "—"} />
        <StatCard
          label="Critical"
          value={summary.critical.toString()}
          accent="text-orange-200"
        />
        <StatCard
          label="Distance"
          value={`~${Math.round(totalDistance)} m`}
          accent="text-sky-200"
        />
      </div>

      <div className="mt-6 space-y-3 text-sm">
        {route.map((node, index) => (
          <div
            key={`${node.id}-${index}`}
            className="flex items-start justify-between rounded-2xl border border-white/5 bg-white/5 p-3"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                {node.floorId}
              </p>
              <p className="font-semibold text-white">{node.label}</p>
              <p className="text-white/60">{node.action ?? "Transit"}</p>
            </div>
            {node.priority ? (
              <span
                className={`rounded-full px-2 py-1 text-[10px] uppercase ${priorityBadge[node.priority]}`}
              >
                {node.priority}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      {unresolvedTasks.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-100">
          <p className="font-semibold uppercase tracking-[0.3em]">
            Missing clusters
          </p>
          <div className="mt-2 space-y-2 text-white/80">
            {unresolvedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <p>{task.title}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${severityBadge[task.severity]}`}
                >
                  {task.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      <p
        className={`text-lg font-semibold ${accent ?? "text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}
