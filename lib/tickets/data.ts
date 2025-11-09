import ticketsJson from "@/lib/tickets/tickets.json";
import {
  FabricTicket,
  TicketAction,
  TicketChannel,
  TicketHypothesis,
  TicketKind,
  TicketSeverity,
  TicketTeam,
} from "@/lib/tickets/types";

type TicketRecord = Record<string, unknown>;

const SEVERITIES: readonly TicketSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
];
const TEAMS: readonly TicketTeam[] = ["admin", "technician"];
const CHANNELS: readonly TicketChannel[] = ["manual", "slack", "email"];
const KINDS: readonly TicketKind[] = ["known", "ambiguous", "dispatch"];

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function asRecord(value: unknown, context: string): TicketRecord {
  invariant(
    typeof value === "object" && value !== null && !Array.isArray(value),
    context,
  );
  return value as TicketRecord;
}

function getValue(record: TicketRecord, field: string) {
  return record[field];
}

function requireString(
  record: TicketRecord,
  field: string,
  index: number,
  label = field,
): string {
  const value = getValue(record, field);
  invariant(
    typeof value === "string" && value.trim().length > 0,
    `Ticket ${index} field "${String(label)}" must be a non-empty string`,
  );
  return value;
}

function optionalString(
  record: TicketRecord,
  field: string,
  index: number,
  label = field,
): string | undefined {
  const value = getValue(record, field);
  if (value === undefined) {
    return undefined;
  }
  invariant(
    typeof value === "string" && value.trim().length > 0,
    `Ticket ${index} field "${String(label)}" must be a non-empty string when provided`,
  );
  return value;
}

function optionalBoolean(
  record: TicketRecord,
  field: string,
  index: number,
  label = field,
): boolean | undefined {
  const value = getValue(record, field);
  if (value === undefined) {
    return undefined;
  }
  invariant(
    typeof value === "boolean",
    `Ticket ${index} field "${String(label)}" must be a boolean when provided`,
  );
  return value;
}

function requireStringArray(
  record: TicketRecord,
  field: string,
  index: number,
  label = field,
): string[] {
  return parseStringArray(record, field, index, true, label) as string[];
}

function parseStringArray(
  record: TicketRecord,
  field: string,
  index: number,
  required = false,
  label = field,
): string[] | undefined {
  const value = getValue(record, field);
  if (value === undefined) {
    invariant(!required, `Ticket ${index} field "${String(label)}" is required`);
    return undefined;
  }
  invariant(
    Array.isArray(value),
    `Ticket ${index} field "${String(label)}" must be an array`,
  );
  value.forEach((item, itemIndex) => {
    invariant(
      typeof item === "string",
      `Ticket ${index} field "${String(label)}" index ${itemIndex} must be a string`,
    );
  });
  return value as string[];
}

function requireEnum<
  TValue extends string,
>(
  record: TicketRecord,
  field: string,
  index: number,
  allowed: readonly TValue[],
  label = field,
): TValue {
  const value = requireString(record, field, index, label);
  invariant(
    allowed.includes(value as TValue),
    `Ticket ${index} field "${String(label)}" must be one of: ${allowed.join(", ")}`,
  );
  return value as TValue;
}

function parseActions(
  record: TicketRecord,
  index: number,
): TicketAction[] | undefined {
  const value = getValue(record, "actions");
  if (value === undefined) {
    return undefined;
  }
  invariant(
    Array.isArray(value),
    `Ticket ${index} field "actions" must be an array`,
  );
  return value.map((action, actionIndex) => {
    const actionRecord = asRecord(
      action,
      `Ticket ${index} action ${actionIndex} must be an object`,
    );
    const parsed: TicketAction = {
      label: requireString(
        actionRecord,
        "label",
        index,
        `actions[${actionIndex}].label`,
      ),
      description: requireString(
        actionRecord,
        "description",
        index,
        `actions[${actionIndex}].description`,
      ),
    };
    const cta = optionalString(
      actionRecord,
      "cta",
      index,
      `actions[${actionIndex}].cta`,
    );
    if (cta) {
      parsed.cta = cta;
    }
    return parsed;
  });
}

