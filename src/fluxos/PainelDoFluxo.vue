<script setup lang="ts">
/**
 * O painel do fluxo guiado ativo: camada do protótipo, FORA DO PRODUTO. Reescrita em Vue do PainelDoFluxo.tsx do
 * SISLOG (entrega 14, 03/11/2026), com o mesmo comportamento e os mesmos textos. A raiz (RaizDosFluxos.vue) monta
 * este painel sob demanda, só com um fluxo ativo (sessao.ts); nenhuma tela do produto o conhece.
 *
 * No canto inferior direito, compacto (cerca de 380), tracejado e marcado como do protótipo. Mostra o bloco, o tipo
 * e o título; a abertura e as regras ("Sobre o fluxo", recolhido sempre, também no passo 1); os passos com o estado
 * (feito com ✓, o atual com o número, o que falta só com o contorno); o andamento ("Passo 2 de 4" e o estado:
 * Pronto, Sua vez, Executando, Pausado, Feito, Interrompido, Fluxo concluído); o gesto, em destaque, e o "Observe"; e
 * os controles, em três níveis: a ação principal numa linha inteira (Executar passo N, Pausar, Continuar), a
 * navegação (Anterior, Repetir passo, Próximo) e, mais quietos, o modo, a velocidade, Reproduzir tudo e a Lista de
 * fluxos. Nenhum botão passa da borda: as linhas quebram antes de vazar. A posição na tela é do posicao.ts (que
 * escreve data-desvio e data-apertado direto no <aside>). Recolhe numa linha. O cabeçalho e as ações ficam sempre à
 * vista; o corpo rola por dentro.
 *
 * Enquanto o passo executa, o painel fica compacto sozinho (o título, o andamento e o Pausar) e abre de novo no
 * "Feito". O erro vira um aviso com a saída: o botão Repetir passo dentro dele e o detalhe técnico só no title.
 */
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { useRouter } from 'vue-router';

import { ROTULO_DO_TIPO_DE_FLUXO } from './tipos';
import { COR_DO_TIPO_DE_FLUXO, type TomDoSelo } from './rotulos';
import { BLOCOS, fluxoPorId, proximoFluxo } from './registro';
import { atualizarFluxoAtivo, definirFluxoAtivo, useFluxoAtivo, type ModoDoFluxo, type VelocidadeDoFluxo } from './sessao';
import {
  anterior, cancelar, continuar, entendi, executarPassoAtual, irPara, pausar, preparar, proximo, recomecar, repetir,
  retomarDepoisDoF5, sincronizarManual, useStatusDoFluxo,
} from './execucao';
import { rotuloDaAcao } from './motor';
import { iniciarFluxo } from './iniciar';
import BotaoDoFluxo from './BotaoDoFluxo.vue';

const router = useRouter();
const ativo = useFluxoAtivo();
const status = useStatusDoFluxo();
const tituloId = useId();
const sobreId = useId();
const sobreAberto = ref(false);

const fluxo = computed(() => fluxoPorId(ativo.value?.id));

// depois do F5 no meio do fluxo, refaz a tela até o passo; depois de uma carga nossa (Iniciar, Anterior, Repetir),
// refaz rápido o que vem antes do passo
watch(
  [() => ativo.value?.id, () => ativo.value?.preparar],
  () => {
    if (retomarDepoisDoF5()) return;
    if (ativo.value?.preparar) void preparar();
  },
  { immediate: true },
);
// o manual acompanha a ação atual (o passo, o modo e o feito mudam o que se acompanha)
watch(
  [() => ativo.value?.id, () => ativo.value?.passo, () => ativo.value?.modo, () => ativo.value?.feito, () => ativo.value?.preparar],
  () => sincronizarManual(),
  { immediate: true },
);
// a abertura e as regras: recolhidas sempre, também no passo 1; cada fluxo começa recolhido
watch(
  () => ativo.value?.id,
  () => {
    sobreAberto.value = false;
  },
);

