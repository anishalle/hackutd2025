export interface DeviceContext {
  name: string;
  category: string;
  specifications?: string;
  commonIssues?: string[];
  installationNotes?: string;
}

export type DeviceAssistantPayload = {
  question: string;
  device: DeviceContext;
};

export async function askDeviceAssistant(
  question: string,
  device: DeviceContext,
): Promise<string> {
  const response = await fetch("/api/field-ops/device-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, device }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || "Failed to fetch AI response");
  }

  const data = (await response.json()) as { answer: string };
  return data.answer;
}
