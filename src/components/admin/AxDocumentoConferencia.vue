<script setup lang="ts">
/**
 * Um documento na conferência do Admin: nome, arquivo com o botão de ver e, à
 * direita, "Em conformidade?" Sim ou Não.
 *
 * Figma: `Recicla Goiás - Figma`, seção do Admin (5901:10683): L1·2 (lista), L1·3
 * (Não abre o motivo), L1·4 (motivo salvo), L5·1 (salvar sem descrição), L6·1 e
 * L6·2 (editar motivo, com Cancelar que volta ao salvo) e L4·2 (reanálise: o
 * corrigido em destaque com o motivo anterior; o que estava em Sim, bloqueado).
 */
import { computed, nextTick, ref } from 'vue';

import RgButton from '@/components/RgButton.vue';
import { MOTIVOS_ANALISE, type DocumentoExigido, type MotivoAnalise } from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

import type { Reanalise } from './analise';
import AxBotaoEditar from './AxBotaoEditar.vue';

const props = defineProps<{
  doc: DocumentoExigido;
  leitura: boolean;
  reanalise: Reanalise | null;
}>();
const emit = defineEmits<{ (e: 'ver', id: string): void }>();

const c = useComplementoStore();

const arquivo = computed(() => c.formulario.documentos[props.doc.id]?.arquivo ?? null);
const conf = computed(() => c.conferencia[props.doc.id]);
const resposta = computed(() => conf.value?.resposta ?? null);
const travado = computed(() => !!conf.value?.travado);
const bloqueado = computed(() => props.leitura || travado.value);
const devolvidoAntes = computed(() => !!props.reanalise && c.devolvidos[props.doc.id] !== undefined);

const aberto = computed(() => resposta.value === 'nao' && !conf.value?.salvo && !props.leitura);
const salvo = computed(
  () => resposta.value === 'nao' && (!!conf.value?.salvo || props.leitura) && !!conf.value?.texto.trim(),
);

const id = computed(() => `ax-doc-${props.doc.id}`);
const erro = ref<'motivo' | 'texto' | 'ambos' | null>(null);
const copia = ref<{ motivo: MotivoAnalise | null; texto: string } | null>(null);
const texto = ref<HTMLTextAreaElement | null>(null);
const editar = ref<InstanceType<typeof AxBotaoEditar> | null>(null);

const MENSAGEM_ERRO = {
  motivo: 'Escolha o motivo antes de salvar.',
  texto: 'Descreva o motivo antes de salvar. O texto é enviado ao operador no e-mail de correção.',
  ambos: 'Escolha o motivo e descreva antes de salvar. O texto é enviado ao operador no e-mail de correção.',
} as const;

/** "documento vencido. O documento apresentado…" (o "outro motivo" vai só com a descrição). */
const textoSalvo = computed(() => {
  const alvo = conf.value;
  if (!alvo) return '';
  if (!alvo.motivo || alvo.motivo === 'outro') return alvo.texto.trim();
  const r = c.rotuloMotivo(alvo.motivo);
  return `${r.charAt(0).toLowerCase()}${r.slice(1)}. ${alvo.texto.trim()}`;
});

function marcar(r: 'sim' | 'nao') {
  if (bloqueado.value) return;
  c.marcarDocumento(props.doc.id, r);
  erro.value = null;
  copia.value = null;
}

function escolherMotivo(m: MotivoAnalise) {
  const alvo = conf.value;
  if (!alvo) return;
  alvo.motivo = m;
  if (erro.value === 'motivo') erro.value = null;
  else if (erro.value === 'ambos') erro.value = 'texto';
}

function digitar(ev: Event) {
  const alvo = conf.value;
  if (!alvo) return;
  alvo.texto = (ev.target as HTMLTextAreaElement).value;
  if (!alvo.texto.trim()) return;
  if (erro.value === 'texto') erro.value = null;
  else if (erro.value === 'ambos') erro.value = 'motivo';
}

function salvar() {
  if (!c.salvarObservacao(props.doc.id)) {
    const semMotivo = !conf.value?.motivo;
    const semTexto = !conf.value?.texto.trim();
    erro.value = semMotivo && semTexto ? 'ambos' : semMotivo ? 'motivo' : 'texto';
    if (semTexto) texto.value?.focus();
    return;
  }
  erro.value = null;
  copia.value = null;
  void nextTick(() => editar.value?.focus());
}

function reabrir() {
  copia.value = { motivo: conf.value?.motivo ?? null, texto: conf.value?.texto ?? '' };
  c.editarObservacao(props.doc.id);
  void nextTick(() => texto.value?.focus());
}

