
CREATE TABLE public.document_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  language text NOT NULL,
  translated_sections jsonb,
  translated_questions jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_document_translations_unique ON public.document_translations (document_id, language);

ALTER TABLE public.document_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document translations are publicly readable"
  ON public.document_translations FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can insert document translations"
  ON public.document_translations FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can update document translations"
  ON public.document_translations FOR UPDATE TO public USING (true);
