import { NextResponse } from "next/server";
import { google } from "googleapis";
import type { gmail_v1 } from "googleapis";
import OpenAI from "openai";

const decodeBase64Url = (data?: string) => {
  if (!data) return "";
  return Buffer.from(
    data.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf8");
};

const getPlainBody = (
  payload?: gmail_v1.Schema$MessagePart,
): string => {
  if (!payload) return "";
  if (payload.body?.data) return decodeBase64Url(payload.body.data);
  if (payload.parts?.length) {
    const plain = payload.parts.find(
      (part) => part.mimeType === "text/plain",
    );
    if (plain?.body?.data) return decodeBase64Url(plain.body.data);
    const first = payload.parts.find((part) => part.body?.data);
    if (first?.body?.data) return decodeBase64Url(first.body.data);
  }
  return "";
};

type RawEmail = {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
};

const INCIDENT_SYSTEM_PROMPT = `
You are an SRE / NOC ticket generator for a data center.
Every email is an incident unless clearly otherwise. For each email, output exactly one JSON object with this schema:
{
  "id": "WO-9823",
  "title": "Replace PSU on rack P44",
  "queue": "Critical path" | "Parallel ready" | "Investigations",
  "severity": "critical" | "high" | "medium" | "low",
  "team": "admin" | "technician",
  "kind": "known" | "ambiguous" | "dispatch",
  "owner": "Crew Delta",
  "status": "Crew en route",
  "eta": "00:15",
  "tags": [
    "cabling","compute","cooling","firmware","hardware","inspection","install","interconnect","maintenance",
    "mapping","network","optics","parallel","permissions","power","provisioning","redundancy","robotics",
    "security","sensors","signal","software","storage","telemetry","vlan"
  ],
  "channel": "email",
  "location": "Austin",
  "customer": "Redline Motors",
  "summary": "Telemetry caught undervolt...",
  "details": "Replace PSU sled...",
  "parallelReady": false,
  "parallelGroup": "A",
  "fastFixAvailable": false,
  "affectedCustomers": ["Redline Motors"],
  "affectedSystems": ["Rack P44 power shelf"],
  "affectedServers": ["p44-gpu-01"],
  "workload": "Power swap"
}

Rules:
- If an email is clearly not an incident, set title to "Non-incident", severity to "low", explain in details.
- Output VALID JSON ONLY.
`;

const emailToTicket = async (client: OpenAI, email: RawEmail) => {
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

  const validTags = new Set([
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
  ]);

  return {
    id: parsed.id || email.id,
    title: parsed.title || email.subject || "Incident",
    queue:
      parsed.queue === "Critical path" ||
      parsed.queue === "Parallel ready" ||
      parsed.queue === "Investigations"
        ? parsed.queue
        : "Investigations",
    severity: ["critical", "high", "medium", "low"].includes(parsed.severity)
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
      Array.isArray(parsed.tags) && parsed.tags.length
        ? parsed.tags.filter((tag: string) => validTags.has(tag))
        : ["maintenance"],
    channel: "email" as const,
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
};

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
        { status: 500 },
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 },
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET,
      GMAIL_REDIRECT_URI,
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
        headers.find((h) => h.name === "Subject")?.value || "(no subject)";
      const from = headers.find((h) => h.name === "From")?.value || "";
      const date = headers.find((h) => h.name === "Date")?.value || "";
      const body = getPlainBody(full.data.payload);

      emails.push({ id: m.id, subject, from, date, body });
    }

    const tickets = [];
    for (const email of emails) {
      try {
        tickets.push(await emailToTicket(openai, email));
      } catch (err) {
        console.error("ticket generation failed for", email.id, err);
      }
    }

    return NextResponse.json({ count: tickets.length, tickets });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
