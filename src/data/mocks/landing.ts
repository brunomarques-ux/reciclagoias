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
// "Perfis do sistema" — os 4 perfis previstos no Decreto estadual 10.255/2023
// + o ciclo de operação que os conecta (storytelling de ecossistema).
// Conteúdo derivado dos arts. 2º, 3º, 9º, 11 e 14 do decreto.
// Consumido por: LandingPerfis.vue
// ============================================================================

export type ProfileSlug = 'empresa' | 'gestora' | 'operador' | 'verificador';

/** Badge de destaque do painel — todos os perfis têm um (padrão aprovado no
 *  Figma: texto à esquerda + quadrado tonal 44px com ícone à direita).
 *  tone 'amber' = restrição/prazo legal; 'green' = integridade de processo. */
export interface ProfileBadge {
  text: string;
  icon: string;
  tone: 'amber' | 'green';
}

export interface SystemProfile {
  slug: ProfileSlug;
  name: string;
  /** Label curto usado nas tabs do seletor e nos nós do ciclo. */
  shortLabel: string;
  /** Ícone mdi-* (fallback). Quando o asset 3D existir, usar iconImage. */
  icon: string;
  /** PNG 3D no estilo dos assets do site (trophy, balloons) — opcional. */
  iconImage?: string;
  /** 1 linha exibida na tab, abaixo do nome. */
  tagline: string;
  /** Parágrafo de abertura do painel de detalhe. */
  description: string;
  /** 3–5 atribuições, derivadas do decreto. */
  responsibilities: string[];
  /** Destaque legal/processual do perfil. */
  badge: ProfileBadge;
}

