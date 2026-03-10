import { useState } from 'react';
import { Plus, Search, FileText, Send, Copy, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  mockProposals, proposalStatusLabels, proposalStatusColors, formatCurrency, type Proposal,
} from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Propostas() {
  const [search, setSearch] = useState('');
  const [proposals, setProposals] = useState<Proposal[]>([...mockProposals]);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const filtered = proposals.filter(p =>
    p.clientName.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setProposals(prev => prev.filter(p => p.id !== id));
    toast.success('Proposta excluída');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Propostas</h1>
          <p className="text-sm text-muted-foreground">{proposals.length} propostas</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/propostas/nova')}>
          <Plus className="h-4 w-4" /> Nova Proposta
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar proposta..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['rascunho', 'enviada', 'aceita', 'recusada'] as const).map(s => {
          const count = proposals.filter(p => p.status === s).length;
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
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir proposta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a proposta {p.id} de {p.clientName}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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
