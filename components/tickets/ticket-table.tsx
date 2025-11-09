"use client";

import { Fragment, useMemo, useState } from "react";

import type { FabricTicket } from "@/lib/tickets/types";
import { useProfile } from "@/contexts/profile-context";
import {
  hasPhysicalLimitations,
  isPhysicallyDemandingFloor,
} from "@/lib/profile/data";

type TicketTableProps = {
  tickets: FabricTicket[];
  mode: "admin" | "technician";
};

const severityColors: Record<FabricTicket["severity"], string> = {
  critical: "text-rose-200 border border-rose-400/40 bg-rose-400/10",
  high: "text-amber-200 border border-amber-400/40 bg-amber-400/10",
  medium: "text-emerald-200 border border-emerald-400/40 bg-emerald-400/10",
  low: "text-blue-200 border border-blue-400/40 bg-blue-400/10",
};

const channelCopy: Record<FabricTicket["channel"], string> = {
  manual: "Console input",
  slack: "Generated from Slack",
  email: "Generated from email",
};

const kindCopy: Record<FabricTicket["kind"], string> = {
  known: "Known",
  ambiguous: "Ambiguous",
  dispatch: "Dispatch",
};

export function TicketTable({ tickets, mode }: TicketTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { profile } = useProfile();
  const showHealthWarnings =
    mode === "technician" && hasPhysicalLimitations(profile);

  const grouped = useMemo(() => {
    return tickets.reduce<Record<string, FabricTicket[]>>((acc, row) => {
      acc[row.queue] = acc[row.queue] ?? [];
      acc[row.queue].push(row);
      return acc;
    }, {});
  }, [tickets]);

  const columns =
    mode === "admin"
      ? ["Ticket", "Customer", "Severity", "Owner", "ETA", "Tags", "Source"]
      : ["Ticket", "Task", "Priority", "Floor", "Distance", "Status", "Tags"];

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

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
              <Fragment key={row.id}>
                <tr
                  className="cursor-pointer border-t border-white/5 text-white hover:bg-white/5"
                  onClick={() => toggleRow(row.id)}
                  aria-expanded={expandedId === row.id}
                >
                  {mode === "admin" ? (
                    <>
                      <td className="px-4 py-4 font-semibold">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{row.title}</span>
                          <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] uppercase tracking-wide text-white/70">
                            {kindCopy[row.kind]}
                          </span>
                          {row.fastFixAvailable && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-200">
                              ⚡ Fast fix
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-white/60">{row.id}</div>
                      </td>
                      <td className="px-4 py-4">{row.customer ?? "—"}</td>
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
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{row.title}</span>
                          <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] uppercase tracking-wide text-white/70">
                            {kindCopy[row.kind]}
                          </span>
                        </div>
                        <div className="text-xs text-white/60">{row.id}</div>
                      </td>
                      <td className="px-4 py-4">{row.workload ?? "—"}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${severityColors[row.severity]}`}
                        >
                          {row.severity}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span>{row.floor ?? "—"}</span>
                          {showHealthWarnings &&
                            isPhysicallyDemandingFloor(row.floor) && (
                              <span
                                className="inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-500/20 px-2 py-1 text-[11px] font-semibold text-amber-200"
                                title="This floor may be physically demanding given your health conditions"
                              >
                                <svg
                                  className="h-3 w-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Caution
                              </span>
                            )}
                        </div>
                      </td>
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
                {expandedId === row.id ? (
                  <tr>
                    <td colSpan={columns.length} className="bg-black/30 px-4 py-4">
                      <TicketDetails ticket={row} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

type TicketDetailsProps = {
  ticket: FabricTicket;
};

function TicketDetails({ ticket }: TicketDetailsProps) {
  const affectedItems = [
    { label: "Customers", data: ticket.affectedCustomers },
    { label: "Systems", data: ticket.affectedSystems },
    { label: "Servers", data: ticket.affectedServers },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-white/80">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
            Summary
          </p>
          <p className="mt-2 text-white">{ticket.summary}</p>
          <p className="mt-2 text-xs text-white/60">
            Status: {ticket.status} · ETA {ticket.eta}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
            Impact
          </p>
          <div className="mt-2 space-y-2">
            {affectedItems.map(
              (item) =>
                item.data &&
                item.data.length > 0 && (
                  <div key={item.label}>
                    <p className="text-xs uppercase text-white/50">{item.label}</p>
                    <p>{item.data.join(", ")}</p>
                  </div>
                ),
            )}
          </div>
        </div>
        <div>
          {ticket.kind === "ambiguous" && ticket.hypotheses ? (
            <>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
                Hypotheses
              </p>
              <ul className="mt-2 space-y-1">
                {ticket.hypotheses.map((hypothesis) => (
                  <li
                    key={hypothesis.label}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-1"
                  >
                    <span>{hypothesis.label}</span>
                    <span className="text-xs font-semibold text-cyan-200">
                      {hypothesis.confidence}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
                Notes
              </p>
              <p className="mt-2 text-white">
                {ticket.details ?? "No additional notes"}
              </p>
            </>
          )}
        </div>
      </div>
      {ticket.team === "admin" && ticket.fastFixAvailable ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-emerald-200">
              Fast fix available
            </p>
            <p className="text-xs text-white/70">
              Launch automation to provision scoped credentials instantly.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Generate user + password
          </button>
        </div>
      ) : null}
    </div>
  );
}
