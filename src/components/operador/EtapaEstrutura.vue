<script setup lang="ts">
/**
 * Etapa 4 · Estrutura e capacidade — área, instalações, triagem e vidro.
 *
 * As duas perguntas do vidro (destinação e capacidade) só existem quando a
 * resposta de beneficiamento do vidro é "sim" — pergunta que não se aplica não
 * aparece. Radios são nativos, agrupados por `fieldset` com `name` próprio.
 */
import OxCampo from '@/components/operador/OxCampo.vue';
import OxCartao from '@/components/operador/OxCartao.vue';
import OxCondicional from '@/components/operador/OxCondicional.vue';
import OxEscolhaSimNao from '@/components/operador/OxEscolhaSimNao.vue';
import OxOpcao from '@/components/operador/OxOpcao.vue';
import {
  AREAS_UNIDADE,
  MODOS_TRIAGEM,
  PERCEPCOES_OPERACAO,
  SITUACOES_AREA,
} from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

const complemento = useComplementoStore();
const f = complemento.formulario;
</script>

<template>
  <div class="ox-etapa">
    <OxCartao titulo="Área e instalações">
      <fieldset class="ox-grupo">
        <legend class="ox-pergunta">Qual a situação da área onde a unidade se encontra?</legend>
        <div class="ox-grade">
          <OxOpcao
            v-for="opcao in SITUACOES_AREA"
            :key="opcao.id"
            tipo="radio"
            nome="situacao-area"
            :rotulo="opcao.rotulo"
            :marcado="f.situacaoArea === opcao.id"
            @alternar="f.situacaoArea = opcao.id"
          />
        </div>
        <OxCondicional v-if="f.situacaoArea === 'outro'">
          <OxCampo rotulo="Qual a situação da área?" v-model="f.situacaoOutra" />
        </OxCondicional>
      </fieldset>

      <hr class="ox-divisor" />

      <fieldset class="ox-grupo">
        <legend class="ox-pergunta">Quais áreas a unidade possui?</legend>
        <p class="ox-dica-grupo">Marque todas as opções que se aplicam.</p>
        <div class="ox-grade">
          <OxOpcao
            v-for="opcao in AREAS_UNIDADE"
            :key="opcao.id"
            :rotulo="opcao.rotulo"
            :marcado="f.areas.includes(opcao.id)"
            @alternar="complemento.alternarOpcao(f.areas, opcao.id)"
          />
        </div>
        <OxCondicional v-if="f.areas.includes('outro')">
          <OxCampo rotulo="Qual outra área?" v-model="f.areaOutra" />
        </OxCondicional>
      </fieldset>
    </OxCartao>

    <OxCartao titulo="Triagem e capacidade">
      <fieldset class="ox-grupo">
        <legend class="ox-pergunta">Como é feita a triagem dos resíduos?</legend>
        <div class="ox-grade">
          <OxOpcao
            v-for="opcao in MODOS_TRIAGEM"
            :key="opcao.id"
            tipo="radio"
            nome="modo-triagem"
            :rotulo="opcao.rotulo"
            :marcado="f.triagem === opcao.id"
            @alternar="f.triagem = opcao.id"
          />
        </div>
      </fieldset>

      <hr class="ox-divisor" />

      <OxCampo
        rotulo="Qual a capacidade operacional da cooperativa?"
        v-model="f.capacidadeOperacional"
        multilinha
        dica="Descreva volumes, turnos e o que limita a operação hoje."
      />

      <hr class="ox-divisor" />

      <fieldset class="ox-grupo">
        <legend class="ox-pergunta">Na sua percepção, a cooperativa está operando:</legend>
        <div class="ox-grade">
          <OxOpcao
            v-for="opcao in PERCEPCOES_OPERACAO"
            :key="opcao.id"
            tipo="radio"
            nome="percepcao-operacao"
            :rotulo="opcao.rotulo"
            :marcado="f.percepcao === opcao.id"
            @alternar="f.percepcao = opcao.id"
          />
        </div>
      </fieldset>
    </OxCartao>

    <OxCartao titulo="Beneficiamento de vidro">
      <div class="ox-pergunta-linha">
        <span class="ox-pergunta">O empreendimento realiza beneficiamento do vidro?</span>
        <OxEscolhaSimNao
          rotulo="O empreendimento realiza beneficiamento do vidro?"
          v-model="f.beneficiaVidro"
        />
      </div>

      <OxCondicional v-if="f.beneficiaVidro === 'sim'">
        <OxCampo rotulo="Qual a destinação do vidro?" v-model="f.destinacaoVidro" />
        <OxCampo rotulo="Capacidade de beneficiamento" v-model="f.capacidadeVidro" />
      </OxCondicional>
    </OxCartao>
  </div>
</template>

<style scoped>
.ox-etapa {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-6);
}

.ox-grupo {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  margin: 0;
  padding: 0;
  border: none;
}

.ox-pergunta {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-primary);
  padding: 0;
}

.ox-dica-grupo {
  /* a legenda não entra no gap do fieldset: a margem negativa jogava a dica em cima dela */
  margin: var(--rg-space-1) 0 0;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-muted);
}

.ox-pergunta-linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-4);
}

.ox-grade {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--rg-space-3) var(--rg-space-6);
}

.ox-divisor {
  margin: 0;
  border: none;
  border-top: 1px solid var(--rg-color-border-subtle);
}

@media (max-width: 900px) {
  .ox-grade {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .ox-grade {
    grid-template-columns: 1fr;
  }

  .ox-pergunta-linha {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--rg-space-2);
  }
}
</style>
