// O roteiro da apresentação em slides da validade (26/11/2026): CAMADA DO PROTÓTIPO, FORA DO PRODUTO.
//
// A apresentação alterna três coisas: slides de abertura (capa, a mensagem, o caso), o QUADRO dos ajustes (que vai
// sendo riscado a cada ajuste mostrado) e a TELA AO VIVO (o protótipo embutido, que reproduz um capítulo da jornada
// `validade-19nov-apresentacao` quando quem apresenta dá play). A régua de datas no pé acompanha tudo.
//
// `fala` é a cola de quem apresenta (tecla N). O roteiro completo está em
// docs/sistema/roteiro-apresentacao-validade-26nov.md.

/** A jornada que a tela ao vivo reproduz, e o endereço em que ela começa. */
export const FLUXO = 'validade-19nov-apresentacao';
export const INICIO_DA_TELA = `/emails-operador?email=vence-60&demo=vencendo&perfil=operador&fluxo=${FLUXO}&modo=auto`;

export interface Ajuste {
  titulo: string;
  /** De qual item da mensagem de 19/11 ele veio. */
  item: string;
  antes: string;
  agora: string;
  /** Quando o ajuste (ou parte dele) não está na mensagem: foi acréscimo nosso, e o quadro avisa. */
  marca?: string;
}

export const AJUSTES: readonly Ajuste[] = [
  {
    titulo: 'Dois lembretes antes de vencer',
    item: 'Item 1 da mensagem',
    antes: 'Um aviso só, 30 dias antes.',
    agora: 'E-mails 60 e 30 dias antes.',
  },
  {
    titulo: 'Troca liberada antes de vencer',
    item: 'Veio junto',
    marca: 'Acréscimo nosso',
    antes: 'Só trocava depois de vencido.',
    agora: 'Troca aberta antes, com calendário.',
  },
  {
    titulo: 'No vencimento, 10 dias parcialmente ativo',
    item: 'Itens 2 e 4 da mensagem',
    antes: 'Bloqueava no dia do vencimento.',
    agora: '10 dias: transfere créditos, sem nota fiscal nova.',
  },
  {
    titulo: 'Último aviso, 5 dias antes do bloqueio',
    item: 'Item 1 da mensagem',
    antes: 'Não existia.',
    agora: 'E-mail em 20/12, com a data do bloqueio.',
  },
  {
    titulo: 'Bloqueio total no 11º dia',
    item: 'Item 3 da mensagem',
    antes: 'Começava no vencimento.',
    agora: 'Começa em 25/12, com e-mail. Só a troca do documento abre.',
  },
  {
    titulo: 'Administrador: situação nova e conferência',
    item: 'Item 3 da mensagem',
    marca: 'Em parte, acréscimo nosso',
    antes: 'Não havia Parcialmente ativo.',
    agora: 'Situação nova na lista. Aprovado, o acesso volta.',
  },
];

/** Os marcos da régua de datas. `pos` é a posição na régua, de 0 a 100 (não é proporcional aos dias). */
export interface Marco {
  id: string;
  data: string;
  rotulo: string;
  pos: number;
}

export const MARCOS: readonly Marco[] = [
  { id: 'd1510', data: '15/10', rotulo: '1º lembrete', pos: 4 },
  { id: 'd1411', data: '14/11', rotulo: '2º lembrete', pos: 24 },
  { id: 'd1412', data: '14/12', rotulo: 'vence', pos: 46 },
  { id: 'd2012', data: '20/12', rotulo: 'último aviso', pos: 64 },
  { id: 'd2412', data: '24/12', rotulo: 'fim do prazo', pos: 80 },
  { id: 'd2512', data: '25/12', rotulo: 'bloqueio total', pos: 90 },
];

