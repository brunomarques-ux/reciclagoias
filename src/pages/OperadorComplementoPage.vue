<script setup lang="ts">
/**
 * Complemento de cadastro do Operador Logístico — a segunda parte do registro.
 *
 * Fluxo decidido em 31/08 (proposta à SIC): o pré-cadastro de produção fica
 * intocado; o e-mail de ativação leva ao login e o login cai aqui. A conta
 * nasce "em complementação" — o menu só mostra Minha Conta e Complemento de
 * cadastro — e as funcionalidades abrem depois da aprovação da análise.
 *
 * Planning de 16/10, fechada pelo Bruno em 18/10:
 * - Tudo obrigatório e salvamento por etapa: avançar é livre, só o envio trava,
 *   e a janela diz pelo nome o que falta (L7).
 * - Enviado, o operador cai na visualização do cadastro (L2·4) e ainda corrige
 *   pelo Editar até a análise começar. Se a análise começa durante a edição, a
 *   alteração não é gravada e a janela explica (L8).
 * - Devolvido, o cadastro abre na etapa com pendência, com o alerta vermelho no
 *   topo de todas as etapas; só o devolvido abre para edição (L3).
 *
 * Figma: arquivo `Recicla Goiás - Figma`, página `Complemento de Cadastro -
 * Operador Logístico`, seção `Setembro 2026 · Recicla Goiás · Complemento de
 * cadastro do Operador Logístico`.
 */
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import GestoraShell from '@/components/gestora/GestoraShell.vue';
import ComplementoStepper from '@/components/operador/ComplementoStepper.vue';
import ComplementoVisualizacao from '@/components/operador/ComplementoVisualizacao.vue';
import EtapaDadosGerais from '@/components/operador/EtapaDadosGerais.vue';
import EtapaDocumentos from '@/components/operador/EtapaDocumentos.vue';
import EtapaEstrutura from '@/components/operador/EtapaEstrutura.vue';
import EtapaOperacao from '@/components/operador/EtapaOperacao.vue';
import EtapaRevisao from '@/components/operador/EtapaRevisao.vue';
import RgButton from '@/components/RgButton.vue';
import { ETAPAS } from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

const route = useRoute();
const router = useRouter();
const complemento = useComplementoStore();

// Ferramenta de protótipo (fluxo guiado da L8): a análise começa na próxima gravação.
if (route.query.simular === 'analise-comecou') complemento.simularAnaliseNaGravacao = true;

const COMPONENTES_ETAPA = [EtapaDadosGerais, EtapaDocumentos, EtapaOperacao, EtapaEstrutura, EtapaRevisao] as const;
const componenteAtual = computed(() => COMPONENTES_ETAPA[complemento.etapa - 1]);
const ultimaEtapa = computed(() => complemento.etapa === ETAPAS.length);

/** Editando depois do envio: a mesma etapa do formulário, com Salvar alterações. */
const editando = ref(false);
const noFormulario = computed(
  () => complemento.situacao === 'preenchendo' || complemento.situacao === 'devolvido' || editando.value,
);
const recemEnviado = ref<'enviado' | 'reenviado' | null>(null);

const subtitulo = computed(() => {
  if (complemento.emCorrecao)
    return 'Corrija as pendências indicadas pela análise e reenvie o cadastro. O que já foi conferido não pode ser alterado.';
  if (editando.value)
    return 'Corrija o que precisar e salve. Enquanto a análise não começar, o cadastro ainda pode ser alterado.';
  if (ultimaEtapa.value) return 'Confira tudo o que foi preenchido antes de enviar. Para mudar algo, use Editar no bloco da etapa.';
  return 'Informe os dados da operação e anexe os documentos. É possível avançar e voltar entre as etapas. Nada é enviado antes da revisão final.';
});

// ---- alerta da correção ----
const NOMES_ETAPA = ['Dados gerais', 'Documentos', 'Operação', 'Estrutura e capacidade'];
const resumoCorrecao = computed(() => {
  const n = complemento.idsDevolvidos.length;
  const porEtapa = [1, 2, 3, 4]
    .map((e) => ({ e, q: complemento.devolvidosNaEtapa(e).length }))
    .filter((x) => x.q > 0)
    .map((x) => `${x.q === 1 ? 'uma' : x.q} em ${NOMES_ETAPA[x.e - 1]}`);
  const lista = porEtapa.length > 1 ? `${porEtapa.slice(0, -1).join(', ')} e ${porEtapa.at(-1)}` : porEtapa[0];
  return `A análise devolveu o cadastro com ${n} ${n === 1 ? 'pendência' : 'pendências'}: ${lista}. O motivo de cada uma está junto do campo. Corrija e reenvie o cadastro.`;
});

