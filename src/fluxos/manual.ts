// O modo manual dos fluxos guiados: o alvo da ação atual fica destacado (com a pílula) e a ação conta como feita
// quando a pessoa faz o gesto de verdade no alvo: clique, digitação, escolha, passar o mouse, a tecla. Para "olhar",
// o botão Entendi do painel. Só eventos de verdade (isTrusted) contam: o motor, quando faz um passo rápido, não
// avança o manual.
import type { Acao } from './tipos';
import { normalizar, resolverAlvo } from './alvo';
import { destacar } from './camada';
import { CADENCIA, nomeDoAlvoParaAviso, rotuloDaAcao } from './motor';

const so = (s: string) => normalizar(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/** Sem o alvo na tela por este tempo, o painel avisa (com o Repetir passo). */
const SUMIDO_HA = 3000;

/**
 * Acompanha uma ação no modo manual. Chama `feito` uma vez, quando a pessoa faz o gesto. Devolve a função que para o
 * acompanhamento (e tira o destaque). `entendi` recebe a função que o botão Entendi chama (só no "olhar").
 * `ultima`: a ação é a última do passo. Um "olhar" no meio do passo segue sozinho depois do tempo dele (03/11: com o
 * Entendi em todos, o manual pedia 187 cliques); o último espera o Entendi, o "beleza, passa para a próxima etapa".
 * `aoSumir`: o alvo não está na tela há 3 s (com o nome curto dele, vazio se não tiver) ou voltou (null).
 */
export function acompanharAcao(
  acao: Acao,
  feito: () => void,
  entendi: (f: (() => void) | null) => void,
  opcoes: { ultima?: boolean; aoSumir?: (nome: string | null) => void } = {},
): () => void {
  let ativo = true;
  let el: Element | null = null;
  const limpezas: (() => void)[] = [];
  const concluir = (atraso = 250) => {
    if (!ativo) return;
    ativo = false;
    window.setTimeout(() => {
      destacar(null);
      feito();
    }, atraso);
  };
  const ouvir = <K extends keyof DocumentEventMap>(tipo: K, f: (e: DocumentEventMap[K]) => void) => {
    const h = (e: DocumentEventMap[K]) => {
      if (ativo && e.isTrusted) f(e);
    };
    document.addEventListener(tipo, h, true);
    limpezas.push(() => document.removeEventListener(tipo, h, true));
  };
  const noAlvo = (e: Event) => !!el && e.target instanceof Node && el.contains(e.target);
  const rotulo = rotuloDaAcao(acao);

  if (acao.tipo === 'esperar') {
    const t = window.setTimeout(() => concluir(0), acao.ms);
    limpezas.push(() => window.clearTimeout(t));
  } else if (acao.tipo === 'tecla') {
    destacar(null);
    ouvir('keydown', e => {
      if (e.key.toLowerCase() === acao.tecla.split('+').pop()?.toLowerCase()) concluir(300);
    });
  } else {
    // o alvo (e, no escolher, a opção quando a lista abre) é procurado de novo a cada pouco: a tela muda
    let opcao: Element | null = null;
    let semAlvoDesde = performance.now();
    let avisado = false;
    const atualizar = () => {
      if (!ativo) return;
      el = resolverAlvo(acao.alvo);
      // sem o alvo (nem a opção da lista aberta) há 3 s: o aviso; com ele de volta, o aviso sai
      if (el || (acao.tipo === 'escolher' && opcao)) {
        semAlvoDesde = performance.now();
        if (avisado) {
          avisado = false;
          opcoes.aoSumir?.(null);
        }
      } else if (!avisado && performance.now() - semAlvoDesde > SUMIDO_HA) {
        avisado = true;
        opcoes.aoSumir?.(nomeDoAlvoParaAviso(acao.alvo));
      }
      if (acao.tipo === 'escolher') {
        opcao = resolverAlvo({ papel: 'option', nome: acao.opcao });
        if (opcao) destacar(opcao, `Escolha ${acao.opcao}`);
        else destacar(el, rotulo);
        // a escolha já aparece no campo
        if (el && !opcao && so(el.textContent ?? '').includes(so(acao.opcao)) && el.getAttribute('aria-expanded') !== 'true') concluir(300);
        if (el instanceof HTMLSelectElement && so(el.selectedOptions[0]?.text ?? '').includes(so(acao.opcao))) concluir(300);
        return;
      }
      destacar(el, rotulo, { abaixo: acao.tipo === 'passar' });
      if (acao.tipo === 'rolar' && el) {
        const r = el.getBoundingClientRect();
        if (r.top >= 0 && r.bottom <= innerHeight) concluir(600);
      }
    };
    atualizar();
    const t = window.setInterval(atualizar, 200);
    limpezas.push(() => window.clearInterval(t));

    switch (acao.tipo) {
      case 'clicar':
      case 'marcar':
        ouvir('click', e => {
          if (noAlvo(e)) concluir();
        });
        break;
      case 'digitar':
        ouvir('input', e => {
          if (!noAlvo(e)) return;
          const v = (e.target as HTMLInputElement).value ?? '';
          if (so(v).includes(so(acao.texto))) concluir(500);
        });
        ouvir('change', e => {
          if (noAlvo(e) && (e.target as HTMLInputElement).value) concluir(300);
        });
        break;
      case 'escolher':
        ouvir('click', e => {
          if (opcao && e.target instanceof Node && opcao.contains(e.target)) concluir(300);
        });
        ouvir('change', e => {
          if (noAlvo(e)) concluir(300);
        });
        break;
      case 'passar':
        ouvir('pointerover', e => {
          if (noAlvo(e)) concluir(Math.min(acao.ms ?? 1600, 900));
        });
        break;
      case 'olhar':
        if (opcoes.ultima === false) {
          const t = window.setTimeout(() => concluir(0), acao.ms ?? CADENCIA.olhar);
          limpezas.push(() => window.clearTimeout(t));
        } else {
          entendi(() => concluir(0));
          limpezas.push(() => entendi(null));
        }
        break;
    }
  }

  return () => {
    ativo = false;
    limpezas.splice(0).forEach(f => f());
    destacar(null);
  };
}
