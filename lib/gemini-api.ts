const GEMINI_API_KEY = "AIzaSyDHaRpisf4CSw-wGtl9gsvSRfMdHf1PalA";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

export interface DeviceContext {
  name: string;
  category: string;
  specifications?: string;
  commonIssues?: string[];
  installationNotes?: string;
}

export async function askGemini(
  question: string,
  deviceContext: DeviceContext
): Promise<string> {
  const systemPrompt = `You are an expert data center technician assistant. You're helping technicians understand and work with data center equipment.

Current Device Context:
- Device: ${deviceContext.name}
- Category: ${deviceContext.category}
${deviceContext.specifications ? `- Specifications: ${deviceContext.specifications}` : ""}
${deviceContext.commonIssues ? `- Common Issues: ${deviceContext.commonIssues.join(", ")}` : ""}
${deviceContext.installationNotes ? `- Installation Notes: ${deviceContext.installationNotes}` : ""}

Provide clear, concise, and practical answers that a field technician can use immediately. Focus on safety, proper procedures, and troubleshooting steps. Keep responses under 200 words unless more detail is specifically requested.`;

  const fullPrompt = `${systemPrompt}\n\nTechnician Question: ${question}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const generatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate a response. Please try again.";

    return generatedText;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

