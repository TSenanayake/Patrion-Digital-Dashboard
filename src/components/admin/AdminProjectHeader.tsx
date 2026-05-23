import { Button } from "@/components/ui/button";
import { ArrowLeft, HardHat, Eye, Copy, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getQrUrl, downloadQrCode } from "@/lib/admin/qr";
import type { Tables } from "@/integrations/supabase/types";

interface AdminProjectHeaderProps {
  project: Tables<"projects">;
  projectId: string;
  qrUrl: string;
  previewUrl: string;
  onBack: () => void;
}

export const AdminProjectHeader = ({ project, projectId, qrUrl, previewUrl, onBack }: AdminProjectHeaderProps) => {
  const copyProjectLink = () => {
    navigator.clipboard.writeText(qrUrl);
  };

  return (
    <>
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Tillbaka
          </Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <HardHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold">{project.name}</h1>
            <p className="text-xs text-muted-foreground">
              {project.company}
              {project.project_number && ` • Nr: ${project.project_number}`}
              {project.address && ` • ${project.address}`}
            </p>
          </div>
        </div>
      </header>

      <div className="mb-8 flex flex-wrap gap-3">
        <Button onClick={() => window.open(previewUrl, "_blank")} className="gap-2">
          <Eye className="h-4 w-4" /> Gå till projekt (mobilvy)
        </Button>
        <Button variant="outline" onClick={copyProjectLink} className="gap-2">
          <Copy className="h-4 w-4" /> Kopiera projektlänk
        </Button>
        <Button variant="outline" onClick={() => downloadQrCode(projectId, project.name)} className="gap-2">
          <Download className="h-4 w-4" /> Ladda ner QR
        </Button>
      </div>
    </>
  );
};
