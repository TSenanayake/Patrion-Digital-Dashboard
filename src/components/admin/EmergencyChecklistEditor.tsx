import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

interface CrisisAction {
  crisis_title: string;
  actions: string[];
}

interface EmergencyChecklistEditorProps {
  documentId: string;
  smartViewData: any;
  onSaved: () => void;
}

const EmergencyChecklistEditor = ({ documentId, smartViewData, onSaved }: EmergencyChecklistEditorProps) => {
  const initialData: CrisisAction[] = smartViewData?.crisis_actions || [];
  const [items, setItems] = useState<CrisisAction[]>(initialData.map(i => ({ ...i, actions: [...i.actions] })));
  const [saving, setSaving] = useState(false);

  const updateTitle = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], crisis_title: value };
    setItems(updated);
  };

  const updateAction = (itemIndex: number, actionIndex: number, value: string) => {
    const updated = [...items];
    const actions = [...updated[itemIndex].actions];
    actions[actionIndex] = value;
    updated[itemIndex] = { ...updated[itemIndex], actions };
    setItems(updated);
  };

  const removeAction = (itemIndex: number, actionIndex: number) => {
    const updated = [...items];
    updated[itemIndex] = {
      ...updated[itemIndex],
      actions: updated[itemIndex].actions.filter((_, i) => i !== actionIndex),
    };
    setItems(updated);
  };

  const addAction = (itemIndex: number) => {
    const updated = [...items];
    updated[itemIndex] = {
      ...updated[itemIndex],
      actions: [...updated[itemIndex].actions, ""],
    };
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems([...items, { crisis_title: "", actions: [""] }]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedData = {
        ...smartViewData,
        crisis_actions: items,
      };

      const { error } = await supabase
        .from("documents")
        .update({ smart_view_data: updatedData } as any)
        .eq("id", documentId);

      if (error) {
        toast.error("Kunde inte spara: " + error.message);
        return;
      }

      toast.success("Checklista nödläge sparad!");
      onSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
          <Plus className="h-3 w-3" /> Ny kris/åtgärd
        </Button>
      </div>

      {items.map((item, i) => (
        <Card key={i}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex-1 mr-2">
              <Input
                value={item.crisis_title}
                onChange={(e) => updateTitle(i, e.target.value)}
                placeholder="Kris (t.ex. Brand, Fallolycka)"
                className="h-8 text-sm font-semibold"
              />
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => removeItem(i)} className="text-destructive h-8 px-2 shrink-0">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Åtgärder</Label>
              <Button variant="ghost" size="sm" onClick={() => addAction(i)} className="h-6 text-xs px-2 gap-1">
                <Plus className="h-3 w-3" /> Lägg till
              </Button>
            </div>
            {item.actions.map((action, j) => (
              <div key={j} className="flex gap-2 items-start">
                <span className="text-xs font-bold text-muted-foreground w-5 shrink-0 mt-2">{j + 1}.</span>
                <Textarea
                  value={action}
                  onChange={(e) => updateAction(i, j, e.target.value)}
                  placeholder="Åtgärd"
                  className="text-sm flex-1 min-h-[40px]"
                  rows={1}
                />
                <Button variant="ghost" size="sm" onClick={() => removeAction(i, j)} className="text-destructive h-8 px-2 mt-0.5">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="sticky bottom-0 bg-background py-3 border-t flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Spara ändringar
        </Button>
      </div>
    </div>
  );
};

export default EmergencyChecklistEditor;
