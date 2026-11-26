/**
 * Estado do complemento de cadastro do Operador Logístico e da análise dele.
 *
 * As regras de UX moram aqui, não nos componentes (mesma filosofia da store
 * `explorador`). Rodada da planning de 16/10, fechada pelo Bruno em 18/10:
 *
 * - Tudo é obrigatório: campos e os 11 documentos. Sem o documento, a
 *   organização anexa o protocolo ou uma justificativa e explica na observação
 *   da etapa. O Sim/Não do "possui?" saiu da tela do operador.
 * - Salvamento por etapa: avançar é livre e o que foi preenchido fica gravado.
 *   Só o envio final trava, e a janela diz pelo nome o que falta.
 * - Quatro situações: enviado · em análise · devolvido · aprovado. Não existe
 *   "reenviado": o corrigido volta a Enviado, no topo da fila.
 * - Enviado, o operador ainda corrige pelo Editar até a análise começar. Quem
 *   clica em Analisar no Admin assume o cadastro e o trava para o operador.
 * - A análise confere todos os campos (✓ ou ✕ com observação) e os documentos
 *   (em conformidade? Sim ou Não com motivo). O analista não altera o dado.
 *
 * Planning de 13/11/2026 (Figma: seção `6506:4284`):
 * - Aprovado, o complemento mora dentro de Minha Conta, só para consulta.
 * - Documento com validade avisa 30 dias antes. Vencido, o cadastro fica
 *   "bloqueado por documentação vencida": só a etapa Documentos abre, e só o
 *   documento vencido aceita troca. O documento novo, com a validade informada,
 *   volta para o Admin como "Documento atualizado" e só ele é conferido de novo.
 * Regras de 19/11/2026 (Claudia, grupo HOMOLOGAÇÃO RECICLAGO; Figma: página
 * `Novembro 2026 · Validade e bloqueio · Regras de 19/11`, seção `6558:1924`),
 * que substituem o aviso único e o bloqueio no dia do vencimento:
 * - Lembretes 60 e 30 dias antes do vencimento. O cadastro segue aprovado.
 * - No vencimento, 10 dias corridos para trocar o documento, com o cadastro
 *   "parcialmente ativo" (situação `regularizacao`): transfere créditos, não
 *   inclui notas fiscais novas. A troca já pode ser feita nesse período.
 * - Sem a troca, bloqueio total a partir do 11º dia (`bloqueado`).
 * - O documento novo vai para o Admin; o acesso volta depois da conferência.
 *   Enquanto ela não termina, vale a restrição de onde a troca partiu.
 * - PROPOSTA para a SEMAD (`soDocumentos`): a análise confere só os documentos;
 *   Dados gerais, Operação e Estrutura ficam em leitura, com "Apontar problema"
 *   por bloco. Enquanto a SEMAD não decide, vale a conferência campo a campo.
 *
 * Persistência: tudo vai para `sessionStorage`, inclusive o preenchimento, para
 * a demonstração trocar de perfil em /entrar e seguir a volta completa.
 */
import { defineStore } from 'pinia';
import { computed, inject, reactive, ref, watch, type InjectionKey } from 'vue';

import {
  VALIDADE_DEMO,
  AREAS_UNIDADE,
  BENEFICIAMENTOS,
  DOCUMENTOS_EXIGIDOS,
  EQUIPAMENTOS,
  ETAPAS,
  MODOS_TRIAGEM,
  MOTIVOS_ANALISE,
  ORIGENS_RESIDUO,
  PERCEPCOES_OPERACAO,
  PRE_CADASTRO,
  PROTOCOLO_DEMO,
  cadastroDeExemplo,
  type PreCadastro,
  ROTULO_TIPO,
  SITUACOES_AREA,
  TIPOS_RESIDUO,
  type MotivoAnalise,
  type Opcao,
} from '@/data/mocks/operador';

export const CHAVE_COMPLEMENTO = 'rg:complemento:v2';

export type RespostaSimNao = 'sim' | 'nao' | null;
export type Situacao =
  | 'preenchendo'
  | 'enviado'
  | 'em-analise'
  | 'devolvido'
  | 'aprovado'
  /** Regras de 19/11: documento vencido, 10 dias para trocar. Parcialmente ativo: sem nota fiscal nova. */
  | 'regularizacao'
  /** Bloqueado por documentação vencida: só a etapa Documentos abre. */
  | 'bloqueado'
  /** O documento novo foi enviado e espera a conferência do Admin. */
  | 'documento-atualizado';

/** O documento com validade que está perto de vencer ou já venceu. */
export interface Vencimento {
  doc: string;
  /** DD/MM/AAAA */
  venceEm: string;
  vencido: boolean;
}

/** A troca do documento vencido: o arquivo novo e a validade informada. */
export interface TrocaDeDocumento {
  arquivo: string | null;
  validade: string;
  /** Preenchido quando o documento novo foi enviado para conferência. */
  enviadoEm: string | null;
  /** Motivo da recusa na conferência do documento novo, se houve. */
  recusa: string | null;
  /** De onde a troca partiu: define o que segue restrito enquanto o Admin confere (regras de 19/11). */
  origem?: 'antecipada' | 'regularizacao' | 'bloqueio' | null;
}

/** Os marcos da validade (regras de 19/11), contados a partir do vencimento. */
export interface PrazosDaValidade {
  lembrete60: string;
  lembrete30: string;
  venceEm: string;
  /** Último dia para trocar: o 10º dia corrido depois do vencimento. */
  prazoAte: string;
  /** 5 dias antes do bloqueio (leitura nossa da regra, a confirmar com a SEMAD). */
  ultimoAviso: string;
  /** O 11º dia: bloqueio total. */
  bloqueioEm: string;
}

/** DD/MM/AAAA somado de n dias corridos. */
export function somarDias(data: string, n: number): string {
  const [d, m, a] = data.split('/').map(Number);
  const x = new Date(a!, m! - 1, d! + n);
  const p = (v: number) => String(v).padStart(2, '0');
  return `${p(x.getDate())}/${p(x.getMonth() + 1)}/${x.getFullYear()}`;
}

/**
 * Os 10 dias contam a partir do dia seguinte ao vencimento (leitura nossa, em aberto para a reunião de 26/11): vence
 * 14/12, prazo até 24/12, aviso de 5 dias em 20/12, bloqueio em 25/12.
 */
export function prazosDaValidade(venceEm: string): PrazosDaValidade {
  return {
    lembrete60: somarDias(venceEm, -60),
    lembrete30: somarDias(venceEm, -30),
    venceEm,
    prazoAte: somarDias(venceEm, 10),
    ultimoAviso: somarDias(venceEm, 6),
    bloqueioEm: somarDias(venceEm, 11),
  };
}

