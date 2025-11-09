import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type Ticket = {
  id: string;
  title: string;
  queue: "Critical path" | "Parallel ready" | "Investigations";
  severity: "critical" | "high" | "medium" | "low";
  team: "admin" | "technician";
  kind: "known" | "ambiguous" | "dispatch";
  owner: string;
  status: string;
  eta: string;
  tags: string[];
  channel: "slack";
  location: string;
  customer?: string;
  summary: string;
  details: string;
  parallelReady?: boolean;
  parallelGroup?: string;
  fastFixAvailable?: boolean;
  affectedCustomers?: string[];
  affectedSystems?: string[];
  affectedServers?: string[];
  workload: string;
};

const ALLOWED_TAGS = [
  "cabling",
  "compute",
  "cooling",
  "firmware",
  "hardware",
  "inspection",
  "install",
  "interconnect",
  "maintenance",
  "mapping",
  "network",
  "optics",
  "parallel",
  "permissions",
  "power",
  "provisioning",
  "redundancy",
  "robotics",
  "security",
  "sensors",
  "signal",
  "software",
  "storage",
  "telemetry",
  "vlan",
];

const INCIDENT_SYSTEM_PROMPT = `
You are an SRE / NOC ticket generator for a data center.

The Slack inbox you are connected to only receieves DMs for problems/incidents. For EACH DM you receive, you MUST return EXACTLY ONE JSON object with these fields:

{
    "id": "WO-9823", // unique ticket ID (use Slack id)
    "title": "Replace PSU on rack P44", //string, any short title
    "queue": "Critical path", //enum string, one of: Critical path | Parallel ready | Investigations
    "severity": "critical", // enum string, one of: critical | high | medium | low
    "team": "admin", // enum string, one of: admin | technician
    "kind": "known", // enum string, one of: known | ambiguous | dispatch
    "owner": "Crew Delta", // string, any owner name
    "status": "Crew en route",   // string, any status text
    "eta": "00:15",  // string, estimated ETA 
    "tags": ["power", "redundancy"],   // string[], tags allowed: cabling, compute, cooling, firmware, hardware, inspection, install, interconnect, maintenance, mapping, network, optics, parallel, permissions, power, provisioning, redundancy, robotics, security, sensors, signal, software, storage, telemetry, vlan
    "channel": "slack",   // enum string, always "slack"
    "location": "Austin",  // string, any location text
    "customer": "Redline Motors",   // optional string, any optional customer; omit if not applicable
    "summary": "Telemetry caught undervolt on redundant PSU before failover; swap primary and run soak.", //string, any summary
    "details": "Replace PSU sled and re-run automated failover drill before release.", //string, any details
    "parallelReady": false,  // boolean, optional parallel flag
    "parallelGroup": "A", // string, optional parallel group identifier
    "fastFixAvailable": false,  // boolean, optional fast fix availability
    "affectedCustomers": ["Redline Motors"], // string[] optional; any customer names
    "affectedSystems": ["Rack P44 power shelf", "NVSwitch fabric north bus"], // string[] optional; any system names
    "affectedServers": ["p44-gpu-01", "p44-gpu-02"], // string[] optional; any server identifiers
    "workload": "Power swap" // string, any workload description
  }


RULES:
- Assume ALL DMs to this inbox are about incidents or problems unless they clearly are not.
- If not an incident (marketing, noise), set:
  "title": "Non-incident",
  "severity": "low",
  and explain why in "details".
- Be conservative but decisive with priority:
- Output ONLY valid JSON. No markdown, no comments.
`;

