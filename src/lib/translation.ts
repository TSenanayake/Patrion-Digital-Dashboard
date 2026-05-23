import { supabase } from "@/integrations/supabase/client";
import type { Document, InfoBlock, Question } from "@/integrations/supabase/types";
import type { SmartViewSection } from "./smartView/types";

export interface TranslationResult {
  translated_sections?: SmartViewSection[];
  translated_questions?: { index: number; question_text: string; options?: string[] }[];
}

export async function translateDocument(
  doc: Document,
  language: string,
  cacheKey: string,
  translatedSections: Record<string, SmartViewSection[]>,
  onSuccess: (cacheKey: string, sections: SmartViewSection[]) => void,
  onError: () => void,
  onComplete: () => void
): Promise<void> {
  if (!doc || language === "sv" || !language) return;
  const cached = `${doc.id}_${language}`;
  if (translatedSections[cached]) return;

  try {
    const svd = doc.smart_view_data as Record<string, unknown> | null;

    const { data, error } = await supabase.functions.invoke("translate-document", {
      body: {
        document_id: doc.id,
        language,
        smart_view_data: svd,
        extracted_text: doc.extracted_text,
        questions: [],
      },
    });

    if (error) throw error;
    if (data?.translated) {
      onSuccess(`${doc.id}_${language}`, data.translated_sections || []);
    }
  } catch (err) {
    console.error("Translation failed:", err);
    onError();
  } finally {
    onComplete();
  }
}

export async function translateQuestions(
  doc: Document,
  questions: Question[],
  language: string,
  translatedQuestions: Record<string, { index: number; question_text: string; options?: string[] }[]>,
  onSuccess: (cacheKey: string, questions: { index: number; question_text: string; options?: string[] }[]) => void,
  onComplete: () => void
): Promise<void> {
  if (!doc || language === "sv" || !language || questions.length === 0) return;
  const cacheKey = `${doc.id}_${language}`;
  if (translatedQuestions[cacheKey]?.length > 0) return;

  try {
    const { data, error } = await supabase.functions.invoke("translate-document", {
      body: {
        document_id: doc.id,
        language,
        smart_view_data: null,
        extracted_text: null,
        questions: questions.map(q => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options,
        })),
      },
    });

    if (error) throw error;
    if (data?.translated && data.translated_questions?.length > 0) {
      onSuccess(cacheKey, data.translated_questions);
    }
  } catch (err) {
    console.error("Question translation failed:", err);
  } finally {
    onComplete();
  }
}

export async function translateInfoBlocks(
  infoBlocks: InfoBlock[],
  language: string,
  projectId: string,
  translatedInfoBlocks: Record<string, string[]>,
  onSuccess: (cacheKey: string, content: string[]) => void,
  onComplete: () => void
): Promise<void> {
  if (!language || language === "sv" || infoBlocks.length === 0) return;
  const cacheKey = `info_${language}`;
  if (translatedInfoBlocks[cacheKey]) return;

  try {
    const { data, error } = await supabase.functions.invoke("translate-document", {
      body: {
        document_id: `info_blocks_${projectId}`,
        language,
        smart_view_data: {
          sections: infoBlocks.map(b => ({ title: "Info", content: [b.content] }))
        },
        extracted_text: null,
        questions: [],
      },
    });

    if (error) throw error;
    if (data?.translated && data.translated_sections) {
      const translated = data.translated_sections.map((s: { content?: string[] }) =>
        (s.content || []).join("\n")
      );
      onSuccess(cacheKey, translated);
    }
  } catch (err) {
    console.error("Info block translation failed:", err);
  } finally {
    onComplete();
  }
}

export function isTranslationValid(
  _originalSections: SmartViewSection[] | undefined,
  translatedSections: SmartViewSection[] | undefined
): boolean {
  if (!translatedSections || translatedSections.length === 0) return false;
  return translatedSections.some((s: SmartViewSection) => s.content && s.content.length > 0);
}
