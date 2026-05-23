import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PenTool, Loader2 } from "lucide-react";
import { t, type SupportedLanguage } from "@/lib/i18n";
import SignaturePad from "@/components/project/SignaturePad";

interface SignaturePhaseProps {
  regForm: { name: string; company: string; phone: string };
  signatureDataUrl: string | null;
  signLoading: boolean;
  lang: SupportedLanguage;
  onSignatureChange: (dataUrl: string | null) => void;
  onSign: () => void;
}

export function SignaturePhase({
  regForm,
  signatureDataUrl,
  signLoading,
  lang,
  onSignatureChange,
  onSign,
}: SignaturePhaseProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <PenTool className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-display text-lg">{t("signature.title", lang)}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {regForm.name} – {regForm.company}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignaturePad onSignatureChange={onSignatureChange} />
          <Button
            onClick={onSign}
            className="w-full"
            size="lg"
            disabled={!signatureDataUrl || signLoading}
          >
            {signLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("signature.signing", lang)}</>
            ) : (
              <><PenTool className="mr-2 h-5 w-5" /> {t("signature.sign", lang)}</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
