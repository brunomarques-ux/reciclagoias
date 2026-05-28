<script setup lang="ts">
/**
 * Seção Perguntas Frequentes — segue Figma node 17:823.
 *
 * Layout: header split (copy à esquerda; à direita 3 balões 3D de "?" com
 * blur progressivo + card "Fale Conosco"). Abaixo, acordeão NÃO-exclusivo
 * (múltiplos items abertos simultaneamente) com 6 perguntas.
 *
 * Microinteração nos balões 3D: reveal-on-scroll SEQUENCIAL — os 3 balões
 * descem de cima conforme o usuário rola pra section, mas com delays
 * diferentes: o primeiro (esquerda, maior, sem blur) chega primeiro; o
 * segundo (centro, blur 2px) chega no meio; o terceiro (direita, blur 4px)
 * chega por último, ao terminar o scroll. Mesma mecânica do logo 3D da
 * seção Fluxo de Operação.
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { faqItems } from '@/data/mocks/landing';

defineProps<{ id?: string }>();

// ============ Acordeão não-exclusivo ============
// Set permite abrir múltiplos ao mesmo tempo. Primeiro item aberto por default
// (replica o estado inicial do Figma).
const openItems = ref<Set<number>>(new Set([0]));

function toggle(i: number) {
  const next = new Set(openItems.value);
  if (next.has(i)) next.delete(i);
  else next.add(i);
  openItems.value = next; // reatribui pra Vue detectar a mudança
}

// ============ Reveal-on-scroll dos 3 balões ============
const sectionRef = ref<HTMLElement | null>(null);
const scrollProgress = ref(0); // 0..1 baseado em onde a section está no viewport
let rafId: number | null = null;

function updateScrollProgress() {
  rafId = null;
  const section = sectionRef.value;
  if (!section) return;
  const rect = section.getBoundingClientRect();
  const vh = window.innerHeight;
  // Section ainda fora (rect.top > vh) → 0
  // Section centralizada (rect.top ≈ vh*0.3) → 1
  const start = vh;
  const end = vh * 0.3;
  const range = start - end;
  const raw = (start - rect.top) / range;
  scrollProgress.value = Math.max(0, Math.min(1, raw));
}

function onScroll() {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(updateScrollProgress);
}

// Por balão, mapeia scrollProgress global em progresso individual com delay
// e duração distintos — primeiro completa cedo, último completa no fim.
const balloon1Progress = computed(() =>
  Math.min(1, Math.max(0, scrollProgress.value / 0.45)),
);
const balloon2Progress = computed(() =>
  Math.min(1, Math.max(0, (scrollProgress.value - 0.18) / 0.55)),
);
const balloon3Progress = computed(() =>
  Math.min(1, Math.max(0, (scrollProgress.value - 0.35) / 0.65)),
);

onMounted(() => {
  updateScrollProgress();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateScrollProgress, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', updateScrollProgress);
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <section
    :id="id ?? 'duvidas'"
    ref="sectionRef"
    class="rg-faq"
    aria-labelledby="rg-faq-title"
  >
    <div class="rg-faq__inner">
      <!-- Header split: copy à esquerda, decor (balões + fale conosco) à direita -->
      <header class="rg-faq__header">
        <div class="rg-faq__copy">
          <span class="rg-faq__eyebrow">PERGUNTAS FREQUENTES</span>
          <h2 id="rg-faq-title" class="rg-faq__title">
            <span class="rg-faq__title-line">Dúvidas comuns sobre</span>
            <span class="rg-faq__title-line">
              o
              <span class="rg-faq__title-accent">Recicla Goiás</span>
            </span>
          </h2>
          <p class="rg-faq__lede">
            Se a sua dúvida não estiver listada, fale com a equipe do Recicla Goiás
            pelos canais institucionais no rodapé.
          </p>
        </div>

        <div class="rg-faq__decor">
          <!-- 3 balões 3D com reveal-on-scroll sequencial e blur progressivo -->
          <div class="rg-faq__balloons" aria-hidden="true">
            <img
              src="/faq/doubt-icon.png"
              alt=""
              class="rg-faq__balloon rg-faq__balloon--1"
              :style="{ '--p': balloon1Progress } as Record<string, string | number>"
            />
            <img
              src="/faq/doubt-icon.png"
              alt=""
              class="rg-faq__balloon rg-faq__balloon--2"
              :style="{ '--p': balloon2Progress } as Record<string, string | number>"
            />
            <img
              src="/faq/doubt-icon.png"
              alt=""
              class="rg-faq__balloon rg-faq__balloon--3"
              :style="{ '--p': balloon3Progress } as Record<string, string | number>"
            />
          </div>

          <!-- Card "Não encontrou sua dúvida? Fale Conosco" -->
          <a class="rg-faq__contact" href="#contato">
            <span class="rg-faq__contact-label">
              NÃO ENCONTROU SUA DÚVIDA?
            </span>
            <span class="rg-faq__contact-cta">
              <v-icon icon="mdi-help-circle-outline" size="18" />
              Fale Conosco
            </span>
          </a>
        </div>
      </header>

      <!-- Acordeão (não-exclusivo: múltiplos items abertos simultaneamente) -->
      <ul class="rg-faq__list" role="list">
        <li
          v-for="(item, i) in faqItems"
          :key="item.question"
          :class="['rg-faq__item', { 'is-open': openItems.has(i) }]"
        >
          <button
            type="button"
            class="rg-faq__question"
            :aria-expanded="openItems.has(i)"
            :aria-controls="`rg-faq-answer-${i}`"
            @click="toggle(i)"
          >
            <span class="rg-faq__question-text">{{ item.question }}</span>
            <span class="rg-faq__toggle" aria-hidden="true">
              <v-icon
                :icon="openItems.has(i) ? 'mdi-minus' : 'mdi-plus'"
                size="20"
              />
            </span>
          </button>

          <Transition name="rg-faq-expand">
            <div
              v-if="openItems.has(i)"
              :id="`rg-faq-answer-${i}`"
              class="rg-faq__answer"
            >
              <p>{{ item.answer }}</p>
            </div>
          </Transition>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.rg-faq {
  position: relative;
  padding: var(--rg-space-24) var(--rg-space-6);
  background-color: var(--rg-color-surface-base);
  /* Balões podem estourar pra cima durante o reveal-on-scroll, sem causar
     scrollbar horizontal. */
  overflow: hidden;
}

