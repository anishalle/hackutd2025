import { CablingVisualizer } from "@/components/dashboard/cabling-visualizer";
import { SectionCard } from "@/components/dashboard/section-card";
import { DeviceAssistant } from "@/components/field-ops/device-assistant";
import { LocationSwitcher } from "@/components/layout/location-switcher";
import { fabricLocations } from "@/lib/locations";

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
              eyebrow="AI Assistant"
              title="Device & parts guide"
              description="Instant install + troubleshooting help grounded in real hardware specs."
            >
              <DeviceAssistant />
            </SectionCard>
          </div>
          <div className="space-y-6">
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