function cancelar() {
  const alvo = conf.value;
  if (alvo && copia.value) {
    alvo.motivo = copia.value.motivo;
    alvo.texto = copia.value.texto;
  }
  copia.value = null;
  erro.value = null;
  c.salvarObservacao(props.doc.id);
  void nextTick(() => editar.value?.focus());
}
</script>

<template>
  <div class="ax-doc">
    <div class="ax-doc__esq">
      <p class="ax-doc__nome">
        <span :id="`${id}-nome`">{{ doc.rotulo }}</span>
        <span v-if="devolvidoAntes" class="ax-doc__selo">Corrigido em {{ reanalise?.corrigidoEm }}</span>
      </p>

      <div class="ax-arquivo">
        <v-icon icon="mdi-paperclip" size="16" class="ax-arquivo__clipe" aria-hidden="true" />
        <span class="ax-arquivo__nome">{{ arquivo ?? 'Nenhum arquivo anexado' }}</span>
        <button
          v-if="arquivo"
          type="button"
          class="ax-arquivo__ver"
          :aria-label="`Ver ${doc.rotulo}`"
          @click="emit('ver', doc.id)"
        >
          <v-icon icon="mdi-eye-outline" size="18" aria-hidden="true" />
        </button>
      </div>

      <p v-if="devolvidoAntes" class="ax-doc__anterior">Motivo anterior: {{ c.devolvidos[doc.id] }}</p>

      <div v-if="aberto" class="ax-motivo">
        <fieldset class="ax-motivo__opcoes">
          <legend class="ax-motivo__rotulo">Motivo</legend>
          <label v-for="m in MOTIVOS_ANALISE" :key="m.id" class="ax-motivo__radio">
            <input
              type="radio"
              :name="`${id}-motivo`"
              :value="m.id"
              :checked="conf?.motivo === m.id"
              :aria-invalid="erro === 'motivo' || erro === 'ambos'"
              :aria-describedby="`${id}-ajuda`"
              @change="escolherMotivo(m.id)"
            />
            {{ m.rotulo }}
          </label>
        </fieldset>
        <label :for="`${id}-texto`" class="ax-motivo__rotulo">Descrição do motivo</label>
        <textarea
          :id="`${id}-texto`"
          ref="texto"
          class="ax-motivo__texto"
          :class="{ 'ax-motivo__texto--erro': erro === 'texto' || erro === 'ambos' }"
          :value="conf?.texto ?? ''"
          :aria-invalid="erro === 'texto' || erro === 'ambos'"
          :aria-describedby="`${id}-ajuda`"
          rows="3"
          placeholder="Descreva o motivo para o operador"
          @input="digitar"
        />
        <div class="ax-motivo__rodape">
          <p
            :id="`${id}-ajuda`"
            class="ax-motivo__ajuda"
            :class="{ 'ax-motivo__ajuda--erro': erro }"
            :role="erro ? 'alert' : undefined"
          >
            {{ erro ? MENSAGEM_ERRO[erro] : 'Obrigatório. O texto é enviado ao operador no e-mail de correção.' }}
          </p>
          <button v-if="copia" type="button" class="ax-motivo__cancelar" @click="cancelar">Cancelar</button>
          <RgButton variant="secondary" @click="salvar">Salvar motivo</RgButton>
        </div>
      </div>

      <div v-else-if="salvo" class="ax-motivo-salvo">
        <p><strong>Motivo:</strong> {{ textoSalvo }}</p>
        <AxBotaoEditar
          v-if="!bloqueado"
          ref="editar"
          rotulo="Editar motivo"
          :nome="`Editar motivo de ${doc.rotulo}`"
          @click="reabrir"
        />
      </div>
    </div>

    <div class="ax-doc__dir">
      <span :id="`${id}-pergunta`" class="ax-doc__pergunta">
        {{ travado && reanalise ? `Conferido em ${reanalise.conferidoEm}` : 'Em conformidade?' }}
      </span>
      <div
        class="ax-simnao"
        :class="{ 'ax-simnao--bloqueado': bloqueado }"
        role="group"
        :aria-labelledby="`${id}-nome ${id}-pergunta`"
      >
        <button
          type="button"
          class="ax-simnao__opcao ax-simnao__opcao--sim"
          :aria-pressed="resposta === 'sim'"
          :disabled="bloqueado"
          @click="marcar('sim')"
        >
          Sim
        </button>
        <span class="ax-simnao__divisor" aria-hidden="true" />
        <button
          type="button"
          class="ax-simnao__opcao ax-simnao__opcao--nao"
          :aria-pressed="resposta === 'nao'"
          :disabled="bloqueado"
          @click="marcar('nao')"
        >
          Não
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ax-doc {
  display: flex;
  align-items: center;
  gap: var(--rg-space-6);
  padding: var(--rg-space-4) 0;
}