export const systemProfiles: SystemProfile[] = [
  {
    slug: 'empresa',
    name: 'Empresa aderente',
    shortLabel: 'Empresa',
    icon: 'mdi-domain',
    tagline: 'Quem tem a obrigação legal',
    description:
      'Fabricantes, importadores, distribuidores e comerciantes de produtos que geram embalagens pós-consumo em Goiás, incluindo detentores de marca e quem envasa, monta ou manufatura em nome deles. Com ou sem sede no estado, a obrigação é a mesma: garantir que uma massa equivalente de embalagens retorne ao ciclo produtivo.',
    responsibilities: [
      'Aderir a um sistema coletivo de logística reversa, ou estruturar um sistema individual próprio',
      'Declarar a quantidade de embalagens colocadas no mercado estadual a cada ano',
      'Comprovar as metas de recuperação por meio dos certificados RECICLAGOIÁS',
      'Orientar consumidores e apoiar pontos de entrega voluntária',
    ],
    badge: {
      text: 'Empresas que optam pelo modelo individual cumprem os mesmos requisitos das entidades gestoras do modelo coletivo (art. 14).',
      icon: 'mdi-scale-balance',
      tone: 'amber',
    },
  },
  {
    slug: 'gestora',
    name: 'Entidade gestora',
    shortLabel: 'Gestora',
    icon: 'mdi-office-building-cog-outline',
    tagline: 'Quem orquestra o sistema coletivo',
    description:
      'Pessoa jurídica que estrutura, implementa e operacionaliza o sistema de logística reversa em modelo coletivo, representa um grupo de empresas aderentes perante o Estado e cuida de todo o ciclo de comprovação por elas. É a porta de entrada do modelo coletivo: organiza operadores, contratos e prazos num único fluxo.',
    responsibilities: [
      'Protocolar o sistema na SEMAD, com metas progressivas por grupo de embalagem',
      'Qualificar e reunir empresas aderentes e operadores',
      'Contratar o verificador de resultados independente',
      'Emitir o certificado RECICLAGOIÁS a partir das notas fiscais homologadas',
      'Entregar o relatório anual de desempenho até 31 de março',
    ],
    badge: {
      text: 'Sistemas coletivos devem ser protocolados na SEMAD com antecedência mínima de 180 dias da entrega do relatório anual (art. 4º).',
      icon: 'mdi-calendar-clock',
      tone: 'amber',
    },
  },
  {
    slug: 'operador',
    name: 'Operador logístico',
    shortLabel: 'Operador',
    icon: 'mdi-truck-outline',
    tagline: 'Quem devolve o material ao ciclo',
    description:
      'Cooperativas e associações de catadores, agentes de reciclagem, serviços públicos de limpeza urbana, consórcios, empresas, MEIs e organizações da sociedade civil que restituem embalagens recicláveis ao setor produtivo. São quem dá materialidade à logística reversa: cada venda de material gera a nota fiscal que alimenta o sistema.',
    responsibilities: [
      'Coletar, triar e destinar embalagens pós-consumo ao reaproveitamento',
      'Emitir as notas fiscais eletrônicas que comprovam a venda do material reciclável',
      'Garantir a rastreabilidade até o destinador final (CDF emitido via MTR do Sinir)',
      'Manter as responsabilidades em dia perante os órgãos ambientais',
    ],
    badge: {
      text: 'Cada nota fiscal emitida precisa de rastreabilidade comprovada até o destinador final, CDF emitido via MTR do Sinir (art. 5º).',
      icon: 'mdi-truck-check-outline',
      tone: 'green',
    },
  },
  {
    slug: 'verificador',
    name: 'Verificador de resultados',
    shortLabel: 'Verificador',
    icon: 'mdi-check-decagram-outline',
    tagline: 'Quem audita e dá fé aos números',
    description:
      'Pessoa jurídica independente, contratada pela entidade gestora e homologada pelo Ministério do Meio Ambiente e Mudança do Clima, responsável pela credibilidade de todo o sistema. Atua como camada de auditoria entre operadores, gestoras e o poder público, garantindo que cada tonelada declarada tenha existência real e única.',
    responsibilities: [
      'Homologar as notas fiscais eletrônicas emitidas pelos operadores',
      'Validar as notas eletronicamente junto à Receita Federal',
      'Garantir unicidade e evitar a dupla contagem da massa reciclada',
      'Custodiar os arquivos digitais das notas por no mínimo 5 anos',
    ],
    badge: {
      text: 'É vedado ao verificador comercializar resultados ou emitir, comprar e vender certificados de crédito de reciclagem (art. 9º, § 1º).',
      icon: 'mdi-scale-balance',
      tone: 'amber',
    },
  },
];

/** Passo do ciclo de operação — `profile` indica qual nó acende. */
export interface ProfileCycleStep {
  profile: ProfileSlug;
  label: string;
}

export const profileCycle: ProfileCycleStep[] = [
  { profile: 'empresa',     label: 'A empresa adere ao sistema' },
  { profile: 'gestora',     label: 'A gestora protocola as metas na SEMAD' },
  { profile: 'operador',    label: 'O operador recicla e emite a NF-e' },
  { profile: 'verificador', label: 'O verificador homologa as notas' },
  { profile: 'gestora',     label: 'A gestora emite o RECICLAGOIÁS' },
  { profile: 'empresa',     label: 'A empresa comprova suas metas' },
];

// ============================================================================
// "Sua empresa precisa aderir?" — quiz de enquadramento + sanções + exceções
// Base legal: arts. 3º, 17 e 26 do Decreto estadual 10.255/2023.
// Consumido por: LandingEnquadramento.vue
// ============================================================================

export type EligibilityResultKey = 'enquadra' | 'nao-enquadra' | 'ja-atende';

export interface EligibilityQuestion {
  id: string;
  text: string;
  /** Linha de apoio menor, exibida abaixo da pergunta. */
  helper?: string;
  /**
   * Early-exit: se a resposta bater com `answer`, o quiz encerra com esse
   * resultado. Sem match, avança pra próxima pergunta; na última, o
   * fall-through resolve pra 'enquadra'.
   */
  exitOn?: { answer: boolean; result: EligibilityResultKey };
}

