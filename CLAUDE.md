# Recicla Goiás — guia do repositório

Protótipo de **UX em código** do Recicla Goiás (SISLOG Reversa). Não é o sistema de
produção: é onde o time de UX desenha, testa e refina a experiência em código, com dados
mockados, antes de levar para o sistema real.

Hoje o repo tem duas frentes: a **landing pública** (`/`, `/consulta`, `/apresentacao`) e a
**área logada** (`/entrar`, `/gestora`), que nasceu em agosto/2026.

---

## Stack

| Camada | Escolha |
|---|---|
| Framework | Vue 3 (`<script setup>`) + Vite 6 + TypeScript strict |
| UI engine | Vuetify 3 — usado por ícones (`v-icon` + `@mdi/font`) e defaults; layout é CSS próprio |
| Estado / rotas | Pinia + Vue Router 4 (history mode) |
| Fontes | Inter Variable + Roboto Flex Variable via `@fontsource` |
| Estilo | CSS Variables `--rg-*` como única fonte da verdade; sem Tailwind |
| Dados | Tudo mockado em `src/data/mocks/` — sem backend, sem API |

```bash
pnpm dev        # http://localhost:5173
pnpm typecheck  # vue-tsc --noEmit — rodar antes de dar qualquer coisa por pronta
pnpm build      # typecheck + build de produção
```

---

## Documentos de referência

Leia antes de mexer em cada frente:

| Documento | Para quê |
|---|---|
| [`docs/sistema/PLANO-AREA-GESTORA.md`](docs/sistema/PLANO-AREA-GESTORA.md) | Rotas, componentes e ordem de trabalho da área logada; mapa de tokens Figma → código |
| [`docs/sistema/DECISOES-UX.md`](docs/sistema/DECISOES-UX.md) | Decisões de UX que governam as telas do sistema (D-R001 período restritivo, D-R002 seletor de ano, D-R003 barra empilhada) — **fonte da verdade quando houver dúvida de direção** |
| [`docs/sistema/HANDOFF-DASHBOARD-GESTORA.md`](docs/sistema/HANDOFF-DASHBOARD-GESTORA.md) | Documento para encaminhar: o que foi entregue, o porquê de cada decisão e o que vai para a biblioteca de componentes |
| [`docs/sistema/PACOTE-ENTREGA-DASHBOARDS.md`](docs/sistema/PACOTE-ENTREGA-DASHBOARDS.md) | **O que vai para o time de desenvolvimento**: as três peças da entrega, as regras dos documentos (sem sigla nossa, sem diminuir o que já existia) e como refazer o recorte de código |
| [`docs/HANDOFF-DESENVOLVIMENTO.md`](docs/HANDOFF-DESENVOLVIMENTO.md) | Landing page |
| [`docs/HANDOFF-CONSULTA-REGULARIDADE.md`](docs/HANDOFF-CONSULTA-REGULARIDADE.md) | Consulta pública de regularidade |
| [`README.md`](README.md) | Stack e filosofia geral |

**Referência visual:** Figma `Incentiva Goiás` (key `aNvL38L8uyxh8zBeHfsHiD`), página
`Telas 2026`. A área gestora está na seção `Agosto 2026 · Recicla Goiás · Dashboard da
Entidade Gestora` (node `2601:14773`). Medidas se leem nos nós, nunca da imagem.

---

## Convenções

### Tokens

- **Só `--rg-*`.** Nada de hex cru em componente, nada de `--go-*` (a Fundação GO ainda não
  foi publicada como biblioteca — migrar depois é renomear, não reescrever).
- Camadas: `primitives.css` → `semantic.css` → uso. Componente consome semântico; primitiva
  direto só quando não existe semântico equivalente (ex.: `--rg-primitive-brand-100` para o
  texto secundário da TopBar).
