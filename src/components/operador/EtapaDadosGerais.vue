<script setup lang="ts">
/**
 * Etapa 1 · Dados gerais — identificação e endereço da organização.
 *
 * Razão social, nome fantasia, CNPJ, CNAE, e-mail e o tipo de organização vêm do
 * pré-cadastro de produção e aparecem travados (decisão do fluxo de 31/08: o
 * complemento não edita o que o registro já criou; correção é assunto de
 * suporte). O tipo condiciona o formulário: "número de cooperados" só existe
 * para cooperativa. O resto é o que só a organização sabe: contato, porte e
 * endereço da unidade.
 */
import OxCampo from '@/components/operador/OxCampo.vue';
import OxCartao from '@/components/operador/OxCartao.vue';
import { PRE_CADASTRO, ROTULO_TIPO } from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

const complemento = useComplementoStore();
const f = complemento.formulario;
const ehCooperativa = PRE_CADASTRO.tipoOrganizacao === 'cooperativa';

/** Trava na correção (só o devolvido abre), erro do envio (L7) e o motivo da análise. */
const estado = (id: string, oQue: string) => ({
  travado: !complemento.editavel(id),
  erro: complemento.campoEmErro(id) ? `Preencha ${oQue} para enviar o cadastro.` : undefined,
  nota: complemento.emCorrecao ? complemento.devolvidos[id] : undefined,
});
</script>

<template>
  <div class="ox-etapa">
    <OxCartao titulo="Identificação da cooperativa">
      <div class="ox-campos">
        <OxCampo
          class="ox-col-5"
          rotulo="Razão social"
          :model-value="PRE_CADASTRO.razaoSocial"
          travado
        />
        <OxCampo class="ox-col-3" rotulo="CNPJ" :model-value="PRE_CADASTRO.cnpj" travado />
        <OxCampo class="ox-col-4" rotulo="CNAE" :model-value="PRE_CADASTRO.cnae" travado />

        <OxCampo
          class="ox-col-4"
          rotulo="Nome fantasia"
          :model-value="PRE_CADASTRO.nomeFantasia"
          travado
        />
        <OxCampo class="ox-col-5" rotulo="E-mail" :model-value="PRE_CADASTRO.email" travado />
        <OxCampo class="ox-col-3" rotulo="Telefone (com DDD)" v-model="f.telefone" v-bind="estado('telefone', 'o telefone')" />

        <OxCampo
          class="ox-col-3"
          rotulo="Tipo de organização"
          :model-value="ROTULO_TIPO[PRE_CADASTRO.tipoOrganizacao]"
          travado
        />
        <OxCampo
          v-if="ehCooperativa"
          class="ox-col-3"
          rotulo="Número de cooperados"
          v-model="f.cooperados"
          v-bind="estado('cooperados', 'o número de cooperados')"
        />
        <OxCampo class="ox-col-3" rotulo="Ano de criação" v-model="f.anoCriacao" v-bind="estado('ano-criacao', 'o ano de criação')" />
      </div>

      <p class="ox-nota">
        Razão social, nome fantasia, CNPJ, CNAE, e-mail e o tipo de organização vêm do pré-cadastro.
        Para corrigir algum deles, fale com o suporte.
      </p>
    </OxCartao>

    <OxCartao titulo="Endereço da unidade">
      <div class="ox-campos">
        <OxCampo class="ox-col-3" rotulo="CEP" v-model="f.cep" v-bind="estado('cep', 'o CEP')" />
        <OxCampo class="ox-col-7" rotulo="Logradouro" v-model="f.logradouro" v-bind="estado('logradouro', 'o logradouro')" />
        <OxCampo class="ox-col-2" rotulo="Número" v-model="f.numero" v-bind="estado('numero', 'o número')" />

        <OxCampo class="ox-col-3" rotulo="Estado" v-model="f.estado" v-bind="estado('estado', 'o estado')" />
        <OxCampo class="ox-col-9" rotulo="Município" v-model="f.municipio" v-bind="estado('municipio', 'o município')" />
      </div>

      <p class="ox-nota">
        O CEP preenche logradouro, estado e município automaticamente. Confira e complete o número.
      </p>
    </OxCartao>
  </div>
</template>

<style scoped>
.ox-etapa {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-6);
}

.ox-campos {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--rg-space-4) var(--rg-space-5);
}

.ox-campos > * {
  grid-column: span 12;
}

.ox-col-2 { grid-column: span 2; }
.ox-col-3 { grid-column: span 3; }
.ox-col-4 { grid-column: span 4; }
.ox-col-5 { grid-column: span 5; }
.ox-col-7 { grid-column: span 7; }
.ox-col-8 { grid-column: span 8; }
.ox-col-9 { grid-column: span 9; }

.ox-nota {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-muted);
}

@media (max-width: 900px) {
  .ox-campos > * {
    grid-column: span 6;
  }
}

@media (max-width: 600px) {
  .ox-campos > * {
    grid-column: span 12;
  }
}
</style>
