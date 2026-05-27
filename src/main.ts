import { createApp } from 'vue';
import { createPinia } from 'pinia';

import './styles/fonts.css';
import './design-system/tokens/index.css';
import './styles/globals.css';

import App from './App.vue';
import { router } from './router';
import { vuetify } from './plugins/vuetify';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);

app.mount('#app');
