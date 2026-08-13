<script setup lang="ts">
/**
 * Chrome da área logada: TopBar (56px) + SideMenu (260px, altura toda) + conteúdo.
 * O conteúdo recebe o padding do Figma (32 topo / 40 laterais / 48 base) e gap 24
 * entre blocos — frames REC-01…REC-06.
 *
 * O conteúdo **ocupa a largura toda**: começa no recuo depois do menu e termina no
 * recuo da direita, em qualquer tela. Travar numa largura fixa e centralizar fazia a
 * tela cheia parecer que não foi feita sob medida — e num 4K ficaria pior ainda.
 * O que cresce com a tela é o recuo lateral, de 40px (o do frame de 1440) até 80px.
 */
import { useRouter } from 'vue-router';

import { useSessaoStore } from '@/stores/sessao';
import SideMenuRecicla from './SideMenuRecicla.vue';
import TopBarRecicla from './TopBarRecicla.vue';

defineProps<{ secaoAtiva: string }>();

const router = useRouter();
const sessao = useSessaoStore();

function sair() {
  sessao.sair();
  void router.push({ name: 'entrar' });
}
</script>

<template>
  <div class="gx-shell">
    <TopBarRecicla :iniciais="sessao.entidade?.iniciais ?? ''" @sair="sair" />

    <div class="gx-shell__body">
      <SideMenuRecicla :ativo="secaoAtiva" />

      <main class="gx-shell__area">
        <div class="gx-shell__content">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.gx-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--rg-color-surface-muted);
}

.gx-shell__body {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-height: 0;
}

.gx-shell__area {
  display: flex;
  flex: 1;
  min-width: 0;
  background-color: var(--rg-color-surface-muted);
}

.gx-shell__content {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-6);
  width: 100%;
  min-width: 0;
  /* 40px é o recuo do frame de 1440 e é o piso. Acima disso o recuo respira com a
     tela até 80px, para o conteúdo não colar na borda de um monitor grande. */
  padding-block: var(--rg-space-8) var(--rg-space-12);
  padding-inline: max(var(--rg-space-10), min(2.5vw, 80px));
}

@media (max-width: 1023px) {
  .gx-shell__content {
    padding: var(--rg-space-6) var(--rg-space-6) var(--rg-space-10);
  }
}

@media (max-width: 720px) {
  .gx-shell__content {
    padding: var(--rg-space-5) var(--rg-space-4) var(--rg-space-8);
    gap: var(--rg-space-5);
  }
}
</style>
