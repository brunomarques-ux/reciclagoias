<script setup lang="ts">
/**
 * /fluxos · "Fluxos do protótipo" (camada do protótipo, fora do produto; carrega sob demanda e não pede perfil).
 * Reescrita em Vue da página Fluxos.tsx do SISLOG: os blocos na ordem de dados/index.ts; dentro de cada bloco,
 * primeiro os fluxos principais (e alternativos) e depois os de exceção. Cada fluxo: o título, o tipo, a abertura em
 * até duas linhas, as regras que ele demonstra, os passos e os dois começos: Iniciar automático (o cursor faz, quem
 * apresenta narra) e Iniciar manual (o painel diz o gesto e espera).
 *
 * Sem fluxo escrito, a página mostra um estado vazio com os blocos que vão receber os fluxos.
 */
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { ROTULO_DO_TIPO_DE_FLUXO, type Fluxo } from './tipos';
import { COR_DO_TIPO_DE_FLUXO } from './rotulos';
import { BLOCOS, todosOsFluxos } from './registro';
import { iniciarFluxo } from './iniciar';
import type { ModoDoFluxo } from './sessao';
import BotaoDoFluxo from './BotaoDoFluxo.vue';

const router = useRouter();
const fluxos = todosOsFluxos();

interface ItemDaLista {
  f: Fluxo;
  n: number;
}

/** Os blocos com fluxo, cada um com os principais (e alternativos) e as exceções, numerados em sequência. */
const secoes = computed(() =>
  BLOCOS.map((b) => {
    const doBloco = fluxos.filter((f) => f.bloco === b.id);
    let n = 0;
    const principais: ItemDaLista[] = doBloco.filter((f) => f.tipo !== 'excecao').map((f) => ({ f, n: ++n }));
    const excecoes: ItemDaLista[] = doBloco.filter((f) => f.tipo === 'excecao').map((f) => ({ f, n: ++n }));
    return {
      bloco: b,
      principais,
      excecoes,
      tituloPrincipais: principais.some((i) => i.f.tipo === 'alternativo') ? 'Fluxos principais e alternativos' : 'Fluxos principais',
    };
  }).filter((s) => s.principais.length || s.excecoes.length),
);

/** Os nomes dos blocos para o estado vazio: "Operador logístico e Análise no Admin". */
const nomesDosBlocos = computed(() => {
  const nomes = BLOCOS.map((b) => b.titulo);
  return nomes.length > 1 ? `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}` : (nomes[0] ?? '');
});

function iniciar(f: Fluxo, modo: ModoDoFluxo) {
  iniciarFluxo(f, modo);
}
function textoDosPassos(f: Fluxo) {
  return f.passos.length === 1 ? '1 passo' : `${f.passos.length} passos`;
}
/** A mesma referência pode vir em várias regras: uma vez só. */
function textoDasRegras(f: Fluxo) {
  return [...new Set(f.regras.map((r) => r.ref))].join(' · ');
}
</script>

