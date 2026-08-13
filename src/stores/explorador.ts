import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import {
  ACOES,
  CATALOGO_LINHAS,
  CATALOGO_PRAZOS,
  PRESETS,
  PRESET_PADRAO,
  type CardPrazo,
  type LinhaDocumentacao,
  type PrazoPreset,
} from '@/data/mocks/gestora';

/**
 * Estado editável do dashboard — o que o explorador de cenários manipula e a tela
 * renderiza. É ferramenta de protótipo, não parte do produto.
 *
 * As regras de UX moram aqui, não nos componentes:
 *  - o total de uma linha é a soma dos status ligados;
 *  - status zerado não existe (desligar = zerar);
 *  - período restritivo ⇔ pelo menos uma ação liberada. Ligar o período liga a
 *    primeira ação; desmarcar a última desliga o período. Assim `n = 0` é
 *    inalcançável pela interface, como manda a D-R001.
 */

interface EstadoPrazo extends PrazoPreset {
  /** Uma posição por ação do catálogo. */
  liberadas: boolean[];
}

export const useExploradorStore = defineStore('explorador', () => {
  const presetAtivo = ref(PRESET_PADRAO);
  const anoExecucao = ref(2024);
  /** `linhaId` → `statusId` → quantidade (0 = desligado). */
  const quantidades = ref<Record<string, Record<string, number>>>({});
  const prazos = ref<Record<string, EstadoPrazo>>({});

  function aplicarPreset(id: string) {
    const preset = PRESETS.find((p) => p.id === id) ?? PRESETS[0]!;

    presetAtivo.value = preset.id;
    anoExecucao.value = preset.anoExecucao;

    quantidades.value = Object.fromEntries(
      CATALOGO_LINHAS.map((linha) => [
        linha.id,
        Object.fromEntries(
          linha.statuses.map((status) => [
            status.id,
            preset.quantidades[linha.id]?.[status.id] ?? 0,
          ]),
        ),
      ]),
    );

    prazos.value = Object.fromEntries(
      CATALOGO_PRAZOS.map((prazo) => {
        const base = preset.prazos[prazo.id]!;
        return [
          prazo.id,
          { ...base, liberadas: ACOES.map((_, indice) => indice < base.acoes) } satisfies EstadoPrazo,
        ];
      }),
    );
  }

  aplicarPreset(PRESET_PADRAO);

  /** Marca que o estado saiu de um preset conhecido. */
  function marcarComoAjustado() {
    presetAtivo.value = '';
  }

  function definirQuantidade(linhaId: string, statusId: string, valor: number) {
    const linha = quantidades.value[linhaId];
    if (!linha) return;
    linha[statusId] = Math.max(0, Math.min(9999, Math.round(valor)));
    marcarComoAjustado();
  }

  function alternarStatus(linhaId: string, statusId: string) {
    const linha = quantidades.value[linhaId];
    if (!linha) return;

    const catalogo = CATALOGO_LINHAS.find((l) => l.id === linhaId)?.statuses.find(
      (s) => s.id === statusId,
    );
    linha[statusId] = linha[statusId] ? 0 : (catalogo?.padrao ?? 1);
    marcarComoAjustado();
  }

  function alternarAcao(prazoId: string, indice: number) {
    const prazo = prazos.value[prazoId];
    if (!prazo) return;

    prazo.liberadas[indice] = !prazo.liberadas[indice];
    marcarComoAjustado();
  }

  /** O switch do card: ligar libera a primeira ação, desligar limpa todas. */
  function alternarRestritivo(prazoId: string) {
    const prazo = prazos.value[prazoId];
    if (!prazo) return;

    const ligado = prazo.liberadas.some(Boolean);
    prazo.liberadas = ACOES.map((_, indice) => (ligado ? false : indice === 0));
    marcarComoAjustado();
  }

  function definirPrazo(prazoId: string, campos: Partial<PrazoPreset>) {
    const prazo = prazos.value[prazoId];
    if (!prazo) return;
    Object.assign(prazo, campos);
    marcarComoAjustado();
  }

  /** Linhas prontas para o card, já sem status zerado e com o total somado. */
  const documentacao = computed<LinhaDocumentacao[]>(() =>
    CATALOGO_LINHAS.map((linha) => {
      const statuses = linha.statuses
        .map((status) => ({ ...status, quantidade: quantidades.value[linha.id]?.[status.id] ?? 0 }))
        .filter((status) => status.quantidade > 0);

      return {
        id: linha.id,
        icone: linha.icone,
        titulo: `${linha.titulo} ${anoExecucao.value}`,
        total: statuses.reduce((soma, status) => soma + status.quantidade, 0),
        statuses,
        fraseVazia: linha.fraseVazia,
        linkRotulo: linha.linkRotulo,
      };
    }),
  );

  const cardsPrazo = computed<CardPrazo[]>(() =>
    CATALOGO_PRAZOS.map((catalogo) => {
      const estado = prazos.value[catalogo.id]!;
      const liberadas = ACOES.filter((_, indice) => estado.liberadas[indice]);

      return {
        id: catalogo.id,
        eyebrow: `${catalogo.eyebrow} ${anoExecucao.value}`,
        data: estado.data,
        diasRestantes: estado.diasRestantes,
        acaoRotulo: catalogo.acaoRotulo,
        restritivo: liberadas.length > 0 ? { ate: estado.ate, acoes: liberadas } : null,
      };
    }),
  );

  const anoBase = computed(() => anoExecucao.value - 1);

  return {
    presetAtivo,
    anoExecucao,
    anoBase,
    quantidades,
    prazos,
    documentacao,
    cardsPrazo,
    aplicarPreset,
    definirQuantidade,
    alternarStatus,
    alternarAcao,
    alternarRestritivo,
    definirPrazo,
  };
});
