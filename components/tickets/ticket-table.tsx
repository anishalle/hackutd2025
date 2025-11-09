type TicketRecord = {
  id: string;
  queue: string;
  title: string;
  customer?: string;
  severity: "critical" | "high" | "medium" | "low";
  owner: string;
  status: string;
  eta: string;
  tags: string[];
  channel: "manual" | "slack" | "email";
  parallelReady?: boolean;
  team: "admin" | "technician";
  location: string;
  floor?: string;
  distance?: string;
  workload?: string;
};

type TicketTableProps = {
  tickets: TicketRecord[];
  mode: "admin" | "technician";
};

const severityColors: Record<TicketRecord["severity"], string> = {
  critical: "text-rose-200 border border-rose-400/40 bg-rose-400/10",
  high: "text-amber-200 border border-amber-400/40 bg-amber-400/10",
  medium: "text-emerald-200 border border-emerald-400/40 bg-emerald-400/10",
  low: "text-blue-200 border border-blue-400/40 bg-blue-400/10",
};

const channelCopy: Record<TicketRecord["channel"], string> = {
  manual: "Console input",
  slack: "Generated from Slack",
  email: "Generated from email",
};

export function TicketTable({ tickets, mode }: TicketTableProps) {
  const grouped = tickets.reduce<Record<string, TicketRecord[]>>((acc, row) => {
    acc[row.queue] = acc[row.queue] ?? [];
    acc[row.queue].push(row);
    return acc;
  }, {});

  const columns =
    mode === "admin"
      ? ["Ticket", "Customer", "Severity", "Owner", "ETA", "Tags", "Source"]
      : ["Ticket", "Task", "Priority", "Floor", "Distance", "Status", "Tags"];

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <table className="w-full text-left text-sm text-white/80">
        <thead className="bg-white/5 text-xs uppercase tracking-[0.3em] text-white/40">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-4 font-normal">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        {Object.entries(grouped).map(([section, rows]) => (
          <tbody key={section}>
            <tr>
              <td
                colSpan={columns.length}
                className="bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.4em] text-cyan-200/70"
              >
                {section}
              </td>
            </tr>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-white/5 text-white hover:bg-white/5"
              >
                {mode === "admin" ? (
                  <>
                    <td className="px-4 py-4 font-semibold">
                      <div>{row.title}</div>
                      <div className="text-xs text-white/60">{row.id}</div>
                    </td>
                    <td className="px-4 py-4">{row.customer}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${severityColors[row.severity]}`}
                      >
                        {row.severity}
                      </span>
                      {row.parallelReady && (
                        <span className="ml-2 inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-2 py-1 text-[11px] uppercase tracking-wide text-cyan-100">
                          Parallel-ready
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">{row.owner}</td>
                    <td className="px-4 py-4">{row.eta}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {row.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-white/60">
                      {channelCopy[row.channel]}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-4 font-semibold">
                      <div>{row.title}</div>
                      <div className="text-xs text-white/60">{row.id}</div>
                    </td>
                    <td className="px-4 py-4">{row.workload}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${severityColors[row.severity]}`}
                      >
                        {row.severity}
                      </span>
                    </td>
                    <td className="px-4 py-4">{row.floor ?? "—"}</td>
                    <td className="px-4 py-4">{row.distance ?? "—"}</td>
                    <td className="px-4 py-4">{row.status}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {row.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

export type { TicketRecord };
