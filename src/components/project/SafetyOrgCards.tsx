import { Phone, Mail, Building2, User, Briefcase, AlertTriangle, Shield, MapPin, Globe, Info, HeartPulse } from "lucide-react";

interface SafetyOrgContact {
  role: string;
  name?: string;
  phone?: string;
  email?: string;
}

interface SafetyOrgData {
  larmnummer?: string;
  company?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  arbetsplats?: {
    address?: string;
  };
  byggherre?: {
    name?: string;
    address?: string;
  };
  arbetsledning?: SafetyOrgContact[];
  skyddsombud?: SafetyOrgContact[];
  ovriga_kontakter?: SafetyOrgContact[];
  forsta_hjalpen?: { name?: string; company?: string; phone?: string }[];
  myndigheter?: { label: string; phone: string }[];
  guidance_text?: string;
}

export interface SafetyOrgCardsProps {
  safetyOrg: SafetyOrgData;
  searchTerm: string;
}

const matchesSearch = (text: string | undefined, term: string) =>
  text ? text.toLowerCase().includes(term.toLowerCase()) : false;

const PhoneLink = ({ phone }: { phone: string }) => (
  <a
    href={`tel:${phone.replace(/\s/g, "")}`}
    className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
  >
    <Phone className="h-3 w-3" />
    {phone}
  </a>
);

const EmailLink = ({ email }: { email: string }) => (
  <a
    href={`mailto:${email}`}
    className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
  >
    <Mail className="h-3 w-3" />
    {email}
  </a>
);

const ContactCard = ({ contact }: { contact: SafetyOrgContact }) => (
  <div className="rounded-lg border bg-card p-4 space-y-2">
    {contact.role && (
      <div className="flex items-center gap-2">
        <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{contact.role}</span>
      </div>
    )}
    {contact.name && (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-foreground shrink-0" />
        <span className="text-sm font-semibold">{contact.name}</span>
      </div>
    )}
    <div className="flex flex-wrap gap-2 pt-1">
      {contact.phone && <PhoneLink phone={contact.phone} />}
      {contact.email && <EmailLink email={contact.email} />}
    </div>
    {!contact.phone && !contact.email && (
      <p className="text-xs text-muted-foreground italic">Kontaktuppgifter saknas</p>
    )}
  </div>
);

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex items-center gap-2 mt-5 mb-2">
    <Icon className="h-4 w-4 text-primary" />
    <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">{title}</h3>
  </div>
);

