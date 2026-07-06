<script setup lang="ts">
/**
 * Certidão A4 — prévia em overlay + impressão.
 *
 * Documento oficial redesenhado (Figma "Certidão · A4 · Regular"):
 * cabeçalho institucional, título, badge de situação, identificação,
 * atesto (ou pendências, na variante âmbar), base legal, validade e
 * rodapé de autenticação com código + QR.
 *
 * "Baixar PDF" e "Imprimir" abrem o diálogo de impressão do navegador
 * (salvar como PDF); o @media print global esconde o app e imprime só
 * o papel. O QR é um link real pra /consulta/validar?codigo=..., que
 * simula o escaneamento no protótipo.
 */
import { onBeforeUnmount, onMounted } from 'vue';
import RgButton from '@/components/RgButton.vue';
import type { ConsultaEmpresa } from '@/data/mocks/consulta';

const props = defineProps<{
  /** Controla a visibilidade (fica montado pra animar abrir E fechar). */
  open: boolean;
  empresa: ConsultaEmpresa;
  /** 'certidao-regular' | 'relatorio-pendencias' */
  tipo: 'certidao-regular' | 'relatorio-pendencias';
  emitidaEm: string;
}>();

const emit = defineEmits<{ (e: 'close'): void }>();

const isRegular = () => props.tipo === 'certidao-regular';

function print() {
  window.print();
}

