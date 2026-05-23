import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getQrUrl, downloadQrCode } from "@/lib/admin/qr";

interface QrCodeTabProps {
  projectId: string;
  projectName: string;
}

export function QrCodeTab({ projectId, projectName }: QrCodeTabProps) {
  const qrUrl = getQrUrl(projectId);

  return (
    <Card>
      <CardContent className="flex flex-col items-center py-8">
        <QRCodeSVG id="qr-code" value={qrUrl} size={256} level="H" />
        <p className="mt-4 text-sm text-muted-foreground break-all">{qrUrl}</p>
        <Button className="mt-4" onClick={() => downloadQrCode(projectId, projectName)}>
          <Download className="mr-2 h-4 w-4" /> Ladda ner QR som PNG
        </Button>
      </CardContent>
    </Card>
  );
}
