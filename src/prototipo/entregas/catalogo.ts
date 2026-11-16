// O catálogo das entregas do protótipo: CAMADA DO PROTÓTIPO, FORA DO PRODUTO.
//
// Uma entrega é um escopo macro que o time recebe de uma vez (uma reunião, uma rodada, uma funcionalidade). A página
// /fluxos mostra um card por entrega; ao abrir, a entrega lista as jornadas dela, na ordem em que foram pedidas. Cada
// jornada é um fluxo guiado de src/prototipo/fluxos/dados, apontado pelo id.
//
// Entrega nova: um item aqui, um bloco com `entrega: '<id>'` em fluxos/dados e os fluxos dele. Os nove fluxos de
// antes das entregas continuam em /fluxos/anteriores, sem entrar em nenhuma.
export type NaturezaDoItem = 'Fluxo novo' | 'Ajuste' | 'Proposta';

export interface ItemDaEntrega {
  /** A linha do Figma: L1, L2... */
  codigo: string;
  /** O minuto da gravação em que o pedido aparece (ou outra referência curta de origem). */
  minuto: string;
  natureza: NaturezaDoItem;
  titulo: string;
  /** O que muda, em uma frase. */
  muda: string;
  /** Quem vê a mudança. */
  perfil: string;
  /** O id do fluxo guiado (src/prototipo/fluxos/dados). */
  fluxo: string;
}

export interface EntregaDoPrototipo {
  /** Vai no endereço: /fluxos/<id>. */
  id: string;
  titulo: string;
  /** De onde veio: a reunião, a data, a duração. */
  origem: string;
  resumo: string;
  /** Onde estão as telas no Figma. */
  figma: string;
  itens: ItemDaEntrega[];
}

export const ENTREGAS: readonly EntregaDoPrototipo[] = [
  {
    id: 'ajustes-13nov',
    titulo: 'Ajustes da reunião de 13/11',
    origem: 'Planning de 13/11/2026 com o desenvolvimento · os minutos são os da gravação',
    resumo:
      'O que o desenvolvimento pediu para o operador logístico e para a análise do Admin: a validade dos documentos, o botão que diz que salva, a proposta de conferência para a SEMAD e a Minha Conta com o complemento dentro.',
    figma: 'Recicla Goiás - Figma · página Novembro 2026 · Ajustes da planning de 13/11',
    itens: [
      {
        codigo: 'L1',
        minuto: '27:28',
        natureza: 'Fluxo novo',
        titulo: 'Validade dos documentos: aviso, bloqueio e reenvio',
        muda: 'O operador é avisado 30 dias antes de o documento vencer; vencido, o cadastro fica bloqueado e só a etapa Documentos abre para a troca.',
        perfil: 'Operador logístico',
        fluxo: 'ajustes-13nov-l1-validade-operador',
      },
      {
        codigo: 'L2',
        minuto: '27:28',
        natureza: 'Fluxo novo',
        titulo: 'Validade dos documentos: conferência do documento novo',
        muda: 'O cadastro volta para a mesma lista como Documento atualizado e o analista confere só o documento trocado.',
        perfil: 'Admin',
        fluxo: 'ajustes-13nov-l2-validade-admin',
      },
      {
        codigo: 'L3',
        minuto: '52:32',
        natureza: 'Ajuste',
        titulo: 'Avançar vira Salvar e avançar',
        muda: 'O botão principal das etapas 1 a 4 passa a dizer que a etapa é salva ao avançar.',
        perfil: 'Operador logístico',
        fluxo: 'ajustes-13nov-l3-salvar-e-avancar',
      },
      {
        codigo: 'L4',
        minuto: '58:07',
        natureza: 'Proposta',
        titulo: 'Análise do Admin: conferência só em Documentos',
        muda: 'Proposta para a SEMAD: os dados ficam só para leitura, o Sim ou Não continua em cada documento e o analista aponta problema por bloco.',
        perfil: 'Admin',
        fluxo: 'ajustes-13nov-l4-conferencia-so-documentos',
      },
      {
        codigo: 'L5',
        minuto: '1:26:27',
        natureza: 'Ajuste',
        titulo: 'Minha Conta com o complemento dentro',
        muda: 'Com o cadastro aprovado, os dados do operador ficam dentro de Minha Conta, só para consulta, nas mesmas cinco etapas.',
        perfil: 'Operador logístico',
        fluxo: 'ajustes-13nov-l5-minha-conta',
      },
    ],
  },
];

export const entregaPorId = (id: unknown) => ENTREGAS.find((e) => e.id === id);
