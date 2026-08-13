/**
 * Mocks do dashboard da Entidade Gestora.
 *
 * O arquivo é um **catálogo**, não uma lista de telas prontas: descreve o que cada
 * linha da documentação e cada card de prazo podem ter. Os `PRESETS` são recortes
 * desse catálogo que reproduzem os frames do Figma (seção "Agosto 2026 · Recicla
 * Goiás · Dashboard da Entidade Gestora"), e o explorador de cenários edita o mesmo
 * catálogo em tempo real — por isso os controles dele nascem sozinhos daqui.
 *
 * Regras que o modelo garante por construção (docs/sistema/DECISOES-UX.md):
 *  - status zerado não entra na lista;
 *  - o total é a soma dos status, nunca um número solto;
 *  - período restritivo ⇔ pelo menos uma ação liberada (não existe `n = 0`);
 *  - o período restritivo é por card — planos e relatórios são independentes.
 */

export type StatusTone = 'success' | 'info' | 'warning' | 'neutral';

// ============================================================
// Formato consumido pelos componentes da tela
// ============================================================

export interface StatusDocumento {
  /** Rótulo no singular ("enviado") e no plural ("enviados"). */
  singular: string;
  plural: string;
  quantidade: number;
  tone: StatusTone;
}

export interface LinhaDocumentacao {
  id: string;
  icone: string;
  titulo: string;
  total: number;
  statuses: StatusDocumento[];
  /** Frase que substitui a contagem quando o total é zero. */
  fraseVazia: string;
  linkRotulo: string;
}

/**
 * Item da lista do popover, no imperativo: "Incluir nota fiscal".
 *
 * É só o rótulo porque o card nunca mostra qual ação está liberada, nem quando há uma
 * só: ele conta e o popover mostra.
 */
export type AcaoLiberada = string;

export interface PeriodoRestritivo {
  /** Fim da vigência no formato curto do gatilho: "29/08". */
  ate: string;
  acoes: AcaoLiberada[];
}

export interface CardPrazo {
  id: string;
  eyebrow: string;
  data: string;
  diasRestantes: number;
  /** Ação que o prazo habilita — só aparece quando não há período restritivo. */
  acaoRotulo: string;
  restritivo: PeriodoRestritivo | null;
}

// ============================================================
// Catálogo
// ============================================================

export interface StatusCatalogo {
  id: string;
  singular: string;
  plural: string;
  tone: StatusTone;
  /** Quantidade usada quando o status é ligado no explorador. */
  padrao: number;
}

export interface LinhaCatalogo {
  id: string;
  icone: string;
  titulo: string;
  fraseVazia: string;
  linkRotulo: string;
  statuses: StatusCatalogo[];
}

/** As três linhas do card, com todos os status que cada uma pode exibir. */
export const CATALOGO_LINHAS: LinhaCatalogo[] = [
  {
    id: 'planos',
    icone: 'mdi-clipboard-text',
    titulo: 'Planos',
    fraseVazia: 'Nenhum plano enviado ainda.',
    linkRotulo: 'Ver planos',
    statuses: [
      { id: 'enviados', singular: 'enviado', plural: 'enviados', tone: 'success', padrao: 38 },
      { id: 'retificados', singular: 'retificado', plural: 'retificados', tone: 'info', padrao: 6 },
      {
        id: 'preenchimento',
        singular: 'em preenchimento',
        plural: 'em preenchimento',
        tone: 'warning',
        padrao: 3,
      },
    ],
  },
  {
    id: 'relatorios',
    icone: 'mdi-file-document',
    titulo: 'Relatórios',
    fraseVazia: 'Nenhum relatório aberto ainda.',
    linkRotulo: 'Ver relatórios',
    statuses: [
      { id: 'enviados', singular: 'enviado', plural: 'enviados', tone: 'success', padrao: 31 },
      { id: 'retificados', singular: 'retificado', plural: 'retificados', tone: 'info', padrao: 6 },
      {
        id: 'retificando',
        singular: 'retificando',
        plural: 'retificando',
        tone: 'warning',
        padrao: 21,
      },
      {
        id: 'preenchimento',
        singular: 'em preenchimento',
        plural: 'em preenchimento',
        tone: 'warning',
        padrao: 3,
      },
    ],
  },
  {
    id: 'certificados',
    icone: 'mdi-receipt-text',
    titulo: 'Certificados de massa',
    fraseVazia: 'Nenhum certificado recebido até agora.',
    linkRotulo: 'Ver certificados',
    statuses: [
      { id: 'aprovados', singular: 'aprovado', plural: 'aprovados', tone: 'success', padrao: 96 },
      {
        id: 'transferidos',
        singular: 'transferido',
        plural: 'transferidos',
        tone: 'info',
        padrao: 18,
      },
      {
        id: 'conciliacao',
        singular: 'em conciliação',
        plural: 'em conciliação',
        tone: 'warning',
        padrao: 9,
      },
      { id: 'cancelados', singular: 'cancelado', plural: 'cancelados', tone: 'neutral', padrao: 5 },
    ],
  },
];

