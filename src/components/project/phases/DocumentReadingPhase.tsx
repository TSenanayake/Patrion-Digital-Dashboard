import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Search,
  ExternalLink,
  CheckCircle,
  Loader2,
  AlertCircle,
  Globe,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { t, getCategoryLabel, type SupportedLanguage } from "@/lib/i18n";
import SmartView from "@/lib/smartView/SmartView";
import ApdPlanViewer from "@/components/project/ApdPlanViewer";
import DocumentImageGallery from "@/components/project/DocumentImageGallery";
import type { Document, Question } from "@/integrations/supabase/types";
import type { SmartViewData, SmartViewSection } from "@/lib/smartView/types";

interface DocumentReadingPhaseProps {
  currentDoc: Document | null;
  currentDocIndex: number;
  documentsLength: number;
  docSubPhase: "reading" | "questions";
  smartViewData: SmartViewData | null;
  isApdPlan: boolean;
  hasScrolledToBottom: boolean;
  searchTerm: string;
  extractionStatus: string | null;
  extractionError: string | null;
  mobileHtml: string | null;
  lang: SupportedLanguage;
  selectedLanguage: string;
  translating: boolean;
  translationFailed: boolean;
  isTranslated: boolean;
  hasValidTranslation: boolean;
  effectiveSmartViewData: SmartViewData | null;
  projectId: string | undefined;
  docQuestions: Question[];
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  answer: string;
  wrongAnswer: boolean;
  currentTranslatedQuestions: { index: number; question_text: string; options?: string[] }[] | undefined;
  questionsAnswered: { question_id: string; answer: string }[];
  onSearchChange: (term: string) => void;
  onConfirmDocRead: () => void;
  onSetAnswer: (answer: string) => void;
  onSubmitAnswer: () => void;
  onGoBackToDocument: () => void;
  onSetScrolled: () => void;
}

