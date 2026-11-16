<script setup lang="ts">
/**
 * PROPOSTA para a SEMAD (planning de 13/11/2026): uma etapa do formulário só em
 * leitura na análise do Admin, sem ✓ e ✕ por campo, com "Apontar problema" no bloco.
 *
 * Figma: `Recicla Goiás - Figma`, seção `6506:4284`, linha L4: L4·1 (`6507:4845`,
 * bloco em leitura, rótulo e valor em três colunas) e L4·4 (`6508:8567`, "Apontar
 * problema" aberto, com a observação obrigatória e Salvar observação).
 *
 * Enquanto a SEMAD não decide, a conferência campo a campo (`AxEtapaConferencia`)
 * continua sendo a que vale. Esta peça só entra com `soDocumentos` ligado na store.
 *
 * Fora do Figma, por decisão de código: o Cancelar do painel (sem ele não há como
 * desistir de um problema apontado por engano) e o estado salvo da observação, que
 * segue o do motivo de documento (texto em leitura com o lápis).
 */
import { computed, nextTick, ref } from 'vue';

import RgButton from '@/components/RgButton.vue';
import { useCadastroAtual } from '@/stores/complemento';

import AxBotaoEditar from './AxBotaoEditar.vue';

const props = defineProps<{
  etapa: number;
  titulo: string;
  abertaInicial?: boolean;
  /** Só leitura: análise concluída, ainda não iniciada ou aberta em Visualizar. */
  leitura: boolean;
}>();

const c = useCadastroAtual(); // o cadastro aberto na página da análise
const aberta = ref(!!props.abertaInicial);

const campos = computed(() => c.campos(props.etapa));
const grupos = computed(() => {
  const mapa = new Map<string, typeof campos.value>();
  for (const campo of campos.value) {
    const lista = mapa.get(campo.grupo) ?? [];
    lista.push(campo);
    mapa.set(campo.grupo, lista);
  }
  return [...mapa.entries()].map(([nome, lista]) => ({ nome, lista }));
});

const chave = computed(() => `etapa-${props.etapa}`);
const problema = computed(() => c.problemas[chave.value]);
const emEdicao = computed(() => !!problema.value && !problema.value.salvo && !props.leitura);
const salvo = computed(() => !!problema.value && (problema.value.salvo || props.leitura) && !!problema.value.texto.trim());

const resumo = computed(() => {
  const n = campos.value.length;
  const base = `${n} ${n === 1 ? 'campo' : 'campos'}`;
  return problema.value ? `${base} · problema apontado` : base;
});

const idConteudo = computed(() => `ax-leitura-${props.etapa}`);
const idTexto = computed(() => `ax-leitura-${props.etapa}-texto`);
const erro = ref(false);
const copia = ref<string | null>(null);
const texto = ref<HTMLTextAreaElement | null>(null);
const editar = ref<InstanceType<typeof AxBotaoEditar> | null>(null);
const apontar = ref<HTMLButtonElement | null>(null);

function apontarProblema() {
  c.apontarProblema(props.etapa);
  aberta.value = true;
  void nextTick(() => texto.value?.focus());
}

function digitar(ev: Event) {
  const alvo = problema.value;
  if (!alvo) return;
  alvo.texto = (ev.target as HTMLTextAreaElement).value;
  if (alvo.texto.trim()) erro.value = false;
}

function salvar() {
  if (!c.salvarProblema(props.etapa)) {
    erro.value = true;
    texto.value?.focus();
    return;
  }
  erro.value = false;
  copia.value = null;
  void nextTick(() => editar.value?.focus());
}

function reabrir() {
  copia.value = problema.value?.texto ?? '';
  c.editarProblema(props.etapa);
  void nextTick(() => texto.value?.focus());
}

/** Na edição do salvo, volta ao texto anterior; no problema novo, retira o problema. */
function cancelar() {
  erro.value = false;
  if (copia.value !== null && problema.value) {
    problema.value.texto = copia.value;
    copia.value = null;
    c.salvarProblema(props.etapa);
    void nextTick(() => editar.value?.focus());
    return;
  }
  c.retirarProblema(props.etapa);
  void nextTick(() => apontar.value?.focus());
}
</script>

