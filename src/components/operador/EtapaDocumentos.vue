<script setup lang="ts">
/**
 * Etapa 2 · Documentos — os 11 itens do formulário da SIC, um anexo por item.
 *
 * Planning de 16/10: todos os documentos são obrigatórios e o "possui? Sim/Não"
 * saiu da tela do operador (fica só na conferência do analista). Sem o
 * documento, a organização anexa no lugar dele o protocolo do pedido ou uma
 * justificativa e explica na observação, no fim da etapa.
 *
 * Anexo simulado: clicar no Dropzone anexa um arquivo de demonstração. O
 * FileRow da biblioteca tem baixar e lixeira, por ícone (nada de "substituir":
 * arquivo errado se apaga e anexa de novo).
 *
 * Correção (L3): o devolvido traz o motivo, o anexo recusado continua listado
 * (só com baixar) e o corrigido entra logo abaixo, com contorno tracejado. O
 * que a análise conferiu fica bloqueado, com o selo Conferido.
 *
 * Planning de 13/11/2026 (Figma: seção `6506:4284`, linha L1):
 * - Dentro de Minha Conta os documentos são só consulta, todos como Conferido.
 * - Bloqueado por documentação vencida (L1·4, `6507:6214`): só o documento vencido
 *   aceita troca. O arquivo vencido continua listado, o novo entra pelo mesmo
 *   Dropzone da correção e a validade é informada no campo ao lado.
 * - Enviado para conferência (L1·5, `6507:6524`): o documento novo fica só para
 *   consulta, com o chip Em conferência e a validade travada.
 * Regras de 19/11/2026 (Figma `6558:1924`): a troca abre também antes de vencer
 * (lembretes de 60 e 30 dias) e nos 10 dias de regularização, cada fase com o
 * seu texto. O envio continua o mesmo.
 * O campo de validade é PROVISÓRIO: o definitivo vem do print da homologação.
 */
import OxCampo from '@/components/operador/OxCampo.vue';
import { computed } from 'vue';

import OxCartao from '@/components/operador/OxCartao.vue';
import { DOCUMENTOS_EXIGIDOS } from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

const complemento = useComplementoStore();
const f = complemento.formulario;

const devolvido = (id: string) => complemento.emCorrecao && complemento.devolvidos[id] !== undefined;
/**
 * O documento acompanhado pela validade, enquanto aceita troca: antes de vencer, nos 10 dias de regularização e no
 * bloqueio total (regras de 19/11). É o único que aceita troca.
 */
const vencido = (id: string) => complemento.trocaAberta && complemento.vencimento?.doc === id;
/** O documento novo, enquanto o Admin confere. */
const emConferencia = (id: string) => complemento.emConferencia && complemento.vencimento?.doc === id;
const conferido = (id: string) =>
  (complemento.emCorrecao && complemento.devolvidos[id] === undefined) ||
  (complemento.naMinhaConta && !vencido(id) && !emConferencia(id));
/** Na correção e dentro de Minha Conta, o que já foi conferido não se altera. */
const soConsulta = computed(() => complemento.emCorrecao || complemento.naMinhaConta);

const descricao = computed(() => {
  if (complemento.bloqueado || complemento.emRegularizacao)
    return 'Só o documento vencido pode ser trocado. Os demais continuam conferidos e não precisam ser enviados de novo.';
  if (complemento.trocaAberta)
    return 'O documento perto de vencer já pode ser trocado. Os demais continuam conferidos e não precisam ser enviados de novo.';
  if (complemento.emConferencia) return 'O documento enviado está em conferência. Os demais continuam conferidos.';
  if (complemento.naMinhaConta) return 'Os documentos foram conferidos na análise do cadastro e ficam só para consulta.';
  if (complemento.emCorrecao)
    return 'Os documentos conferidos pela análise não podem ser alterados. No documento com pendência, o motivo aparece abaixo do nome.';
  return 'Todos os documentos são obrigatórios. Anexe cada arquivo em PDF. Se a cooperativa ainda não tem algum documento, anexe no lugar dele o protocolo do pedido ou uma justificativa, e explique na observação, no fim da etapa.';
});

