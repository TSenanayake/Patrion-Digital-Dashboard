import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface QuestionForm {
  question_text: string;
  question_type: "true_false" | "multiple_choice";
  correct_answer: string;
  options: string[];
}

export const useQuestionForm = () => {
  const queryClient = useQueryClient();
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    question_text: "",
    question_type: "true_false",
    correct_answer: "",
    options: ["", "", "", ""],
  });
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const insertData: any = {
      question_text: questionForm.question_text,
      question_type: questionForm.question_type,
      correct_answer: questionForm.correct_answer,
      options: questionForm.question_type === "multiple_choice" ? questionForm.options.filter(Boolean) : null,
      is_default: false,
    };

    if (selectedSlotId) {
      insertData.slot_id = selectedSlotId;
    } else {
      return;
    }

    const { error } = await supabase.from("questions").insert(insertData);
    if (error) { toast.error(error.message); return; }
    toast.success("Kontrollfråga skapad!");
    setQuestionDialogOpen(false);
    setSelectedSlotId(null);
    setQuestionForm({ question_text: "", question_type: "true_false", correct_answer: "", options: ["", "", "", ""] });
    queryClient.invalidateQueries({ queryKey: ['slots'] });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const { error } = await supabase.from("questions").delete().eq("id", questionId);
    if (error) { toast.error(error.message); return; }
    toast.success("Fråga borttagen!");
    queryClient.invalidateQueries({ queryKey: ['slots'] });
  };

  return {
    questionDialogOpen,
    setQuestionDialogOpen,
    questionForm,
    setQuestionForm,
    selectedSlotId,
    setSelectedSlotId,
    handleQuestionSubmit,
    handleDeleteQuestion,
  };
};
