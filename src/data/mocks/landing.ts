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

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon: string;
}

export const processSteps: ProcessStep[] = [
  {
    number: '01',
    title: 'Ano-base definido',
    description:
      'O comitê estabelece o ano-base e o prazo da campanha de logística reversa em Goiás.',
    icon: 'mdi-calendar-check-outline',
  },
  {
    number: '02',
    title: 'Declaração da empresa',
    description:
      'Operadores e entidades cadastram notas fiscais e declaram os volumes recicláveis no período.',
    icon: 'mdi-file-document-edit-outline',
  },
  {
    number: '03',
    title: 'Comprovação documental',
    description:
      'Certificados de destinação final são anexados às notas fiscais para evidenciar a operação.',
    icon: 'mdi-clipboard-check-outline',
  },
  {
    number: '04',
    title: 'Análise pelo verificador',
    description:
      'Verificadores de resultado conferem consistência, aprovam ou devolvem para ajuste.',
    icon: 'mdi-magnify-scan',
  },
  {
    number: '05',
    title: 'Status acompanhado',
    description:
      'Empresas acompanham em tempo real o andamento de cada certificado e o saldo de massa.',
    icon: 'mdi-progress-clock',
  },
  {
    number: '06',
    title: 'Regularidade emitida',
    description:
      'Ao final do ciclo, a regularidade fica disponível com rastreabilidade auditável ponta a ponta.',
    icon: 'mdi-shield-check-outline',
  },
];

export interface Benefit {
  title: string;
  description: string;
  icon: string;
}

export const benefits: Benefit[] = [
  {
    title: 'Informação centralizada',
    description:
      'Todas as declarações, notas e certificados em um único lugar — sem planilhas paralelas.',
    icon: 'mdi-database-outline',
  },
  {
    title: 'Processo rastreável',
    description:
      'Histórico de cada movimentação preservado, do cadastro à aprovação final.',
    icon: 'mdi-timeline-text-outline',
  },
  {
    title: 'Menos trabalho manual',
    description:
      'Validações automáticas reduzem retrabalho e liberam tempo para análise estratégica.',
    icon: 'mdi-flash-outline',
  },
  {
    title: 'Mais transparência',
    description:
      'Empresas, verificadores e administração compartilham a mesma visão do estado da obrigação.',
    icon: 'mdi-eye-outline',
  },
  {
    title: 'Apoio à auditoria',
    description:
      'Trilhas completas facilitam fiscalização e prestação de contas a órgãos de controle.',
    icon: 'mdi-shield-search',
  },
  {
    title: 'Decisão orientada a dados',
    description:
      'Indicadores agregados sobre volumes, materiais e cumprimento por entidade gestora.',
    icon: 'mdi-chart-line',
  },
];

export interface UserProfile {
  slug: string;
  title: string;
  summary: string;
  bullets: string[];
  icon: string;
}

export const userProfiles: UserProfile[] = [
  {
    slug: 'operador',
    title: 'Operador Logístico',
    summary:
      'Empresas que recebem resíduos, reciclam e geram massa reciclável certificável.',
    bullets: [
      'Cadastrar notas fiscais',
      'Emitir certificados de massa',
      'Consultar saldo e extratos',
    ],
    icon: 'mdi-truck-outline',
  },
  {
    slug: 'entidade',
    title: 'Entidade Gestora',
    summary:
      'Organizações responsáveis pela gestão e validação da logística reversa.',
    bullets: [
      'Criar planos e relatórios',
      'Receber e validar certificados',
      'Acompanhar operadores com massa disponível',
    ],
    icon: 'mdi-domain',
  },
  {
    slug: 'verificador',
    title: 'Verificador de Resultados',
    summary:
      'Profissionais que validam operações e analisam inconsistências.',
    bullets: [
      'Consultar registros',
      'Aprovar ou devolver certificados',
      'Acompanhar históricos auditáveis',
    ],
    icon: 'mdi-check-decagram-outline',
  },
  {
    slug: 'admin',
    title: 'Admin · Comitê',
    summary:
      'Administração do sistema e visão agregada para o comitê gestor.',
    bullets: [
      'Gerenciar usuários e empresas',
      'Acompanhar métricas gerais',
      'Bloquear ou liberar empresas',
    ],
    icon: 'mdi-shield-account-outline',
  },
];

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

export interface Partner {
  short: string;
  full: string;
}

export const institutionalPartners: Partner[] = [
  { short: 'SIC', full: 'Secretaria de Indústria e Comércio' },
  { short: 'SEMAD', full: 'Secretaria de Meio Ambiente e Desenvolvimento Sustentável' },
  { short: 'RETOMADA', full: 'Secretaria da Retomada' },
  { short: 'ECONOMIA', full: 'Secretaria da Economia' },
  { short: 'SGG', full: 'Secretaria Geral do Governo' },
  { short: 'AGR', full: 'Agência Goiana de Regulação, Controle e Fiscalização' },
];

export interface StatusExample {
  identifier: string;
  operator: string;
  material: MaterialKey;
  massT: number;
  status: 'aprovado' | 'enviado' | 'ajuste';
}

export const recentDeclarations: StatusExample[] = [
  {
    identifier: 'CM-2024-000.000.000-1',
    operator: 'EcoDescarte Demonstrativo',
    material: 'paper',
    massT: 1350,
    status: 'aprovado',
  },
  {
    identifier: 'CM-2024-000.000.000-2',
    operator: 'EcoDescarte Demonstrativo',
    material: 'plastic',
    massT: 2500,
    status: 'enviado',
  },
  {
    identifier: 'CM-2024-000.000.000-3',
    operator: 'Verde Limpo Exemplo S.A.',
    material: 'paper',
    massT: 780,
    status: 'ajuste',
  },
  {
    identifier: 'CM-2024-000.000.000-4',
    operator: 'Sustenta Brasil Exemplo',
    material: 'metal',
    massT: 7000,
    status: 'aprovado',
  },
];

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
