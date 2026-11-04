// Fluxos guiados · bloco "Operador logístico". Contrato em src/fluxos/tipos.ts; como escrever em
// docs/sistema/FLUXOS-GUIADOS.md. Os arquivos de dados importam só tipos.
//
// Um fluxo por linha da seção do operador no Figma (arquivo Recicla Goiás - Figma, página Complemento de Cadastro -
// Operador Logístico), na rodada da planning de 16/10 fechada em 18/10. O estado do complemento vive na chave
// rg:complemento:v2; cada fluxo limpa e parte de um cenário conhecido (?demo= da store complemento).
import type { Alvo, BlocoDeFluxos, Fluxo } from '../tipos';

export const BLOCO_OPERADOR: BlocoDeFluxos = {
  id: 'operador',
  titulo: 'Operador logístico',
  resumo: 'O complemento de cadastro: preencher, enviar, corrigir antes da análise e responder à devolução.',
};

const LIMPAR = ['rg:complemento:*'];
const AVANCAR: Alvo = { papel: 'button', nome: 'Avançar', exato: true };
const JANELA: Alvo = { papel: 'dialog', nome: '' };

/** Na ordem em que aparecem na página /fluxos (dentro do bloco, os principais e alternativos vêm antes das exceções). */
export const FLUXOS_OPERADOR: Fluxo[] = [
  {
    id: 'operador-preencher-e-enviar',
    bloco: 'operador',
    tipo: 'principal',
    titulo: 'Preencher o complemento e enviar',
    apresentacao:
      'A organização completa o cadastro em cinco etapas. Tudo é obrigatório, cada etapa fica salva ao avançar e só o envio final confere se falta alguma coisa.',
    regras: [
      { ref: 'Planning 16/10', texto: 'Todos os campos e os 11 documentos são obrigatórios.' },
      { ref: 'Planning 16/10', texto: 'Sem o documento, anexa o protocolo ou uma justificativa e explica na observação.' },
      { ref: 'Planning 16/10', texto: 'Salvamento por etapa: avançar é livre, só o envio trava.' },
      { ref: 'Decisão 18/10', texto: 'A revisão é visualização em acordeão, rótulo e valor, nunca campo desativado.' },
    ],
    inicio: { rota: '/operador', perfil: 'operador', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Confira os dados que vieram do pré-cadastro e clique em Avançar.',
        observar: 'Razão social, CNPJ, e-mail e tipo chegam bloqueados. Todo campo aberto leva o asterisco.',
        acoes: [
          { tipo: 'olhar', alvo: { papel: 'textbox', nome: 'Razão social' }, rotulo: 'Vem do pré-cadastro' },
          { tipo: 'clicar', alvo: AVANCAR, rotulo: 'Clique em Avançar' },
        ],
      },
      {
        fazer: 'Veja os documentos anexados e clique em Avançar.',
        observar: 'Sem o Sim/Não: um anexo por documento. A licença foi trocada pelo protocolo, explicado na observação.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'protocolo-renovacao-licenca.pdf' }, rotulo: 'Protocolo no lugar da licença' },
          { tipo: 'olhar', alvo: { papel: 'textbox', nome: 'Observações sobre os documentos' }, rotulo: 'A observação explica' },
          { tipo: 'clicar', alvo: AVANCAR, rotulo: 'Clique em Avançar' },
        ],
      },
      {
        fazer: 'Em Operação, clique em Avançar.',
        observar: 'As perguntas levam o asterisco. Avançar salva a etapa.',
        acoes: [{ tipo: 'clicar', alvo: AVANCAR, rotulo: 'Clique em Avançar' }],
      },
      {
        fazer: 'Preencha a capacidade de beneficiamento do vidro com 8 toneladas por mês e clique em Avançar.',
        acoes: [
          { tipo: 'digitar', alvo: { papel: 'textbox', nome: 'Capacidade de beneficiamento' }, texto: '8 toneladas por mês', rotulo: 'Digite a capacidade' },
          { tipo: 'clicar', alvo: AVANCAR, rotulo: 'Clique em Avançar' },
        ],
      },
      {
        fazer: 'Confira a revisão e clique em Enviar cadastro.',
        observar: 'Um bloco por etapa, em acordeão, com o Editar que leva à etapa.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: '11 documentos anexados e a observação' }, rotulo: 'Resumo do bloco' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Enviar cadastro' }, rotulo: 'Clique em Enviar cadastro' },
        ],
      },
      {
        fazer: 'Na janela, clique em Enviar para análise.',
        observar: 'Com tudo preenchido, a janela só confirma e lembra que dá para corrigir até a análise começar.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Enviar para análise', dentro: JANELA }, rotulo: 'Clique em Enviar para análise' }],
      },
      {
        fazer: 'Veja o cadastro enviado.',
        observar: 'A situação Enviado no topo e o Editar em cada bloco, enquanto a análise não começa.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Cadastro enviado para análise' }, rotulo: 'Confirmação do envio' },
          { tipo: 'olhar', alvo: { papel: 'button', nome: 'Editar Dados gerais' }, rotulo: 'Ainda dá para editar' },
        ],
      },
    ],
  },
  {
    id: 'operador-editar-antes-da-analise',
    bloco: 'operador',
    tipo: 'alternativo',
    titulo: 'Corrigir um dado depois do envio',
    apresentacao:
      'Enviado, o cadastro ainda pode ser corrigido pelo Editar de cada bloco, enquanto nenhum analista começou a análise.',
    regras: [{ ref: 'Planning 16/10', texto: 'Na situação Enviado, a organização ainda edita.' }],
    inicio: { rota: '/operador?demo=enviado', perfil: 'operador', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Clique em Editar, no bloco Dados gerais.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Editar Dados gerais' }, rotulo: 'Clique em Editar' }],
      },
      {
        fazer: 'Troque o telefone para (62) 3555-0198 e clique em Salvar alterações.',
        observar: 'A edição usa a mesma etapa do formulário, com Cancelar e Salvar alterações.',
        acoes: [
          { tipo: 'digitar', alvo: { papel: 'textbox', nome: 'Telefone (com DDD)' }, texto: '(62) 3555-0198', rotulo: 'Digite o telefone' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Salvar alterações' }, rotulo: 'Clique em Salvar alterações' },
        ],
      },
      {
        fazer: 'Veja o telefone novo no cadastro.',
        acoes: [{ tipo: 'olhar', alvo: { texto: '(62) 3555-0198' }, rotulo: 'Alteração salva' }],
      },
    ],
  },
  {
    id: 'operador-corrigir-e-reenviar',
    bloco: 'operador',
    tipo: 'principal',
    titulo: 'Corrigir o que a análise devolveu e reenviar',
    apresentacao:
      'A análise devolveu o cadastro com duas pendências: o telefone e o alvará. Só o que foi devolvido abre para edição, com o motivo junto do campo.',
    regras: [
      { ref: 'SEMAD 15/09', texto: 'O alerta vermelho fica no topo de todas as etapas até o reenvio.' },
      { ref: 'SEMAD 27/09', texto: 'O anexo recusado continua listado, e o corrigido entra logo abaixo.' },
      { ref: 'Planning 16/10', texto: 'Não existe Reenviado: o corrigido volta a Enviado, no topo da fila.' },
    ],
    inicio: { rota: '/operador?demo=devolvido', perfil: 'operador', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Leia o alerta e corrija o telefone para (62) 3555-0198.',
        observar: 'O motivo escrito pelo analista aparece junto do campo. O que foi conferido fica bloqueado.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Seu cadastro precisa de correção' }, rotulo: 'Duas pendências' },
          { tipo: 'digitar', alvo: { papel: 'textbox', nome: 'Telefone (com DDD)' }, texto: '(62) 3555-0198', rotulo: 'Digite o telefone' },
        ],
      },
      {
        fazer: 'Vá para a etapa Documentos.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Documentos' }, rotulo: 'Clique em Documentos' }],
      },
      {
        fazer: 'No alvará, anexe o documento corrigido.',
        observar: 'O arquivo recusado continua na lista, com baixar. Os outros documentos estão como Conferido.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'O documento apresentado está vencido' }, rotulo: 'Motivo da análise' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Anexe o documento corrigido' }, rotulo: 'Clique para anexar' },
        ],
      },
      {
        fazer: 'Clique em Ir para a revisão.',
        observar: 'O arquivo novo entra com o contorno tracejado e pode ser baixado ou excluído.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'alvara-funcionamento-2026-atualizado.pdf' }, rotulo: 'Arquivo corrigido' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Ir para a revisão' }, rotulo: 'Clique em Ir para a revisão' },
        ],
      },
      {
        fazer: 'Clique em Reenviar para análise e confirme na janela.',
        acoes: [
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Reenviar para análise' }, rotulo: 'Clique em Reenviar' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Reenviar para análise', dentro: JANELA }, rotulo: 'Confirme o reenvio' },
        ],
      },
      {
        fazer: 'Veja o cadastro reenviado.',
        observar: 'Volta a Enviado. Até a nova análise começar, ainda dá para editar.',
        acoes: [{ tipo: 'olhar', alvo: { texto: 'Cadastro reenviado para análise' }, rotulo: 'Reenviado' }],
      },
    ],
  },
  {
    id: 'operador-envio-com-campo-faltando',
    bloco: 'operador',
    tipo: 'excecao',
    titulo: 'Envio com campo faltando',
    apresentacao:
      'Avançar é livre, então a revisão pode chegar com algum campo em branco. O envio não passa: a janela diz pelo nome o que falta e leva à etapa.',
    regras: [
      { ref: 'Planning 16/10', texto: 'Só o envio final é bloqueado por pendências.' },
      { ref: 'SEMAD 26/09', texto: 'A janela lista o que falta pelo nome, não um "tem certeza?" genérico.' },
    ],
    inicio: { rota: '/operador', perfil: 'operador', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Vá direto para Revisão e envio, pelo passo no topo.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Revisão e envio' }, rotulo: 'Clique em Revisão e envio' }],
      },
      {
        fazer: 'Clique em Enviar cadastro.',
        observar: 'O bloco Estrutura e capacidade já diz o que falta.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'falta Capacidade de beneficiamento' }, rotulo: 'O que falta, no bloco' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Enviar cadastro' }, rotulo: 'Clique em Enviar cadastro' },
        ],
      },
      {
        fazer: 'Na janela, clique em Ir para a etapa.',
        observar: 'A janela lista o campo pelo nome, agrupado pela etapa, e não envia.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Ir para a etapa', dentro: JANELA }, rotulo: 'Clique em Ir para a etapa' }],
      },
      {
        fazer: 'Preencha a capacidade de beneficiamento com 8 toneladas por mês e clique em Avançar.',
        observar: 'O campo abre em erro, com a mensagem do que preencher.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Preencha a capacidade de beneficiamento' }, rotulo: 'Campo em erro' },
          { tipo: 'digitar', alvo: { papel: 'textbox', nome: 'Capacidade de beneficiamento' }, texto: '8 toneladas por mês', rotulo: 'Digite a capacidade' },
          { tipo: 'clicar', alvo: AVANCAR, rotulo: 'Clique em Avançar' },
        ],
      },
      {
        fazer: 'Clique em Enviar cadastro e confirme na janela.',
        acoes: [
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Enviar cadastro' }, rotulo: 'Clique em Enviar cadastro' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Enviar para análise', dentro: JANELA }, rotulo: 'Clique em Enviar para análise' },
        ],
      },
    ],
  },
  {
    id: 'operador-analise-comecou-na-edicao',
    bloco: 'operador',
    tipo: 'excecao',
    titulo: 'A análise começou durante a edição',
    apresentacao:
      'A organização abriu uma etapa para corrigir, mas um analista clicou em Analisar antes de ela salvar. A alteração não é gravada e a janela explica por quê.',
    regras: [
      { ref: 'Planning 16/10', texto: 'Analisar atribui o cadastro ao analista e trava a edição da organização.' },
      { ref: 'Decisão 18/10', texto: 'Em análise, a visualização perde o Editar: rótulo e valor, nada desativado.' },
    ],
    inicio: { rota: '/operador?demo=enviado&simular=analise-comecou', perfil: 'operador', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Clique em Editar, no bloco Estrutura e capacidade.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Editar Estrutura e capacidade' }, rotulo: 'Clique em Editar' }],
      },
      {
        fazer: 'Troque a capacidade para 12 toneladas por mês e clique em Salvar alterações.',
        observar: 'No protótipo, a análise começa no momento de salvar (simulação ligada no rodapé).',
        acoes: [
          { tipo: 'digitar', alvo: { papel: 'textbox', nome: 'Capacidade de beneficiamento' }, texto: '12 toneladas por mês', rotulo: 'Digite a capacidade' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Salvar alterações' }, rotulo: 'Clique em Salvar alterações' },
        ],
      },
      {
        fazer: 'Leia a janela e clique em Ver o cadastro.',
        observar: 'A alteração não foi salva. Até o resultado, o cadastro fica só para consulta.',
        acoes: [{ tipo: 'clicar', alvo: { papel: 'button', nome: 'Ver o cadastro', dentro: JANELA }, rotulo: 'Clique em Ver o cadastro' }],
      },
      {
        fazer: 'Veja o cadastro em análise.',
        observar: 'A situação Em análise no topo e nenhum Editar.',
        acoes: [{ tipo: 'olhar', alvo: { texto: 'A análise começou.' }, rotulo: 'Só para consulta' }],
      },
    ],
  },
];
