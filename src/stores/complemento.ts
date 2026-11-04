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
 * Persistência: tudo vai para `sessionStorage`, inclusive o preenchimento, para
 * a demonstração trocar de perfil em /entrar e seguir a volta completa.
 */
import { defineStore } from 'pinia';
import { computed, reactive, ref, watch } from 'vue';

import {
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
  ROTULO_TIPO,
  SITUACOES_AREA,
  TIPOS_RESIDUO,
  type MotivoAnalise,
  type Opcao,
} from '@/data/mocks/operador';

export const CHAVE_COMPLEMENTO = 'rg:complemento:v2';

export type RespostaSimNao = 'sim' | 'nao' | null;
export type Situacao = 'preenchendo' | 'enviado' | 'em-analise' | 'devolvido' | 'aprovado';
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

function lerPacote(): PacoteSalvo | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE_COMPLEMENTO);
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

export const useComplementoStore = defineStore('complemento', () => {
  const salvo = lerPacote();

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
    };
    try {
      sessionStorage.setItem(CHAVE_COMPLEMENTO, JSON.stringify(pacote));
    } catch {
      /* sem storage a demonstração segue, só não sobrevive à recarga */
    }
  }
  watch(
    [etapa, situacao, formulario, dataEnvio, reenvio, analista, devolvidos, corrigidos, conferenciaCampos, conferencia, historico],
    persistir,
    { deep: true },
  );

  // ---- campos, como a revisão e a análise leem ----
  const ehCooperativa = PRE_CADASTRO.tipoOrganizacao === 'cooperativa';

  /** Os campos de uma etapa (1, 3 ou 4), já com as perguntas condicionais resolvidas. */
  function campos(n: number): CampoLido[] {
    const f = formulario;
    const lista: CampoLido[] = [];
    const add = (id: string, grupo: string, rotulo: string, valor: string, bruto: unknown = valor) =>
      lista.push({ id, etapa: n, grupo, rotulo, valor, ok: !vazio(bruto) });

    if (n === 1) {
      const g1 = ehCooperativa ? 'Identificação da cooperativa' : 'Identificação da empresa';
      add('razao-social', g1, 'Razão social', PRE_CADASTRO.razaoSocial);
      add('cnpj', g1, 'CNPJ', PRE_CADASTRO.cnpj);
      add('cnae', g1, 'CNAE', PRE_CADASTRO.cnae);
      add('nome-fantasia', g1, 'Nome fantasia', PRE_CADASTRO.nomeFantasia);
      add('email', g1, 'E-mail', PRE_CADASTRO.email);
      add('telefone', g1, 'Telefone (com DDD)', f.telefone);
      add('tipo-organizacao', g1, 'Tipo de organização', ROTULO_TIPO[PRE_CADASTRO.tipoOrganizacao]);
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
  const rotuloDoItem = (id: string) =>
    DOCUMENTOS_EXIGIDOS.find((d) => d.id === id)?.rotulo ?? campoPorId(id)?.rotulo ?? id;
  const etapaDoItem = (id: string) => (ehDocumento(id) ? 2 : campoPorId(id)?.etapa ?? 1);

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
    const atual = campoPorId(id)?.valor ?? '';
    return atual.trim() !== '' && atual !== valoresDevolvidos[id];
  };
  const faltaCorrigir = computed(() => idsDevolvidos.value.filter((id) => !itemCorrigido(id)));
  /** Na correção, só o que foi devolvido abre para edição. */
  const editavel = (id: string) => !emCorrecao.value || devolvidos[id] !== undefined;

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
    if (destino >= 1 && destino <= totalEtapas) etapa.value = destino;
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
  const protocolo = PROTOCOLO_DEMO;

  function enviar() {
    if (faltando.value.length || !formulario.declaracaoAceita) return;
    situacao.value = 'enviado';
    dataEnvio.value = agora();
    camposEmErro.value = [];
    historico.unshift({
      data: dataEnvio.value,
      titulo: 'Complemento enviado',
      desc: `Enviado pelo operador, com os ${totalDocumentos} documentos anexados.`,
      quem: PRE_CADASTRO.nomeFantasia,
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
    dataEnvio.value = agora();
    historico.unshift({
      data: dataEnvio.value,
      titulo: 'Reenviado pelo operador',
      desc: `${n} ${n === 1 ? 'pendência corrigida' : 'pendências corrigidas'}. Volta como Enviado, no topo da fila.`,
      quem: PRE_CADASTRO.nomeFantasia,
    });
  }

  // ---- edição depois do envio (até a análise começar) ----
  let copiaAntesDaEdicao: string | null = null;
  /** Ferramenta de protótipo: a análise começa enquanto o operador edita (L8). */
  const simularAnaliseNaGravacao = ref(false);

  function comecarEdicao(n: number) {
    copiaAntesDaEdicao = JSON.stringify(formulario);
    irPara(n);
  }
  function descartarEdicao() {
    if (copiaAntesDaEdicao) Object.assign(formulario, JSON.parse(copiaAntesDaEdicao) as FormularioComplemento);
    copiaAntesDaEdicao = null;
  }
  /** Grava a edição. Devolve false quando a análise começou antes: nada é gravado. */
  function salvarEdicao(): boolean {
    if (simularAnaliseNaGravacao.value) {
      simularAnaliseNaGravacao.value = false;
      iniciarAnalise();
    }
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
    if (situacao.value !== 'enviado') return;
    situacao.value = 'em-analise';
    analista.value = quem;
    prepararConferencia();
    historico.unshift({ data: agora(), titulo: 'Análise iniciada', desc: `Atribuída a ${quem}.`, quem });
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
  }

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
    todosOsCampos.value.filter((c) => conferenciaCampos[c.id]?.resposta === 'corrigir'),
  );
  const docsEmNao = computed(() => DOCUMENTOS_EXIGIDOS.filter((d) => conferencia[d.id]?.resposta === 'nao'));
  const totalPendencias = computed(() => camposParaCorrigir.value.length + docsEmNao.value.length);
  /** Pendência com a observação ou o motivo ainda aberto: Devolver fica desabilitado. */
  const emEdicao = computed(
    () =>
      camposParaCorrigir.value.some((c) => !conferenciaCampos[c.id]?.salvo) ||
      docsEmNao.value.some((d) => !conferencia[d.id]?.salvo),
  );
  const podeDevolver = computed(() => totalPendencias.value > 0 && !emEdicao.value);
  const podeAprovar = computed(
    () =>
      camposConferidos.value === todosOsCampos.value.length &&
      docsConferidos.value === totalDocumentos &&
      totalPendencias.value === 0,
  );

  const rotuloMotivo = (m: MotivoAnalise | null) => MOTIVOS_ANALISE.find((x) => x.id === m)?.rotulo ?? '';

  /** Texto que vai no e-mail de correção, montado com as pendências salvas (editável antes do envio). */
  const mensagemPadrao = computed(() => {
    const itens = [
      ...camposParaCorrigir.value.map((c) => `• ${c.rotulo}: ${conferenciaCampos[c.id]?.texto.trim()}`),
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
    for (const k of Object.keys(devolvidos)) delete devolvidos[k];
    for (const k of Object.keys(valoresDevolvidos)) delete valoresDevolvidos[k];
    for (const k of Object.keys(corrigidos)) delete corrigidos[k];
    for (const c of camposParaCorrigir.value) {
      devolvidos[c.id] = conferenciaCampos[c.id]?.texto.trim() ?? '';
      valoresDevolvidos[c.id] = c.valor;
    }
    for (const d of docsEmNao.value) devolvidos[d.id] = conferencia[d.id]?.texto.trim() ?? '';
    const n = idsDevolvidos.value.length;
    mensagemEnviada.value = mensagem;
    situacao.value = 'devolvido';
    etapa.value = Math.min(...idsDevolvidos.value.map(etapaDoItem));
    historico.unshift({
      data: agora(),
      titulo: 'Devolvido para correção',
      desc: `${n} ${n === 1 ? 'pendência' : 'pendências'}: ${idsDevolvidos.value.map(rotuloDoItem).join(' e ')}. E-mail enviado ao operador.`,
      quem: analista.value ?? ANALISTA_DEMO,
    });
  }

  function aprovar() {
    if (!podeAprovar.value) return;
    situacao.value = 'aprovado';
    historico.unshift({
      data: agora(),
      titulo: 'Cadastro aprovado',
      desc: 'Todos os campos corretos e os documentos em conformidade. E-mail de aprovação enviado com o manual em anexo.',
      quem: analista.value ?? ANALISTA_DEMO,
    });
  }

  /** Ferramenta de protótipo: volta ao estado de demonstração inicial. */
  function reiniciar() {
    try {
      sessionStorage.removeItem(CHAVE_COMPLEMENTO);
    } catch {
      /* ok */
    }
    Object.assign(formulario, formularioPadrao());
    for (const obj of [devolvidos, valoresDevolvidos, corrigidos, conferenciaCampos, conferencia] as Record<string, unknown>[]) {
      for (const k of Object.keys(obj)) delete obj[k];
    }
    historico.splice(0);
    etapa.value = 1;
    situacao.value = 'preenchendo';
    dataEnvio.value = null;
    reenvio.value = false;
    analista.value = null;
    camposEmErro.value = [];
    simularAnaliseNaGravacao.value = false;
  }

  /**
   * Ferramenta de protótipo: cenários de partida para os fluxos guiados, pelo
   * endereço (`?demo=`). Assim o fluxo do Admin começa com o cadastro já
   * enviado, sem trocar de perfil no meio. Os passos são os mesmos da tela.
   * - enviado: tudo preenchido e enviado em 01/09.
   * - devolvido: a análise devolveu o telefone e o alvará (L2·3).
   * - corrigido: o operador corrigiu os dois e reenviou (L3·5, L4·1).
   */
  function aplicarDemo(nome: string) {
    if (!['enviado', 'devolvido', 'corrigido'].includes(nome)) return;
    reiniciar();
    formulario.capacidadeVidro = '8 toneladas por mês';
    enviar();
    dataEnvio.value = '01/09/2026, às 10h12';
    historico[0]!.data = dataEnvio.value;
    if (nome === 'enviado') return;

    iniciarAnalise();
    for (const c of todosOsCampos.value) marcarCampo(c.id, c.id === 'telefone' ? 'corrigir' : 'ok');
    conferenciaCampos.telefone!.texto = 'O telefone informado não atende. Informe um número ativo, com DDD.';
    conferenciaCampos.telefone!.salvo = true;
    for (const d of DOCUMENTOS_EXIGIDOS) marcarDocumento(d.id, d.id === 'alvara' ? 'nao' : 'sim');
    conferencia.alvara!.motivo = 'vencido';
    conferencia.alvara!.texto = 'O documento apresentado está vencido desde março de 2026. Anexe o alvará válido e atualizado.';
    conferencia.alvara!.salvo = true;
    devolver(mensagemPadrao.value);
    if (nome === 'devolvido') return;

    formulario.telefone = '(62) 3555-0198';
    corrigidos.alvara = true;
    reenviar();
  }

  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    const demo = url.searchParams.get('demo');
    if (demo) {
      aplicarDemo(demo);
      url.searchParams.delete('demo');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
  }

  return {
    aplicarDemo,
    etapa,
    situacao,
    formulario,
    dataEnvio,
    reenvio,
    analista,
    protocolo,
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
    simularAnaliseNaGravacao,
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
    reiniciar,
    alternarOpcao(lista: string[], id: string) {
      const posicao = lista.indexOf(id);
      if (posicao >= 0) lista.splice(posicao, 1);
      else lista.push(id);
    },
  };
});
