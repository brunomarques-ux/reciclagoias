/**
 * Utilitários de busca textual da landing (FAQ).
 *
 * Filtro simples em memória — sem lib externa e sem debounce de propósito:
 * o conjunto é pequeno (~20 strings) e o computed síncrono responde em
 * sub-milissegundo; debounce só atrasaria o feedback do usuário.
 *
 * A busca é por TOKENS com AND: cada palavra da query precisa aparecer no
 * texto (como substring), em qualquer ordem. Assim "empresa aderente"
 * encontra "empresas aderentes" — busca por frase exata falharia no plural.
 */

/** Normaliza pra comparação: minúsculas e sem diacríticos (PT-BR). */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** Quebra a query normalizada em tokens não-vazios. */
function tokenize(query: string): string[] {
  return normalizeText(query).split(/\s+/).filter(Boolean);
}

/** true se `text` contém TODOS os tokens de `query` (caixa/acento-insensitive). */
export function matchesQuery(text: string, query: string): boolean {
  const tokens = tokenize(query);
  if (tokens.length === 0) return true;
  const norm = normalizeText(text);
  return tokens.every((t) => norm.includes(t));
}

export interface HighlightSegment {
  text: string;
  hit: boolean;
}

/**
 * Divide `original` em segmentos marcando as ocorrências de CADA token da
 * query (ranges sobrepostos são mesclados), pra renderizar `<mark>` sem
 * v-html.
 *
 * A normalização NFD muda os offsets (ex.: "á" vira "a" + combining mark
 * removida), então normalizamos caractere a caractere mantendo um mapa de
 * índices normalizado → original e convertemos cada match de volta pro
 * range correto no texto original.
 */
export function highlightSegments(original: string, query: string): HighlightSegment[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [{ text: original, hit: false }];

  let norm = '';
  const map: number[] = []; // map[i] = índice no original do char que gerou norm[i]
  for (let i = 0; i < original.length; i++) {
    const n = normalizeText(original[i] ?? '');
    for (const ch of n) {
      norm += ch;
      map.push(i);
    }
  }

  // Coleta os ranges [start, end) de todos os tokens no espaço normalizado.
  const ranges: Array<[number, number]> = [];
  for (const token of tokens) {
    let from = 0;
    for (;;) {
      const idx = norm.indexOf(token, from);
      if (idx === -1) break;
      ranges.push([idx, idx + token.length]);
      from = idx + token.length;
    }
  }
  if (ranges.length === 0) return [{ text: original, hit: false }];

  // Mescla ranges sobrepostos/adjacentes.
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const [start, end] of ranges) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }

  // Converte pro espaço do texto original e emite os segmentos.
  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    const startOrig = Math.max(map[start] ?? 0, cursor);
    const endOrig = (map[end - 1] ?? startOrig) + 1;
    if (startOrig > cursor) {
      segments.push({ text: original.slice(cursor, startOrig), hit: false });
    }
    segments.push({ text: original.slice(startOrig, endOrig), hit: true });
    cursor = endOrig;
  }
  if (cursor < original.length) {
    segments.push({ text: original.slice(cursor), hit: false });
  }
  return segments;
}
