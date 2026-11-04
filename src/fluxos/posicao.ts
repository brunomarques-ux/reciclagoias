// A posição do painel do fluxo guiado (camada do protótipo, fora do produto; portado do SISLOG). O painel nunca pode
// deixar fora de alcance o que a pessoa precisa ver ou clicar (lá, a gaveta de filtros abria por baixo dele, e no fim
// da rolagem ele ficava na frente do último conteúdo).
//
// A cada quadro, enquanto o painel existe, ele olha os obstáculos:
//   - o alvo do passo, pelo destaque da camada (a caixa rosa e a pílula), também no "Feito." enquanto destacado; alvo
//     largo ou alto demais (mais da metade da janela) conta só pelo miolo, onde o gesto acontece, e pela pílula;
//   - as camadas abertas do Recicla: o que abrir como dialog, alertdialog, menu, listbox ou tooltip (as janelas do
//     complemento e da análise no Admin têm o role="dialog" na caixa, não no véu), o popover do período restritivo da
//     gestora e o painel do explorador de cenários. Uma camada com papel que ocupa a tela quase inteira (o véu com o
//     role, como a certidão da consulta) conta pelos filhos diretos, que são a caixa.
// E escolhe o primeiro lugar livre, nesta ordem: inferior direito (o padrão), inferior esquerdo, superior direito e
// superior esquerdo (abaixo da barra do topo). Sem nenhum livre, fica no de menor
// sobreposição (o alvo pesa muito mais que o resto) e compacto (data-apertado: o título, o andamento e os botões) até
// liberar. A troca é com opacidade, sem deslizar; nada animado com movimento reduzido. Histerese: um obstáculo novo
// tira o painel do lugar na hora, mas a volta a um lugar melhor e a saída do compacto esperam a tela ficar estável,
// para ele não ficar pulando. O recolhido da pessoa continua valendo (ele só ocupa menos).
//
// Fim da rolagem: o contêiner que rola por baixo do painel ganha, no fim, um espaço igual à parte dele coberta pelo
// painel (data-fluxo-reserva e --fluxo-reserva, em posicao.css), para o último conteúdo (a última linha, o rodapé, os
// botões) poder subir acima do painel. Só com o painel na tela; sem fluxo, nada muda no layout. No Recicla quem rola
// é a página inteira (o GestoraShell não tem <main> com rolagem própria): o espaço vai no fim do <body>.
import './posicao.css';
import { resolverAlvo } from './alvo';
import { fluxoPorId } from './registro';
import { fluxoAtivo } from './sessao';

type Lugar = 'inf-dir' | 'inf-esq' | 'sup-dir' | 'sup-esq';
type Caixa = { left: number; top: number; right: number; bottom: number };
type Obstaculo = Caixa & { peso: number };

const ORDEM: readonly Lugar[] = ['inf-dir', 'inf-esq', 'sup-dir', 'sup-esq'];
/** O data-desvio de cada lugar (o inferior direito é o padrão, sem atributo). */
const DESVIO: Record<Lugar, string | null> = { 'inf-dir': null, 'inf-esq': 'esquerda', 'sup-dir': 'acima', 'sup-esq': 'acima-esquerda' };

const PAINEL = '[data-prototipo="fluxo-painel"]';
const MARGEM = 24; // --rg-space-6: a distância do painel à borda
// No SISLOG o toast mora no canto inferior esquerdo e o painel subia 80 px ali. No Recicla o toast (RgToast) é
// centralizado embaixo: o canto esquerdo fica livre, sem a subida.
const ACIMA_DO_TOAST = 0;
const TETO = 576; // 36rem: a altura máxima do painel
const FOLGA = 8;
const PESO_DO_ALVO = 20;
const PESO_DO_CONTROLE = 4;
const CONTROLES = 'button, a[href], input, select, textarea, [role="option"], [role="menuitem"], [role="tab"]';
/** Quanto a tela fica estável antes de o painel voltar a um lugar melhor ou sair do compacto. */
const VOLTA_MS = 600;
const SOLTA_MS = 350;

/**
 * As camadas abertas do Recicla que o painel não pode cobrir. Os papéis ARIA valem para qualquer tela nova; as duas
 * classes são as camadas da gestora que abrem sem papel (src/components/gestora/RestrictedPeriodPopover.vue e
 * ExploradorCenarios.vue).
 */
