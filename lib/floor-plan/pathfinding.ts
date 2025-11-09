import type { FabricFloor, GridCoord, TileCode } from "@/lib/floor-plan/types";

export type FacilityCoord = {
  floorId: string;
  coord: GridCoord;
};

export type PathResult = {
  distance: number;
  steps: FacilityCoord[];
};

const STEP_COST_METERS = 2;
const ELEVATOR_TRANSFER_METERS = 30;
const BLOCKED_TILES = new Set<TileCode>([1, 2, 3, 8]);
const TILE_PENALTY: Partial<Record<TileCode, number>> = {
  4: 1, // hot aisle
  7: 2, // elevator pad
};

const directionVectors = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
];

type FacilityIndex = {
  floors: Record<string, FabricFloor>;
  floorOrder: string[];
  elevatorNeighbors: Map<string, FacilityCoord[]>;
};

const coordKey = (floorId: string, coord: GridCoord) =>
  `${floorId}:${coord.x}:${coord.y}`;

function isWalkable(tile: TileCode | undefined) {
  if (tile === undefined) return false;
  if (BLOCKED_TILES.has(tile)) return false;
  return true;
}

function buildElevatorNeighbors(
  floors: FabricFloor[],
): Map<string, FacilityCoord[]> {
  const elevatorNeighbors = new Map<string, FacilityCoord[]>();
  const floorElevators = new Map<string, GridCoord[]>();

  floors.forEach((floor) => {
    const coords: GridCoord[] = [];
    floor.grid.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile === 7) {
          coords.push({ x, y });
        }
      });
    });
    floorElevators.set(floor.id, coords);
  });

  for (let index = 0; index < floors.length - 1; index += 1) {
    const currentFloor = floors[index];
    const nextFloor = floors[index + 1];
    const currentCoords = floorElevators.get(currentFloor.id) ?? [];
    const nextCoords = floorElevators.get(nextFloor.id) ?? [];
    if (currentCoords.length === 0 || nextCoords.length === 0) {
      continue;
    }
    const pairCount = Math.min(currentCoords.length, nextCoords.length);
    for (let pair = 0; pair < pairCount; pair += 1) {
      const fromCoord = currentCoords[pair];
      const toCoord = nextCoords[pair];
      const fromKey = coordKey(currentFloor.id, fromCoord);
      const toKey = coordKey(nextFloor.id, toCoord);
      const upList = elevatorNeighbors.get(fromKey) ?? [];
      upList.push({ floorId: nextFloor.id, coord: toCoord });
      elevatorNeighbors.set(fromKey, upList);
      const downList = elevatorNeighbors.get(toKey) ?? [];
      downList.push({ floorId: currentFloor.id, coord: fromCoord });
      elevatorNeighbors.set(toKey, downList);
    }
  }

  return elevatorNeighbors;
}

function buildIndex(floors: FabricFloor[]): FacilityIndex {
  const floorOrder = floors.map((floor) => floor.id);
  const floorMap = floors.reduce<Record<string, FabricFloor>>((acc, floor) => {
    acc[floor.id] = floor;
    return acc;
  }, {});
  const elevatorNeighbors = buildElevatorNeighbors(floors);

  return {
    floors: floorMap,
    floorOrder,
    elevatorNeighbors,
  };
}

function getTileCode(
  index: FacilityIndex,
  floorId: string,
  coord: GridCoord,
): TileCode | undefined {
  const floor = index.floors[floorId];
  if (!floor) return undefined;
  return floor.grid[coord.y]?.[coord.x];
}

function neighborsFor(
  index: FacilityIndex,
  node: FacilityCoord,
): FacilityCoord[] {
  const results: FacilityCoord[] = [];
  const floor = index.floors[node.floorId];
  if (!floor) return results;

  directionVectors.forEach(({ dx, dy }) => {
    const next: GridCoord = { x: node.coord.x + dx, y: node.coord.y + dy };
    if (
      next.x < 0 ||
      next.y < 0 ||
      next.x >= floor.size.cols ||
      next.y >= floor.size.rows
    ) {
      return;
    }
    const tile = getTileCode(index, node.floorId, next);
    if (!isWalkable(tile)) return;
    results.push({ floorId: node.floorId, coord: next });
  });

  const elevatorTargets = index.elevatorNeighbors.get(
    coordKey(node.floorId, node.coord),
  );
  if (elevatorTargets) {
    elevatorTargets.forEach((target) => results.push(target));
  }

  return results;
}

function movementCost(
  index: FacilityIndex,
  from: FacilityCoord,
  to: FacilityCoord,
): number {
  if (from.floorId !== to.floorId) {
    return ELEVATOR_TRANSFER_METERS;
  }
  const tile = getTileCode(index, to.floorId, to.coord);
  const penalty = tile !== undefined ? TILE_PENALTY[tile] ?? 0 : 0;
  return STEP_COST_METERS + penalty;
}

export function findFacilityPath(
  floors: FabricFloor[],
  start: FacilityCoord,
  goal: FacilityCoord,
): PathResult | null {
  const index = buildIndex(floors);
  const startTile = getTileCode(index, start.floorId, start.coord);
  const goalTile = getTileCode(index, goal.floorId, goal.coord);
  if (!isWalkable(startTile) || !isWalkable(goalTile)) {
    return null;
  }
  const open = new Set<string>();
  const distances = new Map<string, number>();
  const previous = new Map<string, FacilityCoord>();
  const visited = new Set<string>();

  const startKey = coordKey(start.floorId, start.coord);
  const goalKey = coordKey(goal.floorId, goal.coord);

  open.add(startKey);
  distances.set(startKey, 0);

  const selectNext = () => {
    let nextKey: string | null = null;
    let best = Infinity;
    open.forEach((key) => {
      const distance = distances.get(key) ?? Infinity;
      if (distance < best) {
        best = distance;
        nextKey = key;
      }
    });
    return nextKey;
  };

  while (open.size > 0) {
    const currentKey = selectNext();
    if (!currentKey) break;
    if (currentKey === goalKey) break;
    open.delete(currentKey);
    visited.add(currentKey);

    const [floorId, x, y] = currentKey.split(":");
    const current: FacilityCoord = {
      floorId,
      coord: { x: Number(x), y: Number(y) },
    };
    const neighbors = neighborsFor(index, current);

    neighbors.forEach((neighbor) => {
      const neighborKey = coordKey(neighbor.floorId, neighbor.coord);
      if (visited.has(neighborKey)) return;
      const alt =
        (distances.get(currentKey) ?? Infinity) +
        movementCost(index, current, neighbor);
      if (alt < (distances.get(neighborKey) ?? Infinity)) {
        distances.set(neighborKey, alt);
        previous.set(neighborKey, current);
        open.add(neighborKey);
      }
    });
  }

  if (!distances.has(goalKey)) {
    return null;
  }

  const steps: FacilityCoord[] = [];
  let currentKey: string | undefined = goalKey;
  while (currentKey) {
    const [floorId, x, y] = currentKey.split(":");
    steps.push({
      floorId,
      coord: { x: Number(x), y: Number(y) },
    });
    const prev = previous.get(currentKey);
    currentKey = prev ? coordKey(prev.floorId, prev.coord) : undefined;
  }
  steps.reverse();

  return {
    distance: distances.get(goalKey) ?? 0,
    steps,
  };
}
