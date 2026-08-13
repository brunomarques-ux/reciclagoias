<script setup lang="ts">
/**
 * Explorador de cenários — **ferramenta de protótipo, não faz parte do produto**.
 *
 * Fica no rodapé do menu e abre um painel que edita o mesmo catálogo de
 * `data/mocks/gestora.ts` que a tela consome. Os controles não são escritos à mão:
 * nascem do catálogo, então acrescentar um status ou uma ação lá faz o controle
 * aparecer aqui sozinho.
 *
 * As regras da D-R001 são impostas pela store, não pelo painel: ligar o período
 * restritivo libera a primeira ação e desmarcar a última desliga o período — `n = 0`
 * não é alcançável.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

import { ACOES, CATALOGO_LINHAS, CATALOGO_PRAZOS, LIMITE_SEM_ROLAGEM, PRESETS } from '@/data/mocks/gestora';
import { useExploradorStore } from '@/stores/explorador';
import { COR_TONE } from './tones';

const explorador = useExploradorStore();

const aberto = ref(false);
const raiz = ref<HTMLElement | null>(null);
const gatilho = ref<HTMLButtonElement | null>(null);

const presetAtual = computed(
  () => PRESETS.find((p) => p.id === explorador.presetAtivo)?.nome ?? 'Ajustado à mão',
);

/** Quantas ações cada prazo liberou — é o `n` da decisão. */
const contagens = computed(() =>
  Object.fromEntries(
    CATALOGO_PRAZOS.map((prazo) => [
      prazo.id,
      explorador.prazos[prazo.id]?.liberadas.filter(Boolean).length ?? 0,
    ]),
  ),
);

function explicacao(n: number) {
  if (n === 0) return 'Sem período restritivo: o card mostra a ação que o prazo habilita.';
  if (n === 1) return 'n = 1 · o gatilho vai para o singular; a ação continua fora do card.';
  if (n > LIMITE_SEM_ROLAGEM) return `n = ${n} · o card não cresce e a lista do popover rola.`;
  return `n = ${n} · o gatilho conta e o popover mostra a lista.`;
}

function fechar(devolverFoco = true) {
  if (!aberto.value) return;
  aberto.value = false;
  if (devolverFoco) void nextTick(() => gatilho.value?.focus());
}

function aoClicarFora(evento: MouseEvent) {
  if (!raiz.value?.contains(evento.target as Node)) fechar(false);
}

function aoTeclar(evento: KeyboardEvent) {
  if (evento.key === 'Escape') fechar();
}

watch(aberto, (estaAberto) => {
  if (estaAberto) {
    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoTeclar);
  } else {
    document.removeEventListener('mousedown', aoClicarFora);
    document.removeEventListener('keydown', aoTeclar);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', aoClicarFora);
  document.removeEventListener('keydown', aoTeclar);
});
</script>

