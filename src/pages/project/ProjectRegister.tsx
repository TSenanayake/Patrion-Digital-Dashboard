import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OtpVerify from "@/components/project/OtpVerify";
import { t, type SupportedLanguage } from "@/lib/i18n";
import { UserPlus, Loader2 } from "lucide-react";

interface ProjectRegisterProps {
  lang: SupportedLanguage;
  phone: string;
  onVerified: (phone: string) => void;
  onRegister: (data: { name: string; company: string; phone: string }) => Promise<void>;
  loading: boolean;
}

const ProjectRegister: React.FC<ProjectRegisterProps> = ({
  lang,
  phone,
  onVerified,
  onRegister,
  loading,
}) => {
  const [verifiedPhone, setVerifiedPhone] = useState<string>(phone || "");
  const [otpVerified, setOtpVerified] = useState(false);
  const [regForm, setRegForm] = useState({ name: "", company: "" });

  const handleOtpVerified = (phoneNumber: string) => {
    setVerifiedPhone(phoneNumber);
    setOtpVerified(true);
    onVerified(phoneNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.company.trim()) return;
    await onRegister({
      name: regForm.name.trim(),
      company: regForm.company.trim(),
      phone: verifiedPhone,
    });
  };

  if (!otpVerified) {
    return <OtpVerify lang={lang} onVerified={handleOtpVerified} />;
  }

  return (
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("register.name", lang)} *</Label>
            <Input
              value={regForm.name}
              onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
              placeholder={t("register.namePlaceholder", lang)}
              required
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("register.company", lang)} *</Label>
            <Input
              value={regForm.company}
              onChange={(e) => setRegForm({ ...regForm, company: e.target.value })}
              placeholder={t("register.companyPlaceholder", lang)}
              required
              autoComplete="off"
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("register.loading", lang)}</>
            ) : (
              t("register.continue", lang)
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectRegister;
