<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import RgButton from '@/components/RgButton.vue';

interface NavSection {
  id: string;
  label: string;
}

defineProps<{ sections: NavSection[] }>();

const scrolled = ref(false);
const overHero = ref(false);
const drawerOpen = ref(false);

let heroObserver: IntersectionObserver | null = null;

function onScroll() {
  scrolled.value = window.scrollY > 16;
}

onMounted(async () => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Esperar o próximo tick + um RAF para garantir que o hero já está montado no DOM.
  await nextTick();
  requestAnimationFrame(() => {
    const heroEl = document.querySelector('[data-rg-hero]');
    if (!heroEl) return;

    overHero.value = true;
    heroObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) overHero.value = entry.intersectionRatio > 0.3;
      },
      { threshold: [0, 0.3, 0.6, 1] },
    );
    heroObserver.observe(heroEl);
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  heroObserver?.disconnect();
});
</script>

<template>
  <header
    :class="[
      'rg-app-header',
      { 'rg-app-header--scrolled': scrolled, 'rg-app-header--over-hero': overHero && !scrolled },
    ]"
  >
    <div class="rg-app-header__inner">
      <a href="#top" class="rg-app-header__brand" aria-label="Recicla Goiás — início">
        <span class="rg-app-header__brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="28" height="28" role="img" aria-hidden="true">
            <path
              d="M16 2 L29 9.5 V22.5 L16 30 L3 22.5 V9.5 Z"
              fill="var(--rg-primitive-brand-600)"
            />
            <path
              d="M11 19 L15 12 L19 17 L23 11"
              fill="none"
              stroke="white"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="rg-app-header__brand-text">
          <strong>Recicla</strong>
          <em>Goiás</em>
        </span>
      </a>

      <nav class="rg-app-header__nav" aria-label="Principal">
        <a
          v-for="section in sections"
          :key="section.id"
          :href="`#${section.id}`"
          class="rg-app-header__link"
        >{{ section.label }}</a>
      </nav>

      <div class="rg-app-header__ctas">
        <RgButton variant="ghost" size="sm" href="#acessar">Cadastrar-se</RgButton>
        <RgButton variant="primary" size="sm" href="#acessar" icon-right="mdi-arrow-right">
          Acessar sistema
        </RgButton>
      </div>

      <button
        type="button"
        class="rg-app-header__menu-toggle"
        aria-label="Abrir menu"
        :aria-expanded="drawerOpen"
        @click="drawerOpen = true"
      >
        <v-icon icon="mdi-menu" size="24" />
      </button>
    </div>

    <v-navigation-drawer
      v-model="drawerOpen"
      temporary
      location="right"
      width="320"
    >
      <div class="rg-app-header__drawer">
        <nav class="rg-app-header__drawer-nav" aria-label="Mobile">
          <a
            v-for="section in sections"
            :key="section.id"
            :href="`#${section.id}`"
            class="rg-app-header__drawer-link"
            @click="drawerOpen = false"
          >
            {{ section.label }}
            <v-icon icon="mdi-chevron-right" size="18" />
          </a>
        </nav>

        <div class="rg-app-header__drawer-ctas">
          <RgButton variant="outline" block href="#acessar" @click="drawerOpen = false">
            Cadastrar-se
          </RgButton>
          <RgButton
            variant="primary"
            block
            href="#acessar"
            icon-right="mdi-arrow-right"
            @click="drawerOpen = false"
          >
            Acessar sistema
          </RgButton>
        </div>
      </div>
    </v-navigation-drawer>
  </header>
</template>

<style scoped>
.rg-app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(140%) blur(10px);
  border-bottom: 1px solid transparent;
  transition:
    background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-app-header--scrolled {
  background-color: rgba(255, 255, 255, 0.96);
  border-bottom-color: var(--rg-color-border-subtle);
  box-shadow: var(--rg-elevation-1);
}

.rg-app-header__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  padding: var(--rg-space-3) var(--rg-space-6);
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: var(--rg-space-6);
  align-items: center;
}

.rg-app-header__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
}
.rg-app-header__brand-mark {
  display: inline-flex;
}
.rg-app-header__brand-text {
  display: inline-flex;
  flex-direction: column;
  line-height: 1;
  font-family: var(--rg-font-family-sans);
}
.rg-app-header__brand-text strong {
  font-size: var(--rg-font-size-lg);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
  letter-spacing: var(--rg-letter-spacing-tight);
}
.rg-app-header__brand-text em {
  font-style: normal;
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-brand);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
}

.rg-app-header__nav {
  display: flex;
  gap: var(--rg-space-1);
  justify-self: center;
}

.rg-app-header__link {
  padding: var(--rg-space-2) var(--rg-space-3);
  border-radius: var(--rg-radius-md);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
  transition: color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
              background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}
.rg-app-header__link:hover {
  color: var(--rg-color-text-primary);
  background-color: var(--rg-color-surface-muted);
}

.rg-app-header__ctas {
  display: flex;
  gap: var(--rg-space-2);
  align-items: center;
}

.rg-app-header__menu-toggle {
  display: none;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-md);
  color: var(--rg-color-text-primary);
  cursor: pointer;
}

.rg-app-header__drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--rg-space-6) var(--rg-space-5);
  gap: var(--rg-space-5);
}
.rg-app-header__drawer-nav {
  display: flex;
  flex-direction: column;
}
.rg-app-header__drawer-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--rg-space-4) 0;
  border-bottom: 1px solid var(--rg-color-border-subtle);
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-primary);
}
.rg-app-header__drawer-ctas {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  margin-top: auto;
}

@media (max-width: 960px) {
  .rg-app-header__inner {
    grid-template-columns: auto 1fr auto;
    gap: var(--rg-space-3);
  }
  .rg-app-header__nav,
  .rg-app-header__ctas {
    display: none;
  }
  .rg-app-header__menu-toggle {
    display: inline-flex;
  }
}

/* ---------- Modo "over hero" (background escuro/vídeo) ---------- */
.rg-app-header--over-hero {
  background-color: transparent;
  backdrop-filter: none;
  border-bottom-color: transparent;
  box-shadow: none;
}

.rg-app-header--over-hero .rg-app-header__brand-text strong {
  color: white;
}
.rg-app-header--over-hero .rg-app-header__brand-text em {
  color: var(--rg-primitive-brand-200);
}

.rg-app-header--over-hero .rg-app-header__link {
  color: rgba(255, 255, 255, 0.82);
}
.rg-app-header--over-hero .rg-app-header__link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.rg-app-header--over-hero .rg-app-header__menu-toggle {
  color: white;
  border-color: rgba(255, 255, 255, 0.25);
  background-color: rgba(255, 255, 255, 0.06);
}

/* Ghost button "Cadastrar-se" muda para branco sobre fundo escuro */
.rg-app-header--over-hero :deep(.rg-button--ghost) {
  color: rgba(255, 255, 255, 0.88) !important;
}
.rg-app-header--over-hero :deep(.rg-button--ghost:hover) {
  background-color: rgba(255, 255, 255, 0.12) !important;
  color: white !important;
}
</style>