const CAMADAS = [
  '[role="dialog"]',
  '[role="alertdialog"]',
  '[role="menu"]',
  '[role="listbox"]',
  '[role="tooltip"]',
  '.gx-popover',
  '#gx-explorador-painel',
].join(',');
/**
 * Os contêineres com rolagem própria que podem passar por baixo do painel. Hoje nenhuma tela do Recicla tem um (a
 * página inteira rola, tratada à parte em reservar); a lista fica para quando surgir, com a marca data-fluxo-rola.
 */
const ROLAGEM = '[data-fluxo-rola]';
/** Uma camada com papel que cobre mais que isto da janela, nos dois sentidos, é um véu: contam os filhos dela. */
const VEU = 0.85;

let lugar: Lugar = 'inf-dir';
let apertado = false;
/** A altura do painel aberto, guardada enquanto ele está compacto (compacto, ele mede menos). */
let alturaCheia = 0;
let melhorDesde = 0;
let melhorVisto: Lugar | null = null;
let livreDesde = 0;
let quadro = 0;
let espera = 0;
let painelVisto: HTMLElement | null = null;
const reservas = new Map<HTMLElement, number>();

const movimentoReduzido = (): boolean => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

const area = (a: Caixa, b: Caixa): number =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

function visivel(el: Element): DOMRect | null {
  const r = el.getBoundingClientRect();
  if (!(r.width > 0 && r.height > 0)) return null;
  if (r.bottom <= 0 || r.right <= 0 || r.top >= innerHeight || r.left >= innerWidth) return null;
  if ((el as HTMLElement).hidden) return null;
  const s = getComputedStyle(el);
  if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0) return null;
  return r;
}

/**
 * O alvo do passo antes de executar: no Automático, o destaque só aparece quando o passo roda, e enquanto a
 * apresentadora lê o passo o alvo (o ⋮, a aba, o Encaminhar) ficava embaixo do painel (varredura de 03/11). Aqui o
 * painel já sai de cima do alvo da primeira ação no "Pronto" (e no "Sua vez" do Manual, se o destaque ainda não
 * apareceu). Resolvido de novo só quando o passo muda ou o elemento sai da página.
 */
let alvoDoPronto: { chave: string; el: Element | null; em: number } | null = null;
function alvoAntesDeExecutar(painel: HTMLElement, agora: number): Element | null {
  const estado = painel.querySelector<HTMLElement>('.fx-painel__step')?.dataset.estado;
  const ativo = fluxoAtivo();
  // também no "Interrompido": sem destaque na tela, o alvo do passo que falhou fica livre para o clique à mão
  if (!ativo || ativo.feito || ativo.concluido || (estado !== 'pronto' && estado !== 'sua-vez' && estado !== 'erro')) return null;
  const chave = `${ativo.id}|${ativo.passo}`;
  const guardado = alvoDoPronto;
  if (guardado && guardado.chave === chave && (guardado.el ? guardado.el.isConnected : agora - guardado.em < 400)) return guardado.el;
  let el: Element | null = null;
  try {
    const acao = fluxoPorId(ativo.id)?.passos[ativo.passo]?.acoes.find(a => 'alvo' in a);
    el = acao && 'alvo' in acao ? resolverAlvo(acao.alvo) : null;
  } catch {
    el = null;
  }
  alvoDoPronto = { chave, el, em: agora };
  return el;
}

