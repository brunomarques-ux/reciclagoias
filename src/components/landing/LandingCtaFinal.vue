<script setup lang="ts">
import RgButton from '@/components/RgButton.vue';
</script>

<template>
  <section id="acessar" class="rg-cta" aria-labelledby="rg-cta-title">
    <div class="rg-cta__inner">
      <div class="rg-cta__copy">
        <span class="rg-cta__eyebrow">Acesso à plataforma</span>
        <h2 id="rg-cta-title" class="rg-cta__title">
          Pronto para acompanhar a logística reversa da sua empresa em um só lugar?
        </h2>
        <p class="rg-cta__lede">
          Solicite acesso, escolha o perfil correto e comece a operar o Recicla Goiás
          com rastreabilidade real e suporte do comitê gestor.
        </p>
      </div>

      <div class="rg-cta__actions">
        <RgButton variant="primary" size="lg" href="#" icon-right="mdi-arrow-right">
          Acessar sistema
        </RgButton>
        <RgButton variant="outline" size="lg" href="#" icon="mdi-help-circle-outline">
          Falar com a equipe
        </RgButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rg-cta {
  padding: var(--rg-space-20) var(--rg-space-6);
  background:
    radial-gradient(800px 400px at 80% 20%, rgba(31, 131, 68, 0.45), transparent 70%),
    linear-gradient(135deg, var(--rg-primitive-brand-900), var(--rg-primitive-brand-800));
  color: var(--rg-color-text-on-inverse);
}

.rg-cta__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) auto;
  gap: var(--rg-space-12);
  align-items: center;
}

.rg-cta__copy {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.rg-cta__eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-primitive-brand-200);
}

.rg-cta__title {
  margin: 0;
  font-size: clamp(28px, 3.5vw, 44px);
  line-height: var(--rg-line-height-tight);
  letter-spacing: var(--rg-letter-spacing-tight);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-on-inverse);
}

.rg-cta__lede {
  margin: 0;
  font-size: var(--rg-font-size-lg);
  line-height: var(--rg-line-height-relaxed);
  color: rgba(255, 255, 255, 0.82);
  max-width: 600px;
}

.rg-cta__actions {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  min-width: 220px;
}

/* O botão outline na superfície escura: ajustes contextuais. */
.rg-cta__actions :deep(.rg-button--outline) {
  background-color: rgba(255, 255, 255, 0.06) !important;
  color: var(--rg-color-text-on-inverse) !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.32);
}
.rg-cta__actions :deep(.rg-button--outline:hover) {
  background-color: rgba(255, 255, 255, 0.12) !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

@media (max-width: 960px) {
  .rg-cta__inner {
    grid-template-columns: 1fr;
    gap: var(--rg-space-8);
  }
  .rg-cta__actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
@media (max-width: 640px) {
  .rg-cta { padding: var(--rg-space-14) var(--rg-space-4); }
  .rg-cta__actions { flex-direction: column; }
}
</style>
