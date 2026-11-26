# Camada de protótipo: onde fica a fronteira e como remover

Escrito em 16/11/2026, junto com a entrega "Ajustes da reunião de 13/11". Atualizado em 26/11/2026 com a entrega
"Validade: regras de 19/11" (rota, cenários e as telas ilustrativas de Notas Fiscais e Saldo).

O repositório tem duas coisas diferentes: as **telas** (o que vai para o desenvolvimento) e a **camada de
protótipo** (o que só existe para demonstrar as telas). Este documento diz onde uma termina e a outra começa.

## A regra

Tudo o que existe só para o protótipo mora em `src/prototipo/` e entra no app por um ponto só: a chamada
`instalarPrototipo({ app, router, pinia })` no `src/main.ts`.

As telas (`src/pages`, `src/components`, `src/stores`, `src/router`, `src/data`) não importam nada de
`src/prototipo`. A camada conhece as telas; as telas não conhecem a camada.

## O que tem na camada

| Pasta | O que é |
|---|---|
| `src/prototipo/index.ts` | O ponto de entrada. Registra as rotas da camada, trata `?perfil=`, `?demo=` e `?simular=` e monta a raiz das jornadas fora da árvore do `App.vue` |
| `src/prototipo/fluxos/` | O motor das jornadas guiadas: painel sobreposto, cursor, destaque da ação, passo a passo, executar direto, velocidade. Os dados das jornadas ficam em `fluxos/dados/` |
| `src/prototipo/entregas/` | O catálogo das entregas (`catalogo.ts`) e as páginas `/fluxos` (cards por entrega) e `/fluxos/<entrega>` (as jornadas da entrega, com o minuto da reunião e o que muda) |
| `src/prototipo/cenarios/` | Os pontos de partida do complemento do operador (`?demo=`) e a simulação da análise que começa durante a edição (`?simular=analise-comecou`). A faixa "Protótipo · Reiniciar demonstração" saiu da tela em 16/11 |
| `src/prototipo/fluxos/AtalhoDasJornadas.vue` | O atalho "Jornadas do protótipo" no pé do menu lateral, em todas as telas logadas, que leva a `/fluxos`. Substitui o rodapé do explorador de cenários (16/11) |

A camada acha os elementos da tela por papel e nome acessível, como um leitor de tela. Por isso as telas não
levam nenhuma marcação de jornada.

## Como remover a camada

1. Apagar a pasta `src/prototipo/`.
2. No `src/main.ts`, apagar a linha do `import { instalarPrototipo }` e a chamada `instalarPrototipo(...)`.

É só isso para o app compilar e rodar sem jornadas, cenários e simulações. Ficam sem efeito, e podem sair
depois, com calma:

- o link "Jornadas do protótipo" no rodapé de `src/pages/EntrarPage.vue` (a rota `/fluxos` deixa de existir);
- os atributos `data-prototipo` que restarem (são só um aviso para a camada não procurar alvo ali dentro).

## Rotas e parâmetros da camada

| Endereço | O que faz |
|---|---|
| `/fluxos` | Cards por entrega |
| `/fluxos/validade-19nov` | As quatro jornadas das regras de validade da Claudia, de 19/11, e a jornada de apresentação em capítulos |
| `/apresentacao-validade` | A apresentação em slides da validade (26/11): capa, o caso, o quadro dos seis ajustes que vai sendo riscado e a tela ao vivo, com o protótipo embutido. `?cena=N` abre direto num slide. Código em `src/prototipo/apresentacao` |
| `/fluxos/ajustes-13nov` | As jornadas L1 a L5 da reunião de 13/11 |
| `/fluxos/anteriores` | Os nove fluxos de antes das entregas |
| `?perfil=<gestora\|verificador\|admin\|operador>` | Entra no perfil sem passar pelo login |
| `?fluxo=<id>&modo=<manual\|auto>` | Abre a jornada: `manual` é o passo a passo, `auto` é o executar direto |
| `?demo=<cenário>` | Leva o complemento a um ponto de partida: `enviado`, `devolvido`, `corrigido`, `proposta`, `aprovado`, `vencendo`, `regularizacao`, `atualizado-no-prazo`, `vencido`, `atualizado`. Na validade de 19/11: `vencendo` é antes de vencer (troca já aberta), `regularizacao` é vencido dentro dos 10 dias (parcialmente ativo), `atualizado-no-prazo` é o documento novo enviado nesses 10 dias, `vencido` é o bloqueio total a partir do 11º dia e `atualizado` é o documento novo enviado depois do bloqueio |
| `?simular=analise-comecou` | A próxima gravação da edição encontra a análise já começada |

