// Os fluxos guiados de todos os blocos, na ordem da página /fluxos (de cima para baixo). Um bloco novo: um arquivo
// aqui em dados/, o id em BlocoId (tipos.ts) e uma linha em cada lista abaixo.
import type { BlocoDeFluxos, Fluxo } from '../tipos';
import { BLOCO_OPERADOR, FLUXOS_OPERADOR } from './operador';
import { BLOCO_ADMIN, FLUXOS_ADMIN } from './admin';

export const BLOCOS: readonly BlocoDeFluxos[] = [BLOCO_OPERADOR, BLOCO_ADMIN];

export const FLUXOS: readonly Fluxo[] = [...FLUXOS_OPERADOR, ...FLUXOS_ADMIN];
