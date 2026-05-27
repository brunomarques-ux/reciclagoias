<script setup lang="ts">
/**
 * Hero com expansão progressiva ao scroll.
 *
 * Port em Vue 3 do componente "scroll-expansion-hero" (21st.dev/React)
 * adaptado para a identidade do Recicla Goiás. Usa motion-v (port do
 * Motion/Framer para Vue) para as transições.
 *
 * Comportamento:
 * - enquanto não totalmente expandido, o scroll vertical fica preso
 *   no hero e cada delta de wheel/touch avança a expansão da mídia;
 * - quando atinge 100%, o scroll do documento é liberado normalmente
 *   e o conteúdo subsequente da página aparece;
 * - respeita prefers-reduced-motion (Motion já cuida disso) e mobile.
 */
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { Motion } from 'motion-v';

interface Props {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  bgImageSrcWebp?: string;
  title?: string;
  eyebrow?: string;
  scrollHint?: string;
  textBlend?: boolean;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

const props = withDefaults(defineProps<Props>(), {
  mediaType: 'video',
  textBlend: true,
});

const scrollProgress = ref(0);
const showContent = ref(false);
const mediaFullyExpanded = ref(false);
const touchStartY = ref(0);
const isMobile = ref(false);

const sectionRef = ref<HTMLElement | null>(null);

const mediaWidth = computed(
  () => 300 + scrollProgress.value * (isMobile.value ? 650 : 1250),
);
const mediaHeight = computed(
  () => 400 + scrollProgress.value * (isMobile.value ? 200 : 400),
);
const textTranslateX = computed(
  () => scrollProgress.value * (isMobile.value ? 180 : 150),
);

const firstWord = computed(() => props.title?.split(' ')[0] ?? '');
const restOfTitle = computed(() =>
  props.title?.split(' ').slice(1).join(' ') ?? '',
);

const isYoutube = computed(() => props.mediaSrc.includes('youtube.com'));

function setProgress(newProgress: number) {
  const clamped = Math.min(Math.max(newProgress, 0), 1);
  scrollProgress.value = clamped;
  if (clamped >= 1) {
    mediaFullyExpanded.value = true;
    showContent.value = true;
  } else if (clamped < 0.75) {
    showContent.value = false;
  }
}

function onWheel(e: WheelEvent) {
  if (mediaFullyExpanded.value && e.deltaY < 0 && window.scrollY <= 5) {
    mediaFullyExpanded.value = false;
    e.preventDefault();
    return;
  }
  if (!mediaFullyExpanded.value) {
    e.preventDefault();
    setProgress(scrollProgress.value + e.deltaY * 0.0009);
  }
}

function onTouchStart(e: TouchEvent) {
  const t = e.touches[0];
  if (t) touchStartY.value = t.clientY;
}

function onTouchMove(e: TouchEvent) {
  const t = e.touches[0];
  if (!touchStartY.value || !t) return;
  const touchY = t.clientY;
  const deltaY = touchStartY.value - touchY;

  if (mediaFullyExpanded.value && deltaY < -20 && window.scrollY <= 5) {
    mediaFullyExpanded.value = false;
    e.preventDefault();
    return;
  }

  if (!mediaFullyExpanded.value) {
    e.preventDefault();
    const scrollFactor = deltaY < 0 ? 0.008 : 0.005;
    setProgress(scrollProgress.value + deltaY * scrollFactor);
    touchStartY.value = touchY;
  }
}

function onTouchEnd() {
  touchStartY.value = 0;
}

function onScroll() {
  if (!mediaFullyExpanded.value) {
    window.scrollTo(0, 0);
  }
}

function checkIsMobile() {
  isMobile.value = window.innerWidth < 768;
}

function expandImmediately() {
  setProgress(1);
}

/**
 * Quando a seta "Conhecer o processo" é clicada: expande o hero (libera o
 * scroll lock) e rola suavemente até a próxima seção, em vez de teleportar.
 */
async function goToSection(ev: MouseEvent, hash: string | undefined) {
  if (!hash || !hash.startsWith('#')) return;
  ev.preventDefault();
  if (!mediaFullyExpanded.value) {
    setProgress(1);
    await new Promise((r) => setTimeout(r, 250));
  }
  const target = document.querySelector(hash);
  if (target instanceof HTMLElement) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/** Trava a rolagem do body enquanto o hero está em modo de lock,
 *  evitando a scrollbar visível "voando" no canto direito. */
watch(mediaFullyExpanded, (expanded) => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('rg-hero-locked', !expanded);
});

onMounted(() => {
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onScroll);
  window.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);
  // Inicia já em modo locked (oculta scrollbar do body)
  document.documentElement.classList.add('rg-hero-locked');
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile);
  window.removeEventListener('wheel', onWheel);
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('touchstart', onTouchStart);
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
  document.documentElement.classList.remove('rg-hero-locked');
});
</script>

