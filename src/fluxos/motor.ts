// O motor dos fluxos guiados (camada do protótipo, portado do SISLOG): executa as ações de um passo no navegador,
// com a regra de alvo do alvo.ts.
//
// Cada ação é feita com eventos nativos, que o Vue ouve do mesmo jeito que o React: rolar até o centro (suave), levar
// o cursor, a sequência de eventos de ponteiro e de mouse (over, enter, move, down, foco, up, click; o click sintético
// também dispara a ativação padrão, então o rótulo marca o rádio e a caixa); digitar pelo setter nativo do value com
// o evento input a cada letra (o v-model ouve o input); escolher abre o combobox e clica na opção pelo nome (no
// <select> nativo, troca o value e dispara input e change); passar fica parado sobre o alvo; tecla vai ao elemento
// com foco (com o efeito padrão do Enter, do Espaço e do Tab); olhar só destaca.
//
// Cadência para apresentar ("o mouse vai devagarzinho"): o cursor a cerca de 450 px/s, pausa de 450 ms no alvo antes
// de agir, a onda no clique, 110 ms por letra (no máximo cerca de 2,5 s por campo: o texto longo digita mais rápido),
// 700 ms depois de cada ação, 3200 ms no olhar (o tempo de uma frase). Velocidade lenta: tudo vezes 1,7. Com
// prefers-reduced-motion o cursor salta e não há onda, mas as pausas continuam. O modo rápido (sem cursor e sem
// pausas) refaz passos e serve aos testes.
//
// A última ação do passo deixa o destaque (e o cursor) parado no fim, se o alvo continua à vista: a apresentadora
// comenta o "Observe" com o alvo apontado. O próximo passo tira.
import type { Acao, Alvo, Fluxo, PassoDoFluxo } from './tipos';
import { descreverAlvo, habilitado, nomeCurtoDoAlvo, normalizar, resolverAlvo } from './alvo';
import { alvoNaTela, cursorAparente, destacar, mostrarCortina, mostrarCursor, moverCursorAte, movimentoReduzido, onda, pontoDe, posicaoDoCursor } from './camada';
import { cadeiaDe } from './registro';
import { enderecoAplicadoPeloRoteador } from './sessao';

export const ESPERA_DO_ALVO = 6000;
export const FATOR_LENTO = 1.7;

/** A cadência do modo automático, em ms (vezes o fator da velocidade). */
export const CADENCIA = { noAlvo: 450, porLetra: 110, tetoDaDigitacao: 2500, depoisDaAcao: 700, entrePassos: 1400, olhar: 3200, passar: 1600 } as const;

export class Cancelado extends Error {
  constructor() {
    super('cancelado');
  }
}

/** Pausar, continuar e cancelar uma execução. Toda espera do motor passa por aqui. */
export class Controle {
  pausado = false;
  cancelado = false;
  private retomar: (() => void)[] = [];

  pausar(): void {
    this.pausado = true;
  }
  continuar(): void {
    this.pausado = false;
    this.retomar.splice(0).forEach(f => f());
  }
  cancelar(): void {
    this.cancelado = true;
    this.continuar();
  }
  /** Lança Cancelado se cancelado; segura enquanto pausado. */
  async checar(): Promise<void> {
    if (this.cancelado) throw new Cancelado();
    while (this.pausado) {
      await new Promise<void>(r => this.retomar.push(r));
      if (this.cancelado) throw new Cancelado();
    }
  }
  /** Espera `ms`, respeitando a pausa e o cancelamento. */
  async esperar(ms: number): Promise<void> {
    let resta = ms;
    while (resta > 0) {
      await this.checar();
      const fatia = Math.min(resta, 50);
      await dormir(fatia);
      resta -= fatia;
    }
    await this.checar();
  }
}

export const dormir = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const quadro = () => new Promise<void>(r => requestAnimationFrame(() => r()));

export interface Ritmo {
  /** Sem cursor, sem destaque e sem pausas. */
  rapido: boolean;
  /** 1 (normal) ou 1,7 (lenta). */
  fator: number;
}

export interface Execucao {
  controle: Controle;
  /** Lido a cada ação: trocar a velocidade vale na ação seguinte. */
  ritmo: () => Ritmo;
  /** Avisa a ação que começa (índice no passo). */
  aoAgir?: (i: number) => void;
}

