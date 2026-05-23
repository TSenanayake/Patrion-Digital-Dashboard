import { Section, DocumentCategory } from "../_shared/types.ts";

export function calculateConfidence(sections: Section[], removedNoiseCount: number, totalLines: number, category: DocumentCategory): "high" | "medium" | "low" {
  if (category === "apd_plan") return "low";

  let score = 0;
  const titledSections = sections.filter(s => s.title !== "");
  const titledRatio = sections.length > 0 ? titledSections.length / sections.length : 0;
  if (titledRatio >= 0.6) score += 3;
  else if (titledRatio >= 0.3) score += 1;

  if (sections.length >= 5) score += 2;
  else if (sections.length >= 3) score += 1;

  const noiseRatio = totalLines > 0 ? removedNoiseCount / totalLines : 0;
  if (noiseRatio < 0.1) score += 2;
  else if (noiseRatio < 0.25) score += 1;

  const totalContent = sections.reduce((sum, s) => sum + s.content.join(" ").length, 0);
  if (totalContent > 500) score += 1;

  if (score >= 6) return "high";
  if (score >= 3) return "medium";
  return "low";
}

export function sectionsToMobileHtml(sections: Section[]): string {
  const escapeHtml = (text: string): string =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const parts: string[] = [];
  for (const section of sections) {
    if (section.title) {
      const isAllCaps = section.title === section.title.toUpperCase();
      const tag = isAllCaps ? "h2" : "h3";
      parts.push(`<${tag}>${escapeHtml(section.title)}</${tag}>`);
    }
    for (const paragraph of section.content) {
      const lines = paragraph.split("\n");
      const listItems = lines.filter(l => /^\s*[-•*]\s+/.test(l) || /^\s*\d+[.)]\s+/.test(l));
      if (listItems.length > lines.length * 0.5 && listItems.length >= 2) {
        const isOrdered = listItems.every(l => /^\s*\d+[.)]\s+/.test(l));
        const tag = isOrdered ? "ol" : "ul";
        parts.push(`<${tag}>${lines.map(l => {
          const cleaned = l.replace(/^\s*[-•*]\s+/, "").replace(/^\s*\d+[.)]\s+/, "");
          return `<li>${escapeHtml(cleaned)}</li>`;
        }).join("")}</${tag}>`);
      } else {
        parts.push(`<p>${escapeHtml(paragraph.replace(/\n/g, " ").replace(/\s+/g, " ").trim())}</p>`);
      }
    }
  }
  return parts.join("");
}
