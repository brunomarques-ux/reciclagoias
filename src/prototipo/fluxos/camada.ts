// A camada visual dos fluxos guiados (camada do protótipo, fora do produto): o cursor virtual, o destaque do alvo com
// a pílula da ação, o véu leve e a onda do clique. DOM puro, fora do Vue, numa camada fixa acima de tudo, sem
// receber clique (pointer-events: none) e escondida do leitor de tela (aria-hidden): quem narra é a apresentadora,
// e o painel do fluxo diz o passo em texto.
//
// O destaque acompanha o alvo a cada quadro (requestAnimationFrame), como o das jornadas da GOinfra. O lugar do
// painel do fluxo fica com o posicao.ts: ele sai de cima do destaque (a caixa e a pílula) e das camadas abertas.
//
// A pílula fica acima da caixa; abaixo dela no "passar" e quando uma dica aberta ([role=tooltip]) cruzaria a pílula
// (a dica é o que o passo quer mostrar); à esquerda da caixa quando nem acima nem abaixo dá. A cortina cobre a página enquanto o fluxo prepara a tela (o preparo rápido
// não aparece para a plateia).
import './camada.css';
import './posicao';

let raiz: HTMLDivElement | null = null;
let caixa: HTMLDivElement | null = null;
let pilula: HTMLDivElement | null = null;
let cursor: HTMLDivElement | null = null;
let cortina: HTMLDivElement | null = null;
let saidaDaCortina: Animation | null = null;
let alvoAtual: Element | null = null;
let rotuloAtual = '';
let pilulaAbaixo = false;
let quadro = 0;
let pos = { x: -100, y: -100 };
let cursorVisivel = false;
let posicionado = false;

export const movimentoReduzido = (): boolean => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

const SETA =
  '<svg width="26" height="30" viewBox="0 0 26 30" focusable="false"><path d="M3 2.5v21.2l5.6-5.2 3.7 8.6 3.9-1.7-3.7-8.4h7.7z" fill="#fff" stroke="#1b1f24" stroke-width="1.7" stroke-linejoin="round"/></svg>';

function garantir(): void {
  if (raiz && raiz.isConnected) return;
  raiz = document.createElement('div');
  raiz.className = 'fx-camada';
  raiz.dataset.prototipo = 'fluxo-camada';
  raiz.setAttribute('aria-hidden', 'true');
  caixa = document.createElement('div');
  caixa.className = 'fx-camada__caixa';
  caixa.hidden = true;
  pilula = document.createElement('div');
  pilula.className = 'fx-camada__pilula';
  pilula.hidden = true;
  cursor = document.createElement('div');
  cursor.className = 'fx-camada__cursor';
  cursor.innerHTML = SETA;
  cursor.hidden = true;
  cortina = document.createElement('div');
  cortina.className = 'fx-camada__cortina';
  cortina.hidden = true;
  cortina.innerHTML =
    '<div class="fx-camada__cortina-caixa"><span class="fx-camada__cortina-roda"></span><p class="fx-camada__cortina-texto">Preparando o fluxo…</p><p class="fx-camada__cortina-titulo"></p></div>';
  raiz.append(caixa, pilula, cursor, cortina);
  document.body.appendChild(raiz);
  quadro = requestAnimationFrame(acompanhar);
}

/** Tira a camada inteira (fluxo encerrado). */
export function desmontarCamada(): void {
  cancelAnimationFrame(quadro);
  quadro = 0;
  saidaDaCortina?.cancel();
  saidaDaCortina = null;
  raiz?.remove();
  raiz = caixa = pilula = cursor = cortina = null;
  alvoAtual = null;
  cursorVisivel = false;
  posicionado = false;
}

/**
 * Destaca o alvo com a pílula (ou tira o destaque, com null). `abaixo`: a pílula vai embaixo da caixa (no "passar",
 * a dica do produto abre acima do alvo).
 */
