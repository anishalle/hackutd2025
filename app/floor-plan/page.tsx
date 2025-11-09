"use client";

import { FloorPlanView } from "@/components/floor-plan/floor-plan-view";
import {
  floorPlanFloors,
  routePresets,
  technicianPathGraph,
  tileDefinitions,
} from "@/lib/floor-plan/data";

export default function FloorPlanPage() {
  return (
    <FloorPlanView
      floors={floorPlanFloors}
      tiles={tileDefinitions}
      graph={technicianPathGraph}
      presets={routePresets}
    />
  );
}
