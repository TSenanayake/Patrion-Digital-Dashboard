import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { t, type SupportedLanguage } from "@/lib/i18n";
import OtpVerify from "@/components/project/OtpVerify";

interface RegisterPhaseProps {
  verifiedPhone: string;
  regForm: { name: string; company: string; phone: string };
  regLoading: boolean;
  lang: SupportedLanguage;
  onOtpVerified: (phone: string) => void;
  onRegisterFormChange: (field: "name" | "company" | "phone", value: string) => void;
  onRegister: (e: React.FormEvent) => void;
}

export function RegisterPhase({
  verifiedPhone,
  regForm,
  regLoading,
  lang,
  onOtpVerified,
  onRegisterFormChange,
  onRegister,
}: RegisterPhaseProps) {
  return (
    <div className="space-y-4">
      {!verifiedPhone ? (
        <OtpVerify lang={lang} onVerified={onOtpVerified} />
      ) : (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-display text-lg">{t("register.title", lang)}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t("otp.verified", lang)}: {verifiedPhone}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onRegister} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("register.name", lang)} *</Label>
                <Input
                  value={regForm.name}
                  onChange={(e) => onRegisterFormChange("name", e.target.value)}
                  placeholder={t("register.namePlaceholder", lang)}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("register.company", lang)} *</Label>
                <Input
                  value={regForm.company}
                  onChange={(e) => onRegisterFormChange("company", e.target.value)}
                  placeholder={t("register.companyPlaceholder", lang)}
                  required
                  autoComplete="off"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={regLoading}>
                {regLoading ? t("register.loading", lang) : t("register.continue", lang)}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
