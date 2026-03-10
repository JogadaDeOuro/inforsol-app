import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Search, Users, Phone, Settings, ArrowRightLeft,
  Eye, MoreVertical, Wifi, WifiOff, Hash, User, Clock, Shield,
  Plus, Trash2, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { statusLabels, statusColors, type ClientStatus } from '@/lib/mock-data';
import { MotionPage, staggerContainer, staggerItem } from '@/components/MotionPage';
import { toast } from 'sonner';

interface WhatsAppNumber {
  id: string;
  number: string;
  label: string;
  status: 'connected' | 'disconnected';
  assignedUsers: string[];
}

interface Attendant {
  id: string;
  name: string;
  email: string;
  activeChats: number;
}

const initialNumbers: WhatsAppNumber[] = [
  { id: '1', number: '+55 11 99999-1000', label: 'Comercial 1', status: 'connected', assignedUsers: ['Ana Costa', 'Carlos Lima'] },
  { id: '2', number: '+55 11 99999-2000', label: 'Comercial 2', status: 'disconnected', assignedUsers: [] },
];

const initialAttendants: Attendant[] = [
  { id: '1', name: 'Ana Costa', email: 'ana@inforsol.com', activeChats: 5 },
  { id: '2', name: 'Carlos Lima', email: 'carlos@inforsol.com', activeChats: 3 },
  { id: '3', name: 'Lucas Rocha', email: 'lucas@inforsol.com', activeChats: 0 },
];

const mockAllConversations = [
  { id: '1', client: 'João Silva', phone: '+55 11 99999-0001', number: '+55 11 99999-1000', assignedTo: 'Ana Costa', lastMessage: 'Bom dia! Orçamento para energia solar.', time: '10:32', unread: 2, status: 'novo' as ClientStatus },
  { id: '2', client: 'Maria Santos', phone: '+55 11 99999-0002', number: '+55 11 99999-1000', assignedTo: 'Carlos Lima', lastMessage: 'Ok, vou analisar a proposta.', time: '09:15', unread: 0, status: 'proposta_enviada' as ClientStatus },
  { id: '3', client: 'Pedro Alves', phone: '+55 11 99999-0003', number: '+55 11 99999-2000', assignedTo: null, lastMessage: 'Preciso de suporte técnico.', time: 'Ontem', unread: 3, status: 'em_atendimento' as ClientStatus },
];

