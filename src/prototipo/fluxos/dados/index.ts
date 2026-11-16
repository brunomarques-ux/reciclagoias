// Os fluxos guiados de todos os blocos, na ordem da página /fluxos (de cima para baixo). Um bloco novo: um arquivo
// aqui em dados/, o id em BlocoId (tipos.ts) e uma linha em cada lista abaixo.
import type { BlocoDeFluxos, Fluxo } from '../tipos';
import { BLOCO_OPERADOR, FLUXOS_OPERADOR } from './operador';
import { BLOCO_ADMIN, FLUXOS_ADMIN } from './admin';
import { BLOCO_AJUSTES_13NOV, FLUXOS_AJUSTES_13NOV } from './ajustes-13nov';

// O bloco de uma entrega (com `entrega`) fica fora da lista dos fluxos anteriores: aparece na página da entrega.
export const BLOCOS: readonly BlocoDeFluxos[] = [BLOCO_OPERADOR, BLOCO_ADMIN, BLOCO_AJUSTES_13NOV];

export const FLUXOS: readonly Fluxo[] = [...FLUXOS_OPERADOR, ...FLUXOS_ADMIN, ...FLUXOS_AJUSTES_13NOV];
