<script setup lang="ts">
/**
 * Seção "Validação de Documento" — o ponto de acesso da landing para /validar.
 *
 * Vem do Figma, página " - Home", seção "EM ESTUDO · Seção de Validação de
 * Documento", variante V1 (documento à direita). Aprovada em 31/08/2026.
 *
 * Por que ela é uma seção própria, e não um link dentro do banner de consulta:
 * consultar regularidade e validar documento são tarefas de gente diferente.
 * Quem consulta tem uma pergunta e não tem a resposta; quem valida já tem a
 * resposta na mão e só quer saber se o papel é falso. As duas coisas têm
 * rotas separadas (/consulta e /validar) e aqui têm portas separadas.
 *
 * A prévia do documento à direita responde ONDE fica o código, e por isso
 * mostra o código MASCARADO: o formato real é decisão do sistema, e um código
 * literal numa ilustração faria todo visitante que o digitasse receber
 * "documento autêntico" — a primeira experiência de uma ferramenta antifraude
 * seria um passe garantido.
 *
 * A11y: "Como funciona a validação" abre na mesma página, então é
 * <button aria-expanded>, nunca <a href> (ARIA APG, Disclosure). Os passos
 * são <ol><li> de verdade. Reveal-on-scroll respeita prefers-reduced-motion.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue';
import RgButton from '@/components/RgButton.vue';
import RgExpandTransition from '@/components/RgExpandTransition.vue';

/** Os três passos do disclosure. Ordem importa: é uma sequência. */
const passos = [
  {
    titulo: 'Pegue o documento.',
    texto: 'O código de autenticação e o QR Code ficam no rodapé da certidão.',
  },
  {
    titulo: 'Informe o código ou aponte a câmera.',
    texto: 'Os dois caminhos levam à mesma conferência.',
  },
  {
    titulo: 'Veja o resultado.',
    texto: 'O sistema diz se o documento foi mesmo emitido pelo Recicla Goiás.',
  },
];

const comoFuncionaAberto = ref(false);

