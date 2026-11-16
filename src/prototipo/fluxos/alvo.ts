// Achar o alvo de uma ação no DOM com a mesma regra do getByRole e do getByText do Playwright (portado do protótipo
// do SISLOG sem mudança de regra; lá um executor por Playwright usa a mesma lógica nos testes):
//   papel + nome acessível, como o getByRole (papéis implícitos e nome pela ordem aria-labelledby, aria-label, rótulo,
//   alt, title e, nos papéis que aceitam, o texto); texto visível, como o getByText (o elemento mais interno que
//   contém o texto); css; `dentro` (procura só dentro de outro alvo) e `n` (o enésimo).
// Nome e texto casam por trecho, sem diferença de maiúscula e com os espaços normalizados; `exato` exige o texto todo.
// Só valem elementos visíveis e fora da camada do próprio protótipo ([data-prototipo]: painel, cursor, destaque).
import type { Alvo } from './tipos';

export const normalizar = (s: string): string => s.replace(/\s+/g, ' ').trim();

function casa(texto: string, procurado: string, exato?: boolean): boolean {
  const a = normalizar(texto);
  const b = normalizar(procurado);
  return exato ? a === b : a.toLowerCase().includes(b.toLowerCase());
}

/** Dentro da camada do protótipo (painel do fluxo, cursor, destaque, atalho): fora da busca. */
const daCamada = (el: Element): boolean => !!el.closest('[data-prototipo]');

/** Fora da árvore de acessibilidade: aria-hidden num ancestral, display none, visibility hidden. */
export function ocultoParaLeitor(el: Element): boolean {
  for (let e: Element | null = el; e; e = e.parentElement) {
    if (e.getAttribute('aria-hidden') === 'true') return true;
  }
  const cs = getComputedStyle(el);
  if (cs.display === 'contents') return el.parentElement ? ocultoParaLeitor(el.parentElement) : false;
  const ver = (el as Element & { checkVisibility?: (o?: object) => boolean }).checkVisibility;
  if (typeof ver === 'function') return !ver.call(el, { visibilityProperty: true });
  return cs.display === 'none' || cs.visibility === 'hidden' || el.getClientRects().length === 0;
}

/** Visível na tela: com caixa (largura e altura), sem display none nem visibility hidden. É o que o getByText e o css
    exigem (um texto aria-hidden, como uma legenda de gráfico, continua valendo). */
export function visivelNaTela(el: Element): boolean {
  const r = el.getBoundingClientRect();
  if (!(r.width > 0 && r.height > 0)) return false;
  const ver = (el as Element & { checkVisibility?: (o?: object) => boolean }).checkVisibility;
  if (typeof ver === 'function') return ver.call(el, { visibilityProperty: true });
  return getComputedStyle(el).visibility !== 'hidden';
}

/** Visível para o getByRole: na árvore de acessibilidade e com caixa. */
export function visivel(el: Element): boolean {
  return !ocultoParaLeitor(el) && visivelNaTela(el);
}

// ── papel ────────────────────────────────────────────────────────────────────────────────────────

const temNomeExplicito = (el: Element) => !!(el.getAttribute('aria-label')?.trim() || el.getAttribute('aria-labelledby')?.trim() || el.getAttribute('title')?.trim());

function papelDoTh(el: Element): string {
  const escopo = el.getAttribute('scope');
  if (escopo === 'row' || escopo === 'rowgroup') return 'rowheader';
  if (escopo === 'col' || escopo === 'colgroup') return 'columnheader';
  if (el.closest('thead')) return 'columnheader';
  const linha = el.parentElement;
  if (linha && [...linha.children].every(c => c.tagName === 'TH')) return 'columnheader';
  return 'rowheader';
}