export const eligibilityQuestions: EligibilityQuestion[] = [
  {
    id: 'atividade',
    text: 'Sua empresa fabrica, importa, distribui ou comercializa produtos com embalagens?',
    helper: 'Vidro, papel, papelão, plástico, metal ou materiais multicamadas.',
    exitOn: { answer: false, result: 'nao-enquadra' },
  },
  {
    id: 'goias',
    text: 'Esses produtos são vendidos ou circulam no estado de Goiás?',
    helper: 'A obrigação vale inclusive para empresas sem sede em Goiás.',
    exitOn: { answer: false, result: 'nao-enquadra' },
  },
  {
    id: 'sistema',
    text: 'Sua empresa já participa de um sistema de logística reversa registrado na SEMAD?',
    helper: 'Coletivo, por meio de entidade gestora, ou individual.',
    exitOn: { answer: true, result: 'ja-atende' },
  },
];

export interface EligibilityResult {
  key: EligibilityResultKey;
  tone: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  /** Exibe o alerta de sanções junto do resultado. */
  showSanctions: boolean;
}

export const eligibilityResults: Record<EligibilityResultKey, EligibilityResult> = {
  'enquadra': {
    key: 'enquadra',
    tone: 'warning',
    title: 'Sua empresa provavelmente se enquadra',
    description:
      'Pelo Decreto 10.255/2023, quem fabrica, importa, distribui ou comercializa produtos com embalagens em Goiás é obrigado a estruturar ou aderir a um sistema de logística reversa. A boa notícia: começar é simples.',
    ctaLabel: 'Ver como começar',
    ctaHref: '#como-funciona',
    showSanctions: true,
  },
  'nao-enquadra': {
    key: 'nao-enquadra',
    tone: 'success',
    title: 'Sua empresa provavelmente não se enquadra',
    description:
      'Pelo que você indicou, a obrigação não se aplica à sua operação. Se a empresa foi notificada, formalize a situação com a autodeclaração de não enquadramento.',
    ctaLabel: 'Acessar autodeclaração',
    ctaHref: '#autodeclaracao',
    showSanctions: false,
  },
  'ja-atende': {
    key: 'ja-atende',
    tone: 'info',
    title: 'Você já está no caminho certo',
    description:
      'Mantenha as comprovações em dia: notas homologadas, certificados RECICLAGOIÁS e o relatório anual entregue até 31 de março, tudo dentro do sistema.',
    ctaLabel: 'Acessar o sistema',
    ctaHref: '#acessar',
    showSanctions: false,
  },
};

export const eligibilitySanctions = {
  title: 'Ficar de fora tem consequências',
  text:
    'O descumprimento sujeita a empresa às penalidades da Lei de Crimes Ambientais e do decreto que a regulamenta. Produtos vindos de outros estados sem vínculo com um sistema registrado na SEMAD também configuram infração ambiental.',
  legalRefs: [
    'Lei federal nº 9.605/1998',
    'Decreto federal nº 6.514/2008',
    'Decreto estadual nº 10.255/2023 · art. 17',
  ],
};

export const eligibilityExceptions = {
  title: 'Exceções previstas no decreto',
  intro:
    'Não entram no Recicla Goiás as embalagens já cobertas por sistemas próprios de logística reversa:',
  items: [
    'Embalagens de agrotóxicos e seus resíduos',
    'Óleos lubrificantes, seus resíduos e embalagens',
    'Produtos regulamentados pelo Decreto federal nº 10.388/2020',
  ],
  legalRef: 'Decreto estadual nº 10.255/2023 · art. 26',
};