/**
 * Uma falha numa ação, com o texto que o executor por Playwright usaria (a mensagem, que vira o detalhe técnico).
 * `sumiu`: o nome curto do que não apareceu na tela (o alvo ou a opção), para o aviso à apresentadora; vazio quando o
 * alvo não tem nome (CSS); null quando a falha é outra.
 */
export class FalhaDaAcao extends Error {
  acao: Acao;
  sumiu: string | null;
  desabilitado: boolean;
  constructor(acao: Acao, motivo: string, extra: { sumiu?: string; desabilitado?: boolean } = {}) {
    super('alvo' in acao ? `${acao.tipo} ${descreverAlvo(acao.alvo)}: ${motivo}` : `${acao.tipo}: ${motivo}`);
    this.acao = acao;
    this.sumiu = extra.sumiu ?? null;
    this.desabilitado = !!extra.desabilitado;
  }
}

type AcaoComAlvo = Extract<Acao, { alvo: Alvo }>;

// ── o rótulo da pílula ───────────────────────────────────────────────────────────────────────────

/** O rótulo da ação ("Clique em Filtrar"): o do dado ou montado pelo tipo e pelo nome do alvo. */
export function rotuloDaAcao(acao: Acao): string {
  if ('rotulo' in acao && acao.rotulo) return acao.rotulo;
  switch (acao.tipo) {
    case 'clicar':
      return `Clique em ${nomeCurtoDoAlvo(acao.alvo)}`;
    case 'marcar':
      return `Marque ${nomeCurtoDoAlvo(acao.alvo)}`;
    case 'passar':
      return `Passe o mouse em ${nomeCurtoDoAlvo(acao.alvo)}`;
    case 'digitar':
      return `Digite ${acao.texto}`;
    case 'escolher':
      return `Escolha ${acao.opcao}`;
    case 'tecla':
      return `Tecle ${NOME_DA_TECLA[acao.tecla] ?? acao.tecla}`;
    case 'rolar':
      return `Role até ${nomeCurtoDoAlvo(acao.alvo)}`;
    case 'olhar':
      return acao.rotulo;
    case 'esperar':
      return 'Aguarde';
  }
}

const NOME_DA_TECLA: Readonly<Record<string, string>> = {
  Enter: 'Enter',
  Escape: 'Esc',
  Tab: 'Tab',
  ArrowDown: 'seta para baixo',
  ArrowUp: 'seta para cima',
  ArrowLeft: 'seta para a esquerda',
  ArrowRight: 'seta para a direita',
  ' ': 'Espaço',
};

// ── achar o alvo ─────────────────────────────────────────────────────────────────────────────────

/** O nome do alvo no aviso à apresentadora: o nome ou o texto procurado; vazio para o alvo por CSS (sem nome). */
export function nomeDoAlvoParaAviso(alvo: Alvo): string {
  return 'css' in alvo ? '' : nomeCurtoDoAlvo(alvo);
}

/** Espera o alvo aparecer (as telas carregam com esqueleto), até 6 s. */
export async function esperarAlvo(acao: AcaoComAlvo, controle: Controle, condicao?: (el: Element) => boolean): Promise<Element> {
  const limite = performance.now() + ESPERA_DO_ALVO;
  let ultimo: Element | null = null;
  for (;;) {
    await controle.checar();
    ultimo = resolverAlvo(acao.alvo);
    if (ultimo && (!condicao || condicao(ultimo))) return ultimo;
    if (performance.now() > limite) {
      const nome = nomeDoAlvoParaAviso(acao.alvo);
      throw ultimo
        ? new FalhaDaAcao(acao, 'o alvo está desabilitado', { sumiu: nome, desabilitado: true })
        : new FalhaDaAcao(acao, 'o alvo não apareceu em 6 s', { sumiu: nome });
    }
    await dormir(100);
  }
}

// ── os eventos ───────────────────────────────────────────────────────────────────────────────────

let sobre: Element | null = null;

function ponteiro(tipo: string, el: Element, p: { x: number; y: number }, extra: PointerEventInit = {}): boolean {
  const init: PointerEventInit = {
    bubbles: tipo !== 'pointerenter' && tipo !== 'pointerleave',
    cancelable: tipo !== 'pointerenter' && tipo !== 'pointerleave',
    composed: true,
    clientX: p.x,
    clientY: p.y,
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
    view: window,
    ...extra,
  };
  const Construtor = typeof PointerEvent === 'function' ? PointerEvent : MouseEvent;
  return el.dispatchEvent(new Construtor(tipo, init));
}

