// Cenários do complemento do operador: CAMADA DO PROTÓTIPO, FORA DO PRODUTO.
//
// Um cenário leva a store `complemento` a um ponto de partida conhecido, pelo endereço (`?demo=<nome>`), para a
// jornada começar na tela certa sem refazer a volta inteira nem trocar de perfil no meio. Ele só usa as ações
// públicas da store, as mesmas que as telas chamam: nenhum estado é fabricado por fora das regras.
//
// Até 16/11/2026 isto morava dentro da própria store (`aplicarDemo`, `reiniciar`, `simularAnaliseNaGravacao`). Saiu
// de lá para o código das telas poder ir ao desenvolvimento sem a camada (docs/sistema/CAMADA-DE-PROTOTIPO.md).
import { nextTick, ref } from 'vue';
import type { Pinia } from 'pinia';

import { cadastroDeExemplo, DOCUMENTOS_EXIGIDOS, VALIDADE_DEMO } from '@/data/mocks/operador';
import { CHAVE_COMPLEMENTO, useComplementoStore, type StoreDoCadastro } from '@/stores/complemento';

/**
 * - enviado: tudo preenchido e enviado em 01/09.
 * - devolvido: a análise devolveu o telefone e o alvará.
 * - corrigido: o operador corrigiu os dois e reenviou.
 * Planning de 13/11/2026:
 * - proposta: em análise com a conferência só em Documentos ligada, os dez documentos depois do alvará em Sim (L4).
 * - aprovado: cadastro aprovado, o complemento dentro de Minha Conta (L5).
 * - vencendo: aprovado, com o alvará vencendo (lembretes de 60 e 30 dias; aviso no painel).
 * - vencido: bloqueio total, no 11º dia depois do vencimento.
 * - atualizado: o documento novo foi enviado para conferência depois do bloqueio.
 * Regras de 19/11/2026:
 * - regularizacao: vencido dentro dos 10 dias, cadastro parcialmente ativo.
 * - atualizado-no-prazo: o documento novo foi enviado dentro dos 10 dias e espera a conferência.
 */
export const CENARIOS = [
  'enviado', 'devolvido', 'corrigido', 'proposta', 'aprovado', 'vencendo', 'regularizacao', 'atualizado-no-prazo',
  'vencido', 'atualizado',
] as const;
export type Cenario = (typeof CENARIOS)[number];

export const ehCenario = (nome: unknown): nome is Cenario => CENARIOS.includes(nome as Cenario);

/** A store nova em folha: a anterior sai (com o que ela gravou) e a próxima nasce no estado inicial. */
function storeLimpa(pinia: Pinia) {
  const anterior = useComplementoStore(pinia);
  anterior.$dispose();
  delete pinia.state.value[anterior.$id];
  try {
    window.sessionStorage.removeItem(CHAVE_COMPLEMENTO);
  } catch {
    /* sem armazenamento: o cenário vale até a recarga */
  }
  return useComplementoStore(pinia);
}

/** Leva o complemento ao cenário. Quem já está com a tela aberta precisa remontar a tela (a raiz cuida disso). */
export async function aplicarCenario(pinia: Pinia, nome: Cenario): Promise<void> {
  const c = storeLimpa(pinia);
  montar(c, nome);
  await nextTick(); // a store grava no sessionStorage antes de a tela (ou a recarga) ler
}

