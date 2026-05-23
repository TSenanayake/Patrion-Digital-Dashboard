import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import EnvironmentGoalsCards from "@/components/project/EnvironmentGoalsCards";
import QualityGoalsCards from "@/components/project/QualityGoalsCards";
import WorkRiskCards from "@/components/project/WorkRiskCards";
import OrganisationCards from "@/components/project/OrganisationCards";
import MeetingScheduleCards from "@/components/project/MeetingScheduleCards";
import WasteManagementCards from "@/components/project/WasteManagementCards";
import ChemicalProductCards from "@/components/project/ChemicalProductCards";
import ProjectInfoCard from "@/components/project/ProjectInfoCard";
import { SWEDISH_NOISE_PATTERNS } from "./excludePatterns";
import type { SmartViewData, SmartViewSection } from "./types";

interface AmpRendererProps {
  data: SmartViewData;
  searchTerm: string;
  highlightText: (text: string) => React.ReactNode;
  chemicalProducts?: { id: string; product_name?: string; hazard_symbol?: string; risk_phrase?: string }[];
}

export function AmpRenderer({ data, searchTerm, highlightText, chemicalProducts = [] }: AmpRendererProps) {
  const { sections } = data;
  const qualityGoals = data.quality_goals;
  const environmentGoals = data.environment_goals;
  const miljomalGoals = data.miljomal_goals;
  const arbetsmiljomalGoals = data.arbetsmiljomal_goals;
  const bestallareOrg = data.bestallare_org;
  const entreprenorOrg = data.entreprenor_org;
  const underentreprenorOrg = data.underentreprenor_org;
  const meetingSchedule = data.meeting_schedule;
  const workRisks = data.work_risks;
  const projectInfo = data.project_info;

  const sectionTitlesLower = sections.map(s => s.title.toLowerCase());
  const hasMiljoaspekterSection = sectionTitlesLower.some(t => t.includes("miljöaspekter") && !t.includes("arbetsmiljöaspekter"));
  const hasProjektMiljomalSection = sectionTitlesLower.some(t => t.includes("miljömål") && !t.includes("arbetsmiljömål"));
  const hasArbetsmiljomalSection = sectionTitlesLower.some(t => t.includes("arbetsmiljömål") || t.includes("arbetsmiljöaspekter"));
  const hasProjektArbetsmiljomalSection = sectionTitlesLower.some(t => t.includes("arbetsmiljömål"));

  return (
    <Accordion type="multiple" className="w-full">
      {sections.map((section, i) => {
        const titleLower = section.title.toLowerCase();
        const isAllmanInfo = titleLower.includes("allmän information");
        const isKvalitetsmal = titleLower.includes("kvalitetsmål");
        const isArbetsmiljoaspekter = titleLower.includes("arbetsmiljöaspekter") || (titleLower.includes("arbetsmiljömål") && !titleLower.includes("miljömål"));
        const isProjektMiljomal = titleLower.includes("miljömål") && !titleLower.includes("arbetsmiljömål") && !titleLower.includes("miljöaspekter");
        const isBestallareOrg = titleLower.includes("beställarens organisation");
        const isEntreprenorOrg = titleLower.includes("entreprenörens organisation");
        const isUnderentreprenorer = titleLower.includes("underentreprenör");
        const isMiljoaspekter = titleLower.includes("miljöaspekter") && !titleLower.includes("arbetsmiljöaspekter");
        const isMotesschema = titleLower.includes("mötesschema");
        const isRiskIdentifiering = titleLower.includes("riskidentifiering") || titleLower.includes("arbetsmiljörisker") || titleLower.includes("identifiering av projektets");
        const isByggmaterialKemiska = titleLower.includes("byggmaterial") || titleLower.includes("kemiska produkter");
        const isAvfallshantering = titleLower.includes("avfallshantering");
        const isBullerDamm = titleLower.includes("buller") || titleLower.includes("vibration") || titleLower.includes("störningar");
        const isKompetens = titleLower.includes("kompetens");

        if (titleLower.includes("produktion")) return null;
        if (titleLower.includes("ordning")) return null;
        if (titleLower.includes("avvikelsehantering") || titleLower.includes("8.12")) return null;
        if (titleLower.includes("ändring") && titleLower.includes("tillägg") || titleLower.includes("8.13")) return null;
        if (isKompetens) return null;

        const injectAfterThis: React.ReactNode[] = [];

        if (isKvalitetsmal) {
          if (!hasMiljoaspekterSection && environmentGoals) {
            injectAfterThis.push(
              <AccordionItem key="inject-miljoaspekter" value="section-miljoaspekter">
                <AccordionTrigger className="text-left text-sm font-semibold">Miljöaspekter</AccordionTrigger>
                <AccordionContent><EnvironmentGoalsCards data={environmentGoals} /></AccordionContent>
              </AccordionItem>
            );
          }
          if (!hasProjektMiljomalSection && miljomalGoals?.length > 0) {
            injectAfterThis.push(
              <AccordionItem key="inject-miljomal" value="section-projektmiljomal">
                <AccordionTrigger className="text-left text-sm font-semibold">Projektspecifika miljömål</AccordionTrigger>
                <AccordionContent><QualityGoalsCards goals={miljomalGoals} /></AccordionContent>
              </AccordionItem>
            );
          }
        }

        if (isMiljoaspekter && !hasProjektMiljomalSection && miljomalGoals?.length > 0) {
          injectAfterThis.push(
            <AccordionItem key="inject-miljomal" value="section-projektmiljomal">
              <AccordionTrigger className="text-left text-sm font-semibold">Projektspecifika miljömål</AccordionTrigger>
              <AccordionContent><QualityGoalsCards goals={miljomalGoals} /></AccordionContent>
            </AccordionItem>
          );
        }

        if (isArbetsmiljoaspekter && !hasProjektArbetsmiljomalSection && arbetsmiljomalGoals?.length > 0) {
          injectAfterThis.push(
            <AccordionItem key="inject-arbetsmiljomal" value="section-projektarbetsmiljomal">
              <AccordionTrigger className="text-left text-sm font-semibold">Projektspecifika arbetsmiljömål</AccordionTrigger>
              <AccordionContent><QualityGoalsCards goals={arbetsmiljomalGoals} /></AccordionContent>
            </AccordionItem>
          );
        }

        if (isArbetsmiljoaspekter && workRisks) {
          injectAfterThis.push(
            <AccordionItem key="inject-work-risks" value="section-work-risks">
              <AccordionTrigger className="text-left text-sm font-semibold">Risker</AccordionTrigger>
              <AccordionContent><WorkRiskCards risks={workRisks} searchTerm={searchTerm} /></AccordionContent>
            </AccordionItem>
          );
        }

        if (isBullerDamm) {
          const kompetensSection = sections.find(s => s.title.toLowerCase().includes("kompetens"));
          const kompetensContent = kompetensSection?.content || [];
          if (kompetensContent.length > 0) {
            injectAfterThis.push(
              <AccordionItem key="inject-kompetens" value="section-kompetens">
                <AccordionTrigger className="text-left text-sm font-semibold">Kompetens och maskiner/metodik</AccordionTrigger>
                <AccordionContent>
                  <AmpSectionContent content={kompetensContent} highlightText={highlightText} />
                </AccordionContent>
              </AccordionItem>
            );
          }
        }

        return (
          <React.Fragment key={i}>
            <AccordionItem value={`section-${i}`}>
              <AccordionTrigger className="text-left text-sm font-semibold">
                {section.title || `Avsnitt ${i + 1}`}
              </AccordionTrigger>
              <AccordionContent>
                {renderSectionContent({
                  section,
                  titleLower,
                  isAllmanInfo,
                  isKvalitetsmal,
                  isProjektMiljomal,
                  isArbetsmiljoaspekter,
                  isMiljoaspekter,
                  isBestallareOrg,
                  isEntreprenorOrg,
                  isUnderentreprenorer,
                  isMotesschema,
                  isRiskIdentifiering,
                  isByggmaterialKemiska,
                  isAvfallshantering,
                  highlightText,
                  qualityGoals,
                  miljomalGoals,
                  arbetsmiljomalGoals,
                  environmentGoals,
                  projectInfo,
                  bestallareOrg,
                  entreprenorOrg,
                  underentreprenorOrg,
                  meetingSchedule,
                  workRisks,
                  chemicalProducts,
                })}
              </AccordionContent>
            </AccordionItem>
            {injectAfterThis}
          </React.Fragment>
        );
      })}
    </Accordion>
  );
}

