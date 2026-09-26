<script setup lang="ts">
/**
 * Análise do cadastro do Operador Logístico, na área Admin (SEMAD).
 *
 * Figma: seção `Setembro 2026 · Recicla Goiás Admin · Análise do cadastro do
 * Operador Logístico`. Pedidos da SEMAD em 15/09: checklist manual por documento
 * (SEMAD-08), "Não" com motivo obrigatório e motivos prontos (SEMAD-09), mensagem
 * montada e editável antes de devolver (SEMAD-10), nome e CNPJ juntos (SEMAD-11).
 * As regras moram na store `complemento`; aqui só a tela.
 */
import { computed, onMounted, ref } from 'vue';

import GestoraShell from '@/components/gestora/GestoraShell.vue';
import EtapaRevisao from '@/components/operador/EtapaRevisao.vue';
import OxEscolhaSimNao from '@/components/operador/OxEscolhaSimNao.vue';
import RgButton from '@/components/RgButton.vue';
import { DOCUMENTOS_EXIGIDOS, MOTIVOS_ANALISE, PRE_CADASTRO } from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

const c = useComplementoStore();
const f = c.formulario;

onMounted(() => c.prepararConferencia());

const aberta = computed(() => c.situacao === 'em-analise' || c.situacao === 'reenviado');
const STATUS: Record<string, { rotulo: string; tom: string; icone: string }> = {
  'em-analise': { rotulo: 'Em análise', tom: 'info', icone: 'mdi-clock-outline' },
  reenviado: { rotulo: 'Reenviado', tom: 'info', icone: 'mdi-sync' },
  devolvido: { rotulo: 'Devolvido para correção', tom: 'warning', icone: 'mdi-history' },
  aprovado: { rotulo: 'Aprovado', tom: 'success', icone: 'mdi-check' },
  preenchendo: { rotulo: 'Em complementação', tom: 'info', icone: 'mdi-pencil' },
};
const status = computed(() => STATUS[c.situacao] ?? STATUS['em-analise']);

const corrigido = (id: string) => c.situacao === 'reenviado' && c.devolvidos[id] !== undefined;
const tentouDevolver = ref(false);
const docVisto = ref<string | null>(null);
const janela = ref<'mensagem' | 'aprovar' | null>(null);
const mensagem = ref('');
const aviso = ref<{ texto: string; email: string } | null>(null);

function pedirDevolucao() {
  tentouDevolver.value = true;
  if (c.semMotivo.length) return;
  mensagem.value = c.mensagemPadrao;
  janela.value = 'mensagem';
}

function devolver() {
  const n = c.emNao.length;
  c.devolver(mensagem.value);
  janela.value = null;
  tentouDevolver.value = false;
  aviso.value = { texto: `Cadastro devolvido. O e-mail com ${n} ${n === 1 ? 'documento' : 'documentos'} para correção foi enviado.`, email: 'correcao' };
  window.scrollTo({ top: 0 });
}

function aprovar() {
  c.aprovar();
  janela.value = null;
  aviso.value = { texto: 'Cadastro aprovado. O e-mail com o manual foi enviado ao operador.', email: 'aprovado' };
  window.scrollTo({ top: 0 });
}

const arquivo = (id: string) => (f.documentos[id]?.possui === 'sim' ? f.documentos[id]?.arquivo : null);
</script>

