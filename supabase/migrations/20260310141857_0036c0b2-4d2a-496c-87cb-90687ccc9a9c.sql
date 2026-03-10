
-- Table: user_page_permissions
CREATE TABLE public.user_page_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, page_key)
);

ALTER TABLE public.user_page_permissions ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage page permissions" ON public.user_page_permissions
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can read own permissions
CREATE POLICY "Users can view own permissions" ON public.user_page_permissions
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Table: tags
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- All authenticated can read tags
CREATE POLICY "Authenticated can view tags" ON public.tags
FOR SELECT TO authenticated
USING (true);

-- Admins can manage tags
CREATE POLICY "Admins can manage tags" ON public.tags
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
