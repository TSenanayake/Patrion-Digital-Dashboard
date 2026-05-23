import React, { useEffect, useReducer, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { HardHat } from "lucide-react";
import { toast } from "sonner";
import { ConsentScreen } from "@/components/project/ConsentScreen";
import { t, ALL_SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/lib/i18n";
import { useProjectSettings } from "@/lib/projectConfig";
import { workerReducer, initialWorkerState, type WorkerAction } from "@/lib/workerFlow";
import { LanguagePhase, InfoPhase, DocumentReadingPhase, RegisterPhase, SignaturePhase, DonePhase } from "@/components/project/phases";
import type { Document, InfoBlock, Question } from "@/integrations/supabase/types";
import type { SmartViewData } from "@/lib/smartView/types";
import { useWorkerScrollGate } from "@/hooks/useWorkerScrollGate";
import { useProjectData } from "@/hooks/useProjectData";
import { useConfirmDocRead } from "@/hooks/useConfirmDocRead";
import { useHandleSign } from "@/hooks/useHandleSign";
import { translateDocument, translateInfoBlocks } from "@/lib/translation";

const PreviewBanner = ({ lang }: { lang: SupportedLanguage }) => (
  <div className="sticky top-0 z-20 flex items-center justify-center gap-2 bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950">
    {t("preview.banner", lang)}
  </div>
);

const ProjectRead: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  const [state, dispatch] = useReducer(workerReducer, initialWorkerState);
  const [infoBlocks, setInfoBlocks] = useState<InfoBlock[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docQuestions, setDocQuestions] = useState<Question[]>([]);
  const [projectName, setProjectName] = useState("");
  const [translating, setTranslating] = useState(false);
  const docContentRef = useRef<HTMLDivElement>(null);

  const { data: projectSettings } = useProjectSettings(projectId);
  const supportedLanguages = projectSettings?.supportedLanguages || ALL_SUPPORTED_LANGUAGES;

  useProjectData(projectId, setProjectName, setInfoBlocks, setDocuments);

  const currentDoc = documents[state.currentDocIndex] || null;
  const smartViewData = currentDoc?.smart_view_data as SmartViewData | null;
  const extractionStatus = currentDoc?.extraction_status;
  const mobileHtml = currentDoc?.mobile_html;
  const extractionError = currentDoc?.extraction_error;
  const documentCategory = currentDoc?.document_category ?? null;
  const isApdPlan = documentCategory === "apd_plan" || smartViewData?.category === "apd_plan";

  const progress = documents.length > 0 ? ((state.currentDocIndex + (state.phase === "done" ? 1 : 0)) / documents.length) * 100 : 0;
  const lang = (state.language || "sv") as SupportedLanguage;

  const translationCacheKey = currentDoc ? `${currentDoc.id}_${state.language}` : "";
  const isTranslated = state.language !== "sv" && !!state.translatedSections[translationCacheKey];
  const currentTranslatedSections = state.translatedSections[translationCacheKey];
  const currentTranslatedQuestions = state.translatedQuestions[translationCacheKey];
  const currentQuestion = docQuestions[state.currentQuestionIndex] || null;

  const origSectionCount = smartViewData?.sections?.length || 0;
  const transSectionCount = currentTranslatedSections?.length || 0;
  const hasValidTranslation = isTranslated && transSectionCount > 0 &&
    currentTranslatedSections.some((s: unknown) => (s as { content?: unknown[] })?.content && (s as { content: unknown[] }).content.length > 0);
  const effectiveSmartViewData: SmartViewData | null = hasValidTranslation && smartViewData
    ? { ...smartViewData, sections: currentTranslatedSections as SmartViewData["sections"] }
    : smartViewData;

  const moveToNextDocument = () => {
    if (state.currentDocIndex < documents.length - 1) {
      dispatch({ type: 'NEXT_DOCUMENT', totalDocuments: documents.length });
    } else {
      dispatch({ type: 'ALL_DOCS_COMPLETE' });
    }
  };

  const confirmDocRead = useConfirmDocRead(
    documents, state.currentDocIndex, state.language, state.translatedQuestions,
    dispatch, setDocQuestions, setTranslating, moveToNextDocument
  );

  const handleSign = useHandleSign(
    { signatureDataUrl: state.signatureDataUrl, isPreview, projectId, userId: state.userId, regForm: state.regForm, consentTimestamp: state.consentTimestamp, questionsAnswered: state.questionsAnswered, documents },
    dispatch,
    () => toast.success(t("signature.complete", lang)),
    (msg) => toast.error(msg)
  );

  useEffect(() => {
    if (isPreview) {
      dispatch({ type: 'SET_USER_ID', userId: 'preview-user' });
      dispatch({ type: 'SELECT_LANGUAGE', language: 'sv' });
      dispatch({ type: 'ACCEPT_CONSENT', infoBlocks: [], documentCount: 0 });
    }
  }, [isPreview]);

  useEffect(() => {
    if (!currentDoc) return;
    const cat = currentDoc.document_category;
    const svd = currentDoc.smart_view_data as SmartViewData | null;
    const isApd = cat === "apd_plan" || svd?.category === "apd_plan";
    if (isApd) {
      dispatch({ type: 'SET_VIEW_MODE', mode: 'original' });
      dispatch({ type: 'SET_SCROLLED' });
      return;
    }
    const conf = currentDoc.smart_view_confidence;
    dispatch({ type: 'SET_VIEW_MODE', mode: (conf === "low" || !conf) ? 'original' : 'smart' });
  }, [state.currentDocIndex, documents]);

  useEffect(() => {
    const doc = documents[state.currentDocIndex];
    if (!doc) return;
    const isApd = doc.document_category === "apd_plan" || (doc.smart_view_data as SmartViewData | null)?.category === "apd_plan";
    if (isApd) dispatch({ type: 'SET_SCROLLED' });
    dispatch({ type: 'SET_SEARCH_TERM', term: '' });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
  }, [state.currentDocIndex, state.viewMode, documents]);

  useWorkerScrollGate(state.phase, state.docSubPhase, state.hasScrolledToBottom, state.currentDocIndex, docContentRef, dispatch);

  useEffect(() => {
    const doc = documents[state.currentDocIndex];
    if (state.phase === "documents" && doc && state.language && state.language !== "sv") {
      setTranslating(true);
      translateDocument(doc, state.language, `${doc.id}_${state.language}`, state.translatedSections,
        (ck, sections) => dispatch({ type: 'SET_TRANSLATED_SECTIONS', cacheKey: ck, sections }),
        () => dispatch({ type: 'SET_TRANSLATION_FAILED' }),
        () => setTranslating(false)
      );
    }
    if (state.language && state.language !== "sv" && infoBlocks.length > 0) {
      const cacheKey = `info_${state.language}`;
      if (!state.translatedInfoBlocks[cacheKey]) {
        setTranslating(true);
        translateInfoBlocks(infoBlocks, state.language, projectId!, state.translatedInfoBlocks,
          (ck, content) => dispatch({ type: 'SET_TRANSLATED_INFO_BLOCKS', cacheKey: ck, content }),
          () => setTranslating(false)
        );
      }
    }
  }, [state.currentDocIndex, state.phase, state.language, documents, infoBlocks, projectId]);

  const handleLanguageSelect = (language: string) => {
    dispatch({ type: 'SELECT_LANGUAGE', language });
  };

  const handleConsentAccept = () => {
    dispatch({ type: 'ACCEPT_CONSENT', infoBlocks, documentCount: documents.length });
  };

  const handleConsentDecline = () => {
    toast.info("Du måste samtycka för att fortsätta. Stäng denna flik.");
    window.close();
  };

  const confirmInfoRead = () => {
    dispatch({ type: documents.length === 0 ? 'ALL_DOCS_COMPLETE' : 'NEXT_PHASE' });
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !state.answer) return;
    const isCorrect = state.answer.toLowerCase() === currentQuestion.correct_answer.toLowerCase();
    if (!isCorrect) {
      dispatch({ type: 'WRONG_ANSWER' });
      return;
    }
    dispatch({ type: 'CORRECT_ANSWER', questionId: currentQuestion.id, answerText: state.answer });
    toast.success(t("question.correct", lang));
    if (state.currentQuestionIndex < docQuestions.length - 1) {
      dispatch({ type: 'NEXT_QUESTION' });
    } else {
      moveToNextDocument();
    }
  };

  const goBackToDocument = () => {
    dispatch({ type: 'GO_BACK_TO_DOCUMENT' });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  const handleOtpVerified = (phone: string) => {
    dispatch({ type: 'SET_OTP_VERIFIED', phone });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.regForm.name.trim() || !state.regForm.company.trim()) return;
    try {
      if (isPreview) {
        dispatch({ type: 'SET_USER_ID', userId: 'preview-user' });
        dispatch({ type: 'NEXT_PHASE' });
      } else {
        const { data: newUser, error } = await supabase.from("project_users").insert({ name: state.regForm.name.trim(), company: state.regForm.company.trim() || null, phone: state.verifiedPhone || null }).select().single();
        if (error) throw error;
        dispatch({ type: 'SET_USER_ID', userId: newUser.id });
        dispatch({ type: 'NEXT_PHASE' });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const handleNextPerson = () => {
    dispatch({ type: 'RESET_FOR_NEXT_PERSON' });
    setInfoBlocks([]);
    setDocuments([]);
    setDocQuestions([]);
  };

  const handleFinish = () => {
    navigate(`/project/${projectId}/complete${isPreview ? '?preview=true' : ''}`);
  };

  const navigateToWorkspace = () => {
    navigate(`/project/${projectId}/workspace`);
  };

  return (
    <div className="min-h-screen bg-background">
      {isPreview && <PreviewBanner lang={lang} />}

      <header className="sticky top-0 z-10 border-b bg-card px-4 py-3" style={isPreview ? { top: '36px' } : {}}>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <HardHat className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-sm font-bold truncate">{projectName}</h1>
            <p className="text-xs text-muted-foreground">
              {state.phase === "language" && t("phase.language", lang)}
              {state.phase === "consent" && t("phase.consent", lang)}
              {state.phase === "info" && t("phase.info", lang)}
              {state.phase === "documents" && state.docSubPhase === "reading" && t("phase.documents", lang, { current: String(state.currentDocIndex + 1), total: String(documents.length) })}
              {state.phase === "documents" && state.docSubPhase === "questions" && t("phase.questions", lang, { current: String(state.currentQuestionIndex + 1), total: String(docQuestions.length) })}
              {state.phase === "register" && t("phase.register", lang)}
              {state.phase === "signature" && t("phase.signature", lang)}
              {state.phase === "done" && t("phase.done", lang)}
            </p>
          </div>
        </div>
        {documents.length > 0 && <Progress value={progress} className="mt-2 h-1.5" />}
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-24">
        {state.phase === "consent" && <ConsentScreen lang={lang} onAccept={handleConsentAccept} onDecline={handleConsentDecline} />}

        {state.phase === "language" && <LanguagePhase projectName={projectName} supportedLanguages={supportedLanguages} onSelect={handleLanguageSelect} />}

        {state.phase === "info" && <InfoPhase infoBlocks={infoBlocks} selectedLanguage={state.language || ""} translatedInfoBlocks={state.translatedInfoBlocks} translating={translating} lang={lang} onConfirm={confirmInfoRead} />}

        {state.phase === "documents" && currentDoc && (
          <DocumentReadingPhase
            currentDoc={currentDoc} currentDocIndex={state.currentDocIndex} documentsLength={documents.length} docSubPhase={state.docSubPhase}
            smartViewData={smartViewData} isApdPlan={isApdPlan} hasScrolledToBottom={state.hasScrolledToBottom} searchTerm={state.searchTerm}
            extractionStatus={extractionStatus ?? null} extractionError={extractionError ?? null} mobileHtml={mobileHtml ?? null}
            lang={lang} selectedLanguage={state.language || ""} translating={translating} translationFailed={state.translationFailed}
            isTranslated={isTranslated} hasValidTranslation={hasValidTranslation} effectiveSmartViewData={effectiveSmartViewData}
            projectId={projectId} docQuestions={docQuestions} currentQuestionIndex={state.currentQuestionIndex} currentQuestion={currentQuestion}
            answer={state.answer} wrongAnswer={state.wrongAnswer}
            currentTranslatedQuestions={currentTranslatedQuestions as { index: number; question_text: string; options?: string[] }[] | undefined}
            questionsAnswered={state.questionsAnswered}
            onSearchChange={(term) => dispatch({ type: 'SET_SEARCH_TERM', term })} onConfirmDocRead={confirmDocRead}
            onSetAnswer={(answer) => dispatch({ type: 'SET_ANSWER', answer })} onSubmitAnswer={submitAnswer}
            onGoBackToDocument={goBackToDocument} onSetScrolled={() => dispatch({ type: 'SET_SCROLLED' })}
          />
        )}

        {state.phase === "register" && (
          <RegisterPhase verifiedPhone={state.verifiedPhone} regForm={state.regForm} regLoading={false} lang={lang}
            onOtpVerified={handleOtpVerified} onRegisterFormChange={(field, value) => dispatch({ type: 'SET_REGISTER_FORM', field, value })} onRegister={handleRegister} />
        )}

        {state.phase === "signature" && (
          <SignaturePhase regForm={state.regForm} signatureDataUrl={state.signatureDataUrl} signLoading={false} lang={lang}
            onSignatureChange={(dataUrl) => dispatch({ type: 'SET_SIGNATURE', dataUrl })} onSign={handleSign} />
        )}

        {state.phase === "done" && (
          <DonePhase isPreview={isPreview} signCount={state.signCount} regForm={state.regForm} lang={lang}
            onNextPerson={handleNextPerson} onFinish={handleFinish} navigateToWorkspace={navigateToWorkspace} />
        )}
      </main>
    </div>
  );
};

export default ProjectRead;
