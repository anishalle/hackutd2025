import {
  BundlingEngine,
  type Bundle,
} from "@/lib/bundling-engine";
import { findFacilityPath, type FacilityCoord, type PathResult } from "@/lib/floor-plan/pathfinding";
import type {
  FabricFloor,
  FloorCluster,
  InventoryItem,
  PathNode,
} from "@/lib/floor-plan/types";
import type { FabricTicket } from "@/lib/tickets/types";
import {
  mapTicketToEnhancedTask,
  type BundledTask,
} from "@/lib/tickets/task-mapper";

export type TechnicianTask = BundledTask & {
  clusterId?: string;
  cluster?: FloorCluster;
  inventoryNeeds: InventoryItem[];
};

export type TechnicianBundle = {
  id: string;
  label: string;
  score: number;
  reasons: string[];
  tasks: TechnicianTask[];
};

export type TechnicianRouteResult = {
  stops: PathNode[];
  path: FacilityCoord[];
  totalDistance: number;
  unresolvedTasks: TechnicianTask[];
};

type InventoryLookup = Partial<Record<InventoryItem, FloorCluster[]>>;

const PRIORITY_WEIGHT: Record<
  NonNullable<BundledTask["priority"]>,
  number
> = {
  critical: 0,
  high: 1,
  medium: 2,
  standard: 3,
};

const CLUSTER_MATCHERS: Array<{ id: string; patterns: string[] }> = [
  { id: "spine-06", patterns: ["spine 6", "spine-06"] },
  { id: "bundle-44b", patterns: ["44b", "patch panel 44b"] },
  { id: "delta-loop", patterns: ["delta pod", "delta loop", "liquid loop"] },
  { id: "row7-diagnostics", patterns: ["row 7", "pod 7", "7a-7c"] },
  { id: "pod-j", patterns: ["pod j"] },
  { id: "rack-n09", patterns: ["n09"] },
  { id: "plant-chill", patterns: ["chill", "plant"] },
  { id: "service-bay", patterns: ["service bay", "lidar"] },
  { id: "c-01-01", patterns: ["c-01-01"] },
  { id: "c-01-02", patterns: ["c-01-02"] },
  { id: "g-02-02", patterns: ["g-02-02"] },
  { id: "g-02-03", patterns: ["g-02-03"] },
  { id: "cooling-manifold", patterns: ["manifold"] },
];

const priorityToPathNode: Record<
  BundledTask["priority"],
  PathNode["priority"]
> = {
  critical: "critical",
  high: "high",
  medium: "standard",
  standard: "standard",
};

export function buildTechnicianBundles(
  tickets: FabricTicket[],
  clusterIndex: Record<string, FloorCluster>,
): TechnicianBundle[] {
  const technicianTickets = tickets.filter(
    (ticket) => ticket.team === "technician",
  );
  if (technicianTickets.length === 0) return [];
  const engine = new BundlingEngine();
  const enhancedTasks = technicianTickets.map(mapTicketToEnhancedTask);
  const bundles = engine.bundleTasks(enhancedTasks);

  return bundles.map((bundle, index) => {
    const tasks = bundle.tasks as BundledTask[];
    const technicianTasks: TechnicianTask[] = tasks.map((task) => {
      const clusterId = resolveClusterId(task.originalTicket);
      const cluster = clusterId ? clusterIndex[clusterId] : undefined;
      return {
        ...task,
        clusterId,
        cluster,
        inventoryNeeds: deriveInventoryNeeds(task.originalTicket),
      };
    });

    return {
      id: bundle.id ?? `bundle-${index + 1}`,
      label: buildBundleLabel(index, bundle),
      score: bundle.bundleScore,
      reasons: bundle.reasons,
      tasks: technicianTasks,
    };
  });
}

