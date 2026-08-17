/**
 * Mocks da sessão — perfis do login provisório e quem entra no sistema.
 *
 * O login não tem autenticação: escolhe o perfil, grava na store e redireciona
 * (docs/sistema/PLANO-AREA-GESTORA.md §3).
 *
 * `Usuario` é separado de `Entidade` de propósito: o verificador e o admin são
 * **pessoas/órgão**, não entidades gestoras — misturar os dois faria a TopBar mostrar
 * as iniciais de uma "entidade" chamada Renaldo Nikael.
 */

export type PerfilId = 'gestora' | 'verificador' | 'operador' | 'admin';

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
    rota: '/verificador',
  },
  {
    id: 'admin',
    nome: 'Administração (SIC)',
    descricao: 'Acompanha metas, massa recuperada e a documentação de todas as entidades.',
    icone: 'mdi-shield-account-outline',
    rota: '/admin',
  },
  {
    id: 'operador',
    nome: 'Operador Logístico',
    descricao: 'Registra coleta, transporte e destinação da massa reciclável.',
    icone: 'mdi-truck-outline',
    rota: null,
  },
];

export interface Usuario {
  /** Vai no "Olá, ..." e no avatar da TopBar. */
  nome: string;
  iniciais: string;
  /** Segunda linha do cabeçalho: quem é essa pessoa no sistema. */
  identificacao: string;
}

export const USUARIOS: Record<PerfilId, Usuario> = {
  gestora: {
    nome: 'Testador Company',
    iniciais: 'TC',
    identificacao: 'Entidade gestora · CNPJ 41.536.241/0001-37',
  },
  verificador: {
    nome: 'Renaldo Nikael',
    iniciais: 'RN',
    identificacao: 'Verificador de resultados · Recicla Goiás',
  },
  admin: {
    nome: 'SIC',
    iniciais: 'SI',
    identificacao: 'Bem-vindo(a) ao sistema Recicla Goiás.',
  },
  operador: {
    nome: 'Operador Logístico',
    iniciais: 'OL',
    identificacao: 'Bem-vindo(a) ao sistema Recicla Goiás.',
  },
};

/** Itens do menu lateral por perfil. Só o Dashboard tem tela nesta fatia. */
export interface ItemMenu {
  rotulo: string;
  icone: string;
  rota: string | null;
}

export const MENUS: Record<PerfilId, ItemMenu[]> = {
  gestora: [
    { rotulo: 'Dashboard', icone: 'mdi-view-dashboard', rota: '/gestora' },
    { rotulo: 'Minha Conta', icone: 'mdi-account', rota: null },
    { rotulo: 'Planos', icone: 'mdi-clipboard-text', rota: null },
    { rotulo: 'Relatórios', icone: 'mdi-file-document', rota: null },
  ],
  verificador: [
    { rotulo: 'Dashboard', icone: 'mdi-view-dashboard', rota: '/verificador' },
    { rotulo: 'Minha Conta', icone: 'mdi-account', rota: null },
    { rotulo: 'Notas Fiscais', icone: 'mdi-receipt-text', rota: null },
    { rotulo: 'Relatórios', icone: 'mdi-file-document', rota: null },
  ],
  admin: [
    { rotulo: 'Dashboard', icone: 'mdi-view-dashboard', rota: '/admin' },
    { rotulo: 'Minha Conta', icone: 'mdi-account', rota: null },
    { rotulo: 'Planos', icone: 'mdi-clipboard-text', rota: null },
    { rotulo: 'Relatórios', icone: 'mdi-file-document', rota: null },
  ],
  operador: [
    { rotulo: 'Dashboard', icone: 'mdi-view-dashboard', rota: null },
    { rotulo: 'Minha Conta', icone: 'mdi-account', rota: null },
  ],
};

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
