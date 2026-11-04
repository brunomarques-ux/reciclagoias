<script setup lang="ts">
/**
 * A raiz dos fluxos guiados (camada do protótipo, fora do produto), montada uma vez no App.vue. Faz o papel do
 * FluxoDaUrl (raiz.tsx) e do trecho do App.tsx do SISLOG que tratava o ?perfil= e montava o painel:
 *
 * 1. ?perfil=<id> entra no perfil pela store da sessão (src/stores/sessao.ts) e sai da barra de endereço. Na carga
 *    da página isso acontece já no setup, ANTES do guard do router rodar a primeira navegação (o guard corre em
 *    microtarefa, depois do mount síncrono): é o que deixa /operador?perfil=operador abrir direto, sem passar por
 *    /entrar. Em /entrar o perfil não entra na store: a EntrarPage já usa o ?perfil= para pré-selecionar a opção, e
 *    ele só sai da barra durante um fluxo.
 * 2. ?fluxo=<id>&modo=<manual|auto> ativa o fluxo e sai da barra. Pela página /fluxos a limpeza do início já foi
 *    feita antes da carga (marcada na sessão): só tira os parâmetros. Por um link de fora, chega sem a limpeza: limpa
 *    e recarrega uma vez.
 * 3. Grava o endereço que o roteador já aplicou na tela (afterEach + nextTick): o preparo espera por ele.
 * 4. Monta o painel sob demanda (import dinâmico), só com um fluxo ativo e fora da própria página /fluxos.
 */
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { PERFIS, type PerfilId } from '@/data/mocks/sessao';
import { useSessaoStore } from '@/stores/sessao';
import { instalarApiDosFluxos } from './raiz';
import { definirFluxoAtivo, fluxoAtivo, lerPreparado, marcarEnderecoAplicado, marcarPreparado, useFluxoAtivo, type ModoDoFluxo } from './sessao';

const PainelDoFluxo = defineAsyncComponent(() => import('./PainelDoFluxo.vue'));

const ROTA_DE_ENTRADA = '/entrar';

const route = useRoute();
const router = useRouter();
const sessao = useSessaoStore();
const ativo = useFluxoAtivo();
const pronto = ref(false);

instalarApiDosFluxos();

function perfilValido(v: unknown): PerfilId | null {
  return PERFIS.some((p) => p.id === v) ? (v as PerfilId) : null;
}

// 1. na carga: o ?perfil= entra na store antes do guard (ver o comentário do topo)
{
  const q = new URLSearchParams(window.location.search);
  const p = perfilValido(q.get('perfil'));
  if (p && window.location.pathname !== ROTA_DE_ENTRADA && sessao.perfilId !== p) sessao.entrar(p);
}

// 3. o endereço que a tela já recebeu: depois da navegação confirmada e da renderização
const pararDeMarcar = router.afterEach((_to, _from, falha) => {
  if (falha) return;
  void nextTick(() => marcarEnderecoAplicado(window.location.pathname + window.location.search));
});
void router.isReady().then(() => {
  pronto.value = true;
  void nextTick(() => marcarEnderecoAplicado(window.location.pathname + window.location.search));
});
onBeforeUnmount(pararDeMarcar);

/** O endereço já tratado: a mesma entrada não se trata duas vezes. */
let tratado: string | null = null;

// 2. ?fluxo=, ?modo= e ?perfil=: ativa, entra no perfil e tira os parâmetros
function tratarEndereco(): void {
  if (!route.matched.length) return; // ainda na rota inicial vazia do roteador
  const q = route.query;
  const id = typeof q.fluxo === 'string' && q.fluxo ? q.fluxo : null;
  const modo: ModoDoFluxo = q.modo === 'manual' ? 'manual' : 'auto';
  const naEntrada = route.path === ROTA_DE_ENTRADA;
  const temPerfil = 'perfil' in q;
  // em /entrar o ?perfil= é da EntrarPage (pré-seleção): sai só durante um fluxo (o preparo espera a barra limpa)
  const tirarPerfil = temPerfil && (!naEntrada || !!id || !!fluxoAtivo());
  if (!id && !tirarPerfil && !('fluxo' in q) && !('modo' in q)) {
    tratado = null;
    return;
  }
  if (tratado === route.fullPath) return;
  tratado = route.fullPath;

  // numa navegação dentro do app (a carga já entrou no setup), o perfil entra aqui
  if (temPerfil && !naEntrada) {
    const p = perfilValido(q.perfil);
    if (p && sessao.perfilId !== p) sessao.entrar(p);
  }

  const resto = { ...q };
  delete resto.fluxo;
  delete resto.modo;
  if (tirarPerfil) delete resto.perfil;
  const semFluxo = { path: route.path, query: resto, hash: route.hash };

  if (!id) {
    void router.replace(semFluxo);
    return;
  }
  if (lerPreparado() === id && fluxoAtivo()?.id === id) {
    marcarPreparado(null);
    void router.replace(semFluxo);
    return;
  }
  // chegou sem a limpeza: tira o fluxo antigo (se houver), limpa e recarrega uma vez
  if (fluxoAtivo()) definirFluxoAtivo(null);
  void import('./iniciar').then((m) => {
    if (!m.iniciarPeloEndereco(id, modo)) void router.replace(semFluxo);
  });
}

watch(() => route.fullPath, tratarEndereco, { immediate: true, flush: 'post' });

// 4. o painel: com um fluxo ativo, fora da página /fluxos
const mostrarPainel = computed(() => pronto.value && !!ativo.value && route.name !== 'fluxos');
</script>

<template>
  <PainelDoFluxo v-if="mostrarPainel" />
</template>