export function destacar(el: Element | null, rotulo = '', opcoes: { abaixo?: boolean } = {}): void {
  if (!el) {
    alvoAtual = null;
    if (caixa) caixa.hidden = true;
    if (pilula) pilula.hidden = true;
    return;
  }
  garantir();
  const novo = el !== alvoAtual || rotulo !== rotuloAtual;
  alvoAtual = el;
  rotuloAtual = rotulo;
  pilulaAbaixo = !!opcoes.abaixo;
  if (pilula) {
    pilula.textContent = rotulo;
    pilula.hidden = !rotulo;
  }
  if (novo && !movimentoReduzido()) {
    caixa?.animate([{ opacity: 0, scale: '1.08' }, { opacity: 1, scale: '1' }], { duration: 380, easing: 'cubic-bezier(0, 0, 0, 1)' });
    pilula?.animate([{ opacity: 0, translate: '0 6px' }, { opacity: 1, translate: '0 0' }], { duration: 320, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
  }
}

export function alvoDestacado(): Element | null {
  return alvoAtual;
}

/**
 * O elemento continua à vista: na página, com caixa, e o que está no centro dele (fora da camada e do painel) é ele ou
 * parte dele. Uma gaveta ou janela que abriu por cima tira o elemento de vista.
 */
export function alvoNaTela(el: Element): boolean {
  if (!el.isConnected) return false;
  const r = el.getBoundingClientRect();
  if (!(r.width > 0 && r.height > 0)) return false;
  const p = pontoDe(el);
  const topo = document.elementsFromPoint(p.x, p.y).find(e => !e.closest('[data-prototipo]'));
  return !!topo && (el.contains(topo) || topo.contains(el));
}

// ── a cortina do preparo ─────────────────────────────────────────────────────────────────────────

/**
 * A cortina opaca sobre a página, com "Preparando o fluxo…" e o título (ou tira, com null). O painel do fluxo fica
 * acima dela. O motor age direto nos elementos, então a cortina não atrapalha o preparo; ela segura o clique da
 * apresentadora enquanto a tela é refeita.
 */
export function mostrarCortina(titulo: string | null): void {
  if (titulo === null) {
    if (!cortina || cortina.hidden || saidaDaCortina) return;
    const c = cortina;
    if (movimentoReduzido()) {
      c.hidden = true;
      return;
    }
    saidaDaCortina = c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'cubic-bezier(0.3, 0, 1, 1)' });
    saidaDaCortina.onfinish = () => {
      c.hidden = true;
      saidaDaCortina = null;
    };
    return;
  }
  garantir();
  if (!cortina) return;
  saidaDaCortina?.cancel();
  saidaDaCortina = null;
  const t = cortina.querySelector('.fx-camada__cortina-titulo');
  if (t) t.textContent = titulo;
  cortina.hidden = false;
}

export function cortinaAberta(): boolean {
  return !!cortina && !cortina.hidden && !saidaDaCortina;
}

// ── o acompanhamento a cada quadro ───────────────────────────────────────────────────────────────

type Caixa = { left: number; top: number; right: number; bottom: number };

const area = (a: DOMRect | Caixa, b: Caixa) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

/** As dicas abertas na tela (a Tooltip da biblioteca fica no DOM mesmo fechada, sem caixa). */
function dicasAbertas(): DOMRect[] {
  const lista: DOMRect[] = [];
  for (const d of document.querySelectorAll('[role="tooltip"]')) {
    if (d.closest('[data-prototipo]')) continue;
    const r = d.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) lista.push(r);
  }
  return lista;
}

function acompanhar(): void {
  quadro = requestAnimationFrame(acompanhar);
  if (!caixa || !pilula) return;
  const el = alvoAtual;
  const r = el && el.isConnected ? el.getBoundingClientRect() : null;
  if (!r || (!r.width && !r.height)) {
    if (!caixa.hidden) caixa.hidden = true;
    if (!pilula.hidden) pilula.hidden = true;
    return;
  }
  caixa.hidden = false;
  if (rotuloAtual) pilula.hidden = false;
  const m = 5;
  caixa.style.transform = `translate(${r.left - m}px, ${r.top - m}px)`;
  caixa.style.width = `${r.width + 2 * m}px`;
  caixa.style.height = `${r.height + 2 * m}px`;
  if (rotuloAtual) {
    const pw = pilula.offsetWidth;
    const ph = pilula.offsetHeight;
    let px = Math.min(Math.max(8, r.left - m), innerWidth - pw - 8);
    const acima = r.top - m - ph - 8;
    const abaixo = r.bottom + m + 8;
    const cabe = (y: number) => y >= 8 && y + ph <= innerHeight - 8;
    const dicas = dicasAbertas();
    const livre = (x: number, y: number) => !dicas.some(d => area(d, { left: x, top: y, right: x + pw, bottom: y + ph }) > 0);
    // acima da caixa; abaixo no passar e quando a dica aberta ficaria embaixo da pílula
    const ordem = pilulaAbaixo ? [abaixo, acima] : [acima, abaixo];
    let py = ordem.find(y => cabe(y) && livre(px, y));
    if (py === undefined) {
      // o alvo no pé da tela, com a dica em cima (no SISLOG, o menu ⋮ da última linha de uma tabela em 1366 x 768): embaixo não cabe e em cima
      // cobriria a dica. A pílula vai à esquerda da caixa, na altura dela; sem lugar ali, a primeira que cabe.
      const xEsquerda = r.left - m - pw - 8;
      const yMeio = Math.min(Math.max(8, r.top + (r.height - ph) / 2), innerHeight - ph - 8);
      if (dicas.length && xEsquerda >= 8 && livre(xEsquerda, yMeio)) {
        px = xEsquerda;
        py = yMeio;
      } else py = ordem.find(cabe) ?? Math.max(8, Math.min(abaixo, innerHeight - ph - 8));
    }
    pilula.style.transform = `translate(${px}px, ${py}px)`;
  }
}

