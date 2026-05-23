import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Globe } from "lucide-react";
import { t, type SupportedLanguage } from "@/lib/i18n";
import type { InfoBlock } from "@/integrations/supabase/types";

interface InfoPhaseProps {
  infoBlocks: InfoBlock[];
  selectedLanguage: string;
  translatedInfoBlocks: Record<string, string[]>;
  translating: boolean;
  lang: SupportedLanguage;
  onConfirm: () => void;
}

export function InfoPhase({
  infoBlocks,
  selectedLanguage,
  translatedInfoBlocks,
  translating,
  lang,
  onConfirm,
}: InfoPhaseProps) {
  const languageLabel: Record<string, string> = { en: "English", pl: "Polski", es: "Español", sv: "Svenska" };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">{t("info.title", lang)}</h2>
      {translating && selectedLanguage !== "sv" && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 px-4 py-6 animate-pulse">
          <Globe className="h-8 w-8 text-primary animate-spin" style={{ animationDuration: '3s' }} />
          <span className="text-sm font-medium text-primary">{t("translate.translating", lang, { lang: languageLabel[selectedLanguage] || selectedLanguage })}</span>
          <span className="text-xs text-muted-foreground">{t("doc.generatingWait", lang)}</span>
        </div>
      )}
      {infoBlocks.map((block) => {
        const cacheKey = `info_${selectedLanguage}`;
        const translatedContent = selectedLanguage !== "sv" && translatedInfoBlocks[cacheKey]?.[0];
        return (
          <Card key={block.id}>
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {translatedContent || block.content}
              </p>
            </CardContent>
          </Card>
        );
      })}
      <Button onClick={onConfirm} className="w-full" size="lg">
        <CheckCircle className="mr-2 h-5 w-5" /> {t("info.confirm", lang)}
      </Button>
    </div>
  );
}
