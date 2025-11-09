import { NextResponse } from "next/server";
import { google } from "googleapis";
import type { gmail_v1 } from "googleapis";

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

export async function GET() {
  const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
  const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
  const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;
  const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
  const OAUTH_USER = process.env.GMAIL_OAUTH_USER || "me";

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !REFRESH_TOKEN) {
    return NextResponse.json(
      { error: "Missing Gmail credentials" },
      { status: 500 },
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
  );
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const listRes = await gmail.users.messages.list({
      userId: OAUTH_USER,
      q: "is:unread",
      maxResults: 50,
    });

    const messages = listRes.data.messages || [];
    const out: Array<{ id?: string; subject: string; from: string; date: string; body: string }> =
      [];

    for (const m of messages) {
      if (!m.id) continue;
      const full = await gmail.users.messages.get({
        userId: OAUTH_USER,
        id: m.id,
        format: "full",
      });

      const headers = full.data.payload?.headers || [];
      const subject =
        headers.find((h) => h.name === "Subject")?.value || "(no subject)";
      const from = headers.find((h) => h.name === "From")?.value || "";
      const date = headers.find((h) => h.name === "Date")?.value || "";
      const body = getPlainBody(full.data.payload);

      out.push({ id: m.id, subject, from, date, body });
    }

    return NextResponse.json({ count: out.length, messages: out });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