const SafetyOrgCards = ({ safetyOrg, searchTerm }: SafetyOrgCardsProps) => {
  const s = safetyOrg;

  // Filter contacts by search term
  const filterContacts = (contacts?: SafetyOrgContact[]) => {
    if (!contacts) return [];
    if (!searchTerm) return contacts;
    return contacts.filter(c =>
      [c.role, c.name, c.phone, c.email].some(v => matchesSearch(v, searchTerm))
    );
  };

  const filteredArbetsledning = filterContacts(s.arbetsledning);
  const filteredSkyddsombud = filterContacts(s.skyddsombud);
  const filteredOvriga = filterContacts(s.ovriga_kontakter);

  return (
    <div className="space-y-1">
      {/* Larmnummer */}
      {s.larmnummer && (!searchTerm || matchesSearch(s.larmnummer, searchTerm) || matchesSearch("larmnummer", searchTerm)) && (
        <div className="rounded-lg border-2 border-destructive/40 bg-destructive/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-sm font-bold">Larmnummer</span>
          </div>
          <a
            href={`tel:${s.larmnummer}`}
            className="text-2xl font-bold text-destructive"
          >
            {s.larmnummer}
          </a>
        </div>
      )}

      {/* Företag/Entreprenör */}
      {s.company && (!searchTerm || [s.company.name, s.company.address, s.company.phone, s.company.email].some(v => matchesSearch(v, searchTerm))) && (
        <>
          <SectionHeader icon={Building2} title="Företag / Entreprenör" />
          <div className="rounded-lg border bg-card p-4 space-y-2">
            {s.company.name && <p className="text-sm font-semibold">{s.company.name}</p>}
            {s.company.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-xs text-muted-foreground">{s.company.address}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {s.company.phone && <PhoneLink phone={s.company.phone} />}
              {s.company.email && <EmailLink email={s.company.email} />}
              {s.company.website && (
                <a
                  href={s.company.website.startsWith("http") ? s.company.website : `https://${s.company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                >
                  <Globe className="h-3 w-3" />
                  {s.company.website}
                </a>
              )}
            </div>
          </div>
        </>
      )}

      {/* Arbetsställe + Byggherre */}
      {(s.arbetsplats?.address || s.byggherre) && (!searchTerm || matchesSearch(s.arbetsplats?.address, searchTerm) || matchesSearch(s.byggherre?.name, searchTerm)) && (
        <>
          <SectionHeader icon={MapPin} title="Arbetsställe" />
          <div className="rounded-lg border bg-card p-4 space-y-3">
            {s.arbetsplats?.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm">{s.arbetsplats.address}</span>
              </div>
            )}
            {s.byggherre && (
              <div className="border-t pt-2 space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Byggherre</p>
                {s.byggherre.name && <p className="text-sm font-semibold">{s.byggherre.name}</p>}
                {s.byggherre.address && <p className="text-xs text-muted-foreground">{s.byggherre.address}</p>}
              </div>
            )}
          </div>
        </>
      )}

      {/* Arbetsledning */}
      {filteredArbetsledning.length > 0 && (
        <>
          <SectionHeader icon={Briefcase} title="Arbetsledning / BAS-P & BAS-U" />
          <div className="space-y-3">
            {filteredArbetsledning.map((c, i) => <ContactCard key={i} contact={c} />)}
          </div>
        </>
      )}

      {/* Skyddsombud */}
      {filteredSkyddsombud.length > 0 && (
        <>
          <SectionHeader icon={Shield} title="Skyddsombud" />
          <div className="space-y-3">
            {filteredSkyddsombud.map((c, i) => <ContactCard key={i} contact={c} />)}
          </div>
        </>
      )}

      {/* Övriga kontakter */}
      {filteredOvriga.length > 0 && (
        <>
          <SectionHeader icon={User} title="Övriga kontakter" />
          <div className="space-y-3">
            {filteredOvriga.map((c, i) => <ContactCard key={i} contact={c} />)}
          </div>
        </>
      )}

      {/* Första hjälpen-utbildade */}
      {s.forsta_hjalpen && s.forsta_hjalpen.length > 0 && (!searchTerm || s.forsta_hjalpen.some(p => matchesSearch(p.name, searchTerm) || matchesSearch(p.company, searchTerm) || matchesSearch(p.phone, searchTerm) || matchesSearch("första hjälpen", searchTerm))) && (
        <>
          <SectionHeader icon={HeartPulse} title="Första hjälpen-utbildade" />
          <div className="space-y-3">
            {s.forsta_hjalpen
              .filter(p => !searchTerm || matchesSearch(p.name, searchTerm) || matchesSearch(p.company, searchTerm) || matchesSearch(p.phone, searchTerm) || matchesSearch("första hjälpen", searchTerm))
              .map((p, i) => (
                <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
                  {p.name && (
                    <div className="flex items-center gap-2">
                      <HeartPulse className="h-4 w-4 text-destructive shrink-0" />
                      <span className="text-sm font-semibold">{p.name}</span>
                    </div>
                  )}
                  {p.company && (
                    <div className="flex items-center gap-2 pl-6">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground">{p.company}</span>
                    </div>
                  )}
                  {p.phone && <div className="pl-6"><PhoneLink phone={p.phone} /></div>}
                </div>
              ))}
          </div>
        </>
      )}

      {/* Myndigheter */}
      {s.myndigheter && s.myndigheter.length > 0 && (!searchTerm || s.myndigheter.some(m => matchesSearch(m.label, searchTerm) || matchesSearch(m.phone, searchTerm))) && (
        <>
          <SectionHeader icon={Building2} title="Viktiga nummer" />
          <div className="rounded-lg border bg-card p-4 space-y-2">
            {s.myndigheter
              .filter(m => !searchTerm || matchesSearch(m.label, searchTerm) || matchesSearch(m.phone, searchTerm))
              .map((m, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <span className="text-sm">{m.label}</span>
                  <PhoneLink phone={m.phone} />
                </div>
              ))}
          </div>
        </>
      )}

      {/* Guidance text */}
      {s.guidance_text && (!searchTerm || matchesSearch(s.guidance_text, searchTerm)) && (
        <>
          <SectionHeader icon={Info} title="Information" />
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm leading-relaxed whitespace-pre-line">{s.guidance_text}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default SafetyOrgCards;