export type Cena =
  | { tipo: 'capa'; fala: string }
  | { tipo: 'origem'; fala: string }
  | { tipo: 'caso'; marco: string; fala: string }
  /** `foco`: o ajuste em destaque (os anteriores aparecem riscados). Igual ao total = tudo riscado. */
  | { tipo: 'quadro'; foco: number; fala: string }
  | {
      tipo: 'tela';
      /** O capítulo da jornada (a partir de 0). */
      capitulo: number;
      /** O ajuste do quadro a que a tela pertence (a partir de 0). */
      ajuste: number;
      marco: string | null;
      /** A data em destaque na coluna ao lado da tela. */
      data: string;
      titulo: string;
      nota: string;
      quem: 'Operador logístico' | 'Administrador';
      fala: string;
    }
  | { tipo: 'decisoes'; fala: string }
  | { tipo: 'aberto'; fala: string }
  | { tipo: 'fim'; fala: string }
  /** Depois da reunião de 26/11: o que foi feito e entregue, com as telas. */
  | { tipo: 'entrega'; fala: string };

export const CENAS: readonly Cena[] = [
  {
    tipo: 'capa',
    fala: 'Vou mostrar como ficaram as regras de aviso e de bloqueio do documento vencido que a Claudia mandou em 19/11. Está tudo no protótipo, funcionando.',
  },
  {
    tipo: 'origem',
    fala: 'A mensagem tem quatro itens. Eles trocam o que estava combinado em 13/11: um aviso só, 30 dias antes, e o bloqueio no dia do vencimento.',
  },
  {
    tipo: 'caso',
    marco: 'd1412',
    fala: 'Para contar a história, vamos seguir um documento no tempo: o alvará de funcionamento de uma cooperativa, que vence em 14/12/2026. A régua aqui embaixo acompanha a apresentação inteira.',
  },
  {
    tipo: 'quadro',
    foco: 0,
    fala: 'São seis ajustes. Vou passar um por um e riscando o que já foi mostrado. Em cada um, eu dou play e a tela faz o caminho sozinha. Começo pelos lembretes.',
  },
  {
    tipo: 'tela',
    capitulo: 0,
    ajuste: 0,
    marco: 'd1510',
    data: '15/10',
    titulo: '60 dias antes: o primeiro lembrete',
    nota: 'O e-mail diz qual documento vence, a data e o que acontece se vencer.',
    quem: 'Operador logístico',
    fala: 'Sessenta dias antes, em 15/10, o operador recebe o primeiro lembrete. Ele já avisa o que acontece se vencer: 10 dias corridos para regularizar.',
  },
  {
    tipo: 'tela',
    capitulo: 1,
    ajuste: 0,
    marco: 'd1411',
    data: '14/11',
    titulo: '30 dias antes: o segundo lembrete',
    nota: 'O botão do e-mail leva direto para a troca. Ao entrar, o aviso é de atenção, não de erro.',
    quem: 'Operador logístico',
    fala: 'Trinta dias antes chega o segundo lembrete, com o prazo menor. O botão leva para a troca. Ao entrar no sistema, o aviso é de atenção: o cadastro continua aprovado.',
  },
  {
    tipo: 'quadro',
    foco: 1,
    fala: 'Lembretes mostrados. O segundo ajuste não está na mensagem, foi acréscimo nosso para o caminho fechar: se o lembrete pede a troca, a troca precisa abrir antes de vencer.',
  },
  {
    tipo: 'tela',
    capitulo: 2,
    ajuste: 1,
    marco: 'd1411',
    data: 'Antes de vencer',
    titulo: 'Se ele trocar antes de vencer',
    nota: 'Só o documento perto de vencer aceita troca. A validade é escolhida no calendário.',
    quem: 'Operador logístico',
    fala: 'Ele anexa o alvará atualizado, escolhe a validade no calendário e envia. Vai para análise, e nada muda no uso do sistema durante a análise.',
  },
  {
    tipo: 'quadro',
    foco: 2,
    fala: 'E se ele não trocar? Esse é o terceiro ajuste, o maior: o que acontece no dia do vencimento.',
  },
  {
    tipo: 'tela',
    capitulo: 3,
    ajuste: 2,
    marco: 'd1412',
    data: '14/12',
    titulo: 'O vencimento',
    nota: 'O cadastro não bloqueia no dia. O prazo vai até 24/12.',
    quem: 'Operador logístico',
    fala: 'O alvará vence em 14/12. No mesmo dia sai o aviso de documento vencido. Não bloqueia: são 10 dias corridos, contados do dia seguinte, até 24/12. É a regra geral de prazo: não conta o dia do começo, conta o último.',
  },
  {
    tipo: 'tela',
    capitulo: 4,
    ajuste: 2,
    marco: 'd1412',
    data: '10 dias',
    titulo: 'Parcialmente ativo',
    nota: 'Notas Fiscais e Saldo são telas ilustrativas: vale a regra, não o desenho.',
    quem: 'Operador logístico',
    fala: 'Parcialmente ativo é o que a mensagem pediu: incluir nota fiscal nova fica suspenso, e transferir crédito continua liberado. Essas duas telas foram montadas só para mostrar a regra, não substituem as do sistema.',
  },
  {
    tipo: 'quadro',
    foco: 3,
    fala: 'Dentro desses 10 dias, o quarto ajuste: o último aviso.',
  },
  {
    tipo: 'tela',
    capitulo: 5,
    ajuste: 3,
    marco: 'd2012',
    data: '20/12',
    titulo: 'O último aviso',
    nota: 'Sai 5 dias antes do bloqueio, se o documento ainda não foi trocado.',
    quem: 'Operador logístico',
    fala: 'Em 20/12, cinco dias antes do bloqueio, sai o último aviso, com a data do bloqueio. O aviso é pedido da mensagem; a data, 20/12, é leitura nossa.',
  },
  {
    tipo: 'quadro',
    foco: 4,
    fala: 'Se mesmo assim ele não trocar, vem o quinto ajuste: o bloqueio.',
  },
  {
    tipo: 'tela',
    capitulo: 6,
    ajuste: 4,
    marco: 'd2512',
    data: '25/12',
    titulo: 'O bloqueio total',
    nota: 'Sai um e-mail no dia do bloqueio. O menu fica sem acesso; só a atualização do documento abre.',
    quem: 'Operador logístico',
    fala: 'No 11º dia, 25/12, o cadastro bloqueia por completo e o operador recebe um e-mail avisando, como ficou decidido na reunião de 26/11. Só a Minha Conta abre, na etapa Documentos. A única saída é atualizar o alvará, e ele segue bloqueado até a análise.',
  },
  {
    tipo: 'quadro',
    foco: 5,
    fala: 'Falta o outro lado. A mensagem pede que o acesso volte depois da validação; como o administrador vê e confere isso foi desenho nosso.',
  },
  {
    tipo: 'tela',
    capitulo: 7,
    ajuste: 5,
    marco: null,
    data: 'Admin',
    titulo: 'Situação nova e conferência',
    nota: 'O nome Parcialmente ativo é o mesmo para o operador e para o administrador.',
    quem: 'Administrador',
    fala: 'O administrador vê o cadastro como Parcialmente ativo, com o prazo e a data do bloqueio. Quando o documento novo chega, a linha volta ao topo. A conferência diz de onde a troca partiu, e só o documento trocado pede resposta.',
  },
  {
    tipo: 'tela',
    capitulo: 8,
    ajuste: 5,
    marco: null,
    data: 'Aprovado',
    titulo: 'O acesso volta',
    nota: 'O operador é avisado por e-mail e volta a incluir nota fiscal.',
    quem: 'Administrador',
    fala: 'Aprovado, o operador é avisado por e-mail e o acesso volta inteiro: Notas Fiscais aceita nota nova outra vez.',
  },
  {
    tipo: 'quadro',
    foco: 6,
    fala: 'Os seis ajustes estão no protótipo e no Figma.',
  },
  {
    tipo: 'decisoes',
    fala: 'Três pontos em que o pedido é da mensagem e a leitura foi nossa: a data do aviso de 5 dias, o termo Parcialmente ativo como nome na tela e a contagem dos 10 dias a partir do dia seguinte. Confirmados na reunião de 26/11; o nome da situação no sistema fica com o desenvolvimento.',
  },
  {
    tipo: 'aberto',
    fala: 'As duas perguntas que a mensagem deixava abertas foram respondidas na reunião: a validade é um campo de data, e a lista de documentos com validade vem com o tempo; e o bloqueio também avisa por e-mail.',
  },
  {
    tipo: 'fim',
    fala: 'Os textos revisados pela SEMAD já estão no protótipo e no Figma. Segue pendente com a SEMAD: com prazo prorrogado, o cadastro volta ao acesso normal?',
  },
  {
    tipo: 'entrega',
    fala: 'Depois da reunião, os ajustes foram feitos e entregues: os textos revisados pela SEMAD, os avisos em blocos que acompanham o operador, o e-mail no dia do bloqueio e a ficha do documento atualizado para o administrador. Está pronto para produção.',
  },
];