function parseHypotheses(
  record: TicketRecord,
  index: number,
): TicketHypothesis[] | undefined {
  const value = getValue(record, "hypotheses");
  if (value === undefined) {
    return undefined;
  }
  invariant(
    Array.isArray(value),
    `Ticket ${index} field "hypotheses" must be an array`,
  );
  return value.map((hypothesis, hypothesisIndex) => {
    const hypothesisRecord = asRecord(
      hypothesis,
      `Ticket ${index} hypothesis ${hypothesisIndex} must be an object`,
    );
    const label = requireString(
      hypothesisRecord,
      "label",
      index,
      `hypotheses[${hypothesisIndex}].label`,
    );
    const confidenceValue = getValue(
      hypothesisRecord,
      "confidence",
    );
    invariant(
      typeof confidenceValue === "number" && Number.isFinite(confidenceValue),
      `Ticket ${index} hypothesis ${hypothesisIndex} confidence must be a finite number`,
    );
    return { label, confidence: confidenceValue } satisfies TicketHypothesis;
  });
}

function validateTicket(entry: unknown, index: number): FabricTicket {
  const record = asRecord(entry, `Ticket ${index} must be an object`);

  const ticket: FabricTicket = {
    id: requireString(record, "id", index),
    title: requireString(record, "title", index),
    queue: requireString(record, "queue", index),
    severity: requireEnum(record, "severity", index, SEVERITIES),
    team: requireEnum(record, "team", index, TEAMS),
    kind: requireEnum(record, "kind", index, KINDS),
    owner: requireString(record, "owner", index),
    status: requireString(record, "status", index),
    eta: requireString(record, "eta", index),
    tags: requireStringArray(record, "tags", index),
    channel: requireEnum(record, "channel", index, CHANNELS),
    location: requireString(record, "location", index),
    summary: requireString(record, "summary", index),
  };

  const optionalFields: Array<
    [keyof FabricTicket, unknown | undefined]
  > = [
    ["customer", optionalString(record, "customer", index)],
    ["details", optionalString(record, "details", index)],
    ["signal", optionalString(record, "signal", index)],
    ["parallelGroup", optionalString(record, "parallelGroup", index)],
    ["parallelReady", optionalBoolean(record, "parallelReady", index)],
    ["fastFixAvailable", optionalBoolean(record, "fastFixAvailable", index)],
    ["workload", optionalString(record, "workload", index)],
    ["floor", optionalString(record, "floor", index)],
    ["distance", optionalString(record, "distance", index)],
  ];

  optionalFields.forEach(([field, value]) => {
    if (value !== undefined) {
      (ticket as TicketRecord)[field as string] = value;
    }
  });

  const optionalArrays: Array<
    [keyof FabricTicket, string[] | undefined]
  > = [
    ["affectedCustomers", parseStringArray(record, "affectedCustomers", index)],
    ["affectedSystems", parseStringArray(record, "affectedSystems", index)],
    ["affectedServers", parseStringArray(record, "affectedServers", index)],
  ];

  optionalArrays.forEach(([field, value]) => {
    if (value !== undefined) {
      (ticket as TicketRecord)[field as string] = value;
    }
  });

  const actions = parseActions(record, index);
  if (actions) {
    ticket.actions = actions;
  }

  const hypotheses = parseHypotheses(record, index);
  if (hypotheses) {
    ticket.hypotheses = hypotheses;
  }

  return ticket;
}

function loadTickets(data: unknown): FabricTicket[] {
  invariant(Array.isArray(data), "Ticket data must be an array");
  return data.map((entry, index) => validateTicket(entry, index));
}

export const fabricTicketBacklog = loadTickets(ticketsJson);

export const knownTicketPlaybooks = fabricTicketBacklog.filter(
  (ticket) => ticket.kind === "known",
);

export const ambiguousTicketSignals = fabricTicketBacklog.filter(
  (ticket) => ticket.kind === "ambiguous",
);

export function getTicketsByTeam(team: TicketTeam) {
  return fabricTicketBacklog.filter((ticket) => ticket.team === team);
}
