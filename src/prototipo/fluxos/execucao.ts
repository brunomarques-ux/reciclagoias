// A execução do fluxo ativo (fora dos componentes, para sobreviver às re-renderizações): preparar depois de uma
// carga (refazer rápido a cadeia e os passos anteriores), executar o passo com animação, reproduzir tudo, pausar,
// continuar, avançar, voltar e repetir; e o acompanhamento do modo manual. O painel (PainelDoFluxo.vue) só lê o
// estado (useStatusDoFluxo, um shallowRef no lugar do useSyncExternalStore do SISLOG) e chama estas funções.
//
// O preparo corre atrás da cortina (camada.ts) e, no fim, dispensa o aviso (o RgToast global, useToast) que ele
// deixou; o passo feito deixa o destaque parado; o erro vira um aviso para quem apresenta, com a saída (Repetir
// passo) e o detalhe técnico à parte; o F5 no meio do fluxo refaz a tela até o passo.
import { shallowRef, type Ref } from 'vue';
import type { Fluxo } from './tipos';
import { Cancelado, CADENCIA, Controle, FATOR_LENTO, FalhaDaAcao, esperarTelaPronta, executarPasso, recolherCamada, refazerRapido, type Execucao } from './motor';
import { desmontarCamada, destacar, mostrarCortina } from './camada';
import { descreverAlvo } from './alvo';
import { acompanharAcao } from './manual';
import { fluxoPorId } from './registro';
import { precisaRefazer, recarregarNoPasso } from './iniciar';
import { assinarFluxo, atualizarFluxoAtivo, fluxoAtivo, foiRecargaDaPessoa } from './sessao';
import { useToast } from '@/composables/useToast';

export type Fase = 'parado' | 'preparando' | 'executando' | 'pausado';

/** O que deu errado: o aviso para a apresentadora (com a saída) e o detalhe técnico (no title do aviso). */
export interface ErroDoFluxo {
  texto: string;
  detalhe: string;
}

export interface StatusDoFluxo {
  fase: Fase;
  /** A execução em curso é o Reproduzir tudo. */
  tudo: boolean;
  /** A ação atual do passo (no manual, a que espera o gesto). */
  acao: number;
  /** O que deu errado na última execução (ou, no manual, o alvo que não está na tela). */
  erro: ErroDoFluxo | null;
  /** No manual, a ação atual é "olhar": o painel mostra o Entendi. */
  esperaEntendi: boolean;
}

const estado = shallowRef<StatusDoFluxo>({ fase: 'parado', tudo: false, acao: 0, erro: null, esperaEntendi: false });
function mudar(parte: Partial<StatusDoFluxo>): void {
  estado.value = { ...estado.value, ...parte };
}
/** O status da execução, reativo (só leitura): para o painel. */
export function useStatusDoFluxo(): Readonly<Ref<StatusDoFluxo>> {
  return estado as Readonly<Ref<StatusDoFluxo>>;
}

let controle: Controle | null = null;

const fluxoAtual = (): Fluxo | undefined => fluxoPorId(fluxoAtivo()?.id);
const fator = () => (fluxoAtivo()?.velocidade === 'lenta' ? FATOR_LENTO : 1);
const execucao = (c: Controle, rapido = false): Execucao => ({
  controle: c,
  ritmo: () => ({ rapido, fator: fator() }),
  aoAgir: i => mudar({ acao: i }),
});
const textoDoErro = (e: unknown) => (e instanceof Error ? e.message : String(e));

const SAIDA = 'Clique em Repetir passo para refazer a tela até aqui.';
/** O nome entre aspas, ou "o alvo deste passo" quando ele não tem nome (alvo por CSS). */
const oAlvo = (nome: string) => (nome ? `“${nome}”` : 'o alvo deste passo');
const naoAchei = (nome: string) => `Não achei ${oAlvo(nome)} na tela. Ela pode ter mudado. ${SAIDA}`;

