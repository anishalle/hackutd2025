import { useCallback, useMemo, useState } from "react";

import {
  PathGraph,
  PathNode,
  PathfindingOptions,
  RouteSequence,
} from "@/lib/floor-plan/types";

type RoutePresets = Record<string, RouteSequence>;

const traceRoute = (graph: PathGraph, sequence: RouteSequence): PathNode[] => {
  return sequence
    .map((id) => graph[id])
    .filter((node): node is PathNode & { links: string[] } => Boolean(node));
};

export function useTechnicianRoute(
  graph: PathGraph,
  presets: RoutePresets,
  initialPreset: PathfindingOptions["preset"] = "baseline",
) {
  const [activePreset, setActivePreset] = useState<
    PathfindingOptions["preset"]
  >(initialPreset);

  const [route, setRoute] = useState<PathNode[]>(() =>
    traceRoute(graph, presets[initialPreset ?? "baseline"] ?? []),
  );

  const recomputeRoute = useCallback(
    (options?: PathfindingOptions) => {
      const preset = options?.preset ?? activePreset ?? "baseline";
      const nextSequence = presets[preset] ?? [];
      setActivePreset(preset);
      setRoute(traceRoute(graph, nextSequence));
    },
    [activePreset, graph, presets],
  );

  const shell = useMemo(
    () => ({
      prioritizeCritical: () => recomputeRoute({ preset: "priority" }),
      minimizeWalking: () => recomputeRoute({ preset: "distance" }),
      resetBaseline: () => recomputeRoute({ preset: "baseline" }),
    }),
    [recomputeRoute],
  );

  return {
    route,
    activePreset,
    recomputeRoute,
    shell,
  };
}