interface SectionContentProps {
  section: SmartViewSection;
  titleLower: string;
  isAllmanInfo: boolean;
  isKvalitetsmal: boolean;
  isProjektMiljomal: boolean;
  isArbetsmiljoaspekter: boolean;
  isMiljoaspekter: boolean;
  isBestallareOrg: boolean;
  isEntreprenorOrg: boolean;
  isUnderentreprenorer: boolean;
  isMotesschema: boolean;
  isRiskIdentifiering: boolean;
  isByggmaterialKemiska: boolean;
  isAvfallshantering: boolean;
  highlightText: (text: string) => React.ReactNode;
  qualityGoals?: { text: string; responsible: string }[];
  miljomalGoals?: { text: string; target: string; deadline: string }[];
  arbetsmiljomalGoals?: { text: string; target: string; deadline: string }[];
  environmentGoals?: { aspects?: { aspect: string; impact: string; measure: string }[] };
  projectInfo?: Record<string, string>;
  bestallareOrg?: { role?: string; company?: string; name?: string; phone?: string; email?: string }[];
  entreprenorOrg?: { role?: string; company?: string; name?: string; phone?: string; email?: string }[];
  underentreprenorOrg?: { role?: string; company?: string; name?: string; phone?: string; email?: string }[];
  meetingSchedule?: { day: string; time: string; location: string; attendees: string }[];
  workRisks?: { risk: string; likelihood: string; consequence: string; mitigation: string }[];
  chemicalProducts?: { id: string; product_name?: string; hazard_symbol?: string; risk_phrase?: string }[];
}

