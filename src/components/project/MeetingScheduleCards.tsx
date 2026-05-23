import { CalendarClock, Hash, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface MeetingEntry {
  nr?: string;
  meeting?: string;
  participants?: string;
  timing?: string;
}

interface MeetingScheduleCardsProps {
  meetings: MeetingEntry[];
  searchTerm?: string;
}

const MeetingScheduleCards = ({ meetings, searchTerm }: MeetingScheduleCardsProps) => {
  if (!meetings || meetings.length === 0) return null;

  const filtered = searchTerm
    ? meetings.filter(m =>
        [m.nr, m.meeting, m.participants, m.timing]
          .filter(Boolean)
          .some(v => v!.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : meetings;

  if (filtered.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Inga möten matchar sökningen.</p>;
  }

  return (
    <div className="space-y-3">
      {filtered.map((meeting, i) => {
        const participantList = meeting.participants
          ? meeting.participants.split(/,\s*/).map(p => p.trim()).filter(Boolean)
          : [];

        return (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
            {meeting.meeting && (
              <h4 className="text-sm font-bold text-foreground">{meeting.meeting}</h4>
            )}

            {meeting.nr && (
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground">Mötesnummer</span>
                <span className="text-sm font-medium">{meeting.nr}</span>
              </div>
            )}

            {participantList.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">Deltagare</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-5">
                  {participantList.map((p, j) => (
                    <Badge key={j} variant="secondary" className="text-xs font-normal">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {meeting.timing && (
              <div className="flex items-center gap-2">
                <CalendarClock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground">Tidpunkt</span>
                <span className="text-sm">{meeting.timing}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MeetingScheduleCards;
