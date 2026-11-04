/**
 * Apoio das telas de análise do Admin: o tipo do contexto de reanálise e a leitura
 * das datas que a store grava no histórico ("04/09/2026, às 16h20").
 */

/** Na reanálise: quando a organização corrigiu e quando foi a conferência anterior (DD/MM). */
export interface Reanalise {
  corrigidoEm: string;
  conferidoEm: string;
}

export interface PartesData {
  /** DD/MM */
  dia: string;
  /** AAAA */
  ano: string;
  /** HH:MM, vazio quando a data não traz hora */
  hora: string;
  /** DD/MM/AAAA */
  data: string;
}

const PADRAO = /(\d{2})\/(\d{2})\/(\d{4})(?:,\s*às\s*(\d{1,2})h(\d{2}))?/;

export function partesDaData(texto: string | null | undefined): PartesData | null {
  const m = texto ? PADRAO.exec(texto) : null;
  if (!m) return null;
  const [, d, mes, ano, h, min] = m;
  return {
    dia: `${d}/${mes}`,
    ano: ano ?? '',
    hora: h && min ? `${h.padStart(2, '0')}:${min}` : '',
    data: `${d}/${mes}/${ano}`,
  };
}

/** "04/09/2026, às 16:20" (ou só a data, quando não há hora). */
export function dataPorExtenso(texto: string | null | undefined): string {
  const p = partesDaData(texto);
  if (!p) return texto ?? '';
  return p.hora ? `${p.data}, às ${p.hora}` : p.data;
}

/** "Telefone", "Telefone e CEP", "Telefone, CEP e Número". */
export function juntarNomes(nomes: string[]): string {
  if (nomes.length <= 1) return nomes[0] ?? '';
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

/** Item do menu da linha da fila. */
export interface ItemMenu {
  id: string;
  rotulo: string;
  desabilitado?: boolean;
  destaque?: boolean;
}
