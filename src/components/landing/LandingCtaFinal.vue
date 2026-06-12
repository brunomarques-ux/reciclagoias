<script setup lang="ts">
/**
 * CTA final — faixa de fechamento antes do footer.
 *
 * Tipografia grande em 2 linhas (com "logística reversa" em verde) + botão
 * primário "Acessar sistema" à direita. Sem imagem: o texto É o elemento
 * visual (decisão da rodada 3 — a logo 3D saiu pra dar mais peso ao título).
 * Background no tint verde claro (mesmo de Como Funciona e Fluxo).
 */
import RgButton from '@/components/RgButton.vue';
</script>

<template>
  <section id="acessar" class="rg-cta" aria-labelledby="rg-cta-title">
    <div class="rg-cta__inner">
      <div class="rg-cta__content">
        <span class="rg-cta__eyebrow">ACESSO AO SISTEMA</span>
        <h2 id="rg-cta-title" class="rg-cta__title">
          <span class="rg-cta__title-line">
            Pronto para começar a sua jornada
          </span>
          <span class="rg-cta__title-line">
            de <span class="rg-cta__title-accent">logística reversa</span>?
          </span>
        </h2>
      </div>

      <div class="rg-cta__action">
        <RgButton
          variant="primary"
          size="lg"
          href="#acessar"
          icon-right="mdi-arrow-right"
          aria-label="Acessar sistema Recicla Goiás"
        >
          Acessar sistema
        </RgButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rg-cta {
  position: relative;
  /* Faixa mais generosa que a versão anterior (72px) — o CTA ganhou peso
     tipográfico e respira mais. */
  padding: var(--rg-space-20) var(--rg-space-6);
  /* Mesmo tint do Como Funciona e Fluxo (alternância cromática entre seções claras). */
  background-color: var(--rg-color-surface-soft-tint);
}

.rg-cta__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: grid;
  /* Conteúdo cresce, ação fixa à direita. */
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--rg-space-8);
}

.rg-cta__content {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.rg-cta__eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-brand);
}

.rg-cta__title {
  margin: 0;
  display: flex;
  flex-direction: column;
  /* Tipografia grande — o título é o protagonista da faixa. */
  font-size: clamp(28px, 3.2vw, 42px);
  line-height: 1.12;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

.rg-cta__title-line {
  display: block;
}

/* "logística reversa" em verde brand-500 — mesmo padrão das outras seções. */
.rg-cta__title-accent {
  color: var(--rg-primitive-brand-500);
}

.rg-cta__action {
  flex-shrink: 0;
}

/* ============ Responsivo ============ */
@media (max-width: 960px) {
  .rg-cta__inner {
    grid-template-columns: 1fr;
    gap: var(--rg-space-6);
    justify-items: center;
  }
  .rg-cta__content {
    align-items: center;
    text-align: center;
  }
}

@media (max-width: 640px) {
  .rg-cta {
    padding: var(--rg-space-14) var(--rg-space-4);
  }
  .rg-cta__action {
    width: 100%;
  }
  .rg-cta__action :deep(.rg-button) {
    width: 100%;
  }
}
</style>
