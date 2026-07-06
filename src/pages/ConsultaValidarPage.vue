<script setup lang="ts">
/**
 * Validação de documento — confirma a autenticidade de uma certidão.
 *
 * Dois caminhos de entrada:
 *   1. A pessoa digita o código de autenticação impresso no documento;
 *   2. O QR Code da certidão aponta pra cá com ?codigo=... e a
 *      validação roda sozinha (no protótipo, clicar no QR simula isso).
 *
 * Estados in-place: form → validando (spinner curto) → autêntico
 * (verde, com resumo do documento) | não localizado (neutro).
 */
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ConsultaShell from '@/components/consulta/ConsultaShell.vue';
import RgButton from '@/components/RgButton.vue';
import {
  findCertidaoByCodigo,
  normalizeCodigo,
  type CertidaoInfo,
} from '@/data/mocks/consulta';

type Estado = 'form' | 'validando' | 'valido' | 'invalido';

const route = useRoute();
const router = useRouter();

const estado = ref<Estado>('form');
const codigo = ref('');
const certidao = ref<CertidaoInfo | null>(null);
const hint = ref('');
const viaQr = ref(false);
const validadoEm = ref('');

function validar(code: string) {
  const normalized = normalizeCodigo(code);
  if (normalized.length < 6) {
    hint.value = 'Informe o código completo impresso no documento.';
    return;
  }
  hint.value = '';
  estado.value = 'validando';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // ?instant=1 pula a espera do loading (QA, demonstração e captura de tela)
  const instant = route.query.instant === '1';
  window.setTimeout(() => {
    certidao.value = findCertidaoByCodigo(normalized);
    validadoEm.value = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
      .format(new Date())
      .replace(',', ' às ');
    estado.value = certidao.value ? 'valido' : 'invalido';
  }, instant ? 0 : reduced ? 300 : 1400);
}

function novaValidacao() {
  estado.value = 'form';
  certidao.value = null;
  codigo.value = '';
  viaQr.value = false;
  // Limpa o ?codigo= da URL pra nova digitação
  if (route.query.codigo) router.replace({ query: {} });
}

onMounted(() => {
  const fromQr = route.query.codigo;
  if (typeof fromQr === 'string' && fromQr.length > 0) {
    viaQr.value = true;
    codigo.value = normalizeCodigo(fromQr);
    validar(fromQr);
  }
});
</script>

