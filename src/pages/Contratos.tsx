import { useState } from 'react';
import { Search, FileSignature, Download, Trash2, Eye, Link2, PenLine } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { mockContracts, formatCurrency, type Contract, persistContracts } from '@/lib/mock-data';
import { cn, formatCpfCnpj, isValidCpfCnpj } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ContractPDF } from '@/components/ContractPDF';
import { SignatureStylePicker } from '@/components/SignatureStylePicker';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

const contractStatusLabels: Record<string, string> = {
  rascunho: 'Rascunho', enviado: 'Enviado', assinado: 'Assinado', cancelado: 'Cancelado', aguardando_assinaturas: 'Aguardando Assinaturas',
};
const contractStatusColors: Record<string, string> = {
  rascunho: 'bg-muted text-muted-foreground',
  enviado: 'bg-info text-info-foreground',
  assinado: 'bg-success text-success-foreground',
  cancelado: 'bg-destructive text-destructive-foreground',
  aguardando_assinaturas: 'bg-warning text-warning-foreground',
};

function getContractDisplayStatus(contract: Contract): string {
  if (contract.status === 'assinado') return 'assinado';
  if (contract.signatures.length > 0 && contract.signatures.length < 2) return 'aguardando_assinaturas';
  return contract.status;
}

function storeSigningToken(contractId: string, token: string) {
  try {
    const tokens = JSON.parse(localStorage.getItem('signing_tokens') || '{}');
    tokens[contractId] = token;
    localStorage.setItem('signing_tokens', JSON.stringify(tokens));
  } catch { /* ignore */ }
}

async function sendNotification(type: string, contractId: string, contractName: string, signerName: string, signerEmail: string, signerType: string) {
  try {
    await supabase.functions.invoke('send-contract-notification', {
      body: { type, contractId, contractName, signerName, signerEmail, signerType },
    });
  } catch (e) {
    console.error('Notification error:', e);
  }
}

