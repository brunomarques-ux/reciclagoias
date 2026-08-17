# Plano — Login provisório + área da Entidade Gestora

Primeira fatia do **sistema** (área logada) dentro deste repositório. Objetivo: ter um fluxo
navegável do Recicla Goiás remodelado na linguagem visual nova, entrando por um login
provisório e caindo no dashboard da entidade gestora.

Decisões de UX que governam estas telas: [`DECISOES-UX.md`](DECISOES-UX.md).

---

## 1. Referência visual

Os esboços fechados estão no Figma do **Incentiva Goiás**, página `Telas 2026`, seção
`Agosto 2026 · Recicla Goiás · Dashboard da Entidade Gestora`:

| Frame | O que mostra |
|---|---|
| REC-01 | Dashboard dentro do prazo |
| REC-02 | Período restritivo com 2 ações (situação de hoje) |
| REC-03 | 6 ações num card e 1 ação no outro — estado é por card |
| REC-04/05/06 | Popover aberto com 1, 6 e 20 ações (a última rolando) |
| Estados do card de prazo | A máquina de estados completa, de 0 a 20 ações |
| Status da Documentação · variações | A linha do card com 0 a 4 status |
| Popover · dimensões | 1, 6, 11 e 20 ações |

**A tela de login ainda não foi desenhada.** Ela nasce aqui, em código.

---

## 2. Decisão de tokens: usa `--rg-*`

O app já tem 177 tokens em três camadas (`primitives` → `semantic` → uso), rodando em
produção na landing. A **Fundação GO** (`--go-*`) ainda não foi publicada como biblioteca.
Como as duas têm a mesma arquitetura, migrar depois é renomear, não reescrever — e usar
`--go-*` agora significaria dois sistemas de token no mesmo app, que é o problema de
verdade.

**Mapa Figma → código:**

| Figma (Fundação GO) | Recicla (`--rg-*`) |
|---|---|
| `surface/page` | `--rg-color-surface-muted` |
| `surface/card` | `--rg-color-surface-raised` |
| `surface/subtle` | `--rg-color-surface-subtle` |
| `surface/brand-subtle` | `--rg-color-surface-brand` |
| `text/primary` · `secondary` · `muted` · `brand` | `--rg-color-text-*` (mesmos nomes) |
| `border/subtle` | `--rg-color-border-subtle` |
| `border/muted` | `--rg-color-border-base` |
| `action/primary` | `--rg-color-action-primary` |
| `feedback/success` · `warning` · `danger` · `info` | `--rg-color-feedback-*` |
| `feedback/*-subtle` | `--rg-color-feedback-*-soft` |

### Duas armadilhas, já mapeadas

**A escala de espaço não indexa igual.** Mapear pelo *valor*, nunca pelo número:

| Figma | px | Recicla |
|---|---|---|
| `space/6` | 24 | `--rg-space-6` |
| `space/7` | **32** | `--rg-space-8` |
| `space/8` | **40** | `--rg-space-10` |
| `space/9` | **48** | `--rg-space-12` |

**O raio de card não existe aqui.** Figma usa 14px; a escala do Recicla vai de 12
(`--rg-radius-lg`) para 16 (`--rg-radius-xl`). **Usar `--rg-radius-lg`** — 2px não valem um
token novo. Botão (10 no Figma) → `--rg-radius-md` (8). Chip/pill → `--rg-radius-pill`.

**`--rg-color-feedback-success` é o verde de marca**, não um verde de semáforo separado. Na
barra empilhada do Status da Documentação isso funciona (sucesso = marca), mas vale saber
que aqui as duas coisas são o mesmo token.

---

## 3. Rotas

```
/entrar            → login provisório
/gestora           → dashboard da entidade gestora
```

O login é **provisório e sem autenticação real**: escolhe o perfil, grava numa store Pinia e
redireciona. Três perfis aparecem (Entidade Gestora · Verificador de Resultados · Operador
Logístico); só o primeiro está ativo, os outros ficam como "em breve" — é o que comunica o
mapa do sistema sem prometer o que não existe.

Guard simples no router: `/gestora/*` sem perfil na store volta para `/entrar`.

---

## 4. Componentes a criar

```
src/components/gestora/
  GestoraShell.vue            TopBar + SideMenu + slot de conteúdo
  TopBarRecicla.vue           barra verde: menu, marca, notificações, avatar
  SideMenuRecicla.vue         Dashboard · Minha Conta · Planos · Relatórios (fill vertical)
  ContextStrip.vue            faixa "Ano de execução 2024 · Ano base 2023"
  YearSelect.vue              campo de seleção do ano (escala para qualquer nº de exercícios)
  DocumentationCard.vue       card "Status da Documentação"
  DocumentationRow.vue        linha modular: 0 / 1 / N status, com barra empilhada
  StackedBar.vue              barra de 320px, segmentos proporcionais
  DeadlineCard.vue            card de prazo (com e sem período restritivo)
  RestrictedPeriodPopover.vue popover ancorado, lista com rolagem acima de ~240px
src/pages/
  EntrarPage.vue
  GestoraDashboardPage.vue
src/data/mocks/
  gestora.ts                  prazos, vigências, flags, documentos
```

### Regras que os componentes têm que respeitar

- `DeadlineCard` recebe `n` ações e **não muda de altura** com o valor. Nunca mostra qual ação
  está liberada: com `n === 1` o gatilho vai para o singular, e a lista fica sempre no popover.
- O gatilho do popover é `<button>` com `aria-expanded`, **nunca** `<a href>`.
- O popover abre por **clique**, nunca por hover, e não usa scrim.
- A lista de ações é `<ul><li>`, não `<div>` com bullet desenhado.
- `DocumentationRow` só desenha a barra empilhada com **2 ou mais** status; status zerado não
  aparece.
- Não existe estado de vigência restritiva com zero ações liberadas.

---

## 5. Ordem de trabalho

1. Store de sessão (Pinia) + rotas + guard.
2. `EntrarPage` — desenhar direto em código, com os três perfis.
3. `GestoraShell` (TopBar + SideMenu) — é o que dá a cara do produto.
4. `DocumentationCard` + `DocumentationRow` + `StackedBar`, com os mocks das variações.
5. `DeadlineCard` + `RestrictedPeriodPopover`, cobrindo a máquina de estados inteira.
6. Montar `GestoraDashboardPage` e conferir contra REC-01…REC-06 no Figma.
7. Rodar `pnpm typecheck` e verificar no browser (o `.claude/launch.json` já tem o `dev`).

---

## 6. Fora de escopo desta fatia

- Autenticação real, sessão, permissão por perfil.
- Telas de Planos, Relatórios e Certificados (o dashboard só linka para elas).
- A **camada do ponto de uso** — controle desabilitado com razão inline na tela onde a ação
  acontece. É a pendência mais importante da `DECISOES-UX.md`, mas depende das telas de
  Relatório existirem.
