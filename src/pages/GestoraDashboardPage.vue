<script setup lang="ts">
/**
 * Dashboard da Entidade Gestora — frames REC-01…REC-06 da seção
 * "Agosto 2026 · Recicla Goiás · Dashboard da Entidade Gestora".
 *
 * A grade é coluna principal (fill) + coluna lateral de 360px, gap 20 — as medidas do
 * frame de 1440. Acima disso as duas colunas crescem: o dashboard ocupa a largura toda
 * em vez de ficar centralizado com vazio dos dois lados. O estado do período restritivo
 * é **por card**: planos e relatórios têm vigências, flags e listas independentes
 * (D-R001).
 *
 * Os dados vêm da store do explorador, não de um mock fixo: `?cenario=` carrega um
 * preset do Figma e o painel no rodapé do menu edita tudo ao vivo. URL e painel ficam
 * em sincronia nos dois sentidos.
 */
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ContextStrip from '@/components/gestora/ContextStrip.vue';
import DeadlineCard from '@/components/gestora/DeadlineCard.vue';
import DocumentationCard from '@/components/gestora/DocumentationCard.vue';
import GestoraShell from '@/components/gestora/GestoraShell.vue';
import YearSelect from '@/components/gestora/YearSelect.vue';
import { ANOS_EXECUCAO, ehPreset } from '@/data/mocks/gestora';
import { useExploradorStore } from '@/stores/explorador';
import { useSessaoStore } from '@/stores/sessao';

const route = useRoute();
const router = useRouter();
const sessao = useSessaoStore();
const explorador = useExploradorStore();

watch(
  () => route.query.cenario,
  (valor) => {
    if (ehPreset(valor) && valor !== explorador.presetAtivo) explorador.aplicarPreset(valor);
  },
  { immediate: true },
);

watch(
  () => explorador.presetAtivo,
  (id) => {
    if (id && id !== route.query.cenario) {
      void router.replace({ query: { ...route.query, cenario: id } });
    }
  },
);
</script>

<template>
  <GestoraShell secao-ativa="Dashboard">
    <header class="gx-dash__header">
      <div class="gx-dash__saudacao">
        <h1 class="gx-dash__titulo">Olá, {{ sessao.entidade?.nome }}</h1>
        <p class="gx-dash__identificacao">
          Entidade gestora · CNPJ {{ sessao.entidade?.cnpj }}
        </p>
      </div>

      <YearSelect v-model="explorador.anoExecucao" :anos="ANOS_EXECUCAO" />
    </header>

    <ContextStrip :ano-execucao="explorador.anoExecucao" :ano-base="explorador.anoBase" />

    <div class="gx-dash__grade">
      <div class="gx-dash__principal">
        <DocumentationCard
          :ano-execucao="explorador.anoExecucao"
          :linhas="explorador.documentacao"
        />
      </div>

      <div class="gx-dash__lateral">
        <DeadlineCard v-for="prazo in explorador.cardsPrazo" :key="prazo.id" :prazo="prazo" />
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
  flex: 1;
  min-width: 0;
}

/* 360px é a medida do frame e vale até a grade passar de ~1640px; daí em diante a
   lateral cresce junto com a tela, senão em monitor grande ela vira um filete ao
   lado de um card gigante. */
.gx-dash__lateral {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
  flex-shrink: 0;
  width: clamp(360px, 22%, 520px);
}

/* Sem espaço para as duas colunas, a lateral desce e os dois cards de prazo
   dividem a linha — cada um continua com o mesmo desenho. */
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