// Mexer no painel não é "clicar fora" da tela: um popover ou menu que fecha num pointerdown fora dele (ouvido na
// captura do document) não pode fechar quando se clica em Pausar ou Continuar no meio de um passo.
function segurar(e: Event) {
  const painel = document.querySelector('[data-prototipo="fluxo-painel"]');
  if (painel && e.target instanceof Node && painel.contains(e.target)) e.stopPropagation();
}
onMounted(() => window.addEventListener('pointerdown', segurar, true));
onBeforeUnmount(() => window.removeEventListener('pointerdown', segurar, true));

const total = computed(() => fluxo.value?.passos.length ?? 0);
const passo = computed(() => Math.min(Math.max(ativo.value?.passo ?? 0, 0), Math.max(total.value - 1, 0)));
const atual = computed(() => fluxo.value?.passos[passo.value]);
const bloco = computed(() => BLOCOS.find((b) => b.id === fluxo.value?.bloco));
const proxFluxo = computed(() => (fluxo.value ? proximoFluxo(fluxo.value.id) : undefined));
const auto = computed(() => ativo.value?.modo === 'auto');
const recolhido = computed(() => !!ativo.value?.recolhido);
const feito = computed(() => !!ativo.value?.feito);
const preparando = computed(() => status.value.fase === 'preparando' || !!ativo.value?.preparar);
const rodando = computed(() => status.value.fase === 'executando' || status.value.fase === 'pausado');
const ocupado = computed(() => preparando.value || rodando.value);
const concluido = computed(() => !!ativo.value?.concluido);
const nRegras = computed(() => fluxo.value?.regras.length ?? 0);
const acaoAgora = computed(() => {
  const p = atual.value;
  if (!p || !p.acoes.length) return undefined;
  const mostra = rodando.value || (!auto.value && !feito.value && !concluido.value);
  return mostra ? p.acoes[Math.min(status.value.acao, p.acoes.length - 1)] : undefined;
});

function trocarModo(m: ModoDoFluxo) {
  if (m === ativo.value?.modo) return;
  cancelar();
  atualizarFluxoAtivo({ modo: m });
}
function trocarVelocidade(v: VelocidadeDoFluxo) {
  atualizarFluxoAtivo({ velocidade: v });
}
function alternarRecolhido() {
  atualizarFluxoAtivo({ recolhido: !recolhido.value });
}
function encerrar() {
  definirFluxoAtivo(null);
}
function listaDeFluxos() {
  definirFluxoAtivo(null);
  void router.push('/fluxos');
}
function iniciarProximo() {
  if (proxFluxo.value && ativo.value) iniciarFluxo(proxFluxo.value, ativo.value.modo);
}

/** O botão principal do automático. */
const principal = computed(() => {
  if (status.value.fase === 'executando') return { rotulo: 'Pausar', icone: 'mdi-pause', acao: pausar };
  if (status.value.fase === 'pausado') return { rotulo: 'Continuar', icone: 'mdi-play', acao: continuar };
  if (feito.value && passo.value + 1 < total.value) {
    return { rotulo: `Executar passo ${passo.value + 2}`, icone: 'mdi-play', acao: () => void executarPassoAtual() };
  }
  return { rotulo: 'Executar passo', icone: 'mdi-play', acao: () => void executarPassoAtual() };
});

/** O estado do passo, legível de relance ao lado do "Passo 2 de 4" (o data-estado serve ao posicao.ts e a testes). */
const estado = computed<{ id: string; rotulo: string; tom: TomDoSelo }>(() => {
  if (preparando.value) return { id: 'preparando', rotulo: 'Preparando a tela', tom: 'neutral' };
  if (concluido.value) return { id: 'concluido', rotulo: 'Fluxo concluído', tom: 'success' };
  if (status.value.fase === 'pausado') return { id: 'pausado', rotulo: 'Pausado', tom: 'warning' };
  if (status.value.fase === 'executando') return { id: 'executando', rotulo: 'Executando', tom: 'info' };
  if (status.value.erro) return { id: 'erro', rotulo: 'Interrompido', tom: 'danger' };
  if (feito.value) return { id: 'feito', rotulo: 'Feito', tom: 'success' };
  if (auto.value) return { id: 'pronto', rotulo: 'Pronto', tom: 'neutral' };
  return { id: 'sua-vez', rotulo: 'Sua vez', tom: 'info' };
});

