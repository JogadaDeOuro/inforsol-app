
-- Remove overly permissive anon policy
DROP POLICY "Anon can insert notifications" ON public.notifications;
