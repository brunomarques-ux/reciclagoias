<script setup lang="ts">
/**
 * Análise do cadastro do Operador Logístico, na área Admin (SEMAD).
 *
 * Figma: `Recicla Goiás - Figma`, seção do Admin (5901:10683), rodada da planning de
 * 16/10 (fechada em 18/10): L1·2 a L1·4 (✓/✕ por campo e motivo do documento), L2·2
 * e L2·3 (mensagem ao operador e devolvido), L3·2 (documento aberto), L4·2 a L4·4
 * (reanálise e aprovação), L5·1 (salvar sem descrição) e L6 (editar o salvo).
 *
 * A análise confere todos os campos (✓ correto ou ✕ com a observação do que
 * corrigir) e os 11 documentos (em conformidade? Sim ou Não com motivo). O analista
 * não altera o dado. Só leitura com `?modo=visualizar` ou quando a situação não é
 * Em análise. As regras moram na store `complemento`; aqui só a tela.
 *
 * Planning de 13/11/2026 (Figma: seção `6506:4284`):
 * - L2·2 (`6507:7059`): conferência só do documento trocado depois do vencimento. Os
 *   dados e os demais documentos chegam conferidos; aprovar devolve o cadastro a Aprovado.
 * - L4 (`6507:4845` e seguintes), PROPOSTA para a SEMAD: com `soDocumentos` ligado, os
 *   blocos de dados ficam em leitura (`AxEtapaLeitura`) e a contagem fala só de documentos.
 */
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { dataPorExtenso, juntarNomes, partesDaData, type Reanalise } from '@/components/admin/analise';
import AxDocumentoConferencia from '@/components/admin/AxDocumentoConferencia.vue';
import AxEtapaConferencia from '@/components/admin/AxEtapaConferencia.vue';
import AxEtapaLeitura from '@/components/admin/AxEtapaLeitura.vue';
import AxHistorico from '@/components/admin/AxHistorico.vue';
import AxJanela from '@/components/admin/AxJanela.vue';
import GestoraShell from '@/components/gestora/GestoraShell.vue';
import RgButton from '@/components/RgButton.vue';
import { DOCUMENTOS_EXIGIDOS, ETAPAS, PRE_CADASTRO, ROTULO_TIPO } from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

const route = useRoute();
const router = useRouter();
const c = useComplementoStore();

/** Só a Recicla Cerrado (a linha viva da fila) tem cadastro aberto no protótipo. */
const existe = computed(
  () => c.situacao !== 'preenchendo' && String(route.params.protocolo ?? '').toLowerCase() === c.protocolo.toLowerCase(),
);
const visualizar = computed(() => route.query.modo === 'visualizar');
const leitura = computed(() => visualizar.value || c.situacao !== 'em-analise');

/** Data do evento mais recente com esse título no histórico. */
const dataDoEvento = (titulo: string) => c.historico.find((h) => h.titulo === titulo)?.data ?? null;

/** Proposta de 13/11: conferência só em Documentos (não vale na conferência do documento trocado). */
const proposta = computed(() => c.soDocumentos && !c.revalidacao);
const nomeDoTrocado = computed(() => (c.vencimento ? c.rotuloDoItem(c.vencimento.doc) : ''));

const reanalise = computed<Reanalise | null>(() => {
  if (c.revalidacao) {
    // Documento trocado: o resto foi conferido na aprovação do cadastro.
    return { corrigidoEm: partesDaData(c.troca.enviadoEm)?.dia ?? '', conferidoEm: partesDaData(dataDoEvento('Cadastro aprovado'))?.dia ?? '' };
  }
  if (!c.reenvio || c.situacao === 'devolvido' || c.situacao === 'preenchendo') return null;
  return {
    corrigidoEm: partesDaData(c.dataEnvio)?.dia ?? '',
    conferidoEm: partesDaData(dataDoEvento('Devolvido para correção'))?.dia ?? '',
  };
});

