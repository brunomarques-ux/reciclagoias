// Os fluxos conhecidos: os dos dados (src/fluxos/dados, na ordem dos blocos) e os extras registrados na sessão da
// aba por window.__fluxos.registrar (para ensaiar um fluxo sem mexer nos dados). A cadeia (depoisDe), o próximo
// fluxo e o endereço de início (o mesmo que um link de fora pode usar).
import type { Fluxo } from './tipos';
import { FLUXOS } from './dados';
import type { ModoDoFluxo } from './sessao';

export { BLOCOS } from './dados';

const CHAVE_EXTRAS = 'rg-proto:v1:fluxos-extra';

function extras(): Fluxo[] {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE_EXTRAS);
    return bruto ? (JSON.parse(bruto) as Fluxo[]) : [];
  } catch {
    return [];
  }
}

/** Registra um fluxo fora dos dados (testes). Fica na sessão da aba e sobrevive à recarga do início do fluxo. */
export function registrarFluxo(f: Fluxo): void {
  try {
    const lista = extras().filter(x => x.id !== f.id);
    window.sessionStorage.setItem(CHAVE_EXTRAS, JSON.stringify([...lista, f]));
  } catch {
    /* sem sessionStorage: não registra */
  }
}

export function todosOsFluxos(): readonly Fluxo[] {
  return FLUXOS;
}

export function fluxoPorId(id: string | null | undefined): Fluxo | undefined {
  if (!id) return undefined;
  return FLUXOS.find(f => f.id === id) ?? extras().find(f => f.id === id);
}

/** A cadeia a executar: os fluxos anteriores (depoisDe), do mais antigo ao próprio fluxo. */
export function cadeiaDe(f: Fluxo, vistos: Set<string> = new Set()): Fluxo[] {
  if (vistos.has(f.id)) throw new Error(`depoisDe em ciclo: ${f.id}`);
  vistos.add(f.id);
  if (!f.inicio.depoisDe) return [f];
  const anterior = fluxoPorId(f.inicio.depoisDe);
  if (!anterior) throw new Error(`depoisDe "${f.inicio.depoisDe}" não existe (fluxo ${f.id})`);
  return [...cadeiaDe(anterior, vistos), f];
}

/** O próximo fluxo na ordem da lista (nos extras, nenhum). */
export function proximoFluxo(id: string): Fluxo | undefined {
  const i = FLUXOS.findIndex(f => f.id === id);
  return i >= 0 ? FLUXOS[i + 1] : undefined;
}

/**
 * O endereço que inicia o fluxo: a rota e o perfil do primeiro da cadeia, com `fluxo` e `modo`. É o endereço dos
 * links de fora. Aberto direto, a raiz faz a limpeza do início e recarrega uma vez.
 */
export function enderecoDoFluxo(f: Fluxo, modo: ModoDoFluxo): string {
  let ini = f.inicio;
  try {
    ini = cadeiaDe(f)[0].inicio;
  } catch {
    /* cadeia quebrada: parte do próprio fluxo */
  }
  const sep = ini.rota.includes('?') ? '&' : '?';
  return `${ini.rota}${sep}perfil=${encodeURIComponent(ini.perfil)}&fluxo=${encodeURIComponent(f.id)}&modo=${modo}`;
}