/** O papel do elemento: o do atributo role (o primeiro) ou o implícito da tag. */
export function papelDe(el: Element): string {
  const explicito = el.getAttribute('role')?.trim().split(/\s+/)[0];
  if (explicito) return explicito;
  const tag = el.tagName.toLowerCase();
  switch (tag) {
    case 'a':
    case 'area':
      return el.hasAttribute('href') ? 'link' : '';
    case 'button':
      return 'button';
    case 'input': {
      const t = (el.getAttribute('type') || 'text').toLowerCase();
      if (t === 'button' || t === 'submit' || t === 'reset' || t === 'image') return 'button';
      if (t === 'checkbox') return 'checkbox';
      if (t === 'radio') return 'radio';
      if (t === 'range') return 'slider';
      if (t === 'number') return 'spinbutton';
      if (t === 'hidden' || t === 'file' || t === 'color') return '';
      if (el.hasAttribute('list')) return 'combobox';
      if (t === 'search') return 'searchbox';
      return 'textbox';
    }
    case 'textarea':
      return 'textbox';
    case 'select': {
      const s = el as HTMLSelectElement;
      return s.multiple || s.size > 1 ? 'listbox' : 'combobox';
    }
    case 'option':
      return 'option';
    case 'optgroup':
    case 'fieldset':
    case 'details':
      return 'group';
    case 'dialog':
      return 'dialog';
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading';
    case 'img':
      return el.getAttribute('alt') === '' && !temNomeExplicito(el) ? 'presentation' : 'img';
    case 'svg':
      return 'img';
    case 'li':
      return 'listitem';
    case 'ul':
    case 'ol':
    case 'menu':
      return 'list';
    case 'nav':
      return 'navigation';
    case 'main':
      return 'main';
    case 'aside':
      return 'complementary';
    case 'section':
      return temNomeExplicito(el) ? 'region' : '';
    case 'form':
      return temNomeExplicito(el) ? 'form' : '';
    case 'table':
      return 'table';
    case 'thead':
    case 'tbody':
    case 'tfoot':
      return 'rowgroup';
    case 'tr':
      return 'row';
    case 'td': {
      const r = el.closest('table')?.getAttribute('role');
      return r === 'grid' || r === 'treegrid' ? 'gridcell' : 'cell';
    }
    case 'th':
      return papelDoTh(el);
    case 'output':
      return 'status';
    case 'p':
      return 'paragraph';
    case 'hr':
      return 'separator';
    case 'progress':
      return 'progressbar';
    case 'article':
      return 'article';
    default:
      return '';
  }
}

/** Seletor dos elementos que podem ter o papel sem o atributo role (o resto vem pelo [role]). */
const IMPLICITO: Readonly<Record<string, string>> = {
  button: 'button, input[type=button], input[type=submit], input[type=reset], input[type=image]',
  link: 'a[href], area[href]',
  textbox: 'input, textarea',
  searchbox: 'input[type=search]',
  combobox: 'select, input[list]',
  listbox: 'select',
  option: 'option',
  checkbox: 'input[type=checkbox]',
  radio: 'input[type=radio]',
  row: 'tr',
  cell: 'td',
  gridcell: 'td',
  columnheader: 'th',
  rowheader: 'th',
  heading: 'h1, h2, h3, h4, h5, h6',
  dialog: 'dialog',
  region: 'section',
  img: 'img, svg',
  listitem: 'li',
  list: 'ul, ol, menu',
  group: 'fieldset, details, optgroup',
  navigation: 'nav',
  status: 'output',
  table: 'table',
  main: 'main',
  complementary: 'aside',
  form: 'form',
};

// ── nome acessível ───────────────────────────────────────────────────────────────────────────────

/** Papéis que tiram o nome do conteúdo (os mesmos do Playwright). */
const NOME_DO_CONTEUDO = new Set([
  'button', 'cell', 'checkbox', 'columnheader', 'gridcell', 'heading', 'link', 'menuitem', 'menuitemcheckbox',
  'menuitemradio', 'option', 'radio', 'row', 'rowheader', 'switch', 'tab', 'tooltip', 'treeitem',
]);
const SEM_TEXTO = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);

interface Ctx {
  raiz: boolean;
  viaRotulo: boolean;
  incluirOcultos: boolean;
  visitados: Set<Element>;
}

