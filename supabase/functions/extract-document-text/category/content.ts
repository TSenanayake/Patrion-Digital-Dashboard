import { CategoryResult, DocumentCategory } from "../_shared/types.ts";

export function detectCategoryFromContent(text: string): CategoryResult | null {
  const lower = text.toLowerCase();
  const first2000 = lower.substring(0, 2000);

  const scores: Record<DocumentCategory, number> = {
    arbetsmiljoplan: 0,
    ordningsregler: 0,
    skyddsorganisation: 0,
    kontaktlista: 0,
    checklista_nodlage: 0,
    nodsituation: 0,
    apd_plan: 0,
    ovrigt: 0,
  };

  const ampAnchors = [
    "allmän information", "riskidentifiering",
    "nödlägesberedskap", "avfallshantering", "arbetsberedning",
    "projektspecifika kvalitetsmål", "projektspecifika miljömål",
    "projektspecifika arbetsmiljömål", "beställarens organisation",
    "entreprenörens organisation", "underentreprenörer",
    "kompetens och maskiner", "dokumenthantering", "rivning och sanering",
    "buller", "vibration", "damm", "projektdokumentation",
  ];
  for (const anchor of ampAnchors) {
    if (lower.includes(anchor)) scores.arbetsmiljoplan += 2;
  }
  if (/arbetsmiljöplan/i.test(first2000)) scores.arbetsmiljoplan += 5;

  const ordAnchors = [
    "id06", "personlig skyddsutrustning", "heta arbeten",
    "kvartsdamm", "buller", "avfall", "arbetstid",
    "ordnings- och skyddsregler", "ordningsregler",
    "skyddsregler", "allmänna regler",
  ];
  for (const anchor of ordAnchors) {
    if (lower.includes(anchor)) scores.ordningsregler += 2;
  }

  const skyddsAnchors = [
    "larmnummer", "bas-u", "bas-p", "skyddsombud",
    "arbetsledning", "brandskyddsansvarig", "elsäkerhetsansvarig",
    "tillståndsansvarig", "arbetsmiljöverket",
  ];
  for (const anchor of skyddsAnchors) {
    if (lower.includes(anchor)) scores.skyddsorganisation += 3;
  }

  const phoneRegex = /(?:\+?\d[\d\s\-()]{6,17}\d)/g;
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const phones = (text.match(phoneRegex) || []).length;
  const emails = (text.match(emailRegex) || []).length;
  const lines = text.split("\n").filter(l => l.trim()).length;
  if (phones >= 5 && (phones + emails) / lines > 0.15) scores.kontaktlista += 10;
  if (/\b(roll|företag|namn|mobil|telefon|e-post)\b/i.test(first2000)) {
    const colCount = ["roll", "företag", "namn", "mobil", "telefon", "e-post"]
      .filter(c => lower.includes(c)).length;
    if (colCount >= 3) scores.kontaktlista += 5;
  }

  const nodAnchors = ["kris", "åtgärd", "larma 112", "nödläge", "utrymning", "brandlarm"];
  for (const anchor of nodAnchors) {
    if (lower.includes(anchor)) scores.checklista_nodlage += 2;
  }
  if (/checklista/i.test(first2000) && /nödläge|kris|brand/i.test(first2000)) {
    scores.checklista_nodlage += 5;
  }

  const nodSitAnchors = ["vid nödsituation", "ring 112", "ansvarig på arbetsplatsen", "arbetsplatsens adress", "ange"];
  for (const anchor of nodSitAnchors) {
    if (lower.includes(anchor)) scores.nodsituation += 3;
  }
  if (/vid\s+nödsituation/i.test(first2000) && /ring\s+112/i.test(first2000)) {
    scores.nodsituation += 5;
  }
  if (/bas[\s-]?u/i.test(first2000) && /nödsituation|nöd/i.test(first2000)) {
    scores.nodsituation += 3;
  }

  if (/apd[\s-]?plan/i.test(first2000)) scores.apd_plan += 8;
  if (/arbetsplatsdisposition/i.test(first2000)) scores.apd_plan += 8;
  if (/samlingsplats|utrymningsväg/i.test(lower)) scores.apd_plan += 2;

  const sorted = Object.entries(scores)
    .filter(([k]) => k !== "ovrigt")
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0 || sorted[0][1] < 4) return null;

  const best = sorted[0];
  const second = sorted[1];
  const margin = second ? best[1] - second[1] : best[1];

  const confidence = best[1] >= 8 && margin >= 4 ? "high" : best[1] >= 4 ? "medium" : "low";

  return { category: best[0] as DocumentCategory, confidence, method: "content" };
}
