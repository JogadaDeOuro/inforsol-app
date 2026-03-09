import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { dashboardStats, formatCurrency } from '@/lib/mock-data';
import { DollarSign, TrendingUp, BarChart3, Target } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['hsl(152,55%,33%)', 'hsl(172,55%,40%)', 'hsl(38,92%,50%)', 'hsl(210,80%,52%)'];

const comparativoData = [
  { ano: 'Ano 1', semSolar: 14400, comSolar: 1200 },
  { ano: 'Ano 5', semSolar: 21150, comSolar: 1200 },
  { ano: 'Ano 10', semSolar: 34070, comSolar: 1200 },
  { ano: 'Ano 15', semSolar: 54870, comSolar: 1200 },
  { ano: 'Ano 20', semSolar: 88370, comSolar: 1200 },
  { ano: 'Ano 25', semSolar: 142340, comSolar: 1200 },
  { ano: 'Ano 30', semSolar: 229230, comSolar: 1200 },
];

const faturamentoPorTipo = [
  { name: 'Residencial', value: 680000 },
  { name: 'Comercial', value: 850000 },
  { name: 'Industrial', value: 290000 },
  { name: 'Rural', value: 385000 },
];

export default function Financeiro() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Dashboard Financeiro</h1>
        <p className="text-sm text-muted-foreground">Análise financeira e comercial</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Faturamento Fechado" value={formatCurrency(dashboardStats.faturamentoFechado)} icon={<DollarSign className="h-5 w-5" />} trend={{ value: 15, label: 'vs mês ant.' }} />
        <StatCard title="Faturamento Previsto" value={formatCurrency(dashboardStats.faturamentoPrevisto)} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="Ticket Médio" value={formatCurrency(dashboardStats.ticketMedio)} icon={<BarChart3 className="h-5 w-5" />} trend={{ value: 5, label: 'vs mês ant.' }} />
        <StatCard title="Contratos Ativos" value={`${dashboardStats.contratosAndamento}`} icon={<Target className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Comparativo: Com vs Sem Energia Solar (cliente típico)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparativoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,89%)" />
                  <XAxis dataKey="ano" fontSize={11} stroke="hsl(150,10%,45%)" />
                  <YAxis fontSize={11} stroke="hsl(150,10%,45%)" tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="semSolar" name="Sem Solar" fill="hsl(0,72%,51%)" radius={[4,4,0,0]} opacity={0.7} />
                  <Bar dataKey="comSolar" name="Com Solar" fill="hsl(152,55%,33%)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Faturamento por Tipo de Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={faturamentoPorTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {faturamentoPorTipo.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendas mensais */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Evolução de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardStats.vendasMensais}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152,55%,33%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(152,55%,33%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,89%)" />
                <XAxis dataKey="mes" fontSize={12} stroke="hsl(150,10%,45%)" />
                <YAxis fontSize={12} stroke="hsl(150,10%,45%)" tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="valor" stroke="hsl(152,55%,33%)" fill="url(#colorVendas)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
