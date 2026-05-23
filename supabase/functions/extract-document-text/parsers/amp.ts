import { Block, Section } from "../_shared/types.ts";

const AMP_TARGET_HEADERS = [
  "allmän information",
  "projektspecifika kvalitetsmål",
  "projektspecifika miljömål",
  "projektspecifika arbetsmiljömål",
  "arbetsmiljöaspekter",
  "beställarens organisation",
  "entreprenörens organisation",
  "underentreprenörer",
  "kompetens och maskiner/metodik",
  "dokumenthantering och information/kommunikation",
  "möten",
  "mötesschema",
  "inköp",
  "produktion",
  "identifiering av projektets kvalitet-, miljö-, samt arbetsmiljörisker",
  "ordnings och skyddsregler",
  "arbetsberedning",
  "val av byggmaterial och kemiska produkter",
  "förvaring och märkning",
  "nödlägesberedskap",
  "avfallshantering och omhändertagande av farligt avfall",
  "rivning och sanering",
  "buller, damm, vibrationer eller andra störningar",
  "projektdokumentation",
];

function normalizeAmpLine(line: string): string {
  return line.trim().replace(/^\d+(\.\d+)*\.?\s+/, "").toLowerCase();
}

function matchesAmpHeader(line: string): string | null {
  const normalized = normalizeAmpLine(line);
  const normalizedNoSpaces = normalized.replace(/\s+/g, "");
  for (const header of AMP_TARGET_HEADERS) {
    if (normalized === header) return header;
    if (normalized.startsWith(header) && normalized.length - header.length < 10) return header;
    const headerNoSpaces = header.replace(/\s+/g, "");
    if (normalizedNoSpaces === headerNoSpaces) return header;
    if (normalizedNoSpaces.startsWith(headerNoSpaces) && normalizedNoSpaces.length - headerNoSpaces.length < 15) return header;
  }
  return null;
}

function filterRiskRows(content: string[]): string[] {
  const filtered: string[] = [];
  for (const paragraph of content) {
    const lines = paragraph.split("\n");
    const result: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (/\bja\b/i.test(trimmed)) {
        result.push(trimmed);
      } else if (trimmed.length < 80 && !/\bnej\b/i.test(trimmed) && !/\t/.test(trimmed) && !trimmed.includes("  ")) {
        result.push(trimmed);
      }
    }
    if (result.length > 0) {
      filtered.push(result.join("\n"));
    }
  }
  return filtered;
}

function isDocMetadata(line: string): boolean {
  return /^(DOCPROPERTY|PAGE|NUMPAGES|DATE|AUTHOR|TITLE|SUBJECT)\b/i.test(line.trim()) ||
    /^(Sid\.?\s*\d|Sida\s+\d|Page\s+\d)/i.test(line.trim());
}

export function extractArbetsmiljoplan(blocks: Block[]): Section[] {
  const allLines: string[] = [];
  for (const block of blocks) {
    const lines = block.text.split("\n");
    for (const line of lines) {
      allLines.push(line);
    }
    allLines.push("");
  }

  const sections: Section[] = [];
  let currentHeader: string | null = null;
  let currentContent: string[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      currentContent.push(currentParagraph.join("\n").trim());
      currentParagraph = [];
    }
  };

  const flushSection = () => {
    flushParagraph();
    if (currentHeader !== null && currentContent.length > 0) {
      const isRiskSection = currentHeader.includes("identifiering av projektets kvalitet");
      const finalContent = isRiskSection ? filterRiskRows(currentContent) : currentContent;
      const displayTitle = currentHeader.charAt(0).toUpperCase() + currentHeader.slice(1);
      sections.push({ title: displayTitle, content: finalContent });
    }
    currentContent = [];
  };

  for (const line of allLines) {
    if (isDocMetadata(line)) continue;

    const headerMatch = matchesAmpHeader(line);
    if (headerMatch) {
      flushSection();
      currentHeader = headerMatch;
      continue;
    }

    if (currentHeader === null) continue;

    const trimmed = line.trim();
    if (trimmed === "") {
      flushParagraph();
    } else {
      currentParagraph.push(trimmed);
    }
  }
  flushSection();

  const deduped: Section[] = [];
  const seenHeaders = new Map<string, number>();
  for (let i = 0; i < sections.length; i++) {
    const key = sections[i].title.toLowerCase();
    if (seenHeaders.has(key)) {
      deduped[seenHeaders.get(key)!] = sections[i];
    } else {
      seenHeaders.set(key, deduped.length);
      deduped.push(sections[i]);
    }
  }

  const headerOrder = new Map(AMP_TARGET_HEADERS.map((h, i) => [h, i]));
  deduped.sort((a, b) => {
    const aIdx = headerOrder.get(a.title.toLowerCase()) ?? 999;
    const bIdx = headerOrder.get(b.title.toLowerCase()) ?? 999;
    return aIdx - bIdx;
  });

  return deduped;
}
