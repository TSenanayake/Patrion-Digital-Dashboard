import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HardHat, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card px-4 py-3">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <HardHat className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="font-display text-lg font-bold">Integritetspolicy</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Integritetspolicy</CardTitle>
            <p className="text-sm text-muted-foreground">Senast uppdaterad: 23 maj 2026</p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-semibold text-base">Personuppgiftsansvarig</h2>
              <p>Digital Arbetstavla AB</p>
              <p>556123-4567</p>
              <p>Byggvägen 1, 111 22 Stockholm</p>
              <p>info@digitalarbetstavla.se</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold text-base">Vilka uppgifter samlar vi in?</h2>
              <p>Vi samlar in följande personuppgifter när du registrerar dig och signerar dokument:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Namn</li>
                <li>Företag</li>
                <li>Telefonnummer (om angivet)</li>
                <li>E-postadress (om angiven)</li>
                <li>Signatur</li>
                <li>Information om vilka dokument du läst och besvarat</li>
                <li>Tidpunkt för registrering och signering</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold text-base">Hur länge sparas uppgifterna?</h2>
              <p>Uppgifter sparas i 2 år efter projektets slutdatum eller enligt gällande lagkrav. Om ingen specifik projektperiod finns behålls uppgifterna i 2 år från tidpunkten för signering.</p>
              <p>Data som inte längre behövs för ändamålet raderas eller anonymiseras regelbundet.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold text-base">Ändamål för behandlingen</h2>
              <p>Dina personuppgifter behandlas för att:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Verifiera att du tagit del av projektdokumentation</li>
                <li>Uppfylla lagliga krav på dokumentation av arbetsmiljöinformation</li>
                <li>Kunna kontakta dig vid behov gällande projektet</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold text-base">Rättslig grund</h2>
              <p>Behandlingen av dina personuppgifter baseras på:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ditt samtycke (GDPR artikel 6.1.a)</li>
                <li>Rättslig förpliktelse (GDPR artikel 6.1.c) - krav på dokumentation enligt arbetsmiljölagstiftningen</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold text-base">Dina rättigheter</h2>
              <p>Du har rätt att:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Tillgång:</strong> Få bekräftelse på om vi behandlar dina personuppgifter och få tillgång till dessa</li>
                <li><strong>Rättelse:</strong> Få felaktiga personuppgifter rättade</li>
                <li><strong>Radering:</strong> Få dina personuppgifter raderade under vissa förutsättningar</li>
                <li><strong>Begränsning:</strong> Få behandlingen begränsad</li>
                <li><strong>Dataportabilitet:</strong> Få dina uppgifter i ett strukturerat, maskinläsbart format</li>
                <li><strong>Invända:</strong> Invända mot behandling baserad på berättigat intresse</li>
              </ul>
              <p>För att utöva dina rättigheter, kontakta oss på dataskydd@digitalarbetstavla.se.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold text-base">Mottagare av uppgifter</h2>
              <p>Dina personuppgifter delas inte med tredje part utanför Digital Arbetstavla AB förutom när det krävs enligt lag eller för att uppfylla våra lagliga förpliktelser.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold text-base">Överföring utanför EU/EES</h2>
              <p>Vi överför inte dina personuppgifter till länder utanför EU eller EES.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold text-base">Kontakt</h2>
              <p>Om du har frågor om vår behandling av dina personuppgifter eller vill utöva dina rättigheter, kontakta oss:</p>
              <p>Digital Arbetstavla AB</p>
              <p>Byggvägen 1, 111 22 Stockholm</p>
              <p>dataskydd@digitalarbetstavla.se</p>
              <p>08-123 45 67</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold text-base">Klagomål</h2>
              <p>Om du anser att vår behandling av dina personuppgifter strider mot GDPR har du rätt att lämna in ett klagomål till Integritetsskyddsmyndigheten (IMY).</p>
            </section>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t bg-card mt-8">
        <div className="max-w-3xl mx-auto px-6 py-4 text-center text-xs text-muted-foreground">
          <p>Digital Dashboard - GDPR-compliant worker consent management</p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
