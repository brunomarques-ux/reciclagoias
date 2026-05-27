<script setup lang="ts">
import RgSectionHeader from '@/components/RgSectionHeader.vue';
import RgFeatureCard from '@/components/RgFeatureCard.vue';
import { processSteps } from '@/data/mocks/landing';
</script>

<template>
  <section class="rg-how" aria-labelledby="rg-how-title">
    <div class="rg-how__inner">
      <RgSectionHeader
        align="center"
        eyebrow="Como funciona"
        title="Do ano-base à regularidade, em seis etapas claras."
        description="O processo segue uma cadência previsível, com responsabilidades definidas para cada perfil de usuário. Nenhuma etapa depende de planilhas externas."
      />

      <div class="rg-how__grid">
        <RgFeatureCard
          v-for="step in processSteps"
          :key="step.number"
          :index="step.number"
          :title="step.title"
          :description="step.description"
          :icon="step.icon"
          variant="numbered"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.rg-how {
  padding: var(--rg-space-20) var(--rg-space-6);
  background-color: var(--rg-color-surface-muted);
}

.rg-how__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-12);
}

.rg-how__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--rg-space-4);
}

@media (max-width: 960px) {
  .rg-how__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .rg-how { padding: var(--rg-space-14) var(--rg-space-4); }
  .rg-how__grid { grid-template-columns: 1fr; }
}
</style>
