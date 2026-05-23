import { Target, User, CheckCircle } from "lucide-react";

export interface QualityGoal {
  nr?: string;
  ansvarig?: string;
  mal?: string;
  egenkontroll?: string;
}

interface QualityGoalsCardsProps {
  goals: QualityGoal[];
}

const getStatusInfo = (egenkontroll?: string) => {
  if (!egenkontroll || !egenkontroll.trim()) {
    return { label: "Ej rapporterat", color: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/40" };
  }
  const lower = egenkontroll.toLowerCase();
  if (lower.includes("uppnått") || lower.includes("klar") || lower.includes("ok")) {
    return { label: egenkontroll, color: "bg-green-50 text-green-800 border-green-200", dot: "bg-green-500" };
  }
  if (lower.includes("pågå") || lower.includes("delvis")) {
    return { label: egenkontroll, color: "bg-amber-50 text-amber-800 border-amber-200", dot: "bg-amber-500" };
  }
  return { label: egenkontroll, color: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/40" };
};

const QualityGoalsCards = ({ goals }: QualityGoalsCardsProps) => {
  if (!goals || goals.length === 0) return null;

  return (
    <div className="space-y-3">
      {goals.map((goal, i) => {
        const status = getStatusInfo(goal.egenkontroll);
        const goalNumber = goal.nr || String(i + 1);

        return (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                {goalNumber}
              </div>
              <span className="text-sm font-bold text-foreground">Mål {goalNumber}</span>
            </div>

            <div className="space-y-2.5 pl-1">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <User className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ansvarig</span>
                </div>
                <p className="text-sm font-medium pl-[18px]">{goal.ansvarig?.trim() || "Ej angivet"}</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Target className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mål</span>
                </div>
                <p className="text-sm font-medium pl-[18px] whitespace-pre-line">{goal.mal?.trim() || "Ej angivet"}</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Egenkontroll / status</span>
                </div>
                <div className="pl-[18px] flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${status.dot} shrink-0`} />
                  <span className="text-sm font-medium">{status.label}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QualityGoalsCards;
