// Mock data for the Inforsol system

export type ClientStatus = 'novo' | 'em_atendimento' | 'proposta_enviada' | 'negociacao' | 'fechado' | 'perdido' | 'instalacao' | 'finalizado' | 'arquivado';
export type ClientType = 'residencial' | 'comercial' | 'industrial' | 'rural';
export type SystemType = 'on-grid' | 'off-grid' | 'hibrido';
export type ProposalStatus = 'rascunho' | 'enviada' | 'visualizada' | 'aceita' | 'recusada';
export type ContractStatus = 'rascunho' | 'enviado' | 'assinado' | 'cancelado';
export type StageStatus = 'pendente' | 'em_andamento' | 'concluido' | 'atrasado';

export interface Client {
  id: string;
  name: string;
  document: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  projectLocation: string;
  concessionaria: string;
  consumoMedio: number;
  clientType: ClientType;
  status: ClientStatus;
  vendedor: string;
  origem: string;
  tags: string[];
  notes: string;
  favorite: boolean;
  createdAt: string;
}

export interface Proposal {
  id: string;
  clientId: string;
  clientName: string;
  systemType: SystemType;
  potenciaKwp: number;
  valorSistema: number;
  producaoEstimada: number;
  economiaMensal: number;
  economiaAnual: number;
  paybackAnos: number;
  status: ProposalStatus;
  condicaoPagamento: string;
  desconto: number;
  margem: number;
  comissao: number;
  createdAt: string;
  viewedAt?: string;
  acceptedAt?: string;
}

export interface ContractSignature {
  name: string;
  document: string;
  email?: string;
  signedAt: string;
  ip: string;
  location?: string;
  userAgent?: string;
  hash: string;
  signatureFont?: string;
}

export interface Contract {
  id: string;
  proposalId: string;
  clientId: string;
  clientName: string;
  clientDocument?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientCity?: string;
  clientState?: string;
  systemType: SystemType;
  potenciaKwp: number;
  valor: number;
  condicaoPagamento: string;
  status: ContractStatus;
  createdAt: string;
  signedAt?: string;
  signingToken?: string;
  signatures: ContractSignature[];
}

export interface ProjectStage {
  id: string;
  contractId: string;
  clientName: string;
  stages: {
    name: string;
    dataPrevista: string;
    dataReal?: string;
    responsavel: string;
    observacoes: string;
    status: StageStatus;
  }[];
}

export const mockClients: Client[] = [];

const defaultProposals: Proposal[] = [];

const defaultContracts: Contract[] = [];

// LocalStorage persistence helpers
function loadFromStorage<T>(key: string, defaults: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [...defaults];
}

function saveToStorage<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* ignore */ }
}

export const mockProposals: Proposal[] = loadFromStorage<Proposal>('inforsol_proposals', defaultProposals);
export const mockContracts: Contract[] = loadFromStorage<Contract>('inforsol_contracts', defaultContracts);

export function persistProposals() {
  saveToStorage('inforsol_proposals', mockProposals);
}

export function persistContracts() {
  saveToStorage('inforsol_contracts', mockContracts);
}

export const mockProjectStages: ProjectStage[] = [
  {
    id: 'PS001', contractId: 'C001', clientName: 'Tech Solutions Ltda',
    stages: [
      { name: 'Proposta Aprovada', dataPrevista: '2024-02-25', dataReal: '2024-02-25', responsavel: 'Ana Paula', observacoes: '', status: 'concluido' },
      { name: 'Contrato Assinado', dataPrevista: '2024-02-28', dataReal: '2024-02-28', responsavel: 'Ana Paula', observacoes: '', status: 'concluido' },
      { name: 'Solicitação Técnica Enviada', dataPrevista: '2024-03-05', dataReal: '2024-03-04', responsavel: 'Eng. Ricardo', observacoes: 'Enviado 1 dia antes', status: 'concluido' },
      { name: 'Liberação Técnica', dataPrevista: '2024-03-20', dataReal: '2024-03-18', responsavel: 'Concessionária', observacoes: '', status: 'concluido' },
      { name: 'Chegada de Material', dataPrevista: '2024-03-25', dataReal: '2024-03-25', responsavel: 'Logística', observacoes: '', status: 'concluido' },
      { name: 'Agendamento de Instalação', dataPrevista: '2024-03-28', dataReal: '2024-03-27', responsavel: 'Coord. Obras', observacoes: '', status: 'concluido' },
      { name: 'Instalação', dataPrevista: '2024-04-02', dataReal: undefined, responsavel: 'Equipe Técnica', observacoes: '', status: 'em_andamento' },
      { name: 'Vistoria', dataPrevista: '2024-04-10', responsavel: 'Concessionária', observacoes: '', status: 'pendente' },
      { name: 'Homologação / Ativação', dataPrevista: '2024-04-15', responsavel: 'Concessionária', observacoes: '', status: 'pendente' },
    ],
  },
  {
    id: 'PS002', contractId: 'C002', clientName: 'Fazenda Boa Vista',
    stages: [
      { name: 'Proposta Aprovada', dataPrevista: '2024-02-01', dataReal: '2024-02-01', responsavel: 'Ana Paula', observacoes: '', status: 'concluido' },
      { name: 'Contrato Assinado', dataPrevista: '2024-02-05', dataReal: '2024-02-05', responsavel: 'Ana Paula', observacoes: '', status: 'concluido' },
      { name: 'Solicitação Técnica Enviada', dataPrevista: '2024-02-12', dataReal: '2024-02-14', responsavel: 'Eng. Ricardo', observacoes: 'Atrasou 2 dias', status: 'concluido' },
      { name: 'Liberação Técnica', dataPrevista: '2024-02-28', dataReal: undefined, responsavel: 'Concessionária', observacoes: 'Aguardando retorno', status: 'atrasado' },
      { name: 'Chegada de Material', dataPrevista: '2024-03-10', responsavel: 'Logística', observacoes: '', status: 'pendente' },
      { name: 'Agendamento de Instalação', dataPrevista: '2024-03-15', responsavel: 'Coord. Obras', observacoes: '', status: 'pendente' },
      { name: 'Instalação', dataPrevista: '2024-03-20', responsavel: 'Equipe Técnica', observacoes: '', status: 'pendente' },
      { name: 'Vistoria', dataPrevista: '2024-04-01', responsavel: 'Concessionária', observacoes: '', status: 'pendente' },
      { name: 'Homologação / Ativação', dataPrevista: '2024-04-10', responsavel: 'Concessionária', observacoes: '', status: 'pendente' },
    ],
  },
];