// ============================================================================
// "Como Funciona" — 3 passos genéricos multi-perfil
// Escolha do perfil → cadastro e ativação → acesso ao sistema. Tom propositalmente
// generalista pra contemplar todos os perfis (empresa, entidade gestora,
// verificador de resultados, operador logístico) — não foca só na entidade gestora.
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
    title: 'Escolha seu perfil',
    description:
      'Identifique e escolha o perfil que melhor representa a sua atuação no sistema.',
    icon: 'mdi-account-search-outline',
  },
  {
    number: '2',
    title: 'Cadastre e ative',
    description:
      'Faça o cadastro com os dados corretos e ative o perfil escolhido.',
    icon: 'mdi-account-plus-outline',
  },
  {
    number: '3',
    title: 'Acesse o sistema',
    description:
      'Use o painel e as funcionalidades do seu perfil para acompanhar as suas obrigações.',
    icon: 'mdi-monitor-dashboard',
  },
];

// ============================================================================
// Premiações — estrutura modular pra N prêmios.
// Nível 1 = listagem de cards; nível 2 = detalhe in-place.
// Consumido por: LandingPremio.vue (+ LandingPremioCard / LandingPremioDetail)
// ============================================================================

export interface AwardHighlight {
  /** Path de PNG (padrão dos ícones 3D atuais em /premio). */
  icon: string;
  title: string;
  sub: string;
}

export interface AwardMeta {
  label: string;
  value: string;
}

export interface Award {
  slug: string;
  /** Nome do reconhecimento — título do card e do detalhe. */
  name: string;
  organization: string;
  eventName?: string;
  date: string;
  city: string;
  /** Colocação/categoria curta — vira o chip do card. */
  placement: string;
  /** Texto da fita dourada sobre a imagem. */
  ribbonLabel: string;
  imageSrc: string;
  imageWebp?: string;
  imageAlt: string;
  /** Resumo curto exibido no card da listagem. */
  summary: string;
  detailTitle: string;
  detailParagraphs: string[];
  meta: AwardMeta[];
  /** Fileira de destaques no topo do detalhe — opcional. */
  highlights?: AwardHighlight[];
  externalLink?: { label: string; href: string };
}

export const awards: Award[] = [
  {
    slug: 'pmi-goias-2025',
    name: 'Melhor Projeto de 2025',
    organization: 'PMI Goiás · Project Management Institute',
    eventName: '18º Seminário Em Gestão, Projetos e Liderança',
    date: 'Dezembro de 2025',
    city: 'Goiânia · GO',
    placement: 'Melhor Projeto',
    ribbonLabel: 'MELHOR PROJETO 2025',
    imageSrc: '/premio/pmi-goias-logo.png',
    imageAlt: 'Logo PMI Goiás · Project Management Institute Goiás, Brazil',
    summary:
      'Reconhecido como Melhor Projeto pelo PMI Goiás durante o 18º Seminário Em Gestão, Projetos e Liderança.',
    detailTitle: 'Sobre o reconhecimento',
    detailParagraphs: [
      'O Project Management Institute · PMI Goiás é o capítulo regional do PMI no estado, dedicado a promover a excelência em gerenciamento de projetos no setor público e privado. A categoria Melhor Projeto reconhece iniciativas com impacto público mensurável, governança sólida e resultados entregues dentro do escopo, prazo e custo definidos.',
      'O Projeto Recicla Goiás foi laureado durante o 18º Seminário Em Gestão, Projetos e Liderança, em Goiânia.',
    ],
    meta: [
      { label: 'Categoria', value: 'Projeto' },
      { label: 'Edição', value: '2025 · 18º Seminário' },
      { label: 'Cidade', value: 'Goiânia, GO' },
      { label: 'Outorga', value: 'GETI/SIC + CLR/SIC' },
    ],
    highlights: [
      {
        icon: '/premio/medal-icon.png',
        title: 'Melhor Projeto do ano',
        sub: 'Reconhecimento PMI Goiás 2025',
      },
      {
        icon: '/premio/people-icon.png',
        title: 'Time multidisciplinar',
        sub: 'GETI/SIC + CLR/SIC',
      },
      {
        icon: '/premio/calendar-icon.png',
        title: '18º Seminário',
        sub: 'Em Gestão, Projetos e Liderança',
      },
    ],
    externalLink: { label: 'Conhecer o PMI Goiás', href: 'https://pmigo.org.br/' },
  },
  {
    slug: 'goias-sustentavel-2026',
    name: 'Prêmio Goiás Sustentável',
    organization: 'Estado de Goiás · SEMAD',
    date: 'Junho de 2026',
    city: 'Goiânia · GO',
    placement: '3º lugar',
    ribbonLabel: '3º LUGAR · 2026',
    imageSrc: '/premio/premio-goias-certificado.jpg',
    imageWebp: '/premio/premio-goias-certificado.webp',
    imageAlt: 'Certificado do Prêmio Goiás Sustentável concedido ao Recicla Goiás',
    summary:
      '3º lugar no Prêmio Goiás Sustentável, concedido pela Secretaria de Meio Ambiente e Desenvolvimento Sustentável.',
    detailTitle: 'Sobre a premiação',
    detailParagraphs: [
      'O Prêmio Goiás Sustentável é uma iniciativa do Estado de Goiás, conduzida pela Secretaria de Meio Ambiente e Desenvolvimento Sustentável (SEMAD), que reconhece projetos e práticas com impacto real na agenda ambiental do estado.',
      'Em 10 de junho de 2026, o Recicla Goiás conquistou o 3º lugar da premiação, consolidando o sistema como referência em logística reversa e economia circular no setor público.',
    ],
    meta: [
      { label: 'Colocação', value: '3º lugar' },
      { label: 'Edição', value: '2026' },
      { label: 'Cidade', value: 'Goiânia, GO' },
      { label: 'Outorga', value: 'SEMAD · Governo de Goiás' },
    ],
    externalLink: {
      label: 'Conhecer a SEMAD',
      href: 'https://www.meioambiente.go.gov.br/',
    },
  },
];

