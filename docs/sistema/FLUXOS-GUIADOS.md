# Fluxos guiados do protótipo

Camada do protótipo, fora do produto. Portada em 04/11/2026 do protótipo React do SISLOG
(`SEAD/sislog-prototipo/src/fluxos`, especificação em `docs/ARQUITETURA.md` §23). Comportamento e textos são os
mesmos de lá; este documento cobre o contrato dos dados, como iniciar e o que mudou.

Cada fluxo tem dois modos com os mesmos dados:

- **Automático**: um cursor virtual vai devagar até o alvo e faz o gesto. Quem apresenta só narra. Velocidade
  Normal ou Lenta (tudo 1,7 vez mais lento), Reproduzir tudo, Pausar e Continuar.
- **Manual**: o painel diz o gesto, o alvo fica destacado em rosa e o passo avança quando a pessoa faz o gesto de
  verdade. O último "olhar" do passo espera o botão Entendi.

## Onde está cada peça

| Peça | Arquivo |
|---|---|
| Contrato (Fluxo, Passo, Acao, Alvo, Inicio) | `src/fluxos/tipos.ts` |
| Dados, um arquivo por bloco | `src/fluxos/dados/operador.ts`, `src/fluxos/dados/admin.ts` |
| Ordem dos blocos e da lista | `src/fluxos/dados/index.ts` |
| Achar o alvo (papel e nome acessível, texto, CSS) | `src/fluxos/alvo.ts` |
| Executar as ações e a cadência do automático | `src/fluxos/motor.ts` |
| Acompanhar o gesto no manual | `src/fluxos/manual.ts` |
| Cursor, destaque, pílula, véu e cortina | `src/fluxos/camada.ts`, `camada.css` |
| Lugar do painel e espaço no fim da rolagem | `src/fluxos/posicao.ts`, `posicao.css` |
| Estado do fluxo ativo na aba | `src/fluxos/sessao.ts` |
| Preparar, executar, pausar, voltar, repetir | `src/fluxos/execucao.ts` |
| Iniciar por carga completa e o `limpar` | `src/fluxos/iniciar.ts` |
| Lista, cadeia `depoisDe`, próximo fluxo, endereço | `src/fluxos/registro.ts` |
| O painel | `src/fluxos/PainelDoFluxo.vue` |
| A página `/fluxos` | `src/fluxos/FluxosPage.vue` |
| A raiz (`?perfil=`, `?fluxo=`, monta o painel) | `src/fluxos/RaizDosFluxos.vue`, montada no `App.vue` |
| API de console (`window.__fluxos`) | `src/fluxos/raiz.ts`, `src/fluxos/api.ts` |

O painel e a página carregam sob demanda. Sem fluxo ativo, só a raiz e o estado da sessão entram no pacote
principal. Tudo o que é da camada leva `data-prototipo`: o alvo nunca é procurado ali dentro.

## O contrato dos dados

Um fluxo começa de um estado conhecido (`inicio`: rota e perfil) e tem passos. Cada passo é um gesto curto
(`fazer`), o que observar depois (`observar`, opcional) e as ações que executam o gesto.

O alvo se acha preferencialmente por **papel e nome acessível**, como o `getByRole` do Playwright: não pede
nenhuma marcação nas telas. Nome e texto casam por trecho, sem diferença de maiúscula; `exato: true` exige o texto
todo. `dentro` procura só dentro de outro alvo; `n` pega o enésimo (a partir de 0). Texto visível serve para o que
não é controle; CSS só em último caso.

Ações: `clicar`, `marcar`, `digitar` (com `texto`), `escolher` (com `opcao`), `passar`, `tecla`, `rolar`, `olhar`
(com `rotulo` obrigatório) e `esperar` (com `ms`). Sem `rotulo`, a pílula se monta sozinha ("Clique em Enviar").

`inicio.limpar` lista chaves do armazenamento com o nome completo. Elas saem do `sessionStorage` e do
`localStorage` antes da carga. Um `*` no fim apaga pelo prefixo (`'rg:complemento:*'`). As chaves da própria
camada (`rg-proto:*`) nunca saem por aqui.

`inicio.depoisDe` aponta outro fluxo que precisa ter acontecido antes. A carga parte do início do primeiro da
cadeia e os anteriores são refeitos rápido, atrás da cortina "Preparando o fluxo…".

Exemplo de um fluxo de dois passos:

```ts
import type { BlocoDeFluxos, Fluxo } from '../tipos';

export const BLOCO_OPERADOR: BlocoDeFluxos = { id: 'operador', titulo: 'Operador logístico' };

export const FLUXOS_OPERADOR: Fluxo[] = [
  {
    id: 'operador-entrada',
    bloco: 'operador',
    tipo: 'principal',
    titulo: 'Entrar como operador logístico',
    apresentacao: 'O operador entra no sistema pelo login provisório e cai direto no complemento de cadastro.',
    regras: [{ ref: 'Planning de 16/10', texto: 'O complemento tem cinco etapas, todas obrigatórias.' }],
    inicio: { rota: '/entrar', perfil: 'operador', limpar: ['rg:complemento:*'] },
    passos: [
      {
        fazer: 'Escolha Operador Logístico.',
        observar: 'O botão de entrar passa a dizer o perfil escolhido.',
        acoes: [
          { tipo: 'olhar', alvo: { papel: 'heading', nome: 'Entrar no sistema' }, rotulo: 'O login provisório', ms: 2000 },
          { tipo: 'marcar', alvo: { papel: 'radio', nome: 'Operador Logístico' }, rotulo: 'Escolha Operador Logístico' },
        ],
      },
      {
        fazer: 'Clique em Entrar.',
        observar: 'O sistema abre o complemento de cadastro, na primeira etapa.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Entrar como Operador Logístico' } }],
      },
    ],
  },
];
```

Na página `/fluxos`, dentro de cada bloco, os fluxos `principal` e `alternativo` vêm primeiro e os de `excecao`
depois, na ordem do array. Um bloco novo pede um arquivo em `dados/`, o id em `BlocoId` (`tipos.ts`) e uma linha em
cada lista de `dados/index.ts`.

## Como iniciar

- Pela página **`/fluxos`** (link "Fluxos do protótipo" no rodapé do login): Iniciar automático ou Iniciar manual.
- Por **endereço**, numa carga completa:
  `/<rota>?perfil=<gestora|verificador|admin|operador>&fluxo=<id>&modo=<manual|auto>`.
  Exemplo: `/entrar?perfil=operador&fluxo=operador-entrada&modo=auto`. Chegando assim, a raiz faz a limpeza do
  início e recarrega uma vez.
- Pelo **console**: `await window.__fluxos.iniciar('operador-entrada', 'manual')`. Para conferir os dados sem
  animação, com a tela já no ponto de partida: `await window.__fluxos.testar('operador-entrada')` devolve
  `{ ok, passo, acao, erro }`. `window.__fluxos.registrar(fluxo)` ensaia um fluxo fora de `dados/` (fica na aba).

O `?perfil=` sozinho também funciona fora de um fluxo: `/operador?perfil=operador` entra no perfil pela store da
sessão e o parâmetro sai da barra. Em `/entrar` ele não entra na store: só pré-seleciona a opção, como já fazia.

## O que mudou em relação ao SISLOG

- **Vue no lugar de React.** O painel, a página e a raiz viraram componentes Vue; `sessao.ts` e `execucao.ts`
  usam `shallowRef` no lugar do `useSyncExternalStore`. O motor, o alvo, o manual, a camada e a posição são os
  mesmos arquivos, com os eventos nativos que o Vue ouve igual (o `input` do `v-model`, o `click` que marca o
  rádio).
- **Chaves da sessão**: `rg-proto:v1:fluxo`, `rg-proto:v1:fluxo-preferencias` e as auxiliares no mesmo prefixo.
- **Sem a versão da aba Documentação** no início (não existe aqui) e sem a ligação com as jornadas de
  conferência.
- **`limpar` genérico**: nome completo da chave, nos dois armazenamentos, com `*` de prefixo. No SISLOG era só o
  `localStorage`, com prefixo fixo.
- **Perfil**: entra pela store do Pinia no setup da raiz, antes do guard do router rodar a primeira navegação. No
  SISLOG quem fazia isso era o `ExigeSessao`.
- **Obstáculos do painel**: os papéis ARIA (dialog, alertdialog, menu, listbox, tooltip), o popover do período
  restritivo da gestora e o painel do explorador de cenários. Uma camada com papel que cobre a tela quase inteira
  (o véu) conta pelos filhos. Paginação só por `nav` com "paginação" no nome (nenhuma tela tem hoje).
- **Fim da rolagem**: aqui quem rola é a página inteira, então o espaço sob o painel vai no fim do `<body>`. Outro
  contêiner com rolagem própria entra com o atributo `data-fluxo-rola`.
- **Canto inferior esquerdo** sem a subida de 80 px: o toast do Recicla é centralizado embaixo.
- **Botões e ícones**: um `BotaoDoFluxo.vue` próprio da camada com ícones `mdi-*`, no lugar do Button da
  biblioteca do SISLOG e dos glifos Material Symbols.
- **Fora do port**: o executor por Playwright (`scripts/testar-fluxos.mjs`) e os testes de acessibilidade do
  painel. A API `window.__fluxos.testar` ficou, para conferir dados pelo console.

A cor do destaque é o rosa de anotação `#E0287D`, fora dos tokens `--rg-*` de propósito: ninguém confunde com a
interface.
