import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockContracts, formatCurrency, type Contract } from '@/lib/mock-data';
import { formatCpfCnpj, isValidCpfCnpj } from '@/lib/utils';
import { CheckCircle, FileSignature, Shield, AlertTriangle, MapPin, Globe, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import logoImg from '@/assets/logo-inforsol.png';

// Helper to get signing tokens from localStorage
function getStoredTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem('signing_tokens') || '{}');
  } catch { return {}; }
}

function findContractByToken(token: string): Contract | undefined {
  // First check mockContracts directly
  const direct = mockContracts.find(c => c.signingToken === token);
  if (direct) return direct;

  // Then check localStorage mapping
  const tokens = getStoredTokens();
  const contractId = Object.keys(tokens).find(id => tokens[id] === token);
  if (contractId) {
    const contract = mockContracts.find(c => c.id === contractId);
    if (contract) {
      contract.signingToken = token;
      return contract;
    }
  }
  return undefined;
}

export default function AssinarContrato() {
  const { token } = useParams<{ token: string }>();
  const contract = token ? findContractByToken(token) : undefined;

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };
  const isValidCpf = (value: string) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value);
  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [signed, setSigned] = useState(false);
  const [hash, setHash] = useState('');
  const [signingData, setSigningData] = useState<{
    ip: string;
    location: string;
    userAgent: string;
    signedAt: string;
  } | null>(null);
  const [ip, setIp] = useState('');
  const [location, setLocation] = useState('');
  const [loadingIp, setLoadingIp] = useState(true);
  const [loadingGeo, setLoadingGeo] = useState(false);

  // Capture IP on mount
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(data => setIp(data.ip))
      .catch(() => setIp('Não identificado'))
      .finally(() => setLoadingIp(false));
  }, []);

  // Request geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setLoadingGeo(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          setLoadingGeo(false);
        },
        () => {
          setLocation('Não autorizado');
          setLoadingGeo(false);
        },
        { timeout: 10000 }
      );
    } else {
      setLocation('Indisponível');
    }
  }, []);

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
    if (!email.trim() || !email.includes('@')) {
      toast.error('Informe um e-mail válido para confirmação');
      return;
    }
    if (!accepted) {
      toast.error('Você precisa aceitar os termos do contrato');
      return;
    }

    const now = new Date();
    const userAgent = navigator.userAgent;

    const rawData = `${contract.id}-${name}-${document}-${email}-${ip}-${now.toISOString()}`;
    const generatedHash = btoa(rawData).slice(0, 20).toUpperCase();

    contract.signatures.push({
      name: name.trim(),
      document: document.trim(),
      email: email.trim(),
      signedAt: now.toISOString(),
      ip: ip || 'Não identificado',
      location: location || 'Não disponível',
      userAgent,
      hash: generatedHash,
    });

    setSigningData({
      ip: ip || 'Não identificado',
      location: location || 'Não disponível',
      userAgent,
      signedAt: now.toISOString(),
    });
    setHash(generatedHash);
    setSigned(true);
    toast.success('Contrato assinado com sucesso! Um e-mail de confirmação será enviado.');
  };

  if (signed && signingData) {
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
                <span className="text-muted-foreground">E-mail:</span>
                <span className="font-medium">{email}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data/Hora:</span>
                <span className="font-medium">{new Date(signingData.signedAt).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> IP:</span>
                <span className="font-mono text-xs">{signingData.ip}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Localização:</span>
                <span className="font-mono text-xs">{signingData.location}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Hash de verificação:</span>
                <Badge variant="outline" className="font-mono text-xs">{hash}</Badge>
              </div>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>Uma cópia de confirmação será enviada para <strong className="text-foreground">{email}</strong></span>
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
        <div className="text-center space-y-2">
          <img src={logoImg} alt="Inforsol" className="h-10 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Assinatura Digital de Contrato</h1>
          <p className="text-sm text-muted-foreground">Revise os termos e assine digitalmente</p>
        </div>

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

        <Card className="border-muted">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="block text-foreground font-medium">IP detectado</span>
                  {loadingIp ? (
                    <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Detectando...</span>
                  ) : (
                    <span className="font-mono">{ip}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="block text-foreground font-medium">Geolocalização</span>
                  {loadingGeo ? (
                    <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Solicitando...</span>
                  ) : (
                    <span className="font-mono">{location}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="block text-foreground font-medium">Segurança</span>
                  <span>Conexão protegida · Lei 14.063/2020</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <Label className="text-xs">CPF</Label>
                <Input
                  value={document}
                  onChange={e => setDocument(formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="mt-1"
                />
                {document && !isValidCpf(document) && (
                  <p className="text-[10px] text-destructive mt-1">Formato: 000.000.000-00</p>
                )}
              </div>
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1">
                <Mail className="h-3 w-3" /> E-mail para confirmação
              </Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="mt-1"
              />
              {email && !isValidEmail(email) && (
                <p className="text-[10px] text-destructive mt-1">Informe um e-mail válido</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">
                Uma cópia da assinatura será enviada para este endereço
              </p>
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
              disabled={!name.trim() || !isValidCpf(document) || !isValidEmail(email) || !accepted}
            >
              <FileSignature className="h-4 w-4" /> Assinar Digitalmente
            </Button>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground justify-center">
              <Shield className="h-3 w-3" />
              <span>IP, geolocalização e timestamp serão registrados com a assinatura</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
