<script setup lang="ts">
// Fluxos guiados (camada do protótipo): a raiz trata ?perfil=, ?fluxo= e ?modo= e monta o painel sob demanda, só
// com um fluxo ativo. Ver docs/sistema/FLUXOS-GUIADOS.md.
import RaizDosFluxos from '@/fluxos/RaizDosFluxos.vue';
</script>

<template>
  <v-app>
    <router-view />
    <RaizDosFluxos />
  </v-app>
</template>

<style scoped>
:deep(.v-application__wrap) {
  min-height: 100vh;
  background-color: var(--rg-color-surface-base);
}
</style>
