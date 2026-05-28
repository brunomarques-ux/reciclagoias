<script setup lang="ts">
/**
 * Sistema Recicla Goiás — scrolling story showcase.
 *
 * Adaptação do componente React "ScrollingFeatureShowcase" pra Vue +
 * identidade Recicla Goiás. Em vez de scroll interno (overflow-y) usado no
 * original, aproveitamos o scroll da página principal: a section ocupa
 * N × 100vh de altura total e tem um sticky panel ocupando exatamente 100vh.
 *
 * Conforme o usuário scrolla, o slide ativo muda baseado em quanto da section
 * já saiu do topo do viewport (rect.top negativo). O feature da esquerda
 * troca via opacity + translateY; a imagem da direita translada -Y dentro
 * de um stack vertical de altura 400% (4 slides empilhados).
 *
 * Header da seção (eyebrow + título + lede) fica fixo durante todo o scroll,
 * porque vive dentro do sticky panel — visível em todos os slides.
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { systemFeatures, systemDescription } from '@/data/mocks/landing';

const sectionRef = ref<HTMLElement | null>(null);
const rightColumnRef = ref<HTMLElement | null>(null);
/**
 * `globalProgress` é a posição contínua no scroll da section, em "unidades
 * de slide" (0 a features.length). Permite que a imagem da direita translade
 * suavemente e a pagination bar ativa cresça gradualmente — dando feedback
 * visual ENTRE as trocas discretas.
 */
const globalProgress = ref(0);
/** Posição do mouse dentro da coluna direita (em px relativos à coluna).
 *  Usados pela máscara radial dos dots-hover pra criar o efeito de "lanterna"
 *  que só ilumina os dots ao redor do cursor — igual ao RgHeroHighlight. */
const mouseX = ref(0);
const mouseY = ref(0);
let rafId: number | null = null;

// Imagens fotográficas reais (uma por feature) + 1 splash final que aparece
// depois do último slide quando o usuário continua rolando — substitui o
// "espaço branco" que aparecia antes embaixo do último slide.
const slideImages = [
  '/sistema/slide-1-cadastro.png',
  '/sistema/slide-2-metas.png',
  '/sistema/slide-3-validacao.png',
  '/sistema/slide-4-fiscalizacao.png',
];
const splashImage = '/sistema/end-splash.png';

const features = computed(() =>
  systemFeatures.map((f, i) => ({
    ...f,
    image: slideImages[i],
  })),
);

/**
 * Total de imagens no stack (features + 1 splash). Como cada imagem ocupa
 * 100% da altura do frame, o stack inteiro tem `STACK_LENGTH × 100%` de
 * altura, e translateY(-globalProgress × 100%) revela a imagem certa.
 */
const stackLength = computed(() => features.value.length + 1);

// ============ Derivados do progresso contínuo ============
/** Índice do feature dominante na coluna esquerda (clamped em 0..N-1).
 *  Não vai pra N mesmo quando o stack avança pra o splash — a lista lateral
 *  fica "presa" no último feature enquanto a imagem transita pro splash. */
const activeIndex = computed(() => {
  const n = features.value.length;
  return Math.min(n - 1, Math.max(0, Math.floor(globalProgress.value)));
});
/** Quanto do slide atual já foi rolado (0..1). Clampado em 1 mesmo quando o
 *  scroll avança pra a faixa do splash. */
const localProgress = computed(() =>
  Math.min(1, Math.max(0, globalProgress.value - activeIndex.value)),
);

// ============ Scroll → progresso global ============
function updateActiveSlide() {
  rafId = null;
  const section = sectionRef.value;
  if (!section) return;
  const rect = section.getBoundingClientRect();
  const sectionHeight = section.offsetHeight;
  const viewportHeight = window.innerHeight;
  // Quanto a section já subiu acima do topo do viewport.
  const scrolledIntoSection = -rect.top;
  // Altura efetivamente rolável (a section toda menos o que cabe na tela).
  const totalScrollable = Math.max(1, sectionHeight - viewportHeight);
  const progress01 = Math.max(0, Math.min(1, scrolledIntoSection / totalScrollable));
  // Range: 0..stackLength-1 (= 0..4 com 5 imagens). globalProgress = 4 mostra
  // o splash 100% revelado.
  const maxProgress = stackLength.value - 1;
  globalProgress.value = progress01 * maxProgress;
}

function onScroll() {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(updateActiveSlide);
}

/** Atualiza --mx/--my que alimentam a máscara radial dos dots-hover. */
function onRightMouseMove(ev: MouseEvent) {
  const el = rightColumnRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  mouseX.value = ev.clientX - rect.left;
  mouseY.value = ev.clientY - rect.top;
}

