import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import { useSessaoStore } from '@/stores/sessao';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/pages/LandingPage.vue'),
    meta: { titulo: 'Recicla Goiás · Logística Reversa' },
  },
  {
    path: '/apresentacao',
    name: 'apresentacao',
    component: () => import('@/pages/PresentationView.vue'),
    meta: { titulo: 'Apresentação' },
  },
  {
    // Deck próprio da proposta do Operador Logístico — apresentação nova,
    // separada da institucional de propósito (mesma view, outro conjunto de slides).
    path: '/apresentacao-operador',
    name: 'apresentacao-operador',
    component: () => import('@/pages/PresentationView.vue'),
    meta: { titulo: 'Apresentação · Operador Logístico', deck: 'complemento' },
  },
  {
    path: '/consulta',
    name: 'consulta',
    component: () => import('@/pages/ConsultaPage.vue'),
    meta: { titulo: 'Consulta de regularidade' },
  },
  {
    // Rota curta e canônica: é ela que vai impressa na certidão, e /consulta
    // fica sendo só a regularidade da empresa. `/consulta/validar` sobrevive
    // como alias porque os pacotes de entrega já publicados apontam pra lá.
    path: '/validar',
    alias: '/consulta/validar',
    name: 'consulta-validar',
    component: () => import('@/pages/ConsultaValidarPage.vue'),
    meta: { titulo: 'Validação de documento' },
  },

  // ----- Área logada (login provisório, sem autenticação real) -----
  {
    path: '/entrar',
    name: 'entrar',
    component: () => import('@/pages/EntrarPage.vue'),
    meta: { titulo: 'Entrar no sistema' },
  },
  {
    path: '/gestora',
    name: 'gestora',
    component: () => import('@/pages/GestoraDashboardPage.vue'),
    meta: { titulo: 'Dashboard da Entidade Gestora', requerPerfil: 'gestora' },
  },
  {
    path: '/verificador',
    name: 'verificador',
    component: () => import('@/pages/VerificadorDashboardPage.vue'),
    meta: { titulo: 'Dashboard do Verificador de Resultados', requerPerfil: 'verificador' },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/pages/AdminDashboardPage.vue'),
    meta: { titulo: 'Dashboard da Administração (SIC)', requerPerfil: 'admin' },
  },
  {
    // O operador entra no sistema antes de aprovado, mas só para isto: a conta
    // nasce "em complementação" e o dashboard dele só existe depois da análise.
    path: '/operador',
    name: 'operador',
    component: () => import('@/pages/OperadorComplementoPage.vue'),
    meta: { titulo: 'Complemento de cadastro', requerPerfil: 'operador' },
  },
  {
    path: '/admin/cadastros',
    name: 'admin-cadastros',
    component: () => import('@/pages/AdminCadastrosPage.vue'),
    meta: { titulo: 'Cadastros de operador logístico', requerPerfil: 'admin' },
  },
  {
    path: '/admin/cadastros/:protocolo',
    name: 'admin-analise',
    component: () => import('@/pages/AdminAnalisePage.vue'),
    meta: { titulo: 'Análise do cadastro', requerPerfil: 'admin' },
  },
  {
    // Moldura de protótipo: os e-mails do complemento num cliente de e-mail, só visual.
    path: '/emails-operador',
    name: 'emails-operador',
    component: () => import('@/pages/EmailsOperadorPage.vue'),
    meta: { titulo: 'E-mails do complemento' },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 80 };
    return { top: 0 };
  },
});

/**
 * Guard do protótipo: sem perfil na store a área logada volta para o login, e cada
 * dashboard só abre para o seu perfil — entrar como verificador e digitar /admin
 * devolve a pessoa para o dashboard dela.
 */
router.beforeEach((to) => {
  const exigido = to.meta.requerPerfil as string | undefined;
  if (!exigido) return true;

  const sessao = useSessaoStore();
  if (!sessao.autenticado) return { name: 'entrar', query: { destino: to.fullPath } };
  if (sessao.perfilId === exigido) return true;

  return sessao.perfil?.rota ?? { name: 'entrar' };
});

/**
 * WCAG 2.4.2: as oito rotas dividiam o mesmo título de aba, e com a sessão em
 * `sessionStorage` (por aba) comparar dois dashboards lado a lado dava duas abas
 * com o mesmo nome.
 *
 * O foco NÃO é movido aqui: o `h1` das telas logadas é a saudação, e este gancho
 * também dispara nos `replace` que sincronizam o `?cenario=`.
 */
router.afterEach((to) => {
  const titulo = to.meta.titulo as string | undefined;
  document.title = titulo ? `${titulo} · Recicla Goiás` : 'Recicla Goiás · Logística Reversa';
});