/** O aviso de uma falha no passo: o que não apareceu (pelo nome curto do alvo) e a saída. */
function erroDe(e: unknown): ErroDoFluxo {
  const detalhe = textoDoErro(e);
  if (e instanceof FalhaDaAcao && e.sumiu !== null) {
    const texto = e.desabilitado ? `Achei ${oAlvo(e.sumiu)}, mas desabilitado. A tela pode ter mudado. ${SAIDA}` : naoAchei(e.sumiu);
    return { texto, detalhe };
  }
  return { texto: `O passo não terminou. A tela pode ter mudado. ${SAIDA}`, detalhe };
}

/** Fim de uma execução. `manterDestaque`: o passo terminou bem e o destaque fica parado no alvo (o "Observe"). */
function terminar(parte: Partial<StatusDoFluxo> = {}, manterDestaque = false): void {
  controle = null;
  if (manterDestaque) mostrarCortina(null);
  else recolherCamada();
  mudar({ fase: 'parado', tudo: false, ...parte });
  sincronizarManual();
}

// ── preparar depois de uma carga ─────────────────────────────────────────────────────────────────

/** No fim do preparo, o aviso (toast) que o preparo deixou sai: não é do passo que vai ser narrado. */
const dispensarAvisos = (): void => useToast().dismiss();

/** Já se pediu a recarga do F5 (a página vai sair): nada de preparar nesta carga. */
let recarregando = false;
let recargaVista = false;

/**
 * Depois do F5 da apresentadora no meio do fluxo, a tela volta ao estado inicial da rota, mas o passo não: recarrega no
 * início do fluxo e o preparo refaz rápido até o passo atual (o seguinte, se o atual já foi feito). Uma vez por carga.
 * Devolve true se a página vai recarregar.
 */
export function retomarDepoisDoF5(): boolean {
  if (recargaVista) return recarregando;
  recargaVista = true;
  const a = fluxoAtivo();
  const f = fluxoAtual();
  if (!a || !f || !foiRecargaDaPessoa() || !precisaRefazer(f, a)) return false;
  recarregando = true;
  recarregarNoPasso(f, a.feito ? Math.min(a.passo + 1, f.passos.length - 1) : a.passo, false);
  return true;
}

/**
 * Refaz rápido a cadeia e os passos antes do atual (a página acabou de carregar), atrás da cortina. Idempotente. No
 * fim, dispensa os avisos que o preparo deixou: não são do passo que ela vai narrar.
 */
export async function preparar(): Promise<void> {
  const a = fluxoAtivo();
  const f = fluxoAtual();
  if (!a?.preparar || !f || controle || recarregando) return;
  const c = (controle = new Controle());
  pararManual();
  mostrarCortina(f.titulo);
  mudar({ fase: 'preparando', erro: null, acao: 0 });
  try {
    await esperarTelaPronta(c);
    const r = await refazerRapido(f, a.passo, c);
    const executar = a.preparar.executar;
    atualizarFluxoAtivo({ preparar: undefined, feito: false, concluido: false });
    if (!r.ok) {
      const detalhe = r.passo ? `Ao refazer o passo ${r.passo}: ${r.erro}` : `Ao preparar: ${r.erro}`;
      const texto = r.sumiu !== undefined ? `Não achei ${oAlvo(r.sumiu)} ao refazer a tela. Clique em Repetir passo para tentar de novo.` : 'Não deu para refazer a tela. Clique em Repetir passo para tentar de novo.';
      terminar({ erro: { texto, detalhe } });
      return;
    }
    dispensarAvisos();
    await c.esperar(250); // a saída dos avisos, ainda atrás da cortina
    mostrarCortina(null);
    controle = null;
    mudar({ fase: 'parado' });
    if (executar) await executarPassoAtual();
    else sincronizarManual();
  } catch (e) {
    if (e instanceof Cancelado) return;
    atualizarFluxoAtivo({ preparar: undefined });
    terminar({ erro: erroDe(e) });
  }
}

// ── o automático ─────────────────────────────────────────────────────────────────────────────────

/**
 * Executa o passo atual com animação. Se ele já foi feito, avança e executa o seguinte ("Executar passo N").
 * `tudo`: segue executando os próximos, com uma pausa entre eles, até o fim (Reproduzir tudo).
 */
