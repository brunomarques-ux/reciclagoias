import type { StatusTone } from '@/data/mocks/gestora';

/**
 * Cor de cada status da documentação. Segue o semáforo do design system, não uma
 * escala de verdes: três tons do mesmo verde são indistinguíveis para boa parte das
 * pessoas (docs/sistema/DECISOES-UX.md, D-R003).
 *
 * Vale lembrar que aqui `feedback-success` é o próprio verde de marca.
 */
export const COR_TONE: Record<StatusTone, string> = {
  success: 'var(--rg-color-feedback-success)',
  info: 'var(--rg-color-feedback-info)',
  warning: 'var(--rg-color-feedback-warning)',
  neutral: 'var(--rg-color-text-muted)',
  /** Estado que trava o fluxo — "bloqueadas", no dashboard do verificador. */
  danger: 'var(--rg-color-feedback-danger)',
};
