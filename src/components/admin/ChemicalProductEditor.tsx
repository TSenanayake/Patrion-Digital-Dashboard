import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type ChemicalProduct = Tables<"chemical_products">;

const HAZARD_CODES = ["GHS01", "GHS02", "GHS03", "GHS04", "GHS05", "GHS06", "GHS07", "GHS08", "GHS09"];
const ENV_CLASSES = ["BASTA", "BVB accepterad", "REACH", "Ej klassad"];

const emptyForm: Omit<ChemicalProduct, "id" | "project_id" | "created_at" | "updated_at" | "sort_order"> & { sort_order?: number } = {
  product_name: "",
  manufacturer: "",
  hazard_code: "",
  has_safety_datasheet: false,
  safety_datasheet_url: "",
  storage_location: "",
  first_delivery_date: "",
  built_in_date: "",
  finished_date: "",
  environmental_class: "",
};

export default function ChemicalProductEditor({ projectId }: { projectId: string }) {
  const [products, setProducts] = useState<ChemicalProduct[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase
      .from("chemical_products")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order");
    setProducts((data as ChemicalProduct[]) || []);
  }, [projectId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: ChemicalProduct) => {
    setEditingId(p.id);
    setForm({
      product_name: p.product_name,
      manufacturer: p.manufacturer || "",
      hazard_code: p.hazard_code || "",
      has_safety_datasheet: p.has_safety_datasheet,
      safety_datasheet_url: p.safety_datasheet_url || "",
      storage_location: p.storage_location || "",
      first_delivery_date: p.first_delivery_date || "",
      built_in_date: p.built_in_date || "",
      finished_date: p.finished_date || "",
      environmental_class: p.environmental_class || "",
    });
    setDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._\-]/g, "_");
      const path = `${projectId}/sds/${Date.now()}_${safeName}`;
      const { error } = await supabase.storage.from("documents").upload(path, file);
      if (error) { toast.error(error.message); return; }
      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
      setForm(f => ({ ...f, safety_datasheet_url: urlData.publicUrl }));
      toast.success("Säkerhetsdatablad uppladdat!");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: TablesUpdate<"chemical_products"> = {
      project_id: projectId,
      product_name: form.product_name,
      manufacturer: form.manufacturer || null,
      hazard_code: form.hazard_code || null,
      has_safety_datasheet: form.has_safety_datasheet,
      safety_datasheet_url: form.has_safety_datasheet ? (form.safety_datasheet_url || null) : null,
      storage_location: form.storage_location || null,
      first_delivery_date: form.first_delivery_date || null,
      built_in_date: form.built_in_date || null,
      finished_date: form.finished_date || null,
      environmental_class: form.environmental_class || null,
    };

    if (editingId) {
      const { error } = await supabase.from("chemical_products").update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("Produkt uppdaterad!");
    } else {
      const insertPayload: TablesInsert<"chemical_products"> = { ...payload, sort_order: products.length };
      const { error } = await supabase.from("chemical_products").insert(insertPayload);
      if (error) { toast.error(error.message); return; }
      toast.success("Produkt tillagd!");
    }
    setDialogOpen(false);
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("chemical_products").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Produkt borttagen!");
    setDeleteId(null);
    fetchProducts();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kemiska produkter</h3>
        <Button size="sm" onClick={openNew} className="gap-1">
          <Plus className="h-4 w-4" /> Lägg till produkt
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            Inga kemiska produkter registrerade
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {products.map(p => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div>
                <p className="text-sm font-medium">{p.product_name}</p>
                <p className="text-xs text-muted-foreground">
                  {[p.hazard_code, p.environmental_class].filter(Boolean).join(" • ") || "Ingen klassning"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Redigera produkt" : "Lägg till produkt"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Produktnamn *</Label>
              <Input value={form.product_name} onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Tillverkare</Label>
              <Input value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Farokod</Label>
              <Select value={form.hazard_code} onValueChange={v => setForm(f => ({ ...f, hazard_code: v }))}>
                <SelectTrigger><SelectValue placeholder="Välj farokod..." /></SelectTrigger>
                <SelectContent>
                  {HAZARD_CODES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.has_safety_datasheet} onCheckedChange={v => setForm(f => ({ ...f, has_safety_datasheet: v }))} />
              <Label>Säkerhetsdatablad finns</Label>
            </div>
            {form.has_safety_datasheet && (
              <div className="space-y-2">
                <Label>Ladda upp säkerhetsdatablad (PDF)</Label>
                <Input type="file" accept=".pdf" onChange={handleFileUpload} disabled={uploading} />
                {form.safety_datasheet_url && (
                  <p className="text-xs text-muted-foreground truncate">✔ {form.safety_datasheet_url.split("/").pop()}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Förvaringsplats</Label>
              <Input value={form.storage_location} onChange={e => setForm(f => ({ ...f, storage_location: e.target.value }))} placeholder="T.ex. Bod 3 – UE Måleri" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Första leverans</Label>
                <Input type="date" value={form.first_delivery_date} onChange={e => setForm(f => ({ ...f, first_delivery_date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Byggs in</Label>
                <Input type="date" value={form.built_in_date} onChange={e => setForm(f => ({ ...f, built_in_date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Färdiganvänd</Label>
              <Input type="date" value={form.finished_date} onChange={e => setForm(f => ({ ...f, finished_date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Miljöklassning</Label>
              <Select value={form.environmental_class} onValueChange={v => setForm(f => ({ ...f, environmental_class: v }))}>
                <SelectTrigger><SelectValue placeholder="Välj miljöklassning..." /></SelectTrigger>
                <SelectContent>
                  {ENV_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">{editingId ? "Spara ändringar" : "Lägg till"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Är du säker på att du vill ta bort produkten?</AlertDialogTitle>
            <AlertDialogDescription>Denna åtgärd kan inte ångras.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Ta bort</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