// Click na pagination → scrollTo no offset do slide correspondente.
// O stack tem `stackLength` posições mas só queremos navegar entre as
// `features.length` posições "úteis" (cada feature começa em uma fração
// `i / (stackLength - 1)` do scroll total).
function goToSlide(i: number) {
  const section = sectionRef.value;
  if (!section) return;
  const rect = section.getBoundingClientRect();
  const sectionAbsoluteTop = rect.top + window.scrollY;
  const sectionHeight = section.offsetHeight;
  const viewportHeight = window.innerHeight;
  const totalScrollable = Math.max(1, sectionHeight - viewportHeight);
  const fraction = i / (stackLength.value - 1);
  // +1px pra garantir que o `floor()` no progress aterrissa no índice certo
  window.scrollTo({
    top: sectionAbsoluteTop + totalScrollable * fraction + 1,
    behavior: 'smooth',
  });
}

onMounted(() => {
  updateActiveSlide();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateActiveSlide, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', updateActiveSlide);
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <section
    id="sistema"
    ref="sectionRef"
    class="rg-sysscroll"
    aria-labelledby="rg-sysscroll-title"
    :style="{ '--rg-sys-stack': stackLength } as Record<string, string | number>"
  >
    <!-- Sticky panel: ocupa exatamente 1 viewport e fica preso enquanto o
         usuário rola a section inteira (que tem altura N * 100vh). -->
    <div class="rg-sysscroll__sticky">
      <div class="rg-sysscroll__grid">
        <!-- Coluna esquerda: header da seção + pagination + feature ativo -->
        <div class="rg-sysscroll__left">
          <header class="rg-sysscroll__heading">
            <span class="rg-sysscroll__eyebrow">SISTEMA RECICLA GOIÁS</span>
            <h2 id="rg-sysscroll-title" class="rg-sysscroll__title">
              Uma plataforma única para toda a
              <span class="rg-sysscroll__title-accent">cadeia da logística reversa.</span>
            </h2>
            <p class="rg-sysscroll__lede">{{ systemDescription[0] }}</p>
          </header>

          <!-- Pagination bars (ativa = mais larga e escura) -->
          <div
            class="rg-sysscroll__pagination"
            role="tablist"
            aria-label="Navegação entre funcionalidades do sistema"
          >
            <button
              v-for="(f, i) in features"
              :key="f.title"
              type="button"
              role="tab"
              :aria-selected="i === activeIndex"
              :aria-label="`Ir para ${f.title}`"
              :class="['rg-sysscroll__page-bar', { 'is-active': i === activeIndex }]"
              :style="i === activeIndex
                ? { '--rg-bar-progress': localProgress } as Record<string, string | number>
                : undefined"
              @click="goToSlide(i)"
            />
          </div>

          <!-- Stack do feature ativo: todos empilhados em absolute, opacity
               + translateY transitam entre eles. O ativo ainda recebe um
               translateY contínuo baseado em localProgress, criando feedback
               visual durante o scroll interno do slide (sai lentamente pra
               cima e desfoca conforme o próximo se aproxima). -->
          <div class="rg-sysscroll__feature-stack">
            <div
              v-for="(f, i) in features"
              :key="f.title"
              :class="['rg-sysscroll__feature', { 'is-active': i === activeIndex }]"
              :aria-hidden="i !== activeIndex"
              :style="i === activeIndex
                ? { '--rg-feature-local': localProgress } as Record<string, string | number>
                : undefined"
            >
              <span class="rg-sysscroll__feature-icon" aria-hidden="true">
                <v-icon :icon="f.icon" size="28" />
              </span>
              <h3 class="rg-sysscroll__feature-title">{{ f.title }}</h3>
              <p class="rg-sysscroll__feature-desc">{{ f.description }}</p>
            </div>
          </div>
        </div>

        <!-- Coluna direita: stack de imagens transladado verticalmente.
             Background com dot pattern verde claro (intensifica no hover).
             Stack tem 5 itens (4 features + 1 splash) — quando o usuário
             rola além do último feature, o splash sobe revelando a marca. -->
        <div
          ref="rightColumnRef"
          class="rg-sysscroll__right"
          aria-hidden="true"
          @mousemove="onRightMouseMove"
        >
          <!-- Camadas de dot pattern: base sempre visível com opacity baixa +
               overlay com mask radial que segue o cursor, criando uma
               "lanterna" que só ilumina os dots ao redor do mouse (mesma
               mecânica do RgHeroHighlight no pós-vídeo do Hero). -->
          <div class="rg-sysscroll__dots rg-sysscroll__dots--base" aria-hidden="true" />
          <div
            class="rg-sysscroll__dots rg-sysscroll__dots--hover"
            aria-hidden="true"
            :style="{
              '--mx': mouseX + 'px',
              '--my': mouseY + 'px',
            } as Record<string, string>"
          />

          <div class="rg-sysscroll__image-frame">
            <div
              class="rg-sysscroll__image-stack"
              :style="{ transform: `translateY(-${globalProgress * 100}%)` }"
            >
              <div
                v-for="f in features"
                :key="f.title"
                class="rg-sysscroll__image-slide"
              >
                <img
                  :src="f.image"
                  :alt="f.title"
                  class="rg-sysscroll__image-img"
                  loading="lazy"
                />
              </div>

              <!-- Splash final: marca Recicla Goiás. Aparece quando o usuário
                   rola além do último feature, como "fechamento" da seção. -->
              <div class="rg-sysscroll__image-slide rg-sysscroll__image-slide--splash">
                <img
                  :src="splashImage"
                  alt="Recicla Goiás"
                  class="rg-sysscroll__image-img"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ============ Section: altura total = STACK_LENGTH viewports ============ */
.rg-sysscroll {
  position: relative;
  /* A section ocupa stackLength × 100vh (= 5 com 4 features + 1 splash).
     Cada "fatia" do stack consome 1 viewport de scroll antes do próximo
     entrar. O extra 100vh no final permite que o splash apareça com a
     mesma mecânica de scroll dos outros slides. */
  height: calc(var(--rg-sys-stack, 5) * 100vh);
  background-color: var(--rg-color-surface-base);
}

/* Sticky panel que fica preso enquanto a section toda rola pelo viewport. */
.rg-sysscroll__sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rg-sysscroll__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  height: 100%;
  width: 100%;
  max-width: var(--rg-container-page);
  margin-inline: auto;
}

