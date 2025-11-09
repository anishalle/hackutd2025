"use client";

import { useCallback, useMemo, useState } from "react";

import {
  FabricFloor,
  FloorAnnotation,
  PathNode,
  TileDefinition,
} from "@/lib/floor-plan/types";
import type { FacilityCoord } from "@/lib/floor-plan/pathfinding";

type HoveredAnnotation = {
  type: "annotation";
  data: FloorAnnotation;
};

type HoveredRouteNode = {
  type: "route";
  data: PathNode;
};

type HoveredTile = {
  type: "tile";
  data: {
    coord: PathNode["coord"];
    tile: TileDefinition;
  };
};

type HoveredItem = HoveredAnnotation | HoveredRouteNode | HoveredTile;

type FloorPlanCanvasProps = {
  floor: FabricFloor;
  tileDefinitions: TileDefinition[];
  route: PathNode[];
  path?: FacilityCoord[];
};

const CELL_SIZE = 44;
const CELL_GAP = 6;

const annotationColors: Record<FloorAnnotation["kind"], string> = {
  desk: "#5eead4",
  server: "#e2e8f0",
  task: "#f472b6",
  inventory: "#fbbf24",
  elevator: "#c084fc",
  sensor: "#4ade80",
};

const priorityStroke: Record<
  NonNullable<PathNode["priority"]>,
  { stroke: string; glow: string }
> = {
  critical: { stroke: "#f97316", glow: "rgba(249,115,22,0.5)" },
  high: { stroke: "#38bdf8", glow: "rgba(56,189,248,0.4)" },
  standard: { stroke: "#94a3b8", glow: "rgba(148,163,184,0.3)" },
};

const toKey = (x: number, y: number) => `${x}-${y}`;

