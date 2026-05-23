import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, Loader2, Phone, User, Briefcase } from "lucide-react";

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
  arbetsplats?: { address?: string };
  byggherre?: { name?: string; address?: string };
  arbetsledning?: SafetyOrgContact[];
  skyddsombud?: SafetyOrgContact[];
  ovriga_kontakter?: SafetyOrgContact[];
  forsta_hjalpen?: { name?: string; company?: string; phone?: string }[];
  myndigheter?: { label: string; phone: string }[];
  guidance_text?: string;
}

interface SafetyOrgContactEditorProps {
  documentId: string;
  smartViewData: any;
  onSaved: () => void;
}

const ContactRow = ({
  contact,
  onChange,
  onRemove,
}: {
  contact: SafetyOrgContact;
  onChange: (c: SafetyOrgContact) => void;
  onRemove: () => void;
}) => (
  <div className="rounded-lg border bg-card p-3 space-y-2">
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label className="text-xs text-muted-foreground">Roll</Label>
        <Input
          value={contact.role}
          onChange={(e) => onChange({ ...contact, role: e.target.value })}
          placeholder="Roll"
          className="h-8 text-sm"
        />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Namn</Label>
        <Input
          value={contact.name || ""}
          onChange={(e) => onChange({ ...contact, name: e.target.value })}
          placeholder="Namn"
          className="h-8 text-sm"
        />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label className="text-xs text-muted-foreground">Telefon</Label>
        <Input
          value={contact.phone || ""}
          onChange={(e) => onChange({ ...contact, phone: e.target.value })}
          placeholder="Telefon"
          className="h-8 text-sm"
        />
      </div>
      <div className="flex items-end gap-1">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">E-post</Label>
          <Input
            value={contact.email || ""}
            onChange={(e) => onChange({ ...contact, email: e.target.value })}
            placeholder="E-post"
            className="h-8 text-sm"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive h-8 px-2">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  </div>
);

