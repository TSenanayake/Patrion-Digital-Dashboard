import { Block, Section, CrisisActionData } from "../_shared/types.ts";
import { buildSections } from "../section.ts";
import { logError } from "../_shared/logging.ts";

const FUNCTION_NAME = "extract-document-text";

export function extractChecklistaNodlage(blocks: Block[]): Section[] {
  const allText = blocks.map(b => b.text).join("\n");
  const lines = allText.split("\n").map(l => l.trim()).filter(Boolean);

  const crisisActions: Section[] = [];
  let currentCrisis = "";
  let currentActions: string[] = [];

  for (const line of lines) {
    const isCrisisHeading = line.length < 60 && !line.endsWith(".") &&
      (line.toUpperCase() === line || /^(brand|olycka|hot|väder|dödsfall|personskada|gasutsläpp|ras|el|översvämning|storm|explosion|fallolycka|klämskada|elutrustning)/i.test(line));

    if (isCrisisHeading) {
      if (currentCrisis && currentActions.length > 0) {
        crisisActions.push({ title: currentCrisis, content: currentActions });
      }
      currentCrisis = line;
      currentActions = [];
    } else if (currentCrisis) {
      currentActions.push(line);
    }
  }
  if (currentCrisis && currentActions.length > 0) {
    crisisActions.push({ title: currentCrisis, content: currentActions });
  }

  if (crisisActions.length >= 2) return crisisActions;

  const { sections } = buildSections(blocks);
  return sections;
}

export async function extractChecklistaNodlageWithAI(text: string): Promise<CrisisActionData[]> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return [];

  const snippet = text.substring(0, 10000);
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
            content: `You extract crisis/action pairs from Swedish construction emergency checklists. Return ONLY valid JSON.

RULES:
1. Find the table with columns "Kriser" (left) and "Åtgärd" (right)
2. Each row = one crisis with its actions
3. Crisis titles are short phrases in the left column. Multi-line titles should be joined with " / " (e.g. "Hot / Våld / Konflikt")
4. Actions are paragraphs/bullets in the right column for that row
5. Preserve bullet lists as separate action items
6. STOP parsing when you encounter metadata like: "Platschef/Närmaste chef", "Projektchef", "HR", "VD", "Tidpunkt", "Signatur", "Dokumentnamn", "Version", "Sökväg"

Return:
[
  { "crisis_title": "Brand", "actions": ["Larma - Ring 112", "Påbörja utrymning", "Samlas vid samlingsplats"] },
  { "crisis_title": "Fallolycka", "actions": ["Larma - Ring 112", "Ge nödvändig första hjälp", "Säkra arbetsplatsen"] }
]

Return [] if nothing extractable.`
          },
          { role: "user", content: snippet }
        ],
      }),
    });

    if (!response.ok) {
      logError(FUNCTION_NAME, "ai-crisis-checklist", new Error(`HTTP ${response.status}`), { status: response.status });
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "[]";
    const jsonStr = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(jsonStr);
  } catch (e) {
    logError(FUNCTION_NAME, "ai-crisis-checklist", e);
    return [];
  }
}
