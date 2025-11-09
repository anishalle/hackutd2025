import type { TechnicianBundle } from "@/lib/floor-plan/technician-routing";

type BundlePickerProps = {
  bundles: TechnicianBundle[];
  selectedId: string | null;
  onSelect: (bundleId: string) => void;
};

const severityBadge: Record<
  TechnicianBundle["tasks"][number]["severity"],
  string
> = {
  critical: "bg-rose-500/20 text-rose-100",
  high: "bg-amber-500/20 text-amber-100",
  medium: "bg-cyan-500/20 text-cyan-100",
};

export function BundlePicker({
  bundles,
  selectedId,
  onSelect,
}: BundlePickerProps) {
  return (
    <section className="rounded-3xl border border-white/5 bg-white/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Technician bundles
          </p>
          <p className="text-base text-white/70">
            Select a bundle to generate a walk order.
          </p>
        </div>
        <span className="text-xs text-white/60">
          {bundles.length} group{bundles.length === 1 ? "" : "s"}
        </span>
      </div>
      {bundles.length === 0 ? (
        <p className="mt-4 text-sm text-white/70">
          No technician tickets are bundle-ready. Sync the inbox or ingest more
          work orders.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {bundles.map((bundle) => {
            const isActive = bundle.id === selectedId;
            const displayTasks = bundle.tasks.slice(0, 3);
            const remaining = Math.max(0, bundle.tasks.length - displayTasks.length);

            return (
              <button
                type="button"
                key={bundle.id}
                onClick={() => onSelect(bundle.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_25px_rgba(6,182,212,0.25)]"
                    : "border-white/10 bg-slate-950/40 hover:border-white/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-sm text-white">
                  <p className="font-semibold">{bundle.label}</p>
                  <span className="text-xs text-white/60">
                    {bundle.tasks.length} task{bundle.tasks.length === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="text-xs text-white/50">
                  {bundle.score}% similarity · {bundle.reasons[0] ?? "Heuristic match"}
                </p>
                <div className="mt-3 space-y-2">
                  {displayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2"
                    >
                      <p className="text-xs text-white/80">{task.title}</p>
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${severityBadge[task.severity]}`}
                      >
                        {task.severity}
                      </span>
                    </div>
                  ))}
                  {remaining > 0 ? (
                    <p className="text-xs text-white/50">+{remaining} more task{remaining === 1 ? "" : "s"}</p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
