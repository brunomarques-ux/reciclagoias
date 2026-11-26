<script setup lang="ts">
/**
 * /fluxos/<entrega> · as jornadas de uma entrega (camada do protótipo, fora do produto).
 *
 * Lista as linhas da entrega na ordem em que foram pedidas, com o minuto da reunião e uma frase do que muda. Cada
 * linha abre o protótipo na tela e no perfil certos, com o painel da jornada por cima, de dois jeitos:
 *   Passo a passo    o painel diz o gesto, o alvo fica destacado e o passo avança quando a pessoa faz (manual);
 *   Executar direto  o cursor faz os gestos, devagar, e quem apresenta só narra (automático).
 * A velocidade escolhida aqui vale para a jornada que começar; no painel dá para trocar a qualquer momento.
 */
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import BotaoDoFluxo from '../fluxos/BotaoDoFluxo.vue';
import { iniciarFluxo } from '../fluxos/iniciar';
import { capitulosDe, fluxoPorId } from '../fluxos/registro';
import { definirVelocidadePreferida, preferenciasDoFluxo, type ModoDoFluxo, type VelocidadeDoFluxo } from '../fluxos/sessao';
import { entregaPorId, type ItemDaEntrega } from './catalogo';

const route = useRoute();
const router = useRouter();

const entrega = computed(() => entregaPorId(route.params.entrega));
const velocidade = ref<VelocidadeDoFluxo>(preferenciasDoFluxo().velocidade);

function escolherVelocidade(v: VelocidadeDoFluxo) {
  velocidade.value = v;
  definirVelocidadePreferida(v);
}

const passosDe = (i: ItemDaEntrega) => fluxoPorId(i.fluxo)?.passos.length ?? 0;
const textoDosPassos = (n: number) => (n === 1 ? '1 tela' : `${n} telas`);

function iniciar(i: ItemDaEntrega, modo: ModoDoFluxo) {
  const f = fluxoPorId(i.fluxo);
  if (f) iniciarFluxo(f, modo);
}

const TOM = { 'Fluxo novo': 'success', Ajuste: 'info', Proposta: 'warning' } as const;

/** A jornada de apresentação da entrega, se houver: abre sempre no automático, um capítulo por vez. */
const apresentacao = computed(() => {
  const f = fluxoPorId(entrega.value?.apresentacao?.fluxo);
  return f ? { fluxo: f, capitulos: capitulosDe(f).length } : undefined;
});
function apresentar() {
  if (apresentacao.value) iniciarFluxo(apresentacao.value.fluxo, 'auto');
}
</script>

<template>
  <div class="px-entrega">
    <main class="px-entrega__conteudo">
      <section v-if="!entrega" class="px-entrega__vazio">
        <h1 class="px-entrega__title">Entrega não encontrada</h1>
        <p class="px-entrega__lead">Esta entrega não existe no catálogo do protótipo.</p>
        <BotaoDoFluxo rotulo="Ver as entregas" variante="contorno" tom="neutro" icone="mdi-arrow-left" @click="router.push('/fluxos')" />
      </section>

      <template v-else>
        <header class="px-entrega__header">
          <p class="px-entrega__eyebrow">Protótipo · fora do desenho</p>
          <h1 class="px-entrega__title">{{ entrega.titulo }}</h1>
          <p class="px-entrega__lead">{{ entrega.resumo }}</p>
          <p class="px-entrega__origem">{{ entrega.origem }}<br />{{ entrega.figma }}</p>

          <div class="px-entrega__barra">
            <BotaoDoFluxo
              rotulo="Todas as entregas"
              variante="contorno"
              tom="neutro"
              icone="mdi-arrow-left"
              @click="router.push('/fluxos')"
            />
            <div class="px-entrega__velocidade" role="group" aria-label="Velocidade do executar direto">
              <span class="px-entrega__velocidade-rotulo" aria-hidden="true">Velocidade</span>
              <button type="button" :aria-pressed="velocidade === 'normal'" @click="escolherVelocidade('normal')">Normal</button>
              <button type="button" :aria-pressed="velocidade === 'lenta'" @click="escolherVelocidade('lenta')">Lenta</button>
            </div>
          </div>
        </header>

        <section v-if="apresentacao" class="px-entrega__item px-entrega__apresentacao" aria-labelledby="px-apresentacao-titulo">
          <span class="px-entrega__codigo" aria-hidden="true"><v-icon icon="mdi-presentation-play" size="20" /></span>
          <div class="px-entrega__body">
            <div class="px-entrega__item-head">
              <h2 id="px-apresentacao-titulo" class="px-entrega__item-title">{{ entrega.apresentacao!.titulo }}</h2>
              <span class="px-selo px-selo--success">{{ apresentacao.capitulos }} capítulos</span>
            </div>
            <p class="px-entrega__muda">{{ entrega.apresentacao!.resumo }}</p>
          </div>
          <div class="px-entrega__start">
            <BotaoDoFluxo
              v-if="entrega.apresentacao!.slides"
              rotulo="Abrir os slides"
              icone="mdi-presentation-play"
              @click="router.push(entrega.apresentacao!.slides!)"
            />
            <BotaoDoFluxo
              :rotulo="entrega.apresentacao!.slides ? 'Só a jornada' : 'Apresentar'"
              :variante="entrega.apresentacao!.slides ? 'contorno' : undefined"
              :tom="entrega.apresentacao!.slides ? 'neutro' : undefined"
              icone="mdi-play"
              @click="apresentar"
            />
          </div>
        </section>
        <ol class="px-entrega__lista">
          <li v-for="i in entrega.itens" :key="i.codigo" class="px-entrega__item">
            <span class="px-entrega__codigo" aria-hidden="true">{{ i.codigo }}</span>
            <div class="px-entrega__body">
              <div class="px-entrega__item-head">
                <h2 class="px-entrega__item-title"><span class="px-oculto">{{ i.codigo }}: </span>{{ i.titulo }}</h2>
                <span class="px-selo" :class="`px-selo--${TOM[i.natureza]}`">{{ i.natureza }}</span>
              </div>
              <p class="px-entrega__muda">{{ i.muda }}</p>
              <p class="px-entrega__meta">
                <span class="px-entrega__minuto">
                  <v-icon icon="mdi-clock-outline" size="14" aria-hidden="true" />
                  <span class="px-oculto">Minuto da reunião: </span>{{ i.minuto }}
                </span>
                · {{ i.perfil }} · {{ textoDosPassos(passosDe(i)) }}
              </p>
            </div>
            <div class="px-entrega__start">
              <BotaoDoFluxo
                rotulo="Passo a passo"
                icone="mdi-cursor-default-click-outline"
                :aria-label="`Passo a passo: ${i.codigo}, ${i.titulo}`"
                @click="iniciar(i, 'manual')"
              />
              <BotaoDoFluxo
                rotulo="Executar direto"
                variante="contorno"
                tom="neutro"
                icone="mdi-play"
                :aria-label="`Executar direto: ${i.codigo}, ${i.titulo}`"
                @click="iniciar(i, 'auto')"
              />
            </div>
          </li>
        </ol>

        <p class="px-entrega__nota">
          No passo a passo, o painel diz o gesto, o alvo fica destacado e o passo avança quando você faz. No executar
          direto, um cursor faz os gestos devagar e você só narra. No painel dá para pausar, voltar, repetir o passo e
          trocar de modo.
        </p>
      </template>
    </main>
  </div>
