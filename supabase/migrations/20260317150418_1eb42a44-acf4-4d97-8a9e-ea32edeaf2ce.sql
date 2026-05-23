CREATE OR REPLACE FUNCTION public.create_default_document_slots()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  slot_record RECORD;
BEGIN
  INSERT INTO public.document_slots (project_id, slot_type, title, description, sort_order) VALUES
    (NEW.id, 'ordningsregler', 'Ordnings- och skyddsregler', 'Projektets ordnings- och skyddsregler', 1),
    (NEW.id, 'skyddsorganisation', 'Skyddsorganisation', 'Skyddsorganisation med kontaktuppgifter', 2),
    (NEW.id, 'arbetsmiljoplan', 'KMA-Plan', 'Projektets KMA-plan', 3),
    (NEW.id, 'apd_plan', 'APD-plan', 'Arbetsplatsdispositionsplan', 4),
    (NEW.id, 'olycksrutiner', 'Nödsituation - Anslås', 'Nödsituation och rutiner vid olycka', 5),
    (NEW.id, 'kontaktlista', 'Kontaktlista', 'Projektets kontaktlista', 6),
    (NEW.id, 'checklista_nodlage', 'Checklista Nödläge', 'Checklista med kriser och åtgärder', 7);

  FOR slot_record IN
    SELECT id, slot_type FROM public.document_slots WHERE project_id = NEW.id
  LOOP
    CASE slot_record.slot_type
      WHEN 'ordningsregler' THEN
        INSERT INTO public.questions (slot_id, question_text, question_type, correct_answer, is_default) VALUES
          (slot_record.id, 'Har du förstått och accepterar du projektets ordnings- och skyddsregler?', 'true_false', 'true', true);
      WHEN 'skyddsorganisation' THEN
        INSERT INTO public.questions (slot_id, question_text, question_type, correct_answer, is_default) VALUES
          (slot_record.id, 'Vet du vem som är skyddsombud på detta projekt?', 'true_false', 'true', true);
      WHEN 'arbetsmiljoplan' THEN
        INSERT INTO public.questions (slot_id, question_text, question_type, correct_answer, is_default) VALUES
          (slot_record.id, 'Har du tagit del av projektets KMA-plan?', 'true_false', 'true', true);
      WHEN 'apd_plan' THEN
        INSERT INTO public.questions (slot_id, question_text, question_type, correct_answer, is_default) VALUES
          (slot_record.id, 'Vet du var återsamlingsplatsen finns enligt APD-planen?', 'true_false', 'true', true);
      WHEN 'olycksrutiner' THEN
        INSERT INTO public.questions (slot_id, question_text, question_type, correct_answer, is_default) VALUES
          (slot_record.id, 'Vet du vad du ska göra vid en olycka på arbetsplatsen?', 'true_false', 'true', true);
      WHEN 'kontaktlista' THEN
        INSERT INTO public.questions (slot_id, question_text, question_type, correct_answer, is_default) VALUES
          (slot_record.id, 'Vet du hur du kontaktar arbetsledningen vid behov?', 'true_false', 'true', true);
      WHEN 'checklista_nodlage' THEN
        INSERT INTO public.questions (slot_id, question_text, question_type, correct_answer, is_default) VALUES
          (slot_record.id, 'Vet du var närmaste första hjälpen-utrustning finns?', 'true_false', 'true', true);
      ELSE
        NULL;
    END CASE;
  END LOOP;

  RETURN NEW;
END;
$function$;