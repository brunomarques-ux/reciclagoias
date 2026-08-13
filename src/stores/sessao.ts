import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { ENTIDADE_MOCK, PERFIS, type PerfilId } from '@/data/mocks/sessao';

const CHAVE_STORAGE = 'rg:sessao:perfil';

/**
 * Sessão provisória do protótipo. Não é autenticação: guarda o perfil escolhido
 * no login e é o que o guard do router consulta para liberar `/gestora`.
 *
 * Persiste em `sessionStorage` só para o reload da página não expulsar quem está
 * navegando no protótipo — some ao fechar a aba.
 */
export const useSessaoStore = defineStore('sessao', () => {
  const perfilId = ref<PerfilId | null>(lerPerfilSalvo());

  const perfil = computed(() => PERFIS.find((p) => p.id === perfilId.value) ?? null);
  const entidade = computed(() => (perfilId.value ? ENTIDADE_MOCK : null));
  const autenticado = computed(() => perfilId.value !== null);

  function entrar(id: PerfilId) {
    perfilId.value = id;
    sessionStorage.setItem(CHAVE_STORAGE, id);
  }

  function sair() {
    perfilId.value = null;
    sessionStorage.removeItem(CHAVE_STORAGE);
  }

  return { perfilId, perfil, entidade, autenticado, entrar, sair };
});

function lerPerfilSalvo(): PerfilId | null {
  const salvo = sessionStorage.getItem(CHAVE_STORAGE);
  return PERFIS.some((p) => p.id === salvo) ? (salvo as PerfilId) : null;
}
