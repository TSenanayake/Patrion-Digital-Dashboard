import { AlertTriangle, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface CrisisAction {
  crisis_title: string;
  actions: string[];
}

export interface EmergencyChecklistCardsProps {
  crisisActions: CrisisAction[];
  searchTerm: string;
}

const EmergencyChecklistCards = ({ crisisActions, searchTerm }: EmergencyChecklistCardsProps) => {
  const filtered = searchTerm
    ? crisisActions.filter(ca =>
        [ca.crisis_title, ...ca.actions].some(t =>
          t.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : crisisActions;

  if (filtered.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Inga kriser matchar sökningen.</p>;
  }

  return (
    <Accordion type="multiple" className="w-full">
      {filtered.map((ca, i) => (
        <AccordionItem key={i} value={`crisis-${i}`} className="border-destructive/20">
          <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline gap-2 py-3">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              {ca.crisis_title}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1.5 pl-6">
              {ca.actions.map((action, j) => (
                <li key={j} className="text-sm leading-relaxed flex items-start gap-2">
                  <span className="text-destructive/60 shrink-0 mt-0.5">→</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default EmergencyChecklistCards;