// ============================================================================
// Comitê Gestor — 8 secretarias / órgãos parceiros do Estado de Goiás
// Consumido por: LandingComite.vue
// ============================================================================

export interface CommitteeMember {
  short: string;
  full: string;
  url?: string;
}

export const committeeMembers: CommitteeMember[] = [
  { short: 'SEMAD',          full: 'Secretaria de Estado de Meio Ambiente e Desenvolvimento Sustentável', url: 'https://www.meioambiente.go.gov.br/' },
  { short: 'SIC',            full: 'Secretaria de Estado de Indústria, Comércio e Serviços',              url: 'https://www.sic.go.gov.br/' },
  { short: 'RETOMADA',       full: 'Secretaria de Estado da Retomada',                                    url: 'https://www.retomada.go.gov.br/' },
  { short: 'ECONOMIA',       full: 'Secretaria de Estado da Economia',                                    url: 'https://www.economia.go.gov.br/' },
  { short: 'SGG / IMB',      full: 'Secretaria-Geral da Governadoria · Instituto Mauro Borges',           url: 'https://www.imb.go.gov.br/' },
  { short: 'GOIÁS PARCERIAS',full: 'Companhia de Investimentos e Parcerias do Estado de Goiás',           url: 'https://www.goiasparcerias.go.gov.br/' },
  { short: 'AGR',            full: 'Agência de Regulação, Controle e Fiscalização de Serviços Públicos', url: 'https://www.agr.go.gov.br/' },
  { short: 'MPGO',           full: 'Ministério Público do Estado de Goiás',                               url: 'https://www.mpgo.mp.br/' },
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
// Perguntas Frequentes — ~20 perguntas sobre o sistema e o Decreto 10.255/2023.
// `id` é o slug estável usado como chave do v-for, do estado aberto do
// acordeão e do aria-controls (índices mudam quando a busca filtra a lista).
// Títulos têm tamanhos propositalmente variados (curtos, médios e extensos)
// pra estressar a flexibilidade do componente.
// Consumido por: LandingFaq.vue
// ============================================================================

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    id: 'ano-base',
    question: 'Qual é o primeiro ano-base de comprovação?',
    answer:
      'O primeiro ano-base contemplado pelo Recicla Goiás é 2024, com as declarações abertas no início do exercício e prazos definidos pelo comitê gestor.',
  },
  {
    id: 'relatorio-envio',
    question: 'Como envio o relatório anual de logística reversa?',
    answer:
      'Todo o envio ocorre dentro da plataforma. Os operadores logísticos preenchem as notas fiscais, anexam os certificados de destinação e o sistema gera o relatório consolidado.',
  },
  {
    id: 'nota-fiscal-cadeia',
    question: 'Preciso apresentar nota fiscal de toda a cadeia?',
    answer:
      'É necessária a nota fiscal que comprova a entrega do material à indústria de transformação. As demais movimentações ficam registradas no extrato de massa.',
  },
  {
    id: 'reciclagoias-certificado',
    question: 'O que é o certificado RECICLAGOIÁS?',
    answer:
      'É o documento emitido pela entidade gestora que comprova a restituição da massa equivalente de embalagens ao ciclo produtivo. Pode ser adquirido por fabricantes, importadores, distribuidores e comerciantes pra comprovar as metas de logística reversa.',
  },
  {
    id: 'entidade-gestora',
    question: 'O que é uma entidade gestora?',
    answer:
      'É a pessoa jurídica que estrutura, implementa e operacionaliza o sistema de logística reversa em modelo coletivo. Ela representa as empresas aderentes, protocola o sistema na SEMAD, contrata o verificador de resultados e emite os certificados RECICLAGOIÁS.',
  },
  {
    id: 'operador-quem-pode',
    question: 'Quem pode atuar como operador logístico no sistema?',
    answer:
      'Cooperativas e associações de catadores de materiais recicláveis, agentes de reciclagem, titulares de serviços públicos de limpeza urbana, consórcios públicos, empresas, microempreendedores individuais e organizações da sociedade civil que restituem embalagens recicláveis ao ciclo produtivo.',
  },
  {
    id: 'verificador-papel',
    question: 'Qual é o papel do verificador de resultados?',
    answer:
      'O verificador é o auditor independente do sistema: homologa as notas fiscais eletrônicas emitidas pelos operadores, valida as notas junto à Receita Federal, garante que nenhuma massa seja contada duas vezes e mantém a custódia dos arquivos por no mínimo 5 anos. Ele é proibido de comprar ou vender certificados.',
  },
  {
    id: 'sede-fora-goias',
    question:
      'Minha empresa não tem sede em Goiás, mas vende produtos que circulam no estado. Ainda assim preciso participar do sistema de logística reversa?',
    answer:
      'Sim. O Decreto 10.255/2023 abrange fabricantes, importadores, distribuidores e comerciantes com ou sem sede no Estado de Goiás, independentemente de serem signatários de termo de compromisso estadual ou acordo setorial. O que importa é gerar embalagens pós-consumo no território goiano.',
  },
  {
    id: 'sistema-individual',
    question: 'Posso montar um sistema individual em vez de aderir a um coletivo?',
    answer:
      'Sim. Empresas que optam por modelos individuais de logística reversa devem cumprir os mesmos requisitos exigidos das entidades gestoras do modelo coletivo, incluindo metas, verificador de resultados e relatório anual.',
  },
  {
    id: 'certificado-reuso',
    question:
      'Posso usar o mesmo certificado RECICLAGOIÁS pra comprovar obrigações em mais de um ano?',
    answer:
      'Não. O certificado pode ser utilizado apenas uma única vez. Além disso, só são aceitas notas fiscais eletrônicas emitidas no ano fiscal corrente ou no imediatamente anterior à emissão do certificado.',
  },
  {
    id: 'dupla-contagem',
    question: 'Como o sistema evita a dupla contagem da massa reciclada?',
    answer:
      'O verificador de resultados registra, armazena e sistematiza as notas fiscais preservando a unicidade e a não colidência das massas: cada nota só lastreia um certificado. A custódia dos arquivos digitais por no mínimo 5 anos garante a auditabilidade.',
  },
  {
    id: 'sancoes',
    question: 'Quais são as sanções por descumprimento?',
    answer:
      'Aplicam-se as penalidades da Lei federal nº 9.605/1998 (Crimes Ambientais) e do Decreto federal nº 6.514/2008, tanto a signatários e aderentes quanto a não signatários.',
  },
  {
    id: 'produto-outra-uf',
    question:
      'O que acontece com produtos vindos de outros estados que não estão vinculados a nenhum sistema de logística reversa registrado na SEMAD?',
    answer:
      'Toda entrada de produtos oriundos de outras unidades da Federação que não estiverem submetidos aos compromissos de algum sistema de logística reversa registrado na SEMAD é considerada infração ambiental e está sujeita a penalização.',
  },
  {
    id: 'excecoes',
    question: 'Quais embalagens ficam de fora do Recicla Goiás?',
    answer:
      'Embalagens já cobertas por sistemas próprios de logística reversa: agrotóxicos e seus resíduos, óleos lubrificantes e suas embalagens, e produtos regulamentados pelo Decreto federal nº 10.388/2020, que seguem legislação específica.',
  },
  {
    id: 'autodeclaracao-notificado',
    question: 'Fui notificado, mas acredito que minha empresa não se enquadra. O que fazer?',
    answer:
      'Empresas convocadas podem apresentar o Formulário de Autodeclaração de Não Enquadramento dentro do prazo da notificação, justificando por que a obrigação não se aplica à sua operação.',
  },
  {
    id: 'tratamento-energetico',
    question: 'Resíduos enviados pra tratamento energético contam pras metas?',
    answer:
      'Não. Para a emissão do RECICLAGOIÁS não são admitidos os resíduos enviados para tratamento energético. Valem apenas os materiais que retornam ao ciclo produtivo como matéria-prima.',
  },
  {
    id: 'prazo-relatorio',
    question: 'Qual o prazo do relatório anual?',
    answer:
      'Até 31 de março de cada ano. O relatório consolida as empresas aderentes, a quantidade de embalagens colocadas no mercado, os certificados RECICLAGOIÁS e as declarações do verificador de resultados e da auditoria de terceira parte.',
  },
  {
    id: 'rastreabilidade',
    question:
      'Além da nota fiscal eletrônica, que outros documentos comprovam a rastreabilidade do material até o destinador final?',
    answer:
      'A homologação exige a confirmação do recebimento da massa pelo destinador final, mediante Certificado de Destinação Final (CDF) emitido por meio do Manifesto de Transporte de Resíduos (MTR) do Sinir, além da comprovação da origem pós-consumo do material.',
  },
  {
    id: 'acesso-verificador',
    question: 'Como solicito acesso de verificador de resultados?',
    answer:
      'O acesso é concedido pelo administrador do comitê. A solicitação pode ser feita pelo canal oficial da Secretaria de Indústria e Comércio.',
  },
  {
    id: 'empresa-bloqueada',
    question: 'O que acontece quando uma empresa é bloqueada?',
    answer:
      'A empresa mantém acesso ao histórico para fins de auditoria, mas perde a possibilidade de operações transacionais: emissão de certificados, criação de planos e compras.',
  },
  {
    id: 'visibilidade-dados',
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
  { short: 'SIC',      full: 'Secretaria de Indústria, Comércio e Serviços' },
  { short: 'SEMAD',    full: 'Secretaria de Meio Ambiente e Desenvolvimento Sustentável' },
  { short: 'RETOMADA', full: 'Secretaria da Retomada' },
  { short: 'ECONOMIA', full: 'Secretaria da Economia' },
  { short: 'SGG',      full: 'Secretaria Geral do Governo' },
];