<template>
  <ConsultaShell>
    <Transition name="cx-swap" mode="out-in">
      <!-- Formulário -->
      <div v-if="estado === 'form'" key="form" class="cx-val">
        <span class="cx-val__eyebrow">VALIDAÇÃO DE DOCUMENTO</span>

        <h1 class="cx-val__title">
          Confira se uma certidão<br />
          é <span class="cx-val__title-accent">autêntica</span>
        </h1>

        <p class="cx-val__subtitle">
          Toda certidão do Recicla Goiás traz um código de autenticação e um QR Code. Digite o
          código abaixo, ou aponte a câmera para o QR impresso no documento, para confirmar que ele
          foi mesmo emitido pelo sistema.
        </p>

        <form class="cx-val__card" novalidate @submit.prevent="validar(codigo)">
          <label class="cx-val__label" for="cx-codigo">Código de autenticação</label>
          <div class="cx-val__input">
            <v-icon icon="mdi-shield-search" size="20" aria-hidden="true" />
            <input
              id="cx-codigo"
              v-model="codigo"
              type="text"
              autocomplete="off"
              spellcheck="false"
              placeholder="RG-0000-0000-0000-0000"
              @input="codigo = codigo.toUpperCase()"
            />
          </div>
          <p v-if="hint" class="cx-val__hint" role="alert">{{ hint }}</p>
          <RgButton type="submit" variant="primary" size="lg" block icon="mdi-shield-check-outline">
            Validar documento
          </RgButton>
        </form>

        <p class="cx-val__trust">
          <v-icon icon="mdi-qrcode-scan" size="18" aria-hidden="true" />
          O QR Code do documento leva direto para esta validação.
        </p>

        <RouterLink to="/consulta" class="cx-val__back">
          <v-icon icon="mdi-arrow-left" size="16" aria-hidden="true" />
          Voltar para a consulta por CNPJ
        </RouterLink>
      </div>

      <!-- Validando -->
      <div v-else-if="estado === 'validando'" key="validando" class="cx-val">
        <span class="cx-val__eyebrow">
          <span class="cx-val__dot" aria-hidden="true" />
          VALIDANDO
        </span>
        <div class="cx-val__card cx-val__card--center" role="status" aria-live="polite">
          <span class="cx-val__ring" aria-hidden="true">
            <span class="cx-val__ring-arc" />
            <v-icon icon="mdi-shield-search" size="28" />
          </span>
          <h2 class="cx-val__loading-title">Conferindo o documento</h2>
          <p class="cx-val__loading-sub">
            Verificando o código
            <strong class="cx-num">{{ codigo }}</strong>
            na base do Recicla Goiás.
          </p>
        </div>
      </div>

      <!-- Autêntico -->
      <div v-else-if="estado === 'valido' && certidao" key="valido" class="cx-val">
        <span class="cx-val__eyebrow">RESULTADO DA VALIDAÇÃO</span>

        <div class="cx-val__card cx-val__card--result">
          <span class="cx-val__selo is-ok" aria-hidden="true">
            <span><v-icon icon="mdi-check-decagram" size="40" /></span>
          </span>

          <span class="cx-val__badge is-ok cx-in" style="--d: 80ms">
            <v-icon icon="mdi-check-bold" size="14" aria-hidden="true" />
            DOCUMENTO AUTÊNTICO
          </span>

          <h2 class="cx-val__result-title cx-in" style="--d: 140ms">
            Este documento foi emitido pelo
            <span class="cx-val__title-accent">Recicla Goiás</span>
          </h2>

          <p class="cx-val__result-sub cx-in" style="--d: 200ms" v-if="viaQr">
            Você chegou aqui pelo QR Code do documento. A autenticidade foi confirmada
            automaticamente.
          </p>
          <p class="cx-val__result-sub cx-in" style="--d: 200ms" v-else>
            O código informado confere com um documento emitido pelo sistema.
          </p>

          <section class="cx-val__doc cx-in" style="--d: 280ms" aria-label="Dados do documento">
            <header>
              <v-icon icon="mdi-file-document-outline" size="18" aria-hidden="true" />
              Dados do documento
            </header>
            <dl>
              <div>
                <dt>Tipo</dt>
                <dd>
                  {{
                    certidao.tipo === 'certidao-regular'
                      ? 'Certificado de Situação Cadastral'
                      : 'Relatório de Pendências'
                  }}
                </dd>
              </div>
              <div><dt>Código</dt><dd class="cx-num">{{ certidao.codigo }}</dd></div>
              <div><dt>Razão social</dt><dd>{{ certidao.empresa.razaoSocial }}</dd></div>
              <div><dt>CNPJ</dt><dd class="cx-num">{{ certidao.empresa.cnpj }}</dd></div>
              <div>
                <dt>Situação na emissão</dt>
                <dd>
                  <span
                    :class="[
                      'cx-val__situacao',
                      certidao.tipo === 'certidao-regular' ? 'is-ok' : 'is-pend',
                    ]"
                  >
                    {{ certidao.tipo === 'certidao-regular' ? 'REGULAR' : 'COM PENDÊNCIA' }}
                  </span>
                </dd>
              </div>
              <div><dt>Validação realizada em</dt><dd>{{ validadoEm }}</dd></div>
            </dl>
          </section>

          <p class="cx-val__note cx-in" style="--d: 360ms">
            A validação confirma a autenticidade do documento na data de emissão. A situação da
            empresa pode ter mudado desde então; para a situação atual, faça uma nova consulta por
            CNPJ.
          </p>

          <div class="cx-val__ctas cx-in" style="--d: 440ms">
            <RgButton variant="primary" size="lg" icon="mdi-magnify" class="cx-val__cta-main" to="/consulta">
              Consultar situação atual
            </RgButton>
            <RgButton variant="secondary" size="lg" icon="mdi-refresh" @click="novaValidacao">
              Validar outro documento
            </RgButton>
          </div>
        </div>
      </div>

      <!-- Não localizado -->
      <div v-else key="invalido" class="cx-val">
        <span class="cx-val__eyebrow">RESULTADO DA VALIDAÇÃO</span>

        <div class="cx-val__card cx-val__card--result">
          <span class="cx-val__selo is-nf" aria-hidden="true">
            <span><v-icon icon="mdi-file-question-outline" size="36" /></span>
          </span>

          <span class="cx-val__badge is-nf cx-in" style="--d: 80ms">
            <v-icon icon="mdi-information-outline" size="14" aria-hidden="true" />
            DOCUMENTO NÃO LOCALIZADO
          </span>

          <h2 class="cx-val__result-title cx-in" style="--d: 140ms">
            Não encontramos um documento<br />
            com este código
          </h2>

          <p class="cx-val__result-sub cx-in" style="--d: 200ms">
            O código
            <strong class="cx-num">{{ codigo }}</strong>
            não corresponde a nenhum documento emitido pelo Recicla Goiás.
          </p>

          <section class="cx-val__doc cx-in" style="--d: 280ms" aria-label="O que isso pode significar">
            <header>
              <v-icon icon="mdi-information-outline" size="18" aria-hidden="true" />
              O que isso pode significar
            </header>
            <ul class="cx-val__reasons">
              <li>O código pode ter sido digitado com algum erro. Confira e tente de novo.</li>
              <li>O documento pode ter sido alterado depois da emissão.</li>
              <li>
                O documento pode não ter sido emitido pelo Recicla Goiás. Nesse caso, desconfie e
                não o aceite como comprovação.
              </li>
            </ul>
          </section>

          <div class="cx-val__ctas cx-in" style="--d: 360ms">
            <RgButton variant="primary" size="lg" icon="mdi-refresh" class="cx-val__cta-main" @click="novaValidacao">
              Tentar outro código
            </RgButton>
            <RgButton variant="secondary" size="lg" icon="mdi-magnify" to="/consulta">
              Consultar por CNPJ
            </RgButton>
          </div>
        </div>
      </div>
    </Transition>
  </ConsultaShell>
