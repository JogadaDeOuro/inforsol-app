

## Plano de Implementação

Este plano cobre 3 funcionalidades: (1) assinaturas estilizadas com fontes, (2) notificações por e-mail nas assinaturas, (3) sistema de notificações no app (sino).

---

### 1. Assinaturas Estilizadas com Fontes

**O que muda:** Quando o usuário digita o nome (tanto na assinatura interna quanto na externa), exibir 6 opções de assinatura usando fontes cursivas/manuscritas diferentes. O usuário clica para escolher uma.

**Implementação:**
- Importar 6 Google Fonts cursivas (ex: Dancing Script, Great Vibes, Pacifico, Sacramento, Allura, Satisfy) no `index.css`
- Criar componente `SignatureStylePicker` que recebe o nome e retorna a fonte escolhida
- Renderiza 6 cards lado a lado mostrando o nome com cada fonte; o selecionado fica destacado
- Salvar a fonte escolhida junto com a assinatura (`fontFamily` no `ContractSignature`)
- Aplicar nos dois fluxos: `Contratos.tsx` (assinatura interna) e `AssinarContrato.tsx` (assinatura cliente)
- Exibir a assinatura estilizada no resumo pós-assinatura e na listagem de assinaturas do contrato

**Alteração no tipo:**
```typescript
// mock-data.ts - ContractSignature
signatureFont?: string; // nome da fonte escolhida
```

---

### 2. Notificações por E-mail

**O que muda:** Enviar e-mails transacionais quando contratos são assinados.

**Cenários de envio:**
- Empresa assina → e-mail para o cliente informando que a empresa assinou
- Cliente assina → e-mail para a empresa informando que o cliente assinou
- Ambos assinaram (2/2) → e-mail para empresa E cliente confirmando contrato completo

**Implementação:**
- Criar uma edge function `send-contract-email` que recebe destinatário, tipo de notificação e dados do contrato
- Usar a API de e-mail transacional do Lovable (scaffold_transactional_email)
- Chamar a edge function após cada assinatura em `Contratos.tsx` e `AssinarContrato.tsx`
- Templates: "Contrato assinado pela empresa", "Contrato assinado pelo cliente", "Contrato totalmente assinado"

---

### 3. Sistema de Notificações no App (Sino)

**O que muda:** O sino no header passa a funcionar com notificações reais persistidas no banco.

**Banco de dados:**
- Criar tabela `notifications` com colunas: `id`, `user_id`, `title`, `message`, `type` (contract_signed, proposal_sent), `read`, `metadata` (jsonb), `created_at`
- RLS: usuários veem apenas suas próprias notificações

**Quando gerar notificações:**
- Cliente assina contrato → notificação para todos os gestores (usuários autenticados)
- Proposta muda para status "enviada" → notificação para gestores

**Implementação frontend:**
- Criar hook `useNotifications` que busca notificações não lidas do banco com realtime
- Atualizar `AppLayout.tsx`: sino mostra badge com contagem de não lidas; ao clicar abre popover/dropdown com lista de notificações
- Cada notificação: título, mensagem, tempo relativo, botão marcar como lida
- Ao assinar externamente (`AssinarContrato.tsx`): chamar edge function que insere notificação no banco para os gestores
- Ao enviar proposta: inserir notificação no banco

**Componentes novos:**
- `src/components/NotificationBell.tsx` — sino com badge + popover de notificações
- `src/hooks/useNotifications.ts` — hook para buscar/marcar notificações

---

### Resumo de Arquivos

| Arquivo | Ação |
|---|---|
| `src/index.css` | Adicionar imports das 6 Google Fonts |
| `src/lib/mock-data.ts` | Adicionar `signatureFont` ao `ContractSignature` |
| `src/components/SignatureStylePicker.tsx` | **Novo** — grid de 6 estilos de assinatura |
| `src/components/NotificationBell.tsx` | **Novo** — sino com popover de notificações |
| `src/hooks/useNotifications.ts` | **Novo** — hook realtime para notificações |
| `src/pages/Contratos.tsx` | Integrar picker de assinatura + gerar notificações |
| `src/pages/AssinarContrato.tsx` | Integrar picker de assinatura + chamar edge function |
| `src/components/AppLayout.tsx` | Substituir sino estático por `NotificationBell` |
| `supabase/functions/send-contract-email/index.ts` | **Novo** — edge function de e-mail |
| **Migração SQL** | Criar tabela `notifications` com RLS + habilitar realtime |

