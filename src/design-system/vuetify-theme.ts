import type { ThemeDefinition } from 'vuetify';

/**
 * Tema Vuetify do Recicla Goiás.
 *
 * Os hex aqui DUPLICAM os valores das primitivas em `tokens/primitives.css`
 * porque a API do Vuetify aceita apenas strings de cor estáticas. Sempre
 * que alterar uma primitiva-chave (brand, surface, neutros), atualize aqui
 * também — esses dois arquivos são a única fronteira onde a cor "vive duas
 * vezes" no projeto.
 */
export const reciclagoiasLight: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    'surface-bright': '#FFFFFF',
    'surface-variant': '#F1F5F9',
    'on-surface-variant': '#334155',

    primary: '#1F8344',
    'primary-darken-1': '#176935',
    'on-primary': '#FFFFFF',

    secondary: '#0F172A',
    'secondary-darken-1': '#1E293B',
    'on-secondary': '#FFFFFF',

    error: '#DC2626',
    info: '#2563EB',
    success: '#1F8344',
    warning: '#D97706',
  },
  variables: {
    'border-color': '#E2E8F0',
    'border-opacity': 1,
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 0.78,
    'disabled-opacity': 0.42,
    'theme-overlay-multiplier': 1,
  },
};

/**
 * Defaults globais para componentes Vuetify — estabelecem o "default visual"
 * do produto sem precisar repetir props em cada uso.
 */
export const reciclagoiasDefaults = {
  VBtn: {
    rounded: 'lg' as const,
    variant: 'flat' as const,
    height: 44,
    style: 'text-transform: none; font-weight: 600; letter-spacing: 0;',
  },
  VCard: {
    rounded: 'xl' as const,
    elevation: 0,
    border: true,
  },
  VChip: {
    rounded: 'pill' as const,
    variant: 'tonal' as const,
    size: 'small' as const,
  },
  VTextField: {
    variant: 'outlined' as const,
    density: 'comfortable' as const,
    color: 'primary',
  },
  VSelect: {
    variant: 'outlined' as const,
    density: 'comfortable' as const,
    color: 'primary',
  },
  VExpansionPanel: {
    rounded: 'lg' as const,
    elevation: 0,
  },
};
