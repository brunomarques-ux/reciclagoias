// Iniciar um fluxo guiado: apagar as chaves de inicio.limpar (da cadeia toda) e abrir a rota com o perfil por CARGA
// COMPLETA da página, para as stores (Pinia) nascerem lendo o armazenamento já limpo. O endereço é
// rota?perfil=<p>&fluxo=<id>&modo=<manual|auto>; a raiz (RaizDosFluxos.vue) lê o fluxo e o modo, ativa e tira os
// parâmetros. Chegando por um link sem a limpeza (um roteiro HTML, por exemplo), a raiz limpa e recarrega uma vez.
// Com depoisDe, a carga parte do início do primeiro fluxo da cadeia e o painel refaz rápido os anteriores.
// Anterior e Repetir passo também recarregam no início do fluxo e refazem rápido até o passo pedido.
//
// Diferente do SISLOG: lá as chaves de `limpar` levavam um prefixo fixo e só saíam do localStorage, e o início
// gravava a versão da aba Documentação. Aqui o estado do protótipo vive nos dois armazenamentos com chaves `rg:*`
// (ex.: rg:complemento:rascunho), então `limpar` traz o nome completo, apaga dos dois e aceita `*` no fim (prefixo).
import type { Fluxo } from './tipos';
import { cadeiaDe, enderecoDoFluxo, fluxoPorId } from './registro';
import { definirFluxoAtivo, fluxoAtivo, marcarCargaPropria, marcarPreparado, preferenciasDoFluxo, type FluxoAtivo, type ModoDoFluxo } from './sessao';

/** As chaves da camada dos fluxos nunca saem pelo `limpar` (o próprio estado do fluxo que está começando). */
const DA_CAMADA = 'rg-proto:';

/** Apaga uma chave (ou, com `*` no fim, todas as do prefixo) de um armazenamento. */
function apagar(armazenamento: Storage, chave: string): void {
  if (!chave.endsWith('*')) {
    if (!chave.startsWith(DA_CAMADA)) armazenamento.removeItem(chave);
    return;
  }
  const prefixo = chave.slice(0, -1);
  const todas: string[] = [];
  for (let i = 0; i < armazenamento.length; i++) {
    const k = armazenamento.key(i);
    if (k !== null && k.startsWith(prefixo) && !k.startsWith(DA_CAMADA)) todas.push(k);
  }
  todas.forEach(k => armazenamento.removeItem(k));
}

/** Apaga o que o fluxo (e a cadeia) pede para limpar, do sessionStorage e do localStorage. */
function limparParaOInicio(f: Fluxo): void {
  let cadeia: Fluxo[] = [f];
  try {
    cadeia = cadeiaDe(f);
  } catch {
    /* cadeia quebrada: o painel mostra o erro ao preparar */
  }
  for (const c of cadeia) {
    for (const k of c.inicio.limpar ?? []) {
      try {
        apagar(window.sessionStorage, k);
      } catch {
        /* sem sessionStorage: segue com o que houver */
      }
      try {
        apagar(window.localStorage, k);
      } catch {
        /* sem localStorage: idem */
      }
    }
  }
}

function temCadeia(f: Fluxo): boolean {
  try {
    return cadeiaDe(f).length > 1;
  } catch {
    return true; // o painel prepara e mostra o erro da cadeia
  }
}

/**
 * Começa o fluxo no passo 1 (por carga completa). `substituir` troca a entrada do histórico (a raiz recarregando um
 * endereço de fluxo que chegou sem a limpeza). A velocidade e o recolhido vêm das preferências da aba (o último
 * fluxo), também quando o fluxo chega por um link.
 */
export function iniciarFluxo(f: Fluxo, modo: ModoDoFluxo, opcoes: { substituir?: boolean } = {}): void {
  limparParaOInicio(f);
  const pref = preferenciasDoFluxo();
  const estado: FluxoAtivo = {
    id: f.id,
    passo: 0,
    feito: false,
    modo,
    velocidade: pref.velocidade,
    recolhido: pref.recolhido,
    preparar: temCadeia(f) ? { executar: false } : undefined,
  };
  definirFluxoAtivo(estado);
  marcarPreparado(f.id);
  marcarCargaPropria();
  const url = enderecoDoFluxo(f, modo);
  if (opcoes.substituir) window.location.replace(url);
  else window.location.assign(url);
}

/** Recarrega no início do fluxo (com a cadeia) e refaz rápido até `passo`; com `executar`, executa o passo depois. */
export function recarregarNoPasso(f: Fluxo, passo: number, executar: boolean): void {
  limparParaOInicio(f);
  const atual = fluxoAtivo();
  const pref = preferenciasDoFluxo();
  definirFluxoAtivo({
    id: f.id,
    passo,
    feito: false,
    modo: atual?.modo ?? 'auto',
    velocidade: atual?.velocidade ?? pref.velocidade,
    recolhido: atual?.recolhido ?? pref.recolhido,
    preparar: passo > 0 || temCadeia(f) || executar ? { executar } : undefined,
  });
  marcarCargaPropria();
  // sem o parâmetro do fluxo: o estado já está na sessão (o ?perfil= fica, para a carga entrar no perfil certo)
  const url = enderecoDoFluxo(f, atual?.modo ?? 'auto').replace(/&fluxo=[^&]*&modo=[^&]*$/, '');
  window.location.assign(url);
}

/** Há o que refazer depois de uma recarga: a cadeia (depoisDe) ou passos já andados. */
export function precisaRefazer(f: Fluxo, a: FluxoAtivo): boolean {
  return a.passo > 0 || a.feito || !!a.preparar || temCadeia(f);
}

/** O endereço de um fluxo chegou sem a limpeza (um link de fora): limpa e recarrega uma vez. */
export function iniciarPeloEndereco(id: string, modo: ModoDoFluxo): boolean {
  const f = fluxoPorId(id);
  if (!f) return false;
  iniciarFluxo(f, modo, { substituir: true });
  return true;
}
