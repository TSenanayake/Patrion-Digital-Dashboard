import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Block, Section, Contact, DocumentCategory, SafetyOrgData, EmergencyData, CrisisActionData, ContactListData, AmpProjectInfo, QualityGoal, EnvironmentAspects, OrgContact, MeetingEntry, WorkRisk } from "./_shared/types.ts";
import { detectCategory } from "./category/ai.ts";
import { detectCategoryFromFilename } from "./category/filename.ts";
import { detectAndRemoveNoise } from "./text/noise.ts";
import { segmentIntoBlocks } from "./text/segment.ts";
import { buildSections } from "./section.ts";
import { extractContacts, extractContactListWithAI } from "./parsers/contactList.ts";
import { extractChecklistaNodlage, extractChecklistaNodlageWithAI } from "./parsers/checklist.ts";
import { extractEmergencyWithAI } from "./parsers/emergency.ts";
import { extractSkyddsorganisation, extractSkyddsorganisationWithAI, extractForstaHjalpenHeuristicPublic } from "./parsers/safetyOrg.ts";
import { extractArbetsmiljoplan } from "./parsers/amp.ts";
import { extractAmpProjectInfoWithAI, extractAmpQualityGoalsWithAI, extractAmpEnvironmentGoalsWithAI, extractAmpMiljomalWithAI, extractAmpArbetsmiljomalWithAI, extractAmpOrganisationWithAI, extractAmpMeetingScheduleWithAI, extractAmpWorkRisksWithAI } from "./parsers/amp-ai.ts";
import { calculateConfidence, sectionsToMobileHtml } from "./text/confidence.ts";
import { extractDocxText, extractDocxImages, extractPdfText } from "./text/extract.ts";
import { handleArbetsmiljoplan, handleOrdningsregler, handleSkyddsorganisation, handleKontaktlista, handleChecklistaNodlage, handleNodsituation, handleApdPlan, handleDefault, HandlerResult } from "./handlers/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function smartViewEngine(rawText: string, sourceType: string, filename: string) {
  const totalLines = rawText.split("\n").length;

  const categoryResult = await detectCategory(rawText, filename);

  const { cleaned, removedCount } = detectAndRemoveNoise(rawText);

  const blocks = segmentIntoBlocks(cleaned);

  let handlerResult: HandlerResult;

  switch (categoryResult.category) {
    case "arbetsmiljoplan":
      handlerResult = await handleArbetsmiljoplan(blocks, rawText);
      if (!handlerResult.ampProjectInfo) categoryResult.confidence = "low";
      break;
    case "ordningsregler":
      handlerResult = handleOrdningsregler(blocks);
      break;
    case "skyddsorganisation":
      handlerResult = await handleSkyddsorganisation(blocks, rawText);
      break;
    case "kontaktlista":
      handlerResult = await handleKontaktlista(blocks, rawText);
      break;
    case "checklista_nodlage":
      handlerResult = await handleChecklistaNodlage(blocks, rawText);
      break;
    case "nodsituation":
      handlerResult = await handleNodsituation(blocks, rawText);
      break;
    case "apd_plan":
      handlerResult = handleApdPlan(cleaned);
      break;
    default:
      handlerResult = handleDefault(blocks);
  }

  const { sections, contacts, removedToc, isContactList, safetyOrgData, emergencyExtractedData, contactListGroupedData, crisisActionsData, ampProjectInfo, ampQualityGoals, ampEnvironmentGoals, ampMiljomalGoals, ampArbetsmiljomalGoals, ampBestOrgContacts, ampEntrOrgContacts, ampUnderentrContacts, ampMeetingSchedule, ampWorkRisks } = handlerResult;

  let confidence = calculateConfidence(sections, removedCount, totalLines, categoryResult.category);

  if (isContactList && contacts.length >= 3) confidence = "high";

  const mobileHtml = sectionsToMobileHtml(sections);

  const smartViewData: Record<string, unknown> = {
    sections: sections.map(s => ({ title: s.title, content: s.content })),
    confidence,
    source_type: sourceType,
    removed_noise_lines_count: removedCount,
    removed_toc: removedToc,
    category: categoryResult.category,
    category_confidence: categoryResult.confidence,
    category_method: categoryResult.method,
  };

  if (isContactList && contacts.length > 0) {
    smartViewData.is_contact_list = true;
    smartViewData.contacts = contacts;
  }

  if (safetyOrgData && Object.keys(safetyOrgData).length > 0) {
    smartViewData.safety_org = safetyOrgData;
    const mappedRoles = [
      ...(safetyOrgData.arbetsledning || []),
      ...(safetyOrgData.skyddsombud || []),
      ...(safetyOrgData.ovriga_kontakter || []),
    ].filter((c: any) => c.name || c.phone).length;
    if (mappedRoles >= 3) confidence = "high";
    else if (mappedRoles < 3) confidence = "low";
  }

  if (emergencyExtractedData && Object.keys(emergencyExtractedData).length > 0) {
    smartViewData.emergency_data = emergencyExtractedData;
    const hasKey = !!(emergencyExtractedData.emergency_number &&
      (emergencyExtractedData.checklist?.length || emergencyExtractedData.responsible_person?.name));
    confidence = hasKey ? "high" : "low";
  }

  if (contactListGroupedData && contactListGroupedData.groups && contactListGroupedData.groups.length > 0) {
    smartViewData.contact_list_data = contactListGroupedData;
    const totalContacts = contactListGroupedData.groups.reduce((sum: number, g: any) => sum + (g.contacts?.length || 0), 0);
    if (totalContacts >= 3) confidence = "high";
    else if (totalContacts < 3) confidence = "low";
  }

  if (crisisActionsData.length > 0) {
    smartViewData.crisis_actions = crisisActionsData;
    confidence = crisisActionsData.length >= 2 ? "high" : "medium";
  }

  if (ampProjectInfo && Object.keys(ampProjectInfo).length > 0) {
    smartViewData.project_info = ampProjectInfo;
  }

  if (ampQualityGoals.length > 0) {
    smartViewData.quality_goals = ampQualityGoals;
  }

  if (ampEnvironmentGoals) {
    smartViewData.environment_goals = ampEnvironmentGoals;
  }

  if (ampMiljomalGoals.length > 0) {
    smartViewData.miljomal_goals = ampMiljomalGoals;
  }

  if (ampArbetsmiljomalGoals.length > 0) {
    smartViewData.arbetsmiljomal_goals = ampArbetsmiljomalGoals;
  }

  if (ampBestOrgContacts.length > 0) {
    smartViewData.bestallare_org = ampBestOrgContacts;
  }
  if (ampEntrOrgContacts.length > 0) {
    smartViewData.entreprenor_org = ampEntrOrgContacts;
  }
  if (ampUnderentrContacts.length > 0) {
    smartViewData.underentreprenor_org = ampUnderentrContacts;
  }
  if (ampMeetingSchedule.length > 0) {
    smartViewData.meeting_schedule = ampMeetingSchedule;
  }
  if (ampWorkRisks.length > 0) {
    smartViewData.work_risks = ampWorkRisks;
  }

  return { mobileHtml, smartViewData, confidence, cleanedText: cleaned, category: categoryResult };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing or invalid Authorization header" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { document_id } = await req.json();
    if (!document_id) {
      return new Response(
        JSON.stringify({ error: "document_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: doc, error: docError } = await supabase
      .from("documents").select("*").eq("id", document_id).single();

    if (docError || !doc) {
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!doc.original_file_url) {
      await supabase.from("documents").update({
        extraction_status: "failed",
        extraction_error: "Ingen fil-URL tillgänglig",
      }).eq("id", document_id);
      return new Response(
        JSON.stringify({ error: "No file URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileResponse = await fetch(doc.original_file_url);
    if (!fileResponse.ok) throw new Error(`Failed to download: ${fileResponse.status}`);
    const fileBuffer = await fileResponse.arrayBuffer();
    const mimeType = doc.mime_type || "";
    const filename = doc.title || "";

    let rawText = "";
    let sourceType = "text";
    const isDocx = mimeType.includes("wordprocessingml") || mimeType.includes("docx") || doc.original_file_url.endsWith(".docx");
    const isPdf = mimeType.includes("pdf") || doc.original_file_url.endsWith(".pdf");

    if (isDocx) {
      rawText = await extractDocxText(fileBuffer);
      await extractDocxImages(fileBuffer, document_id, supabase);
    } else if (isPdf) {
      rawText = await extractPdfText(fileBuffer);
      if (rawText.trim().length < 100) sourceType = "ocr";
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    const filenameCategory = detectCategoryFromFilename(filename);
    if (filenameCategory && filenameCategory.category === "apd_plan") {
      await supabase.from("documents").update({
        extraction_status: "success",
        extraction_error: null,
        smart_view_data: {
          sections: [],
          confidence: "low",
          source_type: sourceType,
          removed_noise_lines_count: 0,
          removed_toc: false,
          category: "apd_plan",
          category_confidence: "high",
          category_method: "filename",
        },
        smart_view_confidence: "low",
        source_type: sourceType,
        document_category: "apd_plan",
      }).eq("id", document_id);

      return new Response(
        JSON.stringify({ status: "success", confidence: "low", category: "apd_plan", category_method: "filename" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const MAX_CHARS = 200000;
    let truncated = false;
    if (rawText.length > MAX_CHARS) {
      rawText = rawText.substring(0, MAX_CHARS);
      truncated = true;
    }

    if (!rawText.trim()) {
      await supabase.from("documents").update({
        extraction_status: "failed",
        extraction_error: "Ingen text kunde extraheras. Dokumentet kanske är en skannad bild.",
      }).eq("id", document_id);
      return new Response(
        JSON.stringify({ status: "failed", error: "No text extracted" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { mobileHtml, smartViewData, confidence, cleanedText, category } =
      await smartViewEngine(rawText, sourceType, filename);

    let finalHtml = mobileHtml;
    if (truncated) {
      finalHtml += '<p><em>(Dokumentet är förkortat i mobilvisning. Öppna original för full version.)</em></p>';
    }

    await supabase.from("documents").update({
      extracted_text: cleanedText,
      mobile_html: finalHtml,
      extraction_status: "success",
      extraction_error: null,
      smart_view_data: smartViewData,
      smart_view_confidence: confidence,
      source_type: sourceType,
      document_category: category.category,
    }).eq("id", document_id);

    return new Response(
      JSON.stringify({ status: "success", confidence, category: category.category, category_method: category.method }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error(JSON.stringify({
      level: "error",
      function: "extract-document-text",
      operation: "document-extraction",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    try {
      const { document_id } = await req.clone().json().catch(() => ({}));
      if (document_id) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from("documents").update({
          extraction_status: "failed",
          extraction_error: error.message || "Okänt fel vid extraktion",
        }).eq("id", document_id);
      }
    } catch (_) {}

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