<template>
  <section class="ax-leitura">
    <div class="ax-leitura__cab">
      <h3 class="ax-leitura__titulo">
        <button
          type="button"
          class="ax-leitura__alternar"
          :aria-expanded="aberta"
          :aria-controls="idConteudo"
          @click="aberta = !aberta"
        >
          <span class="ax-leitura__marcador" aria-hidden="true">·</span>
          <span class="ax-leitura__textos">
            <span class="ax-leitura__nome">{{ titulo }}</span>
            <span class="ax-leitura__resumo">{{ resumo }}</span>
          </span>
        </button>
      </h3>
      <button
        v-if="!leitura && !problema"
        ref="apontar"
        type="button"
        class="ax-leitura__apontar"
        @click="apontarProblema"
      >
        Apontar problema<span class="ax-oculto"> em {{ titulo }}</span>
      </button>
      <button
        type="button"
        class="ax-leitura__seta"
        :aria-expanded="aberta"
        :aria-controls="idConteudo"
        :aria-label="`${aberta ? 'Recolher' : 'Expandir'} ${titulo}`"
        @click="aberta = !aberta"
      >
        <v-icon :icon="aberta ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="20" aria-hidden="true" />
      </button>
    </div>

    <div v-show="aberta" :id="idConteudo" class="ax-leitura__conteudo">
      <section v-for="g in grupos" :key="g.nome" class="ax-leitura__grupo">
        <h4 class="ax-leitura__grupo-titulo">{{ g.nome }}</h4>
        <dl class="ax-leitura__grade">
          <div v-for="campo in g.lista" :key="campo.id" class="ax-leitura__item">
            <dt>{{ campo.rotulo }}</dt>
            <dd>{{ campo.valor || 'Não preenchido' }}</dd>
          </div>
        </dl>
      </section>
    </div>

    <div v-if="emEdicao" class="ax-leitura__problema">
      <label :for="idTexto" class="ax-leitura__rotulo">O que a organização precisa corrigir</label>
      <textarea
        :id="idTexto"
        ref="texto"
        class="ax-leitura__texto"
        :class="{ 'ax-leitura__texto--erro': erro }"
        :value="problema?.texto ?? ''"
        :aria-invalid="erro"
        :aria-describedby="`${idTexto}-ajuda`"
        rows="3"
        @input="digitar"
      />
      <div class="ax-leitura__acoes">
        <p :id="`${idTexto}-ajuda`" class="ax-leitura__ajuda" :class="{ 'ax-leitura__ajuda--erro': erro }" :role="erro ? 'alert' : undefined">
          {{
            erro
              ? 'Descreva o problema antes de salvar. O texto é enviado ao operador no e-mail de correção.'
              : 'Obrigatório. O texto é enviado ao operador no e-mail de correção.'
          }}
        </p>
        <button type="button" class="ax-leitura__cancelar" @click="cancelar">Cancelar</button>
        <RgButton variant="secondary" @click="salvar">Salvar observação</RgButton>
      </div>
    </div>

    <div v-else-if="salvo" class="ax-leitura__salvo">
      <p><strong>Problema apontado:</strong> {{ problema?.texto.trim() }}</p>
      <AxBotaoEditar
        v-if="!leitura"
        ref="editar"
        rotulo="Editar observação"
        :nome="`Editar observação de ${titulo}`"
        @click="reabrir"
      />
    </div>
  </section>
</template>

<style scoped>
.ax-leitura {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
  padding: var(--rg-space-5) var(--rg-space-6);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background: var(--rg-color-surface-raised);
}

.ax-leitura__cab {
  display: flex;
  align-items: center;
  gap: var(--rg-space-4);
}

.ax-leitura__titulo {
  flex: 1;
  min-width: 0;
  margin: 0;
  font: inherit;
}

