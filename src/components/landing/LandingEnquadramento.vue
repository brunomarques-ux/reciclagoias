<script setup lang="ts">
/**
 * Seção "Sua empresa precisa aderir?" — checklist interativo de enquadramento.
 *
 * Mini-quiz de 3 perguntas sim/não com early-exit (ver eligibilityQuestions
 * em landing.ts): qualquer resposta que bata no exitOn encerra com o
 * resultado correspondente; na última pergunta, o fall-through resolve pra
 * 'enquadra'. O resultado tem tone (warning/success/info), CTA contextual e
 * — só no 'enquadra' — o alerta de sanções.
 *
 * Abaixo do grid, box permanente de exceções (art. 26) com ponte pra
 * autodeclaração. O resultado é orientativo, não parecer jurídico
 * (microdisclaimer no copy).
 *
 * A11y: foco programático na pergunta/título do resultado após cada troca
 * (via @after-enter — não dispara no mount inicial); contador de progresso
 * em aria-live.
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import {
  eligibilityQuestions,
  eligibilityResults,
  eligibilitySanctions,
  eligibilityExceptions,
  type EligibilityResultKey,
} from '@/data/mocks/landing';
import RgButton from '@/components/RgButton.vue';

/** Ícones das exceções (1:1 com eligibilityExceptions.items): agrotóxicos,
 *  óleos lubrificantes e medicamentos (Decreto federal 10.388/2020). */
const exceptionIcons = ['mdi-flask-outline', 'mdi-oil', 'mdi-pill'];

// ============ Entrada (reveal-on-enter, mesmo padrão da seção Perfis) ============
const sectionRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    isVisible.value = true;
    return;
  }
  if (!sectionRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        isVisible.value = true;
        observer?.disconnect();
      }
    },
    { threshold: 0.2 },
  );
  observer.observe(sectionRef.value);
});

onBeforeUnmount(() => observer?.disconnect());

const step = ref(0);
const result = ref<EligibilityResultKey | null>(null);

const totalQuestions = eligibilityQuestions.length;

const currentQuestion = computed(() => eligibilityQuestions[step.value] ?? null);
const currentResult = computed(() =>
  result.value ? eligibilityResults[result.value] : null,
);

const questionRef = ref<HTMLElement | null>(null);
const resultTitleRef = ref<HTMLElement | null>(null);

function answer(value: boolean) {
  const q = currentQuestion.value;
  if (!q) return;
  if (q.exitOn && q.exitOn.answer === value) {
    result.value = q.exitOn.result;
    return;
  }
  if (step.value >= totalQuestions - 1) {
    // Última pergunta sem early-exit → enquadra.
    result.value = 'enquadra';
    return;
  }
  step.value += 1;
}

function reset() {
  step.value = 0;
  result.value = null;
}

/** Foco acompanha a troca de view — leitor de tela anuncia o novo conteúdo. */
function onSwapped() {
  if (currentResult.value) {
    resultTitleRef.value?.focus({ preventScroll: true });
  } else if (step.value > 0) {
    questionRef.value?.focus({ preventScroll: true });
  }
}

const toneIcon: Record<EligibilityResult['tone'], string> = {
  warning: 'mdi-alert-circle-outline',
  success: 'mdi-check-circle-outline',
  info: 'mdi-information-outline',
};

type EligibilityResult = (typeof eligibilityResults)[EligibilityResultKey];
</script>