function onKeydown(ev: KeyboardEvent) {
  if (ev.key === 'Escape' && props.open) emit('close');
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition name="cx-cert-fade">
    <div v-if="open" class="cx-cert" role="dialog" aria-modal="true" aria-label="Prévia da certidão" @click.self="emit('close')">
      <div class="cx-cert__bar">
        <RgButton variant="primary" size="md" icon="mdi-download-outline" @click="print">
          Baixar PDF
        </RgButton>
        <RgButton variant="secondary" size="md" icon="mdi-printer-outline" @click="print">
          Imprimir
        </RgButton>
        <button type="button" class="cx-cert__close" aria-label="Fechar prévia" @click="emit('close')">
          <v-icon icon="mdi-close" size="22" />
        </button>
      </div>

      <div class="cx-cert__scroll">
        <article class="cx-cert__paper">
          <!-- 1) Cabeçalho institucional -->
          <header class="cx-cert__head">
            <div class="cx-cert__head-row">
              <div class="cx-cert__estado">
                <span class="cx-cert__brasao" aria-hidden="true">BRASÃO</span>
                <span>
                  <strong>ESTADO DE GOIÁS</strong>
                  <small>Secretaria de Indústria, Comércio e Serviços · SEMAD</small>
                </span>
              </div>
              <img
                src="/brand/recicla-logo-horizontal.svg"
                alt="Recicla Goiás"
                class="cx-cert__logo"
                width="109"
                height="38"
              />
            </div>
            <p class="cx-cert__sistema">
              Recicla Goiás · Sistema de Logística Reversa de Embalagens em Geral
            </p>
            <span class="cx-cert__fio" aria-hidden="true" />
          </header>

          <!-- 2) Título -->
          <div class="cx-cert__title">
            <h1>
              {{ isRegular() ? 'CERTIFICADO DE SITUAÇÃO CADASTRAL' : 'RELATÓRIO DE PENDÊNCIAS' }}
            </h1>
            <p>Logística Reversa de Embalagens em Geral</p>
            <small>
              Emitido pela entidade gestora do sistema coletivo, nos termos do Decreto estadual nº
              10.255/2023.
            </small>
          </div>

          <!-- 3) Badge de situação -->
          <div :class="['cx-cert__status', isRegular() ? 'is-regular' : 'is-pendencia']">
            <span class="cx-cert__status-selo">
              <v-icon
                :icon="isRegular() ? 'mdi-check-circle' : 'mdi-alert-circle-outline'"
                size="20"
                aria-hidden="true"
              />
              {{ isRegular() ? 'SITUAÇÃO REGULAR' : 'SITUAÇÃO COM PENDÊNCIA' }}
            </span>
            <p v-if="isRegular()">
              A empresa abaixo identificada encontra-se REGULAR perante o Recicla Goiás na data de
              referência desta certidão.
            </p>
            <p v-else>
              Foram identificadas pendências que impedem a emissão de certidão de regularidade na
              data de referência.
            </p>
          </div>

          <!-- 4) Identificação -->
          <section class="cx-cert__sec">
            <h2>IDENTIFICAÇÃO DA EMPRESA</h2>
            <dl class="cx-cert__grid">
              <div class="cx-cert__grid-full">
                <dt>RAZÃO SOCIAL</dt>
                <dd>{{ empresa.razaoSocial }}</dd>
              </div>
              <div><dt>CNPJ</dt><dd>{{ empresa.cnpj }}</dd></div>
              <div><dt>MUNICÍPIO / UF</dt><dd>{{ empresa.municipioUf }}</dd></div>
              <div><dt>PERFIL NO SISTEMA</dt><dd>{{ empresa.perfil }}</dd></div>
              <div>
                <dt>SISTEMA DE LOGÍSTICA REVERSA</dt>
                <dd>Coletivo, por meio de entidade gestora</dd>
              </div>
            </dl>
          </section>

          <!-- 5) Atesto ou pendências -->
          <section v-if="isRegular()" class="cx-cert__sec">
            <h2>O QUE ESTA CERTIDÃO ATESTA</h2>
            <p class="cx-cert__body">
              Certifica-se que, na data de referência indicada, a empresa acima identificada consta
              como aderente a um sistema de logística reversa registrado na SEMAD e mantém em dia as
              comprovações exigidas para embalagens em geral: declaração das embalagens colocadas no
              mercado estadual, metas de recuperação comprovadas por certificados RECICLAGOIÁS e
              relatório anual dentro do prazo. Esta certidão tem caráter declaratório e não
              substitui a fiscalização dos órgãos competentes.
            </p>
          </section>

          <section v-else class="cx-cert__sec">
            <h2>PENDÊNCIAS IDENTIFICADAS</h2>
            <ul class="cx-cert__pend">
              <li v-for="p in empresa.pendencias" :key="p.title">
                <v-icon icon="mdi-alert-circle-outline" size="16" aria-hidden="true" />
                {{ p.title }}
              </li>
            </ul>
            <p class="cx-cert__pend-note">
              Regularize as pendências no sistema. Enquanto houver pendência, este documento tem
              caráter meramente informativo.
            </p>
          </section>

          <!-- 6) Base legal -->
          <section class="cx-cert__sec">
            <h2>BASE LEGAL</h2>
            <ul class="cx-cert__legal">
              <li>
                Decreto estadual nº 10.255/2023, que institui a logística reversa de embalagens em
                geral no Estado de Goiás.
              </li>
              <li>
                Lei federal nº 9.605/1998 e Decreto federal nº 6.514/2008, que definem o regime de
                responsabilização ambiental.
              </li>
              <li>
                A obrigação alcança fabricantes, importadores, distribuidores e comerciantes, com ou
                sem sede em Goiás.
              </li>
            </ul>
          </section>

          <!-- 7) Referência e validade -->
          <div class="cx-cert__ref">
            <div><dt>DATA DE REFERÊNCIA</dt><dd>{{ emitidaEm.split(' às ')[0] }}</dd></div>
            <div><dt>VALIDADE</dt><dd>90 dias da emissão</dd></div>
            <div><dt>SITUAÇÃO</dt><dd>Sujeita a atualização</dd></div>
          </div>
          <p class="cx-cert__ref-note">
            A regularidade reflete a base de dados do sistema no momento da emissão.
          </p>

          <!-- 8) Rodapé de autenticação -->
          <footer class="cx-cert__auth">
            <span class="cx-cert__fio-thin" aria-hidden="true" />
            <div class="cx-cert__auth-row">
              <div class="cx-cert__auth-left">
                <small>CÓDIGO DE AUTENTICAÇÃO</small>
                <strong>{{ empresa.codigoAutenticacao }}</strong>
                <span>Emitido em {{ emitidaEm }} (horário de Brasília).</span>
                <span>Documento gerado eletronicamente, dispensa assinatura.</span>
              </div>
              <div class="cx-cert__auth-right">
                <RouterLink
                  :to="{ path: '/consulta/validar', query: { codigo: empresa.codigoAutenticacao } }"
                  class="cx-cert__qr"
                  title="No protótipo, clicar no QR simula escanear com a câmera"
                >
                  <v-icon icon="mdi-qrcode" size="60" aria-hidden="true" />
                </RouterLink>
                <span class="cx-cert__qr-txt">
                  <strong>Valide a autenticidade em</strong>
                  <em>reciclagoias.go.gov.br/consulta/validar</em>
                  e informe o código ao lado, ou aponte a câmera para o QR Code.
                </span>
              </div>
            </div>
          </footer>
        </article>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ============ Overlay ============ */
.cx-cert {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  background-color: rgba(7, 38, 20, 0.72);
}

