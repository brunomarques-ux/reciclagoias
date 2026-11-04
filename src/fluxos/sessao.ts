// O fluxo guiado ativo (camada do protótipo, fora do produto; portado do SISLOG): qual fluxo, em qual passo, se o
// passo já foi executado, o modo (manual ou automático), a velocidade e se o painel está recolhido. Fica no
// sessionStorage desta aba (`rg-proto:v1:fluxo`): some ao fechar a aba. Sem tela e sem os dados dos fluxos: a raiz
// (RaizDosFluxos.vue) importa só isto para saber se monta o painel, que carrega sob demanda.
//
// No lugar do useSyncExternalStore do React, um shallowRef do Vue: o painel lê `useFluxoAtivo()` e reage sozinho. O
// evento na janela continua, para quem não é componente (execucao.ts) acompanhar as mudanças.
//
// Também aqui: as preferências de quem apresenta (velocidade e recolhido, lembradas entre fluxos), a marca das
// cargas nossas (para reconhecer o F5) e o endereço que o roteador já aplicou.
import { shallowRef, type Ref } from 'vue';

const CHAVE = 'rg-proto:v1:fluxo';
const EVENTO = 'rg-proto:fluxo';
/** A limpeza do início (inicio.limpar) foi feita antes desta carga, para este fluxo. */
const CHAVE_PREPARADO = 'rg-proto:v1:fluxo-preparado';
/** A velocidade e o painel recolhido escolhidos: valem para o próximo fluxo. */
const CHAVE_PREFERENCIAS = 'rg-proto:v1:fluxo-preferencias';
/** A próxima carga da página é nossa (iniciar, Anterior, Repetir), não o F5 da pessoa. */
const CHAVE_CARGA_PROPRIA = 'rg-proto:v1:fluxo-carga';

export type ModoDoFluxo = 'manual' | 'auto';
export type VelocidadeDoFluxo = 'normal' | 'lenta';

export interface FluxoAtivo {
  id: string;
  /** O passo atual, a partir de 0. */
  passo: number;
  /** O passo atual já foi executado (quem apresenta comenta o "Observe"). */
  feito: boolean;
  modo: ModoDoFluxo;
  velocidade: VelocidadeDoFluxo;
  recolhido: boolean;
  /** O último passo foi feito. */
  concluido?: boolean;
  /**
   * Ao montar o painel: refazer rápido a cadeia (depoisDe) e os passos antes de `passo` (a página acabou de carregar
   * no início do fluxo). Com `executar`, executa o passo atual com animação em seguida (Repetir passo).
   */
  preparar?: { executar: boolean };
}

function ler(): FluxoAtivo | null {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as FluxoAtivo) : null;
  } catch {
    return null;
  }
}

const atual = shallowRef<FluxoAtivo | null>(typeof window === 'undefined' ? null : ler());

export function fluxoAtivo(): FluxoAtivo | null {
  return atual.value;
}

export function definirFluxoAtivo(f: FluxoAtivo | null): void {
  atual.value = f;
  try {
    if (f) {
      window.sessionStorage.setItem(CHAVE, JSON.stringify(f));
      window.sessionStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify({ velocidade: f.velocidade, recolhido: f.recolhido }));
    } else window.sessionStorage.removeItem(CHAVE);
  } catch {
    /* sem sessionStorage: só não lembra */
  }
  window.dispatchEvent(new Event(EVENTO));
}

/** Muda só alguns campos do fluxo ativo (nada, se não houver). Devolve o novo estado. */
export function atualizarFluxoAtivo(parte: Partial<FluxoAtivo>): FluxoAtivo | null {
  if (!atual.value) return null;
  const novo = { ...atual.value, ...parte };
  definirFluxoAtivo(novo);
  return novo;
}

export function marcarPreparado(id: string | null): void {
  try {
    if (id) window.sessionStorage.setItem(CHAVE_PREPARADO, id);
    else window.sessionStorage.removeItem(CHAVE_PREPARADO);
  } catch {
    /* idem */
  }
}

export function lerPreparado(): string | null {
  try {
    return window.sessionStorage.getItem(CHAVE_PREPARADO);
  } catch {
    return null;
  }
}

export interface PreferenciasDoFluxo {
  velocidade: VelocidadeDoFluxo;
  recolhido: boolean;
}

/** A velocidade e o recolhido do último fluxo desta aba (gravados a cada mudança do fluxo ativo). */
export function preferenciasDoFluxo(): PreferenciasDoFluxo {
  try {
    const p = JSON.parse(window.sessionStorage.getItem(CHAVE_PREFERENCIAS) ?? 'null') as Partial<PreferenciasDoFluxo> | null;
    return { velocidade: p?.velocidade === 'lenta' ? 'lenta' : 'normal', recolhido: p?.recolhido === true };
  } catch {
    return { velocidade: 'normal', recolhido: false };
  }
}

/** Marca a próxima carga como nossa (antes de location.assign ou replace): não é o F5 da pessoa. */
export function marcarCargaPropria(): void {
  try {
    window.sessionStorage.setItem(CHAVE_CARGA_PROPRIA, '1');
  } catch {
    /* idem */
  }
}

/**
 * Esta carga da página foi o F5 da pessoa (e não uma carga nossa)? Lido uma vez, quando a raiz carrega: a marca da
 * carga própria é consumida aqui.
 */
const recargaDaPessoa: boolean = (() => {
  if (typeof window === 'undefined') return false;
  let propria = false;
  try {
    propria = window.sessionStorage.getItem(CHAVE_CARGA_PROPRIA) === '1';
    window.sessionStorage.removeItem(CHAVE_CARGA_PROPRIA);
  } catch {
    /* idem */
  }
  if (propria) return false;
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    return nav?.type === 'reload';
  } catch {
    return false;
  }
})();

export function foiRecargaDaPessoa(): boolean {
  return recargaDaPessoa;
}

/**
 * O endereço que o roteador já aplicou na tela (a raiz grava no afterEach, depois da renderização). A barra muda na
 * hora; a tela, só quando o Vue Router termina a navegação e o Vue renderiza. O preparo espera os dois baterem.
 */
let enderecoAplicado: string | null = null;

export function marcarEnderecoAplicado(endereco: string): void {
  enderecoAplicado = endereco;
}

export function enderecoAplicadoPeloRoteador(): string | null {
  return enderecoAplicado;
}

export function assinarFluxo(f: () => void): () => void {
  window.addEventListener(EVENTO, f);
  return () => window.removeEventListener(EVENTO, f);
}

/** O fluxo ativo, reativo (só leitura): para os componentes. */
export function useFluxoAtivo(): Readonly<Ref<FluxoAtivo | null>> {
  return atual as Readonly<Ref<FluxoAtivo | null>>;
}
