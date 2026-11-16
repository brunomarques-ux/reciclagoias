// Fluxos guiados · bloco "Análise no Admin". Contrato em src/fluxos/tipos.ts; como escrever em
// docs/sistema/FLUXOS-GUIADOS.md. Os arquivos de dados importam só tipos.
//
// Um fluxo por linha da seção do Admin no Figma (arquivo Recicla Goiás - Figma, página Complemento de Cadastro -
// Operador Logístico, seção Análise do cadastro do Operador Logístico). Cada fluxo parte de um cenário da store
// complemento (?demo=), para não precisar trocar de perfil no meio: enviado (pronto para analisar) ou corrigido
// (reenviado depois da devolução).
import type { Alvo, BlocoDeFluxos, Fluxo } from '../tipos';

export const BLOCO_ADMIN: BlocoDeFluxos = {
  id: 'admin',
  titulo: 'Análise no Admin',
  resumo: 'A fila, a conferência campo a campo e dos documentos, a devolução e a aprovação.',
};

const LIMPAR = ['rg:complemento:*'];
const JANELA: Alvo = { papel: 'dialog', nome: '' };
const MENU_DA_LINHA: Alvo = { papel: 'button', nome: 'Ações de Cooperativa de Catadores Recicla Cerrado' };
const ALVARA: Alvo = { papel: 'group', nome: 'Alvará de funcionamento' };