/** O alvo do passo (pelo destaque da camada ou, antes de executar, pelos dados do passo) e as camadas abertas. */
function obstaculos(painel: HTMLElement, agora: number): Obstaculo[] {
  const lista: Obstaculo[] = [];
  const caixa = document.querySelector('.fx-camada__caixa');
  let rc = caixa ? visivel(caixa) : null;
  if (!rc) {
    const alvo = alvoAntesDeExecutar(painel, agora);
    rc = alvo ? visivel(alvo) : null;
  }
  if (rc) {
    if (rc.width > innerWidth * 0.5 || rc.height > innerHeight * 0.5) {
      // alvo largo ou alto: conta o miolo, onde o gesto acontece (o painel pode cobrir a ponta, em geral vazia)
      const cx = rc.left + rc.width / 2;
      const cy = rc.top + rc.height / 2;
      const mw = Math.min(rc.width, 200) / 2;
      const mh = Math.min(rc.height, 96) / 2;
      lista.push({ left: cx - mw, top: cy - mh, right: cx + mw, bottom: cy + mh, peso: PESO_DO_ALVO });
    } else lista.push({ left: rc.left, top: rc.top, right: rc.right, bottom: rc.bottom, peso: PESO_DO_ALVO });
  }
  const pilula = document.querySelector('.fx-camada__pilula');
  const rp = pilula ? visivel(pilula) : null;
  if (rp) lista.push({ left: rp.left, top: rp.top, right: rp.right, bottom: rp.bottom, peso: PESO_DO_ALVO });
  const vistas = new Set<Element>();
  const camada = (el: Element) => {
    if (el.closest('[data-prototipo]') || vistas.has(el)) return;
    vistas.add(el);
    const r = visivel(el);
    if (!r) return;
    // o véu com o papel (a camada inteira da tela): o que conta é a caixa, os filhos diretos dele
    if (r.width >= innerWidth * VEU && r.height >= innerHeight * VEU && el.children.length) {
      for (const filho of el.children) camada(filho);
      return;
    }
    lista.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom, peso: 1 });
    // os controles da camada pesam mais: sem lugar livre, o painel compacto cobre o texto, não os botões e os campos
    // (o Enviar e o Cancelar de uma janela de confirmação numa janela baixa)
    let n = 0;
    for (const c of el.querySelectorAll(CONTROLES)) {
      if (++n > 80) break;
      const rc2 = c.getBoundingClientRect();
      if (rc2.width > 0 && rc2.height > 0) lista.push({ left: rc2.left, top: rc2.top, right: rc2.right, bottom: rc2.bottom, peso: PESO_DO_CONTROLE });
    }
  };
  for (const el of document.querySelectorAll(CAMADAS)) camada(el);
  return lista;
}

/**
 * Os controles de paginação à vista (fora das camadas e do protótipo), por papel: uma navegação com "paginação" no
 * nome. Hoje nenhuma tela logada do Recicla pagina; fica pronto para a lista de cadastros, se ela paginar.
 */
function paginacoes(): Obstaculo[] {
  const lista: Obstaculo[] = [];
  for (const el of document.querySelectorAll('nav[aria-label*="aginação" i], [role="navigation"][aria-label*="aginação" i]')) {
    if (el.closest('[data-prototipo]')) continue;
    const r = visivel(el);
    if (r) lista.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom, peso: 1 });
  }
  return lista;
}

/**
 * Onde o lugar de cima começa: abaixo da TopBar da área logada (56, TopBarRecicla.vue). No Recicla a barra rola com
 * a página (não é fixa), então vale a altura dela, constante, para o painel não mudar de lugar com a rolagem.
 */
const ALTURA_DA_TOPBAR = 56;
function topoDaTela(): number {
  return Math.max(0, Math.min(ALTURA_DA_TOPBAR, innerHeight / 3));
}

/** A altura que o painel teria sem o teto: a medida dele mais o que o corpo esconde rolando. */
function alturaNatural(painel: HTMLElement): number {
  let h = painel.offsetHeight;
  for (const corpo of painel.querySelectorAll<HTMLElement>('.fx-painel__body')) h += Math.max(0, corpo.scrollHeight - corpo.clientHeight);
  return h;
}

function caixaDoLugar(l: Lugar, w: number, hNatural: number, topo: number): Caixa {
  const baixo = l.startsWith('inf');
  const teto = Math.min(TETO, innerHeight - topo - 2 * MARGEM - (l === 'inf-esq' ? ACIMA_DO_TOAST : 0));
  const h = Math.max(0, Math.min(hNatural, teto));
  const left = l.endsWith('dir') ? innerWidth - MARGEM - w : MARGEM;
  const bottom = baixo ? innerHeight - MARGEM - (l === 'inf-esq' ? ACIMA_DO_TOAST : 0) : topo + MARGEM + h;
  return { left: left - FOLGA, top: bottom - h - FOLGA, right: left + w + FOLGA, bottom: bottom + FOLGA };
}

const sobreposicao = (c: Caixa, obs: Obstaculo[]): number => obs.reduce((s, o) => s + o.peso * area(c, o), 0);

function aplicar(painel: HTMLElement, novo: Lugar, comprimir: boolean): void {
  const mudouLugar = novo !== lugar || (DESVIO[novo] ?? undefined) !== painel.dataset.desvio;
  lugar = novo;
  const d = DESVIO[novo];
  if (d) painel.dataset.desvio = d;
  else delete painel.dataset.desvio;
  if (comprimir !== apertado || (comprimir ? painel.dataset.apertado === undefined : painel.dataset.apertado !== undefined)) {
    apertado = comprimir;
    if (comprimir) painel.dataset.apertado = '';
    else delete painel.dataset.apertado;
  }
  // a troca de canto entra com opacidade, sem deslizar de um lado ao outro; nada com movimento reduzido
  if (mudouLugar && !movimentoReduzido()) painel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
}