export const dashboardStats = {
  totalLeads: 127,
  proposalsEnviadas: 48,
  proposalsAceitas: 31,
  taxaConversao: 64.6,
  ticketMedio: 89500,
  faturamentoPrevisto: 2850000,
  faturamentoFechado: 1920000,
  contratosAndamento: 8,
  projetosPorEtapa: {
    'Proposta Aprovada': 3,
    'Contrato Assinado': 2,
    'Solicitação Técnica': 4,
    'Liberação Técnica': 2,
    'Material': 3,
    'Instalação': 5,
    'Vistoria': 2,
    'Homologação': 1,
  },
  vendasMensais: [
    { mes: 'Jan', valor: 385000, propostas: 6 },
    { mes: 'Fev', valor: 290000, propostas: 8 },
    { mes: 'Mar', valor: 520000, propostas: 12 },
    { mes: 'Abr', valor: 180000, propostas: 5 },
    { mes: 'Mai', valor: 445000, propostas: 9 },
    { mes: 'Jun', valor: 310000, propostas: 7 },
  ],
  vendedores: [
    { nome: 'Carlos Oliveira', leads: 42, propostas: 18, fechamentos: 12, faturamento: 890000 },
    { nome: 'Ana Paula', leads: 38, propostas: 15, fechamentos: 10, faturamento: 720000 },
    { nome: 'Ricardo Santos', leads: 25, propostas: 8, fechamentos: 5, faturamento: 310000 },
    { nome: 'Juliana Costa', leads: 22, propostas: 7, fechamentos: 4, faturamento: 185000 },
  ],
  funil: [
    { etapa: 'Leads', quantidade: 127 },
    { etapa: 'Em Atendimento', quantidade: 68 },
    { etapa: 'Proposta Enviada', quantidade: 48 },
    { etapa: 'Negociação', quantidade: 35 },
    { etapa: 'Fechados', quantidade: 31 },
  ],
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export const statusColors: Record<ClientStatus, string> = {
  novo: 'bg-info text-info-foreground',
  em_atendimento: 'bg-warning text-warning-foreground',
  proposta_enviada: 'bg-primary text-primary-foreground',
  negociacao: 'bg-accent text-accent-foreground',
  fechado: 'bg-success text-success-foreground',
  perdido: 'bg-destructive text-destructive-foreground',
  instalacao: 'bg-chart-2 text-primary-foreground',
  finalizado: 'bg-chart-5 text-primary-foreground',
  arquivado: 'bg-muted text-muted-foreground',
};

export const statusLabels: Record<ClientStatus, string> = {
  novo: 'Novo',
  em_atendimento: 'Em Atendimento',
  proposta_enviada: 'Proposta Enviada',
  negociacao: 'Negociação',
  fechado: 'Fechado',
  perdido: 'Perdido',
  instalacao: 'Instalação',
  finalizado: 'Finalizado',
  arquivado: 'Arquivado',
};

export const proposalStatusLabels: Record<ProposalStatus, string> = {
  rascunho: 'Rascunho',
  enviada: 'Enviada',
  visualizada: 'Visualizada',
  aceita: 'Aceita',
  recusada: 'Recusada',
};

export const proposalStatusColors: Record<ProposalStatus, string> = {
  rascunho: 'bg-muted text-muted-foreground',
  enviada: 'bg-info text-info-foreground',
  visualizada: 'bg-warning text-warning-foreground',
  aceita: 'bg-success text-success-foreground',
  recusada: 'bg-destructive text-destructive-foreground',
};
