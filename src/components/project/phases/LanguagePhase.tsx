import React from "react";
import { Button } from "@/components/ui/button";
import { HardHat } from "lucide-react";
import { t, type SupportedLanguage } from "@/lib/i18n";

interface LanguagePhaseProps {
  projectName: string;
  supportedLanguages: SupportedLanguage[];
  onSelect: (language: string) => void;
}

export function LanguagePhase({ projectName, supportedLanguages, onSelect }: LanguagePhaseProps) {
  const lang: SupportedLanguage = "sv";

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-primary">
        <HardHat className="h-7 w-7 text-primary-foreground" />
      </div>
      <h2 className="font-display text-xl font-bold mb-1">{projectName}</h2>
      <p className="text-muted-foreground text-sm mb-8">{t("language.select", lang)}</p>
      <div className="w-full max-w-xs space-y-4">
        {supportedLanguages.map((langCode) => {
          const langInfo: Record<string, { label: string; flag: string }> = {
            sv: { label: "Svenska", flag: "🇸🇪" },
            en: { label: "English", flag: "🇬🇧" },
            pl: { label: "Polski", flag: "🇵🇱" },
            es: { label: "Español", flag: "🇪🇸" },
          };
          const info = langInfo[langCode] || { label: langCode, flag: "🌐" };
          return (
            <Button
              key={langCode}
              variant="outline"
              size="lg"
              className="w-full justify-start gap-4 text-lg"
              onClick={() => onSelect(langCode)}
            >
              <span className="text-2xl">{info.flag}</span>
              {info.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
