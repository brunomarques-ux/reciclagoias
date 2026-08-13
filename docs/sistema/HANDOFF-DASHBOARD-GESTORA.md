---
doc: HANDOFF_DASHBOARD_GESTORA
modulo: sistema/entidade-gestora
rota_base: /gestora
tags: [dashboard, status-documentacao, design-system, biblioteca-de-componentes]
ultima_revisao: 2026-08-12
---

# Dashboard da Entidade Gestora — o que foi construído

Companheiro de [`JUSTIFICATIVA-DASHBOARD-GESTORA.md`](JUSTIFICATIVA-DASHBOARD-GESTORA.md).

**A justificativa responde "por que o período restritivo ficou assim"** — as três hipóteses,
o popover, o seletor de ano e a evidência. **Este documento responde "o que mudou no
dashboard e o que disso vira componente"**: a atualização da estética, o Status da
Documentação, as regras que cada peça passou a carregar e o que fica pronto para a
biblioteca.

O registro em formato de consulta rápida fica em [`DECISOES-UX.md`](DECISOES-UX.md).

---

## 1. O que está no ar

| Rota | O que é |
|---|---|
| `/entrar` | Login **provisório**: escolhe o perfil e entra. Não há senha, não há autenticação |
| `/gestora` | Dashboard da Entidade Gestora |

Três perfis aparecem no login — Entidade Gestora, Verificador de Resultados e Operador
Logístico. Só o primeiro tem tela; os outros ficam marcados como **"Em breve"**. É o que
comunica o mapa do sistema sem prometer o que ainda não existe.

Tudo é **protótipo de UX em código**: dados mockados, sem backend. O objetivo é validar
comportamento e forma antes de levar para o sistema real.

### Como explorar os cenários

No rodapé do menu lateral existe **"Explorar cenários"**. Ele abre um painel que edita a tela
ao vivo — é ferramenta de protótipo, não faz parte do produto:

- **Cenários do Figma** em um clique: `Hoje`, `REC-01`, `REC-02`, `REC-03`, `REC-06` e
  `Variações da linha`.
- **Status da Documentação**: liga/desliga cada status e muda a quantidade. O total é
  recalculado sozinho.
- **Período restritivo**: um interruptor por card e a lista das ações liberadas. Dá para ver
  o card com 1, 6 ou 20 ações sem sair do lugar — inclusive a lista do popover começando a
  rolar.

O painel também impõe as regras: ligar o período libera a primeira ação e desmarcar a última
desliga o período. **`n = 0` é inalcançável pela interface**, como manda a decisão.

---

## 2. Status da Documentação: barra empilhada no lugar do gráfico

O título é requisição do cliente e fica. O que mudou foi a representação: o gráfico de barra
horizontal com legenda separada virou **uma linha por tipo de documento**, com barra empilhada
e contagem escrita.

A linha é o módulo e se adapta sozinha:

| Situação | O que aparece |
|---|---|
| 0 documentos | Frase: *"Nenhum plano enviado ainda."* Sem barra, sem contagem |
| 1 status | Ponto colorido + contagem. **Sem barra** — com um status só, proporção não significa nada |
| ≥ 2 status | Barra empilhada + contagem por status, que quebra em duas linhas quando precisa |

Três decisões dentro disso:

- **A contagem fica escrita, não só na cor.** A legenda separada obrigava o vaivém entre a
  barra e a legenda; aqui cada status carrega o próprio rótulo e número.
- **Status zerado não aparece.** Mostrar "0 retificados" gasta linha para não dizer nada.
- **As cores seguem o semáforo do design system** (sucesso, info, atenção, neutro), não uma
  escala de verdes — três tons do mesmo verde são indistinguíveis para boa parte das pessoas.

E uma decisão de modelo, não de pixel: **o total nunca é digitado, é a soma dos status**. Isso
elimina a classe inteira de bug em que o número do cabeçalho discorda da lista.

---

## 3. O que mudou na estética do dashboard

A atualização não foi troca de skin. O que guiou:

- **Densidade de gov-tech sério.** Cartões brancos sobre fundo de página, borda de 1px em vez
  de sombra pesada, raio de 12px, Inter numa escala fechada (11 · 12 · 13 · 14 · 16 · 20 ·
  28). Nada de sombra dupla, gradiente decorativo ou ícone grande de enfeite.
- **Uma coisa por bloco.** Cabeçalho (quem é você + qual exercício), faixa de contexto,
  documentação à esquerda, prazos à direita. A faixa de contexto existe porque "ano de
  execução" e "ano base" aparecem juntos e significam coisas diferentes — a descrição ao lado
  do número é o que evita a confusão.
