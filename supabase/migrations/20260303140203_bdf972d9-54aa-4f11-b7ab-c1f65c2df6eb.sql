
-- Create question_type enum
CREATE TYPE public.question_type AS ENUM ('multiple_choice', 'true_false');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  company TEXT,
  start_date DATE,
  end_date DATE,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Public read for projects (users scan QR to access)
CREATE POLICY "Projects are publicly readable"
  ON public.projects FOR SELECT
  USING (true);

-- Only authenticated users (admins) can manage projects
CREATE POLICY "Authenticated users can insert projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_file_url TEXT,
  extracted_text TEXT,
  version_number INTEGER NOT NULL DEFAULT 1,
  is_latest BOOLEAN NOT NULL DEFAULT true,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Documents are publicly readable"
  ON public.documents FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert documents"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update documents"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete documents"
  ON public.documents FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX idx_documents_project_id ON public.documents(project_id);

-- ============================================
-- INFO_BLOCKS
-- ============================================
CREATE TABLE public.info_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  requires_resign BOOLEAN NOT NULL DEFAULT false,
  version_number INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.info_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Info blocks are publicly readable"
  ON public.info_blocks FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage info blocks"
  ON public.info_blocks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update info blocks"
  ON public.info_blocks FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete info blocks"
  ON public.info_blocks FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- QUESTIONS
-- ============================================
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type public.question_type NOT NULL DEFAULT 'true_false',
  correct_answer TEXT NOT NULL,
  options JSONB,
  version_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are publicly readable"
  ON public.questions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage questions"
  ON public.questions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update questions"
  ON public.questions FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete questions"
  ON public.questions FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PROJECT_USERS (workers who scan QR)
-- ============================================
CREATE TABLE public.project_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  p06_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_users ENABLE ROW LEVEL SECURITY;

-- Anyone can create a project user (workers register via QR)
CREATE POLICY "Anyone can insert project users"
  ON public.project_users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Project users are publicly readable"
  ON public.project_users FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update project users"
  ON public.project_users FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================
-- SIGNATURES
-- ============================================
CREATE TABLE public.signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.project_users(id) ON DELETE CASCADE,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signatures are publicly readable"
  ON public.signatures FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert signatures"
  ON public.signatures FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_signatures_project_id ON public.signatures(project_id);
CREATE INDEX idx_signatures_user_id ON public.signatures(user_id);

-- ============================================
-- DOCUMENT_READS
-- ============================================
CREATE TABLE public.document_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.project_users(id) ON DELETE CASCADE,
  document_version INTEGER NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.document_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document reads are publicly readable"
  ON public.document_reads FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert document reads"
  ON public.document_reads FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_document_reads_document_id ON public.document_reads(document_id);
CREATE INDEX idx_document_reads_user_id ON public.document_reads(user_id);

-- ============================================
-- QUESTION_ANSWERS
-- ============================================
CREATE TABLE public.question_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.project_users(id) ON DELETE CASCADE,
  answer_given TEXT NOT NULL,
  correct BOOLEAN NOT NULL DEFAULT false,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Question answers are publicly readable"
  ON public.question_answers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert question answers"
  ON public.question_answers FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_question_answers_question_id ON public.question_answers(question_id);
CREATE INDEX idx_question_answers_user_id ON public.question_answers(user_id);

-- ============================================
-- STORAGE BUCKET for document uploads
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true);

CREATE POLICY "Documents are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated users can update documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can delete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents');
