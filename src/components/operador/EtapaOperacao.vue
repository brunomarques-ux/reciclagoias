<script setup lang="ts">
/**
 * Etapa 3 · Operação — o que a cooperativa faz: serviços, equipamentos,
 * resíduos e origem.
 *
 * Toda opção "outro" é um item da lista que, marcado, abre o campo de descrição
 * na moldura condicional (OxCondicional) — padrão único do complemento. O mesmo
 * vale para "recebe de outros municípios?": o Sim abre o campo de quais.
 */
import OxCampo from '@/components/operador/OxCampo.vue';
import OxCartao from '@/components/operador/OxCartao.vue';
import OxCondicional from '@/components/operador/OxCondicional.vue';
import OxEscolhaSimNao from '@/components/operador/OxEscolhaSimNao.vue';
import OxOpcao from '@/components/operador/OxOpcao.vue';
import {
  BENEFICIAMENTOS,
  EQUIPAMENTOS,
  ORIGENS_RESIDUO,
  TIPOS_RESIDUO,
} from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

const complemento = useComplementoStore();
const f = complemento.formulario;
</script>

<template>
  <div class="ox-etapa">
    <OxCartao titulo="Serviços e beneficiamento">
      <div class="ox-pergunta-linha">
        <span class="ox-pergunta">A cooperativa realiza serviço de coleta?</span>
        <OxEscolhaSimNao rotulo="A cooperativa realiza serviço de coleta?" v-model="f.coleta" />
      </div>

      <hr class="ox-divisor" />

      <fieldset class="ox-grupo">
        <legend class="ox-pergunta">Quais beneficiamentos a cooperativa realiza?</legend>
        <p class="ox-dica-grupo">Marque todas as opções que se aplicam.</p>
        <div class="ox-grade">
          <OxOpcao
            v-for="opcao in BENEFICIAMENTOS"
            :key="opcao.id"
            :rotulo="opcao.rotulo"
            :marcado="f.beneficiamentos.includes(opcao.id)"
            @alternar="complemento.alternarOpcao(f.beneficiamentos, opcao.id)"
          />
        </div>
        <OxCondicional v-if="f.beneficiamentos.includes('outro')">
          <OxCampo rotulo="Qual outro serviço?" v-model="f.beneficiamentoOutro" />
        </OxCondicional>
      </fieldset>
    </OxCartao>

    <OxCartao titulo="Equipamentos da unidade" descricao="Marque o que existe em funcionamento na unidade.">
      <fieldset class="ox-grupo">
        <legend class="ox-visualmente-oculto">Equipamentos da unidade</legend>
        <div class="ox-grade">
          <OxOpcao
            v-for="opcao in EQUIPAMENTOS"
            :key="opcao.id"
            :rotulo="opcao.rotulo"
            :marcado="f.equipamentos.includes(opcao.id)"
            @alternar="complemento.alternarOpcao(f.equipamentos, opcao.id)"
          />
        </div>
        <OxCondicional v-if="f.equipamentos.includes('outro')">
          <OxCampo rotulo="Quais outros equipamentos?" v-model="f.equipamentoOutro" />
        </OxCondicional>
      </fieldset>
    </OxCartao>

    <OxCartao titulo="Resíduos e origem">
      <fieldset class="ox-grupo">
        <legend class="ox-pergunta">Quais tipos de resíduos a cooperativa recebe?</legend>
        <div class="ox-grade">
          <OxOpcao
            v-for="opcao in TIPOS_RESIDUO"
            :key="opcao.id"
            :rotulo="opcao.rotulo"
            :marcado="f.residuos.includes(opcao.id)"
            @alternar="complemento.alternarOpcao(f.residuos, opcao.id)"
          />
        </div>
        <OxCondicional v-if="f.residuos.includes('outro')">
          <OxCampo rotulo="Qual outro tipo?" v-model="f.residuoOutro" />
        </OxCondicional>
      </fieldset>

      <hr class="ox-divisor" />

      <fieldset class="ox-grupo">
        <legend class="ox-pergunta">De onde vêm os resíduos que a cooperativa recebe ou coleta?</legend>
        <p class="ox-dica-grupo">Marque todas as opções que se aplicam.</p>
        <div class="ox-grade">
          <OxOpcao
            v-for="opcao in ORIGENS_RESIDUO"
            :key="opcao.id"
            :rotulo="opcao.rotulo"
            :marcado="f.origens.includes(opcao.id)"
            @alternar="complemento.alternarOpcao(f.origens, opcao.id)"
          />
        </div>
        <OxCondicional v-if="f.origens.includes('outro')">
          <OxCampo rotulo="Qual outra origem?" v-model="f.origemOutra" />
        </OxCondicional>
      </fieldset>

      <hr class="ox-divisor" />

      <div class="ox-pergunta-linha">
        <span class="ox-pergunta">Coleta ou recebe resíduos sólidos de outros municípios?</span>
        <OxEscolhaSimNao
          rotulo="Coleta ou recebe resíduos sólidos de outros municípios?"
          v-model="f.outrosMunicipios"
        />
      </div>
      <OxCondicional v-if="f.outrosMunicipios === 'sim'">
        <OxCampo rotulo="Quais municípios?" v-model="f.quaisMunicipios" />
      </OxCondicional>

      <hr class="ox-divisor" />

      <div class="ox-pergunta-linha">
        <span class="ox-pergunta">Tem parceria com o município onde está localizada?</span>
        <OxEscolhaSimNao
          rotulo="Tem parceria com o município onde está localizada?"
          v-model="f.parceriaMunicipio"
        />
      </div>

      <hr class="ox-divisor" />

      <div class="ox-pergunta-linha">
        <span class="ox-pergunta">
          Comercializa o certificado de crédito de reciclagem da logística reversa?
        </span>
        <OxEscolhaSimNao
          rotulo="Comercializa o certificado de crédito de reciclagem da logística reversa?"
          v-model="f.comercializaCertificado"
        />
      </div>
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

.ox-visualmente-oculto {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
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
