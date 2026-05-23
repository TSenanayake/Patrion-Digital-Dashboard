import { AmpProjectInfo, QualityGoal, EnvironmentAspects, OrgContact, MeetingEntry, WorkRisk } from "../_shared/types.ts";
import { logError } from "../_shared/logging.ts";

const FUNCTION_NAME = "extract-document-text";

export async function extractAmpProjectInfoWithAI(text: string): Promise<AmpProjectInfo | null> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return null;

  const snippet = text.substring(0, 6000);
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You extract structured project information from the "Allmän information" (chapter 2.1) section of a Swedish construction KMA/Arbetsmiljöplan. Return ONLY valid JSON.

Extract these fields:
- projektnamn: Project name
- projektnummer: Project number
- arbetsplats_adress: Workplace address (full address including postal code and city)
- bestallare: Client/customer name (Beställare)
- bestallare_kontakt: Client contact person name if available
- startdatum: Start date (format as YYYY-MM-DD if possible)
- fardigstallande: Completion/end date (format as YYYY-MM-DD if possible)
- entreprenadform: Contract form (e.g. Byggservice, Totalentreprenad)
- projektbeskrivning: Brief project description
- bas_p: Name of BAS-P
- bas_u: Name of BAS-U

Omit fields with no data. Return {} if you can't extract anything.` },
          { role: "user", content: snippet }
        ],
      }),
    });

    if (!response.ok) {
      logError(FUNCTION_NAME, "ai-amp-project-info", new Error(`HTTP ${response.status}`), { status: response.status });
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "{}";
    const jsonStr = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(jsonStr);
    return Object.keys(parsed).length > 0 ? parsed : null;
  } catch (e) {
    logError(FUNCTION_NAME, "ai-amp-project-info", e);
    return null;
  }
}

export async function extractAmpQualityGoalsWithAI(text: string): Promise<QualityGoal[]> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return [];

  const snippet = text.substring(0, 12000);
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You extract quality goals from section "2.4.1 Projektspecifika kvalitetsmål" in a Swedish construction KMA/Arbetsmiljöplan. Return ONLY valid JSON.

Find the table with columns: Nr, Ansvarig, Mål, Egenkontroll/Sign/Datum uppnått mål.
Each row is one goal.

Return:
[
  { "nr": "1", "ansvarig": "JF", "mal": "Minska buller för hg ovan och under", "egenkontroll": "" },
  { "nr": "2", "ansvarig": "", "mal": "", "egenkontroll": "" }
]

Rules:
- If a field is empty or missing, use empty string ""
- "mal" is the goal text and can be multi-line
- "egenkontroll" includes any sign-off or date information
- Only extract from the kvalitetsmål section, not miljömål or arbetsmiljömål
- Return [] if section not found` },
          { role: "user", content: snippet }
        ],
      }),
    });

    if (!response.ok) {
      logError(FUNCTION_NAME, "ai-quality-goals", new Error(`HTTP ${response.status}`), { status: response.status });
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "[]";
    const jsonStr = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(jsonStr);
  } catch (e) {
    logError(FUNCTION_NAME, "ai-quality-goals", e);
    return [];
  }
}

export async function extractAmpEnvironmentGoalsWithAI(text: string): Promise<EnvironmentAspects | null> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return null;

  const snippet = text.substring(0, 12000);
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You extract environment goals from section "2.5 Miljöaspekter" or "Projektspecifika miljömål" in a Swedish construction KMA/Arbetsmiljöplan. Return ONLY valid JSON.

Extract:
1. "description": introductory/explanatory text for this section
2. "goals": array of goals, each with: "mal", "beskrivning", "status" (ja/nej/"")

Return:
{
  "description": "För 2025 har följande miljömål identifierats.",
  "goals": [
    { "mal": "Mängden blandat avfall Max 30 %", "beskrivning": "", "status": "ja" }
  ]
}

Rules:
- Look for Ja/Nej checkboxes for status
- Return null if section not found` },
          { role: "user", content: snippet }
        ],
      }),
    });

    if (!response.ok) {
      logError(FUNCTION_NAME, "ai-environment-goals", new Error(`HTTP ${response.status}`), { status: response.status });
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "null";
    const jsonStr = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.goals && parsed.goals.length > 0) return parsed;
    return null;
  } catch (e) {
    logError(FUNCTION_NAME, "ai-environment-goals", e);
    return null;
  }
}

export async function extractAmpMiljomalWithAI(text: string): Promise<QualityGoal[]> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return [];

  const snippet = text.substring(0, 12000);
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You extract environment goals from section "2.5.1 Projektspecifika Miljömål" in a Swedish construction KMA/Arbetsmiljöplan. Return ONLY valid JSON.

Find the table with columns: Nr, Ansvarig, Mål, Egenkontroll/Sign/Datum uppnått mål.
Each row is one goal.

Return:
[
  { "nr": "1", "ansvarig": "SJ", "mal": "Återbruk av golv plattor", "egenkontroll": "" },
  { "nr": "2", "ansvarig": "", "mal": "", "egenkontroll": "" }
]