<template>
  <div ref="sectionRef" class="rg-scroll-hero" data-rg-hero>
    <section class="rg-scroll-hero__section">
      <div class="rg-scroll-hero__stage">
        <!-- Background image with overlay -->
        <Motion
          class="rg-scroll-hero__bg"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 - scrollProgress }"
          :transition="{ duration: 0.1 }"
        >
          <picture>
            <source v-if="bgImageSrcWebp" :srcset="bgImageSrcWebp" type="image/webp" />
            <img
              :src="bgImageSrc"
              alt=""
              class="rg-scroll-hero__bg-img"
              loading="eager"
              decoding="async"
            />
          </picture>
          <div class="rg-scroll-hero__bg-overlay" />
          <div class="rg-scroll-hero__bg-gradient" />
        </Motion>

        <div class="rg-scroll-hero__container">
          <div class="rg-scroll-hero__viewport">
            <!-- Mídia central que expande com o scroll -->
            <div
              class="rg-scroll-hero__media"
              :style="{
                width: `${mediaWidth}px`,
                height: `${mediaHeight}px`,
              }"
            >
              <template v-if="mediaType === 'video' && !isYoutube">
                <div class="rg-scroll-hero__media-inner">
                  <video
                    :src="mediaSrc"
                    :poster="posterSrc"
                    autoplay
                    muted
                    loop
                    playsinline
                    preload="auto"
                    class="rg-scroll-hero__video"
                    disablepictureinpicture
                  />
                  <div class="rg-scroll-hero__media-shield" aria-hidden="true" />
                  <Motion
                    class="rg-scroll-hero__media-overlay"
                    :initial="{ opacity: 0.7 }"
                    :animate="{ opacity: 0.55 - scrollProgress * 0.35 }"
                    :transition="{ duration: 0.2 }"
                  />
                </div>
              </template>

              <template v-else-if="mediaType === 'video' && isYoutube">
                <div class="rg-scroll-hero__media-inner">
                  <iframe
                    :src="mediaSrc"
                    class="rg-scroll-hero__youtube"
                    width="100%"
                    height="100%"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  />
                  <div class="rg-scroll-hero__media-shield" aria-hidden="true" />
                </div>
              </template>

              <template v-else>
                <div class="rg-scroll-hero__media-inner">
                  <img
                    :src="mediaSrc"
                    :alt="title ?? 'Hero'"
                    class="rg-scroll-hero__image"
                    width="1280"
                    height="720"
                  />
                  <Motion
                    class="rg-scroll-hero__media-overlay"
                    :initial="{ opacity: 0.7 }"
                    :animate="{ opacity: 0.7 - scrollProgress * 0.3 }"
                    :transition="{ duration: 0.2 }"
                  />
                </div>
              </template>

              <!-- Textinhos pequenos sobre o media (eyebrow + scroll hint) -->
              <div class="rg-scroll-hero__media-text">
                <p
                  v-if="eyebrow"
                  class="rg-scroll-hero__eyebrow"
                  :style="{ transform: `translateX(-${textTranslateX}vw)` }"
                >
                  {{ eyebrow }}
                </p>
                <p
                  v-if="scrollHint && !mediaFullyExpanded"
                  class="rg-scroll-hero__hint"
                  :style="{ transform: `translateX(${textTranslateX}vw)` }"
                >
                  <span class="rg-scroll-hero__hint-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="14" height="14">
                      <path
                        d="M12 5v14m0 0-5-5m5 5 5-5"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  {{ scrollHint }}
                </p>
              </div>
            </div>

            <!-- Título grande dividido em duas partes -->
            <div
              :class="[
                'rg-scroll-hero__title-wrap',
                { 'rg-scroll-hero__title-wrap--blend': textBlend },
              ]"
            >
              <Motion
                as="h1"
                class="rg-scroll-hero__title"
                :style="{ transform: `translateX(-${textTranslateX}vw)` }"
              >
                {{ firstWord }}
              </Motion>
              <Motion
                as="span"
                class="rg-scroll-hero__title rg-scroll-hero__title--rest"
                :style="{ transform: `translateX(${textTranslateX}vw)` }"
              >
                {{ restOfTitle }}
              </Motion>
            </div>

            <!-- Quick action: pular animação -->
            <button
              v-if="!mediaFullyExpanded"
              type="button"
              class="rg-scroll-hero__skip"
              @click="expandImmediately"
            >
              Pular animação
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <path
                  d="M5 12h14m0 0-5-5m5 5-5 5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <!-- Conteúdo abaixo que aparece quando expandido -->
          <Motion
            class="rg-scroll-hero__content"
            :initial="{ opacity: 0, y: 24 }"
            :animate="{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 24 }"
            :transition="{ duration: 0.7, ease: [0.2, 0, 0, 1] }"
          >
            <slot>
              <!-- Conteúdo default: copy do Recicla Goiás abaixo do hero -->
              <div class="rg-scroll-hero__content-inner">
                <span class="rg-scroll-hero__content-eyebrow">
                  Governo de Goiás · Secretaria de Indústria e Comércio
                </span>
                <h2 class="rg-scroll-hero__content-title">
                  A plataforma oficial da logística reversa de Goiás.
                </h2>
                <p class="rg-scroll-hero__content-lede">
                  Aqui empresas, entidades gestoras, verificadores e o comitê acompanham
                  declarações, certificados e regularidade em um só lugar, com rastreabilidade
                  ponta a ponta.
                </p>

                <div class="rg-scroll-hero__content-ctas">
                  <a
                    v-if="primaryCtaLabel"
                    :href="primaryCtaHref ?? '#acessar'"
                    class="rg-scroll-hero__cta rg-scroll-hero__cta--primary"
                  >
                    {{ primaryCtaLabel }}
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path
                        d="M5 12h14m0 0-5-5m5 5-5 5"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </a>
                  <a
                    v-if="secondaryCtaLabel"
                    :href="secondaryCtaHref ?? '#sobre'"
                    class="rg-scroll-hero__cta rg-scroll-hero__cta--outline"
                    @click="goToSection($event, secondaryCtaHref ?? '#sobre')"
                  >
                    {{ secondaryCtaLabel }}
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path
                        d="M12 5v14m0 0-5-5m5 5 5-5"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </slot>
          </Motion>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.rg-scroll-hero {
  transition:
    background-color var(--rg-motion-duration-slower) var(--rg-motion-ease-emphasized);
  /* `clip` em vez de `hidden` (ver explicação no globals.css). */
  overflow-x: clip;
  /* Verde quase preto persistente: aparece quando a imagem de fundo desvanece. */
  background-color: var(--rg-primitive-brand-950);
}

