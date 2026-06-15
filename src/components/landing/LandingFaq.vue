<script setup lang="ts">
/**
 * Seção Perguntas Frequentes — segue Figma node 17:823.
 *
 * Layout: header split (copy à esquerda; à direita 3 balões 3D de "?" com
 * blur progressivo + card "Fale Conosco"). Abaixo, toolbar de busca +
 * acordeão NÃO-exclusivo (múltiplos items abertos simultaneamente).
 *
 * Busca: filtra pergunta E resposta, caixa/acento-insensitive, com highlight
 * dos matches via <mark> (sem v-html — ver utils/textSearch). Sem busca
 * ativa, mostra só as INITIAL_COUNT primeiras perguntas + botão revelar;
 * com busca, filtra o conjunto inteiro (o limite é ignorado).
 *
 * Microinteração nos balões 3D: reveal-on-scroll SEQUENCIAL — os 3 balões
 * descem de cima conforme o usuário rola pra section, mas com delays
 * diferentes: o primeiro (esquerda, maior, sem blur) chega primeiro; o
 * segundo (centro, blur 2px) chega no meio; o terceiro (direita, blur 4px)
 * chega por último, ao terminar o scroll. Mesma mecânica do logo 3D da
 * seção Fluxo de Operação.
 */
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { faqItems } from '@/data/mocks/landing';
import { matchesQuery, highlightSegments } from '@/utils/textSearch';
import RgExpandTransition from '@/components/RgExpandTransition.vue';

defineProps<{ id?: string }>();

// ============ Acordeão não-exclusivo ============
// Set de IDs estáveis (não índices: a busca filtra a lista e os índices
// mudam). Primeiro item aberto por default (replica o estado do Figma).
const openItems = ref<Set<string>>(new Set(faqItems[0] ? [faqItems[0].id] : []));

// ============ Busca + revelar mais ============
/** Quantas perguntas aparecem antes do "Mostrar todas" (sem busca ativa). */
const INITIAL_COUNT = 6;

const query = ref('');
const showAll = ref(false);

const trimmedQuery = computed(() => query.value.trim());

/** Filtro sobre o conjunto INTEIRO — a busca ignora o limite do revelar. */
const filteredItems = computed(() => {
  const q = trimmedQuery.value;
  if (!q) return faqItems;
  return faqItems.filter(
    (item) => matchesQuery(item.question, q) || matchesQuery(item.answer, q),
  );
});

const visibleItems = computed(() => {
  if (trimmedQuery.value) return filteredItems.value;
  return showAll.value ? faqItems : faqItems.slice(0, INITIAL_COUNT);
});

const hiddenCount = computed(() => faqItems.length - INITIAL_COUNT);

/** Contador anunciado por aria-live — vira feedback da busca quando ativa. */
const countLabel = computed(() => {
  const q = trimmedQuery.value;
  if (!q) return `${faqItems.length} perguntas`;
  const n = filteredItems.value.length;
  return n === 1 ? `1 resultado para “${q}”` : `${n} resultados para “${q}”`;
});

// Itens cujo match está SÓ na resposta abrem automaticamente durante a
// busca — sem isso o usuário vê o resultado sem entender por quê. O estado
// manual (openItems) é preservado ao limpar a query.
const searchAutoOpen = ref<Set<string>>(new Set());

watch(trimmedQuery, (q) => {
  if (!q) {
    searchAutoOpen.value = new Set();
    return;
  }
  const next = new Set<string>();
  for (const item of faqItems) {
    if (!matchesQuery(item.question, q) && matchesQuery(item.answer, q)) {
      next.add(item.id);
    }
  }
  searchAutoOpen.value = next;
});

function isOpen(id: string): boolean {
  return openItems.value.has(id) || searchAutoOpen.value.has(id);
}

function toggle(id: string) {
  const nextOpen = new Set(openItems.value);
  const nextAuto = new Set(searchAutoOpen.value);
  if (isOpen(id)) {
    nextOpen.delete(id);
    nextAuto.delete(id);
  } else {
    nextOpen.add(id);
  }
  openItems.value = nextOpen; // reatribui pra Vue detectar a mudança
  searchAutoOpen.value = nextAuto;
}