/** Proposta de 13/11: problema apontado pelo analista num bloco de dados. */
export interface ProblemaDoBloco {
  texto: string;
  salvo: boolean;
}
export type Alerta = 'warning' | 'danger' | null;

export interface EstadoDocumento {
  arquivo: string | null;
}

/** Um campo do formulário como a revisão e a análise o leem: rótulo e valor em texto. */
export interface CampoLido {
  id: string;
  etapa: number;
  grupo: string;
  rotulo: string;
  valor: string;
  ok: boolean;
}

/** Conferência de um campo no Admin: ✓ (ok) ou ✕ (corrigir) com a observação. */
export interface ConferenciaCampo {
  resposta: 'ok' | 'corrigir' | null;
  texto: string;
  /** Observação salva: vira bloco de leitura com o botão de editar. */
  salvo: boolean;
  /** Conferido numa análise anterior: na reanálise chega bloqueado. */
  travado: boolean;
}

/** Conferência de um documento no Admin: em conformidade? Sim ou Não com motivo. */
export interface ConferenciaDocumento {
  resposta: RespostaSimNao;
  motivo: MotivoAnalise | null;
  texto: string;
  salvo: boolean;
  travado: boolean;
}

export interface EventoHistorico {
  data: string;
  titulo: string;
  desc: string;
  quem: string;
}

export interface FormularioComplemento {
  telefone: string;
  cooperados: string;
  anoCriacao: string;
  cep: string;
  logradouro: string;
  numero: string;
  estado: string;
  municipio: string;
  documentos: Record<string, EstadoDocumento>;
  observacaoDocumentos: string;
  coleta: RespostaSimNao;
  beneficiamentos: string[];
  beneficiamentoOutro: string;
  equipamentos: string[];
  equipamentoOutro: string;
  residuos: string[];
  residuoOutro: string;
  origens: string[];
  origemOutra: string;
  outrosMunicipios: RespostaSimNao;
  quaisMunicipios: string;
  parceriaMunicipio: RespostaSimNao;
  comercializaCertificado: RespostaSimNao;
  situacaoArea: string;
  situacaoOutra: string;
  areas: string[];
  areaOutra: string;
  triagem: string;
  capacidadeOperacional: string;
  percepcao: string;
  beneficiaVidro: RespostaSimNao;
  destinacaoVidro: string;
  capacidadeVidro: string;
  declaracaoAceita: boolean;
}

interface PacoteSalvo {
  etapa: number;
  situacao: Situacao;
  formulario: FormularioComplemento;
  dataEnvio: string | null;
  reenvio: boolean;
  analista: string | null;
  devolvidos: Record<string, string>;
  valoresDevolvidos: Record<string, string>;
  corrigidos: Record<string, boolean>;
  conferenciaCampos: Record<string, ConferenciaCampo>;
  conferencia: Record<string, ConferenciaDocumento>;
  historico: EventoHistorico[];
  vencimento?: Vencimento | null;
  troca?: TrocaDeDocumento;
  revalidacao?: boolean;
  relogio?: string | null;
  soDocumentos?: boolean;
  problemas?: Record<string, ProblemaDoBloco>;
  compartilhaMassa?: boolean;
}

/** Analista da demonstração: quem clica em Analisar no Admin. */
export const ANALISTA_DEMO = 'Ana Ribeiro';

/**
 * Estado de demonstração, igual aos frames do Figma (rodada de 18/10): os 11
 * documentos anexados, a licença no lugar do protocolo de renovação com a
 * observação explicando, e a capacidade do vidro em branco (o envio da L7).
 */
function formularioPadrao(): FormularioComplemento {
  const documentos: Record<string, EstadoDocumento> = {};
  for (const doc of DOCUMENTOS_EXIGIDOS) documentos[doc.id] = { arquivo: doc.arquivoDemo };
  documentos.licenca = { arquivo: 'protocolo-renovacao-licenca.pdf' };

  return {
    telefone: '(62) 3555-0142',
    cooperados: '34',
    anoCriacao: '2014',
    cep: '74915-230',
    logradouro: 'Avenida das Indústrias',
    numero: '1450',
    estado: 'Goiás',
    municipio: 'Aparecida de Goiânia',
    documentos,
    observacaoDocumentos:
      'No Licenciamento ambiental foi anexado o protocolo de renovação nº 2026.004517, em análise na SEMAD. A licença será anexada assim que sair.',
    coleta: 'sim',
    beneficiamentos: ['triagem', 'trituracao', 'outro'],
    beneficiamentoOutro: 'Oficinas de educação ambiental nas escolas do município',
    equipamentos: ['balanca', 'esteira', 'prensa', 'triturador-vidro'],
    equipamentoOutro: '',
    residuos: ['papel', 'plastico', 'vidro'],
    residuoOutro: '',
    origens: ['orgaos-publicos', 'domiciliares'],
    origemOutra: '',
    outrosMunicipios: 'sim',
    quaisMunicipios: 'Goiânia e Senador Canedo',
    parceriaMunicipio: 'sim',
    comercializaCertificado: 'nao',
    situacaoArea: 'aluguel',
    situacaoOutra: '',
    areas: ['convivencia', 'refeitorio', 'banheiros', 'escritorio', 'vestiario'],
    areaOutra: '',
    triagem: 'semimecanizada',
    capacidadeOperacional:
      'Cerca de 45 toneladas por mês, em um turno. O limite hoje é o espaço de estocagem do material prensado.',
    percepcao: 'limite',
    beneficiaVidro: 'sim',
    destinacaoVidro: 'Venda para a indústria de embalagens em Goiânia',
    capacidadeVidro: '',
    declaracaoAceita: true,
  };
}

function lerPacote(chave: string): PacoteSalvo | null {
  try {
    const bruto = sessionStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as PacoteSalvo) : null;
  } catch {
    return null;
  }
}

function agora(): string {
  const d = new Date();
  return `${d.toLocaleDateString('pt-BR')}, às ${d
    .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    .replace(':', 'h')}`;
}

/** Nome do arquivo novo que a correção anexa, para a reanálise ver a diferença. */
function arquivoCorrigido(id: string): string {
  const doc = DOCUMENTOS_EXIGIDOS.find((d) => d.id === id);
  return (doc?.arquivoDemo ?? 'documento.pdf').replace('.pdf', '-atualizado.pdf');
}

const vazio = (v: unknown) =>
  v === null || v === undefined || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);

const simNao = (v: RespostaSimNao) => (v === 'sim' ? 'Sim' : v === 'nao' ? 'Não' : '');
const rotulos = (lista: Opcao[], ids: string[], outro = '') =>
  ids
    .map((id) => (id === 'outro' && outro.trim() ? outro.trim() : lista.find((o) => o.id === id)?.rotulo ?? id))
    .join(', ');
