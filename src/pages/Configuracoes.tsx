import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Palette, FileText, Calculator, Users, Save } from 'lucide-react';

export default function Configuracoes() {
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
            <CardHeader><CardTitle className="text-base">Gerenciar Usuários</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Carlos Oliveira', email: 'carlos@inforsol.com', role: 'Admin' },
                { name: 'Ana Paula', email: 'ana@inforsol.com', role: 'Vendedor' },
                { name: 'Ricardo Santos', email: 'ricardo@inforsol.com', role: 'Vendedor' },
                { name: 'Juliana Costa', email: 'juliana@inforsol.com', role: 'Vendedor' },
              ].map(u => (
                <div key={u.email} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {u.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{u.role}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
