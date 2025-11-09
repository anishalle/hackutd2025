"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { FilterMultiSelect } from "@/components/tickets/filter-multi-select";
import { TicketTable } from "@/components/tickets/ticket-table";
import { LocationSwitcher } from "@/components/layout/location-switcher";
import { fabricLocations } from "@/lib/locations";
import { fabricTicketBacklog } from "@/lib/tickets/data";
import type { FabricTicket } from "@/lib/tickets/types";
import {
  BundlingEngine,
  type Bundle,
  type EnhancedTask,
  type TaskCategory,
} from "@/lib/bundling-engine";
import { useProfile } from "@/contexts/profile-context";
import {
  hasPhysicalLimitations,
  isPhysicallyDemandingFloor,
} from "@/lib/profile/data";

const severityOptions = ["critical", "high", "medium", "low"].map((severity) => ({
  value: severity,
  label: severity.charAt(0).toUpperCase() + severity.slice(1),
}));

export default function TicketsPage() {
  const [mode, setMode] = useState<"admin" | "technician">("admin");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "bundles">("table");
  const [emailTickets] = useState<FabricTicket[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const rawTickets = window.localStorage.getItem("nmc.emailTickets");
      if (!rawTickets) return [];
      return JSON.parse(rawTickets) as FabricTicket[];
    } catch (error) {
      console.error("Failed to parse cached email tickets", error);
      return [];
    }
  });
  const [lastSyncedAt] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const rawTimestamp = window.localStorage.getItem("nmc.emailTicketsSyncedAt");
    if (!rawTimestamp) return null;
    const timestamp = Number(rawTimestamp);
    return Number.isFinite(timestamp) ? timestamp : null;
  });

  const combinedTickets = useMemo(() => {
    const seen = new Set<string>();
    return [...emailTickets, ...fabricTicketBacklog].filter((ticket) => {
      if (seen.has(ticket.id)) return false;
      seen.add(ticket.id);
      return true;
    });
  }, [emailTickets]);

  const tagOptions = useMemo(() => {
    const tags = new Set<string>();
    combinedTickets.forEach((ticket) => {
      ticket.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags)
      .sort((a, b) => a.localeCompare(b))
      .map((tag) => ({ value: tag, label: tag }));
  }, [combinedTickets]);

  const filteredTickets = useMemo(() => {
    return combinedTickets.filter((ticket) => {
      if (ticket.team !== mode) return false;
      if (
        selectedSeverities.length > 0 &&
        !selectedSeverities.includes(ticket.severity)
      ) {
        return false;
      }
      if (
        selectedTags.length > 0 &&
        !ticket.tags.some((tag) => selectedTags.includes(tag))
      ) {
        return false;
      }
      return true;
    });
  }, [mode, selectedSeverities, selectedTags, combinedTickets]);

  const bundles = useMemo(() => {
    if (viewMode !== "bundles") return [];
    if (filteredTickets.length === 0) return [];
    const bundleCandidates = filteredTickets.filter(
      (ticket) => ticket.kind !== "ambiguous",
    );
    if (bundleCandidates.length === 0) return [];
    const engine = new BundlingEngine();
    const enhancedTasks = bundleCandidates.map(mapTicketToEnhancedTask);
    return engine.bundleTasks(enhancedTasks);
  }, [viewMode, filteredTickets]);

  const inboxStatus = useMemo(() => {
    if (lastSyncedAt) {
      const label = new Date(lastSyncedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `Inbox synced at ${label} · ${emailTickets.length} ticket${emailTickets.length === 1 ? "" : "s"}`;
    }
    return "Open the email inbox to sync AI tickets.";
  }, [lastSyncedAt, emailTickets.length]);

  const bundleSummary = useMemo(() => {
    if (viewMode !== "bundles" || bundles.length === 0) return null;
    const totalTasks = bundles.reduce(
      (sum, bundle) => sum + bundle.tasks.length,
      0,
    );
    const totalTimeSaved = bundles.reduce(
      (sum, bundle) => sum + calculateTimeSaved(bundle.tasks),
      0,
    );
    return `${bundles.length} bundle${bundles.length === 1 ? "" : "s"} · ${totalTasks} task${totalTasks === 1 ? "" : "s"} · ~${totalTimeSaved} min saved`;
  }, [bundles, viewMode]);

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
            <div className="flex w-full max-w-xs flex-1 flex-col gap-3">
              <LocationSwitcher locations={fabricLocations} initialId="demo" />
              <Link
                href="/ticketgenerator"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(236,72,153,0.25)] transition hover:border-white/40 hover:from-fuchsia-500 hover:to-cyan-500"
              >
                Open email inbox
              </Link>
              <p className="text-xs text-white/60">{inboxStatus}</p>
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
          <div className="flex flex-wrap items-center gap-4">
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
            <div className="ml-auto flex flex-wrap items-center gap-3 text-xs">
              <FilterMultiSelect
                label="Severity"
                options={severityOptions}
                selected={selectedSeverities}
                onChange={setSelectedSeverities}
              />
              <FilterMultiSelect
                label="Tags"
                options={tagOptions}
                selected={selectedTags}
                onChange={setSelectedTags}
              />
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 p-1 text-xs">
                {[
                  { label: "Table view", value: "table" },
                  { label: "Grouped bundles", value: "bundles" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setViewMode(option.value as "table" | "bundles")}
                    className={`rounded-2xl px-3 py-1 font-semibold transition ${
                      viewMode === option.value
                        ? "bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {viewMode === "bundles" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
                <span>{bundleSummary ?? "No compatible tickets available for bundling."}</span>
                <span className="text-white/40">
                  Bundles consider severity, category, location, and time windows.
                </span>
              </div>
              <BundleBoard bundles={bundles} />
            </div>
          ) : (
            <TicketTable tickets={filteredTickets} mode={mode} />
          )}
        </section>
      </div>
    </div>
  );
}

type BundledTask = (EnhancedTask & { originalTicket: FabricTicket });

const severityToEnhanced: Record<FabricTicket["severity"], EnhancedTask["severity"]> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "medium",
};

const priorityBySeverity: Record<FabricTicket["severity"], "critical" | "high" | "medium" | "standard"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "standard",
};

const severityDurationMap: Record<EnhancedTask["severity"], number> = {
  critical: 45,
  high: 35,
  medium: 25,
};

function mapTicketToEnhancedTask(ticket: FabricTicket): BundledTask {
  const severity = severityToEnhanced[ticket.severity];
  const category = deriveCategory(ticket.title, ticket.tags);
  return {
    id: ticket.id,
    title: ticket.title,
    severity,
    eta: ticket.eta,
    details: ticket.details
      ? `${ticket.summary} · ${ticket.details}`
      : ticket.summary,
    parallelGroup: ticket.parallelGroup,
    source: ticket.channel,
    category,
    taskType: ticket.workload,
    location: deriveLocation(ticket),
    timeWindow: deriveTimeWindow(ticket.eta),
    estimatedDuration: severityDurationMap[severity],
    priority: priorityBySeverity[ticket.severity],
    company: ticket.customer,
    resourceRequirements: {
      crew: ticket.team,
      requiresShutdown:
        ticket.severity === "critical" ||
        ticket.tags.some((tag) => ["power", "cooling"].includes(tag)),
      requiresVendorAccess: ticket.tags.includes("vendor"),
    },
    originalTicket: ticket,
  };
}

function deriveCategory(title: string, tags: string[]): TaskCategory {
  const haystack = `${title} ${tags.join(" ")}`.toLowerCase();
  if (haystack.includes("emergency") || haystack.includes("incident")) {
    return "EMERGENCY";
  }
  if (
    haystack.includes("provision") ||
    haystack.includes("allocate") ||
    haystack.includes("quota") ||
    haystack.includes("cluster") ||
    tags.includes("provisioning")
  ) {
    return "PROVISIONING";
  }
  if (
    haystack.includes("permission") ||
    haystack.includes("access") ||
    haystack.includes("policy") ||
    tags.includes("permissions")
  ) {
    return "ACCESS_CONTROL";
  }
  if (
    haystack.includes("deploy") ||
    haystack.includes("container") ||
    haystack.includes("install") ||
    tags.includes("deployment")
  ) {
    return "DEPLOYMENT";
  }
  if (
    haystack.includes("monitor") ||
    haystack.includes("dashboard") ||
    haystack.includes("analysis") ||
    tags.includes("monitoring")
  ) {
    return "MONITORING";
  }
  if (
    haystack.includes("config") ||
    haystack.includes("update") ||
    haystack.includes("network") ||
    haystack.includes("firmware") ||
    tags.includes("configuration")
  ) {
    return "CONFIGURATION";
  }
  return "PROVISIONING";
}

function deriveTimeWindow(eta: string): string {
  const normalized = eta.toLowerCase();
  if (normalized.includes("progress") || normalized.includes("dispatch")) {
    return "Now-01:00";
  }
  const match = normalized.match(/\d{2}:\d{2}/g);
  if (match && match.length >= 1) {
    const start = match[0]!;
    const end = match[1] ?? "02:00";
    return `${start}-${end}`;
  }
  return "00:30-02:00";
}

function deriveLocation(ticket: FabricTicket) {
  const [level, area] =
    ticket.floor?.split("·").map((part) => part.trim()) ?? [];
  return {
    building: ticket.location || "Austin Fabric",
    floor: level,
    aisle: area,
    region: "us-south",
  };
}

function calculateTimeSaved(tasks: EnhancedTask[]): number {
  if (tasks.length < 2) return 0;
  const sequential = tasks.reduce((sum, task) => {
    const duration =
      task.estimatedDuration ?? severityDurationMap[task.severity] ?? 25;
    return sum + duration;
  }, 0);
  const longest = tasks.reduce((max, task) => {
    const duration =
      task.estimatedDuration ?? severityDurationMap[task.severity] ?? 25;
    return Math.max(max, duration);
  }, 0);
  return Math.max(0, sequential - longest);
}

function BundleBoard({ bundles }: { bundles: Bundle[] }) {
  const { profile } = useProfile();
  const showHealthWarnings = hasPhysicalLimitations(profile);

  if (bundles.length === 0) {
    return (
      <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-5 text-sm text-white/70">
        No compatible tickets match the current filters for grouping. Try
        including more tags or change severity filters.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {bundles.map((bundle) => (
        <BundleCard
          key={bundle.id}
          bundle={bundle}
          showHealthWarnings={showHealthWarnings}
        />
      ))}
    </div>
  );
}

const severityBadgeColors: Record<EnhancedTask["severity"], string> = {
  critical: "bg-rose-500/20 text-rose-100 border border-rose-400/40",
  high: "bg-amber-500/20 text-amber-100 border border-amber-400/40",
  medium: "bg-emerald-500/20 text-emerald-100 border border-emerald-400/40",
};

function BundleCard({
  bundle,
  showHealthWarnings,
}: {
  bundle: Bundle;
  showHealthWarnings: boolean;
}) {
  const tasks = bundle.tasks as BundledTask[];
  const timeSaved = calculateTimeSaved(tasks);
  const isSingleTask = tasks.length === 1;

  return (
    <article className="rounded-3xl border border-white/10 bg-black/30 p-5 shadow-[0_15px_60px_rgba(15,15,30,0.45)]">
      <header
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm text-white bg-gradient-to-r ${bundle.color}`}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            {isSingleTask ? "Dedicated task" : "Bundled tasks"}
          </p>
          <p className="text-lg font-semibold">
            {tasks.length} task{tasks.length === 1 ? "" : "s"} ·{" "}
            {bundle.bundleScore}% similarity
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/70">
            {bundle.reasons.slice(0, 2).join(" · ") || "Compatibility heuristic"}
          </p>
          {timeSaved > 0 ? (
            <p className="text-sm font-semibold text-cyan-200">
              ~{timeSaved} min saved
            </p>
          ) : (
            <p className="text-sm font-semibold text-white">
              Parallel execution recommended
            </p>
          )}
        </div>
      </header>

      <div className="mt-4 space-y-3">
        {tasks.map((task) => {
          const ticket = task.originalTicket;
          const isDemandingFloor =
            showHealthWarnings && isPhysicallyDemandingFloor(ticket.floor);
          return (
            <div
              key={task.id}
              className={`rounded-2xl border p-4 text-sm text-white transition ${
                isDemandingFloor
                  ? "border-amber-400/30 bg-amber-500/5 hover:border-amber-400/50"
                  : "border-white/10 bg-white/5 hover:border-white/30"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-xs text-white/60">
                    {ticket.id} · {ticket.queue}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${severityBadgeColors[task.severity]}`}
                  >
                    {task.severity}
                  </span>
                  {ticket.parallelReady ? (
                    <span className="inline-flex items-center rounded-full border border-cyan-400/50 px-3 py-1 text-[11px] uppercase tracking-wide text-cyan-200">
                      Parallel ready
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 grid gap-3 text-xs text-white/70 sm:grid-cols-3">
                <div>
                  <p className="uppercase tracking-[0.3em] text-white/40">ETA</p>
                  <p className="text-white">{task.eta}</p>
                </div>
                <div>
                  <p className="uppercase tracking-[0.3em] text-white/40">
                    Customer
                  </p>
                  <p className="text-white">{ticket.customer ?? "Internal"}</p>
                </div>
                <div>
                  <p className="uppercase tracking-[0.3em] text-white/40">
                    Location
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-white">{formatLocation(ticket)}</p>
                    {isDemandingFloor && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-200"
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
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-white/60">
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                  {task.category}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                  {ticket.channel}
                </span>
                {ticket.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function formatLocation(ticket: FabricTicket): string {
  if (ticket.floor) return ticket.floor;
  return ticket.location;
}
