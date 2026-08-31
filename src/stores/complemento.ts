/**
 * Estado do complemento de cadastro do Operador Logístico.
 *
 * As regras de UX moram aqui, não nos componentes (mesma filosofia da store
 * `explorador`): responder "Não" a um documento apaga o anexo, "outro" fora da
 * lista limpa a descrição e o envio só libera com a declaração aceita.
 *
 * Persistência: só o ENVIO é gravado (`sessionStorage`, por aba) — a conta
 * "em análise" sobrevive à recarga, o preenchimento em andamento não. Decisão
 * de 31/08: a proposta não tem rascunho provisório.
 */
import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';

import { DOCUMENTOS_EXIGIDOS, ETAPAS, PROTOCOLO_DEMO } from '@/data/mocks/operador';

const CHAVE_STORAGE = 'rg:complemento:rascunho';

export type RespostaSimNao = 'sim' | 'nao' | null;

export interface EstadoDocumento {
  possui: RespostaSimNao;
  arquivo: string | null;
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

interface RascunhoSalvo {
  etapa: number;
  fase: 'preenchendo' | 'enviado';
  formulario: FormularioComplemento;
  dataEnvio: string | null;
}

/**
 * Estado de demonstração: a cooperativa no meio do preenchimento, igual aos
 * frames do Figma — ata ainda sem arquivo, declaração de capacidade como "Não".
 */
function formularioPadrao(): FormularioComplemento {
  const documentos: Record<string, EstadoDocumento> = {};
  for (const doc of DOCUMENTOS_EXIGIDOS) {
    documentos[doc.id] = { possui: 'sim', arquivo: doc.arquivoDemo };
  }
  documentos.ata = { possui: 'sim', arquivo: null };
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
    capacidadeVidro: '8 toneladas por mês',
    declaracaoAceita: false,
  };
}

function lerRascunho(): RascunhoSalvo | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE_STORAGE);
    if (!bruto) return null;
    const pacote = JSON.parse(bruto) as RascunhoSalvo;
    // Só o envio é restaurado; preenchimento em andamento não persiste.
    return pacote.fase === 'enviado' ? pacote : null;
  } catch {
    return null;
  }
}

export const useComplementoStore = defineStore('complemento', () => {
  const salvo = lerRascunho();

  const etapa = ref(salvo?.etapa ?? 1);
  const fase = ref<'preenchendo' | 'enviado'>(salvo?.fase ?? 'preenchendo');
  const formulario = reactive<FormularioComplemento>(salvo?.formulario ?? formularioPadrao());
  const dataEnvio = ref<string | null>(salvo?.dataEnvio ?? null);

  function persistirEnvio() {
    const pacote: RascunhoSalvo = {
      etapa: etapa.value,
      fase: fase.value,
      formulario,
      dataEnvio: dataEnvio.value,
    };
    sessionStorage.setItem(CHAVE_STORAGE, JSON.stringify(pacote));
  }

  // ---- documentos ----
  const totalDocumentos = DOCUMENTOS_EXIGIDOS.length;
  const documentosAnexados = computed(
    () =>
      DOCUMENTOS_EXIGIDOS.filter((d) => {
        const doc = formulario.documentos[d.id];
        return doc?.possui === 'sim' && doc.arquivo !== null;
      }).length,
  );
  const documentosSemPossuir = computed(
    () => DOCUMENTOS_EXIGIDOS.filter((d) => formulario.documentos[d.id]?.possui === 'nao'),
  );
  const documentosAguardandoArquivo = computed(
    () =>
      DOCUMENTOS_EXIGIDOS.filter((d) => {
        const doc = formulario.documentos[d.id];
        return doc?.possui === 'sim' && doc.arquivo === null;
      }),
  );
  const totalPendencias = computed(
    () => documentosSemPossuir.value.length + documentosAguardandoArquivo.value.length,
  );

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
    doc.arquivo = exigido.arquivoDemo;
  }

  function removerArquivo(idDocumento: string) {
    const doc = formulario.documentos[idDocumento];
    if (doc) doc.arquivo = null;
  }

  // ---- listas de opções ----
  function alternarOpcao(lista: string[], id: string) {
    const posicao = lista.indexOf(id);
    if (posicao >= 0) lista.splice(posicao, 1);
    else lista.push(id);
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

  // ---- envio ----
  const podeEnviar = computed(() => formulario.declaracaoAceita);
  const protocolo = PROTOCOLO_DEMO;

  function enviar() {
    if (!podeEnviar.value) return;
    fase.value = 'enviado';
    const agora = new Date();
    dataEnvio.value = `${agora.toLocaleDateString('pt-BR')}, às ${agora
      .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      .replace(':', 'h')}`;
    persistirEnvio();
  }

  /** Ferramenta de protótipo: volta ao estado de demonstração inicial. */
  function reiniciar() {
    sessionStorage.removeItem(CHAVE_STORAGE);
    Object.assign(formulario, formularioPadrao());
    etapa.value = 1;
    fase.value = 'preenchendo';
    dataEnvio.value = null;
  }

  return {
    etapa,
    fase,
    formulario,
    totalDocumentos,
    documentosAnexados,
    documentosSemPossuir,
    documentosAguardandoArquivo,
    totalPendencias,
    definirPossui,
    anexarArquivo,
    removerArquivo,
    alternarOpcao,
    irPara,
    avancar,
    voltar,
    podeEnviar,
    protocolo,
    dataEnvio,
    enviar,
    reiniciar,
  };
});
