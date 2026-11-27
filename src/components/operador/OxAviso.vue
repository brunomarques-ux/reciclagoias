<script setup lang="ts">
/**
 * Aviso de página da Minha Conta do operador: réplica do `FeedbackBanner` da
 * biblioteca no Figma, nos quatro tons.
 *
 * Planning de 13/11/2026 (Figma: seção `6506:4284`): success no cadastro aprovado
 * (L5·1, `6506:4595`), warning no documento perto de vencer (L1·2, `6507:5839`),
 * danger no bloqueio (L1·4, `6507:6227`) e info no documento em conferência (L1·5,
 * `6507:6537`). O sinal do círculo é texto, como no Figma, e fica fora da leitura
 * de tela: o tom já está dito no título.
 *
 * 26/11/2026, depois da reunião com a SEMAD (pedido do Bruno): o aviso deixa de ser
 * um parágrafo corrido. Além do texto de abertura, pode ter a lista do que fica
 * suspenso e do que continua liberado (✕ e ✓, com a palavra escrita para leitor de
 * tela), uma frase final em destaque (o prazo ou o próximo passo) e o botão da ação.
 * As palavras são as revisadas pela Thainá; só a forma mudou.
 *
 * Borda: o Figma usa o degrau 200 de cada rampa, que não existe aqui. Fica o 100.
 */
export interface ItemDoAviso {
  texto: string;
  /** sim: continua liberado; nao: fica suspenso ou bloqueado. */
  marca?: 'sim' | 'nao';
}

const props = defineProps<{
  tom: 'success' | 'warning' | 'danger' | 'info';
  titulo: string;
  texto?: string;
  itens?: ItemDoAviso[];
  fecho?: string;
  acao?: string;
}>();
const emit = defineEmits<{ acao: [] }>();

const SINAL = { success: '✓', warning: '!', danger: '!', info: 'i' } as const;
const composto = () => !!(props.itens?.length || props.fecho || props.acao);
</script>

<template>
  <div
    class="ox-aviso"
    :class="[`ox-aviso--${tom}`, { 'ox-aviso--composto': composto() }]"
    :role="tom === 'danger' ? 'alert' : 'status'"
  >
    <span class="ox-aviso__sinal" aria-hidden="true">{{ SINAL[tom] }}</span>
    <div class="ox-aviso__textos">
      <p class="ox-aviso__titulo">{{ titulo }}</p>
      <p v-if="texto" class="ox-aviso__texto">{{ texto }}</p>
      <ul v-if="itens?.length" class="ox-aviso__itens">
        <li v-for="i in itens" :key="i.texto" :class="i.marca && `ox-aviso__item--${i.marca}`">
          <span v-if="i.marca" class="ox-aviso__marca" aria-hidden="true">{{ i.marca === 'sim' ? '✓' : '✕' }}</span>
          <span v-if="i.marca" class="ox-aviso__sr">{{ i.marca === 'sim' ? 'Liberado:' : 'Restrito:' }}</span>
          <span>{{ i.texto }}</span>
        </li>
      </ul>
      <p v-if="fecho" class="ox-aviso__fecho">{{ fecho }}</p>
    </div>
    <button v-if="acao" type="button" class="ox-aviso__acao" @click="emit('acao')">{{ acao }}</button>
  </div>
</template>

<style scoped>
.ox-aviso {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  padding: var(--rg-space-4);
  border: 1px solid;
  border-radius: var(--rg-radius-md);
}

.ox-aviso--composto {
  align-items: flex-start;
  padding: var(--rg-space-4) var(--rg-space-5);
}

.ox-aviso__sinal {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: var(--rg-radius-pill);
  color: var(--rg-primitive-neutral-0);
  font-size: 13px;
  font-weight: var(--rg-font-weight-bold);
  line-height: 1;
}

.ox-aviso__textos {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ox-aviso--composto .ox-aviso__textos {
  gap: var(--rg-space-2);
}

.ox-aviso__titulo {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 20px;
}

.ox-aviso--composto .ox-aviso__titulo {
  font-size: var(--rg-font-size-md);
  line-height: 24px;
}

.ox-aviso__texto {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
}

.ox-aviso--composto .ox-aviso__texto {
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
}

.ox-aviso__itens {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
}

.ox-aviso__itens li {
  display: flex;
  align-items: flex-start;
  gap: var(--rg-space-2);
}

.ox-aviso__marca {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  border-radius: var(--rg-radius-pill);
  font-size: 11px;
  font-weight: var(--rg-font-weight-bold);
  line-height: 1;
  color: var(--rg-primitive-neutral-0);
}

.ox-aviso__item--sim .ox-aviso__marca {
  background: var(--rg-color-feedback-success);
}

.ox-aviso__item--nao .ox-aviso__marca {
  background: var(--rg-color-feedback-danger);
}

.ox-aviso__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.ox-aviso__fecho {
  margin: var(--rg-space-1) 0 0;
  padding-top: var(--rg-space-2);
  border-top: 1px solid currentColor;
  border-top-color: color-mix(in srgb, currentColor 20%, transparent);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 20px;
}

.ox-aviso__acao {
  flex-shrink: 0;
  align-self: center;
  padding: var(--rg-space-2) var(--rg-space-4);
  border: 1px solid currentColor;
  border-radius: var(--rg-radius-md);
  background: var(--rg-primitive-neutral-0);
  color: inherit;
  font: inherit;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 20px;
  cursor: pointer;
}

.ox-aviso__acao:hover {
  background: color-mix(in srgb, currentColor 8%, var(--rg-primitive-neutral-0));
}

.ox-aviso__acao:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.ox-aviso--success {
  background: var(--rg-color-surface-brand);
  border-color: var(--rg-primitive-brand-100);
  color: var(--rg-color-text-brand);
}

.ox-aviso--success .ox-aviso__sinal {
  background: var(--rg-color-feedback-success);
}

.ox-aviso--warning {
  background: var(--rg-color-feedback-warning-soft);
  border-color: var(--rg-primitive-amber-100);
  color: var(--rg-primitive-amber-700);
}

.ox-aviso--warning .ox-aviso__sinal {
  background: var(--rg-color-feedback-warning);
}

.ox-aviso--danger {
  background: var(--rg-color-feedback-danger-soft);
  border-color: var(--rg-primitive-red-100);
  color: var(--rg-primitive-red-700);
}

.ox-aviso--danger .ox-aviso__sinal {
  background: var(--rg-color-feedback-danger);
}

.ox-aviso--info {
  background: var(--rg-color-feedback-info-soft);
  border-color: var(--rg-primitive-blue-100);
  color: var(--rg-primitive-blue-700);
}

.ox-aviso--info .ox-aviso__sinal {
  background: var(--rg-color-feedback-info);
}

@media (max-width: 720px) {
  .ox-aviso--composto {
    flex-wrap: wrap;
  }

  .ox-aviso__acao {
    align-self: stretch;
    width: 100%;
  }
}
</style>
