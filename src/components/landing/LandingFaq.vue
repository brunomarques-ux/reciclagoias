<script setup lang="ts">
import { ref } from 'vue';
import RgSectionHeader from '@/components/RgSectionHeader.vue';
import { faqItems } from '@/data/mocks/landing';

const expanded = ref<number[]>([0]);
</script>

<template>
  <section class="rg-faq" aria-labelledby="rg-faq-title">
    <div class="rg-faq__inner">
      <RgSectionHeader
        eyebrow="Perguntas frequentes"
        title="Dúvidas comuns de operadores, entidades e verificadores."
        description="Se a sua dúvida não estiver listada, fale com a equipe do Recicla Goiás pelos canais institucionais no rodapé."
      />

      <v-expansion-panels
        v-model="expanded"
        multiple
        variant="accordion"
        class="rg-faq__panels"
      >
        <v-expansion-panel
          v-for="(item, index) in faqItems"
          :key="index"
          :value="index"
          class="rg-faq__panel"
        >
          <v-expansion-panel-title class="rg-faq__title">
            <span class="rg-faq__title-text">{{ item.question }}</span>
            <template #actions="{ expanded: isExpanded }">
              <v-icon :icon="isExpanded ? 'mdi-minus' : 'mdi-plus'" size="20" />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text class="rg-faq__text">
            {{ item.answer }}
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </section>
</template>

<style scoped>
.rg-faq {
  padding: var(--rg-space-20) var(--rg-space-6);
  background-color: var(--rg-color-surface-muted);
}
.rg-faq__inner {
  max-width: 920px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-10);
}

.rg-faq__panels {
  border-radius: var(--rg-radius-xl);
  background-color: transparent;
}

:deep(.rg-faq__panel) {
  margin-bottom: var(--rg-space-3);
  background-color: var(--rg-color-surface-raised) !important;
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg) !important;
  overflow: hidden;
}
:deep(.rg-faq__panel.v-expansion-panel--active) {
  border-color: var(--rg-color-border-brand);
  box-shadow: var(--rg-elevation-1);
}

:deep(.rg-faq__title) {
  padding: var(--rg-space-4) var(--rg-space-5);
  min-height: 64px;
}
:deep(.rg-faq__title-text) {
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  letter-spacing: var(--rg-letter-spacing-tight);
}
:deep(.rg-faq__text .v-expansion-panel-text__wrapper) {
  padding: 0 var(--rg-space-5) var(--rg-space-5);
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

@media (max-width: 640px) {
  .rg-faq { padding: var(--rg-space-14) var(--rg-space-4); }
}
</style>
