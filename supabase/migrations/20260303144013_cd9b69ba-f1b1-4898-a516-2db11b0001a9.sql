
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS mime_type text,
ADD COLUMN IF NOT EXISTS extraction_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS extraction_error text,
ADD COLUMN IF NOT EXISTS mobile_html text;

CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_title ON public.documents(project_id, title);