export default function WhatsAppAdmin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNumber, setFilterNumber] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);

  // Numbers state
  const [numbers, setNumbers] = useState<WhatsAppNumber[]>(initialNumbers);
  const [addNumberOpen, setAddNumberOpen] = useState(false);
  const [newNumber, setNewNumber] = useState({ number: '', label: '' });
  const [deleteNumberId, setDeleteNumberId] = useState<string | null>(null);

  // Attendants state
  const [attendants, setAttendants] = useState<Attendant[]>(initialAttendants);
  const [addAttendantOpen, setAddAttendantOpen] = useState(false);
  const [newAttendant, setNewAttendant] = useState({ name: '', email: '' });
  const [deleteAttendantId, setDeleteAttendantId] = useState<string | null>(null);

  const filteredConvs = mockAllConversations.filter(c => {
    const matchSearch = c.client.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    const matchNumber = filterNumber === 'all' || c.number === filterNumber;
    const matchUser = filterUser === 'all' || (filterUser === 'unassigned' ? !c.assignedTo : c.assignedTo === filterUser);
    return matchSearch && matchNumber && matchUser;
  });

  const currentConv = mockAllConversations.find(c => c.id === selectedConv);

  // Number handlers
  const handleAddNumber = () => {
    if (!newNumber.number.trim() || !newNumber.label.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    const num: WhatsAppNumber = {
      id: crypto.randomUUID(),
      number: newNumber.number.trim(),
      label: newNumber.label.trim(),
      status: 'disconnected',
      assignedUsers: [],
    };
    setNumbers(prev => [...prev, num]);
    setNewNumber({ number: '', label: '' });
    setAddNumberOpen(false);
    toast.success(`Número "${num.label}" adicionado com sucesso`);
  };

  const handleDeleteNumber = () => {
    if (!deleteNumberId) return;
    const num = numbers.find(n => n.id === deleteNumberId);
    setNumbers(prev => prev.filter(n => n.id !== deleteNumberId));
    setDeleteNumberId(null);
    toast.success(`Número "${num?.label}" removido`);
  };

  // Attendant handlers
  const handleAddAttendant = () => {
    if (!newAttendant.name.trim()) {
      toast.error('Preencha o nome do atendente');
      return;
    }
    const att: Attendant = {
      id: crypto.randomUUID(),
      name: newAttendant.name.trim(),
      email: newAttendant.email.trim(),
      activeChats: 0,
    };
    setAttendants(prev => [...prev, att]);
    setNewAttendant({ name: '', email: '' });
    setAddAttendantOpen(false);
    toast.success(`Atendente "${att.name}" adicionado`);
  };

  const handleDeleteAttendant = () => {
    if (!deleteAttendantId) return;
    const att = attendants.find(a => a.id === deleteAttendantId);
    if (att && att.activeChats > 0) {
      toast.error(`"${att.name}" possui ${att.activeChats} chamados ativos. Transfira antes de remover.`);
      setDeleteAttendantId(null);
      return;
    }
    setAttendants(prev => prev.filter(a => a.id !== deleteAttendantId));
    setDeleteAttendantId(null);
    toast.success(`Atendente "${att?.name}" removido`);
  };

  return (
    <MotionPage className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center"
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            <MessageSquare className="h-5 w-5 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold font-display">WhatsApp — Gestão</h1>
            <p className="text-sm text-muted-foreground">Gerencie números, conversas e atendentes</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="conversas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conversas" className="text-xs gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Conversas</TabsTrigger>
          <TabsTrigger value="numeros" className="text-xs gap-1.5"><Phone className="h-3.5 w-3.5" /> Números</TabsTrigger>
          <TabsTrigger value="atendentes" className="text-xs gap-1.5"><Users className="h-3.5 w-3.5" /> Atendentes</TabsTrigger>
          <TabsTrigger value="config" className="text-xs gap-1.5"><Settings className="h-3.5 w-3.5" /> Configuração API</TabsTrigger>
        </TabsList>

        {/* Conversations Tab */}
        <TabsContent value="conversas" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por cliente ou número..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Select value={filterNumber} onValueChange={setFilterNumber}>
              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Número" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os números</SelectItem>
                {numbers.map(n => <SelectItem key={n.id} value={n.number}>{n.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Atendente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="unassigned">Não atribuído</SelectItem>
                {attendants.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filteredConvs.map(conv => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {conv.client.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{conv.client}</p>
                      {conv.unread > 0 && (
                        <Badge className="text-[8px] h-4 w-4 p-0 flex items-center justify-center bg-primary">{conv.unread}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate max-w-[300px]">{conv.lastMessage}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge className={cn('text-[8px] h-4 px-1', statusColors[conv.status])}>{statusLabels[conv.status]}</Badge>
                      <span className="text-[10px] text-muted-foreground">via {conv.number.slice(-4)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <p className="text-[10px] text-muted-foreground">{conv.time}</p>
                    <p className="text-xs font-medium">
                      {conv.assignedTo ? (
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{conv.assignedTo}</span>
                      ) : (
                        <span className="text-destructive">Não atribuído</span>
                      )}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-xs gap-2">
                        <Eye className="h-3.5 w-3.5" /> Ver conversa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => { setSelectedConv(conv.id); setTransferOpen(true); }}>
                        <ArrowRightLeft className="h-3.5 w-3.5" /> Transferir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
            {filteredConvs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma conversa encontrada</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Numbers Tab */}
        <TabsContent value="numeros" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {numbers.length} número{numbers.length !== 1 ? 's' : ''} cadastrado{numbers.length !== 1 ? 's' : ''}
            </p>
            <Button className="gap-2" onClick={() => setAddNumberOpen(true)}>
              <Plus className="h-4 w-4" /> Adicionar Número
            </Button>
          </div>

          {numbers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Phone className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum número cadastrado</p>
              <p className="text-xs mt-1">Adicione um número ou configure a API para buscar automaticamente.</p>
            </div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={staggerContainer} initial="initial" animate="animate">
              {numbers.map(num => (
                <motion.div key={num.id} variants={staggerItem}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'h-10 w-10 rounded-lg flex items-center justify-center',
                            num.status === 'connected' ? 'bg-success/10' : 'bg-destructive/10'
                          )}>
                            {num.status === 'connected' ? <Wifi className="h-5 w-5 text-success" /> : <WifiOff className="h-5 w-5 text-destructive" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{num.label}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" />{num.number}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={num.status === 'connected' ? 'default' : 'destructive'} className="text-[10px]">
                            {num.status === 'connected' ? 'Conectado' : 'Desconectado'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteNumberId(num.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <Separator className="mb-3" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Atendentes vinculados</p>
                        {num.assignedUsers.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {num.assignedUsers.map(u => <Badge key={u} variant="secondary" className="text-[10px]">{u}</Badge>)}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Nenhum atendente vinculado</p>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="text-xs flex-1 gap-1">
                          <Users className="h-3 w-3" /> Gerenciar Atendentes
                        </Button>
                        <Button variant={num.status === 'connected' ? 'destructive' : 'default'} size="sm" className="text-xs">
                          {num.status === 'connected' ? 'Desconectar' : 'Conectar'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Sincronização automática</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ao configurar a Evolution API na aba "Configuração API", os números/instâncias conectadas podem ser importados automaticamente.
                    Você também pode adicionar números manualmente acima.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendants Tab */}
        <TabsContent value="atendentes" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {attendants.length} atendente{attendants.length !== 1 ? 's' : ''} cadastrado{attendants.length !== 1 ? 's' : ''}
            </p>
            <Button className="gap-2" onClick={() => setAddAttendantOpen(true)}>
              <Plus className="h-4 w-4" /> Adicionar Atendente
            </Button>
          </div>

          {attendants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum atendente cadastrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attendants.map(u => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.activeChats > 0 ? 'default' : 'secondary'} className="text-[10px]">
                      {u.activeChats > 0 ? `${u.activeChats} chamados` : 'Livre'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteAttendantId(u.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" /> Configuração Evolution API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">URL da API</Label>
                <Input className="mt-1" placeholder="https://sua-instancia.evolution-api.com" />
              </div>
              <div>
                <Label className="text-xs">API Key</Label>
                <Input className="mt-1" type="password" placeholder="Sua chave de API" />
              </div>
              <div>
                <Label className="text-xs">Nome da Instância</Label>
                <Input className="mt-1" placeholder="inforsol-principal" />
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Configure a conexão com a Evolution API para gerenciar os números de WhatsApp.
                A integração permite enviar e receber mensagens, gerenciar instâncias e monitorar o status da conexão.
              </p>
              <Button className="gap-2">
                <Shield className="h-4 w-4" /> Salvar e Testar Conexão
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transfer Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Transferir Chamado</DialogTitle></DialogHeader>
          {currentConv && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Transferir conversa de <strong>{currentConv.client}</strong> para:</p>
              <Select>
                <SelectTrigger><SelectValue placeholder="Selecione um atendente" /></SelectTrigger>
                <SelectContent>
                  {attendants.map(u => <SelectItem key={u.id} value={u.id}>{u.name} ({u.activeChats} chamados)</SelectItem>)}
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={() => setTransferOpen(false)}>Transferir</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Number Dialog */}
      <Dialog open={addNumberOpen} onOpenChange={setAddNumberOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Número</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Nome / Rótulo</Label>
              <Input className="mt-1" placeholder="Ex: Comercial 3" value={newNumber.label} onChange={e => setNewNumber(p => ({ ...p, label: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Número do WhatsApp</Label>
              <Input className="mt-1" placeholder="+55 11 99999-0000" value={newNumber.number} onChange={e => setNewNumber(p => ({ ...p, number: e.target.value }))} />
            </div>
            <p className="text-xs text-muted-foreground">
              O número será adicionado como "Desconectado". Configure a Evolution API para conectá-lo.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddNumberOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddNumber}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Attendant Dialog */}
      <Dialog open={addAttendantOpen} onOpenChange={setAddAttendantOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Atendente</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Nome completo</Label>
              <Input className="mt-1" placeholder="Ex: Maria Souza" value={newAttendant.name} onChange={e => setNewAttendant(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">E-mail</Label>
              <Input className="mt-1" placeholder="maria@inforsol.com" value={newAttendant.email} onChange={e => setNewAttendant(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAttendantOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddAttendant}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Number Confirmation */}
      <AlertDialog open={!!deleteNumberId} onOpenChange={open => !open && setDeleteNumberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir número</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o número "{numbers.find(n => n.id === deleteNumberId)?.label}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNumber} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Attendant Confirmation */}
      <AlertDialog open={!!deleteAttendantId} onOpenChange={open => !open && setDeleteAttendantId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover atendente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{attendants.find(a => a.id === deleteAttendantId)?.name}"?
              {attendants.find(a => a.id === deleteAttendantId)?.activeChats
                ? ' Este atendente possui chamados ativos que precisam ser transferidos primeiro.'
                : ' Esta ação não pode ser desfeita.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAttendant} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MotionPage>
  );
}
