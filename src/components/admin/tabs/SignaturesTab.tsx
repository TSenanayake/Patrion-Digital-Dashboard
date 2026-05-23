import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { exportSignaturesToCSV } from "@/lib/admin/csv";
import { exportWorkerData, deleteWorkerData, findWorkersByPhone } from "@/lib/admin/gdpr";
import type { WorkerExportData } from "@/lib/admin/gdpr";
import type { Tables } from "@/integrations/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Signature = Tables<"signatures">;

interface ProjectUser {
  name: string;
  company: string | null;
  phone?: string | null;
}

interface SignatureWithUser extends Signature {
  project_users: ProjectUser | null;
  signature_image_url?: string | null;
  device_info?: string | null;
}

interface SignaturesTabProps {
  projectId: string;
  projectName: string;
  signatures: SignatureWithUser[];
}

export function SignaturesTab({ projectId, projectName, signatures }: SignaturesTabProps) {
  const queryClient = useQueryClient();
  const [workerPhone, setWorkerPhone] = useState("");
  const [workerData, setWorkerData] = useState<WorkerExportData | null>(null);
  const [deletingWorker, setDeletingWorker] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleExportWorkerData = async () => {
    if (!workerPhone.trim()) {
      toast.error("Ange ett telefonnummer");
      return;
    }
    try {
      const userIds = await findWorkersByPhone(workerPhone, projectId);
      if (userIds.length === 0) {
        toast.error("Ingen arbetare hittades med detta telefonnummer");
        return;
      }

      const exports = await Promise.all(userIds.map((id) => exportWorkerData(id, projectId)));
      const merged = exports.reduce<WorkerExportData>((acc, e) => ({
        exported_at: acc.exported_at,
        project_id: acc.project_id,
        worker: acc.worker ?? e.worker,
        signatures: [...acc.signatures, ...e.signatures],
        document_reads: [...acc.document_reads, ...e.document_reads],
        question_answers: [...acc.question_answers, ...e.question_answers],
      }), exports[0]);
      setWorkerData(merged);

      const blob = new Blob([JSON.stringify(merged, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `worker-data-${workerPhone}-${projectName || "projekt"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Arbetardata exporterad");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunde inte exportera arbetardata");
    }
  };

  const handleDeleteWorkerConfirm = async () => {
    setShowDeleteDialog(false);
    if (!workerPhone.trim()) {
      toast.error("Ange ett telefonnummer");
      return;
    }
    setDeletingWorker(true);
    try {
      const userIds = await findWorkersByPhone(workerPhone, projectId);
      if (userIds.length === 0) {
        toast.error("Ingen arbetare hittades");
        return;
      }

      for (const userId of userIds) {
        await deleteWorkerData(userId, projectId);
      }

      toast.success(`${userIds.length} registrering(ar) har tagits bort`);
      setWorkerPhone("");
      setWorkerData(null);
      queryClient.invalidateQueries({ queryKey: ["signatures"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunde inte ta bort arbetare");
    } finally {
      setDeletingWorker(false);
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">Hantera arbetare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Ange telefonnummer..."
              value={workerPhone}
              onChange={(e) => setWorkerPhone(e.target.value)}
              className="max-w-xs"
            />
            <Button variant="outline" onClick={handleExportWorkerData} className="gap-2">
              <Download className="h-4 w-4" /> Exportera arbetardata
            </Button>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deletingWorker || !workerPhone.trim()}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingWorker ? "Tar bort..." : "Ta bort arbetare"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ta bort arbetare</AlertDialogTitle>
                  <AlertDialogDescription>
                    Detta kommer att permanent ta bort arbetarens signatur, lästa dokument och svar. Denna åtgärd kan inte ångras.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteWorkerConfirm}>
                    Ta bort
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {workerData && (
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-sm font-medium mb-2">Exporterad data:</p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>Namn: {workerData.worker?.name || "Okänd"}</p>
                <p>Företag: {workerData.worker?.company || "–"}</p>
                <p>Signaturer: {workerData.signatures?.length || 0}</p>
                <p>Dokumentlästa: {workerData.document_reads?.length || 0}</p>
                <p>Svar: {workerData.question_answers?.length || 0}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {signatures.length > 0 && (
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportSignaturesToCSV(signatures, projectName)}
            className="gap-2"
          >
            <Download className="h-4 w-4" /> Exportera CSV
          </Button>
        </div>
      )}
      {signatures.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            Inga signeringar ännu
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Namn</TableHead>
              <TableHead>Företag</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Signerad</TableHead>
              <TableHead>Signatur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signatures.map((sig) => (
              <TableRow key={sig.id}>
                <TableCell className="font-medium">{sig.project_users?.name || "Okänd"}</TableCell>
                <TableCell>{sig.project_users?.company || "–"}</TableCell>
                <TableCell>{sig.project_users?.phone || "–"}</TableCell>
                <TableCell>{new Date(sig.signed_at).toLocaleString("sv-SE")}</TableCell>
                <TableCell>
                  {sig.signature_image_url ? (
                    <a href={sig.signature_image_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={sig.signature_image_url}
                        alt="Signatur"
                        className="h-8 w-20 object-contain border rounded"
                      />
                    </a>
                  ) : (
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle className="h-4 w-4" /> Signerad
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