/** O motivo no documento vencido: a recusa da conferência, se houve, ou o vencimento. */
const motivoDoVencido = computed(() => {
  if (complemento.troca.recusa) return complemento.troca.recusa;
  const v = complemento.vencimento;
  const nome = DOCUMENTOS_EXIGIDOS.find((d) => d.id === v?.doc)?.nomeCurto ?? 'documento';
  if (complemento.emRegularizacao)
    return `o ${nome} venceu em ${v?.venceEm ?? ''}. Anexe o ${nome} válido e informe a nova data de validade até ${complemento.prazos?.prazoAte ?? ''} para evitar o bloqueio.`;
  if (!complemento.bloqueado)
    return `o ${nome} vence em ${v?.venceEm ?? ''}. Anexe o ${nome} novo e informe a nova data de validade.`;
  return `o ${nome} venceu em ${v?.venceEm ?? ''} e não foi trocado no prazo. Anexe o ${nome} válido e informe a nova data de validade.`;
});
/** O rótulo da nota: antes de vencer não é motivo de recusa, é aviso. */
const rotuloDaNota = computed(() =>
  complemento.troca.recusa || complemento.bloqueado || complemento.emRegularizacao ? 'Motivo:' : 'Aviso:',
);
const erroDaTroca = (qual: 'arquivo' | 'validade') => complemento.errosDaTroca.includes(qual);
/**
 * Validade com calendário (Bruno, 26/11/2026): a entrada é de data nativa (AAAA-MM-DD), a store segue com DD/MM/AAAA,
 * que é como a conferência do Admin e os textos mostram a data.
 */
const paraIso = (v: string) => (/^\d{2}\/\d{2}\/\d{4}$/.test(v) ? v.split('/').reverse().join('-') : '');
const deIso = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v.split('-').reverse().join('/') : '');
const emErro = (id: string) => complemento.camposEmErro.includes(id) && !f.documentos[id]?.arquivo;
</script>