// ---- cabeçalho ----
const selo = computed(() => {
  switch (c.situacao) {
    case 'em-analise':
      return { rotulo: 'Em análise', tom: 'info', icone: c.reenvio || c.revalidacao ? 'mdi-sync' : 'mdi-clock-outline' };
    case 'documento-atualizado':
      return { rotulo: 'Documento atualizado', tom: 'neutro', icone: 'mdi-sync' };
    case 'bloqueado':
      return { rotulo: 'Bloqueado por documentação vencida', tom: 'warning', icone: 'mdi-alert-outline' };
    case 'devolvido':
      return { rotulo: 'Devolvido para correção', tom: 'warning', icone: 'mdi-history' };
    case 'aprovado':
      return { rotulo: 'Aprovado', tom: 'success', icone: 'mdi-check' };
    default:
      return { rotulo: 'Enviado', tom: 'neutro', icone: c.reenvio ? 'mdi-sync' : 'mdi-send-outline' };
  }
});

const linhaDoCabecalho = computed(() => {
  const tipo = ROTULO_TIPO[PRE_CADASTRO.tipoOrganizacao].toLowerCase();
  const quando = c.revalidacao
    ? `documento atualizado em ${partesDaData(c.troca.enviadoEm)?.data ?? ''}`
    : c.situacao === 'aprovado' || c.situacao === 'bloqueado'
      ? `aprovado em ${partesDaData(dataDoEvento('Cadastro aprovado'))?.data ?? ''}`
      : `${c.reenvio ? 'reenviado' : 'enviado'} em ${partesDaData(c.dataEnvio)?.data ?? ''}`;
  return `CNPJ ${PRE_CADASTRO.cnpj} · protocolo ${c.protocolo} · ${tipo} · ${quando}`;
});

const descricaoDados = computed(() => {
  if (c.revalidacao)
    return 'Dados já conferidos na aprovação do cadastro. Nesta conferência, só o documento trocado pede resposta.';
  if (proposta.value)
    return 'Dados para consulta, sem aceite campo a campo. A conferência é feita nos documentos, logo abaixo. Se algum dado estiver errado, use "Apontar problema" no bloco e descreva o que a organização precisa corrigir.';
  return 'Confira cada campo: ✓ quando estiver correto, ✕ quando a organização precisar corrigir, com a observação do que mudar. O dado não é alterado aqui: quem corrige é a organização.';
});

const descricaoDocumentos = computed(() => {
  if (c.revalidacao && c.situacao === 'documento-atualizado')
    return `O operador trocou o ${nomeDoTrocado.value.toLowerCase()}, que estava vencido. Só para leitura. A conferência começa quando alguém clica em Analisar.`;
  if (c.revalidacao && !visualizar.value)
    return `O operador trocou o ${nomeDoTrocado.value.toLowerCase()}, que estava vencido. Abra o arquivo, confira a nova validade e indique se está em conformidade. Os demais documentos já estão conferidos.`;
  if (c.situacao === 'devolvido' || c.situacao === 'aprovado' || c.situacao === 'bloqueado')
    return 'Análise concluída. Os documentos e os motivos ficam disponíveis apenas para consulta.';
  if (c.situacao === 'enviado') return 'Só para leitura. A conferência começa quando alguém clica em Analisar.';
  if (visualizar.value) return `Só para leitura: a análise está com ${c.analista ?? 'outra pessoa'}.`;
  return 'Abra cada documento e indique se está em conformidade. Para cada Não, descreva e salve o motivo, que é enviado ao operador no e-mail de correção. A aprovação exige todos os documentos em conformidade.';
});

// ---- rodapé ----
const totalCampos = computed(() => c.todosOsCampos.length);
const tudoConferido = computed(
  () => c.camposConferidos === totalCampos.value && c.docsConferidos === c.totalDocumentos,
);
const motivoAberto = computed(() => c.docsEmNao.some((d) => !c.conferencia[d.id]?.salvo));

