<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const highlights = [
  {
    icon: '/premio/medal-icon.png',
    title: 'Melhor Projeto do ano',
    sub: 'Reconhecimento PMI Goiás 2025',
  },
  {
    icon: '/premio/people-icon.png',
    title: 'Time multidisciplinar',
    sub: 'GETI/SIC + CLR/SIC',
  },
  {
    icon: '/premio/calendar-icon.png',
    title: '18º Seminário',
    sub: 'Em Gestão, Projetos e Liderança',
  },
];

/** Metadados oficiais da premiação extraídos do certificado e do site
 *  institucional do PMI Goiás. */
const awardMeta = [
  { label: 'Categoria', value: 'Projeto' },
  { label: 'Edição', value: '2025 · 18º Seminário' },
  { label: 'Cidade', value: 'Goiânia, GO' },
  { label: 'Outorga', value: 'GETI/SIC + CLR/SIC' },
];

// ============ Reveal-on-enter dos 3 highlights ============
// Quando a section entra no viewport, os 3 highlights da direita entram em
// sequência (fade-in + translateX da esquerda pra direita), com stagger 240ms.
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
      const entry = entries[0];
      if (entry?.isIntersecting) {
        isVisible.value = true;
        observer?.disconnect();
      }
    },
    { threshold: 0.3 },
  );
  observer.observe(sectionRef.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <section
    id="premio"
    ref="sectionRef"
    :class="['rg-premio', { 'is-visible': isVisible }]"
    aria-labelledby="rg-premio-title"
  >
    <div class="rg-premio__inner">
      <!-- Header: copy à esquerda + highlights à direita -->
      <header class="rg-premio__header">
        <div class="rg-premio__copy">
          <span class="rg-premio__eyebrow">RECONHECIMENTO</span>
          <h2 id="rg-premio-title" class="rg-premio__title">
            <span class="rg-premio__title-line">
              Melhor Projeto
              <img
                src="/premio/trophy-icon.png"
                alt=""
                aria-hidden="true"
                class="rg-premio__trophy"
              />
              de 2025
            </span>
            <span class="rg-premio__title-line rg-premio__title-brand">
              PMI Goiás 2025
            </span>
          </h2>
          <p class="rg-premio__desc">
            O Projeto Recicla Goiás foi reconhecido como Melhor Projeto pelo
            Project Management Institute Goiás durante o 18º Seminário Em Gestão,
            Projetos e Liderança.
          </p>
        </div>

        <ul class="rg-premio__highlights" role="list">
          <li
            v-for="(h, i) in highlights"
            :key="h.title"
            class="rg-premio__highlight"
            :style="{ '--rg-h-i': i } as Record<string, string | number>"
          >
            <span class="rg-premio__highlight-icon-wrap" aria-hidden="true">
              <img :src="h.icon" alt="" class="rg-premio__highlight-icon" />
            </span>
            <div class="rg-premio__highlight-body">
              <strong class="rg-premio__highlight-title">{{ h.title }}</strong>
              <span class="rg-premio__highlight-sub">{{ h.sub }}</span>
            </div>
          </li>
        </ul>
      </header>

      <!-- Showcase: logo PMI Goiás à esquerda + bloco descritivo à direita.
           Substitui o certificado em destaque conforme decisão dos stakeholders
           (foco institucional na entidade outorgante em vez do documento). -->
      <div class="rg-premio__showcase">
        <!-- Card branco com a logo PMI Goiás centralizada e fita de destaque -->
        <a
          class="rg-premio__pmi-card"
          href="https://pmigo.org.br/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conhecer o PMI Goiás · abre em nova aba"
        >
          <!-- Logo PMI Goiás (PNG oficial fornecido pelo stakeholder). -->
          <img
            src="/premio/pmi-goias-logo.png"
            alt="Logo PMI Goiás · Project Management Institute Goiás, Brazil"
            class="rg-premio__pmi-logo"
            loading="lazy"
          />
          <span class="rg-premio__ribbon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path d="M12 2 15 8l6.5.9-4.7 4.6 1.1 6.6L12 17l-5.9 3.1L7.2 13.5 2.5 8.9 9 8z" fill="#78350F" />
            </svg>
            MELHOR PROJETO 2025
          </span>
        </a>

        <!-- Bloco descritivo: institucional + meta da premiação -->
        <div class="rg-premio__info">
          <h3 class="rg-premio__info-title">Sobre o reconhecimento</h3>
          <p class="rg-premio__info-text">
            O <strong>Project Management Institute · PMI Goiás</strong> é o capítulo regional
            do PMI no estado, dedicado a promover a excelência em gerenciamento de projetos
            no setor público e privado. A categoria <strong>Melhor Projeto</strong> reconhece
            iniciativas com impacto público mensurável, governança sólida e resultados
            entregues dentro do escopo, prazo e custo definidos.
          </p>
          <p class="rg-premio__info-text">
            O <strong>Projeto Recicla Goiás</strong> foi laureado durante o 18º Seminário
            Em Gestão, Projetos e Liderança, em Goiânia.
          </p>

          <dl class="rg-premio__meta">
            <div
              v-for="m in awardMeta"
              :key="m.label"
              class="rg-premio__meta-item"
            >
              <dt class="rg-premio__meta-label">{{ m.label }}</dt>
              <dd class="rg-premio__meta-value">{{ m.value }}</dd>
            </div>
          </dl>

          <a class="rg-premio__cta" href="https://pmigo.org.br/" target="_blank" rel="noopener noreferrer">
            <v-icon icon="mdi-open-in-new" size="16" />
            Conhecer o PMI Goiás
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rg-premio {
  position: relative;
  /* Padding vertical 96px — 16px a mais pra respiro entre seções. */
  padding: var(--rg-space-24) var(--rg-space-6);
  background-color: var(--rg-color-surface-base);
}

.rg-premio__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-12);
}

