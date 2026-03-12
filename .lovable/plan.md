

## Plano: Melhorias no formulário de Novo Cliente (CRM)

### Mudanças

1. **Concessionária como Select** (linha 510) — trocar Input por Select com as 10 opções listadas + opção "Nenhuma"

2. **Estado como Select** (linha 503) — trocar Input por Select com todos os 27 estados brasileiros, valor padrão vazio ("Nenhum")

3. **Cidade como Select dinâmico** (linha 502) — iniciar bloqueado; ao selecionar estado, carregar lista de cidades daquele estado via API pública (ex: IBGE `servicodados.ibge.gov.br/api/v1/localidades/estados/{UF}/municipios`); ao mudar estado, limpar cidade

4. **Campo de CEP com auto-preenchimento** — adicionar campo CEP acima de Endereço; ao digitar CEP completo (8 dígitos), consultar API ViaCEP (`viacep.com.br/ws/{cep}/json/`) e preencher automaticamente estado, cidade e endereço

5. **Consumo Médio como texto** (linha 511) — trocar `type="number"` por `type="text"` com `inputMode="numeric"`, removendo spinners e o zero inicial

### Detalhes técnicos

- **Lista de estados**: array estático com os 27 UFs + nomes (ex: `{uf: 'AC', nome: 'Acre'}, ...`)
- **Cidades do IBGE**: fetch client-side ao mudar estado; cache no state para evitar re-fetch
- **ViaCEP**: chamada `fetch` ao `onBlur` ou quando CEP tiver 8 dígitos numéricos; preenche `state`, `city`, `address` automaticamente
- **Form state**: adicionar campo `cep` ao `emptyForm` e `ClientRow` (ou apenas local no form, sem coluna no banco se não quiser persistir)
- Cidade e Estado ficam editáveis mesmo após auto-preenchimento pelo CEP

### Arquivos alterados
- `src/pages/CRM.tsx` — formulário completo

