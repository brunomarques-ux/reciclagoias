// Fluxos guiados · entrega "Ajustes da reunião de 13/11". Contrato em src/prototipo/fluxos/tipos.ts; como escrever em
// docs/sistema/FLUXOS-GUIADOS.md. Os arquivos de dados importam só tipos.
//
// Um fluxo por linha da seção do Figma (arquivo Recicla Goiás - Figma, página Novembro 2026 · Ajustes da planning de
// 13/11, seção 6506:4284), na ordem da gravação, e um passo por tela da linha. Os nomes e a ordem batem com o vídeo
// narrado da reunião. Cada fluxo parte de um cenário (src/prototipo/cenarios/complemento.ts, ?demo=).
import type { Alvo, BlocoDeFluxos, Fluxo } from '../tipos';

export const BLOCO_AJUSTES_13NOV: BlocoDeFluxos = {
  id: 'ajustes-13nov',
  titulo: 'Ajustes da reunião de 13/11',
  entrega: 'ajustes-13nov',
};

const LIMPAR = ['rg:complemento:*'];
const ALVARA: Alvo = { papel: 'group', nome: 'Alvará de funcionamento' };
const MENU_DA_LINHA: Alvo = { papel: 'button', nome: 'Ações de Cooperativa de Catadores Recicla Cerrado' };

