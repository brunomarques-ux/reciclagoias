<script setup lang="ts">
/**
 * CTA final — segue Figma node 45:1000.
 *
 * Layout simples e compacto: logo 3D pequena à esquerda + título em 2 linhas
 * (com "logística reversa" em verde) + botão primário "Acessar sistema" à
 * direita. Background no tint verde claro #F1F7F3 (mesmo de Como Funciona e
 * Fluxo de Operação).
 *
 * Substitui a antiga seção "Acesso à plataforma" — versão anterior era
 * uma faixa verde escura com 2 botões; agora é minimalista.
 */
import RgButton from '@/components/RgButton.vue';
</script>

<template>
  <section id="acessar" class="rg-cta" aria-labelledby="rg-cta-title">
    <div class="rg-cta__inner">
      <div class="rg-cta__content">
        <!-- Logo 3D pequena (mesma do hero do Fluxo de Operação) -->
        <img
          src="/fluxo/logo-3d.png"
          alt=""
          class="rg-cta__logo"
          aria-hidden="true"
        />

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
  /* Padding vertical de 72px (48px base + 24px de respiro extra pedidos) —
     deixa a faixa um pouco mais larga sem virar uma section grande. */
  padding: 72px var(--rg-space-6);
  /* Mesmo tint do Como Funciona e Fluxo (alternância cromática entre seções claras). */
  background-color: #F1F7F3;
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
  align-items: center;
  gap: var(--rg-space-5);
}

.rg-cta__logo {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  object-fit: contain;
  filter: drop-shadow(0 8px 18px rgba(15, 70, 35, 0.18));
}

.rg-cta__title {
  margin: 0;
  display: flex;
  flex-direction: column;
  font-size: clamp(20px, 2.2vw, 28px);
  line-height: 1.2;
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
    text-align: center;
    gap: var(--rg-space-6);
  }
  .rg-cta__content {
    flex-direction: column;
    text-align: center;
    gap: var(--rg-space-4);
  }
  .rg-cta__title {
    align-items: center;
  }
}

@media (max-width: 640px) {
  .rg-cta {
    padding: var(--rg-space-10) var(--rg-space-4);
  }
  .rg-cta__logo {
    width: 56px;
    height: 56px;
  }
}
</style>