function mouse(tipo: string, el: Element, p: { x: number; y: number }, extra: MouseEventInit = {}): boolean {
  return el.dispatchEvent(
    new MouseEvent(tipo, {
      bubbles: tipo !== 'mouseenter' && tipo !== 'mouseleave',
      cancelable: tipo !== 'mouseenter' && tipo !== 'mouseleave',
      composed: true,
      clientX: p.x,
      clientY: p.y,
      view: window,
      ...extra,
    }),
  );
}

/** Sair do elemento em que o cursor estava (o mouseout com relatedTarget é o que dispara o @mouseleave e o hover das telas). */
function sair(para: Element | null, p: { x: number; y: number }): void {
  const de = sobre;
  if (!de || de === para || !de.isConnected) return;
  ponteiro('pointerout', de, p, { relatedTarget: para });
  ponteiro('pointerleave', de, p, { relatedTarget: para });
  mouse('mouseout', de, p, { relatedTarget: para });
  mouse('mouseleave', de, p, { relatedTarget: para });
}

/** Entrar no elemento: os eventos de passar o mouse (abre dica, hover). */
export function entrar(el: Element, p: { x: number; y: number }): void {
  if (sobre !== el) {
    const de = sobre && sobre.isConnected ? sobre : null;
    sair(el, p);
    ponteiro('pointerover', el, p, { relatedTarget: de });
    ponteiro('pointerenter', el, p, { relatedTarget: de });
    mouse('mouseover', el, p, { relatedTarget: de });
    mouse('mouseenter', el, p, { relatedTarget: de });
    sobre = el;
  }
  ponteiro('pointermove', el, p);
  mouse('mousemove', el, p);
}

const FOCAVEL = 'button, a[href], input, select, textarea, summary, [tabindex], [contenteditable=""], [contenteditable="true"]';

/** O clique completo: entrada, down, foco (se o mousedown não for impedido), up e click. */
export function clicarEm(el: Element, p: { x: number; y: number } = pontoDe(el)): void {
  entrar(el, p);
  const desceu = ponteiro('pointerdown', el, p, { button: 0, buttons: 1, pressure: 0.5 });
  let mouseOk = true;
  if (desceu) mouseOk = mouse('mousedown', el, p, { button: 0, buttons: 1, detail: 1 });
  if (desceu && mouseOk) {
    const focavel = el.closest(FOCAVEL) as HTMLElement | null;
    if (focavel && !focavel.matches(':disabled')) {
      if (document.activeElement !== focavel) focavel.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
    } else if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
  }
  ponteiro('pointerup', el, p, { button: 0, buttons: 0 });
  if (desceu) mouse('mouseup', el, p, { button: 0, buttons: 0, detail: 1 });
  mouse('click', el, p, { button: 0, buttons: 0, detail: 1 });
}

function campoDe(el: Element): HTMLInputElement | HTMLTextAreaElement | null {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el;
  return el.querySelector('input:not([type=hidden]), textarea');
}

function definirValor(campo: HTMLInputElement | HTMLTextAreaElement, valor: string): void {
  const proto = campo instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(campo, valor);
  else campo.value = valor;
}

const CODIGO: Readonly<Record<string, string>> = { Enter: 'Enter', Escape: 'Escape', Tab: 'Tab', ' ': 'Space', ArrowDown: 'ArrowDown', ArrowUp: 'ArrowUp', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight', Backspace: 'Backspace', Delete: 'Delete', Home: 'Home', End: 'End' };

function teclaEvento(tipo: 'keydown' | 'keyup', el: Element, key: string, mods: { shiftKey?: boolean; ctrlKey?: boolean; altKey?: boolean; metaKey?: boolean } = {}): boolean {
  const code = CODIGO[key] ?? (key.length === 1 ? (/[a-z]/i.test(key) ? `Key${key.toUpperCase()}` : /\d/.test(key) ? `Digit${key}` : '') : key);
  return el.dispatchEvent(new KeyboardEvent(tipo, { key, code, bubbles: true, cancelable: true, composed: true, view: window, ...mods }));
}

/** Digita letra a letra: keydown, o value pelo setter nativo e o evento input (o que o v-model ouve), keyup. */
async function digitarEm(el: Element, texto: string, limpar: boolean, controle: Controle, porLetra: number): Promise<void> {
  const campo = campoDe(el);
  if (!campo) throw new Error('o alvo não é um campo de texto');
  if (limpar && campo.value) {
    definirValor(campo, '');
    campo.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, inputType: 'deleteContentBackward' }));
    await dormir(10);
  }
  for (const letra of texto) {
    await controle.checar();
    if (teclaEvento('keydown', campo, letra)) {
      definirValor(campo, campo.value + letra);
      campo.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, inputType: 'insertText', data: letra }));
    }
    teclaEvento('keyup', campo, letra);
    await (porLetra > 0 ? controle.esperar(porLetra) : dormir(8));
  }
}

