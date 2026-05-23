import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, FolderOpen, LogOut, HardHat, Users, FileText, UserPlus } from "lucide-react";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useProjects, useCreateProject } from "@/hooks/queries";

type Project = Tables<"projects">;

const AdminDashboard = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", company: "", project_number: "", start_date: "", end_date: "" });
  const navigate = useNavigate();

  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const insertData: TablesInsert<"projects"> = {
        name: form.name,
        address: form.address || null,
        company: form.company || null,
        project_number: form.project_number || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      const project = await createProject.mutateAsync(insertData);

      const qrUrl = `${window.location.origin}/project/${project.id}`;
      await supabase.from("projects").update({ qr_code_url: qrUrl }).eq("id", project.id);

      toast.success("Projekt skapat!");
      setDialogOpen(false);
      setForm({ name: "", address: "", company: "", project_number: "", start_date: "", end_date: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Ett fel uppstod");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviteLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send invitation");
      }

      toast.success("Inbjudan skickad");
      setInviteDialogOpen(false);
      setInviteEmail("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Ett fel uppstod");
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <HardHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-display text-xl font-bold">Digital Arbetstavla</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logga ut
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">Projekt</h2>
            <p className="text-muted-foreground">Hantera dina byggprojekt</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Skapa nytt projekt</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Nytt projekt</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Projektnamn *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Adress</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Företag</Label>
                  <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Projektnummer</Label>
                  <Input value={form.project_number} onChange={(e) => setForm({ ...form, project_number: e.target.value })} placeholder="T.ex. 16811" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Startdatum</Label>
                    <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slutdatum</Label>
                    <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createProject.isPending}>
                  {createProject.isPending ? "Skapar..." : "Skapa projekt"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><UserPlus className="mr-2 h-4 w-4" /> Bjud in administratör</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Bjud in administratör</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label>E-postadress</Label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="admin@foretag.se"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={inviteLoading}>
                  {inviteLoading ? "Skickar..." : "Skicka inbjudan"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Laddar projekt...</p>
        ) : projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">Inga projekt ännu</p>
              <p className="text-sm text-muted-foreground">Skapa ditt första projekt för att komma igång</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="transition-all hover:shadow-md hover:border-primary/50">
                <Link to={`/admin/project/${project.id}`} className="block">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg">{project.name}</CardTitle>
                    {project.company && (
                      <p className="text-sm text-muted-foreground">{project.company}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {project.address && (
                      <p className="text-sm text-muted-foreground mb-2">📍 {project.address}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> Dokument</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Användare</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>

    </div>
  );
};

export default AdminDashboard;
