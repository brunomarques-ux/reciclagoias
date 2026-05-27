<script setup lang="ts">
import { institutionalPartners } from '@/data/mocks/landing';

const year = new Date().getFullYear();
</script>

<template>
  <footer class="rg-footer">
    <div class="rg-footer__inner">
      <div class="rg-footer__top">
        <div class="rg-footer__brand">
          <span class="rg-footer__brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="36" height="36" role="img" aria-hidden="true">
              <path
                d="M16 2 L29 9.5 V22.5 L16 30 L3 22.5 V9.5 Z"
                fill="var(--rg-primitive-brand-500)"
              />
              <path
                d="M11 19 L15 12 L19 17 L23 11"
                fill="none"
                stroke="white"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <div>
            <strong>Recicla Goiás</strong>
            <p>
              Plataforma de gestão da logística reversa do Estado de Goiás, mantida
              pela Secretaria de Indústria e Comércio em conjunto com o comitê gestor.
            </p>
          </div>
        </div>

        <div class="rg-footer__contacts">
          <h3>Contatos</h3>
          <ul>
            <li>
              <v-icon icon="mdi-email-outline" size="18" />
              <span>logisticareversa.meioambiente@goias.gov.br</span>
            </li>
            <li>
              <v-icon icon="mdi-whatsapp" size="18" />
              <span>(62) 9 9999-0000 · WhatsApp institucional</span>
            </li>
            <li>
              <v-icon icon="mdi-account-tie-outline" size="18" />
              <span>Gerência de Resíduos Sólidos &amp; Drenagem</span>
            </li>
          </ul>
        </div>
      </div>

      <section class="rg-footer__partners" aria-label="Secretarias e órgãos parceiros">
        <h3>Secretarias parceiras</h3>
        <ul>
          <li v-for="p in institutionalPartners" :key="p.short">
            <strong>{{ p.short }}</strong>
            <span>{{ p.full }}</span>
          </li>
        </ul>
      </section>

      <div class="rg-footer__bottom">
        <span class="rg-footer__placeholder" aria-label="Marca institucional do Governo de Goiás (placeholder)">
          GOVERNO DE GOIÁS
          <em>· marca institucional aplicada na versão final ·</em>
        </span>
        <small>
          © {{ year }} · Secretaria de Indústria e Comércio do Estado de Goiás · Implantado e mantido
          pela Gerência de Tecnologia.
        </small>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.rg-footer {
  padding: var(--rg-space-20) var(--rg-space-6) var(--rg-space-10);
  background-color: var(--rg-primitive-brand-900);
  color: rgba(255, 255, 255, 0.82);
}

.rg-footer__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-10);
}

.rg-footer__top {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: var(--rg-space-12);
  padding-bottom: var(--rg-space-8);
  border-bottom: 1px solid var(--rg-color-border-inverse);
}

.rg-footer__brand {
  display: flex;
  gap: var(--rg-space-4);
}
.rg-footer__brand-mark {
  flex: none;
  margin-top: 2px;
}
.rg-footer__brand strong {
  display: block;
  font-size: var(--rg-font-size-xl);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-on-inverse);
  letter-spacing: var(--rg-letter-spacing-tight);
  margin-bottom: var(--rg-space-2);
}
.rg-footer__brand p {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  max-width: 520px;
}

.rg-footer__contacts h3,
.rg-footer__partners h3 {
  margin: 0 0 var(--rg-space-3);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-primitive-brand-200);
}
.rg-footer__contacts ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
}
.rg-footer__contacts li {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-sm);
  color: rgba(255, 255, 255, 0.86);
}
.rg-footer__contacts .v-icon {
  color: var(--rg-primitive-brand-200);
}

.rg-footer__partners ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--rg-space-5) var(--rg-space-6);
}
.rg-footer__partners li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: var(--rg-space-3);
  border-left: 1px solid var(--rg-color-border-inverse);
}
.rg-footer__partners strong {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  color: var(--rg-color-text-on-inverse);
  text-transform: uppercase;
}
.rg-footer__partners span {
  font-size: var(--rg-font-size-xs);
  color: rgba(255, 255, 255, 0.7);
  line-height: var(--rg-line-height-snug);
}

.rg-footer__bottom {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  padding-top: var(--rg-space-6);
  border-top: 1px solid var(--rg-color-border-inverse);
}

.rg-footer__placeholder {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--rg-space-2);
  align-items: center;
  padding: var(--rg-space-3) var(--rg-space-4);
  align-self: flex-start;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: var(--rg-radius-md);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-on-inverse);
}
.rg-footer__placeholder em {
  font-style: normal;
  font-weight: var(--rg-font-weight-regular);
  letter-spacing: 0;
  text-transform: none;
  color: rgba(255, 255, 255, 0.6);
}

.rg-footer__bottom small {
  font-size: var(--rg-font-size-xs);
  color: rgba(255, 255, 255, 0.55);
}

@media (max-width: 960px) {
  .rg-footer__top { grid-template-columns: 1fr; gap: var(--rg-space-8); }
  .rg-footer__partners ul { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .rg-footer { padding: var(--rg-space-14) var(--rg-space-4) var(--rg-space-8); }
  .rg-footer__partners ul { grid-template-columns: 1fr; }
}
</style>