.cx-cert__bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--rg-space-3);
  padding: var(--rg-space-4);
}

.cx-cert__close {
  position: absolute;
  top: var(--rg-space-4);
  right: var(--rg-space-4);
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: var(--rg-radius-pill);
  background-color: rgba(255, 255, 255, 0.12);
  color: var(--rg-primitive-neutral-0);
  cursor: pointer;
}

.cx-cert__close:hover {
  background-color: rgba(255, 255, 255, 0.22);
}

.cx-cert__scroll {
  flex: 1;
  overflow: auto;
  padding: 0 var(--rg-space-4) var(--rg-space-10);
}

/* ============ Papel A4 ============ */
.cx-cert__paper {
  width: min(820px, 100%);
  margin-inline: auto;
  padding: 56px 64px;
  border-radius: var(--rg-radius-md);
  background-color: #ffffff;
  box-shadow: var(--rg-elevation-4);
  color: var(--rg-color-text-primary);
  animation: cx-paper-in 0.4s var(--rg-motion-ease-emphasized);
}

@keyframes cx-paper-in {
  from { opacity: 0; transform: translateY(16px); }
}

/* Cabeçalho */
.cx-cert__head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-6);
}

.cx-cert__estado {
  display: flex;
  align-items: center;
  gap: var(--rg-space-4);
}

.cx-cert__brasao {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: var(--rg-radius-sm);
  background-color: var(--rg-primitive-neutral-200);
  font-size: 8px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-primitive-neutral-500);
}

.cx-cert__estado span:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cx-cert__estado strong {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
}

.cx-cert__estado small {
  font-size: var(--rg-font-size-2xs);
  color: var(--rg-color-text-secondary);
}

.cx-cert__logo {
  width: 109px;
  height: auto;
}

.cx-cert__sistema {
  margin: var(--rg-space-4) 0 0;
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-primitive-brand-700);
}

.cx-cert__fio {
  display: block;
  height: 3px;
  margin-top: var(--rg-space-4);
  border-radius: 2px;
  background-color: var(--rg-primitive-brand-600);
}

/* Título */
.cx-cert__title {
  margin-top: var(--rg-space-8);
  text-align: center;
}

.cx-cert__title h1 {
  margin: 0;
  font-size: 22px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
}

.cx-cert__title p {
  margin: var(--rg-space-2) 0 0;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-secondary);
}

.cx-cert__title small {
  display: block;
  margin-top: var(--rg-space-2);
  font-size: var(--rg-font-size-2xs);
  color: var(--rg-color-text-secondary);
}

/* Badge de situação */
.cx-cert__status {
  margin-top: var(--rg-space-6);
  padding: var(--rg-space-5);
  border-radius: var(--rg-radius-xl);
}

.cx-cert__status.is-regular {
  background-color: var(--rg-primitive-brand-50);
  border: 1px solid var(--rg-primitive-brand-100);
}

.cx-cert__status.is-pendencia {
  background-color: #fbf4e6;
  border: 1px solid #f5e6c8;
}

.cx-cert__status-selo {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
}

.cx-cert__status.is-regular .cx-cert__status-selo {
  color: var(--rg-primitive-brand-700);
}

.cx-cert__status.is-pendencia .cx-cert__status-selo {
  color: #b8791b;
}

.cx-cert__status p {
  margin: var(--rg-space-3) 0 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
}

/* Seções */
.cx-cert__sec {
  margin-top: var(--rg-space-7);
}

.cx-cert__sec h2 {
  margin: 0 0 var(--rg-space-2);
  padding-bottom: var(--rg-space-2);
  border-bottom: 1px solid var(--rg-primitive-neutral-200);
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  color: var(--rg-color-text-secondary);
}

.cx-cert__grid {
  margin: var(--rg-space-3) 0 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--rg-space-4) var(--rg-space-8);
}

.cx-cert__grid-full {
  grid-column: 1 / -1;
}

.cx-cert__grid dt {
  font-size: 10px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  color: var(--rg-color-text-secondary);
}

.cx-cert__grid dd {
  margin: 2px 0 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  font-variant-numeric: tabular-nums;
}

.cx-cert__body {
  margin: var(--rg-space-3) 0 0;
  font-size: var(--rg-font-size-sm);
  line-height: 1.6;
  color: var(--rg-color-text-secondary);
  text-align: justify;
}

.cx-cert__pend {
  list-style: none;
  margin: var(--rg-space-3) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
}

.cx-cert__pend li {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
}

