import { Card, CardContent } from "@/components/ui/card";
import { FileText, HelpCircle, Users, CheckCircle } from "lucide-react";

interface ProjectStatsProps {
  totalDocs: number;
  slotsCount: number;
  questionsCount: number;
  signaturesCount: number;
}

export function ProjectStats({ totalDocs, slotsCount, questionsCount, signaturesCount }: ProjectStatsProps) {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalDocs} / {slotsCount}</p>
            <p className="text-xs text-muted-foreground">Dokument uppladdade</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{questionsCount}</p>
            <p className="text-xs text-muted-foreground">Kontrollfrågor</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{signaturesCount}</p>
            <p className="text-xs text-muted-foreground">Signeringar</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <CheckCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{slotsCount}</p>
            <p className="text-xs text-muted-foreground">Dokumentplatser</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
