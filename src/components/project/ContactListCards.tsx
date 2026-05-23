import { Phone, Mail, Building2, User, Briefcase, Users } from "lucide-react";

interface ContactEntry {
  role?: string;
  company?: string;
  name?: string;
  mobile?: string;
  email?: string;
}

interface ContactGroup {
  group_name: string;
  contacts: ContactEntry[];
}

interface ContactListData {
  groups: ContactGroup[];
}

const ContactListCards = ({ contactListData, searchTerm }: { contactListData: ContactListData; searchTerm: string }) => {
  const filteredGroups = contactListData.groups
    .map(group => ({
      ...group,
      contacts: searchTerm
        ? group.contacts.filter(c =>
            [c.name, c.role, c.company, c.mobile, c.email, group.group_name]
              .filter(Boolean)
              .some(v => v!.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : group.contacts,
    }))
    .filter(g => g.contacts.length > 0);

  if (filteredGroups.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Inga kontakter matchar sökningen.</p>;
  }

  return (
    <div className="space-y-6">
      {filteredGroups.map((group, gi) => (
        <div key={gi}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-primary">{group.group_name}</h3>
          </div>
          <div className="space-y-3">
            {group.contacts.map((contact, ci) => (
              <div key={ci} className="rounded-lg border bg-card p-4 space-y-2">
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
                {contact.company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">{contact.company}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {contact.mobile && (
                    <a
                      href={`tel:${contact.mobile.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                    >
                      <Phone className="h-3 w-3" />
                      {contact.mobile}
                    </a>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                    >
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactListCards;