<template>
  <GestoraShell secao-ativa="Cadastros de operador" :explorador="false">
    <nav class="ax-trilha" aria-label="Trilha">
      <span>Recicla Admin</span><span aria-hidden="true">/</span>
      <RouterLink to="/admin/cadastros">Cadastros para análise</RouterLink><span aria-hidden="true">/</span>
      <strong>{{ PRE_CADASTRO.nomeFantasia }}</strong>
    </nav>

    <div v-if="aviso" class="ax-toast" role="status">
      <v-icon icon="mdi-check-circle" size="18" aria-hidden="true" />
      <span>{{ aviso.texto }}</span>
      <RouterLink :to="{ name: 'emails-operador', query: { email: aviso.email } }">Ver o e-mail</RouterLink>
    </div>

    <header class="ax-cab">
      <span class="ax-status" :class="`ax-status--${status.tom}`">
        <v-icon :icon="status.icone" size="16" aria-hidden="true" />{{ status.rotulo }}
      </span>
      <h1 class="ax-titulo">{{ PRE_CADASTRO.razaoSocial }}</h1>
      <p class="ax-sub">
        CNPJ {{ PRE_CADASTRO.cnpj }} · protocolo {{ c.protocolo }} · cooperativa · enviado em {{ c.dataEnvio }}
      </p>
    </header>

    <section class="ax-bloco">
      <h2 class="ax-h2">Dados do cadastro</h2>
      <p class="ax-desc">O que o operador declarou, só para leitura: a análise confere os documentos.</p>
      <EtapaRevisao somente-leitura />
    </section>

    <section class="ax-card">
      <h2 class="ax-h2">Documentos</h2>
      <p class="ax-desc">
        Abra cada arquivo e marque se está em conformidade. Não pede o motivo, que vai para o e-mail do operador.
        Aprovar só com todos em Sim.
      </p>

      <ul class="ax-docs">
        <li v-for="d in DOCUMENTOS_EXIGIDOS" :key="d.id" class="ax-doc" :class="{ 'ax-doc--corrigido': corrigido(d.id) }">
          <div class="ax-doc__esq">
            <p class="ax-doc__nome">
              {{ d.rotulo }}
              <span v-if="corrigido(d.id)" class="ax-chip">Corrigido pelo operador</span>
            </p>
            <div v-if="arquivo(d.id)" class="ax-arquivo">
              <v-icon icon="mdi-paperclip" size="16" aria-hidden="true" />
              <span>{{ arquivo(d.id) }}</span>
              <button type="button" class="ax-ver" :aria-label="`Ver ${d.rotulo}`" @click="docVisto = d.id">
                <v-icon icon="mdi-eye-outline" size="18" aria-hidden="true" />
              </button>
            </div>
            <p v-else class="ax-mudo">O operador marcou que a cooperativa não possui o documento.</p>
            <p v-if="corrigido(d.id)" class="ax-mudo">Motivo na análise anterior: {{ c.devolvidos[d.id] }}</p>

            <div v-if="aberta && c.conferencia[d.id]?.resposta === 'nao'" class="ax-motivo">
              <span class="ax-rotulo">Motivo</span>
              <div class="ax-radios" role="radiogroup" :aria-label="`Motivo de ${d.rotulo}`">
                <label v-for="m in MOTIVOS_ANALISE" :key="m.id" class="ax-radio">
                  <input v-model="c.conferencia[d.id]!.motivo" type="radio" :value="m.id" :name="`motivo-${d.id}`" />
                  {{ m.rotulo }}
                </label>
              </div>
              <label class="ax-rotulo" :for="`texto-${d.id}`">Explique ao operador</label>
              <textarea
                :id="`texto-${d.id}`"
                v-model="c.conferencia[d.id]!.texto"
                class="ax-textarea"
                :class="{ 'ax-textarea--erro': tentouDevolver && (!c.conferencia[d.id]?.motivo || !c.conferencia[d.id]?.texto.trim()) }"
                rows="2"
                placeholder="Descreva o motivo para o operador"
              />
              <span
                class="ax-ajuda"
                :class="{ 'ax-ajuda--erro': tentouDevolver && (!c.conferencia[d.id]?.motivo || !c.conferencia[d.id]?.texto.trim()) }"
              >
                {{
                  tentouDevolver && (!c.conferencia[d.id]?.motivo || !c.conferencia[d.id]?.texto.trim())
                    ? 'Informe o motivo para o operador. Ele vai no e-mail de correção.'
                    : 'Obrigatório. O texto vai para o e-mail de correção, embaixo do nome do documento.'
                }}
              </span>
            </div>
          </div>

          <div class="ax-doc__dir">
            <span class="ax-rotulo">{{ c.conferencia[d.id]?.travado ? 'Conferido antes' : 'Em conformidade?' }}</span>
            <OxEscolhaSimNao
              :class="{ 'ax-travado': c.conferencia[d.id]?.travado || !aberta, 'ax-nao': c.conferencia[d.id]?.resposta === 'nao' }"
              :rotulo="`${d.rotulo} em conformidade?`"
              :model-value="c.conferencia[d.id]?.resposta ?? null"
              @update:model-value="c.marcar(d.id, $event)"
            />
          </div>
        </li>
      </ul>
    </section>

    <div v-if="tentouDevolver && c.semMotivo.length" class="ax-erro" role="alert">
      <v-icon icon="mdi-alert-circle" size="20" aria-hidden="true" />
      <div>
        <strong>Falta o motivo de {{ c.semMotivo.length }} {{ c.semMotivo.length === 1 ? 'documento' : 'documentos' }}</strong>
        <p>Escolha o motivo e explique ao operador o que corrigir. O cadastro só volta com o motivo de cada documento em Não.</p>
      </div>
    </div>

    <footer class="ax-rodape">
      <span v-if="aberta">
        {{ c.conferidos }} de {{ c.totalDocumentos }} conferidos ·
        {{ c.emNao.length ? `${c.emNao.length} para correção` : 'nenhum para correção' }}
      </span>
      <span v-else-if="c.situacao === 'devolvido'">Devolvido para correção. Aguardando o reenvio do operador.</span>
      <span v-else-if="c.situacao === 'aprovado'">Aprovado. O acesso completo foi liberado.</span>
      <div v-if="aberta" class="ax-rodape__botoes">
        <RgButton :variant="c.emNao.length ? 'primary' : 'outline'" :disabled="!c.emNao.length" @click="pedirDevolucao">
          Devolver para correção
        </RgButton>
        <RgButton variant="primary" :disabled="!c.podeAprovar" @click="janela = 'aprovar'">Aprovar cadastro</RgButton>
      </div>
    </footer>

    <section v-if="c.historico.length" class="ax-card">
      <h2 class="ax-h2">Histórico</h2>
      <ol class="ax-hist">
        <li v-for="(h, i) in c.historico" :key="i">
          <span class="ax-hist__data">{{ h.data }}</span>
          <div>
            <strong>{{ h.titulo }}</strong>
            <p>{{ h.desc }}</p>
            <small>{{ h.quem }}</small>
          </div>
        </li>
      </ol>
    </section>

    <!-- janelas -->
    <div v-if="docVisto || janela" class="ax-veu" @click.self="docVisto = null; janela = null">
      <div v-if="docVisto" class="ax-janela ax-janela--pdf" role="dialog" aria-modal="true" aria-label="Documento">
        <header class="ax-janela__topo">
          <strong><v-icon icon="mdi-paperclip" size="16" aria-hidden="true" /> {{ arquivo(docVisto) }}</strong>
          <button type="button" class="ax-x" aria-label="Fechar" @click="docVisto = null"><v-icon icon="mdi-close" size="18" /></button>
        </header>
        <div class="ax-pdf">
          <div class="ax-pdf__folha">
            <span /><span /><span /><span /><span /><span /><span />
          </div>
        </div>
        <footer class="ax-janela__acoes">
          <RgButton variant="outline" @click="docVisto = null">Fechar</RgButton>
          <RgButton variant="primary" icon="mdi-download">Baixar documento</RgButton>
        </footer>
      </div>

      <div v-else-if="janela === 'mensagem'" class="ax-janela" role="dialog" aria-modal="true" aria-labelledby="ax-msg-t">
        <header class="ax-janela__topo">
          <h2 id="ax-msg-t" class="ax-janela__titulo">Revisar a mensagem para o operador</h2>
          <button type="button" class="ax-x" aria-label="Fechar" @click="janela = null"><v-icon icon="mdi-close" size="18" /></button>
        </header>
        <p class="ax-desc">
          A mensagem vai no e-mail "Seu cadastro precisa de correção", para {{ PRE_CADASTRO.email }}. Ela sai montada com
          os motivos de cada documento, e dá para editar antes de enviar.
        </p>
        <p class="ax-para"><strong>Para:</strong> {{ PRE_CADASTRO.razaoSocial }} · CNPJ {{ PRE_CADASTRO.cnpj }}</p>
        <label class="ax-rotulo" for="ax-msg">Mensagem</label>
        <textarea id="ax-msg" v-model="mensagem" class="ax-textarea" rows="11" />
        <span class="ax-ajuda">O restante do e-mail entra sozinho: saudação, nome e CNPJ, o botão Corrigir o cadastro e o suporte.</span>
        <footer class="ax-janela__acoes">
          <RgButton variant="outline" @click="janela = null">Voltar</RgButton>
          <RgButton variant="primary" @click="devolver">Enviar e devolver</RgButton>
        </footer>
      </div>

      <div v-else-if="janela === 'aprovar'" class="ax-janela ax-janela--curta" role="dialog" aria-modal="true" aria-labelledby="ax-apr-t">
        <header class="ax-janela__topo">
          <h2 id="ax-apr-t" class="ax-janela__titulo">Aprovar o cadastro?</h2>
          <button type="button" class="ax-x" aria-label="Fechar" @click="janela = null"><v-icon icon="mdi-close" size="18" /></button>
        </header>
        <p class="ax-para"><strong>{{ PRE_CADASTRO.razaoSocial }}</strong><br />CNPJ {{ PRE_CADASTRO.cnpj }} · protocolo {{ c.protocolo }}</p>
        <p class="ax-desc">
          O acesso completo ao sistema é liberado e o e-mail de aprovação segue para {{ PRE_CADASTRO.email }}, com o manual
          do operador logístico em anexo.
        </p>
        <footer class="ax-janela__acoes">
          <RgButton variant="outline" @click="janela = null">Cancelar</RgButton>
          <RgButton variant="primary" @click="aprovar">Aprovar cadastro</RgButton>
        </footer>
      </div>
    </div>
  </GestoraShell>
