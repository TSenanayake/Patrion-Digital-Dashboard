
-- Add 7th slot to trigger function
CREATE OR REPLACE FUNCTION public.create_default_document_slots()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.document_slots (project_id, slot_type, title, description, sort_order) VALUES
    (NEW.id, 'ordningsregler', 'Ordnings- och skyddsregler', 'Projektets ordnings- och skyddsregler', 1),
    (NEW.id, 'skyddsorganisation', 'Skyddsorganisation', 'Skyddsorganisation med kontaktuppgifter', 2),
    (NEW.id, 'arbetsmiljoplan', 'Arbetsmiljöplan', 'Projektets arbetsmiljöplan (KMA)', 3),
    (NEW.id, 'apd_plan', 'APD-plan', 'Arbetsplatsdispositionsplan', 4),
    (NEW.id, 'olycksrutiner', 'Rutiner vid olycka', 'Nödsituation och rutiner vid olycka', 5),
    (NEW.id, 'kontaktlista', 'Kontaktlista', 'Projektets kontaktlista', 6),
    (NEW.id, 'checklista_nodlage', 'Checklista Nödläge', 'Checklista med kriser och åtgärder', 7);
  RETURN NEW;
END;
$function$;

-- Add the 7th slot to all existing projects that don't have it
INSERT INTO public.document_slots (project_id, slot_type, title, description, sort_order)
SELECT p.id, 'checklista_nodlage', 'Checklista Nödläge', 'Checklista med kriser och åtgärder', 7
FROM public.projects p
WHERE NOT EXISTS (
  SELECT 1 FROM public.document_slots ds 
  WHERE ds.project_id = p.id AND ds.slot_type = 'checklista_nodlage'
);
