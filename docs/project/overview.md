# Visão geral · Recicla Goiás

## Metadados

- Status: aprovado
- Última atualização: 2026-05-26
- Responsável: UX
- Tipo: guia
- Escopo: o que é o Recicla Goiás, quem utiliza, por que existe e qual é o escopo deste protótipo de UX em código.

## Referências relacionadas

- Documentos relacionados:
  - [Índice da documentação](../index.md)
  - [Filosofia do Design System](../design-system/progression.md)

- Componentes relacionados:
  - RgButton, RgStatCard, RgFeatureCard, RgSectionHeader

- Páginas relacionadas:
  - LandingPage (`/`)

## Este documento afeta

- Decisões de produto e UX;
- Composição e tom da landing page;
- Estrutura dos mocks (`src/data/mocks/landing.ts`).

## Este documento é afetado por

- Mudanças no escopo institucional do Recicla Goiás;
- Atualizações na lista de usuários atendidos pelo sistema;
- Alterações no fluxo de logística reversa do Estado de Goiás.

---

## O que é

O **Recicla Goiás (SISLOG Reversa)** é o sistema web do Governo de Goiás para gestão operacional da logística reversa e rastreabilidade de massa reciclável. Ele controla notas fiscais de materiais recicláveis, emissão de certificados de massa, saldo de massa disponível, e o relacionamento entre operadores logísticos e entidades gestoras.

O foco é **operacional e regulatório**, não comercial. O sistema apoia o acompanhamento de obrigações por ano-base, a comprovação documental das declarações e a auditoria contínua das operações.

## Sobre este repositório

Este repositório é o **protótipo de UX em código** do Recicla Goiás — uma camada onde redesenhamos a experiência diretamente em código funcional, com dados mockados, antes de levar para o sistema de produção.

A diferença em relação ao Figma é que aqui podemos validar:

- comportamento responsivo real;
- estados interativos completos (hover, focus, loading, accordion, drawer);
- microinterações;
- acessibilidade;
- consistência tipográfica e de espaçamento ao longo de uma página inteira.

A primeira entrega cobre apenas a **landing page** e a **fundação do Design System** (tokens, primeiros componentes reutilizáveis). As telas internas — dashboard, certificados, massa por operador, gestão de usuários — virão em ciclos posteriores.

## Quem usa o sistema (referência para os mocks e a comunicação)

### Operador Logístico
Empresas que recebem resíduos, fazem reciclagem, geram massa reciclável e emitem certificados.

- Cadastra notas fiscais.
- Emite certificados de massa.
- Consulta saldo, extratos e histórico de movimentação.

### Entidade Gestora
Organizações responsáveis pela gestão da logística reversa.

- Cria planos e relatórios.
- Recebe, valida ou devolve certificados.
- Acompanha operadores com massa disponível.

### Verificador de Resultados
Profissionais que validam e auditam operações.

- Consulta registros.
- Analisa inconsistências.
- Aprova ou devolve certificados.

### Admin / Admin Comitê
Administração geral e comitê gestor.

- Gerencia usuários e empresas.
- Bloqueia ou libera empresas.
- Acompanha métricas agregadas.

## Conceitos-chave do produto (resumidos)

- **Ano-base**: período coberto pela campanha de logística reversa. O primeiro ano contemplado é 2024.
- **Nota fiscal**: representa massa reciclável disponível, com saldo, créditos e débitos. O sistema seleciona automaticamente quais notas usar em cada certificado.
- **Certificado de massa**: documento emitido pelo operador logístico, vinculado a notas, enviado à entidade gestora. Pode ser aprovado, devolvido para ajuste ou cancelado.
- **Saldo de massa**: funciona como extrato bancário — saldo inicial, créditos, débitos, saldo disponível, por material (papel, plástico, metal, vidro).
- **Empresa bloqueada**: substitui a nomenclatura *blacklist*. Mantém acesso histórico, mas perde operações transacionais.

Convenção de cores dos materiais (mantida do sistema atual, com tons recalibrados):

| Material  | Cor |
|-----------|-----|
| Papel     | Azul |
| Plástico  | Vermelho / Rosa |
| Metal     | Amarelo / Laranja |
| Vidro     | Verde |

## Direção visual perseguida

- Modernidade institucional, **sem** estética de portal governamental antigo.
- Verde **menos invasivo** que a versão atual — usado como cor de marca/CTA, com neutros premium dominando.
- Hierarquia tipográfica clara, espaçamentos generosos, bordas suaves.
- Sem clichês visuais de reciclagem (folhas, setas circulares por toda parte).
- Sensação de produto digital maduro, orientado a dados, sério mas não burocrático.

## Escopo desta primeira entrega

| Item | Estado |
|------|--------|
| Landing page completa, responsiva, acessível | ✅ |
| Fundação de tokens (cores, tipografia, spacing, radius, sombras, motion) | ✅ |
| Tema Vuetify customizado | ✅ |
| Mocks centralizados | ✅ |
| 4 componentes reutilizáveis (RgButton, RgStatCard, RgFeatureCard, RgSectionHeader) | ✅ |
| Snowflakes da landing | ✅ |
| Documentação mínima | ✅ |
| Repo público + deploy Vercel | em andamento |
| Showcase `/design-system` | adiado |
| Espelhamento no Figma | adiado |
| GitHub Actions, PR templates | adiado |
| Telas internas (dashboard, certificados, etc.) | adiado |

## Próximos passos sugeridos

1. **Espelhar no Figma** o que já existe em código (Primitives → Semantic → Text Styles → primeiros componentes).
2. Padronizar a **família de tabelas** (primeira família operacional do sistema interno).
3. Padronizar **dialogs / modais**.
4. Padronizar **formulários** (com a regra de salvar habilitado-apenas-com-mudança).
5. Atacar **telas internas** em ordem de prioridade: dashboard admin, certificados, massa por operador, gestão de usuários, empresas bloqueadas, cadastro de nota fiscal.
6. Quando o DS tiver corpo, instalar **Storybook** e migrar o showcase.
