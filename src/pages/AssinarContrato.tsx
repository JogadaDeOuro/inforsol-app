import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockContracts, formatCurrency } from '@/lib/mock-data';
import { CheckCircle, FileSignature, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import logoImg from '@/assets/logo-inforsol.png';

export default function AssinarContrato() {
  const { token } = useParams<{ token: string }>();
  const contract = mockContracts.find(c => c.signingToken === token);

  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [signed, setSigned] = useState(false);
  const [hash, setHash] = useState('');

  if (!contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <h1 className="text-xl font-bold">Link inválido</h1>
            <p className="text-sm text-muted-foreground">
              Este link de assinatura não foi encontrado ou já expirou.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const alreadySigned = contract.signatures.length >= 2;

  const handleSign = () => {
    if (!name.trim() || !document.trim()) {
      toast.error('Preencha seu nome e CPF/CNPJ');
      return;
    }
    if (!accepted) {
      toast.error('Você precisa aceitar os termos do contrato');
      return;
    }

    // Generate verification hash
    const data = `${contract.id}-${name}-${document}-${Date.now()}`;
    const generatedHash = btoa(data).slice(0, 16).toUpperCase();

    // In production, this would save to the database
    contract.signatures.push({
      name: name.trim(),
      document: document.trim(),
      signedAt: new Date().toISOString(),
      ip: '0.0.0.0', // Would be captured server-side
      hash: generatedHash,
    });

    setHash(generatedHash);
    setSigned(true);
    toast.success('Contrato assinado com sucesso!');
  };

  if (signed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Contrato Assinado!</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Sua assinatura digital foi registrada com sucesso.
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome:</span>
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPF/CNPJ:</span>
                <span className="font-medium">{document}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data/Hora:</span>
                <span className="font-medium">{new Date().toLocaleString('pt-BR')}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Hash de verificação:</span>
                <Badge variant="outline" className="font-mono text-xs">{hash}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
              <Shield className="h-3.5 w-3.5" />
              <span>Assinatura digital com validade jurídica (Lei 14.063/2020)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (alreadySigned) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-success" />
            <h1 className="text-xl font-bold">Contrato já assinado</h1>
            <p className="text-sm text-muted-foreground">
              Todas as assinaturas necessárias já foram coletadas para este contrato.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const systemLabel = contract.systemType === 'on-grid' ? 'On-Grid' :
    contract.systemType === 'off-grid' ? 'Off-Grid' : 'Híbrido';

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <img src={logoImg} alt="Inforsol" className="h-10 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Assinatura Digital de Contrato</h1>
          <p className="text-sm text-muted-foreground">Revise os termos e assine digitalmente</p>
        </div>

        {/* Contract Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-primary" />
              Resumo do Contrato — {contract.id}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Cliente</span>
                <p className="font-medium">{contract.clientName}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Sistema</span>
                <p className="font-medium">{systemLabel} — {contract.potenciaKwp} kWp</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Valor do Contrato</span>
                <p className="font-bold text-primary">{formatCurrency(contract.valor)}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Condição de Pagamento</span>
                <p className="font-medium">{contract.condicaoPagamento}</p>
              </div>
            </div>

            <Separator />

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Objeto:</strong> Instalação de sistema fotovoltaico {systemLabel} de {contract.potenciaKwp} kWp</p>
              <p><strong>Prazo:</strong> 30 dias úteis após liberação técnica</p>
              <p><strong>Garantias:</strong> Módulos 25 anos · Inversor 10 anos · Estrutura 12 anos · Mão de obra 5 anos</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline">{contract.signatures.length}/2 assinaturas</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Signing Form */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">Dados para Assinatura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Nome Completo / Razão Social</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">CPF / CNPJ</Label>
                <Input
                  value={document}
                  onChange={e => setDocument(e.target.value)}
                  placeholder="000.000.000-00"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="accept"
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v === true)}
              />
              <label htmlFor="accept" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                Declaro que li e concordo com todas as cláusulas do contrato. Esta assinatura eletrônica tem validade jurídica nos termos da Lei nº 14.063/2020 e equivale à assinatura manuscrita para todos os fins legais.
              </label>
            </div>

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleSign}
              disabled={!name.trim() || !document.trim() || !accepted}
            >
              <FileSignature className="h-4 w-4" /> Assinar Digitalmente
            </Button>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground justify-center">
              <Shield className="h-3 w-3" />
              <span>Conexão segura · Dados protegidos · Registro com timestamp e IP</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
