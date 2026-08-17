<script setup lang="ts">
/**
 * Card "Massa Produzida e Recuperada": um anel por material, com a meta escrita.
 *
 * O anel é progresso contra meta — pergunta de relance. Os três números embaixo são
 * a resposta exata, e é a leitura que sustenta a decisão: sem eles o anel viraria
 * enfeite.
 */
import type { MaterialRecuperado } from '@/data/mocks/perfis';
import RingChart from './RingChart.vue';

defineProps<{ anoExecucao: number; materiais: MaterialRecuperado[] }>();
</script>

<template>
  <section class="gx-mass" aria-labelledby="gx-mass-titulo">
    <header class="gx-mass__head">
      <h2 id="gx-mass-titulo" class="gx-mass__titulo">Massa Produzida e Recuperada</h2>
      <p class="gx-mass__descricao">
        Percentual de recuperação por material no ano de execução {{ anoExecucao }}.
      </p>
    </header>

    <ul class="gx-mass__lista">
      <li v-for="material in materiais" :key="material.nome" class="gx-mass__item">
        <h3 class="gx-mass__material">{{ material.nome }}</h3>

        <RingChart :percentual="material.percentual" />
        <p class="gx-mass__legenda">de recuperação</p>

        <p v-if="material.metaAtingida" class="gx-mass__chip">Meta atingida</p>

        <dl class="gx-mass__numeros">
          <div class="gx-mass__linha gx-mass__linha--destaque">
            <dt>Recuperada</dt>
            <dd>{{ material.recuperada }}</dd>
          </div>
          <div class="gx-mass__linha">
            <dt>Produzida</dt>
            <dd>{{ material.produzida }}</dd>
          </div>
          <div class="gx-mass__linha">
            <dt>Meta ≥</dt>
            <dd>{{ material.meta }}</dd>
          </div>
        </dl>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.gx-mass {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
  padding: var(--rg-space-6);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-raised);
}

.gx-mass__head {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
}

.gx-mass__titulo {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: 22px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-mass__descricao {
  margin: 0;
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  color: var(--rg-color-text-secondary);
}

.gx-mass__lista {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--rg-space-5);
  margin: 0;
  padding: 0;
  list-style: none;
}

.gx-mass__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--rg-space-3);
  padding: var(--rg-space-5);
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-color-surface-subtle);
}

/* O que o percentual do anel significa, escrito fora do anel. */
.gx-mass__legenda {
  margin: calc(var(--rg-space-3) * -1 + 4px) 0 0;
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  color: var(--rg-color-text-muted);
}

.gx-mass__material {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-mass__chip {
  margin: 0;
  padding: var(--rg-space-1) 10px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-feedback-success-soft);
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-brand);
}

.gx-mass__numeros {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
  width: 100%;
  margin: 0;
}

.gx-mass__linha {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
}

.gx-mass__linha dt {
  color: var(--rg-color-text-muted);
}

.gx-mass__linha dd {
  margin: 0;
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
}

/* Três pesos no bloco de números: a massa recuperada é o resultado, as outras duas
   são a base e o limiar que explicam o resultado. Sem isso o olho não sabe por onde
   começar — os três números pesavam igual. */
.gx-mass__linha--destaque {
  padding-bottom: var(--rg-space-1);
  margin-bottom: var(--rg-space-1);
  border-bottom: 1px solid var(--rg-color-border-subtle);
}

.gx-mass__linha--destaque dt {
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
}

.gx-mass__linha--destaque dd {
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

@media (max-width: 1120px) {
  .gx-mass__lista {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .gx-mass__lista {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