export function DocumentReadingPhase({
  currentDoc,
  currentDocIndex,
  documentsLength,
  docSubPhase,
  smartViewData,
  isApdPlan,
  hasScrolledToBottom,
  searchTerm,
  extractionStatus,
  extractionError,
  mobileHtml,
  lang,
  selectedLanguage,
  translating,
  translationFailed,
  isTranslated,
  hasValidTranslation,
  effectiveSmartViewData,
  projectId,
  docQuestions,
  currentQuestionIndex,
  currentQuestion,
  answer,
  wrongAnswer,
  currentTranslatedQuestions,
  questionsAnswered,
  onSearchChange,
  onConfirmDocRead,
  onSetAnswer,
  onSubmitAnswer,
  onGoBackToDocument,
  onSetScrolled,
}: DocumentReadingPhaseProps) {
  const docContentRef = useRef<HTMLDivElement>(null);
  const languageLabel: Record<string, string> = { en: "English", pl: "Polski", es: "Español", sv: "Svenska" };

  useEffect(() => {
    if (docSubPhase !== "reading" || !currentDoc) return;
    const timer = setTimeout(() => {
      const el = docContentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.bottom <= window.innerHeight + 80) {
        onSetScrolled();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentDocIndex, currentDoc, docSubPhase]);

  if (docSubPhase === "questions" && currentQuestion) {
    return (
      <QuestionView
        currentDoc={currentDoc}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        docQuestionsLength={docQuestions.length}
        answer={answer}
        wrongAnswer={wrongAnswer}
        lang={lang}
        selectedLanguage={selectedLanguage}
        currentTranslatedQuestions={currentTranslatedQuestions}
        questionsAnswered={questionsAnswered}
        onSetAnswer={onSetAnswer}
        onSubmitAnswer={onSubmitAnswer}
        onGoBackToDocument={onGoBackToDocument}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="font-display text-lg">{currentDoc?.title}</CardTitle>
              {smartViewData?.category && smartViewData.category !== "ovrigt" && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {getCategoryLabel(smartViewData.category, lang)}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">v{currentDoc?.version_number}</span>
          </div>
        </CardHeader>
        <CardContent>
          {isApdPlan && currentDoc?.original_file_url ? (
            <ApdPlanViewer fileUrl={currentDoc.original_file_url} title={currentDoc.title} />
          ) : (
            <>
              {selectedLanguage !== "sv" && translating ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 px-4 py-6 mb-4 animate-pulse">
                  <Globe className="h-8 w-8 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="text-sm font-medium text-primary">{t("translate.translating", lang, { lang: languageLabel[selectedLanguage] || selectedLanguage })}</span>
                  <span className="text-xs text-muted-foreground">{t("doc.generatingWait", lang)}</span>
                </div>
              ) : selectedLanguage !== "sv" && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 mb-4">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    {isTranslated ? (
                      <span className="text-xs text-muted-foreground">
                        {languageLabel[selectedLanguage]} · {t("translate.autoTranslated", lang)}
                      </span>
                    ) : translationFailed ? (
                      <span className="text-xs text-muted-foreground">
                        {t("translate.fallback", lang)}
                      </span>
                    ) : null}
                  </div>
                </div>
              )}

              {extractionStatus === "success" && (
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t("doc.searchPlaceholder", lang)}
                    className="h-9"
                  />
                </div>
              )}

              {extractionStatus === "success" ? (
                <div ref={docContentRef} className="rounded-lg border bg-background p-4">
                  {smartViewData && smartViewData.sections && smartViewData.sections.length > 0 ? (
                    <SmartView
                      key={`smartview-${currentDocIndex}`}
                      data={effectiveSmartViewData!}
                      searchTerm={searchTerm}
                      projectId={projectId}
                      isTranslated={hasValidTranslation}
                    />
                  ) : mobileHtml ? (
                    <div
                      className="prose prose-sm max-w-none
                        [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2
                        [&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
                        [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-3
                        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
                        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
                        [&_li]:text-sm [&_li]:mb-1
                        [&_pre]:text-xs [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:mb-3
                        [&_hr]:my-4 [&_hr]:border-border"
                      dangerouslySetInnerHTML={{
                        __html: searchTerm
                          ? mobileHtml.replace(
                              new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi"),
                              '<mark style="background: hsl(38 92% 50% / 0.3); padding: 0 2px; border-radius: 2px;">$1</mark>'
                            )
                          : mobileHtml,
                      }}
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {currentDoc?.extracted_text || t("doc.noText", lang)}
                    </p>
                  )}
                </div>
              ) : extractionStatus === "pending" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">{t("doc.generatingSmartView", lang)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("doc.generatingWait", lang)}</p>
                </div>
              ) : extractionStatus === "failed" ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-8 w-8 text-destructive mb-4" />
                  <p className="text-sm font-medium mb-1">{t("doc.extractionFailed", lang)}</p>
                  <p className="text-xs text-muted-foreground mb-4">{extractionError || t("doc.openOriginal", lang)}</p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {currentDoc?.extracted_text || t("doc.noText", lang)}
                  </p>
                </div>
              )}

              {currentDoc?.original_file_url && (
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <a href={currentDoc.original_file_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> {t("doc.viewOriginal", lang)}
                  </a>
                </Button>
              )}
            </>
          )}

          <DocumentImageGallery documentId={currentDoc?.id || ""} />
        </CardContent>
      </Card>

      <div className="h-24" />

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-card px-4 py-3 shadow-lg">
        <div className="max-w-2xl mx-auto space-y-1">
          {extractionStatus === "success" && !hasScrolledToBottom && (
            <p className="text-center text-xs text-muted-foreground animate-pulse">
              {t("doc.scrollHint", lang)}
            </p>
          )}
          <Button
            onClick={onConfirmDocRead}
            className="w-full"
            size="lg"
            disabled={extractionStatus === "success" && !hasScrolledToBottom}
          >
            <CheckCircle className="mr-2 h-5 w-5" /> {t("doc.confirmRead", lang)}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface QuestionViewProps {
  currentDoc: Document | null;
  currentQuestion: Question;
  currentQuestionIndex: number;
  docQuestionsLength: number;
  answer: string;
  wrongAnswer: boolean;
  lang: SupportedLanguage;
  selectedLanguage: string;
  currentTranslatedQuestions: { index: number; question_text: string; options?: string[] }[] | undefined;
  questionsAnswered: { question_id: string; answer: string }[];
  onSetAnswer: (answer: string) => void;
  onSubmitAnswer: () => void;
  onGoBackToDocument: () => void;
}

function QuestionView({
  currentDoc,
  currentQuestion,
  currentQuestionIndex,
  docQuestionsLength,
  answer,
  wrongAnswer,
  lang,
  selectedLanguage,
  currentTranslatedQuestions,
  questionsAnswered,
  onSetAnswer,
  onSubmitAnswer,
  onGoBackToDocument,
}: QuestionViewProps) {
  let displayQuestionText = currentQuestion.question_text;
  let displayOptions = currentQuestion.options;

  if (selectedLanguage !== "sv" && currentTranslatedQuestions?.length > 0) {
    const tq = currentTranslatedQuestions.find((q) => q.index === currentQuestionIndex);
    if (tq) {
      displayQuestionText = tq.question_text || displayQuestionText;
      if (tq.options) displayOptions = tq.options;
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">
            {currentDoc?.title} – {t("question.title", lang)}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("phase.questions", lang, { current: String(currentQuestionIndex + 1), total: String(docQuestionsLength) })}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {wrongAnswer && (
            <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
                <div>
                  <p className="text-base font-bold text-destructive">{t("question.wrong", lang)}</p>
                  <p className="text-sm text-destructive/80 mt-0.5">{t("question.wrongHint", lang)}</p>
                </div>
              </div>
              <Button onClick={onGoBackToDocument} variant="outline" size="lg" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
                <FileText className="mr-2 h-5 w-5" /> {t("question.backToDocument", lang)}
              </Button>
            </div>
          )}

          <p className="text-base font-medium leading-relaxed">{displayQuestionText}</p>

          {currentQuestion.question_type === "true_false" ? (
            <RadioGroup value={answer} onValueChange={(v) => onSetAnswer(v)} className="gap-4">
              <label htmlFor="true" className="flex items-center gap-4 rounded-lg border-2 p-4 min-h-[60px] cursor-pointer transition-colors hover:bg-accent [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                <RadioGroupItem value="true" id="true" />
                <span className="text-base font-medium">{t("question.true", lang)}</span>
              </label>
              <label htmlFor="false" className="flex items-center gap-4 rounded-lg border-2 p-4 min-h-[60px] cursor-pointer transition-colors hover:bg-accent [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                <RadioGroupItem value="false" id="false" />
                <span className="text-base font-medium">{t("question.false", lang)}</span>
              </label>
            </RadioGroup>
          ) : (
            <RadioGroup value={answer} onValueChange={(v) => onSetAnswer(v)} className="gap-4">
              {((displayOptions as string[]) || []).map((opt: string, i: number) => {
                const originalOptions = (currentQuestion.options as string[]) || [];
                return (
                  <label key={i} htmlFor={`opt-${i}`} className="flex items-center gap-4 rounded-lg border-2 p-4 min-h-[60px] cursor-pointer transition-colors hover:bg-accent [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                    <RadioGroupItem value={originalOptions[i] || opt} id={`opt-${i}`} />
                    <span className="text-base font-medium">{opt}</span>
                  </label>
                );
              })}
            </RadioGroup>
          )}

          <Button onClick={onSubmitAnswer} className="w-full" size="lg" disabled={!answer}>
            {t("question.answer", lang)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