// ---- janelas ----
type Janela = 'falta' | 'confirmar' | 'analise-comecou' | null;
const janela = ref<Janela>(null);
const janelaEl = ref<HTMLElement | null>(null);
watch(janela, async (j) => {
  if (!j) return;
  await nextTick();
  janelaEl.value?.querySelector<HTMLElement>('.ox-janela__acoes button:last-child')?.focus();
});

const faltaPorEtapa = computed(() =>
  [1, 2, 3, 4]
    .map((e) => ({ etapa: NOMES_ETAPA[e - 1], itens: complemento.faltandoNaEtapa(e).map((x) => x.rotulo) }))
    .filter((g) => g.itens.length),
);
const tituloFalta = computed(() => {
  const n = complemento.faltando.length;
  const soCampos = complemento.faltando.every((x) => x.etapa !== 2);
  const nome = soCampos ? (n === 1 ? 'campo' : 'campos') : n === 1 ? 'item' : 'itens';
  return `Falta preencher ${n} ${nome}`;
});

function pedirEnvio() {
  janela.value = !complemento.emCorrecao && complemento.faltando.length ? 'falta' : 'confirmar';
}

function irParaOQueFalta() {
  janela.value = null;
  complemento.irParaOQueFalta();
  window.scrollTo({ top: 0 });
}

function confirmarEnvio() {
  const reenvio = complemento.emCorrecao;
  if (reenvio) complemento.reenviar();
  else complemento.enviar();
  janela.value = null;
  recemEnviado.value = reenvio ? 'reenviado' : 'enviado';
  window.scrollTo({ top: 0 });
}

function fecharJanela() {
  if (janela.value === 'analise-comecou') verCadastro();
  else janela.value = null;
}

// ---- edição depois do envio ----
function editar(n: number) {
  if (complemento.situacao === 'enviado') {
    complemento.comecarEdicao(n);
    editando.value = true;
    recemEnviado.value = null;
  } else {
    complemento.irPara(n);
  }
  window.scrollTo({ top: 0 });
}

function cancelarEdicao() {
  complemento.descartarEdicao();
  editando.value = false;
}

function salvarEdicao() {
  if (complemento.salvarEdicao()) {
    editando.value = false;
    window.scrollTo({ top: 0 });
  } else {
    janela.value = 'analise-comecou';
  }
}

function verCadastro() {
  janela.value = null;
  editando.value = false;
  window.scrollTo({ top: 0 });
}

// ---- visualização do cadastro ----
const SITUACAO = {
  enviado: {
    chip: 'Enviado',
    texto: 'Enquanto a análise não começar, você ainda pode corrigir pelo Editar de cada etapa. O resultado chega no e-mail cadastrado.',
  },
  'em-analise': {
    chip: 'Em análise',
    texto: 'A análise começou. Até o resultado, que chega no e-mail cadastrado, o cadastro fica só para consulta.',
  },
  aprovado: {
    chip: 'Aprovado',
    texto: 'O cadastro foi aprovado e o acesso completo ao sistema está liberado. O e-mail de aprovação traz o manual do operador logístico.',
  },
} as const;
const situacaoVista = computed(() => SITUACAO[complemento.situacao as keyof typeof SITUACAO] ?? SITUACAO.enviado);
const dataDoEnvio = computed(() => complemento.dataEnvio?.split(',')[0] ?? '');

function cancelar() {
  void router.push({ name: 'entrar' });
}

function reiniciar() {
  complemento.reiniciar();
  editando.value = false;
  recemEnviado.value = null;
  janela.value = null;
  window.scrollTo({ top: 0 });
}
</script>

