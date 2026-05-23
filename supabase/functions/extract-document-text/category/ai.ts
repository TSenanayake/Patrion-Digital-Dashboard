import { CategoryResult, DocumentCategory } from "../_shared/types.ts";
import { logError } from "../_shared/logging.ts";
import { detectCategoryFromFilename } from "./filename.ts";
import { detectCategoryFromContent } from "./content.ts";

const FUNCTION_NAME = "extract-document-text";

export async function classifyWithAI(text: string, filename: string): Promise<CategoryResult> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return { category: "ovrigt", confidence: "low", method: "fallback" };
  }

  const snippet = text.substring(0, 3000);
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You classify Swedish construction project documents. Return ONLY the category name, nothing else.
Categories:
- arbetsmiljoplan (Arbetsmiljöplan/KMA)
- ordningsregler (Ordnings- och skyddsregler)
- skyddsorganisation (Skyddsorganisation med larmnummer, BAS-U/P)
- kontaktlista (Kontaktlista med telefon/email)
- checklista_nodlage (Checklista nödläge/kriser)
- nodsituation (Nödsituation/emergency instruction with 112, checklist, BAS-U)
- apd_plan (APD-plan/arbetsplatsdisposition)
- ovrigt (anything else)`
          },
          {
            role: "user",
            content: `Filename: ${filename}\n\nContent:\n${snippet}`
          }
        ],
      }),
    });

    if (!response.ok) {
      logError(FUNCTION_NAME, "ai-classification", new Error(`HTTP ${response.status}`), { status: response.status });
      return { category: "ovrigt", confidence: "low", method: "fallback" };
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim().toLowerCase() || "";
    const validCategories: DocumentCategory[] = [
      "arbetsmiljoplan", "ordningsregler", "skyddsorganisation",
      "kontaktlista", "checklista_nodlage", "nodsituation", "apd_plan", "ovrigt"
    ];

    if (validCategories.includes(result as DocumentCategory)) {
      return { category: result as DocumentCategory, confidence: "medium", method: "ai" };
    }
    for (const cat of validCategories) {
      if (result.includes(cat)) {
        return { category: cat, confidence: "medium", method: "ai" };
      }
    }
  } catch (e) {
    logError(FUNCTION_NAME, "ai-classification", e);
    return { category: "ovrigt", confidence: "low", method: "fallback" };
  }

  return { category: "ovrigt", confidence: "low", method: "fallback" };
}

export async function detectCategory(text: string, filename: string): Promise<CategoryResult> {
  const filenameResult = detectCategoryFromFilename(filename);
  if (filenameResult && filenameResult.confidence === "high") return filenameResult;

  const contentResult = detectCategoryFromContent(text);
  if (contentResult && contentResult.confidence === "high") return contentResult;

  if (filenameResult && contentResult && filenameResult.category === contentResult.category) {
    return { ...contentResult, confidence: "high" };
  }
  if (contentResult && contentResult.confidence === "medium") return contentResult;
  if (filenameResult) return filenameResult;

  return await classifyWithAI(text, filename);
}
