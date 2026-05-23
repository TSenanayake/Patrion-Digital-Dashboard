
-- Add project_number to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_number text;

-- Create document_slots table
CREATE TABLE public.document_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  slot_type text NOT NULL,
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, slot_type)
);

-- Add slot_id to documents
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS slot_id uuid REFERENCES public.document_slots(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.document_slots ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_slots
CREATE POLICY "Document slots are publicly readable" ON public.document_slots FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert document slots" ON public.document_slots FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update document slots" ON public.document_slots FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete document slots" ON public.document_slots FOR DELETE TO authenticated USING (true);

-- Function to auto-create slots when a project is created
CREATE OR REPLACE FUNCTION public.create_default_document_slots()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.document_slots (project_id, slot_type, title, description, sort_order) VALUES
    (NEW.id, 'ordningsregler', 'Ordnings- och skyddsregler', 'Projektets ordnings- och skyddsregler', 1),
    (NEW.id, 'skyddsorganisation', 'Skyddsorganisation', 'Skyddsorganisation med kontaktuppgifter', 2),
    (NEW.id, 'arbetsmiljoplan', 'Arbetsmiljöplan', 'Projektets arbetsmiljöplan (KMA)', 3),
    (NEW.id, 'apd_plan', 'APD-plan', 'Arbetsplatsdispositionsplan', 4),
    (NEW.id, 'olycksrutiner', 'Rutiner vid olycka', 'Nödsituation och rutiner vid olycka', 5),
    (NEW.id, 'kontaktlista', 'Kontaktlista', 'Projektets kontaktlista', 6);
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER create_slots_on_project_insert
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_document_slots();

-- Create slots for existing projects that don't have them
INSERT INTO public.document_slots (project_id, slot_type, title, description, sort_order)
SELECT p.id, s.slot_type, s.title, s.description, s.sort_order
FROM public.projects p
CROSS JOIN (VALUES
  ('ordningsregler', 'Ordnings- och skyddsregler', 'Projektets ordnings- och skyddsregler', 1),
  ('skyddsorganisation', 'Skyddsorganisation', 'Skyddsorganisation med kontaktuppgifter', 2),
  ('arbetsmiljoplan', 'Arbetsmiljöplan', 'Projektets arbetsmiljöplan (KMA)', 3),
  ('apd_plan', 'APD-plan', 'Arbetsplatsdispositionsplan', 4),
  ('olycksrutiner', 'Rutiner vid olycka', 'Nödsituation och rutiner vid olycka', 5),
  ('kontaktlista', 'Kontaktlista', 'Projektets kontaktlista', 6)
) AS s(slot_type, title, description, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.document_slots ds WHERE ds.project_id = p.id AND ds.slot_type = s.slot_type
);
