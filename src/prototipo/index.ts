// A CAMADA DO PROTÓTIPO, num ponto só. Tudo o que existe só para o protótipo mora em src/prototipo e entra no app
// por esta função, chamada uma vez no main.ts:
//
//   fluxos/     o motor das jornadas guiadas, o painel sobreposto, o cursor e o destaque
//   entregas/   o catálogo das entregas e as páginas /fluxos e /fluxos/<entrega>
//   cenarios/   os pontos de partida (?demo=), as simulações (?simular=) e as ferramentas da tela do operador
//
// As telas não importam nada daqui. Para levar o código ao desenvolvimento sem a camada: apagar esta pasta e as duas
// linhas do main.ts. O passo a passo e o que mais é de protótipo estão em docs/sistema/CAMADA-DE-PROTOTIPO.md.
import { h, render, type App } from 'vue';
import type { Pinia } from 'pinia';
import type { Router } from 'vue-router';

import { PERFIS, type PerfilId } from '@/data/mocks/sessao';
import { registrarSemeadorDeExemplos } from '@/stores/complemento';
import { useSessaoStore } from '@/stores/sessao';

import { aplicarCenario, ehCenario, ligarGanchoDaSimulacao, semearExemplo, simulandoAnalise } from './cenarios/complemento';
import RaizDosFluxos from './fluxos/RaizDosFluxos.vue';

/**
 * Chamar depois do `app.use(pinia)` e ANTES do `app.use(router)`: a primeira navegação começa quando o roteador
 * entra no app, e as rotas da camada e o perfil do endereço precisam estar lá.
 */
export function instalarPrototipo({ app, router, pinia }: { app: App; router: Router; pinia: Pinia }): void {
  // 0. ?perfil=<id> entra na sessão antes do guard de perfil do roteador (um link de jornada abre direto na tela)
  const perfil = new URLSearchParams(window.location.search).get('perfil');
  if (PERFIS.some((p) => p.id === perfil) && window.location.pathname !== '/entrar') {
    const sessao = useSessaoStore(pinia);
    if (sessao.perfilId !== perfil) sessao.entrar(perfil as PerfilId);
  }

  // 0b. os cadastros de exemplo da fila do Admin nascem no estado da coluna situacao (CADASTROS_DE_EXEMPLO)
  registrarSemeadorDeExemplos(semearExemplo);

  // 1. as páginas da camada, sem perfil
  router.addRoute({
    path: '/fluxos',
    name: 'fluxos',
    component: () => import('./entregas/EntregasPage.vue'),
    meta: { titulo: 'Jornadas do protótipo' },
  });
  router.addRoute({
    path: '/fluxos/anteriores',
    name: 'fluxos-anteriores',
    component: () => import('./fluxos/FluxosPage.vue'),
    meta: { titulo: 'Fluxos anteriores' },
  });
  router.addRoute({
    path: '/fluxos/:entrega',
    name: 'fluxos-entrega',
    component: () => import('./entregas/EntregaPage.vue'),
    meta: { titulo: 'Jornadas da entrega' },
  });

  // 2. os cenários e as simulações pelo endereço: aplica, tira o parâmetro e segue para a tela
  router.beforeEach(async (to, from) => {
    const { demo, simular, ...resto } = to.query;
    if (demo === undefined && simular === undefined) return true;
    const mesmaTela = from.matched.length > 0 && from.path === to.path;
    if (ehCenario(demo)) await aplicarCenario(pinia, demo);
    if (simular === 'analise-comecou') {
      ligarGanchoDaSimulacao(pinia);
      simulandoAnalise.value = true;
    }
    const limpo = { path: to.path, query: resto, hash: to.hash, replace: true };
    // a tela já aberta segura a store antiga: recarrega no endereço limpo, com o cenário já gravado
    if (mesmaTela && ehCenario(demo)) {
      window.location.replace(router.resolve(limpo).href);
      return false;
    }
    return limpo;
  });

  // 3. a raiz das jornadas (o painel sobreposto e as ferramentas), fora da árvore do App, com o contexto dele
  //    Monta numa microtarefa: depois de o main.ts terminar de instalar o roteador e o Vuetify no app.
  void Promise.resolve().then(() => {
    const no = document.createElement('div');
    no.setAttribute('data-prototipo', '');
    document.body.appendChild(no);
    const raiz = h(RaizDosFluxos);
    raiz.appContext = app._context;
    render(raiz, no);
  });
}
