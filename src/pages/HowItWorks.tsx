import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, HardHat, Shield, FileText, QrCode, 
  Users, Building, CheckCircle2, Globe, MousePointerClick, 
  Smartphone, FileCheck, Clock, Download
} from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-primary/30 overflow-hidden pb-24">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-amber-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <header className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <HardHat className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight hidden sm:block">Digital Arbetstavla</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Tillbaka</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/portal">Logga in</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-16">
          <div className="max-w-4xl w-full">
            
            {/* Header */}
            <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                Hur fungerar det?
              </h1>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Tänk på det som ett <span className="text-primary font-semibold">digitalt incheckningssystem för byggarbetsplatser</span>. Istället för pappersdokument som ingen läser, måste alla digitalt bekräfta att de har läst och förstått viktiga säkerhets- och projektdokument innan de kan börja arbeta.
              </p>
            </div>

            {/* Two Types of Users */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
              {/* Admin Card */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Building className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-display font-bold">1. Platschefen (Du)</h2>
                </div>
                <p className="text-slate-400 mb-6">
                  Du driver byggarbetsplatsen. Du måste se till att varje arbetare har läst de viktiga dokumenten.
                </p>
                <ul className="space-y-4">
                  {[
                    { title: "Skapa Projekt", desc: "Sätt upp en ny arbetsplats med namn och datum." },
                    { title: "Lägg till Dokument", desc: "Ladda upp säkerhetsplaner, kemikalieförteckningar etc." },
                    { title: "Granska Signaturer", desc: "Se vem som har registrerat och bekräftat dokument." },
                    { title: "Generera QR-kod", desc: "Skapa en QR-kod som arbetarna skannar för åtkomst." }
                  ].map((f, i) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-200 block">{f.title}</strong>
                        <span className="text-slate-400 text-sm">{f.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Worker Card */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                    <Users className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-display font-bold">2. Arbetare & Besökare</h2>
                </div>
                <p className="text-slate-400 mb-6">
                  Dessa är personerna som kommer till din byggarbetsplats. Deras upplevelse är snabb och tydlig.
                </p>
                <ul className="space-y-4">
                  {[
                    { title: "Skanna QR & Välj Språk", desc: "Skannar en kod och väljer t.ex. Svenska eller Engelska." },
                    { title: "Läs & Skrolla", desc: "Går igenom varje obligatoriskt dokument till botten." },
                    { title: "Svara på Frågor", desc: "Svarar på en enkel fråga för att bevisa förståelse." },
                    { title: "Signera Digitalt", desc: "Skriver under på skärmen för att slutföra incheckningen." }
                  ].map((f, i) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-200 block">{f.title}</strong>
                        <span className="text-slate-400 text-sm">{f.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Day in the Life Timeline */}
            <h2 className="text-3xl font-display font-bold mb-12 text-center">En typisk morgon på bygget</h2>
            <div className="relative border-l border-white/10 ml-4 md:ml-8 mb-24 space-y-12 pb-4">
              {/* Worker Timeline */}
              <div className="relative pl-8 md:pl-12">
                <div className="absolute -left-4 top-1 h-8 w-8 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center">
                  <Users className="h-4 w-4 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-4">Arbetaren anländer</h3>
                <div className="grid gap-3 text-slate-400">
                  <p className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-slate-500" /> Skannar QR-koden vid grinden och väljer engelska.</p>
                  <p className="flex items-center gap-2"><FileText className="h-4 w-4 text-slate-500" /> Öppnar "Arbetsmiljöplanen", skrollar igenom och svarar "Ja" på frågan om hjälmtvång.</p>
                  <p className="flex items-center gap-2"><Shield className="h-4 w-4 text-slate-500" /> Fyller i sina uppgifter, verifierar via SMS och signerar på skärmen.</p>
                  <p className="flex items-center gap-2 text-primary font-medium mt-2"><CheckCircle2 className="h-4 w-4" /> Registrering klar! Alla dokument finns nu i mobilen.</p>
                </div>
              </div>

              {/* Admin Timeline */}
              <div className="relative pl-8 md:pl-12">
                <div className="absolute -left-4 top-1 h-8 w-8 rounded-full bg-slate-900 border-2 border-primary flex items-center justify-center">
                  <Building className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-4">Platschefen (Du) checkar status</h3>
                <div className="grid gap-3 text-slate-400">
                  <p className="flex items-center gap-2"><Globe className="h-4 w-4 text-slate-500" /> Loggar in i admin-portalen.</p>
                  <p className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-500" /> Ser direkt: 12 arbetare registrerade idag, alla har slutfört sina dokument.</p>
                  <p className="flex items-center gap-2"><Download className="h-4 w-4 text-slate-500" /> Laddar ner den dagliga närvarolistan som Excel.</p>
                </div>
              </div>
            </div>

            {/* Key Features Table/Grid */}
            <h2 className="text-3xl font-display font-bold mb-8 text-center">Smarta funktioner som gör skillnad</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-24">
              {[
                { icon: Globe, title: "Språkstöd", desc: "Utländska arbetare kan läsa på sitt eget modersmål." },
                { icon: MousePointerClick, title: "Skroll-kontroll", desc: "Arbetare kan inte hoppa över dokument - de måste skrolla igenom." },
                { icon: FileCheck, title: "Kunskapsfrågor", desc: "Säkerställer att de förstått innehållet, inte bara skrollat." },
                { icon: Shield, title: "Digital Signatur", desc: "Juridisk bekräftelse på att de har godkänt villkoren." },
                { icon: QrCode, title: "QR-koder", desc: "Enkel åtkomst - bara skanna och kör." },
                { icon: FileText, title: "Kategorier & Sök", desc: "Organiserad vy för säkerhetsplaner och kemikalier, med sökfunktion." }
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-4 bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl">
                  <div className="p-2 rounded-lg bg-white/5 text-slate-300 shrink-0">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-200 mb-1">{f.title}</h4>
                    <p className="text-sm text-slate-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 md:p-12 text-center">
              <h2 className="text-3xl font-display font-bold mb-8">Vad du får ut av det</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                  <div className="text-primary font-bold text-xl mb-2">Inga Papper</div>
                  <p className="text-slate-400 text-sm">Allt är 100% digitalt och sökbart.</p>
                </div>
                <div>
                  <div className="text-primary font-bold text-xl mb-2">Fullt Bevis</div>
                  <p className="text-slate-400 text-sm">Du kan bevisa att varje arbetare läst rätt dokument.</p>
                </div>
                <div>
                  <div className="text-primary font-bold text-xl mb-2">Juridiskt Giltigt</div>
                  <p className="text-slate-400 text-sm">Digitala signaturer och exporterbara register.</p>
                </div>
              </div>
              
              <div className="mt-12 pt-12 border-t border-primary/10">
                <p className="text-xl text-slate-300 font-medium mb-6">
                  Du sätter upp det en gång, delar QR-koden, och systemet sköter resten.
                </p>
                <Button asChild size="lg" className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full text-lg shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                  <Link to="/portal">Kom igång med ditt första projekt</Link>
                </Button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