function estadoDoPasso(i: number): 'feito' | 'atual' | 'a fazer' {
  if (i < passo.value || (i === passo.value && (feito.value || concluido.value))) return 'feito';
  return i === passo.value ? 'atual' : 'a fazer';
}
</script>

<template>
  <Teleport to="body">
    <!-- o fluxo da sessão não existe mais nos dados -->
    <aside
      v-if="ativo && !fluxo"
      class="fx-painel"
      data-prototipo="fluxo-painel"
      :aria-labelledby="tituloId"
    >
      <header class="fx-painel__header">
        <div class="fx-painel__bar">
          <p class="fx-painel__eyebrow">Protótipo · fluxo guiado</p>
          <button type="button" class="fx-painel__icone" aria-label="Encerrar o fluxo" title="Encerrar o fluxo" @click="encerrar">
            <v-icon icon="mdi-close" size="18" aria-hidden="true" />
          </button>
        </div>
        <h2 :id="tituloId" class="fx-painel__title">Fluxo não encontrado</h2>
      </header>
      <div class="fx-painel__body">
        <p class="fx-painel__note">Este fluxo não existe mais na lista. Escolha outro em Fluxos do protótipo.</p>
      </div>
      <footer class="fx-painel__footer">
        <BotaoDoFluxo rotulo="Lista de fluxos" variante="contorno" tom="neutro" icone="mdi-arrow-left" @click="listaDeFluxos" />
      </footer>
    </aside>

    <aside
      v-else-if="ativo && fluxo && atual"
      class="fx-painel"
      data-prototipo="fluxo-painel"
      :data-recolhido="recolhido || undefined"
      :data-compacto="rodando || undefined"
      :aria-labelledby="tituloId"
      @mousedown.prevent
    >
      <!-- @mousedown.prevent: o clique do mouse no painel não tira o foco da tela (um campo ou menu que fecha ao
           perder o foco continua aberto); pelo teclado, o foco entra normalmente -->
      <header class="fx-painel__header">
        <div class="fx-painel__bar">
          <p class="fx-painel__eyebrow">Protótipo · fluxo guiado</p>
          <button
            type="button"
            class="fx-painel__icone"
            :aria-label="recolhido ? 'Expandir o painel do fluxo' : 'Recolher o painel do fluxo'"
            :title="recolhido ? 'Expandir o painel do fluxo' : 'Recolher o painel do fluxo'"
            :aria-expanded="!recolhido"
            @click="alternarRecolhido"
          >
            <v-icon :icon="recolhido ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="18" aria-hidden="true" />
          </button>
          <button type="button" class="fx-painel__icone" aria-label="Encerrar o fluxo" title="Encerrar o fluxo" @click="encerrar">
            <v-icon icon="mdi-close" size="18" aria-hidden="true" />
          </button>
        </div>
        <h2 :id="tituloId" class="fx-painel__title">{{ fluxo.titulo }}</h2>
        <p v-if="!recolhido" class="fx-painel__block">
          <span v-if="bloco">{{ bloco.titulo }}</span>
          <span class="fx-selo" :class="`fx-selo--${COR_DO_TIPO_DE_FLUXO[fluxo.tipo]}`">{{ ROTULO_DO_TIPO_DE_FLUXO[fluxo.tipo] }}</span>
        </p>
      </header>

      <div v-if="!recolhido" class="fx-painel__body">
        <div v-if="fluxo.apresentacao || nRegras > 0" class="fx-painel__about">
          <button
            type="button"
            class="fx-painel__about-toggle"
            :aria-expanded="sobreAberto"
            :aria-controls="sobreId"
            @click="sobreAberto = !sobreAberto"
          >
            <span class="fx-painel__about-title">Sobre o fluxo</span>
            <span v-if="nRegras > 0" class="fx-painel__about-meta">{{ nRegras === 1 ? '1 regra' : `${nRegras} regras` }}</span>
            <span class="fx-painel__chevron" :class="{ 'is-aberto': sobreAberto }" aria-hidden="true" />
          </button>
          <div :id="sobreId" :hidden="!sobreAberto" class="fx-painel__about-body">
            <p v-if="fluxo.apresentacao" class="fx-painel__intro">{{ fluxo.apresentacao }}</p>
            <ul v-if="fluxo.regras.length" class="fx-painel__rules" aria-label="Regras do documento">
              <li v-for="r in fluxo.regras" :key="r.ref + r.texto">
                <span class="fx-painel__rule-ref">{{ r.ref }}</span> {{ r.texto }}
              </li>
            </ul>
          </div>
        </div>

        <ol class="fx-painel__steps" aria-label="Passos do fluxo">
          <li v-for="(p, i) in fluxo.passos" :key="i">
            <button
              type="button"
              class="fx-painel__step-n"
              :aria-current="i === passo ? 'step' : undefined"
              :data-feito="estadoDoPasso(i) === 'feito' || undefined"
              :aria-label="`Ir para o passo ${i + 1} (${estadoDoPasso(i)}): ${p.fazer}`"
              :title="`Passo ${i + 1} (${estadoDoPasso(i)}): ${p.fazer}`"
              :disabled="ocupado"
              @click="irPara(i)"
            >
              <!-- o atual mostra sempre o número; o feito, o ✓ -->
              <v-icon v-if="estadoDoPasso(i) === 'feito' && i !== passo" icon="mdi-check" size="16" aria-hidden="true" />
              <template v-else>{{ i + 1 }}</template>
            </button>
          </li>
        </ol>

        <div class="fx-painel__step" :data-estado="estado.id" :data-feito="feito || undefined">
          <div class="fx-painel__step-head" aria-live="polite">
            <p class="fx-painel__count">
              <span>Passo {{ passo + 1 }} de {{ total }}</span>
              <span class="fx-painel__sr">: </span>
              <span class="fx-selo fx-painel__state" :class="`fx-selo--${estado.tom}`">{{ estado.rotulo }}</span>
            </p>
            <p class="fx-painel__do">{{ atual.fazer }}</p>
          </div>
          <div v-if="atual.observar" class="fx-painel__see">
            <p class="fx-painel__see-label">Observe</p>
            <p class="fx-painel__see-text">{{ atual.observar }}</p>
          </div>
          <p v-if="acaoAgora && acaoAgora.tipo !== 'esperar' && !preparando" class="fx-painel__now">
            <span class="fx-painel__now-dot" aria-hidden="true" /> {{ rotuloDaAcao(acaoAgora) }}
          </p>
          <div v-if="!auto && status.esperaEntendi && !concluido" class="fx-painel__ok">
            <BotaoDoFluxo rotulo="Entendi" icone="mdi-check" @click="entendi" />
          </div>
          <div v-if="status.erro" class="fx-painel__error" role="alert" :title="status.erro.detalhe">
            <p class="fx-painel__error-text">{{ status.erro.texto }}</p>
            <BotaoDoFluxo rotulo="Repetir passo" icone="mdi-replay" variante="contorno" tom="neutro" @click="repetir" />
          </div>
        </div>
      </div>
      <!-- o aviso de erro fica visível também com o painel recolhido -->
      <div v-else-if="status.erro" class="fx-painel__body">
        <div class="fx-painel__error" role="alert" :title="status.erro.detalhe">
          <p class="fx-painel__error-text">{{ status.erro.texto }}</p>
          <BotaoDoFluxo rotulo="Repetir passo" icone="mdi-replay" variante="contorno" tom="neutro" @click="repetir" />
        </div>
      </div>

      <!-- três níveis: a ação principal (linha inteira), a navegação e, mais quietos, o modo e as saídas. As linhas
           quebram antes de um botão vazar da borda. -->
      <footer class="fx-painel__footer">
        <template v-if="concluido">
          <BotaoDoFluxo
            v-if="proxFluxo"
            class="fx-painel__primary"
            rotulo="Próximo fluxo"
            tamanho="medio"
            icone-fim="mdi-arrow-right"
            @click="iniciarProximo"
          />
          <p v-else class="fx-painel__last">Último fluxo da lista</p>
          <div class="fx-painel__row fx-painel__nav">
            <BotaoDoFluxo rotulo="Recomeçar" icone="mdi-replay" variante="contorno" tom="neutro" @click="recomecar" />
            <BotaoDoFluxo v-if="!recolhido" rotulo="Lista de fluxos" icone="mdi-arrow-left" variante="fantasma" tom="neutro" @click="listaDeFluxos" />
          </div>
        </template>
        <template v-else>
          <BotaoDoFluxo
            v-if="auto"
            class="fx-painel__primary"
            tamanho="medio"
            :rotulo="principal.rotulo"
            :icone="principal.icone"
            :disabled="preparando"
            @click="principal.acao"
          />
          <div class="fx-painel__row fx-painel__nav">
            <BotaoDoFluxo
              rotulo="Anterior"
              variante="contorno"
              tom="neutro"
              icone="mdi-chevron-left"
              :disabled="ocupado || passo === 0"
              @click="anterior"
            />
            <BotaoDoFluxo
              v-if="auto"
              rotulo="Repetir passo"
              icone="mdi-replay"
              variante="fantasma"
              tom="neutro"
              :disabled="preparando"
              @click="repetir"
            />
            <BotaoDoFluxo
              rotulo="Próximo"
              variante="contorno"
              tom="neutro"
              icone-fim="mdi-chevron-right"
              :disabled="ocupado"
              @click="proximo"
            />
          </div>
          <div v-if="!recolhido" class="fx-painel__settings">
            <p v-if="!auto" class="fx-painel__hint">O passo avança quando você faz o gesto destacado. Próximo pula o passo.</p>
            <div class="fx-painel__row">
              <div class="fx-painel__segmented" role="group" aria-label="Modo">
                <button type="button" :aria-pressed="!auto" @click="trocarModo('manual')">Manual</button>
                <button type="button" :aria-pressed="auto" @click="trocarModo('auto')">Automático</button>
              </div>
              <div v-if="auto" class="fx-painel__segmented" role="group" aria-label="Velocidade">
                <button type="button" :aria-pressed="ativo.velocidade !== 'lenta'" @click="trocarVelocidade('normal')">Normal</button>
                <button type="button" :aria-pressed="ativo.velocidade === 'lenta'" @click="trocarVelocidade('lenta')">Lenta</button>
              </div>
              <BotaoDoFluxo v-else rotulo="Lista de fluxos" icone="mdi-arrow-left" variante="fantasma" tom="neutro" @click="listaDeFluxos" />
            </div>
            <div v-if="auto" class="fx-painel__row">
              <BotaoDoFluxo
                rotulo="Reproduzir tudo"
                icone="mdi-fast-forward"
                variante="fantasma"
                :disabled="ocupado"
                @click="executarPassoAtual({ tudo: true })"
              />
              <BotaoDoFluxo rotulo="Lista de fluxos" icone="mdi-arrow-left" variante="fantasma" tom="neutro" @click="listaDeFluxos" />
            </div>
          </div>
        </template>
      </footer>
    </aside>
  </Teleport>
