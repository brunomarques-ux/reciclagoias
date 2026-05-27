<script setup lang="ts">
import RgSectionHeader from '@/components/RgSectionHeader.vue';
import { award } from '@/data/mocks/landing';
</script>

<template>
  <section id="premio" class="rg-premio" aria-labelledby="rg-premio-title">
    <div class="rg-premio__inner">
      <RgSectionHeader
        align="center"
        eyebrow="Reconhecimento"
        :title="`${award.category} · PMI Goiás 2025`"
        description="O Projeto Recicla Goiás foi reconhecido como Melhor Projeto pelo Project Management Institute Goiás durante o 18º Seminário Em Gestão, Projetos e Liderança."
      />

      <div class="rg-premio__layout">
        <!-- Certificado moldurado -->
        <article class="rg-premio__cert" aria-label="Certificado de premiação">
          <span class="rg-premio__ribbon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M12 2 15 8l6.5.9-4.7 4.6 1.1 6.6L12 17l-5.9 3.1L7.2 13.5 2.5 8.9 9 8z"
                fill="currentColor" />
            </svg>
            Melhor Projeto 2025
          </span>

          <div class="rg-premio__cert-inner">
            <header class="rg-premio__cert-header">
              <span class="rg-premio__cert-issuer">
                <strong>SIC</strong>
                <span>Secretaria de Estado de Indústria, Comércio e Serviços</span>
              </span>
              <span class="rg-premio__cert-state">
                <strong>GOIÁS</strong>
                <em>O estado que dá certo</em>
              </span>
            </header>

            <blockquote class="rg-premio__quote">
              <span>{{ award.quote }}</span>
              <cite>— {{ award.quoteAuthor }}</cite>
            </blockquote>

            <p class="rg-premio__intro">Uma homenagem e agradecimento à</p>

            <h3 class="rg-premio__recipients">
              <span v-for="(r, i) in award.recipients" :key="r">
                {{ r }}<template v-if="i < award.recipients.length - 1"> · </template>
              </span>
            </h3>

            <p class="rg-premio__about">
              pela premiação do {{ award.organization }} — Certificado
              <strong>Melhores do Ano de 2025</strong> — Categoria
              <strong>Projeto</strong>.
            </p>

            <footer class="rg-premio__cert-footer">
              <span>
                <span class="rg-premio__meta-label">Evento</span>
                <strong>{{ award.eventName }}</strong>
              </span>
              <span>
                <span class="rg-premio__meta-label">Data</span>
                <strong>{{ award.date }}</strong>
              </span>
              <span>
                <span class="rg-premio__meta-label">Local</span>
                <strong>{{ award.city }}</strong>
              </span>
            </footer>

            <!-- Marca-d'água sutil -->
            <span class="rg-premio__watermark" aria-hidden="true">PMI · 2025</span>
          </div>
        </article>

        <!-- Texto explicativo lateral -->
        <aside class="rg-premio__side">
          <ul class="rg-premio__highlights">
            <li>
              <span class="rg-premio__hl-icon"><v-icon icon="mdi-trophy-outline" size="20" /></span>
              <div>
                <strong>Melhor Projeto do ano</strong>
                <span>Reconhecimento PMI Goiás 2025</span>
              </div>
            </li>
            <li>
              <span class="rg-premio__hl-icon"><v-icon icon="mdi-account-group-outline" size="20" /></span>
              <div>
                <strong>Time multidisciplinar</strong>
                <span>GETI/SIC + CLR/SIC</span>
              </div>
            </li>
            <li>
              <span class="rg-premio__hl-icon"><v-icon icon="mdi-calendar-month-outline" size="20" /></span>
              <div>
                <strong>18º Seminário</strong>
                <span>Em Gestão, Projetos e Liderança</span>
              </div>
            </li>
            <li>
              <span class="rg-premio__hl-icon"><v-icon icon="mdi-map-marker-outline" size="20" /></span>
              <div>
                <strong>Goiânia · GO</strong>
                <span>Dezembro de 2025</span>
              </div>
            </li>
          </ul>

          <p class="rg-premio__summary">
            {{ award.summary }}
          </p>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rg-premio {
  position: relative;
  padding: var(--rg-space-20) var(--rg-space-6);
  background-color: var(--rg-color-surface-base);
}

.rg-premio__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-12);
}

.rg-premio__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: var(--rg-space-8);
  align-items: start;
}

/* ---------- Certificado ---------- */
.rg-premio__cert {
  position: relative;
  background-color: white;
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-2xl);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 20px 50px rgba(15, 23, 42, 0.10),
    0 4px 12px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.rg-premio__ribbon {
  position: absolute;
  top: var(--rg-space-5);
  right: var(--rg-space-5);
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-4);
  background: linear-gradient(135deg, #FCD34D, #F59E0B);
  color: #78350F;
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.rg-premio__cert-inner {
  position: relative;
  padding: var(--rg-space-10) var(--rg-space-8);
  background-image:
    radial-gradient(circle at 20% 20%, rgba(31, 131, 68, 0.04), transparent 60%),
    radial-gradient(circle at 80% 80%, rgba(252, 211, 77, 0.06), transparent 60%);
  border: 4px double var(--rg-primitive-brand-100);
  margin: var(--rg-space-3);
  border-radius: var(--rg-radius-xl);
}

.rg-premio__cert-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rg-space-4);
  padding-bottom: var(--rg-space-5);
  border-bottom: 1px dashed var(--rg-color-border-subtle);
}

