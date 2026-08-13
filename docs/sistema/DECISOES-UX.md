# Recicla Goiás — Sistema · Decisões de UX

Registro das decisões de interface do **sistema** do Recicla Goiás (área logada: entidade
gestora, verificador de resultados, operador logístico). A landing page tem documentação
própria em [`HANDOFF-DESENVOLVIMENTO.md`](../HANDOFF-DESENVOLVIMENTO.md).

Nenhuma decisão aqui é derivável do código — este arquivo é a fonte da verdade quando
houver dúvida de direção.

> **Onde as telas vivem hoje.** Os esboços desta rodada estão no arquivo Figma do
> **Incentiva Goiás**, página `Telas 2026`, seção `Agosto 2026 · Recicla Goiás · Dashboard
> da Entidade Gestora`, porque é onde a biblioteca **Fundação GO** está e onde os
> componentes podem ser instanciados. O Bruno transfere para o arquivo do Recicla.

---

## D-R001 — Período restritivo: o card avisa e conta; o popover mostra (2026-08-12)

### O problema

O dashboard da entidade gestora tem dois cards de prazo (planos e relatórios). Quando a
vigência está marcada como **restritiva**, o card precisa comunicar isso e dar acesso às
ações que a janela libera. Hoje são 2 ações; o time projeta pelo menos 6. Listar tudo
dentro de um card de coluna lateral não escala.

Três hipóteses estavam na mesa: **(A)** rótulo + todos os bullets inline, **(B)** "Período
restritivo" como hyperlink, **(C)** ícone que abre modal.

### A decisão

**No card:** chip vermelho `Período restritivo` + **um** gatilho que declara quantas ações e
até quando — *"Ver as 6 ações liberadas até 29/08"*, com ícone `(i)` ao lado do rótulo.
**No popover:** aberto por clique, ancorado no gatilho, sem sair do dashboard. Explica o que
é o período restritivo e lista o que está liberado até a data.

| `n` de ações liberadas | O que o card faz |
|---|---|
| 1 | Chip + gatilho no singular: *"Ver a ação liberada até 02/09"*. A ação não aparece no card |
| ≥ 2 | Chip + gatilho no plural, com a contagem. A lista vive no popover |

**O card nunca mostra qual ação está liberada, nem quando há uma só.** A versão anterior
abria exceção para `n = 1` e trazia a ação para uma frase no card. Foi descartado: a exceção
quebrava a altura constante, criava um segundo jeito de ler o mesmo bloco e obrigava a manter
uma frase redigida para cada ação do catálogo. Contar é uma regra; contar às vezes e mostrar
às vezes é duas.

**O card tem a mesma altura com 1, 2, 6 ou 20 ações.** O problema de escala deixa de existir:
`n` é só um número dentro de um rótulo.

O `n` é **por card**. Planos e relatórios têm vigências, flags e listas independentes; a
janela pode estar restritiva num e normal no outro.

**Não existe `n = 0`.** Vigência marcada como restritiva sem nenhuma ação liberada não é
estado válido — o time só mexe no parâmetro depois da decisão tomada. A validação vive na
tela de parâmetros do admin, não aqui.

### Por que isso não é a opção B

