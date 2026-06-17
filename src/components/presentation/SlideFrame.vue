<script setup lang="ts">
/**
 * Moldura base de um slide da apresentação (1920×1080).
 * Fundo off-white com glows + topo (logo/Secretaria) + rodapé + slot do corpo.
 * Os slides são desenhados no canvas fixo 1920×1080; o PresentationView escala.
 */
interface Props {
  footRight?: string;
  watermark?: boolean;
}
withDefaults(defineProps<Props>(), { footRight: '', watermark: false });
</script>

<template>
  <div class="slide">
    <!-- fundo -->
    <div class="slide__bg" />
    <div class="slide__glow slide__glow--a" />
    <div class="slide__glow slide__glow--b" />
    <svg
      v-if="watermark"
      class="slide__watermark"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--rg-primitive-brand-200)"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
      <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
      <path d="m14 16-3 3 3 3" />
      <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
      <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" />
      <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
    </svg>

    <!-- topo -->
    <header class="slide__top">
      <div class="slide__brand">
        <svg class="slide__iso" viewBox="0 0 850.39 850.39" xmlns="http://www.w3.org/2000/svg">
          <path fill="#bedb74" d="M196.52,630.39c-15.95-10.56-47.6-22.98-57.74-37.6-5.77-8.32-3.45-61.44-3.43-73.56l-.09-115.34-.17-78.17c-.08-18.77-1.55-47.79,2.62-65.46,1.58-6.67,46.22-31.08,54.44-35.9l100.74-58.17,75.62-43.91c19.99-11.51,48-33.78,70.72-21.88,17.17,9,34.26,19.14,51.08,28.86l103.93,60.36c32.7,18.94,65.87,37.35,98.45,56.51,11.28,6.63,18.17,14.24,20.03,27.29l.74,15.63c1.44,63.8.42,131.12.42,195.2l.1,56.83c.1,21.61,4.54,48.14-16.5,61.22-19.03,11.83-38.46,23.04-57.96,34.08-48.6,27.53-97.02,55.4-145.24,83.59-14.73,8.57-49.77,27.16-61.82,36.01h-17.81c-3.38-2.45-13.19-7.54-17.26-9.84l-36.22-20.64c-23.17-13.28-45.74-27.89-69.26-40.5-19.53-10.47-38.29-21.6-57.21-33.14-8.11-6.09-28.92-17.4-38.16-21.46Z" />
          <path fill="#0a6f39" d="M196.52,630.39c-15.95-10.56-47.6-22.98-57.74-37.6-5.77-8.32-3.45-61.44-3.43-73.56l-.09-115.34-.17-78.17c-.08-18.77-1.55-47.79,2.62-65.46,1.58-6.67,46.22-31.08,54.44-35.9l100.74-58.17,75.62-43.91c19.99-11.51,48-33.78,70.72-21.88,17.17,9,34.26,19.14,51.08,28.86l103.93,60.36c32.7,18.94,65.87,37.35,98.45,56.51,11.28,6.63,18.17,14.24,20.03,27.29-4.65-3.94-21.53-8.57-28.06-10.2-177.31-44.34-476.76-30.61-455.34,220.27l.12,1.31c9.12-8.44,16.94-17.39,25.7-26.07,12.79-12.45,26.23-24.21,40.28-35.22,61.2-47.04,138.73-77.12,214.8-88.15,16.35-2.37,37.55-4.74,54.11-4.08,2.77.1,5.52.34,8.26.74-41.42,14.75-81.55,32.88-119.99,54.23-99.2,54-200.88,130.2-251.27,233.83-1.65,3.41-3.25,6.84-4.79,10.3Z" />
          <path fill="#7cc464" d="M713.45,289.05c1.44,63.8.42,131.12.42,195.2l.1,56.83c.1,21.61,4.54,48.14-16.5,61.22-19.03,11.83-38.46,23.04-57.96,34.08-48.6,27.53-97.02,55.4-145.24,83.59-14.73,8.57-49.77,27.16-61.82,36.01h-17.81c-3.38-2.45-13.19-7.54-17.26-9.84l-36.22-20.64c-23.17-13.28-45.74-27.89-69.26-40.5-19.53-10.47-38.29-21.6-57.21-33.14,10.38-24,47.2-81.32,65.44-98.91,47.22,15.63,69.4,21.35,117.93,22.64,133.19,3.54,156.83-113.63,210.85-207.84,13.2-23.01,56.05-71.49,84.54-78.7Z" />
        </svg>
        <div class="slide__wordmark">
          <span class="slide__wm-name">Recicla Goiás</span>
          <span class="slide__wm-sub">SISTEMA DE LOGÍSTICA REVERSA</span>
        </div>
      </div>
      <span class="slide__gov">GOVERNO DE GOIÁS · SECRETARIA DE ESTADO DE INDÚSTRIA, COMÉRCIO E SERVIÇOS</span>
    </header>

    <!-- corpo -->
    <main class="slide__body"><slot /></main>

    <!-- rodapé -->
    <footer class="slide__foot">
      <div class="slide__foot-rule" />
      <div class="slide__foot-row">
        <span>Recicla Goiás · Sistema de Logística Reversa</span>
        <span class="slide__foot-right">{{ footRight }}</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.slide {
  position: relative;
  width: 1920px;
  height: 1080px;
  padding: 52px 140px 44px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  font-family: var(--rg-font-family-sans);
}
.slide__bg {
  position: absolute; inset: 0; z-index: 0;
  background: linear-gradient(180deg, #f9fbfa 0%, #eff4f1 100%);
}
.slide__glow { position: absolute; z-index: 0; border-radius: 50%; filter: blur(130px); }
.slide__glow--a { width: 980px; height: 780px; right: -60px; top: -300px; background: var(--rg-primitive-brand-200); opacity: .20; }
.slide__glow--b { width: 780px; height: 660px; left: -240px; bottom: -120px; background: var(--rg-primitive-brand-300); opacity: .10; }
.slide__watermark { position: absolute; z-index: 0; width: 360px; height: 360px; right: 80px; bottom: 40px; opacity: .05; }

.slide__top, .slide__body, .slide__foot { position: relative; z-index: 2; }
.slide__top { display: flex; align-items: center; justify-content: space-between; }
.slide__brand { display: flex; align-items: center; gap: 13px; }
.slide__iso { width: 46px; height: 46px; }
.slide__wordmark { display: flex; flex-direction: column; gap: 2px; }
.slide__wm-name { font-size: 22px; font-weight: 700; letter-spacing: -.01em; color: var(--rg-primitive-neutral-900); }
.slide__wm-sub { font-size: 11px; font-weight: 700; letter-spacing: .06em; color: var(--rg-primitive-brand-700); }
.slide__gov { font-size: 13px; font-weight: 700; letter-spacing: .05em; color: var(--rg-primitive-brand-700); opacity: .92; }

.slide__body { flex: 1; display: flex; min-height: 0; }

.slide__foot { display: flex; flex-direction: column; gap: 12px; }
.slide__foot-rule { height: 1px; background: #dce6df; }
.slide__foot-row { display: flex; align-items: center; justify-content: space-between; font-size: 14px; }
.slide__foot-row > span { color: var(--rg-primitive-neutral-500); }
.slide__foot-right { font-weight: 700; letter-spacing: .04em; }
</style>