</template>

<style scoped>
.ax-trilha { display: flex; gap: var(--rg-space-2); font-size: var(--rg-font-size-sm); color: var(--rg-color-text-muted); }
.ax-trilha a { color: var(--rg-color-text-muted); text-decoration: none; }
.ax-trilha a:hover { text-decoration: underline; }
.ax-trilha strong { color: var(--rg-color-text-primary); font-weight: var(--rg-font-weight-medium); }

.ax-cab { display: flex; flex-direction: column; align-items: flex-start; gap: var(--rg-space-2); }
.ax-titulo { margin: 0; font-size: 28px; line-height: 34px; font-weight: var(--rg-font-weight-bold); color: var(--rg-color-text-primary); }
.ax-sub { margin: 0; font-size: 13px; color: var(--rg-color-text-secondary); }

.ax-status { display: inline-flex; align-items: center; gap: var(--rg-space-1); padding: var(--rg-space-1) var(--rg-space-3); border-radius: var(--rg-radius-md); border: 1px solid currentColor; font-size: var(--rg-font-size-sm); font-weight: var(--rg-font-weight-semibold); }
.ax-status--info { color: var(--rg-color-feedback-info); background: var(--rg-color-feedback-info-soft); }
.ax-status--warning { color: var(--rg-primitive-amber-700); background: var(--rg-color-feedback-warning-soft); }
.ax-status--success { color: var(--rg-color-feedback-success); background: var(--rg-color-feedback-success-soft); }