/* ============ Coluna esquerda ============ */
.rg-sysscroll__left {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--rg-space-6);
  padding: var(--rg-space-10) var(--rg-space-10);
  border-right: 1px solid var(--rg-color-border-subtle);
}

.rg-sysscroll__heading {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.rg-sysscroll__eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-brand);
}

.rg-sysscroll__title {
  margin: 0;
  /* Mais compacto que as outras seções porque divide a coluna esquerda com
     o feature ativo que aparece abaixo (precisa caber tudo na viewport). */
  font-size: clamp(36px, 3.4vw, 44px);
  line-height: 1.1;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
  max-width: 18ch;
}

/* Trecho "cadeia da logística reversa." em verde brand-500 — mesmo padrão
   das outras seções (ponta a ponta, 8 instituições, começar, etc.). */
.rg-sysscroll__title-accent {
  color: var(--rg-primitive-brand-500);
}

.rg-sysscroll__lede {
  margin: 0;
  max-width: 50ch;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

/* ============ Pagination bars ============ */
.rg-sysscroll__pagination {
  display: flex;
  gap: var(--rg-space-2);
}

.rg-sysscroll__page-bar {
  height: 4px;
  width: 24px;
  border: none;
  padding: 0;
  background-color: rgba(15, 23, 42, 0.15);
  border-radius: var(--rg-radius-pill);
  cursor: pointer;
  transition:
    width var(--rg-motion-duration-slow) var(--rg-motion-ease-emphasized),
    background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-sysscroll__page-bar:hover {
  background-color: rgba(15, 23, 42, 0.32);
}

.rg-sysscroll__page-bar.is-active {
  width: 48px;
  /* Background: track cinza claro + fill verde brand-500 que cresce de 0% a
     100% conforme o usuário rola DENTRO do slide. Dá feedback contínuo
     enquanto o slide ainda está "ativo" mas o usuário já está navegando. */
  background-color: rgba(15, 23, 42, 0.15);
  background-image: linear-gradient(
    to right,
    var(--rg-primitive-brand-500) 0%,
    var(--rg-primitive-brand-500) calc(var(--rg-bar-progress, 0) * 100%),
    transparent calc(var(--rg-bar-progress, 0) * 100%)
  );
  background-repeat: no-repeat;
}

.rg-sysscroll__page-bar:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 4px;
}

/* ============ Stack de features ============ */
.rg-sysscroll__feature-stack {
  position: relative;
  /* Altura fixa porque os items são absolute dentro. Ajusta pra evitar saltos. */
  min-height: 200px;
  max-width: 480px;
}

.rg-sysscroll__feature {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 600ms cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1);
  pointer-events: none;
}

.rg-sysscroll__feature.is-active {
  /* Opacity desce levemente quando localProgress > 0.75, dando preview
     visual de que o próximo slide está chegando. */
  opacity: calc(1 - max(0, var(--rg-feature-local, 0) - 0.75) * 4);
  /* TranslateY contínuo de 0 a -16px conforme o usuário rola DENTRO do slide.
     Cria sensação de "saindo pra cima" enquanto o stack da direita translada. */
  transform: translateY(calc(var(--rg-feature-local, 0) * -16px));
  pointer-events: auto;
}

