<script setup lang="ts">
/**
 * Complemento de cadastro do Operador Logístico — a segunda parte do registro.
 *
 * Fluxo decidido em 31/08 (proposta à SIC): o pré-cadastro de produção fica
 * intocado; o e-mail de ativação leva ao login e o login cai aqui. A conta
 * nasce "em complementação" — o menu só mostra Minha Conta e Complemento de
 * cadastro — e as funcionalidades abrem depois da aprovação da análise.
 *
 * Rodada SEMAD (15/09): se a análise devolve o cadastro, ele abre direto em
 * Documentos, com o alerta vermelho no topo de todas as etapas (SEMAD-01) e o
 * reenvio no lugar do envio.
 *
 * Figma: página `♻️ Arquivo Recicla 2026`, seção `Setembro 2026 · Recicla Goiás ·
 * Complemento de cadastro do Operador Logístico`.
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
import { DOCUMENTOS_EXIGIDOS, ETAPAS } from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

const router = useRouter();
const complemento = useComplementoStore();

type Visao = 'formulario' | 'confirmacao' | 'lobby' | 'enviado';
const visao = ref<Visao>(
  complemento.situacao === 'preenchendo' || complemento.situacao === 'devolvido' ? 'formulario' : 'lobby',
);
if (complemento.situacao === 'devolvido') complemento.irPara(2);

const COMPONENTES_ETAPA = [EtapaDadosGerais, EtapaDocumentos, EtapaOperacao, EtapaEstrutura, EtapaRevisao] as const;

const componenteAtual = computed(() => COMPONENTES_ETAPA[complemento.etapa - 1]);
const ultimaEtapa = computed(() => complemento.etapa === ETAPAS.length);
const rotulo = (id: string) => DOCUMENTOS_EXIGIDOS.find((d) => d.id === id)?.rotulo ?? id;

function cancelar() {
  void router.push({ name: 'entrar' });
}

function enviar() {
  if (complemento.emCorrecao) complemento.reenviar();
  else complemento.enviar();
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
    <ComplementoLobby v-if="visao === 'lobby'" @ver-enviado="visao = 'enviado'" @reiniciar="reiniciar" />

    <ComplementoConfirmacao v-else-if="visao === 'confirmacao'" @acompanhar="visao = 'lobby'" />

    <template v-else-if="visao === 'enviado'">
      <header class="ox-pagina__cabecalho">
        <div>
          <h1 class="ox-pagina__titulo">Complemento de cadastro</h1>
          <p class="ox-pagina__subtitulo">Esta é uma cópia de leitura do que foi enviado.</p>
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
            {{
              complemento.emCorrecao
                ? 'Corrija o que a análise devolveu e envie de novo. O que já foi conferido fica travado.'
                : 'Conte como a cooperativa funciona e anexe os documentos. Dá para avançar e voltar entre as etapas; nada é enviado antes da revisão final.'
            }}
          </p>
        </div>
      </header>

      <div
        v-if="complemento.emCorrecao && complemento.faltaCorrigir.length"
        class="ox-alerta ox-alerta--erro"
        role="alert"
      >
        <v-icon icon="mdi-alert-circle" size="22" aria-hidden="true" />
        <div>
          <p class="ox-alerta__titulo">Seu cadastro precisa de correção</p>
          <p class="ox-alerta__texto">
            A análise devolveu {{ complemento.idsDevolvidos.length }}
            {{ complemento.idsDevolvidos.length === 1 ? 'documento' : 'documentos' }}. Anexe os arquivos
            atualizados e envie de novo para uma nova análise.
          </p>
          <ul class="ox-alerta__lista">
            <li v-for="id in complemento.idsDevolvidos" :key="id">
              <strong>{{ rotulo(id) }}:</strong> {{ complemento.devolvidos[id] }}
              <button
                v-if="complemento.etapa !== 2"
                type="button"
                class="ox-alerta__link"
                @click="complemento.irPara(2)"
              >
                Corrigir
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div v-else-if="complemento.emCorrecao" class="ox-alerta ox-alerta--info" role="status">
        <v-icon icon="mdi-information" size="22" aria-hidden="true" />
        <div>
          <p class="ox-alerta__titulo">Correção pronta para reenvio</p>
          <p class="ox-alerta__texto">
            Os documentos devolvidos foram atualizados. Envie de novo para uma nova análise.
          </p>
        </div>
      </div>

      <ComplementoStepper :atual="complemento.etapa" @ir="complemento.irPara" />

      <component :is="componenteAtual" @editar="complemento.irPara" />

      <footer class="ox-pagina__acoes">
        <RgButton v-if="complemento.etapa === 1" variant="secondary" @click="cancelar">Cancelar</RgButton>
        <RgButton v-else variant="secondary" @click="complemento.voltar()">Voltar</RgButton>

        <RgButton
          v-if="complemento.emCorrecao && !ultimaEtapa"
          variant="primary"
          @click="complemento.irPara(5)"
        >
          Ir para a revisão
        </RgButton>
        <RgButton v-else-if="!ultimaEtapa" variant="primary" @click="complemento.avancar()">Avançar</RgButton>
        <RgButton
          v-else
          variant="primary"
          :disabled="complemento.emCorrecao ? !complemento.podeReenviar : !complemento.podeEnviar"
          @click="enviar"
        >
          {{ complemento.emCorrecao ? 'Reenviar para análise' : 'Enviar cadastro' }}
        </RgButton>
      </footer>
    </template>
  </GestoraShell>
</template>

<style scoped>
.ox-alerta {
  display: flex;
  gap: var(--rg-space-3);
  padding: var(--rg-space-5) var(--rg-space-6);
  border-radius: var(--rg-radius-lg);
}

.ox-alerta--erro {
  background: var(--rg-color-feedback-danger-soft);
  border: 1px solid var(--rg-primitive-red-100);
  color: var(--rg-color-feedback-danger);
}

.ox-alerta--info {
  background: var(--rg-color-feedback-info-soft);
  color: var(--rg-color-feedback-info);
}

.ox-alerta__titulo {
  margin: 0;
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
}

.ox-alerta__texto,
.ox-alerta__lista {
  margin: var(--rg-space-1) 0 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-base);
  color: var(--rg-primitive-red-700);
}

.ox-alerta--info .ox-alerta__texto {
  color: var(--rg-color-text-secondary);
}

.ox-alerta__lista {
  padding-left: var(--rg-space-5);
}

.ox-alerta__link {
  margin-left: var(--rg-space-2);
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-primitive-red-700);
  text-decoration: underline;
  cursor: pointer;
}
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
