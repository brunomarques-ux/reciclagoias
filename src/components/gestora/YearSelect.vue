<script setup lang="ts">
/**
 * Seletor do ano de execução — segmentado com janela deslizante (D-R002, tira
 * "Seletor de ano · estados" no Figma).
 *
 * Três células coladas e uma seta em cada ponta. O ano selecionado fica **sempre no
 * centro** e as setas deslocam a janela inteira, então o destaque não pula de posição.
 * Nos extremos da série a janela trava, o selecionado ocupa a borda e a seta
 * correspondente desabilita — não existe ano futuro.
 *
 * É um grupo de botões, não um `<select>`: os anos vizinhos ficam a um clique, que é o
 * movimento real (comparar o exercício com o anterior). `←` `→` andam na série e
 * `Home`/`End` vão para os extremos.
 */
import { computed } from 'vue';

const modelo = defineModel<number>({ required: true });

const props = defineProps<{ anos: number[] }>();

/** A série sempre cresce da esquerda para a direita, venha como vier. */
const serie = computed(() => [...props.anos].sort((a, b) => a - b));
const indice = computed(() => serie.value.indexOf(modelo.value));

const janela = computed(() => {
  const total = serie.value.length;
  const tamanho = Math.min(3, total);
  const inicio = Math.max(0, Math.min(indice.value - 1, total - tamanho));
  return serie.value.slice(inicio, inicio + tamanho);
});

const podeVoltar = computed(() => indice.value > 0);
const podeAvancar = computed(() => indice.value >= 0 && indice.value < serie.value.length - 1);

function irPara(destino: number) {
  const ano = serie.value[Math.max(0, Math.min(destino, serie.value.length - 1))];
  if (ano !== undefined) modelo.value = ano;
}

function aoTeclar(evento: KeyboardEvent) {
  const teclas: Record<string, () => void> = {
    ArrowLeft: () => irPara(indice.value - 1),
    ArrowRight: () => irPara(indice.value + 1),
    Home: () => irPara(0),
    End: () => irPara(serie.value.length - 1),
  };

  const acao = teclas[evento.key];
  if (!acao) return;
  evento.preventDefault();
  acao();
}
</script>

<template>
  <div class="gx-year">
    <p class="gx-year__rotulo" id="gx-year-rotulo">Ano de execução</p>

    <div class="gx-year__grupo" role="group" aria-labelledby="gx-year-rotulo" @keydown="aoTeclar">
      <button
        type="button"
        class="gx-year__seta"
        aria-label="Anos anteriores"
        :disabled="!podeVoltar"
        @click="irPara(indice - 1)"
      >
        <v-icon icon="mdi-chevron-left" size="16" />
      </button>

      <button
        v-for="ano in janela"
        :key="ano"
        type="button"
        class="gx-year__ano"
        :class="{ 'gx-year__ano--ativo': ano === modelo }"
        :aria-pressed="ano === modelo"
        @click="modelo = ano"
      >
        {{ ano }}
      </button>

      <button
        type="button"
        class="gx-year__seta"
        aria-label="Anos seguintes"
        :disabled="!podeAvancar"
        @click="irPara(indice + 1)"
      >
        <v-icon icon="mdi-chevron-right" size="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.gx-year {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gx-year__rotulo {
  margin: 0;
  font-size: var(--rg-font-size-2xs);
  line-height: 14px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
}

.gx-year__grupo {
  display: flex;
  align-self: flex-start;
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-color-surface-raised);
  overflow: hidden;
}

.gx-year__seta,
.gx-year__ano {
  height: 40px;
  border: none;
  background-color: transparent;
  font-family: inherit;
  cursor: pointer;
  transition: background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

/* O fio entre as células é o mesmo do contorno — nada de gap. */
.gx-year__seta + .gx-year__ano,
.gx-year__ano + .gx-year__ano,
.gx-year__ano + .gx-year__seta {
  border-left: 1px solid var(--rg-color-border-subtle);
}

.gx-year__seta {
  display: grid;
  place-items: center;
  width: 36px;
  padding: 0 10px;
  color: var(--rg-color-text-secondary);
}

.gx-year__seta:hover:not(:disabled) {
  background-color: var(--rg-color-surface-subtle);
  color: var(--rg-color-text-primary);
}

.gx-year__seta:disabled {
  background-color: var(--rg-color-surface-subtle);
  color: var(--rg-color-text-disabled);
  cursor: default;
}

.gx-year__ano {
  padding: 0 18px;
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
}

.gx-year__ano:hover:not(.gx-year__ano--ativo) {
  background-color: var(--rg-color-surface-subtle);
  color: var(--rg-color-text-primary);
}

.gx-year__ano--ativo {
  background-color: var(--rg-color-surface-brand);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-brand);
  cursor: default;
}

/* Anel por dentro: o contorno do grupo não deixa espaço para offset positivo. */
.gx-year__seta:focus-visible,
.gx-year__ano:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: -2px;
}

@media (prefers-reduced-motion: reduce) {
  .gx-year__seta,
  .gx-year__ano {
    transition: none;
  }
}
</style>
