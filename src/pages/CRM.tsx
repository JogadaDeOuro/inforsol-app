import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Star, MoreHorizontal, Phone, Mail, MapPin, Pencil, Trash2, Loader2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { statusColors, statusLabels, formatNumber, type ClientStatus } from '@/lib/mock-data';

interface ClientRow {
  id: string;
  user_id: string | null;
  name: string;
  document: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  project_location: string | null;
  concessionaria: string | null;
  consumo_medio: number | null;
  client_type: string;
  status: string;
  vendedor: string | null;
  origem: string | null;
  tags: string[] | null;
  notes: string | null;
  favorite: boolean | null;
  created_at: string;
  updated_at: string;
}

const emptyForm = {
  name: '', document: '', phone: '', whatsapp: '', email: '',
  address: '', city: '', state: 'SP', project_location: '',
  concessionaria: '', consumo_medio: 0, client_type: 'residencial',
  status: 'novo', vendedor: '', origem: '', tags: '' as string, notes: '',
};

export default function CRM() {
  const { user, isAdmin } = useAuth();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Erro ao carregar clientes');
    } else {
      setClients((data as ClientRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.document ?? '').includes(search);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (c: ClientRow) => {
    setEditingId(c.id);
    setForm({
      name: c.name, document: c.document ?? '', phone: c.phone ?? '',
      whatsapp: c.whatsapp ?? '', email: c.email ?? '', address: c.address ?? '',
      city: c.city ?? '', state: c.state ?? 'SP', project_location: c.project_location ?? '',
      concessionaria: c.concessionaria ?? '', consumo_medio: c.consumo_medio ?? 0,
      client_type: c.client_type, status: c.status, vendedor: c.vendedor ?? '',
      origem: c.origem ?? '', tags: (c.tags ?? []).join(', '), notes: c.notes ?? '',
    });
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      document: form.document || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      project_location: form.project_location || null,
      concessionaria: form.concessionaria || null,
      consumo_medio: form.consumo_medio || 0,
      client_type: form.client_type,
      status: form.status,
      vendedor: form.vendedor || null,
      origem: form.origem || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      notes: form.notes || '',
    };

    if (editingId) {
      const { error } = await supabase.from('clients').update(payload).eq('id', editingId);
      if (error) toast.error(error.message); else toast.success('Cliente atualizado!');
    } else {
      const { error } = await supabase.from('clients').insert({ ...payload, user_id: user?.id ?? null });
      if (error) toast.error(error.message); else toast.success('Cliente cadastrado!');
    }
    setSaving(false);
    setFormOpen(false);
    fetchClients();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Cliente removido'); fetchClients(); }
  };

  const toggleFavorite = async (c: ClientRow) => {
    await supabase.from('clients').update({ favorite: !c.favorite }).eq('id', c.id);
    fetchClients();
  };

  const openDetail = (c: ClientRow) => { setSelectedClient(c); setDetailOpen(true); };

  const statusCounts = (Object.keys(statusLabels) as ClientStatus[]).reduce((acc, key) => {
    acc[key] = clients.filter(c => c.status === key).length;
    return acc;
  }, {} as Record<ClientStatus, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">CRM / Clientes</h1>
          <p className="text-sm text-muted-foreground">{clients.length} clientes cadastrados</p>
        </div>
        <Button className="gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, e-mail, CPF/CNPJ..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {(Object.entries(statusLabels) as [ClientStatus, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
            className={cn(
              'rounded-lg p-3 text-center transition-all border',
              statusFilter === key ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-accent'
            )}
          >
            <p className="text-lg font-bold font-display">{statusCounts[key] || 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
          </button>
        ))}
      </div>

      {/* Client Cards */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">{clients.length === 0 ? 'Nenhum cliente cadastrado. Clique em "Novo Cliente" para começar.' : 'Nenhum resultado encontrado.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(client => (
            <Card key={client.id} className="hover:shadow-md transition-shadow animate-fade-in cursor-pointer" onClick={() => openDetail(client)}>
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
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => toggleFavorite(client)} className="p-1">
                      <Star className={cn('h-4 w-4', client.favorite ? 'fill-warning text-warning' : 'text-muted-foreground/40')} />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(client)}><Pencil className="h-3.5 w-3.5 mr-2" /> Editar</DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(client.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                  {client.whatsapp && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{client.whatsapp}</div>}
                  {client.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{client.email}</div>}
                  {client.city && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{client.city}{client.state ? ` / ${client.state}` : ''}</div>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge className={cn('text-[10px]', statusColors[client.status as ClientStatus] ?? 'bg-muted text-muted-foreground')}>
                      {statusLabels[client.status as ClientStatus] ?? client.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">{client.client_type}</Badge>
                  </div>
                  {(client.consumo_medio ?? 0) > 0 && (
                    <span className="text-[10px] text-muted-foreground">{formatNumber(client.consumo_medio!)} kWh/mês</span>
                  )}
                </div>

                {(client.tags?.length ?? 0) > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {client.tags!.map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Nome *</Label><Input className="mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label className="text-xs">CPF/CNPJ</Label><Input className="mt-1" value={form.document} onChange={e => setForm({ ...form, document: e.target.value })} /></div>
              <div><Label className="text-xs">Telefone</Label><Input className="mt-1" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label className="text-xs">WhatsApp</Label><Input className="mt-1" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} /></div>
              <div><Label className="text-xs">E-mail</Label><Input type="email" className="mt-1" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label className="text-xs">Endereço</Label><Input className="mt-1" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label className="text-xs">Cidade</Label><Input className="mt-1" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
              <div><Label className="text-xs">Estado</Label><Input className="mt-1" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} maxLength={2} /></div>
            </div>

            <Separator />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dados do Projeto Solar</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Local do Projeto</Label><Input className="mt-1" value={form.project_location} onChange={e => setForm({ ...form, project_location: e.target.value })} /></div>
              <div><Label className="text-xs">Concessionária</Label><Input className="mt-1" value={form.concessionaria} onChange={e => setForm({ ...form, concessionaria: e.target.value })} placeholder="Ex: CEMIG, ENEL..." /></div>
              <div><Label className="text-xs">Consumo Médio (kWh/mês)</Label><Input type="number" className="mt-1" value={form.consumo_medio} onChange={e => setForm({ ...form, consumo_medio: parseInt(e.target.value) || 0 })} /></div>
              <div>
                <Label className="text-xs">Tipo de Cliente</Label>
                <Select value={form.client_type} onValueChange={v => setForm({ ...form, client_type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residencial">Residencial</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="rural">Rural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Comercial</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Vendedor Responsável</Label><Input className="mt-1" value={form.vendedor} onChange={e => setForm({ ...form, vendedor: e.target.value })} /></div>
              <div><Label className="text-xs">Origem do Lead</Label><Input className="mt-1" value={form.origem} onChange={e => setForm({ ...form, origem: e.target.value })} placeholder="Ex: Instagram, Google, Indicação..." /></div>
              <div><Label className="text-xs">Tags (separadas por vírgula)</Label><Input className="mt-1" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="premium, urgente" /></div>
            </div>

            <div><Label className="text-xs">Observações</Label><Textarea className="mt-1" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingId ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedClient && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                    {selectedClient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  {selectedClient.name}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Badge className={cn('text-xs', statusColors[selectedClient.status as ClientStatus])}>
                    {statusLabels[selectedClient.status as ClientStatus]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{selectedClient.client_type}</Badge>
                  {selectedClient.favorite && <Badge variant="secondary" className="text-xs gap-1"><Star className="h-3 w-3 fill-warning text-warning" /> Favorito</Badge>}
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  {selectedClient.document && <div><span className="text-muted-foreground text-xs">CPF/CNPJ</span><p>{selectedClient.document}</p></div>}
                  {selectedClient.email && <div><span className="text-muted-foreground text-xs">E-mail</span><p>{selectedClient.email}</p></div>}
                  {selectedClient.phone && <div><span className="text-muted-foreground text-xs">Telefone</span><p>{selectedClient.phone}</p></div>}
                  {selectedClient.whatsapp && <div><span className="text-muted-foreground text-xs">WhatsApp</span><p>{selectedClient.whatsapp}</p></div>}
                  {selectedClient.address && <div><span className="text-muted-foreground text-xs">Endereço</span><p>{selectedClient.address}</p></div>}
                  {selectedClient.city && <div><span className="text-muted-foreground text-xs">Cidade/UF</span><p>{selectedClient.city} / {selectedClient.state}</p></div>}
                </div>

                <Separator />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projeto Solar</p>
                <div className="space-y-3 text-sm">
                  {selectedClient.concessionaria && <div><span className="text-muted-foreground text-xs">Concessionária</span><p>{selectedClient.concessionaria}</p></div>}
                  <div><span className="text-muted-foreground text-xs">Consumo Médio</span><p>{formatNumber(selectedClient.consumo_medio ?? 0)} kWh/mês</p></div>
                  {selectedClient.project_location && <div><span className="text-muted-foreground text-xs">Local do Projeto</span><p>{selectedClient.project_location}</p></div>}
                </div>

                <Separator />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Comercial</p>
                <div className="space-y-3 text-sm">
                  {selectedClient.vendedor && <div><span className="text-muted-foreground text-xs">Vendedor</span><p>{selectedClient.vendedor}</p></div>}
                  {selectedClient.origem && <div><span className="text-muted-foreground text-xs">Origem</span><p>{selectedClient.origem}</p></div>}
                  {selectedClient.notes && <div><span className="text-muted-foreground text-xs">Observações</span><p>{selectedClient.notes}</p></div>}
                </div>

                {(selectedClient.tags?.length ?? 0) > 0 && (
                  <>
                    <Separator />
                    <div className="flex gap-1 flex-wrap">
                      {selectedClient.tags!.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                    </div>
                  </>
                )}

                <Separator />
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => { setDetailOpen(false); openEdit(selectedClient); }}>
                    <Pencil className="h-4 w-4 mr-2" /> Editar
                  </Button>
                  {isAdmin && (
                    <Button variant="destructive" onClick={() => { setDetailOpen(false); handleDelete(selectedClient.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