<template>
  <OxCartao
    titulo="Documentos da cooperativa"
    :descricao="descricao"
  >
    <ul class="ox-docs">
      <li v-for="doc in DOCUMENTOS_EXIGIDOS" :key="doc.id" class="ox-docs__item">
        <div class="ox-docs__cabeca">
          <span :id="`doc-${doc.id}`" class="ox-docs__rotulo">
            {{ doc.rotulo }}<span v-if="!soConsulta" aria-hidden="true"> *</span>
          </span>
          <span v-if="emConferencia(doc.id)" class="ox-docs__em-conferencia">Em conferência</span>
          <span v-else-if="conferido(doc.id)" class="ox-docs__conferido">Conferido</span>
        </div>

        <p
          v-if="vencido(doc.id)"
          class="ox-docs__nota"
          :class="{ 'ox-docs__nota--aviso': rotuloDaNota === 'Aviso:' }"
          role="note"
        >
          <v-icon icon="mdi-alert" size="16" aria-hidden="true" />
          <span><strong>{{ rotuloDaNota }}</strong> {{ motivoDoVencido }}</span>
        </p>

        <p v-if="devolvido(doc.id)" class="ox-docs__nota" role="note">
          <v-icon icon="mdi-alert" size="16" aria-hidden="true" />
          <span><strong>Motivo:</strong> {{ complemento.devolvidos[doc.id] }}</span>
        </p>

        <div v-if="f.documentos[doc.id]?.arquivo" class="ox-docs__arquivo">
          <v-icon icon="mdi-paperclip" size="16" aria-hidden="true" />
          <span class="ox-docs__nome">{{ f.documentos[doc.id]?.arquivo }}</span>
          <button type="button" class="ox-docs__icone" :aria-label="`Baixar ${f.documentos[doc.id]?.arquivo}`">
            <v-icon icon="mdi-tray-arrow-down" size="16" aria-hidden="true" />
          </button>
          <button
            v-if="!soConsulta"
            type="button"
            class="ox-docs__icone ox-docs__icone--remover"
            :aria-label="`Excluir o arquivo de ${doc.rotulo}`"
            @click="complemento.removerArquivo(doc.id)"
          >
            <v-icon icon="mdi-trash-can-outline" size="16" aria-hidden="true" />
          </button>
        </div>

        <template v-if="devolvido(doc.id)">
          <div v-if="complemento.arquivoNovo(doc.id)" class="ox-docs__arquivo ox-docs__arquivo--novo">
            <v-icon icon="mdi-paperclip" size="16" aria-hidden="true" />
            <span class="ox-docs__nome">{{ complemento.arquivoNovo(doc.id) }}</span>
            <button type="button" class="ox-docs__icone" :aria-label="`Baixar ${complemento.arquivoNovo(doc.id)}`">
              <v-icon icon="mdi-tray-arrow-down" size="16" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="ox-docs__icone ox-docs__icone--remover"
              :aria-label="`Excluir o arquivo corrigido de ${doc.rotulo}`"
              @click="complemento.removerArquivo(doc.id)"
            >
              <v-icon icon="mdi-trash-can-outline" size="16" aria-hidden="true" />
            </button>
          </div>
          <button v-else type="button" class="ox-docs__anexar" @click="complemento.anexarArquivo(doc.id)">
            <v-icon icon="mdi-tray-arrow-up" size="18" aria-hidden="true" />
            <span>Anexe o documento corrigido em PDF: arraste o arquivo aqui ou selecione do computador</span>
          </button>
        </template>

        <template v-else-if="vencido(doc.id)">
          <div v-if="complemento.troca.arquivo" class="ox-docs__arquivo ox-docs__arquivo--novo">
            <v-icon icon="mdi-paperclip" size="16" aria-hidden="true" />
            <span class="ox-docs__nome">{{ complemento.troca.arquivo }}</span>
            <button type="button" class="ox-docs__icone" :aria-label="`Baixar ${complemento.troca.arquivo}`">
              <v-icon icon="mdi-tray-arrow-down" size="16" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="ox-docs__icone ox-docs__icone--remover"
              :aria-label="`Excluir o arquivo novo de ${doc.rotulo}`"
              @click="complemento.removerDocumentoNovo()"
            >
              <v-icon icon="mdi-trash-can-outline" size="16" aria-hidden="true" />
            </button>
          </div>
          <template v-else>
            <button
              type="button"
              class="ox-docs__anexar"
              :class="{ 'ox-docs__anexar--erro': erroDaTroca('arquivo') }"
              @click="complemento.anexarDocumentoNovo()"
            >
              <v-icon icon="mdi-tray-arrow-up" size="18" aria-hidden="true" />
              <span>Anexe o documento corrigido em PDF: arraste o arquivo aqui ou selecione do computador</span>
            </button>
            <p v-if="erroDaTroca('arquivo')" class="ox-docs__erro" role="alert">
              Anexe o documento novo para enviar para conferência.
            </p>
          </template>
          <OxCampo
            class="ox-docs__validade"
            rotulo="Validade do documento"
            tipo="date"
            :model-value="paraIso(complemento.troca.validade)"
            :erro="erroDaTroca('validade') ? 'Informe a data de validade do documento novo.' : undefined"
            @update:model-value="complemento.informarValidade(deIso($event))"
          />
        </template>

        <OxCampo
          v-else-if="emConferencia(doc.id)"
          class="ox-docs__validade"
          rotulo="Validade do documento"
          :model-value="complemento.troca.validade"
          travado
        />

        <template v-else-if="!f.documentos[doc.id]?.arquivo">
          <button
            type="button"
            class="ox-docs__anexar"
            :class="{ 'ox-docs__anexar--erro': emErro(doc.id) }"
            :aria-describedby="`doc-${doc.id}`"
            @click="complemento.anexarArquivo(doc.id)"
          >
            <v-icon icon="mdi-tray-arrow-up" size="18" aria-hidden="true" />
            <span class="ox-docs__anexar-acao">Arraste o arquivo em PDF aqui ou selecione do computador</span>
          </button>
          <p v-if="emErro(doc.id)" class="ox-docs__erro">
            Anexe o documento, ou o protocolo do pedido, para enviar o cadastro.
          </p>
        </template>
      </li>
    </ul>

    <!-- Nos frames do bloqueio e da conferência (L1·4 e L1·5) a observação não aparece. -->
    <OxCampo
      v-if="!complemento.trocaAberta && !complemento.emConferencia"
      class="ox-docs__observacao"
      rotulo="Observações sobre os documentos"
      v-model="f.observacaoDocumentos"
      multilinha
      opcional
      :travado="soConsulta"
      dica="Use para explicar o que foi anexado no lugar de um documento, como um protocolo ou uma justificativa. Se todos os documentos estão anexados, deixe em branco."
    />
  </OxCartao>
