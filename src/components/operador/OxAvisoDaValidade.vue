<script setup lang="ts">
/**
 * O aviso da validade do documento, o mesmo nas três telas do operador (Minha Conta, Notas Fiscais e Saldo).
 *
 * 26/11/2026, depois da reunião com a SEMAD (pedido do Bruno):
 * - Forma: o aviso deixa de ser um parágrafo corrido. Abre com o fato, lista o que fica suspenso (✕) e o que continua
 *   liberado (✓), fecha com o prazo ou o próximo passo e tem o botão da ação. As palavras são as que a Thainá revisou.
 * - Persistência: o aviso segue o operador. Do lembrete de 30 dias até a aprovação do documento atualizado ele aparece
 *   no topo de todas as telas do operador, não só na Minha Conta; cada tela destaca o que vale para ela (em Notas
 *   Fiscais, a inclusão suspensa; em Saldo, a transferência liberada). No bloqueio total só a Minha Conta abre.
 * - Ação: "Atualizar documento" leva à etapa Documentos da Minha Conta. Não aparece quando ela já está aberta, nem
 *   depois do envio.
 */
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import OxAviso, { type ItemDoAviso } from '@/components/operador/OxAviso.vue';
import { DOCUMENTOS_EXIGIDOS } from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

const props = defineProps<{ onde: 'conta' | 'notas' | 'saldo' }>();

const router = useRouter();
const c = useComplementoStore();

interface Aviso {
  tom: 'warning' | 'danger' | 'info';
  titulo: string;
  texto?: string;
  itens?: ItemDoAviso[];
  fecho?: string;
  acao?: boolean;
}

const nome = computed(() => DOCUMENTOS_EXIGIDOS.find((d) => d.id === c.vencimento?.doc)?.rotulo ?? 'Documento');
const minusculo = computed(() => nome.value.charAt(0).toLowerCase() + nome.value.slice(1));

const aviso = computed<Aviso | null>(() => {
  const v = c.vencimento?.venceEm ?? '';
  const p = c.prazos;
  const naConta = props.onde === 'conta';

  if (c.bloqueado)
    return {
      tom: 'danger',
      titulo: 'Cadastro bloqueado por documentação vencida',
      texto: `O ${minusculo.value} venceu em ${v} e o prazo de 10 dias para regularizar terminou em ${p?.prazoAte ?? ''}.`,
      itens: [
        { marca: 'nao', texto: 'Até a atualização do documento, nenhuma operação além da substituição do documento pode ser realizada no sistema.' },
      ],
      fecho: 'Anexe o documento atualizado, informe a validade e envie para análise.',
      acao: true,
    };

  if (c.emConferencia) {
    const origem = c.troca.origem;
    if (props.onde === 'notas')
      return {
        tom: 'danger',
        titulo: 'Inclusão de notas fiscais suspensa',
        texto: 'O documento atualizado está em análise.',
        itens: [{ marca: 'sim', texto: 'A transferência de créditos continua liberada.' }],
        fecho: `A inclusão volta assim que a equipe aprovar o ${minusculo.value}.`,
      };
    if (!naConta && origem !== 'regularizacao') return null;
    return {
      tom: 'info',
      titulo: 'Documento enviado para análise',
      texto: `Recebemos o ${minusculo.value} atualizado em ${c.troca.enviadoEm?.split(',')[0] ?? ''}.`,
      itens:
        origem === 'regularizacao'
          ? [
              { marca: 'nao', texto: 'A inclusão de notas fiscais continua suspensa até a análise do documento enviado.' },
              { marca: 'sim', texto: 'A transferência de créditos continua liberada.' },
            ]
          : origem === 'antecipada'
            ? [{ marca: 'sim', texto: 'Durante a análise, o cadastro segue aprovado e nada muda no uso do sistema.' }]
            : [{ marca: 'nao', texto: 'O cadastro continua bloqueado até que seja realizada a análise do documento enviado.' }],
      fecho: 'O resultado da análise chegará no e-mail cadastrado.',
    };
  }

  if (c.emRegularizacao) {
    if (props.onde === 'notas')
      return {
        tom: 'danger',
        titulo: 'Inclusão de notas fiscais suspensa',
        texto: `Seu ${minusculo.value} venceu em ${v}. Até que a atualização seja realizada:`,
        itens: [{ marca: 'sim', texto: 'É possível realizar apenas a transferência de créditos.' }],
        fecho: `Realize a atualização do documento até ${p?.prazoAte ?? ''} para evitar o bloqueio do cadastro.`,
        acao: true,
      };
    if (props.onde === 'saldo')
      return {
        tom: 'info',
        titulo: 'Transferência de créditos liberada',
        texto: `Mesmo com o documento vencido, a transferência de créditos continua operando até ${p?.prazoAte ?? ''}.`,
        itens: [{ marca: 'nao', texto: 'A inclusão de notas fiscais segue suspensa até a atualização do documento.' }],
        acao: true,
      };
    return {
      tom: 'danger',
      titulo: `Documento vencido: regularize até ${p?.prazoAte ?? ''}`,
      texto: `Seu ${minusculo.value} venceu em ${v}. Até que a atualização seja realizada:`,
      itens: [
        { marca: 'nao', texto: 'A inclusão de novas notas fiscais está suspensa.' },
        { marca: 'sim', texto: 'É possível realizar apenas a transferência de créditos.' },
      ],
      fecho: `Sem o documento atualizado, o cadastro será totalmente bloqueado a partir de ${p?.bloqueioEm ?? ''}.`,
      acao: true,
    };
  }

  if (c.avisoDeVencimento)
    return {
      tom: 'warning',
      titulo: 'Você possui um documento com data de vencimento próxima',
      texto: `${nome.value} vence em ${v}. Abra a etapa Documentos e anexe o documento atualizado.`,
      acao: true,
    };

  return null;
});

/** Na Minha Conta, com a etapa Documentos já aberta, o botão não leva a lugar nenhum. */
const mostrarAcao = computed(() => !!aviso.value?.acao && !(props.onde === 'conta' && c.etapa === 2));

function atualizar() {
  c.irPara(2);
  if (props.onde === 'conta') document.querySelector('.ox-docs, [aria-label="Etapas do complemento de cadastro"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  else void router.push('/operador');
}
</script>

<template>
  <OxAviso
    v-if="aviso"
    :tom="aviso.tom"
    :titulo="aviso.titulo"
    :texto="aviso.texto"
    :itens="aviso.itens"
    :fecho="aviso.fecho"
    :acao="mostrarAcao ? 'Atualizar documento' : undefined"
    @acao="atualizar"
  />
</template>