const contagem = computed(() => {
  if (c.revalidacao) {
    const r = c.conferencia[c.vencimento?.doc ?? '']?.resposta;
    if (r === 'sim') return 'Tudo conferido · documento atualizado em conformidade';
    if (r === 'nao') return `Documento atualizado com pendência${c.emEdicao ? ' · salve o motivo para devolver' : ''}`;
    return 'Falta conferir o documento atualizado';
  }
  if (proposta.value) {
    // L4: só documentos entram na contagem; o problema apontado num bloco é pendência.
    const base = `Conferidos: ${c.docsRespondidos} de ${c.totalDocumentos} documentos`;
    const emEdicao = c.docsEmNao.filter((d) => !c.conferencia[d.id]?.salvo).length;
    if (emEdicao) return `${base} · ${emEdicao} ${emEdicao === 1 ? 'motivo' : 'motivos'} em edição`;
    const blocos = c.blocosComProblema;
    const docs = c.docsEmNao.length;
    if (!blocos.length && !docs) return `${base} · nenhum problema apontado nos dados`;
    const partes: string[] = [];
    if (docs) partes.push(`${docs} ${docs === 1 ? 'pendência' : 'pendências'}`);
    if (blocos.length)
      partes.push(
        `${blocos.length} ${blocos.length === 1 ? 'problema apontado' : 'problemas apontados'} em ${juntarNomes(blocos.map((b) => b.rotulo))}`,
      );
    return `${base} · ${partes.join(' · ')}`;
  }
  const n = c.totalPendencias;
  const pendencias = n === 0 ? 'nenhuma pendência' : `${n} ${n === 1 ? 'pendência' : 'pendências'}`;
  const base = tudoConferido.value
    ? 'Tudo conferido'
    : `Conferidos: ${c.camposConferidos} de ${totalCampos.value} campos e ${c.docsConferidos} de ${c.totalDocumentos} documentos`;
  const aberto = c.emEdicao
    ? motivoAberto.value
      ? ' · salve o motivo para devolver'
      : ' · salve a observação para devolver'
    : '';
  return `${base} · ${pendencias}${aberto}`;
});

const situacaoNoRodape = computed(() => {
  switch (c.situacao) {
    case 'devolvido':
      return `Devolvido em ${dataPorExtenso(dataDoEvento('Devolvido para correção'))}. Aguardando o reenvio pelo operador.`;
    case 'aprovado':
      return `Aprovado em ${dataPorExtenso(dataDoEvento('Cadastro aprovado'))}. O acesso completo foi liberado.`;
    case 'enviado':
      return `${c.reenvio ? 'Reenviado' : 'Enviado'} em ${dataPorExtenso(c.dataEnvio)}. Aguardando o início da análise.`;
    case 'documento-atualizado':
      return `Documento atualizado em ${dataPorExtenso(c.troca.enviadoEm)}. Aguardando o início da conferência.`;
    case 'bloqueado':
      return `Bloqueado por documentação vencida desde ${c.vencimento?.venceEm ?? ''}. Aguardando o documento novo.`;
    default:
      return `Em análise por ${c.analista ?? 'outra pessoa'}. Aberto só para leitura.`;
  }
});

function analisar() {
  c.iniciarAnalise();
  void router.replace({ query: {} });
}

function abrirAnalise() {
  void router.replace({ query: {} });
}

// ---- janelas e aviso ----
const docVisto = ref<string | null>(null);
const janela = ref<'mensagem' | 'aprovar' | null>(null);
const mensagem = ref('');
const aviso = ref<{ texto: string; email: 'correcao' | 'aprovado' | 'vencido' } | null>(null);

const arquivoVisto = computed(() => (docVisto.value ? c.formulario.documentos[docVisto.value]?.arquivo ?? '' : ''));

function pedirDevolucao() {
  if (!c.podeDevolver) return;
  mensagem.value = c.mensagemPadrao;
  janela.value = 'mensagem';
}

function devolver() {
  if (!mensagem.value.trim()) return;
  const doDocumento = c.revalidacao;
  c.devolver(mensagem.value);
  janela.value = null;
  aviso.value = doDocumento
    ? { texto: 'Documento recusado. O operador foi notificado por e-mail.', email: 'vencido' }
    : { texto: 'Cadastro devolvido para correção. O operador foi notificado por e-mail.', email: 'correcao' };
  window.scrollTo({ top: 0 });
}

function aprovar() {
  c.aprovar();
  janela.value = null;
  aviso.value = { texto: 'Cadastro aprovado. O operador foi notificado por e-mail.', email: 'aprovado' };
  window.scrollTo({ top: 0 });
}
</script>

