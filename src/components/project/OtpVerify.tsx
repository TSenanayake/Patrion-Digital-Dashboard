import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { sendPhoneOTP, verifyPhoneOTP } from "@/lib/otp";
import { t, type SupportedLanguage } from "@/lib/i18n";
import { Phone, Loader2, AlertCircle } from "lucide-react";

interface OtpVerifyProps {
  lang: SupportedLanguage;
  onVerified: (phone: string) => void;
}

const OtpVerify: React.FC<OtpVerifyProps> = ({ lang, onVerified }) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setError(t("otp.phoneTooShort", lang));
      return;
    }

    setLoading(true);
    try {
      const result = await sendPhoneOTP(phone);
      if (result.success) {
        setStep("otp");
      } else {
        setError(result.error || t("otp.sendFailed", lang));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError(t("otp.enterCode", lang));
      return;
    }

    setLoading(true);
    try {
      const result = await verifyPhoneOTP(phone, otp);
      if (result.success) {
        onVerified(phone);
      } else {
        setError(result.error || t("otp.wrongCode", lang));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    setError(null);
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(null);
  };

  const handleBack = () => {
    setStep("phone");
    setOtp("");
    setError(null);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Phone className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="font-display text-lg">{t("otp.verifyTitle", lang)}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{t("otp.codeSent", lang)}</p>
      </CardHeader>
      <CardContent>
        {step === "phone" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t("register.phone", lang)}</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+46 70 123 4567"
                required
                autoComplete="tel"
                className="text-lg h-12"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("otp.sending", lang)}</>
              ) : (
                t("otp.sendCode", lang)
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("otp.enterCode", lang)}</Label>
              <p className="text-sm text-muted-foreground">{phone}</p>
              <div className="flex justify-center pt-2">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  render={({ slots }) => (
                    <InputOTPGroup>
                      {slots.map((slot, index) => (
                        <InputOTPSlot key={index} {...slot} index={index} />
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading || otp.length !== 6}>
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("otp.verifying", lang)}</>
              ) : (
                t("otp.verify", lang)
              )}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={handleBack}>
              {t("otp.changePhone", lang)}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default OtpVerify;