.rg-scroll-hero__section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100dvh;
  background-color: var(--rg-primitive-brand-950);
}

.rg-scroll-hero__stage {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100dvh;
}

/* ---------- Background ---------- */
.rg-scroll-hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  height: 100%;
}

.rg-scroll-hero__bg-img {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  object-position: center;
  display: block;
}

.rg-scroll-hero__bg-overlay {
  position: absolute;
  inset: 0;
  /* Overlay escurecido para garantir leitura do título sobre a foto. */
  background-color: rgba(7, 38, 20, 0.62);
}

.rg-scroll-hero__bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(7, 38, 20, 0.25) 0%,
    rgba(7, 38, 20, 0.10) 30%,
    rgba(7, 38, 20, 0.45) 80%,
    var(--rg-primitive-brand-950) 100%
  );
}

/* ---------- Container ---------- */
.rg-scroll-hero__container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: var(--rg-container-page);
  margin-inline: auto;
  padding-inline: var(--rg-space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-x: clip; /* translateX dos títulos não pode estourar */
}

.rg-scroll-hero__viewport {
  position: relative;
  width: 100%;
  max-width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* contém a animação do title */
}

/* ---------- Media (vídeo / imagem) ---------- */
.rg-scroll-hero__media {
  position: absolute;
  z-index: 0;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: var(--rg-radius-2xl);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  max-width: 95vw;
  max-height: 85vh;
}

.rg-scroll-hero__media-inner {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-radius: var(--rg-radius-2xl);
  overflow: hidden;
}

.rg-scroll-hero__video,
.rg-scroll-hero__image,
.rg-scroll-hero__youtube {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.rg-scroll-hero__media-shield {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

.rg-scroll-hero__media-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

/* Textos pequenos sobre/abaixo do media */
.rg-scroll-hero__media-text {
  position: relative;
  z-index: 11;
  margin-top: var(--rg-space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--rg-space-1);
  text-align: center;
}

.rg-scroll-hero__eyebrow {
  margin: 0;
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.82);
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.4);
}

