import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import type { DocumentSlot } from "./types";

type Question = Tables<"questions">;

interface QuestionsTabProps {
  slots: DocumentSlot[];
  questions: Question[];
  selectedSlotId: string | null;
  selectedDocId: string | null;
  onAddQuestion: () => void;
  onDeleteQuestion: (questionId: string) => void;
  onSlotSelect: (slotId: string) => void;
}

export function QuestionsTab({
  slots,
  questions,
  selectedSlotId,
  selectedDocId,
  onAddQuestion,
  onDeleteQuestion,
  onSlotSelect,
}: QuestionsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            onSlotSelect(null as any);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Lägg till fråga
        </Button>
      </div>

      {slots.map((slot) => {
        const slotQuestions = questions.filter((q) => q.slot_id === slot.id);
        if (slotQuestions.length === 0) return null;
        return (
          <Card key={slot.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">{slot.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {slotQuestions.map((q) => (
                <div
                  key={q.id}
                  className="flex items-start justify-between gap-2 rounded-md border p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{q.question_text}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {q.question_type === "true_false" ? "Sant/Falskt" : "Flerval"}
                      </Badge>
                      {(q as any).is_default && (
                        <Badge variant="secondary" className="text-[10px]">
                          Standard
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 shrink-0"
                    onClick={() => onDeleteQuestion(q.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onSlotSelect(slot.id)}
              >
                <Plus className="mr-1 h-3 w-3" /> Lägg till fråga för {slot.title}
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {slots
        .filter((s) => !questions.some((q) => q.slot_id === s.id))
        .map((slot) => (
          <Card key={slot.id} className="border-dashed">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{slot.title} – inga frågor</p>
                <Button variant="outline" size="sm" onClick={() => onSlotSelect(slot.id)}>
                  <Plus className="mr-1 h-3 w-3" /> Lägg till
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