/* ============ Header ============ */
.rg-premio__header {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(360px, 1fr);
  /* Stretch garante que ambas as colunas ocupem a mesma altura,
     igualando o bloco de texto à pilha de highlights da direita. */
  align-items: stretch;
  gap: var(--rg-space-16);
}

.rg-premio__copy {
  display: flex;
  flex-direction: column;
  /* space-between distribui eyebrow, título e descrição verticalmente,
     preenchendo toda a altura (igual ao Figma). */
  justify-content: space-between;
  gap: var(--rg-space-4);
}

.rg-premio__eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-brand);
}

.rg-premio__title {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
  font-size: 48px;
  line-height: 1.05;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

.rg-premio__title-line {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: var(--rg-space-3);
  white-space: nowrap;
}

.rg-premio__title-brand {
  color: var(--rg-primitive-brand-700);
}

.rg-premio__trophy {
  width: 56px;
  height: 56px;
  object-fit: contain;
  flex: none;
  display: inline-block;
  vertical-align: middle;
}

.rg-premio__desc {
  margin: var(--rg-space-2) 0 0;
  max-width: 60ch;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

/* ============ Highlights ============ */
.rg-premio__highlights {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.rg-premio__highlight {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--rg-space-3);
  align-items: center;
  padding: var(--rg-space-4) var(--rg-space-5);
  background-color: var(--rg-color-surface-base);
  border-radius: var(--rg-radius-xl);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 6px 18px rgba(15, 23, 42, 0.06);
  /* Estado inicial: invisível e deslocado pra esquerda. Quando a section
     fica visível (is-visible), cada highlight entra com fade + translateX
     em sequência (stagger de 240ms baseado no --rg-h-i index). */
  opacity: 0;
  transform: translateX(-32px);
  transition:
    opacity 540ms cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 540ms cubic-bezier(0.2, 0.8, 0.2, 1);
  transition-delay: calc(var(--rg-h-i, 0) * 240ms);
}

.rg-premio.is-visible .rg-premio__highlight {
  opacity: 1;
  transform: translateX(0);
}

@media (prefers-reduced-motion: reduce) {
  .rg-premio__highlight {
    transition: none !important;
  }
}

/* Wrapper retangular do ícone (igual ao Figma):
   verde clarinho com stroke verde e cantos arredondados. */
.rg-premio__highlight-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-primitive-brand-50);
  border: 1px solid var(--rg-primitive-brand-200);
  flex: none;
}

