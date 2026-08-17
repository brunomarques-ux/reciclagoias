/**
 * Mocks dos dashboards do Admin (SIC) e do Verificador de Resultados.
 *
 * Todo número aqui veio das telas atuais do sistema — o que mudou foi a forma de
 * apresentar, não o dado. Onde o legado se contradiz, a divergência está anotada.
 */
import type { CardPrazo, LinhaDocumentacao, StatusTone } from './gestora';

export const ANO_EXECUCAO_PADRAO = 2025;

// ============================================================
// Admin (SIC)
// ============================================================

export interface Indicador {
  eyebrow: string;
  valor: string;
  apoio?: string;
  icone: string;
  chips?: { rotulo: string; tone: Extract<StatusTone, 'success' | 'warning'> }[];
}

export const INDICADORES_ADMIN: Indicador[] = [
  {
    eyebrow: 'META DE RECICLAGEM 2025',
    valor: '30%',
    apoio: 'Meta global estabelecida',
    icone: 'mdi-chart-box-outline',
  },
  {
    eyebrow: 'EMPRESAS ADERENTES',
    valor: '44.063',
    apoio: 'Cadastradas no exercício',
    icone: 'mdi-account-multiple-outline',
  },
  {
    eyebrow: 'CERTIFICADOS DE MASSA',
    valor: '12',
    apoio: 'Emitidos no exercício',
    icone: 'mdi-receipt-text-outline',
  },
  {
    eyebrow: 'JUSTIFICATIVAS',
    valor: '130',
    icone: 'mdi-alert-outline',
    chips: [
      { rotulo: '99 pendentes', tone: 'warning' },
      { rotulo: '5 aprovadas', tone: 'success' },
    ],
  },
];

/**
 * "Em preenchimento" e "retificando" são dois status distintos no domínio, mas o
 * sistema atual mostra um número só para os dois — por isso a linha traz o rótulo
 * composto. Quando o dado vier separado, o segundo status precisa de um tom próprio:
 * dois âmbares colados na mesma barra são indistinguíveis (D-R003).
 */
export const DOCUMENTACAO_ADMIN: LinhaDocumentacao[] = [
  {
    id: 'relatorios',
    icone: 'mdi-file-document',
    titulo: 'Relatórios 2025',
    total: 61,
    statuses: [
      { singular: 'enviado', plural: 'enviados', quantidade: 25, tone: 'success' },
      { singular: 'retificado', plural: 'retificados', quantidade: 17, tone: 'info' },
      {
        singular: 'em preenchimento/retificando',
        plural: 'em preenchimento/retificando',
        quantidade: 19,
        tone: 'warning',
      },
    ],
    fraseVazia: 'Nenhum relatório enviado ainda.',
    linkRotulo: 'Ver relatórios',
  },
  {
    id: 'planos',
    icone: 'mdi-clipboard-text',
    titulo: 'Planos 2025',
    total: 89,
    statuses: [
      { singular: 'enviado', plural: 'enviados', quantidade: 45, tone: 'success' },
      { singular: 'retificado', plural: 'retificados', quantidade: 9, tone: 'info' },
      {
        singular: 'em preenchimento/retificando',
        plural: 'em preenchimento/retificando',
        quantidade: 35,
        tone: 'warning',
      },
    ],
    fraseVazia: 'Nenhum plano enviado ainda.',
    linkRotulo: 'Ver planos',
  },
];

export interface FatiaUsuarios {
  rotulo: string;
  quantidade: number;
  tone: StatusTone;
}

export const DISTRIBUICAO_USUARIOS: FatiaUsuarios[] = [
  { rotulo: 'entidades gestoras', quantidade: 30, tone: 'success' },
  { rotulo: 'operadores logísticos', quantidade: 9, tone: 'info' },
  { rotulo: 'verificadores', quantidade: 15, tone: 'neutral' },
];

/**
 * Só as massas em tonelada e o percentual da meta ficam guardados. A meta em
 * tonelada, a taxa de recuperação e o "bateu ou não bateu" são **derivados** — foi
 * assim que a contradição do Papel apareceu (anel dizia 100% com 86.632 t
 * recuperadas sobre 49.788 t produzidas) e é assim que ela não volta.
 */