export const FLUXOS_AJUSTES_13NOV: Fluxo[] = [
  {
    id: 'ajustes-13nov-l1-validade-operador',
    bloco: 'ajustes-13nov',
    tipo: 'principal',
    titulo: 'L1 · Validade dos documentos: aviso, bloqueio e reenvio',
    apresentacao:
      'Versão de 13/11, substituída pelas regras de 19/11 (entrega Validade: regras de 19/11). O alvará da cooperativa vai vencer. O operador recebe o aviso 30 dias antes, por e-mail e no sistema. Sem a troca, o cadastro fica bloqueado e só a etapa Documentos abre, até o documento novo ser conferido.',
    regras: [
      { ref: 'Nikael, 27:28', texto: 'Aviso 30 dias antes do vencimento, por e-mail e no topo do sistema. Nada fica bloqueado nesse período.' },
      { ref: 'Nikael, 27:28', texto: 'No vencimento, a situação vira Bloqueado por documentação vencida. Só Documentos abre, e só o documento vencido aceita troca.' },
      { ref: 'Nikael e Flávio, 30:00', texto: 'O documento novo, com a validade, volta para o Admin. O cadastro continua bloqueado até a conferência.' },
      { ref: 'Em aberto', texto: 'O campo de validade é provisório: o definitivo vem do print da homologação.' },
    ],
    inicio: { rota: '/emails-operador?email=vencendo&demo=vencendo', perfil: 'operador', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Leia o e-mail de aviso e clique em Atualizar documento.',
        observar: 'Sai 30 dias antes do vencimento. Diz qual documento vence e quando.',
        acoes: [
          { tipo: 'olhar', alvo: { papel: 'heading', nome: 'Documento vence em 30 dias' }, rotulo: 'E-mail de aviso, a 30 dias' },
          { tipo: 'olhar', alvo: { texto: 'Vence em', exato: true }, rotulo: 'O documento e a data' },
          { tipo: 'clicar', alvo: { papel: 'link', nome: 'Atualizar documento' }, rotulo: 'Clique em Atualizar documento' },
        ],
      },
      {
        fazer: 'Veja o aviso no topo da Minha Conta.',
        observar: 'O cadastro segue aprovado e nada fica bloqueado ainda.',
        acoes: [
          { tipo: 'rolar', alvo: { papel: 'heading', nome: 'Minha conta' }, rotulo: 'Minha Conta' },
          { tipo: 'olhar', alvo: { texto: 'Você possui um documento com data de vencimento próxima' }, rotulo: 'Aviso ao entrar no sistema' },
        ],
      },
      {
        fazer: 'O prazo venceu sem a troca. Leia o e-mail de documento vencido e clique em Atualizar documento.',
        observar: 'Desde as regras de 19/11, este e-mail sai no vencimento e dá 10 dias antes do bloqueio.',
        acoes: [
          { tipo: 'ir', rota: '/emails-operador?email=vencido&demo=vencido', rotulo: 'O documento venceu' },
          { tipo: 'olhar', alvo: { papel: 'heading', nome: 'Documento vencido' }, rotulo: 'E-mail de documento vencido' },
          { tipo: 'clicar', alvo: { papel: 'link', nome: 'Atualizar documento' }, rotulo: 'Clique em Atualizar documento' },
        ],
      },
      {
        fazer: 'Anexe o alvará atualizado, informe a validade 14/12/2027 e clique em Enviar para análise.',
        observar: 'Situação nova. As outras etapas ficam fechadas e só o documento vencido aceita troca.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Cadastro bloqueado por documentação vencida' }, rotulo: 'Bloqueado por documentação vencida' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Anexe o documento corrigido' }, rotulo: 'Clique para anexar' },
          { tipo: 'digitar', alvo: { papel: 'textbox', nome: 'Validade do documento' }, texto: '14/12/2027', rotulo: 'Digite a validade' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Enviar para análise' }, rotulo: 'Clique em Enviar para análise' },
        ],
      },
      {
        fazer: 'Veja o documento enviado para análise.',
        observar: 'O cadastro continua bloqueado até o Admin conferir. O documento fica só para consulta.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Documento enviado para análise' }, rotulo: 'Enviado para análise' },
          { tipo: 'olhar', alvo: { texto: 'Em análise', exato: true }, rotulo: 'O documento novo' },
        ],
      },
    ],
  },
  {
    id: 'ajustes-13nov-l2-validade-admin',
    bloco: 'ajustes-13nov',
    tipo: 'principal',
    titulo: 'L2 · Validade dos documentos: conferência do documento novo',
    apresentacao:
      'O cadastro que trocou o documento vencido entra na mesma lista do Admin, no topo, como Documento atualizado. O analista confere só o documento trocado e a nova validade.',
    regras: [
      { ref: 'Nikael, 27:28', texto: 'Mesma lista de cadastros, no topo, com a situação Documento atualizado. Não há lista separada.' },
      { ref: 'Nikael e Flávio, 30:00', texto: 'O analista responde só pelo documento trocado. Com Sim, o cadastro volta a ficar aprovado.' },
    ],
    inicio: { rota: '/admin/cadastros?demo=atualizado', perfil: 'admin', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Na lista, abra o menu da linha da Recicla Cerrado e clique em Analisar.',
        observar: 'A situação Documento atualizado, no topo, com a data do reenvio.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Documento atualizado', exato: true }, rotulo: 'Documento atualizado, no topo' },
          { tipo: 'clicar', alvo: MENU_DA_LINHA, rotulo: 'Abra o menu da linha' },
          { tipo: 'clicar', alvo: { papel: 'menuitem', nome: 'Analisar' }, rotulo: 'Clique em Analisar' },
        ],
      },
      {
        fazer: 'Confira a validade informada e responda Sim no alvará.',
        observar: 'Os dados e os outros dez documentos chegam conferidos. Só o documento trocado pede resposta.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Validade informada pelo operador' }, rotulo: 'A validade informada' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Sim', exato: true, dentro: ALVARA }, rotulo: 'Clique em Sim' },
          { tipo: 'olhar', alvo: { texto: 'Tudo conferido · documento atualizado em conformidade' }, rotulo: 'Pronto para aprovar' },
        ],
      },
    ],
  },
  {
    id: 'ajustes-13nov-l3-salvar-e-avancar',
    bloco: 'ajustes-13nov',
    tipo: 'principal',
    titulo: 'L3 · Avançar vira Salvar e avançar',
    apresentacao:
      'Cada etapa do formulário é salva quando o operador avança. O rótulo antigo escondia isso. O botão principal das etapas 1 a 4 passa a dizer Salvar e avançar.',
    regras: [
      { ref: 'Nikael, 52:32', texto: 'Vale para as etapas 1 a 4. A última etapa continua com o botão de enviar.' },
    ],
    inicio: { rota: '/operador', perfil: 'operador', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Em Dados gerais, clique em Salvar e avançar.',
        observar: 'Só o rótulo muda. O que foi preenchido fica gravado e a etapa seguinte abre.',
        acoes: [
          { tipo: 'olhar', alvo: { papel: 'button', nome: 'Salvar e avançar', exato: true }, rotulo: 'O botão novo' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Salvar e avançar', exato: true }, rotulo: 'Clique em Salvar e avançar' },
          { tipo: 'olhar', alvo: { papel: 'heading', nome: 'Documentos da cooperativa' }, rotulo: 'A etapa seguinte abre' },
        ],
      },
    ],
  },
  {
    id: 'ajustes-13nov-l4-conferencia-so-documentos',
    bloco: 'ajustes-13nov',
    tipo: 'alternativo',
    titulo: 'L4 · Análise do Admin: conferência só em Documentos',
    apresentacao:
      'Decidido na planning de 13/11. Dados gerais, Operação e Estrutura ficam só para leitura, sem aceite campo a campo. O Sim ou Não continua em cada documento, e o analista aponta problema por bloco quando um dado está errado.',
    regras: [
      { ref: 'Flávio, 58:07', texto: 'Dados em leitura, rótulo e valor. O aceite fica nos 11 documentos.' },
      { ref: 'Flávio, 58:07', texto: 'Apontar problema é opcional e vale por bloco. Salvo, conta como pendência e vai no e-mail de correção.' },
      { ref: 'Planning 13/11', texto: 'A conferência campo a campo saiu: a análise é dos documentos.' },
    ],
    inicio: { rota: '/admin/cadastros/opl-2026-00184?demo=proposta', perfil: 'admin', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Veja os dados em leitura e, no alvará, responda Não.',
        observar: 'Rótulo e valor, sem os botões de certo e errado em cada campo. Apontar problema aparece em cada bloco.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Dados para consulta, sem aceite campo a campo' }, rotulo: 'Dados só para leitura' },
          { tipo: 'olhar', alvo: { papel: 'button', nome: 'Apontar problema em Dados gerais' }, rotulo: 'Apontar problema, por bloco' },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Não', exato: true, dentro: ALVARA }, rotulo: 'Clique em Não' },
        ],
      },
      {
        fazer: 'Escolha Documento vencido, descreva o motivo e clique em Salvar motivo.',
        observar: 'O motivo abre no próprio lugar, com a descrição obrigatória. Sem janela.',
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
        fazer: 'Veja o motivo salvo e o Devolver para correção disponível.',
        observar: 'A contagem mostra a pendência. Aprovar cadastro continua travado.',
        acoes: [
          { tipo: 'olhar', alvo: { texto: 'Conferidos: 11 de 11 documentos · 1 pendência' }, rotulo: 'A pendência na contagem' },
          { tipo: 'olhar', alvo: { papel: 'button', nome: 'Devolver para correção' }, rotulo: 'Devolver disponível' },
        ],
      },
      {
        fazer: 'Caso de exceção: clique em Apontar problema no bloco Dados gerais e descreva o que corrigir.',
        observar: 'A observação abre no próprio bloco. Salva, conta como pendência e vai junto com os motivos dos documentos.',
        acoes: [
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Apontar problema em Dados gerais' }, rotulo: 'Clique em Apontar problema' },
          {
            tipo: 'digitar',
            alvo: { papel: 'textbox', nome: 'O que a organização precisa corrigir' },
            texto: 'O telefone informado não atende. Informe um número ativo da cooperativa, com DDD.',
            rotulo: 'Descreva o problema',
          },
          { tipo: 'clicar', alvo: { papel: 'button', nome: 'Salvar observação' }, rotulo: 'Clique em Salvar observação' },
          { tipo: 'olhar', alvo: { texto: '1 problema apontado em Dados gerais' }, rotulo: 'Entra na contagem' },
        ],
      },
    ],
  },
  {
    id: 'ajustes-13nov-l5-minha-conta',
    bloco: 'ajustes-13nov',
    tipo: 'principal',
    titulo: 'L5 · Minha Conta com o complemento dentro',
    apresentacao:
      'O desenvolvimento juntou o complemento à Minha Conta. Com o cadastro aprovado, o item Complemento de cadastro sai do menu e os dados ficam dentro de Minha Conta, só para consulta, nas mesmas cinco etapas.',
    regras: [
      { ref: 'Nikael, 1:26:27', texto: 'Cadastro aprovado é só consulta: campos travados, as cinco etapas no stepper e as configurações da conta acima.' },
      { ref: 'Em aberto', texto: 'O botão segue Avançar, como em homologação: ali nada é salvo. A confirmar com o desenvolvimento.' },
    ],
    inicio: { rota: '/operador?demo=aprovado', perfil: 'operador', limpar: LIMPAR },
    passos: [
      {
        fazer: 'Veja a Minha Conta com o cadastro aprovado.',
        observar: 'O menu ganha as funções do operador. O aviso verde, as configurações da conta e as cinco etapas, com os campos travados.',
        acoes: [
          { tipo: 'olhar', alvo: { papel: 'navigation', nome: 'Seções do sistema' }, rotulo: 'O menu do operador aprovado' },
          { tipo: 'olhar', alvo: { texto: 'Seu cadastro está aprovado.' }, rotulo: 'Cadastro aprovado' },
          { tipo: 'olhar', alvo: { papel: 'heading', nome: 'Configurações da conta' }, rotulo: 'Compartilhamento e senha' },
          { tipo: 'olhar', alvo: { papel: 'navigation', nome: 'Etapas do complemento de cadastro' }, rotulo: 'As mesmas cinco etapas' },
          { tipo: 'olhar', alvo: { texto: 'CNAEs', exato: true }, rotulo: 'CNAEs em chips, campos travados' },
        ],
      },
    ],
  },
];
