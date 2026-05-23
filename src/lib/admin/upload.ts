import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const slotToCategoryMap: Record<string, string> = {
  ordningsregler: "ordningsregler",
  skyddsorganisation: "skyddsorganisation",
  arbetsmiljoplan: "arbetsmiljoplan",
  apd_plan: "apd_plan",
  olycksrutiner: "nodsituation",
  kontaktlista: "kontaktlista",
  checklista_nodlage: "checklista_nodlage",
};

function getMimeType(filename: string): string {
  if (filename.endsWith(".pdf")) return "application/pdf";
  if (filename.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}

function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._\-]/g, "_")
    .replace(/_+/g, "_");
}

export async function triggerExtraction(supabase: SupabaseClient, documentId: string): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("extract-document-text", {
      body: { document_id: documentId },
    });
    if (error) console.error("Extraction trigger error:", error);
  } catch (e) {
    console.error("Failed to trigger extraction:", e);
  }
}

export async function retryExtraction(
  supabase: SupabaseClient,
  documentId: string,
  queryClient: { invalidateQueries: (opts: { queryKey: string[] }) => void }
): Promise<void> {
  await supabase
    .from("documents")
    .update({ extraction_status: "pending", extraction_error: null } as TablesUpdate<"documents">)
    .eq("id", documentId);
  queryClient.invalidateQueries({ queryKey: ["slots"] });
  triggerExtraction(supabase, documentId);
}

export async function uploadDocument(
  supabase: SupabaseClient,
  projectId: string,
  slotId: string,
  slotType: string,
  file: File,
  slotDocuments: Record<string, unknown[]>
): Promise<{ success: boolean; error?: string }> {
  const safeFileName = sanitizeFileName(file.name);
  const fileName = `${projectId}/${Date.now()}_${safeFileName}`;
  const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, file);
  if (uploadError) return { success: false, error: uploadError.message };

  const { data: urlData } = supabase.storage.from("documents").getPublicUrl(fileName);

  const existingDocs = slotDocuments[slotId] || [];
  const latestDoc = (existingDocs as Array<{ id: string; is_latest: boolean }>).find((d: any) => d.is_latest);
  if (latestDoc) {
    await supabase.from("documents").update({ is_latest: false }).eq("id", latestDoc.id);
  }

  const newVersion = latestDoc ? (latestDoc as any).version_number + 1 : 1;
  const mimeType = getMimeType(file.name);
  const title = file.name.replace(/\.[^/.]+$/, "");
  const documentCategory = slotToCategoryMap[slotType] || "ovrigt";

  const { data: newDoc } = await supabase.from("documents").insert({
    project_id: projectId,
    slot_id: slotId,
    title,
    original_file_url: urlData.publicUrl,
    version_number: newVersion,
    is_latest: true,
    mime_type: mimeType,
    extraction_status: "pending",
    document_category: documentCategory,
  } as TablesInsert<"documents">).select().single();

  if (newDoc) {
    await triggerExtraction(supabase, newDoc.id);
  }

  return { success: true };
}

export async function deleteDocument(
  supabase: SupabaseClient,
  docId: string,
  queryClient: { invalidateQueries: (opts: { queryKey: string[] }) => void }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("documents").delete().eq("id", docId);
  if (error) return { success: false, error: error.message };
  queryClient.invalidateQueries({ queryKey: ["slots"] });
  return { success: true };
}
