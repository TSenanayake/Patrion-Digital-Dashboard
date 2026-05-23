import { CategoryResult, DocumentCategory } from "../_shared/types.ts";

export function detectCategoryFromFilename(filename: string): CategoryResult | null {
  const lower = filename.toLowerCase().replace(/[_\-.\s]+/g, " ");

  const rules: { keywords: RegExp; category: DocumentCategory }[] = [
    { keywords: /\b(kma|arbetsmiljöplan|arbetsmiljoplan|amp)\b/, category: "arbetsmiljoplan" },
    { keywords: /\b(ordning|skyddsreg|ordningsreg)\b/, category: "ordningsregler" },
    { keywords: /\b(skyddsorg|säkerhetsorg)\b/, category: "skyddsorganisation" },
    { keywords: /\b(kontakt|telefonlista)\b/, category: "kontaktlista" },
    { keywords: /\b(nödläge|nodlage|nödlage|kris|checklista)\b/, category: "checklista_nodlage" },
    { keywords: /\b(nödsituation|nodsituation|vid\s*nöd|emergency)\b/, category: "nodsituation" },
    { keywords: /\b(apd|arbetsplatsdisposition)\b/, category: "apd_plan" },
  ];

  for (const rule of rules) {
    if (rule.keywords.test(lower)) {
      return { category: rule.category, confidence: "high", method: "filename" };
    }
  }
  return null;
}
