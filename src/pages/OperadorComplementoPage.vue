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

// Antes de enviar, a janela diz o que ainda está pendente, pelo nome: não é um
// "tem certeza?" genérico. Enviado, o operador cai direto no "em análise", com a
// confirmação no topo (a tela intermediária com "Acompanhar análise" saiu).
const confirmando = ref(false);
const recemEnviado = ref(false);
const pendenciasEnvio = computed(() => {
  const itens: string[] = [];
  if (!complemento.emCorrecao) {
    for (const d of complemento.documentosSemPossuir) itens.push(`${d.rotulo}: resposta Não, sem arquivo`);
    for (const d of complemento.documentosAguardandoArquivo) itens.push(`${d.rotulo}: sem arquivo`);
  }
  for (const n of [1, 3, 4]) for (const c of complemento.campos(n)) if (!c.ok) itens.push(`${c.rotulo}: em branco`);
  return itens;
});

function enviar() {
  confirmando.value = true;
}

function confirmarEnvio() {
  if (complemento.emCorrecao) complemento.reenviar();
  else complemento.enviar();
  confirmando.value = false;
  recemEnviado.value = true;
  visao.value = 'lobby';
  window.scrollTo({ top: 0 });
}

function reiniciar() {
  complemento.reiniciar();
  visao.value = 'formulario';
}
</script>

<template>
  <GestoraShell secao-ativa="Complemento de cadastro" :explorador="false">
    <template v-if="visao === 'lobby'">
      <div v-if="recemEnviado" class="ox-alerta ox-alerta--sucesso" role="status">
        <v-icon icon="mdi-check-circle" size="22" aria-hidden="true" />
        <div>
          <p class="ox-alerta__titulo">
            {{ complemento.situacao === 'reenviado' ? 'Cadastro reenviado para análise' : 'Cadastro enviado para análise' }}
          </p>
          <p class="ox-alerta__texto">
            Protocolo {{ complemento.protocolo }}. O resultado chega no e-mail cadastrado. Se a análise encontrar algum
            problema, o cadastro volta para correção, sem perder o que já foi preenchido.
          </p>
        </div>
      </div>
      <ComplementoLobby @ver-enviado="visao = 'enviado'" @reiniciar="reiniciar" />
    </template>


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
    <div v-if="confirmando" class="ox-veu" @click.self="confirmando = false">
      <div class="ox-janela" role="dialog" aria-modal="true" aria-labelledby="ox-janela-titulo">
        <h2 id="ox-janela-titulo" class="ox-janela__titulo">
          {{ complemento.emCorrecao ? 'Reenviar o cadastro para análise?' : 'Enviar o cadastro para análise?' }}
        </h2>
        <p class="ox-janela__texto">
          Depois do envio, o complemento fica fechado para edição até o resultado da análise.
        </p>
        <div v-if="pendenciasEnvio.length" class="ox-janela__pendencias">
          <p>
            <strong>
              {{ pendenciasEnvio.length === 1 ? 'Ainda há 1 item pendente' : `Ainda há ${pendenciasEnvio.length} itens pendentes` }}
            </strong>
          </p>
          <ul>
            <li v-for="p in pendenciasEnvio" :key="p">{{ p }}</li>
          </ul>
          <p>Dá para enviar assim, mas a análise pode devolver o cadastro para correção.</p>
        </div>
        <p v-else class="ox-janela__texto">Tudo preenchido e anexado.</p>
        <div class="ox-janela__acoes">
          <RgButton variant="outline" @click="confirmando = false">Voltar e revisar</RgButton>
          <RgButton variant="primary" @click="confirmarEnvio">
            {{ complemento.emCorrecao ? 'Reenviar para análise' : 'Enviar para análise' }}
          </RgButton>
        </div>
      </div>
    </div>
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

.ox-alerta--sucesso {
  background: var(--rg-color-feedback-success-soft);
  color: var(--rg-color-feedback-success);
}

.ox-alerta--sucesso .ox-alerta__texto {
  color: var(--rg-color-text-secondary);
}

.ox-veu {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: start center;
  padding-top: 14vh;
  background: rgb(15 23 42 / 0.55);
}

.ox-janela {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
  width: min(560px, calc(100vw - 32px));
  padding: var(--rg-space-8);
  border-radius: var(--rg-radius-lg);
  background: var(--rg-color-surface-raised);
}

.ox-janela__titulo {
  margin: 0;
  font-size: 20px;
  line-height: 26px;
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
}

.ox-janela__texto {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-base);
  color: var(--rg-color-text-secondary);
}

.ox-janela__pendencias {
  padding: var(--rg-space-4);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-feedback-warning-soft);
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-base);
  color: var(--rg-primitive-amber-700);
}

.ox-janela__pendencias p {
  margin: 0;
}

.ox-janela__pendencias ul {
  margin: var(--rg-space-2) 0;
  padding-left: var(--rg-space-5);
  color: var(--rg-color-text-primary);
}

.ox-janela__acoes {
  display: flex;
  justify-content: flex-end;
  gap: var(--rg-space-3);
  margin-top: var(--rg-space-2);
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