.rg-premio__cert-issuer {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 280px;
}
.rg-premio__cert-issuer strong {
  font-size: var(--rg-font-size-xl);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-action-primary);
  letter-spacing: var(--rg-letter-spacing-wide);
}
.rg-premio__cert-issuer span {
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
  line-height: var(--rg-line-height-snug);
}

.rg-premio__cert-state {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding: var(--rg-space-2) var(--rg-space-3);
  background: linear-gradient(135deg, var(--rg-primitive-brand-600), var(--rg-primitive-brand-700));
  color: white;
  border-radius: var(--rg-radius-md);
  font-family: var(--rg-font-family-sans);
}
.rg-premio__cert-state strong {
  font-size: var(--rg-font-size-xl);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
}
.rg-premio__cert-state em {
  font-style: normal;
  font-size: 10px;
  font-weight: var(--rg-font-weight-medium);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  opacity: 0.78;
}

.rg-premio__quote {
  margin: var(--rg-space-6) 0 0 0;
  text-align: center;
  font-family: 'Roboto Flex Variable', serif;
  font-style: italic;
  font-size: var(--rg-font-size-xl);
  line-height: var(--rg-line-height-snug);
  color: var(--rg-color-text-primary);
}
.rg-premio__quote cite {
  display: block;
  margin-top: var(--rg-space-2);
  font-style: normal;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-action-primary);
}

.rg-premio__intro {
  margin: var(--rg-space-5) 0 var(--rg-space-2);
  text-align: center;
  font-size: var(--rg-font-size-md);
  color: var(--rg-color-text-secondary);
}

.rg-premio__recipients {
  margin: 0;
  text-align: center;
  font-size: var(--rg-font-size-2xl);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
  letter-spacing: var(--rg-letter-spacing-tight);
  line-height: var(--rg-line-height-snug);
}

.rg-premio__about {
  margin: var(--rg-space-4) 0 0;
  text-align: center;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}
.rg-premio__about strong {
  color: var(--rg-color-text-primary);
}

.rg-premio__cert-footer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--rg-space-4);
  margin-top: var(--rg-space-6);
  padding-top: var(--rg-space-5);
  border-top: 1px dashed var(--rg-color-border-subtle);
}
.rg-premio__cert-footer > span {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: center;
}
.rg-premio__meta-label {
  font-size: 10px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
}
.rg-premio__cert-footer strong {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.rg-premio__watermark {
  position: absolute;
  bottom: -10px;
  right: 12px;
  font-size: 64px;
  font-weight: var(--rg-font-weight-bold);
  color: rgba(31, 131, 68, 0.06);
  letter-spacing: var(--rg-letter-spacing-wide);
  pointer-events: none;
}

/* ---------- Side ---------- */
.rg-premio__side {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
  padding-top: var(--rg-space-5);
}

.rg-premio__highlights {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.rg-premio__highlights li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--rg-space-3);
  align-items: center;
  padding: var(--rg-space-3) var(--rg-space-4);
  background-color: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
}

.rg-premio__hl-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--rg-radius-md);
  background: linear-gradient(135deg, #FEF3C7, #FCD34D);
  color: #78350F;
}

.rg-premio__highlights strong {
  display: block;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}
.rg-premio__highlights span {
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
}

.rg-premio__summary {
  margin: 0;
  padding: var(--rg-space-4);
  background-color: var(--rg-color-surface-brand);
  border-left: 3px solid var(--rg-color-action-primary);
  border-radius: 0 var(--rg-radius-md) var(--rg-radius-md) 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-primary);
}

@media (max-width: 960px) {
  .rg-premio__layout { grid-template-columns: 1fr; }
  .rg-premio__cert-header { flex-direction: column; align-items: flex-start; }
  .rg-premio__cert-state { align-self: flex-start; }
}

@media (max-width: 600px) {
  .rg-premio { padding: var(--rg-space-14) var(--rg-space-4); }
  .rg-premio__cert-inner { padding: var(--rg-space-6) var(--rg-space-4); margin: var(--rg-space-2); }
  .rg-premio__quote { font-size: var(--rg-font-size-md); }
  .rg-premio__recipients { font-size: var(--rg-font-size-xl); }
  .rg-premio__cert-footer { grid-template-columns: 1fr; gap: var(--rg-space-2); }
  .rg-premio__cert-footer > span { flex-direction: row; justify-content: space-between; }
  .rg-premio__watermark { font-size: 40px; }
}
</style>
