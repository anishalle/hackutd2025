import { CablingVisualizer } from "@/components/dashboard/cabling-visualizer";
import { SectionCard } from "@/components/dashboard/section-card";
import { TechnicianQueue } from "@/components/dashboard/technician-queue";
import { MapPlaceholder } from "@/components/dashboard/map-placeholder";
import { InstallQueue } from "@/components/field-ops/install-queue";
import { LocationSwitcher } from "@/components/layout/location-switcher";
import { fabricLocations } from "@/lib/locations";

const technicianRoutes = [
  {
    rank: 1,
    ticket: "WO-9830",
    task: "Swap QSFP on spine 6",
    priority: "critical" as const,
    distance: "58m",
    floor: "L3 Aisle 6",
    elevation: "+7ft",
  },
  {
    rank: 2,
    ticket: "WO-9828",
    task: "Inspect liquid loop Delta pod",
    priority: "high" as const,
    distance: "74m",
    floor: "L2 Cold Row",
    elevation: "-4ft",
  },
  {
    rank: 3,
    ticket: "WO-9831",
    task: "Verify cabling bundle 44B",
    priority: "standard" as const,
    distance: "110m",
    floor: "L2 Hot Row",
    elevation: "+2ft",
  },
];

const tasks = [
  {
    id: "FIELD-21",
    title: "Rack install · Pod 12B",
    type: "install" as const,
    owner: "Crew Nova",
    status: "in-progress" as const,
    window: "00:00 - 03:00",
    notes: "Mount 4 chassis, terminate power whips, hand off to cabling.",
  },
  {
    id: "FIELD-22",
    title: "Cabling sweep · Fabric Spine",
    type: "cabling" as const,
    owner: "Crew Halo",
    status: "ready" as const,
    window: "02:00 - 04:00",
    notes: "Validate reroute on fibers 6-12, log losses to DB.",
  },
  {
    id: "FIELD-24",
    title: "Troubleshoot resets · Pod 7",
    type: "troubleshoot" as const,
    owner: "Crew Zulu",
    status: "blocked" as const,
    window: "Waiting parts",
    notes: "Await spare NVSwitch harness, then rerun diagnostics.",
  },
];

export default function FieldOpsPage() {
  return (
    <div className="min-h-screen bg-[#01040b] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_45%)]" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-16 pt-10 lg:px-10">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">
                Field Ops
              </p>
              <h1 className="text-4xl font-semibold">
                Install · cabling · troubleshooting
              </h1>
              <p className="mt-2 max-w-2xl text-base text-white/70">
                Rank dispatches by distance, elevation, and priority. Cabling and install
                queues stay in lockstep.
              </p>
            </div>
            <div className="w-full max-w-xs flex-1">
              <LocationSwitcher locations={fabricLocations} initialId="demo" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Crews on-floor", value: "5", sub: "3 dispatch-ready" },
              { label: "Install tasks", value: "12", sub: "4 blocked" },
              { label: "Cabling alerts", value: "2", sub: "Loss > 2dB" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              >
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  {stat.label}
                </p>
                <p className="text-3xl font-semibold">{stat.value}</p>
                <p className="text-sm text-white/60">{stat.sub}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <SectionCard
              eyebrow="Technicians"
              title="Route planning"
              description="Distance, floor plan, and altitude in one ranked queue."
            >
              <TechnicianQueue routes={technicianRoutes} />
            </SectionCard>

            <SectionCard
              eyebrow="Install & troubleshooting"
              title="Field queue"
              description="Every job is typed so installs, cabling, and diagnostics do not collide."
            >
              <InstallQueue tasks={tasks} />
            </SectionCard>
          </div>
          <div className="space-y-6">
            <SectionCard
              eyebrow="Map"
              title="Floor plan canvas"
              description="Next.js map module placeholder."
            >
              <MapPlaceholder />
            </SectionCard>

            <SectionCard
              eyebrow="Cabling"
              title="Bundle health"
              description="Visualize reroutes and degraded loss."
            >
              <CablingVisualizer />
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