.ax-bloco { display: flex; flex-direction: column; gap: var(--rg-space-3); }
.ax-card { display: flex; flex-direction: column; gap: var(--rg-space-2); padding: var(--rg-space-6); background: var(--rg-color-surface-raised); border: 1px solid var(--rg-color-border-subtle); border-radius: var(--rg-radius-lg); }
.ax-h2 { margin: 0; font-size: var(--rg-font-size-md); font-weight: var(--rg-font-weight-semibold); color: var(--rg-color-text-primary); }
.ax-desc { margin: 0; font-size: 13px; color: var(--rg-color-text-secondary); line-height: var(--rg-line-height-base); }

.ax-docs { margin: var(--rg-space-2) 0 0; padding: 0; list-style: none; }
.ax-doc { display: flex; gap: var(--rg-space-6); align-items: center; padding: var(--rg-space-4) 0; }
.ax-doc + .ax-doc { border-top: 1px solid var(--rg-color-border-subtle); }
.ax-doc--corrigido { margin: 0 calc(var(--rg-space-3) * -1); padding-inline: var(--rg-space-3); border-radius: var(--rg-radius-md); background: var(--rg-color-feedback-info-soft); }
.ax-doc__esq { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--rg-space-2); }
.ax-doc__dir { display: flex; flex-direction: column; align-items: flex-end; gap: var(--rg-space-1); }
.ax-doc__nome { margin: 0; display: flex; align-items: center; gap: var(--rg-space-3); font-size: var(--rg-font-size-sm); font-weight: var(--rg-font-weight-medium); color: var(--rg-color-text-primary); }
.ax-chip { padding: 2px var(--rg-space-2); border-radius: var(--rg-radius-pill); background: var(--rg-color-surface-raised); color: var(--rg-color-feedback-info); font-size: var(--rg-font-size-xs); font-weight: var(--rg-font-weight-semibold); }
.ax-arquivo { display: flex; align-items: center; gap: var(--rg-space-2); padding: var(--rg-space-2) var(--rg-space-3); border: 1px solid var(--rg-color-border-subtle); border-radius: var(--rg-radius-md); background: var(--rg-color-surface-muted); font-size: var(--rg-font-size-sm); color: var(--rg-color-text-primary); }
.ax-arquivo span { flex: 1; }
.ax-ver { display: grid; place-items: center; width: 28px; height: 28px; border: none; border-radius: var(--rg-radius-sm); background: none; color: var(--rg-color-text-muted); cursor: pointer; }
.ax-ver:hover { background: var(--rg-color-surface-subtle); color: var(--rg-color-text-brand); }
.ax-mudo { margin: 0; font-size: var(--rg-font-size-xs); color: var(--rg-color-text-muted); }
.ax-rotulo { font-size: var(--rg-font-size-xs); font-weight: var(--rg-font-weight-medium); color: var(--rg-color-text-secondary); }
.ax-travado { opacity: 0.5; pointer-events: none; }
.ax-nao :deep(.ox-simnao__opcao--ativa) { background: var(--rg-color-feedback-danger-soft); color: var(--rg-primitive-red-700); }

