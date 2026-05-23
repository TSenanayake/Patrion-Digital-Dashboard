import { useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Document, Question } from "@/integrations/supabase/types";
import type { WorkerAction } from "@/lib/workerFlow";

export function useConfirmDocRead(
  documents: Document[],
  currentDocIndex: number,
  language: string | null,
  translatedQuestions: Record<string, { index: number; question_text: string; options?: string[] }[]>,
  dispatch: React.Dispatch<WorkerAction>,
  setDocQuestions: (q: Question[]) => void,
  setTranslating: (v: boolean) => void,
  moveToNextDocument: () => void
) {
  const confirmDocRead = useCallback(async () => {
    const doc = documents[currentDocIndex];
    if (!doc) return;
    const docSlotId = doc?.slot_id;
    let questions: Question[] = [];
    if (docSlotId) {
      const { data: slotQuestions } = await supabase.from("questions").select("*").eq("slot_id", docSlotId);
      questions = [...(slotQuestions || [])];
    }
    const { data: docSpecificQuestions } = await supabase.from("questions").select("*").eq("document_id", doc.id).is("slot_id", null);
    questions = [...questions, ...(docSpecificQuestions || [])];
    if (questions.length > 0) {
      setDocQuestions(questions);
      dispatch({ type: 'GO_TO_QUESTIONS', questions });
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (language && language !== "sv") {
        setTranslating(true);
        const cacheKey = `${doc.id}_${language}`;
        if (!translatedQuestions[cacheKey]?.length) {
          try {
            const { data, error } = await supabase.functions.invoke("translate-document", {
              body: { document_id: doc.id, language, smart_view_data: null, extracted_text: null, questions: questions.map(q => ({ id: q.id, question_text: q.question_text, options: q.options })) },
            });
            if (!error && data?.translated && data.translated_questions?.length > 0) {
              dispatch({ type: 'SET_TRANSLATED_QUESTIONS', cacheKey, questions: data.translated_questions });
            }
          } catch { console.error("Question translation failed"); }
          finally { setTranslating(false); }
        }
      }
    } else {
      moveToNextDocument();
    }
  }, [documents, currentDocIndex, language, translatedQuestions, dispatch, setDocQuestions, setTranslating, moveToNextDocument]);

  return confirmDocRead;
}
