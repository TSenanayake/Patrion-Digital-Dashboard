
-- Create chemical_products table
CREATE TABLE public.chemical_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  manufacturer text,
  hazard_code text,
  has_safety_datasheet boolean NOT NULL DEFAULT false,
  safety_datasheet_url text,
  storage_location text,
  first_delivery_date date,
  built_in_date date,
  finished_date date,
  environmental_class text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chemical_products ENABLE ROW LEVEL SECURITY;

-- RLS policies (public read, authenticated write)
CREATE POLICY "Chemical products are publicly readable"
  ON public.chemical_products FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert chemical products"
  ON public.chemical_products FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update chemical products"
  ON public.chemical_products FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete chemical products"
  ON public.chemical_products FOR DELETE TO authenticated USING (true);

-- Updated_at trigger
CREATE TRIGGER update_chemical_products_updated_at
  BEFORE UPDATE ON public.chemical_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
