<script setup lang="ts">
import { computed } from 'vue';
import RgSectionHeader from '@/components/RgSectionHeader.vue';
import { reverseLogisticsCycle } from '@/data/mocks/landing';

/**
 * Diagrama circular nativo (SVG + posicionamento via trigonometria).
 *
 * Substitui a imagem rasterizada de "Logística Reversa" do Figma S2 por uma
 * versão vetorial responsiva. Em mobile, vira lista vertical (display: none
 * no anel e display: flex na lista).
 */

// Calcula a posição (cos/sin) de cada cartão no anel, em vw/% relativo ao
// container quadrado. ANGLE_OFFSET inicia no topo (12h) e gira sentido horário.
const ANGLE_OFFSET = -90; // grau onde o primeiro item aparece
const cards = computed(() =>
  reverseLogisticsCycle.map((stage, i) => {
    const angle = ANGLE_OFFSET + (360 / reverseLogisticsCycle.length) * i;
    const rad = (angle * Math.PI) / 180;
    // raio % do container (50% = encostando na borda). 38% deixa margem.
    const r = 38;
    return {
      ...stage,
      angleDeg: angle,
      x: 50 + Math.cos(rad) * r,
      y: 50 + Math.sin(rad) * r,
    };
  }),
);
</script>

<template>
  <section id="sobre" class="rg-whatis" aria-labelledby="rg-whatis-title">
    <div class="rg-whatis__inner">
      <div class="rg-whatis__copy">
        <RgSectionHeader
          eyebrow="O que é"
          title="Logística reversa, do ponto de consumo ao recomeço produtivo."
          description="A logística reversa é o processo que devolve produtos, materiais e resíduos ao ciclo produtivo após o uso. O Recicla Goiás organiza esse fluxo — do consumidor à indústria — para garantir reciclagem, reutilização e descarte adequado."
        />
        <ul class="rg-whatis__bullets">
          <li>
            <strong>Promover sustentabilidade</strong> em toda a cadeia produtiva.
          </li>
          <li>
            <strong>Reduzir desperdícios</strong> e o impacto ambiental dos resíduos.
          </li>
          <li>
            <strong>Contribuir para a economia circular</strong> de Goiás.
          </li>
        </ul>
        <a class="rg-whatis__cta" href="#decreto">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M14 3h7v7M21 3 10 14m-4-9H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"
              fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Acessar Decreto 10.255/2023
        </a>
      </div>

      <!-- Anel (desktop / tablet) -->
      <div class="rg-whatis__ring" role="img" aria-label="Ciclo de logística reversa em seis estágios">
        <!-- SVG de fundo: anel + raios -->
        <svg class="rg-whatis__ring-svg" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <linearGradient id="rgRingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--rg-primitive-brand-600)" />
              <stop offset="100%" stop-color="var(--rg-primitive-brand-800)" />
            </linearGradient>
          </defs>
          <!-- Anel base -->
          <circle cx="50" cy="50" r="42" fill="none"
            stroke="var(--rg-color-border-subtle)" stroke-width="0.2"
            stroke-dasharray="0.5 0.7" />
          <!-- Anel interno -->
          <circle cx="50" cy="50" r="20" fill="url(#rgRingGrad)" />
          <circle cx="50" cy="50" r="20" fill="none"
            stroke="var(--rg-primitive-brand-500)" stroke-width="0.4"
            opacity="0.6" />
          <!-- Raios saindo do centro -->
          <g stroke="var(--rg-color-border-subtle)" stroke-width="0.18" opacity="0.6">
            <line v-for="(c, i) in cards" :key="i"
              x1="50" y1="50" :x2="c.x" :y2="c.y" />
          </g>
        </svg>

        <!-- Centro: identidade Recicla Goiás -->
        <div class="rg-whatis__center">
          <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
            <path d="M16 4 L26 9.5 V20.5 L16 26 L6 20.5 V9.5 Z" fill="white" opacity="0.16" />
            <path d="M11 19 L15 12 L19 17 L23 11" fill="none"
              stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="rg-whatis__center-eyebrow">Logística</span>
          <strong class="rg-whatis__center-title">Reversa</strong>
        </div>

        <!-- Cards orbitais -->
        <article
          v-for="card in cards"
          :key="card.key"
          class="rg-whatis__card"
          :style="{ left: card.x + '%', top: card.y + '%' }"
        >
          <span class="rg-whatis__card-icon" aria-hidden="true">
            <v-icon :icon="card.icon" size="20" />
          </span>
          <span class="rg-whatis__card-label">{{ card.label }}</span>
        </article>
      </div>

      <!-- Versão mobile: lista vertical -->
      <ul class="rg-whatis__stack" aria-hidden="true">
        <li v-for="card in cards" :key="card.key">
          <span class="rg-whatis__stack-icon">
            <v-icon :icon="card.icon" size="18" />
          </span>
          <span>{{ card.label }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.rg-whatis {
  position: relative;
  /* Padding-top GRANDE: garante que o título começa só depois do fade terminar. */
  padding:
    clamp(180px, 22vw, 280px)
    var(--rg-space-6)
    var(--rg-space-20);
  /* Transição super difusa: 8 paradas de cor distribuídas em ~22% da seção. */
  background:
    linear-gradient(180deg,
      var(--rg-primitive-brand-700) 0%,
      var(--rg-primitive-brand-600) 3%,
      var(--rg-primitive-brand-500) 6%,
      var(--rg-primitive-brand-400) 9%,
      var(--rg-primitive-brand-300) 12%,
      var(--rg-primitive-brand-200) 15%,
      var(--rg-primitive-brand-100) 18%,
      var(--rg-primitive-brand-50) 21%,
      var(--rg-color-surface-base) 25%,
      var(--rg-color-surface-base) 100%);
}

.rg-whatis__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 520px);
  gap: var(--rg-space-16);
  align-items: center;
}