- **A cor carrega significado, não decoração.** Verde de marca para ação e estado positivo,
  vermelho só para o estado restritivo, âmbar para "em andamento", cinza para "cancelado".
  Quem lê a tela em preto e branco continua entendendo, porque a contagem está escrita.
- **Largura total, não caixa centralizada.** O conteúdo vai do recuo depois do menu até o
  recuo da direita, em qualquer tela. Travar numa largura fixa e centralizar fazia a tela
  cheia parecer que não foi feita sob medida — num monitor 4K, pior ainda. O que cresce com a
  tela é o recuo (40 → 80px), a coluna lateral (360 → 520px) e a barra empilhada
  (320 → 560px), sempre com a medida do frame de 1440 como piso.
- **Responsividade mínima e honesta.** Abaixo de 1120px a coluna lateral desce e os dois
  cards de prazo dividem a linha; abaixo de 1024px o menu vira trilha de ícones; abaixo de
  720px o cabeçalho empilha. O Figma só tem o desktop de 1440 — o resto foi decidido em
  código para o protótipo não quebrar, e está registrado no `CLAUDE.md`.

### Acessibilidade, que não é etapa final

- Lista é `<ul><li>` de verdade, não `<div>` com bullet desenhado.
- O gatilho do popover é `<button aria-expanded>` com `aria-controls`; fecha com `Esc` e com
  clique fora, e o foco volta para o gatilho.
- O seletor de ano é um grupo de botões com rótulo acessível, não um `select`: `←` `→` andam
  na série, `Home`/`End` vão para os extremos, e as setas desabilitam com `disabled` — não só
  com cor.
- Contraste AA, foco visível em tudo que é operável, `prefers-reduced-motion` respeitado.

---

## 4. O que isso deixa para a biblioteca de componentes

O dashboard foi construído para produzir peças reutilizáveis, não uma tela isolada. **Cada
componente carrega a regra de UX junto** — quem instanciar não precisa reaprender a decisão,
e não consegue produzir um estado inválido por descuido.

| Componente | O que resolve | Regra que ele já carrega |
|---|---|---|
| `DeadlineCard` | Card de prazo com e sem período restritivo | Não muda de altura com `n`; `n = 1` mostra a ação na frase; `n = 0` não existe |
| `RestrictedPeriodPopover` | Camada de consulta ancorada | Clique (nunca hover), sem scrim, lista trava em 240px acima de 11 itens |
| `DocumentationRow` + `StackedBar` | Linha de status de documento | 0 → frase · 1 → sem barra · 2+ → barra; status zerado some; total é a soma |
| `YearSegmented` | Filtro de exercício que escala | Selecionado sempre no centro; janela trava e seta desabilita nos extremos |
| `ContextStrip` | Faixa de contexto do exercício | Rótulo + valor + o que aquele ano significa |
| `TopBar` / `SideMenu` (`Platform=recicla`) | Chrome do produto | Já publicados na Fundação GO |

Isso é o que muda o custo da próxima tela: os quatro primeiros nasceram inline no desenho e
foram promovidos a componente **antes** de existir a segunda tela que os usa — é a hora certa,
porque a regra ainda está fresca e a API sai da regra, não do layout.

### Efeitos já registrados na Fundação GO

A biblioteca é multi-produto e o Recicla Goiás é um dos produtos que ela atende, com tema de
marca próprio. Foram adicionados: `TopBar` e `SideMenu` com `Platform=recicla`, as semânticas
`chrome/topbar-recicla` e `chrome/sidebar-recicla`, e o `Icon/info` — que faltava no set de 26
ícones e é genérico, não específico do Recicla.

### Tokens

As telas nascem em `--rg-*` (o sistema do app), com mapa explícito para a Fundação GO. Duas
conversões conscientes, registradas para não virarem dívida silenciosa:

- **Raio de card:** 14px no Figma; a escala do app vai de 12 para 16 — ficou **12**. Dois
  pixels não valem um token novo.
- **Escala de espaço:** não indexa igual entre os dois sistemas. O mapeamento é **por valor**,
  nunca pelo número do token (`space/7` do Figma = 32px = `--rg-space-8`).

Quando a Fundação GO for publicada como biblioteca, migrar é renomear, não reescrever.

---

## 5. O que ainda falta

- [ ] **Camada do ponto de uso** — na tela onde a ação acontece (Resumo do Relatório), o
      controle bloqueado aparece desabilitado com a razão inline. É a fonte de verdade; o card
      é só o aviso. É a pendência mais importante desta rodada.
- [ ] Telas de Planos, Relatórios e Certificados (o dashboard só aponta para elas).
- [ ] Autenticação real, sessão e permissão por perfil.
- [ ] Teste com 5 entidades gestoras para validar o rótulo do gatilho — ver a seção
      "Onde estas decisões são frágeis" da justificativa.
