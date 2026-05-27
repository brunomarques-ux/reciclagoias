<script setup lang="ts">
import { institutionalPartners } from '@/data/mocks/landing';

const year = new Date().getFullYear();
</script>

<template>
  <footer class="rg-footer">
    <!-- CTA final integrado ao rodapé -->
    <div class="rg-footer__cta">
      <div class="rg-footer__cta-inner">
        <div class="rg-footer__cta-copy">
          <span class="rg-footer__cta-eyebrow">
            <span class="rg-footer__cta-dot" aria-hidden="true" />
            Acesso à plataforma
          </span>
          <h2 class="rg-footer__cta-title">
            Pronto para começar a sua jornada de logística reversa?
          </h2>
          <p class="rg-footer__cta-lede">
            Acesse o sistema, escolha seu perfil e comece a operar com rastreabilidade
            real e suporte do comitê gestor.
          </p>
        </div>
        <div class="rg-footer__cta-actions">
          <a href="#acessar" class="rg-footer__cta-primary">
            Acessar sistema
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M5 12h14m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
          <a href="#duvidas" class="rg-footer__cta-secondary">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M9.1 9a3 3 0 1 1 5.9 1c0 2-3 3-3 3M12 17h.01" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" />
            </svg>
            Falar com a equipe
          </a>
        </div>
      </div>
    </div>

    <!-- Pattern decorativo -->
    <div class="rg-footer__pattern" aria-hidden="true">
      <svg viewBox="0 0 1200 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="rgFootGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(31, 131, 68, 0.0)" />
            <stop offset="60%" stop-color="rgba(31, 131, 68, 0.18)" />
            <stop offset="100%" stop-color="rgba(31, 131, 68, 0.4)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="1200" height="200" fill="url(#rgFootGlow)" />
      </svg>
    </div>

    <!-- Corpo do rodapé -->
    <div class="rg-footer__main">
      <div class="rg-footer__main-inner">
        <div class="rg-footer__brand-col">
          <a href="#top" class="rg-footer__brand" aria-label="Recicla Goiás">
            <span class="rg-footer__brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="40" height="40">
                <path d="M16 2 L29 9.5 V22.5 L16 30 L3 22.5 V9.5 Z" fill="var(--rg-primitive-brand-500)" />
                <path d="M11 19 L15 12 L19 17 L23 11" fill="none"
                  stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="rg-footer__brand-text">
              <strong>Recicla Goiás</strong>
              <em>Logística reversa do Estado de Goiás</em>
            </span>
          </a>

          <p class="rg-footer__brand-desc">
            Plataforma de gestão da logística reversa do Estado de Goiás, mantida
            pela Secretaria de Indústria e Comércio em conjunto com o comitê gestor.
          </p>

          <div class="rg-footer__placeholder" aria-label="Marca institucional (placeholder)">
            <span>GOVERNO DE GOIÁS</span>
            <em>marca aplicada na versão final</em>
          </div>
        </div>

        <nav class="rg-footer__nav" aria-label="Mapa do site">
          <h4>Navegação</h4>
          <ul>
            <li><a href="#sobre">O que é Logística Reversa</a></li>
            <li><a href="#como-funciona">Como funciona</a></li>
            <li><a href="#premio">Reconhecimento</a></li>
            <li><a href="#comite">Comitê gestor</a></li>
            <li><a href="#fluxo">Fluxo de operação</a></li>
            <li><a href="#sistema">Sistema Recicla Goiás</a></li>
            <li><a href="#duvidas">Perguntas frequentes</a></li>
          </ul>
        </nav>

        <div class="rg-footer__partners">
          <h4>Secretarias parceiras</h4>
          <ul>
            <li v-for="p in institutionalPartners" :key="p.short">
              <strong>{{ p.short }}</strong>
              <span>{{ p.full }}</span>
            </li>
          </ul>
        </div>

        <div class="rg-footer__contacts">
          <h4>Fale com a gente</h4>
          <ul>
            <li>
              <span class="rg-footer__contact-icon"><v-icon icon="mdi-email-outline" size="18" /></span>
              <a href="mailto:logisticareversa.meioambiente@gov.goias.br">
                logisticareversa.meioambiente@gov.goias.br
              </a>
            </li>
            <li>
              <span class="rg-footer__contact-icon"><v-icon icon="mdi-whatsapp" size="18" /></span>
              <span>(62) 9 9699-8345 · WhatsApp institucional</span>
            </li>
            <li>
              <span class="rg-footer__contact-icon"><v-icon icon="mdi-account-tie-outline" size="18" /></span>
              <span>Gerência de Resíduos Sólidos &amp; Drenagem</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Rodapé do rodapé: créditos -->
    <div class="rg-footer__legal">
      <div class="rg-footer__legal-inner">
        <small>
          © {{ year }} · Secretaria de Estado de Indústria, Comércio e Serviços de Goiás (SIC)
        </small>
        <small>
          Implantado e mantido pela <strong>Gerência de Tecnologia · GETI/SIC</strong>
        </small>
        <small class="rg-footer__legal-badge">
          <v-icon icon="mdi-trophy-outline" size="14" />
          PMI Goiás · Melhor Projeto 2025
        </small>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.rg-footer {
  position: relative;
  isolation: isolate;
  color: rgba(255, 255, 255, 0.82);
  background:
    radial-gradient(700px 360px at 75% 0%, rgba(31, 131, 68, 0.55), transparent 70%),
    linear-gradient(180deg, var(--rg-primitive-brand-900) 0%, var(--rg-primitive-brand-950) 100%);
}

/* ---------- CTA integrado ---------- */
.rg-footer__cta {
  padding: var(--rg-space-16) var(--rg-space-6) var(--rg-space-12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.rg-footer__cta-inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) auto;
  align-items: center;
  gap: var(--rg-space-12);
}
.rg-footer__cta-copy {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
}
.rg-footer__cta-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  align-self: flex-start;
  padding: 2px var(--rg-space-2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--rg-radius-pill);
  font-size: 11px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-primitive-brand-100);
}
.rg-footer__cta-dot {
  width: 6px; height: 6px; border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-300);
  box-shadow: 0 0 8px rgba(116, 191, 138, 0.6);
}
.rg-footer__cta-title {
  margin: 0;
  font-size: clamp(24px, 3.2vw, 36px);
  line-height: var(--rg-line-height-tight);
  letter-spacing: var(--rg-letter-spacing-tight);
  font-weight: var(--rg-font-weight-bold);
  color: white;
}
.rg-footer__cta-lede {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: rgba(255, 255, 255, 0.74);
  max-width: 540px;
}
.rg-footer__cta-actions {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  min-width: 220px;
}
.rg-footer__cta-primary,
.rg-footer__cta-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-3) var(--rg-space-5);
  border-radius: var(--rg-radius-lg);
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  text-decoration: none;
  transition: all var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}
