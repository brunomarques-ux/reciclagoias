<script setup lang="ts">
/**
 * Seção Fluxo de Operação — segue Figma node 17:710.
 *
 * Layout: header split (texto à esquerda, símbolo 3D da logo à direita no
 * canto superior, alinhado ao topo do título) + card central com a imagem
 * do diagrama (clicável → lightbox como o certificado do Prêmio) + caption
 * descritivo abaixo.
 *
 * Background = #F1F7F3 (mesmo tint do "Como funciona"), pra alternância
 * cromática entre seções claras.
 *
 * Microinterações no símbolo 3D:
 * 1. Tilt 3D suave acompanhando o mouse (efeito perspective + rotateX/Y).
 * 2. Reveal-on-scroll: começa escondido acima/atrás do Comitê e vai
 *    descendo até a posição final conforme a section entra no viewport.
 *    Implementado via scroll listener passive com cálculo de progresso.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue';
import RgLightbox from '@/components/RgLightbox.vue';

const lightboxOpen = ref(false);

// ============ Microinteração 1: tilt 3D acompanhando o mouse na página inteira ============
// Listener global no window: o logo "olha" pro cursor independente do mouse estar
// em cima dele ou não. Assim que o logo aparece (reveal-on-scroll), ele já está
// reagindo à posição do mouse. O cálculo normaliza dx/dy pelo viewport e clampa em
// [-1, 1] pra mapear suavemente em ±14° de tilt máximo.
const logoRef = ref<HTMLElement | null>(null);
const tiltX = ref(0);
const tiltY = ref(0);
let lastMouseEvent: MouseEvent | null = null;
let tiltRafId: number | null = null;

const MAX_TILT_DEG = 14;

function updateTiltFromMouse() {
  tiltRafId = null;
  const el = logoRef.value;
  const ev = lastMouseEvent;
  if (!el || !ev) return;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  // Normaliza pela metade do viewport — mouse na borda do viewport = tilt máximo.
  const dx = (ev.clientX - cx) / (window.innerWidth / 2);
  const dy = (ev.clientY - cy) / (window.innerHeight / 2);
  const cdx = Math.max(-1, Math.min(1, dx));
  const cdy = Math.max(-1, Math.min(1, dy));
  tiltY.value = cdx * MAX_TILT_DEG;
  tiltX.value = -cdy * MAX_TILT_DEG;
}

function onWindowMouseMove(ev: MouseEvent) {
  lastMouseEvent = ev;
  if (tiltRafId !== null) return; // throttle via rAF
  tiltRafId = requestAnimationFrame(updateTiltFromMouse);
}

// ============ Microinteração 2: reveal-on-scroll ============
const sectionRef = ref<HTMLElement | null>(null);
const scrollProgress = ref(0); // 0 = escondido (antes), 1 = posição final
let rafId: number | null = null;

function updateScrollProgress() {
  const section = sectionRef.value;
  if (!section) return;
  const rect = section.getBoundingClientRect();
  const vh = window.innerHeight;

  // Progresso 0..1 baseado em onde a section está no viewport.
  // - Quando o topo da section está fora do viewport (rect.top > vh): progresso 0
  // - Quando a section está totalmente centralizada (rect.top ≈ 0): progresso 1
  // - Em algum ponto antes (rect.top ≈ vh*0.3): progresso já está em 1
  const start = vh;          // começa a aparecer quando entra no viewport
  const end = vh * 0.3;      // termina quando passa de ~70% do viewport
  const range = start - end;
  const raw = (start - rect.top) / range;
  scrollProgress.value = Math.max(0, Math.min(1, raw));
}

function onScroll() {
  if (rafId) return; // throttle via rAF
  rafId = requestAnimationFrame(() => {
    updateScrollProgress();
    rafId = null;
  });
}

onMounted(() => {
  updateScrollProgress();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateScrollProgress, { passive: true });
  // Tilt 3D: listener global no window. O logo reage ao mouse mesmo
  // quando o cursor não está em cima dele (efeito de "seguir o cursor").
  window.addEventListener('mousemove', onWindowMouseMove, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', updateScrollProgress);
  window.removeEventListener('mousemove', onWindowMouseMove);
  if (rafId) cancelAnimationFrame(rafId);
  if (tiltRafId) cancelAnimationFrame(tiltRafId);
});
</script>

<template>
  <section
    id="fluxo"
    ref="sectionRef"
    class="rg-flow"
    aria-labelledby="rg-flow-title"
  >
    <div class="rg-flow__inner">
      <!-- Header split: copy à esquerda, símbolo 3D no canto superior direito -->
      <header class="rg-flow__header">
        <div class="rg-flow__copy">
          <span class="rg-flow__eyebrow">FLUXO DE OPERAÇÃO</span>
          <h2 id="rg-flow-title" class="rg-flow__title">
            Como a logística reversa acontece,
            <span class="rg-flow__title-accent">ponta a ponta</span>.
          </h2>
          <p class="rg-flow__lede">
            Brand Owners, operadores logísticos, entidades gestoras, verificadores
            e o comitê interagem em um fluxo contínuo, com a SEMAD na consolidação.
          </p>
        </div>

        <!-- Símbolo 3D da logo: tilt seguindo o mouse globalmente + reveal-on-scroll -->
        <div
          class="rg-flow__logo-3d-wrap"
          :style="{
            '--rg-flow-scroll': String(scrollProgress),
          } as Record<string, string>"
          aria-hidden="true"
        >
          <div
            ref="logoRef"
            class="rg-flow__logo-3d"
            :style="{
              '--rg-flow-tilt-x': tiltX + 'deg',
              '--rg-flow-tilt-y': tiltY + 'deg',
            } as Record<string, string>"
          >
            <img
              src="/fluxo/logo-3d.png"
              alt=""
              class="rg-flow__logo-3d-img"
              loading="lazy"
            />
          </div>
        </div>
      </header>

      <!-- Card clicável com a imagem do diagrama -->
      <div class="rg-flow__card-wrap">
        <button
          type="button"
          class="rg-flow__card"
          aria-label="Abrir diagrama do fluxo de operação em tamanho ampliado"
          @click="lightboxOpen = true"
        >
          <img
            src="/fluxo/diagrama-fluxo-v2.png"
            alt="Diagrama do fluxo da logística reversa: Brand Owners → Caixa Preta → Entidades Gestoras → Comitê → SEMAD, com ramificações para Consumidor, Operadores da Reciclagem, Indústria Recicladora e Verificador de Resultados."
            class="rg-flow__card-img"
            loading="lazy"
          />
          <span class="rg-flow__card-hint" aria-hidden="true">
            <v-icon icon="mdi-magnify-plus-outline" size="16" />
            Clique para ampliar
          </span>
        </button>
      </div>

      <!-- Caption explicativo do diagrama -->
      <p class="rg-flow__caption">
        O número em cada conexão indica a etapa formal do processo, da notificação
        inicial (1) à comprovação para a SEMAD (6).
      </p>
    </div>

    <RgLightbox
      v-model="lightboxOpen"
      image-src="/fluxo/diagrama-fluxo-v2.png"
      alt="Diagrama do fluxo da logística reversa Recicla Goiás"
      :zoomable="true"
    />
  </section>
</template>

<style scoped>
.rg-flow {
  position: relative;
  /* Padding vertical consistente com as demais seções claras. */
  padding: var(--rg-space-24) var(--rg-space-6);
  /* Mesmo tint do "Como funciona" — alternância cromática entre seções claras. */
  background-color: var(--rg-color-surface-soft-tint);
  /* Permite que o logo 3D estoure pra cima sem causar scrollbar. */
  overflow: hidden;
}