.rg-whatis__copy {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
}

.rg-whatis__bullets {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
}

.rg-whatis__bullets li {
  position: relative;
  padding-left: var(--rg-space-5);
  font-size: var(--rg-font-size-md);
  color: var(--rg-color-text-secondary);
  line-height: var(--rg-line-height-relaxed);
}

.rg-whatis__bullets li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 8px;
  height: 8px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-action-primary);
}

.rg-whatis__bullets strong {
  color: var(--rg-color-text-primary);
  font-weight: var(--rg-font-weight-semibold);
}

.rg-whatis__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-4);
  align-self: flex-start;
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-lg);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  background-color: var(--rg-color-surface-raised);
  text-decoration: none;
  transition: all var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.rg-whatis__cta:hover {
  border-color: var(--rg-color-border-strong);
  background-color: var(--rg-color-surface-muted);
  transform: translateY(-1px);
}

/* ---------- Anel ---------- */
.rg-whatis__ring {
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  max-width: 520px;
  margin-inline: auto;
}

.rg-whatis__ring-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.rg-whatis__center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40%;
  aspect-ratio: 1 / 1;
  border-radius: var(--rg-radius-pill);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: white;
  text-align: center;
  padding-inline: var(--rg-space-3);
}

.rg-whatis__center-eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-medium);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.78);
  margin-top: var(--rg-space-1);
}

.rg-whatis__center-title {
  font-size: var(--rg-font-size-xl);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  line-height: 1;
}

.rg-whatis__card {
  position: absolute;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-3);
  background-color: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-pill);
  box-shadow: var(--rg-elevation-1);
  white-space: nowrap;
  transition:
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-whatis__card:hover {
  transform: translate(-50%, -50%) translateY(-2px);
  box-shadow: var(--rg-elevation-3);
  border-color: var(--rg-color-border-brand);
}

.rg-whatis__card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-surface-brand);
  color: var(--rg-color-text-brand);
}

.rg-whatis__card-label {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.rg-whatis__stack {
  display: none;
}

/* ---------- Responsivo ---------- */
@media (max-width: 960px) {
  .rg-whatis__inner {
    grid-template-columns: 1fr;
    gap: var(--rg-space-12);
  }
}

@media (max-width: 600px) {
  /* Em telas pequenas, esconde anel e mostra lista vertical. */
  .rg-whatis__ring {
    display: none;
  }

  .rg-whatis__stack {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--rg-space-2);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .rg-whatis__stack li {
    display: inline-flex;
    align-items: center;
    gap: var(--rg-space-2);
    padding: var(--rg-space-3);
    background-color: var(--rg-color-surface-raised);
    border: 1px solid var(--rg-color-border-subtle);
    border-radius: var(--rg-radius-lg);
    font-size: var(--rg-font-size-sm);
    font-weight: var(--rg-font-weight-medium);
    color: var(--rg-color-text-primary);
  }

  .rg-whatis__stack-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--rg-radius-pill);
    background-color: var(--rg-color-surface-brand);
    color: var(--rg-color-text-brand);
  }
}
</style>
