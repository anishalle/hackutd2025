"use client";

import { useEffect, useState } from "react";

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
  tags: (
    | "cabling"
    | "compute"
    | "cooling"
    | "firmware"
    | "hardware"
    | "inspection"
    | "install"
    | "interconnect"
    | "maintenance"
    | "mapping"
    | "network"
    | "optics"
    | "parallel"
    | "permissions"
    | "power"
    | "provisioning"
    | "redundancy"
    | "robotics"
    | "security"
    | "sensors"
    | "signal"
    | "software"
    | "storage"
    | "telemetry"
    | "vlan"
  )[];
  channel: "email";
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

export default function TicketGeneratorPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Ticket | null>(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/tickets/from-email");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load tickets");
      }

      const incoming: Ticket[] = data.tickets || [];
      setTickets(incoming);
      if (incoming.length > 0) {
        setSelected(incoming[0]);
      } else {
        setSelected(null);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Ticket Generator
          </h1>
          <p className="text-sm text-slate-400">
            AI-normalized incident tickets from{" "}
            <span className="font-mono">nmc.ops.demo@gmail.com</span>
          </p>
        </div>
        <button
          onClick={loadTickets}
          className="px-3 py-2 rounded-xl text-sm border border-slate-700 hover:border-sky-500 hover:bg-slate-900 transition"
        >
          Refresh
        </button>
      </header>

      {/* Main */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left: Ticket list */}
        <section className="w-full md:w-2/5 border-r border-slate-800 overflow-y-auto">
          {loading && (
            <div className="p-6 text-sm text-slate-400">
              Generating tickets…
            </div>
          )}

          {error && !loading && (
            <div className="p-6 text-sm text-rose-400">{error}</div>
          )}

          {!loading && !error && tickets.length === 0 && (
            <div className="p-6 text-sm text-slate-400">
              No tickets yet. Send an incident email to this inbox.
            </div>
          )}

          <ul>
            {tickets.map((t) => (
              <li
                key={t.id}
                onClick={() => setSelected(t)}
                className={`px-4 py-3 cursor-pointer border-b border-slate-900 hover:bg-slate-900/60 transition ${
                  selected?.id === t.id ? "bg-slate-900" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-medium truncate">
                    [{t.severity?.toUpperCase() || "UNKNOWN"}] {t.title}
                  </h2>
                  {t.eta && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full border border-slate-700 text-slate-300">
                      ETA {t.eta}
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap gap-1 items-center text-[9px] text-slate-400">
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                    {t.queue}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                    {t.team}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                    {t.kind}
                  </span>
                  {t.location && (
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                      {t.location}
                    </span>
                  )}
                  {t.customer && (
                    <span className="px-1.5 py-0.5 rounded-full bg-sky-900/40 border border-sky-700/60 text-sky-300">
                      {t.customer}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                  {t.summary}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Right: Ticket detail */}
        <section className="hidden md:flex flex-1 flex-col">
          {selected ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-800 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase text-sky-400">
                    Incident Ticket
                  </p>
                  <span className="text-[9px] px-2 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                    {selected.channel}
                  </span>
                </div>

                <h2 className="text-lg font-semibold">
                    [{selected.severity?.toUpperCase() || "UNKNOWN"}] {selected.title}
                </h2>

                <div className="flex flex-wrap gap-2 text-[9px] text-slate-300">
                  <span className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700">
                    ID: {selected.id}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700">
                    Queue: {selected.queue}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700">
                    Team: {selected.team}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700">
                    Kind: {selected.kind}
                  </span>
                  {selected.location && (
                    <span className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700">
                      Location: {selected.location}
                    </span>
                  )}
                  {selected.customer && (
                    <span className="px-2 py-1 rounded-full bg-sky-900/40 border border-sky-700/60 text-sky-300">
                      Customer: {selected.customer}
                    </span>
                  )}
                  {selected.owner && (
                    <span className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700">
                      Owner: {selected.owner}
                    </span>
                  )}
                  {selected.status && (
                    <span className="px-2 py-1 rounded-full bg-slate-900 border border-emerald-700 text-emerald-300">
                      {selected.status}
                    </span>
                  )}
                  {selected.eta && (
                    <span className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700">
                      ETA: {selected.eta}
                    </span>
                  )}
                  {selected.parallelReady && (
                    <span className="px-2 py-1 rounded-full bg-slate-900 border border-violet-700 text-violet-300">
                      Parallel ready
                      {selected.parallelGroup
                        ? ` (${selected.parallelGroup})`
                        : ""}
                    </span>
                  )}
                  {selected.fastFixAvailable && (
                    <span className="px-2 py-1 rounded-full bg-slate-900 border border-amber-500 text-amber-300">
                      Fast fix available
                    </span>
                  )}
                </div>

                {/* Tags */}
                {selected.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selected.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[8px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 uppercase tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 text-sm space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase">
                    Summary
                  </h3>
                  <p className="mt-1 text-slate-200 whitespace-pre-wrap">
                    {selected.summary}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase">
                    Details
                  </h3>
                  <p className="mt-1 text-slate-200 whitespace-pre-wrap">
                    {selected.details}
                  </p>
                </div>

                {selected.affectedSystems && selected.affectedSystems.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase">
                      Affected Systems
                    </h3>
                    <ul className="mt-1 text-slate-200 text-sm list-disc list-inside space-y-0.5">
                      {selected.affectedSystems.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.affectedServers && selected.affectedServers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase">
                      Affected Servers
                    </h3>
                    <ul className="mt-1 text-slate-200 text-sm list-disc list-inside space-y-0.5">
                      {selected.affectedServers.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.affectedCustomers &&
                  selected.affectedCustomers.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase">
                        Affected Customers
                      </h3>
                      <ul className="mt-1 text-slate-200 text-sm list-disc list-inside space-y-0.5">
                        {selected.affectedCustomers.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selected.workload && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase">
                      Workload
                    </h3>
                    <p className="mt-1 text-slate-200">
                      {selected.workload}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
              Select a ticket on the left to inspect the incident.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
