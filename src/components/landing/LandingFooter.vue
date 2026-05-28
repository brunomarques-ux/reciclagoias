<script setup lang="ts">
/**
 * Footer institucional do Recicla Goiás. CTA antes ficava aqui integrado;
 * agora vive na seção LandingCtaFinal separada, então o footer foi reduzido
 * só ao corpo principal (brand + nav + partners + contacts) + legal.
 */
import { institutionalPartners } from '@/data/mocks/landing';

const year = new Date().getFullYear();
</script>

<template>
  <footer class="rg-footer">
    <!-- Glow decorativo sutil no topo do footer (verde brand brilhando do meio
         pra cima da section). -->
    <div class="rg-footer__glow" aria-hidden="true" />

    <!-- Corpo do rodapé -->
    <div class="rg-footer__main">
      <div class="rg-footer__main-inner">
        <!-- Coluna 1: Brand + descrição -->
        <div class="rg-footer__brand-col">
          <a href="#top" class="rg-footer__brand" aria-label="Recicla Goiás — início">
            <img
              src="/brand/recicla-logo-horizontal.svg"
              alt="Recicla Goiás"
              class="rg-footer__brand-logo"
            />
          </a>

          <p class="rg-footer__brand-desc">
            Plataforma de gestão da logística reversa do Estado de Goiás, mantida
            pela Secretaria de Indústria e Comércio em conjunto com o comitê gestor.
          </p>

          <!-- Selo de reconhecimento PMI Goiás 2025 -->
          <a href="#premio" class="rg-footer__badge">
            <v-icon icon="mdi-trophy-outline" size="16" />
            <span>
              <strong>Melhor Projeto 2025</strong>
              <em>PMI Goiás · 18º Seminário</em>
            </span>
          </a>
        </div>

        <!-- Coluna 2: Navegação -->
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

        <!-- Coluna 3: Secretarias parceiras -->
        <div class="rg-footer__partners">
          <h4>Secretarias parceiras</h4>
          <ul>
            <li v-for="p in institutionalPartners" :key="p.short">
              <strong>{{ p.short }}</strong>
              <span>{{ p.full }}</span>
            </li>
          </ul>
        </div>

        <!-- Coluna 4: Contato -->
        <div class="rg-footer__contacts">
          <h4>Fale com a gente</h4>
          <ul>
            <li>
              <span class="rg-footer__contact-icon">
                <v-icon icon="mdi-email-outline" size="18" />
              </span>
              <a href="mailto:logisticareversa.meioambiente@gov.goias.br">
                logisticareversa.meioambiente@gov.goias.br
              </a>
            </li>
            <li>
              <span class="rg-footer__contact-icon">
                <v-icon icon="mdi-whatsapp" size="18" />
              </span>
              <span>(62) 9 9699-8345 · WhatsApp institucional</span>
            </li>
            <li>
              <span class="rg-footer__contact-icon">
                <v-icon icon="mdi-map-marker-outline" size="18" />
              </span>
              <span>Gerência de Resíduos Sólidos &amp; Drenagem</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Legal -->
    <div class="rg-footer__legal">
      <div class="rg-footer__legal-inner">
        <small>
          © {{ year }} · Secretaria de Estado de Indústria, Comércio e Serviços de Goiás (SIC)
        </small>
        <small>
          Implantado e mantido pela
          <strong>Gerência de Tecnologia · GETI/SIC</strong>
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
    linear-gradient(180deg, var(--rg-primitive-brand-900) 0%, var(--rg-primitive-brand-950) 100%);
}

/* Glow decorativo verde no topo do footer (radial-gradient atrás do main). */
.rg-footer__glow {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(
    900px 420px at 50% 0%,
    rgba(31, 131, 68, 0.32),
    transparent 65%
  );
  pointer-events: none;
}

