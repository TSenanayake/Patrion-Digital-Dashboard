import { Leaf, CheckCircle, Circle } from "lucide-react";

export interface EnvironmentGoal {
  mal?: string;
  beskrivning?: string;
  status?: string;
}

export interface EnvironmentAspectsData {
  description?: string;
  goals: EnvironmentGoal[];
}

interface EnvironmentGoalsCardsProps {
  data: EnvironmentAspectsData;
}

const StatusIcon = ({ status }: { status?: string }) => {
  const lower = (status || "").toLowerCase().trim();
  if (lower === "ja" || lower === "yes" || lower.includes("uppfylls") || lower.includes("uppnått")) {
    return (
      <div className="flex items-center gap-1.5">
        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
        <span className="text-sm font-medium text-green-700">Ja</span>
      </div>
    );
  }
  if (lower === "nej" || lower === "no" || lower.includes("ej uppfyllt")) {
    return (
      <div className="flex items-center gap-1.5">
        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium text-muted-foreground">Nej</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
      <span className="text-sm font-medium text-muted-foreground">Ej rapporterat</span>
    </div>
  );
};

const EnvironmentGoalsCards = ({ data }: EnvironmentGoalsCardsProps) => {
  if (!data || !data.goals || data.goals.length === 0) return null;

  return (
    <div className="space-y-4">
      {data.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">{data.description}</p>
      )}

      <div className="space-y-3">
        {data.goals.map((goal, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 shrink-0 mt-0.5">
                <Leaf className="h-3.5 w-3.5 text-green-700" />
              </div>
              <div className="flex-1 space-y-1.5">
                <p className="text-sm font-semibold text-foreground whitespace-pre-line">
                  {goal.mal?.trim() || "Ej angivet"}
                </p>
                {goal.beskrivning?.trim() && (
                  <p className="text-xs text-muted-foreground">{goal.beskrivning}</p>
                )}
              </div>
            </div>

            <div className="pl-9">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</span>
                <StatusIcon status={goal.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnvironmentGoalsCards;