</template>

<style scoped>
/* O painel do fluxo: compacto, no canto inferior direito, acima de tudo. A posição (o canto, os desvios e a altura
   máxima) fica em posicao.css, decidida pelo posicao.ts. Tracejado, como o resto do que é do protótipo. */
.fx-painel {
  --fx-painel-w: 23.75rem; /* 380 */

  /* acima da camada do fluxo (9999), das janelas e do toast. Fora da escala do produto, que não tem token */
  z-index: 10000;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: min(var(--fx-painel-w), calc(100vw - 2 * var(--rg-space-6)));
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 2px dashed var(--rg-color-border-strong);
  border-radius: var(--rg-radius-lg);
  background: var(--rg-color-surface-raised);
  box-shadow: var(--rg-elevation-2);
  color: var(--rg-color-text-primary);
  font-family: var(--rg-font-family-sans);
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  animation: fx-painel-subir var(--rg-motion-duration-base) var(--rg-motion-ease-standard) backwards;
}
@keyframes fx-painel-subir {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
@keyframes fx-painel-surgir {
  from { opacity: 0; }
  to { opacity: 1; }
}
.fx-painel p { margin: 0; }
.fx-painel__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* o cabeçalho e as ações ficam sempre à vista; o corpo rola por dentro */
.fx-painel__header,
.fx-painel__footer { flex: none; }
.fx-painel__header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--rg-space-1) var(--rg-space-1) var(--rg-space-2) var(--rg-space-3);
  border-bottom: 1px solid var(--rg-color-border-subtle);
}
.fx-painel[data-recolhido] .fx-painel__header { border-bottom: 0; }
.fx-painel__bar {
  display: flex;
  align-items: center;
  gap: 2px;
}
.fx-painel__eyebrow {
  flex: 1;
  min-width: 0;
  color: var(--rg-color-text-secondary);
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-medium);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
}
.fx-painel__icone {
  display: grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: var(--rg-radius-md);
  background: transparent;
  color: var(--rg-color-text-secondary);
  cursor: pointer;
}
.fx-painel__icone:hover { background: var(--rg-color-surface-subtle); color: var(--rg-color-text-primary); }
.fx-painel__title {
  margin: 0;
  padding-right: var(--rg-space-2);
  color: var(--rg-color-text-primary);
  font-size: var(--rg-font-size-md);
  line-height: 24px;
  font-weight: var(--rg-font-weight-semibold);
}
.fx-painel__block {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rg-space-1) var(--rg-space-2);
  margin-top: 2px;
  color: var(--rg-color-text-secondary);
}
.fx-painel__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-3);
}
/* o corpo aberto guarda um mínimo à vista (o andamento e o começo do gesto) antes de as ações rolarem */
.fx-painel:not([data-compacto]):not([data-apertado]):not([data-recolhido]) > .fx-painel__body { min-height: 5rem; }
/* janela baixa: o bloco e o tipo saem do cabeçalho (o título fica) e o corpo guarda menos */
@media (max-height: 34rem) {
  .fx-painel__header .fx-painel__block { display: none; }
  .fx-painel:not([data-compacto]):not([data-apertado]):not([data-recolhido]) > .fx-painel__body { min-height: 4rem; }
}

