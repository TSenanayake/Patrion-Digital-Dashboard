import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, UserPlus } from "lucide-react";
import { t, type SupportedLanguage } from "@/lib/i18n";

interface DonePhaseProps {
  isPreview: boolean;
  signCount: number;
  regForm: { name: string };
  lang: SupportedLanguage;
  onNextPerson: () => void;
  onFinish: () => void;
  navigateToWorkspace: () => void;
}

export function DonePhase({
  isPreview,
  signCount,
  regForm,
  lang,
  onNextPerson,
  onFinish,
  navigateToWorkspace,
}: DonePhaseProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
        <CheckCircle className="h-10 w-10 text-success" />
      </div>
      <h2 className="font-display text-2xl font-bold mb-2">
        {isPreview ? t("done.previewTitle", lang) : t("done.title", lang)}
      </h2>
      <p className="text-muted-foreground mb-2">
        {isPreview
          ? t("done.previewSubtitle", lang)
          : t("done.subtitle", lang, { name: regForm.name })}
      </p>
      {signCount > 0 && !isPreview && (
        <p className="text-xs text-muted-foreground mb-6">
          {signCount > 1
            ? t("done.countPlural", lang, { count: signCount })
            : t("done.count", lang, { count: signCount })}
        </p>
      )}
      <div className="w-full max-w-xs space-y-3">
        {!isPreview && (
          <>
            <Button
              onClick={navigateToWorkspace}
              variant="default"
              size="lg"
              className="w-full gap-2"
            >
              <FileText className="h-5 w-5" /> {t("done.viewDocuments", lang)}
            </Button>
            <Button onClick={onNextPerson} variant="outline" size="lg" className="w-full gap-2">
              <UserPlus className="h-5 w-5" /> {t("done.nextPerson", lang)}
            </Button>
          </>
        )}
        <Button onClick={onFinish} variant={isPreview ? "default" : "ghost"} size="lg" className="w-full">
          {t("done.finish", lang)}
        </Button>
      </div>
    </div>
  );
}
