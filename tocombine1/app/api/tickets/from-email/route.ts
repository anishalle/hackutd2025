import { NextResponse } from "next/server";
import { google } from "googleapis";
import OpenAI from "openai";


function decodeBase64Url(data?: string) {
  if (!data) return "";
  const b64 = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64").toString("utf8");
}

function getPlainBody(payload: any): string {
  if (!payload) return "";
  if (payload.body?.data) return decodeBase64Url(payload.body.data);

  if (payload.parts && payload.parts.length) {
    const plain = payload.parts.find((p: any) => p.mimeType === "text/plain");
    if (plain?.body?.data) return decodeBase64Url(plain.body.data);

    const first = payload.parts.find((p: any) => p.body && p.body.data);
    if (first?.body?.data) return decodeBase64Url(first.body.data);
  }
  return "";
}


type RawEmail = {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
};

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
  tags: (
    | "cabling"
    | "compute"
    | "cooling"
    | "firmware"
    | "hardware"
    | "inspection"
    | "install"
    | "interconnect"
    | "maintenance"
    | "mapping"
    | "network"
    | "optics"
    | "parallel"
    | "permissions"
    | "power"
    | "provisioning"
    | "redundancy"
    | "robotics"
    | "security"
    | "sensors"
    | "signal"
    | "software"
    | "storage"
    | "telemetry"
    | "vlan"
  )[];
  channel: "email";
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

const INCIDENT_SYSTEM_PROMPT = `
You are an SRE / NOC ticket generator for a data center.

The email address you are connected to only receieves emails for problems/incidents. For EACH email you receive, you MUST return EXACTLY ONE JSON object with these fields:

{
    "id": "WO-9823", // unique ticket ID (use email id)
    "title": "Replace PSU on rack P44", //string, any short title
    "queue": "Critical path", //enum string, one of: Critical path | Parallel ready | Investigations
    "severity": "critical", // enum string, one of: critical | high | medium | low
    "team": "admin", // enum string, one of: admin | technician
    "kind": "known", // enum string, one of: known | ambiguous | dispatch
    "owner": "Crew Delta", // string, any owner name
    "status": "Crew en route",   // string, any status text
    "eta": "00:15",  // string, estimated ETA 
    "tags": ["power", "redundancy"],   // string[], tags allowed: cabling, compute, cooling, firmware, hardware, inspection, install, interconnect, maintenance, mapping, network, optics, parallel, permissions, power, provisioning, redundancy, robotics, security, sensors, signal, software, storage, telemetry, vlan
    "channel": "email",   // enum string, always "email"
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
- Assume ALL emails to this inbox are about incidents or problems unless they clearly are not.
- If not an incident (marketing, noise), set:
  "title": "Non-incident",
  "severity": "low",
  and explain why in "details".
- Be conservative but decisive with priority:
- Output ONLY valid JSON. No markdown, no comments.
`;

async function emailToTicket(
  client: OpenAI,
  email: RawEmail
): Promise<Ticket> {
  const content = `
Subject: ${email.subject}
From: ${email.from}
Date: ${email.date}

Body:
${email.body.slice(0, 6000)}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: INCIDENT_SYSTEM_PROMPT },
      { role: "user", content },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw);

  const ticket: Ticket = {
    id: parsed.id || email.id,
    title: parsed.title || email.subject || "Incident",
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
    team: parsed.team === "admin" || parsed.team === "technician"
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
    tags:
      Array.isArray(parsed.tags) && parsed.tags.length > 0
        ? parsed.tags.filter((t: string) =>
            [
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
            ].includes(t)
          )
        : ["maintenance"],
    channel: "email",
    location: parsed.location || "Unknown",
    customer: parsed.customer || undefined,
    summary: parsed.summary || email.subject || "Incident reported via email.",
    details: parsed.details || email.body || "No additional details parsed.",
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

  return ticket;
}

/** GET: pull unread emails → generate tickets → return to frontend */
export async function GET() {
  try {
    const {
      GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET,
      GMAIL_REDIRECT_URI,
      GMAIL_REFRESH_TOKEN,
      GMAIL_OAUTH_USER,
      OPENAI_API_KEY,
    } = process.env;

    if (
      !GMAIL_CLIENT_ID ||
      !GMAIL_CLIENT_SECRET ||
      !GMAIL_REDIRECT_URI ||
      !GMAIL_REFRESH_TOKEN
    ) {
      return NextResponse.json(
        { error: "Missing Gmail env vars" },
        { status: 500 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET,
      GMAIL_REDIRECT_URI
    );
    oauth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const listRes = await gmail.users.messages.list({
      userId: GMAIL_OAUTH_USER || "me",
      q: "is:unread",
      maxResults: 50,
    });

    const messages = listRes.data.messages || [];
    const emails: RawEmail[] = [];

    for (const m of messages) {
      if (!m.id) continue;

      const full = await gmail.users.messages.get({
        userId: GMAIL_OAUTH_USER || "me",
        id: m.id,
        format: "full",
      });

      const headers = full.data.payload?.headers || [];
      const subject =
        headers.find((h) => h.name === "Subject")?.value ||
        "(no subject)";
      const from =
        headers.find((h) => h.name === "From")?.value || "";
      const date =
        headers.find((h) => h.name === "Date")?.value || "";
      const body = getPlainBody(full.data.payload);

      emails.push({ id: m.id, subject, from, date, body });
    }

    const tickets: Ticket[] = [];
    for (const email of emails) {
      try {
        const ticket = await emailToTicket(openai, email);
        tickets.push(ticket);
      } catch (e) {
        console.error("Ticket generation failed for", email.id, e);
      }
    }


    return NextResponse.json({ count: tickets.length, tickets });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}