<template>
  <div class="fx-fluxos">
    <main class="fx-fluxos__conteudo">
      <header class="fx-fluxos__header">
        <p class="fx-fluxos__eyebrow">Protótipo · fora do desenho</p>
        <h1 class="fx-fluxos__title">Fluxos do protótipo</h1>
        <p class="fx-fluxos__lead">
          Percursos guiados pelas telas do protótipo do Recicla Goiás. Cada fluxo abre o protótipo no perfil e na tela
          certos, com um painel no canto inferior direito.
        </p>
        <p class="fx-fluxos__lead">
          No automático, um cursor vai devagar até o alvo e faz o gesto: você só narra. No manual, o painel diz o gesto,
          o alvo fica destacado e o passo avança quando você faz.
        </p>
        <div class="fx-fluxos__actions">
          <BotaoDoFluxo
            rotulo="Voltar ao protótipo"
            variante="contorno"
            tom="neutro"
            icone="mdi-arrow-left"
            @click="router.push('/entrar')"
          />
        </div>
      </header>

      <section v-if="!secoes.length" class="fx-fluxos__vazio" aria-labelledby="fx-fluxos-vazio">
        <span class="fx-fluxos__vazio-icone" aria-hidden="true">
          <v-icon icon="mdi-cursor-default-click-outline" size="24" />
        </span>
        <h2 id="fx-fluxos-vazio" class="fx-fluxos__vazio-titulo">Nenhum fluxo pronto ainda</h2>
        <p class="fx-fluxos__vazio-texto">
          Os fluxos de {{ nomesDosBlocos }} aparecem aqui assim que forem escritos, cada um com Iniciar automático e
          Iniciar manual.
        </p>
      </section>

      <section
        v-for="s in secoes"
        :key="s.bloco.id"
        class="fx-fluxos__section"
        :aria-labelledby="`fx-fluxos-${s.bloco.id}`"
      >
        <h2 :id="`fx-fluxos-${s.bloco.id}`" class="fx-fluxos__section-title">{{ s.bloco.titulo }}</h2>
        <p v-if="s.bloco.resumo" class="fx-fluxos__section-lead">{{ s.bloco.resumo }}</p>

        <template v-for="grupo in [
          { titulo: s.tituloPrincipais, itens: s.principais },
          { titulo: 'Fluxos de exceção', itens: s.excecoes },
        ]" :key="grupo.titulo">
          <template v-if="grupo.itens.length">
            <h3 class="fx-fluxos__group-title">{{ grupo.titulo }}</h3>
            <ol class="fx-fluxos__list" :start="grupo.itens[0].n">
              <li v-for="{ f, n } in grupo.itens" :key="f.id" class="fx-fluxos__item">
                <span class="fx-fluxos__n" aria-hidden="true">{{ n }}</span>
                <div class="fx-fluxos__body">
                  <div class="fx-fluxos__item-head">
                    <h4 class="fx-fluxos__item-title">{{ f.titulo }}</h4>
                    <span class="fx-selo" :class="`fx-selo--${COR_DO_TIPO_DE_FLUXO[f.tipo]}`">{{ ROTULO_DO_TIPO_DE_FLUXO[f.tipo] }}</span>
                  </div>
                  <p v-if="f.apresentacao" class="fx-fluxos__intro">{{ f.apresentacao }}</p>
                  <p class="fx-fluxos__meta">
                    {{ textoDosPassos(f) }}<template v-if="textoDasRegras(f)"> · Regras: {{ textoDasRegras(f) }}</template>
                  </p>
                </div>
                <div class="fx-fluxos__start">
                  <BotaoDoFluxo
                    rotulo="Iniciar automático"
                    icone="mdi-arrow-right"
                    :aria-label="`Iniciar automático: ${f.titulo}`"
                    @click="iniciar(f, 'auto')"
                  />
                  <BotaoDoFluxo
                    rotulo="Iniciar manual"
                    variante="contorno"
                    tom="neutro"
                    icone="mdi-cursor-default-click-outline"
                    :aria-label="`Iniciar manual: ${f.titulo}`"
                    @click="iniciar(f, 'manual')"
                  />
                </div>
              </li>
            </ol>
          </template>
        </template>
      </section>
    </main>
  </div>
</template>

<style scoped>
.fx-fluxos {
  min-height: 100vh;
  background-color: var(--rg-color-surface-muted);
  color: var(--rg-color-text-primary);
}
.fx-fluxos__conteudo {
  box-sizing: border-box;
  max-width: 64rem;
  margin: 0 auto;
  padding: var(--rg-space-10) var(--rg-space-6);
}
.fx-fluxos__header { margin-bottom: var(--rg-space-8); }
.fx-fluxos__eyebrow {
  margin: 0 0 var(--rg-space-1);
  color: var(--rg-color-text-secondary);
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
}
.fx-fluxos__title {
  margin: 0 0 var(--rg-space-3);
  font-size: 28px;
  line-height: 34px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}