function clearQuery() {
  query.value = '';
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
          <a
            class="rg-faq__contact"
            href="mailto:logisticareversa.meioambiente@gov.goias.br?subject=D%C3%BAvida%20sobre%20o%20Recicla%20Goi%C3%A1s"
            aria-label="Enviar e-mail com sua dúvida"
          >
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

      <!-- Toolbar: busca por string (pergunta + resposta) e contador -->
      <div class="rg-faq__toolbar">
        <div class="rg-faq__search">
          <v-icon icon="mdi-magnify" size="20" class="rg-faq__search-icon" aria-hidden="true" />
          <label class="rg-faq__sr-only" for="rg-faq-search-input">
            Buscar nas perguntas frequentes
          </label>
          <input
            id="rg-faq-search-input"
            v-model="query"
            type="search"
            class="rg-faq__search-input"
            placeholder="Buscar por termo, como empresa aderente ou nota fiscal…"
            autocomplete="off"
          />
          <button
            v-if="trimmedQuery"
            type="button"
            class="rg-faq__search-clear"
            aria-label="Limpar busca"
            @click="clearQuery"
          >
            <v-icon icon="mdi-close" size="18" />
          </button>
        </div>
        <span class="rg-faq__count" aria-live="polite">{{ countLabel }}</span>
      </div>

      <!-- Acordeão (não-exclusivo: múltiplos items abertos simultaneamente) -->
      <ul v-if="visibleItems.length > 0" class="rg-faq__list" role="list">
        <li
          v-for="item in visibleItems"
          :key="item.id"
          :class="['rg-faq__item', { 'is-open': isOpen(item.id) }]"
        >
          <button
            type="button"
            class="rg-faq__question"
            :aria-expanded="isOpen(item.id)"
            :aria-controls="`rg-faq-answer-${item.id}`"
            @click="toggle(item.id)"
          >
            <span class="rg-faq__question-text">
              <template
                v-for="(seg, si) in highlightSegments(item.question, trimmedQuery)"
                :key="si"
              ><mark v-if="seg.hit" class="rg-faq__mark">{{ seg.text }}</mark><template v-else>{{ seg.text }}</template></template>
            </span>
            <span class="rg-faq__toggle" aria-hidden="true">
              <v-icon
                :icon="isOpen(item.id) ? 'mdi-minus' : 'mdi-plus'"
                size="20"
              />
            </span>
          </button>

          <RgExpandTransition>
            <div
              v-if="isOpen(item.id)"
              :id="`rg-faq-answer-${item.id}`"
              class="rg-faq__answer"
            >
              <p>
                <template
                  v-for="(seg, si) in highlightSegments(item.answer, trimmedQuery)"
                  :key="si"
                ><mark v-if="seg.hit" class="rg-faq__mark">{{ seg.text }}</mark><template v-else>{{ seg.text }}</template></template>
              </p>
            </div>
          </RgExpandTransition>
        </li>
      </ul>

      <!-- Empty state da busca: nenhum match -->
      <div v-else class="rg-faq__empty">
        <img src="/faq/doubt-icon.png" alt="" class="rg-faq__empty-icon" aria-hidden="true" />
        <p class="rg-faq__empty-text">
          Nenhuma pergunta encontrada para
          <strong>“{{ trimmedQuery }}”</strong>.
        </p>
        <a
          class="rg-faq__empty-cta"
          href="mailto:logisticareversa.meioambiente@gov.goias.br?subject=D%C3%BAvida%20sobre%20o%20Recicla%20Goi%C3%A1s"
        >
          <v-icon icon="mdi-help-circle-outline" size="18" />
          Fale Conosco
        </a>
      </div>

      <!-- Revelar mais — só sem busca ativa (a busca filtra o conjunto todo) -->
      <div
        v-if="!trimmedQuery && hiddenCount > 0"
        class="rg-faq__reveal"
      >
        <button
          type="button"
          class="rg-faq__reveal-btn"
          :aria-expanded="showAll"
          @click="showAll = !showAll"
        >
          {{ showAll ? 'Mostrar menos' : `Mostrar todas as ${faqItems.length} perguntas` }}
          <v-icon
            icon="mdi-chevron-down"
            size="20"
            :class="['rg-faq__reveal-chevron', { 'is-flipped': showAll }]"
          />
        </button>
      </div>
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

/* Expand/collapse das respostas: delegado ao RgExpandTransition (altura real
   medida no DOM — sem o teto de max-height que cortava respostas longas). */

/* ============ Toolbar de busca ============ */
.rg-faq__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-4);
  /* Cola a toolbar na lista (o gap do __inner é 48px — exagerado aqui). */
  margin-bottom: calc(var(--rg-space-8) * -1);
}

.rg-faq__search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 520px;
}