<template>
  <div ref="raiz" class="gx-explorador">
    <button
      ref="gatilho"
      type="button"
      class="gx-explorador__gatilho"
      :class="{ 'gx-explorador__gatilho--aberto': aberto }"
      :aria-expanded="aberto"
      aria-controls="gx-explorador-painel"
      @click="aberto = !aberto"
    >
      <v-icon icon="mdi-tune-variant" size="18" aria-hidden="true" />
      <span class="gx-explorador__gatilho-texto">
        <span class="gx-explorador__gatilho-titulo">Explorar cenários</span>
        <span class="gx-explorador__gatilho-preset">{{ presetAtual }}</span>
      </span>
    </button>

    <div v-if="aberto" id="gx-explorador-painel" class="gx-painel">
      <header class="gx-painel__head">
        <div>
          <p class="gx-painel__eyebrow">Protótipo</p>
          <h2 class="gx-painel__titulo">Explorar cenários</h2>
        </div>
        <button type="button" class="gx-painel__fechar" aria-label="Fechar" @click="fechar()">
          <v-icon icon="mdi-close" size="18" />
        </button>
      </header>

      <p class="gx-painel__nota">
        Tudo aqui edita os mocks da tela ao vivo. Não faz parte do produto.
      </p>

      <!-- ---------- Presets ---------- -->
      <section class="gx-painel__bloco">
        <h3 class="gx-painel__secao">Cenários do Figma</h3>
        <div class="gx-painel__chips">
          <button
            v-for="preset in PRESETS"
            :key="preset.id"
            type="button"
            class="gx-chip"
            :class="{ 'gx-chip--ativo': preset.id === explorador.presetAtivo }"
            :title="preset.descricao"
            :aria-pressed="preset.id === explorador.presetAtivo"
            @click="explorador.aplicarPreset(preset.id)"
          >
            {{ preset.nome }}
          </button>
        </div>
      </section>

      <!-- ---------- Status da Documentação ---------- -->
      <section class="gx-painel__bloco">
        <h3 class="gx-painel__secao">Status da Documentação</h3>
        <p class="gx-painel__dica">
          O total é a soma. Com 2 status ou mais a barra empilhada entra; com zero, a linha
          vira frase.
        </p>

        <fieldset v-for="linha in CATALOGO_LINHAS" :key="linha.id" class="gx-grupo">
          <legend class="gx-grupo__titulo">{{ linha.titulo }}</legend>

          <label v-for="status in linha.statuses" :key="status.id" class="gx-linha">
            <input
              type="checkbox"
              class="gx-check"
              :checked="(explorador.quantidades[linha.id]?.[status.id] ?? 0) > 0"
              @change="explorador.alternarStatus(linha.id, status.id)"
            />
            <span class="gx-ponto" :style="{ backgroundColor: COR_TONE[status.tone] }" aria-hidden="true" />
            <span class="gx-linha__rotulo">{{ status.plural }}</span>
            <input
              type="number"
              class="gx-num"
              min="0"
              :aria-label="`Quantidade de ${linha.titulo.toLowerCase()} ${status.plural}`"
              :value="explorador.quantidades[linha.id]?.[status.id] ?? 0"
              @input="
                explorador.definirQuantidade(
                  linha.id,
                  status.id,
                  Number(($event.target as HTMLInputElement).value),
                )
              "
            />
          </label>
        </fieldset>
      </section>

      <!-- ---------- Prazos ---------- -->
      <section class="gx-painel__bloco">
        <h3 class="gx-painel__secao">Período restritivo</h3>
        <p class="gx-painel__dica">
          O estado é por card. Ligar libera a primeira ação; desmarcar a última desliga o
          período — não existe vigência restritiva com zero ações.
        </p>

        <fieldset v-for="prazo in CATALOGO_PRAZOS" :key="prazo.id" class="gx-grupo">
          <legend class="gx-grupo__titulo">{{ prazo.nome }}</legend>

          <label class="gx-switch">
            <input
              type="checkbox"
              class="gx-switch__input"
              :checked="contagens[prazo.id] > 0"
              @change="explorador.alternarRestritivo(prazo.id)"
            />
            <span class="gx-switch__trilho" aria-hidden="true"><span class="gx-switch__bolinha" /></span>
            <span class="gx-switch__rotulo">Período restritivo</span>
          </label>

          <p class="gx-grupo__estado">{{ explicacao(contagens[prazo.id] ?? 0) }}</p>

          <div v-if="contagens[prazo.id] > 0" class="gx-acoes">
            <label v-for="(acao, indice) in ACOES" :key="acao" class="gx-linha">
              <input
                type="checkbox"
                class="gx-check"
                :checked="explorador.prazos[prazo.id]?.liberadas[indice] ?? false"
                @change="explorador.alternarAcao(prazo.id, indice)"
              />
              <span class="gx-linha__rotulo">{{ acao }}</span>
            </label>
          </div>
        </fieldset>
      </section>
    </div>
  </div>
</template>

<style scoped>
.gx-explorador {
  position: relative;
}

/* ============ Gatilho no rodapé do menu ============ */
.gx-explorador__gatilho {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  width: 100%;
  padding: var(--rg-space-2) var(--rg-space-3);
  border: 1px dashed var(--rg-color-border-base);
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-color-surface-muted);
  color: var(--rg-color-text-secondary);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.gx-explorador__gatilho:hover,
