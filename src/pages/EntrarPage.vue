<script setup lang="ts">
/**
 * Login provisório da área logada. Não tem frame no Figma — nasce aqui, em código,
 * na mesma linguagem visual das telas da gestora (docs/sistema/PLANO-AREA-GESTORA.md §3).
 *
 * Não existe autenticação: escolhe o perfil, grava na store e redireciona. Os três
 * perfis aparecem porque é o que comunica o mapa do sistema; os dois que ainda não
 * têm tela ficam desabilitados com "Em breve", em vez de prometer o que não existe.
 */
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { PERFIS, type PerfilId } from '@/data/mocks/sessao';
import { useSessaoStore } from '@/stores/sessao';

const router = useRouter();
const route = useRoute();
const sessao = useSessaoStore();

const perfilEscolhido = ref<PerfilId>('gestora');

const perfilAtivo = computed(() => PERFIS.find((p) => p.id === perfilEscolhido.value));

function entrar() {
  const perfil = perfilAtivo.value;
  if (!perfil?.rota) return;

  sessao.entrar(perfil.id);
  const destino = typeof route.query.destino === 'string' ? route.query.destino : perfil.rota;
  void router.push(destino);
}
</script>

<template>
  <div class="gx-entrar">
    <main class="gx-entrar__card">
      <img
        src="/brand/recicla-logo-horizontal.svg"
        alt="Recicla Goiás"
        class="gx-entrar__logo"
        width="150"
        height="53"
      />

      <div class="gx-entrar__intro">
        <h1 class="gx-entrar__title">Entrar no sistema</h1>
        <p class="gx-entrar__subtitle">
          Protótipo de navegação do Recicla Goiás. Escolha o perfil para conhecer as telas —
          não há senha e nenhum dado é enviado.
        </p>
      </div>

      <form class="gx-entrar__form" @submit.prevent="entrar">
        <fieldset class="gx-entrar__fieldset">
          <legend class="gx-entrar__legend">Perfil de acesso</legend>

          <label
            v-for="perfil in PERFIS"
            :key="perfil.id"
            class="gx-perfil"
            :class="{
              'gx-perfil--ativo': perfilEscolhido === perfil.id,
              'gx-perfil--indisponivel': !perfil.rota,
            }"
          >
            <input
              v-model="perfilEscolhido"
              type="radio"
              name="perfil"
              class="gx-perfil__input"
              :value="perfil.id"
              :disabled="!perfil.rota"
            />

            <span class="gx-perfil__icone" aria-hidden="true">
              <v-icon :icon="perfil.icone" size="20" />
            </span>

            <span class="gx-perfil__texto">
              <span class="gx-perfil__nome">
                {{ perfil.nome }}
                <span v-if="!perfil.rota" class="gx-perfil__chip">Em breve</span>
              </span>
              <span class="gx-perfil__descricao">{{ perfil.descricao }}</span>
            </span>

            <v-icon
              v-if="perfilEscolhido === perfil.id"
              class="gx-perfil__check"
              icon="mdi-check-circle"
              size="20"
              aria-hidden="true"
            />
          </label>
        </fieldset>

        <button type="submit" class="gx-entrar__submit" :disabled="!perfilAtivo?.rota">
          Entrar como {{ perfilAtivo?.nome }}
        </button>
      </form>

      <p class="gx-entrar__rodape">
        <RouterLink to="/" class="gx-entrar__voltar">Voltar para o site do Recicla Goiás</RouterLink>
      </p>
    </main>
  </div>
</template>

<style scoped>
.gx-entrar {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: var(--rg-space-10) var(--rg-space-6);
  background-color: var(--rg-color-surface-muted);
}

.gx-entrar__card {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-6);
  width: min(520px, 100%);
  padding: var(--rg-space-10);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-xl);
  background-color: var(--rg-color-surface-raised);
  box-shadow: var(--rg-elevation-2);
}

.gx-entrar__logo {
  width: 150px;
  height: auto;
}

.gx-entrar__intro {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
}

.gx-entrar__title {
  margin: 0;
  font-size: 28px;
  line-height: 34px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

.gx-entrar__subtitle {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  color: var(--rg-color-text-secondary);
}

.gx-entrar__form {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-6);
}

.gx-entrar__fieldset {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  margin: 0;
  padding: 0;
  border: none;
}

.gx-entrar__legend {
  padding: 0;
  margin-bottom: var(--rg-space-2);
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
}

/* ============ Opção de perfil ============ */
.gx-perfil {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--rg-space-3);
  padding: var(--rg-space-4);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-color-surface-raised);
  cursor: pointer;
  transition:
    border-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.gx-perfil:hover:not(.gx-perfil--indisponivel) {
  border-color: var(--rg-color-border-brand);
}

.gx-perfil--ativo {
  border-color: var(--rg-color-border-brand);
  background-color: var(--rg-color-surface-brand);
}

.gx-perfil--indisponivel {
  cursor: not-allowed;
  background-color: var(--rg-color-surface-muted);
}

.gx-perfil--indisponivel .gx-perfil__nome,
.gx-perfil--indisponivel .gx-perfil__descricao {
  color: var(--rg-color-text-muted);
}

.gx-perfil__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.gx-perfil:has(.gx-perfil__input:focus-visible) {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.gx-perfil__icone {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-color-surface-subtle);
  color: var(--rg-color-text-muted);
}

.gx-perfil--ativo .gx-perfil__icone {
  background-color: var(--rg-color-surface-raised);
  color: var(--rg-color-text-brand);
}

.gx-perfil__texto {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.gx-perfil__nome {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-perfil__chip {
  padding: 2px var(--rg-space-2);
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-surface-subtle);
  font-size: 11px;
  line-height: 14px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
}

.gx-perfil__descricao {
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.gx-perfil__check {
  margin-left: auto;
  color: var(--rg-color-action-primary);
}

/* ============ Ação ============ */
.gx-entrar__submit {
  height: 48px;
  border: none;
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-color-action-primary);
  color: var(--rg-color-text-on-brand);
  font-family: inherit;
  font-size: 15px;
  line-height: 20px;
  font-weight: var(--rg-font-weight-semibold);
  cursor: pointer;
  transition: background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.gx-entrar__submit:hover:not(:disabled) {
  background-color: var(--rg-color-action-primary-hover);
}

.gx-entrar__submit:disabled {
  background-color: var(--rg-color-border-base);
  color: var(--rg-color-text-disabled);
  cursor: not-allowed;
}

.gx-entrar__submit:focus-visible {
  outline: none;
  box-shadow: var(--rg-ring-focus);
}

.gx-entrar__rodape {
  margin: 0;
  text-align: center;
  font-size: 13px;
  line-height: 18px;
}

.gx-entrar__voltar {
  color: var(--rg-color-text-brand);
  font-weight: var(--rg-font-weight-medium);
  text-decoration: underline;
}

@media (max-width: 560px) {
  .gx-entrar__card {
    padding: var(--rg-space-6);
  }
}
</style>
