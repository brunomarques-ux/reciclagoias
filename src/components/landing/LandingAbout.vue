<script setup lang="ts">
import RgSectionHeader from '@/components/RgSectionHeader.vue';
</script>

<template>
  <section class="rg-about" aria-labelledby="rg-about-title">
    <div class="rg-about__inner">
      <RgSectionHeader
        eyebrow="O que é"
        title="Logística reversa, organizada para quem precisa comprovar."
        description="A logística reversa é o caminho de volta dos materiais recicláveis até a indústria de transformação. O Recicla Goiás organiza esse fluxo — do cadastro da nota fiscal até a regularidade emitida — para que todas as partes envolvidas tenham o mesmo registro."
      />

      <ul class="rg-about__list">
        <li>
          <span class="rg-about__list-icon" aria-hidden="true">
            <v-icon icon="mdi-database-check-outline" size="20" />
          </span>
          <div>
            <strong>Cadastro único</strong>
            <span>Empresas e operadores logísticos cadastrados uma única vez, com dados sincronizados via CNPJ.</span>
          </div>
        </li>
        <li>
          <span class="rg-about__list-icon" aria-hidden="true">
            <v-icon icon="mdi-receipt-text-check-outline" size="20" />
          </span>
          <div>
            <strong>Comprovação documental</strong>
            <span>Notas fiscais e certificados de destinação final anexados em poucos cliques, sem planilhas paralelas.</span>
          </div>
        </li>
        <li>
          <span class="rg-about__list-icon" aria-hidden="true">
            <v-icon icon="mdi-shield-check-outline" size="20" />
          </span>
          <div>
            <strong>Auditoria contínua</strong>
            <span>Cada movimentação preservada para conferência do comitê gestor e órgãos de controle.</span>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.rg-about {
  padding: var(--rg-space-20) var(--rg-space-6);
  background-color: var(--rg-color-surface-base);
}

.rg-about__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--rg-space-12);
  align-items: center;
}

.rg-about__list {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
  list-style: none;
  margin: 0;
  padding: 0;
}

.rg-about__list li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--rg-space-4);
  padding: var(--rg-space-5);
  background-color: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-xl);
}

.rg-about__list-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-brand);
  color: var(--rg-color-text-brand);
}

.rg-about__list strong {
  display: block;
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  margin-bottom: 2px;
}
.rg-about__list span {
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

@media (max-width: 960px) {
  .rg-about__inner {
    grid-template-columns: 1fr;
    gap: var(--rg-space-8);
  }
  .rg-about { padding: var(--rg-space-14) var(--rg-space-4); }
}
</style>
