import { useState } from 'react';
import { Search, FileSignature, MoreHorizontal, Send, Download, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockContracts, formatCurrency } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const contractStatusLabels: Record<string, string> = {
  rascunho: 'Rascunho', enviado: 'Enviado', assinado: 'Assinado', cancelado: 'Cancelado',
};
const contractStatusColors: Record<string, string> = {
  rascunho: 'bg-muted text-muted-foreground',
  enviado: 'bg-info text-info-foreground',
  assinado: 'bg-success text-success-foreground',
  cancelado: 'bg-destructive text-destructive-foreground',
};

export default function Contratos() {
  const [search, setSearch] = useState('');

  const filtered = mockContracts.filter(c =>
    c.clientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Contratos</h1>
          <p className="text-sm text-muted-foreground">{mockContracts.length} contratos</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar contrato..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-3">
        {filtered.map(c => (
          <Card key={c.id} className="hover:shadow-md transition-shadow animate-fade-in">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileSignature className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{c.clientName}</p>
                      <Badge className={cn('text-[10px]', contractStatusColors[c.status])}>
                        {contractStatusLabels[c.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {c.id} · {c.systemType.toUpperCase()} · {c.potenciaKwp} kWp · {c.condicaoPagamento}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(c.valor)}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.signedAt ? `Assinado em ${c.signedAt}` : 'Pendente assinatura'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>

              {/* Contract clauses preview */}
              <div className="mt-3 pt-3 border-t">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  <div className="rounded bg-muted p-2">
                    <span className="text-muted-foreground">Objeto</span>
                    <p className="font-medium mt-0.5">Instalação de sistema {c.systemType}</p>
                  </div>
                  <div className="rounded bg-muted p-2">
                    <span className="text-muted-foreground">Prazo</span>
                    <p className="font-medium mt-0.5">30 dias úteis</p>
                  </div>
                  <div className="rounded bg-muted p-2">
                    <span className="text-muted-foreground">Garantia</span>
                    <p className="font-medium mt-0.5">25 anos (módulos)</p>
                  </div>
                  <div className="rounded bg-muted p-2">
                    <span className="text-muted-foreground">Pagamento</span>
                    <p className="font-medium mt-0.5">{c.condicaoPagamento}</p>
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
