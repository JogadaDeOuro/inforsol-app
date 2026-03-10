import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Send, Phone, Paperclip, Smile, User, Clock, ArrowRightLeft, MoreVertical, Tag, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { statusLabels, statusColors, type ClientStatus } from '@/lib/mock-data';
import { MotionPage } from '@/components/MotionPage';
import { useAuth } from '@/hooks/useAuth';

// Mock conversations for UI placeholder
const mockConversations = [
  { id: '1', name: 'João Silva', phone: '+55 11 99999-0001', lastMessage: 'Bom dia! Gostaria de um orçamento para energia solar.', time: '10:32', unread: 2, status: 'novo' as ClientStatus, assignedTo: 'Você' },
  { id: '2', name: 'Maria Santos', phone: '+55 11 99999-0002', lastMessage: 'Ok, vou analisar a proposta e retorno.', time: '09:15', unread: 0, status: 'proposta_enviada' as ClientStatus, assignedTo: 'Você' },
  { id: '3', name: 'Carlos Oliveira', phone: '+55 11 99999-0003', lastMessage: 'Quando podem iniciar a instalação?', time: 'Ontem', unread: 1, status: 'fechado' as ClientStatus, assignedTo: 'Você' },
];

const mockMessages = [
  { id: '1', from: 'client', text: 'Bom dia! Gostaria de um orçamento para energia solar.', time: '10:30' },
  { id: '2', from: 'client', text: 'Meu consumo mensal é de aproximadamente 500 kWh.', time: '10:31' },
  { id: '3', from: 'agent', text: 'Bom dia, João! Claro, vou preparar um orçamento personalizado para você.', time: '10:32' },
  { id: '4', from: 'agent', text: 'Para um consumo de 500 kWh, recomendamos um sistema de aproximadamente 4.5 kWp.', time: '10:33' },
  { id: '5', from: 'client', text: 'Qual seria o valor aproximado?', time: '10:35' },
];

export default function WhatsApp() {
  const { profile } = useAuth();
  const [selectedConv, setSelectedConv] = useState<string | null>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [clientInfoOpen, setClientInfoOpen] = useState(false);

  const currentConv = mockConversations.find(c => c.id === selectedConv);
  const filteredConvs = mockConversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <MotionPage className="h-[calc(100vh-5rem)]">
      <div className="flex h-full rounded-xl border overflow-hidden bg-card">
        {/* Conversation List */}
        <div className="w-80 border-r flex flex-col shrink-0">
          <div className="p-3 border-b space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Conversas
              </h2>
              <Badge variant="secondary" className="text-[10px]">{mockConversations.length}</Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar conversa..."
                className="pl-8 h-8 text-xs"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {filteredConvs.map(conv => (
              <motion.button
                key={conv.id}
                className={cn(
                  'w-full text-left p-3 border-b transition-colors hover:bg-accent/50',
                  selectedConv === conv.id && 'bg-accent'
                )}
                onClick={() => setSelectedConv(conv.id)}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-2.5">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {conv.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{conv.name}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{conv.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge className={cn('text-[8px] h-4 px-1', statusColors[conv.status])}>
                        {statusLabels[conv.status]}
                      </Badge>
                      {conv.unread > 0 && (
                        <Badge className="text-[8px] h-4 w-4 p-0 flex items-center justify-center bg-primary">{conv.unread}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        {currentConv ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-3 border-b flex items-center justify-between">
              <button className="flex items-center gap-2.5" onClick={() => setClientInfoOpen(true)}>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {currentConv.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-left">{currentConv.name}</p>
                  <p className="text-[10px] text-muted-foreground">{currentConv.phone}</p>
                </div>
              </button>
              <div className="flex items-center gap-1">
                <Select defaultValue={currentConv.status}>
                  <SelectTrigger className="h-7 text-[10px] w-auto gap-1 border-dashed">
                    <Tag className="h-3 w-3" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-xs gap-2">
                      <ArrowRightLeft className="h-3.5 w-3.5" /> Transferir chamado
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs gap-2" onClick={() => setClientInfoOpen(true)}>
                      <User className="h-3.5 w-3.5" /> Ver dados do cliente
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3 max-w-2xl mx-auto">
                <div className="text-center">
                  <Badge variant="outline" className="text-[10px]">
                    <Clock className="h-3 w-3 mr-1" /> Hoje
                  </Badge>
                </div>
                {mockMessages.map(msg => (
                  <motion.div
                    key={msg.id}
                    className={cn('flex', msg.from === 'agent' ? 'justify-end' : 'justify-start')}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className={cn(
                      'max-w-[70%] rounded-2xl px-3.5 py-2 text-sm',
                      msg.from === 'agent'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    )}>
                      <p>{msg.text}</p>
                      <p className={cn(
                        'text-[9px] mt-1 text-right',
                        msg.from === 'agent' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                      )}>{msg.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Digite uma mensagem..."
                  className="flex-1"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && message.trim()) setMessage(''); }}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button size="icon" className="h-8 w-8 shrink-0" disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Selecione uma conversa</p>
              <p className="text-xs mt-1">Escolha um contato para iniciar o atendimento</p>
            </div>
          </div>
        )}
      </div>

      {/* Client Info Sheet */}
      <Sheet open={clientInfoOpen} onOpenChange={setClientInfoOpen}>
        <SheetContent className="w-full sm:max-w-md">
          {currentConv && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {currentConv.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{currentConv.name}</p>
                    <p className="text-xs text-muted-foreground font-normal">{currentConv.phone}</p>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status CRM</p>
                  <Select defaultValue={currentConv.status}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Atribuído a</p>
                  <p className="text-sm font-medium">{currentConv.assignedTo}</p>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  Integração com CRM completa na Etapa 2 — dados do cliente sincronizados automaticamente.
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MotionPage>
  );
}
