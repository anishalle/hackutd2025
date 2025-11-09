"use client";

import dynamic from "next/dynamic";

import type { CellSelectionPayload } from "@/components/floor-plan/floor-plan-canvas";
import { getCellInsight } from "@/lib/floor-plan/cell-insights";

const ThreeScene = dynamic(() => import("@/threescene"), {
  ssr: false,
});

type FloorCellModalProps = {
  selection: CellSelectionPayload | null;
  onClose: () => void;
};

export function FloorCellModal({ selection, onClose }: FloorCellModalProps) {
  const insight = selection
    ? getCellInsight(selection.floor.id, selection.coord)
    : null;
  const isTaskCell = Boolean(selection?.routeNode);
  const markerLabels =
    insight && isTaskCell
      ? insight.taskMarkers ?? {}
      : insight?.generalMarkers ?? {};

  if (!selection) return null;

  const { floor, coord, routeNode, tile, clusters } = selection;
  const coordLabel = `cell (${coord.x}, ${coord.y})`;
  const header = routeNode?.label ?? clusters[0]?.label ?? tile?.label ?? "Untitled location";
  const summary = insight?.summary ?? "No telemetry wired to this cell yet.";
  const badge = routeNode?.priority ?? clusters[0]?.kind ?? tile?.description;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl rounded-3xl border border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/70 transition hover:bg-white/20"
        >
          Close
        </button>
        <div className="space-y-2 pr-16">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            {floor.label} · {coordLabel}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-semibold">{header}</h2>
            {badge ? (
              <span className="rounded-full border border-cyan-400/40 px-3 py-1 text-xs uppercase tracking-wide text-cyan-200">
                {badge}
              </span>
            ) : null}
          </div>
          <p className="text-white/70">{summary}</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div className="space-y-4">
            {isTaskCell ? (
              <TaskDetails
                action={routeNode?.action}
                priority={routeNode?.priority}
                distance={routeNode?.distanceMeters}
                insightSummary={insight?.summary}
                notes={insight?.notes}
                metrics={insight?.metrics ?? []}
              />
            ) : (
              <TelemetryDetails
                metrics={insight?.metrics ?? []}
                thermals={insight?.thermals}
                utilization={insight?.utilization}
                notes={insight?.notes}
              />
            )}

            {clusters.length > 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  Related clusters
                </p>
                <div className="mt-3 space-y-2 text-sm text-white/80">
                  {clusters.map((cluster) => (
                    <div key={cluster.id}>
                      <p className="font-semibold text-white">{cluster.label}</p>
                      {cluster.summary ? (
                        <p className="text-white/60">{cluster.summary}</p>
                      ) : null}
                      {cluster.tags && cluster.tags.length > 0 ? (
                        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                          {cluster.tags.join(" · ")}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-2 shadow-inner">
            <ThreeScene labels={markerLabels} width="100%" height="min(60vh, 520px)" />
            <p className="mt-2 text-center text-xs uppercase tracking-[0.3em] text-white/40">
              3D rack sandbox · click + drag to inspect
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

type TaskDetailsProps = {
  action?: string;
  priority?: string;
  distance?: number;
  insightSummary?: string;
  notes?: string[];
  metrics: { label: string; value: string; trend?: string }[];
};

function TaskDetails({
  action,
  priority,
  distance,
  insightSummary,
  notes,
  metrics,
}: TaskDetailsProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Task details
      </p>
      <ul className="space-y-3 text-sm text-white/80">
        {action ? (
          <li>
            <span className="text-white/60">Action: </span>
            {action}
          </li>
        ) : null}
        {priority ? (
          <li>
            <span className="text-white/60">Priority: </span>
            {priority}
          </li>
        ) : null}
        {typeof distance === "number" ? (
          <li>
            <span className="text-white/60">Distance accrued: </span>
            {distance} m
          </li>
        ) : null}
        {insightSummary ? (
          <li>
            <span className="text-white/60">Context: </span>
            {insightSummary}
          </li>
        ) : null}
      </ul>
      {metrics.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 text-sm">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-white/5 bg-black/30 p-3"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                {metric.label}
              </p>
              <p className="text-lg font-semibold text-white">{metric.value}</p>
              {metric.trend ? (
                <p className="text-xs text-white/60">{metric.trend}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {notes && notes.length > 0 ? (
        <div className="rounded-xl border border-amber-300/30 bg-amber-400/5 p-3 text-sm text-amber-100/90">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
            Notes
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

type TelemetryDetailsProps = {
  metrics: { label: string; value: string; trend?: string }[];
  thermals?: {
    inlet: string;
    exhaust: string;
    delta: string;
  };
  utilization?: {
    fabric: string;
    cooling: string;
    power?: string;
  };
  notes?: string[];
};

function TelemetryDetails({
  metrics,
  thermals,
  utilization,
  notes,
}: TelemetryDetailsProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Telemetry snapshot
      </p>
      {metrics.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 text-sm">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-white/10 bg-black/30 p-3"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                {metric.label}
              </p>
              <p className="text-lg font-semibold text-white">{metric.value}</p>
              {metric.trend ? (
                <p className="text-xs text-white/60">{metric.trend}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/60">
          No live metrics for this cell yet.
        </p>
      )}

      {thermals ? (
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 text-sm text-cyan-50/90">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
            Thermals
          </p>
          <div className="mt-2 flex flex-wrap gap-4">
            <span>Inlet · {thermals.inlet}</span>
            <span>Exhaust · {thermals.exhaust}</span>
            <span>Δ · {thermals.delta}</span>
          </div>
        </div>
      ) : null}

      {utilization ? (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-sm text-emerald-50/90">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
            Utilization
          </p>
          <div className="mt-2 space-y-1">
            <p>Fabric · {utilization.fabric}</p>
            <p>Cooling · {utilization.cooling}</p>
            {utilization.power ? <p>Power · {utilization.power}</p> : null}
          </div>
        </div>
      ) : null}

      {notes && notes.length > 0 ? (
        <div className="rounded-xl border border-white/15 bg-black/20 p-3 text-sm text-white/70">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Notes
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
