<script setup lang="ts">
/**
 * Dashboard do Verificador de Resultados — frame `REC-VER` no Figma.
 *
 * A tela mais enxuta dos três perfis: o que ele acompanha é a documentação que
 * chegou e o prazo de verificação. O card de prazo está em período restritivo, então
 * segue a D-R001: chip de estado + um gatilho que conta, e a lista no popover.
 */
import { computed, ref } from 'vue';

import ContextStrip from '@/components/gestora/ContextStrip.vue';
import DeadlineCard from '@/components/gestora/DeadlineCard.vue';
import DocumentationCard from '@/components/gestora/DocumentationCard.vue';
import GestoraShell from '@/components/gestora/GestoraShell.vue';
import QuickAccessCard from '@/components/gestora/QuickAccessCard.vue';
import YearSelect from '@/components/gestora/YearSelect.vue';
import { ANOS_EXECUCAO } from '@/data/mocks/gestora';
import {
  ACESSO_RAPIDO_VERIFICADOR,
  ANO_EXECUCAO_PADRAO,
  DOCUMENTACAO_VERIFICADOR,
  PRAZO_VERIFICACAO,
} from '@/data/mocks/perfis';
import { useSessaoStore } from '@/stores/sessao';

const sessao = useSessaoStore();
const anoExecucao = ref(ANO_EXECUCAO_PADRAO);
const anoBase = computed(() => anoExecucao.value - 1);

const documentacao = computed(() =>
  DOCUMENTACAO_VERIFICADOR.map((linha) => ({
    ...linha,
    titulo: linha.titulo.replace(/\d{4}$/, String(anoExecucao.value)),
  })),
);
</script>

<template>
  <GestoraShell secao-ativa="Dashboard" :explorador="false">
    <header class="gx-dash__header">
      <div class="gx-dash__saudacao">
        <h1 class="gx-dash__titulo">Olá, {{ sessao.usuario?.nome }}</h1>
        <p class="gx-dash__identificacao">{{ sessao.usuario?.identificacao }}</p>
      </div>

      <YearSelect v-model="anoExecucao" :anos="ANOS_EXECUCAO" />
    </header>

    <ContextStrip :ano-execucao="anoExecucao" :ano-base="anoBase" />

    <div class="gx-dash__grade">
      <div class="gx-dash__principal">
        <DocumentationCard
          :ano-execucao="anoExecucao"
          :linhas="documentacao"
          descricao="Notas fiscais e relatórios do ano de execução"
        />
      </div>

      <div class="gx-dash__lateral">
        <DeadlineCard :prazo="PRAZO_VERIFICACAO" />
        <QuickAccessCard :acoes="ACESSO_RAPIDO_VERIFICADOR" />
      </div>
    </div>
  </GestoraShell>
</template>

<style scoped>
.gx-dash__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--rg-space-6);
}

.gx-dash__saudacao {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
}

.gx-dash__titulo {
  margin: 0;
  font-size: 28px;
  line-height: 34px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

.gx-dash__identificacao {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.gx-dash__grade {
  display: flex;
  align-items: flex-start;
  gap: var(--rg-space-5);
}

.gx-dash__principal {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
  flex: 1;
  min-width: 0;
}

.gx-dash__lateral {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
  flex-shrink: 0;
  width: clamp(360px, 22%, 520px);
}

@media (max-width: 1120px) {
  .gx-dash__grade {
    flex-direction: column;
  }

  .gx-dash__lateral {
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
  }

  .gx-dash__lateral > * {
    flex: 1 1 320px;
  }
}

@media (max-width: 720px) {
  .gx-dash__header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--rg-space-4);
  }

  .gx-dash__titulo {
    font-size: 24px;
    line-height: 30px;
  }
}
</style>
