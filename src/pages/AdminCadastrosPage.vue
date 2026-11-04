<script setup lang="ts">
/**
 * Fila da análise de cadastro do Operador Logístico, na área Admin (SEMAD).
 *
 * Figma: `Recicla Goiás - Figma`, seção do Admin (5901:10683), L1·1 e L4·1. Rodada
 * da planning de 16/10 (fechada em 18/10): coluna Analista, quatro situações
 * (Enviado, Em análise, Devolvido, Aprovado) e a seta virou o menu da linha.
 * Visualizar abre o cadastro só para ler; Analisar (só em Enviado) põe Em análise,
 * atribui a quem clicou e abre a análise.
 *
 * A primeira linha é a Recicla Cerrado, que acompanha a store do complemento: é ela
 * que fecha a volta da demonstração. No reenvio ela volta como Enviado, no topo, sem
 * analista, na data do reenvio. As outras linhas são ilustrativas.
 */
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router';

import AxMenuLinha from '@/components/admin/AxMenuLinha.vue';
import type { ItemMenu } from '@/components/admin/analise';
import GestoraShell from '@/components/gestora/GestoraShell.vue';
import RgButton from '@/components/RgButton.vue';
import { FILA_CADASTROS, PRE_CADASTRO, ROTULO_TIPO } from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

const router = useRouter();
const c = useComplementoStore();

type SituacaoFila = 'enviado' | 'em-analise' | 'devolvido' | 'aprovado';
const SITUACOES: Record<SituacaoFila, { rotulo: string; tom: string }> = {
  enviado: { rotulo: 'Enviado', tom: 'neutro' },
  'em-analise': { rotulo: 'Em análise', tom: 'info' },
  devolvido: { rotulo: 'Devolvido', tom: 'warning' },
  aprovado: { rotulo: 'Aprovado', tom: 'success' },
};

interface Linha {
  protocolo: string;
  nome: string;
  cnpj: string;
  tipo: string;
  situacao: SituacaoFila;
  enviado: string;
  analista: string | null;
  viva: boolean;
}

/** Enquanto a Recicla Cerrado preenche, ela não está na fila. */
const linhaViva = computed<Linha | null>(() => {
  if (c.situacao === 'preenchendo') return null;
  return {
    protocolo: c.protocolo,
    nome: PRE_CADASTRO.razaoSocial,
    cnpj: PRE_CADASTRO.cnpj,
    tipo: ROTULO_TIPO[PRE_CADASTRO.tipoOrganizacao],
    situacao: c.situacao,
    enviado: c.dataEnvio ? c.dataEnvio.split(',')[0]! : '',
    analista: c.analista,
    viva: true,
  };
});

const todas = computed<Linha[]>(() => [
  ...(linhaViva.value ? [linhaViva.value] : []),
  ...FILA_CADASTROS.map((l) => ({ ...l, situacao: l.situacao as SituacaoFila, viva: false })),
]);

// ---- filtros: o formulário edita o rascunho, Filtrar aplica, Limpar zera ----
const rascunho = reactive({ busca: '', tipo: '', situacao: '' });
const aplicado = reactive({ busca: '', tipo: '', situacao: '' });

function filtrar() {
  Object.assign(aplicado, rascunho);
}
function limpar() {
  Object.assign(rascunho, { busca: '', tipo: '', situacao: '' });
  filtrar();
}

const soDigitos = (s: string) => s.replace(/\D/g, '');
const linhas = computed(() => {
  const termo = aplicado.busca.trim().toLowerCase();
  return todas.value.filter((l) => {
    if (aplicado.tipo && l.tipo !== aplicado.tipo) return false;
    if (aplicado.situacao && l.situacao !== aplicado.situacao) return false;
    if (!termo) return true;
    const digitos = soDigitos(termo);
    return (
      l.nome.toLowerCase().includes(termo) ||
      l.protocolo.toLowerCase().includes(termo) ||
      (digitos.length > 0 && soDigitos(l.cnpj).includes(digitos))
    );
  });
});

// ---- menu da linha ----
function itens(l: Linha): ItemMenu[] {
  const lista: ItemMenu[] = [{ id: 'visualizar', rotulo: 'Visualizar', desabilitado: !l.viva }];
  if (l.situacao === 'enviado') lista.push({ id: 'analisar', rotulo: 'Analisar', desabilitado: !l.viva, destaque: true });
  return lista;
}

function escolher(l: Linha, acao: string) {
  if (!l.viva) return;
  const params = { protocolo: l.protocolo.toLowerCase() };
  if (acao === 'analisar') {
    c.iniciarAnalise();
    void router.push({ name: 'admin-analise', params });
  } else {
    void router.push({ name: 'admin-analise', params, query: { modo: 'visualizar' } });
  }
}
</script>

