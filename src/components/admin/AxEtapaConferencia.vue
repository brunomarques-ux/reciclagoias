<script setup lang="ts">
/**
 * Uma etapa do formulário na conferência do Admin: acordeão com os campos em grade.
 *
 * Figma: `Recicla Goiás - Figma`, seção do Admin (5901:10683), L1·2 ("bloco · dados
 * gerais" aberto, Operação e Estrutura fechados). O cabeçalho resume a etapa:
 * marcador ! âmbar quando há campo para corrigir, ✓ verde quando todos estão
 * corretos e neutro no resto, mais a contagem escrita ("13 campos · 5 corretos ·
 * 1 para corrigir"). Na reanálise, o campo corrigido aparece no resumo pelo nome.
 */
import { computed, ref } from 'vue';

import { useComplementoStore } from '@/stores/complemento';

import { juntarNomes, type Reanalise } from './analise';
import AxCampoConferencia from './AxCampoConferencia.vue';

const props = defineProps<{
  etapa: number;
  titulo: string;
  abertaInicial?: boolean;
  leitura: boolean;
  reanalise: Reanalise | null;
}>();

const c = useComplementoStore();
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

const resposta = (id: string) => c.conferenciaCampos[id]?.resposta ?? null;
const corretos = computed(() => campos.value.filter((x) => resposta(x.id) === 'ok').length);
const paraCorrigir = computed(() => campos.value.filter((x) => resposta(x.id) === 'corrigir').length);
const paraReconferir = computed(() =>
  props.reanalise ? campos.value.filter((x) => c.devolvidos[x.id] !== undefined && !resposta(x.id)) : [],
);

const resumo = computed(() => {
  const n = campos.value.length;
  const base = `${n} ${n === 1 ? 'campo' : 'campos'}`;
  if (paraReconferir.value.length) {
    const nomes = juntarNomes(paraReconferir.value.map((x) => x.rotulo));
    return `${base} · ${nomes} ${paraReconferir.value.length === 1 ? 'corrigido' : 'corrigidos'}, para conferir de novo`;
  }
  if (corretos.value + paraCorrigir.value === 0) return `${base} · nenhum conferido`;
  if (corretos.value === n) return `${base} · todos corretos`;
  const partes = [base];
  if (corretos.value) partes.push(`${corretos.value} ${corretos.value === 1 ? 'correto' : 'corretos'}`);
  if (paraCorrigir.value) partes.push(`${paraCorrigir.value} para corrigir`);
  return partes.join(' · ');
});

const marcador = computed(() => {
  if (paraCorrigir.value) return 'alerta';
  if (campos.value.length && corretos.value === campos.value.length) return 'ok';
  return 'neutro';
});

const idConteudo = computed(() => `ax-etapa-${props.etapa}`);
</script>

<template>
  <section class="ax-etapa">
    <h3 class="ax-etapa__titulo">
      <button
        type="button"
        class="ax-etapa__cab"
        :aria-expanded="aberta"
        :aria-controls="idConteudo"
        @click="aberta = !aberta"
      >
        <span class="ax-etapa__marcador" :class="`ax-etapa__marcador--${marcador}`" aria-hidden="true">
          <v-icon v-if="marcador === 'ok'" icon="mdi-check" size="16" />
          <template v-else-if="marcador === 'alerta'">!</template>
          <template v-else>·</template>
        </span>
        <span class="ax-etapa__textos">
          <span class="ax-etapa__nome">{{ titulo }}</span>
          <span class="ax-etapa__resumo">{{ resumo }}</span>
        </span>
        <v-icon :icon="aberta ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="20" class="ax-etapa__seta" aria-hidden="true" />
      </button>
    </h3>

    <div v-show="aberta" :id="idConteudo" class="ax-etapa__conteudo">
      <section v-for="g in grupos" :key="g.nome" class="ax-grupo">
        <h4 class="ax-grupo__titulo">{{ g.nome }}</h4>
        <ul class="ax-grade">
          <li v-for="campo in g.lista" :key="campo.id">
            <AxCampoConferencia :campo="campo" :leitura="leitura" :reanalise="reanalise" />
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<style scoped>
.ax-etapa {
  padding: var(--rg-space-5) var(--rg-space-6);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background: var(--rg-color-surface-raised);
}

.ax-etapa__titulo {
  margin: 0;
  font: inherit;
}

.ax-etapa__cab {
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

.ax-etapa__cab:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 4px;
  border-radius: var(--rg-radius-sm);
}

.ax-etapa__marcador {
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

.ax-etapa__marcador--alerta {
  background: var(--rg-color-feedback-warning-soft);
  color: var(--rg-primitive-amber-700);
}

.ax-etapa__marcador--ok {
  background: var(--rg-color-action-primary);
  color: var(--rg-color-text-on-brand);
}

.ax-etapa__textos {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ax-etapa__nome {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 20px;
  color: var(--rg-color-text-primary);
}

.ax-etapa__resumo {
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.ax-etapa__seta {
  color: var(--rg-color-text-secondary);
}

.ax-etapa__conteudo {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
  margin-top: var(--rg-space-4);
  padding-top: var(--rg-space-4);
  border-top: 1px solid var(--rg-color-border-subtle);
}

.ax-grupo__titulo {
  margin: 0 0 var(--rg-space-3);
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 14px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--rg-color-text-secondary);
}

.ax-grade {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--rg-space-4) var(--rg-space-6);
  align-items: start;
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (max-width: 720px) {
  .ax-grade {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
