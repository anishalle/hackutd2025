import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI } =
    process.env;

  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REDIRECT_URI) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Missing 'code' in callback URL" },
      { status: 400 },
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REDIRECT_URI,
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.json(
        {
          error:
            "No refresh_token returned. Remove the app from Google Account access and try again with prompt=consent.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Got tokens. Save refresh_token in env.",
      refresh_token: tokens.refresh_token,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
