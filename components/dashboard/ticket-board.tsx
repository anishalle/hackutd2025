type KnownTicket = {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium";
  eta: string;
  details: string;
  parallelGroup?: string;
  source?: "manual" | "slack" | "email";
};

type AmbiguousTicket = {
  id: string;
  title: string;
  severity: "high" | "medium";
  signal: string;
  hypotheses: { label: string; confidence: number }[];
};

type TicketBoardProps = {
  knownTickets: KnownTicket[];
  ambiguousTickets: AmbiguousTicket[];
};

const severityStyles: Record<KnownTicket["severity"], string> = {
  critical: "text-rose-200 bg-rose-500/10 border border-rose-500/30",
  high: "text-amber-200 bg-amber-500/10 border border-amber-500/30",
  medium: "text-emerald-200 bg-emerald-500/10 border border-emerald-500/30",
};

export function TicketBoard({
  knownTickets,
  ambiguousTickets,
}: TicketBoardProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
          Known issue playbooks
        </h4>
        <div className="space-y-3">
          {knownTickets.map((ticket) => (
            <article
              key={ticket.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/40"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
                  <span>{ticket.id}</span>
                  {ticket.parallelGroup && (
                    <span className="rounded-full border border-cyan-400/40 px-2 py-0.5 text-[10px] text-cyan-200">
                      parallel {ticket.parallelGroup}
                    </span>
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${severityStyles[ticket.severity]}`}
                >
                  {ticket.severity}
                </span>
              </div>
              <p className="mt-2 text-lg font-semibold text-white">
                {ticket.title}
              </p>
              <p className="text-sm text-white/70">{ticket.details}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/60">
                <span>ETA • {ticket.eta}</span>
                {ticket.source && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]">
                    Generated from {ticket.source}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
          Ambiguous signals
        </h4>
        <div className="space-y-3">
          {ambiguousTickets.map((ticket) => (
            <article
              key={ticket.id}
              className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-4"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
                <span>{ticket.id}</span>
                <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px]">
                  {ticket.severity}
                </span>
              </div>
              <p className="mt-2 text-lg font-semibold text-white">
                {ticket.title}
              </p>
              <p className="text-sm text-white/70">{ticket.signal}</p>
              <ul className="mt-3 space-y-2">
                {ticket.hypotheses.map((hypothesis) => (
                  <li
                    key={hypothesis.label}
                    className="flex items-center justify-between text-sm text-white/80"
                  >
                    <span>{hypothesis.label}</span>
                    <span className="text-xs font-semibold text-cyan-200">
                      {hypothesis.confidence}%
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
