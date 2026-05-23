export interface SwedishNoisePattern {
  pattern: RegExp;
  reason: string;
}

export const SWEDISH_NOISE_PATTERNS: SwedishNoisePattern[] = [
  { pattern: /Observera att/i, reason: "Meta-commentary, not actual content" },
  { pattern: /Notera att/i, reason: "Meta-commentary, not actual content" },
  { pattern: /8\.12/i, reason: "Section number reference, not content" },
  { pattern: /8\.13/i, reason: "Section number reference, not content" },
  { pattern: /8\.14/i, reason: "Section number reference, not content" },
  { pattern: /avvikelsehantering/i, reason: "Deviation handling section, boilerplate" },
  { pattern: /interna avvikelser/i, reason: "Internal deviations section" },
  { pattern: /ia-systemet/i, reason: "IA system reference, not content" },
  { pattern: /ändring-, tilläggs-/i, reason: "Change/addition reference, not content" },
  { pattern: /ändrings-, tilläggs-/i, reason: "Change/addition reference, not content" },
  { pattern: /äta-rapporten/i, reason: "ÄTA report reference" },
  { pattern: /ekonomi faktureras/i, reason: "Billing reference, not content" },
  { pattern: /avgående arbeten/i, reason: " departing works reference" },
  { pattern: /platsansvarig\/projektansvarig noterar/i, reason: "Responsibility note, not content" },
  { pattern: /tidplan regleras och godkänns/i, reason: "Schedule regulation note" },
  { pattern: /stämplas i byggmötesprotokoll/i, reason: "Meeting protocol note" },
  { pattern: /åtgärden genomförs/i, reason: "Action implementation note" },
  { pattern: /när en intern avvikelse/i, reason: "Internal deviation clause" },
  { pattern: /erfarenhetsträffar och ledningens/i, reason: "Experience/tracking note" },
  { pattern: /alltid godkännas av beställaren/i, reason: "Approval requirement, not content" },
  { pattern: /kompetens och maskiner/i, reason: "Competence and machinery header, shown separately" },
  { pattern: /samtliga på arbetsplatsen ska ha/i, reason: "General requirement, not specific content" },
  { pattern: /erforderlig utbildning och kompetens/i, reason: "Training requirement clause" },
  { pattern: /utbildning- och kompetensplan/i, reason: "Training plan reference" },
  { pattern: /kvalitetskritiska moment skapas en arbetsberedning/i, reason: "Quality critical moment reference" },
  { pattern: /kompetens på personal som ska utföra/i, reason: "Staff competence clause" },
  { pattern: /arbetsberedningen tar även upp vilka maskiner/i, reason: "Work preparation reference" },
  { pattern: /överlämnande och besiktning/i, reason: "Transfer and inspection reference" },
  { pattern: /besiktningar, försyn och slutkontroll/i, reason: "Inspection reference" },
  { pattern: /besiktningsplan upprättas/i, reason: "Inspection plan reference" },
  { pattern: /9\.1 besiktning/i, reason: "Inspection section reference" },
  { pattern: /9\.3 erfarenhets/i, reason: "Experience transfer section reference" },
  { pattern: /erfarenhetsåterföring/i, reason: "Experience transfer reference" },
  { pattern: /erfarenhetsaterf/i, reason: "Experience transfer abbreviation" },
  { pattern: /9\.3 erfarenhetsåterföring/i, reason: "Experience transfer section reference" },
  { pattern: /erfarenhetsåterföring görs på utvalda/i, reason: "Experience transfer note" },
  { pattern: /produktion/i, reason: "Production section, not content for this context" },
  { pattern: /ordning/i, reason: "Order section, not content for this context" },
] as const;

export const isSwedishNoise = (text: string): boolean => {
  return SWEDISH_NOISE_PATTERNS.some(({ pattern }) => pattern.test(text));
};

export const filterSwedishNoise = (lines: string[]): string[] => {
  return lines.filter(line => !isSwedishNoise(line));
};
