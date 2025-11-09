'use client';

import { useMemo, useState } from "react";

import { FloorPlanCanvas } from "@/components/floor-plan/floor-plan-canvas";
import { FloorPlanLegend } from "@/components/floor-plan/floor-plan-legend";
import { FloorSelector } from "@/components/floor-plan/floor-selector";
import { RoutePanel } from "@/components/floor-plan/route-panel";
import { useTechnicianRoute } from "@/components/floor-plan/use-technician-route";
import {
  FabricFloor,
  PathGraph,
  RouteSequence,
  TileDefinition,
} from "@/lib/floor-plan/types";

type FloorPlanViewProps = {
  floors: FabricFloor[];
  tiles: TileDefinition[];
  graph: PathGraph;
  presets: Record<string, RouteSequence>;
};

export function FloorPlanView({
  floors,
  tiles,
  graph,
  presets,
}: FloorPlanViewProps) {
  const [activeFloorId, setActiveFloorId] = useState(floors[0]?.id ?? "");
  const activeFloor =
    floors.find((floor) => floor.id === activeFloorId) ?? floors[0];

  const { route, activePreset, shell } = useTechnicianRoute(
    graph,
    presets,
    "baseline",
  );

  const activeInventory = useMemo(() => {
    if (!activeFloor?.annotations) return [];
    return activeFloor.annotations.filter(
      (annotation) => annotation.kind === "inventory",
    );
  }, [activeFloor]);

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
            Visualize hot/cold aisles, inventory caches, and technician paths
            across all three levels. Update the pathfinding preset to simulate
            priority-based or shortest-walk runs without touching the
            underlying grid definitions.
          </p>
        </header>

        <FloorSelector
          floors={floors}
          activeFloorId={activeFloor?.id ?? ""}
          onSelect={setActiveFloorId}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          {activeFloor ? (
            <FloorPlanCanvas
              key={activeFloor.id}
              floor={activeFloor}
              tileDefinitions={tiles}
              route={route}
            />
          ) : null}

          <FloorPlanLegend tiles={tiles} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RoutePanel
            route={route}
            activePreset={activePreset ?? "baseline"}
            shell={shell}
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
    </div>
  );
}
