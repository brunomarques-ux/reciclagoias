/**
 * Mocks centralizados da landing page.
 *
 * Todos os nomes de empresas/pessoas aqui são fictícios e claramente
 * marcados como exemplos. Números são plausíveis mas não refletem
 * dados reais do sistema de produção.
 */

export type MaterialKey = 'paper' | 'plastic' | 'metal' | 'glass';

export interface DashboardStat {
  key: 'total' | MaterialKey;
  label: string;
  value: number;
  unit: string;
  delta?: { value: number; label: string };
  icon: string;
  tone: 'brand' | MaterialKey;
}

export const baseYear = 2024;

export const dashboardStats: DashboardStat[] = [
  {
    key: 'total',
    label: 'Saldo disponível',
    value: 34970,
    unit: 't',
    delta: { value: 12.4, label: 'vs. 2023' },
    icon: 'mdi-recycle-variant',
    tone: 'brand',
  },
  {
    key: 'paper',
    label: 'Papel',
    value: 14150,
    unit: 't',
    delta: { value: 8.2, label: 'vs. 2023' },
    icon: 'mdi-newspaper-variant-outline',
    tone: 'paper',
  },
  {
    key: 'plastic',
    label: 'Plástico',
    value: 6970,
    unit: 't',
    delta: { value: 18.9, label: 'vs. 2023' },
    icon: 'mdi-bottle-soda-classic-outline',
    tone: 'plastic',
  },
  {
    key: 'metal',
    label: 'Metal',
    value: 12400,
    unit: 't',
    delta: { value: 6.1, label: 'vs. 2023' },
    icon: 'mdi-silverware-fork-knife',
    tone: 'metal',
  },
  {
    key: 'glass',
    label: 'Vidro',
    value: 1500,
    unit: 't',
    delta: { value: -3.4, label: 'vs. 2023' },
    icon: 'mdi-glass-fragile',
    tone: 'glass',
  },
];

// ============================================================================
// Logística Reversa — diagrama circular (S2)
// ============================================================================

export interface CycleStage {
  key: string;
  label: string;
  icon: string;
}

export const reverseLogisticsCycle: CycleStage[] = [
  { key: 'recycle',    label: 'Reciclagem',         icon: 'mdi-recycle' },
  { key: 'industry',   label: 'Indústria',          icon: 'mdi-factory' },
  { key: 'distrib',    label: 'Distribuição',       icon: 'mdi-truck-fast-outline' },
  { key: 'retail',     label: 'Varejo',             icon: 'mdi-storefront-outline' },
  { key: 'consumer',   label: 'Consumidor',         icon: 'mdi-account-group-outline' },
  { key: 'collection', label: 'Coleta e seleção',   icon: 'mdi-trash-can-outline' },
];

// ============================================================================
// Como Funciona — 3 passos do site atual (Cadastre-se / Painel / Planos)
// ============================================================================

export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
  icon: string;
}

export const howItWorksSteps: HowItWorksStep[] = [
  {
    number: '1',
    title: 'Cadastre-se',
    description:
      'Crie sua conta informando os dados da sua empresa ou organização. O processo é simples e rápido.',
    icon: 'mdi-account-plus-outline',
  },
  {
    number: '2',
    title: 'Acesse o painel',
    description:
      'Visualize metas, relatórios e obrigações do seu plano em um painel centralizado.',
    icon: 'mdi-monitor-dashboard',
  },
  {
    number: '3',
    title: 'Gerencie seus planos',
    description:
      'Acompanhe, registre e comprove as ações de logística reversa da sua cadeia produtiva.',
    icon: 'mdi-clipboard-list-outline',
  },
];

// ============================================================================
// Prêmio PMI Goiás 2025
// ============================================================================

export const award = {
  organization: 'PMI Goiás · Project Management Institute',
  eventName: '18º Seminário Em Gestão, Projetos e Liderança',
  date: 'Dezembro de 2025',
  city: 'Goiânia · GO',
  category: 'Melhor Projeto de 2025',
  recipients: [
    'Gerência de Tecnologia · GETI/SIC',
    'Comitê da Logística Reversa · CLR/SIC',
  ],
  quote: '"Feliz aquele que transfere o que sabe e aprende o que ensina."',
  quoteAuthor: 'Cora Coralina',
  summary:
    'O Projeto Recicla Goiás foi reconhecido como Melhor Projeto de 2025 pelo PMI Goiás, durante o 18º Seminário Em Gestão, Projetos e Liderança realizado em Goiânia.',
};

