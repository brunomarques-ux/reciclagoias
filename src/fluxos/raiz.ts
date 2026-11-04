// A API de console dos fluxos guiados (window.__fluxos), instalada pela raiz (RaizDosFluxos.vue) sem carregar os
// dados nem o motor: cada chamada carrega api.ts sob demanda. Fica num .ts à parte porque o `declare global` não
// cabe num <script setup>.
import type { Fluxo } from './tipos';
import type { ModoDoFluxo } from './sessao';

declare global {
  interface Window {
    __fluxos?: {
      iniciar(id: string, modo?: ModoDoFluxo): Promise<boolean>;
      testar(id: string): Promise<{ ok: boolean; passo?: number; acao?: number; erro?: string }>;
      registrar(f: Fluxo): Promise<void>;
    };
  }
}

export function instalarApiDosFluxos(): void {
  if (typeof window === 'undefined' || window.__fluxos) return;
  window.__fluxos = {
    iniciar: async (id, modo) => (await import('./api')).iniciar(id, modo),
    testar: async (id) => (await import('./api')).testar(id),
    registrar: async (f) => (await import('./api')).registrar(f),
  };
}