export interface PrazoCatalogo {
  id: string;
  nome: string;
  eyebrow: string;
  acaoRotulo: string;
}

export const CATALOGO_PRAZOS: PrazoCatalogo[] = [
  { id: 'planos', nome: 'Planos', eyebrow: 'PRAZO · PLANOS', acaoRotulo: 'Novo plano' },
  {
    id: 'relatorios',
    nome: 'Relatórios',
    eyebrow: 'PRAZO · RELATÓRIOS',
    acaoRotulo: 'Novo relatório',
  },
];

/** Texto fixo do popover — igual em todos os frames. */
export const POPOVER_RESTRITIVO = {
  titulo: 'Período restritivo',
  descricao:
    'É uma extensão excepcional de um prazo que já terminou. Não tem calendário e não é ' +
    'rotina: acontece quando a diretoria autoriza, caso a caso, e libera apenas algumas ações.',
} as const;

/** A partir de quantas ações a lista do popover trava em 240px e passa a rolar. */
export const LIMITE_SEM_ROLAGEM = 11;

/**
 * Catálogo de ações que uma vigência restritiva pode liberar, na ordem do Figma
 * (tira "Popover · dimensões"). Presets e explorador fatiam esta lista.
 */
export const ACOES: AcaoLiberada[] = [
  'Incluir nota fiscal',
  'Excluir nota fiscal',
  'Retificar relatório enviado',
  'Ajustar massa recuperada',
  'Incluir nota duplicada no relatório de não conformidades',
  'Substituir certificado de massa',
  'Editar dados do plano de gerenciamento',
  'Reenviar relatório devolvido',
  'Anexar comprovante de destinação',
  'Corrigir CNPJ da empresa aderente',
  'Transferir certificado entre entidades',
  'Cancelar certificado emitido',
  'Incluir operador logístico no plano',
  'Remover operador logístico do plano',
  'Ajustar meta percentual por material',
  'Reabrir conciliação de massa',
  'Importar notas fiscais em lote',
  'Excluir relatório em preenchimento',
  'Alterar responsável técnico',
  'Solicitar revisão ao verificador',
];

// ============================================================
// Presets — recortes do catálogo que reproduzem os frames
// ============================================================

export interface PrazoPreset {
  data: string;
  diasRestantes: number;
  /** Fim da vigência restritiva, no formato curto. */
  ate: string;
  /** Quantas ações do catálogo estão liberadas. `0` = sem período restritivo. */
  acoes: number;
}

export interface Preset {
  id: string;
  nome: string;
  descricao: string;
  anoExecucao: number;
  /** `linhaId` → `statusId` → quantidade. Ausente ou 0 = status desligado. */
  quantidades: Record<string, Record<string, number>>;
  prazos: Record<string, PrazoPreset>;
}

const PRAZOS_DENTRO_DO_PRAZO: Record<string, PrazoPreset> = {
  planos: { data: '29/08/2026', diasRestantes: 17, ate: '29/08', acoes: 0 },
  relatorios: { data: '30/08/2026', diasRestantes: 18, ate: '30/08', acoes: 0 },
};