// ── o cursor ─────────────────────────────────────────────────────────────────────────────────────

function desenharCursor(): void {
  if (cursor) cursor.style.transform = `translate(${pos.x - 3}px, ${pos.y - 2}px)`;
}

export function mostrarCursor(v: boolean): void {
  if (v) garantir();
  cursorVisivel = v;
  if (!cursor) return;
  if (v && !posicionado) {
    // a primeira vez, o cursor sai de perto do painel (onde a apresentadora acabou de clicar)
    const painel = document.querySelector<HTMLElement>('[data-prototipo="fluxo-painel"]')?.getBoundingClientRect();
    pos = painel ? { x: Math.max(40, painel.left - 48), y: painel.top + 40 } : { x: innerWidth * 0.6, y: innerHeight * 0.6 };
    posicionado = true;
  }
  cursor.hidden = !v;
  desenharCursor();
}

export function cursorAparente(): boolean {
  return cursorVisivel;
}

export function posicaoDoCursor(): { x: number; y: number } {
  return { ...pos };
}

/** O ponto do gesto no elemento: o centro, dentro da tela. */
export function pontoDe(el: Element): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  return {
    x: Math.min(Math.max(r.left + r.width / 2, 4), innerWidth - 4),
    y: Math.min(Math.max(r.top + r.height / 2, 4), innerHeight - 4),
  };
}

const suave = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

export interface Espera {
  /** Rejeita quando a execução é cancelada; segura enquanto está pausada. */
  pausado(): boolean;
  cancelado(): boolean;
}

/**
 * Leva o cursor até o elemento, devagar: cerca de 450 px/s, de 700 ms a 1800 ms por deslocamento (vezes o fator da
 * velocidade), com aceleração suave, acompanhando o alvo se ele se mover. Com movimento reduzido, salta. Se o cursor
 * já está em cima do elemento, fica onde está: o clique sai logo (o que abre outra aba precisa sair até uns 5 s depois
 * do clique da apresentadora em Executar passo). Resolve com true se o cursor saiu do lugar.
 */
export function moverCursorAte(el: Element, fator: number, espera: Espera): Promise<boolean> {
  const jaVisivel = cursorVisivel;
  mostrarCursor(true);
  const inicio = { ...pos };
  if (jaVisivel && el.isConnected) {
    const r = el.getBoundingClientRect();
    if (inicio.x >= r.left && inicio.x <= r.right && inicio.y >= r.top && inicio.y <= r.bottom) return Promise.resolve(false);
  }
  const destino = () => (el.isConnected ? pontoDe(el) : null);
  const d0 = destino() ?? inicio;
  const dist = Math.hypot(d0.x - inicio.x, d0.y - inicio.y);
  if (movimentoReduzido() || dist < 3 || document.hidden) {
    pos = d0;
    desenharCursor();
    return Promise.resolve(dist >= 3);
  }
  const dur = Math.min(1800, Math.max(700, (dist / 450) * 1000)) * fator;
  return new Promise((resolve, reject) => {
    let t0 = -1;
    let pausadoEm = 0;
    const tick = (t: number) => {
      if (espera.cancelado()) return reject(new Error('cancelado'));
      if (t0 < 0) t0 = t;
      if (espera.pausado()) {
        if (!pausadoEm) pausadoEm = t;
        requestAnimationFrame(tick);
        return;
      }
      if (pausadoEm) {
        t0 += t - pausadoEm;
        pausadoEm = 0;
      }
      const p = Math.min(1, (t - t0) / dur);
      const e = suave(p);
      const d = destino() ?? d0;
      pos = { x: inicio.x + (d.x - inicio.x) * e, y: inicio.y + (d.y - inicio.y) * e };
      desenharCursor();
      if (p < 1) requestAnimationFrame(tick);
      else resolve(true);
    };
    requestAnimationFrame(tick);
  });
}

/** Põe o cursor no ponto, sem deslizar (o clique e a digitação acontecem onde ele está). */
export function cursorEm(p: { x: number; y: number }): void {
  pos = { ...p };
  desenharCursor();
}

/** O aperto do clique: o cursor encolhe um pouco e uma onda sai da ponta. Sem onda com movimento reduzido. */
export function onda(): void {
  if (!raiz || movimentoReduzido()) return;
  cursor?.animate([{ scale: '1' }, { scale: '0.86' }, { scale: '1' }], { duration: 260, easing: 'ease-out' });
  const o = document.createElement('div');
  o.className = 'fx-camada__onda';
  o.style.left = `${pos.x}px`;
  o.style.top = `${pos.y}px`;
  raiz.appendChild(o);
  const a = o.animate([{ transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0.75 }, { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }], { duration: 560, easing: 'cubic-bezier(0, 0, 0, 1)' });
  a.onfinish = () => o.remove();
}
