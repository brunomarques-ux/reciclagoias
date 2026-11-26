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
      { ref: 'Decidido, 26/11', texto: 'Os 10 dias contam do dia seguinte ao vencimento (prazo até 24/12); o aviso de 5 dias sai em 20/12.' },
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
      { ref: 'Claudia, 19/11, item 2', texto: 'A situação Parcialmente ativo aparece na lista, com o mesmo nome que o operador vê (decidido em 26/11).' },
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
  {
    // Apresentação de 26/11/2026, 14h (Bruno com a Thainá, SEMAD): a história inteira numa jornada só, em capítulos,
    // na linha do tempo do documento. Cada capítulo para no fim, para quem apresenta falar. O roteiro de fala está em
    // docs/sistema/roteiro-apresentacao-validade-26nov.md. Sem encadear com L1 a L4 (registro.ts).
    id: 'validade-19nov-apresentacao',
    bloco: 'validade-19nov',
    tipo: 'principal',
    titulo: 'Apresentação · Validade do documento, do lembrete ao acesso de volta',
    apresentacao:
      'O alvará da cooperativa Recicla Cerrado vence em 14/12/2026. A jornada segue esse documento no tempo: os lembretes, a troca antes de vencer, o vencimento com 10 dias parcialmente ativo, o último aviso, o bloqueio total e a conferência do Admin, até o acesso voltar.',
    regras: [
      { ref: 'Claudia, 19/11, item 1', texto: 'Lembretes 60 e 30 dias antes do vencimento e 5 dias antes do bloqueio.' },
      { ref: 'Claudia, 19/11, item 2', texto: '10 dias corridos parcialmente ativo: transfere créditos, não inclui nota fiscal.' },
      { ref: 'Claudia, 19/11, item 3', texto: 'Bloqueio total no 11º dia; só a troca do documento abre; o acesso volta depois da validação.' },
      { ref: 'Claudia, 19/11, item 4', texto: 'No dia do vencimento, aviso de documento vencido com o prazo de 10 dias.' },
      { ref: 'Decidido, 26/11', texto: 'Prazo do dia seguinte ao vencimento (até 24/12), aviso de 5 dias em 20/12, nome Parcialmente ativo.' },
    ],
    inicio: { rota: '/emails-operador?email=vence-60&demo=vencendo', perfil: 'operador', limpar: LIMPAR },
    passos: [
      // 1 · 15/10
      {
        capitulo: '60 dias antes: o primeiro lembrete',
        fazer: 'Em 15/10, 60 dias antes, o operador recebe o primeiro lembrete.',
        observar: 'Diz qual documento vence, a data e o que acontece se vencer.',
        acoes: [
          { tipo: 'olhar', alvo: { papel: 'heading', nome: 'Documento vence em 60 dias' }, rotulo: 'Primeiro lembrete, 15/10' },
          { tipo: 'olhar', alvo: { texto: 'há 10 dias corridos para regularizar' }, rotulo: 'O que acontece se vencer' },
        ],
      },
      // 2 · 14/11
      {
        capitulo: '30 dias antes: o segundo lembrete e o aviso ao entrar',
        fazer: 'Em 14/11, 30 dias antes, chega o segundo lembrete. Ele leva direto para a troca.',
        observar: 'Mesmo e-mail, com o prazo menor.',
        acoes: [
          { tipo: 'ir', rota: '/emails-operador?email=vencendo', rotulo: '14/11, 30 dias antes' },
          { tipo: 'olhar', alvo: { papel: 'heading', nome: 'Documento vence em 30 dias' }, rotulo: 'Segundo lembrete' },
          { tipo: 'clicar', alvo: { papel: 'link', nome: 'Atualizar documento' }, rotulo: 'Clique em Atualizar documento' },
        ],
      },
      {
        fazer: 'Ao entrar, a Minha Conta mostra o aviso de documento perto de vencer.',
        observar: 'Aviso de atenção, não de erro. O cadastro segue aprovado.',
        acoes: [{ tipo: 'olhar', alvo: { texto: 'Você tem documento perto de vencer' }, rotulo: 'Aviso ao entrar' }],
      },
      // 3 · troca antes de vencer
      {
        capitulo: 'Se ele trocar antes de vencer',
        fazer: 'Ele já pode trocar o alvará: anexa o novo, escolhe a validade no calendário e envia.',
        observar: 'Só o documento perto de vencer aceita troca. Os outros seguem conferidos.',
        acoes: [...TROCAR_O_ALVARA],
      },
      {
        fazer: 'O documento vai para a conferência, e nada fica restrito.',
        observar: 'Enquanto a equipe confere, o cadastro segue aprovado e o uso do sistema não muda.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Documento enviado para conferência' }, rotulo: 'Enviado para conferência' },
          { tipo: 'olhar', alvo: { texto: 'nada muda no uso do sistema' }, rotulo: 'Sem restrição' },
        ],
      },
      // 4 · 14/12
      {
        capitulo: 'Se não trocar: o vencimento, em 14/12',
        fazer: 'Sem a troca, o alvará vence em 14/12. No mesmo dia sai o aviso de documento vencido.',
        observar: 'Não bloqueia no dia: dá o prazo até 24/12 e diz o que fica suspenso.',
        acoes: [
          { tipo: 'ir', rota: '/emails-operador?email=vencido&demo=regularizacao', rotulo: '14/12, o alvará venceu' },
          { tipo: 'olhar', alvo: { papel: 'heading', nome: 'Documento vencido' }, rotulo: 'Aviso de vencido' },
          { tipo: 'olhar', alvo: { texto: 'Prazo para regularizar' }, rotulo: 'Prazo até 24/12' },
          { tipo: 'clicar', alvo: { papel: 'link', nome: 'Atualizar documento' }, rotulo: 'Clique em Atualizar documento' },
        ],
      },
      {
        fazer: 'Na Minha Conta, o aviso vermelho: cadastro parcialmente ativo até 24/12.',
        observar: 'O menu continua funcionando.',
        acoes: [{ tipo: 'olhar', alvo: { texto: 'Documento vencido: regularize até' }, rotulo: 'Parcialmente ativo' }],
      },
      // 5 · os 10 dias
      {
        capitulo: 'Os 10 dias parcialmente ativo',
        fazer: 'Em Notas Fiscais, incluir nota nova fica suspenso.',
        observar: 'O botão fica desativado, com o motivo e o prazo ao lado.',
        acoes: [
          { tipo: 'clicar', alvo: { papel: 'link', nome: 'Notas Fiscais' }, rotulo: 'Clique em Notas Fiscais' },
          { tipo: 'olhar', alvo: { texto: 'Inclusão de notas fiscais suspensa' }, rotulo: 'Inclusão suspensa' },
          { tipo: 'olhar', alvo: { papel: 'button', nome: 'Incluir nota fiscal' }, rotulo: 'Botão desativado' },
        ],
      },
      {
        fazer: 'Em Saldo, a transferência de créditos continua liberada.',
        observar: 'Notas Fiscais e Saldo são telas ilustrativas: vale a regra, não o desenho.',
        acoes: [
          { tipo: 'clicar', alvo: { papel: 'link', nome: 'Saldo' }, rotulo: 'Clique em Saldo' },
          { tipo: 'olhar', alvo: { texto: 'Transferência de créditos liberada' }, rotulo: 'Créditos liberados' },
          { tipo: 'olhar', alvo: { papel: 'button', nome: 'Transferir créditos' }, rotulo: 'Botão ativo' },
        ],
      },
      // 6 · 20/12
      {
        capitulo: '20/12: o último aviso, 5 dias antes do bloqueio',
        fazer: 'Em 20/12, ainda sem a troca, sai o último aviso, com a data do bloqueio.',
        observar: 'O bloqueio total começa em 25/12.',
        acoes: [
          { tipo: 'ir', rota: '/emails-operador?email=bloqueio-em-5-dias', rotulo: '20/12, sem a troca' },
          { tipo: 'olhar', alvo: { papel: 'heading', nome: 'Faltam 5 dias para o bloqueio' }, rotulo: 'Último aviso' },
        ],
      },
      // 7 · 25/12
      {
        capitulo: '25/12: o bloqueio total',
        fazer: 'No 11º dia, 25/12, o cadastro fica bloqueado por completo.',
        observar: 'Notas Fiscais, Saldo e as demais funções ficam sem acesso. Só a Minha Conta abre, na etapa Documentos.',
        acoes: [
          { tipo: 'ir', rota: '/operador?demo=vencido', rotulo: '25/12, o 11º dia' },
          { tipo: 'olhar', alvo: { texto: 'Cadastro bloqueado por documentação vencida' }, rotulo: 'Bloqueio total' },
          { tipo: 'olhar', alvo: { texto: 'Notas Fiscais', exato: true }, rotulo: 'Menu sem acesso' },
        ],
      },
      {
        fazer: 'A única saída é trocar o alvará: anexa o novo, escolhe a validade e envia.',
        observar: 'As outras etapas ficam fechadas.',
        acoes: [...TROCAR_O_ALVARA],
      },
      {
        fazer: 'Enviado, o cadastro segue bloqueado até a equipe conferir.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Documento enviado para conferência' }, rotulo: 'Enviado para conferência' },
          { tipo: 'olhar', alvo: { texto: 'O cadastro continua bloqueado' }, rotulo: 'Ainda bloqueado' },
        ],
      },
      // 8 · Admin
      {
        capitulo: 'O administrador: situação nova e conferência',
        fazer: 'Do lado do Admin, o cadastro aparece como Parcialmente ativo, com o prazo e a data do bloqueio.',
        observar: 'Mesmo nome que o operador vê.',
        acoes: [
          { tipo: 'ir', rota: '/admin/cadastros/OPL-2026-00184?demo=regularizacao&perfil=admin', rotulo: 'Agora, o administrador' },
          { tipo: 'olhar', alvo: { texto: 'Parcialmente ativo · documento vencido' }, rotulo: 'Situação nova' },
          { tipo: 'olhar', alvo: { texto: 'Parcialmente ativo até' }, rotulo: 'O prazo e o bloqueio' },
        ],
      },
      {
        fazer: 'Chegou o alvará novo: a linha volta ao topo como Documento atualizado. O analista abre a análise.',
        acoes: [
          { tipo: 'ir', rota: '/admin/cadastros?demo=atualizado-no-prazo', rotulo: 'O documento novo chegou' },
          { tipo: 'olhar', alvo: { texto: 'Documento atualizado', exato: true }, rotulo: 'Documento atualizado' },
          { tipo: 'clicar', alvo: MENU_DA_LINHA, rotulo: 'Abra o menu da linha' },
          { tipo: 'clicar', alvo: { papel: 'menuitem', nome: 'Analisar' }, rotulo: 'Clique em Analisar' },
        ],
      },
      {
        fazer: 'A conferência diz de onde a troca partiu. O analista confere a validade e responde Sim no alvará.',
        observar: 'Só o documento trocado pede resposta.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'parcialmente ativo, sem inclusão de notas fiscais' }, rotulo: 'De onde veio a troca' },
          { tipo: 'olhar', alvo: { texto: 'Validade informada pelo operador' }, rotulo: 'A validade informada' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Sim', exato: true, dentro: ALVARA }, rotulo: 'Clique em Sim' },
        ],
      },
      // 9 · o acesso volta
      {
        capitulo: 'Aprovado, o acesso volta',
        fazer: 'O analista aprova o cadastro.',
        observar: 'O operador é avisado por e-mail.',
        acoes: [
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Aprovar cadastro' }, rotulo: 'Clique em Aprovar cadastro' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Aprovar cadastro', dentro: { papel: 'dialog', nome: 'Aprovar o cadastro?' } }, rotulo: 'Confirme' },
          { tipo: 'olhar', alvo: { texto: 'Cadastro aprovado' }, rotulo: 'Aprovado' },
        ],
      },
      {
        fazer: 'De volta ao operador: Notas Fiscais aceita nota nova outra vez.',
        observar: 'O cadastro está aprovado, sem aviso e sem restrição.',
        acoes: [
          { tipo: 'ir', rota: '/operador/notas-fiscais?perfil=operador', rotulo: 'O operador de novo' },
          { tipo: 'olhar', alvo: { papel: 'button', nome: 'Incluir nota fiscal' }, rotulo: 'Inclusão liberada' },
        ],
      },
    ],
  },
];
