import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone, Bot, Zap, Link2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const integrations = [
  {
    title: 'WhatsApp Business',
    description: 'Conecte seus vendedores ao WhatsApp para atendimento direto pelo CRM.',
    icon: MessageSquare,
    status: 'disponivel' as const,
    features: ['Sincronizar conversas', 'Associar ao lead', 'Enviar lembretes', 'Automações'],
  },
  {
    title: 'Telefonia VoIP',
    description: 'Integre com sistemas de telefonia para registro automático de ligações.',
    icon: Phone,
    status: 'em_breve' as const,
    features: ['Registro de chamadas', 'Click-to-call', 'Gravação'],
  },
  {
    title: 'Assinatura Digital',
    description: 'Assine contratos digitalmente com validade jurídica.',
    icon: Link2,
    status: 'disponivel' as const,
    features: ['Assinatura eletrônica', 'Captura de IP', 'Geolocalização', 'Hash de verificação'],
    route: '/contratos',
  },
  {
    title: 'Inteligência Artificial',
    description: 'Use IA para qualificação de leads e sugestões de proposta.',
    icon: Bot,
    status: 'em_breve' as const,
    features: ['Qualificação automática', 'Sugestão de preço', 'Análise de perfil'],
  },
];

export default function Integracoes() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Integrações</h1>
        <p className="text-sm text-muted-foreground">Conecte seu sistema a outras ferramentas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map(int => (
          <Card key={int.title} className="animate-fade-in hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <int.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{int.title}</CardTitle>
                    <CardDescription className="text-xs">{int.description}</CardDescription>
                  </div>
                </div>
                {int.status === 'disponivel' ? (
                  <Badge className="text-[10px] shrink-0 bg-success/10 text-success border-success/30">Disponível</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] shrink-0">Em breve</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {int.features.map(f => (
                  <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>
                ))}
              </div>
              {int.status === 'disponivel' ? (
                <Button variant="default" className="w-full gap-2" onClick={() => navigate('/whatsapp-admin')}>
                  <Zap className="h-4 w-4" /> Configurar <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              ) : (
                <Button variant="outline" className="w-full gap-2" disabled>
                  <Zap className="h-4 w-4" /> Configurar <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
