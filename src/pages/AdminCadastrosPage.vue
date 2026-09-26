<script setup lang="ts">
/**
 * Fila da análise de cadastro do Operador Logístico, na área Admin (SEMAD).
 *
 * Figma: seção `Setembro 2026 · Recicla Goiás Admin · Análise do cadastro do
 * Operador Logístico`, L1·1. Nome e CNPJ ficam juntos na mesma coluna (SEMAD-11).
 * A primeira linha é a Recicla Cerrado, que acompanha a store do complemento:
 * é ela que fecha a volta da demonstração. As outras são estáticas.
 */
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import GestoraShell from '@/components/gestora/GestoraShell.vue';
import { FILA_CADASTROS, PRE_CADASTRO } from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

const router = useRouter();
const complemento = useComplementoStore();

const SITUACOES: Record<string, { rotulo: string; tom: string }> = {
  preenchendo: { rotulo: 'Em complementação', tom: 'neutro' },
  'em-analise': { rotulo: 'Em análise', tom: 'info' },
  devolvido: { rotulo: 'Devolvido', tom: 'warning' },
  reenviado: { rotulo: 'Reenviado', tom: 'purple' },
  aprovado: { rotulo: 'Aprovado', tom: 'success' },
};

const linhas = computed(() => [
  {
    protocolo: complemento.protocolo,
    nome: PRE_CADASTRO.razaoSocial,
    cnpj: PRE_CADASTRO.cnpj,
    tipo: 'Cooperativa',
    situacao: complemento.situacao,
    enviado: complemento.dataEnvio ? complemento.dataEnvio.split(',')[0] : '—',
    docs: `${complemento.documentosAnexados} de ${complemento.totalDocumentos}`,
    viva: true,
  },
  ...FILA_CADASTROS.map((l) => ({ ...l, viva: false })),
]);

function abrir(l: { viva: boolean; situacao: string; protocolo: string }) {
  if (!l.viva || l.situacao === 'preenchendo') return;
  void router.push({ name: 'admin-analise', params: { protocolo: l.protocolo.toLowerCase() } });
}
</script>

<template>
  <GestoraShell secao-ativa="Cadastros de operador" :explorador="false">
    <nav class="ax-trilha" aria-label="Trilha">
      <span>Recicla Admin</span><span aria-hidden="true">/</span><strong>Cadastros para análise</strong>
    </nav>

    <header>
      <h1 class="ax-titulo">Cadastros de operador logístico</h1>
      <p class="ax-sub">
        Complementos de cadastro enviados para análise, do mais recente para o mais antigo. Busque pelo nome, CNPJ
        ou protocolo.
      </p>
    </header>

    <div class="ax-filtros">
      <label class="ax-campo"><span>Buscar</span><input type="text" placeholder="Nome, CNPJ ou protocolo" /></label>
      <label class="ax-campo ax-campo--curto"><span>Tipo</span><select><option>Todos</option></select></label>
      <label class="ax-campo ax-campo--curto"><span>Situação</span><select><option>Todas</option></select></label>
    </div>

    <div class="ax-tabela" role="table" aria-label="Cadastros para análise">
      <div class="ax-linha ax-linha--cab" role="row">
        <span role="columnheader">Protocolo</span>
        <span role="columnheader">Organização e CNPJ</span>
        <span role="columnheader">Tipo</span>
        <span role="columnheader">Situação</span>
        <span role="columnheader">Enviado em</span>
        <span role="columnheader">Documentos</span>
        <span />
      </div>
      <button
        v-for="l in linhas"
        :key="l.protocolo"
        type="button"
        class="ax-linha"
        :class="{ 'ax-linha--viva': l.viva }"
        role="row"
        @click="abrir(l)"
      >
        <span class="ax-protocolo">{{ l.protocolo }}</span>
        <span class="ax-org"><strong>{{ l.nome }}</strong><small>{{ l.cnpj }}</small></span>
        <span>{{ l.tipo }}</span>
        <span><span class="ax-chip" :class="`ax-chip--${SITUACOES[l.situacao]?.tom}`">{{ SITUACOES[l.situacao]?.rotulo }}</span></span>
        <span class="ax-data">{{ l.enviado }}</span>
        <span>{{ l.docs }}</span>
        <v-icon icon="mdi-chevron-right" size="18" aria-hidden="true" />
      </button>
    </div>
    <p v-if="complemento.situacao === 'preenchendo'" class="ax-dica">
      A Recicla Cerrado ainda não enviou o complemento. Envie pelo perfil Operador Logístico para ela entrar na fila.
    </p>
  </GestoraShell>
</template>

<style scoped>
.ax-trilha {
  display: flex;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-muted);
}

.ax-trilha strong {
  color: var(--rg-color-text-primary);
  font-weight: var(--rg-font-weight-medium);
}

.ax-titulo {
  margin: 0;
  font-size: 28px;
  line-height: 34px;
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
}

.ax-sub {
  margin: var(--rg-space-1) 0 0;
  font-size: 13px;
  color: var(--rg-color-text-secondary);
}

.ax-filtros {
  display: flex;
  gap: var(--rg-space-4);
  padding: var(--rg-space-6);
  background: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
}

.ax-campo {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--rg-space-1);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
}

.ax-campo--curto {
  flex: 0 0 180px;
}

.ax-campo input,
.ax-campo select {
  height: 44px;
  padding: 0 var(--rg-space-3);
  border: 1px solid var(--rg-primitive-neutral-500);
  border-radius: var(--rg-radius-md);
  font: inherit;
  font-size: var(--rg-font-size-sm);
  background: var(--rg-color-surface-raised);
}

.ax-tabela {
  display: flex;
  flex-direction: column;
  background: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  overflow: hidden;
}

.ax-linha {
  display: grid;
  grid-template-columns: 150px 1fr 120px 150px 120px 100px 24px;
  align-items: center;
  gap: var(--rg-space-4);
  padding: var(--rg-space-4) var(--rg-space-6);
  border: none;
  border-top: 1px solid var(--rg-color-border-subtle);
  background: none;
  font: inherit;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-secondary);
  text-align: left;
  cursor: default;
}

.ax-linha--cab {
  border-top: none;
  background: var(--rg-color-surface-subtle);
  font-weight: var(--rg-font-weight-medium);
}

.ax-linha--viva {
  cursor: pointer;
}

.ax-linha--viva:hover {
  background: var(--rg-color-surface-subtle);
}

.ax-linha:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: -2px;
}

.ax-protocolo {
  color: var(--rg-color-text-brand);
  font-weight: var(--rg-font-weight-medium);
}

.ax-org {
  display: flex;
  flex-direction: column;
}

.ax-org strong {
  color: var(--rg-color-text-primary);
  font-weight: var(--rg-font-weight-semibold);
}

.ax-org small {
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-muted);
}

.ax-data {
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.ax-chip {
  display: inline-block;
  padding: 2px var(--rg-space-2);
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
}

.ax-chip--info { background: var(--rg-color-feedback-info-soft); color: var(--rg-color-feedback-info); }
.ax-chip--warning { background: var(--rg-color-feedback-warning-soft); color: var(--rg-primitive-amber-700); }
.ax-chip--success { background: var(--rg-color-feedback-success-soft); color: var(--rg-color-feedback-success); }
.ax-chip--purple { background: #f3e8ff; color: #7e22ce; }
.ax-chip--neutro { background: var(--rg-color-surface-subtle); color: var(--rg-color-text-secondary); }

.ax-dica {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-muted);
}
</style>
