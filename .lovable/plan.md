

# Plano: Edição de propostas, PDF, personalização e gestão de usuários

## 1. Clicar em proposta abre para edição

**Problema atual:** A rota `/propostas/:id` renderiza o componente `Propostas` (listagem), não abre para edição.

**Solução:**
- Criar `src/pages/EditarPropostaPage.tsx` que reutiliza a mesma estrutura do `NovaPropostaPage`, mas recebe o `id` via `useParams` e preenche os campos com os dados da proposta mock correspondente.
- Alterar a rota `/propostas/:id` no `App.tsx` para renderizar `EditarPropostaPage` ao invés de `Propostas`.

## 2. Botão "Enviar ao cliente" gera PDF

**Solução:**
- Usar a API nativa do browser `window.print()` com um componente de preview estilizado para impressão/PDF, sem dependências extras.
- Criar `src/components/ProposalPDF.tsx` -- um componente renderizado em uma janela/iframe oculta com layout otimizado para PDF (A4, margens, tipografia, informações completas da proposta, textos de apresentação, garantias, etc.).
- No botão "Enviar ao cliente" do `NovaPropostaPage` e `EditarPropostaPage`, abrir esse componente e disparar `window.print()` para salvar como PDF.
- Os textos configuráveis (apresentação, observações, itens inclusos) virão dos valores definidos na aba de personalização.

## 3. Aba Visual em Configurações: personalização da proposta

**Solução:**
- Remover o card "Identidade Visual" (cores) da aba "Visual".
- Substituir por "Personalização da Proposta" com campos editáveis:
  - Logo da proposta (upload placeholder)
  - Título/cabeçalho da proposta
  - Texto de apresentação da empresa
  - Observações técnicas padrão
  - Itens inclusos no sistema
  - Texto de garantias
  - Rodapé/assinatura
- Esses campos serão usados pelo componente de PDF.
- Mover os textos que hoje estão na aba "Textos" para dentro da aba "Visual" (renomeada conceitualmente para "Proposta") ou unificar.

## 4. Aba Usuários: excluir, editar, aceitar solicitações

**Solução no `Configuracoes.tsx`:**
- Adicionar botão "Excluir" (com confirmação AlertDialog) ao lado de cada usuário (exceto o próprio admin logado). Chama delete no `user_roles` e depois no `profiles` (ou marca como inativo).
- Adicionar botão "Editar" que abre dialog para alterar nome e papel.
- Para "aceitar novas solicitações": os usuários que se cadastraram via signUp mas ainda não têm role atribuída aparecem como "Pendente" com botão "Aceitar" (que atribui role) ou "Recusar" (que remove).
- O admin `stfxfp@gmail.com` é protegido contra exclusão.

## Arquivos afetados

| Arquivo | Ação |
|---|---|
| `src/pages/EditarPropostaPage.tsx` | Criar (editor de proposta existente) |
| `src/components/ProposalPDF.tsx` | Criar (layout PDF para impressão) |
| `src/App.tsx` | Alterar rota `:id` para EditarPropostaPage |
| `src/pages/Configuracoes.tsx` | Refatorar aba Visual + expandir aba Usuários |
| `src/pages/NovaPropostaPage.tsx` | Adicionar ação de gerar PDF no botão Enviar |

