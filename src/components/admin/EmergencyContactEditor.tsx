import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

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

interface EmergencyContactEditorProps {
  documentId: string;
  smartViewData: any;
  onSaved: () => void;
}

const EmergencyContactEditor = ({ documentId, smartViewData, onSaved }: EmergencyContactEditorProps) => {
  const initialData: EmergencyData = smartViewData?.emergency_data || {};
  const [data, setData] = useState<EmergencyData>({ ...initialData });
  const [saving, setSaving] = useState(false);

  const updateChecklist = (index: number, value: string) => {
    const list = [...(data.checklist || [])];
    list[index] = value;
    setData({ ...data, checklist: list });
  };

  const removeChecklistItem = (index: number) => {
    setData({ ...data, checklist: (data.checklist || []).filter((_, i) => i !== index) });
  };

  const addChecklistItem = () => {
    setData({ ...data, checklist: [...(data.checklist || []), ""] });
  };

  const updateAdditionalContact = (index: number, contact: EmergencyContact) => {
    const list = [...(data.additional_contacts || [])];
    list[index] = contact;
    setData({ ...data, additional_contacts: list });
  };

  const removeAdditionalContact = (index: number) => {
    setData({ ...data, additional_contacts: (data.additional_contacts || []).filter((_, i) => i !== index) });
  };

  const addAdditionalContact = () => {
    setData({ ...data, additional_contacts: [...(data.additional_contacts || []), { role: "", name: "", phone: "" }] });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedData = {
        ...smartViewData,
        emergency_data: data,
      };

      const { error } = await supabase
        .from("documents")
        .update({ smart_view_data: updatedData } as any)
        .eq("id", documentId);

      if (error) {
        toast.error("Kunde inte spara: " + error.message);
        return;
      }

      toast.success("Nödsituation sparad!");
      onSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Emergency number */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Larmnummer</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={data.emergency_number || ""}
            onChange={(e) => setData({ ...data, emergency_number: e.target.value })}
            placeholder="112"
            className="h-8 text-sm"
          />
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Checklista – vad du ska ange</CardTitle>
          <Button variant="outline" size="sm" onClick={addChecklistItem} className="gap-1 h-7 text-xs">
            <Plus className="h-3 w-3" /> Lägg till
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data.checklist || []).map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">{i + 1}.</span>
              <Input
                value={item}
                onChange={(e) => updateChecklist(i, e.target.value)}
                placeholder="Checklistpunkt"
                className="h-8 text-sm flex-1"
              />
              <Button variant="ghost" size="sm" onClick={() => removeChecklistItem(i)} className="text-destructive h-8 px-2">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Workplace address */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Arbetsplatsens adress</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={data.workplace_address || ""}
            onChange={(e) => setData({ ...data, workplace_address: e.target.value })}
            placeholder="Adress"
            className="h-8 text-sm"
          />
        </CardContent>
      </Card>

      {/* Responsible person BAS-U */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Ansvarig BAS-U</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label className="text-xs text-muted-foreground">Roll</Label>
            <Input
              value={data.responsible_person?.role || ""}
              onChange={(e) => setData({ ...data, responsible_person: { ...data.responsible_person, role: e.target.value } as EmergencyContact })}
              placeholder="Ansvarig BAS-U"
              className="h-8 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Namn</Label>
              <Input
                value={data.responsible_person?.name || ""}
                onChange={(e) => setData({ ...data, responsible_person: { ...data.responsible_person, role: data.responsible_person?.role || "Ansvarig BAS-U", name: e.target.value } as EmergencyContact })}
                placeholder="Namn"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Telefon</Label>
              <Input
                value={data.responsible_person?.phone || ""}
                onChange={(e) => setData({ ...data, responsible_person: { ...data.responsible_person, role: data.responsible_person?.role || "Ansvarig BAS-U", phone: e.target.value } as EmergencyContact })}
                placeholder="Telefon"
                className="h-8 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional contacts */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Övriga kontakter</CardTitle>
          <Button variant="outline" size="sm" onClick={addAdditionalContact} className="gap-1 h-7 text-xs">
            <Plus className="h-3 w-3" /> Lägg till
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data.additional_contacts || []).map((c, i) => (
            <div key={i} className="rounded-lg border p-3 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={c.role}
                  onChange={(e) => updateAdditionalContact(i, { ...c, role: e.target.value })}
                  placeholder="Roll"
                  className="h-8 text-sm"
                />
                <Input
                  value={c.name || ""}
                  onChange={(e) => updateAdditionalContact(i, { ...c, name: e.target.value })}
                  placeholder="Namn"
                  className="h-8 text-sm"
                />
                <div className="flex gap-1">
                  <Input
                    value={c.phone || ""}
                    onChange={(e) => updateAdditionalContact(i, { ...c, phone: e.target.value })}
                    placeholder="Telefon"
                    className="h-8 text-sm flex-1"
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeAdditionalContact(i)} className="text-destructive h-8 px-2">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="sticky bottom-0 bg-background py-3 border-t flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Spara ändringar
        </Button>
      </div>
    </div>
  );
};

export default EmergencyContactEditor;
