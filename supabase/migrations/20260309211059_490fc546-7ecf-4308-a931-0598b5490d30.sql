
-- Tighten insert/update policies to require authenticated user_id
DROP POLICY "Authenticated users can insert clients" ON public.clients;
DROP POLICY "Authenticated users can update clients" ON public.clients;

CREATE POLICY "Authenticated users can insert clients"
  ON public.clients FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update clients"
  ON public.clients FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