function renderSectionContent(props: SectionContentProps): React.ReactNode {
  const {
    section,
    titleLower,
    isAllmanInfo,
    isKvalitetsmal,
    isProjektMiljomal,
    isArbetsmiljoaspekter,
    isMiljoaspekter,
    isBestallareOrg,
    isEntreprenorOrg,
    isUnderentreprenorer,
    isMotesschema,
    isRiskIdentifiering,
    isByggmaterialKemiska,
    isAvfallshantering,
    highlightText,
    qualityGoals,
    miljomalGoals,
    arbetsmiljomalGoals,
    environmentGoals,
    projectInfo,
    bestallareOrg,
    entreprenorOrg,
    underentreprenorOrg,
    meetingSchedule,
    workRisks,
    chemicalProducts,
  } = props;

  if (isAllmanInfo && projectInfo) {
    return <ProjectInfoCard projectInfo={projectInfo} />;
  }
  if (isKvalitetsmal && qualityGoals?.length > 0) {
    return <QualityGoalsCards goals={qualityGoals} />;
  }
  if (isProjektMiljomal && miljomalGoals?.length > 0) {
    return <QualityGoalsCards goals={miljomalGoals} />;
  }
  if (isArbetsmiljoaspekter && arbetsmiljomalGoals?.length > 0) {
    return <QualityGoalsCards goals={arbetsmiljomalGoals} />;
  }
  if (isMiljoaspekter && environmentGoals) {
    return <EnvironmentGoalsCards data={environmentGoals} />;
  }
  if (isBestallareOrg && bestallareOrg?.length > 0) {
    return <OrganisationCards contacts={bestallareOrg} searchTerm="" />;
  }
  if (isEntreprenorOrg && entreprenorOrg?.length > 0) {
    return <OrganisationCards contacts={entreprenorOrg} searchTerm="" />;
  }
  if (isUnderentreprenorer && underentreprenorOrg?.length > 0) {
    return <OrganisationCards contacts={underentreprenorOrg} searchTerm="" />;
  }
  if (isMotesschema && meetingSchedule?.length > 0) {
    return <MeetingScheduleCards meetings={meetingSchedule} searchTerm="" />;
  }
  if (isRiskIdentifiering && workRisks) {
    return <WorkRiskCards risks={workRisks} searchTerm="" />;
  }
  if (isByggmaterialKemiska) {
    return (
      <div className="space-y-4">
        <AmpSectionContent content={filterAmpContent(section.content, titleLower)} highlightText={highlightText} />
        <ChemicalProductCards products={chemicalProducts || []} />
      </div>
    );
  }
  if (isAvfallshantering) {
    return <WasteManagementCards content={section.content} searchTerm="" />;
  }

  return <AmpSectionContent content={filterAmpContent(section.content, titleLower)} highlightText={highlightText} />;
}

