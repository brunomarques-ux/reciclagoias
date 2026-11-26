/**
 * Mocks do complemento de cadastro do Operador Logístico.
 *
 * Fonte: formulário "Operador Logístico" recebido da SIC (ago/26), redesenhado na
 * seção `Setembro 2026 · Recicla Goiás · Complemento de Cadastro do Operador
 * Logístico` do Figma. O fluxo decidido: o pré-cadastro de produção (razão social,
 * nome fantasia, CNPJ, e-mail e senha) fica intocado; depois da ativação por
 * e-mail o operador entra no sistema e preenche este complemento. Por isso os
 * dados de `PRE_CADASTRO` aparecem travados na etapa 1.
 *
 * A ata pedida duas vezes no formulário original (itens 2.3 e 2.9) aparece uma
 * vez só aqui — decisão registrada no cabeçalho da seção do Figma.
 */

export type TipoOrganizacao = 'cooperativa' | 'empresa';

export interface PreCadastro {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  /**
   * CNAE principal do CNPJ, só o código (sem a descrição, decisão do Bruno). Pedido
   * de 04/11/2026: a análise vai validar CNAEs, então o operador precisa ver qual
   * está registrado. Vem do CNPJ, então fica travado como o resto do pré-cadastro.
   */
  cnae: string;
  /**
   * Todos os CNAEs do CNPJ, o principal primeiro. Rodada de 13/11/2026: na Minha
   * Conta (cadastro aprovado) eles aparecem em chips, só para consulta.
   */
  cnaes: string[];
  email: string;
  /** O pré-cadastro de produção já pergunta "Você é: Cooperativa / Empresa". */
  tipoOrganizacao: TipoOrganizacao;
}

export const PRE_CADASTRO: PreCadastro = {
  razaoSocial: 'Cooperativa de Catadores Recicla Cerrado',
  nomeFantasia: 'Recicla Cerrado',
  cnpj: '23.481.907/0001-55',
  cnae: '3811-4/00',
  cnaes: ['3811-4/00', '3812-2/00', '3821-1/00', '3831-9/99', '3832-7/00', '3839-4/99'],
  email: 'contato@reciclacerrado.org.br',
  tipoOrganizacao: 'cooperativa',
};

export const ROTULO_TIPO: Record<TipoOrganizacao, string> = {
  cooperativa: 'Cooperativa',
  empresa: 'Empresa',
};

export const ETAPAS = [
  'Dados gerais',
  'Documentos',
  'Operação',
  'Estrutura e capacidade',
  'Revisão e envio',
] as const;

export interface DocumentoExigido {
  id: string;
  rotulo: string;
  /** Nome de arquivo usado quando o anexo é simulado no protótipo. */
  arquivoDemo: string;
  /**
   * Documento com data de validade (planning de 13/11/2026): de imediato, o alvará
   * e o licenciamento ambiental. A lista final depende das regras da SEMAD.
   */
  temValidade?: boolean;
  /** Como o texto chama o documento no meio da frase ("o alvará venceu em..."). */
  nomeCurto?: string;
}

/**
 * Exemplo da validade dos documentos, com as datas da página de 19/11 no Figma:
 * o alvará vence em 14/12; lembretes em 15/10 e 14/11; aviso de vencido em 14/12;
 * prazo até 24/12; último aviso em 20/12; bloqueio total em 25/12. O documento
 * novo chega em 18/12 (troca dentro do prazo) ou em 26/12 (depois do bloqueio).
 */
export const VALIDADE_DEMO = {
  doc: 'alvara',
  venceEm: '14/12/2026',
  aprovadoEm: '04/09/2026, às 16h20',
  vencidoEm: '14/12/2026, às 08h00',
  bloqueadoEm: '25/12/2026, às 00h05',
  reenvioNoPrazoEm: '18/12/2026, às 09h14',
  reenvioEm: '26/12/2026, às 09h14',
  arquivoNovo: 'alvara-funcionamento-2027.pdf',
  novaValidade: '14/12/2027',
} as const;