// ============ Entrada (reveal-on-scroll, mesmo padrão das outras seções) ============
const sectionRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    isVisible.value = true;
    return;
  }
  if (!sectionRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        isVisible.value = true;
        observer?.disconnect();
      }
    },
    { threshold: 0.2 },
  );
  observer.observe(sectionRef.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <section
    id="validacao"
    ref="sectionRef"
    :class="['rg-valid', { 'is-visible': isVisible }]"
    aria-labelledby="rg-valid-title"
  >
    <div class="rg-valid__inner">
      <!-- Coluna de texto + ações -->
      <div class="rg-valid__copy">
        <span class="rg-valid__eyebrow">AUTENTICIDADE DE DOCUMENTO</span>

        <h2 id="rg-valid-title" class="rg-valid__title">
          Recebeu um documento do Recicla Goiás?
        </h2>

        <p class="rg-valid__lead">
          Toda certidão emitida pelo sistema traz um código de autenticação e um QR Code.
          Confira em segundos se o documento é verdadeiro.
        </p>

        <div class="rg-valid__actions">
          <RgButton variant="primary" size="lg" icon="mdi-shield-check-outline" to="/validar">
            Validar documento
          </RgButton>

          <!-- Disclosure: a explicação abre AQUI, então é button, não link. -->
          <button
            type="button"
            class="rg-valid__disclosure"
            :aria-expanded="comoFuncionaAberto"
            aria-controls="rg-valid-como"
            @click="comoFuncionaAberto = !comoFuncionaAberto"
          >
            Como funciona a validação
            <v-icon
              :class="['rg-valid__chevron', { 'is-open': comoFuncionaAberto }]"
              icon="mdi-chevron-down"
              size="20"
              aria-hidden="true"
            />
          </button>
        </div>

        <RgExpandTransition>
          <div v-if="comoFuncionaAberto" id="rg-valid-como" class="rg-valid__panel">
            <ol class="rg-valid__steps">
              <li v-for="(passo, i) in passos" :key="passo.titulo" class="rg-valid__step">
                <span class="rg-valid__step-num" aria-hidden="true">{{ i + 1 }}</span>
                <span class="rg-valid__step-text">
                  <strong>{{ passo.titulo }}</strong>
                  <span>{{ passo.texto }}</span>
                </span>
              </li>
            </ol>
          </div>
        </RgExpandTransition>
      </div>

      <!-- Prévia do documento: responde ONDE fica o código, sem afirmar
           qual é o formato dele. -->
      <div class="rg-valid__preview">
        <div class="rg-valid__doc-head">
          <span class="rg-valid__doc-icon" aria-hidden="true">
            <v-icon icon="mdi-file-document-outline" size="22" />
          </span>
          <span class="rg-valid__doc-id">
            <small>CERTIDÃO DE REGULARIDADE</small>
            <strong>EMBALAGENS GOIÁS INDÚSTRIA E COMÉRCIO LTDA</strong>
          </span>
        </div>

        <hr class="rg-valid__rule" />

        <div class="rg-valid__doc-auth">
          <span class="rg-valid__doc-code">
            <small>CÓDIGO DE AUTENTICAÇÃO</small>
            <strong aria-label="Código de autenticação do documento">•••• •••• •••• ••••</strong>
            <span>impresso no rodapé do documento</span>
          </span>
          <span class="rg-valid__doc-qr" aria-hidden="true">
            <v-icon icon="mdi-qrcode-scan" size="60" />
          </span>
        </div>

        <p class="rg-valid__doc-chip">
          <v-icon icon="mdi-check-circle-outline" size="15" aria-hidden="true" />
          Documento autêntico
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rg-valid {
  position: relative;
  /* Mesmo respiro vertical do Enquadramento — as duas são seções brancas. */
  padding: var(--rg-space-24) var(--rg-space-6);
  background-color: var(--rg-color-surface-base);
}

.rg-valid__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  /* Topo, não centro: com o disclosure fechado as duas colunas têm quase a
     mesma altura e a diferença é imperceptível, mas centralizado a prévia
     DESCE quando o painel abre — a peça pula debaixo do cursor de quem
     acabou de clicar. */
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rg-space-16);
}

/* Entrada em cascata, como nas outras seções da landing. */
.rg-valid__copy,
.rg-valid__preview {
  opacity: 0;
  transform: translateY(22px);
  transition:
    opacity 600ms var(--rg-motion-ease-standard),
    transform 600ms var(--rg-motion-ease-standard);
  transition-delay: var(--d, 0ms);
}
.rg-valid__copy { --d: 60ms; }
.rg-valid__preview { --d: 180ms; }

.rg-valid.is-visible .rg-valid__copy,
.rg-valid.is-visible .rg-valid__preview {
  opacity: 1;
  transform: translateY(0);
}

/* ============ Coluna de texto ============ */
.rg-valid__copy {
  min-width: 0;
}

.rg-valid__eyebrow {
  display: block;
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  color: var(--rg-color-text-brand);
}

.rg-valid__title {
  margin: var(--rg-space-3) 0 0;
  /* 560px é a medida do frame: fecha o título em duas linhas em 1440. */
  max-width: 560px;
  font-size: clamp(28px, 3.2vw, 40px);
  line-height: 1.15;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

.rg-valid__lead {
  margin: var(--rg-space-4) 0 0;
  max-width: 46ch;
  font-size: var(--rg-font-size-lg);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.rg-valid__actions {
  margin-top: var(--rg-space-8);
  display: flex;
  align-items: center;
  gap: var(--rg-space-5);
  flex-wrap: wrap;
}

.rg-valid__disclosure {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-1);
  background: none;
  border: none;
  border-radius: var(--rg-radius-md);
  font-family: var(--rg-font-family-sans);
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-primitive-brand-700);
  cursor: pointer;
  transition: color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}
.rg-valid__disclosure:hover {
  color: var(--rg-primitive-brand-800);
}

.rg-valid__chevron {
  transition: transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}
.rg-valid__chevron.is-open {
  transform: rotate(180deg);
}