Rules:
- Only extract from section 2.5.1, NOT from kvalitetsmål (2.4.1) or arbetsmiljömål (2.6)
- Return [] if section not found` },
          { role: "user", content: snippet }
        ],
      }),
    });

    if (!response.ok) {
      logError(FUNCTION_NAME, "ai-miljomal", new Error(`HTTP ${response.status}`), { status: response.status });
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "[]";
    const jsonStr = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(jsonStr);
  } catch (e) {
    logError(FUNCTION_NAME, "ai-miljomal", e);
    return [];
  }
}

export async function extractAmpArbetsmiljomalWithAI(text: string): Promise<QualityGoal[]> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return [];

  const snippet = text.substring(0, 12000);
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You extract work environment goals from section "2.6 Projektspecifika arbetsmiljömål" in a Swedish construction KMA/Arbetsmiljöplan. Return ONLY valid JSON.

Find the table with columns: Nr, Ansvarig, Mål, Egenkontroll/Sign/Datum uppnått mål.

Return:
[
  { "nr": "1", "ansvarig": "JF", "mal": "Minska buller", "egenkontroll": "" },
  { "nr": "2", "ansvarig": "", "mal": "", "egenkontroll": "" }
]

Rules:
- Only extract from section 2.6, NOT from kvalitetsmål (2.4.1) or miljömål (2.5.1)
- Return [] if section not found` },
          { role: "user", content: snippet }
        ],
      }),
    });

    if (!response.ok) {
      logError(FUNCTION_NAME, "ai-arbetsmiljomal", new Error(`HTTP ${response.status}`), { status: response.status });
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "[]";
    const jsonStr = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(jsonStr);
  } catch (e) {
    logError(FUNCTION_NAME, "ai-arbetsmiljomal", e);
    return [];
  }
}

export async function extractAmpOrganisationWithAI(text: string, sectionName: string): Promise<OrgContact[]> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return [];

  const sectionNameLower = sectionName.toLowerCase();
  const textLower = text.toLowerCase();
  const sectionStart = textLower.indexOf(sectionNameLower);
  let snippet: string;
  if (sectionStart >= 0) {
    const start = Math.max(0, sectionStart - 500);
    snippet = text.substring(start, start + 20000);
  } else {
    snippet = text.substring(0, 20000);
  }
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You extract organisation contacts from section "${sectionName}" in a Swedish construction KMA/Arbetsmiljöplan. Return ONLY valid JSON.

Find the table with columns like: Ansvar i projektet, Namn/mejl, Telefon.
Each row is one contact person.

Return:
[
  { "role": "Ombud", "name": "Patrik Brodén", "company": "", "email": "patrik.broden@newsec.se", "phone": "+46790677366" }
]

Rules:
- "role" is the person's responsibility/title
- "name" is the person's full name
- "company" is their company if mentioned, otherwise ""
- "email" and "phone" as found
- Return [] if section not found` },
          { role: "user", content: snippet }
        ],
      }),
    });

    if (!response.ok) {
      logError(FUNCTION_NAME, `ai-org-${sectionName.toLowerCase().replace(/\s+/g, '-')}`, new Error(`HTTP ${response.status}`), { status: response.status, section: sectionName });
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "[]";
    const jsonStr = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(jsonStr);
  } catch (e) {
    logError(FUNCTION_NAME, `ai-org-${sectionName.toLowerCase().replace(/\s+/g, '-')}`, e, { section: sectionName });
    return [];
  }
}

export async function extractAmpMeetingScheduleWithAI(text: string): Promise<MeetingEntry[]> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return [];

  const sectionNameLower = "mötesschema";
  const textLower = text.toLowerCase();
  const sectionStart = textLower.indexOf(sectionNameLower);
  let snippet: string;
  if (sectionStart >= 0) {
    const start = Math.max(0, sectionStart - 200);
    snippet = text.substring(start, start + 40000);
  } else {
    return [];
  }

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You extract meeting schedule data from section "Mötesschema" in a Swedish construction KMA/Arbetsmiljöplan. Return ONLY valid JSON.

Find the table with columns: Nr, Möte, Eventuella deltagare, Tidpunkt.

Return:
[
  { "nr": "1", "meeting": "Startmöte / Byggmöten", "participants": "B, Ac, Prc, Pc, Al, Pl, Ya", "timing": "Vid start, sedan var 14:e dag" }
]

Rules:
- Return [] if section not found or no meetings found` },
          { role: "user", content: snippet }
        ],
      }),
    });

    if (!response.ok) {
      logError(FUNCTION_NAME, "ai-meeting-schedule", new Error(`HTTP ${response.status}`), { status: response.status });
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "[]";
    const jsonStr = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(jsonStr);
  } catch (e) {
    logError(FUNCTION_NAME, "ai-meeting-schedule", e);
    return [];
  }
}

export async function extractAmpWorkRisksWithAI(text: string): Promise<WorkRisk[]> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return [];

  const textLower = text.toLowerCase();
  const sectionPatterns = ["identifiering av projektets kvalitet", "identifiering av projektets", "arbetsmiljörisker", "8.1"];
  let sectionStart = -1;
  for (const pat of sectionPatterns) {
    const idx = textLower.indexOf(pat);
    if (idx >= 0) { sectionStart = idx; break; }
  }
  if (sectionStart < 0) return [];

  const start = Math.max(0, sectionStart - 200);
  const snippet = text.substring(start, start + 40000);

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You extract work environment risks (Arbetsmiljörisker) from a Swedish construction KMA/Arbetsmiljöplan. Return ONLY valid JSON.

The text contains a table with columns: Nr, Arbetsmiljörisk, Ja, Nej, Åtgärd.
CRITICAL RULE: Only include rows where "Ja" column has an "x" or similar mark.

Return format:
[
  { "nr": "12", "description": "Arbete på last- eller område med passerande fordonstrafik" }
]

Rules:
- Only include risks where Ja column has x/X/✓/✔
- Return [] if no risks marked with Ja` },
          { role: "user", content: snippet }
        ],
      }),
    });

    if (!response.ok) {
      logError(FUNCTION_NAME, "ai-work-risk", new Error(`HTTP ${response.status}`), { status: response.status });
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "[]";
    const jsonStr = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(jsonStr);
  } catch (e) {
    logError(FUNCTION_NAME, "ai-work-risk", e);
    return [];
  }
}
