"use client";

import { useMemo, useState } from "react";

import { TicketTable, type TicketRecord } from "@/components/tickets/ticket-table";
import { LocationSwitcher } from "@/components/layout/location-switcher";
import { fabricLocations } from "@/lib/locations";

const tickets: TicketRecord[] = [
  {
    id: "WO-9824",
    queue: "Parallel ready",
    title: "Provision 10-node pod for SentiAI",
    customer: "SentiAI",
    severity: "high",
    owner: "Aya Burke",
    status: "Queued",
    eta: "00:25",
    tags: ["provisioning", "parallel"],
    channel: "manual",
    parallelReady: true,
    team: "admin",
    location: "Austin",
    workload: "Provision pod",
  },
  {
    id: "WO-9827",
    queue: "Critical path",
    title: "Replace PSU on rack P44",
    customer: "Redline Motors",
    severity: "critical",
    owner: "Crew Delta",
    status: "Crew en route",
    eta: "00:15",
    tags: ["power", "slack-generated"],
    channel: "slack",
    parallelReady: false,
    team: "admin",
    location: "Austin",
    workload: "Power swap",
  },
  {
    id: "WO-9832",
    queue: "Parallel ready",
    title: "Grant burst permissions for OmniBio",
    customer: "OmniBio",
    severity: "medium",
    owner: "IAM bot",
    status: "Automation ready",
    eta: "On-demand",
    tags: ["permissions", "parallel"],
    channel: "manual",
    parallelReady: true,
    team: "admin",
    location: "Austin",
    workload: "Access policy",
  },
  {
    id: "SIG-448",
    queue: "Investigations",
    title: "West aisle network flap",
    customer: "Shared fabric",
    severity: "medium",
    owner: "NetOps",
    status: "Signal analysing",
    eta: "Triage @ 01:00",
    tags: ["network", "optics"],
    channel: "email",
    parallelReady: false,
    team: "admin",
    location: "Austin",
    workload: "Signal triage",
  },
  {
    id: "WO-9830",
    queue: "Dispatch now",
    title: "Swap QSFP on spine 6",
    severity: "critical",
    owner: "Crew Alpha",
    status: "On floor",
    eta: "In-progress",
    tags: ["cabling", "optics"],
    channel: "slack",
    team: "technician",
    location: "Austin",
    floor: "L3 · Aisle 6",
    distance: "58m",
    workload: "QSFP swap",
  },
  {
    id: "WO-9828",
    queue: "Dispatch now",
    title: "Inspect liquid loop Delta pod",
    severity: "high",
    owner: "Crew Echo",
    status: "Queued",
    eta: "00:35",
    tags: ["cooling", "inspection"],
    channel: "manual",
    team: "technician",
    location: "Austin",
    floor: "L2 · Cold Row",
    distance: "74m",
    workload: "Loop inspection",
  },
  {
    id: "WO-9831",
    queue: "Next up",
    title: "Verify cabling bundle 44B",
    severity: "medium",
    owner: "Crew Foxtrot",
    status: "Waiting clearance",
    eta: "01:10",
    tags: ["cabling", "mapping"],
    channel: "manual",
    team: "technician",
    location: "Austin",
    floor: "L2 · Hot Row",
    distance: "110m",
    workload: "Bundle verify",
  },
  {
    id: "SIG-452",
    queue: "Investigations",
    title: "Intermittent reset on sleds 7A-7C",
    severity: "high",
    owner: "Crew Zulu",
    status: "Diagnostics",
    eta: "Await parts",
    tags: ["signal", "compute"],
    channel: "email",
    team: "technician",
    location: "Austin",
    floor: "L1 · Pod 7",
    distance: "140m",
    workload: "Diagnostics",
  },
];

const tagFilters = ["all", "provisioning", "parallel", "cabling", "cooling", "optics"];
const severityFilters = ["all", "critical", "high", "medium"];

export default function TicketsPage() {
  const [mode, setMode] = useState<"admin" | "technician">("admin");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (ticket.team !== mode) return false;
      if (severityFilter !== "all" && ticket.severity !== severityFilter) {
        return false;
      }
      if (tagFilter !== "all" && !ticket.tags.includes(tagFilter)) {
        return false;
      }
      return true;
    });
  }, [mode, tagFilter, severityFilter]);

  return (
    <div className="min-h-screen bg-[#01040b] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_45%)]" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-16 pt-10 lg:px-10">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">
                Ticket system
              </p>
              <h1 className="text-4xl font-semibold">Work orders · database</h1>
              <p className="mt-2 max-w-2xl text-base text-white/70">
                Filters, tags, and SLAs faced by admin vs technician flows in one view.
              </p>
            </div>
            <div className="w-full max-w-xs flex-1">
              <LocationSwitcher locations={fabricLocations} initialId="demo" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Open tickets", value: "27", sub: "6 dispatch now" },
              { label: "Parallel-ready", value: "8", sub: "Auto-run possible" },
              { label: "Ambiguous signals", value: "3", sub: "Need triage" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              >
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  {stat.label}
                </p>
                <p className="text-3xl font-semibold">{stat.value}</p>
                <p className="text-sm text-white/60">{stat.sub}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-1 text-sm">
              {(["admin", "technician"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMode(tab)}
                  className={`rounded-2xl px-4 py-2 font-semibold capitalize transition ${
                    mode === tab
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-1">
                {severityFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSeverityFilter(filter)}
                    className={`rounded-2xl px-3 py-1 uppercase tracking-wide ${
                      severityFilter === filter
                        ? "bg-white/10 text-white"
                        : "text-white/60"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-1">
                {tagFilters.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={`rounded-2xl px-3 py-1 text-xs uppercase tracking-wide ${
                      tagFilter === tag ? "bg-white/10 text-white" : "text-white/60"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <TicketTable tickets={filteredTickets} mode={mode} />
        </section>
      </div>
    </div>
  );
}
