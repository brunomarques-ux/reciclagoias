# Pacotes de entrega para desenvolvimento

O que já foi entregue ao time de desenvolvimento, e como montar o próximo pacote.
Cada frente fechada vira um pacote com as mesmas três peças.

Cada entrega tem **três peças**, e cada uma responde a uma pergunta diferente:

| Peça | Responde | Onde vive |
|---|---|---|
| **Handoff** em HTML | O que a tela faz, estado por estado, e o que não pode mudar | [`public/handoff-dashboards.html`](../../public/handoff-dashboards.html) · publicado em `/handoff-dashboards.html` |
| **Roteiro de testes** em HTML | Como conferir cada coisa, com o resultado esperado | [`public/roteiro-dashboards.html`](../../public/roteiro-dashboards.html) · publicado em `/roteiro-dashboards.html` |
| **Pacote de código** em zip | Onde está cada arquivo e como colar no projeto deles | Fora do repositório (ver a tabela abaixo) |

O protótipo publicado é a referência de comportamento. O Figma fica como apoio visual.

---

## Pacotes já entregues

| Frente | Handoff | Roteiro | Zip do código |
|---|---|---|---|
| **Dashboards da área logada** (login, gestora, admin e verificador) | `/handoff-dashboards.html` | `/roteiro-dashboards.html` | `recicla-dashboards`, 49 arquivos |
| **Consulta pública de regularidade** (consulta por CNPJ e validação de documento) | `/handoff-consulta.html` | `/roteiro-consulta.html` | `recicla-consulta`, 38 arquivos |
| **Ponto de acesso à validação** (a seção da página inicial) | `/handoff-validacao.html` | dentro do handoff, parte 14 | não tem zip, o código vai dentro do documento |

Os dois HTML de cada frente ficam em `public/` e são publicados junto com o protótipo.
Os zips ficam **fora do repositório**, em `C:\Users\Bruno\<nome-do-pacote>`.

---

## Regras dos documentos

Valem para qualquer pacote daqui em diante. Todas nasceram de revisão do Bruno.

1. **Nenhuma sigla nossa.** Códigos de decisão, nomes de arquivo de documentação interna e
   nomes de frame do Figma não entram: quem lê não tem acesso a nada disso. Onde a decisão
   importa, o documento traz **o contexto dela**, não a referência.
2. **Nada que diminua o que já existia.** O dashboard anterior foi feito por quem vai pegar
   esta demanda. A entrega se apresenta como a **evolução natural** de um visual que já vinha
   evoluindo, e descreve o que faz, sem lista de defeitos do que veio antes.
3. **Medida é sugestão, não regra.** Grade, gap e recuo descrevem o que o protótipo faz e
   servem de ponto de partida. Enquanto a responsividade não tiver rodada própria, travar
   pixel seria travar decisão que ainda não foi tomada.
4. **O que é nosso e o que é deles fica explícito.** Layout, copy, estados e comportamento são
   contrato. Modelagem de dados, nomes de campo, cálculo e arquitetura são decisão do time de
   desenvolvimento, e o documento diz isso em voz alta.
5. **Sem travessão** e sem prosa com cara de texto gerado.

---

## Quando o pacote é de uma peça só

A entrega da seção de validação fugiu do formato de três peças, e o motivo vale registrar
para a próxima vez que acontecer o mesmo: **o time já tinha o código adaptado**. Mandar um zip
faria a pessoa procurar de novo o que já estava resolvido, no meio de arquivo que não ia usar.

Quando a entrega é **uma peça isolada dentro de algo que já existe lá**, o pacote vira um
documento só, e o código mora dentro dele:

- **HTML, CSS e o comportamento**, sem framework e sem biblioteca de ícone, em bloco copiável
- **Uma réplica ao vivo** que sai da mesma fonte dos blocos, então documento e código não
  conseguem divergir
- **As variáveis de cor, forma e ritmo** numa tabela, com o papel de cada uma, para eles
  apontarem ao design system deles em um lugar só
- **O roteiro** vira o checklist de aceite no fim do documento, porque são poucos itens e
  nenhum depende de servidor

A regra para escolher: se a entrega é uma **frente inteira**, são as três peças e o zip. Se é
uma **peça que entra numa tela que já existe**, é documento único com o código dentro.

---

## O recorte de código

O pacote é um projeto Vite autocontido, gerado **fora do repositório** para poder ser
zipado sem `node_modules`, sem `dist` e sem o site público.

### Estrutura

```
src/
├─ fundacao/      design system: tokens, fonte, base, ícone em SVG e 4 peças genéricas
└─ dashboards/    a entrega: rotas, guard, 4 páginas, 14 componentes, 2 stores, 3 mocks
```

A divisão é o ponto do pacote: `fundacao/` se reaproveita inteira na próxima entrega,
`dashboards/` é descartável. **Nenhum arquivo da fundação importa nada da entrega**, e essa
seta é a coisa a conferir antes de fechar o zip.

### O que muda em relação ao repositório

| Mudança | Por quê |
|---|---|
| `v-icon` do Vuetify vira `RgIcone.vue` com os caminhos SVG dos ícones usados | Tira o Vuetify e a fonte de ícones inteira do pacote |
| Imports com alias `@/` viram relativos | Para as pastas serem coladas em outro projeto sem configurar resolver |
| O tipo dos tons de status sai do mock e vai para a fundação | Era a única seta apontando da fundação para o domínio |
| `globals.css` vira um `base.css` menor | O original carrega regras da landing pública |
| Router reduzido às rotas da frente, com o guard num arquivo à parte | O guard é o pedaço que eles vão substituir por autenticação de verdade |
| Comentários perdem sigla e caminho de documento interno | Mesma regra 1 dos documentos: os comentários também são lidos por eles |

### Como refazer

1. Copiar os arquivos da frente para a estrutura `fundacao/` + `dashboards/`.
2. Reescrever imports para relativos e converter os ícones.
3. Varrer comentários atrás de sigla e caminho interno.
4. `npm run build` no projeto novo.
5. **Extrair o zip do zero, em outra pasta, e rodar `npm install` e `npm run build` ali.**
   É esse passo que pega arquivo esquecido: sem ele, o pacote passa por bom porque a pasta
   de origem tinha algo que o zip não levou.
6. Abrir as telas no navegador e conferir contra o protótipo publicado.

---

## Antes de enviar

- [ ] Abrir todos os links do documento no deploy, não no localhost
- [ ] Conferir cada copy citada contra o código, incluindo pontuação
- [ ] Recapturar as imagens se a tela mudou
- [ ] Verificar que cada estado documentado tem item no checklist
- [ ] Ler a prosa procurando travessão, sigla interna e comparação que diminua o que já existia
- [ ] Conferir a página em tela, em impressão e em largura estreita
- [ ] Validar o zip a partir da extração, não da pasta de origem
- [ ] Atualizar este documento e o `CLAUDE.md`
