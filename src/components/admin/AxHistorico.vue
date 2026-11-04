<script setup lang="ts">
/**
 * Histórico do cadastro, em linha do tempo: data na lateral, ponto no trilho e o
 * card do evento com quem fez.
 *
 * Figma: `Recicla Goiás - Figma`, seção do Admin (5901:10683), L4·2 e L4·4 (card
 * "Histórico", instâncias de HistoryEvent). Do mais recente para o mais antigo.
 */
import type { EventoHistorico } from '@/stores/complemento';

import { partesDaData } from './analise';

defineProps<{ eventos: EventoHistorico[] }>();
</script>

<template>
  <section class="ax-hist" aria-labelledby="ax-hist-titulo">
    <h2 id="ax-hist-titulo" class="ax-hist__titulo">Histórico</h2>
    <ol class="ax-hist__lista">
      <li v-for="(e, i) in eventos" :key="i" class="ax-evento">
        <p class="ax-evento__quando">
          <template v-if="partesDaData(e.data)">
            <strong>{{ partesDaData(e.data)?.dia }}</strong>
            <span>{{ partesDaData(e.data)?.ano }}</span>
            <span v-if="partesDaData(e.data)?.hora">{{ partesDaData(e.data)?.hora }}</span>
          </template>
          <strong v-else>{{ e.data }}</strong>
        </p>
        <span class="ax-evento__trilho" aria-hidden="true"><span class="ax-evento__ponto" /></span>
        <div class="ax-evento__card">
          <p class="ax-evento__titulo">{{ e.titulo }}</p>
          <p class="ax-evento__desc">{{ e.desc }}</p>
          <p class="ax-evento__meta">
            <v-icon icon="mdi-file-document-outline" size="14" aria-hidden="true" />
            <v-icon icon="mdi-account-outline" size="14" aria-hidden="true" />
            {{ e.quem }}
          </p>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.ax-hist {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  padding: var(--rg-space-6);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background: var(--rg-color-surface-raised);
}

.ax-hist__titulo {
  margin: 0;
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 22px;
  color: var(--rg-color-text-primary);
}

.ax-hist__lista {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ax-evento {
  display: flex;
  align-items: stretch;
  gap: 14px;
}

.ax-evento + .ax-evento .ax-evento__card {
  margin-top: var(--rg-space-3);
}

.ax-evento__quando {
  display: flex;
  flex: 0 0 56px;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  margin: 0;
  padding-top: var(--rg-space-4);
}

.ax-evento + .ax-evento .ax-evento__quando {
  padding-top: calc(var(--rg-space-4) + var(--rg-space-3));
}

.ax-evento__quando strong {
  font-size: 13px;
  font-weight: var(--rg-font-weight-bold);
  line-height: 16px;
  color: var(--rg-color-text-primary);
}

.ax-evento__quando span {
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 14px;
  letter-spacing: 0.06em;
  color: var(--rg-color-text-disabled);
}

.ax-evento__trilho {
  position: relative;
  display: flex;
  flex: 0 0 12px;
  justify-content: center;
}

.ax-evento__trilho::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--rg-primitive-neutral-200);
}

.ax-evento:first-child .ax-evento__trilho::before {
  top: var(--rg-space-4);
}

.ax-evento:last-child .ax-evento__trilho::before {
  bottom: auto;
  height: calc(var(--rg-space-4) + 12px);
}

.ax-evento__ponto {
  position: relative;
  width: 12px;
  height: 12px;
  margin-top: calc(var(--rg-space-4) + 2px);
  border: 2px solid var(--rg-color-surface-raised);
  border-radius: var(--rg-radius-pill);
  background: var(--rg-primitive-neutral-300);
}

.ax-evento + .ax-evento .ax-evento__ponto {
  margin-top: calc(var(--rg-space-4) + var(--rg-space-3) + 2px);
}

.ax-evento__card {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: var(--rg-space-4) 18px;
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background: var(--rg-color-surface-raised);
}

.ax-evento__titulo {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 20px;
  color: var(--rg-color-text-primary);
}

.ax-evento__desc {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.ax-evento__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding-top: 10px;
  border-top: 1px solid var(--rg-color-border-subtle);
  font-size: 13px;
  font-weight: var(--rg-font-weight-medium);
  line-height: 18px;
  color: var(--rg-color-text-muted);
}
</style>
