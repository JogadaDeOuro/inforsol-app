
-- contracts table
CREATE TABLE public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id text,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_document text,
  client_email text,
  client_phone text,
  client_address text,
  client_city text,
  client_state text,
  system_type text NOT NULL DEFAULT 'on-grid',
  potencia_kwp numeric NOT NULL DEFAULT 0,
  valor numeric NOT NULL DEFAULT 0,
  condicao_pagamento text,
  status text NOT NULL DEFAULT 'rascunho',
  signing_token text,
  signed_at timestamp with time zone,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- contract_signatures table
CREATE TABLE public.contract_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  signer_type text NOT NULL CHECK (signer_type IN ('empresa', 'cliente')),
  name text NOT NULL,
  document text NOT NULL,
  email text,
  signed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip text,
  location text,
  user_agent text,
  hash text NOT NULL,
  signature_font text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT unique_contract_signer UNIQUE (contract_id, signer_type)
);

-- RLS on contracts
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view contracts"
  ON public.contracts FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert contracts"
  ON public.contracts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update contracts"
  ON public.contracts FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete contracts"
  ON public.contracts FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS on contract_signatures
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view signatures"
  ON public.contract_signatures FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert signatures"
  ON public.contract_signatures FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Anon can insert signatures (for public signing page)
CREATE POLICY "Anon can insert signatures"
  ON public.contract_signatures FOR INSERT TO anon
  WITH CHECK (true);

-- Anon can view signatures (for public signing page)  
CREATE POLICY "Anon can view signatures"
  ON public.contract_signatures FOR SELECT TO anon
  USING (true);

-- Anon can view contracts by token (for public signing page)
CREATE POLICY "Anon can view contracts by token"
  ON public.contracts FOR SELECT TO anon
  USING (signing_token IS NOT NULL);

-- Anon can update contract status (for signing flow)
CREATE POLICY "Anon can update contracts for signing"
  ON public.contracts FOR UPDATE TO anon
  USING (signing_token IS NOT NULL);

-- Updated_at trigger
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