.rg-footer__cta-primary {
  background-color: white;
  color: var(--rg-primitive-brand-800);
}
.rg-footer__cta-primary:hover {
  background-color: var(--rg-primitive-brand-50);
  transform: translateY(-1px);
}
.rg-footer__cta-secondary {
  background-color: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.22);
}
.rg-footer__cta-secondary:hover {
  background-color: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.5);
}

.rg-footer__pattern {
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.4;
  pointer-events: none;
}

/* ---------- Corpo do rodapé ---------- */
.rg-footer__main {
  padding: var(--rg-space-12) var(--rg-space-6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.rg-footer__main-inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: grid;
  grid-template-columns: 1.4fr 0.9fr 1.1fr 1.2fr;
  gap: var(--rg-space-10);
}

.rg-footer__brand-col { display: flex; flex-direction: column; gap: var(--rg-space-4); }
.rg-footer__brand { display: inline-flex; align-items: center; gap: var(--rg-space-3); text-decoration: none; }
.rg-footer__brand-text { display: flex; flex-direction: column; }
.rg-footer__brand-text strong {
  font-size: var(--rg-font-size-lg);
  font-weight: var(--rg-font-weight-bold);
  color: white;
  letter-spacing: var(--rg-letter-spacing-tight);
}
.rg-footer__brand-text em {
  font-style: normal;
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-primitive-brand-200);
  letter-spacing: var(--rg-letter-spacing-wide);
}
.rg-footer__brand-desc {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: rgba(255, 255, 255, 0.65);
}

