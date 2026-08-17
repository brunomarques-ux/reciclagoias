<script setup lang="ts">
/**
 * Card "Massa Produzida e Recuperada": um cartão por material.
 *
 * A conta que o cartão precisa deixar óbvia:
 *   produzida × 30% = meta em tonelada  ·  recuperada ÷ produzida = taxa do anel
 *
 * **Bateu a meta é recuperada ≥ meta**, não "chegou a 100%": a taxa é livre e pode
 * passar de 100% (o papel recuperou 86.632 t de uma meta de 14.936,4 t). Por isso os
 * três números aparecem na ordem da narrativa — base, limiar, resultado — e a meta
 * carrega o percentual ao lado da tonelada, ligando os 30% do indicador do topo ao
 * número escrito aqui embaixo.
 *
 * Um estado, três canais coerentes: cor do anel, chip e fundo do cartão. Nada é
 * digitado duas vezes — meta, taxa e cumprimento saem das duas massas.
 */
import { computed } from 'vue';

import { META_PERCENTUAL, type MaterialRecuperado } from '@/data/mocks/perfis';
import RingChart, { type TomAnel } from './RingChart.vue';

const props = defineProps<{ anoExecucao: number; materiais: MaterialRecuperado[] }>();

const toneladas = (valor: number) =>
  `${valor.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t`;

const cartoes = computed(() =>
  props.materiais.map((material) => {
    const meta = (material.produzida * META_PERCENTUAL) / 100;
    const taxa = material.produzida > 0 ? (material.recuperada / material.produzida) * 100 : 0;
    const atingiu = material.recuperada >= meta;
    const tom: TomAnel = atingiu ? 'success' : 'atencao';

    return {
      nome: material.nome,
      taxa,
      atingiu,
      tom,
      produzida: toneladas(material.produzida),
      recuperada: toneladas(material.recuperada),
      meta: toneladas(meta),
    };
  }),
);
</script>

<template>
  <section class="gx-mass" aria-labelledby="gx-mass-titulo">
    <header class="gx-mass__head">
      <h2 id="gx-mass-titulo" class="gx-mass__titulo">Massa Produzida e Recuperada</h2>
      <p class="gx-mass__descricao">
        Taxa de recuperação por material: quanto voltou do que foi colocado no mercado em
        {{ anoExecucao }}. A meta do exercício é recuperar {{ META_PERCENTUAL }}% do produzido.
      </p>
    </header>

    <ul class="gx-mass__lista">
      <li
        v-for="material in cartoes"
        :key="material.nome"
        class="gx-mass__item"
        :class="{ 'gx-mass__item--atingiu': material.atingiu }"
      >
        <h3 class="gx-mass__material">{{ material.nome }}</h3>

        <RingChart :percentual="material.taxa" :tom="material.tom" />

        <!-- Um slot só: o estado da meta, nos dois sentidos. -->
        <p class="gx-mass__chip" :class="material.atingiu ? 'gx-mass__chip--ok' : 'gx-mass__chip--abaixo'">
          {{ material.atingiu ? 'Meta atingida' : 'Abaixo da meta' }}
        </p>

        <dl class="gx-mass__numeros">
          <div class="gx-mass__linha">
            <dt>Produzida</dt>
            <dd>{{ material.produzida }}</dd>
          </div>
          <div class="gx-mass__linha">
            <dt>Meta ({{ META_PERCENTUAL }}%)</dt>
            <dd>{{ material.meta }}</dd>
          </div>
          <div class="gx-mass__linha gx-mass__linha--destaque">
            <dt>Recuperada</dt>
            <dd>{{ material.recuperada }}</dd>
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
  border: 1px solid transparent;
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-color-surface-subtle);
}

/* Fundo verde só em quem bateu a meta: é o que se lê de longe na fileira. Quem não
   bateu fica no cinza — a atenção aparece no anel e no chip, não no fundo. */
.gx-mass__item--atingiu {
  border-color: var(--rg-primitive-brand-200);
  background-color: var(--rg-color-surface-brand);
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
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-semibold);
}

/* No cartão verde o chip ganha superfície branca para não sumir no fundo. */
.gx-mass__chip--ok {
  background-color: var(--rg-color-surface-raised);
  color: var(--rg-color-text-brand);
}

.gx-mass__chip--abaixo {
  background-color: var(--rg-color-feedback-warning-soft);
  color: var(--rg-primitive-amber-700);
}

/* `margin-top: auto` alinha os três números pelo rodapé nos quatro cartões. */
.gx-mass__numeros {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
  width: 100%;
  margin: auto 0 0;
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
  color: var(--rg-color-text-secondary);
}

.gx-mass__linha dd {
  margin: 0;
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
}

/* A massa recuperada é o resultado da conta; produzida e meta são a base e o
   limiar que a explicam. */
.gx-mass__linha--destaque {
  padding-top: var(--rg-space-1);
  margin-top: var(--rg-space-1);
  border-top: 1px solid var(--rg-color-border-subtle);
}

.gx-mass__linha--destaque dt {
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-primary);
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