function filterAmpContent(content: string[], titleLower: string): string[] {
  let filtered = content;

  filtered = filtered.filter(p => {
    const lower = p.toLowerCase().trim();
    return !SWEDISH_NOISE_PATTERNS.some(({ pattern }) => pattern.test(lower));
  });

  filtered = filtered.map(p => {
    const lines = p.split("\n");
    const kept = lines.filter(l => {
      const ll = l.toLowerCase().trim();
      return !SWEDISH_NOISE_PATTERNS.some(({ pattern }) => pattern.test(ll)) && !ll.startsWith("9.3");
    });
    return kept.join("\n");
  }).filter(p => p.trim().length > 0);

  if (titleLower.includes("arbetsberedning")) {
    filtered = filtered.filter(p => {
      const trimmed = p.trim();
      return !trimmed.startsWith("8.4") && !trimmed.startsWith("8.5") && !trimmed.startsWith("8.6") && !trimmed.toLowerCase().includes("punkt. 8.5");
    });
  }

  if (titleLower.includes("nödlägesberedskap")) {
    filtered = filtered.filter(p => {
      const lower = p.toLowerCase();
      return !lower.includes("avfallshantering") && !lower.includes("farligt avfall") && !lower.includes("avfallsförordningen") && !lower.includes("fraktioner") && !lower.includes("wellpapp") && !lower.includes("mineralull") && !lower.includes("schaktmassor") && !lower.includes("brännbart") && !lower.includes("byggpallar") && !lower.includes("pallkragar") && !lower.includes("kabeltrummor") && !lower.includes("sorteras glas-plast");
    });
  }

  return filtered;
}

const AmpSectionContent = ({ content, highlightText }: { content: string[]; highlightText: (t: string) => React.ReactNode }) => {
  return (
    <div className="space-y-3">
      {content.map((paragraph, j) => {
        const lines = paragraph.split("\n");
        const isList = lines.length >= 2 && lines.every(l => /^\s*[-•*]\s+/.test(l) || /^\s*\d+[.)]\s+/.test(l));

        if (isList) {
          return (
            <ul key={j} className="list-disc pl-5 space-y-1">
              {lines.map((line, k) => (
                <li key={k} className="text-sm leading-relaxed">
                  {highlightText(line.replace(/^\s*[-•*]\s+/, "").replace(/^\s*\d+[.)]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        const hasCheckboxes = lines.some(l => /\bja\b.*[☑☐□✓✔]/i.test(l) || /[☑☐□✓✔].*\bja\b/i.test(l) || (/\bja\b/i.test(l) && /\bnej\b/i.test(l)));
        if (hasCheckboxes) {
          return (
            <div key={j} className="space-y-1.5">
              {lines.filter(l => l.trim()).map((line, k) => {
                const hasJa = /\bja\b/i.test(line);
                return (
                  <div key={k} className={`text-sm leading-relaxed rounded-md px-3 py-1.5 ${hasJa ? 'bg-green-50 border border-green-200 text-green-900' : 'bg-muted/30'}`}>
                    {highlightText(line)}
                  </div>
                );
              })}
            </div>
          );
        }

        if (isTableLikeParagraph(paragraph)) {
          return <div key={j}>{renderTableContent(paragraph, highlightText)}</div>;
        }

        return (
          <p key={j} className="text-sm leading-relaxed">
            {highlightText(paragraph)}
          </p>
        );
      })}
    </div>
  );
};

function isTableLikeParagraph(paragraph: string): boolean {
  const lines = paragraph.split("\n").filter(l => l.trim());
  if (lines.length < 3) return false;
  const shortLines = lines.filter(l => l.trim().length < 40);
  return shortLines.length / lines.length > 0.6;
}

function renderTableContent(paragraph: string, highlightText: (t: string) => React.ReactNode) {
  const lines = paragraph.split("\n").map(l => l.trim()).filter(Boolean);
  const fieldLabels = ["nr", "ansvarig", "mål", "egenkontroll", "sign", "datum", "uppnått"];

  const groups: { label: string; values: string[] }[] = [];
  let currentLabel = "";
  let currentValues: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase().replace(/[.,:\s]/g, "");
    const isLabel = fieldLabels.some(f => lower.includes(f)) && line.length < 60;

    if (isLabel && currentValues.length > 0) {
      groups.push({ label: currentLabel, values: [...currentValues] });
      currentValues = [];
      currentLabel = line;
    } else if (isLabel && !currentLabel) {
      currentLabel = line;
    } else {
      currentValues.push(line);
    }
  }
  if (currentLabel || currentValues.length > 0) {
    groups.push({ label: currentLabel, values: [...currentValues] });
  }

  if (groups.length <= 1 && lines.length > 2) {
    return (
      <div className="rounded-md border bg-muted/30 p-3 space-y-1">
        {lines.map((line, i) => (
          <p key={i} className="text-sm leading-relaxed">{highlightText(line)}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group, gi) => (
        <div key={gi} className="rounded-md border bg-muted/30 p-3">
          {group.label && (
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              {highlightText(group.label)}
            </p>
          )}
          {group.values.map((val, vi) => (
            <p key={vi} className="text-sm leading-relaxed">{highlightText(val)}</p>
          ))}
        </div>
      ))}
    </div>
  );
}
