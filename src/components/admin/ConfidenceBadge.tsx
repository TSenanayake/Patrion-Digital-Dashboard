import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { ExtendedDocument } from "@/components/admin/tabs/types";

export const ConfidenceBadge = ({ doc }: { doc: ExtendedDocument }) => {
  const confidence = doc.smart_view_confidence;
  const status = doc.extraction_status;

  if (status === "pending") {
    return <Badge variant="secondary"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Bearbetar...</Badge>;
  }
  if (status === "failed") {
    return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" /> Misslyckades</Badge>;
  }

  switch (confidence) {
    case "high":
      return <Badge variant="default" className="bg-success text-success-foreground">🟢 Smart vy</Badge>;
    case "medium":
      return <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">🟡 Smart vy</Badge>;
    case "low":
      return <Badge variant="outline">⚪ Original</Badge>;
    default:
      if (status === "success") return <Badge variant="default" className="bg-success text-success-foreground"><CheckCircle className="mr-1 h-3 w-3" /> Extraherad</Badge>;
      return null;
  }
};
