import { useState } from 'react';
import { Search, Plus, Filter, Star, MoreHorizontal, Phone, Mail, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  mockClients, statusColors, statusLabels, formatNumber,
  type Client, type ClientStatus,
} from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function CRM() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = mockClients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">CRM / Clientes</h1>
          <p className="text-sm text-muted-foreground">{mockClients.length} clientes cadastrados</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {(Object.entries(statusLabels) as [ClientStatus, string][]).map(([key, label]) => {
          const count = mockClients.filter(c => c.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
              className={cn(
                'rounded-lg p-3 text-center transition-all border',
                statusFilter === key
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:bg-accent'
              )}
            >
              <p className="text-lg font-bold font-display">{count}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
            </button>
          );
        })}
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow animate-fade-in cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                    {client.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.document}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {client.favorite && <Star className="h-4 w-4 fill-warning text-warning" />}
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{client.whatsapp}</div>
                <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{client.email}</div>
                <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{client.city} / {client.state}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                  <Badge className={cn('text-[10px]', statusColors[client.status])}>
                    {statusLabels[client.status]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">{client.clientType}</Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">{formatNumber(client.consumoMedio)} kWh/mês</span>
              </div>

              <div className="flex gap-1 mt-2 flex-wrap">
                {client.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
