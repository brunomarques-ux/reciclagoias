// Peças comuns da página /fluxos e do painel (camada do protótipo): o tom do selo do tipo de fluxo, como no SISLOG
// (principal verde, alternativo azul, exceção amarelo), nos tons de feedback do Recicla (--rg-color-feedback-*).
import type { TipoDeFluxo } from './tipos';

export type TomDoSelo = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

export const COR_DO_TIPO_DE_FLUXO: Readonly<Record<TipoDeFluxo, TomDoSelo>> = {
  principal: 'success',
  alternativo: 'info',
  excecao: 'warning',
};
