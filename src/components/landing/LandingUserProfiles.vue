<script setup lang="ts">
import RgSectionHeader from '@/components/RgSectionHeader.vue';
import { userProfiles } from '@/data/mocks/landing';
</script>

<template>
  <section class="rg-profiles" aria-labelledby="rg-profiles-title">
    <div class="rg-profiles__inner">
      <RgSectionHeader
        align="center"
        eyebrow="Para quem"
        title="Cada perfil opera o Recicla Goiás à sua maneira."
        description="A plataforma adapta a experiência de acordo com o papel do usuário no processo — sem misturar telas e responsabilidades."
      />

      <div class="rg-profiles__grid">
        <article
          v-for="profile in userProfiles"
          :key="profile.slug"
          class="rg-profile"
        >
          <span class="rg-profile__icon" aria-hidden="true">
            <v-icon :icon="profile.icon" size="24" />
          </span>
          <h3 class="rg-profile__title">{{ profile.title }}</h3>
          <p class="rg-profile__summary">{{ profile.summary }}</p>
          <ul class="rg-profile__bullets">
            <li v-for="b in profile.bullets" :key="b">
              <v-icon icon="mdi-check" size="16" />
              <span>{{ b }}</span>
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rg-profiles {
  padding: var(--rg-space-20) var(--rg-space-6);
  background-color: var(--rg-color-surface-base);
}
.rg-profiles__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-12);
}
.rg-profiles__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--rg-space-4);
}

.rg-profile {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  padding: var(--rg-space-6);
  background-color: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-xl);
  height: 100%;
  transition:
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}
.rg-profile:hover {
  border-color: var(--rg-color-border-base);
  transform: translateY(-2px);
  box-shadow: var(--rg-elevation-2);
}

.rg-profile__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-brand);
  color: var(--rg-color-text-brand);
}

.rg-profile__title {
  margin: 0;
  font-size: var(--rg-font-size-lg);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  letter-spacing: var(--rg-letter-spacing-tight);
}
.rg-profile__summary {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}
.rg-profile__bullets {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  margin-top: var(--rg-space-2);
}
.rg-profile__bullets li {
  display: flex;
  align-items: flex-start;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-primary);
}
.rg-profile__bullets .v-icon {
  color: var(--rg-color-action-primary);
  margin-top: 2px;
}

@media (max-width: 1080px) {
  .rg-profiles__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .rg-profiles { padding: var(--rg-space-14) var(--rg-space-4); }
  .rg-profiles__grid { grid-template-columns: 1fr; }
}
</style>
