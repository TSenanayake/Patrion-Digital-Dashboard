import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { t, type SupportedLanguage } from '@/lib/i18n';

interface ConsentScreenProps {
  lang: SupportedLanguage;
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentScreen({ lang, onAccept, onDecline }: ConsentScreenProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-2xl w-full bg-card rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4">{t('consent.title', lang)}</h2>
        
        <div className="space-y-4 text-sm text-muted-foreground mb-6 max-h-96 overflow-y-auto">
          <section>
            <h3 className="font-semibold text-base text-foreground">{t('consent.dataCollected', lang)}</h3>
            <p>{t('consent.dataCollectedText', lang)}</p>
          </section>
          
          <section>
            <h3 className="font-semibold text-base text-foreground">{t('consent.retention', lang)}</h3>
            <p>{t('consent.retentionText', lang)}</p>
          </section>
          
          <section>
            <h3 className="font-semibold text-base text-foreground">{t('consent.controller', lang)}</h3>
            <p>{t('consent.controllerText', lang)}</p>
          </section>
          
          <section>
            <h3 className="font-semibold text-base text-foreground">{t('consent.rights', lang)}</h3>
            <p>{t('consent.rightsText', lang)}</p>
          </section>
          
          <section>
            <h3 className="font-semibold text-base text-foreground">{t('consent.privacyPolicy', lang)}</h3>
            <p>
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                {t('consent.privacyPolicyLink', lang)}
              </a>
            </p>
          </section>
        </div>

        <label className="flex items-start gap-3 mb-6">
          <Checkbox
            id="consent-checkbox"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked as boolean)}
          />
          <span className="text-sm">{t('consent.acceptTerms', lang)}</span>
        </label>

        <div className="flex gap-4">
          <Button
            onClick={onDecline}
            variant="outline"
            className="flex-1"
          >
            {t('consent.decline', lang)}
          </Button>
          <Button
            onClick={onAccept}
            disabled={!accepted}
            className="flex-1"
          >
            {t('consent.accept', lang)}
          </Button>
        </div>
      </div>
    </div>
  );
}
