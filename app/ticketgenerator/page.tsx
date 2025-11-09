"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Ticket = {
  id: string;
  title: string;
  queue: "Critical path" | "Parallel ready" | "Investigations";
  severity: "critical" | "high" | "medium" | "low";
  team: "admin" | "technician";
  kind: "known" | "ambiguous" | "dispatch";
  owner: string;
  status: string;
  eta: string;
  tags: string[];
  channel: "email" | "slack";
  location: string;
  customer?: string;
  summary: string;
  details: string;
  parallelReady?: boolean;
  parallelGroup?: string;
  fastFixAvailable?: boolean;
  affectedCustomers?: string[];
  affectedSystems?: string[];
  affectedServers?: string[];
  workload: string;
};

const severityColor: Record<Ticket["severity"], string> = {
  critical: "text-rose-200 bg-rose-500/10 border border-rose-400/40",
  high: "text-amber-200 bg-amber-500/10 border border-amber-400/40",
  medium: "text-cyan-200 bg-cyan-500/10 border border-cyan-400/40",
  low: "text-emerald-200 bg-emerald-500/10 border border-emerald-400/40",
};

const queueLabel: Record<Ticket["queue"], string> = {
  "Critical path": "Critical path",
  "Parallel ready": "Parallel ready",
  Investigations: "Investigations",
};

