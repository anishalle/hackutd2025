export type TicketSeverity = "critical" | "high" | "medium" | "low";
export type TicketTeam = "admin" | "technician";
export type TicketChannel = "manual" | "slack" | "email";
export type TicketKind = "known" | "ambiguous" | "dispatch";

export type TicketHypothesis = {
  label: string;
  confidence: number;
};

export type TicketAction = {
  label: string;
  description: string;
  cta?: string;
};

export type FabricTicket = {
  id: string;
  title: string;
  queue: string;
  severity: TicketSeverity;
  team: TicketTeam;
  kind: TicketKind;
  owner: string;
  status: string;
  eta: string;
  tags: string[];
  channel: TicketChannel;
  location: string;
  customer?: string;
  summary: string;
  details?: string;
  signal?: string;
  hypotheses?: TicketHypothesis[];
  parallelReady?: boolean;
  parallelGroup?: string;
  fastFixAvailable?: boolean;
  actions?: TicketAction[];
  affectedCustomers?: string[];
  affectedSystems?: string[];
  affectedServers?: string[];
  workload?: string;
  floor?: string;
  distance?: string;
};