export function generateTechnicianRoute(options: {
  bundle: TechnicianBundle;
  floors: FabricFloor[];
  clusterIndex: Record<string, FloorCluster>;
}): TechnicianRouteResult {
  const { bundle, floors, clusterIndex } = options;
  const deskCluster = clusterIndex["desk"];
  if (!deskCluster) {
    throw new Error("Ops desk cluster is required for routing");
  }
  const floorOrder = floors.map((floor) => floor.id);

  const inventoryLookup = buildInventoryLookup(clusterIndex);

  const mappedTasks = bundle.tasks.filter(
    (task): task is TechnicianTask & { cluster: FloorCluster } =>
      Boolean(task.cluster),
  );
  const unresolvedTasks = bundle.tasks.filter((task) => !task.cluster);

  const outstandingItems = new Set<InventoryItem>();
  mappedTasks.forEach((task) =>
    task.inventoryNeeds.forEach((item) => outstandingItems.add(item)),
  );

  const satisfiedItems = new Set<InventoryItem>();
  outstandingItems.forEach((item) => {
    if (!inventoryLookup[item] || inventoryLookup[item]?.length === 0) {
      satisfiedItems.add(item);
    }
  });

  const routeStops: PathNode[] = [
    {
      id: "desk-start",
      floorId: deskCluster.floorId,
      coord: deskCluster.coord,
      label: "Ops desk",
      type: "start",
      action: "Turn 0 · Briefing + cart checkout",
      priority: "standard",
      distanceMeters: 0,
    },
  ];

  let currentPosition: FacilityCoord = {
    floorId: deskCluster.floorId,
    coord: deskCluster.coord,
  };
  const path: FacilityCoord[] = [currentPosition];
  let remainingTasks = [...mappedTasks];
  let turnCounter = 1;
  let totalDistance = 0;

  while (remainingTasks.length > 0) {
    const readyTasks = remainingTasks.filter((task) =>
      task.inventoryNeeds.every((item) => satisfiedItems.has(item)),
    );

    const neededItems = new Set<InventoryItem>();
    remainingTasks.forEach((task) => {
      task.inventoryNeeds.forEach((item) => {
        if (!satisfiedItems.has(item)) neededItems.add(item);
      });
    });

    const candidates = buildCandidates({
      current: currentPosition,
      readyTasks,
      neededItems,
      inventoryLookup,
      floors,
    });

    if (candidates.length === 0) {
      break;
    }

    candidates.sort((a, b) => {
      if (a.path.distance === b.path.distance) {
        const aWeight =
          a.kind === "task"
            ? PRIORITY_WEIGHT[a.task.priority ?? "standard"]
            : PRIORITY_WEIGHT.standard;
        const bWeight =
          b.kind === "task"
            ? PRIORITY_WEIGHT[b.task.priority ?? "standard"]
            : PRIORITY_WEIGHT.standard;
        return aWeight - bWeight;
      }
      return a.path.distance - b.path.distance;
    });

    const choice = candidates[0];
    appendPath(path, choice.path);
    totalDistance += choice.path.distance;
    currentPosition = choice.path.steps[choice.path.steps.length - 1];

    const elevatorStops = buildElevatorStops(choice.path, floorOrder);
    elevatorStops.forEach((stop) => {
      routeStops.push({
        id: `elevator-${stop.from}-${stop.to}-${turnCounter}`,
        floorId: stop.floorId,
        coord: stop.coord,
        label: `Lift A (${stop.from}→${stop.to})`,
        type: "elevator",
        action: `Turn ${turnCounter} · Ride ${stop.direction} to ${stop.to}`,
        priority: "standard",
        distanceMeters: Math.round(totalDistance),
      });
      turnCounter += 1;
    });

    if (choice.kind === "inventory") {
      const pickupItems = new Set<InventoryItem>();
      choice.cluster.inventoryItems?.forEach((item) => {
        if (!satisfiedItems.has(item)) {
          pickupItems.add(item);
        }
        satisfiedItems.add(item);
      });
      routeStops.push({
        id: `${choice.cluster.id}-${turnCounter}`,
        floorId: choice.cluster.floorId,
        coord: choice.cluster.coord,
        label: choice.cluster.label,
        type: "inventory",
        action: pickupItems.size
          ? `Turn ${turnCounter} · Pull ${Array.from(pickupItems).join(", ")}`
          : `Turn ${turnCounter} · Inventory check`,
        priority: "standard",
        distanceMeters: Math.round(totalDistance),
      });
      turnCounter += 1;
    } else if (choice.kind === "task") {
      routeStops.push({
        id: `${choice.task.id}-${turnCounter}`,
        floorId: choice.cluster.floorId,
        coord: choice.cluster.coord,
        label: choice.task.title,
        type: "task",
        action: `Turn ${turnCounter} · ${choice.task.originalTicket.summary}`,
        priority: priorityToPathNode[choice.task.priority ?? "standard"],
        distanceMeters: Math.round(totalDistance),
      });
      turnCounter += 1;
      remainingTasks = remainingTasks.filter(
        (task) => task.id !== choice.task.id,
      );
    }
  }

  const returnPath = findFacilityPath(floors, currentPosition, {
    floorId: deskCluster.floorId,
    coord: deskCluster.coord,
  });
  if (returnPath) {
    appendPath(path, returnPath);
    totalDistance += returnPath.distance;
    const elevatorStops = buildElevatorStops(returnPath, floorOrder);
    elevatorStops.forEach((stop) => {
      routeStops.push({
        id: `elevator-${stop.from}-${stop.to}-${turnCounter}`,
        floorId: stop.floorId,
        coord: stop.coord,
        label: `Lift A (${stop.from}→${stop.to})`,
        type: "elevator",
        action: `Turn ${turnCounter} · Ride ${stop.direction} to ${stop.to}`,
        priority: "standard",
        distanceMeters: Math.round(totalDistance),
      });
      turnCounter += 1;
    });
  }

  routeStops.push({
    id: "desk-return",
    floorId: deskCluster.floorId,
    coord: deskCluster.coord,
    label: "Ops desk",
    type: "return",
    action: `Turn ${turnCounter} · Close loop + update dispatcher`,
    priority: "standard",
    distanceMeters: Math.round(totalDistance),
  });

  return {
    stops: routeStops,
    path,
    totalDistance,
    unresolvedTasks,
  };
}