/** Documentação dos frames REC-01…REC-06: exercício recém-aberto, sem volume. */
const DOCUMENTACAO_MAGRA: Record<string, Record<string, number>> = {
  planos: { enviados: 1 },
  relatorios: { preenchimento: 1 },
  certificados: {},
};

/** Documentação da tira "Status da Documentação · variações" (A · com volume). */
const DOCUMENTACAO_VOLUME: Record<string, Record<string, number>> = {
  planos: { enviados: 38, retificados: 6, preenchimento: 3 },
  relatorios: { enviados: 31, retificando: 21 },
  certificados: { aprovados: 96, transferidos: 18, conciliacao: 9, cancelados: 5 },
};

export const PRESETS: Preset[] = [
  {
    id: 'hoje',
    nome: 'Hoje',
    descricao: 'Exercício com volume; planos em período restritivo com 2 ações.',
    anoExecucao: 2024,
    quantidades: DOCUMENTACAO_VOLUME,
    prazos: {
      planos: { data: '29/08/2026', diasRestantes: 18, ate: '29/08', acoes: 2 },
      relatorios: { data: '30/08/2026', diasRestantes: 18, ate: '30/08', acoes: 0 },
    },
  },
  {
    id: 'rec01',
    nome: 'REC-01',
    descricao: 'Dentro do prazo: nenhum card fala de período restritivo.',
    anoExecucao: 2024,
    quantidades: DOCUMENTACAO_MAGRA,
    prazos: PRAZOS_DENTRO_DO_PRAZO,
  },
  {
    id: 'rec02',
    nome: 'REC-02',
    descricao: 'Planos em período restritivo com 2 ações, relatórios dentro do prazo.',
    anoExecucao: 2024,
    quantidades: DOCUMENTACAO_MAGRA,
    prazos: {
      planos: { data: '29/08/2026', diasRestantes: 18, ate: '29/08', acoes: 2 },
      relatorios: { data: '30/08/2026', diasRestantes: 18, ate: '30/08', acoes: 0 },
    },
  },
  {
    id: 'rec03',
    nome: 'REC-03',
    descricao: 'Escala e exceção lado a lado: 6 ações num card, 1 no outro.',
    anoExecucao: 2024,
    quantidades: DOCUMENTACAO_MAGRA,
    prazos: {
      planos: { data: '29/08/2026', diasRestantes: 18, ate: '29/08', acoes: 6 },
      relatorios: { data: '02/09/2026', diasRestantes: 21, ate: '02/09', acoes: 1 },
    },
  },
  {
    id: 'rec06',
    nome: 'REC-06',
    descricao: 'Vinte ações: o card não cresce e a lista do popover rola.',
    anoExecucao: 2024,
    quantidades: DOCUMENTACAO_MAGRA,
    prazos: {
      planos: { data: '29/08/2026', diasRestantes: 18, ate: '29/08', acoes: 20 },
      relatorios: { data: '30/08/2026', diasRestantes: 18, ate: '30/08', acoes: 0 },
    },
  },
  {
    id: 'variacoes',
    nome: 'Variações da linha',
    descricao: 'Zero, um e quatro status na mesma tela — a tira B do Figma.',
    anoExecucao: 2024,
    quantidades: {
      planos: {},
      relatorios: { enviados: 1 },
      certificados: { aprovados: 96, transferidos: 18, conciliacao: 9, cancelados: 5 },
    },
    prazos: PRAZOS_DENTRO_DO_PRAZO,
  },
];

export const PRESET_PADRAO = 'hoje';

export function ehPreset(valor: unknown): valor is string {
  return typeof valor === 'string' && PRESETS.some((p) => p.id === valor);
}

/**
 * Série de exercícios do seletor (D-R002). São oito para o segmentado provar o que
 * promete: janela de três células deslizando por uma série que não cabe na tela, com
 * as duas travas de extremo (2018 é o primeiro exercício, 2025 o mais recente).
 */
export const ANOS_EXECUCAO = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
