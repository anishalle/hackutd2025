import type { GridCoord } from "@/lib/floor-plan/types";

export type CellMetric = {
  label: string;
  value: string;
  trend?: string;
};

export type CellInsight = {
  id: string;
  floorId: string;
  coord: GridCoord;
  headline: string;
  status: string;
  summary: string;
  metrics: CellMetric[];
  thermals: {
    inlet: string;
    exhaust: string;
    delta: string;
  };
  utilization: {
    fabric: string;
    cooling: string;
    power?: string;
  };
  notes?: string[];
  generalMarkers?: Partial<Record<string, string>>;
  taskMarkers?: Partial<Record<string, string>>;
};

const insights: CellInsight[] = [
  {
    id: "spine-06",
    floorId: "L3",
    coord: { x: 3, y: 4 },
    headline: "Spine 6 uplink sled",
    status: "WO-9830 · scheduled swap",
    summary: "CRC bursts against QSFP-DD pair 3/4 triggered the dispatch.",
    metrics: [
      { label: "CRC rate", value: "782/hr", trend: "down 11%" },
      { label: "Link util", value: "68% agg", trend: "stable" },
      { label: "QSFP age", value: "19,400 hrs" },
    ],
    thermals: { inlet: "22°C", exhaust: "35°C", delta: "13°C" },
    utilization: { fabric: "82% headroom", cooling: "Loop ΔP nominal", power: "7.2kW draw" },
    notes: [
      "Keep MPO fanout seated when swapping sled.",
      "Telemetry drawer already in maintenance window.",
    ],
    generalMarkers: {
      uplink_panel: "QSFP-DD bank · CRC alarms cleared 6h ago",
      fiber_trunk: "Spine-facing trunk · 44B route",
    },
    taskMarkers: {
      uplink_panel: "Swap QSFP on Spine 6 (WO-9830)",
      fiber_trunk: "Clean MPO 44B fanout + re-seat",
      telemetry_drawer: "Ack CRC storm + capture logs",
    },
  },
  {
    id: "cooling-manifold",
    floorId: "L3",
    coord: { x: 5, y: 4 },
    headline: "Delta loop manifold",
    status: "WO-9828 · verify pressure oscillation",
    summary: "Sensor flagged 4 psi ripple vs adjacent loops.",
    metrics: [
      { label: "Loop PSI", value: "41 psi", trend: "−3 psi vs ref" },
      { label: "Flow", value: "132 L/min", trend: "stable" },
      { label: "Vibe", value: "Nominal" },
    ],
    thermals: { inlet: "18°C", exhaust: "26°C", delta: "8°C" },
    utilization: { fabric: "N/A cooling asset", cooling: "Aux pump @ 72%", power: "1.4kW" },
    notes: ["Purge line upstream before cracking manifold access."],
    generalMarkers: {
      cooling_manifold: "Loop header · telemetry trending within band",
      aux_pump: "Aux pump sled · 72% duty",
    },
    taskMarkers: {
      cooling_manifold: "Bleed microbubbles · watch PSI rebound",
      aux_pump: "Verify aux pump handshake on restart",
      power_bus: "Inspect return heater for condensation",
    },
  },
  {
    id: "rack-n09",
    floorId: "L3",
    coord: { x: 7, y: 3 },
    headline: "Rack N09 · smart PDU install",
    status: "Telemetry only",
    summary: "Awaiting WO-9831 scheduling — currently stable.",
    metrics: [
      { label: "Load", value: "48 kVA / 60 kVA", trend: "up 2%" },
      { label: "GPU util", value: "74%", trend: "cooling" },
      { label: "Leak detect", value: "0 alerts" },
    ],
    thermals: { inlet: "20°C", exhaust: "32°C", delta: "12°C" },
    utilization: { fabric: "77% busy", cooling: "Balanced loop", power: "80% breaker" },
    notes: [
      "Smart PDU staged nearby; no action until bundle picks it up.",
    ],
    generalMarkers: {
      power_bus: "Legacy PDU · 80% breaker load",
      h100_sled: "H100 sleds @ 74% util",
      telemetry_drawer: "BMC clean · no alerts",
    },
  },
  {
    id: "row7-diagnostics",
    floorId: "L1",
    coord: { x: 2, y: 4 },
    headline: "Row 7 sled diagnostics",
    status: "Row 7 · staging",
    summary: "Thermal delta under review; not on current route.",
    metrics: [
      { label: "Thermal delta", value: "6°C", trend: "rising" },
      { label: "Utilization", value: "62%", trend: "steady" },
      { label: "QSFP pulls", value: "3 today" },
    ],
    thermals: { inlet: "19°C", exhaust: "25°C", delta: "6°C" },
    utilization: { fabric: "62% avg", cooling: "Fan wall @ 58%", power: "6.4kW" },
    notes: ["Recommend follow-up if delta exceeds 8°C."],
    generalMarkers: {
      nvlink_fabric: "Row 7 NVLink fabric · 62% busy",
      h100_sled: "Pod sled diag shelf",
    },
  },
  {
    id: "inventory-l2-cache",
    floorId: "L2",
    coord: { x: 7, y: 6 },
    headline: "Fiber cache",
    status: "Inventory cache",
    summary: "Quick pull area for QSFP and trunks.",
    metrics: [
      { label: "QSFP on hand", value: "46", trend: "−2/day" },
      { label: "Trunks", value: "18 kits", trend: "stable" },
      { label: "Pickups", value: "4 today" },
    ],
    thermals: { inlet: "21°C", exhaust: "N/A", delta: "ambient" },
    utilization: { fabric: "Inventory", cooling: "Ambient", power: "—" },
    notes: ["Record pulls in Ops sheet after grab-and-go."],
    generalMarkers: {
      fiber_trunk: "MTP-24 trunks staged",
      uplink_panel: "Label printer + QSFP validator",
    },
  },
  {
    id: "plant-chill",
    floorId: "L1",
    coord: { x: 1, y: 6 },
    headline: "Chill plant south",
    status: "Monitoring only",
    summary: "Primary loop pumps redundant, trending nominal.",
    metrics: [
      { label: "Loop PSI", value: "58 psi", trend: "flat" },
      { label: "Flow variance", value: "±2%", trend: "stable" },
      { label: "Service hrs", value: "312 since flush" },
    ],
    thermals: { inlet: "16°C", exhaust: "24°C", delta: "8°C" },
    utilization: { fabric: "Cooling infra", cooling: "Pump A @ 64%", power: "12 kW" },
    notes: ["Next preventive maintenance in 11 days."],
    generalMarkers: {
      cooling_manifold: "Primary manifold feed",
      aux_pump: "Redundant loop pump plate",
    },
  },
];

const insightIndex = insights.reduce<Record<string, CellInsight>>((acc, insight) => {
  acc[toKey(insight.floorId, insight.coord)] = insight;
  return acc;
}, {});

export function getCellInsight(
  floorId: string,
  coord: GridCoord,
): CellInsight | null {
  return insightIndex[toKey(floorId, coord)] ?? null;
}

export function toKey(floorId: string, coord: GridCoord) {
  return `${floorId}:${coord.x}-${coord.y}`;
}