</template>

<style scoped>
/* Troca in-place entre estados (mesma linguagem da consulta) */
.cx-swap-enter-active {
  transition:
    opacity 280ms var(--rg-motion-ease-emphasized),
    transform 280ms var(--rg-motion-ease-emphasized);
}

.cx-swap-leave-active {
  transition:
    opacity 180ms var(--rg-motion-ease-accelerate),
    transform 180ms var(--rg-motion-ease-accelerate);
}

.cx-swap-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.cx-swap-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.cx-val {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: var(--rg-space-10);
}

.cx-val__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-4);
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-50);
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  color: var(--rg-primitive-brand-700);
}

.cx-val__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-600);
  animation: cx-pulse 1.4s ease-in-out infinite;
}

@keyframes cx-pulse {
  50% { opacity: 0.35; }
}

.cx-val__title {
  margin: var(--rg-space-5) 0 0;
  font-size: clamp(30px, 4vw, 42px);
  line-height: 1.12;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  text-align: center;
  color: var(--rg-color-text-primary);
}

.cx-val__title-accent {
  color: var(--rg-primitive-brand-600);
}

.cx-val__subtitle {
  margin: var(--rg-space-4) 0 0;
  max-width: 640px;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  text-align: center;
  color: var(--rg-color-text-secondary);
}

/* ============ Card base ============ */
.cx-val__card {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
  width: min(560px, 100%);
  margin-top: var(--rg-space-10);
  padding: var(--rg-space-8);
  border-radius: var(--rg-radius-3xl);
  border: 1px solid var(--rg-primitive-brand-100);
  background-color: var(--rg-color-surface-base);
  box-shadow: var(--rg-elevation-3);
}

.cx-val__card--center {
  align-items: center;
  margin-top: var(--rg-space-7);
}

.cx-val__card--result {
  align-items: center;
  width: min(640px, 100%);
  margin-top: var(--rg-space-7);
  gap: 0;
}

.cx-val__label {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.cx-val__input {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  height: 56px;
  padding-inline: var(--rg-space-4);
  border: 1.5px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-xl);
  color: var(--rg-color-text-tertiary);
  transition: border-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.cx-val__input:focus-within {
  border-color: var(--rg-primitive-brand-500);
}

.cx-val__input input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: var(--rg-font-size-md);
  letter-spacing: 0.04em;
  color: var(--rg-color-text-primary);
  font-variant-numeric: tabular-nums;
}

.cx-val__input input::placeholder {
  color: var(--rg-color-text-tertiary);
  letter-spacing: 0.02em;
}

.cx-val__hint {
  margin: 0;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-primitive-red-600);
}

.cx-val__trust {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin: var(--rg-space-5) 0 0;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
}

.cx-val__trust .v-icon {
  color: var(--rg-primitive-brand-500);
}

.cx-val__back {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin-top: var(--rg-space-4);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-primitive-brand-700);
  text-decoration: none;
}

.cx-val__back:hover {
  text-decoration: underline;
}

/* ============ Loading ============ */
.cx-val__ring {
  position: relative;
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-50);
  border: 1.5px solid var(--rg-primitive-brand-100);
  color: var(--rg-primitive-brand-600);
}

.cx-val__ring-arc {
  position: absolute;
  inset: -7px;
  border-radius: var(--rg-radius-pill);
  border: 3px solid transparent;
  border-top-color: var(--rg-primitive-brand-600);
  animation: cx-spin 1.1s linear infinite;
}

@keyframes cx-spin {
  to { transform: rotate(360deg); }
}

.cx-val__loading-title {
  margin: var(--rg-space-4) 0 0;
  font-size: var(--rg-font-size-xl);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
}

