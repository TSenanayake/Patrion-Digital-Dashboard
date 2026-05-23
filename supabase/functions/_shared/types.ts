export type DocumentCategory =
  | "arbetsmiljoplan"
  | "ordningsregler"
  | "skyddsorganisation"
  | "kontaktlista"
  | "checklista_nodlage"
  | "nodsituation"
  | "apd_plan"
  | "ovrigt";

export interface CategoryResult {
  category: DocumentCategory;
  confidence: "high" | "medium" | "low";
  method: "filename" | "content" | "ai" | "fallback";
}

export interface Section {
  title: string;
  content: string[];
}

export interface Contact {
  role?: string;
  company?: string;
  name?: string;
  phone?: string;
  email?: string;
}

export interface SafetyOrgData {
  larmnummer?: string;
  company?: { name?: string; address?: string; phone?: string; email?: string; website?: string };
  arbetsplats?: { address?: string };
  byggherre?: { name?: string; address?: string };
  arbetsledning?: { role: string; name?: string; phone?: string; email?: string }[];
  skyddsombud?: { role: string; name?: string; phone?: string; email?: string }[];
  ovriga_kontakter?: { role: string; name?: string; phone?: string; email?: string }[];
  forsta_hjalpen?: { name?: string; company?: string; phone?: string }[];
  myndigheter?: { label: string; phone: string }[];
  guidance_text?: string;
}

export interface EmergencyData {
  emergency_number?: string;
  checklist?: string[];
  workplace_address?: string;
  responsible_person?: { role: string; name?: string; phone?: string };
  additional_contacts?: { role: string; name?: string; phone?: string }[];
}

export interface CrisisActionData {
  crisis_title: string;
  actions: string[];
}

export interface ContactListEntry {
  role?: string;
  company?: string;
  name?: string;
  mobile?: string;
  email?: string;
}

export interface ContactListGroup {
  group_name: string;
  contacts: ContactListEntry[];
}

export interface ContactListData {
  groups: ContactListGroup[];
}

export interface AmpProjectInfo {
  projektnamn?: string;
  projektnummer?: string;
  arbetsplats_adress?: string;
  bestallare?: string;
  bestallare_kontakt?: string;
  startdatum?: string;
  fardigstallande?: string;
  entreprenadform?: string;
  projektbeskrivning?: string;
  bas_p?: string;
  bas_u?: string;
}

export interface QualityGoal {
  nr?: string;
  ansvarig?: string;
  mal?: string;
  egenkontroll?: string;
}

export interface EnvironmentGoal {
  mal?: string;
  beskrivning?: string;
  status?: string;
}

export interface EnvironmentAspects {
  description?: string;
  goals: EnvironmentGoal[];
}

export interface OrgContact {
  role?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
}

export interface MeetingEntry {
  nr?: string;
  meeting?: string;
  participants?: string;
  timing?: string;
}

export interface WorkRisk {
  nr: string;
  description: string;
}

export interface Block {
  text: string;
  index: number;
}
