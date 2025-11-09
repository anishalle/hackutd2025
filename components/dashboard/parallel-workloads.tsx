type Workload = {
  id: string;
  company: string;
  task: string;
  nodes: number;
  window: string;
  parallelizable: boolean;
  priority: "critical" | "high" | "standard";
};

type ParallelWorkloadsProps = {
  workloads: Workload[];
};

const priorityHue: Record<Workload["priority"], string> = {
  critical: "from-rose-500/40 to-rose-500/10 border-rose-500/40",
  high: "from-amber-500/40 to-amber-500/10 border-amber-500/40",
  standard: "from-emerald-500/30 to-emerald-500/10 border-emerald-500/30",
};

export function ParallelWorkloads({ workloads }: ParallelWorkloadsProps) {
  return (
    <div className="space-y-3">
      {workloads.map((workload) => (
        <article
          key={workload.id}
          className={`rounded-2xl border bg-gradient-to-r px-4 py-3 text-white ${priorityHue[workload.priority]}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-wide text-white/70">
            <span>{workload.company}</span>
            <span className="rounded-full border border-white/20 px-2 py-0.5">
              {workload.window}
            </span>
          </div>
          <p className="mt-2 text-lg font-semibold">{workload.task}</p>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span>
              Nodes • <strong className="text-white">{workload.nodes}</strong>
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                workload.parallelizable
                  ? "border-cyan-400/40 text-cyan-200"
                  : "border-white/20 text-white/60"
              }`}
            >
              {workload.parallelizable ? "parallel safe" : "serial only"}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