/* o selo do tipo de fluxo e do estado do passo, nos tons de feedback */
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
/* o amarelo de feedback não dá 4,5:1 como texto: o tom escuro da rampa, como no aviso da EntrarPage */
.fx-selo--warning { background: var(--rg-color-feedback-warning-soft); color: var(--rg-primitive-amber-700); }
.fx-selo--danger { background: var(--rg-color-feedback-danger-soft); color: var(--rg-color-feedback-danger); }
.fx-selo--neutral { background: var(--rg-color-surface-subtle); color: var(--rg-color-text-secondary); }

.fx-painel__note { color: var(--rg-color-text-secondary); }

/* a abertura e as regras: recolhidas sempre (a pessoa abre se quiser); o botão diz quantas regras há dentro */
.fx-painel__about {
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-md);
}
.fx-painel__about-toggle {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  width: 100%;
  min-height: 32px;
  padding: 0 var(--rg-space-3);
  border: 0;
  border-radius: var(--rg-radius-md);
  background: transparent;
  color: var(--rg-color-text-primary);
  font: inherit;
  font-weight: var(--rg-font-weight-semibold);
  text-align: left;
  cursor: pointer;
}
.fx-painel__about-toggle:hover { background: var(--rg-color-surface-subtle); }
.fx-painel__about-title { flex: 1; min-width: 0; }
.fx-painel__about-meta {
  color: var(--rg-color-text-secondary);
  font-weight: var(--rg-font-weight-regular);
  white-space: nowrap;
}
.fx-painel__icone:focus-visible,
.fx-painel__about-toggle:focus-visible,
.fx-painel__step-n:focus-visible,
.fx-painel__segmented button:focus-visible {
  outline: none;
  box-shadow: var(--rg-ring-focus);
}
.fx-painel__chevron {
  flex: none;
  width: 0.5rem;
  height: 0.5rem;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: translateY(-2px) rotate(45deg);
  transition: transform var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}