<template>
  <section
    id="enquadramento"
    ref="sectionRef"
    :class="['rg-enquadra', { 'is-visible': isVisible }]"
    aria-labelledby="rg-enquadra-title"
  >
    <div class="rg-enquadra__inner">
      <div class="rg-enquadra__grid">
        <!-- Copy à esquerda: heading + hint e, 40px abaixo, o atalho da
             autodeclaração (movido da linha de baixo — Figma) -->
        <div class="rg-enquadra__copy">
          <div class="rg-enquadra__copy-head">
            <span class="rg-enquadra__eyebrow">ENQUADRAMENTO</span>
            <h2 id="rg-enquadra-title" class="rg-enquadra__title">
              <span class="rg-enquadra__title-line">Sua empresa</span>
              <span class="rg-enquadra__title-line">
                precisa <span class="rg-enquadra__title-accent">aderir?</span>
              </span>
            </h2>
            <p class="rg-enquadra__lede">
              Responda essas três perguntas rápidas e descubra se sua operação
              se enquadra no Recicla Goiás
            </p>
          </div>

          <a class="rg-enquadra__notified" href="#autodeclaracao">
            <span class="rg-enquadra__notified-label">
              FOI NOTIFICADO E NÃO SE ENQUADRA?
            </span>
            <span class="rg-enquadra__notified-action">
              <v-icon icon="mdi-file-document-edit-outline" size="18" />
              Autodeclaração de Não Enquadramento
            </span>
          </a>
        </div>

        <!-- Card do quiz à direita -->
        <div class="rg-enquadra__quiz">
          <Transition name="rg-enquadra-swap" mode="out-in" @after-enter="onSwapped">
            <!-- Estado: pergunta -->
            <div
              v-if="!currentResult && currentQuestion"
              :key="`question-${step}`"
              class="rg-enquadra__question-view"
            >
              <div class="rg-enquadra__progress">
                <span class="rg-enquadra__progress-text" aria-live="polite">
                  Pergunta {{ step + 1 }} de {{ totalQuestions }}
                </span>
                <span class="rg-enquadra__dots" aria-hidden="true">
                  <span
                    v-for="(q, i) in eligibilityQuestions"
                    :key="q.id"
                    :class="['rg-enquadra__dot', { 'is-filled': i <= step }]"
                  />
                </span>
              </div>

              <p ref="questionRef" tabindex="-1" class="rg-enquadra__question">
                {{ currentQuestion.text }}
              </p>
              <p v-if="currentQuestion.helper" class="rg-enquadra__helper">
                {{ currentQuestion.helper }}
              </p>

              <div class="rg-enquadra__actions">
                <button type="button" class="rg-enquadra__answer" @click="answer(true)">
                  Sim
                </button>
                <button type="button" class="rg-enquadra__answer" @click="answer(false)">
                  Não
                </button>
              </div>

              <button
                v-if="step > 0"
                type="button"
                class="rg-enquadra__restart"
                @click="reset"
              >
                <v-icon icon="mdi-restart" size="16" />
                Recomeçar
              </button>
            </div>

            <!-- Estado: resultado -->
            <div
              v-else-if="currentResult"
              :key="`result-${currentResult.key}`"
              :class="['rg-enquadra__result', `rg-enquadra__result--${currentResult.tone}`]"
            >
              <span class="rg-enquadra__result-icon" aria-hidden="true">
                <v-icon :icon="toneIcon[currentResult.tone]" size="28" />
              </span>
              <h3 ref="resultTitleRef" tabindex="-1" class="rg-enquadra__result-title">
                {{ currentResult.title }}
              </h3>
              <p class="rg-enquadra__result-desc">{{ currentResult.description }}</p>

              <aside v-if="currentResult.showSanctions" class="rg-enquadra__sanctions">
                <div class="rg-enquadra__sanctions-head">
                  <v-icon icon="mdi-alert-outline" size="18" aria-hidden="true" />
                  <strong>{{ eligibilitySanctions.title }}</strong>
                </div>
                <p class="rg-enquadra__sanctions-text">{{ eligibilitySanctions.text }}</p>
                <ul class="rg-enquadra__sanctions-refs" role="list">
                  <li v-for="ref_ in eligibilitySanctions.legalRefs" :key="ref_">
                    {{ ref_ }}
                  </li>
                </ul>
              </aside>

              <div class="rg-enquadra__result-actions">
                <RgButton
                  variant="primary"
                  :href="currentResult.ctaHref"
                  icon-right="mdi-arrow-right"
                >
                  {{ currentResult.ctaLabel }}
                </RgButton>
                <button type="button" class="rg-enquadra__restart" @click="reset">
                  <v-icon icon="mdi-restart" size="16" />
                  Refazer verificação
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Hint orientativo: bullet discreto sob o quiz, alinhado à direita,
           entre o grid e as exceções. -->
      <p class="rg-enquadra__disclaimer">
        <v-icon icon="mdi-information-outline" size="14" aria-hidden="true" />
        Resultado orientativo, não substitui análise jurídica.
      </p>

      <!-- Exceções em largura total: itens em 3 colunas com ícone, pra
           ocupar a horizontal sem espaço morto. -->
      <aside class="rg-enquadra__exceptions" aria-labelledby="rg-enquadra-exceptions-title">
        <div class="rg-enquadra__exceptions-head">
          <v-icon icon="mdi-tag-off-outline" size="18" aria-hidden="true" />
          <strong id="rg-enquadra-exceptions-title">{{ eligibilityExceptions.title }}</strong>
        </div>
        <p class="rg-enquadra__exceptions-intro">{{ eligibilityExceptions.intro }}</p>
        <ul class="rg-enquadra__exceptions-list" role="list">
          <li
            v-for="(item, i) in eligibilityExceptions.items"
            :key="item"
            class="rg-enquadra__exceptions-item"
            :style="{ '--rg-exc-i': i } as Record<string, string | number>"
          >
            <span class="rg-enquadra__exceptions-icon" aria-hidden="true">
              <v-icon :icon="exceptionIcons[i] ?? 'mdi-minus-circle-outline'" size="20" />
            </span>
            {{ item }}
          </li>
        </ul>
        <span class="rg-enquadra__exceptions-ref">{{ eligibilityExceptions.legalRef }}</span>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.rg-enquadra {
  position: relative;
  /* Padding vertical 96px — 16px a mais pra respiro entre seções. */
  padding: var(--rg-space-24) var(--rg-space-6);
  background-color: var(--rg-color-surface-base);
}