.rg-flow__inner {
  position: relative;
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-10);
}

/* ============ Header split ============ */
.rg-flow__header {
  display: grid;
  /* Texto cresce; logo 3D fixo no canto direito superior. */
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--rg-space-12);
}

.rg-flow__copy {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
}

.rg-flow__eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-brand);
}

.rg-flow__title {
  margin: 0;
  /* 56px fixo no desktop conforme padrão das outras seções. */
  font-size: 56px;
  line-height: 1.05;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
  max-width: 22ch;
}

/* "ponta a ponta" em verde brand-500. */
.rg-flow__title-accent {
  color: var(--rg-primitive-brand-500);
}

.rg-flow__lede {
  margin: 0;
  max-width: 64ch;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

/* ============ Símbolo 3D (microinterações) ============ */
.rg-flow__logo-3d-wrap {
  /* Perspectiva pra o tilt 3D ter profundidade real. */
  perspective: 800px;
  align-self: start;
  /* Reveal-on-scroll: usa --rg-flow-scroll (0..1) pra animar opacity + translateY.
     Em 0: opacity 0 e Y -120% (escondido acima da section, "atrás" do Comitê).
     Em 1: opacity 1 e Y 0 (posição final). */
  opacity: calc(var(--rg-flow-scroll, 0));
  transform: translateY(calc((1 - var(--rg-flow-scroll, 0)) * -120%));
  /* Sem transition aqui — o scroll progress já varia continuamente. */
  will-change: transform, opacity;
}

.rg-flow__logo-3d {
  display: inline-block;
  width: clamp(120px, 16vw, 200px);
  height: clamp(120px, 16vw, 200px);
  /* Aplica o tilt baseado no mouse (global) via custom props. */
  transform:
    rotateX(var(--rg-flow-tilt-x, 0deg))
    rotateY(var(--rg-flow-tilt-y, 0deg));
  transform-style: preserve-3d;
  /* Transição curta (140ms) pra interpolar suavemente entre os frames do rAF
     sem parecer laggy — o mouse pode estar longe do logo e mover rápido. */
  transition: transform 140ms cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: default;
  will-change: transform;
}

.rg-flow__logo-3d-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* Sombra sutil pra dar mais "presença" 3D. */
  filter: drop-shadow(0 12px 28px rgba(15, 70, 35, 0.22));
  pointer-events: none;
}