// ============================================================================
// Comitê — 8 secretarias / órgãos parceiros
// ============================================================================

export interface CommitteeMember {
  short: string;
  full: string;
  icon: string;
}

export const committeeMembers: CommitteeMember[] = [
  { short: 'SEMAD',          full: 'Secretaria de Estado de Meio Ambiente e Desenvolvimento Sustentável', icon: 'mdi-leaf' },
  { short: 'SIC',            full: 'Secretaria de Estado de Indústria, Comércio e Serviços',              icon: 'mdi-factory' },
  { short: 'RETOMADA',       full: 'Secretaria de Estado da Retomada',                                    icon: 'mdi-trending-up' },
  { short: 'ECONOMIA',       full: 'Secretaria de Estado da Economia',                                    icon: 'mdi-bank-outline' },
  { short: 'SGG / IMB',      full: 'Secretaria-Geral da Governadoria (Instituto Mauro Borges)',           icon: 'mdi-office-building-outline' },
  { short: 'GOIÁS PARCERIAS',full: 'Companhia de Investimentos e Parcerias do Estado de Goiás',           icon: 'mdi-handshake-outline' },
  { short: 'AGR',            full: 'Agência de Regulação, Controle e Fiscalização de Serviços Públicos', icon: 'mdi-shield-check-outline' },
  { short: 'MPGO',           full: 'Ministério Público do Estado de Goiás',                               icon: 'mdi-gavel' },
];

// ============================================================================
// Diagrama de fluxo da Logística Reversa (S4)
// ============================================================================

export interface FlowNode {
  id: string;
  label: string;
  variant: 'soft' | 'strong' | 'brand-dark';
}

export const flowNodes: FlowNode[] = [
  { id: 'brandOwners',     label: 'Brand Owners',                 variant: 'soft' },
  { id: 'caixaPreta',      label: 'Caixa Preta',                  variant: 'brand-dark' },
  { id: 'entidades',       label: 'Entidades gestoras',           variant: 'soft' },
  { id: 'comite',          label: 'Entidades comitê de LR',       variant: 'soft' },
  { id: 'semad',           label: 'SEMAD',                        variant: 'soft' },
  { id: 'consumidor',      label: 'Consumidor',                   variant: 'soft' },
  { id: 'operadores',      label: 'Operadores da reciclagem',     variant: 'soft' },
  { id: 'industria',       label: 'Indústria recicladora',        variant: 'soft' },
  { id: 'verificador',     label: 'Verificador de resultados',    variant: 'strong' },
];

// ============================================================================
// Sistema Recicla Goiás (S5) — 4 funcionalidades + texto descritivo
// ============================================================================

export interface SystemFeature {
  title: string;
  description: string;
  icon: string;
}

export const systemFeatures: SystemFeature[] = [
  {
    title: 'Cadastro de participantes',
    description:
      'Registro de cooperativas, fabricantes, importadores, distribuidores e comerciantes.',
    icon: 'mdi-account-multiple-outline',
  },
  {
    title: 'Metas e relatórios',
    description:
      'Acompanhamento de metas e relatórios dos planos de logística reversa.',
    icon: 'mdi-chart-bar',
  },
  {
    title: 'Validação de dados',
    description:
      'Armazenamento e validação de dados cadastrais e comprovações.',
    icon: 'mdi-database-check-outline',
  },
  {
    title: 'Fiscalização',
    description:
      'Criação, acompanhamento e fiscalização dos Planos de Logística Reversa.',
    icon: 'mdi-magnify-scan',
  },
];

export const systemDescription = [
  'O Sistema Recicla Goiás foi desenvolvido pela Secretaria de Estado de Indústria, Comércio e Serviços (SIC) com o objetivo de incentivar, facilitar e fortalecer a atuação dos entes envolvidos no estado de Goiás na promoção de boas práticas voltadas ao tratamento de resíduos.',
  'A solução apoia a criação, o acompanhamento e a fiscalização dos Planos de Logística Reversa, contribuindo para a conformidade ambiental e a gestão sustentável.',
  'A plataforma possibilita o cadastro de cooperativas/catadores, fabricantes, importadores, distribuidores, comerciantes e demais participantes da cadeia, promovendo a integração entre os atores envolvidos.',
];