.rg-enquadra__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-10);
}

.rg-enquadra__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: var(--rg-space-16);
  /* stretch: a coluna da copy ganha a altura do card do quiz, permitindo
     encostar o card de autodeclaração na base, alinhado com a base do quiz. */
  align-items: stretch;
}

/* ============ Copy ============ */
/* Heading no topo; o card de autodeclaração é empurrado pra base (margin-top
   auto no .rg-enquadra__notified) pra alinhar com a base do card do quiz. */
.rg-enquadra__copy {
  display: flex;
  flex-direction: column;
}

.rg-enquadra__copy-head {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
  /* Entrada: desliza da esquerda com fade (espelha o header da seção Perfis). */
  opacity: 0;
  transform: translateX(-24px);
  transition:
    opacity 700ms var(--rg-motion-ease-standard),
    transform 700ms var(--rg-motion-ease-standard);
}

.rg-enquadra.is-visible .rg-enquadra__copy-head {
  opacity: 1;
  transform: translateX(0);
}

.rg-enquadra__eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-brand);
}

.rg-enquadra__title {
  margin: 0;
  display: flex;
  flex-direction: column;
  font-size: 56px;
  line-height: 1.05;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

.rg-enquadra__title-line {
  display: block;
}

.rg-enquadra__title-accent {
  color: var(--rg-primitive-brand-500);
}

.rg-enquadra__lede {
  margin: 0;
  max-width: 48ch;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.rg-enquadra__disclaimer {
  /* Bullet discreto, alinhado à direita (sob o quiz). O margin-top negativo
     "cola" o hint no quiz, comendo parte do gap de 40px do inner, e mantém
     o respiro cheio antes das exceções. */
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin: 0;
  margin-top: calc(var(--rg-space-8) * -1);
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-muted);
}

.rg-enquadra__disclaimer :deep(.v-icon) {
  color: var(--rg-color-text-muted);
}

/* ============ Card do quiz ============ */
.rg-enquadra__quiz {
  padding: var(--rg-space-10);
  /* Stroke verde + sombra esverdeada + leve gradiente: o quiz é o elemento
     interativo protagonista da seção e precisa se destacar do fundo branco. */
  background: linear-gradient(180deg, #FFFFFF 0%, #F7FBF8 100%);
  border: 1px solid var(--rg-primitive-brand-300);
  border-radius: var(--rg-radius-2xl);
  box-shadow:
    inset 0 0 0 1px rgba(39, 156, 80, 0.12),
    0 1px 2px rgba(18, 82, 42, 0.05),
    0 16px 40px rgba(31, 131, 68, 0.14);
  /* Cobre a pergunta/resultado mais altos — troca não bomba o layout. */
  min-height: 340px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* Entrada: desliza da direita com fade, logo após a copy. */
  opacity: 0;
  transform: translateX(24px);
  transition:
    opacity 700ms var(--rg-motion-ease-standard) 100ms,
    transform 700ms var(--rg-motion-ease-standard) 100ms;
}

.rg-enquadra.is-visible .rg-enquadra__quiz {
  opacity: 1;
  transform: translateX(0);
}

.rg-enquadra__question-view {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
}

.rg-enquadra__progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-3);
}

.rg-enquadra__progress-text {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-primitive-brand-700);
}

.rg-enquadra__dots {
  display: inline-flex;
  gap: var(--rg-space-2);
}

.rg-enquadra__dot {
  width: 24px;
  height: 6px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-neutral-200);
  transition: background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-enquadra__dot.is-filled {
  background-color: var(--rg-primitive-brand-500);
}

.rg-enquadra__question {
  margin: 0;
  font-size: var(--rg-font-size-2xl);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  line-height: var(--rg-line-height-snug);
  color: var(--rg-color-text-primary);
  outline: none;
}

.rg-enquadra__helper {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-muted);
}

.rg-enquadra__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--rg-space-3);
  margin-top: var(--rg-space-2);
}