.ax-leitura__alternar {
  display: flex;
  align-items: center;
  gap: var(--rg-space-4);
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.ax-leitura__marcador {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--rg-radius-pill);
  background: var(--rg-color-surface-subtle);
  color: var(--rg-color-text-secondary);
  font-size: 13px;
  font-weight: var(--rg-font-weight-bold);
  line-height: 16px;
}

.ax-leitura__textos {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ax-leitura__nome {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 20px;
  color: var(--rg-color-text-primary);
}

.ax-leitura__resumo {
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.ax-leitura__apontar {
  flex-shrink: 0;
  padding: var(--rg-space-1) var(--rg-space-2);
  border: none;
  border-radius: var(--rg-radius-sm);
  background: none;
  font: inherit;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 20px;
  color: var(--rg-color-text-brand);
  cursor: pointer;
}

.ax-leitura__apontar:hover {
  background: var(--rg-color-surface-brand);
}

.ax-leitura__seta {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: var(--rg-radius-sm);
  background: none;
  color: var(--rg-color-text-secondary);
  cursor: pointer;
}

.ax-leitura__alternar:focus-visible,
.ax-leitura__apontar:focus-visible,
.ax-leitura__seta:focus-visible,
.ax-leitura__cancelar:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
  border-radius: var(--rg-radius-sm);
}

.ax-leitura__conteudo {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
  padding-top: var(--rg-space-4);
  border-top: 1px solid var(--rg-color-border-subtle);
}

.ax-leitura__grupo {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
}

.ax-leitura__grupo-titulo {
  margin: 0;
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 14px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
}

.ax-leitura__grade {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: var(--rg-space-6);
  margin: 0;
}

.ax-leitura__item {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
  padding: var(--rg-space-3) 0;
}

/* A linha separa as fileiras: da segunda em diante, nas três colunas. */
.ax-leitura__item:nth-child(n + 4) {
  border-top: 1px solid var(--rg-color-border-subtle);
}

.ax-leitura__item dt {
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.ax-leitura__item dd {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  line-height: 20px;
  color: var(--rg-color-text-primary);
  overflow-wrap: anywhere;
}

.ax-leitura__problema {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
}

.ax-leitura__rotulo {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-medium);
  line-height: 16px;
  color: var(--rg-color-text-secondary);
}

.ax-leitura__texto {
  width: 100%;
  min-height: 88px;
  padding: var(--rg-space-3) var(--rg-space-4);
  border: 1px solid var(--rg-primitive-neutral-500);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-raised);
  font: inherit;
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  color: var(--rg-color-text-primary);
  resize: vertical;
}

.ax-leitura__texto:focus {
  outline: none;
  border: 2px solid var(--rg-color-action-primary);
  padding: 11px 15px;
}

.ax-leitura__texto--erro,
.ax-leitura__texto--erro:focus {
  border: 2px solid var(--rg-primitive-red-700);
  padding: 11px 15px;
}

.ax-leitura__acoes {
  display: flex;
  align-items: center;
  gap: var(--rg-space-4);
  margin-top: var(--rg-space-2);
}

.ax-leitura__ajuda {
  flex: 1;
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-muted);
}

.ax-leitura__ajuda--erro {
  color: var(--rg-primitive-red-700);
}

.ax-leitura__cancelar {
  padding: var(--rg-space-2) var(--rg-space-3);
  border: none;
  background: none;
  font: inherit;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-secondary);
  cursor: pointer;
}

.ax-leitura__salvo {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-1) var(--rg-space-2) var(--rg-space-3);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-subtle);
}

.ax-leitura__salvo p {
  flex: 1;
  margin: 0;
  padding: 6px 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.ax-leitura__salvo strong {
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.ax-oculto {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 900px) {
  .ax-leitura__grade {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ax-leitura__item:nth-child(n + 3) {
    border-top: 1px solid var(--rg-color-border-subtle);
  }
}

@media (max-width: 720px) {
  .ax-leitura__cab {
    flex-wrap: wrap;
  }

  .ax-leitura__grade {
    grid-template-columns: minmax(0, 1fr);
  }

  .ax-leitura__item:nth-child(n + 2) {
    border-top: 1px solid var(--rg-color-border-subtle);
  }
}
</style>