export async function executarPassoAtual(opcoes: { tudo?: boolean } = {}): Promise<void> {
  let a = fluxoAtivo();
  const f = fluxoAtual();
  if (!a || !f || controle || a.preparar) return;
  const total = f.passos.length;
  if (a.feito) {
    if (a.passo + 1 >= total) return;
    a = atualizarFluxoAtivo({ passo: a.passo + 1, feito: false })!;
  }
  pararManual();
  destacar(null); // o destaque parado do passo anterior sai; o cursor fica onde está
  const c = (controle = new Controle());
  mudar({ fase: 'executando', tudo: !!opcoes.tudo, erro: null, acao: 0 });
  try {
    for (;;) {
      const atual = fluxoAtivo()!;
      await executarPasso(f.passos[atual.passo], execucao(c));
      const ultimo = atual.passo >= total - 1;
      atualizarFluxoAtivo({ feito: true, concluido: ultimo });
      if (!opcoes.tudo || ultimo) break;
      await c.esperar(CADENCIA.entrePassos * fator());
      destacar(null);
      atualizarFluxoAtivo({ passo: atual.passo + 1, feito: false });
      mudar({ acao: 0 });
    }
    terminar({}, true);
  } catch (e) {
    if (e instanceof Cancelado) return;
    terminar({ erro: erroDe(e) });
  }
}

export function pausar(): void {
  if (!controle || estado.value.fase !== 'executando') return;
  controle.pausar();
  mudar({ fase: 'pausado' });
}

export function continuar(): void {
  if (!controle || estado.value.fase !== 'pausado') return;
  controle.continuar();
  mudar({ fase: 'executando' });
}

/** Para o que estiver rodando (sem mexer no passo). */
export function cancelar(): void {
  if (controle) controle.cancelar();
  controle = null;
  recolherCamada();
  mudar({ fase: 'parado', tudo: false });
}

/** Próximo: faz rápido o que falta do passo atual (se ainda não foi feito) e vai ao seguinte, sem executá-lo. */
export async function proximo(): Promise<void> {
  const a = fluxoAtivo();
  const f = fluxoAtual();
  if (!a || !f || controle || a.preparar) return;
  const total = f.passos.length;
  destacar(null);
  if (!a.feito) {
    pararManual();
    const c = (controle = new Controle());
    mudar({ fase: 'executando', erro: null });
    try {
      await executarPasso(f.passos[a.passo], execucao(c, true), a.modo === 'manual' ? estado.value.acao : 0);
    } catch (e) {
      if (e instanceof Cancelado) return;
      terminar({ erro: erroDe(e) });
      return;
    }
    controle = null;
    mudar({ fase: 'parado' });
  }
  if (a.passo + 1 >= total) atualizarFluxoAtivo({ feito: true, concluido: true });
  else atualizarFluxoAtivo({ passo: a.passo + 1, feito: false, concluido: false });
  mudar({ acao: 0, erro: null });
  sincronizarManual();
}

/** Ir a um passo: para a frente, faz rápido os do meio; para trás, recarrega e refaz até ele. */
export async function irPara(n: number): Promise<void> {
  const a = fluxoAtivo();
  const f = fluxoAtual();
  if (!a || !f || controle || a.preparar || n < 0 || n >= f.passos.length) return;
  if (n < a.passo || (n === a.passo && a.feito)) {
    cancelar();
    recarregarNoPasso(f, n, false);
    return;
  }
  while ((fluxoAtivo()?.passo ?? n) < n && !estado.value.erro) await proximo();
}

/** Anterior: recarrega no início e refaz rápido até o passo anterior (pronto para executar). */
export function anterior(): void {
  const a = fluxoAtivo();
  const f = fluxoAtual();
  if (!a || !f) return;
  cancelar();
  recarregarNoPasso(f, Math.max(0, a.passo - 1), false);
}

/**
 * Repetir: recarrega no início, refaz rápido até o passo atual e executa ele de novo, com animação. No manual, só
 * refaz a tela até o passo: o gesto continua com a pessoa.
 */
