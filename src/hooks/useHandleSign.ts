import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Document } from "@/integrations/supabase/types";
import type { WorkerAction } from "@/lib/workerFlow";

interface SignState {
  signatureDataUrl: string | null;
  isPreview: boolean;
  projectId: string | undefined;
  userId: string;
  regForm: { name: string };
  consentTimestamp: string | null;
  questionsAnswered: { question_id: string; answer: string }[];
  documents: Document[];
}

export function useHandleSign(state: SignState, dispatch: React.Dispatch<WorkerAction>, onSuccess: () => void, onError: (msg: string) => void) {
  return useCallback(async () => {
    if (!state.signatureDataUrl && !state.isPreview) return;
    try {
      if (!state.isPreview) {
        let signatureUrl: string | null = null;
        if (state.signatureDataUrl) {
          const blob = await (await fetch(state.signatureDataUrl)).blob();
          const fileName = `${state.projectId}/${state.userId}_${Date.now()}.png`;
          const { error: uploadError } = await supabase.storage.from("documents").upload(`signatures/${fileName}`, blob, { contentType: "image/png" });
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage.from("documents").getPublicUrl(`signatures/${fileName}`);
          signatureUrl = urlData.publicUrl;
        }
        const deviceInfo = navigator.userAgent.substring(0, 200);
        if (state.documents.length > 0) {
          await supabase.from("document_reads").insert(state.documents.map(doc => ({ document_id: doc.id, user_id: state.userId, document_version: doc.version_number })));
        }
        if (state.questionsAnswered.length > 0) {
          await supabase.from("question_answers").insert(state.questionsAnswered.map(q => ({ question_id: q.question_id, user_id: state.userId, answer_given: q.answer, correct: true })));
        }
        await supabase.from("signatures").insert({ project_id: state.projectId, user_id: state.userId, signature_image_url: signatureUrl, device_info: deviceInfo, consent_timestamp: state.consentTimestamp });
      }
      dispatch({ type: 'SET_SIGNED' });
      const signedProjects = JSON.parse(localStorage.getItem("signed_projects") || "{}");
      signedProjects[state.projectId!] = { signedAt: new Date().toISOString(), name: state.regForm.name };
      localStorage.setItem("signed_projects", JSON.stringify(signedProjects));
      onSuccess();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Signering misslyckades");
    }
  }, [state, dispatch, onSuccess, onError]);
}
