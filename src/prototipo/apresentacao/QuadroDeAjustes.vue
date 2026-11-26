<script setup lang="ts">
/**
 * O quadro dos ajustes da apresentação da validade (camada do protótipo, fora do produto).
 *
 * Lista os ajustes e vai sendo riscado: ao entrar com `foco = k`, o ajuste k-1 (o que acabou de ser mostrado) é
 * riscado à mão na frente da plateia e só então o destaque passa para o k. Com `foco` igual ao total, tudo riscado.
 * O ajuste em destaque abre o "antes" e o "agora".
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { Ajuste } from './roteiro';

const props = defineProps<{ ajustes: readonly Ajuste[]; foco: number }>();

/** 0: como estava antes de riscar · 1: risca o que acabou de ser mostrado · 2: o destaque passa adiante. */
const fase = ref(props.foco === 0 ? 2 : 0);
let t1: number | undefined;
let t2: number | undefined;
onMounted(() => {
  if (props.foco === 0) return;
  t1 = window.setTimeout(() => (fase.value = 1), 650);
  t2 = window.setTimeout(() => (fase.value = 2), 1500);
});
onBeforeUnmount(() => {
  window.clearTimeout(t1);
  window.clearTimeout(t2);
});

const riscados = computed(() => (fase.value >= 1 ? props.foco : props.foco - 1));
const destaque = computed(() => (fase.value >= 2 ? props.foco : props.foco - 1));
const tudo = computed(() => props.foco >= props.ajustes.length && fase.value >= 2);
const estadoDe = (i: number) => (i < riscados.value ? 'riscado' : i === destaque.value ? 'destaque' : 'a-fazer');
</script>

<template>
  <div class="qa">
    <div class="qa__lado">
      <p class="qa__rot">Os ajustes</p>
      <p class="qa__conta">
        <span class="qa__num">{{ Math.min(riscados, ajustes.length) }}</span>
        <span class="qa__de">de {{ ajustes.length }}</span>
      </p>
      <p class="qa__frase">{{ tudo ? 'Tudo no protótipo e no Figma' : 'mostrados' }}</p>
    </div>

    <ol class="qa__lista">
      <li v-for="(a, i) in ajustes" :key="a.titulo" class="qa__item" :data-estado="estadoDe(i)">
        <span class="qa__n" aria-hidden="true">{{ i + 1 }}</span>
        <div class="qa__corpo">
          <p class="qa__titulo">
            <span class="qa__texto">
              {{ a.titulo }}
              <svg class="qa__risco" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0,6 C12,3 22,8 36,5 S62,3 76,6 S94,4 100,5" />
              </svg>
            </span>
            <span v-if="a.marca" class="qa__item-tag">{{ a.marca }}</span>
          </p>
          <div class="qa__detalhe">
            <div>
              <p class="qa__antes"><b>Antes</b> {{ a.antes }}</p>
              <p class="qa__agora"><b>Agora</b> {{ a.agora }}</p>
            </div>
          </div>
        </div>
        <svg class="qa__check" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M8,21 L17,30 L33,10" pathLength="1" />
        </svg>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.qa :where(p, ol) { margin: 0; padding: 0; }
.qa { position: absolute; inset: 104px 80px 150px; display: flex; gap: 72px; align-items: flex-start; }

.qa__lado { flex: none; width: 380px; padding-top: 18px; }
.qa__rot { font: 700 22px/1 Inter Variable, Inter, sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--pv-verde); }
.qa__conta { display: flex; align-items: baseline; gap: 16px; margin-top: 4px; }
.qa__num {
  font-family: var(--pv-flex) !important; font-weight: 1000; font-stretch: 25%;
  font-variation-settings: 'wdth' 25; font-size: 300px; line-height: 1; letter-spacing: -.02em; color: var(--pv-tinta);
  transition: color .4s;
}
.qa__de { font: 600 44px/1 Inter Variable, Inter, sans-serif; color: var(--pv-apagado); }
.qa__frase { margin-top: 0; font: 500 28px/1.35 Inter Variable, Inter, sans-serif; color: var(--pv-tinta2); }

.qa__lista { flex: 1; margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; }
.qa__item {
  position: relative; display: flex; gap: 26px; align-items: flex-start;
  padding: 19px 64px 19px 24px; border-top: 2px solid var(--pv-linha);
  transition: background .5s, padding .5s;
}
.qa__item:last-child { border-bottom: 2px solid var(--pv-linha); }
.qa__n {
  flex: none; width: 58px;
  font-family: var(--pv-flex) !important; font-weight: 900; font-stretch: 30%;
  font-variation-settings: 'wdth' 30; font-size: 64px; line-height: .9; color: var(--pv-apagado); transition: color .5s;
}
.qa__corpo { flex: 1; min-width: 0; }
.qa__titulo { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 18px; }
.qa__texto { position: relative; font: 700 36px/1.2 Inter Variable, Inter, sans-serif; letter-spacing: -.01em; color: var(--pv-tinta2); transition: color .5s; }
.qa__item-tag { font: 600 18px/1 Inter Variable, Inter, sans-serif; letter-spacing: .08em; text-transform: uppercase; color: var(--pv-apagado); }

/* o risco à mão, desenhado da esquerda para a direita */
/* (o traço se revela por recorte: com vector-effect, o tracejado por pathLength não funciona) */
.qa__risco {
  position: absolute; left: -8px; right: -8px; top: 50%; width: calc(100% + 16px); height: 16px; margin-top: -6px; overflow: visible; pointer-events: none;
  clip-path: inset(-12px 100% -12px 0); transition: clip-path .7s cubic-bezier(.3, 0, .1, 1);
}
.qa__risco path { fill: none; stroke: var(--pv-verm); stroke-width: 4; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.qa__check { position: absolute; right: 16px; top: 20px; width: 40px; height: 40px; }
.qa__check path { fill: none; stroke: var(--pv-verde); stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .4s .5s; }

/* o antes e o agora só abrem no ajuste em destaque */
.qa__detalhe { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .55s cubic-bezier(.2, 0, 0, 1); }
.qa__detalhe > div { overflow: hidden; }
.qa__antes, .qa__agora { font: 500 25px/1.35 Inter Variable, Inter, sans-serif; color: var(--pv-tinta2); }
.qa__antes { margin-top: 12px; }
.qa__agora { margin-top: 6px; color: var(--pv-tinta); }
.qa__antes b, .qa__agora b { display: inline-block; width: 92px; font: 700 17px/1 Inter Variable, Inter, sans-serif; letter-spacing: .12em; text-transform: uppercase; }
.qa__antes b { color: var(--pv-verm); }
.qa__agora b { color: var(--pv-verde); }

.qa__item[data-estado='destaque'] { background: var(--pv-papel-claro); padding-top: 26px; padding-bottom: 28px; box-shadow: inset 8px 0 0 var(--pv-verde); }
.qa__item[data-estado='destaque'] .qa__n { color: var(--pv-verde); }
.qa__item[data-estado='destaque'] .qa__texto { color: var(--pv-tinta); }
.qa__item[data-estado='destaque'] .qa__detalhe { grid-template-rows: 1fr; }

.qa__item[data-estado='riscado'] .qa__texto { color: var(--pv-apagado); }
.qa__item[data-estado='riscado'] .qa__risco { clip-path: inset(-12px -6px -12px -6px); }
.qa__item[data-estado='riscado'] .qa__check path { stroke-dashoffset: 0; }

@media (prefers-reduced-motion: reduce) {
  .qa__item, .qa__risco, .qa__check path, .qa__detalhe, .qa__texto, .qa__n { transition: none; }
}
</style>
