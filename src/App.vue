<template>
  <v-app>
    <!-- a chave pelo caminho: /admin/cadastros/<a> para /admin/cadastros/<b> remonta a página com o outro cadastro -->
    <router-view :key="$route.path" />
  </v-app>
</template>

<style scoped>
:deep(.v-application__wrap) {
  min-height: 100vh;
  background-color: var(--rg-color-surface-base);
}
</style>
