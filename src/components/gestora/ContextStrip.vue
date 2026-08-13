<script setup lang="ts">
/**
 * Faixa de contexto do exercício — "Ano de execução 2024 · recuperação das embalagens"
 * e "Ano base 2023 · embalagens colocadas no mercado" (frames REC-01…REC-06).
 *
 * Existe porque os dois anos aparecem juntos na tela e significam coisas diferentes;
 * a descrição ao lado do número é o que evita a confusão.
 */
defineProps<{ anoExecucao: number; anoBase: number }>();
</script>

<template>
  <div class="gx-ctx">
    <p class="gx-ctx__item">
      <span class="gx-ctx__ponto" aria-hidden="true" />
      <span class="gx-ctx__rotulo">Ano de execução</span>
      <span class="gx-ctx__valor">{{ anoExecucao }}</span>
      <span class="gx-ctx__sep" aria-hidden="true">·</span>
      <span class="gx-ctx__descricao">recuperação das embalagens</span>
    </p>

    <span class="gx-ctx__divisor" aria-hidden="true" />

    <p class="gx-ctx__item">
      <span class="gx-ctx__ponto" aria-hidden="true" />
      <span class="gx-ctx__rotulo">Ano base</span>
      <span class="gx-ctx__valor">{{ anoBase }}</span>
      <span class="gx-ctx__sep" aria-hidden="true">·</span>
      <span class="gx-ctx__descricao">embalagens colocadas no mercado</span>
    </p>
  </div>
</template>

<style scoped>
.gx-ctx {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rg-space-2) var(--rg-space-6);
  padding: var(--rg-space-3) var(--rg-space-5);
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-color-surface-brand);
}

.gx-ctx__item {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin: 0;
  font-size: 13px;
  line-height: 18px;
}

.gx-ctx__ponto {
  width: 8px;
  height: 8px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-action-primary);
}

.gx-ctx__rotulo {
  color: var(--rg-color-text-secondary);
}

.gx-ctx__valor {
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-brand);
}

.gx-ctx__sep {
  color: var(--rg-color-text-muted);
}

.gx-ctx__descricao {
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  color: var(--rg-color-text-muted);
}

.gx-ctx__divisor {
  width: 1px;
  height: 16px;
  background-color: var(--rg-primitive-brand-300);
}

/* Quando os dois contextos quebram em linhas separadas, o divisor sobra. */
@media (max-width: 940px) {
  .gx-ctx__divisor {
    display: none;
  }
}
</style>