export const DOCUMENTOS_EXIGIDOS: DocumentoExigido[] = [
  { id: 'alvara', rotulo: 'Alvará de funcionamento', arquivoDemo: 'alvara-funcionamento-2026.pdf', temValidade: true, nomeCurto: 'alvará' },
  { id: 'estatuto', rotulo: 'Estatuto social registrado', arquivoDemo: 'estatuto-social-registrado.pdf' },
  {
    id: 'ata',
    rotulo: 'Ata de eleição da atual Diretoria ou Conselho de Administração e Conselho Fiscal',
    arquivoDemo: 'ata-eleicao-diretoria.pdf',
  },
  {
    id: 'registro-junta',
    rotulo: 'Comprovante de registro dos atos na Junta Comercial',
    arquivoDemo: 'registro-junta-comercial.pdf',
  },
  {
    id: 'certidao-junta',
    rotulo: 'Certidão simplificada da Junta Comercial',
    arquivoDemo: 'certidao-simplificada.pdf',
  },
  { id: 'mtr', rotulo: 'Comprovante de Cadastro no MTR', arquivoDemo: 'cadastro-mtr.pdf' },
  { id: 'licenca', rotulo: 'Licenciamento ambiental', arquivoDemo: 'licenca-ambiental-2025.pdf', temValidade: true, nomeCurto: 'licenciamento' },
  { id: 'cartao-cnpj', rotulo: 'Cartão de CNPJ (ativo)', arquivoDemo: 'cartao-cnpj.pdf' },
  {
    id: 'identidade',
    rotulo: 'Cópia do documento de identidade e CPF do representante legal',
    arquivoDemo: 'identidade-representante.pdf',
  },
  {
    id: 'capacidade',
    rotulo: 'Declaração de capacidade de operação/produção',
    arquivoDemo: 'declaracao-capacidade.pdf',
  },
  {
    id: 'certidoes-fiscais',
    rotulo: 'Certidões de regularidade fiscal (Federal, Estadual, Municipal, FGTS e INSS)',
    arquivoDemo: 'certidoes-regularidade-fiscal.pdf',
  },
];

export interface Opcao {
  id: string;
  rotulo: string;
}

/** Toda lista com "outro" usa o id `outro` — é ele que abre o campo de descrição. */
export const BENEFICIAMENTOS: Opcao[] = [
  { id: 'triagem', rotulo: 'Triagem' },
  { id: 'compostagem', rotulo: 'Compostagem' },
  { id: 'trituracao', rotulo: 'Trituração' },
  { id: 'transformacao', rotulo: 'Transformação de reciclável em produto' },
  { id: 'outro', rotulo: 'Outro serviço' },
];

export const EQUIPAMENTOS: Opcao[] = [
  { id: 'balanca', rotulo: 'Balança' },
  { id: 'empilhadeira', rotulo: 'Empilhadeira' },
  { id: 'esteira', rotulo: 'Esteira' },
  { id: 'moinho', rotulo: 'Moinho triturador' },
  { id: 'pa', rotulo: 'Pá carregadeira' },
  { id: 'prensa', rotulo: 'Prensa' },
  { id: 'triturador-plastico', rotulo: 'Triturador de plástico' },
  { id: 'triturador-vidro', rotulo: 'Triturador de vidro' },
  { id: 'outro', rotulo: 'Outros equipamentos' },
];

export const TIPOS_RESIDUO: Opcao[] = [
  { id: 'papel', rotulo: 'Papel e papelão' },
  { id: 'plastico', rotulo: 'Plástico' },
  { id: 'metal', rotulo: 'Metal' },
  { id: 'vidro', rotulo: 'Vidro' },
  { id: 'organico', rotulo: 'Orgânico' },
  { id: 'outro', rotulo: 'Outro tipo' },
];

