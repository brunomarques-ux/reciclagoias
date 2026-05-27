<script setup lang="ts">
import RgSectionHeader from '@/components/RgSectionHeader.vue';
import {
  systemFeatures,
  systemDescription,
  systemStatusNote,
} from '@/data/mocks/landing';
</script>

<template>
  <section id="sistema" class="rg-sistema" aria-labelledby="rg-sistema-title">
    <div class="rg-sistema__inner">
      <RgSectionHeader
        align="center"
        eyebrow="Sistema Recicla Goiás"
        title="Uma plataforma única para toda a cadeia da logística reversa."
      />

      <div class="rg-sistema__grid">
        <article
          v-for="feature in systemFeatures"
          :key="feature.title"
          class="rg-sistema__card"
        >
          <span class="rg-sistema__card-icon" aria-hidden="true">
            <v-icon :icon="feature.icon" size="24" />
          </span>
          <h3 class="rg-sistema__card-title">{{ feature.title }}</h3>
          <p class="rg-sistema__card-desc">{{ feature.description }}</p>
        </article>
      </div>

      <div class="rg-sistema__copy">
        <p v-for="(p, i) in systemDescription" :key="i" class="rg-sistema__p">
          {{ p }}
        </p>
        <p class="rg-sistema__status">
          <span class="rg-sistema__status-dot" aria-hidden="true" />
          {{ systemStatusNote }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rg-sistema {
  position: relative;
  padding: var(--rg-space-20) var(--rg-space-6);
  background:
    linear-gradient(180deg,
      var(--rg-color-surface-base) 0%,
      var(--rg-color-surface-muted) 100%);
}

.rg-sistema__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-10);
}

.rg-sistema__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--rg-space-4);
}

.rg-sistema__card {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  padding: var(--rg-space-6);
  background-color: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-xl);
  text-align: center;
  align-items: center;
  transition:
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-sistema__card:hover {
  transform: translateY(-3px);
  box-shadow: var(--rg-elevation-3);
  border-color: var(--rg-color-border-brand);
}

.rg-sistema__card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--rg-radius-pill);
  background: linear-gradient(135deg, var(--rg-primitive-brand-50), var(--rg-primitive-brand-100));
  color: var(--rg-color-action-primary);
}

.rg-sistema__card-title {
  margin: 0;
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  letter-spacing: var(--rg-letter-spacing-tight);
}

.rg-sistema__card-desc {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.rg-sistema__copy {
  max-width: 800px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  padding: var(--rg-space-8);
  background-color: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-xl);
  text-align: left;
}

.rg-sistema__p {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.rg-sistema__status {
  margin: var(--rg-space-2) 0 0;
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding-top: var(--rg-space-3);
  border-top: 1px dashed var(--rg-color-border-subtle);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-feedback-success);
}

.rg-sistema__status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-feedback-success);
  box-shadow: 0 0 8px rgba(31, 131, 68, 0.4);
  animation: rg-pulse-dot 1.8s ease-in-out infinite;
}

@keyframes rg-pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.7); }
}

@media (max-width: 960px) {
  .rg-sistema__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 600px) {
  .rg-sistema { padding: var(--rg-space-14) var(--rg-space-4); }
  .rg-sistema__grid { grid-template-columns: 1fr; }
  .rg-sistema__copy { padding: var(--rg-space-5); }
}
</style>
