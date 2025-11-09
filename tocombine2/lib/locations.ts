import type { LocationOption } from "@/components/layout/location-switcher";

export const fabricLocations: LocationOption[] = [
  {
    id: "demo",
    name: "Austin Demo Fabric",
    status: "Live production",
    detail: "12MW · 1,024 GPUs",
    lastSync: "08:52 CST",
  },
  {
    id: "phx",
    name: "Phoenix West",
    status: "Coming soon",
    detail: "Awaiting uplink",
    lastSync: "Offline",
    disabled: true,
  },
  {
    id: "dal",
    name: "Dallas Edge",
    status: "In design",
    detail: "Floor plan pending",
    lastSync: "N/A",
    disabled: true,
  },
];