function valorDoControle(el: Element): string | null {
  if (el instanceof HTMLInputElement && papelDe(el) !== 'button' && papelDe(el) !== 'checkbox' && papelDe(el) !== 'radio') return el.value;
  if (el instanceof HTMLTextAreaElement) return el.value;
  if (el instanceof HTMLSelectElement) return [...el.selectedOptions].map(o => o.textContent ?? '').join(' ');
  return null;
}

function nome(el: Element, ctx: Ctx): string {
  if (ctx.visitados.has(el)) return '';
  ctx.visitados.add(el);
  if (!ctx.raiz && !ctx.incluirOcultos && ocultoParaLeitor(el)) return '';

  // aria-labelledby (não se segue de novo dentro de outro aria-labelledby)
  const ids = el.getAttribute('aria-labelledby');
  if (ids && !ctx.viaRotulo) {
    const t = ids
      .split(/\s+/)
      .map(id => document.getElementById(id))
      .filter((r): r is HTMLElement => !!r)
      .map(r => nome(r, { raiz: false, viaRotulo: true, incluirOcultos: ocultoParaLeitor(r), visitados: new Set([el]) }))
      .join(' ');
    if (normalizar(t)) return t;
  }

  const papel = papelDe(el);
  // controle dentro de um rótulo ou de um conteúdo: vale o valor
  if (!ctx.raiz) {
    const v = valorDoControle(el);
    if (v !== null && (papel === 'textbox' || papel === 'searchbox' || papel === 'combobox' || papel === 'listbox')) return v;
  }

  const rotulo = el.getAttribute('aria-label');
  if (rotulo && normalizar(rotulo)) return rotulo;

  // nativo
  if (el instanceof HTMLInputElement) {
    const t = el.type;
    if (t === 'button' || t === 'submit' || t === 'reset') return el.value || (t === 'submit' ? 'Submit' : t === 'reset' ? 'Reset' : '');
    if (t === 'image') return el.alt || el.title || 'Submit';
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    const doRotulo = [...(el.labels ?? [])]
      .map(l => nome(l, { raiz: false, viaRotulo: ctx.viaRotulo, incluirOcultos: ctx.incluirOcultos, visitados: ctx.visitados }))
      .join(' ');
    if (normalizar(doRotulo)) return doRotulo;
    const titulo = el.getAttribute('title') || el.getAttribute('placeholder');
    if (titulo && normalizar(titulo)) return titulo;
  }
  if (el instanceof HTMLImageElement && el.alt) return el.alt;
  if (el instanceof HTMLFieldSetElement) {
    const legenda = el.querySelector(':scope > legend');
    if (legenda) {
      const t = nome(legenda, { ...ctx, raiz: false });
      if (normalizar(t)) return t;
    }
  }
  if (el instanceof HTMLTableElement && el.caption) {
    const t = nome(el.caption, { ...ctx, raiz: false });
    if (normalizar(t)) return t;
  }

  // pelo conteúdo
  if (!ctx.raiz || NOME_DO_CONTEUDO.has(papel)) {
    let t = '';
    for (const filho of el.childNodes) {
      if (filho.nodeType === Node.TEXT_NODE) t += filho.nodeValue ?? '';
      else if (filho.nodeType === Node.ELEMENT_NODE) {
        const f = filho as Element;
        if (SEM_TEXTO.has(f.tagName)) continue;
        const parte = nome(f, { raiz: false, viaRotulo: ctx.viaRotulo, incluirOcultos: ctx.incluirOcultos, visitados: ctx.visitados });
        const display = getComputedStyle(f).display || 'inline';
        t += display !== 'inline' || f.tagName === 'BR' ? ` ${parte} ` : parte;
      }
    }
    if (normalizar(t)) return t;
  }

  const titulo = el.getAttribute('title');
  if (titulo && normalizar(titulo)) return titulo;
  return '';
}

/** O nome acessível, com os espaços normalizados. */
export function nomeAcessivel(el: Element): string {
  return normalizar(nome(el, { raiz: true, viaRotulo: false, incluirOcultos: false, visitados: new Set() }));
}

