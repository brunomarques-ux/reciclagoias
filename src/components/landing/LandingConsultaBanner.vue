<script setup lang="ts">
/**
 * Banner "Consulta de Regularidade" na home.
 *
 * Card verde (brand-600) com ícone + eyebrow + título + subtítulo e um botão
 * branco que leva pra /consulta. Fica logo depois do Enquadramento: quem acabou
 * de descobrir que precisa aderir tem, na sequência, o atalho pra consultar a
 * situação de um CNPJ.
 *
 * Entrada: reveal-on-scroll (mesmo padrão das seções Perfis/Enquadramento) —
 * IntersectionObserver marca .is-visible e os elementos do card sobem em
 * cascata (delay por --d). Respeita prefers-reduced-motion.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue';

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
    { threshold: 0.3 },
  );
  observer.observe(sectionRef.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <section
    ref="sectionRef"
    :class="['rg-cbanner', { 'is-visible': isVisible }]"
    aria-labelledby="rg-cbanner-title"
  >
    <div class="rg-cbanner__inner">
      <div class="rg-cbanner__card">
        <!-- Brilho decorativo (não semântico) -->
        <span class="rg-cbanner__glow" aria-hidden="true" />

        <div class="rg-cbanner__content">
          <span class="rg-cbanner__icon" aria-hidden="true">
            <v-icon icon="mdi-magnify" size="28" />
          </span>

          <div class="rg-cbanner__text">
            <span class="rg-cbanner__eyebrow">CONSULTA PÚBLICA</span>
            <h2 id="rg-cbanner-title" class="rg-cbanner__title">
              Consulte a regularidade da sua empresa
            </h2>
            <p class="rg-cbanner__subtitle">
              Veja em segundos se um CNPJ está regular perante o Recicla Goiás
              e emita o comprovante oficial.
            </p>
          </div>
        </div>

        <RouterLink to="/consulta" class="rg-cbanner__cta">
          Consultar regularidade
          <v-icon icon="mdi-arrow-right" size="20" aria-hidden="true" />
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rg-cbanner {
  /* Fundo tint (mesma família do Enquadramento) pra separar do bloco anterior */
  padding: var(--rg-space-16) var(--rg-space-6);
  background-color: var(--rg-color-surface-soft-tint);
}

.rg-cbanner__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
}

/* ============ Card verde ============ */
.rg-cbanner__card {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-8);
  padding: var(--rg-space-10) var(--rg-space-12);
  border-radius: var(--rg-radius-3xl);
  background: linear-gradient(
    135deg,
    var(--rg-primitive-brand-600) 0%,
    var(--rg-primitive-brand-700) 100%
  );
  box-shadow: var(--rg-elevation-3);
  /* Entrada: sobe com fade */
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 700ms var(--rg-motion-ease-standard),
    transform 700ms var(--rg-motion-ease-standard);
}

.rg-cbanner.is-visible .rg-cbanner__card {
  opacity: 1;
  transform: translateY(0);
}

.rg-cbanner__glow {
  position: absolute;
  top: -40%;
  right: -6%;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 70%);
  pointer-events: none;
}

.rg-cbanner__content {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--rg-space-6);
  min-width: 0;
}

.rg-cbanner__icon {
  flex: none;
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  border-radius: var(--rg-radius-xl);
  background-color: rgba(255, 255, 255, 0.14);
  color: var(--rg-primitive-neutral-0);
}

/* Cascata dos textos: cada elemento sobe com um pequeno atraso (--d) */
.rg-cbanner__eyebrow,
.rg-cbanner__title,
.rg-cbanner__subtitle,
.rg-cbanner__cta {
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 600ms var(--rg-motion-ease-standard),
    transform 600ms var(--rg-motion-ease-standard);
  transition-delay: var(--d, 0ms);
}

.rg-cbanner.is-visible .rg-cbanner__eyebrow,
.rg-cbanner.is-visible .rg-cbanner__title,
.rg-cbanner.is-visible .rg-cbanner__subtitle,
.rg-cbanner.is-visible .rg-cbanner__cta {
  opacity: 1;
  transform: translateY(0);
}

.rg-cbanner__eyebrow { --d: 140ms; }
.rg-cbanner__title { --d: 220ms; }
.rg-cbanner__subtitle { --d: 300ms; }
.rg-cbanner__cta { --d: 380ms; }

.rg-cbanner__text {
  min-width: 0;
}

.rg-cbanner__eyebrow {
  display: inline-block;
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  color: rgba(255, 255, 255, 0.82);
}

.rg-cbanner__title {
  margin: var(--rg-space-2) 0 0;
  font-size: clamp(24px, 2.6vw, 30px);
  line-height: 1.15;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-primitive-neutral-0);
}

.rg-cbanner__subtitle {
  margin: var(--rg-space-3) 0 0;
  max-width: 46ch;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: rgba(255, 255, 255, 0.9);
}

/* ============ CTA branco ============ */
.rg-cbanner__cta {
  position: relative;
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  height: 52px;
  padding-inline: var(--rg-space-7);
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-primitive-neutral-0);
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-primitive-brand-700);
  text-decoration: none;
  white-space: nowrap;
  transition:
    transform var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.rg-cbanner__cta:hover {
  box-shadow: var(--rg-elevation-2);
  transform: translateY(-1px);
}

.rg-cbanner__cta:active {
  transform: translateY(0);
}

.rg-cbanner__cta:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.55);
}

.rg-cbanner__cta .v-icon {
  transition: transform var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.rg-cbanner__cta:hover .v-icon {
  transform: translateX(3px);
}

/* ============ Responsivo ============ */
@media (max-width: 860px) {
  .rg-cbanner__card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--rg-space-7);
    padding: var(--rg-space-8);
  }

  .rg-cbanner__cta {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 560px) {
  .rg-cbanner__content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--rg-space-4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rg-cbanner__card,
  .rg-cbanner__eyebrow,
  .rg-cbanner__title,
  .rg-cbanner__subtitle,
  .rg-cbanner__cta {
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
