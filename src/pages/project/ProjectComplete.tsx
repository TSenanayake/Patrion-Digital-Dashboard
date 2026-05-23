import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, HardHat, Eye } from "lucide-react";

const ProjectComplete = () => {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  return (
    <div className="min-h-screen bg-background">
      {isPreview && (
        <div className="flex items-center justify-center gap-2 bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950">
          <Eye className="h-4 w-4" />
          Förhandsvisning – inga signeringar sparades
        </div>
      )}
      <div className="flex min-h-[calc(100vh-40px)] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <HardHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">
              {isPreview ? "Förhandsvisning klar!" : "Tack!"}
            </h1>
            <p className="text-muted-foreground">
              {isPreview
                ? "Allt ser bra ut. Ingen data sparades. Du kan stänga denna flik."
                : "Din signering har registrerats. Du kan nu stänga denna sida."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectComplete;
