import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HardHat, FileText, Search, ArrowLeft, ExternalLink, ChevronLeft } from "lucide-react";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import DocumentImageGallery from "@/components/project/DocumentImageGallery";
import ApdPlanViewer from "@/components/project/ApdPlanViewer";
import SafetyOrgCards from "@/components/project/SafetyOrgCards";
import EmergencyCards from "@/components/project/EmergencyCards";
import ContactListCards from "@/components/project/ContactListCards";
import EmergencyChecklistCards from "@/components/project/EmergencyChecklistCards";
import ChemicalProductCards from "@/components/project/ChemicalProductCards";
import WasteManagementCards from "@/components/project/WasteManagementCards";
import QualityGoalsCards from "@/components/project/QualityGoalsCards";
import EnvironmentGoalsCards from "@/components/project/EnvironmentGoalsCards";
import OrganisationCards from "@/components/project/OrganisationCards";
import MeetingScheduleCards from "@/components/project/MeetingScheduleCards";
import WorkRiskCards from "@/components/project/WorkRiskCards";
import { getCategoryLabel, type SupportedLanguage } from "@/lib/i18n";
import { useProject } from "@/hooks/queries";
import { useQuery } from "@tanstack/react-query";

type Document = Tables<"documents">;

interface SmartViewData {
  sections: { title: string; content: string[] }[];
  category?: string;
  is_contact_list?: boolean;
  contacts?: any[];
  [key: string]: any;
}

interface SlotInfo {
  id: string;
  sort_order: number;
  title: string;
}

interface WorkspaceData {
  projectName: string;
  projectCompany: string;
  documents: Document[];
}

function useWorkspaceData(projectId: string | undefined) {
  return useQuery({
    queryKey: ['workspace', projectId],
    queryFn: async (): Promise<WorkspaceData> => {
      if (!projectId) return { projectName: '', projectCompany: '', documents: [] };

      const signedProjects = JSON.parse(localStorage.getItem("signed_projects") || "{}");
      if (!signedProjects[projectId]) {
        return { projectName: '', projectCompany: '', documents: [] };
      }

      const [projectRes, slotsRes] = await Promise.all([
        supabase.from("projects").select("name, company").eq("id", projectId).single(),
        supabase.from("document_slots").select("id, sort_order, title").eq("project_id", projectId).order("sort_order"),
      ]);

      const projectName = projectRes.data?.name || "";
      const projectCompany = projectRes.data?.company || "";

      const slotsList = (slotsRes.data || []) as SlotInfo[];
      const slotIds = slotsList.map(s => s.id);

      if (slotIds.length === 0) {
        return { projectName, projectCompany, documents: [] };
      }

      const { data: docs } = await supabase
        .from("documents")
        .select("*")
        .in("slot_id", slotIds)
        .eq("is_latest", true);

      const slotOrder = new Map(slotsList.map(s => [s.id, s.sort_order]));
      const orderedDocs = (docs || []).sort((a, b) => {
        const aOrder = slotOrder.get(a.slot_id) ?? 999;
        const bOrder = slotOrder.get(b.slot_id) ?? 999;
        return aOrder - bOrder;
      });

      return { projectName, projectCompany, documents: orderedDocs };
    },
    enabled: !!projectId,
  });
}

