"use client";

import { useEffect, useMemo, useState } from "react";

import { TicketTable, type TicketRecord } from "@/components/tickets/ticket-table";
import { LocationSwitcher } from "@/components/layout/location-switcher";
import { fabricLocations } from "@/lib/locations";
import { BundlingEngine, type EnhancedTask, type Bundle } from "@/lib/bundling-engine";

const tickets: TicketRecord[] = [
  // Admin tickets - Software/Virtual tasks only
  {
    id: "WO-9824",
    queue: "Parallel ready",
    title: "Provision 10-node H100 cluster for SentiAI",
    customer: "SentiAI",
    severity: "high",
    owner: "Aya Burke",
    status: "Ready to execute",
    eta: "00:25",
    tags: ["provisioning", "parallel"],
    channel: "manual",
    parallelReady: true,
    team: "admin",
    location: "Austin",
    workload: "Provision cluster",
  },
  {
    id: "WO-9832",
    queue: "Parallel ready",
    title: "Grant GPU quota & storage permissions for OmniBio",
    customer: "OmniBio",
    severity: "high",
    owner: "IAM bot",
    status: "Automation ready",
    eta: "00:30",
    tags: ["permissions", "parallel"],
    channel: "manual",
    parallelReady: true,
    team: "admin",
    location: "Austin",
    workload: "Access policy",
  },
  {
    id: "WO-9835",
    queue: "Parallel ready",
    title: "Deploy PyTorch containers for TopoSynth training",
    customer: "TopoSynth",
    severity: "high",
    owner: "K8s Orchestrator",
    status: "Image pulled",
    eta: "00:35",
    tags: ["deployment", "parallel"],
    channel: "slack",
    parallelReady: true,
    team: "admin",
    location: "Austin",
    workload: "Container deploy",
  },
  {
    id: "WO-9836",
    queue: "Parallel ready",
    title: "Create user accounts for CloudML team (5 users)",
    customer: "CloudML",
    severity: "medium",
    owner: "Identity Service",
    status: "Pending approval",
    eta: "01:00",
    tags: ["provisioning", "parallel"],
    channel: "email",
    parallelReady: true,
    team: "admin",
    location: "Austin",
    workload: "User creation",
  },
  {
    id: "WO-9837",
    queue: "Parallel ready",
    title: "Configure network policies for Redline isolation",
    customer: "Redline Motors",
    severity: "medium",
    owner: "NetOps",
    status: "Policy drafted",
    eta: "01:15",
    tags: ["configuration", "parallel"],
    channel: "manual",
    parallelReady: true,
    team: "admin",
    location: "Austin",
    workload: "Network config",
  },
  {
    id: "WO-9838",
    queue: "Scheduled",
    title: "Update BMC firmware across compute nodes (batch 1)",
    customer: "Infrastructure",
    severity: "medium",
    owner: "Firmware Bot",
    status: "Maintenance window",
    eta: "02:00",
    tags: ["configuration", "parallel"],
    channel: "manual",
    parallelReady: true,
    team: "admin",
    location: "Austin",
    workload: "Firmware update",
  },
  {
    id: "WO-9839",
    queue: "Parallel ready",
    title: "Setup monitoring dashboards for NeuralWave",
    customer: "NeuralWave",
    severity: "medium",
    owner: "Observability Team",
    status: "Template ready",
    eta: "00:45",
    tags: ["monitoring", "parallel"],
    channel: "slack",
    parallelReady: true,
    team: "admin",
    location: "Austin",
    workload: "Dashboard setup",
  },
  {
    id: "WO-9840",
    queue: "Parallel ready",
    title: "Allocate 50TB storage volumes for DataFlow AI",
    customer: "DataFlow AI",
    severity: "high",
    owner: "Storage Admin",
    status: "Quota available",
    eta: "00:20",
    tags: ["provisioning", "parallel"],
    channel: "manual",
    parallelReady: true,
    team: "admin",
    location: "Austin",
    workload: "Storage allocation",
  },
  {
    id: "SIG-448",
    queue: "Investigations",
    title: "Cluster utilization spike analysis for pod 7",
    customer: "Shared fabric",
    severity: "medium",
    owner: "Performance Team",
    status: "Collecting metrics",
    eta: "Triage @ 01:30",
    tags: ["monitoring", "investigation"],
    channel: "email",
    parallelReady: false,
    team: "admin",
    location: "Austin",
    workload: "Signal triage",
  },
  {
    id: "WO-9841",
    queue: "Critical path",
    title: "Emergency quota increase for VisionTech (job OOM)",
    customer: "VisionTech",
    severity: "critical",
    owner: "On-call Admin",
    status: "In progress",
    eta: "00:10",
    tags: ["provisioning", "emergency"],
    channel: "slack",
    parallelReady: false,
    team: "admin",
    location: "Austin",
    workload: "Emergency quota",
  },
  {
    id: "WO-9830",
    queue: "Dispatch now",
    title: "Swap QSFP on spine 6",
    severity: "critical",
    owner: "Crew Alpha",
    status: "On floor",
    eta: "In-progress",
    tags: ["cabling", "optics"],
    channel: "slack",
    team: "technician",
    location: "Austin",
    floor: "L3 · Aisle 6",
    distance: "58m",
    workload: "QSFP swap",
  },
  {
    id: "WO-9828",
    queue: "Dispatch now",
    title: "Inspect liquid loop Delta pod",
    severity: "high",
    owner: "Crew Echo",
    status: "Queued",
    eta: "00:35",
    tags: ["cooling", "inspection"],
    channel: "manual",
    team: "technician",
    location: "Austin",
    floor: "L2 · Cold Row",
    distance: "74m",
    workload: "Loop inspection",
  },
  {
    id: "WO-9831",
    queue: "Next up",
    title: "Verify cabling bundle 44B",
    severity: "medium",
    owner: "Crew Foxtrot",
    status: "Waiting clearance",
    eta: "01:10",
    tags: ["cabling", "mapping"],
    channel: "manual",
    team: "technician",
    location: "Austin",
    floor: "L2 · Hot Row",
    distance: "110m",
    workload: "Bundle verify",
  },
  {
    id: "SIG-452",
    queue: "Investigations",
    title: "Intermittent reset on sleds 7A-7C",
    severity: "high",
    owner: "Crew Zulu",
    status: "Diagnostics",
    eta: "Await parts",
    tags: ["signal", "compute"],
    channel: "email",
    team: "technician",
    location: "Austin",
    floor: "L1 · Pod 7",
    distance: "140m",
    workload: "Diagnostics",
  },
];

