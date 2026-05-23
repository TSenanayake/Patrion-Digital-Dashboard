
-- Add phone to project_users
ALTER TABLE public.project_users ADD COLUMN IF NOT EXISTS phone text;

-- Add signature_image_url and device_info to signatures
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS signature_image_url text;
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS device_info text;
