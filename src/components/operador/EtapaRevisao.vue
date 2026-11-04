<script setup lang="ts">
/**
 * Etapa 5 · Revisão e envio — a visualização em acordeão com o Editar em cada
 * bloco, e a declaração antes do envio.
 *
 * Rodada de 16/10: a revisão é a mesma visualização do cadastro enviado (L2·2),
 * só leitura, um bloco por etapa e o primeiro aberto. O que falta aparece na
 * linha do bloco, pelo nome; quem trava o envio é a janela da página (L7).
 * Na correção, abre com o bloco que tinha pendência (L3·4).
 */
import ComplementoVisualizacao from '@/components/operador/ComplementoVisualizacao.vue';
import OxOpcao from '@/components/operador/OxOpcao.vue';
import { useComplementoStore } from '@/stores/complemento';

const emit = defineEmits<{ (e: 'editar', etapa: number): void }>();

const complemento = useComplementoStore();
const f = complemento.formulario;
const aberto = complemento.emCorrecao ? Math.min(...complemento.idsDevolvidos.map(complemento.etapaDoItem)) : 1;
</script>

<template>
  <div class="ox-etapa">
    <ComplementoVisualizacao editavel :aberto="aberto" @editar="emit('editar', $event)" />

    <OxOpcao
      rotulo="Declaro que as informações prestadas são verdadeiras e que os documentos anexados são autênticos."
      :marcado="f.declaracaoAceita"
      @alternar="f.declaracaoAceita = !f.declaracaoAceita"
    />
  </div>
</template>

<style scoped>
.ox-etapa {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-6);
}
</style>
