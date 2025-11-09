"use client";

import { useMemo, useState } from "react";

import {
  InventoryTable,
  type InventoryAsset,
} from "@/components/inventory/inventory-table";
import { LocationSwitcher } from "@/components/layout/location-switcher";
import { fabricLocations } from "@/lib/locations";

const assets: InventoryAsset[] = [
  {
    id: "INV-401",
    item: "QSFP-DD 400G optic",
    shelf: "A3-04",
    floor: "L3 · Spine bay",
    status: "in_use",
    spare: false,
    timeInUse: "412 h",
    utilization: "82%",
    slurmState: "ALLOC",
  },
  {
    id: "INV-402",
    item: "Power shelf (N+1)",
    shelf: "P1-11",
    floor: "L2 · Power room",
    status: "mix",
    spare: true,
    timeInUse: "112 h",
    utilization: "61%",
    slurmState: "MIX",
  },
  {
    id: "INV-403",
    item: "Cold plate gasket kit",
    shelf: "C2-07",
    floor: "L2 · Cold row",
    status: "idle",
    spare: true,
    timeInUse: "18 h",
    utilization: "5%",
    slurmState: "IDLE",
  },
  {
    id: "INV-404",
    item: "NVLink harness",
    shelf: "N1-02",
    floor: "L1 · Pod staging",
    status: "drained",
    spare: false,
    timeInUse: "672 h",
    utilization: "offline",
    slurmState: "DRAIN",
  },
  {
    id: "INV-405",
    item: "H100 sled assembly",
    shelf: "H4-12",
    floor: "L3 · Build lab",
    status: "in_use",
    spare: false,
    timeInUse: "96 h",
    utilization: "66%",
    slurmState: "ALLOC",
  },
  {
    id: "INV-406",
    item: "Fiber trunk (MTP-24)",
    shelf: "F5-03",
    floor: "L2 · Cable mezzanine",
    status: "idle",
    spare: true,
    timeInUse: "0 h",
    utilization: "—",
    slurmState: "IDLE",
  },
];

const statusFilters: Array<InventoryAsset["status"] | "all"> = [
  "all",
  "in_use",
  "mix",
  "idle",
  "drained",
];

export default function InventoryPage() {
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("all");
  const [spareOnly, setSpareOnly] = useState(false);
  const [query, setQuery] = useState("");

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (status !== "all" && asset.status !== status) return false;
      if (spareOnly && !asset.spare) return false;
      if (
        query &&
        !`${asset.item} ${asset.id} ${asset.shelf} ${asset.floor}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [status, spareOnly, query]);

  return (
    <div className="min-h-screen bg-[#01040b] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_45%)]" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-16 pt-10 lg:px-10">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">
                Inventory
              </p>
              <h1 className="text-4xl font-semibold">Predictive shelves</h1>
              <p className="mt-2 max-w-2xl text-base text-white/70">
                Track parts across floors, SLURM states, and spare policies in a single
                table.
              </p>
            </div>
            <div className="w-full max-w-xs flex-1">
              <LocationSwitcher locations={fabricLocations} initialId="demo" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Shelves tracked", value: "64", sub: "Austin fabric" },
              { label: "Spare coverage", value: "92%", sub: "meets policy" },
              { label: "Drained assets", value: "4", sub: "awaiting swaps" },
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

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatus(filter)}
                  className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition ${
                    status === filter
                      ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-100"
                      : "border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
                <input
                  type="checkbox"
                  checked={spareOnly}
                  onChange={(e) => setSpareOnly(e.target.checked)}
                  className="h-4 w-4 rounded border border-white/30 bg-transparent"
                />
                Spare only
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search asset or shelf"
                className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none placeholder:text-white/40"
              />
            </div>
          </div>
          <InventoryTable assets={filteredAssets} />
        </section>
      </div>
    </div>
  );
}