<template>
  <GestoraShell secao-ativa="Cadastros de operador" :explorador="false">
    <nav class="ax-trilha" aria-label="Trilha">
      <span>Recicla Admin</span><span aria-hidden="true">/</span>
      <RouterLink to="/admin/cadastros">Cadastros para análise</RouterLink><span aria-hidden="true">/</span>
      <strong>{{ PRE_CADASTRO.nomeFantasia }}</strong>
    </nav>

    <section v-if="!existe" class="ax-card ax-vazio">
      <h1 class="ax-h2">Cadastro não encontrado</h1>
      <p class="ax-desc">
        No protótipo, só o cadastro da Recicla Cerrado abre, e só depois de enviado pelo perfil Operador Logístico.
      </p>
      <RouterLink class="ax-link" to="/admin/cadastros">Voltar para a fila</RouterLink>
    </section>

    <template v-else>
      <div v-if="aviso" class="ax-toast" role="status">
        <v-icon icon="mdi-check-circle" size="18" aria-hidden="true" />
        <span>{{ aviso.texto }}</span>
        <RouterLink :to="{ name: 'emails-operador', query: { email: aviso.email } }">Ver o e-mail</RouterLink>
        <button type="button" class="ax-toast__x" aria-label="Fechar aviso" @click="aviso = null">
          <v-icon icon="mdi-close" size="16" aria-hidden="true" />
        </button>
      </div>

      <header class="ax-cab">
        <span class="ax-selo" :class="`ax-selo--${selo.tom}`">
          <v-icon :icon="selo.icone" size="16" aria-hidden="true" />{{ selo.rotulo }}
        </span>
        <h1 class="ax-titulo">{{ PRE_CADASTRO.razaoSocial }}</h1>
        <p class="ax-sub">{{ linhaDoCabecalho }}</p>
      </header>

      <section class="ax-bloco" aria-labelledby="ax-dados-titulo">
        <h2 id="ax-dados-titulo" class="ax-h2">Dados do cadastro</h2>
        <p class="ax-desc">{{ descricaoDados }}</p>
        <div v-if="proposta" class="ax-etapas">
          <AxEtapaLeitura
            v-for="n in [1, 3, 4]"
            :key="n"
            :etapa="n"
            :titulo="ETAPAS[n - 1] ?? ''"
            :aberta-inicial="n === 1"
            :leitura="leitura"
          />
        </div>
        <div v-else class="ax-etapas">
          <AxEtapaConferencia
            v-for="n in [1, 3, 4]"
            :key="n"
            :etapa="n"
            :titulo="ETAPAS[n - 1] ?? ''"
            :aberta-inicial="n === 1 && !c.revalidacao"
            :leitura="leitura"
            :reanalise="reanalise"
          />
        </div>
      </section>

      <section class="ax-card" aria-labelledby="ax-docs-titulo">
        <h2 id="ax-docs-titulo" class="ax-h2">Documentos</h2>
        <p class="ax-desc">{{ descricaoDocumentos }}</p>
        <ul class="ax-docs">
          <li v-for="d in DOCUMENTOS_EXIGIDOS" :key="d.id">
            <AxDocumentoConferencia :doc="d" :leitura="leitura" :reanalise="reanalise" @ver="docVisto = $event" />
          </li>
        </ul>
      </section>

      <footer class="ax-rodape" :class="{ 'ax-rodape--fixo': !leitura }">
        <template v-if="!leitura">
          <p class="ax-rodape__texto" aria-live="polite">{{ contagem }}</p>
          <!-- Devolver é sempre o secundário; o primário da análise é Aprovar (Bruno, 16/11/2026) -->
          <RgButton
            variant="secondary"
            :disabled="!c.podeDevolver"
            @click="pedirDevolucao"
          >
            Devolver para correção
          </RgButton>
          <RgButton variant="primary" :disabled="!c.podeAprovar" @click="janela = 'aprovar'">Aprovar cadastro</RgButton>
        </template>
        <template v-else>
          <p class="ax-rodape__texto">{{ situacaoNoRodape }}</p>
          <RgButton v-if="c.situacao === 'enviado' || c.situacao === 'documento-atualizado'" variant="primary" @click="analisar">
            Analisar
          </RgButton>
          <RgButton v-else-if="c.situacao === 'em-analise'" variant="secondary" @click="abrirAnalise">
            Abrir a análise
          </RgButton>
        </template>
      </footer>

      <AxHistorico v-if="c.historico.length" :eventos="c.historico" />
    </template>

    <AxJanela
      v-if="docVisto"
      :titulo="arquivoVisto"
      icone="mdi-paperclip"
      :largura="720"
      documento
      @fechar="docVisto = null"
    >
      <div class="ax-pdf" role="img" :aria-label="`Prévia de ${arquivoVisto}`">
        <div class="ax-pdf__folha"><span /><span /><span /><span /><span /><span /><span /></div>
      </div>
      <template #acoes>
        <RgButton variant="secondary" @click="docVisto = null">Fechar</RgButton>
        <RgButton variant="primary" icon="mdi-download">Baixar documento</RgButton>
      </template>
    </AxJanela>

    <AxJanela v-else-if="janela === 'mensagem'" titulo="Revisar a mensagem para o operador" @fechar="janela = null">
      <p class="ax-desc">
        A mensagem é enviada no e-mail "Seu cadastro precisa de correção" para {{ PRE_CADASTRO.email }}. O texto já
        inclui o motivo de cada pendência e pode ser editado antes do envio.
      </p>
      <p class="ax-para"><strong>Para:</strong> {{ PRE_CADASTRO.razaoSocial }} · CNPJ {{ PRE_CADASTRO.cnpj }}</p>
      <label class="ax-rotulo" for="ax-msg">Mensagem</label>
      <textarea id="ax-msg" v-model="mensagem" class="ax-textarea" rows="12" data-foco-inicial aria-describedby="ax-msg-ajuda" />
      <span id="ax-msg-ajuda" class="ax-ajuda">
        Saudação, nome e CNPJ, o botão Corrigir o cadastro e o contato do atendimento são incluídos automaticamente.
      </span>
      <template #acoes>
        <RgButton variant="secondary" @click="janela = null">Voltar</RgButton>
        <RgButton variant="primary" :disabled="!mensagem.trim()" @click="devolver">Enviar e devolver</RgButton>
      </template>
    </AxJanela>

    <AxJanela v-else-if="janela === 'aprovar'" titulo="Aprovar o cadastro?" :largura="560" @fechar="janela = null">
      <p class="ax-para">
        <strong>{{ PRE_CADASTRO.razaoSocial }}</strong><br />CNPJ {{ PRE_CADASTRO.cnpj }} · protocolo {{ c.protocolo }}
      </p>
      <p class="ax-desc">
        O acesso completo ao sistema será liberado e o e-mail de aprovação, com o manual do operador logístico em anexo,
        será enviado para {{ PRE_CADASTRO.email }}.
      </p>
      <template #acoes>
        <RgButton variant="secondary" @click="janela = null">Cancelar</RgButton>
        <RgButton variant="primary" @click="aprovar">Aprovar cadastro</RgButton>
      </template>
    </AxJanela>
  </GestoraShell>
