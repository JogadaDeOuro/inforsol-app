import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Palette, FileText, Calculator, Users, Save, UserPlus, Loader2, Shield, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  email?: string;
  roles: string[];
}

export default function Configuracoes() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('vendedor');
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: roles } = await supabase.from('user_roles').select('*');

    if (profiles) {
      const usersWithRoles: UserWithRole[] = profiles.map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        phone: p.phone,
        roles: roles?.filter((r: any) => r.user_id === p.id).map((r: any) => r.role) ?? [],
      }));
      setUsers(usersWithRoles);
    }
    setLoadingUsers(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
    const { data, error } = await supabase.auth.signUp({
      email: inviteEmail,
      password: tempPassword,
      options: { data: { full_name: inviteName } },
    });
    if (error) {
      toast.error(error.message);
      setInviteLoading(false);
      return;
    }
    if (data.user && inviteRole) {
      await supabase.from('user_roles').insert({ user_id: data.user.id, role: inviteRole as any });
    }
    toast.success('Usuário convidado! Um e-mail de confirmação foi enviado.');
    setInviteOpen(false);
    setInviteEmail('');
    setInviteName('');
    setInviteLoading(false);
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await supabase.from('user_roles').delete().eq('user_id', userId);
    await supabase.from('user_roles').insert({ user_id: userId, role: newRole as any });
    toast.success('Papel atualizado');
    fetchUsers();
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      <Tabs defaultValue="empresa" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="empresa" className="text-xs gap-1"><Building2 className="h-3 w-3" /> Empresa</TabsTrigger>
          <TabsTrigger value="visual" className="text-xs gap-1"><Palette className="h-3 w-3" /> Visual</TabsTrigger>
          <TabsTrigger value="textos" className="text-xs gap-1"><FileText className="h-3 w-3" /> Textos</TabsTrigger>
          <TabsTrigger value="calculos" className="text-xs gap-1"><Calculator className="h-3 w-3" /> Cálculos</TabsTrigger>
          <TabsTrigger value="usuarios" className="text-xs gap-1"><Users className="h-3 w-3" /> Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa">
          <Card>
            <CardHeader><CardTitle className="text-base">Dados da Empresa</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">Razão Social</Label><Input defaultValue="Inforsol Energia Solar Ltda" className="mt-1" /></div>
                <div><Label className="text-xs">CNPJ</Label><Input defaultValue="12.345.678/0001-90" className="mt-1" /></div>
                <div><Label className="text-xs">Telefone</Label><Input defaultValue="(11) 3456-7890" className="mt-1" /></div>
                <div><Label className="text-xs">E-mail</Label><Input defaultValue="contato@inforsol.com.br" className="mt-1" /></div>
                <div className="sm:col-span-2"><Label className="text-xs">Endereço</Label><Input defaultValue="Av. Solar, 1000 - São Paulo, SP" className="mt-1" /></div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs">Logo da Empresa</Label>
                <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  <p className="text-sm">Arraste a logo ou clique para fazer upload</p>
                  <p className="text-xs mt-1">PNG, JPG ou SVG (máx. 2MB)</p>
                </div>
              </div>
              <Button className="gap-2"><Save className="h-4 w-4" /> Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visual">
          <Card>
            <CardHeader><CardTitle className="text-base">Identidade Visual</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Cor Primária</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-8 w-8 rounded bg-primary border" />
                    <Input defaultValue="#2d7a4f" className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Cor Secundária</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-8 w-8 rounded bg-secondary border" />
                    <Input defaultValue="#e8f5e9" className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Cor de Destaque</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-8 w-8 rounded bg-accent border" />
                    <Input defaultValue="#1b5e20" className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Cor de Fundo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-8 w-8 rounded bg-background border" />
                    <Input defaultValue="#fafbfa" className="flex-1" />
                  </div>
                </div>
              </div>
              <Button className="gap-2"><Save className="h-4 w-4" /> Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="textos">
          <Card>
            <CardHeader><CardTitle className="text-base">Textos Padrão da Proposta</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Apresentação da Empresa</Label>
                <Textarea className="mt-1 min-h-[100px]" defaultValue="A Inforsol é uma empresa especializada em soluções de energia solar fotovoltaica, com anos de experiência no mercado e centenas de projetos entregues com excelência." />
              </div>
              <div>
                <Label className="text-xs">Observações Técnicas Padrão</Label>
                <Textarea className="mt-1 min-h-[80px]" defaultValue="O dimensionamento foi realizado com base no consumo médio informado e condições de irradiação solar da região." />
              </div>
              <div>
                <Label className="text-xs">Itens Inclusos</Label>
                <Textarea className="mt-1 min-h-[80px]" defaultValue="Módulos fotovoltaicos, inversor(es), estrutura de fixação, cabeamento, conectores, proteções elétricas, projeto elétrico, instalação completa, comissionamento, solicitação de acesso junto à concessionária." />
              </div>
              <Button className="gap-2"><Save className="h-4 w-4" /> Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculos">
          <Card>
            <CardHeader><CardTitle className="text-base">Parâmetros de Cálculo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">Reajuste anual da energia (%)</Label><Input type="number" defaultValue="10" className="mt-1" /></div>
                <div><Label className="text-xs">Produção por kWp (kWh/mês)</Label><Input type="number" defaultValue="125" className="mt-1" /></div>
                <div><Label className="text-xs">Tarifa média (R$/kWh)</Label><Input type="number" defaultValue="0.85" step="0.01" className="mt-1" /></div>
                <div><Label className="text-xs">Degradação anual dos módulos (%)</Label><Input type="number" defaultValue="0.5" step="0.1" className="mt-1" /></div>
                <div><Label className="text-xs">Preço base On-Grid (R$/Wp)</Label><Input type="number" defaultValue="4.80" step="0.1" className="mt-1" /></div>
                <div><Label className="text-xs">Preço base Off-Grid (R$/Wp)</Label><Input type="number" defaultValue="6.20" step="0.1" className="mt-1" /></div>
                <div><Label className="text-xs">Preço base Híbrido (R$/Wp)</Label><Input type="number" defaultValue="5.50" step="0.1" className="mt-1" /></div>
              </div>
              <Button className="gap-2"><Save className="h-4 w-4" /> Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Gerenciar Usuários</CardTitle>
                {isAdmin && (
                  <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1.5 text-xs">
                        <UserPlus className="h-3.5 w-3.5" /> Convidar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Convidar Usuário</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleInvite} className="space-y-4">
                        <div>
                          <Label className="text-xs">Nome completo</Label>
                          <Input className="mt-1" value={inviteName} onChange={e => setInviteName(e.target.value)} required />
                        </div>
                        <div>
                          <Label className="text-xs">E-mail</Label>
                          <Input type="email" className="mt-1" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
                        </div>
                        <div>
                          <Label className="text-xs">Papel</Label>
                          <Select value={inviteRole} onValueChange={setInviteRole}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vendedor">Vendedor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full" disabled={inviteLoading}>
                          {inviteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Enviar Convite
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingUsers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum usuário cadastrado</p>
              ) : (
                users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={u.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {getInitials(u.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{u.full_name || 'Sem nome'}</p>
                          {u.id === user?.id && (
                            <Badge variant="outline" className="text-[10px] h-4">Você</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{u.phone || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.roles.includes('admin') ? (
                        <Badge className="gap-1 text-[10px]"><ShieldCheck className="h-3 w-3" /> Admin</Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 text-[10px]"><Shield className="h-3 w-3" /> Vendedor</Badge>
                      )}
                      {isAdmin && u.id !== user?.id && (
                        <Select
                          value={u.roles[0] || 'vendedor'}
                          onValueChange={(val) => handleRoleChange(u.id, val)}
                        >
                          <SelectTrigger className="w-[110px] h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vendedor">Vendedor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
