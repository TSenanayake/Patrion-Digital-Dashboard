import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SafetyOrgCards from "@/components/project/SafetyOrgCards";
import EmergencyCards from "@/components/project/EmergencyCards";
import ContactListCards from "@/components/project/ContactListCards";
import EmergencyChecklistCards from "@/components/project/EmergencyChecklistCards";
import { AmpRenderer } from "./AmpRenderer";
import { AmpSectionContent } from "./AmpRenderer";
import { isTableLikeParagraph, renderTableContent } from "./AmpRenderer";
import type { SmartViewData } from "./types";
import type { Tables } from "@/integrations/supabase/types";

interface SmartViewProps {
  data: SmartViewData;
  searchTerm: string;
  projectId?: string;
  isTranslated?: boolean;
}

const SmartView: React.FC<SmartViewProps> = ({ data, searchTerm, projectId, isTranslated }) => {
  const [chemicalProducts, setChemicalProducts] = useState<Tables<"chemical_products">[]>([]);
  const allSectionKeys = data.sections.map((_, i) => `section-${i}`);
  const [openSections, setOpenSections] = useState<string[]>(allSectionKeys);
  const scrolledForTerm = React.useRef<string>("");

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      if (!searchTerm) setOpenSections(allSectionKeys);
      scrolledForTerm.current = "";
      return;
    }
    const lower = searchTerm.toLowerCase();
    const matching: string[] = [];
    data.sections.forEach((section, i) => {
      const inTitle = section.title.toLowerCase().includes(lower);
      const inContent = section.content.some(c => c.toLowerCase().includes(lower));
      if (inTitle || inContent) matching.push(`section-${i}`);
    });
    setOpenSections(matching);
  }, [searchTerm, data.sections]);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2 || scrolledForTerm.current === searchTerm) return;
    const timer = setTimeout(() => {
      const firstMark = document.querySelector(".smart-view-container mark");
      if (firstMark) {
        firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
        scrolledForTerm.current = searchTerm;
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, openSections]);

  useEffect(() => {
    if (!projectId || data.category !== "arbetsmiljoplan") return;
    const fetchProducts = async () => {
      const { data: products } = await supabase.from("chemical_products").select("*").eq("project_id", projectId).order("sort_order");
      setChemicalProducts((products as Tables<"chemical_products">[]) || []);
    };
    fetchProducts();
  }, [projectId, data.category]);

  if (!isTranslated) {
    if (data.category === "skyddsorganisation" && data.safety_org) {
      return <SafetyOrgCards safetyOrg={data.safety_org} searchTerm={searchTerm} />;
    }
    if (data.category === "nodsituation" && data.emergency_data) {
      return <EmergencyCards emergencyData={data.emergency_data} searchTerm={searchTerm} />;
    }
    if (data.category === "kontaktlista" && data.contact_list_data?.groups?.length > 0) {
      return <ContactListCards contactListData={data.contact_list_data} searchTerm={searchTerm} />;
    }
    if (data.is_contact_list && data.contacts && data.contacts.length > 0) {
      return <ContactCards contacts={data.contacts} searchTerm={searchTerm} />;
    }
    if (data.category === "checklista_nodlage" && data.crisis_actions?.length > 0) {
      return <EmergencyChecklistCards crisisActions={data.crisis_actions} searchTerm={searchTerm} />;
    }
    if (data.category === "checklista_nodlage" && data.sections.length > 0) {
      return <CrisisActionCards sections={data.sections} searchTerm={searchTerm} />;
    }
  }

  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <mark key={i} className="bg-amber-200 rounded px-0.5">{part}</mark>
        : part
    );
  };

  const isAmp = data.category === "arbetsmiljoplan";

  if (isAmp) {
    return (
      <div className="smart-view-container">
        <AmpRenderer
          data={data}
          searchTerm={searchTerm}
          highlightText={highlightText}
          chemicalProducts={chemicalProducts}
        />
      </div>
    );
  }

  return (
    <div className="smart-view-container">
      <Accordion type="multiple" value={openSections} onValueChange={setOpenSections} className="w-full">
        {data.sections.map((section, i) => (
          <AccordionItem key={i} value={`section-${i}`}>
            <AccordionTrigger className="text-left text-sm font-semibold">
              {section.title || `Avsnitt ${i + 1}`}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {section.content.map((paragraph, j) => {
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

                  return (
                    <p key={j} className="text-sm leading-relaxed">
                      {highlightText(paragraph)}
                    </p>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

interface ContactEntry {
  role?: string;
  company?: string;
  name?: string;
  phone?: string;
  email?: string;
}

const ContactCards = ({ contacts, searchTerm }: { contacts: ContactEntry[]; searchTerm: string }) => {
  const filtered = searchTerm
    ? contacts.filter(c =>
        [c.name, c.role, c.company, c.phone, c.email]
          .filter(Boolean)
          .some(v => v!.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : contacts;

  if (filtered.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Inga kontakter matchar sökningen.</p>;
  }

  return (
    <div className="space-y-3">
      {filtered.map((contact, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
          {contact.role && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{contact.role}</span>
            </div>
          )}
          {contact.name && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{contact.name}</span>
            </div>
          )}
          {contact.company && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{contact.company}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface SmartViewSection {
  title: string;
  content: string[];
}

const CrisisActionCards = ({ sections, searchTerm }: { sections: SmartViewSection[]; searchTerm: string }) => {
  const filtered = searchTerm
    ? sections.filter(s =>
        [s.title, ...s.content].some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : sections;

  if (filtered.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Inga kriser matchar sökningen.</p>;
  }

  return (
    <div className="space-y-3">
      {filtered.map((section, i) => (
        <div key={i} className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{section.title}</span>
          </div>
          <div className="pl-6 space-y-1">
            {section.content.map((action, j) => (
              <p key={j} className="text-sm leading-relaxed">→ {action}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SmartView;
