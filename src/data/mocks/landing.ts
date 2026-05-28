/**
 * Mocks centralizados da landing page Recicla Goiás.
 *
 * Todos os nomes de empresas/pessoas aqui são fictícios e claramente
 * marcados como exemplos. Números são plausíveis mas não refletem
 * dados reais do sistema de produção.
 *
 * Cada bloco abaixo é consumido por exatamente uma seção da landing —
 * mantemos só o que está em uso pra evitar mocks órfãos.
 */

// ============================================================================
// "O que é Logística Reversa" — 3 cards com foto + descrição
// Consumido por: LandingWhatIsLR.vue
// ============================================================================

export interface WhatIsCard {
  imageJpg: string;
  imageWebp: string;
  alt: string;
  title: string;
  description: string;
}

export const whatIsCards: WhatIsCard[] = [
  {
    imageJpg: '/whatis/card1.jpg',
    imageWebp: '/whatis/card1.webp',
    alt: 'Operador separando materiais em galpão de reciclagem',
    title: 'Sustentabilidade em toda a cadeia',
    description:
      'Do consumo ao reaproveitamento, a logística reversa conecta etapas, agentes e processos mais responsáveis.',
  },
  {
    imageJpg: '/whatis/card2.jpg',
    imageWebp: '/whatis/card2.webp',
    alt: 'Equipe selecionando materiais recicláveis em cooperativa',
    title: 'Menos desperdício, mais controle',
    description:
      'A separação correta e a destinação adequada reduzem perdas e diminuem o impacto ambiental dos resíduos.',
  },
  {
    imageJpg: '/whatis/card3.jpg',
    imageWebp: '/whatis/card3.webp',
    alt: 'Verificador analisando fardos prensados em centro de reciclagem',
    title: 'Valor que retorna ao ciclo',
    description:
      'Materiais reaproveitados voltam a gerar valor, fortalecendo a reciclagem e a economia circular em Goiás.',
  },
];

// ============================================================================
// "Como Funciona" — 3 passos do site atual (Cadastre-se / Painel / Planos)
// Consumido por: LandingHowItWorks.vue
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
      'Crie sua conta e informe os dados da sua empresa ou organização.',
    icon: 'mdi-account-plus',
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
      'Acompanhe comprovações, pendências e ações de logística reversa.',
    icon: 'mdi-clipboard-check-outline',
  },
];

// ============================================================================
// Prêmio PMI Goiás 2025
// Consumido por: LandingPremio.vue (texto inline; este export documenta o
// contexto institucional pra futura ampliação da seção)
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
// Comitê Gestor — 8 secretarias / órgãos parceiros do Estado de Goiás
// Consumido por: LandingComite.vue
// ============================================================================

export interface CommitteeMember {
  short: string;
  full: string;
  icon: string;
  url?: string;
}

export const committeeMembers: CommitteeMember[] = [
  { short: 'SEMAD',          full: 'Secretaria de Estado de Meio Ambiente e Desenvolvimento Sustentável', icon: 'mdi-leaf',                    url: 'https://www.meioambiente.go.gov.br/' },
  { short: 'SIC',            full: 'Secretaria de Estado de Indústria, Comércio e Serviços',              icon: 'mdi-factory',                 url: 'https://www.sic.go.gov.br/' },
  { short: 'RETOMADA',       full: 'Secretaria de Estado da Retomada',                                    icon: 'mdi-trending-up',             url: 'https://www.retomada.go.gov.br/' },
  { short: 'ECONOMIA',       full: 'Secretaria de Estado da Economia',                                    icon: 'mdi-bank-outline',            url: 'https://www.economia.go.gov.br/' },
  { short: 'SGG / IMB',      full: 'Secretaria-Geral da Governadoria · Instituto Mauro Borges',           icon: 'mdi-office-building-outline', url: 'https://www.imb.go.gov.br/' },
  { short: 'GOIÁS PARCERIAS',full: 'Companhia de Investimentos e Parcerias do Estado de Goiás',           icon: 'mdi-handshake-outline',       url: 'https://www.goiasparcerias.go.gov.br/' },
  { short: 'AGR',            full: 'Agência de Regulação, Controle e Fiscalização de Serviços Públicos', icon: 'mdi-shield-check-outline',    url: 'https://www.agr.go.gov.br/' },
  { short: 'MPGO',           full: 'Ministério Público do Estado de Goiás',                               icon: 'mdi-gavel',                   url: 'https://www.mpgo.mp.br/' },
];

// ============================================================================
// Sistema Recicla Goiás — 4 funcionalidades (scrolling showcase)
// Consumido por: LandingSistema.vue
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

/** Parágrafos descritivos usados no header da seção Sistema. */
export const systemDescription = [
  'O Sistema Recicla Goiás foi desenvolvido pela Secretaria de Estado de Indústria, Comércio e Serviços (SIC) com o objetivo de incentivar, facilitar e fortalecer a atuação dos entes envolvidos no estado de Goiás na promoção de boas práticas voltadas ao tratamento de resíduos.',
  'A solução apoia a criação, o acompanhamento e a fiscalização dos Planos de Logística Reversa, contribuindo para a conformidade ambiental e a gestão sustentável.',
  'A plataforma possibilita o cadastro de cooperativas/catadores, fabricantes, importadores, distribuidores, comerciantes e demais participantes da cadeia, promovendo a integração entre os atores envolvidos.',
];

// ============================================================================
// Disclaimer sazonal — Autodeclaração de Não Enquadramento
// Consumido por: LandingDisclaimer.vue
// ============================================================================

export const autoDeclaration = {
  title: 'Formulário de Autodeclaração de Não Enquadramento',
  description:
    'Empresas convocadas pela Notificação Nº 1/2026 podem apresentar justificativa de não enquadramento.',
  ctaLabel: 'Acessar formulário',
  ctaHref: '#autodeclaracao',
  badge: 'Prazo aberto',
};

// ============================================================================
// Perguntas Frequentes — 6 perguntas comuns sobre o sistema
// Consumido por: LandingFaq.vue
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
// Consumido por: LandingFooter.vue
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
