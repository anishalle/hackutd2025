export type TileCode =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10;

export type TileDefinition = {
  id: TileCode;
  label: string;
  description: string;
  fill: string;
  border?: string;
  textColor?: string;
  slurmDiagnostics?: {
    allocation: string;
    thermals: string;
    notes?: string;
  };
};

export type FloorGrid = TileCode[][];

export type GridCoord = {
  x: number;
  y: number;
};

export type FloorAnnotation = {
  id: string;
  floorId: string;
  coord: GridCoord;
  label: string;
  kind: "server" | "inventory" | "task" | "desk" | "elevator" | "sensor";
  detail?: string;
  status?: string;
};

export type FabricFloor = {
  id: string;
  label: string;
  level: string;
  elevation: string;
  grid: FloorGrid;
  annotations?: FloorAnnotation[];
  size: {
    cols: number;
    rows: number;
  };
  environmental?: {
    temp?: string;
    airflow?: string;
    humidity?: string;
  };
};

export type PathNodeType = "start" | "task" | "inventory" | "elevator" | "return";

export type PathNode = {
  id: string;
  floorId: string;
  coord: GridCoord;
  label: string;
  type: PathNodeType;
  action?: string;
  priority?: "critical" | "high" | "standard";
  distanceMeters?: number;
};

export type PathGraph = Record<
  string,
  PathNode & {
    links: string[];
  }
>;

export type RouteSequence = string[];

export type PathfindingOptions = {
  preset?: "baseline" | "priority" | "distance";
  avoidHotAisle?: boolean;
};
