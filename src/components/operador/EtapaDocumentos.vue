<script setup lang="ts">
/**
 * Etapa 2 · Documentos — os 11 itens do formulário da SIC como "possui? + anexo".
 *
 * Cada linha é a mesma pergunta: Sim abre a área de anexo (Dropzone/FileRow da
 * biblioteca no Figma); Não vira pendência declarada, sem bloquear o envio —
 * bloquear faria a cooperativa abandonar o cadastro. O anexo aqui é simulado
 * (clique anexa um arquivo de demonstração); remoção é por ícone, sem link
 * "substituir": arquivo errado se apaga e anexa de novo.
 */
import OxCartao from '@/components/operador/OxCartao.vue';
import OxEscolhaSimNao from '@/components/operador/OxEscolhaSimNao.vue';
import { DOCUMENTOS_EXIGIDOS } from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

const complemento = useComplementoStore();
const f = complemento.formulario;
</script>

<template>
  <OxCartao
    titulo="Documentos da cooperativa"
    descricao='Para cada documento, diga se a cooperativa possui e anexe o arquivo. Itens marcados como "Não" não impedem o envio: entram como pendência na análise.'
  >
    <ul class="ox-docs">
      <li v-for="doc in DOCUMENTOS_EXIGIDOS" :key="doc.id" class="ox-docs__item">
        <div class="ox-docs__pergunta">
          <span class="ox-docs__rotulo">{{ doc.rotulo }}</span>
          <OxEscolhaSimNao
            :rotulo="`Possui ${doc.rotulo}?`"
            :model-value="f.documentos[doc.id]?.possui ?? null"
            @update:model-value="complemento.definirPossui(doc.id, $event)"
          />
        </div>

        <template v-if="f.documentos[doc.id]?.possui === 'sim'">
          <div v-if="f.documentos[doc.id]?.arquivo" class="ox-docs__arquivo">
            <v-icon icon="mdi-paperclip" size="16" aria-hidden="true" />
            <span class="ox-docs__nome">{{ f.documentos[doc.id]?.arquivo }}</span>
            <button
              type="button"
              class="ox-docs__remover"
              :aria-label="`Remover o arquivo de ${doc.rotulo}`"
              @click="complemento.removerArquivo(doc.id)"
            >
              <v-icon icon="mdi-trash-can-outline" size="16" aria-hidden="true" />
            </button>
          </div>

          <button
            v-else
            type="button"
            class="ox-docs__anexar"
            @click="complemento.anexarArquivo(doc.id)"
          >
            <v-icon icon="mdi-tray-arrow-up" size="18" aria-hidden="true" />
            <span class="ox-docs__anexar-acao">Arraste o arquivo aqui ou selecione do computador</span>
          </button>
        </template>

        <p v-else-if="f.documentos[doc.id]?.possui === 'nao'" class="ox-docs__pendencia">
          Sem o documento, o item entra como pendência na análise. O envio continua possível.
        </p>
      </li>
    </ul>
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

.ox-docs__pergunta {
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
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-muted);
  color: var(--rg-color-text-muted);
}

.ox-docs__nome {
  flex: 1;
  min-width: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ox-docs__remover {
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

.ox-docs__remover:hover {
  background: var(--rg-color-surface-subtle);
  color: var(--rg-color-feedback-danger);
}

.ox-docs__remover:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.ox-docs__anexar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--rg-space-2);
  min-height: 52px;
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

.ox-docs__anexar:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.ox-docs__anexar-acao {
  color: var(--rg-color-text-brand);
  font-weight: var(--rg-font-weight-semibold);
}

.ox-docs__pendencia {
  margin: 0;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-primitive-amber-700);
}
</style>
