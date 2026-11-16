<script setup lang="ts">
/**
 * /fluxos · "Jornadas do protótipo" (camada do protótipo, fora do produto; carrega sob demanda e não pede perfil).
 *
 * A entrada das jornadas, organizada por entrega: um card por escopo macro que o time recebe de uma vez. O card
 * abre a página da entrega, com as jornadas dela. Os fluxos de antes das entregas seguem em /fluxos/anteriores.
 * O catálogo mora em catalogo.ts.
 */
import { useRouter } from 'vue-router';

import BotaoDoFluxo from '../fluxos/BotaoDoFluxo.vue';
import { BLOCOS, todosOsFluxos } from '../fluxos/registro';
import { ENTREGAS } from './catalogo';

const router = useRouter();

const anteriores = todosOsFluxos().filter((f) => !BLOCOS.find((b) => b.id === f.bloco)?.entrega).length;
const textoDasJornadas = (n: number) => (n === 1 ? '1 jornada' : `${n} jornadas`);
</script>

<template>
  <div class="px-entregas">
    <main class="px-entregas__conteudo">
      <header class="px-entregas__header">
        <p class="px-entregas__eyebrow">Protótipo · fora do desenho</p>
        <h1 class="px-entregas__title">Jornadas do protótipo</h1>
        <p class="px-entregas__lead">
          Percursos guiados pelas telas do protótipo do Recicla Goiás, organizados por entrega. Abra uma entrega para
          ver as jornadas dela e escolher como acompanhar: passo a passo ou executando direto.
        </p>
        <div class="px-entregas__actions">
          <BotaoDoFluxo
            rotulo="Voltar ao protótipo"
            variante="contorno"
            tom="neutro"
            icone="mdi-arrow-left"
            @click="router.push('/entrar')"
          />
        </div>
      </header>

      <ul class="px-entregas__lista" aria-label="Entregas">
        <li v-for="e in ENTREGAS" :key="e.id">
          <RouterLink class="px-entregas__card" :to="`/fluxos/${e.id}`">
            <span class="px-entregas__card-meta">{{ textoDasJornadas(e.itens.length) }}</span>
            <h2 class="px-entregas__card-titulo">{{ e.titulo }}</h2>
            <p class="px-entregas__card-texto">{{ e.resumo }}</p>
            <ul class="px-entregas__codigos" aria-label="Jornadas desta entrega">
              <li v-for="i in e.itens" :key="i.codigo">
                <span class="px-entregas__codigo">{{ i.codigo }}</span>
                <span>{{ i.titulo }}</span>
              </li>
            </ul>
            <span class="px-entregas__abrir">
              Abrir a entrega <v-icon icon="mdi-arrow-right" size="18" aria-hidden="true" />
            </span>
          </RouterLink>
        </li>
      </ul>

      <p v-if="anteriores" class="px-entregas__anteriores">
        Os {{ anteriores }} fluxos de antes das entregas (complemento do operador e análise no Admin) continuam em
        <RouterLink to="/fluxos/anteriores">Fluxos anteriores</RouterLink>.
      </p>
    </main>
  </div>
</template>

<style scoped>
.px-entregas {
  min-height: 100vh;
  background-color: var(--rg-color-surface-muted);
  color: var(--rg-color-text-primary);
}

.px-entregas__conteudo {
  box-sizing: border-box;
  max-width: 64rem;
  margin: 0 auto;
  padding: var(--rg-space-10) var(--rg-space-6);
}

.px-entregas__header {
  margin-bottom: var(--rg-space-8);
}

.px-entregas__eyebrow {
  margin: 0 0 var(--rg-space-1);
  color: var(--rg-color-text-secondary);
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
}

.px-entregas__title {
  margin: 0 0 var(--rg-space-3);
  font-size: 28px;
  line-height: 34px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
}

.px-entregas__lead {
  max-width: 48rem;
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: 24px;
  color: var(--rg-color-text-secondary);
}

.px-entregas__actions {
  margin-top: var(--rg-space-4);
}

.px-entregas__lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 28rem), 1fr));
  gap: var(--rg-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.px-entregas__card {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  height: 100%;
  padding: var(--rg-space-6);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background: var(--rg-color-surface-raised);
  color: inherit;
  text-decoration: none;
  transition: border-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.px-entregas__card:hover {
  border-color: var(--rg-color-border-brand);
}

.px-entregas__card:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.px-entregas__card-meta {
  color: var(--rg-color-text-secondary);
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
}

.px-entregas__card-titulo {
  margin: 0;
  font-size: var(--rg-font-size-xl);
  line-height: 28px;
  font-weight: var(--rg-font-weight-semibold);
}

.px-entregas__card-texto {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  color: var(--rg-color-text-secondary);
}

.px-entregas__codigos {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  margin: 0;
  padding: var(--rg-space-3) 0 0;
  border-top: 1px solid var(--rg-color-border-subtle);
  list-style: none;
  font-size: 13px;
  line-height: 18px;
}

.px-entregas__codigos li {
  display: flex;
  gap: var(--rg-space-3);
}

.px-entregas__codigo {
  flex: none;
  width: 24px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-brand);
}

.px-entregas__abrir {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-1);
  margin-top: auto;
  padding-top: var(--rg-space-2);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-brand);
}

.px-entregas__anteriores {
  margin: var(--rg-space-8) 0 0;
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  color: var(--rg-color-text-secondary);
}

.px-entregas__anteriores a {
  color: var(--rg-color-text-brand);
  font-weight: var(--rg-font-weight-semibold);
}

@media (prefers-reduced-motion: reduce) {
  .px-entregas__card {
    transition: none;
  }
}
</style>
