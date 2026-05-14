
-- 1) Prevent duplicate signatures (per signer_type per contract) at DB level
CREATE UNIQUE INDEX IF NOT EXISTS contract_signatures_unique_per_signer
  ON public.contract_signatures (contract_id, signer_type);

-- 2) Tighten anon INSERT on contract_signatures:
--    - only allow signer_type = 'cliente'
--    - only when target contract has a signing_token (i.e., publicly signable)
DROP POLICY IF EXISTS "Anon can insert signatures" ON public.contract_signatures;
CREATE POLICY "Anon can insert client signatures via token"
ON public.contract_signatures
FOR INSERT
TO anon
WITH CHECK (
  signer_type = 'cliente'
  AND EXISTS (
    SELECT 1 FROM public.contracts c
    WHERE c.id = contract_id
      AND c.signing_token IS NOT NULL
  )
);

-- 3) Restrict anon UPDATE on contracts to only status / signed_at columns
--    (RLS still requires signing_token IS NOT NULL)
REVOKE UPDATE ON public.contracts FROM anon;
GRANT  UPDATE (status, signed_at) ON public.contracts TO anon;

-- 4) Lock down trigger / internal SECURITY DEFINER functions:
--    these should never be called directly by clients
REVOKE EXECUTE ON FUNCTION public.handle_new_user()           FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at()         FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_stage_item_status() FROM PUBLIC, anon, authenticated;
-- has_role() must remain callable by authenticated (used inside RLS expressions)
