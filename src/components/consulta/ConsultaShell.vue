<script setup lang="ts">
/**
 * Chrome compartilhado da Consulta de Regularidade — página pública
 * off-system: header verde-escuro (logo branca + ação) sobre hero soft-tint.
 * O conteúdo de cada estado (busca/varredura/resultados/validação) entra
 * no slot; o header é idêntico em todos, como no Figma (Julho/26).
 */
import { ref } from 'vue';
import RgToast from './RgToast.vue';

const showComoFunciona = ref(false);
</script>

<template>
  <div class="cx-shell">
    <header class="cx-shell__header">
      <RouterLink to="/" class="cx-shell__brand" aria-label="Recicla Goiás, ir para a página inicial">
        <img
          src="/brand/recicla-logo-horizontal-branco.svg"
          alt="Recicla Goiás"
          class="cx-shell__logo"
          width="128"
          height="45"
        />
      </RouterLink>

      <button type="button" class="cx-shell__how" @click="showComoFunciona = true">
        <v-icon icon="mdi-information-outline" size="20" aria-hidden="true" />
        Como funciona a consulta
      </button>
    </header>

    <main class="cx-shell__hero">
      <slot />
    </main>

    <!-- Modal "Como funciona a consulta" -->
    <Teleport to="body">
      <Transition name="cx-modal">
        <div
          v-if="showComoFunciona"
          class="cx-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cx-como-title"
          @click.self="showComoFunciona = false"
          @keydown.esc="showComoFunciona = false"
        >
          <div class="cx-modal__card">
            <button
              type="button"
              class="cx-modal__close"
              aria-label="Fechar"
              @click="showComoFunciona = false"
            >
              <v-icon icon="mdi-close" size="20" />
            </button>
            <h2 id="cx-como-title" class="cx-modal__title">Como funciona a consulta</h2>
            <ol class="cx-modal__steps">
              <li>
                <strong>Digite o CNPJ da empresa.</strong> A consulta é pública, gratuita e não
                exige login. Nenhum dado é armazenado.
              </li>
              <li>
                <strong>O sistema varre a base do Recicla Goiás.</strong> Verificamos adesão,
                metas de recuperação e certificados RECICLAGOIÁS do ano-base.
              </li>
              <li>
                <strong>Você recebe a situação da empresa.</strong> Regular, com pendência ou
                não encontrada, com o comprovante oficial em PDF quando houver registro.
              </li>
            </ol>
            <p class="cx-modal__note">
              Recebeu uma certidão e quer conferir se é verdadeira? Use a
              <RouterLink to="/consulta/validar" @click="showComoFunciona = false">
                validação de documentos</RouterLink>: basta o código de autenticação ou o QR Code
              impresso no documento.
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>

    <RgToast />
  </div>
</template>

<style scoped>
.cx-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--rg-color-surface-soft-tint);
}

/* ============ Header ============ */
.cx-shell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-4);
  height: 76px;
  padding-inline: var(--rg-space-10);
  background-color: var(--rg-primitive-brand-950);
}

.cx-shell__brand {
  display: inline-flex;
  align-items: center;
  border-radius: var(--rg-radius-md);
}

.cx-shell__logo {
  width: 128px;
  height: auto;
  display: block;
}

.cx-shell__how {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  height: 44px;
  padding-inline: var(--rg-space-6);
  border: none;
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-primitive-brand-600);
  color: var(--rg-primitive-neutral-0);
  font-family: inherit;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  cursor: pointer;
  transition: background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.cx-shell__how:hover {
  background-color: var(--rg-primitive-brand-500);
}

.cx-shell__how:focus-visible {
  outline: none;
  box-shadow: var(--rg-ring-focus);
}

/* ============ Hero ============ */
.cx-shell__hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--rg-space-16) var(--rg-space-6) var(--rg-space-24);
}

/* ============ Modal ============ */
.cx-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: var(--rg-space-6);
  background-color: rgba(7, 38, 20, 0.55);
}

.cx-modal__card {
  position: relative;
  width: min(560px, 100%);
  padding: var(--rg-space-8);
  border-radius: var(--rg-radius-2xl);
  background-color: var(--rg-color-surface-base);
  box-shadow: var(--rg-elevation-4);
}

.cx-modal__close {
  position: absolute;
  top: var(--rg-space-4);
  right: var(--rg-space-4);
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--rg-radius-pill);
  background: transparent;
  color: var(--rg-color-text-secondary);
  cursor: pointer;
}

.cx-modal__close:hover {
  background-color: var(--rg-color-surface-muted);
}

.cx-modal__title {
  margin: 0 0 var(--rg-space-4);
  font-size: var(--rg-font-size-xl);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
}

.cx-modal__steps {
  margin: 0;
  padding-left: var(--rg-space-5);
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.cx-modal__note {
  margin: var(--rg-space-5) 0 0;
  padding: var(--rg-space-4);
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-soft-tint);
  font-size: var(--rg-font-size-xs);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.cx-modal__note a {
  color: var(--rg-primitive-brand-700);
  font-weight: var(--rg-font-weight-semibold);
}

/* Transição do modal */
.cx-modal-enter-active,
.cx-modal-leave-active {
  transition: opacity var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.cx-modal-enter-active .cx-modal__card,
.cx-modal-leave-active .cx-modal__card {
  transition: transform var(--rg-motion-duration-fast) var(--rg-motion-ease-emphasized);
}

.cx-modal-enter-from,
.cx-modal-leave-to {
  opacity: 0;
}

.cx-modal-enter-from .cx-modal__card {
  transform: translateY(12px) scale(0.98);
}

@media (max-width: 640px) {
  .cx-shell__header {
    padding-inline: var(--rg-space-4);
  }
  .cx-shell__how {
    padding-inline: var(--rg-space-4);
    font-size: var(--rg-font-size-xs);
  }
  .cx-shell__logo {
    width: 104px;
  }
  .cx-shell__hero {
    padding: var(--rg-space-10) var(--rg-space-4) var(--rg-space-16);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cx-modal-enter-active,
  .cx-modal-leave-active,
  .cx-modal-enter-active .cx-modal__card,
  .cx-modal-leave-active .cx-modal__card {
    transition: none !important;
  }
}
</style>
