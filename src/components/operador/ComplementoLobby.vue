<script setup lang="ts">
/**
 * Lobby de análise — o que o operador vê ao entrar enquanto a análise não
 * termina. O complemento fica fechado para edição; o resultado chega por
 * e-mail (aprovado libera o acesso completo; reprovado encerra o acesso, com o
 * motivo no e-mail e o suporte como canal de recurso).
 *
 * O "Reiniciar demonstração" é ferramenta de protótipo, como o explorador de
 * cenários da gestora: volta o fluxo ao estado inicial para a próxima demo.
 */
import RgButton from '@/components/RgButton.vue';
import { useComplementoStore } from '@/stores/complemento';

const emit = defineEmits<{ (e: 'ver-enviado'): void; (e: 'reiniciar'): void }>();
const complemento = useComplementoStore();
</script>

<template>
  <section class="ox-painel" aria-labelledby="ox-lobby-titulo">
    <span class="ox-painel__selo ox-painel__selo--analise" aria-hidden="true">
      <v-icon icon="mdi-clock-outline" size="26" />
    </span>

    <h2 id="ox-lobby-titulo" class="ox-painel__titulo">Cadastro em análise</h2>

    <span class="ox-painel__chip">Em análise</span>

    <p class="ox-painel__protocolo">
      Enviado em {{ complemento.dataEnvio }} · protocolo {{ complemento.protocolo }}
    </p>

    <p class="ox-painel__texto">
      A equipe responsável está conferindo os dados e os documentos da cooperativa. Você recebe um
      e-mail assim que a análise terminar. Enquanto isso, o complemento fica fechado para edição.
    </p>

    <div class="ox-painel__acoes">
      <RgButton variant="secondary" @click="emit('ver-enviado')">Ver o que foi enviado</RgButton>
    </div>

    <button type="button" class="ox-painel__reiniciar" @click="emit('reiniciar')">
      Reiniciar demonstração
    </button>
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

.ox-painel__selo--analise {
  background: var(--rg-color-feedback-info-soft);
  color: var(--rg-color-feedback-info);
}

.ox-painel__titulo {
  margin: 0;
  font-size: var(--rg-font-size-xl);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.ox-painel__chip {
  padding: var(--rg-space-1) var(--rg-space-3);
  border-radius: var(--rg-radius-pill);
  background: var(--rg-color-feedback-info-soft);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-feedback-info);
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

.ox-painel__reiniciar {
  border: none;
  background: none;
  padding: var(--rg-space-1) var(--rg-space-2);
  font-family: inherit;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-muted);
  text-decoration: underline;
  cursor: pointer;
  border-radius: var(--rg-radius-sm);
}

.ox-painel__reiniciar:hover {
  color: var(--rg-color-text-secondary);
}

.ox-painel__reiniciar:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}
</style>
