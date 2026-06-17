<script setup lang="ts">
import { computed } from 'vue';
import SlideFrame from '../SlideFrame.vue';
import { MARCOS, TL_ICONS, TL_LABELS, TL_DATES } from '../data';

const props = defineProps<{ step: number }>();
const m = computed(() => MARCOS[props.step]);
const titleParts = computed(() => {
  const t = m.value.title; const a = m.value.accent; const i = t.indexOf(a);
  return i < 0 ? [t, '', ''] : [t.slice(0, i), a, t.slice(i + a.length)];
});
const CAL = '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 2v4"/><path d="M16 2v4"/>';
const CHECK = '<path d="M20 6 9 17l-5-5"/>';
</script>

<template>
  <SlideFrame foot-right="LINHA DO TEMPO DO PROJETO">
    <div class="tl">
      <!-- trilho (persiste) -->
      <div class="tl-rail">
        <div class="tl-eyebrow">LINHA DO TEMPO DO PROJETO</div>
        <div class="tl-row tl-labels">
          <span v-for="(l, i) in TL_LABELS" :key="i" class="tl-label" :class="{ on: i === step }">{{ l.toUpperCase() }}</span>
        </div>
        <div class="tl-track">
          <div class="tl-line" />
          <div class="tl-progress" :style="{ width: step * 20 + '%' }" />
          <div class="tl-row tl-nodes">
            <span v-for="(ic, i) in TL_ICONS" :key="i" class="tl-cell">
              <span class="tl-node" :class="i < step ? 'done' : i === step ? 'active' : 'pending'">
                <svg v-if="i < step" viewBox="0 0 24 24" class="tl-ic" v-html="CHECK" />
                <svg v-else viewBox="0 0 24 24" class="tl-ic" v-html="ic" />
              </span>
            </span>
          </div>
        </div>
        <div class="tl-row tl-dates">
          <span v-for="(d, i) in TL_DATES" :key="i" class="tl-date" :class="{ on: i === step }">{{ d }}</span>
        </div>
      </div>

      <!-- conteúdo (troca por marco) -->
      <Transition name="tlswap" mode="out-in">
        <div class="tl-content" :key="step">
          <div class="tl-left">
            <span class="tl-c-eyebrow">{{ m.eyebrow }}</span>
            <h2 class="tl-c-title">{{ titleParts[0] }}<span class="tl-accent">{{ titleParts[1] }}</span>{{ titleParts[2] }}</h2>
            <span class="tl-pill"><svg viewBox="0 0 24 24" v-html="CAL" />{{ m.dateShort }}</span>
            <p class="tl-lede">{{ m.lede }}</p>
          </div>
          <div class="tl-card">
            <span class="tl-card-h">O QUE FOI ENTREGUE</span>
            <div v-for="(b, i) in m.bullets" :key="i" class="tl-b" :class="{ 'is-hi': b.hi }">
              <span class="tl-chk" :class="{ 'is-hi': b.hi }"><svg viewBox="0 0 24 24" v-html="CHECK" /></span>
              <div class="tl-btxt">
                <span v-if="b.hi" class="tl-tag">{{ b.tag }}</span>
                <p class="tl-bline"><b>{{ b.name }}</b><template v-if="b.desc"> · {{ b.desc }}</template></p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </SlideFrame>
</template>

<style scoped>
.tl { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 46px; }

