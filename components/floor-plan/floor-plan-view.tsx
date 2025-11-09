'use client';

import { useMemo, useState } from "react";

import { BundlePicker } from "@/components/floor-plan/bundle-picker";
import { FloorCellModal } from "@/components/floor-plan/floor-cell-modal";
import { FloorPlanCanvas } from "@/components/floor-plan/floor-plan-canvas";
import { FloorPlanLegend } from "@/components/floor-plan/floor-plan-legend";
import { FloorSelector } from "@/components/floor-plan/floor-selector";
import { RoutePanel } from "@/components/floor-plan/route-panel";
import {
  buildTechnicianBundles,
  generateTechnicianRoute,
  type TechnicianBundle,
} from "@/lib/floor-plan/technician-routing";
import { floorClusterIndex } from "@/lib/floor-plan/data";
import { fabricTicketBacklog } from "@/lib/tickets/data";
import type { FabricTicket } from "@/lib/tickets/types";
import {
  FabricFloor,
  TileDefinition,
} from "@/lib/floor-plan/types";
import type { CellSelectionPayload } from "@/components/floor-plan/floor-plan-canvas";

type FloorPlanViewProps = {
  floors: FabricFloor[];
  tiles: TileDefinition[];
};

export function FloorPlanView({
  floors,
  tiles,
}: FloorPlanViewProps) {
  const [activeFloorId, setActiveFloorId] = useState(floors[0]?.id ?? "");
  const activeFloor =
    floors.find((floor) => floor.id === activeFloorId) ?? floors[0];

  const [cachedTickets] = useState<FabricTicket[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("nmc.emailTickets");
      if (!raw) return [];
      return JSON.parse(raw) as FabricTicket[];
    } catch (error) {
      console.warn("Failed to load cached technician tickets", error);
      return [];
    }
  });
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);

  const tickets = useMemo(() => {
    const seen = new Set<string>();
    return [...cachedTickets, ...fabricTicketBacklog].filter((ticket) => {
      if (seen.has(ticket.id)) return false;
      seen.add(ticket.id);
      return true;
    });
  }, [cachedTickets]);

  const technicianBundles = useMemo(() => {
    const bundles = buildTechnicianBundles(tickets, floorClusterIndex);
    return [...bundles].sort((a, b) => b.score - a.score);
  }, [tickets]);

  const activeBundle: TechnicianBundle | null = useMemo(() => {
    if (technicianBundles.length === 0) return null;
    if (
      selectedBundleId &&
      technicianBundles.some((bundle) => bundle.id === selectedBundleId)
    ) {
      return technicianBundles.find((bundle) => bundle.id === selectedBundleId) ?? null;
    }
    return technicianBundles[0] ?? null;
  }, [technicianBundles, selectedBundleId]);

  const routeResult = useMemo(() => {
    if (!activeBundle) return null;
    return generateTechnicianRoute({
      bundle: activeBundle,
      floors,
      clusterIndex: floorClusterIndex,
    });
  }, [activeBundle, floors]);

  const route = routeResult?.stops ?? [];
  const technicianPath = routeResult?.path ?? [];
  const unresolvedTasks = routeResult?.unresolvedTasks ?? [];
  const totalDistance = routeResult?.totalDistance ?? 0;

  const activeInventory = useMemo(() => {
    if (!activeFloor?.annotations) return [];
    return activeFloor.annotations.filter(
      (annotation) => annotation.kind === "inventory",
    );
  }, [activeFloor]);

  const [selectedCell, setSelectedCell] = useState<CellSelectionPayload | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950/70 to-slate-950 px-6 pb-16 text-white">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="space-y-3 pt-6">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Floor plan canvas
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Technician routing + HPC floor state
          </h1>
          <p className="max-w-3xl text-sm text-white/70">
            Visualize hot/cold aisles, inventory caches, and technician loops
            across all three levels. Pick any bundled set of dispatch tickets to
            generate a dependency-aware walk order that respects inventory pulls,
            elevator penalties, and Ops desk hand-off.
          </p>
        </header>

        <FloorSelector
          floors={floors}
          activeFloorId={activeFloor?.id ?? ""}
          onSelect={setActiveFloorId}
        />

        <BundlePicker
          bundles={technicianBundles}
          selectedId={activeBundle?.id ?? null}
          onSelect={(id) => setSelectedBundleId(id)}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          {activeFloor ? (
            <FloorPlanCanvas
              key={activeFloor.id}
              floor={activeFloor}
              tileDefinitions={tiles}
              route={route}
              path={technicianPath}
              onSelectCell={(payload) => setSelectedCell(payload)}
            />
          ) : null}

          <FloorPlanLegend tiles={tiles} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RoutePanel
            route={route}
            bundle={activeBundle}
            totalDistance={totalDistance}
            unresolvedTasks={unresolvedTasks}
          />

          <div className="rounded-3xl border border-white/5 bg-slate-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              {activeFloor?.label} · telemetry
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-white/70">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Temp
                </p>
                <p className="text-lg font-semibold text-white">
                  {activeFloor?.environmental?.temp ?? "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Airflow
                </p>
                <p className="text-lg font-semibold text-white">
                  {activeFloor?.environmental?.airflow ?? "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Humidity
                </p>
                <p className="text-lg font-semibold text-white">
                  {activeFloor?.environmental?.humidity ?? "—"}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                Inventory spots
              </p>
              <div className="mt-3 space-y-2">
                {activeInventory.length === 0 ? (
                  <p className="text-sm text-white/60">
                    No inventory caches on this level.
                  </p>
                ) : (
                  activeInventory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm text-white/80"
                    >
                      <div>
                        <p className="font-semibold text-white">{item.label}</p>
                        <p className="text-white/60">{item.detail}</p>
                      </div>
                      <p className="text-xs text-white/60">
                        cell ({item.coord.x}, {item.coord.y})
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <FloorCellModal selection={selectedCell} onClose={() => setSelectedCell(null)} />
    </div>
  );
}