.ax-motivo { display: flex; flex-direction: column; gap: var(--rg-space-2); padding: var(--rg-space-4); border-radius: var(--rg-radius-md); background: var(--rg-color-surface-subtle); }
.ax-radios { display: flex; gap: var(--rg-space-6); }
.ax-radio { display: flex; align-items: center; gap: var(--rg-space-2); font-size: var(--rg-font-size-sm); color: var(--rg-color-text-primary); cursor: pointer; }
.ax-radio input { accent-color: var(--rg-color-action-primary); }
.ax-textarea { width: 100%; padding: var(--rg-space-3); border: 1px solid var(--rg-primitive-neutral-500); border-radius: var(--rg-radius-md); font: inherit; font-size: var(--rg-font-size-sm); line-height: var(--rg-line-height-base); resize: vertical; background: var(--rg-color-surface-raised); }
.ax-textarea--erro { border: 1.5px solid var(--rg-color-feedback-danger); }
.ax-ajuda { font-size: var(--rg-font-size-xs); color: var(--rg-color-text-muted); }
.ax-ajuda--erro { color: var(--rg-primitive-red-700); }

.ax-erro { display: flex; gap: var(--rg-space-3); padding: var(--rg-space-4) var(--rg-space-5); border-radius: var(--rg-radius-lg); background: var(--rg-color-feedback-danger-soft); color: var(--rg-color-feedback-danger); }
.ax-erro p { margin: var(--rg-space-1) 0 0; font-size: var(--rg-font-size-sm); color: var(--rg-primitive-red-700); }

