import { EmergencyData } from "../_shared/types.ts";
import { logError } from "../_shared/logging.ts";

const FUNCTION_NAME = "extract-document-text";

export async function extractEmergencyWithAI(text: string): Promise<EmergencyData> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return {};

  const snippet = text.substring(0, 6000);
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You extract emergency instruction data from Swedish construction site documents. Return ONLY valid JSON.

Extract:
1. emergency_number: usually "112"
2. checklist: bullet points about what to say when calling (e.g. "Ditt namn och telefonnummer", "Olycksplatsens läge och adress", etc.)
3. workplace_address: the site address
4. responsible_person: the BAS-U or site responsible person with role, name, phone
5. additional_contacts: any other contacts mentioned

Return this JSON:
{
  "emergency_number": "112",
  "checklist": ["Ditt namn och telefonnummer", "Olycksplatsens läge och adress", ...],
  "workplace_address": "...",
  "responsible_person": { "role": "Ansvarig BAS-U", "name": "...", "phone": "..." },
  "additional_contacts": [{ "role": "...", "name": "...", "phone": "..." }]
}

Remove document metadata, duplicate blocks, layout artifacts. Omit empty fields. Return {} if nothing extractable.`
          },
          { role: "user", content: snippet }
        ],
      }),
    });

    if (!response.ok) {
      logError(FUNCTION_NAME, "ai-emergency", new Error(`HTTP ${response.status}`), { status: response.status });
      return {};
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "{}";
    const jsonStr = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(jsonStr);
  } catch (e) {
    logError(FUNCTION_NAME, "ai-emergency", e);
    return {};
  }
}
