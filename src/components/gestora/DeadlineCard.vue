<script setup lang="ts">
/**
 * Card de prazo da coluna lateral (D-R001 · tira "Estados do card de prazo").
 *
 * Sem período restritivo: data, contador e a ação que o prazo habilita.
 * Com período restritivo: chip vermelho + UM gatilho que conta, e o card tem a mesma
 * altura com 1, 6 ou 20 ações liberadas. O `n` é só um número dentro de um rótulo.
 *
 * O card nunca mostra QUAL ação está liberada, nem quando há uma só: quem precisa do
 * detalhe abre o popover. Isso mantém a regra uniforme e a altura constante.
 *
 * Não existe `n = 0`: vigência restritiva sem ação liberada não é estado válido.
 * O gatilho é `button aria-expanded`, nunca `a href`, porque abre uma camada na
 * mesma página.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

import type { CardPrazo } from '@/data/mocks/gestora';
import RestrictedPeriodPopover from './RestrictedPeriodPopover.vue';

const props = defineProps<{ prazo: CardPrazo }>();

const aberto = ref(false);
const disclosure = ref<HTMLElement | null>(null);
const gatilho = ref<HTMLButtonElement | null>(null);

const idPopover = computed(() => `gx-popover-${props.prazo.id}`);
const acoes = computed(() => props.prazo.restritivo?.acoes ?? []);

const contador = computed(() => {
  if (props.prazo.contador) return props.prazo.contador;
  const dias = props.prazo.diasRestantes;
  return dias === 1
    ? 'Falta 1 dia para o fim do prazo'
    : `Faltam ${dias} dias para o fim do prazo`;
});

/** Declara o assunto, o tamanho do conjunto e o prazo, para o clique valer a pena. */
const rotuloGatilho = computed(() => {
  const restritivo = props.prazo.restritivo;
  if (!restritivo) return '';
  const total = restritivo.acoes.length;
  return total === 1
    ? `Ver a ação liberada até ${restritivo.ate}`
    : `Ver as ${total} ações liberadas até ${restritivo.ate}`;
});

function alternar() {
  aberto.value = !aberto.value;
}

function fechar(devolverFoco = true) {
  if (!aberto.value) return;
  aberto.value = false;
  if (devolverFoco) void nextTick(() => gatilho.value?.focus());
}

function aoClicarFora(evento: MouseEvent) {
  if (!disclosure.value?.contains(evento.target as Node)) fechar(false);
}

function aoTeclar(evento: KeyboardEvent) {
  if (evento.key === 'Escape') fechar();
}

watch(aberto, (estaAberto) => {
  if (estaAberto) {
    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoTeclar);
  } else {
    document.removeEventListener('mousedown', aoClicarFora);
    document.removeEventListener('keydown', aoTeclar);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', aoClicarFora);
  document.removeEventListener('keydown', aoTeclar);
});
</script>

<template>
  <section class="gx-deadline">
    <div class="gx-deadline__head">
      <div class="gx-deadline__datas">
        <h2 class="gx-deadline__eyebrow">{{ prazo.eyebrow }}</h2>
        <p class="gx-deadline__data">{{ prazo.data }}</p>
        <p class="gx-deadline__contador">{{ contador }}</p>
      </div>

      <span class="gx-deadline__icone" aria-hidden="true">
        <v-icon icon="mdi-calendar" size="18" />
      </span>
    </div>

    <div v-if="prazo.restritivo" class="gx-deadline__bloco">
      <p class="gx-deadline__chip">Período restritivo</p>

      <div ref="disclosure" class="gx-deadline__disclosure">
        <button
          ref="gatilho"
          type="button"
          class="gx-deadline__gatilho"
          :aria-expanded="aberto"
          :aria-controls="idPopover"
          @click="alternar"
        >
          <v-icon icon="mdi-information-outline" size="15" aria-hidden="true" />
          <span class="gx-deadline__gatilho-rotulo">{{ rotuloGatilho }}</span>
        </button>

        <RestrictedPeriodPopover
          v-if="aberto"
          :id="idPopover"
          :acoes="acoes"
          :ate="prazo.restritivo.ate"
          @fechar="fechar()"
        />
      </div>
    </div>

    <!-- Sem período restritivo o card carrega a ação que o prazo habilita. -->
    <button v-else-if="prazo.acaoRotulo" type="button" class="gx-deadline__acao" aria-disabled="true">
      {{ prazo.acaoRotulo }}
      <span class="gx-deadline__breve">em breve</span>
    </button>
  </section>
</template>

<style scoped>
.gx-deadline {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
  padding: var(--rg-space-5);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-raised);
}

.gx-deadline__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rg-space-4);
}

.gx-deadline__datas {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
  min-width: 0;
}

.gx-deadline__eyebrow {
  margin: 0;
  font-size: var(--rg-font-size-2xs);
  line-height: 14px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: 0.06em;
  color: var(--rg-color-text-muted);
}

.gx-deadline__data {
  margin: 0;
  font-size: var(--rg-font-size-xl);
  line-height: 26px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-brand);
}

.gx-deadline__contador {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.gx-deadline__icone {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-color-surface-brand);
  color: var(--rg-color-text-brand);
}

/* ============ Ação do prazo normal ============ */
.gx-deadline__acao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--rg-space-2);
  height: 48px;
  padding: 0 var(--rg-space-7);
  border: 1.5px solid var(--rg-color-border-brand);
  border-radius: var(--rg-radius-md);
  background-color: transparent;
  font-family: inherit;
  font-size: 15px;
  line-height: 20px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-brand);
  cursor: default;
}

/* Mesmo selo do Acesso Rápido: o estado fica escrito, não só no cursor. */
.gx-deadline__breve {
  font-size: var(--rg-font-size-2xs);
  line-height: 14px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.72;
}

/* `outline` transparente em vez de `none`: em alto contraste do Windows o
   box-shadow é descartado e o foco sumiria. */
.gx-deadline__acao:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: var(--rg-ring-focus);
}

/* ============ Bloco do período restritivo ============ */
.gx-deadline__bloco {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  padding: var(--rg-space-3);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-color-surface-subtle);
}

/* O vermelho carrega o estado; o gatilho fica verde de link, para o bloco
   não virar um alarme inteiro. */
.gx-deadline__chip {
  align-self: flex-start;
  margin: 0;
  padding: var(--rg-space-1) 10px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-feedback-danger-soft);
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-primitive-red-700);
}

.gx-deadline__disclosure {
  position: relative;
}

.gx-deadline__gatilho {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  line-height: 18px;
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-brand);
  text-align: left;
  cursor: pointer;
}

.gx-deadline__gatilho-rotulo {
  text-decoration: underline;
}

.gx-deadline__gatilho:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
  border-radius: var(--rg-radius-xs);
}
</style>