/**
 * Os três pontos a confirmar. Em cada um, o que está na mensagem de 19/11 e o que é leitura nossa: a apresentação
 * não pode passar leitura nossa como pedido (Bruno, 26/11).
 */
export const DECISOES = [
  { titulo: 'Aviso de 5 dias', pedido: '5 dias antes do bloqueio', leitura: 'A data: 20/12. Na mensagem ele vem junto dos lembretes de antes do vencimento.' },
  { titulo: 'Nome da situação', pedido: 'Parcialmente ativo', leitura: 'Usar o termo como nome na tela, para o operador e para o administrador.' },
  { titulo: 'Contagem dos 10 dias', pedido: '10 dias corridos a partir do vencimento', leitura: 'Contar do dia seguinte: prazo até 24/12, bloqueio em 25/12.' },
] as const;

/**
 * O que a mensagem não dizia, e como a reunião de 26/11 com a SEMAD respondeu. Até a reunião eram perguntas; a
 * apresentação enviada depois dela registra as respostas.
 */
export const EM_ABERTO = [
  'Validade dos documentos: um campo de data. Quais documentos têm validade se levanta com o tempo.',
  'E-mail no dia do bloqueio: sim. O operador recebe um aviso em 25/12.',
] as const;

/** Os quatro itens da mensagem: a palavra forte e o complemento. */
export const MENSAGEM = [
  { forte: 'Lembretes', resto: '60 e 30 dias antes de vencer' },
  { forte: '10 dias', resto: 'parcialmente ativo depois de vencer' },
  { forte: 'Bloqueio total', resto: 'a partir do 11º dia' },
  { forte: 'Aviso', resto: 'no dia do vencimento' },
] as const;

/** O slide final, depois da reunião de 26/11: o que foi feito, com a tela de cada coisa (public/img/apresentacao-validade). */
export const ENTREGA = [
  {
    titulo: 'Avisos em blocos',
    texto: 'O que fica suspenso e o que continua liberado, um por linha.',
    imagem: '/img/apresentacao-validade/entrega-conta.png',
  },
  {
    titulo: 'O aviso segue o operador',
    texto: 'Também em Notas Fiscais e em Saldo, até a aprovação do documento.',
    imagem: '/img/apresentacao-validade/entrega-notas.png',
  },
  {
    titulo: 'E-mail no dia do bloqueio',
    texto: 'Decidido na reunião. Sai em 25/12, com como regularizar.',
    imagem: '/img/apresentacao-validade/entrega-email.png',
  },
  {
    titulo: 'Ficha do documento atualizado',
    texto: 'Para o administrador: documento, situação do cadastro e vencimento.',
    imagem: '/img/apresentacao-validade/entrega-admin.png',
  },
] as const;
