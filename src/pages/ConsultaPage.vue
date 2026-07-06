<script setup lang="ts">
/**
 * Consulta de Regularidade por CNPJ — página pública off-system.
 *
 * Máquina de estados numa tela só (troca in-place, padrão dos prêmios):
 *   busca → varredura → regular | pendencia | nao-encontrado
 *
 * O resultado é resolvido ANTES da varredura começar (mock local); a
 * varredura só encena o tempo de resposta, com timing honesto (curto
 * quando o CNPJ não existe). A certidão/relatório abre em overlay A4.
 */
import { computed, ref } from 'vue';
import ConsultaShell from '@/components/consulta/ConsultaShell.vue';
import ConsultaBusca from '@/components/consulta/ConsultaBusca.vue';
import ConsultaVarredura from '@/components/consulta/ConsultaVarredura.vue';
import ConsultaResultRegular from '@/components/consulta/ConsultaResultRegular.vue';
import ConsultaResultPendencia from '@/components/consulta/ConsultaResultPendencia.vue';
import ConsultaResultNaoEncontrado from '@/components/consulta/ConsultaResultNaoEncontrado.vue';
import ConsultaCertidao from '@/components/consulta/ConsultaCertidao.vue';
import {
  findEmpresaByCnpj,
  type ConsultaEmpresa,
  type ConsultaStatus,
} from '@/data/mocks/consulta';

type Etapa = 'busca' | 'varredura' | 'resultado';

const etapa = ref<Etapa>('busca');
const cnpjConsultado = ref('');
const empresa = ref<ConsultaEmpresa | null>(null);
const consultaEm = ref('');

const resultado = computed<ConsultaStatus>(() => empresa.value?.status ?? 'nao-encontrado');

/** Overlay da certidão (null = fechado). */
const certidaoTipo = ref<'certidao-regular' | 'relatorio-pendencias' | null>(null);

function iniciarConsulta(cnpj: string) {
  cnpjConsultado.value = cnpj;
  empresa.value = findEmpresaByCnpj(cnpj);
  etapa.value = 'varredura';
}

function finalizarVarredura() {
  consultaEm.value = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
    .format(new Date())
    .replace(',', ' às ');
  etapa.value = 'resultado';
}

function novaConsulta() {
  etapa.value = 'busca';
  empresa.value = null;
  cnpjConsultado.value = '';
}

function abrirCertidao(tipo: 'certidao-regular' | 'relatorio-pendencias') {
  certidaoTipo.value = tipo;
}
</script>

<template>
  <ConsultaShell>
    <Transition name="cx-swap" mode="out-in">
      <!-- Busca -->
      <ConsultaBusca v-if="etapa === 'busca'" key="busca" @consultar="iniciarConsulta" />

      <!-- Varredura -->
      <ConsultaVarredura
        v-else-if="etapa === 'varredura'"
        key="varredura"
        :cnpj="cnpjConsultado"
        :resultado="resultado"
        @done="finalizarVarredura"
        @cancel="novaConsulta"
      />

      <!-- Resultado · Regular -->
      <ConsultaResultRegular
        v-else-if="resultado === 'regular' && empresa"
        key="regular"
        :empresa="empresa"
        @certidao="abrirCertidao('certidao-regular')"
        @imprimir="abrirCertidao('certidao-regular')"
        @nova-consulta="novaConsulta"
      />

      <!-- Resultado · Com pendência -->
      <ConsultaResultPendencia
        v-else-if="resultado === 'pendencia' && empresa"
        key="pendencia"
        :empresa="empresa"
        :consulta-em="consultaEm"
        @relatorio="abrirCertidao('relatorio-pendencias')"
        @nova-consulta="novaConsulta"
      />

      <!-- Resultado · Não encontrado -->
      <ConsultaResultNaoEncontrado
        v-else
        key="nao-encontrado"
        :cnpj="cnpjConsultado"
        @nova-consulta="novaConsulta"
      />
    </Transition>

    <ConsultaCertidao
      v-if="certidaoTipo && empresa"
      :empresa="empresa"
      :tipo="certidaoTipo"
      :emitida-em="consultaEm"
      @close="certidaoTipo = null"
    />
  </ConsultaShell>
</template>

<style scoped>
/* Troca in-place entre estados: leave rápido, enter com ênfase */
.cx-swap-enter-active {
  transition:
    opacity 280ms var(--rg-motion-ease-emphasized),
    transform 280ms var(--rg-motion-ease-emphasized);
}

.cx-swap-leave-active {
  transition:
    opacity 180ms var(--rg-motion-ease-accelerate),
    transform 180ms var(--rg-motion-ease-accelerate);
}

.cx-swap-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.cx-swap-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .cx-swap-enter-active,
  .cx-swap-leave-active {
    transition: none !important;
  }
}
</style>
