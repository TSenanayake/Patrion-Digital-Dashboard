import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface Props {
  documentId: string;
  smartViewData: any;
  onSaved: () => void;
}

const ContactListEditor = ({ documentId, smartViewData, onSaved }: Props) => {
  const [groups, setGroups] = useState<ContactGroup[]>(
    smartViewData.contact_list_data?.groups || []
  );
  const [saving, setSaving] = useState(false);

  const updateGroup = (gi: number, field: string, value: string) => {
    const updated = [...groups];
    (updated[gi] as any)[field] = value;
    setGroups(updated);
  };

  const updateContact = (gi: number, ci: number, field: string, value: string) => {
    const updated = [...groups];
    (updated[gi].contacts[ci] as any)[field] = value;
    setGroups(updated);
  };

  const addContact = (gi: number) => {
    const updated = [...groups];
    updated[gi].contacts.push({ role: "", name: "", company: "", mobile: "", email: "" });
    setGroups(updated);
  };

  const removeContact = (gi: number, ci: number) => {
    const updated = [...groups];
    updated[gi].contacts.splice(ci, 1);
    setGroups(updated);
  };

  const addGroup = () => {
    setGroups([...groups, { group_name: "Ny grupp", contacts: [] }]);
  };

  const removeGroup = (gi: number) => {
    const updated = [...groups];
    updated.splice(gi, 1);
    setGroups(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    const updatedData = {
      ...smartViewData,
      contact_list_data: { groups },
    };
    const { error } = await supabase
      .from("documents")
      .update({ smart_view_data: updatedData } as any)
      .eq("id", documentId);
    setSaving(false);
    if (error) {
      toast.error("Kunde inte spara: " + error.message);
    } else {
      toast.success("Kontaktlista sparad!");
      onSaved();
    }
  };

  return (
    <ScrollArea className="max-h-[70vh]">
      <div className="space-y-6 pr-4">
        {groups.map((group, gi) => (
          <div key={gi} className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <Input
                value={group.group_name}
                onChange={(e) => updateGroup(gi, "group_name", e.target.value)}
                className="font-bold"
              />
              <Button variant="ghost" size="sm" onClick={() => removeGroup(gi)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            {group.contacts.map((contact, ci) => (
              <div key={ci} className="rounded border p-3 space-y-2 bg-muted/30">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Roll</Label>
                    <Input value={contact.role || ""} onChange={(e) => updateContact(gi, ci, "role", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Namn</Label>
                    <Input value={contact.name || ""} onChange={(e) => updateContact(gi, ci, "name", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Företag</Label>
                    <Input value={contact.company || ""} onChange={(e) => updateContact(gi, ci, "company", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Mobil</Label>
                    <Input value={contact.mobile || ""} onChange={(e) => updateContact(gi, ci, "mobile", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">E-post</Label>
                    <Input value={contact.email || ""} onChange={(e) => updateContact(gi, ci, "email", e.target.value)} />
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeContact(gi, ci)} className="text-destructive">
                  <Trash2 className="mr-1 h-3 w-3" /> Ta bort kontakt
                </Button>
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={() => addContact(gi)}>
              <Plus className="mr-1 h-3 w-3" /> Lägg till kontakt
            </Button>
          </div>
        ))}

        <Button variant="outline" onClick={addGroup}>
          <Plus className="mr-1 h-4 w-4" /> Lägg till grupp
        </Button>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Sparar..." : "Spara ändringar"}
        </Button>
      </div>
    </ScrollArea>
  );
};

export default ContactListEditor;