const tagFilters = ["all", "provisioning", "permissions", "deployment", "configuration", "monitoring", "parallel"];
const severityFilters = ["all", "critical", "high", "medium"];

export default function TicketsPage() {
  const [mode, setMode] = useState<"admin" | "technician">("admin");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [isBundled, setIsBundled] = useState(false);
  const [bundles, setBundles] = useState<Bundle[]>([]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (ticket.team !== mode) return false;
      if (severityFilter !== "all" && ticket.severity !== severityFilter) {
        return false;
      }
      if (tagFilter !== "all" && !ticket.tags.includes(tagFilter)) {
        return false;
      }
      return true;
    });
  }, [mode, tagFilter, severityFilter]);

  const handleBundle = () => {
    if (isBundled) {
      setIsBundled(false);
      setBundles([]);
    } else {
      const engine = new BundlingEngine();
      const enhancedTickets: EnhancedTask[] = filteredTickets.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        severity: ticket.severity as "critical" | "high" | "medium",
        eta: ticket.eta,
        details: `${ticket.workload || ''} - ${ticket.status}`,
        category: inferCategory(ticket.title, ticket.tags),
        priority: ticket.severity as any,
        location: {
          building: "Austin-DC1",
          floor: ticket.floor?.split('·')[0].trim(),
          aisle: ticket.floor?.split('·')[1]?.trim(),
          region: "us-south"
        },
        timeWindow: inferTimeWindow(ticket.eta),
        company: ticket.customer,
        source: ticket.channel,
        resourceRequirements: {
          crew: ticket.team,
          requiresShutdown: ticket.severity === 'critical',
        }
      }));

      const bundledResults = engine.bundleTasks(enhancedTickets);
      setBundles(bundledResults);
      setIsBundled(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#01040b] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_45%)]" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-16 pt-10 lg:px-10">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">
                Ticket system
              </p>
              <h1 className="text-4xl font-semibold">Work orders · database</h1>
              <p className="mt-2 max-w-2xl text-base text-white/70">
                Filters, tags, and SLAs faced by admin vs technician flows in one view.
              </p>
            </div>
            <div className="w-full max-w-xs flex-1">
              <LocationSwitcher locations={fabricLocations} initialId="demo" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Open tickets", value: "18", sub: "10 admin, 8 field ops" },
              { label: "Parallel-ready", value: "8", sub: "Can bundle for efficiency" },
              { label: "Active investigations", value: "2", sub: "Performance analysis" },
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

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-1 text-sm">
              {(["admin", "technician"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setMode(tab);
                    setIsBundled(false);
                  }}
                  className={`rounded-2xl px-4 py-2 font-semibold capitalize transition ${
                    mode === tab
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {mode === "admin" && (
                <button
                  onClick={handleBundle}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    isBundled
                      ? "bg-white/10 text-white/80 hover:bg-white/15"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_10px_30px_-15px_rgba(59,130,246,0.8)] hover:opacity-90"
                  }`}
                >
                  {isBundled ? "Unbundle" : "Bundle Tasks"}
                </button>
              )}
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-1">
                {severityFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSeverityFilter(filter)}
                    className={`rounded-2xl px-3 py-1 uppercase tracking-wide ${
                      severityFilter === filter
                        ? "bg-white/10 text-white"
                        : "text-white/60"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-1">
                {tagFilters.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={`rounded-2xl px-3 py-1 text-xs uppercase tracking-wide ${
                      tagFilter === tag ? "bg-white/10 text-white" : "text-white/60"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {!isBundled ? (
            <TicketTable tickets={filteredTickets} mode={mode} />
          ) : (
            <BundledView bundles={bundles} />
          )}
        </section>
      </div>
    </div>
  );
}

