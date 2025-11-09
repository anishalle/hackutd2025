import type { Bundle, EnhancedTask, TaskCategory } from "@/lib/bundling-engine";
import type { FabricTicket } from "@/lib/tickets/types";

const severityToEnhanced: Record<
  FabricTicket["severity"],
  EnhancedTask["severity"]
> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "medium",
};

const priorityBySeverity: Record<
  FabricTicket["severity"],
  NonNullable<EnhancedTask["priority"]>
> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "standard",
};

export const severityDurationMap: Record<EnhancedTask["severity"], number> = {
  critical: 45,
  high: 35,
  medium: 25,
};

export type BundledTask = EnhancedTask & { originalTicket: FabricTicket };

export function mapTicketToEnhancedTask(ticket: FabricTicket): BundledTask {
  const severity = severityToEnhanced[ticket.severity];
  const category = deriveCategory(ticket.title, ticket.tags);
  return {
    id: ticket.id,
    title: ticket.title,
    severity,
    eta: ticket.eta,
    details: ticket.details
      ? `${ticket.summary} · ${ticket.details}`
      : ticket.summary,
    parallelGroup: ticket.parallelGroup,
    source: ticket.channel,
    category,
    taskType: ticket.workload,
    location: deriveLocation(ticket),
    timeWindow: deriveTimeWindow(ticket.eta),
    estimatedDuration: severityDurationMap[severity],
    priority: priorityBySeverity[ticket.severity],
    company: ticket.customer,
    resourceRequirements: {
      crew: ticket.team,
      requiresShutdown:
        ticket.severity === "critical" ||
        ticket.tags.some((tag) => ["power", "cooling"].includes(tag)),
      requiresVendorAccess: ticket.tags.includes("vendor"),
    },
    originalTicket: ticket,
  };
}

export function calculateTimeSaved(tasks: BundledTask[]): number {
  if (tasks.length < 2) return 0;
  const sequential = tasks.reduce((sum, task) => {
    const duration =
      task.estimatedDuration ?? severityDurationMap[task.severity] ?? 25;
    return sum + duration;
  }, 0);
  const longest = tasks.reduce((max, task) => {
    const duration =
      task.estimatedDuration ?? severityDurationMap[task.severity] ?? 25;
    return Math.max(max, duration);
  }, 0);
  return Math.max(0, sequential - longest);
}

export function summarizeBundle(bundle: Bundle) {
  const tasks = bundle.tasks as BundledTask[];
  const totalTasks = tasks.length;
  const totalTimeSaved = calculateTimeSaved(tasks);
  return {
    totalTasks,
    totalTimeSaved,
  };
}

function deriveCategory(title: string, tags: string[]): TaskCategory {
  const haystack = `${title} ${tags.join(" ")}`.toLowerCase();
  if (haystack.includes("emergency") || haystack.includes("incident")) {
    return "EMERGENCY";
  }
  if (
    haystack.includes("provision") ||
    haystack.includes("allocate") ||
    haystack.includes("quota") ||
    haystack.includes("cluster") ||
    tags.includes("provisioning")
  ) {
    return "PROVISIONING";
  }
  if (
    haystack.includes("permission") ||
    haystack.includes("access") ||
    haystack.includes("policy") ||
    tags.includes("permissions")
  ) {
    return "ACCESS_CONTROL";
  }
  if (
    haystack.includes("deploy") ||
    haystack.includes("container") ||
    haystack.includes("install") ||
    tags.includes("deployment")
  ) {
    return "DEPLOYMENT";
  }
  if (
    haystack.includes("monitor") ||
    haystack.includes("dashboard") ||
    haystack.includes("analysis") ||
    tags.includes("monitoring")
  ) {
    return "MONITORING";
  }
  if (
    haystack.includes("config") ||
    haystack.includes("update") ||
    haystack.includes("network") ||
    haystack.includes("firmware") ||
    tags.includes("configuration")
  ) {
    return "CONFIGURATION";
  }
  return "PROVISIONING";
}

function deriveTimeWindow(eta: string): string {
  const normalized = eta.toLowerCase();
  if (normalized.includes("progress") || normalized.includes("dispatch")) {
    return "Now-01:00";
  }
  const match = normalized.match(/\d{2}:\d{2}/g);
  if (match && match.length >= 1) {
    const start = match[0]!;
    const end = match[1] ?? "02:00";
    return `${start}-${end}`;
  }
  return "00:30-02:00";
}

function deriveLocation(ticket: FabricTicket) {
  const [level, area] =
    ticket.floor?.split("·").map((part) => part.trim()) ?? [];
  return {
    building: ticket.location || "Austin Fabric",
    floor: level,
    aisle: area,
    region: "us-south",
  };
}
