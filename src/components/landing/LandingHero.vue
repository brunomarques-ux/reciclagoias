<script setup lang="ts">
import RgButton from '@/components/RgButton.vue';
import RgStatCard from '@/components/RgStatCard.vue';
import { dashboardStats, baseYear } from '@/data/mocks/landing';

const heroStats = dashboardStats.slice(0, 4);
</script>

<template>
  <section id="top" class="rg-hero" aria-labelledby="rg-hero-title">
    <div class="rg-hero__bg" aria-hidden="true">
      <div class="rg-hero__bg-grid" />
      <div class="rg-hero__bg-glow" />
    </div>

    <div class="rg-hero__inner">
      <div class="rg-hero__copy">
        <span class="rg-hero__eyebrow">
          <span class="rg-hero__eyebrow-dot" aria-hidden="true" />
          Governo de Goiás · Secretaria de Indústria e Comércio
        </span>

        <h1 id="rg-hero-title" class="rg-hero__title">
          Logística reversa de Goiás <span>com rastreabilidade</span> ponta a ponta.
        </h1>

        <p class="rg-hero__lede">
          O Recicla Goiás centraliza declarações, certificados e saldo de massa reciclável
          em uma plataforma única — para que empresas, entidades gestoras e o comitê acompanhem,
          validem e comprovem suas obrigações com clareza.
        </p>

        <div class="rg-hero__ctas">
          <RgButton variant="primary" size="lg" href="#acessar" icon-right="mdi-arrow-right">
            Acessar sistema
          </RgButton>
          <RgButton variant="outline" size="lg" href="#sobre" icon-right="mdi-chevron-down">
            Entender o processo
          </RgButton>
        </div>

        <dl class="rg-hero__inline-meta">
          <div>
            <dt>Ano-base</dt>
            <dd>{{ baseYear }}</dd>
          </div>
          <div>
            <dt>Empresas aderentes</dt>
            <dd>202.497</dd>
          </div>
          <div>
            <dt>Cumprimento médio</dt>
            <dd>92,4%</dd>
          </div>
        </dl>
      </div>

      <aside class="rg-hero__panel" aria-label="Prévia da plataforma">
        <header class="rg-hero__panel-header">
          <div>
            <span class="rg-hero__panel-eyebrow">Painel · ano-base {{ baseYear }}</span>
            <strong class="rg-hero__panel-title">Saldo de massa disponível</strong>
          </div>
          <span class="rg-hero__panel-badge">
            <span class="rg-hero__panel-badge-dot" aria-hidden="true" /> ao vivo
          </span>
        </header>

        <div class="rg-hero__panel-stats">
          <RgStatCard
            v-for="stat in heroStats"
            :key="stat.key"
            :label="stat.label"
            :value="stat.value"
            :unit="stat.unit"
            :icon="stat.icon"
            :tone="stat.tone"
            :delta="stat.delta"
            size="sm"
          />
        </div>

        <footer class="rg-hero__panel-footer">
          <div class="rg-hero__panel-progress" aria-hidden="true">
            <span :style="{ '--p': '92%' } as Record<string, string>" />
          </div>
          <div class="rg-hero__panel-progress-meta">
            <span>Progresso da obrigação</span>
            <strong>92% · 8 dias restantes</strong>
          </div>
        </footer>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.rg-hero {
  position: relative;
  isolation: isolate;
  padding: var(--rg-space-20) var(--rg-space-6) var(--rg-space-16);
  overflow: hidden;
}

.rg-hero__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(1200px 600px at 80% -10%, rgba(31, 131, 68, 0.10), transparent 60%),
    linear-gradient(180deg, var(--rg-primitive-brand-50) 0%, var(--rg-color-surface-base) 80%);
}
.rg-hero__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, black 35%, transparent 75%);
}
.rg-hero__bg-glow {
  position: absolute;
  top: -120px;
  right: -120px;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(31, 131, 68, 0.18), transparent 70%);
  filter: blur(40px);
}

.rg-hero__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 520px);
  gap: var(--rg-space-16);
  align-items: center;
}

.rg-hero__copy { display: flex; flex-direction: column; gap: var(--rg-space-6); }

.rg-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  align-self: flex-start;
  padding: var(--rg-space-1) var(--rg-space-3);
  background-color: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-secondary);
  letter-spacing: var(--rg-letter-spacing-wide);
}
.rg-hero__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-action-primary);
}

.rg-hero__title {
  margin: 0;
  font-size: clamp(36px, 5vw, 60px);
  line-height: 1.05;
  letter-spacing: var(--rg-letter-spacing-tight);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
}
.rg-hero__title span {
  color: var(--rg-color-text-brand);
}

.rg-hero__lede {
  margin: 0;
  max-width: 540px;
  font-size: var(--rg-font-size-lg);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.rg-hero__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--rg-space-3);
}

.rg-hero__inline-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--rg-space-5);
  margin: var(--rg-space-2) 0 0;
  padding-top: var(--rg-space-5);
  border-top: 1px solid var(--rg-color-border-subtle);
  max-width: 520px;
}
.rg-hero__inline-meta dt {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
}
.rg-hero__inline-meta dd {
  margin: 0;
  font-size: var(--rg-font-size-2xl);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
  letter-spacing: var(--rg-letter-spacing-tight);
}

.rg-hero__panel {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
  padding: var(--rg-space-6);
  background-color: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-2xl);
  box-shadow: var(--rg-elevation-3);
}

.rg-hero__panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rg-space-3);
}
.rg-hero__panel-eyebrow {
  display: block;
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
}
.rg-hero__panel-title {
  display: block;
  font-size: var(--rg-font-size-xl);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  letter-spacing: var(--rg-letter-spacing-tight);
  margin-top: 2px;
}
.rg-hero__panel-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-1);
  padding: 4px var(--rg-space-2);
  background-color: var(--rg-color-feedback-success-soft);
  color: var(--rg-color-feedback-success);
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
}
.rg-hero__panel-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--rg-radius-pill);
  background-color: currentColor;
  animation: rg-pulse 1.6s ease-in-out infinite;
}

.rg-hero__panel-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--rg-space-3);
}

.rg-hero__panel-footer {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  padding-top: var(--rg-space-4);
  border-top: 1px dashed var(--rg-color-border-subtle);
}
.rg-hero__panel-progress {
  position: relative;
  height: 8px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-surface-subtle);
  overflow: hidden;
}
.rg-hero__panel-progress span {
  display: block;
  width: var(--p, 0%);
  height: 100%;
  background: linear-gradient(90deg, var(--rg-primitive-brand-500), var(--rg-primitive-brand-700));
  border-radius: inherit;
  transition: width var(--rg-motion-duration-slower) var(--rg-motion-ease-emphasized);
}
.rg-hero__panel-progress-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-secondary);
}
.rg-hero__panel-progress-meta strong {
  color: var(--rg-color-text-primary);
  font-weight: var(--rg-font-weight-semibold);
}

@keyframes rg-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.85); }
}

@media (max-width: 1080px) {
  .rg-hero__inner {
    grid-template-columns: 1fr;
    gap: var(--rg-space-10);
  }
  .rg-hero__panel {
    max-width: 560px;
    margin-inline: auto;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .rg-hero {
    padding: var(--rg-space-12) var(--rg-space-4) var(--rg-space-10);
  }
  .rg-hero__inline-meta {
    grid-template-columns: 1fr 1fr;
    gap: var(--rg-space-3);
  }
  .rg-hero__inline-meta dd {
    font-size: var(--rg-font-size-xl);
  }
  .rg-hero__panel-stats {
    grid-template-columns: 1fr;
  }
}
</style>