- **A escala de espaço do Figma não indexa igual à daqui.** Mapear por valor:
  `space/7` = 32px = `--rg-space-8`; `space/8` = 40px = `--rg-space-10`; `space/9` = 48px =
  `--rg-space-12`.
- **Raios:** o card do Figma é 14px e não existe aqui → `--rg-radius-lg` (12). Botão/bloco/
  caixa de ícone (10 no Figma) → `--rg-radius-md` (8). Campo (8) → `--rg-radius-md`.
  Chip/pill → `--rg-radius-pill`.
- `--rg-color-feedback-success` **é** o verde de marca — aqui semáforo e marca são o mesmo
  token, de propósito.

Mapa Figma → código usado na área gestora:

| Figma | `--rg-*` |
|---|---|
| `surface/page` | `--rg-color-surface-muted` |
| `surface/card` | `--rg-color-surface-raised` |
| `surface/subtle` | `--rg-color-surface-subtle` |
| `surface/brand-subtle` | `--rg-color-surface-brand` |
| `text/primary` · `secondary` · `muted` · `brand` | `--rg-color-text-*` |
| `border/subtle` · `border/muted` · `border/brand` | `--rg-color-border-subtle` · `-base` · `-brand` |
| `border/default` (#64748B, sem par na rampa semântica) | `--rg-primitive-neutral-500` |
| `brand` · `chrome/topbar-recicla` | `--rg-color-action-primary` |
| `feedback/*` · `feedback/*-subtle` | `--rg-color-feedback-*` · `-*-soft` |

### Componentes

- `src/components/Rg*.vue` — Design System reutilizável.
- `src/components/<contexto>/` — *snowflakes* de uma tela só (`landing/`, `consulta/`,
  `gestora/`, `presentation/`). Componente reutilizável nasce por **uso real**, não por
  organização especulativa.
- `<script setup lang="ts">` com um comentário de bloco no topo explicando o que a peça é e
  de onde veio (frame do Figma, decisão de UX).
- CSS **scoped**, classes BEM com prefixo por contexto: `cx-` consulta, `gx-` gestora.
- Comentário e nome de domínio em português; API de componente (props/emits) em português
  também, seguindo o que já existe.

### Acessibilidade (não é opcional)

- HTML semântico de verdade: lista é `<ul><li>`, não `<div>` com bullet desenhado.
- Camada que abre na mesma página é `<button aria-expanded>`, nunca `<a href>`
  ([ARIA APG, Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)).
- Ícone nunca sozinho: `(i)` acompanha rótulo textual visível.
- Popover abre por **clique**, nunca por hover (toque não tem hover; hover dispararia as
  obrigações de WCAG 1.4.13). Fecha com `Esc` e clique fora, sem scrim.
- Foco visível preservado, `prefers-reduced-motion` respeitado.

---

## Área da Entidade Gestora

```
/entrar        login provisório, sem autenticação real — escolhe o perfil e grava na store
/gestora       dashboard da entidade gestora
/admin         dashboard da Administração (SIC)
/verificador   dashboard do Verificador de Resultados
```

O guard é **por perfil**: sem perfil na store volta para `/entrar` com `?destino=`, e perfil
logado tentando a rota de outro perfil volta para o próprio dashboard, sem deslogar.

Os dois documentos publicados junto com o protótipo saem daqui e são o que se envia para
fora (ver [`docs/sistema/PACOTE-ENTREGA-DASHBOARDS.md`](docs/sistema/PACOTE-ENTREGA-DASHBOARDS.md)):

```
public/handoff-dashboards.html    pacote de entrega, com réplicas ao vivo das interações
public/roteiro-dashboards.html    roteiro de testes passo a passo
public/img/handoff/               capturas do protótipo em 1440, usadas pelos dois
```

```
src/stores/sessao.ts              perfil escolhido + entidade mockada
src/stores/explorador.ts          estado editável do dashboard (regras de UX moram aqui)
src/components/gestora/           shell, cards, popover, explorador de cenários
src/pages/EntrarPage.vue          nasceu em código (não tem frame)
src/pages/GestoraDashboardPage.vue
src/pages/AdminDashboardPage.vue
src/pages/VerificadorDashboardPage.vue
src/data/mocks/gestora.ts         catálogo (linhas, status, ações) + presets dos frames
src/data/mocks/perfis.ts          indicadores, massas e materiais do admin e do verificador
src/data/mocks/sessao.ts          perfis, usuários, menus por perfil e entidade
```

### Catálogo, presets e o explorador

`data/mocks/gestora.ts` é um **catálogo**, não uma lista de telas: descreve o que cada linha
da documentação e cada card de prazo podem ter. Os `PRESETS` recortam esse catálogo para
reproduzir os frames, e o **explorador de cenários** (rodapé do menu lateral, ferramenta de
protótipo) edita o mesmo catálogo ao vivo. Os controles do painel **nascem do catálogo** —
acrescentar um status ou uma ação lá faz o controle aparecer sozinho.

`?cenario=` carrega um preset e fica em sincronia com o painel nos dois sentidos:
`hoje` (padrão — documentação com volume + planos restritivos com 2 ações) · `rec01` ·
`rec02` · `rec03` · `rec06` · `variacoes` (0, 1 e 4 status na mesma tela).

As regras de UX são impostas pela **store**, não pelos componentes nem pelo painel: o total é
a soma dos status, status zerado some, e período restritivo ⇔ ao menos uma ação liberada
(ligar libera a primeira; desmarcar a última desliga o período, então `n = 0` é inalcançável).

### Responsividade

O Figma só tem o desktop de 1440. O que existe fora disso é o mínimo para o protótipo não
quebrar, e foi decidido em código:

| Largura | O que muda |
|---|---|
| ≥ 1440 | Conteúdo **ocupa a largura toda**, do recuo depois do menu até o recuo da direita. Nada de travar numa largura fixa e centralizar: com margem grande dos dois lados a tela parece que não foi feita sob medida (e num 4K seria pior) |
| ≤ 1120 | A coluna lateral desce e os dois cards de prazo dividem a linha |
| ≤ 1023 | Menu vira **trilha de ícones** (72px), rótulos só no `title` |
| ≤ 720 | Cabeçalho empilha, seletor de ano ocupa a largura toda, link da linha desce |

O que cresce com a tela grande, sempre com a medida do frame de 1440 como piso: recuo
lateral `40px → 80px`, coluna lateral `360px → 520px`, barra empilhada `320px → 560px`.
Até ~1900px de viewport tudo isso fica exatamente no valor do Figma.

### Regras inegociáveis destas telas

- O card de prazo **não muda de altura** com o número de ações liberadas, e **nunca mostra
  qual ação está liberada**, nem quando há uma só: com `n = 1` o gatilho apenas vai para o
  singular (`Ver a ação liberada até 02/09`). O card conta, o popover mostra.
- O `n` é **por card**: planos e relatórios têm vigências, flags e listas independentes.
- **Não existe vigência restritiva com zero ações liberadas.**
- `DocumentationRow` só desenha a barra empilhada com **2 ou mais** status. Status zerado não
  aparece. Zero documentos vira frase, sem barra e sem contagem.
- A contagem por status fica **escrita**, não só na cor.
- Popover: 324px de largura; lista trava em `240px` e rola a partir de 12 ações; cabeçalho,
  explicação e a linha "liberadas até DD/MM" ficam fixos.

### Divergências conhecidas do Figma

- Em `REC-03` e `REC-04` o bloco do período restritivo com `n = 1` ficou com altura fixa
  antiga (80px) e as duas últimas linhas se sobrepõem no arquivo. A tira
  `Estados do card de prazo` (`2613:16454`) é a referência correta: bloco 110px, card 234px.
- Raio 14 → 12 e raio 10 → 8, por decisão de token (acima).
