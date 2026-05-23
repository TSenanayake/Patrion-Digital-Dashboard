import { Phone, AlertTriangle, MapPin, User, Briefcase, CheckSquare, Info } from "lucide-react";

interface EmergencyContact {
  role: string;
  name?: string;
  phone?: string;
}

interface EmergencyData {
  emergency_number?: string;
  checklist?: string[];
  workplace_address?: string;
  responsible_person?: EmergencyContact;
  additional_contacts?: EmergencyContact[];
}

export interface EmergencyCardsProps {
  emergencyData: EmergencyData;
  searchTerm: string;
}

const matchesSearch = (text: string | undefined, term: string) =>
  text ? text.toLowerCase().includes(term.toLowerCase()) : false;

const EmergencyCards = ({ emergencyData, searchTerm }: EmergencyCardsProps) => {
  const d = emergencyData;

  return (
    <div className="space-y-4">
      {/* Emergency number - large red card */}
      {d.emergency_number && (!searchTerm || matchesSearch(d.emergency_number, searchTerm) || matchesSearch("nödsituation", searchTerm)) && (
        <div className="rounded-xl border-2 border-destructive bg-destructive/10 p-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <span className="text-lg font-bold text-destructive uppercase tracking-wide">Vid nödsituation</span>
          </div>
          <a
            href={`tel:${d.emergency_number}`}
            className="block text-5xl font-black text-destructive tracking-wider"
          >
            {d.emergency_number}
          </a>
          <p className="text-sm text-destructive/80 font-medium">Ring direkt vid olycka eller fara</p>
        </div>
      )}

      {/* Emergency checklist */}
      {d.checklist && d.checklist.length > 0 && (!searchTerm || d.checklist.some(item => matchesSearch(item, searchTerm)) || matchesSearch("ange", searchTerm)) && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wide">När du ringer – ange</h3>
          </div>
          <div className="space-y-2 pl-1">
            {d.checklist
              .filter(item => !searchTerm || matchesSearch(item, searchTerm))
              .map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-md bg-muted/50 px-3 py-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-sm leading-relaxed">{item}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Workplace address */}
      {d.workplace_address && (!searchTerm || matchesSearch(d.workplace_address, searchTerm) || matchesSearch("arbetsplats", searchTerm)) && (
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wide">Arbetsplatsens adress</h3>
          </div>
          <p className="text-sm font-medium pl-6">{d.workplace_address}</p>
        </div>
      )}

      {/* Responsible person BAS-U */}
      {d.responsible_person && (!searchTerm || matchesSearch(d.responsible_person.name, searchTerm) || matchesSearch(d.responsible_person.phone, searchTerm) || matchesSearch("bas-u", searchTerm)) && (
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wide">
              {d.responsible_person.role || "Ansvarig BAS-U"}
            </h3>
          </div>
          {d.responsible_person.name && (
            <div className="flex items-center gap-2 pl-6">
              <User className="h-4 w-4 text-foreground shrink-0" />
              <span className="text-sm font-semibold">{d.responsible_person.name}</span>
            </div>
          )}
          {d.responsible_person.phone && (
            <div className="pl-6">
              <a
                href={`tel:${d.responsible_person.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
              >
                <Phone className="h-3 w-3" />
                {d.responsible_person.phone}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Additional contacts */}
      {d.additional_contacts && d.additional_contacts.length > 0 && (
        <>
          <div className="flex items-center gap-2 mt-2">
            <User className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wide">Övriga kontakter</h3>
          </div>
          <div className="space-y-3">
            {d.additional_contacts
              .filter(c => !searchTerm || [c.role, c.name, c.phone].some(v => matchesSearch(v, searchTerm)))
              .map((contact, i) => (
                <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
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
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                    >
                      <Phone className="h-3 w-3" />
                      {contact.phone}
                    </a>
                  )}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EmergencyCards;
