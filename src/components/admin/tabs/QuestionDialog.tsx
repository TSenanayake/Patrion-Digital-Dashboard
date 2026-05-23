import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { DocumentSlot } from "./types";

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slots: DocumentSlot[];
  selectedSlotId: string | null;
  selectedDocId: string | null;
  questionForm: {
    question_text: string;
    question_type: "true_false" | "multiple_choice";
    correct_answer: string;
    options: string[];
  };
  setQuestionForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function QuestionDialog({
  open,
  onOpenChange,
  slots,
  selectedSlotId,
  questionForm,
  setQuestionForm,
  onSubmit,
}: QuestionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Ny kontrollfråga</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {!selectedSlotId && (
            <div className="space-y-2">
              <Label>Dokumentplats</Label>
              <Select
                value={selectedSlotId || ""}
                onValueChange={() => {}}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj dokumentplats..." />
                </SelectTrigger>
                <SelectContent>
                  {slots.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Frågetext</Label>
            <Textarea
              value={questionForm.question_text}
              onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Svarstyp</Label>
            <Select
              value={questionForm.question_type}
              onValueChange={(v: "true_false" | "multiple_choice") =>
                setQuestionForm({ ...questionForm, question_type: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true_false">Sant/Falskt</SelectItem>
                <SelectItem value="multiple_choice">Flerval</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {questionForm.question_type === "multiple_choice" && (
            <div className="space-y-2">
              <Label>Svarsalternativ</Label>
              {questionForm.options.map((opt, i) => (
                <Input
                  key={i}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...questionForm.options];
                    newOpts[i] = e.target.value;
                    setQuestionForm({ ...questionForm, options: newOpts });
                  }}
                  placeholder={`Alternativ ${i + 1}`}
                />
              ))}
            </div>
          )}
          <div className="space-y-2">
            <Label>Rätt svar</Label>
            {questionForm.question_type === "true_false" ? (
              <Select
                value={questionForm.correct_answer}
                onValueChange={(v) => setQuestionForm({ ...questionForm, correct_answer: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sant</SelectItem>
                  <SelectItem value="false">Falskt</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={questionForm.correct_answer}
                onValueChange={(v) => setQuestionForm({ ...questionForm, correct_answer: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj rätt alternativ..." />
                </SelectTrigger>
                <SelectContent>
                  {questionForm.options.filter(Boolean).map((opt, i) => (
                    <SelectItem key={i} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Button type="submit" className="w-full">
            Skapa fråga
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