.rg-scroll-hero__hint {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-primitive-brand-100);
  letter-spacing: var(--rg-letter-spacing-wide);
  padding: var(--rg-space-1) var(--rg-space-3);
  background-color: rgba(7, 38, 20, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--rg-radius-pill);
  backdrop-filter: blur(8px);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.4);
}

.rg-scroll-hero__hint-icon {
  display: inline-flex;
  animation: rg-bob 1.8s ease-in-out infinite;
}

@keyframes rg-bob {
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(3px); opacity: 0.6; }
}

/* ---------- Título grande split ---------- */
.rg-scroll-hero__title-wrap {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--rg-space-4);
  text-align: center;
  width: 100%;
}

.rg-scroll-hero__title-wrap--blend {
  /* `lighten` faz o texto sempre aparecer claro sobre fundos escuros
     e ainda mais claro sobre o vídeo verde, mantendo identidade da marca
     sem o efeito "roxo" do `difference`. */
  mix-blend-mode: lighten;
  color: var(--rg-primitive-brand-100);
}

.rg-scroll-hero__title {
  margin: 0;
  font-size: clamp(56px, 10vw, 144px);
  line-height: 0.9;
  letter-spacing: -0.04em;
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-primitive-brand-100);
  text-shadow:
    0 2px 12px rgba(0, 0, 0, 0.45),
    0 8px 32px rgba(0, 0, 0, 0.35);
}

.rg-scroll-hero__title--rest {
  font-weight: var(--rg-font-weight-bold);
  font-style: italic;
}

/* ---------- Skip button ---------- */
.rg-scroll-hero__skip {
  position: absolute;
  bottom: var(--rg-space-8);
  left: 50%;
  transform: translateX(-50%);
  z-index: 12;
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-4);
  background-color: rgba(255, 255, 255, 0.08);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: var(--rg-radius-pill);
  font-family: var(--rg-font-family-sans);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition:
    background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-scroll-hero__skip:hover {
  background-color: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateX(-50%) translateY(-1px);
}

.rg-scroll-hero__skip:focus-visible {
  outline: 2px solid var(--rg-primitive-brand-300);
  outline-offset: 2px;
}

/* ---------- Conteúdo abaixo (revela após expandir) ---------- */
.rg-scroll-hero__content {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: var(--rg-space-12) var(--rg-space-6) var(--rg-space-16);
  position: relative;
  z-index: 10;
}

.rg-scroll-hero__content-inner {
  max-width: 760px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
  text-align: center;
}

.rg-scroll-hero__content-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  align-self: center;
  padding: var(--rg-space-1) var(--rg-space-3);
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
}

.rg-scroll-hero__content-title {
  margin: 0;
  font-size: clamp(28px, 4vw, 44px);
  line-height: var(--rg-line-height-tight);
  letter-spacing: var(--rg-letter-spacing-tight);
  font-weight: var(--rg-font-weight-bold);
  color: white;
}

.rg-scroll-hero__content-lede {
  margin: 0;
  font-size: var(--rg-font-size-lg);
  line-height: var(--rg-line-height-relaxed);
  color: rgba(255, 255, 255, 0.82);
}

.rg-scroll-hero__content-ctas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--rg-space-3);
  margin-top: var(--rg-space-3);
}

.rg-scroll-hero__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-3) var(--rg-space-6);
  border-radius: var(--rg-radius-lg);
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: 0;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.rg-scroll-hero__cta--primary {
  background-color: var(--rg-color-action-primary);
  color: white;
}
.rg-scroll-hero__cta--primary:hover {
  background-color: var(--rg-primitive-brand-500);
  transform: translateY(-1px);
}

.rg-scroll-hero__cta--outline {
  background-color: rgba(255, 255, 255, 0.06);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.32);
}
.rg-scroll-hero__cta--outline:hover {
  background-color: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.55);
  transform: translateY(-1px);
}

.rg-scroll-hero__cta:focus-visible {
  outline: 2px solid var(--rg-primitive-brand-300);
  outline-offset: 2px;
}

/* ---------- Responsivo ---------- */
@media (max-width: 768px) {
  .rg-scroll-hero__container {
    padding-inline: var(--rg-space-4);
  }
  .rg-scroll-hero__title {
    font-size: clamp(48px, 14vw, 84px);
  }
  .rg-scroll-hero__content {
    padding: var(--rg-space-10) var(--rg-space-4) var(--rg-space-12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rg-scroll-hero__hint-icon { animation: none; }
}
</style>
