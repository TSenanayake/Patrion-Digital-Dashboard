import { Phone, Mail, Building2, User, Briefcase, ClipboardList, Flame, HardHat, Shield } from "lucide-react";

export interface OrgContact {
  role?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
}

interface OrganisationCardsProps {
  contacts: OrgContact[];
  searchTerm?: string;
}

const roleIcons: Record<string, typeof User> = {
  ombud: User,
  projektledare: ClipboardList,
  "tillståndsansvarig": Flame,
  "bas-p": HardHat,
  "bas-u": HardHat,
  skyddsombud: Shield,
};

function getRoleIcon(role?: string) {
  if (!role) return Briefcase;
  const lower = role.toLowerCase();
  for (const [key, icon] of Object.entries(roleIcons)) {
    if (lower.includes(key)) return icon;
  }
  return Briefcase;
}

const OrganisationCards = ({ contacts, searchTerm }: OrganisationCardsProps) => {
  // Filter out contacts that have no name AND no phone number
  const meaningful = contacts.filter(c => c.name || c.phone);
  if (!meaningful || meaningful.length === 0) return null;

  const filtered = searchTerm
    ? meaningful.filter(c =>
        [c.role, c.name, c.company, c.phone, c.email]
          .filter(Boolean)
          .some(v => v!.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : meaningful;

  if (filtered.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Inga kontakter matchar sökningen.</p>;
  }

  return (
    <div className="space-y-3">
      {filtered.map((contact, i) => {
        const RoleIcon = getRoleIcon(contact.role);
        return (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
            {contact.role && (
              <div className="flex items-center gap-2">
                <RoleIcon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-bold text-foreground">{contact.role}</span>
              </div>
            )}

            {contact.name && (
              <div className="flex items-center gap-2 pl-0.5">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">{contact.name}</span>
              </div>
            )}

            {contact.company && (
              <div className="flex items-center gap-2 pl-0.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground">{contact.company}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                >
                  <Mail className="h-3 w-3" />
                  {contact.email}
                </a>
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

            {!contact.phone && !contact.email && (
              <p className="text-xs text-muted-foreground italic">Kontaktuppgifter saknas</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrganisationCards;