.fx-fluxos__lead {
  max-width: 48rem;
  margin: 0 0 var(--rg-space-3);
  font-size: var(--rg-font-size-md);
  line-height: 24px;
  color: var(--rg-color-text-secondary);
}
.fx-fluxos__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rg-space-3);
  margin-top: var(--rg-space-4);
}

/* o estado vazio: o que a página vai mostrar e de onde vem, sem parecer erro */
.fx-fluxos__vazio {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--rg-space-2);
  padding: var(--rg-space-8);
  border: 2px dashed var(--rg-color-border-strong);
  border-radius: var(--rg-radius-lg);
  background: var(--rg-color-surface-raised);
}
.fx-fluxos__vazio-icone {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-bottom: var(--rg-space-2);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-brand);
  color: var(--rg-color-text-brand);
}
.fx-fluxos__vazio-titulo {
  margin: 0;
  font-size: var(--rg-font-size-lg);
  line-height: 26px;
  font-weight: var(--rg-font-weight-semibold);
}
.fx-fluxos__vazio-texto {
  margin: 0;
  max-width: 40rem;
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  color: var(--rg-color-text-secondary);
}

.fx-fluxos__section { margin-bottom: var(--rg-space-10); }
.fx-fluxos__section-title {
  margin: 0;
  font-size: var(--rg-font-size-xl);
  line-height: 28px;
  font-weight: var(--rg-font-weight-semibold);
}
.fx-fluxos__section-lead {
  margin: var(--rg-space-1) 0 0;
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  color: var(--rg-color-text-secondary);
}
.fx-fluxos__group-title {
  margin: var(--rg-space-5) 0 var(--rg-space-2);
  color: var(--rg-color-text-secondary);
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
}
.fx-fluxos__list {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
.fx-fluxos__item {
  display: flex;
  align-items: flex-start;
  gap: var(--rg-space-4);
  padding: var(--rg-space-4);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background: var(--rg-color-surface-raised);
}
.fx-fluxos__n {
  flex: none;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--rg-radius-pill);
  background: var(--rg-color-surface-subtle);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
}
.fx-fluxos__body { flex: 1; min-width: 0; }
.fx-fluxos__item-head { display: flex; flex-wrap: wrap; align-items: center; gap: var(--rg-space-2); }
.fx-fluxos__item-title {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: 24px;
  font-weight: var(--rg-font-weight-semibold);
}
.fx-fluxos__intro {
  display: -webkit-box;
  margin: var(--rg-space-1) 0 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
}
.fx-fluxos__meta {
  margin: var(--rg-space-1) 0 0;
  color: var(--rg-color-text-secondary);
  font-size: 13px;
  line-height: 18px;
}
.fx-fluxos__start {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--rg-space-2);
  align-self: center;
}

/* o selo do tipo de fluxo (o mesmo do painel) */
.fx-selo {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--rg-space-2);
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-semibold);
  white-space: nowrap;
}
.fx-selo--success { background: var(--rg-color-feedback-success-soft); color: var(--rg-color-feedback-success); }
.fx-selo--info { background: var(--rg-color-feedback-info-soft); color: var(--rg-color-feedback-info); }
.fx-selo--warning { background: var(--rg-color-feedback-warning-soft); color: var(--rg-primitive-amber-700); }
.fx-selo--danger { background: var(--rg-color-feedback-danger-soft); color: var(--rg-color-feedback-danger); }
.fx-selo--neutral { background: var(--rg-color-surface-subtle); color: var(--rg-color-text-secondary); }

@media (max-width: 40rem) {
  .fx-fluxos__conteudo { padding: var(--rg-space-8) var(--rg-space-4); }
  .fx-fluxos__item { flex-wrap: wrap; }
  .fx-fluxos__start { flex-direction: row; flex-wrap: wrap; width: 100%; }
}
</style>
