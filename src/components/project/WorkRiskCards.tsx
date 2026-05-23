import { AlertTriangle, Construction, Zap, HardHat, Truck, Flame, Skull, Wind, Ear, Radiation } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface WorkRisk {
  nr: string;
  description: string;
}

interface WorkRiskCardsProps {
  risks: WorkRisk[];
  searchTerm?: string;
}

const riskIcons: { pattern: RegExp; icon: typeof AlertTriangle }[] = [
  { pattern: /trafik|fordon|last/i, icon: Truck },
  { pattern: /el|ström|elektrisk/i, icon: Zap },
  { pattern: /fall|höjd|ställning/i, icon: HardHat },
  { pattern: /brand|het|svets/i, icon: Flame },
  { pattern: /kemisk|biologisk|asbest|gift/i, icon: Skull },
  { pattern: /buller|ljud/i, icon: Ear },
  { pattern: /strålning|radon/i, icon: Radiation },
  { pattern: /ras|schakt|grävning/i, icon: Construction },
  { pattern: /vind|väder|kyla/i, icon: Wind },
];

function getRiskIcon(description: string) {
  for (const { pattern, icon } of riskIcons) {
    if (pattern.test(description)) return icon;
  }
  return AlertTriangle;
}

const WorkRiskCards = ({ risks, searchTerm }: WorkRiskCardsProps) => {
  if (!risks || risks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center">
        <p className="text-sm text-muted-foreground">Inga identifierade arbetsmiljörisker</p>
      </div>
    );
  }

  const filtered = searchTerm
    ? risks.filter(r =>
        [r.nr, r.description]
          .filter(Boolean)
          .some(v => v.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : risks;

  if (filtered.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Inga risker matchar sökningen.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
        <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
        <span className="text-sm font-semibold text-destructive">
          {filtered.length} identifierad{filtered.length !== 1 ? "e" : ""} arbetsmiljörisk{filtered.length !== 1 ? "er" : ""}
        </span>
      </div>

      {filtered.map((risk, i) => {
        const Icon = getRiskIcon(risk.description);
        return (
          <div key={i} className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-1">
            <Badge variant="outline" className="text-xs font-medium text-destructive border-destructive/30">
              Risk {risk.nr}
            </Badge>
            <div className="flex items-start gap-2 pt-1">
              <Icon className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-foreground leading-relaxed">{risk.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkRiskCards;
