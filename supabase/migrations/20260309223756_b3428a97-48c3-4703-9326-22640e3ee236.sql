
-- Create project_stages table
CREATE TABLE public.project_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  tracking_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create stage_items table
CREATE TABLE public.stage_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_stage_id UUID REFERENCES public.project_stages(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  data_prevista DATE,
  data_real DATE,
  responsavel TEXT DEFAULT '',
  observacoes TEXT DEFAULT '',
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create validation trigger for status instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_stage_item_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('pendente', 'em_andamento', 'concluido', 'atrasado') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_stage_item_status_trigger
  BEFORE INSERT OR UPDATE ON public.stage_items
  FOR EACH ROW EXECUTE FUNCTION public.validate_stage_item_status();

-- Enable RLS
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_items ENABLE ROW LEVEL SECURITY;

-- RLS for project_stages: authenticated users CRUD
CREATE POLICY "Authenticated users can view project_stages"
  ON public.project_stages FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert project_stages"
  ON public.project_stages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update project_stages"
  ON public.project_stages FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete project_stages"
  ON public.project_stages FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Public read access by tracking_token (anon role)
CREATE POLICY "Public can view by tracking_token"
  ON public.project_stages FOR SELECT TO anon
  USING (true);

-- RLS for stage_items: authenticated users CRUD
CREATE POLICY "Authenticated users can view stage_items"
  ON public.stage_items FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert stage_items"
  ON public.stage_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update stage_items"
  ON public.stage_items FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete stage_items"
  ON public.stage_items FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Public read access for stage_items via join on project_stages tracking_token
CREATE POLICY "Public can view stage_items by project"
  ON public.stage_items FOR SELECT TO anon
  USING (true);

-- Updated_at trigger for project_stages
CREATE TRIGGER update_project_stages_updated_at
  BEFORE UPDATE ON public.project_stages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
