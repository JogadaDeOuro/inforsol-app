import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { mockClients, formatCurrency, formatNumber, type SystemType } from '@/lib/mock-data';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceDot,
} from 'recharts';
import { ArrowLeft, Save, Send, Eye, Zap, TrendingUp, DollarSign, Clock, Plus, Trash2 } from 'lucide-react';
import { ProposalPreview } from '@/components/ProposalPreview';
import { motion, AnimatePresence } from 'framer-motion';

// Calculation helpers
const calcProducao = (kwp: number) => Math.round(kwp * 125);

interface EtapaPersonalizada {
  descricao: string;
  valor: number;
}

interface ProjecaoItem {
  ano: number;
  label: string;
  economiaAnual: number;
  acumulado: number;
  investimento: number;
}

const projecaoAnos = (econAnual: number, valorFinal: number, tarifaKwh: number, anos = 20): ProjecaoItem[] => {
  const data: ProjecaoItem[] = [];
  let acumulado = 0;
  for (let ano = 1; ano <= anos; ano++) {
    const economiaAno = econAnual * Math.pow(1.05, ano - 1);
    acumulado += economiaAno;
    data.push({
      ano,
      label: `Ano ${ano}`,
      economiaAnual: Math.round(economiaAno),
      acumulado: Math.round(acumulado),
      investimento: valorFinal,
    });
  }
  return data;
};

