<script setup lang="ts">
import RgSectionHeader from '@/components/RgSectionHeader.vue';
import RgStatCard from '@/components/RgStatCard.vue';
import {
  dashboardStats,
  recentDeclarations,
  materialLabels,
  statusLabels,
} from '@/data/mocks/landing';

const featuredStats = dashboardStats;

const statusTone = {
  aprovado: 'success',
  enviado: 'info',
  ajuste: 'warning',
} as const;

const materialTone = {
  paper: 'paper',
  plastic: 'plastic',
  metal: 'metal',
  glass: 'glass',
} as const;

const numberFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
</script>

<template>
  <section class="rg-preview" aria-labelledby="rg-preview-title">
    <div class="rg-preview__inner">
      <RgSectionHeader
        eyebrow="Prévia do painel"
        title="Acompanhe saldo de massa, declarações e regularidade."
        description="A composição abaixo é uma amostra fiel do painel que cada perfil enxerga ao acessar o sistema — sem dados reais, apenas ilustrativa."
      />

      <div class="rg-preview__stats">
        <RgStatCard
          v-for="stat in featuredStats"
          :key="stat.key"
          :label="stat.label"
          :value="stat.value"
          :unit="stat.unit"
          :icon="stat.icon"
          :tone="stat.tone"
          :delta="stat.delta"
        />
      </div>

      <div class="rg-preview__table" role="region" aria-label="Declarações recentes">
        <header class="rg-preview__table-header">
          <div>
            <span class="rg-preview__table-eyebrow">Últimas declarações</span>
            <strong class="rg-preview__table-title">Certificados de massa</strong>
          </div>
          <div class="rg-preview__table-legend" aria-hidden="true">
            <span class="rg-preview__chip rg-preview__chip--success">Aprovado</span>
            <span class="rg-preview__chip rg-preview__chip--info">Enviado</span>
            <span class="rg-preview__chip rg-preview__chip--warning">Em ajuste</span>
          </div>
        </header>

        <div class="rg-preview__table-scroll">
          <table class="rg-preview__table-grid">
            <thead>
              <tr>
                <th scope="col">Identificador</th>
                <th scope="col">Operador logístico</th>
                <th scope="col">Material</th>
                <th scope="col" class="rg-preview__numeric">Massa total</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in recentDeclarations" :key="row.identifier">
                <td>
                  <span class="rg-preview__id">{{ row.identifier }}</span>
                </td>
                <td>{{ row.operator }}</td>
                <td>
                  <span :class="['rg-preview__material', `rg-preview__material--${materialTone[row.material]}`]">
                    <span class="rg-preview__material-dot" aria-hidden="true" />
                    {{ materialLabels[row.material] }}
                  </span>
                </td>
                <td class="rg-preview__numeric">
                  <strong>{{ numberFmt.format(row.massT) }}</strong>
                  <span class="rg-preview__unit">t</span>
                </td>
                <td>
                  <span :class="['rg-preview__chip', `rg-preview__chip--${statusTone[row.status]}`]">
                    {{ statusLabels[row.status] }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rg-preview {
  padding: var(--rg-space-20) var(--rg-space-6);
  background-color: var(--rg-color-surface-muted);
}

.rg-preview__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-10);
}

.rg-preview__stats {
  display: grid;
  grid-template-columns: 1.4fr repeat(4, minmax(0, 1fr));
  gap: var(--rg-space-3);
}

.rg-preview__table {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
  padding: var(--rg-space-6);
  background-color: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-2xl);
  box-shadow: var(--rg-elevation-1);
}

.rg-preview__table-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rg-space-4);
  flex-wrap: wrap;
}
.rg-preview__table-eyebrow {
  display: block;
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
}
.rg-preview__table-title {
  display: block;
  font-size: var(--rg-font-size-xl);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  margin-top: 2px;
  letter-spacing: var(--rg-letter-spacing-tight);
}
.rg-preview__table-legend {
  display: flex;
  gap: var(--rg-space-2);
}

.rg-preview__table-scroll {
  overflow-x: auto;
}

.rg-preview__table-grid {
  width: 100%;
  border-collapse: collapse;
}
.rg-preview__table-grid th,
.rg-preview__table-grid td {
  padding: var(--rg-space-4) var(--rg-space-3);
  text-align: left;
  vertical-align: middle;
  font-size: var(--rg-font-size-sm);
}
.rg-preview__table-grid th {
  font-weight: var(--rg-font-weight-semibold);
  font-size: var(--rg-font-size-xs);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
  border-bottom: 1px solid var(--rg-color-border-subtle);
}
.rg-preview__table-grid td {
  color: var(--rg-color-text-primary);
  border-bottom: 1px solid var(--rg-color-border-subtle);
}
.rg-preview__table-grid tbody tr:last-child td {
  border-bottom: none;
}
.rg-preview__table-grid tbody tr:hover td {
  background-color: var(--rg-color-surface-muted);
}

.rg-preview__id {
  font-family: var(--rg-font-family-mono);
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
}

.rg-preview__material {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  font-weight: var(--rg-font-weight-medium);
}
.rg-preview__material-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-material-dot);
}
.rg-preview__material--paper    { --rg-material-dot: var(--rg-data-material-paper); }
.rg-preview__material--plastic  { --rg-material-dot: var(--rg-data-material-plastic); }
.rg-preview__material--metal    { --rg-material-dot: var(--rg-data-material-metal); }
.rg-preview__material--glass    { --rg-material-dot: var(--rg-data-material-glass); }

.rg-preview__numeric { text-align: right; font-variant-numeric: tabular-nums; }
.rg-preview__numeric strong {
  font-weight: var(--rg-font-weight-semibold);
}
.rg-preview__unit { color: var(--rg-color-text-muted); margin-left: 2px; }

.rg-preview__chip {
  display: inline-flex;
  align-items: center;
  padding: 4px var(--rg-space-3);
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-base);
}
.rg-preview__chip--success { background-color: var(--rg-color-feedback-success-soft); color: var(--rg-color-feedback-success); }
.rg-preview__chip--info    { background-color: var(--rg-color-feedback-info-soft); color: var(--rg-color-feedback-info); }
.rg-preview__chip--warning { background-color: var(--rg-color-feedback-warning-soft); color: var(--rg-color-feedback-warning); }

@media (max-width: 960px) {
  .rg-preview__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .rg-preview { padding: var(--rg-space-14) var(--rg-space-4); }
  .rg-preview__stats { grid-template-columns: 1fr; }
}
</style>
