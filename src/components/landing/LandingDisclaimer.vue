<script setup lang="ts">
import { autoDeclaration } from '@/data/mocks/landing';
</script>

<template>
  <aside class="rg-disclaimer" :aria-label="autoDeclaration.title">
    <div class="rg-disclaimer__inner">
      <div class="rg-disclaimer__copy">
        <span class="rg-disclaimer__badge">
          <span class="rg-disclaimer__badge-dot" aria-hidden="true" />
          {{ autoDeclaration.badge }}
        </span>
        <h3 class="rg-disclaimer__title">{{ autoDeclaration.title }}</h3>
        <p class="rg-disclaimer__desc">{{ autoDeclaration.description }}</p>
      </div>
      <a :href="autoDeclaration.ctaHref" class="rg-disclaimer__cta">
        {{ autoDeclaration.ctaLabel }}
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M5 12h14m0 0-5-5m5 5-5 5"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </a>
    </div>
  </aside>
</template>

<style scoped>
.rg-disclaimer {
  position: relative;
  isolation: isolate;
  /* Gradient diagonal sutil brand-900 → brand-800 com glow brand-700 no canto. */
  background:
    radial-gradient(900px 360px at 85% 50%, rgba(31, 131, 68, 0.25), transparent 60%),
    radial-gradient(700px 280px at 10% 50%, rgba(23, 105, 53, 0.18), transparent 70%),
    linear-gradient(135deg, var(--rg-primitive-brand-900) 0%, var(--rg-primitive-brand-800) 55%, var(--rg-primitive-brand-900) 100%);
  padding-block: var(--rg-space-8);
  padding-inline: var(--rg-space-6);
  color: white;
}

.rg-disclaimer__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: var(--rg-space-6);
  padding: var(--rg-space-4) var(--rg-space-5);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--rg-radius-xl);
  backdrop-filter: blur(8px);
}

.rg-disclaimer__copy {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
}

.rg-disclaimer__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  align-self: flex-start;
  padding: 2px var(--rg-space-2);
  background-color: rgba(255, 230, 150, 0.18);
  border: 1px solid rgba(255, 230, 150, 0.4);
  border-radius: var(--rg-radius-pill);
  font-size: 11px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: #FCD34D;
}

.rg-disclaimer__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--rg-radius-pill);
  background-color: #FCD34D;
  box-shadow: 0 0 8px rgba(252, 211, 77, 0.6);
}

.rg-disclaimer__title {
  margin: 0;
  font-size: var(--rg-font-size-lg);
  font-weight: var(--rg-font-weight-semibold);
  color: white;
  letter-spacing: var(--rg-letter-spacing-tight);
}

.rg-disclaimer__desc {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-base);
  color: rgba(255, 255, 255, 0.74);
}

.rg-disclaimer__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-4);
  background-color: white;
  color: var(--rg-primitive-brand-800);
  border-radius: var(--rg-radius-lg);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  text-decoration: none;
  white-space: nowrap;
  transition:
    transform var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.rg-disclaimer__cta:hover {
  background-color: var(--rg-primitive-brand-50);
  transform: translateY(-1px);
}

@media (max-width: 720px) {
  .rg-disclaimer__inner {
    grid-template-columns: 1fr;
  }
  .rg-disclaimer__cta {
    align-self: stretch;
    justify-content: center;
  }
}
</style>