export default function NovaPropostaPage() {
  const navigate = useNavigate();
  const [clientId, setClientId] = useState('');
  const [systemType, setSystemType] = useState<SystemType>('on-grid');
  const [consumoMensal, setConsumoMensal] = useState<number | ''>('');
  const [potenciaKwp, setPotenciaKwp] = useState<number | ''>('');
  const [armazenamentoKwh, setArmazenamentoKwh] = useState<number | ''>('');

  // Slider config per system type
  const sliderConfig = {
    'on-grid':  { min: 1800, max: 5000, initial: 2500 },
    'off-grid': { min: 5800, max: 10000, initial: 6200 },
    'hibrido':  { min: 3400, max: 6200, initial: 4000 },
  } as const;

  const [valorKwp, setValorKwp] = useState<number>(sliderConfig['on-grid'].initial);

  const handleSystemTypeChange = (t: SystemType) => {
    setSystemType(t);
    const cfg = sliderConfig[t];
    setValorKwp(cfg.initial);
    if (t !== 'off-grid') setArmazenamentoKwh('');
  };
  const [desconto, setDesconto] = useState(0);
  const [condicao, setCondicao] = useState('');
  const [tarifaKwh, setTarifaKwh] = useState(0.85);
  const [entradaValor, setEntradaValor] = useState(0);
  const [numParcelas, setNumParcelas] = useState(12);
  const [etapasPersonalizadas, setEtapasPersonalizadas] = useState<EtapaPersonalizada[]>([
    { descricao: '', valor: 0 },
  ]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleConsumoChange = (val: string) => {
    const consumo = val ? +val : '';
    setConsumoMensal(consumo);
    if (typeof consumo === 'number' && consumo > 0) {
      // Calcula placas arredondando para cima ao número par mais próximo
      const placasMin = Math.ceil((consumo / 125) * 1000 / 700);
      const placasMax = Math.ceil((consumo / 125) * 1000 / 600);
      const placasParMin = placasMin % 2 === 0 ? placasMin : placasMin + 1;
      const placasParMax = placasMax % 2 === 0 ? placasMax : placasMax + 1;
      // Usa a média de placas (par) para sugerir potência
      const placasSugeridas = placasParMin;
      const potMin = +((placasSugeridas * 0.6).toFixed(2));
      const potMax = +((placasSugeridas * 0.7).toFixed(2));
      setPotenciaKwp(+((potMin + potMax) / 2).toFixed(2));
    }
  };

  const potencia = typeof potenciaKwp === 'number' ? potenciaKwp : 0;
  // Sempre número par de placas, arredondado para cima
  const numPlacasRaw = potencia > 0 ? Math.ceil((potencia * 1000) / 650) : 0;
  const numPlacas = numPlacasRaw % 2 === 0 ? numPlacasRaw : numPlacasRaw + 1;
  const potenciaMin = numPlacas > 0 ? +((numPlacas * 0.6).toFixed(2)) : 0;
  const potenciaMax = numPlacas > 0 ? +((numPlacas * 0.7).toFixed(2)) : 0;
  const client = mockClients.find(c => c.id === clientId);
  const producao = calcProducao(potencia);
  const valorBruto = Math.round(potencia * valorKwp);
  const valorFinal = Math.round(valorBruto * (1 - desconto / 100));
  const economiaMensal = Math.round(producao * tarifaKwh);
  const economiaAnual = economiaMensal * 12;
  const paybackExato = economiaAnual > 0 ? +(valorFinal / economiaAnual).toFixed(1) : 0;

  const proj = projecaoAnos(economiaAnual, valorFinal, tarifaKwh);
  const paybackAno = proj.find(p => p.acumulado >= valorFinal)?.ano || null;

  // Payment breakdown calculations
  const saldoAposEntrada = Math.max(0, valorFinal - entradaValor);
  const valorParcela = numParcelas > 0 ? Math.round(saldoAposEntrada / numParcelas) : 0;

  const totalEtapas = etapasPersonalizadas.reduce((s, e) => s + (e.valor || 0), 0);
  const restantePersonalizada = valorFinal - totalEtapas;

  const addEtapa = () => setEtapasPersonalizadas(prev => [...prev, { descricao: '', valor: 0 }]);
  const removeEtapa = (i: number) => setEtapasPersonalizadas(prev => prev.filter((_, idx) => idx !== i));
  const updateEtapa = (i: number, field: keyof EtapaPersonalizada, value: string | number) =>
    setEtapasPersonalizadas(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/propostas')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-display">Nova Proposta</h1>
          <p className="text-sm text-muted-foreground">Configure o sistema e gere a proposta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Config */}
        <div className="lg:col-span-2 space-y-4">
          {/* Client */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Cliente</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {mockClients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} — {c.city}/{c.state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {client && (
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Consumo: {formatNumber(client.consumoMedio)} kWh/mês</span>
                  <span>Concessionária: {client.concessionaria}</span>
                  <span>Tipo: {client.clientType}</span>
                  <span>Local: {client.projectLocation}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Config */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Sistema Fotovoltaico</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-xs">Tipo de Sistema</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(['on-grid', 'off-grid', 'hibrido'] as const).map(t => (
                    <motion.button
                      key={t}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSystemTypeChange(t)}
                      className={`rounded-lg border p-3 text-center transition-all ${
                        systemType === t ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent'
                      }`}
                    >
                      <Zap className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-xs font-medium uppercase">{t}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  Consumo médio mensal do cliente (kWh/mês)
                </Label>
                <Input
                  type="number"
                  placeholder="Ex: 800"
                  value={consumoMensal}
                  onChange={e => handleConsumoChange(e.target.value)}
                  min={0}
                  className="mt-1"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Informe o gasto médio para dimensionar o sistema automaticamente
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Potência do Sistema (kWp)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 10"
                    value={potenciaKwp}
                    onChange={e => setPotenciaKwp(e.target.value ? +e.target.value : '')}
                    min={0.5}
                    step={0.1}
                    className="mt-1"
                  />
                  {numPlacas > 0 && (
                    <div className="flex flex-col gap-1 mt-1.5">
                      <Badge variant="secondary" className="text-[10px] font-normal w-fit">
                        {numPlacas} placas de 600–700 Wp
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        Potência do sistema: {potenciaMin} a {potenciaMax} kWp
                      </span>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">Editável — ajuste se necessário</p>
                </div>
                <div>
                  <Label className="text-xs">Valor médio do kWh (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0.85"
                    value={tarifaKwh}
                    onChange={e => setTarifaKwh(+e.target.value || 0)}
                    min={0.1}
                    step={0.01}
                    className="mt-1"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Tarifa que o cliente paga por kWh</p>
                </div>
              </div>

              {systemType === 'off-grid' && (
                <div>
                  <Label className="text-xs flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-warning" />
                    Capacidade de Armazenamento (kWh)
                  </Label>
                  <Input
                    type="number"
                    placeholder="Ex: 10"
                    value={armazenamentoKwh}
                    onChange={e => setArmazenamentoKwh(e.target.value ? +e.target.value : '')}
                    min={1}
                    step={1}
                    className="mt-1"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Quantidade de armazenamento em baterias</p>
                </div>
              )}

              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-xs">Valor por kWp</Label>
                  <span className="text-sm font-bold text-primary">{formatCurrency(valorKwp)}/kWp</span>
                </div>
                <Slider
                  value={[valorKwp]}
                  onValueChange={([v]) => setValorKwp(v)}
                  min={sliderConfig[systemType].min}
                  max={sliderConfig[systemType].max}
                  step={50}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>{formatCurrency(sliderConfig[systemType].min)}</span>
                  <span>{formatCurrency(sliderConfig[systemType].max)}</span>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs">Desconto (%)</Label>
                <Input type="number" value={desconto} onChange={e => setDesconto(+e.target.value)} min={0} max={30} className="mt-1" />
              </div>

              <div>
                <Label className="text-xs">Condição de Pagamento</Label>
                <Select value={condicao} onValueChange={setCondicao}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avista">À vista antecipado</SelectItem>
                    <SelectItem value="40-20-20-20">40% / 20% / 20% / 20%</SelectItem>
                    <SelectItem value="40-40-20">40% + 40% + 20%</SelectItem>
                    <SelectItem value="entrada-saldo">Entrada + saldo na entrega</SelectItem>
                    <SelectItem value="entrada-parcelas">Entrada + parcelamento</SelectItem>
                    <SelectItem value="personalizada">Condição personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic payment fields */}
              <AnimatePresence mode="wait">
                {condicao === '40-20-20-20' && valorFinal > 0 && (
                  <motion.div
                    key="40-20-20-20"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <p className="text-xs font-medium text-foreground mb-2">Distribuição do pagamento:</p>
                    {[
                      { label: 'Aprovação da proposta', pct: 40 },
                      { label: 'Chegada do material', pct: 20 },
                      { label: 'Instalação', pct: 20 },
                      { label: 'Ativação do sistema', pct: 20 },
                    ].map(({ label, pct }) => (
                      <div key={label} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{pct}% — {label}</span>
                        <span className="font-medium">{formatCurrency(valorFinal * pct / 100)}</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {condicao === '40-40-20' && valorFinal > 0 && (
                  <motion.div
                    key="40-40-20"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <p className="text-xs font-medium text-foreground mb-2">Distribuição do pagamento:</p>
                    {[
                      { label: 'Na aprovação', pct: 40 },
                      { label: 'Na instalação', pct: 40 },
                      { label: 'Na ativação', pct: 20 },
                    ].map(({ label, pct }) => (
                      <div key={label} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{pct}% — {label}</span>
                        <span className="font-medium">{formatCurrency(valorFinal * pct / 100)}</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {condicao === 'entrada-saldo' && (
                  <motion.div
                    key="entrada-saldo"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <div>
                      <Label className="text-xs">Valor da Entrada (R$)</Label>
                      <Input
                        type="number"
                        value={entradaValor || ''}
                        onChange={e => setEntradaValor(+e.target.value || 0)}
                        className="mt-1"
                        placeholder="Ex: 10000"
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Saldo na entrega</span>
                      <span className="font-bold text-primary">{formatCurrency(saldoAposEntrada)}</span>
                    </div>
                  </motion.div>
                )}

                {condicao === 'entrada-parcelas' && (
                  <motion.div
                    key="entrada-parcelas"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Valor da Entrada (R$)</Label>
                        <Input
                          type="number"
                          value={entradaValor || ''}
                          onChange={e => setEntradaValor(+e.target.value || 0)}
                          className="mt-1"
                          placeholder="Ex: 10000"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Nº de Parcelas</Label>
                        <Input
                          type="number"
                          value={numParcelas}
                          onChange={e => setNumParcelas(+e.target.value || 1)}
                          min={1}
                          max={120}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entrada</span>
                        <span className="font-medium">{formatCurrency(entradaValor)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Restante</span>
                        <span>{formatCurrency(saldoAposEntrada)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-primary">
                        <span>{numParcelas}x de</span>
                        <span>{formatCurrency(valorParcela)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {condicao === 'personalizada' && (
                  <motion.div
                    key="personalizada"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <p className="text-xs font-medium text-foreground">Adicione as etapas de pagamento:</p>
                    {etapasPersonalizadas.map((etapa, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-2 items-end"
                      >
                        <div className="flex-1">
                          <Label className="text-[10px]">Descrição</Label>
                          <Input
                            value={etapa.descricao}
                            onChange={e => updateEtapa(i, 'descricao', e.target.value)}
                            placeholder="Ex: Na aprovação, Material, Instalação..."
                            className="mt-0.5 text-xs"
                          />
                        </div>
                        <div className="w-32">
                          <Label className="text-[10px]">Valor (R$)</Label>
                          <Input
                            type="number"
                            value={etapa.valor || ''}
                            onChange={e => updateEtapa(i, 'valor', +e.target.value || 0)}
                            className="mt-0.5 text-xs"
                          />
                        </div>
                        {etapasPersonalizadas.length > 1 && (
                          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeEtapa(i)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full gap-1 text-xs" onClick={addEtapa}>
                      <Plus className="h-3.5 w-3.5" /> Adicionar etapa
                    </Button>
                    <Separator />
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total das etapas</span>
                        <span className="font-medium">{formatCurrency(totalEtapas)}</span>
                      </div>
                      <div className={`flex justify-between font-bold ${restantePersonalizada === 0 ? 'text-success' : 'text-destructive'}`}>
                        <span>Restante</span>
                        <span>{formatCurrency(restantePersonalizada)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Financial Projection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Projeção Financeira (20 anos)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={proj}>
                    <defs>
                      <linearGradient id="colorAcumPre" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAcumPost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="ano"
                      fontSize={10}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={v => `${v}`}
                    />
                    <YAxis
                      fontSize={10}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(v: number, name: string) => [
                        formatCurrency(v),
                        name === 'acumulado' ? 'Economia Acumulada' : 'Investimento',
                      ]}
                      labelFormatter={v => `Ano ${v}`}
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="acumulado"
                      stroke="hsl(var(--chart-2))"
                      fill="url(#colorAcumPost)"
                      strokeWidth={2}
                      name="acumulado"
                    />
                    {valorFinal > 0 && (
                      <ReferenceLine
                        y={valorFinal}
                        stroke="hsl(var(--destructive))"
                        strokeDasharray="6 4"
                        strokeWidth={1.5}
                        label={{
                          value: `Investimento: ${formatCurrency(valorFinal)}`,
                          position: 'right',
                          fill: 'hsl(var(--destructive))',
                          fontSize: 10,
                        }}
                      />
                    )}
                    {paybackAno && (
                      <>
                        <ReferenceLine
                          x={paybackAno}
                          stroke="hsl(var(--primary))"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                          label={{
                            value: `⚡ Payback: Ano ${paybackAno}`,
                            position: 'top',
                            fill: 'hsl(var(--primary))',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        />
                        <ReferenceDot
                          x={paybackAno}
                          y={proj.find(p => p.ano === paybackAno)?.acumulado || 0}
                          r={8}
                          fill="hsl(var(--primary))"
                          stroke="hsl(var(--background))"
                          strokeWidth={3}
                        />
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">
                Economia total em 20 anos: <strong className="text-foreground">{formatCurrency(proj[proj.length - 1]?.acumulado || 0)}</strong>
                {' '}(considerando reajuste anual de 5% na tarifa de energia)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          <Card className="border-primary/30 bg-primary/5 sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Resumo da Proposta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Sistema</span>
                  <Badge variant="outline">{systemType.toUpperCase()}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Potência</span>
                  <span className="text-sm font-medium">{potencia} kWp</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Valor/kWp</span>
                  <span className="text-sm font-medium">{formatCurrency(valorKwp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Tarifa kWh</span>
                  <span className="text-sm font-medium">{formatCurrency(tarifaKwh)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Produção Estimada</span>
                  <span className="text-sm font-medium">{formatNumber(producao)} kWh/mês</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Valor do Sistema</span>
                  <span className="text-sm">{formatCurrency(valorBruto)}</span>
                </div>
                {desconto > 0 && (
                  <div className="flex justify-between text-success">
                    <span className="text-xs">Desconto ({desconto}%)</span>
                    <span className="text-sm">-{formatCurrency(valorBruto - valorFinal)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Valor Final</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(valorFinal)}</span>
                </div>

                {/* Payment condition summary */}
                {condicao && condicao !== 'avista' && (
                  <>
                    <Separator />
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-foreground">Condição de Pagamento</p>

                      {condicao === '40-20-20-20' && (
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between"><span>40% — Aprovação</span><span>{formatCurrency(valorFinal * 0.4)}</span></div>
                          <div className="flex justify-between"><span>20% — Material</span><span>{formatCurrency(valorFinal * 0.2)}</span></div>
                          <div className="flex justify-between"><span>20% — Instalação</span><span>{formatCurrency(valorFinal * 0.2)}</span></div>
                          <div className="flex justify-between"><span>20% — Ativação</span><span>{formatCurrency(valorFinal * 0.2)}</span></div>
                        </div>
                      )}

                      {condicao === '40-40-20' && (
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between"><span>40% — Aprovação</span><span>{formatCurrency(valorFinal * 0.4)}</span></div>
                          <div className="flex justify-between"><span>40% — Instalação</span><span>{formatCurrency(valorFinal * 0.4)}</span></div>
                          <div className="flex justify-between"><span>20% — Ativação</span><span>{formatCurrency(valorFinal * 0.2)}</span></div>
                        </div>
                      )}

                      {condicao === 'entrada-saldo' && (
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between"><span>Entrada</span><span>{formatCurrency(entradaValor)}</span></div>
                          <div className="flex justify-between"><span>Saldo na entrega</span><span>{formatCurrency(saldoAposEntrada)}</span></div>
                        </div>
                      )}

                      {condicao === 'entrada-parcelas' && (
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between"><span>Entrada</span><span>{formatCurrency(entradaValor)}</span></div>
                          <div className="flex justify-between font-medium text-foreground">
                            <span>{numParcelas}x de</span><span>{formatCurrency(valorParcela)}</span>
                          </div>
                        </div>
                      )}

                      {condicao === 'personalizada' && (
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {etapasPersonalizadas.filter(e => e.descricao).map((e, i) => (
                            <div key={i} className="flex justify-between">
                              <span>{e.descricao}</span>
                              <span>{formatCurrency(e.valor)}</span>
                            </div>
                          ))}
                          {restantePersonalizada !== 0 && (
                            <div className="flex justify-between text-destructive font-medium">
                              <span>Restante</span><span>{formatCurrency(restantePersonalizada)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-success/10 p-3 text-center">
                    <DollarSign className="h-4 w-4 mx-auto text-success mb-1" />
                    <p className="text-xs text-muted-foreground">Economia/mês</p>
                    <p className="text-sm font-bold">{formatCurrency(economiaMensal)}</p>
                  </div>
                  <div className="rounded-lg bg-info/10 p-3 text-center">
                    <Clock className="h-4 w-4 mx-auto text-info mb-1" />
                    <p className="text-xs text-muted-foreground">Payback</p>
                    <p className="text-sm font-bold">{paybackExato > 0 ? `${paybackExato} anos` : '—'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full gap-2">
                  <Save className="h-4 w-4" /> Salvar Rascunho
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={() => setPreviewOpen(true)}>
                  <Eye className="h-4 w-4" /> Visualizar
                </Button>
                <Button variant="secondary" className="w-full gap-2">
                  <Send className="h-4 w-4" /> Enviar ao Cliente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProposalPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        clientName={client?.name || ''}
        clientCity={client?.city}
        clientState={client?.state}
        systemType={systemType}
        potencia={potencia}
        numPlacas={numPlacas}
        potenciaMin={potenciaMin}
        potenciaMax={potenciaMax}
        producao={producao}
        valorBruto={valorBruto}
        valorFinal={valorFinal}
        desconto={desconto}
        tarifaKwh={tarifaKwh}
        economiaMensal={economiaMensal}
        economiaAnual={economiaAnual}
        paybackExato={paybackExato}
        paybackAno={paybackAno}
        economiaTotal30={proj[proj.length - 1]?.acumulado || 0}
        payment={{
          condicao,
          entradaValor,
          numParcelas,
          valorParcela,
          saldoAposEntrada,
          etapasPersonalizadas,
        }}
      />
    </div>
  );
}