export default function Contratos() {
  const [search, setSearch] = useState('');
  const [contracts, setContracts] = useState<Contract[]>([...mockContracts]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfWithSignatures, setPdfWithSignatures] = useState(false);
  const { isAdmin } = useAuth();

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Internal signing state
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [signContract, setSignContract] = useState<Contract | null>(null);
  const [signName, setSignName] = useState('');
  const [signDocument, setSignDocument] = useState('');
  const [signEmail, setSignEmail] = useState('');
  const [signAccepted, setSignAccepted] = useState(false);
  const [signFont, setSignFont] = useState('');

  const filtered = contracts.filter(c =>
    c.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    const idx = mockContracts.findIndex(c => c.id === id);
    if (idx !== -1) mockContracts.splice(idx, 1);
    persistContracts();
    setContracts(prev => prev.filter(c => c.id !== id));
    toast.success('Contrato excluído');
  };

  const handleSendForSignature = (contract: Contract) => {
    const token = crypto.randomUUID().slice(0, 12);
    setContracts(prev => prev.map(c =>
      c.id === contract.id ? { ...c, signingToken: token, status: 'enviado' as const } : c
    ));
    const idx = mockContracts.findIndex(c => c.id === contract.id);
    if (idx !== -1) {
      mockContracts[idx] = { ...mockContracts[idx], signingToken: token, status: 'enviado' as const };
    }
    persistContracts();
    storeSigningToken(contract.id, token);
    const url = `${window.location.origin}/assinar/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link de assinatura copiado!', { description: url });
  };

  const openPreview = (contract: Contract) => {
    setSelectedContract(contract);
    setPreviewOpen(true);
  };

  const openPdf = (contract: Contract, withSignatures: boolean) => {
    setSelectedContract(contract);
    setPdfWithSignatures(withSignatures);
    setPdfOpen(true);
  };

  const openInternalSign = (contract: Contract) => {
    setSignContract(contract);
    setSignName('');
    setSignDocument('');
    setSignEmail('');
    setSignAccepted(false);
    setSignFont('');
    setPreviewOpen(false);
    setSignDialogOpen(true);
  };

  const handleInternalSign = async () => {
    if (!signContract) return;
    if (!signName.trim() || !signDocument.trim()) {
      toast.error('Preencha nome e CPF/CNPJ');
      return;
    }
    if (!signEmail.trim() || !signEmail.includes('@')) {
      toast.error('Informe um e-mail válido');
      return;
    }
    if (!signAccepted) {
      toast.error('Você precisa aceitar os termos');
      return;
    }
    if (!signFont) {
      toast.error('Escolha um estilo de assinatura');
      return;
    }

    const now = new Date();
    const rawData = `${signContract.id}-${signName}-${signDocument}-${signEmail}-internal-${now.toISOString()}`;
    const generatedHash = btoa(rawData).slice(0, 20).toUpperCase();

    const newSignature = {
      name: signName.trim(),
      document: signDocument.trim(),
      email: signEmail.trim(),
      signedAt: now.toISOString(),
      ip: 'Assinatura interna',
      location: 'Plataforma Inforsol',
      userAgent: navigator.userAgent,
      hash: generatedHash,
      signatureFont: signFont,
      signerType: 'empresa' as const,
    };

    const idx = mockContracts.findIndex(c => c.id === signContract.id);
    if (idx !== -1) {
      mockContracts[idx].signatures.push(newSignature);
      const hasEmpresa = mockContracts[idx].signatures.some(s => s.signerType === 'empresa');
      const hasCliente = mockContracts[idx].signatures.some(s => s.signerType === 'cliente');
      if (hasEmpresa && hasCliente) {
        mockContracts[idx].status = 'assinado';
        mockContracts[idx].signedAt = now.toISOString().split('T')[0];
      } else {
        mockContracts[idx].status = 'enviado';
      }
    }
    persistContracts();

    setContracts(prev => prev.map(c => {
      if (c.id !== signContract.id) return c;
      const updated = { ...c, signatures: [...c.signatures, newSignature] };
      if (updated.signatures.length >= 2) {
        updated.status = 'assinado';
        updated.signedAt = now.toISOString().split('T')[0];
      } else {
        updated.status = 'enviado';
      }
      return updated;
    }));

    setSignDialogOpen(false);
    toast.success('Assinatura registrada com sucesso!', {
      description: `Hash: ${generatedHash}`,
    });

    // Send notification
    const sigCount = (mockContracts.find(c => c.id === signContract.id)?.signatures.length) || 0;
    await sendNotification(
      sigCount >= 2 ? 'fully_signed' : 'company_signed',
      signContract.id,
      signContract.clientName,
      signName.trim(),
      signEmail.trim(),
      'empresa'
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Contratos</h1>
          <p className="text-sm text-muted-foreground">{contracts.length} contratos</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar contrato..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-3">
        {filtered.map(c => (
          <Card key={c.id} className="hover:shadow-md transition-shadow animate-fade-in cursor-pointer" onClick={() => openPreview(c)}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileSignature className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{c.clientName}</p>
                      <Badge className={cn('text-[10px]', contractStatusColors[getContractDisplayStatus(c)])}>
                        {contractStatusLabels[getContractDisplayStatus(c)]}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {c.signatures.length}/2 assinaturas
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {c.id} · {c.systemType.toUpperCase()} · {c.potenciaKwp} kWp · {c.condicaoPagamento}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(c.valor)}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.signedAt ? `Assinado em ${c.signedAt}` : 'Pendente assinatura'}
                    </p>
                  </div>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openPreview(c)} title="Visualizar">
                      <Eye className="h-4 w-4" />
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
                            <AlertDialogTitle>Excluir contrato?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o contrato {c.id} de {c.clientName}? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(c.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileSignature className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum contrato encontrado</p>
          </div>
        )}
      </div>

      {/* Contract Preview Dialog */}
      {selectedContract && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Contrato {selectedContract.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente</span>
                  <span className="font-medium">{selectedContract.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sistema</span>
                  <span className="font-medium">{selectedContract.systemType.toUpperCase()} · {selectedContract.potenciaKwp} kWp</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-bold text-primary">{formatCurrency(selectedContract.valor)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pagamento</span>
                  <span className="font-medium">{selectedContract.condicaoPagamento}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={cn('text-[10px]', contractStatusColors[getContractDisplayStatus(selectedContract)])}>
                    {contractStatusLabels[getContractDisplayStatus(selectedContract)]}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Assinaturas</span>
                  <Badge variant="outline">{selectedContract.signatures.length}/2</Badge>
                </div>
              </div>

              {selectedContract.signatures.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Assinaturas registradas:</p>
                    {selectedContract.signatures.map((sig, i) => (
                      <div key={i} className="rounded bg-muted p-2 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px]">
                              {sig.signerType === 'empresa' ? 'Empresa' : 'Cliente'}
                            </Badge>
                            {sig.signatureFont ? (
                              <span className="text-base" style={{ fontFamily: sig.signatureFont }}>{sig.name}</span>
                            ) : (
                              <span className="font-medium">{sig.name}</span>
                            )}
                          </div>
                          <span className="text-muted-foreground">{new Date(sig.signedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>{sig.document}</span>
                          <span className="font-mono text-[10px]">Hash: {sig.hash}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="gap-2" onClick={() => { setPreviewOpen(false); openPdf(selectedContract, false); }}>
                  <Download className="h-4 w-4" /> Baixar sem assinaturas
                </Button>
                {selectedContract.signatures.length > 0 && (
                  <Button variant="outline" className="gap-2" onClick={() => { setPreviewOpen(false); openPdf(selectedContract, true); }}>
                    <Download className="h-4 w-4" /> Baixar com assinaturas
                  </Button>
                )}

                <Separator className="my-1" />

                {!selectedContract.signatures.some(s => s.signerType === 'empresa') && (
                  <Button className="gap-2" variant="default" onClick={() => openInternalSign(selectedContract)}>
                    <PenLine className="h-4 w-4" /> Assinar internamente (empresa)
                  </Button>
                )}

                {!selectedContract.signatures.some(s => s.signerType === 'cliente') && (
                  <Button className="gap-2" variant="outline" onClick={() => { setPreviewOpen(false); handleSendForSignature(selectedContract); }}>
                    <Link2 className="h-4 w-4" /> Encaminhar para assinatura (cliente)
                  </Button>
                )}

                {selectedContract.signingToken && (
                  <div className="rounded bg-muted p-2 text-xs text-center">
                    <p className="text-muted-foreground mb-1">Link de assinatura ativo:</p>
                    <code className="text-[10px] break-all">{window.location.origin}/assinar/{selectedContract.signingToken}</code>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Internal Signing Dialog */}
      <Dialog open={signDialogOpen} onOpenChange={setSignDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenLine className="h-4 w-4 text-primary" />
              Assinatura Interna
            </DialogTitle>
          </DialogHeader>
          {signContract && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                <p className="font-medium">{signContract.clientName}</p>
                <p className="text-xs text-muted-foreground">
                  {signContract.id} · {signContract.systemType.toUpperCase()} · {formatCurrency(signContract.valor)}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Nome do Responsável</Label>
                  <Input
                    value={signName}
                    onChange={e => setSignName(e.target.value)}
                    placeholder="Nome completo do assinante"
                    className="mt-1"
                  />
                </div>

                {signName.trim().length >= 3 && (
                  <SignatureStylePicker
                    name={signName}
                    selectedFont={signFont}
                    onSelectFont={setSignFont}
                  />
                )}

                <div>
                  <Label className="text-xs">CPF</Label>
                  <Input
                    value={signDocument}
                    onChange={e => setSignDocument(formatCpfCnpj(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={18}
                    className="mt-1"
                  />
                  {signDocument && !isValidCpfCnpj(signDocument) && (
                    <p className="text-[10px] text-destructive mt-1">CPF: 000.000.000-00 ou CNPJ: 00.000.000/0000-00</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs">E-mail</Label>
                  <Input
                    type="email"
                    value={signEmail}
                    onChange={e => setSignEmail(e.target.value)}
                    placeholder="email@empresa.com"
                    className="mt-1"
                  />
                  {signEmail && !isValidEmail(signEmail) && (
                    <p className="text-[10px] text-destructive mt-1">Informe um e-mail válido</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="accept-internal"
                  checked={signAccepted}
                  onCheckedChange={(v) => setSignAccepted(v === true)}
                />
                <label htmlFor="accept-internal" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  Declaro que li e concordo com todas as cláusulas do contrato, representando a empresa nesta assinatura digital.
                </label>
              </div>

              <Button
                className="w-full gap-2"
                onClick={handleInternalSign}
                disabled={!signName.trim() || !isValidCpfCnpj(signDocument) || !isValidEmail(signEmail) || !signAccepted || !signFont}
              >
                <FileSignature className="h-4 w-4" /> Assinar como Empresa
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contract PDF */}
      {selectedContract && (
        <ContractPDF
          open={pdfOpen}
          onOpenChange={setPdfOpen}
          contract={selectedContract}
          showSignatures={pdfWithSignatures}
        />
      )}
    </div>
  );
}
