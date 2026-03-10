

# Plano: Exclusão admin-only, Criação de Contratos a partir de Propostas e Assinatura Digital

## 1. Exclusão restrita ao admin master

**Onde:** `Propostas.tsx`, `Contratos.tsx`, `CRM.tsx`

- Adicionar botão de excluir (com `AlertDialog` de confirmação) em propostas e contratos, visível apenas para `isAdmin`.
- Nos clientes (`CRM.tsx`), garantir que o botão de exclusão já existente esteja restrito a admin (já está).
- Como propostas e contratos ainda usam dados mock, a exclusão será local (filtrar do array). Quando migrar para banco, as RLS policies já protegem.

## 2. Botão "Criar Contrato" na proposta (após enviar)

**Onde:** `NovaPropostaPage.tsx`, `EditarPropostaPage.tsx`

- Adicionar botão "Criar Contrato" abaixo de "Enviar ao Cliente" no card de resumo.
- Ao clicar, gera um contrato a partir dos dados da proposta (cliente, sistema, valor, pagamento) e redireciona para `/contratos`.
- Armazenar contratos criados em estado local/mock por enquanto (adicionar ao `mockContracts` ou usar estado global simples via contexto/localStorage).

## 3. Componente `ContractPDF.tsx` -- Contrato profissional em PDF

**Criar:** `src/components/ContractPDF.tsx`

Layout A4 estilizado com:
- **Cabeçalho:** Logo da empresa (Inforsol)
- **Cláusulas** geradas automaticamente com dados da proposta:
  - Objeto (instalação do sistema fotovoltaico, tipo, potência)
  - Valor e condições de pagamento
  - Prazo de execução
  - Garantias (módulos, inversor, serviço)
  - Obrigações das partes
  - Rescisão
  - Foro
- **Campo de assinatura:** Duas linhas (Contratante e Contratada) com espaço para nome, CPF/CNPJ, data
- **Rodapé:** CNPJ, telefone, email da empresa
- Usar `window.print()` para gerar PDF (mesma abordagem do `ProposalPDF`)

## 4. Página de Contratos reformulada

**Onde:** `Contratos.tsx`

- Ao clicar em um contrato, abrir um `Dialog` com preview do contrato (renderiza `ContractPDF` inline).
- Mostrar contador de assinaturas: `0/2 assinaturas` (Contratante + Contratada).
- Três ações no dialog:
  1. **Baixar sem assinaturas** -- gera PDF limpo via `window.print()`
  2. **Baixar com assinaturas** -- gera PDF com campos preenchidos (quando assinado)
  3. **Encaminhar para assinatura** -- gera link único de assinatura digital
- Botão de excluir contrato (admin-only com confirmação).

## 5. Link de assinatura digital

- Gerar um token único (`crypto.randomUUID()`) ao encaminhar para assinatura.
- Criar rota pública `/assinar/:token` no `App.tsx`.
- Criar página `src/pages/AssinarContrato.tsx`:
  - Exibe preview do contrato (read-only)
  - Campos: Nome completo, CPF/CNPJ, checkbox "Li e aceito"
  - Botão "Assinar digitalmente"
  - Ao assinar, registra timestamp, IP, nome e documento -- constitui aceite digital com validade jurídica
  - Mostra confirmação com hash de verificação
- No contrato, atualizar status de assinatura (0/2 → 1/2 → 2/2).

## Arquivos afetados

| Arquivo | Ação |
|---|---|
| `src/components/ContractPDF.tsx` | Criar |
| `src/pages/AssinarContrato.tsx` | Criar |
| `src/pages/Contratos.tsx` | Refatorar (preview, download, assinatura, delete admin) |
| `src/pages/NovaPropostaPage.tsx` | Adicionar botão "Criar Contrato" |
| `src/pages/EditarPropostaPage.tsx` | Adicionar botão "Criar Contrato" |
| `src/pages/Propostas.tsx` | Adicionar botão excluir (admin) |
| `src/App.tsx` | Adicionar rota `/assinar/:token` |
| `src/lib/mock-data.ts` | Expandir interface Contract com campos de assinatura |