export function repetir(): void {
  const a = fluxoAtivo();
  const f = fluxoAtual();
  if (!a || !f) return;
  cancelar();
  recarregarNoPasso(f, a.passo, a.modo !== 'manual');
}

/** Recomeçar do passo 1 (depois do Fluxo concluído). */
export function recomecar(): void {
  const f = fluxoAtual();
  if (!f) return;
  cancelar();
  recarregarNoPasso(f, 0, false);
}

// ── o manual ─────────────────────────────────────────────────────────────────────────────────────

let pararAcompanhamento: (() => void) | null = null;
let acaoDoEntendi: (() => void) | null = null;
let chaveDoManual = '';

function pararManual(): void {
  pararAcompanhamento?.();
  pararAcompanhamento = null;
  acaoDoEntendi = null;
  chaveDoManual = '';
  if (estado.value.esperaEntendi) mudar({ esperaEntendi: false });
}

/** O botão Entendi (manual, ação "olhar"). */
export function entendi(): void {
  acaoDoEntendi?.();
}

/**
 * Liga o acompanhamento manual da ação atual (ou desliga, fora do manual). Chamado a cada mudança do fluxo ativo;
 * só recomeça quando o passo ou o modo mudam.
 */
export function sincronizarManual(): void {
  const a = fluxoAtivo();
  const f = fluxoAtual();
  const manual = !!a && !!f && a.modo === 'manual' && !a.preparar && !a.feito && !a.concluido && !controle;
  if (!manual) {
    if (pararAcompanhamento) {
      pararManual();
      destacar(null);
    }
    return;
  }
  const chave = `${a!.id}:${a!.passo}`;
  if (chave === chaveDoManual && pararAcompanhamento) return;
  pararManual();
  chaveDoManual = chave;
  const passo = f!.passos[a!.passo];
  const total = f!.passos.length;
  const seguir = (i: number) => {
    pararAcompanhamento?.();
    pararAcompanhamento = null;
    if (i >= passo.acoes.length) {
      // o passo foi feito: mostra o próximo (ou o fim)
      chaveDoManual = '';
      mudar({ acao: 0, esperaEntendi: false });
      window.setTimeout(() => {
        const agora = fluxoAtivo();
        if (!agora || agora.id !== a!.id || agora.passo !== a!.passo || agora.modo !== 'manual') return;
        if (agora.passo + 1 >= total) atualizarFluxoAtivo({ feito: true, concluido: true });
        else atualizarFluxoAtivo({ passo: agora.passo + 1, feito: false });
      }, 500);
      return;
    }
    const acao = passo.acoes[i];
    // só o último "olhar" do passo espera o Entendi; os do meio seguem sozinhos depois do tempo deles
    const ultima = i === passo.acoes.length - 1;
    mudar({ acao: i, esperaEntendi: acao.tipo === 'olhar' && ultima, erro: null });
    // o alvo que não está na tela há 3 s vira o aviso, com o Repetir passo; some quando o alvo volta
    const aoSumir = (nome: string | null) =>
      mudar({ erro: nome !== null && 'alvo' in acao ? { texto: naoAchei(nome), detalhe: `${acao.tipo} ${descreverAlvo(acao.alvo)}: o alvo não está na tela há 3 s` } : null });
    pararAcompanhamento = acompanharAcao(acao, () => seguir(i + 1), fn => {
      acaoDoEntendi = fn;
    }, { ultima, aoSumir });
  };
  seguir(0);
}

// o fluxo encerrado (ou trocado) para tudo e tira a camada; a troca de passo ou de modo religa o manual
if (typeof window !== 'undefined') {
  let idAnterior = fluxoAtivo()?.id ?? null;
  assinarFluxo(() => {
    const a = fluxoAtivo();
    if (!a || a.id !== idAnterior) {
      cancelar();
      pararManual();
      if (!a) desmontarCamada();
      mudar({ erro: null, acao: 0 });
    }
    idAnterior = a?.id ?? null;
    sincronizarManual();
  });
}