export function FloorPlanCanvas({
  floor,
  tileDefinitions,
  route,
  path,
}: FloorPlanCanvasProps) {
  const [hoveredItem, setHoveredItem] = useState<HoveredItem | null>(null);

  const tileLookup = useMemo(() => {
    const map = new Map(tileDefinitions.map((def) => [def.id, def]));
    return map;
  }, [tileDefinitions]);

  const cols = floor.size.cols;
  const rows = floor.size.rows;
  const step = CELL_SIZE + CELL_GAP;
  const width = cols * step;
  const height = rows * step;
  const annotations = floor.annotations ?? [];
  const clusterLookup = useMemo(() => {
    const clusters = floor.clusters ?? [];
    const map = new Map<string, typeof clusters>();
    clusters.forEach((cluster) => {
      const cells = cluster.cells?.length ? cluster.cells : [cluster.coord];
      cells.forEach((cell) => {
        const key = toKey(cell.x, cell.y);
        const existing = map.get(key) ?? [];
        existing.push(cluster);
        map.set(key, existing);
      });
    });
    return map;
  }, [floor.clusters]);

  const nodesOnFloor = route.filter((node) => node.floorId === floor.id);

  const centerFor = useCallback(
    (coord: PathNode["coord"]) => ({
      x: coord.x * step + CELL_SIZE / 2,
      y: coord.y * step + CELL_SIZE / 2,
    }),
    [step],
  );

  const pathSegments = useMemo(() => {
    if (!path || path.length < 2) return [];
    const segments: Array<{ key: string; points: { x: number; y: number }[] }> =
      [];
    let currentSegment: PathNode["coord"][] = [];

    const flushSegment = () => {
      if (currentSegment.length < 2) {
        currentSegment = [];
        return;
      }
      segments.push({
        key: `${floor.id}-${segments.length}`,
        points: currentSegment.map((coord) => centerFor(coord)),
      });
      currentSegment = [];
    };

    path.forEach((step, index) => {
      if (step.floorId !== floor.id) {
        flushSegment();
        return;
      }
      currentSegment.push(step.coord);
      const next = path[index + 1];
      if (!next || next.floorId !== floor.id) {
        flushSegment();
      }
    });

    return segments;
  }, [centerFor, floor.id, path]);

  const hoveredInfo = (() => {
    if (!hoveredItem) return null;
    const baseCoord = hoveredItem.data.coord;
    const center = centerFor(baseCoord);
    const tooltipWidth = 220;
    const lines: string[] = [];
    let subtitle = "";
    let accent = "#38bdf8";
    let title = "";

    if (hoveredItem.type === "annotation") {
      title = hoveredItem.data.label;
      subtitle = hoveredItem.data.kind;
      accent = annotationColors[hoveredItem.data.kind] ?? accent;
      if (hoveredItem.data.detail) lines.push(hoveredItem.data.detail);
      if (hoveredItem.data.status)
        lines.push(`Status: ${hoveredItem.data.status}`);
    } else if (hoveredItem.type === "route") {
      title = hoveredItem.data.label;
      subtitle = hoveredItem.data.type;
      accent =
        (hoveredItem.data.priority &&
          priorityStroke[hoveredItem.data.priority]?.stroke) ??
        accent;
      if (hoveredItem.data.action) lines.push(hoveredItem.data.action);
      if (hoveredItem.data.priority)
        lines.push(`Priority: ${hoveredItem.data.priority}`);
      if (hoveredItem.data.distanceMeters)
        lines.push(`Distance: ${Math.round(hoveredItem.data.distanceMeters)} m`);
    } else if (hoveredItem.type === "tile") {
      const coordKey = toKey(hoveredItem.data.coord.x, hoveredItem.data.coord.y);
      const matchedClusters = clusterLookup.get(coordKey);
      if (matchedClusters && matchedClusters.length > 0) {
        const primary = matchedClusters[0];
        title = primary.label;
        subtitle = `Cluster · ${primary.kind}`;
        accent = annotationColors.task;
        if (primary.summary) lines.push(primary.summary);
        lines.push(
          `cell (${hoveredItem.data.coord.x}, ${hoveredItem.data.coord.y})`,
        );
        if (primary.tags && primary.tags.length > 0) {
          lines.push(`Tags: ${primary.tags.join(", ")}`);
        }
        if (primary.inventoryItems && primary.inventoryItems.length > 0) {
          lines.push(`Stock: ${primary.inventoryItems.join(", ")}`);
        }
        const tile = hoveredItem.data.tile;
        lines.push(`${tile.label}: ${tile.description}`);
      } else {
        title = hoveredItem.data.tile.label;
        subtitle = `cell (${hoveredItem.data.coord.x}, ${hoveredItem.data.coord.y})`;
        accent = hoveredItem.data.tile.border ?? accent;
        const diag = hoveredItem.data.tile.slurmDiagnostics;
        if (diag) {
          lines.push(`Allocation: ${diag.allocation}`);
          lines.push(`Thermals: ${diag.thermals}`);
          if (diag.notes) lines.push(diag.notes);
        }
      }
    }

    const baseHeight = 54;
    const lineHeight = 18;
    const tooltipHeight = baseHeight + lines.length * lineHeight;
    const x = Math.min(center.x + 12, width - tooltipWidth - 6);
    const y = Math.max(center.y - tooltipHeight - 12, 6);

    return {
      box: { x, y, width: tooltipWidth, height: tooltipHeight },
      title,
      subtitle,
      lines,
      accent,
    };
  })();

  return (
    <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-900/10 p-6 shadow-2xl">
      <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
        <span>{floor.label}</span>
        <span>
          {floor.elevation} · {rows}×{cols} cells
        </span>
      </div>
      <div className="overflow-auto rounded-2xl border border-white/5 bg-slate-950/70 p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          role="img"
          aria-label={`Floor plan for ${floor.label}`}
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id={`arrow-${floor.id}`}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
              fill="#f8fafc"
            >
              <path d="M0,0 L6,3 L0,6 z" />
            </marker>
          </defs>

          {floor.grid.map((row, rowIndex) =>
            row.map((code, columnIndex) => {
              const tile = tileLookup.get(code);
              const x = columnIndex * step;
              const y = rowIndex * step;
              const fill = tile?.fill ?? "#0f172a";
              const stroke = tile?.border ?? "#1f2937";
              const hasSlurm = Boolean(tile?.slurmDiagnostics);
              const hoverHandlers = hasSlurm
                ? {
                    onMouseEnter: () =>
                      setHoveredItem({
                        type: "tile",
                        data: {
                          coord: { x: columnIndex, y: rowIndex },
                          tile: tile!,
                        },
                      }),
                    onFocus: () =>
                      setHoveredItem({
                        type: "tile",
                        data: {
                          coord: { x: columnIndex, y: rowIndex },
                          tile: tile!,
                        },
                      }),
                    onMouseLeave: () => setHoveredItem(null),
                    onBlur: () => setHoveredItem(null),
                  }
                : {};

              return (
                <g key={toKey(columnIndex, rowIndex)}>
                  <rect
                    x={x}
                    y={y}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    rx={8}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={1.4}
                    opacity={code === 4 ? 0.85 : 1}
                    className={hasSlurm ? "cursor-pointer" : undefined}
                    {...hoverHandlers}
                  />
                </g>
              );
            }),
          )}

          {pathSegments.map(({ key, points }, index) => (
            <polyline
              key={`${key}-${index}`}
              points={points.map((point) => `${point.x},${point.y}`).join(" ")}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd={`url(#arrow-${floor.id})`}
              filter="url(#glow)"
              opacity={0.85}
            />
          ))}

          {nodesOnFloor.map((node) => {
            const { x, y } = centerFor(node.coord);
            const baseColor =
              (node.priority && priorityStroke[node.priority]?.stroke) ||
              "#e2e8f0";
            return (
              <g
                key={`${node.id}-${node.floorId}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredItem({ type: "route", data: node })}
                onFocus={() => setHoveredItem({ type: "route", data: node })}
                onMouseLeave={() => setHoveredItem(null)}
                onBlur={() => setHoveredItem(null)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={10}
                  fill="rgba(2,6,23,0.85)"
                  stroke={baseColor}
                  strokeWidth={2}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={4}
                  fill={baseColor}
                  filter="url(#glow)"
                />
              </g>
            );
          })}

          {annotations.map((annotation) => {
            const { x, y } = centerFor(annotation.coord);
            const fill = annotationColors[annotation.kind] ?? "#ffffff";
            return (
              <g
                key={annotation.id}
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredItem({ type: "annotation", data: annotation })
                }
                onFocus={() =>
                  setHoveredItem({ type: "annotation", data: annotation })
                }
                onMouseLeave={() => setHoveredItem(null)}
                onBlur={() => setHoveredItem(null)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={annotation.kind === "server" ? 6 : 7}
                  fill="rgba(2,6,23,0.85)"
                  stroke={fill}
                  strokeWidth={1.5}
                />
              </g>
            );
          })}

          {hoveredInfo ? (
            <g
              className="pointer-events-none"
              transform={`translate(${hoveredInfo.box.x}, ${hoveredInfo.box.y})`}
            >
              <rect
                width={hoveredInfo.box.width}
                height={hoveredInfo.box.height}
                rx={14}
                fill="rgba(2,6,23,0.95)"
                stroke={hoveredInfo.accent}
                strokeWidth={1}
              />
              <text
                x={16}
                y={22}
                fill="#f8fafc"
                fontSize={14}
                fontWeight={600}
              >
                {hoveredInfo.title}
              </text>
              <text x={16} y={38} fill="#94a3b8" fontSize={11}>
                {hoveredInfo.subtitle}
              </text>
              {hoveredInfo.lines.map((line, index) => (
                <text
                  key={`${line}-${index}`}
                  x={16}
                  y={58 + index * 18}
                  fill="#e2e8f0"
                  fontSize={12}
                >
                  {line}
                </text>
              ))}
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}
