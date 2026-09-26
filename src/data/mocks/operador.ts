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
  email: string;
  /** O pré-cadastro de produção já pergunta "Você é: Cooperativa / Empresa". */
  tipoOrganizacao: TipoOrganizacao;
}

export const PRE_CADASTRO: PreCadastro = {
  razaoSocial: 'Cooperativa de Catadores Recicla Cerrado',
  nomeFantasia: 'Recicla Cerrado',
  cnpj: '23.481.907/0001-55',
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
}

export const DOCUMENTOS_EXIGIDOS: DocumentoExigido[] = [
  { id: 'alvara', rotulo: 'Alvará de funcionamento', arquivoDemo: 'alvara-funcionamento-2026.pdf' },
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
  { id: 'licenca', rotulo: 'Licenciamento ambiental', arquivoDemo: 'licenca-ambiental-2025.pdf' },
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

/** Fila da análise no Admin. A primeira linha é a Recicla Cerrado, que vem da store. */
export const FILA_CADASTROS = [
  { protocolo: 'OPL-2026-00179', nome: 'Reciclagem Anhanguera Ltda', cnpj: '31.204.118/0001-09', tipo: 'Empresa', situacao: 'em-analise', enviado: '29/08/2026', docs: '11 de 11' },
  { protocolo: 'OPL-2026-00171', nome: 'Cooperativa Mãos que Reciclam', cnpj: '18.330.442/0001-71', tipo: 'Cooperativa', situacao: 'devolvido', enviado: '27/08/2026', docs: '9 de 11' },
  { protocolo: 'OPL-2026-00166', nome: 'Associação Catadores Meia Ponte', cnpj: '12.877.590/0001-38', tipo: 'Cooperativa', situacao: 'reenviado', enviado: '26/08/2026', docs: '11 de 11' },
  { protocolo: 'OPL-2026-00158', nome: 'Ecoponto Sudoeste Reciclagem Ltda', cnpj: '40.115.623/0001-50', tipo: 'Empresa', situacao: 'aprovado', enviado: '22/08/2026', docs: '11 de 11' },
  { protocolo: 'OPL-2026-00150', nome: 'Cooperativa Nova Esperança', cnpj: '09.664.201/0001-84', tipo: 'Cooperativa', situacao: 'aprovado', enviado: '20/08/2026', docs: '11 de 11' },
] as const;