</template>

<style scoped>
.ox-docs {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ox-docs__item {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  padding-block: var(--rg-space-4);
}

.ox-docs__item + .ox-docs__item {
  border-top: 1px solid var(--rg-color-border-subtle);
}

.ox-docs__cabeca {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-4);
}

.ox-docs__rotulo {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-primary);
  line-height: var(--rg-line-height-snug);
}

.ox-docs__arquivo {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-3);
  border: 1px solid transparent;
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-muted);
  color: var(--rg-color-text-muted);
}

.ox-docs__arquivo--novo {
  border: 1.5px dashed var(--rg-color-border-brand);
  background: var(--rg-color-surface-raised);
}

.ox-docs__nome {
  flex: 1;
  min-width: 0;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ox-docs__icone {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--rg-radius-sm);
  background: transparent;
  color: var(--rg-color-text-muted);
  cursor: pointer;
}

.ox-docs__icone:hover {
  background: var(--rg-color-surface-subtle);
  color: var(--rg-color-text-brand);
}

.ox-docs__icone--remover:hover {
  color: var(--rg-color-feedback-danger);
}

.ox-docs__icone:focus-visible,
.ox-docs__anexar:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.ox-docs__anexar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--rg-space-2);
  min-height: 52px;
  padding-inline: var(--rg-space-4);
  border: 1.5px dashed var(--rg-color-border-base);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-base);
  font-family: inherit;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-muted);
  cursor: pointer;
  transition: border-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.ox-docs__anexar:hover {
  border-color: var(--rg-color-border-brand);
}

.ox-docs__anexar--erro {
  border-color: var(--rg-color-feedback-danger);
}

.ox-docs__anexar-acao {
  color: var(--rg-color-text-brand);
  font-weight: var(--rg-font-weight-semibold);
}

.ox-docs__erro {
  margin: 0;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-primitive-red-700);
}

.ox-docs__conferido {
  padding: 2px var(--rg-space-2);
  border-radius: var(--rg-radius-pill);
  background: var(--rg-color-feedback-success-soft);
  color: var(--rg-color-feedback-success);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
}

.ox-docs__em-conferencia {
  padding: var(--rg-space-1) 10px;
  border-radius: var(--rg-radius-pill);
  background: var(--rg-color-feedback-info-soft);
  color: var(--rg-color-feedback-info);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 16px;
}

/* Provisório: largura do campo no frame (240). */
.ox-docs__validade {
  width: 240px;
  max-width: 100%;
}

.ox-docs__nota {
  display: flex;
  align-items: flex-start;
  gap: var(--rg-space-2);
  margin: 0;
  padding: var(--rg-space-3) var(--rg-space-4);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-feedback-danger-soft);
  color: var(--rg-primitive-red-700);
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-base);
}

/* Antes de vencer não é recusa: o aviso vai no tom de atenção, como o aviso da Minha Conta. */
.ox-docs__nota--aviso {
  background: var(--rg-color-feedback-warning-soft);
  color: var(--rg-primitive-amber-700);
}

.ox-docs__observacao {
  padding-top: var(--rg-space-5);
  border-top: 1px solid var(--rg-color-border-subtle);
}
</style>
