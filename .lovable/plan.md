

# Etapa 1: Permissões por Página + Melhorias no CRM

Esta primeira etapa foca no controle de acesso granular e melhorias no CRM. O módulo WhatsApp será a Etapa 2.

---

## 1. Tabela de Permissões por Página (banco de dados)

Criar tabela `user_page_permissions` para armazenar quais páginas cada usuário pode acessar.

```text
user_page_permissions
├── id (uuid, PK)
├── user_id (uuid, FK → auth.users, NOT NULL)
├── page_key (text, NOT NULL)  — ex: 'dashboard', 'crm', 'propostas', etc.
├── created_at (timestamptz)
└── UNIQUE(user_id, page_key)
```

Páginas disponíveis: `dashboard`, `crm`, `propostas`, `contratos`, `etapas`, `financeiro`, `whatsapp`.

RLS: admins podem CRUD tudo; usuários podem SELECT suas próprias permissões.

Admins sempre têm acesso a tudo (não precisam de registros na tabela). Páginas do "Sistema" (Integrações, Configurações) são sempre restritas a admin.

## 2. Tabela de Tags predefinidas

Criar tabela `tags` para gerenciar tags reutilizáveis.

```text
tags
├── id (uuid, PK)
├── name (text, NOT NULL, UNIQUE)
├── color (text, default '#6366f1')
├── created_at (timestamptz)
```

RLS: authenticated podem ler; admin pode CRUD.

## 3. Configurações > Usuários — Permissões por página

No formulário de convite e edição de usuário em `Configuracoes.tsx`:
- Adicionar seção de checkboxes com as 7 páginas do "Principal" (Dashboard, CRM, Propostas, Contratos, Etapas, Financeiro, WhatsApp).
- Ao criar/editar usuário, salvar as permissões marcadas na tabela `user_page_permissions`.
- As páginas "Sistema" (Integrações, Configurações) não aparecem como opção — são sempre admin-only.

## 4. Filtro de Sidebar e Rotas por permissão

**`useAuth.tsx`**: Carregar `allowedPages` do usuário (fetch `user_page_permissions`) e expor no contexto.

**`AppSidebar.tsx`**: Filtrar `mainItems` com base em `allowedPages`. Admins veem tudo. Itens do "Sistema" ficam visíveis só para admin.

**`ProtectedRoute.tsx`**: Criar variante que recebe `pageKey` e redireciona para `/` se o usuário não tem permissão.

## 5. CRM — Vendedor como Select de usuários ativos com role "vendedor"

No formulário de cliente (`CRM.tsx`):
- Substituir o campo `vendedor` (input texto) por um `Select` que lista os perfis com role `vendedor` (fetch `user_roles` WHERE role = 'vendedor' JOIN `profiles`).
- Se não houver vendedores cadastrados, mostrar mensagem "Nenhum vendedor ativo".

## 6. CRM — Tags como Select multi (lista predefinida)

No formulário de cliente:
- Substituir o input de tags por um componente multi-select usando a tabela `tags`.
- Permitir selecionar várias tags da lista.
- Admin pode criar novas tags inline (botão "+ Nova tag").

## 7. Integração com página de Integrações

Na página `Integracoes.tsx`:
- Mudar o card "WhatsApp Business" de "Em breve" para "Disponível" com botão "Configurar" que leva para `Configurações > WhatsApp` (futura Etapa 2).

---

## Arquivos afetados

| Arquivo | Ação |
|---|---|
| **Migração SQL** | Criar tabelas `user_page_permissions` e `tags` com RLS |
| `src/hooks/useAuth.tsx` | Adicionar `allowedPages` ao contexto |
| `src/components/AppSidebar.tsx` | Filtrar itens por permissão |
| `src/components/ProtectedRoute.tsx` | Adicionar check de página |
| `src/App.tsx` | Passar `pageKey` nas rotas protegidas |
| `src/pages/Configuracoes.tsx` | Adicionar checkboxes de permissões no convite/edição |
| `src/pages/CRM.tsx` | Select de vendedores ativos + multi-select de tags |
| `src/pages/Integracoes.tsx` | Atualizar status WhatsApp |

