import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Document, InfoBlock } from "@/integrations/supabase/types";

export function useProjectData(
  projectId: string | undefined,
  setProjectName: (name: string) => void,
  setInfoBlocks: (blocks: InfoBlock[]) => void,
  setDocuments: (docs: Document[]) => void
) {
  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      const [projectRes, infoRes, slotsRes] = await Promise.all([
        supabase.from("projects").select("name").eq("id", projectId).single(),
        supabase.from("info_blocks").select("*").eq("project_id", projectId).order("sort_order"),
        supabase.from("document_slots").select("id, sort_order").eq("project_id", projectId).order("sort_order"),
      ]);

      setProjectName(projectRes.data?.name || "");
      setInfoBlocks(infoRes.data || []);

      const slotsList = (slotsRes.data || []) as { id: string; sort_order: number }[];
      const slotIds = slotsList.map(s => s.id);

      if (slotIds.length > 0) {
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
        setDocuments(orderedDocs);
      } else {
        setDocuments([]);
      }
    };

    fetchData();
  }, [projectId, setProjectName, setInfoBlocks, setDocuments]);
}
