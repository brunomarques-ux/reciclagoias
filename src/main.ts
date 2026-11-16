import { createApp } from 'vue';
import { createPinia } from 'pinia';

import './styles/fonts.css';
import './design-system/tokens/index.css';
import './styles/globals.css';

import App from './App.vue';
import { router } from './router';
import { vuetify } from './plugins/vuetify';
// Camada do protótipo (jornadas guiadas, cenários, simulações): o único ponto em que ela toca o app.
// Para exportar as telas sem ela, apague esta linha, a chamada abaixo e a pasta src/prototipo.
import { instalarPrototipo } from './prototipo';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
// antes do roteador entrar no app: as rotas da camada precisam existir na primeira navegação
instalarPrototipo({ app, router, pinia });
app.use(router);
app.use(vuetify);

app.mount('#app');
