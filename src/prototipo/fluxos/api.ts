// A API de console e de testes (window.__fluxos), carregada sob demanda pela raiz (RaizDosFluxos.vue).
//   iniciar(id, modo)  começa o fluxo como o botão da página /fluxos (limpa o armazenamento pedido, carga completa)
//   testar(id)         parte da página já aberta (rota, perfil e limpeza feitos), executa a cadeia depoisDe e os
//                      passos em modo rápido e devolve { ok, passo, acao, erro }: serve para conferir os dados de um
//                      fluxo pelo console, sem animação
//   registrar(fluxo)   um fluxo fora dos dados, na sessão da aba (para ensaiar um fluxo sem mexer em dados/)
import type { Fluxo } from './tipos';
import { Controle, esperarTelaPronta, refazerRapido, type ResultadoDoTeste } from './motor';
import { capitulosDe, fluxoPorId, registrarFluxo, type Capitulo } from './registro';
import * as execucao from './execucao';
import { fluxoAtivo } from './sessao';
import { iniciarFluxo, recarregarNoPasso } from './iniciar';
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

// ── comandar de fora (a apresentação em slides embute o protótipo num quadro e fala com ele por aqui) ──────────

export interface EstadoParaFora {
  id: string | null;
  passo: number;
  feito: boolean;
  concluido: boolean;
  /** A tela ainda está sendo refeita depois de uma carga. */
  preparando: boolean;
  fase: execucao.Fase;
  erro: string | null;
  /** O tipo da ação em curso (só enquanto executa): 'olhar', 'clicar'... */
  acao: string | null;
  fazer: string | null;
  capitulos: Capitulo[];
}

export function estado(): EstadoParaFora {
  const a = fluxoAtivo();
  const f = fluxoPorId(a?.id);
  const s = execucao.useStatusDoFluxo().value;
  const passo = f?.passos[a?.passo ?? 0];
  return {
    id: a?.id ?? null,
    passo: a?.passo ?? 0,
    feito: !!a?.feito,
    concluido: !!a?.concluido,
    preparando: !!a?.preparar || s.fase === 'preparando',
    fase: s.fase,
    erro: s.erro?.texto ?? null,
    acao: s.fase === 'executando' ? (passo?.acoes[s.acao]?.tipo ?? null) : null,
    fazer: passo?.fazer ?? null,
    capitulos: capitulosDe(f),
  };
}

export function reproduzirCapitulo(): void {
  void execucao.executarPassoAtual({ capitulo: true });
}
export function irPara(n: number): void {
  void execucao.irPara(n);
}
export function pausar(): void {
  execucao.pausar();
}
export function continuar(): void {
  execucao.continuar();
}
export function cancelar(): void {
  execucao.cancelar();
}
/**
 * Recarrega a página no início do fluxo e refaz rápido até o passo n, mesmo que o fluxo já esteja nele: para quando
 * a pessoa mexeu na tela por conta própria e a história precisa voltar a um ponto conhecido.
 */
export function recarregarEm(n: number): void {
  const f = fluxoPorId(fluxoAtivo()?.id);
  if (!f) return;
  execucao.cancelar();
  recarregarNoPasso(f, Math.min(Math.max(n, 0), f.passos.length - 1), false);
}
