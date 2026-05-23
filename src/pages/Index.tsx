import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HardHat, Shield, FileText, QrCode } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-lg">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
          <HardHat className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-4xl font-bold mb-3">Digital Arbetstavla</h1>
        <p className="text-muted-foreground mb-8">
          Säker dokumenthantering för byggprojekt. Ladda upp, läs, signera.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Dokument</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <QrCode className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">QR-kod</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Signering</span>
          </div>
        </div>

        <Button asChild size="lg" className="w-full max-w-xs">
          <Link to="/admin/login">Admin-inloggning</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