const SafetyOrgContactEditor = ({ documentId, smartViewData, onSaved }: SafetyOrgContactEditorProps) => {
  const initialOrg: SafetyOrgData = smartViewData?.safety_org || {};
  const [org, setOrg] = useState<SafetyOrgData>({ ...initialOrg });
  const [saving, setSaving] = useState(false);

  const updateList = (key: "arbetsledning" | "skyddsombud" | "ovriga_kontakter", index: number, contact: SafetyOrgContact) => {
    const list = [...(org[key] || [])];
    list[index] = contact;
    setOrg({ ...org, [key]: list });
  };

  const removeFromList = (key: "arbetsledning" | "skyddsombud" | "ovriga_kontakter", index: number) => {
    const list = (org[key] || []).filter((_, i) => i !== index);
    setOrg({ ...org, [key]: list });
  };

  const addToList = (key: "arbetsledning" | "skyddsombud" | "ovriga_kontakter") => {
    const list = [...(org[key] || []), { role: "", name: "", phone: "" }];
    setOrg({ ...org, [key]: list });
  };

  const updateMyndighet = (index: number, field: "label" | "phone", value: string) => {
    const list = [...(org.myndigheter || [])];
    list[index] = { ...list[index], [field]: value };
    setOrg({ ...org, myndigheter: list });
  };

  const removeMyndighet = (index: number) => {
    setOrg({ ...org, myndigheter: (org.myndigheter || []).filter((_, i) => i !== index) });
  };

  const addMyndighet = () => {
    setOrg({ ...org, myndigheter: [...(org.myndigheter || []), { label: "", phone: "" }] });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedData = {
        ...smartViewData,
        safety_org: org,
        // Also update contacts array for backward compat
        contacts: [
          ...(org.arbetsledning || []),
          ...(org.skyddsombud || []),
          ...(org.ovriga_kontakter || []),
        ],
        is_contact_list: true,
      };

      const { error } = await supabase
        .from("documents")
        .update({ smart_view_data: updatedData } as any)
        .eq("id", documentId);

      if (error) {
        toast.error("Kunde inte spara: " + error.message);
        return;
      }

      toast.success("Skyddsorganisation sparad!");
      onSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Larmnummer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Larmnummer</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={org.larmnummer || ""}
            onChange={(e) => setOrg({ ...org, larmnummer: e.target.value })}
            placeholder="112"
            className="h-8 text-sm"
          />
        </CardContent>
      </Card>

      {/* Företag */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Företag / Entreprenör</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            value={org.company?.name || ""}
            onChange={(e) => setOrg({ ...org, company: { ...org.company, name: e.target.value } })}
            placeholder="Företagsnamn"
            className="h-8 text-sm"
          />
          <Input
            value={org.company?.address || ""}
            onChange={(e) => setOrg({ ...org, company: { ...org.company, address: e.target.value } })}
            placeholder="Adress"
            className="h-8 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={org.company?.phone || ""}
              onChange={(e) => setOrg({ ...org, company: { ...org.company, phone: e.target.value } })}
              placeholder="Telefon"
              className="h-8 text-sm"
            />
            <Input
              value={org.company?.email || ""}
              onChange={(e) => setOrg({ ...org, company: { ...org.company, email: e.target.value } })}
              placeholder="E-post"
              className="h-8 text-sm"
            />
          </div>
          <Input
            value={org.company?.website || ""}
            onChange={(e) => setOrg({ ...org, company: { ...org.company, website: e.target.value } })}
            placeholder="Webbplats"
            className="h-8 text-sm"
          />
        </CardContent>
      </Card>

      {/* Arbetsställe + Byggherre */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Arbetsställe & Byggherre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label className="text-xs text-muted-foreground">Arbetsställe adress</Label>
            <Input
              value={org.arbetsplats?.address || ""}
              onChange={(e) => setOrg({ ...org, arbetsplats: { address: e.target.value } })}
              placeholder="Adress"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Byggherre namn</Label>
            <Input
              value={org.byggherre?.name || ""}
              onChange={(e) => setOrg({ ...org, byggherre: { ...org.byggherre, name: e.target.value } })}
              placeholder="Namn"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Byggherre adress</Label>
            <Input
              value={org.byggherre?.address || ""}
              onChange={(e) => setOrg({ ...org, byggherre: { ...org.byggherre, address: e.target.value } })}
              placeholder="Adress"
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Arbetsledning */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Arbetsledning / BAS-P & BAS-U</CardTitle>
          <Button variant="outline" size="sm" onClick={() => addToList("arbetsledning")} className="gap-1 h-7 text-xs">
            <Plus className="h-3 w-3" /> Lägg till
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {(org.arbetsledning || []).map((c, i) => (
            <ContactRow
              key={i}
              contact={c}
              onChange={(updated) => updateList("arbetsledning", i, updated)}
              onRemove={() => removeFromList("arbetsledning", i)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Skyddsombud */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Skyddsombud</CardTitle>
          <Button variant="outline" size="sm" onClick={() => addToList("skyddsombud")} className="gap-1 h-7 text-xs">
            <Plus className="h-3 w-3" /> Lägg till
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {(org.skyddsombud || []).map((c, i) => (
            <ContactRow
              key={i}
              contact={c}
              onChange={(updated) => updateList("skyddsombud", i, updated)}
              onRemove={() => removeFromList("skyddsombud", i)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Övriga kontakter */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Övriga kontakter</CardTitle>
          <Button variant="outline" size="sm" onClick={() => addToList("ovriga_kontakter")} className="gap-1 h-7 text-xs">
            <Plus className="h-3 w-3" /> Lägg till
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {(org.ovriga_kontakter || []).map((c, i) => (
            <ContactRow
              key={i}
              contact={c}
              onChange={(updated) => updateList("ovriga_kontakter", i, updated)}
              onRemove={() => removeFromList("ovriga_kontakter", i)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Första hjälpen-utbildade */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Första hjälpen-utbildade</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOrg({ ...org, forsta_hjalpen: [...(org.forsta_hjalpen || []), { name: "", company: "", phone: "" }] })}
            className="gap-1 h-7 text-xs"
          >
            <Plus className="h-3 w-3" /> Lägg till
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {(org.forsta_hjalpen || []).map((p, i) => (
            <div key={i} className="rounded-lg border bg-card p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Namn</Label>
                  <Input
                    value={p.name || ""}
                    onChange={(e) => {
                      const list = [...(org.forsta_hjalpen || [])];
                      list[i] = { ...list[i], name: e.target.value };
                      setOrg({ ...org, forsta_hjalpen: list });
                    }}
                    placeholder="Namn"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Företag</Label>
                  <Input
                    value={p.company || ""}
                    onChange={(e) => {
                      const list = [...(org.forsta_hjalpen || [])];
                      list[i] = { ...list[i], company: e.target.value };
                      setOrg({ ...org, forsta_hjalpen: list });
                    }}
                    placeholder="Företag"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-end gap-1">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Telefon</Label>
                  <Input
                    value={p.phone || ""}
                    onChange={(e) => {
                      const list = [...(org.forsta_hjalpen || [])];
                      list[i] = { ...list[i], phone: e.target.value };
                      setOrg({ ...org, forsta_hjalpen: list });
                    }}
                    placeholder="Telefon"
                    className="h-8 text-sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOrg({ ...org, forsta_hjalpen: (org.forsta_hjalpen || []).filter((_, idx) => idx !== i) })}
                  className="text-destructive h-8 px-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>


      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Viktiga nummer</CardTitle>
          <Button variant="outline" size="sm" onClick={addMyndighet} className="gap-1 h-7 text-xs">
            <Plus className="h-3 w-3" /> Lägg till
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {(org.myndigheter || []).map((m, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                value={m.label}
                onChange={(e) => updateMyndighet(i, "label", e.target.value)}
                placeholder="Namn"
                className="h-8 text-sm flex-1"
              />
              <Input
                value={m.phone}
                onChange={(e) => updateMyndighet(i, "phone", e.target.value)}
                placeholder="Telefon"
                className="h-8 text-sm w-40"
              />
              <Button variant="ghost" size="sm" onClick={() => removeMyndighet(i)} className="text-destructive h-8 px-2">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Guidance text */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Informationstext</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={org.guidance_text || ""}
            onChange={(e) => setOrg({ ...org, guidance_text: e.target.value })}
            rows={4}
            placeholder="Arbetstagaren skall i första hand vända sig till..."
            className="text-sm"
          />
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

export default SafetyOrgContactEditor;