<template>
  <GestoraShell secao-ativa="Cadastros de operador" :explorador="false">
    <nav class="ax-trilha" aria-label="Trilha">
      <span>Recicla Admin</span><span aria-hidden="true">/</span><strong>Cadastros para análise</strong>
    </nav>

    <header>
      <h1 class="ax-titulo">Cadastros de operador logístico</h1>
      <p class="ax-sub">
        Complementos de cadastro enviados para análise. Os que voltaram corrigidos aparecem no topo. Busque pelo
        nome, CNPJ ou protocolo.
      </p>
    </header>

    <form class="ax-filtros" role="search" aria-label="Filtrar cadastros" @submit.prevent="filtrar">
      <label class="ax-campo ax-campo--busca">
        <span>Buscar</span>
        <input v-model="rascunho.busca" type="search" placeholder="Nome, CNPJ ou protocolo" />
      </label>
      <label class="ax-campo">
        <span>Tipo</span>
        <select v-model="rascunho.tipo">
          <option value="">Todos</option>
          <option value="Cooperativa">Cooperativa</option>
          <option value="Empresa">Empresa</option>
        </select>
      </label>
      <label class="ax-campo">
        <span>Situação</span>
        <select v-model="rascunho.situacao">
          <option value="">Todas</option>
          <option v-for="(s, chave) in SITUACOES" :key="chave" :value="chave">{{ s.rotulo }}</option>
        </select>
      </label>
      <div class="ax-filtros__botoes">
        <RgButton type="submit" variant="primary">Filtrar</RgButton>
        <RgButton variant="secondary" @click="limpar">Limpar filtros</RgButton>
      </div>
    </form>

    <div class="ax-tabela">
      <table>
        <caption class="ax-oculto">Cadastros para análise, do mais recente para o mais antigo</caption>
        <colgroup>
          <col class="ax-col-protocolo" />
          <col />
          <col class="ax-col-tipo" />
          <col class="ax-col-situacao" />
          <col class="ax-col-data" />
          <col class="ax-col-analista" />
          <col class="ax-col-acoes" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Protocolo</th>
            <th scope="col">Organização e CNPJ</th>
            <th scope="col">Tipo</th>
            <th scope="col">Situação</th>
            <th scope="col" class="ax-direita">Enviado em</th>
            <th scope="col">Analista</th>
            <th scope="col"><span class="ax-oculto">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in linhas" :key="l.protocolo" :class="{ 'ax-linha--viva': l.viva }">
            <td class="ax-protocolo">{{ l.protocolo }}</td>
            <td>
              <span class="ax-org"><strong>{{ l.nome }}</strong><small>{{ l.cnpj }}</small></span>
            </td>
            <td>{{ l.tipo }}</td>
            <td>
              <span class="ax-chip" :class="`ax-chip--${SITUACOES[l.situacao].tom}`">{{ SITUACOES[l.situacao].rotulo }}</span>
            </td>
            <td class="ax-data ax-direita">{{ l.enviado }}</td>
            <td>
              <span v-if="l.analista">{{ l.analista }}</span>
              <span v-else class="ax-sem">Sem analista</span>
            </td>
            <td class="ax-acoes">
              <AxMenuLinha :rotulo="`Ações de ${l.nome}`" :itens="itens(l)" @escolher="escolher(l, $event)" />
            </td>
          </tr>
          <tr v-if="!linhas.length">
            <td colspan="7" class="ax-vazio">Nenhum cadastro com esses filtros.</td>
          </tr>
        </tbody>
      </table>

      <div class="ax-paginacao">
        <label class="ax-paginacao__por">
          <span class="ax-oculto">Itens por página</span>
          <select><option>10 por página</option></select>
        </label>
        <span>1 a {{ linhas.length }} de {{ linhas.length }}</span>
        <button type="button" class="ax-paginacao__seta" aria-label="Página anterior" disabled>
          <v-icon icon="mdi-chevron-left" size="18" aria-hidden="true" />
        </button>
        <button type="button" class="ax-paginacao__seta" aria-label="Próxima página" disabled>
          <v-icon icon="mdi-chevron-right" size="18" aria-hidden="true" />
        </button>
      </div>
    </div>

    <p v-if="c.situacao === 'preenchendo'" class="ax-dica">
      A Recicla Cerrado ainda não enviou o complemento. Envie pelo perfil Operador Logístico: ela entra no topo da fila,
      como Enviado e sem analista.
    </p>
  </GestoraShell>
</template>

<style scoped>
.ax-trilha {
  display: flex;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-muted);
}