function decidir(painel: HTMLElement, agora: number): void {
  const topo = topoDaTela();
  const var_ = `${Math.round(topo)}px`;
  if (painel.style.getPropertyValue('--fx-painel-topo') !== var_) painel.style.setProperty('--fx-painel-topo', var_);
  const w = painel.offsetWidth;
  const natural = alturaNatural(painel);
  // a altura cheia só se mede com o painel aberto: compacto na execução (data-compacto) ele mede menos, e a saída do
  // apertado no "Feito" acharia lugar para a altura errada e voltaria ao compacto no quadro seguinte
  if (!apertado && painel.dataset.compacto === undefined) alturaCheia = natural;
  const hCheia = apertado ? Math.max(alturaCheia, natural) : natural;
  const obs = obstaculos(painel, agora);
  const livresDoAlvo = obs.length ? ORDEM.filter(l => sobreposicao(caixaDoLugar(l, w, hCheia, topo), obs) === 0) : [...ORDEM];
  // A paginação à vista (no SISLOG, o rodapé da lista de contratos; o fim de uma tabela rolada) é um obstáculo brando: entre
  // os lugares livres, o painel prefere os que não a cobrem; se todos cobrem, ela não tira o painel de um lugar livre
  // (não o manda para cima de Filtros e Exportar). O Bruno, 03/11: no fim da rolagem ele ficava na frente e não dava
  // para alcançar a paginação.
  const paginas = paginacoes();
  const semPaginacao = paginas.length ? livresDoAlvo.filter(l => sobreposicao(caixaDoLugar(l, w, hCheia, topo), paginas) === 0) : livresDoAlvo;
  const livres = semPaginacao.length ? semPaginacao : livresDoAlvo;

  if (livres.length) {
    const melhor = livres[0];
    if (apertado) {
      // sai do compacto só com um lugar livre por um tempo (a gaveta fechando, a janela saindo)
      if (!livreDesde) livreDesde = agora;
      if (agora - livreDesde < SOLTA_MS) return;
      livreDesde = 0;
      aplicar(painel, melhor, false);
      return;
    }
    livreDesde = 0;
    if (!livres.includes(lugar)) {
      // o lugar atual ficou ocupado: troca já
      melhorVisto = null;
      aplicar(painel, melhor, false);
      return;
    }
    if (melhor === lugar) {
      melhorVisto = null;
      return;
    }
    // um lugar melhor liberou: volta só depois de estável
    if (melhorVisto !== melhor) {
      melhorVisto = melhor;
      melhorDesde = agora;
      return;
    }
    if (agora - melhorDesde >= VOLTA_MS) {
      melhorVisto = null;
      aplicar(painel, melhor, false);
    }
    return;
  }

  // nenhum lugar livre: compacto, no de menor sobreposição (com a altura compacta)
  livreDesde = 0;
  melhorVisto = null;
  const hCompacta = apertado ? natural : Math.min(natural, estimarCompacto(painel));
  const custo = (l: Lugar) => sobreposicao(caixaDoLugar(l, w, hCompacta, topo), obs);
  let escolhido = lugar;
  let menor = custo(lugar);
  for (const l of ORDEM) {
    const c = custo(l);
    if (c < menor * 0.9) {
      menor = c;
      escolhido = l;
    }
  }
  aplicar(painel, escolhido, true);
}

/** O cabeçalho, o andamento e os botões: o que fica no compacto. */
function estimarCompacto(painel: HTMLElement): number {
  const cab = painel.querySelector<HTMLElement>('.fx-painel__header')?.offsetHeight ?? 64;
  const pe = painel.querySelector<HTMLElement>('.fx-painel__footer')?.offsetHeight ?? 56;
  return cab + pe + 40;
}

// ── o espaço no fim da rolagem ───────────────────────────────────────────────────────────────────

