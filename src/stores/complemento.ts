/**
 * Estado do complemento de cadastro do Operador Logístico e da análise dele.
 *
 * As regras de UX moram aqui, não nos componentes (mesma filosofia da store
 * `explorador`): responder "Não" a um documento apaga o anexo, "outro" fora da
 * lista limpa a descrição e o envio só libera com a declaração aceita.
 *
 * Rodada SEMAD (15/09): a conta tem uma situação, que a análise do Admin muda.
 * preenchendo → em-analise → devolvido → reenviado → aprovado. O "reprovado com
 * acesso encerrado" saiu: o único desfecho negativo é a correção.
 *
 * Persistência: o preenchimento em andamento não é gravado (decisão de 31/08).
 * Depois do envio, tudo vai para `sessionStorage`, para a demonstração trocar de
 * perfil em /entrar e seguir a volta completa entre operador e analista.
 */
import { defineStore } from 'pinia';
import { computed, reactive, ref, watch } from 'vue';

import {
  DOCUMENTOS_EXIGIDOS,
  ETAPAS,
  MOTIVOS_ANALISE,
  PRE_CADASTRO,
  PROTOCOLO_DEMO,
  type MotivoAnalise,
} from '@/data/mocks/operador';

const CHAVE_STORAGE = 'rg:complemento:rascunho';

export type RespostaSimNao = 'sim' | 'nao' | null;
export type Situacao = 'preenchendo' | 'em-analise' | 'devolvido' | 'reenviado' | 'aprovado';
export type Alerta = 'warning' | 'danger' | null;

export interface EstadoDocumento {
  possui: RespostaSimNao;
  arquivo: string | null;
}

export interface Conferencia {
  resposta: RespostaSimNao;
  motivo: MotivoAnalise | null;
  texto: string;
  /** Conferido numa análise anterior: na reanálise chega travado. */
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
  devolvidos: Record<string, string>;
  corrigidos: Record<string, boolean>;
  conferencia: Record<string, Conferencia>;
  historico: EventoHistorico[];
}

/**
 * Estado de demonstração, igual aos frames do Figma: 10 de 11 documentos, a
 * declaração de capacidade como "Não" e a capacidade do vidro em branco.
 */
function formularioPadrao(): FormularioComplemento {
  const documentos: Record<string, EstadoDocumento> = {};
  for (const doc of DOCUMENTOS_EXIGIDOS) {
    documentos[doc.id] = { possui: 'sim', arquivo: doc.arquivoDemo };
  }
  documentos.capacidade = { possui: 'nao', arquivo: null };

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
    declaracaoAceita: false,
  };
}

function lerPacote(): PacoteSalvo | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE_STORAGE);
    if (!bruto) return null;
    const pacote = JSON.parse(bruto) as PacoteSalvo;
    return pacote.situacao && pacote.situacao !== 'preenchendo' ? pacote : null;
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

