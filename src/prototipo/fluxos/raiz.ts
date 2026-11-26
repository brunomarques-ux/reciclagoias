// A API de console dos fluxos guiados (window.__fluxos), instalada pela raiz (RaizDosFluxos.vue) sem carregar os
// dados nem o motor: cada chamada carrega api.ts sob demanda. Fica num .ts à parte porque o `declare global` não
// cabe num <script setup>.
import type { Fluxo } from './tipos';
import type { ModoDoFluxo } from './sessao';
import type { EstadoParaFora } from './api';

declare global {
  interface Window {
    __fluxos?: {
      iniciar(id: string, modo?: ModoDoFluxo): Promise<boolean>;
      testar(id: string): Promise<{ ok: boolean; passo?: number; acao?: number; erro?: string }>;
      registrar(f: Fluxo): Promise<void>;
      /** O estado do fluxo ativo, para quem comanda de fora (a apresentação em slides, que embute o protótipo). */
      estado(): Promise<EstadoParaFora>;
      /** Reproduz o capítulo atual (ou o seguinte, se o atual terminou) e para no fim dele. */
      reproduzirCapitulo(): Promise<void>;
      /** Leva o fluxo ao passo n (para a frente, rápido; para trás, recarrega e refaz). */
      irPara(n: number): Promise<void>;
      pausar(): Promise<void>;
      continuar(): Promise<void>;
      /** Para o que estiver rodando, sem mexer no passo. */
      cancelar(): Promise<void>;
    };
  }
}

export function instalarApiDosFluxos(): void {
  if (typeof window === 'undefined' || window.__fluxos) return;
  window.__fluxos = {
    iniciar: async (id, modo) => (await import('./api')).iniciar(id, modo),
    testar: async (id) => (await import('./api')).testar(id),
    registrar: async (f) => (await import('./api')).registrar(f),
    estado: async () => (await import('./api')).estado(),
    reproduzirCapitulo: async () => (await import('./api')).reproduzirCapitulo(),
    irPara: async (n) => (await import('./api')).irPara(n),
    pausar: async () => (await import('./api')).pausar(),
    continuar: async () => (await import('./api')).continuar(),
    cancelar: async () => (await import('./api')).cancelar(),
  };
}
