

# Plano: Etapas com Clientes Reais + Filtro de Datas no Financeiro

## 1. Módulo de Etapas — Refatoração Completa

### Problema atual
A página usa `mockProjectStages` hardcoded. Precisa buscar clientes reais do banco com status `fechado`, `instalacao` ou `finalizado` (contrato ativo / serviço em aberto ou não iniciado).

### Mudanças

**Migração SQL — tabela `project_stages`:**
```sql
CREATE TABLE public.project_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  tracking_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.stage_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_stage_id UUID REFERENCES public.project_stages(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  data_prevista DATE,
  data_real DATE,
  responsavel TEXT DEFAULT '',
  observacoes TEXT DEFAULT '',
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','em_andamento','concluido','atrasado')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```
- RLS: authenticated pode CRUD, public pode SELECT `project_stages` + `stage_items` por `tracking_token` (para link do cliente)
- 9 etapas padrão são inseridas automaticamente ao criar um project_stage

**Nova página `Etapas.tsx`:**
- Header com Select/Combobox para escolher cliente (filtra `clients` com status IN `fechado`, `instalacao`, `finalizado`)
- Ao selecionar cliente: carrega ou cria `project_stages` + `stage_items`
- Cada etapa: botões para marcar como concluída/em andamento/atrasada, editar datas e responsável
- **Link público**: gera URL tipo `/acompanhamento/{tracking_token}` — botão "Copiar link" visível
- Motion design: staggered cards, animações de status change

**Nova rota `/acompanhamento/:token`:**
- Página pública (sem auth) que busca `project_stages` pelo `tracking_token`
- Exibe timeline read-only com progresso, datas e status — visual clean para o cliente
- Nova página `src/pages/AcompanhamentoPublico.tsx`

## 2. Dashboard Financeiro — Filtro de Datas

**Mudanças em `Financeiro.tsx`:**
- Adicionar estado `periodo` com opções: `24h`, `7d`, `30d`, `2m`, `3m`, `ultimo_ano`, `este_ano`, `todo`, `personalizado`
- Componente de filtro no header: `Select` com as opções + `DatePicker` (Popover+Calendar) quando "personalizado"
- Por ora, como os dados são mock, o filtro filtra `vendasMensais` e ajusta os KPIs visualmente (preparado para dados reais futuros)
- Motion design no filtro e transições de dados

## 3. Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| Migração SQL | Criar `project_stages` e `stage_items` com RLS |
| `src/pages/Etapas.tsx` | Refatoração completa com banco real |
| `src/pages/AcompanhamentoPublico.tsx` | Nova — página pública do cliente |
| `src/pages/Financeiro.tsx` | Adicionar filtro de datas |
| `src/App.tsx` | Adicionar rota `/acompanhamento/:token` (pública) |

