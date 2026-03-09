

# Plano: Dimensionamento automático por consumo mensal

## Mudança

Adicionar um campo "Consumo médio mensal (kWh/mês)" na seção de configuração do sistema. Ao preencher, o sistema calcula automaticamente:

- **Potência sugerida (kWp)** = `consumoMensal / 125` (fator de produção já usado no código)
- **Número aproximado de placas** = `potenciaKwp * 1000 / 650` (média entre 600–700 Wp por placa, arredondado para cima)

O campo de potência (`potenciaKwp`) é preenchido automaticamente mas continua editável (o usuário pode ajustar). Exibir um badge/info com "~X placas de 600–700 Wp" ao lado do campo de potência.

## Arquivo afetado

`src/pages/NovaPropostaPage.tsx`

## Detalhes

1. Novo state: `consumoMensal: number | ''` (default `''`)
2. Ao alterar `consumoMensal`: calcular `sugerido = consumo / 125` e setar `potenciaKwp` automaticamente
3. Ao lado do campo de potência, exibir: `Math.ceil(potencia * 1000 / 650)` placas (usando 650 Wp como média)
4. Adicionar o campo antes do campo de potência, com label "Consumo médio mensal do cliente (kWh/mês)" e ícone Zap
5. Incluir texto auxiliar: "Baseado em placas de 600–700 Wp"

