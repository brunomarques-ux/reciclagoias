<script setup lang="ts">
/**
 * Confirmação de envio — o que aparece logo depois do "Enviar cadastro":
 * protocolo, o que acontece agora e a saída para acompanhar. Nas visitas
 * seguintes quem assume é o lobby (ComplementoLobby).
 */
import RgButton from '@/components/RgButton.vue';
import { useComplementoStore } from '@/stores/complemento';

const emit = defineEmits<{ (e: 'acompanhar'): void }>();
const complemento = useComplementoStore();
</script>

<template>
  <section class="ox-painel" aria-labelledby="ox-confirmacao-titulo">
    <span class="ox-painel__selo ox-painel__selo--sucesso" aria-hidden="true">
      <v-icon icon="mdi-check" size="28" />
    </span>

    <h2 id="ox-confirmacao-titulo" class="ox-painel__titulo">Cadastro enviado para análise</h2>

    <p class="ox-painel__protocolo">
      Protocolo {{ complemento.protocolo }} · enviado em {{ complemento.dataEnvio }}
    </p>

    <p class="ox-painel__texto">
      A equipe do Recicla Goiás analisa as informações e responde pelo e-mail cadastrado. Se faltar
      algum documento, o cadastro volta como pendência para ajuste, sem perder o que já foi
      preenchido.
    </p>

    <div class="ox-painel__acoes">
      <RgButton variant="primary" @click="emit('acompanhar')">Acompanhar análise</RgButton>
    </div>
  </section>
</template>

<style scoped>
.ox-painel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--rg-space-4);
  padding: var(--rg-space-14) var(--rg-space-12);
  background: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  text-align: center;
}

.ox-painel__selo {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: var(--rg-radius-pill);
}

.ox-painel__selo--sucesso {
  background: var(--rg-color-surface-brand);
  color: var(--rg-color-action-primary);
}

.ox-painel__titulo {
  margin: 0;
  font-size: var(--rg-font-size-xl);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.ox-painel__protocolo {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
}

.ox-painel__texto {
  margin: 0;
  max-width: 560px;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-secondary);
  line-height: var(--rg-line-height-relaxed);
}

.ox-painel__acoes {
  display: flex;
  gap: var(--rg-space-3);
  margin-top: var(--rg-space-2);
}
</style>