/* ============ Card do diagrama ============ */
.rg-flow__card-wrap {
  display: flex;
  justify-content: center;
}

.rg-flow__card {
  position: relative;
  display: inline-flex;
  /* A arte v2 do diagrama já desenha o próprio "card" (moldura, fundo e
     cantos fazem parte da imagem) — o button vira só um wrapper clicável
     transparente, sem padding/borda/sombra duplicando a moldura. */
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  border-radius: var(--rg-radius-2xl);
  cursor: zoom-in;
  transition: transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
  -webkit-appearance: none;
  appearance: none;
}

.rg-flow__card:hover {
  transform: translateY(-3px);
}

.rg-flow__card:hover .rg-flow__card-hint {
  opacity: 1;
  transform: translate(-50%, 0);
}

.rg-flow__card:focus-visible {
  outline: 3px solid var(--rg-color-action-primary);
  outline-offset: 6px;
}

.rg-flow__card-img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
}

.rg-flow__card-hint {
  position: absolute;
  left: 50%;
  bottom: var(--rg-space-5);
  transform: translate(-50%, 6px);
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-1);
  padding: var(--rg-space-2) var(--rg-space-3);
  background-color: rgba(15, 23, 42, 0.78);
  color: white;
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-base);
  opacity: 0;
  transition:
    opacity var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
  pointer-events: none;
  backdrop-filter: blur(6px);
}

/* ============ Caption ============ */
.rg-flow__caption {
  margin: 0;
  text-align: center;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-secondary);
  max-width: 64ch;
  margin-inline: auto;
}

/* ============ Responsivo ============ */
@media (max-width: 960px) {
  .rg-flow__header {
    grid-template-columns: 1fr;
    gap: var(--rg-space-6);
  }
  /* No mobile, o reveal-on-scroll + tilt do logo 3D fica bugado (a section
     toda já entra no viewport quase no mesmo frame, e o tilt sem espaço
     pra "respirar" parece glitch). Removemos o logo inteiro no mobile. */
  .rg-flow__logo-3d-wrap {
    display: none;
  }
  .rg-flow__title {
    font-size: clamp(32px, 6vw, 44px);
    max-width: none;
  }
}

@media (max-width: 640px) {
  .rg-flow {
    padding: var(--rg-space-16) var(--rg-space-4);
  }
  .rg-flow__card {
    padding: var(--rg-space-3);
  }
}

/* prefers-reduced-motion: zera tilt e reveal */
@media (prefers-reduced-motion: reduce) {
  .rg-flow__logo-3d-wrap {
    opacity: 1 !important;
    transform: none !important;
  }
  .rg-flow__logo-3d {
    transform: none !important;
    transition: none !important;
  }
  .rg-flow__card,
  .rg-flow__card-hint {
    transition: none !important;
  }
}
</style>