.cx-val__loading-sub {
  margin: var(--rg-space-2) 0 0;
  font-size: var(--rg-font-size-sm);
  text-align: center;
  color: var(--rg-color-text-secondary);
}

.cx-num {
  font-variant-numeric: tabular-nums;
}

/* ============ Resultado ============ */
.cx-val__selo {
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  border-radius: var(--rg-radius-pill);
  animation: cx-selo-pop 0.5s var(--rg-motion-ease-emphasized);
}

.cx-val__selo > span {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: var(--rg-radius-pill);
  color: var(--rg-primitive-neutral-0);
}

.cx-val__selo.is-ok {
  background-color: var(--rg-primitive-brand-50);
}

.cx-val__selo.is-ok > span {
  background-color: var(--rg-primitive-brand-600);
}

.cx-val__selo.is-nf {
  background-color: var(--rg-primitive-neutral-100);
}

.cx-val__selo.is-nf > span {
  background-color: var(--rg-primitive-neutral-200);
  color: var(--rg-primitive-neutral-500);
}

@keyframes cx-selo-pop {
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); }
}

/* Entrada em cascata dos blocos do card (--d = delay por bloco) */
.cx-in {
  animation: cx-fade-up 0.45s var(--rg-motion-ease-emphasized) backwards;
  animation-delay: var(--d, 0ms);
}

@keyframes cx-fade-up {
  from { opacity: 0; transform: translateY(10px); }
}

.cx-val__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin-top: var(--rg-space-5);
  padding: var(--rg-space-2) var(--rg-space-3);
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
}

.cx-val__badge.is-ok {
  border: 1px solid var(--rg-primitive-brand-100);
  background-color: var(--rg-primitive-brand-50);
  color: var(--rg-primitive-brand-700);
}

.cx-val__badge.is-nf {
  border: 1px solid var(--rg-primitive-neutral-200);
  background-color: var(--rg-primitive-neutral-100);
  color: var(--rg-primitive-neutral-500);
}

.cx-val__result-title {
  margin: var(--rg-space-4) 0 0;
  font-size: var(--rg-font-size-3xl);
  line-height: var(--rg-line-height-tight);
  font-weight: var(--rg-font-weight-bold);
  text-align: center;
  color: var(--rg-color-text-primary);
}

.cx-val__result-sub {
  margin: var(--rg-space-4) 0 0;
  max-width: 520px;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  text-align: center;
  color: var(--rg-color-text-secondary);
}

/* Bloco de dados do documento */
.cx-val__doc {
  width: 100%;
  margin-top: var(--rg-space-6);
  padding: var(--rg-space-5);
  border-radius: var(--rg-radius-2xl);
  background-color: var(--rg-color-surface-soft-tint);
}

.cx-val__doc header {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.cx-val__doc header .v-icon {
  color: var(--rg-primitive-brand-700);
}

.cx-val__doc dl {
  margin: var(--rg-space-4) 0 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.cx-val__doc dl > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--rg-space-4);
}

.cx-val__doc dt {
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
  white-space: nowrap;
}

.cx-val__doc dd {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  text-align: right;
  color: var(--rg-color-text-primary);
}

.cx-val__situacao {
  padding: 2px var(--rg-space-2);
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
}

.cx-val__situacao.is-ok {
  background-color: var(--rg-primitive-brand-50);
  color: var(--rg-primitive-brand-700);
}

.cx-val__situacao.is-pend {
  background-color: #fbf4e6;
  color: #b8791b;
}

.cx-val__reasons {
  list-style: disc;
  margin: var(--rg-space-4) 0 0;
  padding-left: var(--rg-space-5);
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.cx-val__note {
  margin: var(--rg-space-5) 0 0;
  max-width: 520px;
  font-size: var(--rg-font-size-2xs);
  line-height: var(--rg-line-height-relaxed);
  text-align: center;
  color: var(--rg-color-text-secondary);
}

.cx-val__ctas {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  width: 100%;
  margin-top: var(--rg-space-6);
}

.cx-val__cta-main {
  flex: 1;
}

@media (max-width: 640px) {
  .cx-val__card {
    padding: var(--rg-space-5);
  }
  .cx-val__doc dl > div {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  .cx-val__doc dd {
    text-align: left;
  }
  .cx-val__ctas {
    flex-direction: column;
    align-items: stretch;
  }
  /* Em coluna, flex: 1 age na VERTICAL e esmaga a altura do botão. */
  .cx-val__cta-main {
    flex: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cx-val__dot,
  .cx-val__ring-arc,
  .cx-val__selo,
  .cx-in {
    animation: none !important;
  }
  .cx-swap-enter-active,
  .cx-swap-leave-active {
    transition: none !important;
  }
}
</style>
