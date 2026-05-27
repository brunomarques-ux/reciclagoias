import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { reciclagoiasLight, reciclagoiasDefaults } from '@/design-system/vuetify-theme';

export const vuetify = createVuetify({
  defaults: reciclagoiasDefaults,
  theme: {
    defaultTheme: 'reciclagoiasLight',
    themes: {
      reciclagoiasLight,
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
});