export interface MaterialRecuperado {
  nome: string;
  /** Massa colocada no mercado, em toneladas. É a base da conta. */
  produzida: number;
  recuperada: number;
}

/** Meta legal do exercício: percentual da massa produzida que precisa voltar. */
export const META_PERCENTUAL = 30;

/**
 * O metal está **abaixo da meta** de propósito: sem um material fora do alvo, a
 * fileira inteira fica verde e o estado negativo não chega a ser validado.
 */
export const MATERIAIS_ADMIN: MaterialRecuperado[] = [
  { nome: 'Papel', produzida: 49788, recuperada: 86632 },
  { nome: 'Plástico', produzida: 12692, recuperada: 10335 },
  { nome: 'Metal', produzida: 8846, recuperada: 2210 },
  { nome: 'Vidro', produzida: 7746, recuperada: 4116 },
];

export interface MassaDisponivel {
  material: string;
  valor: string;
  /** Token de cor do material, na fatia da linha. */
  cor: string;
}

export const MASSAS_DISPONIVEIS: MassaDisponivel[] = [
  { material: 'PAPEL', valor: '—', cor: 'var(--rg-data-material-paper)' },
  { material: 'PLÁSTICO', valor: '—', cor: 'var(--rg-data-material-plastic)' },
  { material: 'METAL', valor: '—', cor: 'var(--rg-data-material-metal)' },
  { material: 'VIDRO', valor: '74,2', cor: 'var(--rg-data-material-glass)' },
];

export const TOTAL_MASSA_DISPONIVEL = '74,2 t';

export const PRAZOS_ADMIN: CardPrazo[] = [
  {
    id: 'planos',
    eyebrow: 'PRAZO FINAL PLANOS',
    data: '—',
    diasRestantes: 0,
    contador: 'Prazo ainda não definido',
    restritivo: null,
  },
  {
    id: 'relatorios',
    eyebrow: 'PRAZO FINAL RELATÓRIO',
    data: '13/08/2026',
    diasRestantes: 0,
    contador: 'Finaliza hoje',
    restritivo: { ate: '13/08', acoes: ['Incluir nota fiscal', 'Excluir nota fiscal'] },
  },
];

// ============================================================
// Verificador de Resultados
// ============================================================

/**
 * O sistema atual mostra "18 Total" no cabeçalho e 27 dentro da barra da mesma linha.
 * Aqui o total é sempre a soma dos status, então vale o 27 — e os outros dois status
 * da legenda estão zerados, por isso não aparecem.
 */
export const DOCUMENTACAO_VERIFICADOR: LinhaDocumentacao[] = [
  {
    id: 'notas',
    icone: 'mdi-receipt-text',
    titulo: 'Notas Fiscais 2025',
    total: 27,
    statuses: [
      { singular: 'aprovada/enviada', plural: 'aprovadas/enviadas', quantidade: 27, tone: 'success' },
      { singular: 'bloqueada', plural: 'bloqueadas', quantidade: 0, tone: 'danger' },
      { singular: 'vinculada/pendente', plural: 'vinculadas/pendentes', quantidade: 0, tone: 'warning' },
    ],
    fraseVazia: 'Nenhuma nota fiscal recebida até agora.',
    linkRotulo: 'Ver notas fiscais',
  },
  {
    id: 'relatorios',
    icone: 'mdi-file-document',
    titulo: 'Relatórios 2025',
    total: 0,
    statuses: [],
    fraseVazia: 'Nenhum relatório enviado ainda.',
    linkRotulo: 'Ver relatórios',
  },
];

export const PRAZO_VERIFICACAO: CardPrazo = {
  id: 'verificacao',
  eyebrow: 'PRAZO DE VERIFICAÇÃO',
  data: '13/08/2026',
  diasRestantes: 0,
  contador: 'Finaliza hoje',
  restritivo: { ate: '13/08', acoes: ['Incluir nota fiscal', 'Excluir nota fiscal'] },
};

export const ACESSO_RAPIDO_VERIFICADOR = [
  { rotulo: 'Visualizar Notas Fiscais' },
  { rotulo: 'Visualizar Relatórios', primario: true },
];

export const ACESSO_RAPIDO_GESTORA = [
  { rotulo: 'Visualizar Planos' },
  { rotulo: 'Visualizar Relatórios' },
  { rotulo: 'Visualizar Certificados', primario: true },
];