.ax-trilha strong {
  color: var(--rg-color-text-primary);
  font-weight: var(--rg-font-weight-medium);
}

.ax-titulo {
  margin: 0;
  font-size: 28px;
  line-height: 34px;
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
}

.ax-sub {
  margin: var(--rg-space-1) 0 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.ax-filtros {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--rg-space-3);
  padding: var(--rg-space-6);
  background: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
}

.ax-campo {
  display: flex;
  flex: 0 1 200px;
  flex-direction: column;
  gap: var(--rg-space-1);
  min-width: 160px;
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-medium);
  line-height: 16px;
  color: var(--rg-color-text-secondary);
}

.ax-campo--busca {
  flex: 1 1 280px;
}

.ax-campo input,
.ax-campo select {
  height: 44px;
  padding: 0 var(--rg-space-3);
  border: 1px solid var(--rg-primitive-neutral-500);
  border-radius: var(--rg-radius-md);
  font: inherit;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-primary);
  background: var(--rg-color-surface-raised);
}

.ax-campo input:focus-visible,
.ax-campo select:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 1px;
}

.ax-filtros__botoes {
  display: flex;
  gap: var(--rg-space-3);
}

.ax-tabela {
  background: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
}

.ax-tabela table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.ax-col-protocolo { width: 166px; }
.ax-col-tipo { width: 146px; }
.ax-col-situacao { width: 171px; }
.ax-col-data { width: 156px; }
.ax-col-analista { width: 151px; }
.ax-col-acoes { width: 84px; }

.ax-tabela th,
.ax-tabela td {
  padding: 0 0 0 var(--rg-space-4);
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  color: var(--rg-color-text-secondary);
  text-align: left;
  vertical-align: middle;
}

.ax-tabela th:first-child,
.ax-tabela td:first-child {
  padding-left: var(--rg-space-6);
}

.ax-tabela th:last-child,
.ax-tabela td:last-child {
  padding-right: var(--rg-space-6);
}

.ax-tabela th {
  height: 46px;
  background: var(--rg-color-surface-subtle);
  font-size: 13px;
  font-weight: var(--rg-font-weight-medium);
  line-height: 18px;
}

.ax-tabela th:first-child {
  border-top-left-radius: var(--rg-radius-lg);
}

.ax-tabela th:last-child {
  border-top-right-radius: var(--rg-radius-lg);
}

.ax-tabela td {
  height: 64px;
  padding-top: var(--rg-space-2);
  padding-bottom: var(--rg-space-2);
  border-bottom: 1px solid var(--rg-color-border-subtle);
}

.ax-direita {
  text-align: right !important;
}

.ax-linha--viva td {
  background: var(--rg-color-surface-raised);
}

.ax-protocolo {
  font-size: 13px !important;
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-brand) !important;
}

.ax-org {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ax-org strong {
  color: var(--rg-color-text-primary);
  font-weight: var(--rg-font-weight-semibold);
}

.ax-org small {
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.ax-data {
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary) !important;
}

.ax-sem {
  color: var(--rg-color-text-muted);
}

.ax-acoes {
  text-align: center !important;
}

.ax-chip {
  display: inline-block;
  padding: var(--rg-space-1) 10px;
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 16px;
  white-space: nowrap;
}

.ax-chip--neutro { background: var(--rg-color-surface-subtle); color: var(--rg-color-text-secondary); }
.ax-chip--info { background: var(--rg-color-feedback-info-soft); color: var(--rg-color-feedback-info); }
.ax-chip--warning { background: var(--rg-color-feedback-warning-soft); color: var(--rg-primitive-amber-700); }
.ax-chip--success { background: var(--rg-color-feedback-success-soft); color: var(--rg-color-text-brand); }

.ax-vazio {
  text-align: center !important;
  color: var(--rg-color-text-muted) !important;
}

.ax-paginacao {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--rg-space-3);
  min-height: 44px;
  padding: var(--rg-space-1) var(--rg-space-6);
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
}

.ax-paginacao__por select {
  height: 28px;
  padding: 0 var(--rg-space-2);
  border: 1px solid var(--rg-primitive-neutral-500);
  border-radius: var(--rg-radius-md);
  font: inherit;
  color: var(--rg-color-text-secondary);
  background: var(--rg-color-surface-raised);
}

.ax-paginacao__seta {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--rg-radius-sm);
  background: none;
  color: var(--rg-color-text-secondary);
}

.ax-paginacao__seta:disabled {
  color: var(--rg-color-text-disabled);
}

.ax-dica {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-muted);
}

.ax-oculto {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 1023px) {
  .ax-tabela {
    overflow-x: auto;
  }

  .ax-tabela table {
    min-width: 960px;
  }
}
</style>
