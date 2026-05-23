import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, HardHat, Shield, FileText, QrCode, Users, Building, CheckCircle2, ChevronRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-primary/30 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-amber-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <header className="px-6 py-4 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <HardHat className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">Digital Arbetstavla</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
              Så fungerar det
            </Link>
            <Button asChild variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
              <Link to="/portal">Logga in</Link>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-12 pb-24">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full max-w-7xl mt-8">
            
            {/* Text Content */}
            <div className="flex-1 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">Nästa generations plattform</span>
              </div>
              
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                Säker dokumenthantering för <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-300">
                  moderna byggprojekt
                </span>
              </h1>
              
              <p className="max-w-xl text-lg sm:text-xl text-slate-400 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                En komplett digital plattform som samlar alla dina viktiga dokument, ritningar och tillstånd på en säker plats. Åtkomligt överallt, när du behöver det.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
                <Button asChild size="lg" className="h-14 px-8 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all rounded-full group">
                  <Link to="/portal">
                    Öppna Portalen 
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base font-semibold border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-full bg-transparent backdrop-blur-sm">
                  <Link to="/how-it-works">Läs hur det fungerar</Link>
                </Button>
              </div>
            </div>

            {/* Image Content */}
            <div className="flex-1 relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-500 w-full max-w-lg lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-2xl z-0" />
              <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 aspect-square md:aspect-[4/3] lg:aspect-square group">
                <img 
                  src="/hero-image.png" 
                  alt="Modern Construction Dashboard" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
            
          </div>

          {/* Features Grid */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors backdrop-blur-md group">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-slate-200 mb-3">Smarta Dokument</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Digitalisera hela er dokumentation. Alltid uppdaterade versioner tillgängliga direkt i mobilen eller på plattan ute på bygget.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors backdrop-blur-md group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                <QrCode className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-slate-200 mb-3">Snabb Åtkomst</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Skanna QR-koder ute på arbetsplatsen för omedelbar tillgång till ritningar, säkerhetsföreskrifter och viktiga rutiner.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors backdrop-blur-md group">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-slate-200 mb-3">Säker Signering</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                BankID-integration för säker signering av dokument och mottagande av information. Följer alla branschstandarder.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-32 w-full max-w-7xl relative z-10">
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl" />
            <div className="relative bg-white/[0.02] border border-white/[0.05] rounded-3xl p-12 backdrop-blur-md flex flex-col md:flex-row justify-around items-center gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold text-slate-100 mb-2">500+</div>
                <div className="text-slate-400 font-medium flex items-center justify-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  Byggprojekt
                </div>
              </div>
              <div className="hidden md:block w-px h-16 bg-white/[0.1]" />
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold text-slate-100 mb-2">50k+</div>
                <div className="text-slate-400 font-medium flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Dokument Hanterade
                </div>
              </div>
              <div className="hidden md:block w-px h-16 bg-white/[0.1]" />
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold text-slate-100 mb-2">10k+</div>
                <div className="text-slate-400 font-medium flex items-center justify-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Aktiva Användare
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Section */}
          <div className="mt-32 w-full max-w-7xl flex flex-col items-center text-center">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-slate-100 mb-6">Så här fungerar det</h2>
            <p className="text-slate-400 max-w-2xl text-lg mb-16">
              Vi har gjort det enkelt att komma igång. På bara några minuter har du din digitala arbetstavla uppsatt och redo för teamet.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative w-full">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0" />

              {[
                {
                  step: "01",
                  title: "Skapa Projekt",
                  desc: "Sätt upp projektet och bjud in rätt personer med några få klick."
                },
                {
                  step: "02",
                  title: "Ladda Upp",
                  desc: "Dra och släpp ritningar, arbetsmiljöplaner och viktiga dokument."
                },
                {
                  step: "03",
                  title: "Jobba Säkert",
                  desc: "Alla har direkt tillgång via QR-kod och signerar säkert med BankID."
                }
              ].map((item, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-primary mb-6 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-200 mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-sm max-w-xs">{item.desc}</p>
                </div>
              ))}
            </div>
            
            <Button asChild size="lg" className="mt-16 h-14 px-8 text-base font-semibold bg-white text-slate-950 hover:bg-slate-200 shadow-xl rounded-full">
              <Link to="/portal">
                Kom igång nu <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-slate-950/50 backdrop-blur-lg w-full py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <HardHat className="h-6 w-6 text-primary" />
              <span className="font-display font-semibold text-slate-200">Digital Arbetstavla</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-400">
              <Link to="/privacy" className="hover:text-primary transition-colors">Integritetspolicy</Link>
              <Link to="/admin/login" className="hover:text-primary transition-colors">Admin Portal</Link>
              <span className="cursor-not-allowed">Kontakt</span>
            </div>
            <div className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} Digital Arbetstavla. Alla rättigheter förbehållna.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