.ax-rodape { display: flex; align-items: center; justify-content: space-between; gap: var(--rg-space-4); padding: var(--rg-space-4) var(--rg-space-6); background: var(--rg-color-surface-raised); border: 1px solid var(--rg-color-border-subtle); border-radius: var(--rg-radius-lg); font-size: var(--rg-font-size-sm); font-weight: var(--rg-font-weight-medium); color: var(--rg-color-text-secondary); }
.ax-rodape__botoes { display: flex; gap: var(--rg-space-3); }

.ax-hist { margin: var(--rg-space-2) 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: var(--rg-space-3); }
.ax-hist li { display: flex; gap: var(--rg-space-4); padding: var(--rg-space-3) var(--rg-space-4); border: 1px solid var(--rg-color-border-subtle); border-radius: var(--rg-radius-md); font-size: var(--rg-font-size-sm); }
.ax-hist__data { flex: 0 0 150px; color: var(--rg-color-text-muted); font-size: var(--rg-font-size-xs); }
.ax-hist p { margin: 2px 0; color: var(--rg-color-text-secondary); }
.ax-hist small { color: var(--rg-color-text-muted); }

.ax-toast { position: fixed; top: 72px; right: 20px; z-index: 30; display: flex; align-items: center; gap: var(--rg-space-3); padding: var(--rg-space-3) var(--rg-space-4); border-radius: var(--rg-radius-md); background: var(--rg-primitive-neutral-900); color: var(--rg-primitive-neutral-0); font-size: var(--rg-font-size-sm); box-shadow: 0 8px 24px rgb(15 23 42 / 0.2); }
.ax-toast a { color: var(--rg-primitive-brand-300); font-weight: var(--rg-font-weight-semibold); }

.ax-veu { position: fixed; inset: 0; z-index: 40; display: grid; place-items: start center; padding-top: 12vh; background: rgb(15 23 42 / 0.55); }
.ax-janela { width: min(760px, calc(100vw - 32px)); display: flex; flex-direction: column; gap: var(--rg-space-4); padding: var(--rg-space-8); border-radius: var(--rg-radius-lg); background: var(--rg-color-surface-raised); }
.ax-janela--curta { width: min(560px, calc(100vw - 32px)); }
.ax-janela--pdf { width: min(720px, calc(100vw - 32px)); padding: 0; gap: 0; overflow: hidden; }
.ax-janela--pdf .ax-janela__topo { padding: var(--rg-space-4) var(--rg-space-6); }
.ax-janela--pdf .ax-janela__acoes { padding: var(--rg-space-4) var(--rg-space-6); border-top: 1px solid var(--rg-color-border-subtle); }
.ax-janela__topo { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--rg-space-4); }
.ax-janela__titulo { margin: 0; font-size: 20px; font-weight: var(--rg-font-weight-bold); color: var(--rg-color-text-primary); }
.ax-janela__acoes { display: flex; justify-content: flex-end; gap: var(--rg-space-3); }
.ax-x { border: none; background: none; cursor: pointer; color: var(--rg-color-text-muted); }
.ax-para { margin: 0; padding: var(--rg-space-3) var(--rg-space-4); border-radius: var(--rg-radius-md); background: var(--rg-color-surface-subtle); font-size: var(--rg-font-size-sm); color: var(--rg-color-text-primary); }
.ax-pdf { display: grid; place-items: center; padding: var(--rg-space-8); background: var(--rg-color-surface-subtle); }
.ax-pdf__folha { display: flex; flex-direction: column; gap: 10px; width: 260px; height: 340px; padding: var(--rg-space-6); background: var(--rg-color-surface-raised); box-shadow: 0 2px 8px rgb(15 23 42 / 0.12); }
.ax-pdf__folha span { height: 8px; border-radius: 4px; background: var(--rg-color-border-subtle); }
.ax-pdf__folha span:first-child { width: 60%; height: 12px; background: var(--rg-primitive-neutral-500); }
.ax-pdf__folha span:nth-child(3n) { width: 70%; }
</style>