export const systemStatusNote =
  'Atualmente em produção, o sistema passa por evolução contínua, com melhorias e ampliação de funcionalidades.';

// ============================================================================
// Disclaimer sazonal — Autodeclaração de Não Enquadramento
// ============================================================================

export const autoDeclaration = {
  title: 'Formulário de Autodeclaração de Não Enquadramento',
  description:
    'Empresas convocadas pela Notificação Nº 1/2026 podem apresentar justificativa de não enquadramento.',
  ctaLabel: 'Acessar formulário',
  ctaHref: '#autodeclaracao',
  badge: 'Aviso sazonal · prazo aberto',
};

// ============================================================================
// FAQ
// ============================================================================

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: 'Qual é o primeiro ano-base de comprovação?',
    answer:
      'O primeiro ano-base contemplado pelo Recicla Goiás é 2024, com as declarações abertas no início do exercício e prazos definidos pelo comitê gestor.',
  },
  {
    question: 'Como envio o relatório anual de logística reversa?',
    answer:
      'Todo o envio ocorre dentro da plataforma. Os operadores logísticos preenchem as notas fiscais, anexam os certificados de destinação e o sistema gera o relatório consolidado.',
  },
  {
    question: 'Preciso apresentar nota fiscal de toda a cadeia?',
    answer:
      'É necessária a nota fiscal que comprova a entrega do material à indústria de transformação. As demais movimentações ficam registradas no extrato de massa.',
  },
  {
    question: 'Como solicito acesso de verificador de resultados?',
    answer:
      'O acesso é concedido pelo administrador do comitê. A solicitação pode ser feita pelo canal oficial da Secretaria de Indústria e Comércio.',
  },
  {
    question: 'O que acontece quando uma empresa é bloqueada?',
    answer:
      'A empresa mantém acesso ao histórico para fins de auditoria, mas perde a possibilidade de operações transacionais — emissão de certificados, criação de planos e compras.',
  },
  {
    question: 'Os dados ficam visíveis para outras empresas?',
    answer:
      'Cada empresa enxerga apenas seus próprios dados. A administração e os verificadores acessam visões agregadas conforme o perfil e a regra de governança vigente.',
  },
];

// ============================================================================
// Parceiros institucionais (footer)
// ============================================================================

export interface Partner {
  short: string;
  full: string;
}

export const institutionalPartners: Partner[] = [
  { short: 'SIC',      full: 'Secretaria de Indústria e Comércio' },
  { short: 'SEMAD',    full: 'Secretaria de Meio Ambiente e Desenvolvimento Sustentável' },
  { short: 'RETOMADA', full: 'Secretaria da Retomada' },
  { short: 'ECONOMIA', full: 'Secretaria da Economia' },
  { short: 'SGG',      full: 'Secretaria Geral do Governo' },
  { short: 'AGR',      full: 'Agência Goiana de Regulação, Controle e Fiscalização' },
];

// ============================================================================
// Mantidos para compatibilidade (até remoção dos componentes antigos)
// ============================================================================

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon: string;
}

export const processSteps: ProcessStep[] = howItWorksSteps;

export interface Benefit {
  title: string;
  description: string;
  icon: string;
}
export const benefits: Benefit[] = [];

export interface UserProfile {
  slug: string;
  title: string;
  summary: string;
  bullets: string[];
  icon: string;
}
export const userProfiles: UserProfile[] = [];

export interface StatusExample {
  identifier: string;
  operator: string;
  material: MaterialKey;
  massT: number;
  status: 'aprovado' | 'enviado' | 'ajuste';
}
export const recentDeclarations: StatusExample[] = [];

export const materialLabels: Record<MaterialKey, string> = {
  paper: 'Papel',
  plastic: 'Plástico',
  metal: 'Metal',
  glass: 'Vidro',
};

export const statusLabels: Record<StatusExample['status'], string> = {
  aprovado: 'Aprovado',
  enviado: 'Enviado',
  ajuste: 'Em ajuste',
};
