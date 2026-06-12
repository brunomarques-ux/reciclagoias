<script setup lang="ts">
import { ref } from 'vue';

import RgAppHeader from '@/components/landing/LandingHeader.vue';
import RgScrollProgress from '@/components/RgScrollProgress.vue';
import LandingHeroScrollExpand from '@/components/landing/LandingHeroScrollExpand.vue';
import LandingDisclaimer from '@/components/landing/LandingDisclaimer.vue';
import LandingWhatIsLR from '@/components/landing/LandingWhatIsLR.vue';
import LandingPerfis from '@/components/landing/LandingPerfis.vue';
import LandingEnquadramento from '@/components/landing/LandingEnquadramento.vue';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks.vue';
import LandingPremio from '@/components/landing/LandingPremio.vue';
import LandingComite from '@/components/landing/LandingComite.vue';
import LandingFlowDiagram from '@/components/landing/LandingFlowDiagram.vue';
import LandingSistema from '@/components/landing/LandingSistema.vue';
import LandingFaq from '@/components/landing/LandingFaq.vue';
import LandingCtaFinal from '@/components/landing/LandingCtaFinal.vue';
import LandingFooter from '@/components/landing/LandingFooter.vue';

const sections = ref([
  { id: 'sobre',          label: 'O que é' },
  { id: 'perfis',         label: 'Perfis' },
  { id: 'enquadramento',  label: 'Quem adere' },
  { id: 'como-funciona',  label: 'Como funciona' },
  { id: 'premio',         label: 'Prêmios' },
  // secondary: escondidos no header entre 961–1280px (não cabem os 10 itens);
  // continuam no drawer mobile e acessíveis por scroll.
  { id: 'comite',         label: 'Comitê', secondary: true },
  { id: 'fluxo',          label: 'Fluxo',  secondary: true },
  { id: 'sistema',        label: 'Sistema' },
  { id: 'duvidas',        label: 'Dúvidas' },
  // Atalho sazonal com leve destaque (prazo aberto) → banner logo após a hero.
  { id: 'autodeclaracao', label: 'Autodeclaração', highlight: true },
]);
</script>

<template>
  <RgAppHeader :sections="sections" />
  <RgScrollProgress />

  <main id="top">
    <LandingHeroScrollExpand
      media-type="video"
      media-src="/hero/hero-video-v2.mp4"
      bg-image-src="/hero/bg-hero-v3.jpg"
      bg-image-src-webp="/hero/bg-hero-v3.webp"
      title="RECICLA GOIÁS"
      :eyebrow="'Logística Reversa · Goiás\u00A02026'"
      scroll-hint="Role para descobrir"
      secondary-cta-label="Conhecer o processo"
      secondary-cta-href="#sobre"
      text-blend
    />

    <LandingDisclaimer />
    <LandingWhatIsLR />
    <LandingPerfis />
    <LandingEnquadramento />
    <LandingHowItWorks />
    <LandingPremio />
    <LandingComite />
    <LandingFlowDiagram />
    <LandingSistema />
    <LandingFaq id="duvidas" />
    <LandingCtaFinal />
  </main>

  <LandingFooter />
</template>