// ── os candidatos ────────────────────────────────────────────────────────────────────────────────

function porPapel(escopo: ParentNode, papel: string, procurado: string, exato?: boolean): Element[] {
  const seletor = [IMPLICITO[papel], '[role]'].filter(Boolean).join(', ');
  const lista: Element[] = [];
  for (const el of escopo.querySelectorAll(seletor)) {
    if (papelDe(el) !== papel || daCamada(el) || !visivel(el)) continue;
    if (casa(nomeAcessivel(el), procurado, exato)) lista.push(el);
  }
  return lista;
}

const textoDe = (el: Element): string =>
  el instanceof HTMLInputElement && (el.type === 'button' || el.type === 'submit' || el.type === 'reset') ? el.value : (el.textContent ?? '');

/** Como o getByText: os elementos mais internos cujo texto casa (um filho que também casa fica no lugar do pai). */
function porTexto(escopo: ParentNode, procurado: string, exato?: boolean): Element[] {
  const achados: Element[] = [];
  const agulha = normalizar(procurado).toLowerCase();
  // desce só por onde o texto (por trecho) aparece: o texto de um filho está dentro do texto do pai
  const descer = (el: Element, podeSerEle: boolean): boolean => {
    let algumFilho = false;
    for (const filho of el.children) {
      if (SEM_TEXTO.has(filho.tagName) || daCamada(filho)) continue;
      if (!normalizar(textoDe(filho)).toLowerCase().includes(agulha)) continue;
      if (descer(filho, true)) algumFilho = true;
    }
    if (algumFilho) return true;
    if (podeSerEle && casa(textoDe(el), procurado, exato)) {
      achados.push(el);
      return true;
    }
    return false;
  };
  // no documento, o body também vale; dentro de outro alvo, só o que está dentro dele
  const inicio = escopo instanceof Document ? escopo.body : (escopo as Element);
  if (inicio && !daCamada(inicio) && normalizar(textoDe(inicio)).toLowerCase().includes(agulha)) descer(inicio, escopo instanceof Document);
  // a ordem do documento
  achados.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  return achados.filter(el => visivelNaTela(el));
}

function porCss(escopo: ParentNode, css: string): Element[] {
  return [...escopo.querySelectorAll(css)].filter(el => !daCamada(el) && visivelNaTela(el));
}

/** O elemento do alvo agora (ou null). */
export function resolverAlvo(alvo: Alvo, raiz: ParentNode = document): Element | null {
  let escopo: ParentNode = raiz;
  if (alvo.dentro) {
    const c = resolverAlvo(alvo.dentro, raiz);
    if (!c) return null;
    escopo = c;
  }
  const lista = 'papel' in alvo ? porPapel(escopo, alvo.papel, alvo.nome, alvo.exato) : 'texto' in alvo ? porTexto(escopo, alvo.texto, alvo.exato) : porCss(escopo, alvo.css);
  return lista[alvo.n ?? 0] ?? null;
}

/** Como o executor descreve o alvo nas mensagens de falha. */
export function descreverAlvo(alvo: Alvo | undefined): string {
  if (!alvo) return '';
  const base = 'papel' in alvo ? `${alvo.papel} "${alvo.nome}"` : 'texto' in alvo ? `texto "${alvo.texto}"` : `css ${alvo.css}`;
  return alvo.dentro ? `${base} dentro de ${descreverAlvo(alvo.dentro)}` : base;
}

/** O nome curto do alvo para a pílula ("Filtrar"). */
export function nomeCurtoDoAlvo(alvo: Alvo): string {
  if ('papel' in alvo) return alvo.nome;
  if ('texto' in alvo) return alvo.texto;
  return 'o elemento destacado';
}

/** Habilitado como o Playwright entende: sem disabled nativo e sem aria-disabled num ancestral. */
export function habilitado(el: Element): boolean {
  if (el.matches(':disabled')) return false;
  return !el.closest('[aria-disabled="true"]');
}