export const ORIGENS_RESIDUO: Opcao[] = [
  { id: 'orgaos-publicos', rotulo: 'De órgãos públicos' },
  { id: 'domiciliares', rotulo: 'Domiciliares' },
  { id: 'comercio', rotulo: 'Estabelecimentos comerciais privados' },
  { id: 'industria', rotulo: 'Estabelecimentos industriais' },
  { id: 'limpeza-publica', rotulo: 'Resíduos de limpeza pública' },
  { id: 'outro', rotulo: 'Outra origem' },
];

export const SITUACOES_AREA: Opcao[] = [
  { id: 'aluguel', rotulo: 'Aluguel' },
  { id: 'propria', rotulo: 'Área própria' },
  { id: 'cessao-privada', rotulo: 'Cessão de uso em área privada' },
  { id: 'cessao-publica', rotulo: 'Cessão de uso em área pública' },
  { id: 'outro', rotulo: 'Outra situação' },
];

export const AREAS_UNIDADE: Opcao[] = [
  { id: 'convivencia', rotulo: 'Área de convivência' },
  { id: 'refeitorio', rotulo: 'Refeitório' },
  { id: 'banheiros', rotulo: 'Banheiros' },
  { id: 'cozinha', rotulo: 'Cozinha' },
  { id: 'escritorio', rotulo: 'Escritório' },
  { id: 'vestiario', rotulo: 'Vestiário' },
  { id: 'outro', rotulo: 'Outra área' },
];

export const MODOS_TRIAGEM: Opcao[] = [
  { id: 'mecanizada', rotulo: 'Mecanizada' },
  { id: 'semimecanizada', rotulo: 'Semimecanizada' },
  { id: 'manual', rotulo: 'Manual' },
];

export const PERCEPCOES_OPERACAO: Opcao[] = [
  { id: 'acima', rotulo: 'Acima da capacidade' },
  { id: 'limite', rotulo: 'No limite da capacidade' },
  { id: 'abaixo', rotulo: 'Abaixo da capacidade' },
];

export const PROTOCOLO_DEMO = 'OPL-2026-00184';

/** Motivos prontos da análise (SEMAD, 15/09): vencido e faltando, mais um aberto. */
export const MOTIVOS_ANALISE = [
  { id: 'vencido', rotulo: 'Documento vencido' },
  { id: 'nao-enviado', rotulo: 'Documento não enviado' },
  { id: 'outro', rotulo: 'Outro motivo' },
] as const;
export type MotivoAnalise = (typeof MOTIVOS_ANALISE)[number]['id'];

/**
 * Fila da análise no Admin. A primeira linha é a Recicla Cerrado, que vem da store.
 * Quatro situações (planning de 16/10): não existe Reenviado.
 */
/**
 * Os outros cadastros da fila do Admin (16/11/2026). Cada um é um cadastro de exemplo completo, que abre pela lista
 * ou direto pelo endereço (/admin/cadastros/<protocolo>), no estado da coluna `situacao`. Só a identidade muda: o
 * resto do formulário é o mesmo da Recicla Cerrado, porque o exemplo serve para mostrar a tela em cada situação.
 * `situacao` é o ponto de partida do exemplo; quem o monta é a camada do protótipo (src/prototipo/cenarios).
 */
export type SituacaoDeExemplo = 'enviado' | 'em-analise' | 'devolvido' | 'corrigido' | 'aprovado' | 'atualizado';

export interface CadastroDeExemplo extends PreCadastro {
  protocolo: string;
  situacao: SituacaoDeExemplo;
  /** Data do envio que a fila mostra (dd/mm/aaaa). */
  enviado: string;
  analista: string | null;
  /** O que muda no formulário de um exemplo para outro, para os cadastros não parecerem cópias. */
  telefone: string;
  anoCriacao: string;
  cooperados: string;
}

const cnaesPadrao = ['3811-4/00', '3831-9/99', '3839-4/99'];

