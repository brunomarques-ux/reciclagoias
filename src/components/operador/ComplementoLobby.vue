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
import { computed } from 'vue';

import RgButton from '@/components/RgButton.vue';
import { useComplementoStore } from '@/stores/complemento';

const emit = defineEmits<{ (e: 'ver-enviado'): void; (e: 'reiniciar'): void }>();
const complemento = useComplementoStore();

const TEXTOS = {
  'em-analise': { titulo: 'Cadastro em análise', chip: 'Em análise', icone: 'mdi-clock-outline', texto: 'A equipe responsável está conferindo os dados e os documentos da cooperativa. Você recebe um e-mail assim que a análise terminar. Enquanto isso, o complemento fica fechado para edição.' },
  reenviado: { titulo: 'Cadastro em nova análise', chip: 'Em nova análise', icone: 'mdi-clock-outline', texto: 'A equipe responsável está conferindo os documentos atualizados. Você recebe um e-mail assim que a análise terminar. Enquanto isso, o complemento fica fechado para edição.' },
  aprovado: { titulo: 'Cadastro aprovado', chip: 'Aprovado', icone: 'mdi-check', texto: 'O acesso completo ao sistema foi liberado. O e-mail de aprovação traz o manual de como incluir notas fiscais e fazer transferências.' },
} as const;
const t = computed(() => TEXTOS[complemento.situacao as keyof typeof TEXTOS] ?? TEXTOS['em-analise']);
</script>

<template>
  <section class="ox-painel" aria-labelledby="ox-lobby-titulo">
    <span
      class="ox-painel__selo"
      :class="complemento.situacao === 'aprovado' ? 'ox-painel__selo--aprovado' : 'ox-painel__selo--analise'"
      aria-hidden="true"
    >
      <v-icon :icon="t.icone" size="26" />
    </span>

    <h2 id="ox-lobby-titulo" class="ox-painel__titulo">{{ t.titulo }}</h2>

    <span class="ox-painel__chip" :class="{ 'ox-painel__chip--aprovado': complemento.situacao === 'aprovado' }">{{ t.chip }}</span>

    <p class="ox-painel__protocolo">
      Enviado em {{ complemento.dataEnvio }} · protocolo {{ complemento.protocolo }}
    </p>

    <p class="ox-painel__texto">{{ t.texto }}</p>

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

.ox-painel__selo--aprovado {
  background: var(--rg-color-feedback-success-soft);
  color: var(--rg-color-feedback-success);
}

.ox-painel__chip--aprovado {
  background: var(--rg-color-feedback-success-soft) !important;
  color: var(--rg-color-feedback-success) !important;
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
