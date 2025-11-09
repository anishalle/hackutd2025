"use client";

import { CablingVisualizer } from "@/components/dashboard/cabling-visualizer";
import { CommunicationFeed } from "@/components/dashboard/communication-feed";
import { InventoryPanel } from "@/components/dashboard/inventory-panel";
import { LocationTabs } from "@/components/dashboard/location-tabs";
import { MapPlaceholder } from "@/components/dashboard/map-placeholder";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { ParallelWorkloads } from "@/components/dashboard/parallel-workloads";
import { QuickAutomation } from "@/components/dashboard/quick-automation";
import { SectionCard } from "@/components/dashboard/section-card";
import { TechnicianQueue } from "@/components/dashboard/technician-queue";
import { TicketBoard } from "@/components/dashboard/ticket-board";

const locations = [
  {
    id: "demo",
    name: "Austin Demo Fabric",
    status: "Live production",
    detail: "12MW · 1,024 GPUs",
  },
  {
    id: "phx",
    name: "Phoenix West",
    status: "Coming soon",
    detail: "Awaiting uplink",
    disabled: true,
  },
  {
    id: "dal",
    name: "Dallas Edge",
    status: "In design",
    detail: "Floor plan pending",
    disabled: true,
  },
];

const metrics = [
  {
    label: "CLUSTER UTILIZATION",
    value: "82%",
    subLabel: "GPU busy time, rolling 15m",
    trend: "+6%",
  },
  {
    label: "WORK ORDERS",
    value: "27",
    subLabel: "8 ready for parallel execution",
    trend: "−3 open",
  },
  {
    label: "POWER ENVELOPE",
    value: "9.8MW",
    subLabel: "Load vs 11MW ceiling",
    trend: "safe margin",
  },
  {
    label: "QUEUE DEPTH",
    value: "412 jobs",
    subLabel: "22 flagged for priority HPC",
    trend: "syncing",
  },
];

const knownTickets = [
  {
    id: "WO-9823",
    title: "Replace PSU on rack P44",
    severity: "critical" as const,
    eta: "Crew en route • 15m",
    details: "Telemetry caught undervolt on redundant PSU before failover.",
    parallelGroup: "A",
    source: "slack" as const,
  },
  {
    id: "WO-9824",
    title: "Provision 10-node pod for SentiAI",
    severity: "high" as const,
    eta: "Auto-run after cabling clear",
    details: "All prep tasks ready. Waiting on quick provision trigger.",
    parallelGroup: "B",
    source: "manual" as const,
  },
];

const ambiguousTickets = [
  {
    id: "SIG-442",
    title: "Node pool 7 intermittent resets",
    severity: "high" as const,
    signal: "Sudden power draw spikes across 3 sleds; no single fault yet.",
    hypotheses: [
      { label: "Cooling pump cavitation", confidence: 42 },
      { label: "NVLink harness pinch", confidence: 33 },
      { label: "Firmware regression", confidence: 25 },
    ],
  },
  {
    id: "SIG-448",
    title: "West aisle network flap",
    severity: "medium" as const,
    signal: "Optics BER up 18% w/out CRCs; optical budget near limit.",
    hypotheses: [
      { label: "Fiber bend radius violation", confidence: 47 },
      { label: "Faulty QSFP", confidence: 29 },
      { label: "Patch panel contamination", confidence: 24 },
    ],
  },
];

const workloads = [
  {
    id: "PAR-1",
    company: "Redline Motors",
    task: "Provision 10x H100 nodes",
    nodes: 10,
    window: "00:30-02:00",
    parallelizable: true,
    priority: "high" as const,
  },
  {
    id: "PAR-2",
    company: "OmniBio",
    task: "Secure permissions audit",
    nodes: 4,
    window: "Now-00:45",
    parallelizable: true,
    priority: "standard" as const,
  },
  {
    id: "PAR-3",
    company: "TopoSynth",
    task: "Scale image training pod",
    nodes: 32,
    window: "02:00-04:00",
    parallelizable: false,
    priority: "critical" as const,
  },
];