.fx-painel__chevron.is-aberto { transform: translateY(2px) rotate(-135deg); }
.fx-painel__about-body {
  max-height: 13rem; /* muitas regras rolam aqui dentro: o passo atual continua à vista */
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 var(--rg-space-3) var(--rg-space-2);
}
.fx-painel__about-body[hidden] { display: none; }
.fx-painel__rules {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: var(--rg-space-2) 0 0;
  padding: 0;
  list-style: none;
}
.fx-painel__rules li {
  padding: 2px var(--rg-space-2);
  border-left: 2px solid var(--rg-color-border-brand);
  border-radius: var(--rg-radius-sm);
  background: var(--rg-color-surface-brand);
  color: var(--rg-color-text-primary);
}
.fx-painel__rule-ref { font-weight: var(--rg-font-weight-semibold); }
.fx-painel__hint { color: var(--rg-color-text-secondary); }

/* os passos com o estado: o feito com ✓ (verde claro), o atual cheio, com o número, e o que falta só com o contorno */
.fx-painel__steps {
  display: flex;
  flex-wrap: wrap;
  gap: var(--rg-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}
.fx-painel__step-n {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--rg-primitive-neutral-500);
  border-radius: var(--rg-radius-pill);
  background: var(--rg-color-surface-raised);
  color: var(--rg-color-text-primary);
  font: inherit;
  font-weight: var(--rg-font-weight-semibold);
  cursor: pointer;
}
.fx-painel__step-n:hover:not(:disabled) { background: var(--rg-color-surface-subtle); }
.fx-painel__step-n:disabled { cursor: default; }
.fx-painel__step-n[data-feito] {
  border-color: var(--rg-color-action-primary);
  background: var(--rg-color-action-primary-soft);
  color: var(--rg-color-action-primary-hover);
}
.fx-painel__step-n[aria-current='step'] {
  border-color: var(--rg-color-action-primary);
  background: var(--rg-color-action-primary);
  color: var(--rg-color-text-on-brand);
}

