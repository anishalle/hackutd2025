type RouteItem = {
  rank: number;
  ticket: string;
  task: string;
  priority: "critical" | "high" | "standard";
  distance: string;
  floor: string;
  elevation: string;
};

type TechnicianQueueProps = {
  routes: RouteItem[];
};

const priorityRing: Record<RouteItem["priority"], string> = {
  critical: "bg-rose-500/20 text-rose-100 border-rose-400/40",
  high: "bg-amber-500/20 text-amber-100 border-amber-400/40",
  standard: "bg-emerald-500/20 text-emerald-100 border-emerald-400/40",
};

export function TechnicianQueue({ routes }: TechnicianQueueProps) {
  return (
    <div className="space-y-3">
      {routes.map((route) => (
        <article
          key={route.ticket}
          className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-xl font-semibold text-cyan-100">
            {route.rank}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
              <span>{route.ticket}</span>
              <span
                className={`rounded-full border px-2 py-0.5 ${
                  priorityRing[route.priority]
                }`}
              >
                {route.priority}
              </span>
            </div>
            <p className="text-base font-semibold text-white">{route.task}</p>
            <div className="flex flex-wrap gap-3 text-xs text-white/60">
              <span>Distance • {route.distance}</span>
              <span>Floor • {route.floor}</span>
              <span>Elevation Δ • {route.elevation}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