const quickActions = [
  {
    id: "AUTO-12",
    title: "Provision 10 node pod",
    description:
      "Spin up containers, wire storage paths, and push creds to customer vault.",
    buttonLabel: "Generate user + password",
    footprint: "medium",
  },
  {
    id: "AUTO-19",
    title: "Set project permissions",
    description: "Grant storage + GPU slices for burst workloads in 1 click.",
    buttonLabel: "Apply policy",
    footprint: "low",
  },
];

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

const communications = [
  {
    id: "COM-1",
    channel: "slack" as const,
    author: "#fabric-alerts",
    time: "08:46 CST",
    summary: "Alert: PSU P44 trending to fail — auto ticket WO-9823 created.",
    ticketId: "WO-9823",
  },
  {
    id: "COM-2",
    channel: "email" as const,
    author: "ops@toposynth.ai",
    time: "07:55 CST",
    summary: "Request to expand NVSwitch fabric — pending design approval.",
    ticketId: "WO-9827",
  },
];

const inventory = [
  {
    item: "QSFP-DD 400G optics",
    onHand: 46,
    threshold: 30,
    daysRemaining: 6,
    usageTrend: "rising" as const,
  },
  {
    item: "Cold plate gaskets",
    onHand: 140,
    threshold: 90,
    daysRemaining: 18,
    usageTrend: "steady" as const,
  },
  {
    item: "Power shelf (N+1)",
    onHand: 8,
    threshold: 6,
    daysRemaining: 12,
    usageTrend: "rising" as const,
  },
  {
    item: "Fiber trunks (MTP-24)",
    onHand: 62,
    threshold: 40,
    daysRemaining: 25,
    usageTrend: "cooling" as const,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#01040b] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_45%)]" />
      <div className="fixed inset-y-0 right-0 w-1/2 bg-gradient-to-l from-blue-900/20 to-transparent blur-3xl" />
      <main className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">
                Hyperion Compute
              </p>
              <h1 className="text-4xl font-semibold text-white">
                Work Orders · HPC Platform Ops
              </h1>
              <p className="mt-2 max-w-2xl text-base text-white/70">
                Command center for provisioning, cabling, and technician routing
                across NVIDIA-powered fabrics.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-sm text-white/70">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Demo Fabric
              </p>
              <p className="text-lg font-semibold text-white">Austin · Live</p>
              <p>Last sync 08:52 CST</p>
            </div>
          </div>
          <LocationTabs locations={locations} activeId="demo" />
        </header>

        <MetricGrid metrics={metrics} />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <SectionCard
              eyebrow="Admin · Tickets"
              title="Work order intelligence"
              description="Group by parallel-ready and ambiguous signals to unblock provisioning."
            >
              <TicketBoard
                knownTickets={knownTickets}
                ambiguousTickets={ambiguousTickets}
              />
            </SectionCard>

            <SectionCard
              eyebrow="Admin · Forecasting"
              title="Parallelizable runs"
              description="Slot quick wins to keep fabric saturated without stepping on serial maintenance."
            >
              <ParallelWorkloads workloads={workloads} />
            </SectionCard>

            <SectionCard
              eyebrow="Admin · Automation"
              title="Push-button fixes"
              description="For easy tasks like permissions or lightweight provisioning, issue creds instantly."
            >
              <QuickAutomation actions={quickActions} />
            </SectionCard>

            <SectionCard
              eyebrow="Comms"
              title="Auto-generated updates"
              description="All parsed comms log their origin so everyone knows what bot created what."
            >
              <CommunicationFeed items={communications} />
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard
              eyebrow="Technicians"
              title="Route + rank"
              description="Distance, floor elevation, and priority produce the go-now list."
            >
              <TechnicianQueue routes={technicianRoutes} />
            </SectionCard>

            <SectionCard
              eyebrow="Technicians"
              title="Map & floor plan"
              description="Canvas placeholder for the Next.js map module."
            >
              <MapPlaceholder />
            </SectionCard>

            <SectionCard
              eyebrow="Cabling"
              title="Bundle health"
              description="Visualize installs, reroutes, and degraded loss in one glance."
            >
              <CablingVisualizer />
            </SectionCard>

            <SectionCard
              eyebrow="Inventory"
              title="Predictive restocking"
              description="Tracking burn so spare shelves stay ahead of the demand curve."
            >
              <InventoryPanel items={inventory} />
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
