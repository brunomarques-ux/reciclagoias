<script setup lang="ts">
import RgSectionHeader from '@/components/RgSectionHeader.vue';

/**
 * Diagrama de fluxo "Logística Reversa" (Figma S4) em SVG nativo.
 * Posicionamento absoluto via porcentagem dentro de aspect-ratio fixo,
 * para escalar limpo em qualquer tamanho. Em mobile, vira lista vertical.
 */
</script>

<template>
  <section id="fluxo" class="rg-flow" aria-labelledby="rg-flow-title">
    <div class="rg-flow__inner">
      <RgSectionHeader
        align="center"
        eyebrow="Fluxo de operação"
        title="Como a logística reversa acontece, ponta a ponta."
        description="Brand Owners, operadores logísticos, entidades gestoras, verificadores e o comitê interagem em um fluxo contínuo, com a SEMAD na consolidação."
      />

      <!-- Diagrama horizontal: SVG nativo viewBox responsivo -->
      <div class="rg-flow__diagram" role="img" aria-label="Diagrama do fluxo da logística reversa">
        <svg viewBox="0 0 1200 540" xmlns="http://www.w3.org/2000/svg" class="rg-flow__svg">
          <defs>
            <marker id="rg-arrow" viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 Z" fill="var(--rg-primitive-brand-500)" />
            </marker>
            <linearGradient id="rg-soft" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#D6F0DE" />
              <stop offset="100%" stop-color="#B8E2C5" />
            </linearGradient>
          </defs>

          <!-- Conexões (setas) -->
          <g class="rg-flow__lines" fill="none" stroke="var(--rg-primitive-brand-500)" stroke-width="2.5" marker-end="url(#rg-arrow)">
            <!-- Brand Owners → Caixa Preta -->
            <path d="M180 130 L320 130" />
            <!-- Caixa Preta → Entidades Gestoras (com label "1") -->
            <path d="M460 130 L560 130" />
            <!-- Entidades Gestoras → Comitê (com label "6") -->
            <path d="M740 130 L860 130" />
            <!-- Comitê → SEMAD -->
            <path d="M980 200 L980 360 L1080 360" />
            <!-- Consumidor → Operadores Reciclagem -->
            <path d="M180 400 L370 400" />
            <!-- Operadores → Indústria Recicladora -->
            <path d="M570 400 L760 400" />
            <!-- Indústria → Comitê (label "6" também) -->
            <path d="M960 400 L960 200 L960 200" stroke-dasharray="4 4" />
            <!-- Verificador → Entidades Gestoras (vertical com label "5/4.1/4.2") -->
            <path d="M650 60 L650 100" />
            <!-- Entidades Gestoras → Operadores (label 2/3) -->
            <path d="M650 170 L490 360" stroke-dasharray="3 3" />
            <!-- Brand Owners → Consumidor (queda à esquerda) -->
            <path d="M120 170 L120 360" />
          </g>

          <!-- Labels numéricos nas conexões -->
          <g class="rg-flow__bullets" font-family="Inter Variable, sans-serif" font-weight="700" font-size="14" text-anchor="middle">
            <g><circle cx="500" cy="130" r="12" fill="var(--rg-primitive-brand-600)" /><text x="500" y="135" fill="white">1</text></g>
            <g><circle cx="800" cy="130" r="12" fill="var(--rg-primitive-brand-600)" /><text x="800" y="135" fill="white">6</text></g>
            <g><circle cx="650" cy="40" r="14" fill="var(--rg-primitive-brand-600)" /><text x="650" y="45" fill="white">5</text></g>
            <g><circle cx="615" cy="80" r="11" fill="var(--rg-primitive-brand-700)" /><text x="615" y="84" fill="white" font-size="11">4.1</text></g>
            <g><circle cx="690" cy="80" r="11" fill="var(--rg-primitive-brand-700)" /><text x="690" y="84" fill="white" font-size="11">4.2</text></g>
            <g><circle cx="580" cy="240" r="12" fill="var(--rg-primitive-brand-600)" /><text x="580" y="245" fill="white">2</text></g>
            <g><circle cx="640" cy="290" r="12" fill="var(--rg-primitive-brand-600)" /><text x="640" y="295" fill="white">3</text></g>
          </g>

          <!-- Nós (cards) -->
          <g class="rg-flow__nodes">
            <!-- Verificador (topo central) -->
            <g class="rg-flow__node rg-flow__node--strong">
              <rect x="540" y="0" width="220" height="44" rx="8" fill="#9CD9AC" stroke="#7AC78C" stroke-width="1" />
              <text x="650" y="27" text-anchor="middle" font-family="Inter Variable, sans-serif"
                font-weight="700" font-size="13" fill="#0D3E20">VERIFICADOR DE RESULTADOS</text>
            </g>

            <!-- Brand Owners -->
            <g class="rg-flow__node rg-flow__node--soft">
              <rect x="40" y="105" width="140" height="50" rx="8" fill="url(#rg-soft)" stroke="#9FD5B0" stroke-width="1" />
              <text x="110" y="135" text-anchor="middle" font-family="Inter Variable, sans-serif"
                font-weight="700" font-size="12" fill="#0D3E20">BRAND OWNERS</text>
            </g>

            <!-- Caixa Preta (dark) -->
            <g class="rg-flow__node rg-flow__node--dark">
              <rect x="320" y="105" width="140" height="50" rx="8" fill="#176935" stroke="#0F542C" stroke-width="1" />
              <text x="390" y="135" text-anchor="middle" font-family="Inter Variable, sans-serif"
                font-weight="700" font-size="12" fill="white">CAIXA PRETA</text>
            </g>

            <!-- Entidades Gestoras -->
            <g class="rg-flow__node rg-flow__node--soft">
              <rect x="560" y="100" width="180" height="60" rx="8" fill="url(#rg-soft)" stroke="#9FD5B0" stroke-width="1" />
              <text x="650" y="135" text-anchor="middle" font-family="Inter Variable, sans-serif"
                font-weight="700" font-size="13" fill="#0D3E20">ENTIDADES GESTORAS</text>
            </g>

            <!-- Entidades comitê LR -->
            <g class="rg-flow__node rg-flow__node--soft">
              <rect x="860" y="100" width="220" height="60" rx="8" fill="url(#rg-soft)" stroke="#9FD5B0" stroke-width="1" />
              <text x="970" y="128" text-anchor="middle" font-family="Inter Variable, sans-serif"
                font-weight="700" font-size="11" fill="#0D3E20">ENTIDADES COMITÊ</text>
              <text x="970" y="146" text-anchor="middle" font-family="Inter Variable, sans-serif"
                font-weight="700" font-size="11" fill="#0D3E20">DE LOGÍSTICA REVERSA</text>
            </g>

            <!-- Consumidor -->
            <g class="rg-flow__node rg-flow__node--soft">
              <rect x="40" y="375" width="140" height="50" rx="8" fill="url(#rg-soft)" stroke="#9FD5B0" stroke-width="1" />
              <text x="110" y="405" text-anchor="middle" font-family="Inter Variable, sans-serif"
                font-weight="700" font-size="12" fill="#0D3E20">CONSUMIDOR</text>
            </g>

            <!-- Operadores Reciclagem -->
            <g class="rg-flow__node rg-flow__node--soft">
              <rect x="370" y="375" width="200" height="50" rx="8" fill="url(#rg-soft)" stroke="#9FD5B0" stroke-width="1" />
              <text x="470" y="397" text-anchor="middle" font-family="Inter Variable, sans-serif"
                font-weight="700" font-size="11" fill="#0D3E20">OPERADORES DA</text>
              <text x="470" y="413" text-anchor="middle" font-family="Inter Variable, sans-serif"
                font-weight="700" font-size="11" fill="#0D3E20">RECICLAGEM ♻</text>
            </g>

            <!-- Indústria Recicladora -->
            <g class="rg-flow__node rg-flow__node--soft">
              <rect x="760" y="375" width="200" height="50" rx="8" fill="url(#rg-soft)" stroke="#9FD5B0" stroke-width="1" />
              <text x="860" y="397" text-anchor="middle" font-family="Inter Variable, sans-serif"
                font-weight="700" font-size="11" fill="#0D3E20">INDÚSTRIA</text>
              <text x="860" y="413" text-anchor="middle" font-family="Inter Variable, sans-serif"
                font-weight="700" font-size="11" fill="#0D3E20">RECICLADORA ♻</text>
            </g>

            <!-- SEMAD -->
            <g class="rg-flow__node rg-flow__node--soft">
              <rect x="1080" y="335" width="120" height="50" rx="8" fill="url(#rg-soft)" stroke="#9FD5B0" stroke-width="1" />
              <text x="1140" y="365" text-anchor="middle" font-family="Inter Variable, sans-serif"
                font-weight="700" font-size="12" fill="#0D3E20">SEMAD</text>
            </g>
          </g>

          <!-- Labels nas conexões horizontais -->
          <g font-family="Inter Variable, sans-serif" font-size="10" font-weight="500" fill="var(--rg-color-text-muted)" text-anchor="middle">
            <text x="270" y="395">EMBALAGENS</text>
            <text x="270" y="408">DESCARTADAS</text>
            <text x="665" y="395">EMBALAGENS</text>
            <text x="665" y="408">RECICLÁVEIS</text>
          </g>
        </svg>
      </div>

      <p class="rg-flow__caption">
        O número em cada conexão indica a etapa formal do processo, da notificação
        inicial (1) à comprovação para a SEMAD (6).
      </p>
    </div>
  </section>
</template>

<style scoped>
.rg-flow {
  position: relative;
  padding: var(--rg-space-20) var(--rg-space-6);
  background:
    linear-gradient(180deg,
      var(--rg-primitive-brand-900) 0%,
      var(--rg-primitive-brand-800) 10%,
      var(--rg-color-surface-base) 22%,
      var(--rg-color-surface-base) 100%);
}

.rg-flow__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-10);
}

.rg-flow__diagram {
  width: 100%;
  background-color: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-2xl);
  padding: var(--rg-space-6);
  box-shadow: var(--rg-elevation-1);
  overflow-x: auto;
}

.rg-flow__svg {
  width: 100%;
  height: auto;
  min-width: 720px;
  display: block;
}

.rg-flow__caption {
  margin: 0;
  text-align: center;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-muted);
}

@media (max-width: 768px) {
  .rg-flow { padding: var(--rg-space-14) var(--rg-space-4); }
  .rg-flow__diagram { padding: var(--rg-space-3); }
  /* Em telas pequenas: scroll horizontal preserva detalhes. */
  .rg-flow__svg { min-width: 900px; }
}
</style>
