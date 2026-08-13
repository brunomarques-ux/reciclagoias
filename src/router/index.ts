import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import { useSessaoStore } from '@/stores/sessao';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/pages/LandingPage.vue'),
  },
  {
    path: '/apresentacao',
    name: 'apresentacao',
    component: () => import('@/pages/PresentationView.vue'),
  },
  {
    path: '/consulta',
    name: 'consulta',
    component: () => import('@/pages/ConsultaPage.vue'),
  },
  {
    path: '/consulta/validar',
    name: 'consulta-validar',
    component: () => import('@/pages/ConsultaValidarPage.vue'),
  },

  // ----- Área logada (login provisório, sem autenticação real) -----
  {
    path: '/entrar',
    name: 'entrar',
    component: () => import('@/pages/EntrarPage.vue'),
  },
  {
    path: '/gestora',
    name: 'gestora',
    component: () => import('@/pages/GestoraDashboardPage.vue'),
    meta: { requerPerfil: true },
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

/** Guard do protótipo: sem perfil na store, a área logada volta para o login. */
router.beforeEach((to) => {
  if (!to.meta.requerPerfil) return true;

  const sessao = useSessaoStore();
  if (sessao.autenticado) return true;

  return { name: 'entrar', query: { destino: to.fullPath } };
});