/* rail */
.tl-rail { display: flex; flex-direction: column; }
.tl-eyebrow { text-align: center; font-size: 14px; font-weight: 700; letter-spacing: .08em; color: var(--rg-primitive-brand-700); opacity: .9; margin-bottom: 16px; }
.tl-row { display: flex; }
.tl-row > * { flex: 1; text-align: center; }
.tl-label { font-size: 14px; font-weight: 600; letter-spacing: .04em; color: var(--rg-primitive-neutral-500); transition: color .4s; }
.tl-label.on { font-weight: 700; color: var(--rg-primitive-brand-700); }
.tl-track { position: relative; height: 56px; margin: 14px 0; }
.tl-line { position: absolute; left: 10%; right: 10%; top: 50%; height: 3px; transform: translateY(-50%); background: #dce6df; border-radius: 3px; }
.tl-progress { position: absolute; left: 10%; top: 50%; height: 4px; transform: translateY(-50%); background: linear-gradient(90deg, var(--rg-primitive-brand-500), var(--rg-primitive-brand-400)); border-radius: 4px; transition: width .5s cubic-bezier(.2,0,0,1); }
.tl-nodes { position: absolute; inset: 0; align-items: center; }
.tl-cell { display: flex; align-items: center; justify-content: center; }
.tl-node {
  width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  transition: all .45s cubic-bezier(.2,0,0,1);
}
.tl-node.pending { background: #fff; border: 1.5px solid #dce6df; box-shadow: 0 4px 10px rgba(15,23,42,.07); }
.tl-node.pending .tl-ic { stroke: var(--rg-primitive-brand-400); }
.tl-node.done { background: var(--rg-primitive-brand-600); box-shadow: 0 5px 12px rgba(31,131,68,.28); }
.tl-node.active { background: linear-gradient(135deg, var(--rg-primitive-brand-400), var(--rg-primitive-brand-600)); border: 2px solid #fff; box-shadow: 0 0 0 6px rgba(70,171,104,.18), 0 8px 20px rgba(39,156,80,.4); transform: scale(1.06); }
.tl-node.done .tl-ic, .tl-node.active .tl-ic { stroke: #fff; }
.tl-ic { width: 24px; height: 24px; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.tl-date { font-size: 16px; font-weight: 500; color: var(--rg-primitive-neutral-400); transition: color .4s; }
.tl-date.on { font-weight: 700; color: var(--rg-primitive-brand-700); }

/* content */
.tl-content { display: flex; gap: 56px; align-items: flex-start; }
.tl-left { width: 600px; flex: none; display: flex; flex-direction: column; gap: 20px; align-items: flex-start; }
.tl-c-eyebrow { font-size: 14px; font-weight: 700; letter-spacing: .06em; color: var(--rg-primitive-brand-600); }
.tl-c-title { margin: 0; font-size: 52px; font-weight: 700; line-height: 1.06; letter-spacing: -.02em; color: var(--rg-primitive-neutral-900); }
.tl-accent { color: var(--rg-primitive-brand-600); }
.tl-pill { display: inline-flex; align-items: center; gap: 9px; padding: 9px 17px 9px 15px; border-radius: 999px; background: #fff; border: 1px solid var(--rg-primitive-neutral-200); box-shadow: 0 2px 7px rgba(15,23,42,.07); font-size: 15px; font-weight: 600; color: var(--rg-primitive-neutral-900); }
.tl-pill svg { width: 16px; height: 16px; fill: none; stroke: var(--rg-primitive-brand-600); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.tl-lede { margin: 0; font-size: 19px; line-height: 1.58; color: var(--rg-primitive-neutral-600); }

.tl-card { flex: 1; display: flex; flex-direction: column; gap: 18px; padding: 34px 40px 36px; border-radius: 24px; background: #fff; border: 1px solid var(--rg-primitive-neutral-200); box-shadow: 0 22px 48px rgba(15,23,42,.13), 0 6px 16px rgba(15,23,42,.06); }
.tl-card-h { font-size: 14px; font-weight: 700; letter-spacing: .06em; color: var(--rg-primitive-brand-700); }
.tl-b { display: flex; gap: 14px; align-items: flex-start; }
.tl-b.is-hi { align-items: center; padding: 15px 20px 15px 18px; border-radius: 14px; background: var(--rg-primitive-brand-50); border: 1px solid var(--rg-primitive-brand-200); }
.tl-chk { flex: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--rg-primitive-brand-50); border: 1px solid var(--rg-primitive-brand-200); }
.tl-chk.is-hi { background: var(--rg-primitive-brand-100); border-color: transparent; }
.tl-chk svg { width: 17px; height: 17px; fill: none; stroke: var(--rg-primitive-brand-600); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.tl-chk.is-hi svg { stroke: var(--rg-primitive-brand-700); }
.tl-btxt { display: flex; flex-direction: column; gap: 4px; }
.tl-tag { font-size: 11px; font-weight: 700; letter-spacing: .08em; color: var(--rg-primitive-brand-700); }
.tl-bline { margin: 0; font-size: 18px; line-height: 1.4; color: var(--rg-primitive-neutral-600); }
.tl-bline b { color: var(--rg-primitive-neutral-900); font-weight: 600; }

.tlswap-enter-active, .tlswap-leave-active { transition: opacity .4s, transform .4s; }
.tlswap-enter-from { opacity: 0; transform: translateY(16px); }
.tlswap-leave-to { opacity: 0; transform: translateY(-12px); }
</style>