/* ============ Painel "Como funciona" ============ */
.rg-valid__panel {
  margin-top: var(--rg-space-5);
  max-width: 560px;
  padding: var(--rg-space-6);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-xl);
  background-color: var(--rg-color-surface-muted);
}

.rg-valid__steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
}

.rg-valid__step {
  display: flex;
  align-items: flex-start;
  gap: var(--rg-space-3);
}

.rg-valid__step-num {
  flex: none;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  /* Centra na primeira linha do título do passo (15px × lh 1.4 = 21px). */
  margin-top: 1px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-50);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-primitive-brand-700);
}

.rg-valid__step-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  font-size: var(--rg-font-size-sm);
  line-height: 1.45;
}
.rg-valid__step-text strong {
  font-size: 15px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}
.rg-valid__step-text span {
  color: var(--rg-color-text-secondary);
}

/* ============ Prévia do documento ============ */
.rg-valid__preview {
  flex: none;
  width: 480px;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
  padding: var(--rg-space-7);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-2xl);
  background-color: var(--rg-color-surface-raised);
  box-shadow: var(--rg-elevation-2);
}

.rg-valid__doc-head {
  display: flex;
  align-items: center;
  gap: var(--rg-space-4);
}

.rg-valid__doc-icon {
  flex: none;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-primitive-brand-50);
  color: var(--rg-color-text-brand);
}

.rg-valid__doc-id {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.rg-valid__doc-id small {
  font-size: 10px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  color: var(--rg-color-text-muted);
}
.rg-valid__doc-id strong {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 1.35;
  color: var(--rg-color-text-primary);
}

.rg-valid__rule {
  margin: 0;
  border: none;
  border-top: 1px solid var(--rg-color-border-subtle);
}

.rg-valid__doc-auth {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-5);
}

.rg-valid__doc-code {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
  min-width: 0;
}
.rg-valid__doc-code small {
  font-size: 10px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  color: var(--rg-color-text-muted);
}
/* Máscara, não código: o formato real é decisão do sistema. */
.rg-valid__doc-code strong {
  font-size: 19px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: 1px;
  line-height: 1.35;
  color: var(--rg-color-text-primary);
}
.rg-valid__doc-code > span {
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-muted);
}

.rg-valid__doc-qr {
  flex: none;
  display: grid;
  place-items: center;
  width: 92px;
  height: 92px;
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-muted);
  color: var(--rg-color-text-primary);
}

.rg-valid__doc-chip {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin: 0;
  padding: 7px var(--rg-space-3);
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-50);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-primitive-brand-700);
}

/* ============ Responsivo ============ */
/* A prévia fixa em 480px + a coluna de texto deixam de caber confortavelmente
   por volta de 960px: abaixo disso a seção empilha. */
@media (max-width: 960px) {
  .rg-valid__inner {
    flex-direction: column;
    align-items: stretch;
    gap: var(--rg-space-10);
  }

  .rg-valid__title {
    max-width: none;
  }

  .rg-valid__preview {
    width: 100%;
  }

  .rg-valid__panel {
    max-width: none;
  }
}

@media (max-width: 560px) {
  .rg-valid {
    padding: var(--rg-space-14) var(--rg-space-5);
  }

  .rg-valid__actions {
    align-items: stretch;
    flex-direction: column;
    gap: var(--rg-space-4);
  }
  /* No celular o botão ocupa a linha e o disclosure fica alinhado à esquerda,
     embaixo — não lado a lado, que apertaria os dois. */
  .rg-valid__actions :deep(.rg-button) {
    width: 100%;
  }
  .rg-valid__disclosure {
    align-self: flex-start;
  }

  .rg-valid__preview {
    padding: var(--rg-space-6);
  }

  .rg-valid__doc-auth {
    align-items: flex-start;
  }

  .rg-valid__doc-qr {
    width: 76px;
    height: 76px;
  }
  .rg-valid__doc-qr :deep(.v-icon) {
    font-size: 48px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rg-valid__copy,
  .rg-valid__preview,
  .rg-valid__chevron {
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
  .rg-valid__chevron.is-open {
    transform: rotate(180deg) !important;
  }
}
</style>
