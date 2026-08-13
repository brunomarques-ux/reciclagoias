<script setup lang="ts">
/**
 * Barra superior da área logada. Instância de `TopBar` com `Platform=recicla` no
 * Figma (seção "Agosto 2026 · Recicla Goiás", frames REC-01…REC-06): 56px de altura,
 * verde de marca, marca à esquerda e notificações + avatar à direita.
 *
 * O avatar é o único ponto de saída do protótipo — não existe menu de conta desenhado.
 */
defineProps<{ iniciais: string }>();

defineEmits<{ (e: 'sair'): void }>();
</script>

<template>
  <header class="gx-topbar">
    <div class="gx-topbar__esquerda">
      <button type="button" class="gx-topbar__icone" aria-label="Abrir menu" aria-disabled="true">
        <v-icon icon="mdi-menu" size="22" />
      </button>

      <div class="gx-topbar__marca">
        <span class="gx-topbar__nome">RECICLA</span>
        <span class="gx-topbar__divisor" aria-hidden="true" />
        <span class="gx-topbar__contexto">Goiás · Logística Reversa</span>
      </div>
    </div>

    <div class="gx-topbar__direita">
      <button
        type="button"
        class="gx-topbar__icone"
        aria-label="Notificações"
        aria-disabled="true"
      >
        <v-icon icon="mdi-bell" size="22" />
      </button>

      <button
        type="button"
        class="gx-topbar__avatar"
        :aria-label="`Sair do protótipo (${iniciais})`"
        title="Sair do protótipo"
        @click="$emit('sair')"
      >
        {{ iniciais }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.gx-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  height: 56px;
  padding-left: var(--rg-space-5);
  padding-right: var(--rg-space-6);
  background-color: var(--rg-color-action-primary);
}

.gx-topbar__esquerda {
  display: flex;
  align-items: center;
  gap: var(--rg-space-4);
}

.gx-topbar__direita {
  display: flex;
  align-items: center;
  gap: 18px;
}

.gx-topbar__icone {
  display: grid;
  place-items: center;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--rg-color-text-on-brand);
  cursor: pointer;
}

.gx-topbar__icone[aria-disabled='true'] {
  cursor: default;
}

.gx-topbar__icone:focus-visible,
.gx-topbar__avatar:focus-visible {
  outline: 2px solid var(--rg-color-text-on-brand);
  outline-offset: 2px;
}

.gx-topbar__marca {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gx-topbar__nome {
  font-size: 15px;
  line-height: 20px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: 0.02em;
  color: var(--rg-color-text-on-brand);
}

.gx-topbar__divisor {
  width: 1px;
  height: 22px;
  background-color: var(--rg-color-text-on-brand);
}

.gx-topbar__contexto {
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-primitive-brand-100);
}

.gx-topbar__avatar {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-surface-base);
  color: var(--rg-color-action-primary);
  font-family: inherit;
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-semibold);
  cursor: pointer;
}
</style>
