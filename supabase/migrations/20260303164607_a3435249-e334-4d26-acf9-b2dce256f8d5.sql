
CREATE TABLE public.document_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  image_index integer NOT NULL DEFAULT 0,
  image_url text NOT NULL,
  page_number integer,
  image_type text NOT NULL DEFAULT 'unknown',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_images_document_id ON public.document_images(document_id);

ALTER TABLE public.document_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document images are publicly readable"
  ON public.document_images FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert document images"
  ON public.document_images FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete document images"
  ON public.document_images FOR DELETE
  USING (true);
