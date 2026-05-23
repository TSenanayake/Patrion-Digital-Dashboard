import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, GripVertical, Save, Loader2 } from "lucide-react";

interface SmartViewSection {
  title: string;
  content: string[];
}

interface SmartViewData {
  sections: SmartViewSection[];
  confidence: string;
  source_type: string;
  removed_noise_lines_count: number;
  removed_toc: boolean;
  is_contact_list?: boolean;
  contacts?: any[];
  category?: string;
  category_confidence?: string;
  category_method?: string;
}

interface DocumentSectionEditorProps {
  documentId: string;
  smartViewData: SmartViewData;
  onSaved: () => void;
}

const DocumentSectionEditor = ({ documentId, smartViewData, onSaved }: DocumentSectionEditorProps) => {
  const [sections, setSections] = useState<SmartViewSection[]>(
    smartViewData?.sections || []
  );
  const [saving, setSaving] = useState(false);

  const updateSectionTitle = (index: number, title: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], title };
    setSections(updated);
  };

  const updateSectionContent = (sectionIndex: number, contentIndex: number, value: string) => {
    const updated = [...sections];
    const newContent = [...updated[sectionIndex].content];
    newContent[contentIndex] = value;
    updated[sectionIndex] = { ...updated[sectionIndex], content: newContent };
    setSections(updated);
  };

  const addContentBlock = (sectionIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex] = {
      ...updated[sectionIndex],
      content: [...updated[sectionIndex].content, ""],
    };
    setSections(updated);
  };

  const removeContentBlock = (sectionIndex: number, contentIndex: number) => {
    const updated = [...sections];
    const newContent = updated[sectionIndex].content.filter((_, i) => i !== contentIndex);
    updated[sectionIndex] = { ...updated[sectionIndex], content: newContent };
    setSections(updated);
  };

  const addSection = () => {
    setSections([...sections, { title: "Ny sektion", content: [""] }]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sections.length) return;
    const updated = [...sections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSections(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedData = {
        ...smartViewData,
        sections,
      };

      const { error } = await supabase
        .from("documents")
        .update({ smart_view_data: updatedData } as any)
        .eq("id", documentId);

      if (error) {
        toast.error("Kunde inte spara: " + error.message);
        return;
      }

      toast.success("Sektioner sparade!");
      onSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {sections.map((section, si) => (
        <Card key={si} className="border-border">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveSection(si, -1)}
                  disabled={si === 0}
                  className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(si, 1)}
                  disabled={si === sections.length - 1}
                  className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Rubrik</Label>
                <Input
                  value={section.title}
                  onChange={(e) => updateSectionTitle(si, e.target.value)}
                  className="font-semibold"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSection(si)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 pl-6">
              {section.content.map((block, ci) => (
                <div key={ci} className="flex gap-2">
                  <Textarea
                    value={block}
                    onChange={(e) => updateSectionContent(si, ci, e.target.value)}
                    rows={3}
                    className="text-sm flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContentBlock(si, ci)}
                    className="text-destructive hover:text-destructive shrink-0 self-start"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addContentBlock(si)}
                className="gap-1"
              >
                <Plus className="h-3 w-3" /> Lägg till textblock
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-3 sticky bottom-0 bg-background py-3 border-t">
        <Button variant="outline" onClick={addSection} className="gap-2">
          <Plus className="h-4 w-4" /> Ny sektion
        </Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2 ml-auto">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Spara ändringar
        </Button>
      </div>
    </div>
  );
};

export default DocumentSectionEditor;
