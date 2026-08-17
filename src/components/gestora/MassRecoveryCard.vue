<script setup lang="ts">
/**
 * Card "Massa Produzida e Recuperada": um cartão por material.
 *
 * A conta que o cartão precisa deixar óbvia é esta:
 *   produzida × meta% = meta em tonelada · recuperada ÷ produzida = taxa do anel
 *
 * Por isso os três números aparecem na ordem da narrativa — base, limiar, resultado —
 * e a meta carrega o percentual ao lado do valor, que é o que liga os 30% do
 * indicador do topo à tonelada escrita aqui embaixo. Nada é digitado duas vezes:
 * meta, taxa e cumprimento saem das duas massas.
 *
 * Cor: o cartão só ganha fundo verde quando a taxa fecha 100% — é o que deixa a
 * fileira legível de longe. Quem não fechou fica em cinza, sem cor de semáforo no
 * fundo; a atenção, quando existe, aparece no número.
 */
import { computed } from 'vue';

import { META_PERCENTUAL, type MaterialRecuperado } from '@/data/mocks/perfis';
import RingChart from './RingChart.vue';

const props = defineProps<{ anoExecucao: number; materiais: MaterialRecuperado[] }>();

const toneladas = (valor: number) =>
  `${valor.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t`;

const cartoes = computed(() =>
  props.materiais.map((material) => {
    const meta = (material.produzida * META_PERCENTUAL) / 100;
    const bruta = material.produzida > 0 ? (material.recuperada / material.produzida) * 100 : 0;
    /* O indicador tem teto de 100% — decisão de produto. Quem recuperou mais do que
       colocou no mercado aparece como cheio, não como 174%. */
    const taxa = Math.min(bruta, 100);

    return {
      nome: material.nome,
      taxa,
      completo: taxa >= 100,
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
        Quanto voltou da massa colocada no mercado em {{ anoExecucao }}. A meta do exercício é
        recuperar {{ META_PERCENTUAL }}% do que cada material produziu.
      </p>
    </header>

    <ul class="gx-mass__lista">
      <li
        v-for="material in cartoes"
        :key="material.nome"
        class="gx-mass__item"
        :class="{ 'gx-mass__item--completo': material.completo }"
      >
        <h3 class="gx-mass__material">{{ material.nome }}</h3>

        <RingChart :percentual="material.taxa" />

        <!-- Um slot só: quem fechou mostra o estado, quem não fechou completa a
             frase que o anel começou ("81,4% da massa produzida"). -->
        <p v-if="material.completo" class="gx-mass__chip">Meta atingida</p>
        <p v-else class="gx-mass__legenda">taxa de recuperação</p>

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

/* Fundo verde só quando a taxa fecha 100%: é o que se lê de longe na fileira. */
.gx-mass__item--completo {
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

/* Completa a frase que o anel começou: "81,4% da massa produzida". Fora do anel
   porque o miolo tem ~69px e não comporta palavra. */
.gx-mass__legenda {
  margin: calc(var(--rg-space-3) * -1 + 4px) 0 0;
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  color: var(--rg-color-text-secondary);
  text-align: center;
}

/* O chip só existe no cartão que fechou: no verde ele ganha superfície branca para
   não sumir no fundo. */
.gx-mass__chip {
  margin: 0;
  padding: var(--rg-space-1) 10px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-surface-raised);
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-brand);
}

/* `margin-top: auto` alinha os três números pelo rodapé nos quatro cartões, mesmo
   com o chip existindo só em um deles. */
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
