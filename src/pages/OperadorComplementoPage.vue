<script setup lang="ts">
/**
 * Complemento de cadastro do Operador Logístico — a segunda parte do registro.
 *
 * Fluxo decidido em 31/08 (proposta à SIC): o pré-cadastro de produção fica
 * intocado; o e-mail de ativação leva ao login e o login cai aqui. A conta
 * nasce "em complementação" — o menu só mostra Minha Conta e Complemento de
 * cadastro — e as funcionalidades abrem depois da aprovação da análise.
 *
 * Figma: seção `Setembro 2026 · Recicla Goiás · Complemento de Cadastro do
 * Operador Logístico` (Telas 2026). As regras do formulário moram na store
 * `complemento`; esta página só orquestra etapas, envio e as visões de
 * confirmação/lobby.
 */
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import GestoraShell from '@/components/gestora/GestoraShell.vue';
import ComplementoConfirmacao from '@/components/operador/ComplementoConfirmacao.vue';
import ComplementoLobby from '@/components/operador/ComplementoLobby.vue';
import ComplementoStepper from '@/components/operador/ComplementoStepper.vue';
import EtapaDadosGerais from '@/components/operador/EtapaDadosGerais.vue';
import EtapaDocumentos from '@/components/operador/EtapaDocumentos.vue';
import EtapaEstrutura from '@/components/operador/EtapaEstrutura.vue';
import EtapaOperacao from '@/components/operador/EtapaOperacao.vue';
import EtapaRevisao from '@/components/operador/EtapaRevisao.vue';
import RgButton from '@/components/RgButton.vue';
import { ETAPAS } from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

const router = useRouter();
const complemento = useComplementoStore();

type Visao = 'formulario' | 'confirmacao' | 'lobby' | 'enviado';
const visao = ref<Visao>(complemento.fase === 'enviado' ? 'lobby' : 'formulario');

const COMPONENTES_ETAPA = [
  EtapaDadosGerais,
  EtapaDocumentos,
  EtapaOperacao,
  EtapaEstrutura,
  EtapaRevisao,
] as const;

const componenteAtual = computed(() => COMPONENTES_ETAPA[complemento.etapa - 1]);
const ultimaEtapa = computed(() => complemento.etapa === ETAPAS.length);

function cancelar() {
  // Cancelar na etapa 1 = sair do complemento; o rascunho fica guardado.
  void router.push({ name: 'entrar' });
}

function enviar() {
  complemento.enviar();
  visao.value = 'confirmacao';
  window.scrollTo({ top: 0 });
}

function reiniciar() {
  complemento.reiniciar();
  visao.value = 'formulario';
}
</script>

<template>
  <GestoraShell secao-ativa="Complemento de cadastro" :explorador="false">
    <ComplementoLobby
      v-if="visao === 'lobby'"
      @ver-enviado="visao = 'enviado'"
      @reiniciar="reiniciar"
    />

    <ComplementoConfirmacao v-else-if="visao === 'confirmacao'" @acompanhar="visao = 'lobby'" />

    <template v-else-if="visao === 'enviado'">
      <header class="ox-pagina__cabecalho">
        <div>
          <h1 class="ox-pagina__titulo">Complemento de cadastro</h1>
          <p class="ox-pagina__subtitulo">
            Cadastro enviado e em análise. Esta é uma cópia de leitura do que foi enviado.
          </p>
        </div>
        <RgButton variant="outline" size="sm" @click="visao = 'lobby'">Voltar</RgButton>
      </header>

      <EtapaRevisao somente-leitura />
    </template>

    <template v-else>
      <header class="ox-pagina__cabecalho">
        <div>
          <h1 class="ox-pagina__titulo">Complemento de cadastro</h1>
          <p class="ox-pagina__subtitulo">
            Conte como a cooperativa funciona e anexe os documentos. Dá para avançar e voltar entre
            as etapas; nada é enviado antes da revisão final.
          </p>
        </div>
        <p v-if="complemento.rascunhoSalvoEm" class="ox-pagina__rascunho" role="status">
          <v-icon icon="mdi-check-circle-outline" size="14" aria-hidden="true" />
          Rascunho salvo às {{ complemento.rascunhoSalvoEm }}
        </p>
      </header>

      <ComplementoStepper :atual="complemento.etapa" @ir="complemento.irPara" />

      <component :is="componenteAtual" @editar="complemento.irPara" />

      <footer class="ox-pagina__acoes">
        <RgButton
          v-if="complemento.etapa === 1"
          variant="secondary"
          @click="cancelar"
        >
          Cancelar
        </RgButton>
        <RgButton v-else variant="secondary" @click="complemento.voltar()">Voltar</RgButton>

        <RgButton
          v-if="!ultimaEtapa"
          variant="primary"
          @click="complemento.avancar()"
        >
          Avançar
        </RgButton>
        <RgButton
          v-else
          variant="primary"
          :disabled="!complemento.podeEnviar"
          @click="enviar"
        >
          Enviar cadastro
        </RgButton>
      </footer>
    </template>
  </GestoraShell>
</template>

<style scoped>
.ox-pagina__cabecalho {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--rg-space-6);
}

.ox-pagina__titulo {
  margin: 0;
  font-size: 28px;
  line-height: 34px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

.ox-pagina__subtitulo {
  margin: var(--rg-space-1) 0 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.ox-pagina__rascunho {
  display: flex;
  align-items: center;
  gap: var(--rg-space-1);
  margin: 0;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-muted);
  white-space: nowrap;
}

.ox-pagina__acoes {
  display: flex;
  justify-content: space-between;
  gap: var(--rg-space-4);
  padding-top: var(--rg-space-2);
}

@media (max-width: 720px) {
  .ox-pagina__cabecalho {
    flex-direction: column;
    align-items: stretch;
    gap: var(--rg-space-3);
  }

  .ox-pagina__titulo {
    font-size: 24px;
    line-height: 30px;
  }
}
</style>
