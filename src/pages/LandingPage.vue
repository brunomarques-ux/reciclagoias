<script setup lang="ts">
import { ref } from 'vue';

import RgAppHeader from '@/components/landing/LandingHeader.vue';
import LandingHero from '@/components/landing/LandingHero.vue';
import LandingAbout from '@/components/landing/LandingAbout.vue';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks.vue';
import LandingBenefits from '@/components/landing/LandingBenefits.vue';
import LandingDataPreview from '@/components/landing/LandingDataPreview.vue';
import LandingUserProfiles from '@/components/landing/LandingUserProfiles.vue';
import LandingFaq from '@/components/landing/LandingFaq.vue';
import LandingCtaFinal from '@/components/landing/LandingCtaFinal.vue';
import LandingFooter from '@/components/landing/LandingFooter.vue';

const sections = ref([
  { id: 'sobre', label: 'O que é' },
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'para-quem', label: 'Para quem' },
  { id: 'duvidas', label: 'Perguntas frequentes' },
]);
</script>

<template>
  <RgAppHeader :sections="sections" />

  <main>
    <LandingHero />
    <LandingAbout id="sobre" />
    <LandingHowItWorks id="como-funciona" />
    <LandingBenefits />
    <LandingDataPreview />
    <LandingUserProfiles id="para-quem" />
    <LandingFaq id="duvidas" />
    <LandingCtaFinal />
  </main>

  <LandingFooter />
</template>
