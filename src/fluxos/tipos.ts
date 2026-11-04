// Fluxos guiados: CAMADA DO PROTÓTIPO, FORA DO PRODUTO. Portado do protótipo do SISLOG (entrega 14, 03/11/2026)
// em 04/11/2026; a especificação de origem está em SEAD/sislog-prototipo/docs/ARQUITETURA.md §23 e o que mudou aqui
// em docs/sistema/FLUXOS-GUIADOS.md.
//
// Contrato entre os dados (src/fluxos/dados/*.ts) e o motor que executa no navegador (src/fluxos/motor.ts). Um fluxo
// começa de um estado conhecido (rota e perfil) e tem passos; cada passo é um gesto ("Clique em Entrar.") com as
// ações que o executam.
//
// Dois modos usam os mesmos dados:
//   manual     o painel diz o gesto, o alvo fica destacado e o passo avança quando a pessoa faz o gesto;
//   automático o cursor virtual vai até o alvo, devagar, e faz o gesto; quem apresenta só narra.
//
// Os arquivos de dados importam só tipos (import type).
import type { PerfilId } from '../data/mocks/sessao';

/** Os blocos da página /fluxos, na ordem em que aparecem (a lista mora em dados/index.ts). */
export type BlocoId = 'operador' | 'admin';
export type TipoDeFluxo = 'principal' | 'alternativo' | 'excecao';

export interface BlocoDeFluxos {
  id: BlocoId;
  titulo: string;
  /** Uma linha abaixo do título do bloco na página /fluxos (opcional). */
  resumo?: string;
}

/** Papéis que o motor sabe achar (os mesmos nomes do getByRole do Playwright). */
export type Papel =
  | 'button' | 'link' | 'tab' | 'textbox' | 'searchbox' | 'combobox' | 'option' | 'listbox' | 'checkbox' | 'radio'
  | 'switch' | 'menuitem' | 'menuitemradio' | 'row' | 'cell' | 'columnheader' | 'heading' | 'dialog' | 'region'
  | 'tabpanel' | 'img' | 'listitem' | 'group' | 'navigation' | 'status' | 'alert';

/**
 * Como achar o elemento. Preferir papel + nome acessível (sobrevive a mudança de estilo e não pede marcação na tela);
 * texto visível para o que não é controle (um número, um título de cartão); CSS só em último caso.
 * - nome e texto: casam por trecho, sem diferença de maiúscula e com espaços normalizados; `exato` exige o texto todo.
 * - dentro: procura só dentro de outro alvo (ex.: o botão Enviar dentro da janela).
 * - n: o enésimo que casar, a partir de 0 (padrão 0, o primeiro visível).
 */
export type Alvo =
  | { papel: Papel; nome: string; exato?: boolean; dentro?: Alvo; n?: number }
  | { texto: string; exato?: boolean; dentro?: Alvo; n?: number }
  | { css: string; dentro?: Alvo; n?: number };

/**
 * Uma ação executável. `rotulo` é a pílula que aparece junto do destaque ("Clique em Entrar"); sem ele, o motor
 * monta um a partir do tipo e do nome do alvo.
 */
export type Acao =
  /** Clica no alvo. */
  | { tipo: 'clicar'; alvo: Alvo; rotulo?: string }
  /** Passa o mouse e fica sobre o alvo (abre dica, hover), por `ms` (padrão 1600). */
  | { tipo: 'passar'; alvo: Alvo; rotulo?: string; ms?: number }
  /** Digita no campo, letra a letra no automático. `limpar` apaga o que havia antes (padrão true). */
  | { tipo: 'digitar'; alvo: Alvo; texto: string; rotulo?: string; limpar?: boolean }
  /** Abre um select ou combobox (o alvo) e escolhe a opção pelo nome. */
  | { tipo: 'escolher'; alvo: Alvo; opcao: string; rotulo?: string }
  /** Marca ou desmarca uma caixa, um rádio ou uma chave. */
  | { tipo: 'marcar'; alvo: Alvo; rotulo?: string }
  /** Tecla no elemento com foco: 'Enter', 'Escape', 'Tab', 'ArrowDown'... */
  | { tipo: 'tecla'; tecla: string; rotulo?: string }
  /** Rola até o alvo ficar à vista. */
  | { tipo: 'rolar'; alvo: Alvo; rotulo?: string }
  /** Destaca o alvo sem agir: o que quem apresenta mostra e comenta (padrão 3200 ms, o tempo de uma frase). */
  | { tipo: 'olhar'; alvo: Alvo; rotulo: string; ms?: number }
  /** Pausa (ex.: esperar uma lista carregar). */
  | { tipo: 'esperar'; ms: number };

/** O estado de partida do fluxo: a rota, o perfil e o que limpar antes. */
export interface Inicio {
  /** Rota do protótipo, sem o ?perfil= (ex.: '/entrar', '/operador', '/admin/cadastros'). */
  rota: string;
  /** O perfil da sessão (src/stores/sessao.ts). Em /entrar ele não entra na store: só pré-seleciona a opção. */
  perfil: PerfilId;
  /**
   * Chaves do armazenamento apagadas antes de começar (fluxo que muda o estado do protótipo), com o nome completo
   * (ex.: 'rg:complemento:rascunho'). Saem do sessionStorage e do localStorage. Um `*` no fim apaga pelo prefixo
   * (ex.: 'rg:complemento:*').
   */
  limpar?: string[];
  /**
   * O fluxo que precisa ter acontecido antes. Ao começar, o motor parte do início DESSE fluxo (rota, perfil, limpar)
   * e executa os passos dele rápido, sem animação, atrás da cortina; depois segue com os passos deste. Pode encadear
   * (o anterior também pode ter depoisDe).
   */
  depoisDe?: string;
}

export interface PassoDoFluxo {
  /** O gesto, curto e imperativo: "Clique em Enviar cadastro." */
  fazer: string;
  /** O que observar depois do gesto, numa linha (opcional). */
  observar?: string;
  /** O que executa o gesto. O manual avança quando a pessoa faz a última ação que age (clicar, digitar...). */
  acoes: Acao[];
}

export interface Fluxo {
  /** Identificador único, em minúsculas e com hífen (ex.: 'operador-envio'). Vai no endereço (?fluxo=). */
  id: string;
  bloco: BlocoId;
  tipo: TipoDeFluxo;
  titulo: string;
  /** A abertura falada antes de iniciar: o que o fluxo mostra, em uma ou duas frases. */
  apresentacao: string;
  /** As regras que o fluxo demonstra (pode ser vazio). */
  regras: { ref: string; texto: string }[];
  inicio: Inicio;
  passos: PassoDoFluxo[];
}

export const ROTULO_DO_TIPO_DE_FLUXO: Readonly<Record<TipoDeFluxo, string>> = {
  principal: 'Fluxo principal',
  alternativo: 'Fluxo alternativo',
  excecao: 'Fluxo de exceção',
};