/* Botões de resposta — outline verde (Figma): borda 2px brand-700, texto
   verde semibold, fundo transparente. */
.rg-enquadra__answer {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px var(--rg-space-4);
  background: transparent;
  border: 2px solid var(--rg-primitive-brand-700);
  border-radius: var(--rg-radius-lg);
  font-family: inherit;
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-primitive-brand-700);
  cursor: pointer;
  transition:
    background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.rg-enquadra__answer:hover {
  background-color: var(--rg-primitive-brand-50);
}

.rg-enquadra__answer:active {
  transform: translateY(1px);
}

.rg-enquadra__answer:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.rg-enquadra__restart {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  align-self: flex-start;
  padding: var(--rg-space-2) var(--rg-space-3);
  background: transparent;
  border: none;
  border-radius: var(--rg-radius-md);
  font-family: inherit;
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-muted);
  cursor: pointer;
  transition:
    color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.rg-enquadra__restart:hover {
  color: var(--rg-color-text-primary);
  background-color: var(--rg-color-surface-muted);
}

.rg-enquadra__restart:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

/* ============ Resultado ============ */
.rg-enquadra__result {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
}

.rg-enquadra__result-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--rg-radius-lg);
}

.rg-enquadra__result--warning .rg-enquadra__result-icon {
  background-color: var(--rg-color-feedback-warning-soft);
  color: var(--rg-primitive-amber-700);
}

.rg-enquadra__result--success .rg-enquadra__result-icon {
  background-color: var(--rg-color-feedback-success-soft);
  color: var(--rg-primitive-brand-700);
}

.rg-enquadra__result--info .rg-enquadra__result-icon {
  background-color: var(--rg-color-feedback-info-soft);
  color: var(--rg-primitive-blue-700);
}

.rg-enquadra__result-title {
  margin: 0;
  font-size: var(--rg-font-size-2xl);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  line-height: var(--rg-line-height-snug);
  color: var(--rg-color-text-primary);
  outline: none;
}

.rg-enquadra__result-desc {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

/* Alerta de sanções — âmbar (paleta do badge "Prazo aberto"). */
.rg-enquadra__sanctions {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  padding: var(--rg-space-4) var(--rg-space-5);
  background-color: var(--rg-color-feedback-warning-soft);
  border-left: 3px solid var(--rg-primitive-amber-500);
  border-radius: var(--rg-radius-lg);
}

.rg-enquadra__sanctions-head {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-sm);
  color: var(--rg-primitive-amber-700);
}

.rg-enquadra__sanctions-head strong {
  font-weight: var(--rg-font-weight-bold);
}

.rg-enquadra__sanctions-text {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.rg-enquadra__sanctions-refs {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--rg-space-2);
}

.rg-enquadra__sanctions-refs li {
  padding: 2px var(--rg-space-2);
  background-color: rgba(252, 211, 77, 0.22);
  border-radius: var(--rg-radius-xs);
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-primitive-amber-700);
  white-space: nowrap;
}

/* Ações do resultado nas duas extremidades do card (Figma): primário à
   esquerda, "Refazer verificação" à direita. */
.rg-enquadra__result-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: var(--rg-space-4);
  margin-top: var(--rg-space-2);
  flex-wrap: wrap;
}

/* Troca pergunta→pergunta/resultado: slide-fade horizontal (avanço). */
.rg-enquadra-swap-enter-active {
  transition:
    opacity 280ms var(--rg-motion-ease-emphasized),
    transform 280ms var(--rg-motion-ease-emphasized);
}

.rg-enquadra-swap-leave-active {
  transition:
    opacity 150ms var(--rg-motion-ease-accelerate),
    transform 150ms var(--rg-motion-ease-accelerate);
}

.rg-enquadra-swap-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.rg-enquadra-swap-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

/* ============ Exceções (largura total, itens em 3 colunas) ============ */
.rg-enquadra__exceptions {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
  padding: var(--rg-space-6) var(--rg-space-8);
  background-color: var(--rg-primitive-neutral-50);
  border: 1px solid var(--rg-color-border-subtle);
  border-left: 3px solid var(--rg-primitive-amber-500);
  border-radius: var(--rg-radius-xl);
  /* Entrada: sobe com fade depois do grid principal. */
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 600ms var(--rg-motion-ease-standard) 320ms,
    transform 600ms var(--rg-motion-ease-standard) 320ms;
}

.rg-enquadra.is-visible .rg-enquadra__exceptions {
  opacity: 1;
  transform: translateY(0);
}

.rg-enquadra__exceptions-head {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  color: var(--rg-color-text-primary);
}