<template>
  <GestoraShell secao-ativa="Complemento de cadastro" :explorador="false">
    <!-- Visualização do cadastro: enviado, em análise ou aprovado -->
    <template v-if="!noFormulario">
      <div v-if="recemEnviado" class="ox-alerta ox-alerta--sucesso" role="status">
        <v-icon icon="mdi-check-circle" size="22" aria-hidden="true" />
        <div>
          <p class="ox-alerta__titulo">
            {{ recemEnviado === 'reenviado' ? 'Cadastro reenviado para análise' : 'Cadastro enviado para análise' }}
          </p>
          <p class="ox-alerta__texto">
            Protocolo {{ complemento.protocolo }}. O resultado será enviado para o e-mail cadastrado.
          </p>
        </div>
      </div>

      <header class="ox-pagina__cabecalho ox-pagina__cabecalho--cadastro">
        <h1 class="ox-pagina__titulo">Complemento de cadastro</h1>
        <p class="ox-pagina__linha">
          <span class="ox-chip" :class="`ox-chip--${complemento.situacao}`">{{ situacaoVista.chip }}</span>
          <span>Enviado em {{ dataDoEnvio }} · protocolo {{ complemento.protocolo }}</span>
        </p>
        <p class="ox-pagina__subtitulo ox-pagina__subtitulo--maior">{{ situacaoVista.texto }}</p>
      </header>

      <ComplementoVisualizacao :editavel="complemento.situacao === 'enviado'" @editar="editar" />
    </template>

    <!-- Formulário: preenchimento, correção ou edição depois do envio -->
    <template v-else>
      <header class="ox-pagina__cabecalho">
        <div>
          <h1 class="ox-pagina__titulo">Complemento de cadastro</h1>
          <p class="ox-pagina__subtitulo">{{ subtitulo }}</p>
        </div>
      </header>

      <div v-if="complemento.emCorrecao && complemento.faltaCorrigir.length" class="ox-alerta ox-alerta--erro" role="alert">
        <v-icon icon="mdi-alert-circle" size="22" aria-hidden="true" />
        <div>
          <p class="ox-alerta__titulo">Seu cadastro precisa de correção</p>
          <p class="ox-alerta__texto">{{ resumoCorrecao }}</p>
        </div>
      </div>
      <div v-else-if="complemento.emCorrecao" class="ox-alerta ox-alerta--info" role="status">
        <v-icon icon="mdi-information" size="22" aria-hidden="true" />
        <div>
          <p class="ox-alerta__titulo">Correção pronta para reenvio</p>
          <p class="ox-alerta__texto ox-alerta__texto--neutro">
            As pendências foram corrigidas. Confira na revisão e reenvie para uma nova análise.
          </p>
        </div>
      </div>

      <ComplementoStepper :atual="complemento.etapa" @ir="complemento.irPara" />

      <component :is="componenteAtual" @editar="editar" />

      <footer class="ox-pagina__acoes">
        <template v-if="editando">
          <RgButton variant="secondary" @click="cancelarEdicao">Cancelar</RgButton>
          <RgButton variant="primary" @click="salvarEdicao">Salvar alterações</RgButton>
        </template>
        <template v-else>
          <RgButton v-if="complemento.etapa === 1" variant="secondary" @click="cancelar">Cancelar</RgButton>
          <RgButton v-else variant="secondary" @click="complemento.voltar()">Voltar</RgButton>

          <RgButton v-if="complemento.emCorrecao && !ultimaEtapa" variant="primary" @click="complemento.irPara(5)">
            Ir para a revisão
          </RgButton>
          <RgButton v-else-if="!ultimaEtapa" variant="primary" @click="complemento.avancar()">Avançar</RgButton>
          <RgButton v-else variant="primary" :disabled="!complemento.podeEnviar" @click="pedirEnvio">
            {{ complemento.emCorrecao ? 'Reenviar para análise' : 'Enviar cadastro' }}
          </RgButton>
        </template>
      </footer>
    </template>

    <!-- Camada do protótipo, fora do desenho -->
    <aside class="ox-prototipo" data-prototipo aria-label="Ferramentas do protótipo">
      <span class="ox-prototipo__marca">Protótipo</span>
      <button
        v-if="editando"
        type="button"
        class="ox-prototipo__botao"
        :aria-pressed="complemento.simularAnaliseNaGravacao"
        @click="complemento.simularAnaliseNaGravacao = !complemento.simularAnaliseNaGravacao"
      >
        {{ complemento.simularAnaliseNaGravacao ? 'A análise começa ao salvar (ligado)' : 'Simular a análise começando ao salvar' }}
      </button>
      <button type="button" class="ox-prototipo__botao" @click="reiniciar">Reiniciar demonstração</button>
    </aside>

    <div v-if="janela" class="ox-veu" @click.self="fecharJanela" @keydown.esc="fecharJanela">
      <div
        ref="janelaEl"
        class="ox-janela"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ox-janela-titulo"
        aria-describedby="ox-janela-texto"
      >
        <template v-if="janela === 'falta'">
          <h2 id="ox-janela-titulo" class="ox-janela__titulo">{{ tituloFalta }}</h2>
          <p id="ox-janela-texto" class="ox-janela__texto">
            Todos os campos são obrigatórios. Preencha o que falta para enviar o cadastro.
          </p>
          <div class="ox-janela__pendencias">
            <div v-for="g in faltaPorEtapa" :key="g.etapa">
              <p class="ox-janela__etapa">{{ g.etapa }}</p>
              <ul>
                <li v-for="item in g.itens" :key="item">{{ item }}</li>
              </ul>
            </div>
          </div>
          <div class="ox-janela__acoes">
            <RgButton variant="outline" @click="janela = null">Fechar</RgButton>
            <RgButton variant="primary" @click="irParaOQueFalta">Ir para a etapa</RgButton>
          </div>
        </template>

        <template v-else-if="janela === 'confirmar'">
          <h2 id="ox-janela-titulo" class="ox-janela__titulo">
            {{ complemento.emCorrecao ? 'Reenviar o cadastro para análise?' : 'Enviar o cadastro para análise?' }}
          </h2>
          <p id="ox-janela-texto" class="ox-janela__texto">
            Enquanto a análise não começar, você ainda pode corrigir pelo Editar de cada etapa. Quando a análise
            começar, o cadastro fica só para consulta.
          </p>
          <div class="ox-janela__acoes">
            <RgButton variant="outline" @click="janela = null">Voltar e revisar</RgButton>
            <RgButton variant="primary" @click="confirmarEnvio">
              {{ complemento.emCorrecao ? 'Reenviar para análise' : 'Enviar para análise' }}
            </RgButton>
          </div>
        </template>

        <template v-else>
          <h2 id="ox-janela-titulo" class="ox-janela__titulo">A análise do cadastro começou</h2>
          <p id="ox-janela-texto" class="ox-janela__texto">
            Um analista começou a conferir o seu cadastro enquanto você editava. Esta alteração não foi salva. Até o
            resultado, que chega no e-mail cadastrado, o cadastro fica só para consulta.
          </p>
          <div class="ox-janela__acoes">
            <RgButton variant="primary" @click="verCadastro">Ver o cadastro</RgButton>
          </div>
        </template>
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
  border: 1px solid var(--rg-color-border-brand);
  color: var(--rg-color-feedback-success);
}