export const useComplementoStore = defineStore('complemento', () => {
  const salvo = lerPacote();

  const etapa = ref(salvo?.etapa ?? 1);
  const situacao = ref<Situacao>(salvo?.situacao ?? 'preenchendo');
  const formulario = reactive<FormularioComplemento>(salvo?.formulario ?? formularioPadrao());
  const dataEnvio = ref<string | null>(salvo?.dataEnvio ?? null);
  const devolvidos = reactive<Record<string, string>>(salvo?.devolvidos ?? {});
  const corrigidos = reactive<Record<string, boolean>>(salvo?.corrigidos ?? {});
  const conferencia = reactive<Record<string, Conferencia>>(salvo?.conferencia ?? {});
  const historico = reactive<EventoHistorico[]>(salvo?.historico ?? []);

  function persistir() {
    if (situacao.value === 'preenchendo') return;
    const pacote: PacoteSalvo = {
      etapa: etapa.value,
      situacao: situacao.value,
      formulario,
      dataEnvio: dataEnvio.value,
      devolvidos,
      corrigidos,
      conferencia,
      historico,
    };
    try {
      sessionStorage.setItem(CHAVE_STORAGE, JSON.stringify(pacote));
    } catch {
      /* sem storage a demonstração segue, só não sobrevive à recarga */
    }
  }
  watch([situacao, etapa, formulario, devolvidos, corrigidos, conferencia, historico], persistir, {
    deep: true,
  });

  // ---- documentos ----
  const totalDocumentos = DOCUMENTOS_EXIGIDOS.length;
  const documentosAnexados = computed(
    () =>
      DOCUMENTOS_EXIGIDOS.filter((d) => {
        const doc = formulario.documentos[d.id];
        return doc?.possui === 'sim' && doc.arquivo !== null;
      }).length,
  );
  const documentosSemPossuir = computed(() =>
    DOCUMENTOS_EXIGIDOS.filter((d) => formulario.documentos[d.id]?.possui === 'nao'),
  );
  const documentosAguardandoArquivo = computed(() =>
    DOCUMENTOS_EXIGIDOS.filter((d) => {
      const doc = formulario.documentos[d.id];
      return doc?.possui === 'sim' && doc.arquivo === null;
    }),
  );
  const totalPendencias = computed(
    () => documentosSemPossuir.value.length + documentosAguardandoArquivo.value.length,
  );

  const emCorrecao = computed(() => situacao.value === 'devolvido');
  const idsDevolvidos = computed(() => Object.keys(devolvidos));
  const docCorrigido = (id: string) => {
    const doc = formulario.documentos[id];
    return !!corrigidos[id] && doc?.possui === 'sim' && doc.arquivo !== null;
  };
  const faltaCorrigir = computed(() => idsDevolvidos.value.filter((id) => !docCorrigido(id)));

  function definirPossui(idDocumento: string, resposta: RespostaSimNao) {
    const doc = formulario.documentos[idDocumento];
    if (!doc) return;
    doc.possui = resposta;
    // Regra: "Não" não guarda arquivo — vira pendência declarada.
    if (resposta !== 'sim') doc.arquivo = null;
  }

  function anexarArquivo(idDocumento: string) {
    const doc = formulario.documentos[idDocumento];
    const exigido = DOCUMENTOS_EXIGIDOS.find((d) => d.id === idDocumento);
    if (!doc || !exigido) return;
    if (emCorrecao.value && devolvidos[idDocumento] !== undefined) {
      doc.possui = 'sim';
      doc.arquivo = arquivoCorrigido(idDocumento);
      corrigidos[idDocumento] = true;
      return;
    }
    doc.arquivo = exigido.arquivoDemo;
  }

  function removerArquivo(idDocumento: string) {
    const doc = formulario.documentos[idDocumento];
    if (doc) doc.arquivo = null;
    delete corrigidos[idDocumento];
  }

  // ---- campos preenchidos por etapa (SEMAD-15) ----
  const vazio = (v: unknown) =>
    v === null || v === undefined || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);

  function campos(n: number): { rotulo: string; ok: boolean }[] {
    const f = formulario;
    const c = (rotulo: string, v: unknown) => ({ rotulo, ok: !vazio(v) });
    if (n === 1) {
      return [
        c('Razão social', PRE_CADASTRO.razaoSocial),
        c('Nome fantasia', PRE_CADASTRO.nomeFantasia),
        c('CNPJ', PRE_CADASTRO.cnpj),
        c('E-mail', PRE_CADASTRO.email),
        c('Tipo de organização', PRE_CADASTRO.tipoOrganizacao),
        c('Telefone', f.telefone),
        ...(PRE_CADASTRO.tipoOrganizacao === 'cooperativa' ? [c('Número de cooperados', f.cooperados)] : []),
        c('Ano de criação', f.anoCriacao),
        c('CEP', f.cep),
        c('Logradouro', f.logradouro),
        c('Número', f.numero),
        c('Estado', f.estado),
        c('Município', f.municipio),
      ];
    }
    if (n === 3) {
      return [
        c('Serviço de coleta', f.coleta),
        c('Beneficiamentos', f.beneficiamentos),
        ...(f.beneficiamentos.includes('outro') ? [c('Outro serviço', f.beneficiamentoOutro)] : []),
        c('Equipamentos', f.equipamentos),
        ...(f.equipamentos.includes('outro') ? [c('Outros equipamentos', f.equipamentoOutro)] : []),
        c('Tipos de resíduo', f.residuos),
        c('Origem dos resíduos', f.origens),
        c('Resíduos de outros municípios', f.outrosMunicipios),
        ...(f.outrosMunicipios === 'sim' ? [c('Quais municípios', f.quaisMunicipios)] : []),
        c('Parceria com o município', f.parceriaMunicipio),
        c('Comercializa certificado', f.comercializaCertificado),
      ];
    }
    if (n === 4) {
      return [
        c('Situação da área', f.situacaoArea),
        c('Áreas da unidade', f.areas),
        c('Triagem', f.triagem),
        c('Capacidade operacional', f.capacidadeOperacional),
        c('Percepção da operação', f.percepcao),
        c('Beneficia vidro', f.beneficiaVidro),
        ...(f.beneficiaVidro === 'sim'
          ? [c('Destinação do vidro', f.destinacaoVidro), c('Capacidade de beneficiamento do vidro', f.capacidadeVidro)]
          : []),
      ];
    }
    return [];
  }

  function alertaEtapa(n: number): Alerta {
    if (n === 2) {
      if (emCorrecao.value && faltaCorrigir.value.length > 0) return 'danger';
      if (emCorrecao.value) return null;
      return totalPendencias.value > 0 ? 'warning' : null;
    }
    if (n === 5) return null;
    return campos(n).some((x) => !x.ok) ? 'warning' : null;
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

  // ---- envio e reenvio ----
  const podeEnviar = computed(() => formulario.declaracaoAceita);
  const podeReenviar = computed(() => formulario.declaracaoAceita && faltaCorrigir.value.length === 0);
  const protocolo = PROTOCOLO_DEMO;

  function enviar() {
    if (!podeEnviar.value) return;
    situacao.value = 'em-analise';
    dataEnvio.value = agora();
    historico.unshift({
      data: dataEnvio.value,
      titulo: 'Complemento enviado',
      desc: `Enviado pelo operador, com ${documentosAnexados.value} de ${totalDocumentos} documentos anexados.`,
      quem: PRE_CADASTRO.nomeFantasia,
    });
  }

  function reenviar() {
    if (!podeReenviar.value) return;
    situacao.value = 'reenviado';
    historico.unshift({
      data: agora(),
      titulo: 'Reenviado pelo operador',
      desc: `${idsDevolvidos.value.length} ${idsDevolvidos.value.length === 1 ? 'documento atualizado' : 'documentos atualizados'} na correção.`,
      quem: PRE_CADASTRO.nomeFantasia,
    });
  }

  // ---- análise (Admin) ----
  /** Prepara o checklist ao abrir: "Não" do operador chega marcado; na reanálise, o conferido trava. */
  function prepararConferencia() {
    for (const d of DOCUMENTOS_EXIGIDOS) {
      const atual = conferencia[d.id];
      if (situacao.value === 'reenviado') {
        if (devolvidos[d.id] !== undefined) {
          conferencia[d.id] = { resposta: null, motivo: null, texto: '', travado: false };
        } else if (atual) {
          atual.travado = atual.resposta === 'sim';
        }
        continue;
      }
      if (atual) continue;
      const naoTem = formulario.documentos[d.id]?.possui !== 'sim' || !formulario.documentos[d.id]?.arquivo;
      conferencia[d.id] = naoTem
        ? { resposta: 'nao', motivo: 'nao-enviado', texto: 'Documento não enviado.', travado: false }
        : { resposta: null, motivo: null, texto: '', travado: false };
    }
  }

  function marcar(id: string, resposta: RespostaSimNao) {
    const c = conferencia[id];
    if (!c || c.travado) return;
    c.resposta = resposta;
    if (resposta === 'sim') {
      c.motivo = null;
      c.texto = '';
    }
  }

  const conferidos = computed(() => DOCUMENTOS_EXIGIDOS.filter((d) => conferencia[d.id]?.resposta).length);
  const emNao = computed(() => DOCUMENTOS_EXIGIDOS.filter((d) => conferencia[d.id]?.resposta === 'nao'));
  const semMotivo = computed(() =>
    emNao.value.filter((d) => !conferencia[d.id]?.motivo || !conferencia[d.id]?.texto.trim()),
  );
  const podeAprovar = computed(() => conferidos.value === totalDocumentos && emNao.value.length === 0);

  const rotuloMotivo = (m: MotivoAnalise | null) => MOTIVOS_ANALISE.find((x) => x.id === m)?.rotulo ?? '';

  /** Texto que vai no e-mail de correção, montado com os motivos (editável antes do envio). */
  const mensagemPadrao = computed(() => {
    const itens = emNao.value.map((d) => `• ${d.rotulo}: ${conferencia[d.id]?.texto.trim()}`).join('\n');
    return (
      'Após a análise, identificamos pendências no cadastro da cooperativa como operador logístico.\n\n' +
      `O que precisa ser corrigido:\n${itens}\n\n` +
      'O que você deve fazer:\n1. Providencie os documentos válidos e atualizados.\n' +
      '2. Atualize os documentos no sistema.\n3. Envie o cadastro novamente para uma nova análise.'
    );
  });
  const mensagemEnviada = ref('');

  function devolver(mensagem: string) {
    for (const k of Object.keys(devolvidos)) delete devolvidos[k];
    for (const k of Object.keys(corrigidos)) delete corrigidos[k];
    for (const d of emNao.value) devolvidos[d.id] = conferencia[d.id]?.texto.trim() ?? '';
    mensagemEnviada.value = mensagem;
    situacao.value = 'devolvido';
    etapa.value = 2;
    formulario.declaracaoAceita = false;
    historico.unshift({
      data: agora(),
      titulo: 'Devolvido para correção',
      desc: emNao.value.map((d) => d.rotulo).join(' e ') + '. E-mail enviado ao operador.',
      quem: 'Analista da SEMAD',
    });
  }

  function aprovar() {
    if (!podeAprovar.value) return;
    situacao.value = 'aprovado';
    historico.unshift({
      data: agora(),
      titulo: 'Cadastro aprovado',
      desc: 'Todos os documentos em conformidade. E-mail de aprovação enviado com o manual em anexo.',
      quem: 'Analista da SEMAD',
    });
  }

  /** Ferramenta de protótipo: volta ao estado de demonstração inicial. */
  function reiniciar() {
    try {
      sessionStorage.removeItem(CHAVE_STORAGE);
    } catch {
      /* ok */
    }
    Object.assign(formulario, formularioPadrao());
    for (const obj of [devolvidos, corrigidos, conferencia] as Record<string, unknown>[]) {
      for (const k of Object.keys(obj)) delete obj[k];
    }
    historico.splice(0);
    etapa.value = 1;
    situacao.value = 'preenchendo';
    dataEnvio.value = null;
  }

  return {
    etapa,
    situacao,
    formulario,
    totalDocumentos,
    documentosAnexados,
    documentosSemPossuir,
    documentosAguardandoArquivo,
    totalPendencias,
    emCorrecao,
    devolvidos,
    corrigidos,
    idsDevolvidos,
    faltaCorrigir,
    docCorrigido,
    definirPossui,
    anexarArquivo,
    removerArquivo,
    campos,
    alertaEtapa,
    irPara,
    avancar,
    voltar,
    podeEnviar,
    podeReenviar,
    protocolo,
    dataEnvio,
    enviar,
    reenviar,
    conferencia,
    prepararConferencia,
    marcar,
    conferidos,
    emNao,
    semMotivo,
    podeAprovar,
    rotuloMotivo,
    mensagemPadrao,
    mensagemEnviada,
    devolver,
    aprovar,
    historico,
    reiniciar,
    // compatibilidade com a tela de envio
    alternarOpcao(lista: string[], id: string) {
      const posicao = lista.indexOf(id);
      if (posicao >= 0) lista.splice(posicao, 1);
      else lista.push(id);
    },
  };
});
