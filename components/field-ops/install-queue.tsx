type FieldTask = {
  id: string;
  title: string;
  type: "install" | "cabling" | "troubleshoot";
  owner: string;
  status: "ready" | "blocked" | "in-progress";
  window: string;
  notes: string;
};

type InstallQueueProps = {
  tasks: FieldTask[];
};

const typeColor: Record<FieldTask["type"], string> = {
  install: "text-cyan-200 bg-cyan-500/10 border border-cyan-400/40",
  cabling: "text-amber-200 bg-amber-500/10 border border-amber-400/40",
  troubleshoot: "text-rose-200 bg-rose-500/10 border border-rose-400/40",
};

const statusCopy: Record<FieldTask["status"], string> = {
  ready: "Ready",
  blocked: "Blocked",
  "in-progress": "In-progress",
};

export function InstallQueue({ tasks }: InstallQueueProps) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <article
          key={task.id}
          className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-white/60">
              <span>{task.id}</span>
              <span className={`rounded-full px-2 py-0.5 ${typeColor[task.type]}`}>
                {task.type}
              </span>
            </div>
            <span className="text-xs text-white/50">Window • {task.window}</span>
          </div>
          <p className="mt-2 text-base font-semibold text-white">{task.title}</p>
          <p className="text-white/70">{task.notes}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/60">
            <span>Owner • {task.owner}</span>
            <span>Status • {statusCopy[task.status]}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