.rg-faq__search-icon {
  position: absolute;
  left: var(--rg-space-4);
  color: var(--rg-color-text-muted);
  pointer-events: none;
}

.rg-faq__search-input {
  width: 100%;
  height: 48px;
  padding: 0 var(--rg-space-12) 0 var(--rg-space-12);
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-lg);
  font-family: inherit;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-primary);
  transition:
    border-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.rg-faq__search-input::placeholder {
  color: var(--rg-color-text-muted);
}

.rg-faq__search-input:hover {
  border-color: var(--rg-color-border-strong);
}

.rg-faq__search-input:focus {
  outline: none;
  border-color: var(--rg-primitive-brand-500);
  box-shadow: 0 0 0 3px rgba(39, 156, 80, 0.18);
}

/* Esconde o "x" nativo do input type=search — usamos o botão próprio. */
.rg-faq__search-input::-webkit-search-cancel-button {
  display: none;
}

.rg-faq__search-clear {
  position: absolute;
  right: var(--rg-space-3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: var(--rg-radius-pill);
  color: var(--rg-color-text-muted);
  cursor: pointer;
  transition:
    color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.rg-faq__search-clear:hover {
  color: var(--rg-color-text-primary);
  background-color: var(--rg-color-surface-subtle);
}

.rg-faq__search-clear:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 1px;
}

.rg-faq__count {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-muted);
  white-space: nowrap;
}

/* Label invisível do input (acessível a leitores de tela). */
.rg-faq__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Highlight dos matches da busca — verde clarinho da marca em vez do
   amarelo default de <mark>, herdando a cor do texto ao redor. */
.rg-faq__mark {
  background-color: var(--rg-primitive-brand-100);
  color: inherit;
  border-radius: 3px;
  padding: 0 1px;
}

/* ============ Empty state da busca ============ */
.rg-faq__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--rg-space-4);
  padding: var(--rg-space-12) var(--rg-space-6);
  text-align: center;
  border: 1px dashed var(--rg-color-border-base);
  border-radius: var(--rg-radius-xl);
}

.rg-faq__empty-icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
  opacity: 0.85;
}

.rg-faq__empty-text {
  margin: 0;
  font-size: var(--rg-font-size-md);
  color: var(--rg-color-text-secondary);
}

.rg-faq__empty-text strong {
  color: var(--rg-color-text-primary);
  font-weight: var(--rg-font-weight-semibold);
  overflow-wrap: anywhere;
}

.rg-faq__empty-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-3) var(--rg-space-5);
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-md);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  text-decoration: none;
  transition:
    background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-faq__empty-cta:hover {
  background-color: var(--rg-primitive-brand-50);
  border-color: var(--rg-primitive-brand-300);
}

.rg-faq__empty-cta :deep(.v-icon) {
  color: var(--rg-primitive-brand-600);
}

/* ============ Revelar mais ============ */
.rg-faq__reveal {
  display: flex;
  justify-content: center;
  /* Aproxima o botão da lista (compensa parte do gap de 48px do __inner). */
  margin-top: calc(var(--rg-space-6) * -1);
}

.rg-faq__reveal-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-3) var(--rg-space-6);
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-pill);
  font-family: inherit;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  cursor: pointer;
  transition:
    background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-faq__reveal-btn:hover {
  background-color: var(--rg-primitive-brand-50);
  border-color: var(--rg-primitive-brand-300);
  transform: translateY(-1px);
}

.rg-faq__reveal-btn:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.rg-faq__reveal-btn :deep(.v-icon) {
  color: var(--rg-primitive-brand-600);
}

.rg-faq__reveal-chevron {
  transition: transform var(--rg-motion-duration-slow) var(--rg-motion-ease-emphasized);
}

.rg-faq__reveal-chevron.is-flipped {
  transform: rotate(180deg);
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
  /* No mobile o card "Não encontrou sua dúvida?" ocupa a largura total
     da coluna pra ganhar peso visual — o limite 280px só faz sentido no
     desktop, onde ele divide espaço com os balões 3D à esquerda. */
  .rg-faq__contact {
    max-width: none;
  }
  /* Toolbar empilha: busca full-width em cima, contador embaixo. */
  .rg-faq__toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: var(--rg-space-2);
  }
  .rg-faq__search {
    max-width: none;
  }
  .rg-faq__count {
    text-align: right;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rg-faq__balloon,
  .rg-faq__reveal-chevron {
    transition: none !important;
  }
  .rg-faq__balloon {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