/** Na ordem em que aparecem na página /fluxos (dentro do bloco, os principais e alternativos vêm antes das exceções). */
export const FLUXOS_ADMIN: Fluxo[] = [
  {
    id: 'admin-conferir-e-devolver',
    bloco: 'admin',
    tipo: 'principal',
    titulo: 'Conferir o cadastro e devolver para correção',
    apresentacao:
      'O analista assume o cadastro pela fila, confere cada campo com ✓ ou ✕ e cada documento com Sim ou Não, e devolve com o motivo de cada pendência.',
    regras: [
      { ref: 'Planning 16/10', texto: 'Analisar atribui o cadastro a quem clicou e trava a edição da organização.' },
      { ref: 'Decisão 18/10', texto: 'O analista não altera o dado: marca ✓ ou ✕, e o ✕ abre a observação do campo.' },
      { ref: 'SEMAD 15/09', texto: 'Documento em Não pede o motivo, que vai no e-mail de correção.' },
      { ref: 'SEMAD 27/09', texto: 'Devolver fica desabilitado enquanto houver motivo em edição.' },
    ],
    inicio: { rota: '/admin/cadastros?demo=enviado', perfil: 'admin', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Na fila, abra o menu da linha da Recicla Cerrado e clique em Analisar.',
        observar: 'A coluna Analista e as quatro situações. Visualizar só lê; Analisar assume o cadastro.',
        acoes: [
          { tipo: 'clicar', alvo: MENU_DA_LINHA, rotulo: 'Abra o menu da linha' },
          { tipo: 'clicar', alvo: { papel: 'menuitem', nome: 'Analisar' }, rotulo: 'Clique em Analisar' },
        ],
      },
      {
        fazer: 'Marque o telefone para corrigir.',
        observar: 'Cada campo tem ✓ e ✕ à direita. O ✕ deixa o campo vermelho e abre a observação.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Em análise', exato: true }, rotulo: 'Situação Em análise' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Marcar Telefone (com DDD) para corrigir' }, rotulo: 'Clique no ✕ do telefone' },
        ],
      },
      {
        fazer: 'Escreva o que a organização precisa corrigir e salve a observação.',
        acoes: [
          {
            tipo: 'digitar',
            alvo: { papel: 'textbox', nome: 'O que a organização precisa corrigir' },
            texto: 'O telefone informado não atende. Informe um número ativo, com DDD.',
            rotulo: 'Escreva a observação',
          },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Salvar observação' }, rotulo: 'Clique em Salvar observação' },
        ],
      },
      {
        fazer: 'No alvará, responda Não em Em conformidade?.',
        observar: 'O Não abre o motivo, com a descrição obrigatória.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Não', exato: true, dentro: ALVARA }, rotulo: 'Clique em Não' }],
      },
      {
        fazer: 'Escolha Documento vencido, descreva o motivo e clique em Salvar motivo.',
        observar: 'Enquanto o motivo não é salvo, Devolver para correção fica desabilitado.',
        acoes: [
          { tipo: 'marcar', alvo: { papel: 'radio', nome: 'Documento vencido' }, rotulo: 'Documento vencido' },
          {
            tipo: 'digitar',
            alvo: { papel: 'textbox', nome: 'Descrição do motivo' },
            texto: 'O documento apresentado está vencido desde março de 2026. Anexe o alvará válido e atualizado.',
            rotulo: 'Descreva o motivo',
          },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Salvar motivo' }, rotulo: 'Clique em Salvar motivo' },
        ],
      },
      {
        fazer: 'Clique em Devolver para correção.',
        observar: 'Salvo, o motivo vira leitura, com o botão de ícone para editar.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Devolver para correção' }, rotulo: 'Clique em Devolver' }],
      },
      {
        fazer: 'Confira a mensagem e clique em Enviar e devolver.',
        observar: 'A mensagem sai montada com as pendências salvas e pode ser editada. O resto do e-mail entra sozinho.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Enviar e devolver', dentro: JANELA }, rotulo: 'Clique em Enviar e devolver' }],
      },
      {
        fazer: 'Veja o cadastro devolvido.',
        observar: 'A situação passa a Devolvido, o histórico registra as pendências e a análise fica só para consulta.',
        acoes: [{ tipo: 'olhar', alvo: { texto: 'Devolvido para correção' }, rotulo: 'Devolvido' }],
      },
    ],
  },
  {
    id: 'admin-reanalisar-e-aprovar',
    bloco: 'admin',
    tipo: 'principal',
    titulo: 'Reanalisar o cadastro corrigido e aprovar',
    apresentacao:
      'A organização corrigiu o telefone e o alvará e reenviou. O cadastro volta como Enviado, no topo da fila, e na reanálise só o que foi devolvido precisa ser conferido de novo.',
    regras: [
      { ref: 'Planning 16/10', texto: 'Não existe Reenviado: o corrigido volta a Enviado, no topo da fila.' },
      { ref: 'SEMAD 15/09', texto: 'O que já foi conferido chega bloqueado na reanálise.' },
      { ref: 'SEMAD 15/09', texto: 'Aprova só com tudo certo. A janela repete nome e CNPJ.' },
    ],
    inicio: { rota: '/admin/cadastros?demo=corrigido', perfil: 'admin', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Abra o menu da linha da Recicla Cerrado e clique em Analisar.',
        observar: 'De volta como Enviado, sem analista, na data do reenvio.',
        acoes: [
          { tipo: 'clicar', alvo: MENU_DA_LINHA, rotulo: 'Abra o menu da linha' },
          { tipo: 'clicar', alvo: { papel: 'menuitem', nome: 'Analisar' }, rotulo: 'Clique em Analisar' },
        ],
      },
      {
        fazer: 'Confira o telefone corrigido e marque como correto.',
        observar: 'Os outros campos chegam conferidos e bloqueados.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Marcar Telefone (com DDD) como correto' }, rotulo: 'Clique no ✓ do telefone' }],
      },
      {
        fazer: 'No alvará corrigido, responda Sim.',
        observar: 'O arquivo novo aparece em destaque, com o motivo anterior.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Sim', exato: true, dentro: ALVARA }, rotulo: 'Clique em Sim' }],
      },
      {
        fazer: 'Clique em Aprovar cadastro e confirme na janela.',
        observar: 'A janela repete o nome e o CNPJ, para não aprovar a organização errada.',
        acoes: [
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Aprovar cadastro' }, rotulo: 'Clique em Aprovar cadastro' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Aprovar cadastro', dentro: JANELA }, rotulo: 'Confirme a aprovação' },
        ],
      },
      {
        fazer: 'Veja o cadastro aprovado.',
        observar: 'O e-mail de aprovação segue com o manual em anexo, e o operador ganha o acesso completo.',
        acoes: [{ tipo: 'olhar', alvo: { texto: 'Aprovado' }, rotulo: 'Aprovado' }],
      },
    ],
  },
  {
    id: 'admin-abrir-documento',
    bloco: 'admin',
    tipo: 'alternativo',
    titulo: 'Abrir um documento para conferir',
    apresentacao: 'Cada arquivo abre na janela de PDF, com Baixar documento e Fechar, sem sair da análise.',
    regras: [{ ref: 'SEMAD 15/09', texto: 'A conferência é manual, documento por documento.' }],
    inicio: { rota: '/admin/cadastros?demo=enviado', perfil: 'admin', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Abra o menu da linha da Recicla Cerrado e clique em Analisar.',
        acoes: [
          { tipo: 'clicar', alvo: MENU_DA_LINHA, rotulo: 'Abra o menu da linha' },
          { tipo: 'clicar', alvo: { papel: 'menuitem', nome: 'Analisar' }, rotulo: 'Clique em Analisar' },
        ],
      },
      {
        fazer: 'Clique em ver, no alvará.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Ver Alvará de funcionamento' }, rotulo: 'Clique em ver' }],
      },
      {
        fazer: 'Clique em Fechar.',
        observar: 'Fechar volta para a análise, onde o analista marca Sim ou Não.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Fechar', exato: true, dentro: JANELA }, rotulo: 'Clique em Fechar' }],
      },
    ],
  },
  {
    id: 'admin-salvar-sem-descricao',
    bloco: 'admin',
    tipo: 'excecao',
    titulo: 'Salvar o motivo sem descrição',
    apresentacao: 'O motivo só vale salvo, e a descrição é obrigatória: ela vai no e-mail de correção.',
    regras: [{ ref: 'SEMAD 15/09', texto: 'Não exige justificativa por item.' }],
    inicio: { rota: '/admin/cadastros?demo=enviado', perfil: 'admin', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Abra o menu da linha da Recicla Cerrado e clique em Analisar.',
        acoes: [
          { tipo: 'clicar', alvo: MENU_DA_LINHA, rotulo: 'Abra o menu da linha' },
          { tipo: 'clicar', alvo: { papel: 'menuitem', nome: 'Analisar' }, rotulo: 'Clique em Analisar' },
        ],
      },
      {
        fazer: 'No alvará, responda Não e escolha Documento vencido.',
        acoes: [
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Não', exato: true, dentro: ALVARA }, rotulo: 'Clique em Não' },
          { tipo: 'marcar', alvo: { papel: 'radio', nome: 'Documento vencido' }, rotulo: 'Documento vencido' },
        ],
      },
      {
        fazer: 'Sem escrever a descrição, clique em Salvar motivo.',
        observar: 'O bloco continua aberto, com o campo em erro. Devolver para correção segue desabilitado.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Salvar motivo' }, rotulo: 'Clique em Salvar motivo' }],
      },
    ],
  },
];
