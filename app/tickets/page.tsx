"use client";

import { useMemo, useState } from "react";

import { FilterMultiSelect } from "@/components/tickets/filter-multi-select";
import { TicketTable } from "@/components/tickets/ticket-table";
import { LocationSwitcher } from "@/components/layout/location-switcher";
import { fabricLocations } from "@/lib/locations";
import { fabricTicketBacklog } from "@/lib/tickets/data";

const uniqueTags = Array.from(
  new Set(fabricTicketBacklog.flatMap((ticket) => ticket.tags)),
).sort();
const tagOptions = uniqueTags.map((tag) => ({ value: tag, label: tag }));
const severityOptions = ["critical", "high", "medium", "low"].map((severity) => ({
  value: severity,
  label: severity.charAt(0).toUpperCase() + severity.slice(1),
}));

export default function TicketsPage() {
  const [mode, setMode] = useState<"admin" | "technician">("admin");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);

  const filteredTickets = useMemo(() => {
    return fabricTicketBacklog.filter((ticket) => {
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
  }, [mode, selectedSeverities, selectedTags]);

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
            </div>
          </div>
          <TicketTable tickets={filteredTickets} mode={mode} />
        </section>
      </div>
    </div>
  );
}
