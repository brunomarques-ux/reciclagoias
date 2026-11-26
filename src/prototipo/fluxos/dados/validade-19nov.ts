// Fluxos guiados · entrega "Validade: regras de 19/11". Contrato em src/prototipo/fluxos/tipos.ts; como escrever em
// docs/sistema/FLUXOS-GUIADOS.md. Os arquivos de dados importam só tipos.
//
// Regras que a Claudia mandou no grupo HOMOLOGAÇÃO RECICLAGO em 19/11/2026 (reforço em 25/11), transcritas em
// docs/sistema/validade-regras-19nov.md. Um fluxo por linha da seção do Figma (arquivo Recicla Goiás - Figma, página
// Novembro 2026 · Validade e bloqueio · Regras de 19/11, seção 6558:1924). Exemplo: alvará vencendo em 14/12/2026.
import type { Alvo, BlocoDeFluxos, Fluxo } from '../tipos';

export const BLOCO_VALIDADE_19NOV: BlocoDeFluxos = {
  id: 'validade-19nov',
  titulo: 'Validade: regras de 19/11',
  entrega: 'validade-19nov',
};

const LIMPAR = ['rg:complemento:*'];
const ALVARA: Alvo = { papel: 'group', nome: 'Alvará de funcionamento' };
const MENU_DA_LINHA: Alvo = { papel: 'button', nome: 'Ações de Cooperativa de Catadores Recicla Cerrado' };

/** Anexar o alvará novo, informar a validade e enviar: o mesmo gesto nas três fases da troca. */
const TROCAR_O_ALVARA = [
  { tipo: 'clicar', alvo: { papel: 'button', nome: 'Anexe o documento corrigido' }, rotulo: 'Clique para anexar' },
  { tipo: 'digitar', alvo: { papel: 'textbox', nome: 'Validade do documento' }, texto: '14/12/2027', rotulo: 'Digite a validade' },
  { tipo: 'clicar', alvo: { papel: 'button', nome: 'Enviar para conferência' }, rotulo: 'Clique em Enviar para conferência' },
] as const;