function montar(c: StoreDoCadastro, nome: Cenario): void {
  c.formulario.capacidadeVidro = '8 toneladas por mês';
  c.enviar();
  c.dataEnvio = '01/09/2026, às 10h12';
  c.historico[0]!.data = c.dataEnvio;
  if (nome === 'enviado') return;

  if (nome === 'proposta') {
    c.soDocumentos = true;
    c.iniciarAnalise();
    c.historico[0]!.data = '02/09/2026, às 09h30';
    for (const d of DOCUMENTOS_EXIGIDOS) if (d.id !== 'alvara') c.marcarDocumento(d.id, 'sim');
    return;
  }

  if (
    nome === 'aprovado' || nome === 'vencendo' || nome === 'regularizacao' || nome === 'atualizado-no-prazo' ||
    nome === 'vencido' || nome === 'atualizado'
  ) {
    c.relogio = VALIDADE_DEMO.aprovadoEm;
    c.iniciarAnalise();
    for (const d of DOCUMENTOS_EXIGIDOS) c.marcarDocumento(d.id, 'sim');
    c.aprovar();
    c.relogio = null;
    if (nome === 'aprovado') return;

    c.vencimento = { doc: VALIDADE_DEMO.doc, venceEm: VALIDADE_DEMO.venceEm, vencido: false };
    if (nome === 'vencendo') return;

    // o documento venceu: quem avisa e restringe no sistema real é a rotina de validade
    c.relogio = VALIDADE_DEMO.vencidoEm;
    c.iniciarRegularizacao();
    if (nome === 'regularizacao') {
      c.relogio = VALIDADE_DEMO.reenvioNoPrazoEm;
      return;
    }
    if (nome === 'atualizado-no-prazo') {
      c.relogio = VALIDADE_DEMO.reenvioNoPrazoEm;
      c.anexarDocumentoNovo();
      c.informarValidade(VALIDADE_DEMO.novaValidade);
      c.enviarParaConferencia();
      return;
    }

    // 11º dia sem a troca: bloqueio total
    c.relogio = VALIDADE_DEMO.bloqueadoEm;
    c.bloquearPorVencimento();
    c.relogio = VALIDADE_DEMO.reenvioEm;
    if (nome === 'vencido') return;

    c.anexarDocumentoNovo();
    c.informarValidade(VALIDADE_DEMO.novaValidade);
    c.enviarParaConferencia();
    return;
  }

  c.iniciarAnalise();
  // a análise confere só documentos: o telefone errado se aponta no bloco Dados gerais
  c.apontarProblema(1);
  c.problemas['etapa-1']!.texto = 'O telefone informado não atende. Informe um número ativo, com DDD.';
  c.salvarProblema(1);
  for (const d of DOCUMENTOS_EXIGIDOS) c.marcarDocumento(d.id, d.id === 'alvara' ? 'nao' : 'sim');
  c.conferencia.alvara!.motivo = 'vencido';
  c.conferencia.alvara!.texto = 'O documento apresentado está vencido desde março de 2026. Anexe o alvará válido e atualizado.';
  c.conferencia.alvara!.salvo = true;
  c.devolver(c.mensagemPadrao);
  if (nome === 'devolvido') return;

  c.formulario.telefone = '(62) 3555-0198';
  c.corrigidos.alvara = true;
  c.reenviar();
}

// ── os cadastros de exemplo da fila do Admin (16/11/2026) ─────────────────────────────────────────

/**
 * Monta um cadastro de exemplo da fila (CADASTROS_DE_EXEMPLO) no estado dele, com as mesmas ações dos cenários. A
 * store chama isto na primeira vez que o cadastro abre na sessão (registrarSemeadorDeExemplos, em prototipo/index.ts).
 */
export function semearExemplo(c: StoreDoCadastro, protocolo: string): void {
  const ex = cadastroDeExemplo(protocolo);
  if (!ex) return;
  c.formulario.telefone = ex.telefone;
  c.formulario.anoCriacao = ex.anoCriacao;
  if (ex.tipoOrganizacao === 'cooperativa') c.formulario.cooperados = ex.cooperados;
  // os eventos do exemplo acontecem no dia do envio dele, não no dia em que a página abriu
  if (ex.situacao !== 'atualizado') c.relogio = `${ex.enviado}, às 15h40`;
  montar(c, ex.situacao === 'em-analise' ? 'enviado' : ex.situacao);
  if (ex.situacao === 'em-analise') c.iniciarAnalise(ex.analista ?? undefined);
  if (ex.situacao !== 'atualizado') c.relogio = null;
  if (ex.situacao === 'atualizado') return; // as datas da história da validade já vêm do cenário
  c.dataEnvio = `${ex.enviado}, às 10h12`;
  if (ex.analista && c.analista) c.analista = ex.analista;
}

// ── simulação: a análise começa enquanto o operador edita ──────────────────────────────────────────

/** Ligada, a próxima gravação da edição encontra a análise já começada (o que o servidor diria no sistema real). */
export const simulandoAnalise = ref(false);

let ganchoEm: unknown = null;

/** Pendura a simulação na ação de salvar da store atual (a store muda quando um cenário é aplicado). */
export function ligarGanchoDaSimulacao(pinia: Pinia): void {
  const c = useComplementoStore(pinia);
  if (ganchoEm === c) return;
  ganchoEm = c;
  c.$onAction(({ name, store }) => {
    if (name !== 'salvarEdicao' || !simulandoAnalise.value) return;
    simulandoAnalise.value = false;
    store.iniciarAnalise();
  }, true);
}

/** Volta ao estado inicial da demonstração, por carga completa (a tela relê tudo do zero). */
export function reiniciarDemonstracao(rota: string): void {
  try {
    window.sessionStorage.removeItem(CHAVE_COMPLEMENTO);
  } catch {
    /* ok */
  }
  window.location.assign(rota);
}