/* ============ Main ============ */
.rg-footer__main {
  padding: var(--rg-space-16) var(--rg-space-6) var(--rg-space-12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.rg-footer__main-inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: grid;
  /* 4 colunas no desktop: brand maior + 3 colunas auxiliares equilibradas. */
  grid-template-columns: 1.4fr 0.9fr 1.1fr 1.2fr;
  gap: var(--rg-space-12) var(--rg-space-10);
}

/* ============ Coluna 1: Brand ============ */
.rg-footer__brand-col {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
}

.rg-footer__brand {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

/* Logo SVG horizontal com filter brightness pra ficar bem legível sobre o
   fundo escuro do footer. */
.rg-footer__brand-logo {
  display: block;
  height: 40px;
  width: auto;
  filter: brightness(1.55) saturate(0.9);
}

.rg-footer__brand-desc {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: rgba(255, 255, 255, 0.7);
  max-width: 38ch;
}

/* Selo Melhor Projeto 2025 com link pro Reconhecimento */
.rg-footer__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-3);
  align-self: flex-start;
  padding: var(--rg-space-3) var(--rg-space-4);
  background: linear-gradient(135deg, rgba(252, 211, 77, 0.16), rgba(245, 158, 11, 0.08));
  border: 1px solid rgba(252, 211, 77, 0.32);
  border-radius: var(--rg-radius-lg);
  text-decoration: none;
  transition:
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-footer__badge:hover {
  transform: translateY(-2px);
  border-color: rgba(252, 211, 77, 0.6);
}

.rg-footer__badge :deep(.v-icon) {
  color: #FCD34D;
  flex-shrink: 0;
}

.rg-footer__badge span {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: var(--rg-line-height-snug);
}

.rg-footer__badge strong {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-bold);
  color: #FCD34D;
  letter-spacing: var(--rg-letter-spacing-tight);
}

.rg-footer__badge em {
  font-style: normal;
  font-size: var(--rg-font-size-xs);
  color: rgba(252, 211, 77, 0.7);
  letter-spacing: var(--rg-letter-spacing-base);
}

/* ============ Cabeçalhos das colunas auxiliares ============ */
.rg-footer__nav h4,
.rg-footer__partners h4,
.rg-footer__contacts h4 {
  margin: 0 0 var(--rg-space-4);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-primitive-brand-200);
}

.rg-footer__nav ul,
.rg-footer__partners ul,
.rg-footer__contacts ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
}

/* ============ Coluna 2: Nav ============ */
.rg-footer__nav a {
  display: inline-block;
  font-size: var(--rg-font-size-sm);
  color: rgba(255, 255, 255, 0.74);
  text-decoration: none;
  transition: color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.rg-footer__nav a:hover {
  color: white;
}

/* ============ Coluna 3: Partners ============ */
.rg-footer__partners li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: var(--rg-space-3);
  border-left: 2px solid var(--rg-primitive-brand-700);
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

/* ============ Coluna 4: Contatos ============ */
.rg-footer__contacts li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--rg-space-3);
  align-items: center;
  font-size: var(--rg-font-size-sm);
  color: rgba(255, 255, 255, 0.78);
}

.rg-footer__contacts a {
  color: inherit;
  text-decoration: none;
  transition: color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
  word-break: break-word;
}

.rg-footer__contacts a:hover {
  color: white;
}

.rg-footer__contact-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--rg-radius-md);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--rg-primitive-brand-200);
  flex-shrink: 0;
}

/* ============ Legal ============ */
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

.rg-footer__legal-inner strong {
  color: rgba(255, 255, 255, 0.82);
  font-weight: var(--rg-font-weight-semibold);
}

/* ============ Responsivo ============ */
@media (max-width: 1024px) {
  .rg-footer__main-inner {
    grid-template-columns: 1fr 1fr;
  }
  .rg-footer__brand-col {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .rg-footer__main {
    padding: var(--rg-space-12) var(--rg-space-4) var(--rg-space-8);
  }
  .rg-footer__main-inner {
    grid-template-columns: 1fr;
    gap: var(--rg-space-8);
  }
  .rg-footer__legal {
    padding-inline: var(--rg-space-4);
  }
}
</style>