O hyperlink puro foi descartado e continua descartado. **O que a pesquisa condena não é o
clique — é o rótulo.** "Período restritivo" sozinho é jargão administrativo e não promete
nada; um gatilho assim falha em *information scent*
([NN/g, Information Scent](https://www.nngroup.com/articles/information-scent/) ·
[Better Link Labels](https://www.nngroup.com/articles/better-link-labels/)) e cai na
evidência de campo do [GOV.UK Details](https://design-system.service.gov.uk/components/details/),
onde parte dos usuários evita clicar por achar que sai da página.

*"Ver as 6 ações liberadas até 29/08"* resolve as três coisas que faltavam: declara o
**assunto**, o **tamanho do conjunto** e o **prazo**. O usuário decide clicar sabendo
exatamente o que ganha, e sabe que não sai da página porque o resultado é um popover
ancorado.

Complementos que continuam valendo:

- **Não é modal.** Modal interrompe e é o padrão de maior custo de acessibilidade
  ([NN/g, Modal & Nonmodal](https://www.nngroup.com/articles/modal-nonmodal-dialog/) ·
  [USWDS trata modal como último recurso](https://designsystem.digital.gov/components/modal/)).
- **Não é hover.** Em toque hover não existe, e hover dispararia as obrigações de
  [WCAG 1.4.13](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html)
  (dismissable, hoverable, persistent).
- **Ícone nunca sozinho.** O `(i)` acompanha o rótulo textual, nunca o substitui
  ([NN/g, Icon Usability](https://www.nngroup.com/articles/icon-usability/)).
- **O gatilho é `<button>`, não `<a href>`**, porque abre uma camada na mesma página
  ([ARIA APG, Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)).

### Decisões de forma

- **O vermelho fica.** Requisição do cliente. Ele carrega o **estado**; o gatilho fica em
  verde de link, para o bloco não virar um alarme inteiro.
- **Uma data só.** A tela de parâmetros do admin tem uma vigência com data de início e data
  de fim, mais o toggle `Restritivo` e as flags. Não são duas janelas encadeadas — é a
  **mesma vigência**, eventualmente prorrogada. O card mostra a data de fim e o contador diz
  para que ela serve: *"Faltam 18 dias para o fim do prazo"*.
- **O card de prazo normal não fala de período restritivo.** Só se fala do restritivo quando
  a flag está ativa.

### Limites honestos desta decisão

- A lista sai do primeiro nível. Quem precisa saber *quais* ações tem que clicar. Isso é
  aceitável **porque a camada do ponto de uso é a fonte de verdade** — sem ela, o clique
  vira carga e a decisão deve ser reavaliada.
- Nenhuma das fontes da pesquisa é do domínio (autodeclaratório, compliance, governo
  brasileiro). A decisão se apoia em convenção genérica mais raciocínio sobre o negócio.
- **Isso é decidível em uma tarde:** 5 entidades gestoras, tarefa única *"descubra se você
  pode excluir a nota X hoje"*, medindo acerto e tempo.

### Dimensões do popover

| Ações | Comportamento |
|---|---|
| 1 | O popover é o único lugar que diz qual é a ação, junto com o conceito |
| até 11 | Lista inteira visível, sem rolagem |
| ≥ 12 | Lista trava em **240px** e rola; cabeçalho, explicação e a linha "liberadas até DD/MM" ficam fixos |

O popover tem 324px de largura fixa, abre ancorado abaixo do gatilho e não usa scrim — não
bloqueia a tela, porque é consulta, não decisão.

---

## D-R002 — Ano de execução: segmentado com janela deslizante (2026-08-12)

As três pílulas fixas (`2023 · 2024 · 2025`) não sobrevivem a 2039 — cada exercício novo
empurrava o cabeçalho. A primeira tentativa foi trocar por um campo de seleção
(`Type=dropdown`), que resolve a escala mas **cobra um clique para tudo**: some a leitura
dos anos vizinhos, que é justamente o movimento mais comum (comparar o exercício atual com o
anterior).

**A decisão final mantém a estética original e resolve a escala:** um segmentado de três
células coladas, sem gap, com **botão de seta em cada ponta**.

```
ANO DE EXECUÇÃO
┌───┬──────┬──────┬──────┬───┐
│ ‹ │ 2023 │ 2024 │ 2025 │ › │
└───┴──────┴──────┴──────┴───┘
```

**Regra de movimento:** o ano selecionado fica **sempre no centro**, e as setas deslocam a
janela inteira. Clicar `‹` com 2024 selecionado leva a `2022 | 2023 | 2024`. O selecionado
não pula de posição — o movimento é previsível.

**Exceção nos extremos:** quando o selecionado é o exercício mais recente (não existe ano
futuro) ou o primeiro da série, a janela trava, a seta correspondente desabilita e o
selecionado passa a ocupar a borda.

Por que isso ganha do dropdown:

- **Largura constante.** Três células sempre, independente de haver 3 ou 30 exercícios.
- **Os vizinhos continuam a um clique**, sem abrir nada. É o caso de uso real.
- **Continuidade visual.** O cliente já reconhece esse controle; trocar por um campo de
  formulário mudava a natureza do elemento (filtro de contexto ≠ campo de dado).

Custo aceito: saltar de 2039 para 2024 exige vários cliques. É movimento raro; se aparecer
demanda, o rótulo do ano central vira um gatilho de lista completa — sem mudar o resto.

**Acessibilidade:** é um grupo de botões (`role="group"` com `aria-label="Ano de execução"`),
não um select. Setas `←` `→` do teclado movem entre os anos, `Home` e `End` vão para os
extremos da série. As setas de navegação recebem `aria-label` explícito ("Anos anteriores" /
"Anos seguintes") e desabilitam com `disabled`, não só com cor.

O menu lateral passou a ocupar a altura toda da viewport (`Fill container` na vertical).

---

## D-R003 — Status da Documentação: barra empilhada no lugar do gráfico de linha (2026-08-12)

O título **"Status da Documentação"** é requisição do cliente e fica. O que muda é a
representação: o gráfico de barra horizontal com legenda separada foi substituído por uma
**linha por tipo de documento**, com barra empilhada e contagem escrita.

A linha é o módulo, e ela se adapta sozinha:

| Situação | O que aparece |
|---|---|
| 0 documentos | Frase: *"Nenhum plano enviado ainda."* Sem barra, sem contagem |
| 1 status | Ponto colorido + contagem. **Sem barra** — com um status só, proporção não significa nada |
| ≥ 2 status | Barra empilhada de 320px + contagem por status, que quebra em duas linhas quando precisa |

Duas decisões dentro disso:

- **A contagem fica escrita, não só na cor.** A legenda separada do gráfico antigo obrigava
  o usuário a fazer o vaivém entre a barra e a legenda; aqui cada status carrega o próprio
  rótulo e número.
- **Status zerado não aparece.** Mostrar "0 retificados" gasta linha para não dizer nada.
- As cores seguem o semáforo do design system (sucesso, info, atenção, neutro), não uma
  escala de verdes — três tons do mesmo verde são indistinguíveis para boa parte das
  pessoas.

---

## Pendente (todas as decisões acima)

- [ ] **Camada do ponto de uso**: na tela onde a ação acontece (Resumo do Relatório), o
      controle bloqueado aparece desabilitado com a razão inline. É a fonte de verdade; o
      card é o aviso.
- [x] Promover a componente o que nasceu inline: `DeadlineCard` (+ sub-bloco de período
      restritivo), `RestrictedPeriodPopover`, `DocumentationRow` (com a barra empilhada),
      `ContextStrip` — feito em `src/components/gestora/` (2026-08-12).
- [x] Decidir em qual sistema de tokens as telas nascem no código: **`--rg-*`**, com o mapa
      Figma → código no [`PLANO-AREA-GESTORA.md`](PLANO-AREA-GESTORA.md) §2 e no `CLAUDE.md`.

### Efeitos na biblioteca Fundação GO

A biblioteca é multi-produto e o Recicla Goiás é um dos produtos que ela atende, com tema de
marca próprio. Foram adicionados:

- `TopBar` e `SideMenu` com `Platform=recicla`
- semânticas `chrome/topbar-recicla` e `chrome/sidebar-recicla`
- `Icon/info` (faltava no set de 26 ícones; é genérico, não é específico do Recicla)