.rg-faq__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-12);
}

/* ============ Header ============ */
.rg-faq__header {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr);
  gap: var(--rg-space-12);
  align-items: start;
}

.rg-faq__copy {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
}

.rg-faq__eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-brand);
}

.rg-faq__title {
  margin: 0;
  display: flex;
  flex-direction: column;
  font-size: 56px;
  line-height: 1.05;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

/* Apenas "Recicla Goiás" em verde brand-500 — o "o" antes fica preto
   (text-primary), mesma cor da primeira linha. */
.rg-faq__title-accent {
  color: var(--rg-primitive-brand-500);
}

.rg-faq__lede {
  margin: var(--rg-space-2) 0 0;
  max-width: 56ch;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

/* ============ Decor (balões + fale conosco) ============ */
.rg-faq__decor {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--rg-space-6);
}

/* Container alinhado à mesma largura do card "Fale Conosco" abaixo (280px):
   o balão 1 começa no left:0 (alinhado ao início do card) e o balão 3
   termina no right:0 (alinhado ao fim do card), criando uma composição
   horizontal balanceada com o card. */
.rg-faq__balloons {
  position: relative;
  width: 280px;
  height: 110px;
}

/* Balões: usam --p (0..1) pra animar opacity e translateY conforme o scroll
   atinge cada balão. Cada um tem tamanho, posição, rotação e blur distintos
   pra criar a sensação de "movimento desalinhado", igual ao Figma. */
.rg-faq__balloon {
  position: absolute;
  object-fit: contain;
  opacity: var(--p, 0);
  /* Começa em translateY -180% (acima da section, "escondido atrás do
     Sistema") e desce até 0 conforme p vai de 0 a 1. A rotação inicial
     vem do CSS por classe (ver --1/--2/--3 abaixo) e é PRESERVADA — o
     translateY do reveal NÃO sobrescreve, é multiplicado. */
  will-change: transform, opacity;
}

/* Balão 1 — esquerda, maior, sem blur, sem rotação (chega primeiro).
   Alinhado ao início do card "Fale Conosco" (left:0). */
.rg-faq__balloon--1 {
  left: 0;
  top: 0;
  width: 96px;
  height: 96px;
  z-index: 3;
  transform: translateY(calc((1 - var(--p, 0)) * -180%));
  filter: drop-shadow(0 12px 24px rgba(15, 70, 35, 0.18));
}

/* Balão 2 — centro, MENOR (56px), blur 2px, levemente rotacionado pra cima
   e deslocado verticalmente pra dar sensação de movimento orgânico. */
.rg-faq__balloon--2 {
  /* Centro EXATO entre os centros dos balões 1 e 3:
     - Centro do balão 1: 48px (left:0, width:96 → center 48)
     - Centro do balão 3: 258px (right:0, width:44 → center 258)
     - Meio: (48 + 258) / 2 = 153px
     - left = 153 - 28 (metade da width 56) = 125px */
  left: 125px;
  top: -6px;
  width: 56px;
  height: 56px;
  z-index: 2;
  transform:
    translateY(calc((1 - var(--p, 0)) * -180%))
    rotate(-10deg);
  filter:
    blur(2px)
    drop-shadow(0 10px 18px rgba(15, 70, 35, 0.15));
}

/* Balão 3 — direita, AINDA MENOR (44px), blur 4px, rotacionado pra baixo
   e deslocado um pouco pra baixo. Alinhado ao final do card (right:0). */
.rg-faq__balloon--3 {
  right: 0;
  top: 16px;
  width: 44px;
  height: 44px;
  z-index: 1;
  transform:
    translateY(calc((1 - var(--p, 0)) * -180%))
    rotate(12deg);
  filter:
    blur(4px)
    drop-shadow(0 8px 14px rgba(15, 70, 35, 0.12));
}

/* Card "Não encontrou sua dúvida? Fale Conosco" — cinza claro, mesmo
   padrão do card de decreto na seção O que é. */
.rg-faq__contact {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  padding: var(--rg-space-4) var(--rg-space-5);
  background-color: #F6F6F6;
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-xl);
  text-decoration: none;
  width: 100%;
  max-width: 280px;
  transition:
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-faq__contact:hover {
  transform: translateY(-2px);
  background-color: #EFEFEF;
}

.rg-faq__contact:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.rg-faq__contact-label {
  font-size: 11px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: #647488;
  line-height: var(--rg-line-height-snug);
  /* Centralizado no card pra balancear com o CTA "Fale Conosco" abaixo, que
     já é text-align center via flex. */
  text-align: center;
}

.rg-faq__contact-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--rg-space-2);
  width: 100%;
  padding: var(--rg-space-3) var(--rg-space-4);
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-md);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.rg-faq__contact-cta :deep(.v-icon) {
  color: var(--rg-primitive-brand-600);
}