export const FLUXOS_VALIDADE_19NOV: Fluxo[] = [
  {
    id: 'validade-19nov-l1-antes-de-vencer',
    bloco: 'validade-19nov',
    tipo: 'principal',
    titulo: 'L1 · Antes de vencer: dois lembretes',
    apresentacao:
      'O alvará da cooperativa vence em 14/12. O operador recebe um e-mail 60 dias antes e outro 30 dias antes, e vê o aviso ao entrar. Ele já pode trocar o documento: o cadastro segue aprovado enquanto a equipe confere.',
    regras: [
      { ref: 'Claudia, 19/11, item 1', texto: 'Primeiro lembrete 60 dias antes do vencimento; segundo, 30 dias antes.' },
      { ref: 'Planning de 13/11', texto: 'O aviso no painel ao entrar continua, até a troca.' },
      { ref: 'Leitura nossa', texto: 'Trocado antes de vencer, nada fica restrito enquanto o Admin confere.' },
    ],
    inicio: { rota: '/emails-operador?email=vence-60&demo=vencendo', perfil: 'operador', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Leia o primeiro lembrete, 60 dias antes do vencimento.',
        observar: 'Saiu em 15/10. Diz qual documento vence, quando e o que acontece se vencer.',
        acoes: [
          { tipo: 'olhar', alvo: { papel: 'heading', nome: 'Documento vence em 60 dias' }, rotulo: 'Primeiro lembrete' },
          { tipo: 'olhar', alvo: { texto: 'há 10 dias corridos para regularizar' }, rotulo: 'O que acontece se vencer' },
        ],
      },
      {
        fazer: 'Leia o segundo lembrete e clique em Atualizar documento.',
        observar: 'Saiu em 14/11, 30 dias antes. Mesmo e-mail, com o prazo menor.',
        acoes: [
          { tipo: 'ir', rota: '/emails-operador?email=vencendo', rotulo: '30 dias antes' },
          { tipo: 'olhar', alvo: { papel: 'heading', nome: 'Documento vence em 30 dias' }, rotulo: 'Segundo lembrete' },
          { tipo: 'clicar', alvo: { papel: 'link', nome: 'Atualizar documento' }, rotulo: 'Clique em Atualizar documento' },
        ],
      },
      {
        fazer: 'Veja o aviso no topo da Minha Conta e troque o alvará já agora.',
        observar: 'O cadastro segue aprovado. Só o alvará aceita troca; os demais documentos seguem conferidos.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Você tem documento perto de vencer' }, rotulo: 'Aviso ao entrar' },
          ...TROCAR_O_ALVARA,
        ],
      },
      {
        fazer: 'Veja o documento enviado para conferência.',
        observar: 'Enquanto a equipe confere, o cadastro segue aprovado e nada muda no uso do sistema.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Documento enviado para conferência' }, rotulo: 'Enviado para conferência' },
          { tipo: 'olhar', alvo: { texto: 'nada muda no uso do sistema' }, rotulo: 'Sem restrição' },
        ],
      },
    ],
  },
  {
    id: 'validade-19nov-l2-regularizacao',
    bloco: 'validade-19nov',
    tipo: 'principal',
    titulo: 'L2 · Vencido: 10 dias para regularizar',
    apresentacao:
      'O alvará venceu em 14/12 sem a troca. O operador tem 10 dias corridos para trocar, até 24/12. Nesse tempo o cadastro fica parcialmente ativo: transfere créditos, mas não inclui nota fiscal nova. Cinco dias antes do bloqueio sai o último aviso.',
    regras: [
      { ref: 'Claudia, 19/11, item 4', texto: 'No dia do vencimento sai o aviso de documento vencido, com os 10 dias corridos.' },
      { ref: 'Claudia, 19/11, item 2', texto: 'Parcialmente ativo: transferência de créditos permitida, inclusão de notas fiscais não.' },
      { ref: 'Claudia, 19/11, item 1', texto: 'Aviso 5 dias antes do bloqueio, se o documento não foi trocado.' },
      { ref: 'Em aberto, 26/11', texto: 'A contagem dos 10 dias e a data do aviso de 5 dias são leitura nossa, a confirmar.' },
    ],
    inicio: { rota: '/emails-operador?email=vencido&demo=regularizacao', perfil: 'operador', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Leia o e-mail do dia do vencimento e clique em Atualizar documento.',
        observar: 'Não bloqueia mais no dia: dá o prazo até 24/12 e diz o que fica suspenso.',
        acoes: [
          { tipo: 'olhar', alvo: { papel: 'heading', nome: 'Documento vencido' }, rotulo: 'Aviso de vencido' },
          { tipo: 'olhar', alvo: { texto: 'Prazo para regularizar' }, rotulo: 'O prazo' },
          { tipo: 'clicar', alvo: { papel: 'link', nome: 'Atualizar documento' }, rotulo: 'Clique em Atualizar documento' },
        ],
      },
      {
        fazer: 'Veja o aviso vermelho no topo da Minha Conta e abra Notas Fiscais no menu.',
        observar: 'Situação nova: parcialmente ativo. O menu continua funcionando.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Documento vencido: regularize até' }, rotulo: 'Parcialmente ativo' },
          { tipo: 'clicar', alvo: { papel: 'link', nome: 'Notas Fiscais' }, rotulo: 'Clique em Notas Fiscais' },
        ],
      },
      {
        fazer: 'Veja a inclusão suspensa e abra Saldo no menu.',
        observar: 'Incluir nota fiscal fica desativado, com o motivo e o prazo ao lado.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Inclusão de notas fiscais suspensa' }, rotulo: 'Inclusão suspensa' },
          { tipo: 'olhar', alvo: { papel: 'button', nome: 'Incluir nota fiscal' }, rotulo: 'Botão desativado' },
          { tipo: 'clicar', alvo: { papel: 'link', nome: 'Saldo' }, rotulo: 'Clique em Saldo' },
        ],
      },
      {
        fazer: 'Veja que a transferência de créditos continua.',
        observar: 'Transferir créditos segue ativo durante os 10 dias.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Transferência de créditos liberada' }, rotulo: 'Créditos liberados' },
          { tipo: 'olhar', alvo: { papel: 'button', nome: 'Transferir créditos' }, rotulo: 'Botão ativo' },
        ],
      },
      {
        fazer: 'Cinco dias antes do bloqueio, leia o último aviso e clique em Atualizar documento.',
        observar: 'Saiu em 20/12. Diz a data do bloqueio: 25/12.',
        acoes: [
          { tipo: 'ir', rota: '/emails-operador?email=bloqueio-em-5-dias', rotulo: '20/12, sem a troca' },
          { tipo: 'olhar', alvo: { papel: 'heading', nome: 'Faltam 5 dias para o bloqueio' }, rotulo: 'Último aviso' },
          { tipo: 'clicar', alvo: { papel: 'link', nome: 'Atualizar documento' }, rotulo: 'Clique em Atualizar documento' },
        ],
      },
      {
        fazer: 'Anexe o alvará novo, informe a validade 14/12/2027 e clique em Enviar para conferência.',
        observar: 'Só o alvará aceita troca. As outras etapas seguem abertas para consulta.',
        acoes: [...TROCAR_O_ALVARA],
      },
      {
        fazer: 'Veja o documento enviado para conferência.',
        observar: 'Até a equipe conferir, a inclusão de notas fiscais segue suspensa e os créditos seguem liberados.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Documento enviado para conferência' }, rotulo: 'Enviado para conferência' },
          { tipo: 'olhar', alvo: { texto: 'a inclusão de notas fiscais continua suspensa' }, rotulo: 'Ainda parcial' },
        ],
      },
    ],
  },
  {
    id: 'validade-19nov-l3-bloqueio-total',
    bloco: 'validade-19nov',
    tipo: 'excecao',
    titulo: 'L3 · Bloqueio total a partir do 11º dia',
    apresentacao:
      'O prazo terminou em 24/12 sem a troca. A partir de 25/12 o cadastro fica bloqueado: nenhuma operação, o menu fica inerte e só a etapa Documentos abre para trocar o alvará. O acesso volta depois da conferência.',
    regras: [
      { ref: 'Claudia, 19/11, item 3', texto: 'A partir do 11º dia, bloqueio total: acesso só à troca do documento vencido.' },
      { ref: 'Claudia, 19/11, item 3', texto: 'Depois da troca e da validação, o acesso volta.' },
      { ref: 'Em aberto, 26/11', texto: 'A regra não pede e-mail no dia do bloqueio.' },
    ],
    inicio: { rota: '/operador?demo=vencido', perfil: 'operador', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Veja o cadastro bloqueado e o menu sem as outras funções.',
        observar: 'Notas Fiscais, Saldo e as demais funções ficam inertes. Só a Minha Conta navega.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Cadastro bloqueado por documentação vencida' }, rotulo: 'Bloqueio total' },
          { tipo: 'olhar', alvo: { texto: 'Notas Fiscais', exato: true }, rotulo: 'Menu inerte' },
        ],
      },
      {
        fazer: 'Anexe o alvará novo, informe a validade 14/12/2027 e clique em Enviar para conferência.',
        observar: 'As outras etapas ficam fechadas. Só o alvará aceita troca.',
        acoes: [...TROCAR_O_ALVARA],
      },
      {
        fazer: 'Veja o documento enviado para conferência.',
        observar: 'O cadastro segue bloqueado até a equipe conferir.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Documento enviado para conferência' }, rotulo: 'Enviado para conferência' },
          { tipo: 'olhar', alvo: { texto: 'O cadastro continua bloqueado' }, rotulo: 'Ainda bloqueado' },
        ],
      },
    ],
  },
  {
    id: 'validade-19nov-l4-admin',
    bloco: 'validade-19nov',
    tipo: 'principal',
    titulo: 'L4 · Admin: situação nova e conferência do documento',
    apresentacao:
      'Na lista do Admin, o cadastro com documento vencido aparece como Parcialmente ativo. Quando o documento novo chega, ele volta ao topo como Documento atualizado e o analista confere só o alvará. Aprovado, o acesso volta inteiro.',
    regras: [
      { ref: 'Claudia, 19/11, item 2', texto: 'A situação Parcialmente ativo aparece na lista. O nome está em aberto para a reunião de 26/11.' },
      { ref: 'Planning de 13/11', texto: 'Mesma lista, no topo, como Documento atualizado. Só o documento trocado pede resposta.' },
    ],
    // Começa na ficha do cadastro e só depois vai à lista: trocar de cenário na mesma tela recarrega a página.
    inicio: { rota: '/admin/cadastros/OPL-2026-00184?demo=regularizacao', perfil: 'admin', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Veja a ficha da Recicla Cerrado com a situação Parcialmente ativo.',
        observar: 'Documento vencido dentro dos 10 dias. O rodapé diz até quando e a data do bloqueio. Ainda não há nada para conferir.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Parcialmente ativo · documento vencido' }, rotulo: 'Situação nova' },
          { tipo: 'olhar', alvo: { texto: 'Parcialmente ativo até' }, rotulo: 'O prazo e o bloqueio' },
        ],
      },
      {
        fazer: 'O operador mandou o alvará novo. Abra o menu da linha e clique em Analisar.',
        observar: 'A linha volta ao topo como Documento atualizado, com a data do envio.',
        acoes: [
          { tipo: 'ir', rota: '/admin/cadastros?demo=atualizado-no-prazo', rotulo: 'O documento novo chegou' },
          { tipo: 'olhar', alvo: { texto: 'Documento atualizado', exato: true }, rotulo: 'Documento atualizado' },
          { tipo: 'clicar', alvo: MENU_DA_LINHA, rotulo: 'Abra o menu da linha' },
          { tipo: 'clicar', alvo: { papel: 'menuitem', nome: 'Analisar' }, rotulo: 'Clique em Analisar' },
        ],
      },
      {
        fazer: 'Confira a validade informada e responda Sim no alvará.',
        observar: 'O texto diz de onde a troca partiu: dentro dos 10 dias, com as notas fiscais suspensas.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'parcialmente ativo, sem inclusão de notas fiscais' }, rotulo: 'De onde veio a troca' },
          { tipo: 'olhar', alvo: { texto: 'Validade informada pelo operador' }, rotulo: 'A validade informada' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Sim', exato: true, dentro: ALVARA }, rotulo: 'Clique em Sim' },
          { tipo: 'olhar', alvo: { texto: 'Tudo conferido · documento atualizado em conformidade' }, rotulo: 'Pronto para aprovar' },
        ],
      },
    ],
  },
];