/* o passo atual: o andamento ("Passo 2 de 4" e o estado), o gesto em destaque (o principal, maior e mais forte) e o
   "Observe", com rótulo próprio e tom secundário. Nada que se lê fica abaixo de 13 px */
.fx-painel__step {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  padding: var(--rg-space-3);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-brand);
}
.fx-painel__step-head {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
}
.fx-painel__count {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rg-space-1) var(--rg-space-2);
  color: var(--rg-color-text-secondary);
  font-weight: var(--rg-font-weight-semibold);
}
.fx-painel__count .fx-painel__state { font-size: var(--rg-font-size-sm); line-height: 20px; }
.fx-painel__do {
  color: var(--rg-color-text-primary);
  font-size: var(--rg-font-size-md);
  line-height: 24px;
  font-weight: var(--rg-font-weight-semibold);
}
.fx-painel__see {
  padding-left: var(--rg-space-3);
  border-left: 2px solid var(--rg-primitive-neutral-500);
}
.fx-painel__see-label {
  color: var(--rg-color-text-secondary);
  font-weight: var(--rg-font-weight-semibold);
}
.fx-painel__see-text { color: var(--rg-color-text-secondary); }
.fx-painel__now {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  color: var(--rg-color-text-primary);
  font-weight: var(--rg-font-weight-semibold);
}
/* o ponto rosa liga a linha à pílula do destaque na tela (a cor de anotação do protótipo, fora dos tokens) */
.fx-painel__now-dot {
  flex: none;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--rg-radius-pill);
  background: #be226a;
}
/* o aviso de erro: a frase para quem apresenta e a saída (Repetir passo); o detalhe técnico fica no title */
.fx-painel__error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2);
  border-radius: var(--rg-radius-sm);
  background: var(--rg-color-feedback-danger-soft);
  color: var(--rg-color-feedback-danger);
  overflow-wrap: anywhere;
}