Os parâmetros saem da barra de endereço depois de aplicados.

## O que é de protótipo e ainda está dentro das telas

Fica registrado para não ir ao desenvolvimento como se fosse produto. Nada disto é jornada, e nenhum foi movido
nesta rodada:

| Onde | O que é | Por que ficou |
|---|---|---|
| `src/stores/complemento.ts`, persistência em `sessionStorage` | Faz o papel do servidor: guarda o cadastro para a demonstração trocar de perfil | É o dado mockado do protótipo. No sistema vira chamada de API |
| `src/stores/complemento.ts`, `relogio` | Data dos eventos quando o exemplo se passa em outro dia (a história da validade é em dezembro) | Idem: no sistema a data vem do servidor |
| `src/stores/complemento.ts`, anexo simulado (`anexarArquivo`, `anexarDocumentoNovo`) | Clicar no Dropzone anexa um arquivo de exemplo | Não há upload de verdade no protótipo |
| `src/pages/EntrarPage.vue` e `src/stores/sessao.ts` | Login provisório, sem autenticação | A tela de login do sistema já existe e fica como está |
| `src/pages/EmailsOperadorPage.vue` | Moldura de cliente de e-mail e o seletor de qual e-mail mostrar | O que vai ao desenvolvimento é o corpo do e-mail (bloco `.em`), não a moldura |
| `src/components/gestora/ExploradorCenarios.vue` e `src/stores/explorador.ts` | Explorador de cenários dos dashboards, no rodapé do menu | É anterior a esta camada e está descrito no `CLAUDE.md`. Mover para `src/prototipo` fica como passo seguinte |
| `src/stores/complemento.ts`, `soDocumentos` e `problemas` | A conferência só em Documentos, proposta em 13/11 | Virou regra em 16/11 (PR #48): `soDocumentos` nasce ligado em todo o protótipo e dado errado se aponta com "Apontar problema" no bloco. O ramo da conferência campo a campo segue no código, desligado |
| `src/pages/OperadorNotasFiscaisPage.vue` e `OperadorSaldoPage.vue` | Notas Fiscais e Saldo do operador, criadas em 26/11 só para mostrar o que fica suspenso e o que segue no período parcialmente ativo | Não têm referência no sistema: são ilustrativas. Vale só a regra (incluir nota nova fica suspenso, transferir crédito segue liberado), não a tela |

## Como acrescentar uma entrega

1. Um item em `src/prototipo/entregas/catalogo.ts`, com as linhas, o minuto e a frase do que muda.
2. Um arquivo em `src/prototipo/fluxos/dados/` com o bloco (`entrega: '<id>'`) e os fluxos; o id do bloco em
   `BlocoId` (`fluxos/tipos.ts`) e uma linha em cada lista de `fluxos/dados/index.ts`.
3. Se a jornada precisa de um ponto de partida novo, um cenário em `src/prototipo/cenarios/complemento.ts`,
   montado só com as ações públicas da store.

Para conferir os dados de uma jornada sem animação, com a tela já no ponto de partida:
`await window.__fluxos.testar('<id do fluxo>')` no console devolve `{ ok, passo, acao, erro }`.
