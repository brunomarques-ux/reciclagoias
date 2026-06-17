<script setup lang="ts">
import SlideFrame from '../SlideFrame.vue';

const FEAT: { name: string; desc: string; hi?: boolean }[] = [
  { name: 'Cadastro de participantes', desc: 'cooperativas, fabricantes, importadores e comerciantes' },
  { name: 'Metas e relatórios', desc: 'acompanhamento dos planos de logística reversa', hi: true },
  { name: 'Validação de dados', desc: 'armazenamento e validação das comprovações' },
  { name: 'Fiscalização', desc: 'criação e acompanhamento dos planos' },
];
const CHECK = '<path d="M20 6 9 17l-5-5"/>';
</script>

<template>
  <SlideFrame foot-right="INTRODUÇÃO">
    <div class="intro">
      <div class="intro__left anim" style="--d:0s">
        <span class="intro__eyebrow">O QUE É O SISTEMA</span>
        <h2 class="intro__title">Uma <span class="intro__accent">evolução</span> completa</h2>
        <p class="intro__p">O Recicla Goiás é a plataforma oficial de logística reversa do estado, desenvolvida pela SIC. Apoia a criação, o acompanhamento e a fiscalização dos Planos de Logística Reversa, conectando todos os agentes da cadeia.</p>
        <p class="intro__p">Esta é a nova geração do sistema: uma evolução visual e funcional completa em relação ao antigo SISRev.</p>
      </div>
      <div class="intro__card anim" style="--d:.14s">
        <span class="intro__card-h">O QUE A PLATAFORMA FAZ</span>
        <div v-for="(f, i) in FEAT" :key="i" class="intro__row" :class="{ 'is-hi': f.hi }">
          <span class="intro__chk" :class="{ 'is-hi': f.hi }"><svg viewBox="0 0 24 24" v-html="CHECK" /></span>
          <div class="intro__txt">
            <span v-if="f.hi" class="intro__tag">NÚCLEO DO SISTEMA</span>
            <p class="intro__line"><b>{{ f.name }}</b> · {{ f.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </SlideFrame>
</template>

<style scoped>
.intro { flex: 1; display: flex; align-items: center; gap: 72px; }
.intro__left { flex: none; width: 600px; display: flex; flex-direction: column; gap: 22px; align-items: flex-start; }
.intro__eyebrow { font-size: 14px; font-weight: 700; letter-spacing: .06em; color: var(--rg-primitive-brand-600); }
.intro__title { margin: 0; font-size: 62px; font-weight: 700; line-height: 1.04; letter-spacing: -.02em; color: var(--rg-primitive-neutral-900); }
.intro__accent { color: var(--rg-primitive-brand-600); }
.intro__p { margin: 0; font-size: 19px; line-height: 1.6; color: var(--rg-primitive-neutral-600); }

.intro__card {
  flex: 1; display: flex; flex-direction: column; gap: 18px;
  padding: 34px 40px 36px; border-radius: 24px;
  background: #fff; border: 1px solid var(--rg-primitive-neutral-200);
  box-shadow: 0 22px 48px rgba(15,23,42,.13), 0 6px 16px rgba(15,23,42,.06);
}
.intro__card-h { font-size: 14px; font-weight: 700; letter-spacing: .06em; color: var(--rg-primitive-brand-700); }
.intro__row { display: flex; gap: 14px; align-items: flex-start; }
.intro__row.is-hi { align-items: center; padding: 15px 20px 15px 18px; border-radius: 14px; background: var(--rg-primitive-brand-50); border: 1px solid var(--rg-primitive-brand-200); }
.intro__chk { flex: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--rg-primitive-brand-50); border: 1px solid var(--rg-primitive-brand-200); }
.intro__chk.is-hi { background: var(--rg-primitive-brand-100); border-color: transparent; }
.intro__chk svg { width: 17px; height: 17px; fill: none; stroke: var(--rg-primitive-brand-600); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.intro__chk.is-hi svg { stroke: var(--rg-primitive-brand-700); }
.intro__txt { display: flex; flex-direction: column; gap: 4px; }
.intro__tag { font-size: 11px; font-weight: 700; letter-spacing: .08em; color: var(--rg-primitive-brand-700); }
.intro__line { margin: 0; font-size: 18px; line-height: 1.4; color: var(--rg-primitive-neutral-600); }
.intro__line b { color: var(--rg-primitive-neutral-900); font-weight: 600; }

.anim { animation: riseIn .55s cubic-bezier(.2,0,0,1) both; animation-delay: var(--d); }
@keyframes riseIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
</style>
