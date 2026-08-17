import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { ENTIDADE_MOCK, MENUS, PERFIS, USUARIOS, type PerfilId } from '@/data/mocks/sessao';

const CHAVE_STORAGE = 'rg:sessao:perfil';

/**
 * Sessão provisória do protótipo. Não é autenticação: guarda o perfil escolhido
 * no login e é o que o guard do router consulta para liberar as áreas logadas.
 *
 * Persiste em `sessionStorage` só para o reload da página não expulsar quem está
 * navegando no protótipo — some ao fechar a aba.
 */
export const useSessaoStore = defineStore('sessao', () => {
  const perfilId = ref<PerfilId | null>(lerPerfilSalvo());

  const perfil = computed(() => PERFIS.find((p) => p.id === perfilId.value) ?? null);
  const usuario = computed(() => (perfilId.value ? USUARIOS[perfilId.value] : null));
  const menu = computed(() => (perfilId.value ? MENUS[perfilId.value] : []));
  /** Só a entidade gestora representa uma entidade; os outros perfis são pessoas/órgão. */
  const entidade = computed(() => (perfilId.value === 'gestora' ? ENTIDADE_MOCK : null));
  const autenticado = computed(() => perfilId.value !== null);

  function entrar(id: PerfilId) {
    perfilId.value = id;
    sessionStorage.setItem(CHAVE_STORAGE, id);
  }

  function sair() {
    perfilId.value = null;
    sessionStorage.removeItem(CHAVE_STORAGE);
  }

  return { perfilId, perfil, usuario, menu, entidade, autenticado, entrar, sair };
});

function lerPerfilSalvo(): PerfilId | null {
  const salvo = sessionStorage.getItem(CHAVE_STORAGE);
  return PERFIS.some((p) => p.id === salvo) ? (salvo as PerfilId) : null;
}
