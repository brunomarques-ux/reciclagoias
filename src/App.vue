<script setup lang="ts">
</script>

<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<style scoped>
:deep(.v-application__wrap) {
  min-height: 100vh;
  background-color: var(--rg-color-surface-base);
}
</style>
