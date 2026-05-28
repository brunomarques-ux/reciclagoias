<script setup lang="ts">
import { ref } from 'vue';

import RgAppHeader from '@/components/landing/LandingHeader.vue';
import LandingHeroScrollExpand from '@/components/landing/LandingHeroScrollExpand.vue';
import LandingDisclaimer from '@/components/landing/LandingDisclaimer.vue';
import LandingWhatIsLR from '@/components/landing/LandingWhatIsLR.vue';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks.vue';
import LandingPremio from '@/components/landing/LandingPremio.vue';
import LandingComite from '@/components/landing/LandingComite.vue';
import LandingFlowDiagram from '@/components/landing/LandingFlowDiagram.vue';
import LandingSistema from '@/components/landing/LandingSistema.vue';
import LandingFaq from '@/components/landing/LandingFaq.vue';
import LandingCtaFinal from '@/components/landing/LandingCtaFinal.vue';
import LandingFooter from '@/components/landing/LandingFooter.vue';

const sections = ref([
  { id: 'sobre',         label: 'O que é' },
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'comite',        label: 'Comitê' },
  { id: 'sistema',       label: 'Sistema' },
  { id: 'duvidas',       label: 'Dúvidas' },
]);
</script>

<template>
  <RgAppHeader :sections="sections" />

  <main>
    <LandingHeroScrollExpand
      media-type="video"
      media-src="/hero/hero-video.mp4"
      bg-image-src="/hero/bg-hero-v2.jpg"
      title="Recicla Goiás"
      logo-src="/brand/recicla-logo-horizontal.svg"
      eyebrow="Logística Reversa · Goiás 2026"
      scroll-hint="Role para descobrir"
      secondary-cta-label="Conhecer o processo"
      secondary-cta-href="#sobre"
      text-blend
    />

    <LandingDisclaimer />
    <LandingWhatIsLR />
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
