<script setup lang="ts">
/**
 * Um campo do cadastro na análise do Admin: o valor numa caixa, com ✓ e ✕ à direita.
 *
 * Figma: `Recicla Goiás - Figma`, seção do Admin (5901:10683): L1·2 (✓/✕ por campo),
 * L1·3 e L1·4 (observação aberta e salva), L5·1 (salvar sem descrição) e L6 (editar).
 * ✓ deixa a caixa verde. ✕ deixa a caixa vermelha e abre "O que a organização
 * precisa corrigir", obrigatória, que vai no e-mail de correção. Salva, vira bloco
 * de leitura com o botão de editar. O analista não altera o dado: só confere.
 *
 * Na reanálise, o campo devolvido chega em destaque (selo "Corrigido em", valor
 * novo e o motivo anterior) e o que estava certo chega bloqueado.
 */
import { computed, nextTick, ref } from 'vue';

import RgButton from '@/components/RgButton.vue';
import { useComplementoStore, type CampoLido } from '@/stores/complemento';

import type { Reanalise } from './analise';
import AxBotaoEditar from './AxBotaoEditar.vue';

const props = defineProps<{
  campo: CampoLido;
  /** Só leitura: visualizar, devolvido, aprovado. */
  leitura: boolean;
  reanalise: Reanalise | null;
}>();

const c = useComplementoStore();

const conf = computed(() => c.conferenciaCampos[props.campo.id]);
const resposta = computed(() => conf.value?.resposta ?? null);
const travado = computed(() => !!conf.value?.travado);
const bloqueado = computed(() => props.leitura || travado.value);
const devolvidoAntes = computed(() => !!props.reanalise && c.devolvidos[props.campo.id] !== undefined);

const aberta = computed(() => resposta.value === 'corrigir' && !conf.value?.salvo && !props.leitura);
const salva = computed(
  () => resposta.value === 'corrigir' && (!!conf.value?.salvo || props.leitura) && !!conf.value?.texto.trim(),
);
const estado = computed(() => (resposta.value === 'ok' ? 'ok' : resposta.value === 'corrigir' ? 'corrigir' : 'neutro'));

const id = computed(() => `ax-campo-${props.campo.id}`);
const erro = ref(false);
/** Texto salvo antes de reabrir: o Cancelar volta a ele. */
const copia = ref<string | null>(null);
const texto = ref<HTMLTextAreaElement | null>(null);
const editar = ref<InstanceType<typeof AxBotaoEditar> | null>(null);

const sufixoTravado = computed(() =>
  travado.value && props.reanalise ? ` (conferido em ${props.reanalise.conferidoEm})` : '',
);

function marcar(r: 'ok' | 'corrigir') {
  if (bloqueado.value) return;
  c.marcarCampo(props.campo.id, r);
  erro.value = false;
  copia.value = null;
  if (r === 'corrigir') void nextTick(() => texto.value?.focus());
}

function digitar(ev: Event) {
  const alvo = conf.value;
  if (!alvo) return;
  alvo.texto = (ev.target as HTMLTextAreaElement).value;
  if (erro.value && alvo.texto.trim()) erro.value = false;
}

function salvar() {
  if (!c.salvarObservacao(props.campo.id)) {
    erro.value = true;
    texto.value?.focus();
    return;
  }
  erro.value = false;
  copia.value = null;
  void nextTick(() => editar.value?.focus());
}

function reabrir() {
  copia.value = conf.value?.texto ?? '';
  c.editarObservacao(props.campo.id);
  void nextTick(() => texto.value?.focus());
}

function cancelar() {
  const alvo = conf.value;
  if (alvo && copia.value !== null) alvo.texto = copia.value;
  copia.value = null;
  erro.value = false;
  c.salvarObservacao(props.campo.id);
  void nextTick(() => editar.value?.focus());
}
</script>