function reservar(painel: HTMLElement): void {
  const p = painel.getBoundingClientRect();
  const vistos = new Set<HTMLElement>();
  const embaixo = lugar.startsWith('inf');
  for (const el of document.querySelectorAll<HTMLElement>(ROLAGEM)) {
    if (el.closest('[data-prototipo]')) continue;
    const r = el.getBoundingClientRect();
    if (!embaixo || !(r.width > 0 && r.height > 0)) continue;
    const base = Math.min(r.bottom, innerHeight);
    const coberto = Math.min(r.right, p.right) - Math.max(r.left, p.left) > 0 && base > p.top;
    if (!coberto) continue;
    const atual = reservas.get(el) ?? 0;
    // Só o que rola de fato (sem contar a reserva) ganha o espaço. O conteúdo curto não: a rolagem nova mexeria na
    // tela à toa (no SISLOG, a lista vazia ganhava barra), e num contêiner flex de altura fixa (o <main> do
    // AppShell) o espaço encolheria os filhos (o cartão da tabela chegava a zero). Rolando, os filhos já estão no
    // mínimo. Na lista, quem rola é a região da tabela, e ela ganha o espaço dela.
    if (el.scrollHeight - atual <= el.clientHeight + 1) continue;
    marcar(el, base - p.top, vistos);
  }
  // A página inteira rolando (o caso do Recicla: o GestoraShell e a entrada rolam pelo documento). Diferente do
  // SISLOG, aqui o #app não tem altura fixa: o conteúdo cresce no fluxo normal e um espaço no fim do <body> começa
  // depois dele. Mesma regra: só se a página já rola sem a reserva, e só com o painel embaixo.
  const pagina = document.scrollingElement;
  const corpo = document.body;
  if (embaixo && pagina && corpo && !corpo.closest('[data-prototipo]')) {
    const atual = reservas.get(corpo) ?? 0;
    if (pagina.scrollHeight - atual > innerHeight + 1 && innerHeight > p.top) marcar(corpo, innerHeight - p.top, vistos);
  }
  for (const el of [...reservas.keys()]) if (!vistos.has(el)) soltar(el);
}

function marcar(el: HTMLElement, coberto: number, vistos: Set<HTMLElement>): void {
  const atual = reservas.get(el) ?? 0;
  const reserva = Math.ceil((coberto + FOLGA * 2) / 4) * 4;
  vistos.add(el);
  // só cresce enquanto o painel está embaixo: encolher a cada passo (o painel compacto na execução, cheio no "Feito")
  // faria o navegador corrigir a rolagem e a tela pular no fim da página
  if (reserva - atual < 4) return;
  reservas.set(el, reserva);
  el.style.setProperty('--fluxo-reserva', `${reserva}px`);
  el.dataset.fluxoReserva = '';
}

function soltar(el: HTMLElement): void {
  reservas.delete(el);
  el.style.removeProperty('--fluxo-reserva');
  delete el.dataset.fluxoReserva;
}

// ── o acompanhamento ─────────────────────────────────────────────────────────────────────────────

function zerar(): void {
  for (const el of [...reservas.keys()]) soltar(el);
  lugar = 'inf-dir';
  apertado = false;
  alturaCheia = 0;
  melhorVisto = null;
  livreDesde = 0;
  alvoDoPronto = null;
}

function acompanhar(): void {
  quadro = 0;
  const painel = document.querySelector<HTMLElement>(PAINEL);
  if (!painel) {
    if (painelVisto) zerar();
    painelVisto = null;
    // sem painel, olha de vez em quando (o fluxo pode começar de novo)
    espera = window.setTimeout(() => {
      espera = 0;
      quadro = requestAnimationFrame(acompanhar);
    }, 400);
    return;
  }
  if (painel !== painelVisto) {
    // painel novo (outro fluxo, ou a carga): começa do padrão
    zerar();
    painelVisto = painel;
  }
  if (!document.hidden) {
    decidir(painel, performance.now());
    reservar(painel);
  }
  quadro = requestAnimationFrame(acompanhar);
}

/** Liga o acompanhamento (uma vez; a recarga do módulo no desenvolvimento desliga a anterior). */
function ligar(): void {
  const w = window as unknown as { __rgFluxoPosicao?: () => void };
  w.__rgFluxoPosicao?.();
  quadro = requestAnimationFrame(acompanhar);
  w.__rgFluxoPosicao = () => {
    cancelAnimationFrame(quadro);
    clearTimeout(espera);
    zerar();
  };
}

if (typeof window !== 'undefined') ligar();

/** O lugar atual do painel (para os testes e a camada). */
export function lugarDoPainel(): { lugar: Lugar; apertado: boolean } {
  return { lugar, apertado };
}
