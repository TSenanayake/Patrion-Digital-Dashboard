import type { Tables } from "@/integrations/supabase/types";

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

export function exportSignaturesToCSV(signatures: SignatureWithUser[], projectName?: string): void {
  if (signatures.length === 0) return;
  const headers = ["Namn", "Företag", "Telefon", "Signerad"];
  const rows = signatures.map((sig) => [
    sig.project_users?.name || "Okänd",
    sig.project_users?.company || "",
    sig.project_users?.phone || "",
    new Date(sig.signed_at).toLocaleString("sv-SE"),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `signeringar-${projectName || "projekt"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
