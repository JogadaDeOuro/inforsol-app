

# Inforsol Propostas & Contratos

## Sistema completo de gestão comercial para energia solar

### Visão Geral
Sistema web premium com tema verde (dark/light mode), mobile-first, com todas as telas navegáveis, dados fictícios realistas e backend Supabase desde o início.

---

### Fase 1 — Estrutura Base e Autenticação
- **Layout principal** com sidebar (desktop) e navegação mobile
- **Design system** com tons de verde, dark/light mode, visual SaaS premium
- **Login e autenticação** via Supabase (email/senha)
- **Níveis de acesso**: admin, vendedor
- **Perfil do usuário**

### Fase 2 — CRM de Clientes
- Lista de leads/clientes com busca, filtros e tags
- Cadastro completo (CPF/CNPJ, consumo, concessionária, tipo, etc.)
- Status do lead com pipeline visual (funil)
- Timeline de atendimento e histórico
- Vendedor responsável e origem do lead

### Fase 3 — Criador de Propostas
- Criação de proposta puxando dados do CRM
- Seleção do tipo de sistema (on-grid, off-grid, híbrido)
- Slider de potência (kWp) com recálculo automático de: valor, produção, economia, payback
- Condições comerciais (predefinidas e personalizáveis)
- Margem, desconto e comissão
- Escopo técnico automático adaptado por tipo de sistema
- Módulo financeiro com projeção 5-30 anos e gráficos (Recharts)
- Salvar rascunho, duplicar proposta

### Fase 4 — Visualização e Compartilhamento
- Preview da proposta em layout profissional
- Link público compartilhável (página elegante)
- Aceite digital com registro de data/hora
- Status: pendente, visualizada, aceita, recusada

### Fase 5 — Contratos
- Geração automática a partir da proposta aceita
- Template com cláusulas padrão (objeto, responsabilidades, prazos, garantias, etc.)
- Edição antes de finalizar
- Link compartilhável e aceite digital
- Contrato exemplo pronto

### Fase 6 — Gestão de Etapas/Prazos
- Pipeline de 9 etapas (proposta → homologação)
- Data prevista vs real, responsável, status visual
- Indicadores: antecipado (verde), no prazo (azul), atrasado (cinza/vermelho)
- Visão para o cliente com timeline e contador

### Fase 7 — Dashboard Gerencial
- KPIs: leads, propostas, conversão, ticket médio, faturamento
- Funil comercial visual
- Gráficos de vendas e fechamento
- Desempenho por vendedor
- Alertas de atraso e vencimentos
- Dados fictícios realistas

### Fase 8 — Configurações e Extras
- Identidade da empresa (logo, cores, dados)
- Modelos de proposta e contrato
- Cláusulas e textos padrão
- Parâmetros de cálculo (reajuste energia)
- Aba "Integrações" preparada para WhatsApp futuro
- Busca rápida, filtros avançados, exportar PDF

---

### Banco de Dados (Supabase)
Tabelas: profiles, user_roles, clients, proposals, contracts, project_stages, payment_conditions, proposal_templates, company_settings, client_timeline

### Telas (16+)
Login · Dashboard · CRM · Cadastro Cliente · Criador Proposta · Preview Proposta · Proposta Pública · Contrato · Contrato Público · Gestão Etapas · Dashboard Financeiro · Integrações · Configurações · Templates · Perfil · Painel do Cliente