.gx-explorador__gatilho--aberto {
  background-color: var(--rg-color-surface-subtle);
  border-color: var(--rg-color-border-strong);
}

.gx-explorador__gatilho:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.gx-explorador__gatilho-texto {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.gx-explorador__gatilho-titulo {
  font-size: 13px;
  line-height: 18px;
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-primary);
}

.gx-explorador__gatilho-preset {
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  color: var(--rg-color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ============ Painel ============ */
.gx-painel {
  position: absolute;
  bottom: calc(100% + var(--rg-space-2));
  left: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
  width: 336px;
  max-width: calc(100vw - var(--rg-space-6));
  max-height: min(72vh, 640px);
  padding: var(--rg-space-4);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-raised);
  box-shadow: var(--rg-elevation-4);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.gx-painel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rg-space-3);
}

.gx-painel__eyebrow {
  margin: 0;
  font-size: var(--rg-font-size-2xs);
  line-height: 14px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
}

.gx-painel__titulo {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: 22px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-painel__fechar {
  display: grid;
  place-items: center;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--rg-color-text-muted);
  cursor: pointer;
}

.gx-painel__fechar:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
  border-radius: var(--rg-radius-xs);
}

.gx-painel__nota,
.gx-painel__dica {
  margin: 0;
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  color: var(--rg-color-text-muted);
}

.gx-painel__bloco {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  padding-top: var(--rg-space-4);
  border-top: 1px solid var(--rg-color-border-subtle);
}

.gx-painel__secao {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-painel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--rg-space-2);
}

.gx-chip {
  padding: var(--rg-space-1) 10px;
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-pill);
  background-color: transparent;
  font-family: inherit;
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
  cursor: pointer;
}

.gx-chip:hover {
  border-color: var(--rg-color-border-brand);
  color: var(--rg-color-text-brand);
}

.gx-chip--ativo {
  border-color: var(--rg-color-border-brand);
  background-color: var(--rg-color-surface-brand);
  color: var(--rg-color-text-brand);
}

.gx-chip:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

/* ============ Grupos de controle ============ */
.gx-grupo {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  margin: 0;
  padding: var(--rg-space-3);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-color-surface-muted);
}

.gx-grupo__titulo {
  padding: 0;
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-grupo__estado {
  margin: 0;
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  color: var(--rg-color-text-secondary);
}

.gx-linha {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
  cursor: pointer;
}

.gx-linha__rotulo {
  flex: 1;
  min-width: 0;
}

.gx-check {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--rg-color-action-primary);
  cursor: pointer;
}

.gx-ponto {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: var(--rg-radius-pill);
}

.gx-num {
  width: 60px;
  height: 28px;
  padding: 0 var(--rg-space-2);
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-sm);
  background-color: var(--rg-color-surface-raised);
  font-family: inherit;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-primary);
}

.gx-num:focus-visible {
  outline: none;
  border-color: var(--rg-color-action-primary);
  box-shadow: var(--rg-ring-focus);
}

.gx-acoes {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  max-height: 176px;
  padding-right: var(--rg-space-2);
  overflow-y: auto;
  scrollbar-width: thin;
}

/* ============ Switch ============ */
.gx-switch {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  cursor: pointer;
}

.gx-switch__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.gx-switch__trilho {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 20px;
  padding: 2px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-border-base);
  transition: background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.gx-switch__bolinha {
  width: 16px;
  height: 16px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-surface-raised);
  transition: transform var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.gx-switch__input:checked + .gx-switch__trilho {
  background-color: var(--rg-color-action-primary);
}

.gx-switch__input:checked + .gx-switch__trilho .gx-switch__bolinha {
  transform: translateX(16px);
}

.gx-switch__input:focus-visible + .gx-switch__trilho {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.gx-switch__rotulo {
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-primary);
}

/* Na trilha de ícones sobra só o ícone; o painel continua com a largura cheia. */
@media (max-width: 1023px) {
  .gx-explorador__gatilho {
    justify-content: center;
    padding-inline: 0;
  }

  .gx-explorador__gatilho-texto {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gx-switch__trilho,
  .gx-switch__bolinha {
    transition: none;
  }
}
</style>
