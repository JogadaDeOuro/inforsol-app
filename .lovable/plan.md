## Plano de execução em 4 fases

Cada fase é entregue como um conjunto coeso, testável separadamente. Posso parar entre fases se algo precisar ajuste.

---

### Fase 1 — Crítico (segurança)

**Migração SQL única:**
1. `contracts` — substituir policy `Anon can update contracts for signing` para exigir que `current_setting('request.jwt.claims', true)` ou parâmetro do RPC traga o token igual ao `signing_token`. Como RLS não recebe header customizado, a forma segura é: criar RPC `sign_contract(token text, payload jsonb)` em `SECURITY DEFINER`, revogar UPDATE direto do `anon`, e no RPC validar o token. O front passa a chamar a RPC.
2. `contract_signatures` — remover `INSERT WITH CHECK (true)` para `anon`. Inserts de assinatura passam pela mesma RPC.
3. `clients`, `project_stages`, `stage_items`, `tags` — manter SELECT amplo só para `admin`; demais usuários só veem registros onde `user_id = auth.uid()` (clients/project_stages têm `user_id`). Para `stage_items`, filtrar via JOIN com `project_stages.user_id`. Para `tags`, manter público — é catálogo.
4. Habilitar **Leaked Password Protection** via `configure_auth`.
5. Revisar `EXECUTE` das funções `handle_new_user`, `update_updated_at`, `validate_stage_item_status`, `has_role`: revogar de `anon`/`authenticated` onde não é chamada diretamente do client.

**Código:** atualizar `Contratos.tsx` e `AssinarContrato.tsx` para usar `supabase.rpc('sign_contract', …)` em vez de `update`/`insert` direto.

### Fase 2 — Alto (bugs/fluxo)

6. Tipar `Dashboard.tsx` com tipos do Supabase (`Tables<'clients'>`, etc.) e remover `any[]`.
7. Auditar `localStorage` em `Dashboard.tsx` — remover fallback antigo se já tudo vem do banco.
8. Smoke-test do fluxo de assinatura (interna 1/2 → externa 2/2, link em aba anônima) usando o browser tool.

### Fase 3 — Refatoração

9. Extrair de `CRM.tsx`:
   - `components/forms/AddressFields.tsx` (CEP + UF + cidade + bairro + endereço, com IBGE/ViaCEP)
   - `components/forms/ContactFields.tsx` (telefone + whatsapp com máscara)
   - `lib/masks.ts` (CPF, CNPJ, telefone, CEP)
10. Extrair de `NovaPropostaPage.tsx` / `EditarPropostaPage.tsx` um `components/proposal/ProposalForm.tsx` único, alimentado por props (modo `create` | `edit`). Reduz duplicação ~600 linhas.
11. Criar hooks `hooks/useClients.ts`, `hooks/useContracts.ts`, `hooks/useProposals.ts` — encapsulam fetch/cache e tipagem.

### Fase 4 — Polimento UX

12. `components/ErrorBoundary.tsx` global no `App.tsx` com fallback amigável.
13. `react-router` — adicionar future flags `v7_startTransition` e `v7_relativeSplatPath` para silenciar warnings.
14. SEO: hook `useSEO(title, description)` por rota; H1 único garantido.
15. Skeletons consistentes via `components/ui/skeleton` em Dashboard, CRM, Propostas, Contratos.
16. Aplicar `formatPhone` e máscaras CPF/CNPJ também no Sheet de edição de cliente.
17. Validação leve de CPF/CNPJ (dígitos verificadores) usando função utilitária pura.

### Detalhes técnicos relevantes

- A RPC `sign_contract(p_token text, p_signer jsonb)` valida token, faz upsert da assinatura na tabela e atualiza status do contrato em uma única transação. Retorna `{ ok, signatures_count, status }`.
- Tipagem virá de `Database['public']['Tables']['clients']['Row']` para evitar `as any`.
- Para `clients` multi-tenant: assumir que cada `user_id` é o vendedor dono. Admins veem tudo via `has_role(auth.uid(), 'admin')`. Confirmar antes se vendedores devem ver clientes uns dos outros.

### Risco principal a confirmar antes de Fase 1

Hoje qualquer vendedor logado vê todos os clientes (RLS `USING (true)`). Se for intencional (equipe pequena compartilha pipeline), eu **não** restrinjo na Fase 1. Caso contrário, restrinjo a `user_id = auth.uid() OR has_role(auth.uid(),'admin')`.

### Arquivos previstos

- Nova migração SQL.
- `src/pages/Contratos.tsx`, `src/pages/AssinarContrato.tsx`, `src/pages/Dashboard.tsx`.
- Novos: `src/components/ErrorBoundary.tsx`, `src/components/forms/AddressFields.tsx`, `src/components/forms/ContactFields.tsx`, `src/components/proposal/ProposalForm.tsx`, `src/hooks/useClients.ts`, `src/hooks/useContracts.ts`, `src/hooks/useProposals.ts`, `src/lib/masks.ts`, `src/lib/seo.ts`, `src/lib/validators.ts`.
- `src/App.tsx`, `src/pages/CRM.tsx`, `src/pages/NovaPropostaPage.tsx`, `src/pages/EditarPropostaPage.tsx`, `src/pages/Propostas.tsx`.
