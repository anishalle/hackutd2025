import { NextResponse } from "next/server";
import { google } from "googleapis";

function decodeBase64Url(data?: string) {
  if (!data) return "";
  const b64 = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64").toString("utf8");
}

function getPlainBody(payload: any): string {
  if (!payload) return "";
  if (payload.body && payload.body.data) {
    return decodeBase64Url(payload.body.data);
  }
  if (payload.parts && payload.parts.length) {
    const plain = payload.parts.find((p: any) => p.mimeType === "text/plain");
    if (plain && plain.body && plain.body.data) return decodeBase64Url(plain.body.data);
    const first = payload.parts.find((p: any) => p.body && p.body.data);
    if (first) return decodeBase64Url(first.body.data);
  }
  return "";
}

export async function GET() {
  const CLIENT_ID = process.env.GMAIL_CLIENT_ID!;
  const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET!;
  const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI!;
  const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN!;
  const OAUTH_USER = process.env.GMAIL_OAUTH_USER || "me";

  if (!REFRESH_TOKEN) {
    return NextResponse.json({ error: "GMAIL_REFRESH_TOKEN not set. Run /api/gmail/auth and /api/gmail/callback to get it." }, { status: 500 });
  }

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const listRes = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
      maxResults: 50
    });

    const messages = listRes.data.messages || [];
    const out: any[] = [];

    for (const m of messages) {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: m.id!,
        format: "full"
      });

      const headers = full.data.payload?.headers || [];
      const subject = headers.find((h) => h.name === "Subject")?.value || "(no subject)";
      const from = headers.find((h) => h.name === "From")?.value || "";
      const date = headers.find((h) => h.name === "Date")?.value || "";
      const body = getPlainBody(full.data.payload);

      out.push({
        id: m.id,
        subject,
        from,
        date,
        body
      });

    }

    return NextResponse.json({ count: out.length, messages: out });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || err.toString() }, { status: 500 });
  }
}