</template>

<style scoped>
.ax-trilha {
  display: flex;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-muted);
}

.ax-trilha a {
  color: var(--rg-color-text-muted);
  text-decoration: none;
}

.ax-trilha a:hover {
  text-decoration: underline;
}

.ax-trilha strong {
  color: var(--rg-color-text-primary);
  font-weight: var(--rg-font-weight-medium);
}

.ax-cab {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--rg-space-2);
}

.ax-titulo {
  margin: 0;
  font-size: 28px;
  line-height: 34px;
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
}

.ax-sub {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.ax-selo {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-1);
  padding: var(--rg-space-1) var(--rg-space-3);
  border: 1px solid currentColor;
  border-radius: var(--rg-radius-md);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 20px;
}

.ax-selo--info { color: var(--rg-color-feedback-info); background: var(--rg-color-feedback-info-soft); }
.ax-selo--warning { color: var(--rg-primitive-amber-700); background: var(--rg-color-feedback-warning-soft); }
.ax-selo--success { color: var(--rg-color-text-brand); background: var(--rg-color-feedback-success-soft); }
.ax-selo--neutro { color: var(--rg-color-text-secondary); background: var(--rg-color-surface-subtle); }

.ax-bloco {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.ax-etapas {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.ax-card {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
  padding: var(--rg-space-6);
  background: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
}

.ax-vazio {
  align-items: flex-start;
  gap: var(--rg-space-2);
}

.ax-link {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-brand);
}

.ax-h2 {
  margin: 0;
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 22px;
  color: var(--rg-color-text-primary);
}

.ax-desc {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.ax-docs {
  margin: var(--rg-space-2) 0 0;
  padding: 0;
  list-style: none;
}

.ax-docs li + li {
  border-top: 1px solid var(--rg-color-border-subtle);
}

.ax-rodape {
  display: flex;
  align-items: center;
  gap: var(--rg-space-4);
  padding: var(--rg-space-4) var(--rg-space-6);
  background: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
}

/* Na análise o rodapé acompanha a rolagem e para no lugar dele, no fim da página. */
.ax-rodape--fixo {
  position: sticky;
  bottom: var(--rg-space-4);
  z-index: 3;
  box-shadow: var(--rg-elevation-2);
}

.ax-rodape__texto {
  flex: 1;
  margin: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  line-height: 20px;
  color: var(--rg-color-text-secondary);
}

.ax-toast {
  position: fixed;
  top: 72px;
  right: 20px;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  max-width: calc(100vw - 40px);
  padding: var(--rg-space-3) var(--rg-space-2) var(--rg-space-3) var(--rg-space-4);
  border-radius: var(--rg-radius-md);
  background: var(--rg-primitive-neutral-900);
  color: var(--rg-primitive-neutral-0);
  font-size: var(--rg-font-size-sm);
  box-shadow: var(--rg-elevation-3);
}

.ax-toast .v-icon:first-child {
  color: var(--rg-primitive-brand-300);
}

.ax-toast a {
  color: var(--rg-primitive-brand-300);
  font-weight: var(--rg-font-weight-semibold);
  white-space: nowrap;
}

.ax-toast__x {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--rg-radius-sm);
  background: none;
  color: var(--rg-primitive-neutral-0);
  cursor: pointer;
}

.ax-toast__x:focus-visible,
.ax-toast a:focus-visible {
  outline: 2px solid var(--rg-primitive-brand-300);
  outline-offset: 2px;
}

.ax-para {
  margin: 0;
  padding: var(--rg-space-3) var(--rg-space-4);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-subtle);
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  color: var(--rg-color-text-primary);
}