const ProjectWorkspace = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project } = useProject(projectId);
  const { data: workspaceData, isLoading } = useWorkspaceData(projectId);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Laddar...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Laddar...</p>
      </div>
    );
  }

  const { projectName, projectCompany, documents } = workspaceData;

  if (!selectedDoc) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b bg-card">
          <div className="container flex h-14 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <HardHat className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-sm font-bold truncate">{projectName}</h1>
              {projectCompany && <p className="text-xs text-muted-foreground truncate">{projectCompany}</p>}
            </div>
          </div>
        </header>

        <main className="container py-6 space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold">Arbetsplatsens dokument</h2>
            <p className="text-sm text-muted-foreground">Tryck på ett dokument för att läsa det</p>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => {
              const category = doc.document_category;
              return (
                <Card
                  key={doc.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 active:scale-[0.98]"
                  onClick={() => {
                    setSelectedDoc(doc);
                    setSearchTerm("");
                    window.scrollTo({ top: 0, behavior: "instant" });
                  }}
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{doc.title}</p>
                      {category && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {getCategoryLabel(category, "sv")}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  const smartViewData = selectedDoc?.smart_view_data as SmartViewData | null;
  const documentCategory = selectedDoc?.document_category ?? null;
  const isApdPlan = documentCategory === "apd_plan" || smartViewData?.category === "apd_plan";
  const hasSmartView = smartViewData?.sections?.length > 0;
  const originalFileUrl = selectedDoc?.original_file_url ?? null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card">
        <div className="container flex h-14 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => {
              setSelectedDoc(null);
              setSearchTerm("");
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-sm font-bold truncate">{selectedDoc.title}</h1>
            {documentCategory && (
              <Badge variant="secondary" className="text-xs mt-0.5">
                {getCategoryLabel(documentCategory, "sv")}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container py-4 space-y-4">
        {hasSmartView && !isApdPlan && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Sök i dokument..."
              className="pl-9"
            />
          </div>
        )}

        {originalFileUrl && (
          <a
            href={originalFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Visa original
          </a>
        )}

        {isApdPlan && originalFileUrl ? (
          <ApdPlanViewer fileUrl={originalFileUrl} title={selectedDoc.title} />
        ) : hasSmartView ? (
          <WorkspaceSmartView data={smartViewData!} searchTerm={searchTerm} projectId={projectId} />
        ) : selectedDoc?.extracted_text ? (
          <Card>
            <CardContent className="py-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {selectedDoc.extracted_text}
              </p>
            </CardContent>
          </Card>
        ) : (
          <DocumentImageGallery documentId={selectedDoc.id} />
        )}
      </main>
    </div>
  );
};

const WorkspaceSmartView = ({ data, searchTerm, projectId }: { data: SmartViewData; searchTerm: string; projectId?: string }) => {
  const allSectionKeys = data.sections.map((_, i) => `section-${i}`);
  const [openSections, setOpenSections] = useState<string[]>(allSectionKeys);
  const [chemicalProducts, setChemicalProducts] = useState<Tables<"chemical_products">[]>([]);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      if (!searchTerm) setOpenSections(allSectionKeys);
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
    if (!projectId || data.category !== "arbetsmiljoplan") return;
    const fetchProducts = async () => {
      const { data: products } = await supabase.from("chemical_products").select("*").eq("project_id", projectId).order("sort_order");
      setChemicalProducts((products as Tables<"chemical_products">[]) || []);
    };
    fetchProducts();
  }, [projectId, data.category]);

  if (data.category === "skyddsorganisation" && data.safety_org) {
    return <SafetyOrgCards safetyOrg={data.safety_org} searchTerm={searchTerm} />;
  }
  if (data.category === "nodsituation" && data.emergency_data) {
    return <EmergencyCards emergencyData={data.emergency_data} searchTerm={searchTerm} />;
  }
  if (data.category === "kontaktlista" && data.contact_list_data?.groups?.length > 0) {
    return <ContactListCards contactListData={data.contact_list_data} searchTerm={searchTerm} />;
  }
  if (data.category === "checklista_nodlage" && data.crisis_actions?.length > 0) {
    return <EmergencyChecklistCards crisisActions={data.crisis_actions} searchTerm={searchTerm} />;
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

  return (
    <Accordion type="multiple" value={openSections} onValueChange={setOpenSections} className="w-full">
      {data.sections.map((section, i) => (
        <AccordionItem key={i} value={`section-${i}`}>
          <AccordionTrigger className="text-left text-sm font-semibold">
            {highlightText(section.title)}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {section.content.map((paragraph, j) => (
                <p key={j} className="text-sm leading-relaxed">
                  {highlightText(paragraph)}
                </p>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default ProjectWorkspace;