.ax-doc__esq {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--rg-space-2);
  min-width: 0;
}

.ax-doc__nome {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rg-space-3);
  margin: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  line-height: 20px;
  color: var(--rg-color-text-primary);
}

.ax-doc__selo {
  padding: 2px 10px;
  border-radius: var(--rg-radius-pill);
  background: var(--rg-color-feedback-info-soft);
  color: var(--rg-color-feedback-info);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 16px;
}

.ax-arquivo {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  min-height: 38px;
  padding: 3px var(--rg-space-1) 3px var(--rg-space-3);
  border-radius: var(--rg-radius-md);
  background: var(--rg-primitive-neutral-50);
}

.ax-arquivo__clipe {
  color: var(--rg-color-text-muted);
}

.ax-arquivo__nome {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: var(--rg-font-weight-medium);
  line-height: 18px;
  color: var(--rg-primitive-neutral-700);
  overflow-wrap: anywhere;
}

.ax-arquivo__ver {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--rg-radius-sm);
  background: none;
  color: var(--rg-color-text-muted);
  cursor: pointer;
}

.ax-arquivo__ver:hover {
  background: var(--rg-color-surface-subtle);
  color: var(--rg-color-text-brand);
}

.ax-arquivo__ver:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.ax-doc__anterior {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-muted);
}

.ax-motivo {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  padding: var(--rg-space-4);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-subtle);
}

.ax-motivo__opcoes {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--rg-space-2) var(--rg-space-6);
  margin: 0 0 var(--rg-space-1);
  padding: 0;
  border: none;
}

.ax-motivo__rotulo {
  width: 100%;
  margin-bottom: var(--rg-space-1);
  padding: 0;
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-medium);
  line-height: 16px;
  color: var(--rg-color-text-secondary);
}

.ax-motivo__radio {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  color: var(--rg-color-text-primary);
  cursor: pointer;
}

.ax-motivo__radio input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--rg-color-action-primary);
}

.ax-motivo__texto {
  width: 100%;
  min-height: 70px;
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

.ax-motivo__texto:focus {
  outline: none;
  border: 2px solid var(--rg-color-action-primary);
  padding: 9px 11px;
}

.ax-motivo__texto--erro,
.ax-motivo__texto--erro:focus {
  border: 2px solid var(--rg-primitive-red-700);
  padding: 9px 11px;
}

.ax-motivo__rodape {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
}

.ax-motivo__ajuda {
  flex: 1;
  margin: 0;
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  color: var(--rg-color-text-muted);
}

.ax-motivo__ajuda--erro {
  color: var(--rg-primitive-red-700);
}

.ax-motivo__cancelar {
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

.ax-motivo__cancelar:hover {
  color: var(--rg-color-text-primary);
}

.ax-motivo__cancelar:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.ax-motivo-salvo {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  padding: var(--rg-space-1) var(--rg-space-1) var(--rg-space-1) var(--rg-space-3);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-subtle);
}

.ax-motivo-salvo p {
  flex: 1;
  margin: 0;
  padding: 6px 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.ax-motivo-salvo strong {
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.ax-doc__dir {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--rg-space-1);
}

.ax-doc__pergunta {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-medium);
  line-height: 16px;
  color: var(--rg-color-text-secondary);
  white-space: nowrap;
}

.ax-simnao {
  display: flex;
  overflow: hidden;
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-raised);
}

.ax-simnao--bloqueado {
  opacity: 0.5;
}

.ax-simnao__divisor {
  width: 1px;
  background: var(--rg-color-border-subtle);
}

.ax-simnao__opcao {
  width: 64px;
  height: 36px;
  border: none;
  background: var(--rg-color-surface-raised);
  font: inherit;
  font-size: 13px;
  font-weight: var(--rg-font-weight-medium);
  line-height: 18px;
  color: var(--rg-color-text-secondary);
  cursor: pointer;
}

.ax-simnao__opcao:hover:not(:disabled) {
  background: var(--rg-color-surface-muted);
}

.ax-simnao__opcao:disabled {
  cursor: default;
}

.ax-simnao__opcao:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: -2px;
}

.ax-simnao__opcao--sim[aria-pressed='true'] {
  background: var(--rg-color-surface-brand);
  color: var(--rg-color-text-brand);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
}

.ax-simnao__opcao--nao[aria-pressed='true'] {
  background: var(--rg-color-feedback-danger-soft);
  color: var(--rg-primitive-red-700);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
}

@media (max-width: 720px) {
  .ax-doc {
    flex-direction: column;
    align-items: stretch;
    gap: var(--rg-space-3);
  }

  .ax-doc__dir {
    align-items: flex-start;
  }
}
</style>
