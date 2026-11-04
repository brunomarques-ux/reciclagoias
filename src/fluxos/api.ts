// A API de console e de testes (window.__fluxos), carregada sob demanda pela raiz (RaizDosFluxos.vue).
//   iniciar(id, modo)  começa o fluxo como o botão da página /fluxos (limpa o armazenamento pedido, carga completa)
//   testar(id)         parte da página já aberta (rota, perfil e limpeza feitos), executa a cadeia depoisDe e os
//                      passos em modo rápido e devolve { ok, passo, acao, erro }: serve para conferir os dados de um
//                      fluxo pelo console, sem animação
//   registrar(fluxo)   um fluxo fora dos dados, na sessão da aba (para ensaiar um fluxo sem mexer em dados/)
import type { Fluxo } from './tipos';
import { Controle, esperarTelaPronta, refazerRapido, type ResultadoDoTeste } from './motor';
import { fluxoPorId, registrarFluxo } from './registro';
import { iniciarFluxo } from './iniciar';
import type { ModoDoFluxo } from './sessao';

export function iniciar(id: string, modo: ModoDoFluxo = 'auto'): boolean {
  const f = fluxoPorId(id);
  if (!f) return false;
  iniciarFluxo(f, modo === 'manual' ? 'manual' : 'auto');
  return true;
}

export async function testar(id: string): Promise<ResultadoDoTeste> {
  const f = fluxoPorId(id);
  if (!f) return { ok: false, passo: 0, acao: 0, erro: `o fluxo "${id}" não existe` };
  const c = new Controle();
  await esperarTelaPronta(c);
  return refazerRapido(f, f.passos.length, c);
}

export function registrar(f: Fluxo): void {
  registrarFluxo(f);
}