/* ============ Acordeão ============ */
.rg-faq__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.rg-faq__item {
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-xl);
  transition:
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
  overflow: hidden;
}

.rg-faq__item.is-open {
  border-color: var(--rg-primitive-brand-500);
  /* Borda 2px sem mudar o layout: usa box-shadow inset pra simular o segundo
     px sem alterar dimensões do card. */
  box-shadow: inset 0 0 0 1px var(--rg-primitive-brand-500);
}

.rg-faq__question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-4);
  width: 100%;
  padding: var(--rg-space-5) var(--rg-space-6);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.rg-faq__question:hover {
  background-color: var(--rg-primitive-brand-50);
}

.rg-faq__question:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: -2px;
}

.rg-faq__question-text {
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  letter-spacing: var(--rg-letter-spacing-tight);
  line-height: var(--rg-line-height-snug);
}

.rg-faq__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--rg-radius-pill);
  color: var(--rg-color-text-secondary);
  flex-shrink: 0;
  transition: color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.rg-faq__item.is-open .rg-faq__toggle {
  color: var(--rg-primitive-brand-500);
}

.rg-faq__answer {
  /* Padding-top var(--rg-space-2) = 8px pra dar respiro entre o botão da
     pergunta e o texto da resposta — antes começava colado, sem zona de
     silêncio. Não usamos o mesmo do bottom (20px) pra não inflar demais
     a altura do item aberto. */
  padding: var(--rg-space-2) var(--rg-space-6) var(--rg-space-5);
}

.rg-faq__answer p {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

/* Transition de expand/collapse do acordeão.
   Animamos via max-height + opacity. O max-height "grande" (500px) cobre
   qualquer resposta textual sem corte e ainda mantém a animação suave. */
.rg-faq-expand-enter-active,
.rg-faq-expand-leave-active {
  overflow: hidden;
  transition:
    max-height 320ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 200ms ease;
}

.rg-faq-expand-enter-from,
.rg-faq-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.rg-faq-expand-enter-to,
.rg-faq-expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* ============ Responsivo ============ */
@media (max-width: 960px) {
  .rg-faq__header {
    grid-template-columns: 1fr;
    gap: var(--rg-space-8);
  }
  .rg-faq__decor {
    align-items: flex-start;
  }
  .rg-faq__title {
    font-size: clamp(32px, 6vw, 44px);
  }
}

@media (max-width: 960px) {
  /* No mobile/tablet os balões 3D ficam apertados com o card "Fale Conosco"
     e o reveal-on-scroll fica visualmente estranho (a section toda entra
     no viewport quase no mesmo frame). Removidos no mobile, igual fizemos
     com o logo 3D do Fluxo. */
  .rg-faq__balloons {
    display: none;
  }
}

@media (max-width: 640px) {
  .rg-faq {
    padding: var(--rg-space-16) var(--rg-space-4);
  }
  .rg-faq__question {
    padding: var(--rg-space-4) var(--rg-space-5);
  }
  .rg-faq__answer {
    padding: var(--rg-space-2) var(--rg-space-5) var(--rg-space-4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rg-faq__balloon,
  .rg-faq-expand-enter-active,
  .rg-faq-expand-leave-active {
    transition: none !important;
  }
  .rg-faq__balloon {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
