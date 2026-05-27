<script setup lang="ts">
import RgSectionHeader from '@/components/RgSectionHeader.vue';
import RgFeatureCard from '@/components/RgFeatureCard.vue';
import { benefits } from '@/data/mocks/landing';
</script>

<template>
  <section class="rg-benefits" aria-labelledby="rg-benefits-title">
    <div class="rg-benefits__inner">
      <RgSectionHeader
        eyebrow="Benefícios"
        title="Por que centralizar a logística reversa importa."
        description="Cada perfil ganha o que precisa: empresas perdem menos tempo, verificadores ganham consistência e a administração estadual ganha visão de conjunto."
      />

      <div class="rg-benefits__grid">
        <RgFeatureCard
          v-for="benefit in benefits"
          :key="benefit.title"
          :title="benefit.title"
          :description="benefit.description"
          :icon="benefit.icon"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.rg-benefits {
  padding: var(--rg-space-20) var(--rg-space-6);
  background-color: var(--rg-color-surface-base);
}

.rg-benefits__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-12);
}

.rg-benefits__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--rg-space-4);
}

@media (max-width: 960px) {
  .rg-benefits__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .rg-benefits { padding: var(--rg-space-14) var(--rg-space-4); }
  .rg-benefits__grid { grid-template-columns: 1fr; }
}
</style>
