
Objetivo: corrigir definitivamente o fluxo de assinatura em 2 etapas (empresa + cliente), impedir duplicidade e fazer o link de assinatura funcionar fora do navegador atual.

1) Diagnóstico confirmado
- Duplicidade da assinatura interna: em `Contratos.tsx`, a assinatura está sendo adicionada duas vezes no mesmo clique (mutação em `mockContracts` + novo append no `setContracts`), gerando dois registros “Empresa” com mesmo hash.
- Progresso/status incorreto: o app usa `signatures.length` para exibir `2/2`, sem considerar tipo de signatário único (`empresa`/`cliente`).
- Link inválido para cliente: `AssinarContrato.tsx` busca contrato em `localStorage` (`mockContracts` + `signing_tokens`), então o link não funciona em outro dispositivo/domínio/sessão.

2) Correção funcional (regra de negócio)
- Assinatura deve contar por tipo único:
  - 0/2 = ninguém assinou
  - 1/2 = apenas empresa ou apenas cliente (status exibido: “Aguardando Assinaturas”)
  - 2/2 = empresa + cliente (status: “Assinado”)
- Bloquear segunda assinatura do mesmo tipo (empresa não assina duas vezes; cliente não assina duas vezes).
- Botões devem seguir estado real:
  - “Assinar internamente” só aparece se `empresa` ainda não assinou.
  - “Encaminhar para cliente” só aparece se `cliente` ainda não assinou.

3) Correção estrutural (definitiva no backend/Lovable Cloud)
- Criar persistência real para contratos e assinaturas (remover dependência de localStorage para esse fluxo):
  - tabela `contracts` (dados do contrato + `signing_token` + `status` + `signed_at`)
  - tabela `contract_signatures` (uma linha por assinatura, com `signer_type`, hash, IP, geolocalização, user agent, fonte escolhida)
  - constraint única: `(contract_id, signer_type)` para impedir duplicação na origem.
- Segurança:
  - RLS para CRUD autenticado no painel interno.
  - Acesso público por token apenas via função/endpoint controlado (sem abrir tabela inteira para anon).
- Fluxo público `/assinar/:token` passa a carregar contrato pelo backend e não por storage local.

4) Ajustes de código (arquivos)
- `src/pages/Contratos.tsx`
  - refatorar `handleInternalSign` para escrita única e idempotente;
  - trocar contagem por helper de progresso por tipo único;
  - status visual baseado em tipos assinados;
  - desabilitar botão durante submit.
- `src/pages/AssinarContrato.tsx`
  - remover `findContractByToken` com localStorage;
  - buscar por token no backend;
  - registrar assinatura do cliente no backend com validação anti-duplicidade.
- `src/pages/NovaPropostaPage.tsx` e `src/pages/EditarPropostaPage.tsx`
  - ao “Criar Contrato”, inserir no backend (não mais apenas em array local).
- `src/pages/Dashboard.tsx` (ajuste complementar)
  - usar contratos reais do backend para KPIs de contratos/assinaturas.
- `src/lib/mock-data.ts`
  - manter apenas para utilitários legados temporários; retirar contratos/propostas do fluxo crítico de assinatura.

5) Plano de execução em ordem
1. Migrar banco (tabelas + constraints + RLS + função/endpoint público por token).
2. Refatorar `Contratos.tsx` (assinatura interna, progresso, status e ações).
3. Refatorar `AssinarContrato.tsx` (lookup + assinatura pelo backend).
4. Atualizar criação de contrato em Nova/Editar proposta.
5. Rodar validação end-to-end do fluxo completo.

6) Critérios de aceite (teste final)
- Após assinatura interna: aparece `1/2` e “Aguardando Assinaturas”.
- Link copiado abre normalmente em aba anônima/outro dispositivo.
- Após assinatura do cliente: passa para `2/2` e “Assinado”.
- Nova tentativa de assinar como empresa ou cliente é bloqueada.
- Não há mais dois registros iguais com mesmo hash para a mesma parte.
