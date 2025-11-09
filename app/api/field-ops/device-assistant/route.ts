import { NextResponse, type NextRequest } from "next/server";

import type { DeviceContext } from "@/lib/gemini-api";

const DEFAULT_MODEL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

export async function POST(request: NextRequest) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      question?: string;
      device?: DeviceContext;
    };

    if (!body?.question || !body?.device) {
      return NextResponse.json(
        { error: "Question and device context are required" },
        { status: 400 },
      );
    }

    const systemPrompt = buildPrompt(body.question, body.device);

    const resp = await fetch(
      `${process.env.GEMINI_API_URL ?? DEFAULT_MODEL}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      },
    );

    if (!resp.ok) {
      const error = await resp.json().catch(() => ({}));
      console.error("Gemini API error", error);
      return NextResponse.json(
        {
          error:
            error?.error?.message ||
            `Gemini API request failed (${resp.status})`,
        },
        { status: 502 },
      );
    }

    const data = await resp.json();
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I could not generate a response. Please try again.";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Device assistant error", error);
    return NextResponse.json(
      { error: "Failed to contact AI assistant" },
      { status: 500 },
    );
  }
}

function buildPrompt(question: string, device: DeviceContext) {
  return `You are an expert data center technician assistant helping with installation, troubleshooting, and best practices.

Current device context:
- Device: ${device.name}
- Category: ${device.category}
${device.specifications ? `- Specifications: ${device.specifications}` : ""}
${device.commonIssues ? `- Common issues: ${device.commonIssues.join(", ")}` : ""}
${device.installationNotes ? `- Installation notes: ${device.installationNotes}` : ""}

Technician question: ${question}

Provide clear, concise, and practical guidance (max ~200 words) with emphasis on safety and step-by-step actions.`;
}