.ax-rotulo {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
}

.ax-textarea {
  width: 100%;
  padding: var(--rg-space-3);
  border: 1px solid var(--rg-primitive-neutral-500);
  border-radius: var(--rg-radius-md);
  font: inherit;
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  color: var(--rg-color-text-primary);
  resize: vertical;
  background: var(--rg-color-surface-raised);
}

.ax-textarea:focus {
  outline: none;
  border: 2px solid var(--rg-color-action-primary);
  padding: 11px;
}

.ax-ajuda {
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-muted);
}

.ax-pdf {
  display: grid;
  place-items: center;
  padding: var(--rg-space-8);
  background: var(--rg-color-surface-subtle);
}

.ax-pdf__folha {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 260px;
  height: 340px;
  padding: var(--rg-space-6);
  background: var(--rg-color-surface-raised);
  box-shadow: var(--rg-elevation-2);
}

.ax-pdf__folha span {
  height: 8px;
  border-radius: var(--rg-radius-xs);
  background: var(--rg-color-border-subtle);
}

.ax-pdf__folha span:first-child {
  width: 60%;
  height: 12px;
  background: var(--rg-primitive-neutral-500);
}

.ax-pdf__folha span:nth-child(3n) {
  width: 70%;
}

@media (max-width: 720px) {
  .ax-rodape {
    flex-wrap: wrap;
  }

  .ax-rodape__texto {
    flex-basis: 100%;
  }
}
</style>
