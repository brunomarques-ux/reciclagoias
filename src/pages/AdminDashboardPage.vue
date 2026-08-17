<script setup lang="ts">
/**
 * Dashboard da Administração (SIC) — frame `REC-ADM` no Figma.
 *
 * Mesma estrutura do dashboard da Entidade Gestora: cabeçalho com o seletor de ano,
 * faixa de contexto, e a grade de coluna principal + lateral de 360. O que é do
 * admin são os indicadores do topo, a distribuição de usuários e os blocos de massa.
 *
 * Regra de forma que governa a tela: proporção de um todo com poucas categorias vai
 * em gráfico circular (usuários, recuperação por material); comparação de categorias
 * com contagem exata continua em barra empilhada (status da documentação, D-R003).
 * Em todos os casos o número fica escrito.
 */
import { computed, ref } from 'vue';

import AvailableMassCard from '@/components/gestora/AvailableMassCard.vue';
import ContextStrip from '@/components/gestora/ContextStrip.vue';
import DeadlineCard from '@/components/gestora/DeadlineCard.vue';
import DocumentationCard from '@/components/gestora/DocumentationCard.vue';
import GestoraShell from '@/components/gestora/GestoraShell.vue';
import KpiCard from '@/components/gestora/KpiCard.vue';
import MassRecoveryCard from '@/components/gestora/MassRecoveryCard.vue';
import UserDistributionCard from '@/components/gestora/UserDistributionCard.vue';
import YearSelect from '@/components/gestora/YearSelect.vue';
import { ANOS_EXECUCAO } from '@/data/mocks/gestora';
import {
  ANO_EXECUCAO_PADRAO,
  DISTRIBUICAO_USUARIOS,
  DOCUMENTACAO_ADMIN,
  INDICADORES_ADMIN,
  MASSAS_DISPONIVEIS,
  MATERIAIS_ADMIN,
  PRAZOS_ADMIN,
  TOTAL_MASSA_DISPONIVEL,
} from '@/data/mocks/perfis';
import { useSessaoStore } from '@/stores/sessao';

const sessao = useSessaoStore();
const anoExecucao = ref(ANO_EXECUCAO_PADRAO);
const anoBase = computed(() => anoExecucao.value - 1);

const documentacao = computed(() =>
  DOCUMENTACAO_ADMIN.map((linha) => ({
    ...linha,
    titulo: linha.titulo.replace(/\d{4}$/, String(anoExecucao.value)),
  })),
);

const indicadores = computed(() =>
  INDICADORES_ADMIN.map((ind) => ({
    ...ind,
    eyebrow: ind.eyebrow.replace(/\d{4}$/, String(anoExecucao.value)),
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

    <ul class="gx-dash__indicadores">
      <li v-for="indicador in indicadores" :key="indicador.eyebrow">
        <KpiCard v-bind="indicador" />
      </li>
    </ul>

    <div class="gx-dash__grade">
      <div class="gx-dash__principal">
        <DocumentationCard
          :ano-execucao="anoExecucao"
          :linhas="documentacao"
          descricao="Relatórios e planos do ano de execução"
        />
        <AvailableMassCard :itens="MASSAS_DISPONIVEIS" :total="TOTAL_MASSA_DISPONIVEL" />
      </div>

      <div class="gx-dash__lateral">
        <UserDistributionCard :fatias="DISTRIBUICAO_USUARIOS" />
        <DeadlineCard v-for="prazo in PRAZOS_ADMIN" :key="prazo.id" :prazo="prazo" />
      </div>
    </div>

    <MassRecoveryCard :ano-execucao="anoExecucao" :materiais="MATERIAIS_ADMIN" />
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

.gx-dash__indicadores {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--rg-space-5);
  margin: 0;
  padding: 0;
  list-style: none;
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
  .gx-dash__indicadores {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

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

  .gx-dash__indicadores {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