function buildCandidates(params: {
  current: FacilityCoord;
  readyTasks: Array<TechnicianTask & { cluster: FloorCluster }>;
  neededItems: Set<InventoryItem>;
  inventoryLookup: InventoryLookup;
  floors: FabricFloor[];
}) {
  const { current, readyTasks, neededItems, inventoryLookup, floors } = params;

  type Candidate =
    | {
        kind: "task";
        task: TechnicianTask & { cluster: FloorCluster };
        cluster: FloorCluster;
        path: PathResult;
      }
    | {
        kind: "inventory";
        item: InventoryItem;
        cluster: FloorCluster;
        path: PathResult;
      };

  const candidates: Candidate[] = [];

  neededItems.forEach((item) => {
    const clusters = inventoryLookup[item] ?? [];
    clusters.forEach((cluster) => {
      const path = findFacilityPath(floors, current, {
        floorId: cluster.floorId,
        coord: cluster.coord,
      });
      if (path) {
        candidates.push({
          kind: "inventory",
          item,
          cluster,
          path,
        });
      }
    });
  });

  readyTasks.forEach((task) => {
    const path = findFacilityPath(floors, current, {
      floorId: task.cluster.floorId,
      coord: task.cluster.coord,
    });
    if (path) {
      candidates.push({
        kind: "task",
        task,
        cluster: task.cluster,
        path,
      });
    }
  });

  return candidates;
}

function appendPath(path: FacilityCoord[], segment: PathResult) {
  for (let index = 1; index < segment.steps.length; index += 1) {
    path.push(segment.steps[index]);
  }
}

function buildElevatorStops(
  segment: PathResult,
  floorOrder: string[],
): Array<{
  floorId: string;
  coord: FacilityCoord["coord"];
  from: string;
  to: string;
  direction: "up" | "down";
}> {
  const stops: Array<{
    floorId: string;
    coord: FacilityCoord["coord"];
    from: string;
    to: string;
    direction: "up" | "down";
  }> = [];
  for (let i = 1; i < segment.steps.length; i += 1) {
    const prev = segment.steps[i - 1];
    const current = segment.steps[i];
    if (prev.floorId === current.floorId) continue;
    const prevIndex = floorOrder.indexOf(prev.floorId);
    const currIndex = floorOrder.indexOf(current.floorId);
    const direction = currIndex > prevIndex ? "up" : "down";
    stops.push({
      floorId: prev.floorId,
      coord: prev.coord,
      from: prev.floorId,
      to: current.floorId,
      direction,
    });
  }
  return stops;
}

function resolveClusterId(ticket: FabricTicket): string | undefined {
  const haystack = [
    ticket.title,
    ticket.summary,
    ticket.details,
    ticket.floor,
    ...(ticket.affectedSystems ?? []),
    ...(ticket.affectedServers ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matcher = CLUSTER_MATCHERS.find((entry) =>
    entry.patterns.some((pattern) => haystack.includes(pattern)),
  );

  return matcher?.id;
}

function deriveInventoryNeeds(ticket: FabricTicket): InventoryItem[] {
  const tags = ticket.tags.map((tag) => tag.toLowerCase());
  const haystack = [
    ticket.title,
    ticket.summary,
    ticket.details,
    ticket.workload,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const needs = new Set<InventoryItem>();

  if (tags.includes("optics") || haystack.includes("qsfp")) {
    needs.add("qsfp");
  }
  if (
    tags.includes("cabling") ||
    haystack.includes("fiber") ||
    haystack.includes("bundle")
  ) {
    needs.add("fiber-kit");
  }
  if (
    tags.includes("cooling") ||
    tags.includes("sensors") ||
    haystack.includes("loop")
  ) {
    needs.add("cooling-kit");
    if (tags.includes("sensors")) needs.add("sensor");
  }
  if (
    tags.includes("power") ||
    haystack.includes("psu") ||
    haystack.includes("pdu")
  ) {
    needs.add("psu");
  }
  if (tags.includes("install") || tags.includes("hardware")) {
    needs.add("install-kit");
  }
  if (tags.includes("robotics") || haystack.includes("lidar")) {
    needs.add("diagnostic-pack");
  }

  return Array.from(needs);
}

function buildInventoryLookup(
  clusterIndex: Record<string, FloorCluster>,
): InventoryLookup {
  return Object.values(clusterIndex).reduce<InventoryLookup>((acc, cluster) => {
    cluster.inventoryItems?.forEach((item) => {
      const list = acc[item] ?? [];
      list.push(cluster);
      acc[item] = list;
    });
    return acc;
  }, {});
}

function buildBundleLabel(index: number, bundle: Bundle): string {
  const categories = new Set<string>();
  const tasks = bundle.tasks as BundledTask[];
  tasks.forEach((task) => {
    if (task.category) categories.add(task.category);
  });
  const categoryLabel = categories.size
    ? Array.from(categories).join(" · ")
    : "Mixed workload";
  return `Bundle ${index + 1} · ${categoryLabel}`;
}
