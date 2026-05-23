import { Block, Section, Contact, SafetyOrgData, EmergencyData, CrisisActionData, ContactListData, AmpProjectInfo, QualityGoal, EnvironmentAspects, OrgContact, MeetingEntry, WorkRisk } from "../_shared/types.ts";
import { extractArbetsmiljoplan } from "../parsers/amp.ts";
import { extractAmpProjectInfoWithAI, extractAmpQualityGoalsWithAI, extractAmpEnvironmentGoalsWithAI, extractAmpMiljomalWithAI, extractAmpArbetsmiljomalWithAI, extractAmpOrganisationWithAI, extractAmpMeetingScheduleWithAI, extractAmpWorkRisksWithAI } from "../parsers/amp-ai.ts";
import { extractSkyddsorganisation, extractSkyddsorganisationWithAI, extractForstaHjalpenHeuristicPublic } from "../parsers/safetyOrg.ts";
import { extractContacts } from "../parsers/contactList.ts";
import { extractContactListWithAI } from "../parsers/contactList.ts";
import { extractChecklistaNodlage, extractChecklistaNodlageWithAI } from "../parsers/checklist.ts";
import { extractEmergencyWithAI } from "../parsers/emergency.ts";
import { buildSections } from "../section.ts";

export interface HandlerResult {
  sections: Section[];
  contacts: Contact[];
  removedToc: boolean;
  isContactList: boolean;
  safetyOrgData: SafetyOrgData | null;
  emergencyExtractedData: EmergencyData | null;
  contactListGroupedData: ContactListData | null;
  crisisActionsData: CrisisActionData[];
  ampProjectInfo: AmpProjectInfo | null;
  ampQualityGoals: QualityGoal[];
  ampEnvironmentGoals: EnvironmentAspects | null;
  ampMiljomalGoals: QualityGoal[];
  ampArbetsmiljomalGoals: QualityGoal[];
  ampBestOrgContacts: OrgContact[];
  ampEntrOrgContacts: OrgContact[];
  ampUnderentrContacts: OrgContact[];
  ampMeetingSchedule: MeetingEntry[];
  ampWorkRisks: WorkRisk[];
}

function createDefaultResult(): HandlerResult {
  return {
    sections: [],
    contacts: [],
    removedToc: false,
    isContactList: false,
    safetyOrgData: null,
    emergencyExtractedData: null,
    contactListGroupedData: null,
    crisisActionsData: [],
    ampProjectInfo: null,
    ampQualityGoals: [],
    ampEnvironmentGoals: null,
    ampMiljomalGoals: [],
    ampArbetsmiljomalGoals: [],
    ampBestOrgContacts: [],
    ampEntrOrgContacts: [],
    ampUnderentrContacts: [],
    ampMeetingSchedule: [],
    ampWorkRisks: [],
  };
}

export async function handleArbetsmiljoplan(blocks: Block[], rawText: string): Promise<HandlerResult> {
  const result = createDefaultResult();
  const ampSections = extractArbetsmiljoplan(blocks);
  if (ampSections.length > 0) {
    result.sections = ampSections;
    const [projInfo, qualGoals, envGoals, miljoGoals, arbMiljoGoals, bestOrg, entrOrg, underentrOrg, meetSchedule, workRisks] = await Promise.all([
      extractAmpProjectInfoWithAI(rawText),
      extractAmpQualityGoalsWithAI(rawText),
      extractAmpEnvironmentGoalsWithAI(rawText),
      extractAmpMiljomalWithAI(rawText),
      extractAmpArbetsmiljomalWithAI(rawText),
      extractAmpOrganisationWithAI(rawText, "Beställarens organisation"),
      extractAmpOrganisationWithAI(rawText, "Entreprenörens organisation"),
      extractAmpOrganisationWithAI(rawText, "Underentreprenörer"),
      extractAmpMeetingScheduleWithAI(rawText),
      extractAmpWorkRisksWithAI(rawText),
    ]);
    result.ampProjectInfo = projInfo;
    result.ampQualityGoals = qualGoals;
    result.ampEnvironmentGoals = envGoals;
    result.ampMiljomalGoals = miljoGoals;
    result.ampArbetsmiljomalGoals = arbMiljoGoals;
    result.ampBestOrgContacts = bestOrg;
    result.ampEntrOrgContacts = entrOrg;
    result.ampUnderentrContacts = underentrOrg;
    result.ampMeetingSchedule = meetSchedule;
    result.ampWorkRisks = workRisks;
  } else {
    const built = buildSections(blocks);
    result.sections = built.sections;
    result.removedToc = built.removedToc;
  }
  return result;
}

export function handleOrdningsregler(blocks: Block[]): HandlerResult {
  const result = createDefaultResult();
  const { sections } = buildSections(blocks);
  result.sections = sections.filter(s => {
    const titleLower = s.title.toLowerCase();
    if (/^(version|reviderad|upprättad|dokumentnr|projekt)/.test(titleLower)) return false;
    return true;
  });
  return result;
}

export async function handleSkyddsorganisation(blocks: Block[], rawText: string): Promise<HandlerResult> {
  const result = createDefaultResult();
  const res = extractSkyddsorganisation(blocks);
  result.sections = res.sections;
  result.contacts = res.contacts;
  result.isContactList = res.contacts.length >= 2;
  result.safetyOrgData = await extractSkyddsorganisationWithAI(rawText);
  console.log("[FH] AI returned forsta_hjalpen:", JSON.stringify(result.safetyOrgData.forsta_hjalpen));
  if (!result.safetyOrgData.forsta_hjalpen || result.safetyOrgData.forsta_hjalpen.length === 0) {
    const fh = extractForstaHjalpenHeuristicPublic(rawText);
    console.log("[FH] heuristic result:", JSON.stringify(fh));
    if (fh.length > 0) result.safetyOrgData.forsta_hjalpen = fh;
  }
  return result;
}

export async function handleKontaktlista(blocks: Block[], rawText: string): Promise<HandlerResult> {
  const result = createDefaultResult();
  result.contacts = extractContacts(blocks);
  result.isContactList = result.contacts.length >= 2;
  const built = buildSections(blocks);
  result.sections = built.sections;
  result.removedToc = built.removedToc;
  result.contactListGroupedData = await extractContactListWithAI(rawText);
  return result;
}

export async function handleChecklistaNodlage(blocks: Block[], rawText: string): Promise<HandlerResult> {
  const result = createDefaultResult();
  result.sections = extractChecklistaNodlage(blocks);
  result.crisisActionsData = await extractChecklistaNodlageWithAI(rawText);
  return result;
}

export async function handleNodsituation(blocks: Block[], rawText: string): Promise<HandlerResult> {
  const result = createDefaultResult();
  const built = buildSections(blocks);
  result.sections = built.sections;
  result.removedToc = built.removedToc;
  result.emergencyExtractedData = await extractEmergencyWithAI(rawText);
  return result;
}

export function handleApdPlan(cleaned: string): HandlerResult {
  const result = createDefaultResult();
  result.sections = [{ title: "APD-plan", content: [cleaned] }];
  return result;
}

export function handleDefault(blocks: Block[]): HandlerResult {
  const result = createDefaultResult();
  const contactResult = extractContacts(blocks);
  if (contactResult.length >= 3) {
    result.contacts = contactResult;
    result.isContactList = true;
  }
  const built = buildSections(blocks);
  result.sections = built.sections;
  result.removedToc = built.removedToc;
  return result;
}
