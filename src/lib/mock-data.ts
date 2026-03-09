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

export interface Contract {
  id: string;
  proposalId: string;
  clientId: string;
  clientName: string;
  systemType: SystemType;
  potenciaKwp: number;
  valor: number;
  condicaoPagamento: string;
  status: ContractStatus;
  createdAt: string;
  signedAt?: string;
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

export const mockClients: Client[] = [
  {
    id: '1', name: 'Maria Silva Santos', document: '123.456.789-00', phone: '(11) 98765-4321',
    whatsapp: '(11) 98765-4321', email: 'maria@email.com', address: 'Rua das Flores, 123',
    city: 'São Paulo', state: 'SP', projectLocation: 'Rua das Flores, 123 - SP',
    concessionaria: 'ENEL', consumoMedio: 450, clientType: 'residencial', status: 'proposta_enviada',
    vendedor: 'Carlos Oliveira', origem: 'Instagram', tags: ['premium', 'urgente'],
    notes: 'Cliente interessada em sistema com bateria', favorite: true, createdAt: '2024-01-15',
  },
  {
    id: '2', name: 'Tech Solutions Ltda', document: '12.345.678/0001-90', phone: '(21) 3456-7890',
    whatsapp: '(21) 99876-5432', email: 'contato@techsolutions.com.br', address: 'Av. Paulista, 1500',
    city: 'Rio de Janeiro', state: 'RJ', projectLocation: 'Av. Industrial, 500 - RJ',
    concessionaria: 'LIGHT', consumoMedio: 2800, clientType: 'comercial', status: 'negociacao',
    vendedor: 'Ana Paula', origem: 'Indicação', tags: ['comercial', 'grande porte'],
    notes: 'Empresa com 3 unidades, possibilidade de expandir', favorite: true, createdAt: '2024-02-01',
  },
  {
    id: '3', name: 'João Pedro Almeida', document: '987.654.321-00', phone: '(31) 91234-5678',
    whatsapp: '(31) 91234-5678', email: 'joao@email.com', address: 'Rua Minas Gerais, 456',
    city: 'Belo Horizonte', state: 'MG', projectLocation: 'Rua Minas Gerais, 456 - MG',
    concessionaria: 'CEMIG', consumoMedio: 320, clientType: 'residencial', status: 'novo',
    vendedor: 'Carlos Oliveira', origem: 'Google Ads', tags: ['residencial'],
    notes: '', favorite: false, createdAt: '2024-03-10',
  },
  {
    id: '4', name: 'Fazenda Boa Vista', document: '98.765.432/0001-10', phone: '(62) 3333-4444',
    whatsapp: '(62) 98888-7777', email: 'fazenda@boavista.com', address: 'Rod. GO-020, Km 45',
    city: 'Goiânia', state: 'GO', projectLocation: 'Rod. GO-020, Km 45 - GO',
    concessionaria: 'ENEL GO', consumoMedio: 5200, clientType: 'rural', status: 'fechado',
    vendedor: 'Ana Paula', origem: 'Feira Agro', tags: ['rural', 'grande porte', 'fechado'],
    notes: 'Projeto de irrigação solar', favorite: true, createdAt: '2024-01-20',
  },
  {
    id: '5', name: 'Supermercado Economia', document: '11.222.333/0001-44', phone: '(85) 3222-1111',
    whatsapp: '(85) 99111-2222', email: 'compras@economia.com', address: 'Av. Santos Dumont, 789',
    city: 'Fortaleza', state: 'CE', projectLocation: 'Av. Santos Dumont, 789 - CE',
    concessionaria: 'ENEL CE', consumoMedio: 8500, clientType: 'comercial', status: 'em_atendimento',
    vendedor: 'Carlos Oliveira', origem: 'Site', tags: ['comercial', 'premium'],
    notes: 'Quer reduzir 70% da conta', favorite: false, createdAt: '2024-03-01',
  },
  {
    id: '6', name: 'Roberto Mendes', document: '456.789.123-00', phone: '(47) 99777-3333',
    whatsapp: '(47) 99777-3333', email: 'roberto@email.com', address: 'Rua XV de Novembro, 200',
    city: 'Joinville', state: 'SC', projectLocation: 'Rua XV de Novembro, 200 - SC',
    concessionaria: 'CELESC', consumoMedio: 380, clientType: 'residencial', status: 'perdido',
    vendedor: 'Ana Paula', origem: 'WhatsApp', tags: ['residencial'],
    notes: 'Optou por concorrente', favorite: false, createdAt: '2024-02-15',
  },
];

export const mockProposals: Proposal[] = [
  {
    id: 'P001', clientId: '1', clientName: 'Maria Silva Santos', systemType: 'on-grid',
    potenciaKwp: 5.4, valorSistema: 28500, producaoEstimada: 675, economiaMensal: 540,
    economiaAnual: 6480, paybackAnos: 4.4, status: 'enviada', condicaoPagamento: '40% + 40% + 20%',
    desconto: 5, margem: 25, comissao: 3, createdAt: '2024-03-12',
  },
  {
    id: 'P002', clientId: '2', clientName: 'Tech Solutions Ltda', systemType: 'on-grid',
    potenciaKwp: 33.6, valorSistema: 142000, producaoEstimada: 4200, economiaMensal: 3360,
    economiaAnual: 40320, paybackAnos: 3.5, status: 'aceita', condicaoPagamento: 'À vista antecipado',
    desconto: 10, margem: 20, comissao: 2, createdAt: '2024-02-20', viewedAt: '2024-02-21', acceptedAt: '2024-02-25',
  },
  {
    id: 'P003', clientId: '4', clientName: 'Fazenda Boa Vista', systemType: 'hibrido',
    potenciaKwp: 62.4, valorSistema: 385000, producaoEstimada: 7800, economiaMensal: 6240,
    economiaAnual: 74880, paybackAnos: 5.1, status: 'aceita', condicaoPagamento: 'Entrada + parcelamento',
    desconto: 8, margem: 22, comissao: 2.5, createdAt: '2024-01-25', viewedAt: '2024-01-26', acceptedAt: '2024-02-01',
  },
  {
    id: 'P004', clientId: '5', clientName: 'Supermercado Economia', systemType: 'on-grid',
    potenciaKwp: 102, valorSistema: 520000, producaoEstimada: 12750, economiaMensal: 10200,
    economiaAnual: 122400, paybackAnos: 4.2, status: 'rascunho', condicaoPagamento: '',
    desconto: 0, margem: 18, comissao: 3, createdAt: '2024-03-08',
  },
];

export const mockContracts: Contract[] = [
  {
    id: 'C001', proposalId: 'P002', clientId: '2', clientName: 'Tech Solutions Ltda',
    systemType: 'on-grid', potenciaKwp: 33.6, valor: 142000, condicaoPagamento: 'À vista antecipado',
    status: 'assinado', createdAt: '2024-02-26', signedAt: '2024-02-28',
  },
  {
    id: 'C002', proposalId: 'P003', clientId: '4', clientName: 'Fazenda Boa Vista',
    systemType: 'hibrido', potenciaKwp: 62.4, valor: 385000, condicaoPagamento: 'Entrada + parcelamento',
    status: 'assinado', createdAt: '2024-02-02', signedAt: '2024-02-05',
  },
];

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