.cx-cert__pend .v-icon {
  color: #e0a63b;
}

.cx-cert__pend-note {
  margin: var(--rg-space-3) 0 0;
  font-size: var(--rg-font-size-xs);
  color: #7a5313;
}

.cx-cert__legal {
  list-style: none;
  margin: var(--rg-space-3) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
}

.cx-cert__legal li {
  position: relative;
  padding-left: var(--rg-space-4);
  font-size: var(--rg-font-size-xs);
  line-height: 1.55;
  color: var(--rg-color-text-secondary);
}

.cx-cert__legal li::before {
  content: '·';
  position: absolute;
  left: 2px;
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-primitive-brand-500);
}

/* Referência / validade */
.cx-cert__ref {
  display: flex;
  gap: var(--rg-space-6);
  margin-top: var(--rg-space-7);
  padding: var(--rg-space-4) var(--rg-space-5);
  border-radius: var(--rg-radius-lg);
  border: 1px solid var(--rg-primitive-brand-100);
  background-color: var(--rg-color-surface-soft-tint);
}

.cx-cert__ref > div {
  flex: 1;
}

.cx-cert__ref dt {
  font-size: 10px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  color: var(--rg-color-text-secondary);
}

.cx-cert__ref dd {
  margin: 2px 0 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
}

.cx-cert__ref-note {
  margin: var(--rg-space-2) 0 0;
  font-size: var(--rg-font-size-2xs);
  text-align: center;
  color: var(--rg-color-text-secondary);
}

/* Autenticação */
.cx-cert__auth {
  margin-top: var(--rg-space-8);
}

.cx-cert__fio-thin {
  display: block;
  height: 1px;
  background-color: var(--rg-primitive-neutral-200);
}

.cx-cert__auth-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rg-space-6);
  margin-top: var(--rg-space-4);
}

.cx-cert__auth-left {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
  min-width: 0;
}

.cx-cert__auth-left small {
  font-size: 10px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  color: var(--rg-color-text-secondary);
}

.cx-cert__auth-left strong {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  letter-spacing: var(--rg-letter-spacing-wide);
  font-variant-numeric: tabular-nums;
}

.cx-cert__auth-left span {
  font-size: var(--rg-font-size-2xs);
  color: var(--rg-color-text-secondary);
}

.cx-cert__auth-right {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  flex: none;
}

.cx-cert__qr {
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  border-radius: var(--rg-radius-md);
  border: 1px solid var(--rg-primitive-neutral-300);
  background-color: #ffffff;
  color: var(--rg-color-text-primary);
  transition: box-shadow var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.cx-cert__qr:hover {
  box-shadow: var(--rg-ring-focus);
}

.cx-cert__qr-txt {
  display: block;
  max-width: 180px;
  font-size: var(--rg-font-size-2xs);
  line-height: 1.5;
  color: var(--rg-color-text-secondary);
}

.cx-cert__qr-txt strong {
  display: block;
  color: var(--rg-color-text-primary);
}

.cx-cert__qr-txt em {
  font-style: normal;
  color: var(--rg-primitive-brand-700);
}

@media (max-width: 720px) {
  .cx-cert__paper {
    padding: var(--rg-space-8) var(--rg-space-5);
  }
  .cx-cert__grid {
    grid-template-columns: 1fr;
  }
  .cx-cert__ref {
    flex-direction: column;
    gap: var(--rg-space-3);
  }
  .cx-cert__auth-row {
    flex-direction: column;
  }
}

/* Fade do overlay (abre e fecha suave) */
.cx-cert-fade-enter-active,
.cx-cert-fade-leave-active {
  transition: opacity 240ms var(--rg-motion-ease-standard);
}

.cx-cert-fade-enter-from,
.cx-cert-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .cx-cert__paper {
    animation: none !important;
  }
  .cx-cert-fade-enter-active,
  .cx-cert-fade-leave-active {
    transition: none !important;
  }
}
</style>

<!-- Impressão: só o papel, sem app nem overlay escuro, 1 página A4 -->
<style>
@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }
  body > #app {
    display: none !important;
  }
  .cx-cert {
    position: static !important;
    background: none !important;
  }
  .cx-cert__bar,
  .cx-cert__close {
    display: none !important;
  }
  .cx-cert__scroll {
    overflow: visible !important;
    padding: 0 !important;
  }
  .cx-cert__paper {
    width: 100% !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    animation: none !important;
    /* Compacta o documento pra caber em 1 página A4 */
    zoom: 0.82;
    padding: 48px 56px !important;
  }
}
</style>