.rg-enquadra__exceptions-head :deep(.v-icon) {
  color: var(--rg-primitive-amber-600);
}

.rg-enquadra__exceptions-head strong {
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-bold);
}

.rg-enquadra__exceptions-intro {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-secondary);
}

/* Itens em 3 colunas com chip de ícone — aproveita a horizontal do card
   full-width sem espaço morto. Entram com stagger leve. */
.rg-enquadra__exceptions-list {
  list-style: none;
  margin: 0;
  padding: var(--rg-space-2) 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--rg-space-6);
}

.rg-enquadra__exceptions-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--rg-space-3);
  align-items: center;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 500ms var(--rg-motion-ease-standard) calc(480ms + var(--rg-exc-i, 0) * 120ms),
    transform 500ms var(--rg-motion-ease-standard) calc(480ms + var(--rg-exc-i, 0) * 120ms);
}

.rg-enquadra.is-visible .rg-enquadra__exceptions-item {
  opacity: 1;
  transform: translateY(0);
}

.rg-enquadra__exceptions-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--rg-radius-md);
  background-color: #faebc9;
  color: var(--rg-primitive-amber-700);
  flex: none;
}

.rg-enquadra__exceptions-ref {
  margin-top: auto;
  padding-top: var(--rg-space-2);
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
}

/* Atalho pra autodeclaração — agora na coluna da copy, 40px abaixo do hint,
   no mesmo padrão do card de decreto/"Fale Conosco" (cinza claro + box
   branca interna). Entra com fade-up depois da copy. */
.rg-enquadra__notified {
  /* Empurrado pra base da coluna, alinhando com a base do card do quiz. */
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  padding: var(--rg-space-4) var(--rg-space-2) var(--rg-space-2);
  max-width: 364px;
  background-color: #F6F6F6;
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-xl);
  text-decoration: none;
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 600ms var(--rg-motion-ease-standard) 220ms,
    transform 600ms var(--rg-motion-ease-standard) 220ms,
    background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-enquadra.is-visible .rg-enquadra__notified {
  opacity: 1;
  transform: translateY(0);
}

.rg-enquadra__notified:hover {
  background-color: #EFEFEF;
}

.rg-enquadra__notified:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.rg-enquadra__notified-label {
  font-size: 11px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
  text-align: center;
  line-height: var(--rg-line-height-snug);
}

.rg-enquadra__notified-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-3) var(--rg-space-4);
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-md);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  text-align: center;
}

.rg-enquadra__notified-action :deep(.v-icon) {
  color: var(--rg-primitive-brand-600);
  flex: none;
}

/* ============ Responsivo ============ */
@media (max-width: 960px) {
  .rg-enquadra__grid {
    grid-template-columns: 1fr;
    gap: var(--rg-space-8);
  }
  .rg-enquadra__title {
    font-size: clamp(32px, 6vw, 44px);
  }
  .rg-enquadra__quiz {
    min-height: 0;
    padding: var(--rg-space-8);
  }
  /* Empilhado: o card de autodeclaração volta a seguir a copy com gap fixo
     (sem coluna esticada, o margin-top auto não tem espaço pra empurrar). */
  .rg-enquadra__copy {
    gap: var(--rg-space-6);
  }
  .rg-enquadra__notified {
    margin-top: 0;
  }
  /* Hint volta pra esquerda, acompanhando o fluxo empilhado. */
  .rg-enquadra__disclaimer {
    align-self: flex-start;
    margin-top: 0;
  }
  /* Itens das exceções empilham no tablet estreito. */
  .rg-enquadra__exceptions-list {
    grid-template-columns: 1fr;
    gap: var(--rg-space-3);
  }
}

@media (max-width: 640px) {
  .rg-enquadra {
    padding: var(--rg-space-14) var(--rg-space-4);
  }
  .rg-enquadra__quiz {
    padding: var(--rg-space-6) var(--rg-space-5);
  }
  .rg-enquadra__actions {
    grid-template-columns: 1fr;
  }
  .rg-enquadra__exceptions {
    padding: var(--rg-space-5);
  }
  .rg-enquadra__notified {
    max-width: none;
  }
  .rg-enquadra__result-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .rg-enquadra__result-actions .rg-enquadra__restart {
    align-self: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rg-enquadra-swap-enter-active,
  .rg-enquadra-swap-leave-active,
  .rg-enquadra__dot,
  .rg-enquadra__copy-head,
  .rg-enquadra__quiz,
  .rg-enquadra__notified,
  .rg-enquadra__exceptions,
  .rg-enquadra__exceptions-item {
    transition: none !important;
  }
}
</style>