.ox-alerta--sucesso .ox-alerta__texto {
  color: var(--rg-color-feedback-success);
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

.ox-alerta__texto {
  margin: var(--rg-space-1) 0 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-base);
  color: var(--rg-primitive-red-700);
}

.ox-alerta__texto--neutro {
  color: var(--rg-color-text-secondary);
}

.ox-pagina__cabecalho {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--rg-space-6);
}

.ox-pagina__cabecalho--cadastro {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--rg-space-2);
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

.ox-pagina__subtitulo--maior {
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-base);
}

.ox-pagina__linha {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rg-space-3);
  margin: 0;
  font-size: 13px;
  color: var(--rg-color-text-secondary);
}

.ox-chip {
  padding: 2px var(--rg-space-2);
  border-radius: var(--rg-radius-sm);
  background: var(--rg-color-surface-subtle);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.ox-chip--em-analise {
  background: var(--rg-color-feedback-info-soft);
  color: var(--rg-color-feedback-info);
}

.ox-chip--aprovado {
  background: var(--rg-color-feedback-success-soft);
  color: var(--rg-color-feedback-success);
}

.ox-pagina__acoes {
  display: flex;
  justify-content: space-between;
  gap: var(--rg-space-4);
  padding-top: var(--rg-space-2);
}

.ox-prototipo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rg-space-3);
  margin-top: var(--rg-space-6);
  padding: var(--rg-space-3) var(--rg-space-4);
  border: 1px dashed var(--rg-color-border-base);
  border-radius: var(--rg-radius-md);
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-muted);
}

.ox-prototipo__marca {
  font-weight: var(--rg-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--rg-letter-spacing-wide);
}

.ox-prototipo__botao {
  padding: var(--rg-space-1) var(--rg-space-2);
  border: none;
  border-radius: var(--rg-radius-sm);
  background: none;
  font-family: inherit;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
  text-decoration: underline;
  cursor: pointer;
}

.ox-prototipo__botao[aria-pressed='true'] {
  color: var(--rg-color-text-brand);
  font-weight: var(--rg-font-weight-semibold);
}

.ox-prototipo__botao:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.ox-veu {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: var(--rg-space-4);
  background: rgb(15 23 42 / 0.55);
}

.ox-janela {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
  width: min(504px, calc(100vw - 32px));
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
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  padding: var(--rg-space-4);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-feedback-warning-soft);
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-base);
}

.ox-janela__etapa {
  margin: 0;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-primitive-amber-700);
}

.ox-janela__pendencias ul {
  margin: var(--rg-space-1) 0 0;
  padding-left: var(--rg-space-5);
  color: var(--rg-color-text-primary);
}

.ox-janela__acoes {
  display: flex;
  justify-content: flex-end;
  gap: var(--rg-space-3);
  margin-top: var(--rg-space-2);
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
