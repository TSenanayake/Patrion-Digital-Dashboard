
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS smart_view_data jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS smart_view_confidence text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'text';