export default function TicketGeneratorPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) ?? null,
    [tickets, selectedId],
  );

  const loadTickets = async () => {
    setLoading(true);
    setError(null);

    const errors: string[] = [];

    const fetchInbox = async (
      path: string,
      channel: Ticket["channel"],
    ): Promise<Ticket[]> => {
      try {
        const response = await fetch(path, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data?.error || `Failed to load ${channel} inbox`,
          );
        }
        if (!Array.isArray(data.tickets)) {
          return [];
        }
        return data.tickets.map((ticket: Ticket) => ({
          ...ticket,
          channel,
        }));
      } catch (err) {
        console.error(`Failed to load ${channel} tickets`, err);
        errors.push(
          err instanceof Error
            ? err.message
            : `Failed to load ${channel} inbox`,
        );
        return [];
      }
    };

    try {
      const [emailInbox, slackInbox] = await Promise.all([
        fetchInbox("/api/tickets/from-email", "email"),
        fetchInbox("/api/tickets/from-slack", "slack"),
      ]);
      const combined = [...emailInbox, ...slackInbox];
      setTickets(combined);
      setSelectedId(combined[0]?.id ?? null);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            "nmc.emailTickets",
            JSON.stringify(combined),
          );
          window.localStorage.setItem(
            "nmc.emailTicketsSyncedAt",
            Date.now().toString(),
          );
        } catch (storageError) {
          console.error("Failed to cache synced tickets", storageError);
        }
      }
      setError(errors.length ? errors.join(" ") : null);
    } catch (err) {
      console.error("ticket generator failed", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setTickets([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <div className="min-h-screen bg-[#01040b] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(147,51,234,0.15),_transparent_55%)]" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-16 pt-10 lg:px-10">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-fuchsia-300/80">
                Ticket generator
              </p>
              <h1 className="text-4xl font-semibold">
                Slack + email inbox · AI normalized incidents
              </h1>
              <p className="mt-2 max-w-2xl text-base text-white/70">
                Pull unread alerts from{" "}
                <span className="font-mono text-white">
                  nmc.ops.demo@gmail.com
                </span>{" "}
                and DM escalations into structured work orders.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tickets"
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:border-white/40"
              >
                Back to tickets
              </Link>
              <button
                type="button"
                onClick={loadTickets}
                className="rounded-2xl border border-violet-400/50 bg-gradient-to-r from-violet-500/40 to-cyan-500/40 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] transition hover:from-violet-500 hover:to-cyan-500"
              >
                Refresh inbox
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
            <aside className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
                <span>Tickets</span>
                <span>{tickets.length}</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30">
                {loading ? (
                  <div className="space-y-3 p-4">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div
                        key={`skeleton-${idx}`}
                        className="space-y-2 rounded-xl border border-white/5 bg-white/5 p-3"
                      >
                        <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
                        <div className="h-3 w-1/3 animate-pulse rounded-full bg-white/10" />
                      </div>
                    ))}
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="space-y-3 p-4 text-sm text-white/60">
                    <p>No unread incident messages in Gmail or Slack.</p>
                    <p className="text-white/40">
                      Send a test email or Slack DM and refresh to see it here.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {tickets.map((ticket) => {
                      const isActive = ticket.id === selectedId;
                      return (
                        <li key={ticket.id}>
                          <button
                            className={`w-full text-left transition ${
                              isActive
                                ? "bg-white/10"
                                : "hover:bg-white/5"
                            }`}
                            onClick={() => setSelectedId(ticket.id)}
                          >
                            <div className="space-y-1 px-4 py-3">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold">
                                  {ticket.title}
                                </p>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${severityColor[ticket.severity]}`}
                                >
                                  &nbsp;{ticket.severity}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-[11px] text-white/60">
                                <span className="rounded-full border border-white/15 px-2 py-0.5 capitalize">
                                  {ticket.channel === "slack" ? "Slack" : "Email"}
                                </span>
                                <span className="rounded-full border border-white/15 px-2 py-0.5">
                                  {queueLabel[ticket.queue]}
                                </span>
                                <span className="rounded-full border border-white/15 px-2 py-0.5">
                                  {ticket.team}
                                </span>
                                <span className="rounded-full border border-white/15 px-2 py-0.5 capitalize">
                                  {ticket.kind}
                                </span>
                                {ticket.location ? (
                                  <span className="rounded-full border border-white/15 px-2 py-0.5">
                                    {ticket.location}
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-xs text-white/50 line-clamp-2">
                                {ticket.summary}
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              {error ? (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                  {error}
                </div>
              ) : null}
            </aside>

            <article className="rounded-2xl border border-white/10 bg-black/30 p-6">
              {selectedTicket ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/60">
                      <span>Incident</span>
                      <span>·</span>
                      <span className="font-mono text-white">
                        {selectedTicket.id}
                      </span>
                      <span>·</span>
                      <span>
                        {selectedTicket.channel === "slack" ? "Slack" : "Email"}
                      </span>
                    </div>
                    <h2 className="text-2xl font-semibold">
                      {selectedTicket.title}
                    </h2>
                    <div className="flex flex-wrap gap-2 text-xs text-white/70">
                      <span className={`rounded-full px-3 py-1 ${severityColor[selectedTicket.severity]}`}>
                        {selectedTicket.severity}
                      </span>
                      <span className="rounded-full border border-white/15 px-3 py-1">
                        {selectedTicket.status}
                      </span>
                      {selectedTicket.eta ? (
                        <span className="rounded-full border border-white/15 px-3 py-1">
                          ETA {selectedTicket.eta}
                        </span>
                      ) : null}
                      {selectedTicket.parallelReady ? (
                        <span className="rounded-full border border-violet-400/50 px-3 py-1 text-violet-100">
                          Parallel ready{" "}
                          {selectedTicket.parallelGroup
                            ? `· ${selectedTicket.parallelGroup}`
                            : ""}
                        </span>
                      ) : null}
                      {selectedTicket.fastFixAvailable ? (
                        <span className="rounded-full border border-amber-400/40 px-3 py-1 text-amber-100">
                          Fast fix available
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-white/60">
                      <span className="rounded-full border border-white/10 px-2 py-0.5 uppercase">
                        {queueLabel[selectedTicket.queue]}
                      </span>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 uppercase">
                        {selectedTicket.team}
                      </span>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 uppercase">
                        {selectedTicket.kind}
                      </span>
                      {selectedTicket.owner ? (
                        <span className="rounded-full border border-white/10 px-2 py-0.5 uppercase">
                          {selectedTicket.owner}
                        </span>
                      ) : null}
                      {selectedTicket.location ? (
                        <span className="rounded-full border border-white/10 px-2 py-0.5 uppercase">
                          {selectedTicket.location}
                        </span>
                      ) : null}
                      {selectedTicket.customer ? (
                        <span className="rounded-full border border-cyan-300/60 px-2 py-0.5 uppercase text-cyan-200">
                          {selectedTicket.customer}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-xs uppercase tracking-[0.3em] text-white/50">
                        Summary
                      </h3>
                      <p className="mt-2 text-sm text-white/80 whitespace-pre-wrap">
                        {selectedTicket.summary}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs uppercase tracking-[0.3em] text-white/50">
                        Details
                      </h3>
                      <p className="mt-2 text-sm text-white/80 whitespace-pre-wrap">
                        {selectedTicket.details}
                      </p>
                    </div>
                  </div>

                  {selectedTicket.tags?.length ? (
                    <div className="space-y-2">
                      <h3 className="text-xs uppercase tracking-[0.3em] text-white/50">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {selectedTicket.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 px-3 py-1 uppercase tracking-wide text-white/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedTicket.affectedSystems?.length ? (
                      <div>
                        <h3 className="text-xs uppercase tracking-[0.3em] text-white/50">
                          Affected systems
                        </h3>
                        <ul className="mt-2 space-y-1 text-sm text-white/80">
                          {selectedTicket.affectedSystems.map((system) => (
                            <li key={system} className="list-inside list-disc">
                              {system}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {selectedTicket.affectedServers?.length ? (
                      <div>
                        <h3 className="text-xs uppercase tracking-[0.3em] text-white/50">
                          Affected servers
                        </h3>
                        <ul className="mt-2 space-y-1 text-sm text-white/80">
                          {selectedTicket.affectedServers.map((server) => (
                            <li key={server} className="list-inside list-disc">
                              {server}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>

                  {selectedTicket.affectedCustomers?.length ? (
                    <div>
                      <h3 className="text-xs uppercase tracking-[0.3em] text-white/50">
                        Customer impact
                      </h3>
                      <ul className="mt-2 flex flex-wrap gap-2 text-sm text-white/80">
                        {selectedTicket.affectedCustomers.map((customer) => (
                          <li
                            key={customer}
                            className="rounded-full border border-white/20 px-3 py-1"
                          >
                            {customer}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {selectedTicket.workload ? (
                    <div>
                      <h3 className="text-xs uppercase tracking-[0.3em] text-white/50">
                        Workload
                      </h3>
                      <p className="mt-2 text-sm text-white/80">
                        {selectedTicket.workload}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex min-h-[320px] items-center justify-center text-sm text-white/60">
                  {error
                    ? "Unable to load the inbox."
                    : "Select a ticket from the inbox list."}
                </div>
              )}
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