.rg-sysscroll__feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-primitive-brand-50);
  border: 1px solid var(--rg-primitive-brand-200);
  color: var(--rg-primitive-brand-600);
}

.rg-sysscroll__feature-title {
  margin: 0;
  font-size: var(--rg-font-size-2xl);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-primitive-brand-900);
  letter-spacing: var(--rg-letter-spacing-tight);
  line-height: var(--rg-line-height-snug);
}

.rg-sysscroll__feature-desc {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

/* ============ Coluna direita: stack de imagens ============ */
.rg-sysscroll__right {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--rg-space-12);
}

/* Dot pattern — duas camadas DIV (em vez de pseudo-elements, que tinham
   problemas de renderização no Chrome com radial-gradient + background-size
   no mesmo contexto flex). Mesma estética do RgHeroHighlight (pós-vídeo). */
.rg-sysscroll__dots {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-size: 24px 24px;
  background-repeat: repeat;
  z-index: 0;
}

.rg-sysscroll__dots--base {
  background-image: radial-gradient(
    circle at center,
    var(--rg-primitive-brand-300) 12%,
    transparent 16%
  );
  /* Opacity baixa pra ficar bem discreto — quase imperceptível, só dá textura
     ao fundo. A lanterna do hover é que cria o destaque visual. */
  opacity: 0.22;
}

/* Layer hover — pattern em brand-400 (um tom acima da base, sutil) mascarado
   por um radial-gradient ao redor do cursor. A máscara cria a "lanterna":
   só os dots dentro do raio de 220px ficam visíveis, fade até transparent
   na borda. Mesma mecânica do RgHeroHighlight no pós-vídeo do Hero. */
.rg-sysscroll__dots--hover {
  background-image: radial-gradient(
    circle at center,
    var(--rg-primitive-brand-400) 12%,
    transparent 16%
  );
  opacity: 0;
  transition: opacity 280ms ease;
  -webkit-mask-image: radial-gradient(
    220px circle at var(--mx, 50%) var(--my, 50%),
    black 0%,
    transparent 100%
  );
  mask-image: radial-gradient(
    220px circle at var(--mx, 50%) var(--my, 50%),
    black 0%,
    transparent 100%
  );
}

.rg-sysscroll__right:hover .rg-sysscroll__dots--hover {
  opacity: 0.65;
}

.rg-sysscroll__image-frame {
  position: relative;
  /* z-index > 0 pra ficar acima dos dot pattern layers (::before/::after). */
  z-index: 1;
  width: min(60%, 380px);
  height: min(72vh, 620px);
  border-radius: var(--rg-radius-2xl);
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 24px 48px rgba(15, 23, 42, 0.12);
  border: 4px solid rgba(15, 23, 42, 0.04);
}

.rg-sysscroll__image-stack {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  /* Sem transition: o transform é atualizado continuamente pelo JS via
     rAF conforme o scroll, e uma transition aqui causaria delay/lag visual.
     A "suavidade" vem do rAF + scroll inertial do próprio browser. */
  will-change: transform;
}

/* Cada slide ocupa 100% do frame, empilhados verticalmente.
   O stack tem altura total = stackLength × 100%, e transladamos
   -globalProgress × 100% pra revelar a imagem certa. */
.rg-sysscroll__image-slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.rg-sysscroll__image-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Splash final: imagem da marca em fundo claro — usa contain pra preservar
   composição do logo sem cortar bordas. */
.rg-sysscroll__image-slide--splash {
  background-color: var(--rg-color-surface-base);
}

.rg-sysscroll__image-slide--splash .rg-sysscroll__image-img {
  object-fit: contain;
  padding: var(--rg-space-4);
}

/* ============ Responsivo ============ */
@media (max-width: 960px) {
  .rg-sysscroll {
    /* No mobile reduzimos pra 1 viewport por slide ainda — mas testa antes
       se a UX faz sentido em scroll-touch. */
    height: calc(var(--rg-sys-total, 4) * 100vh);
  }
  .rg-sysscroll__grid {
    grid-template-columns: 1fr;
  }
  .rg-sysscroll__left {
    padding: var(--rg-space-10) var(--rg-space-6);
    border-right: none;
    border-bottom: 1px solid var(--rg-color-border-subtle);
  }
  .rg-sysscroll__title {
    font-size: clamp(32px, 6vw, 44px);
  }
  .rg-sysscroll__right {
    padding: var(--rg-space-6);
    /* Em mobile a coluna da imagem some pra reduzir a complexidade visual. */
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rg-sysscroll__feature,
  .rg-sysscroll__image-stack,
  .rg-sysscroll__page-bar {
    transition: none !important;
  }
}
</style>
