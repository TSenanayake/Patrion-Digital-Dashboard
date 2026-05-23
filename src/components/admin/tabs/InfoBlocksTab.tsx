import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type InfoBlock = Tables<"info_blocks">;

interface InfoBlocksTabProps {
  projectId: string;
  infoBlocks: InfoBlock[];
  onCreate: (content: string) => void;
  onUpdate: (id: string, content: string) => void;
  onDelete: (blockId: string) => void;
}

export function InfoBlocksTab({
  projectId,
  infoBlocks,
  onCreate,
  onUpdate,
  onDelete,
}: InfoBlocksTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ content: "" });
  const [editingBlock, setEditingBlock] = useState<InfoBlock | null>(null);
  const [editForm, setEditForm] = useState({ content: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(createForm.content);
    setDialogOpen(false);
    setCreateForm({ content: "" });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock) return;
    onUpdate(editingBlock.id, editForm.content);
    setEditingBlock(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nytt informationsblock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Nytt informationsblock</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Innehåll</Label>
                <Textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Skapa
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={!!editingBlock}
        onOpenChange={(open) => {
          if (!open) setEditingBlock(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Redigera informationsblock</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Innehåll</Label>
              <Textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                rows={5}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Spara
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {infoBlocks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            Inga informationsblock ännu
          </CardContent>
        </Card>
      ) : (
        infoBlocks.map((block) => (
          <Card key={block.id}>
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap">{block.content}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>v{block.version_number}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      setEditingBlock(block);
                      setEditForm({ content: block.content });
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => onDelete(block.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
