import { Building2, MapPin, Calendar, User, Briefcase, FileText, Hash, HardHat } from "lucide-react";

export interface ProjectInfoData {
  projektnamn?: string;
  projektnummer?: string;
  arbetsplats_adress?: string;
  bestallare?: string;
  bestallare_kontakt?: string;
  startdatum?: string;
  fardigstallande?: string;
  entreprenadform?: string;
  projektbeskrivning?: string;
  bas_p?: string;
  bas_u?: string;
}

interface ProjectInfoCardProps {
  projectInfo: ProjectInfoData;
}

const InfoField = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="space-y-0.5">
    <div className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-sm font-medium pl-[18px] whitespace-pre-line">{value}</p>
  </div>
);

const ProjectInfoCard = ({ projectInfo }: ProjectInfoCardProps) => {
  const p = projectInfo;
  const hasData = Object.values(p).some(v => v && v.trim());
  if (!hasData) return null;

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5 space-y-4 mb-4">
      <div className="flex items-center gap-2">
        <HardHat className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Projektinformation</h3>
      </div>

      <div className="space-y-3">
        {p.projektnamn && <InfoField icon={Building2} label="Projektnamn" value={p.projektnamn} />}
        {p.projektnummer && <InfoField icon={Hash} label="Projektnummer" value={p.projektnummer} />}
        {p.arbetsplats_adress && <InfoField icon={MapPin} label="Arbetsplats" value={p.arbetsplats_adress} />}
        {(p.bestallare || p.bestallare_kontakt) && (
          <InfoField
            icon={User}
            label="Beställare"
            value={[p.bestallare, p.bestallare_kontakt].filter(Boolean).join("\n")}
          />
        )}
        {p.startdatum && <InfoField icon={Calendar} label="Start" value={p.startdatum} />}
        {p.fardigstallande && <InfoField icon={Calendar} label="Färdigställande" value={p.fardigstallande} />}
        {p.entreprenadform && <InfoField icon={Briefcase} label="Entreprenadform" value={p.entreprenadform} />}
        {p.projektbeskrivning && <InfoField icon={FileText} label="Projektbeskrivning" value={p.projektbeskrivning} />}
        {p.bas_p && <InfoField icon={User} label="BAS-P" value={p.bas_p} />}
        {p.bas_u && <InfoField icon={User} label="BAS-U" value={p.bas_u} />}
      </div>
    </div>
  );
};

export default ProjectInfoCard;