<template>
  <div class="ax-campo">
    <div class="ax-campo__topo">
      <span :id="`${id}-rotulo`" class="ax-campo__rotulo">{{ campo.rotulo }}</span>
      <span v-if="devolvidoAntes" class="ax-campo__selo">Corrigido em {{ reanalise?.corrigidoEm }}</span>
    </div>

    <div class="ax-campo__caixa" :class="`ax-campo__caixa--${estado}`">
      <span class="ax-campo__valor">{{ campo.valor || 'Não informado' }}</span>
      <div class="ax-campo__acoes" role="group" :aria-labelledby="`${id}-rotulo`">
        <button
          type="button"
          class="ax-campo__botao ax-campo__botao--ok"
          :aria-pressed="resposta === 'ok'"
          :aria-label="`Marcar ${campo.rotulo} como correto${sufixoTravado}`"
          :disabled="bloqueado"
          @click="marcar('ok')"
        >
          <v-icon icon="mdi-check" size="18" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="ax-campo__botao ax-campo__botao--corrigir"
          :aria-pressed="resposta === 'corrigir'"
          :aria-label="`Marcar ${campo.rotulo} para corrigir${sufixoTravado}`"
          :disabled="bloqueado"
          @click="marcar('corrigir')"
        >
          <v-icon icon="mdi-close" size="18" aria-hidden="true" />
        </button>
      </div>
    </div>

    <p v-if="devolvidoAntes" class="ax-campo__anterior">Motivo anterior: {{ c.devolvidos[campo.id] }}</p>

    <div v-if="aberta" class="ax-obs">
      <label :for="`${id}-texto`" class="ax-obs__rotulo">O que a organização precisa corrigir</label>
      <textarea
        :id="`${id}-texto`"
        ref="texto"
        class="ax-obs__texto"
        :class="{ 'ax-obs__texto--erro': erro }"
        :value="conf?.texto ?? ''"
        :aria-invalid="erro"
        :aria-describedby="`${id}-ajuda`"
        rows="3"
        placeholder="Diga o que está errado e o que a organização precisa mudar. Ex.: o telefone não atende, informe um número ativo."
        @input="digitar"
      />
      <div class="ax-obs__rodape">
        <p :id="`${id}-ajuda`" class="ax-obs__ajuda" :class="{ 'ax-obs__ajuda--erro': erro }" :role="erro ? 'alert' : undefined">
          {{
            erro
              ? 'Escreva o que a organização precisa corrigir antes de salvar. O texto vai para a organização no e-mail de correção.'
              : 'Obrigatória. Vai para a organização no e-mail de correção.'
          }}
        </p>
        <button v-if="copia !== null" type="button" class="ax-obs__cancelar" @click="cancelar">Cancelar</button>
        <RgButton variant="secondary" @click="salvar">Salvar observação</RgButton>
      </div>
    </div>

    <div v-else-if="salva" class="ax-obs-salva">
      <p><strong>Observação:</strong> {{ conf?.texto }}</p>
      <AxBotaoEditar
        v-if="!bloqueado"
        ref="editar"
        rotulo="Editar observação"
        :nome="`Editar observação de ${campo.rotulo}`"
        @click="reabrir"
      />
    </div>
  </div>
</template>

<style scoped>
.ax-campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.ax-campo__topo {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  min-height: 16px;
}

.ax-campo__rotulo {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-medium);
  line-height: 16px;
  color: var(--rg-color-text-secondary);
}

.ax-campo__selo {
  padding: 2px 10px;
  border-radius: var(--rg-radius-pill);
  background: var(--rg-color-feedback-info-soft);
  color: var(--rg-color-feedback-info);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 16px;
}

.ax-campo__caixa {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  padding: var(--rg-space-2) var(--rg-space-2) var(--rg-space-2) 14px;
  border: 1px solid transparent;
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-subtle);
}

.ax-campo__caixa--ok {
  background: var(--rg-color-feedback-success-soft);
  border-color: var(--rg-color-feedback-success);
}

.ax-campo__caixa--corrigir {
  background: var(--rg-color-feedback-danger-soft);
  border-color: var(--rg-primitive-red-700);
}

.ax-campo__valor {
  flex: 1;
  min-width: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  line-height: 20px;
  color: var(--rg-color-text-primary);
  overflow-wrap: anywhere;
}

.ax-campo__acoes {
  display: flex;
  gap: var(--rg-space-1);
  flex-shrink: 0;
}

.ax-campo__botao {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-sm);
  background: var(--rg-color-surface-raised);
  color: var(--rg-color-text-secondary);
  cursor: pointer;
}

.ax-campo__botao:hover:not(:disabled) {
  border-color: var(--rg-color-border-strong);
  color: var(--rg-color-text-primary);
}

.ax-campo__botao--ok[aria-pressed='true'] {
  background: var(--rg-color-action-primary);
  border-color: var(--rg-color-action-primary);
  color: var(--rg-color-text-on-brand);
}

.ax-campo__botao--corrigir[aria-pressed='true'] {
  background: var(--rg-primitive-red-700);
  border-color: var(--rg-primitive-red-700);
  color: var(--rg-color-text-on-brand);
}

.ax-campo__botao:disabled {
  opacity: 0.5;
  cursor: default;
}

.ax-campo__botao:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.ax-campo__anterior {
  margin: 2px 0 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-muted);
}

.ax-obs {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  margin-top: 6px;
}

.ax-obs__rotulo {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-medium);
  line-height: 16px;
  color: var(--rg-color-text-secondary);
}

.ax-obs__texto {
  width: 100%;
  min-height: 76px;
  padding: 10px var(--rg-space-3);
  border: 1px solid var(--rg-primitive-neutral-500);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-raised);
  font: inherit;
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  color: var(--rg-color-text-primary);
  resize: vertical;
}

.ax-obs__texto:focus {
  outline: none;
  border: 2px solid var(--rg-color-action-primary);
  padding: 9px 11px;
}

.ax-obs__texto--erro,
.ax-obs__texto--erro:focus {
  border: 2px solid var(--rg-primitive-red-700);
  padding: 9px 11px;
}

.ax-obs__rodape {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
}

.ax-obs__ajuda {
  flex: 1;
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-muted);
}

.ax-obs__ajuda--erro {
  color: var(--rg-primitive-red-700);
}

.ax-obs__cancelar {
  padding: var(--rg-space-2) var(--rg-space-3);
  border: none;
  border-radius: var(--rg-radius-md);
  background: none;
  font: inherit;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-secondary);
  cursor: pointer;
}

.ax-obs__cancelar:hover {
  color: var(--rg-color-text-primary);
}

.ax-obs__cancelar:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.ax-obs-salva {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  margin-top: 6px;
  padding: var(--rg-space-1) var(--rg-space-1) var(--rg-space-1) var(--rg-space-3);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-subtle);
}

.ax-obs-salva p {
  flex: 1;
  margin: 0;
  padding: 6px 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.ax-obs-salva strong {
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}
</style>