export const CADASTROS_DE_EXEMPLO: readonly CadastroDeExemplo[] = [
  { protocolo: 'OPL-2026-00187', telefone: '(64) 3621-4410', anoCriacao: '2011', cooperados: '52', razaoSocial: 'Cooperativa Recicla Vale do Araguaia', nomeFantasia: 'Recicla Araguaia', cnpj: '27.903.114/0001-62', cnae: '3811-4/00', cnaes: cnaesPadrao, email: 'contato@reciclaaraguaia.org.br', tipoOrganizacao: 'cooperativa', situacao: 'atualizado', enviado: '26/12/2026', analista: null },
  { protocolo: 'OPL-2026-00182', telefone: '(62) 3249-7731', anoCriacao: '2018', cooperados: '0', razaoSocial: 'Central de Triagem Goiânia Leste Ltda', nomeFantasia: 'Triagem Leste', cnpj: '35.611.208/0001-47', cnae: '3831-9/99', cnaes: cnaesPadrao, email: 'cadastro@triagemleste.com.br', tipoOrganizacao: 'empresa', situacao: 'corrigido', enviado: '05/09/2026', analista: null },
  { protocolo: 'OPL-2026-00179', telefone: '(62) 3088-1290', anoCriacao: '2009', cooperados: '0', razaoSocial: 'Reciclagem Anhanguera Ltda', nomeFantasia: 'Anhanguera Reciclagem', cnpj: '31.204.118/0001-09', cnae: '3831-9/99', cnaes: cnaesPadrao, email: 'contato@anhanguerareciclagem.com.br', tipoOrganizacao: 'empresa', situacao: 'em-analise', enviado: '29/08/2026', analista: 'Carlos Mendes' },
  { protocolo: 'OPL-2026-00171', telefone: '(62) 3277-5084', anoCriacao: '2016', cooperados: '27', razaoSocial: 'Cooperativa Mãos que Reciclam', nomeFantasia: 'Mãos que Reciclam', cnpj: '18.330.442/0001-71', cnae: '3811-4/00', cnaes: cnaesPadrao, email: 'contato@maosquereciclam.org.br', tipoOrganizacao: 'cooperativa', situacao: 'devolvido', enviado: '27/08/2026', analista: 'Ana Ribeiro' },
  { protocolo: 'OPL-2026-00166', telefone: '(62) 3954-2215', anoCriacao: '2013', cooperados: '41', razaoSocial: 'Associação Catadores Meia Ponte', nomeFantasia: 'Catadores Meia Ponte', cnpj: '12.877.590/0001-38', cnae: '3811-4/00', cnaes: cnaesPadrao, email: 'associacao@meiaponte.org.br', tipoOrganizacao: 'cooperativa', situacao: 'enviado', enviado: '26/08/2026', analista: null },
  { protocolo: 'OPL-2026-00158', telefone: '(64) 3411-6702', anoCriacao: '2007', cooperados: '0', razaoSocial: 'Ecoponto Sudoeste Reciclagem Ltda', nomeFantasia: 'Ecoponto Sudoeste', cnpj: '40.115.623/0001-50', cnae: '3839-4/99', cnaes: cnaesPadrao, email: 'contato@ecopontosudoeste.com.br', tipoOrganizacao: 'empresa', situacao: 'aprovado', enviado: '22/08/2026', analista: 'Carlos Mendes' },
  { protocolo: 'OPL-2026-00150', telefone: '(62) 3521-0937', anoCriacao: '2019', cooperados: '19', razaoSocial: 'Cooperativa Nova Esperança', nomeFantasia: 'Nova Esperança', cnpj: '09.664.201/0001-84', cnae: '3811-4/00', cnaes: cnaesPadrao, email: 'contato@coopnovaesperanca.org.br', tipoOrganizacao: 'cooperativa', situacao: 'aprovado', enviado: '20/08/2026', analista: 'Ana Ribeiro' },
];

export const cadastroDeExemplo = (protocolo: string) =>
  CADASTROS_DE_EXEMPLO.find((x) => x.protocolo.toLowerCase() === protocolo.toLowerCase());