.rg-footer__placeholder {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: var(--rg-space-2) var(--rg-space-3);
  border: 1px dashed rgba(255, 255, 255, 0.22);
  border-radius: var(--rg-radius-md);
  background: rgba(255, 255, 255, 0.02);
  align-self: flex-start;
}
.rg-footer__placeholder span {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  color: white;
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
}
.rg-footer__placeholder em {
  font-style: normal;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.55);
}

.rg-footer__nav h4,
.rg-footer__partners h4,
.rg-footer__contacts h4 {
  margin: 0 0 var(--rg-space-3);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-primitive-brand-200);
}

.rg-footer__nav ul,
.rg-footer__partners ul,
.rg-footer__contacts ul {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column;
  gap: var(--rg-space-2);
}
.rg-footer__nav a {
  display: inline-block;
  font-size: var(--rg-font-size-sm);
  color: rgba(255, 255, 255, 0.74);
  text-decoration: none;
  transition: color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}
.rg-footer__nav a:hover { color: white; }

.rg-footer__partners li {
  display: flex; flex-direction: column; gap: 2px;
  padding-left: var(--rg-space-3);
  border-left: 1px solid rgba(255, 255, 255, 0.16);
}
.rg-footer__partners strong {
  font-size: 11px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  color: white;
  text-transform: uppercase;
}
.rg-footer__partners span {
  font-size: var(--rg-font-size-xs);
  color: rgba(255, 255, 255, 0.6);
  line-height: var(--rg-line-height-snug);
}

.rg-footer__contacts li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--rg-space-2);
  align-items: center;
  font-size: var(--rg-font-size-sm);
  color: rgba(255, 255, 255, 0.78);
}
.rg-footer__contacts a {
  color: inherit; text-decoration: none;
  transition: color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
  word-break: break-word;
}
.rg-footer__contacts a:hover { color: white; }
.rg-footer__contact-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  border-radius: var(--rg-radius-md);
  background: rgba(255, 255, 255, 0.06);
  color: var(--rg-primitive-brand-100);
}

/* ---------- Legal ---------- */
.rg-footer__legal {
  padding: var(--rg-space-5) var(--rg-space-6);
}
.rg-footer__legal-inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-3);
  font-size: var(--rg-font-size-xs);
  color: rgba(255, 255, 255, 0.55);
}
.rg-footer__legal-inner strong { color: rgba(255, 255, 255, 0.78); font-weight: var(--rg-font-weight-semibold); }
.rg-footer__legal-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px var(--rg-space-2);
  border: 1px solid rgba(252, 211, 77, 0.3);
  border-radius: var(--rg-radius-pill);
  color: #FCD34D;
  font-weight: var(--rg-font-weight-semibold);
}

/* ---------- Responsivo ---------- */
@media (max-width: 1024px) {
  .rg-footer__main-inner { grid-template-columns: 1fr 1fr; }
  .rg-footer__brand-col { grid-column: 1 / -1; }
}

@media (max-width: 720px) {
  .rg-footer__cta-inner { grid-template-columns: 1fr; gap: var(--rg-space-6); }
  .rg-footer__cta-actions { flex-direction: row; flex-wrap: wrap; }
  .rg-footer__main-inner { grid-template-columns: 1fr; }
  .rg-footer__cta,
  .rg-footer__main,
  .rg-footer__legal { padding-inline: var(--rg-space-4); }
}
</style>