// Bundled View Component
function BundledView({ bundles }: { bundles: Bundle[] }) {
  const [expandedBundles, setExpandedBundles] = useState<Set<string>>(new Set());
  const [selectedTicket, setSelectedTicket] = useState<EnhancedTask | null>(null);

  const toggleBundle = (bundleId: string) => {
    setExpandedBundles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bundleId)) {
        newSet.delete(bundleId);
      } else {
        newSet.add(bundleId);
      }
      return newSet;
    });
  };

  const generateBundleName = (bundle: Bundle): string => {
    const tasks = bundle.tasks;
    if (tasks.length === 1) {
      return tasks[0].title.length > 40 
        ? tasks[0].title.substring(0, 40) + '...' 
        : tasks[0].title;
    }

    // Check if all tasks are for the same customer
    const customers = [...new Set(tasks.map(t => t.company).filter(Boolean))];
    const categories = [...new Set(tasks.map(t => t.category).filter(Boolean))];
    
    if (customers.length === 1 && customers[0]) {
      // Same customer - use customer name + primary category
      if (categories.length === 1) {
        return `${customers[0]} ${formatCategory(categories[0])}`;
      }
      return `${customers[0]} Operations`;
    }
    
    // Multiple customers
    if (categories.length === 1 && categories[0]) {
      // Same category - use category name
      return `${formatCategory(categories[0])} Bundle`;
    }
    
    // Mixed operations - describe the work
    const categoryNames = categories.map(c => formatCategory(c)).join(' & ');
    if (categoryNames.length > 30) {
      return `Mixed Operations (${tasks.length} tasks)`;
    }
    return categoryNames || `Task Bundle (${tasks.length})`;
  };

  const formatCategory = (category?: string): string => {
    if (!category) return 'Tasks';
    const names: Record<string, string> = {
      'PROVISIONING': 'Provisioning',
      'ACCESS_CONTROL': 'Access Control',
      'CONFIGURATION': 'Configuration',
      'DEPLOYMENT': 'Deployment',
      'MONITORING': 'Monitoring',
      'EMERGENCY': 'Emergency',
    };
    return names[category] || category;
  };

  const severityColors: Record<string, string> = {
    critical: "text-rose-200 border border-rose-400/40 bg-rose-400/10",
    high: "text-amber-200 border border-amber-400/40 bg-amber-400/10",
    medium: "text-emerald-200 border border-emerald-400/40 bg-emerald-400/10",
  };

  return (
    <>
      <div className="space-y-6">
        {bundles.map((bundle) => {
          const isSingleTask = bundle.tasks.length === 1;
          const isExpanded = expandedBundles.has(bundle.id);
          
          return (
            <div
              key={bundle.id}
              className={`rounded-3xl border-2 bg-gradient-to-br p-1 shadow-xl ${bundle.color}`}
            >
              {/* Bundle Header - Always Visible, Clickable */}
              <button
                onClick={() => !isSingleTask && toggleBundle(bundle.id)}
                className={`w-full flex items-center justify-between rounded-2xl bg-black/30 px-4 py-3 backdrop-blur-sm ${
                  !isSingleTask ? 'cursor-pointer hover:bg-black/40' : ''
                } transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white">
                    {bundle.tasks.length}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold tracking-wide text-white/90">
                      {generateBundleName(bundle)}
                    </p>
                    <p className="text-xs text-white/60">
                      {bundle.reasons.join(' • ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {bundle.bundleScore > 0 && (
                    <div 
                      className="group relative rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white cursor-help"
                      title="Match percentage based on task compatibility"
                    >
                      {bundle.bundleScore}% similarity
                      <div className="absolute right-0 top-full mt-2 hidden w-64 rounded-xl border border-white/20 bg-slate-900 p-3 text-xs font-normal text-white/80 shadow-xl group-hover:block z-10">
                        <p className="font-semibold text-white mb-1">Cosine Similarity Score</p>
                        <p className="text-xs leading-relaxed">
                          This score uses cosine similarity to measure how similar tasks are based on their feature vectors:
                        </p>
                        <ul className="mt-2 space-y-1 text-xs">
                          <li>• Task category type</li>
                          <li>• Priority & severity levels</li>
                          <li>• Location attributes</li>
                          <li>• Time constraints</li>
                          <li>• Customer assignment</li>
                          <li>• Resource requirements</li>
                        </ul>
                        <p className="mt-2 text-xs text-cyan-300">
                          Higher similarity = tasks share more attributes
                        </p>
                        <p className="mt-1 text-xs text-white/60">
                          100% = identical tasks, 0% = completely different
                        </p>
                      </div>
                    </div>
                  )}
                  {!isSingleTask && (
                    <svg
                      className={`h-6 w-6 text-white transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Collapsible Bundle Content */}
              {(isSingleTask || isExpanded) && (
                <div className="mt-2 space-y-2 px-1">
                  {bundle.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTicket(task)}
                      className="cursor-pointer rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-sm transition-all hover:border-cyan-400/40 hover:bg-black/50"
                    >
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 text-sm">
                        <div>
                          <p className="font-semibold text-white">{task.title}</p>
                          <p className="text-xs text-white/60">{task.id}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white/50">Customer</p>
                          <p className="text-white/80">{task.company || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white/50">Severity</p>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              severityColors[task.severity]
                            }`}
                          >
                            {task.severity}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white/50">ETA</p>
                          <p className="text-white/80">{task.eta}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white/50">Source</p>
                          <p className="text-white/80 capitalize">{task.source}</p>
                        </div>
                      </div>

                      {task.location?.floor && (
                        <div className="mt-2 flex gap-2 text-xs text-white/60">
                          <span className="rounded-full bg-white/10 px-2 py-0.5">
                            📍 {task.location.floor}
                          </span>
                          {task.timeWindow && (
                            <span className="rounded-full bg-white/10 px-2 py-0.5">
                              ⏰ {task.timeWindow}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Bundle Footer - Show when expanded */}
              {!isSingleTask && isExpanded && (
                <div className="mt-2 rounded-2xl bg-black/30 px-4 py-2 text-center backdrop-blur-sm">
                  <p className="text-xs font-medium text-white/80">
                    ⚡ Can be executed in parallel • Est. time saved:{" "}
                    <span className="font-bold text-cyan-300">
                      {calculateTimeSaved(bundle.tasks)} min
                    </span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </>
  );
}

// Ticket Detail Modal Component
function TicketDetailModal({ ticket, onClose }: { ticket: EnhancedTask; onClose: () => void }) {
  const severityColors: Record<string, string> = {
    critical: "text-rose-200 bg-rose-500/20 border-rose-500/40",
    high: "text-amber-200 bg-amber-500/20 border-amber-500/40",
    medium: "text-emerald-200 bg-emerald-500/20 border-emerald-500/40",
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-2xl rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="p-8">
          {/* Header */}
          <div className="mb-6 border-b border-white/10 pb-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-cyan-400">
                {ticket.id}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  severityColors[ticket.severity]
                }`}
              >
                {ticket.severity}
              </span>
              {ticket.category && (
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                  {ticket.category}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white">{ticket.title}</h2>
          </div>

          {/* Details Grid */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-white/50">Customer</p>
              <p className="text-base font-semibold text-white">{ticket.company || 'Internal'}</p>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-white/50">ETA</p>
              <p className="text-base font-semibold text-white">{ticket.eta}</p>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-white/50">Priority</p>
              <p className="text-base font-semibold capitalize text-white">{ticket.priority}</p>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-white/50">Source</p>
              <p className="text-base font-semibold capitalize text-white">{ticket.source}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="mb-2 text-xs uppercase tracking-wide text-white/50">Description</p>
            <p className="text-base leading-relaxed text-white/80">{ticket.details}</p>
          </div>

          {/* Location & Time Window */}
          {(ticket.location || ticket.timeWindow) && (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">
                Execution Details
              </p>
              <div className="grid grid-cols-2 gap-4">
                {ticket.location && (
                  <div>
                    <p className="mb-1 text-xs text-white/50">Location</p>
                    <p className="text-sm text-white">
                      {ticket.location.building || ticket.location.region || 'Remote'}
                      {ticket.location.floor && ` • ${ticket.location.floor}`}
                    </p>
                  </div>
                )}
                {ticket.timeWindow && (
                  <div>
                    <p className="mb-1 text-xs text-white/50">Time Window</p>
                    <p className="text-sm text-white">{ticket.timeWindow}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resource Requirements */}
          {ticket.resourceRequirements && (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">
                Requirements
              </p>
              <div className="flex flex-wrap gap-2">
                {ticket.resourceRequirements.crew && (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white">
                    Crew: {ticket.resourceRequirements.crew}
                  </span>
                )}
                {ticket.resourceRequirements.requiresShutdown && (
                  <span className="rounded-full border border-rose-400/40 bg-rose-500/20 px-3 py-1 text-xs text-rose-200">
                    Requires Shutdown
                  </span>
                )}
                {ticket.resourceRequirements.requiresVendorAccess && (
                  <span className="rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs text-amber-200">
                    Vendor Access Required
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {ticket.dependencies && ticket.dependencies.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">
                Dependencies
              </p>
              <div className="flex flex-wrap gap-2">
                {ticket.dependencies.map((dep) => (
                  <span
                    key={dep}
                    className="rounded-full border border-cyan-400/40 bg-cyan-500/20 px-3 py-1 text-xs text-cyan-200"
                  >
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Functions
function inferCategory(title: string, tags: string[]): "PROVISIONING" | "ACCESS_CONTROL" | "CONFIGURATION" | "DEPLOYMENT" | "MONITORING" | "EMERGENCY" {
  const titleLower = title.toLowerCase();
  const tagStr = tags.join(' ').toLowerCase();
  
  // Emergency tasks
  if (titleLower.includes("emergency") || tagStr.includes("emergency")) {
    return "EMERGENCY";
  }
  
  // Provisioning: Creating resources, allocating capacity, user creation
  if (titleLower.includes("provision") || titleLower.includes("allocate") || 
      titleLower.includes("create user") || titleLower.includes("cluster") ||
      titleLower.includes("quota") || tagStr.includes("provisioning")) {
    return "PROVISIONING";
  }
  
  // Access Control: Permissions, policies, access management
  if (titleLower.includes("permission") || titleLower.includes("grant") || 
      titleLower.includes("access") || titleLower.includes("policy") ||
      tagStr.includes("permissions")) {
    return "ACCESS_CONTROL";
  }
  
  // Deployment: Containers, applications, workloads
  if (titleLower.includes("deploy") || titleLower.includes("container") || 
      titleLower.includes("install") || titleLower.includes("workload") ||
      tagStr.includes("deployment")) {
    return "DEPLOYMENT";
  }
  
  // Monitoring: Dashboards, metrics, observability
  if (titleLower.includes("monitor") || titleLower.includes("dashboard") || 
      titleLower.includes("metric") || titleLower.includes("observability") ||
      titleLower.includes("analysis") || tagStr.includes("monitoring")) {
    return "MONITORING";
  }
  
  // Configuration: Network configs, firmware updates, system settings
  if (titleLower.includes("configure") || titleLower.includes("config") || 
      titleLower.includes("update") || titleLower.includes("firmware") ||
      titleLower.includes("network") || tagStr.includes("configuration")) {
    return "CONFIGURATION";
  }
  
  // Default to provisioning for admin tasks
  return "PROVISIONING";
}

function inferTimeWindow(eta: string): string {
  if (eta.toLowerCase().includes("progress") || eta.includes("00:")) {
    return "Now-01:00";
  }
  if (eta.toLowerCase().includes("demand")) {
    return "00:00-06:00";
  }
  if (eta.includes("01:")) {
    return "01:00-03:00";
  }
  return "00:30-02:00";
}

function calculateTimeSaved(tasks: EnhancedTask[]): number {
  const estimates = [45, 30, 20, 25, 35]; // Default estimates
  const totalSequential = tasks.reduce((sum, _, i) => sum + (estimates[i % estimates.length]), 0);
  const longestTask = Math.max(...estimates.slice(0, tasks.length));
  return Math.max(0, totalSequential - longestTask);
}
