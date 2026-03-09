import { 
  Users, FileText, FileSignature, TrendingUp, DollarSign, BarChart3, 
  Target, AlertTriangle, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { dashboardStats, formatCurrency, formatNumber } from '@/lib/mock-data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';

const COLORS = ['hsl(152,55%,33%)', 'hsl(172,55%,40%)', 'hsl(38,92%,50%)', 'hsl(210,80%,52%)', 'hsl(280,55%,50%)'];

export default function Dashboard() {
  const funnelData = dashboardStats.funil;
  const salesData = dashboardStats.vendasMensais;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do desempenho comercial</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Leads"
          value={formatNumber(dashboardStats.totalLeads)}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 12, label: 'vs mês anterior' }}
        />
        <StatCard
          title="Propostas Aceitas"
          value={`${dashboardStats.proposalsAceitas}`}
          subtitle={`de ${dashboardStats.proposalsEnviadas} enviadas`}
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: 8, label: 'vs mês anterior' }}
        />
        <StatCard
          title="Taxa de Conversão"
          value={`${dashboardStats.taxaConversao}%`}
          icon={<Target className="h-5 w-5" />}
          trend={{ value: 3.2, label: 'vs mês anterior' }}
        />
        <StatCard
          title="Faturamento Fechado"
          value={formatCurrency(dashboardStats.faturamentoFechado)}
          subtitle={`Previsto: ${formatCurrency(dashboardStats.faturamentoPrevisto)}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: 15, label: 'vs mês anterior' }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Vendas Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152,55%,33%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(152,55%,33%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,89%)" />
                  <XAxis dataKey="mes" stroke="hsl(150,10%,45%)" fontSize={12} />
                  <YAxis stroke="hsl(150,10%,45%)" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="valor" stroke="hsl(152,55%,33%)" fill="url(#colorValor)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Funnel */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Funil Comercial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnelData.map((item, i) => {
                const width = (item.quantidade / funnelData[0].quantidade) * 100;
                return (
                  <div key={item.etapa} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{item.etapa}</span>
                      <span className="font-medium">{item.quantidade}</span>
                    </div>
                    <div className="h-6 rounded-md overflow-hidden bg-muted">
                      <div
                        className="h-full rounded-md transition-all duration-500"
                        style={{
                          width: `${width}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                          opacity: 1 - (i * 0.15),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendedores & Projetos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Vendedores */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Desempenho dos Vendedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.vendedores.map((v, i) => (
                <div key={v.nome} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {i + 1}º
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{v.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.fechamentos} fechamentos · {formatCurrency(v.faturamento)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-success flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      {((v.fechamentos / v.leads) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projetos por Etapa */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Projetos por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(dashboardStats.projetosPorEtapa).map(([name, value]) => ({ name, value }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,89%)" />
                  <XAxis dataKey="name" stroke="hsl(150,10%,45%)" fontSize={10} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="hsl(150,10%,45%)" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(152,55%,33%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="border-warning/30 bg-warning/5 animate-fade-in">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Atenção: 3 projetos com atraso</p>
              <p className="text-xs text-muted-foreground mt-1">
                Fazenda Boa Vista (Liberação Técnica - 12 dias), Residência Mendes (Vistoria - 5 dias), Supermercado Central (Material - 3 dias)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