.rg-premio__highlight-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  display: block;
}

.rg-premio__highlight-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rg-premio__highlight-title {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
}

.rg-premio__highlight-sub {
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
  line-height: var(--rg-line-height-snug);
}

/* ============ Showcase: logo PMI + bloco descritivo ============ */
.rg-premio__showcase {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: var(--rg-space-10);
  align-items: stretch;
}

/* Card branco com a logo PMI Goiás centralizada e fita "Melhor Projeto" */
.rg-premio__pmi-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--rg-space-12);
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-2xl);
  text-decoration: none;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 32px rgba(15, 23, 42, 0.06);
  transition:
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-premio__pmi-card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 2px 4px rgba(15, 23, 42, 0.06),
    0 20px 44px rgba(15, 23, 42, 0.10);
}

.rg-premio__pmi-card:focus-visible {
  outline: 3px solid var(--rg-color-action-primary);
  outline-offset: 4px;
}

.rg-premio__pmi-logo {
  display: block;
  width: 100%;
  max-width: 360px;
  height: auto;
  object-fit: contain;
}

.rg-premio__ribbon {
  position: absolute;
  top: var(--rg-space-4);
  right: var(--rg-space-4);
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-3);
  background: linear-gradient(135deg, #FCD34D, #F59E0B);
  color: #78350F;
  border-radius: var(--rg-radius-pill);
  font-size: 11px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.32);
  pointer-events: none;
}

/* Bloco descritivo à direita: subtítulo + 2 parágrafos + metadata + CTA */
.rg-premio__info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--rg-space-4);
}

.rg-premio__info-title {
  margin: 0;
  font-size: var(--rg-font-size-2xl);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
  letter-spacing: var(--rg-letter-spacing-tight);
}

.rg-premio__info-text {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.rg-premio__info-text strong {
  color: var(--rg-color-text-primary);
  font-weight: var(--rg-font-weight-semibold);
}

/* Metadata em grid 2x2 ou 4x1 — categoria, edição, cidade, outorga. */
.rg-premio__meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--rg-space-3) var(--rg-space-6);
  margin: var(--rg-space-3) 0 0;
  padding: var(--rg-space-4) var(--rg-space-5);
  background-color: var(--rg-primitive-brand-50);
  border-radius: var(--rg-radius-lg);
  border-left: 3px solid var(--rg-primitive-brand-500);
}

.rg-premio__meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.rg-premio__meta-label {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-primitive-brand-700);
}

.rg-premio__meta-value {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  line-height: var(--rg-line-height-snug);
}

/* CTA "Conhecer o PMI Goiás" */
.rg-premio__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  align-self: flex-start;
  margin-top: var(--rg-space-2);
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

.rg-premio__cta:hover {
  background-color: var(--rg-primitive-brand-50);
  border-color: var(--rg-primitive-brand-300);
}

.rg-premio__cta :deep(.v-icon) {
  color: var(--rg-primitive-brand-600);
}

/* ============ Responsivo ============ */
@media (max-width: 960px) {
  .rg-premio__header {
    grid-template-columns: 1fr;
    gap: var(--rg-space-8);
  }
  .rg-premio__title { font-size: clamp(32px, 6vw, 44px); }
  .rg-premio__title-line {
    flex-wrap: wrap;
    white-space: normal;
  }
  .rg-premio__trophy {
    width: 40px;
    height: 40px;
  }
  /* Showcase empilha em 1 coluna no mobile/tablet — card PMI em cima,
     bloco descritivo embaixo. */
  .rg-premio__showcase {
    grid-template-columns: 1fr;
  }
  .rg-premio__pmi-card {
    padding: var(--rg-space-8);
  }
  .rg-premio__pmi-logo {
    max-width: 280px;
  }
}

@media (max-width: 640px) {
  .rg-premio {
    padding: var(--rg-space-14) var(--rg-space-4);
  }
  .rg-premio__meta {
    grid-template-columns: 1fr;
  }
}
</style>
