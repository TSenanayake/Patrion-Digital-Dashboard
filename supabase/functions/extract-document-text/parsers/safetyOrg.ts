import { Block, Section, SafetyOrgData, Contact } from "../_shared/types.ts";
import { extractContacts } from "./contactList.ts";
import { buildSections } from "../section.ts";
import { logError } from "../_shared/logging.ts";

const FUNCTION_NAME = "extract-document-text";

function extractForstaHjalpenHeuristic(text: string): { name?: string; company?: string; phone?: string }[] {
  const result: { name?: string; company?: string; phone?: string }[] = [];
  const upper = text.toUpperCase();
  const startIdx = upper.search(/FÖRSTA\s*HJÄLPEN/);
  if (startIdx < 0) return result;
  const after = text.substring(startIdx);
  const headingRegex = /\n\s*(ANDRA\s+VIKTIGA|VIKTIGA\s+TELEFON|MYNDIGHETER|ÖVRIGA|SKYDDSOMBUD|ARBETSLEDNING|BYGGHERRE|FÖRETAG|ARBETSSTÄLLE|GUIDANCE|INFORMATION)/i;
  const m = after.search(headingRegex);
  const block = m > 0 ? after.substring(0, m) : after.substring(0, 600);
  const lines = block.split(/\r?\n/).slice(1).map(l => l.trim()).filter(Boolean);
  const skipLine = (l: string) =>
    /^(PÅ\s+ARBETSPLATSEN|KRISBEREDSKAP|OLYCKOR|UTBILDADE)/i.test(l) ||
    l === ":" || l === "," || l.length < 2;
  const phoneRegex = /(\+?\d[\d\s\-]{6,}\d)/;
  let pendingCompany = "";
  for (const raw of lines) {
    if (skipLine(raw)) continue;
    let line = raw.replace(/^[,;:\-•·]+\s*/, "").trim();
    if (!line) continue;
    const phoneMatch = line.match(phoneRegex);
    const phone = phoneMatch ? phoneMatch[1].trim() : undefined;
    const withoutPhone = phone ? line.replace(phone, "").replace(/[,;:\-]+\s*$/, "").trim() : line;
    const isLikelyName = /^[A-ZÅÄÖ][a-zåäöé]+(?:\s+[A-ZÅÄÖ][a-zåäöé\-]+){1,3}$/.test(withoutPhone);
    const looksLikeCompany = /\b(AB|HB|KB|Service|Bygg|Entreprenad|Konsult|Group|Förvaltning|Fastighet)\b/i.test(withoutPhone);
    if (isLikelyName && !looksLikeCompany) {
      result.push({ name: withoutPhone, company: pendingCompany || undefined, phone });
      pendingCompany = "";
    } else if (withoutPhone.length > 1 && withoutPhone.length < 60) {
      pendingCompany = withoutPhone;
    }
  }
  return result;
}

export async function extractSkyddsorganisationWithAI(text: string): Promise<SafetyOrgData> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return {};

  const snippet = text.substring(0, 8000);
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
            content: `You extract structured safety organization data from Swedish construction documents. Return ONLY valid JSON.

CRITICAL RULES:
- Map each role to the CORRECT name and phone by proximity in the text
- Phone numbers near a role label belong to THAT role
- Common roles: Platschef, Arbetsledare, BAS-P, BAS-U, Skyddsombud, Brandskyddsansvarig, Tillstånd heta arbeten, Elsäkerhetsansvarig
- "FÖRSTA HJÄLPEN-UTBILDADE" / "Första hjälpen utbildade på arbetsplatsen" lists people trained in first aid. Extract ALL names listed there into "forsta_hjalpen" with their company if mentioned. Do NOT skip this section.
- Remove document metadata (version rows, dates, signatures, file paths)
- Include the guidance text about "Arbetstagaren skall i första hand..." if present

Return this JSON structure:
{
  "larmnummer": "112",
  "company": { "name": "...", "address": "...", "phone": "...", "email": "...", "website": "..." },
  "arbetsplats": { "address": "..." },
  "byggherre": { "name": "...", "address": "..." },
  "arbetsledning": [
    { "role": "Platschef", "name": "...", "phone": "..." },
    { "role": "Arbetsledare", "name": "...", "phone": "..." },
    { "role": "BAS-P", "name": "...", "phone": "..." },
    { "role": "BAS-U", "name": "...", "phone": "..." }
  ],
  "skyddsombud": [{ "role": "Skyddsombud", "name": "...", "phone": "..." }],
  "ovriga_kontakter": [
    { "role": "Brandskyddsansvarig", "name": "...", "phone": "..." },
    { "role": "Tillstånd heta arbeten", "name": "...", "phone": "..." },
    { "role": "Elsäkerhetsansvarig", "name": "...", "phone": "..." }
  ],
  "forsta_hjalpen": [
    { "name": "...", "company": "...", "phone": "..." }
  ],
  "myndigheter": [
    { "label": "Arbetsmiljöverket", "phone": "..." },
    { "label": "Arbetsmiljöverket jourtelefon", "phone": "..." },
    { "label": "Polisen", "phone": "..." }
  ],
  "guidance_text": "Arbetstagaren skall i första hand..."
}

Omit fields with no data. Return {} if you can't extract anything.`
          },
          { role: "user", content: snippet }
        ],
      }),
    });

    if (!response.ok) {
      logError(FUNCTION_NAME, "ai-safety-org", new Error(`HTTP ${response.status}`), { status: response.status });
      return {};
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "{}";
    const jsonStr = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(jsonStr);
  } catch (e) {
    logError(FUNCTION_NAME, "ai-safety-org", e);
    return {};
  }
}

export function extractSkyddsorganisation(blocks: Block[]): { sections: Section[]; contacts: Contact[] } {
  const contacts = extractContacts(blocks);
  const { sections } = buildSections(blocks);
  return { sections, contacts };
}

export function extractForstaHjalpenHeuristicPublic(text: string): { name?: string; company?: string; phone?: string }[] {
  return extractForstaHjalpenHeuristic(text);
}
