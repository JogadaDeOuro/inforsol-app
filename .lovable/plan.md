

# Plano: Proposta Solar — Separação Potência/Preço, Pagamento Detalhado e Projeção com Payback

## Resumo das Mudanças

Refatorar `NovaPropostaPage.tsx` para separar potência (input digitável) do valor por kWp (slider R$1.800–R$5.000, início R$2.500), adicionar condições de pagamento detalhadas com campos dinâmicos, incluir campo de tarifa do cliente (R$/kWh), usar reajuste de 5% ao ano, e destacar o ponto de payback no gráfico.

---

## 1. Potência e Valor por kWp Separados

- **Potência (kWp)**: campo `Input` numérico digitável pelo usuário (substituir o slider atual)
- **Valor do kWp**: novo `Slider` com min=1800, max=5000, step=50, valor inicial=2500
- Cálculo do valor: `potenciaKwp × valorKwp` (ao invés de tabela por tipo de sistema)
- Manter desconto como está

## 2. Condições de Pagamento Expandidas

Adicionar opção **"40/20/20/20"** à lista existente. Quando selecionada qualquer condição com entrada:

- **"40/20/20/20"**: exibir breakdown fixo (40% na aprovação, 20% material, 20% instalação, 20% ativação) com valores calculados
- **"entrada-saldo"**: campos para valor da entrada; calcula saldo automaticamente
- **"entrada-parcelas"**: campo de entrada + campo de número de parcelas → calcula valor da parcela `(valorFinal - entrada) / numParcelas`
- **"personalizada"**: botão "Adicionar etapa" que cria linhas dinâmicas (descrição + valor ou %) para pagamentos por etapa de serviço

Todos os valores de pagamento aparecem no resumo da proposta.

## 3. Tarifa do Cliente (R$/kWh)

- Novo campo `Input` na seção de configuração: "Valor médio do kWh (R$)" com default 0.85
- Usar esse valor para calcular economia: `produção × tarifa`
- Reajuste anual passa de 10% para **5%** na projeção de 30 anos
- Adicionar nota explicativa: "considerando reajuste anual de 5% na tarifa"

## 4. Gráfico de Projeção com Payback Destacado

- Calcular o ano exato do payback: primeiro ano onde `acumulado >= valorFinal`
- Adicionar `ReferenceLine` vertical no ano do payback com label "Payback"
- Adicionar `ReferenceDot` no ponto exato com destaque visual (círculo maior, cor diferente)
- Mostrar área antes do payback em vermelho/laranja (investimento) e após em verde (lucro)
- Exibir todos os anos no gráfico (não filtrar a cada 5)

## 5. Arquivos Afetados

| Arquivo | Mudança |
|---------|---------|
| `src/pages/NovaPropostaPage.tsx` | Refatoração completa: novos campos, lógica de pagamento, gráfico com payback |

Nenhuma migração SQL necessária — todas as mudanças são no frontend.

## 6. Novos States

```text
potenciaKwp: number (input)
valorKwp: number (slider, default 2500)
tarifaKwh: number (input, default 0.85)
condicao: string
entradaValor: number
numParcelas: number
etapasPersonalizadas: { descricao: string; valor: number }[]
```

## 7. Resumo da Proposta (sidebar)

Adicionar seção "Condição de Pagamento" mostrando:
- Cada parcela/etapa com descrição e valor
- Em caso de parcelamento: entrada, nº parcelas, valor da parcela
- Em personalizada: lista de etapas com valores