const TABULAVEL = 'a[href], button:not(:disabled), input:not(:disabled):not([type=hidden]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"]), summary';

function moverFoco(direcao: 1 | -1): void {
  const lista = [...document.querySelectorAll<HTMLElement>(TABULAVEL)].filter(e => e.tabIndex >= 0 && !e.closest('[data-prototipo]') && !e.closest('[inert]') && e.getClientRects().length > 0);
  if (!lista.length) return;
  const i = lista.indexOf(document.activeElement as HTMLElement);
  const prox = lista[(i + direcao + lista.length) % lista.length];
  prox.focus();
}

/** A tecla no elemento com foco, com o efeito padrão que o evento sintético não tem (Enter, Espaço, Tab). */
export function pressionarTecla(tecla: string): void {
  const partes = tecla.split('+');
  const key = partes.pop() || tecla;
  const mods = { shiftKey: partes.includes('Shift'), ctrlKey: partes.includes('Control'), altKey: partes.includes('Alt'), metaKey: partes.includes('Meta') };
  const el = document.activeElement && document.activeElement !== document.documentElement ? document.activeElement : document.body;
  const livre = teclaEvento('keydown', el, key, mods);
  if (livre) {
    if (key === 'Enter') {
      if (el instanceof HTMLInputElement && el.form && !['button', 'submit', 'reset', 'checkbox', 'radio'].includes(el.type)) el.form.requestSubmit();
      else if (el instanceof HTMLButtonElement || el instanceof HTMLAnchorElement) el.click();
    } else if (key === 'Tab') moverFoco(mods.shiftKey ? -1 : 1);
  }
  teclaEvento('keyup', el, key, mods);
  if (livre && key === ' ' && (el instanceof HTMLButtonElement || (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')))) el.click();
}

// ── rolar ────────────────────────────────────────────────────────────────────────────────────────

/** Rola até o centro se o alvo não estiver bem à vista, e espera a rolagem assentar. */
async function rolarAte(el: Element, suave: boolean, controle: Controle): Promise<void> {
  const r = el.getBoundingClientRect();
  const topo = 64; // abaixo da TopBar da área logada (56) com folga
  if (r.top >= topo && r.bottom <= innerHeight - 16 && r.left >= 0 && r.right <= innerWidth) return;
  el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: suave ? 'smooth' : 'auto' });
  if (!suave) return quadro();
  let anterior = Number.NaN;
  let parado = 0;
  const limite = performance.now() + 1500;
  while (performance.now() < limite && parado < 3) {
    await quadro();
    await controle.checar();
    const t = el.getBoundingClientRect().top;
    parado = Math.abs(t - anterior) < 0.5 ? parado + 1 : 0;
    anterior = t;
  }
}

/** O cursor até o alvo, na cadência; a pausa e o cancelamento valem no meio do caminho. True se ele saiu do lugar. */
async function levarCursor(el: Element, fator: number, controle: Controle): Promise<boolean> {
  try {
    return await moverCursorAte(el, fator, { pausado: () => controle.pausado, cancelado: () => controle.cancelado });
  } catch (e) {
    if (controle.cancelado) throw new Cancelado();
    throw e;
  }
}

// ── executar ─────────────────────────────────────────────────────────────────────────────────────

/** O tempo de cada letra: 110 ms, ou menos no texto longo (no máximo cerca de 2,5 s por campo), vezes o fator. */
export function tempoPorLetra(texto: string, fator: number): number {
  const n = Math.max(1, [...texto].length);
  return Math.min(CADENCIA.porLetra, CADENCIA.tetoDaDigitacao / n) * fator;
}

/**
 * Executa uma ação. No modo rápido, sem cursor e sem pausas; no automático, devagar e com o destaque. `ultima`: a última
 * ação do passo deixa o destaque no alvo (se ele continua à vista) e o cursor parado.
 */
export async function executarAcao(acao: Acao, ex: Execucao, opcoes: { ultima?: boolean } = {}): Promise<void> {
  const { controle } = ex;
  const ritmo = ex.ritmo();
  const rapido = ritmo.rapido;
  const f = ritmo.fator;
  const reduzido = movimentoReduzido();
  const pausa = (ms: number) => (rapido ? Promise.resolve() : controle.esperar(ms * f));
  // o fim da ação: tira o destaque, ou (na última do passo) deixa no alvo que continua à vista
  const soltar = (el: Element) => {
    if (opcoes.ultima && alvoNaTela(el)) destacar(el, rotuloDaAcao(acao), { abaixo: acao.tipo === 'passar' });
    else destacar(null);
  };

  if (acao.tipo === 'esperar') return controle.esperar(rapido ? Math.min(acao.ms, 1500) : acao.ms);

  if (acao.tipo === 'tecla') {
    if (!rapido) {
      destacar(null);
      await pausa(CADENCIA.noAlvo);
    }
    pressionarTecla(acao.tecla);
    await (rapido ? dormir(120) : pausa(CADENCIA.depoisDaAcao));
    return;
  }

  const age = acao.tipo === 'clicar' || acao.tipo === 'marcar' || acao.tipo === 'digitar' || acao.tipo === 'escolher';
  const el = await esperarAlvo(acao, controle);
  await rolarAte(el, !rapido && !reduzido, controle);

  if (acao.tipo === 'olhar') {
    if (rapido) return;
    destacar(el, rotuloDaAcao(acao));
    await pausa(acao.ms ?? CADENCIA.olhar);
    soltar(el);
    return;
  }
  if (acao.tipo === 'rolar') {
    if (!rapido) {
      destacar(el, rotuloDaAcao(acao));
      await pausa(CADENCIA.depoisDaAcao);
      soltar(el);
    }
    return;
  }

  // espera ficar habilitado (como o Playwright antes de clicar ou preencher)
  const alvo = age && !habilitado(el) ? await esperarAlvo(acao, controle, habilitado) : el;

  if (!rapido) {
    // no passar, a dica do produto abre acima do alvo: a pílula vai embaixo
    destacar(alvo, rotuloDaAcao(acao), { abaixo: acao.tipo === 'passar' });
    const moveu = await levarCursor(alvo, f, controle);
    // com o cursor já em cima (o passo anterior apontou), a pausa não cresce na Lenta: o clique que abre outra aba
    // tem de sair logo depois do clique da apresentadora
    await (moveu ? pausa(CADENCIA.noAlvo) : controle.esperar(CADENCIA.noAlvo));
  }
  const ponto = () => (!rapido && cursorAparente() ? posicaoDoCursor() : pontoDe(alvo));

  try {
    switch (acao.tipo) {
      case 'clicar':
      case 'marcar':
        if (!rapido) onda();
        clicarEm(alvo, ponto());
        break;
      case 'passar':
        entrar(alvo, ponto());
        await (rapido ? dormir(Math.min(acao.ms ?? CADENCIA.passar, 300)) : pausa(acao.ms ?? CADENCIA.passar));
        break;
      case 'digitar':
        if (!rapido) onda();
        clicarEm(alvo, ponto());
        await (rapido ? dormir(30) : pausa(CADENCIA.porLetra * 2));
        await digitarEm(alvo, acao.texto, acao.limpar !== false, controle, rapido ? 0 : tempoPorLetra(acao.texto, f));
        break;
      case 'escolher': {
        if (alvo instanceof HTMLSelectElement) {
          const opcao = [...alvo.options].find(o => normalizar(o.text).toLowerCase().includes(normalizar(acao.opcao).toLowerCase()));
          if (!opcao) throw new Error(`a opção "${acao.opcao}" não existe`);
          if (!rapido) onda();
          clicarEm(alvo, ponto());
          const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
          setter?.call(alvo, opcao.value);
          alvo.dispatchEvent(new Event('input', { bubbles: true }));
          alvo.dispatchEvent(new Event('change', { bubbles: true }));
          break;
        }
        if (!rapido) onda();
        clicarEm(alvo, ponto());
        const opcaoAcao = { tipo: 'clicar' as const, alvo: { papel: 'option' as const, nome: acao.opcao } };
        const op = await esperarAlvo(opcaoAcao, controle).catch(e => {
          if (e instanceof Cancelado) throw e;
          throw new FalhaDaAcao(acao, `a opção "${acao.opcao}" não apareceu em 6 s`, { sumiu: acao.opcao });
        });
        await rolarAte(op, !rapido && !reduzido, controle);
        if (!rapido) {
          destacar(op, `Escolha ${acao.opcao}`);
          await levarCursor(op, f, controle);
          await pausa(CADENCIA.noAlvo * 0.6);
          onda();
        }
        clicarEm(op, !rapido && cursorAparente() ? posicaoDoCursor() : pontoDe(op));
        break;
      }
    }
  } catch (e) {
    if (e instanceof Cancelado || e instanceof FalhaDaAcao) throw e;
    throw new FalhaDaAcao(acao, e instanceof Error ? e.message : String(e));
  }

  if (rapido) await dormir(120);
  else {
    await pausa(CADENCIA.depoisDaAcao);
    soltar(alvo);
  }
}

/** Executa as ações de um passo, a partir de `de`. A última deixa o destaque parado no fim (no automático). */
export async function executarPasso(passo: PassoDoFluxo, ex: Execucao, de = 0): Promise<void> {
  for (let i = de; i < passo.acoes.length; i++) {
    await ex.controle.checar();
    ex.aoAgir?.(i);
    await executarAcao(passo.acoes[i], ex, { ultima: i === passo.acoes.length - 1 });
  }
}

/**
 * Uma falha localizada: o passo (a partir de 1; 0 = fluxo anterior da cadeia) e a ação (a partir de 1). `sumiu`: o
 * nome curto do alvo que não apareceu (o aviso à apresentadora).
 */
export interface ResultadoDoTeste {
  ok: boolean;
  passo?: number;
  acao?: number;
  erro?: string;
  sumiu?: string;
}

/**
 * Refaz rápido a cadeia (os fluxos de depoisDe) e os passos do fluxo antes de `ate`. Uma falha diz onde parou, como o
 * executor por Playwright.
 */
export async function refazerRapido(f: Fluxo, ate: number, controle: Controle): Promise<ResultadoDoTeste> {
  const ex: Execucao = { controle, ritmo: () => ({ rapido: true, fator: 1 }) };
  let cadeia: Fluxo[];
  try {
    cadeia = cadeiaDe(f);
  } catch (e) {
    return { ok: false, passo: 0, acao: 0, erro: e instanceof Error ? e.message : String(e) };
  }
  for (const ant of cadeia.slice(0, -1)) {
    for (const passo of ant.passos) {
      for (const acao of passo.acoes) {
        try {
          await executarAcao(acao, ex);
        } catch (e) {
          if (e instanceof Cancelado) throw e;
          return { ok: false, passo: 0, acao: 0, erro: `no fluxo anterior ${ant.id}: ${e instanceof Error ? e.message : String(e)}`, sumiu: sumiuEm(e) };
        }
      }
    }
  }
  for (let p = 0; p < Math.min(ate, f.passos.length); p++) {
    const acoes = f.passos[p].acoes;
    for (let a = 0; a < acoes.length; a++) {
      try {
        await executarAcao(acoes[a], ex);
      } catch (e) {
        if (e instanceof Cancelado) throw e;
        return { ok: false, passo: p + 1, acao: a + 1, erro: e instanceof Error ? e.message : String(e), sumiu: sumiuEm(e) };
      }
    }
  }
  return { ok: true };
}

const sumiuEm = (e: unknown): string | undefined => (e instanceof FalhaDaAcao && e.sumiu !== null ? e.sumiu : undefined);

/**
 * Espera a raiz terminar a entrada pelo link (?perfil=, ?fluxo=) antes de procurar alvos: a barra de endereço limpa E
 * o roteador com esse mesmo endereço já aplicado na tela (em máquina lenta, a navegação do Vue Router chegava
 * depois e a tela reiniciava no meio do preparo). Quem tira os parâmetros é a raiz (RaizDosFluxos.vue).
 */
export async function esperarTelaPronta(controle: Controle): Promise<void> {
  const limite = performance.now() + 6000;
  while (performance.now() < limite) {
    await controle.checar();
    const q = new URLSearchParams(location.search);
    const aplicado = enderecoAplicadoPeloRoteador() === location.pathname + location.search;
    if (!q.has('perfil') && !q.has('fluxo') && aplicado && document.readyState === 'complete') break;
    await dormir(80);
  }
  await dormir(150);
}

/** Esconde o cursor, o destaque e a cortina (fim de uma execução). */
export function recolherCamada(): void {
  destacar(null);
  mostrarCursor(false);
  mostrarCortina(null);
}

