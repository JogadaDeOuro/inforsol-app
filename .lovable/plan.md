

# Plano: CRM Premium com Pipeline de Etapas, Motion Design e Lazy Loading

## Resumo
Redesign completo do CRM com pipeline de etapas do cliente (novo → finalizado/arquivado), botão de ação para avançar/retroceder etapas, animações Framer Motion em toda a plataforma, lazy loading de páginas e ícones animados.

---

## 1. Novo Pipeline de Etapas do Cliente

Substituir os 6 status atuais por um pipeline mais completo e realista:

```text
novo → em_atendimento → proposta_enviada → negociacao → fechado → instalacao → finalizado
                                                          ↘ perdido
                                                                      ↘ arquivado
```

- Atualizar `statusLabels`, `statusColors` em `mock-data.ts`
- Atualizar constraint do banco (`clients.status`) via migração SQL para incluir: `instalacao`, `finalizado`, `arquivado`
- Botão de ação no card e no detalhe: **dropdown "Mover para..."** com as etapas válidas seguintes
- Visual: stepper horizontal no detalhe do cliente mostrando progresso

## 2. CRM Design Premium

- **Cards redesenhados**: glassmorphism sutil, hover com elevação animada, gradiente no avatar baseado no tipo de cliente
- **Pipeline visual no topo**: stepper horizontal com contadores, ícones por etapa, barra de progresso animada
- **Detalhe do cliente (Sheet)**: layout em seções com ícones, stepper de progresso, ações rápidas com ícones animados
- **Empty states**: ilustrações e textos convidativos
- **Skeleton loading**: cards skeleton enquanto carrega

## 3. Motion Design (Framer Motion) — Toda a Plataforma

Aplicar em todos os componentes chave:

- **Page transitions**: `motion.div` com fade-in + slide-up em cada página
- **Staggered lists**: cards aparecem em cascata (`staggerChildren`)
- **Hover effects**: `whileHover={{ scale: 1.02, y: -2 }}` nos cards
- **Tap feedback**: `whileTap={{ scale: 0.98 }}` nos botões
- **Icon animations**: ícones com `whileHover={{ rotate: 15 }}` ou `pulse` sutil
- **Badge/status transitions**: `AnimatePresence` ao mudar status
- **Pipeline counters**: `motion` number com spring animation ao atualizar
- **Sidebar**: links com hover animation suave
- **Layout animations**: `layout` prop para transições automáticas de posição

Criar um wrapper `MotionPage` reutilizável para todas as páginas.

## 4. Lazy Loading e Code Splitting

- Todas as páginas com `React.lazy()` + `Suspense` em `App.tsx`
- Skeleton/spinner durante carregamento
- Componentes pesados (Recharts) carregados sob demanda

## 5. Arquivos Afetados

| Arquivo | Mudança |
|---------|---------|
| `src/lib/mock-data.ts` | Novos status, labels, cores |
| `src/pages/CRM.tsx` | Redesign completo: pipeline, cards, motion, ações de etapa |
| `src/App.tsx` | Lazy loading de todas as páginas |
| `src/components/MotionPage.tsx` | Novo — wrapper animado reutilizável |
| `src/components/ClientStageActions.tsx` | Novo — dropdown de ações de etapa |
| `src/components/PipelineStepper.tsx` | Novo — stepper visual horizontal |
| Migração SQL | Adicionar novos valores de status ao check constraint |

## 6. Migração SQL

```sql
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_status_check 
  CHECK (status IN ('novo','em_atendimento','proposta_enviada','negociacao','fechado','perdido','instalacao','finalizado','arquivado'));
```