const rotuloDe = (lista: Opcao[], id: string) => lista.find((o) => o.id === id)?.rotulo ?? '';

/** Estado inicial da conferência de um campo e de um documento. */
const conferenciaCampoVazia = (): ConferenciaCampo => ({ resposta: null, texto: '', salvo: false, travado: false });
const conferenciaDocVazia = (): ConferenciaDocumento => ({
  resposta: null,
  motivo: null,
  texto: '',
  salvo: false,
  travado: false,
});

/**
 * O cadastro de uma organização. A Recicla Cerrado (PROTOCOLO_DEMO) é o cadastro da volta inteira, o mesmo que o
 * perfil do operador preenche. Desde 16/11/2026 os outros cadastros da fila do Admin também são cadastros completos,
 * cada um na sua store (`useCadastroStore`), com a identidade dele e a gravação numa chave própria.
 */
function setupDoCadastro(protocolo: string, identidade: PreCadastro, chave: string) {
  const salvo = lerPacote(chave);

  const etapa = ref(salvo?.etapa ?? 1);
  const situacao = ref<Situacao>(salvo?.situacao ?? 'preenchendo');
  const formulario = reactive<FormularioComplemento>(salvo?.formulario ?? formularioPadrao());
  const dataEnvio = ref<string | null>(salvo?.dataEnvio ?? null);
  const reenvio = ref(salvo?.reenvio ?? false);
  const analista = ref<string | null>(salvo?.analista ?? null);
  /** Pendências da última devolução, por id de campo ou de documento, com o motivo. */
  const devolvidos = reactive<Record<string, string>>(salvo?.devolvidos ?? {});
  /** Valor do campo no momento da devolução: corrigido é o que mudou. */
  const valoresDevolvidos = reactive<Record<string, string>>(salvo?.valoresDevolvidos ?? {});
  const corrigidos = reactive<Record<string, boolean>>(salvo?.corrigidos ?? {});
  const conferenciaCampos = reactive<Record<string, ConferenciaCampo>>(salvo?.conferenciaCampos ?? {});
  const conferencia = reactive<Record<string, ConferenciaDocumento>>(salvo?.conferencia ?? {});
  const historico = reactive<EventoHistorico[]>(salvo?.historico ?? []);

  // ---- planning de 13/11 ----
  const vencimento = ref<Vencimento | null>(salvo?.vencimento ?? null);
  const troca = reactive<TrocaDeDocumento>(salvo?.troca ?? { arquivo: null, validade: '', enviadoEm: null, recusa: null });
  /** A análise em curso (ou pedida) é só a do documento trocado. */
  const revalidacao = ref(salvo?.revalidacao ?? false);
  /** Data dos eventos quando o exemplo se passa em outro dia (a história da validade é em dezembro). */
  const relogio = ref<string | null>(salvo?.relogio ?? null);
  const quando = () => relogio.value ?? agora();
  /** PROPOSTA para a SEMAD: conferência só em Documentos. */
  // Decidido na planning de 13/11/2026 e confirmado pelo Bruno em 16/11: a análise confere só os documentos. Os dados
  // ficam para consulta e o erro num dado se aponta no bloco. Vale para todo cadastro; o salvo antigo não volta atrás.
  const soDocumentos = ref(true);
  /** Problemas apontados por bloco (chave `etapa-1`, `etapa-3`, `etapa-4`), só na proposta. */
  const problemas = reactive<Record<string, ProblemaDoBloco>>(salvo?.problemas ?? {});
  /** Minha Conta: autorização de compartilhamento dos dados de massa com as Entidades Gestoras. */
  const compartilhaMassa = ref(salvo?.compartilhaMassa ?? true);

  /** Campos que a janela de envio mandou preencher: a etapa abre com eles em erro. */
  const camposEmErro = ref<string[]>([]);

  function persistir() {
    const pacote: PacoteSalvo = {
      etapa: etapa.value,
      situacao: situacao.value,
      formulario,
      dataEnvio: dataEnvio.value,
      reenvio: reenvio.value,
      analista: analista.value,
      devolvidos,
      valoresDevolvidos,
      corrigidos,
      conferenciaCampos,
      conferencia,
      historico,
      vencimento: vencimento.value,
      troca,
      revalidacao: revalidacao.value,
      relogio: relogio.value,
      soDocumentos: soDocumentos.value,
      problemas,
      compartilhaMassa: compartilhaMassa.value,
    };
    try {
      sessionStorage.setItem(chave, JSON.stringify(pacote));
    } catch {
      /* sem storage a demonstração segue, só não sobrevive à recarga */
    }
  }
  watch(
    [
      etapa, situacao, formulario, dataEnvio, reenvio, analista, devolvidos, corrigidos, conferenciaCampos, conferencia,
      historico, vencimento, troca, revalidacao, relogio, soDocumentos, problemas, compartilhaMassa,
    ],
    persistir,
    { deep: true },
  );

  // ---- campos, como a revisão e a análise leem ----
  const ehCooperativa = identidade.tipoOrganizacao === 'cooperativa';

  /** Os campos de uma etapa (1, 3 ou 4), já com as perguntas condicionais resolvidas. */
  function campos(n: number): CampoLido[] {
    const f = formulario;
    const lista: CampoLido[] = [];
    const add = (id: string, grupo: string, rotulo: string, valor: string, bruto: unknown = valor) =>
      lista.push({ id, etapa: n, grupo, rotulo, valor, ok: !vazio(bruto) });

    if (n === 1) {
      const g1 = ehCooperativa ? 'Identificação da cooperativa' : 'Identificação da empresa';
      add('razao-social', g1, 'Razão social', identidade.razaoSocial);
      add('cnpj', g1, 'CNPJ', identidade.cnpj);
      add('cnae', g1, 'CNAE', identidade.cnae);
      add('nome-fantasia', g1, 'Nome fantasia', identidade.nomeFantasia);
      add('email', g1, 'E-mail', identidade.email);
      add('telefone', g1, 'Telefone (com DDD)', f.telefone);
      add('tipo-organizacao', g1, 'Tipo de organização', ROTULO_TIPO[identidade.tipoOrganizacao]);
      if (ehCooperativa) add('cooperados', g1, 'Número de cooperados', f.cooperados);
      add('ano-criacao', g1, 'Ano de criação', f.anoCriacao);
      const g2 = 'Endereço da unidade';
      add('cep', g2, 'CEP', f.cep);
      add('logradouro', g2, 'Logradouro', f.logradouro);
      add('numero', g2, 'Número', f.numero);
      add('estado', g2, 'Estado', f.estado);
      add('municipio', g2, 'Município', f.municipio);
    }
    if (n === 3) {
      const g1 = 'Serviços e beneficiamento';
      add('coleta', g1, 'Realiza serviço de coleta', simNao(f.coleta), f.coleta);
      add('beneficiamentos', g1, 'Beneficiamentos', rotulos(BENEFICIAMENTOS, f.beneficiamentos, f.beneficiamentoOutro), f.beneficiamentos);
      if (f.beneficiamentos.includes('outro')) add('beneficiamento-outro', g1, 'Outro serviço', f.beneficiamentoOutro);
      const g2 = 'Equipamentos da unidade';
      add('equipamentos', g2, 'Equipamentos', rotulos(EQUIPAMENTOS, f.equipamentos, f.equipamentoOutro), f.equipamentos);
      if (f.equipamentos.includes('outro')) add('equipamento-outro', g2, 'Outros equipamentos', f.equipamentoOutro);
      const g3 = 'Resíduos e origem';
      add('residuos', g3, 'Tipos de resíduo', rotulos(TIPOS_RESIDUO, f.residuos, f.residuoOutro), f.residuos);
      if (f.residuos.includes('outro')) add('residuo-outro', g3, 'Outro tipo de resíduo', f.residuoOutro);
      add('origens', g3, 'Origem dos resíduos', rotulos(ORIGENS_RESIDUO, f.origens, f.origemOutra), f.origens);
      if (f.origens.includes('outro')) add('origem-outra', g3, 'Outra origem', f.origemOutra);
      add('outros-municipios', g3, 'Recebe resíduos de outros municípios', simNao(f.outrosMunicipios), f.outrosMunicipios);
      if (f.outrosMunicipios === 'sim') add('quais-municipios', g3, 'Quais municípios', f.quaisMunicipios);
      add('parceria', g3, 'Parceria com o município', simNao(f.parceriaMunicipio), f.parceriaMunicipio);
      add('certificado', g3, 'Comercializa certificado', simNao(f.comercializaCertificado), f.comercializaCertificado);
    }
    if (n === 4) {
      const g1 = 'Área e instalações';
      add('situacao-area', g1, 'Situação da área', f.situacaoArea === 'outro' ? f.situacaoOutra : rotuloDe(SITUACOES_AREA, f.situacaoArea), f.situacaoArea);
      if (f.situacaoArea === 'outro') add('situacao-outra', g1, 'Outra situação', f.situacaoOutra);
      add('areas', g1, 'Áreas da unidade', rotulos(AREAS_UNIDADE, f.areas, f.areaOutra), f.areas);
      if (f.areas.includes('outro')) add('area-outra', g1, 'Outra área', f.areaOutra);
      const g2 = 'Triagem e capacidade';
      add('triagem', g2, 'Triagem dos resíduos', rotuloDe(MODOS_TRIAGEM, f.triagem), f.triagem);
      add('capacidade-operacional', g2, 'Capacidade operacional', f.capacidadeOperacional);
      add('percepcao', g2, 'Percepção da operação', rotuloDe(PERCEPCOES_OPERACAO, f.percepcao), f.percepcao);
      const g3 = 'Beneficiamento de vidro';
      add('beneficia-vidro', g3, 'Realiza beneficiamento do vidro', simNao(f.beneficiaVidro), f.beneficiaVidro);
      if (f.beneficiaVidro === 'sim') {
        add('destinacao-vidro', g3, 'Destinação do vidro', f.destinacaoVidro);
        add('capacidade-vidro', g3, 'Capacidade de beneficiamento', f.capacidadeVidro);
      }
    }
    return lista;
  }

  const ETAPAS_DE_CAMPOS = [1, 3, 4] as const;
  const todosOsCampos = computed(() => ETAPAS_DE_CAMPOS.flatMap((n) => campos(n)));
  const campoPorId = (id: string) => todosOsCampos.value.find((c) => c.id === id);
  const ehDocumento = (id: string) => DOCUMENTOS_EXIGIDOS.some((d) => d.id === id);
  /** Na proposta de 13/11 a pendência pode ser do bloco inteiro: `etapa-1`, `etapa-3`, `etapa-4`. */
  const etapaDoBloco = (id: string) => (id.startsWith('etapa-') ? Number(id.slice(6)) : null);
  const chaveDoBloco = (n: number) => `etapa-${n}`;
  const rotuloDoItem = (id: string) => {
    const bloco = etapaDoBloco(id);
    if (bloco) return ETAPAS[bloco - 1] ?? id;
    return DOCUMENTOS_EXIGIDOS.find((d) => d.id === id)?.rotulo ?? campoPorId(id)?.rotulo ?? id;
  };
  const etapaDoItem = (id: string) => etapaDoBloco(id) ?? (ehDocumento(id) ? 2 : campoPorId(id)?.etapa ?? 1);
  /** Os valores de um bloco num texto só, para saber se algo mudou depois da devolução. */
  const retratoDoBloco = (n: number) => campos(n).map((c) => c.valor).join('|');

  // ---- documentos ----
  const totalDocumentos = DOCUMENTOS_EXIGIDOS.length;
  const documentosAnexados = computed(
    () => DOCUMENTOS_EXIGIDOS.filter((d) => !!formulario.documentos[d.id]?.arquivo).length,
  );
  const documentosSemArquivo = computed(() =>
    DOCUMENTOS_EXIGIDOS.filter((d) => !formulario.documentos[d.id]?.arquivo),
  );

  function anexarArquivo(idDocumento: string) {
    const doc = formulario.documentos[idDocumento];
    const exigido = DOCUMENTOS_EXIGIDOS.find((d) => d.id === idDocumento);
    if (!doc || !exigido) return;
    if (emCorrecao.value && devolvidos[idDocumento] !== undefined) {
      corrigidos[idDocumento] = true;
      return;
    }
    doc.arquivo = exigido.arquivoDemo;
    camposEmErro.value = camposEmErro.value.filter((x) => x !== idDocumento);
  }

  function removerArquivo(idDocumento: string) {
    if (emCorrecao.value && devolvidos[idDocumento] !== undefined) {
      delete corrigidos[idDocumento];
      return;
    }
    const doc = formulario.documentos[idDocumento];
    if (doc) doc.arquivo = null;
  }

  /** Na correção, o arquivo que entra no lugar do recusado. */
  const arquivoNovo = (id: string) => (corrigidos[id] ? arquivoCorrigido(id) : null);

  // ---- pendências do envio (tudo é obrigatório) ----
  const faltando = computed(() => {
    const itens: { id: string; etapa: number; rotulo: string }[] = [];
    for (const c of campos(1)) if (!c.ok) itens.push({ id: c.id, etapa: 1, rotulo: c.rotulo });
    for (const d of documentosSemArquivo.value) itens.push({ id: d.id, etapa: 2, rotulo: d.rotulo });
    for (const n of [3, 4]) for (const c of campos(n)) if (!c.ok) itens.push({ id: c.id, etapa: n, rotulo: c.rotulo });
    return itens;
  });
  const faltandoNaEtapa = (n: number) => faltando.value.filter((x) => x.etapa === n);

  // ---- correção ----
  const emCorrecao = computed(() => situacao.value === 'devolvido');
  const idsDevolvidos = computed(() => Object.keys(devolvidos));
  const devolvidosNaEtapa = (n: number) => idsDevolvidos.value.filter((id) => etapaDoItem(id) === n);
  const itemCorrigido = (id: string) => {
    if (ehDocumento(id)) return !!corrigidos[id];
    const bloco = etapaDoBloco(id);
    if (bloco) return retratoDoBloco(bloco) !== valoresDevolvidos[id];
    const atual = campoPorId(id)?.valor ?? '';
    return atual.trim() !== '' && atual !== valoresDevolvidos[id];
  };
  const faltaCorrigir = computed(() => idsDevolvidos.value.filter((id) => !itemCorrigido(id)));
  /** Na correção, só o que foi devolvido abre para edição. */
  const editavel = (id: string) => {
    if (contaTravada.value) return false;
    if (!emCorrecao.value) return true;
    return devolvidos[id] !== undefined || devolvidos[chaveDoBloco(etapaDoItem(id))] !== undefined;
  };

  // ---- Minha Conta e validade dos documentos (planning de 13/11) ----
  /** O documento novo está com o Admin (na fila ou em conferência). */
  const emConferencia = computed(
    () => situacao.value === 'documento-atualizado' || (situacao.value === 'em-analise' && revalidacao.value),
  );
  const bloqueado = computed(() => situacao.value === 'bloqueado');
  /** Regras de 19/11: vencido, dentro dos 10 dias para trocar. */
  const emRegularizacao = computed(() => situacao.value === 'regularizacao');
  /**
   * O documento acompanhado aceita troca: antes de vencer (os lembretes pedem a troca antecipada), nos 10 dias de
   * regularização e no bloqueio total.
   */
  const trocaAberta = computed(
    () =>
      bloqueado.value ||
      emRegularizacao.value ||
      (situacao.value === 'aprovado' && !!vencimento.value && !vencimento.value.vencido),
  );
  /** O complemento dentro de Minha Conta: aprovado, vencido (parcial ou bloqueado) ou com o documento novo em conferência. */
  const naMinhaConta = computed(
    () => situacao.value === 'aprovado' || trocaAberta.value || emConferencia.value,
  );
  /** Os marcos da validade do documento acompanhado, ou nada. */
  const prazos = computed(() => (vencimento.value ? prazosDaValidade(vencimento.value.venceEm) : null));
  /**
   * Até onde o operador usa o sistema (regras de 19/11):
   * - completo: aprovado, inclusive nos lembretes antes de vencer;
   * - parcial: vencido nos 10 dias, transfere créditos e não inclui nota fiscal nova;
   * - bloqueado: a partir do 11º dia, só a troca do documento.
   * Com o documento novo em conferência, vale a restrição de onde a troca partiu.
   */
  const acesso = computed<'completo' | 'parcial' | 'bloqueado' | null>(() => {
    if (emRegularizacao.value) return 'parcial';
    if (bloqueado.value) return 'bloqueado';
    if (emConferencia.value)
      return troca.origem === 'regularizacao' ? 'parcial' : troca.origem === 'antecipada' ? 'completo' : 'bloqueado';
    if (situacao.value === 'aprovado') return 'completo';
    return null;
  });
  /** Na Minha Conta os dados são só para consulta (a troca do documento vencido tem controle próprio). */
  const contaTravada = computed(() => naMinhaConta.value);
  /** Aprovado, com documento vencendo em 30 dias ou menos: aviso no topo, nada bloqueado. */
  const avisoDeVencimento = computed(() =>
    situacao.value === 'aprovado' && vencimento.value && !vencimento.value.vencido ? vencimento.value : null,
  );
  /** Bloqueado ou em conferência, só a etapa Documentos abre. */
  const etapaAberta = (n: number) => !(bloqueado.value || emConferencia.value) || n === 2;
  const validadeDoDocumento = (id: string) =>
    vencimento.value?.doc === id ? (troca.enviadoEm ? troca.validade : vencimento.value.venceEm) : null;

  /** Erros da troca que o Enviar para conferência apontou. */
  const errosDaTroca = ref<('arquivo' | 'validade')[]>([]);
  const VALIDADE = /^\d{2}\/\d{2}\/\d{4}$/;

  function anexarDocumentoNovo() {
    if (!trocaAberta.value || !vencimento.value) return;
    // anexo simulado: o arquivo novo do exemplo, como no frame
    const doc = vencimento.value.doc;
    troca.arquivo = doc === VALIDADE_DEMO.doc ? VALIDADE_DEMO.arquivoNovo : arquivoCorrigido(doc);
    errosDaTroca.value = errosDaTroca.value.filter((e) => e !== 'arquivo');
  }
  function removerDocumentoNovo() {
    if (trocaAberta.value) troca.arquivo = null;
  }
  function informarValidade(valor: string) {
    troca.validade = valor;
    if (VALIDADE.test(valor.trim())) errosDaTroca.value = errosDaTroca.value.filter((e) => e !== 'validade');
  }

  /**
   * Dia do vencimento (regras de 19/11, itens 2 e 4): a rotina de validade manda o aviso de vencido e o cadastro fica
   * parcialmente ativo por 10 dias corridos. Nada de bloqueio ainda.
   */
  function iniciarRegularizacao() {
    if (situacao.value !== 'aprovado' || !vencimento.value) return;
    vencimento.value.vencido = true;
    situacao.value = 'regularizacao';
    historico.unshift({
      data: quando(),
      titulo: 'Documento vencido',
      desc: `${rotuloDoItem(vencimento.value.doc)} venceu. Prazo para troca até ${prazosDaValidade(vencimento.value.venceEm).prazoAte}; inclusão de notas fiscais suspensa.`,
      quem: 'Rotina de validade',
    });
  }

  /** 11º dia sem a troca (regras de 19/11, item 3): bloqueio total, só a etapa Documentos abre. */
  function bloquearPorVencimento() {
    if (!(situacao.value === 'aprovado' || emRegularizacao.value) || !vencimento.value) return;
    vencimento.value.vencido = true;
    situacao.value = 'bloqueado';
    etapa.value = 2;
    historico.unshift({
      data: quando(),
      titulo: 'Cadastro bloqueado',
      desc: `${rotuloDoItem(vencimento.value.doc)} não foi trocado em 10 dias. Bloqueio total até a regularização.`,
      quem: 'Rotina de validade',
    });
  }

  /** O documento novo volta para o Admin. Até a conferência, segue a restrição de onde a troca partiu. */
  function enviarParaConferencia(): boolean {
    const v = vencimento.value;
    if (!trocaAberta.value || !v) return false;
    const erros: ('arquivo' | 'validade')[] = [];
    if (!troca.arquivo) erros.push('arquivo');
    if (!VALIDADE.test(troca.validade.trim())) erros.push('validade');
    errosDaTroca.value = erros;
    if (erros.length) return false;

    formulario.documentos[v.doc] = { arquivo: troca.arquivo };
    troca.origem = bloqueado.value ? 'bloqueio' : emRegularizacao.value ? 'regularizacao' : 'antecipada';
    troca.enviadoEm = quando();
    troca.recusa = null;
    situacao.value = 'documento-atualizado';
    revalidacao.value = true;
    analista.value = null;
    dataEnvio.value = troca.enviadoEm;
    historico.unshift({
      data: troca.enviadoEm,
      titulo: 'Documento atualizado pelo operador',
      desc: `${rotuloDoItem(v.doc)} novo, com validade até ${troca.validade}.`,
      quem: identidade.nomeFantasia,
    });
    return true;
  }

  function alertaEtapa(n: number): Alerta {
    if (n === 5) return null;
    if (emCorrecao.value) {
      return devolvidosNaEtapa(n).some((id) => !itemCorrigido(id)) ? 'danger' : null;
    }
    // No preenchimento, o alerta só aparece depois de passar pela etapa.
    if (situacao.value === 'preenchendo' && n >= etapa.value) return null;
    return faltandoNaEtapa(n).length ? 'warning' : null;
  }

  // ---- navegação ----
  const totalEtapas = ETAPAS.length;
  function irPara(destino: number) {
    if (destino >= 1 && destino <= totalEtapas && etapaAberta(destino)) etapa.value = destino;
  }
  function avancar() {
    irPara(etapa.value + 1);
  }
  function voltar() {
    irPara(etapa.value - 1);
  }

  /** L7: a janela de envio leva à primeira etapa com falta, com os campos em erro. */
  function irParaOQueFalta() {
    const primeiro = faltando.value[0];
    if (!primeiro) return;
    camposEmErro.value = faltandoNaEtapa(primeiro.etapa).map((x) => x.id);
    irPara(primeiro.etapa);
  }
  const campoEmErro = (id: string) => camposEmErro.value.includes(id) && !campoPorId(id)?.ok;

  // ---- envio e reenvio ----
  const podeEnviar = computed(() => formulario.declaracaoAceita);

  function enviar() {
    if (faltando.value.length || !formulario.declaracaoAceita) return;
    situacao.value = 'enviado';
    dataEnvio.value = quando();
    camposEmErro.value = [];
    historico.unshift({
      data: dataEnvio.value,
      titulo: 'Complemento enviado',
      desc: `Enviado pelo operador, com os ${totalDocumentos} documentos anexados.`,
      quem: identidade.nomeFantasia,
    });
  }

  function reenviar() {
    if (faltaCorrigir.value.length || !formulario.declaracaoAceita) return;
    const n = idsDevolvidos.value.length;
    // A correção vira o dado do cadastro: o arquivo novo entra no lugar do recusado.
    for (const id of idsDevolvidos.value) {
      if (ehDocumento(id) && corrigidos[id]) formulario.documentos[id] = { arquivo: arquivoCorrigido(id) };
    }
    situacao.value = 'enviado';
    reenvio.value = true;
    analista.value = null;
    dataEnvio.value = quando();
    historico.unshift({
      data: dataEnvio.value,
      titulo: 'Reenviado pelo operador',
      desc: `${n} ${n === 1 ? 'pendência corrigida' : 'pendências corrigidas'}. Volta como Enviado, no topo da fila.`,
      quem: identidade.nomeFantasia,
    });
  }

  // ---- edição depois do envio (até a análise começar) ----
  let copiaAntesDaEdicao: string | null = null;

  function comecarEdicao(n: number) {
    copiaAntesDaEdicao = JSON.stringify(formulario);
    irPara(n);
  }
  function descartarEdicao() {
    if (copiaAntesDaEdicao) Object.assign(formulario, JSON.parse(copiaAntesDaEdicao) as FormularioComplemento);
    copiaAntesDaEdicao = null;
  }
  /** Grava a edição. Devolve false quando a análise começou antes (L8): nada é gravado. */
  function salvarEdicao(): boolean {
    if (situacao.value !== 'enviado') {
      descartarEdicao();
      return false;
    }
    copiaAntesDaEdicao = null;
    return true;
  }

  // ---- análise (Admin) ----
  /** Analisar, no menu da linha: atribui a quem clicou e trava o operador. */
  function iniciarAnalise(quem = ANALISTA_DEMO) {
    if (situacao.value === 'documento-atualizado') {
      // Só o documento trocado pede resposta: o resto segue conferido.
      situacao.value = 'em-analise';
      analista.value = quem;
      const doc = vencimento.value?.doc;
      for (const d of DOCUMENTOS_EXIGIDOS) {
        if (d.id === doc) conferencia[d.id] = conferenciaDocVazia();
        else conferencia[d.id] = { ...conferenciaDocVazia(), ...conferencia[d.id], resposta: 'sim', travado: true };
      }
      for (const c of todosOsCampos.value) {
        conferenciaCampos[c.id] = { ...conferenciaCampoVazia(), resposta: 'ok', travado: true };
      }
      historico.unshift({ data: quando(), titulo: 'Conferência do documento iniciada', desc: `Atribuída a ${quem}.`, quem });
      return;
    }
    if (situacao.value !== 'enviado') return;
    situacao.value = 'em-analise';
    analista.value = quem;
    prepararConferencia();
    historico.unshift({ data: quando(), titulo: 'Análise iniciada', desc: `Atribuída a ${quem}.`, quem });
  }

  /** Na reanálise, o que já estava certo chega bloqueado e o devolvido abre de novo. */
  function prepararConferencia() {
    for (const c of todosOsCampos.value) {
      const atual = conferenciaCampos[c.id];
      if (!atual) conferenciaCampos[c.id] = conferenciaCampoVazia();
      else if (reenvio.value) {
        if (devolvidos[c.id] !== undefined) conferenciaCampos[c.id] = conferenciaCampoVazia();
        else atual.travado = atual.resposta === 'ok';
      }
    }
    for (const d of DOCUMENTOS_EXIGIDOS) {
      const atual = conferencia[d.id];
      if (!atual) conferencia[d.id] = conferenciaDocVazia();
      else if (reenvio.value) {
        if (devolvidos[d.id] !== undefined) conferencia[d.id] = conferenciaDocVazia();
        else atual.travado = atual.resposta === 'sim';
      }
    }
    // Na proposta, o problema apontado na análise anterior não volta aberto.
    for (const k of Object.keys(problemas)) delete problemas[k];
  }

  // ---- PROPOSTA de 13/11: problema apontado por bloco ----
  function apontarProblema(n: number) {
    const k = chaveDoBloco(n);
    if (!problemas[k]) problemas[k] = { texto: '', salvo: false };
  }
  function retirarProblema(n: number) {
    delete problemas[chaveDoBloco(n)];
  }
  /** Salvar exige a descrição. Devolve se salvou. */
  function salvarProblema(n: number): boolean {
    const p = problemas[chaveDoBloco(n)];
    if (!p || !p.texto.trim()) return false;
    p.salvo = true;
    return true;
  }
  function editarProblema(n: number) {
    const p = problemas[chaveDoBloco(n)];
    if (p) p.salvo = false;
  }
  const blocosComProblema = computed(() =>
    ETAPAS_DE_CAMPOS.filter((n) => problemas[chaveDoBloco(n)]).map((n) => ({
      etapa: n,
      chave: chaveDoBloco(n),
      rotulo: ETAPAS[n - 1] ?? '',
      ...problemas[chaveDoBloco(n)]!,
    })),
  );

  function marcarCampo(id: string, resposta: 'ok' | 'corrigir') {
    const c = conferenciaCampos[id] ?? (conferenciaCampos[id] = conferenciaCampoVazia());
    if (c.travado) return;
    c.resposta = resposta;
    c.salvo = false;
    if (resposta === 'ok') c.texto = '';
  }

  function marcarDocumento(id: string, resposta: RespostaSimNao) {
    const c = conferencia[id] ?? (conferencia[id] = conferenciaDocVazia());
    if (c.travado) return;
    c.resposta = resposta;
    c.salvo = false;
    if (resposta === 'sim') {
      c.motivo = null;
      c.texto = '';
    }
  }

  /** Salvar exige a descrição (e, no documento, o motivo). Devolve se salvou. */
  function salvarObservacao(id: string): boolean {
    const doc = conferencia[id];
    if (doc) {
      if (!doc.motivo || !doc.texto.trim()) return false;
      doc.salvo = true;
      return true;
    }
    const campo = conferenciaCampos[id];
    if (!campo || !campo.texto.trim()) return false;
    campo.salvo = true;
    return true;
  }
  function editarObservacao(id: string) {
    const alvo = conferencia[id] ?? conferenciaCampos[id];
    if (alvo) alvo.salvo = false;
  }

  const camposConferidos = computed(() => todosOsCampos.value.filter((c) => conferenciaCampos[c.id]?.resposta).length);
  const docsConferidos = computed(() => DOCUMENTOS_EXIGIDOS.filter((d) => conferencia[d.id]?.resposta).length);
  const camposParaCorrigir = computed(() =>
    soDocumentos.value && !revalidacao.value
      ? []
      : todosOsCampos.value.filter((c) => conferenciaCampos[c.id]?.resposta === 'corrigir'),
  );
  /** Documento respondido: Sim, ou Não com o motivo salvo (o Não em edição ainda não conta). */
  const docsRespondidos = computed(
    () =>
      DOCUMENTOS_EXIGIDOS.filter((d) => {
        const c = conferencia[d.id];
        return c?.resposta === 'sim' || (c?.resposta === 'nao' && c.salvo);
      }).length,
  );
  const docsEmNao = computed(() => DOCUMENTOS_EXIGIDOS.filter((d) => conferencia[d.id]?.resposta === 'nao'));
  const problemasNaConta = computed(() => (soDocumentos.value && !revalidacao.value ? blocosComProblema.value : []));
  const totalPendencias = computed(
    () => camposParaCorrigir.value.length + docsEmNao.value.length + problemasNaConta.value.length,
  );
  /** Pendência com a observação ou o motivo ainda aberto: Devolver fica desabilitado. */
  const emEdicao = computed(
    () =>
      camposParaCorrigir.value.some((c) => !conferenciaCampos[c.id]?.salvo) ||
      docsEmNao.value.some((d) => !conferencia[d.id]?.salvo) ||
      problemasNaConta.value.some((p) => !p.salvo),
  );
  const podeDevolver = computed(() => totalPendencias.value > 0 && !emEdicao.value);
  const podeAprovar = computed(
    () =>
      (soDocumentos.value || camposConferidos.value === todosOsCampos.value.length) &&
      docsConferidos.value === totalDocumentos &&
      totalPendencias.value === 0,
  );

  const rotuloMotivo = (m: MotivoAnalise | null) => MOTIVOS_ANALISE.find((x) => x.id === m)?.rotulo ?? '';

  /** Texto que vai no e-mail de correção, montado com as pendências salvas (editável antes do envio). */
  const mensagemPadrao = computed(() => {
    const itens = [
      ...camposParaCorrigir.value.map((c) => `• ${c.rotulo}: ${conferenciaCampos[c.id]?.texto.trim()}`),
      ...problemasNaConta.value.map((p) => `• ${p.rotulo}: ${p.texto.trim()}`),
      ...docsEmNao.value.map((d) => `• ${d.rotulo}: ${conferencia[d.id]?.texto.trim()}`),
    ].join('\n');
    return (
      'Após a análise, identificamos pendências no cadastro da organização como operador logístico.\n\n' +
      `O que precisa ser corrigido:\n${itens}\n\n` +
      'O que você deve fazer:\n1. Corrija os dados e providencie os documentos válidos e atualizados.\n' +
      '2. Atualize o cadastro no sistema.\n3. Envie o cadastro novamente para uma nova análise.'
    );
  });
  const mensagemEnviada = ref('');

  function devolver(mensagem: string) {
    if (revalidacao.value) {
      // O documento novo foi recusado: volta à situação de onde a troca partiu e o operador troca de novo.
      const doc = vencimento.value?.doc ?? '';
      troca.recusa = conferencia[doc]?.texto.trim() ?? '';
      troca.arquivo = null;
      troca.enviadoEm = null;
      mensagemEnviada.value = mensagem;
      situacao.value =
        troca.origem === 'regularizacao' ? 'regularizacao' : troca.origem === 'antecipada' ? 'aprovado' : 'bloqueado';
      etapa.value = 2;
      historico.unshift({
        data: quando(),
        titulo: 'Documento recusado',
        desc: `${rotuloDoItem(doc)}: ${troca.recusa} E-mail enviado ao operador.`,
        quem: analista.value ?? ANALISTA_DEMO,
      });
      return;
    }
    for (const k of Object.keys(devolvidos)) delete devolvidos[k];
    for (const k of Object.keys(valoresDevolvidos)) delete valoresDevolvidos[k];
    for (const k of Object.keys(corrigidos)) delete corrigidos[k];
    for (const c of camposParaCorrigir.value) {
      devolvidos[c.id] = conferenciaCampos[c.id]?.texto.trim() ?? '';
      valoresDevolvidos[c.id] = c.valor;
    }
    for (const p of problemasNaConta.value) {
      devolvidos[p.chave] = p.texto.trim();
      valoresDevolvidos[p.chave] = retratoDoBloco(p.etapa);
    }
    for (const d of docsEmNao.value) devolvidos[d.id] = conferencia[d.id]?.texto.trim() ?? '';
    const n = idsDevolvidos.value.length;
    mensagemEnviada.value = mensagem;
    situacao.value = 'devolvido';
    etapa.value = Math.min(...idsDevolvidos.value.map(etapaDoItem));
    historico.unshift({
      data: quando(),
      titulo: 'Devolvido para correção',
      desc: `${n} ${n === 1 ? 'pendência' : 'pendências'}: ${idsDevolvidos.value.map(rotuloDoItem).join(' e ')}. E-mail enviado ao operador.`,
      quem: analista.value ?? ANALISTA_DEMO,
    });
  }

  function aprovar() {
    if (!podeAprovar.value) return;
    situacao.value = 'aprovado';
    etapa.value = 1;
    if (revalidacao.value) {
      revalidacao.value = false;
      vencimento.value = null;
      troca.origem = null;
      historico.unshift({
        data: quando(),
        titulo: 'Documento conferido',
        desc: 'Documento atualizado em conformidade. O cadastro voltou a ficar aprovado.',
        quem: analista.value ?? ANALISTA_DEMO,
      });
      return;
    }
    historico.unshift({
      data: quando(),
      titulo: 'Cadastro aprovado',
      desc: soDocumentos.value
        ? 'Todos os documentos em conformidade. E-mail de aprovação enviado com o manual em anexo.'
        : 'Todos os campos corretos e os documentos em conformidade. E-mail de aprovação enviado com o manual em anexo.',
      quem: analista.value ?? ANALISTA_DEMO,
    });
  }


  return {
    // planning de 13/11: Minha Conta e validade
    vencimento,
    troca,
    revalidacao,
    relogio,
    emConferencia,
    bloqueado,
    emRegularizacao,
    trocaAberta,
    prazos,
    acesso,
    iniciarRegularizacao,
    naMinhaConta,
    contaTravada,
    avisoDeVencimento,
    etapaAberta,
    validadeDoDocumento,
    errosDaTroca,
    anexarDocumentoNovo,
    removerDocumentoNovo,
    informarValidade,
    enviarParaConferencia,
    bloquearPorVencimento,
    compartilhaMassa,
    // proposta de 13/11: conferência só em Documentos
    soDocumentos,
    problemas,
    blocosComProblema,
    apontarProblema,
    retirarProblema,
    salvarProblema,
    editarProblema,
    docsRespondidos,
    etapa,
    situacao,
    formulario,
    dataEnvio,
    reenvio,
    analista,
    protocolo,
    identidade,
    historico,
    // campos
    campos,
    todosOsCampos,
    campoPorId,
    rotuloDoItem,
    etapaDoItem,
    ehDocumento,
    // documentos
    totalDocumentos,
    documentosAnexados,
    documentosSemArquivo,
    anexarArquivo,
    removerArquivo,
    arquivoNovo,
    // envio
    faltando,
    faltandoNaEtapa,
    camposEmErro,
    campoEmErro,
    irParaOQueFalta,
    podeEnviar,
    enviar,
    reenviar,
    // correção
    emCorrecao,
    devolvidos,
    idsDevolvidos,
    devolvidosNaEtapa,
    corrigidos,
    itemCorrigido,
    faltaCorrigir,
    editavel,
    alertaEtapa,
    // navegação
    irPara,
    avancar,
    voltar,
    // edição depois do envio
    comecarEdicao,
    descartarEdicao,
    salvarEdicao,
    // análise
    iniciarAnalise,
    prepararConferencia,
    conferenciaCampos,
    conferencia,
    marcarCampo,
    marcarDocumento,
    salvarObservacao,
    editarObservacao,
    camposConferidos,
    docsConferidos,
    camposParaCorrigir,
    docsEmNao,
    totalPendencias,
    emEdicao,
    podeDevolver,
    podeAprovar,
    rotuloMotivo,
    mensagemPadrao,
    mensagemEnviada,
    devolver,
    aprovar,
    alternarOpcao(lista: string[], id: string) {
      const posicao = lista.indexOf(id);
      if (posicao >= 0) lista.splice(posicao, 1);
      else lista.push(id);
    },
  };
}

