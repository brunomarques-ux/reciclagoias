/**
 * Mocks da sessão — perfis do login provisório e a entidade que entra no sistema.
 *
 * O login não tem autenticação: escolhe o perfil, grava na store e redireciona
 * (docs/sistema/PLANO-AREA-GESTORA.md §3). Os três perfis aparecem porque é o que
 * comunica o mapa do sistema; só a Entidade Gestora está pronta.
 */

export type PerfilId = 'gestora' | 'verificador' | 'operador';

export interface Perfil {
  id: PerfilId;
  nome: string;
  descricao: string;
  icone: string;
  /** Rota inicial do perfil. `null` = ainda não existe tela. */
  rota: string | null;
}

export const PERFIS: Perfil[] = [
  {
    id: 'gestora',
    nome: 'Entidade Gestora',
    descricao: 'Envia planos e relatórios, acompanha metas e recebe certificados de massa.',
    icone: 'mdi-domain',
    rota: '/gestora',
  },
  {
    id: 'verificador',
    nome: 'Verificador de Resultados',
    descricao: 'Audita relatórios e confirma a massa recuperada declarada pelas entidades.',
    icone: 'mdi-clipboard-check-outline',
    rota: null,
  },
  {
    id: 'operador',
    nome: 'Operador Logístico',
    descricao: 'Registra coleta, transporte e destinação da massa reciclável.',
    icone: 'mdi-truck-outline',
    rota: null,
  },
];

export interface Entidade {
  nome: string;
  cnpj: string;
  iniciais: string;
}

export const ENTIDADE_MOCK: Entidade = {
  nome: 'Testador Company',
  cnpj: '41.536.241/0001-37',
  iniciais: 'TC',
};
