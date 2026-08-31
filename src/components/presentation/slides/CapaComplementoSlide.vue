<script setup lang="ts">
/**
 * Capa da apresentação da proposta do Operador Logístico — deck próprio,
 * separado da apresentação institucional. Mesma linguagem visual da CapaSlide.
 */
import SlideFrame from '../SlideFrame.vue';
import IsoMark from '../IsoMark.vue';
</script>

<template>
  <SlideFrame foot-right="Proposta · Setembro 2026">
    <div class="capa">
      <IsoMark :size="96" class="capa__iso anim" style="--d: 0s" />
      <span class="capa__pill anim" style="--d: .08s"><span class="capa__dot" />PROPOSTA · OPERADOR LOGÍSTICO</span>
      <h1 class="capa__title anim" style="--d: .16s">Cadastro do<br /><span class="capa__accent">Operador Logístico</span></h1>
      <p class="capa__lede anim" style="--d: .26s">Do pré-cadastro que já existe ao complemento em cinco etapas: o fluxo proposto, os e-mails e o protótipo funcional.</p>
    </div>
  </SlideFrame>
</template>

<style scoped>
.capa { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 26px; text-align: center; }
.capa__pill {
  display: inline-flex; align-items: center; gap: 10px; padding: 9px 20px;
  background: #fff; border: 1px solid var(--rg-primitive-neutral-200); border-radius: 999px;
  box-shadow: 0 2px 8px rgba(15,23,42,.06);
  font-size: 13px; font-weight: 700; letter-spacing: .08em; color: var(--rg-primitive-brand-700);
}
.capa__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--rg-primitive-brand-500); }
.capa__title { margin: 0; font-size: 80px; font-weight: 800; line-height: .98; letter-spacing: -.025em; color: var(--rg-primitive-neutral-900); }
.capa__accent { color: var(--rg-primitive-brand-600); }
.capa__lede { margin: 0; max-width: 900px; font-size: 21px; line-height: 1.58; color: var(--rg-primitive-neutral-600); }

.anim { animation: riseIn .6s cubic-bezier(.2,0,0,1) both; animation-delay: var(--d); }
@keyframes riseIn { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
</style>
