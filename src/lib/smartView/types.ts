export interface SmartViewSection {
  title: string;
  content: string[];
}

export interface ContactEntry {
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
  arbetsledning?: ContactEntry[];
  skyddsombud?: ContactEntry[];
  ovriga_kontakter?: ContactEntry[];
  forsta_hjalpen?: { name?: string; company?: string; phone?: string }[];
  myndigheter?: { label: string; phone: string }[];
  guidance_text?: string;
}

export interface EmergencyContact {
  role: string;
  name?: string;
  phone?: string;
}

export interface EmergencyData {
  emergency_number?: string;
  checklist?: string[];
  workplace_address?: string;
  responsible_person?: EmergencyContact;
  additional_contacts?: EmergencyContact[];
}

export interface ContactGroup {
  group_name: string;
  contacts: ContactEntry[];
}

export interface ContactListData {
  groups: ContactGroup[];
}

export interface CrisisAction {
  crisis_title: string;
  actions: string[];
}

export interface SmartViewData {
  sections: SmartViewSection[];
  confidence: "high" | "medium" | "low";
  source_type: string;
  removed_noise_lines_count: number;
  removed_toc: boolean;
  is_contact_list?: boolean;
  contacts?: ContactEntry[];
  category?: string;
  category_confidence?: string;
  category_method?: string;
  safety_org?: SafetyOrgData;
  emergency_data?: EmergencyData;
  contact_list_data?: ContactListData;
  crisis_actions?: CrisisAction[];
  project_info?: Record<string, string>;
  quality_goals?: Array<{ text: string; responsible: string }>;
  environment_goals?: { aspects?: Array<{ aspect: string; impact: string; measure: string }> };
  miljomal_goals?: Array<{ text: string; target: string; deadline: string }>;
  arbetsmiljomal_goals?: Array<{ text: string; target: string; deadline: string }>;
  bestallare_org?: ContactEntry[];
  entreprenor_org?: ContactEntry[];
  underentreprenor_org?: ContactEntry[];
  meeting_schedule?: Array<{ day: string; time: string; location: string; attendees: string }>;
  work_risks?: Array<{ risk: string; likelihood: string; consequence: string; mitigation: string }>;
}