</template>

<style scoped>
.px-entrega {
  min-height: 100vh;
  background-color: var(--rg-color-surface-muted);
  color: var(--rg-color-text-primary);
}

.px-entrega__conteudo {
  box-sizing: border-box;
  max-width: 64rem;
  margin: 0 auto;
  padding: var(--rg-space-10) var(--rg-space-6);
}

.px-entrega__vazio {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--rg-space-3);
}

.px-entrega__header {
  margin-bottom: var(--rg-space-8);
}

.px-entrega__eyebrow {
  margin: 0 0 var(--rg-space-1);
  color: var(--rg-color-text-secondary);
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
}

.px-entrega__title {
  margin: 0 0 var(--rg-space-3);
  font-size: 28px;
  line-height: 34px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
}

.px-entrega__lead {
  max-width: 48rem;
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: 24px;
  color: var(--rg-color-text-secondary);
}

.px-entrega__origem {
  margin: var(--rg-space-3) 0 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-muted);
}

.px-entrega__barra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-3);
  margin-top: var(--rg-space-5);
}

.px-entrega__velocidade {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-1);
  padding: 3px;
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-raised);
}

.px-entrega__velocidade-rotulo {
  padding: 0 var(--rg-space-2);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-secondary);
}

.px-entrega__velocidade button {
  min-height: 28px;
  padding: 0 var(--rg-space-3);
  border: none;
  border-radius: var(--rg-radius-sm);
  background: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
  cursor: pointer;
}

.px-entrega__velocidade button[aria-pressed='true'] {
  background: var(--rg-color-surface-brand);
  color: var(--rg-color-text-brand);
  font-weight: var(--rg-font-weight-semibold);
}

.px-entrega__velocidade button:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.px-entrega__lista {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.px-entrega__item {
  display: flex;
  align-items: flex-start;
  gap: var(--rg-space-4);
  padding: var(--rg-space-5);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background: var(--rg-color-surface-raised);
}

/* a apresentação vem antes das linhas, com a borda de marca */
.px-entrega__apresentacao {
  margin-bottom: var(--rg-space-6);
  border-color: var(--rg-color-border-brand);
  background: var(--rg-color-surface-brand);
}
.px-entrega__apresentacao .px-entrega__codigo {
  background: var(--rg-color-action-primary);
  color: var(--rg-color-text-on-brand);
}

.px-entrega__codigo {
  flex: none;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--rg-radius-pill);
  background: var(--rg-color-surface-brand);
  color: var(--rg-color-text-brand);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-bold);
}

.px-entrega__body {
  flex: 1;
  min-width: 0;
}

.px-entrega__item-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rg-space-2);
}

.px-entrega__item-title {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: 24px;
  font-weight: var(--rg-font-weight-semibold);
}

.px-entrega__muda {
  margin: var(--rg-space-1) 0 0;
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
}

.px-entrega__meta {
  margin: var(--rg-space-2) 0 0;
  color: var(--rg-color-text-secondary);
  font-size: 13px;
  line-height: 18px;
}

.px-entrega__minuto {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-1);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  font-variant-numeric: tabular-nums;
}

.px-entrega__start {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--rg-space-2);
  align-self: center;
}

.px-entrega__nota {
  max-width: 48rem;
  margin: var(--rg-space-6) 0 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.px-selo {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--rg-space-2);
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-semibold);
  white-space: nowrap;
}

.px-selo--success { background: var(--rg-color-feedback-success-soft); color: var(--rg-color-feedback-success); }
.px-selo--info { background: var(--rg-color-feedback-info-soft); color: var(--rg-color-feedback-info); }
.px-selo--warning { background: var(--rg-color-feedback-warning-soft); color: var(--rg-primitive-amber-700); }

.px-oculto {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 40rem) {
  .px-entrega__conteudo { padding: var(--rg-space-8) var(--rg-space-4); }
  .px-entrega__item { flex-wrap: wrap; }
  .px-entrega__start { flex-direction: row; flex-wrap: wrap; width: 100%; }
}
</style>
