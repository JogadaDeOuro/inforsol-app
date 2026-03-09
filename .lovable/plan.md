

# Plano: Logo, Visual, Autenticação e Gestão de Usuários

## 1. Logo e Favicon
- Copiar `Branding-Inforsol_3.png` para `src/assets/logo-inforsol.png` e `public/favicon.png`
- Atualizar `index.html`: título "Inforsol Propostas & Contratos", favicon, meta tags
- Usar a logo no sidebar (header), na tela de login e no PWA icon

## 2. Melhorias Visuais no Menu/Sidebar
- Substituir o ícone Zap pela logo real da Inforsol no header do sidebar
- Melhorar o footer do sidebar com avatar do usuário logado e nome
- Adicionar animações de transição mais suaves
- Melhorar o header global com breadcrumb e nome do usuário dinâmico

## 3. Banco de Dados — Migração SQL
Criar as seguintes tabelas e estruturas:

- **`profiles`** — id (FK auth.users), full_name, avatar_url, phone, created_at
- **`app_role` enum** — admin, vendedor
- **`user_roles`** — user_id, role (com RLS via `has_role` security definer function)
- **Trigger** `on_auth_user_created` para auto-criar perfil no signup
- RLS policies: usuários leem/editam seu próprio perfil; admins leem todos

## 4. Autenticação Real (Supabase Auth)
- **Login.tsx**: integrar `supabase.auth.signInWithPassword`
- **Signup**: adicionar aba/botão de cadastro com `supabase.auth.signUp` (sem auto-confirm)
- **Forgot Password**: link funcional com `resetPasswordForEmail` + página `/reset-password`
- **Auth context**: criar `useAuth` hook com `onAuthStateChange` + `getSession`
- **Protected routes**: redirecionar para `/login` se não autenticado
- **Logout funcional**: botão no sidebar chama `supabase.auth.signOut`
- **Header dinâmico**: exibir nome do usuário logado (do profiles)

## 5. Gestão de Usuários (Configurações)
- Tab "Usuários" em Configurações: listar usuários reais do banco (profiles + roles)
- Permitir admin convidar novos usuários (signup por email)
- Exibir role de cada usuário
- Permitir admin alterar role (admin/vendedor)
- Indicar visualmente o usuário atual

## Arquivos Principais Afetados
- `index.html` — favicon e meta tags
- `src/assets/logo-inforsol.png` — logo copiada
- `src/App.tsx` — auth provider, protected routes, rota /reset-password
- `src/hooks/useAuth.tsx` — novo hook de autenticação
- `src/components/AppLayout.tsx` — dados dinâmicos do usuário
- `src/components/AppSidebar.tsx` — logo real, logout funcional, avatar
- `src/pages/Login.tsx` — auth real com signup e forgot password
- `src/pages/ResetPassword.tsx` — nova página
- `src/pages/Configuracoes.tsx` — gestão de usuários real
- Migração SQL — profiles, user_roles, RLS, triggers

