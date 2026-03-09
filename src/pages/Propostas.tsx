import { useState } from 'react';
import { Plus, Search, FileText, Eye, Check, X, MoreHorizontal, Send, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  mockProposals, proposalStatusLabels, proposalStatusColors, formatCurrency,
} from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Propostas() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = mockProposals.filter(p =>
    p.clientName.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Propostas</h1>
          <p className="text-sm text-muted-foreground">{mockProposals.length} propostas</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/propostas/nova')}>
          <Plus className="h-4 w-4" /> Nova Proposta
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar proposta..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['rascunho', 'enviada', 'aceita', 'recusada'] as const).map(s => {
          const count = mockProposals.filter(p => p.status === s).length;
          return (
            <Card key={s} className="animate-fade-in">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold font-display">{count}</p>
                <p className="text-xs text-muted-foreground">{proposalStatusLabels[s]}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Proposals Table/List */}
      <div className="space-y-3">
        {filtered.map((p) => (
          <Card key={p.id} className="hover:shadow-md transition-shadow animate-fade-in cursor-pointer"
            onClick={() => navigate(`/propostas/${p.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{p.clientName}</p>
                      <Badge className={cn('text-[10px]', proposalStatusColors[p.status])}>
                        {proposalStatusLabels[p.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {p.id} · {p.systemType.toUpperCase()} · {p.potenciaKwp} kWp · {p.createdAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(p.valorSistema)}</p>
                    <p className="text-xs text-muted-foreground">Economia: {formatCurrency(p.economiaMensal)}/mês</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => e.stopPropagation()}>
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => e.stopPropagation()}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