/* as ações, em três níveis: a principal numa linha inteira; a navegação; e, separados por um fio e mais quietos, o
   modo, a velocidade, Reproduzir tudo e a Lista de fluxos. A linha que não cabe quebra inteira para baixo */
.fx-painel__footer {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-3) var(--rg-space-3);
  border-top: 1px solid var(--rg-color-border-subtle);
}
.fx-painel__primary { width: 100%; }
.fx-painel__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-2);
}
.fx-painel__row > * { max-width: 100%; }
/* Anterior e Próximo crescem por igual: alvos grandes, a mesma distância do principal */
.fx-painel__nav > .fx-botao { flex: 1 1 auto; }
.fx-painel__nav > .fx-botao--fantasma { flex: 0 1 auto; }
.fx-painel__last {
  color: var(--rg-color-text-secondary);
  font-weight: var(--rg-font-weight-semibold);
  text-align: center;
}
.fx-painel__settings {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  padding-top: var(--rg-space-2);
  border-top: 1px solid var(--rg-color-border-subtle);
}

/* Manual · Automático e Normal · Lenta: botões de 32, o contorno desenhado por dentro (não soma altura) */
.fx-painel__segmented {
  display: inline-flex;
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-subtle);
  box-shadow: inset 0 0 0 1px var(--rg-color-border-base);
}
.fx-painel__segmented button {
  min-height: 32px;
  padding: 0 var(--rg-space-3);
  border: 0;
  border-radius: var(--rg-radius-md);
  background: transparent;
  color: var(--rg-color-text-secondary);
  font: inherit;
  font-weight: var(--rg-font-weight-semibold);
  white-space: nowrap;
  cursor: pointer;
}
.fx-painel__segmented button:hover { color: var(--rg-color-text-primary); }
.fx-painel__segmented button[aria-pressed='true'] {
  background: var(--rg-color-surface-raised);
  color: var(--rg-color-text-primary);
  box-shadow: inset 0 0 0 1px var(--rg-color-border-strong), var(--rg-elevation-1);
}

/* compacto sozinho enquanto o passo executa: o título, o andamento (o passo e a ação atual) e o Pausar, numa linha
   inteira (Anterior e Próximo ficam desligados enquanto roda, então saem). No "Feito" o resto volta, com uma entrada
   de opacidade */
.fx-painel[data-compacto] .fx-painel__block,
.fx-painel[data-compacto] .fx-painel__about,
.fx-painel[data-compacto] .fx-painel__steps,
.fx-painel[data-compacto] .fx-painel__do,
.fx-painel[data-compacto] .fx-painel__see,
.fx-painel[data-compacto] .fx-painel__nav,
.fx-painel[data-compacto] .fx-painel__settings { display: none; }
.fx-painel__about,
.fx-painel__steps,
.fx-painel__do,
.fx-painel__see,
.fx-painel__nav,
.fx-painel__settings { animation: fx-painel-surgir var(--rg-motion-duration-base) var(--rg-motion-ease-standard) backwards; }

@media (prefers-reduced-motion: reduce) {
  .fx-painel,
  .fx-painel__about,
  .fx-painel__steps,
  .fx-painel__do,
  .fx-painel__see,
  .fx-painel__nav,
  .fx-painel__settings { animation: none; }
  .fx-painel__chevron { transition: none; }
}
</style>