async function slackUserGet(path: string, params: Record<string, string> = {}) {
  const token = process.env.SLACK_USER_TOKEN;
  if (!token) throw new Error("Missing SLACK_USER_TOKEN");

  const url = new URL(`https://slack.com/api/${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!data.ok) {
    console.error("Slack API error in", path, data);
    throw new Error(data.error || `Slack API ${path} failed`);
  }
  return data;
}

export async function GET(_req: NextRequest) {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY");
    }
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // 1) Identify the incident user (the account whose DMs we read)
    const auth = await slackUserGet("auth.test");
    const incidentUserId = auth.user_id as string;

    // 2) List IM channels this user is in
    const ims = await slackUserGet("conversations.list", {
      types: "im",
      limit: "100",
    });

    const imChannels: { id: string }[] = ims.channels || [];
    const messages: { id: string; text: string; user: string; ts: string }[] = [];

    // 3) For each IM, pull recent messages FROM other users TO this incident account
    for (const im of imChannels) {
      const hist = await slackUserGet("conversations.history", {
        channel: im.id,
        limit: "20",
      });

      for (const m of hist.messages || []) {
        if (
          !m.subtype &&
          m.user &&
          m.user !== incidentUserId && // from someone else
          typeof m.text === "string"
        ) {
          messages.push({
            id: `${im.id}-${m.ts}`,
            text: m.text,
            user: m.user,
            ts: m.ts,
          });
        }
      }
    }

    const tickets: Ticket[] = [];

    // 4) Turn each message into a Ticket
    for (const msg of messages) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: INCIDENT_SYSTEM_PROMPT },
          {
            role: "user",
            content: `From Slack user: ${msg.user}\nSlack ts: ${msg.ts}\n\nMessage:\n${msg.text}`,
          },
        ],
      });

      const raw = completion.choices[0]?.message?.content || "{}";

      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse Slack ticket JSON", e, raw);
        continue;
      }

      const tags =
        Array.isArray(parsed.tags) && parsed.tags.length
          ? parsed.tags.filter((t: string) => ALLOWED_TAGS.includes(t))
          : ["maintenance"];

      const ticket: Ticket = {
        id: parsed.id || `SLACK-${msg.id}`,
        title: parsed.title || "Incident from Slack DM",
        queue:
          parsed.queue === "Critical path" ||
          parsed.queue === "Parallel ready" ||
          parsed.queue === "Investigations"
            ? parsed.queue
            : "Investigations",
        severity:
          parsed.severity === "critical" ||
          parsed.severity === "high" ||
          parsed.severity === "medium" ||
          parsed.severity === "low"
            ? parsed.severity
            : "medium",
        team:
          parsed.team === "admin" || parsed.team === "technician"
            ? parsed.team
            : "technician",
        kind:
          parsed.kind === "known" ||
          parsed.kind === "ambiguous" ||
          parsed.kind === "dispatch"
            ? parsed.kind
            : "ambiguous",
        owner: parsed.owner || "Unassigned",
        status: parsed.status || "Pending triage",
        eta: parsed.eta || "00:30",
        tags,
        channel: "slack",
        location: parsed.location || "Unknown",
        customer: parsed.customer || undefined,
        summary: parsed.summary || msg.text || "Slack-reported incident.",
        details: parsed.details || "No additional details parsed.",
        parallelReady:
          typeof parsed.parallelReady === "boolean"
            ? parsed.parallelReady
            : undefined,
        parallelGroup:
          typeof parsed.parallelGroup === "string"
            ? parsed.parallelGroup
            : undefined,
        fastFixAvailable:
          typeof parsed.fastFixAvailable === "boolean"
            ? parsed.fastFixAvailable
            : undefined,
        affectedCustomers: Array.isArray(parsed.affectedCustomers)
          ? parsed.affectedCustomers
          : undefined,
        affectedSystems: Array.isArray(parsed.affectedSystems)
          ? parsed.affectedSystems
          : undefined,
        affectedServers: Array.isArray(parsed.affectedServers)
          ? parsed.affectedServers
          : undefined,
        workload: parsed.workload || "Investigation",
      };

      tickets.push(ticket);
    }

    return NextResponse.json({ count: tickets.length, tickets });
  } catch (err: any) {
    console.error("Slack tickets error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load Slack tickets" },
      { status: 500 }
    );
  }
}