export const useComplementoStore = defineStore('complemento', () =>
  setupDoCadastro(PROTOCOLO_DEMO, PRE_CADASTRO, CHAVE_COMPLEMENTO),
);

export type StoreDoCadastro = ReturnType<typeof useComplementoStore>;

/** Quem monta o estado inicial de um cadastro de exemplo (a camada do protótipo registra; sem ela, ele nasce vazio). */
type Semeador = (c: StoreDoCadastro, protocolo: string) => void;
let semeador: Semeador | null = null;
export function registrarSemeadorDeExemplos(fn: Semeador): void {
  semeador = fn;
}

const definicoes = new Map<string, () => StoreDoCadastro>();

/** O cadastro do protocolo: o da Recicla Cerrado ou um da fila de exemplos. Null quando o protocolo não existe. */
export function useCadastroStore(protocolo: string): StoreDoCadastro | null {
  const p = protocolo.toLowerCase();
  if (p === PROTOCOLO_DEMO.toLowerCase()) return useComplementoStore();
  const exemplo = cadastroDeExemplo(p);
  if (!exemplo) return null;
  let usar = definicoes.get(p);
  if (!usar) {
    const chave = `${CHAVE_COMPLEMENTO}:${p}`;
    usar = defineStore(`complemento:${p}`, () => setupDoCadastro(exemplo.protocolo, exemplo, chave)) as unknown as () => StoreDoCadastro;
    definicoes.set(p, usar);
  }
  const c = usar();
  if (c.situacao === 'preenchendo' && semeador) semeador(c, exemplo.protocolo);
  return c;
}

/** A página da análise entrega o cadastro aberto aos componentes dela. */
export const CADASTRO_ABERTO: InjectionKey<StoreDoCadastro> = Symbol('cadastro-aberto');
/** O cadastro aberto na página (os componentes da análise do Admin); fora dela, o da Recicla Cerrado. */
export function useCadastroAtual(): StoreDoCadastro {
  return inject(CADASTRO_ABERTO, null) ?? useComplementoStore();
}
