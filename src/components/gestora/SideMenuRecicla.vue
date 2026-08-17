<script setup lang="ts">
/**
 * Menu lateral da área logada. Instância de `SideMenu` com `Platform=recicla`
 * (frames REC-01…REC-06): 260px de largura e altura toda da viewport — a decisão
 * D-R002 tirou as pílulas de ano do cabeçalho e esticou o menu.
 *
 * Só o Dashboard tem tela nesta fatia. Os demais itens ficam visíveis, com o mesmo
 * desenho do Figma, mas inertes: linkar para rota que não existe é pior do que não
 * linkar (docs/sistema/PLANO-AREA-GESTORA.md §6).
 *
 * Abaixo de 1024px o menu vira trilha de ícones — não está desenhado no Figma, é o
 * mínimo de responsividade para o protótipo não quebrar em tela menor.
 *
 * No rodapé mora o explorador de cenários, que é ferramenta de protótipo.
 */
import { computed } from 'vue';

import { useSessaoStore } from '@/stores/sessao';
import ExploradorCenarios from './ExploradorCenarios.vue';

const props = withDefaults(defineProps<{ ativo: string; explorador?: boolean }>(), {
  explorador: true,
});

const sessao = useSessaoStore();

/** Os itens vêm do perfil: o verificador tem Notas Fiscais onde a gestora tem Planos. */
const ITENS = computed(() => sessao.menu);
const mostraExplorador = computed(() => props.explorador);
</script>

<template>
  <div class="gx-menu">
    <nav class="gx-menu__nav" aria-label="Seções do sistema">
      <ul class="gx-menu__lista">
        <li v-for="item in ITENS" :key="item.rotulo">
          <RouterLink
            v-if="item.rota"
            :to="item.rota"
            class="gx-menu__item"
            :class="{ 'gx-menu__item--ativo': item.rotulo === ativo }"
            :aria-current="item.rotulo === ativo ? 'page' : undefined"
            :title="item.rotulo"
          >
            <v-icon :icon="item.icone" size="18" aria-hidden="true" />
            <span class="gx-menu__rotulo">{{ item.rotulo }}</span>
          </RouterLink>

          <span
            v-else
            class="gx-menu__item gx-menu__item--indisponivel"
            :title="`${item.rotulo} — em breve`"
          >
            <v-icon :icon="item.icone" size="18" aria-hidden="true" />
            <span class="gx-menu__rotulo">{{ item.rotulo }}</span>
          </span>
        </li>
      </ul>
    </nav>

    <footer v-if="mostraExplorador" class="gx-menu__rodape">
      <ExploradorCenarios />
    </footer>
  </div>
</template>

<style scoped>
.gx-menu {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 260px;
  padding: var(--rg-space-4) var(--rg-space-3);
  border-right: 1px solid var(--rg-color-border-subtle);
  background-color: var(--rg-color-surface-raised);
}

.gx-menu__nav {
  flex: 1;
  min-height: 0;
}

.gx-menu__lista {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.gx-menu__item {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  height: 40px;
  padding: var(--rg-space-2) var(--rg-space-3);
  border-radius: var(--rg-radius-md);
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-primitive-neutral-700);
  transition: background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.gx-menu__item .v-icon {
  color: var(--rg-color-text-muted);
}

.gx-menu__item--ativo {
  background-color: var(--rg-color-surface-brand);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-brand);
}

.gx-menu__item--ativo .v-icon {
  color: var(--rg-color-text-brand);
}

a.gx-menu__item:hover:not(.gx-menu__item--ativo) {
  background-color: var(--rg-color-surface-muted);
}

/* O item sem tela precisa se declarar em algum canal além do cursor. Muted dá
   4,8:1 sobre o menu — passa AA como texto estático. */
.gx-menu__item--indisponivel {
  cursor: default;
  color: var(--rg-color-text-muted);
}

.gx-menu__rodape {
  padding-top: var(--rg-space-4);
  border-top: 1px solid var(--rg-color-border-subtle);
}

/* Trilha de ícones: mesma navegação, sem os rótulos. */
@media (max-width: 1023px) {
  .gx-menu {
    width: 72px;
    padding-inline: var(--rg-space-2);
  }

  .gx-menu__item {
    justify-content: center;
    padding-inline: 0;
  }

  .gx-menu__rotulo {
    display: none;
  }
}
</style>
