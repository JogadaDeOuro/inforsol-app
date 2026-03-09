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
  BarChart, Bar,
} from 'recharts';
import { ArrowLeft, Save, Send, Eye, Zap, TrendingUp, DollarSign, Clock } from 'lucide-react';

// Calculation helpers
const calcProducao = (kwp: number) => Math.round(kwp * 125);
const calcValor = (kwp: number, type: SystemType) => {
  const base = type === 'on-grid' ? 4800 : type === 'off-grid' ? 6200 : 5500;
  return Math.round(kwp * base);
};
const calcEconomia = (prod: number) => Math.round(prod * 0.85);
const calcPayback = (valor: number, econAnual: number) => +(valor / econAnual).toFixed(1);

const projecao30anos = (econAnual: number) => {
  const data = [];
  let acumulado = 0;
  for (let ano = 1; ano <= 30; ano++) {
    const economiaAno = econAnual * Math.pow(1.10, ano - 1);
    acumulado += economiaAno;
    data.push({
      ano: `Ano ${ano}`,
      economiaAnual: Math.round(economiaAno),
      acumulado: Math.round(acumulado),
    });
  }
  return data;
};

export default function NovaPropostaPage() {
  const navigate = useNavigate();
  const [clientId, setClientId] = useState('');
  const [systemType, setSystemType] = useState<SystemType>('on-grid');
  const [potenciaKwp, setPotenciaKwp] = useState(10);
  const [desconto, setDesconto] = useState(0);
  const [condicao, setCondicao] = useState('');

  const client = mockClients.find(c => c.id === clientId);
  const producao = calcProducao(potenciaKwp);
  const valorBruto = calcValor(potenciaKwp, systemType);
  const valorFinal = Math.round(valorBruto * (1 - desconto / 100));
  const economiaMensal = calcEconomia(producao);
  const economiaAnual = economiaMensal * 12;
  const payback = calcPayback(valorFinal, economiaAnual);
  const proj = projecao30anos(economiaAnual);

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
                    <button
                      key={t}
                      onClick={() => setSystemType(t)}
                      className={`rounded-lg border p-3 text-center transition-all ${
                        systemType === t ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent'
                      }`}
                    >
                      <Zap className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-xs font-medium uppercase">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-xs">Potência do Sistema</Label>
                  <span className="text-sm font-bold text-primary">{potenciaKwp} kWp</span>
                </div>
                <Slider
                  value={[potenciaKwp]}
                  onValueChange={([v]) => setPotenciaKwp(v)}
                  min={1}
                  max={200}
                  step={0.6}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>1 kWp</span><span>200 kWp</span>
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
                    <SelectItem value="40-40-20">40% + 40% + 20%</SelectItem>
                    <SelectItem value="entrada-saldo">Entrada + saldo na entrega</SelectItem>
                    <SelectItem value="entrada-parcelas">Entrada + parcelamento</SelectItem>
                    <SelectItem value="personalizada">Condição personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Financial Projection */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Projeção Financeira (30 anos)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={proj.filter((_, i) => i % 5 === 0 || i === proj.length - 1)}>
                    <defs>
                      <linearGradient id="colorAcum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(152,55%,33%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(152,55%,33%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,89%)" />
                    <XAxis dataKey="ano" fontSize={10} stroke="hsl(150,10%,45%)" />
                    <YAxis fontSize={10} stroke="hsl(150,10%,45%)" tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="acumulado" stroke="hsl(152,55%,33%)" fill="url(#colorAcum)" strokeWidth={2} name="Economia Acumulada" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">
                Economia total em 30 anos: <strong className="text-foreground">{formatCurrency(proj[proj.length - 1].acumulado)}</strong>
                {' '}(considerando reajuste anual de 10%)
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
                  <span className="text-sm font-medium">{potenciaKwp} kWp</span>
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
                    <p className="text-sm font-bold">{payback} anos</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full gap-2">
                  <Save className="h-4 w-4" /> Salvar Rascunho
                </Button>
                <Button variant="outline" className="w-full gap-2">
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
    </div>
  );
}
