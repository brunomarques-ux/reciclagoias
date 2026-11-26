<script setup lang="ts">
/**
 * Notas Fiscais do operador logístico, só no que as regras de validade de 19/11/2026 mexem.
 *
 * Regras de 19/11 (Claudia, grupo HOMOLOGAÇÃO RECICLAGO; Figma: página `Novembro 2026 · Validade e bloqueio ·
 * Regras de 19/11`, seção `6558:1924`, item "ainda não desenhado"): nos 10 dias depois do vencimento o cadastro fica
 * parcialmente ativo e não inclui nota fiscal nova. A tela diz por quê, até quando e como resolver, e o botão fica
 * desativado com a explicação ligada a ele. Com o cadastro bloqueado, a tela não abre: volta para a Minha Conta.
 *
 * Nasceu em código, sem frame: a lista é o mínimo para dar contexto. A inclusão em si usa a tela que já existe no
 * sistema e não faz parte deste protótipo.
 */
import { computed, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import GestoraShell from '@/components/gestora/GestoraShell.vue';
import OxAviso from '@/components/operador/OxAviso.vue';
import RgButton from '@/components/RgButton.vue';
import { DOCUMENTOS_EXIGIDOS } from '@/data/mocks/operador';
import { menuDoOperadorAprovado } from '@/data/mocks/sessao';
import { useComplementoStore } from '@/stores/complemento';

const router = useRouter();
const complemento = useComplementoStore();

// Antes da aprovação e no bloqueio total, o operador não chega aqui.
watchEffect(() => {
  if (complemento.acesso === null || complemento.acesso === 'bloqueado') void router.replace('/operador');
});

const suspensa = computed(() => complemento.acesso === 'parcial');
const nomeDoDoc = computed(() => {
  const r = DOCUMENTOS_EXIGIDOS.find((d) => d.id === complemento.vencimento?.doc)?.rotulo ?? 'Documento';
  return r.charAt(0).toLowerCase() + r.slice(1);
});
const textoDaSuspensao = computed(() => {
  const p = complemento.prazos;
  if (complemento.emConferencia)
    return `O documento novo está em conferência. A inclusão volta assim que a equipe aprovar o ${nomeDoDoc.value}. A transferência de créditos continua liberada.`;
  return `O ${nomeDoDoc.value} venceu em ${p?.venceEm ?? ''}. A inclusão volta depois que o documento novo for conferido. A transferência de créditos continua liberada. Troque o documento até ${p?.prazoAte ?? ''} para evitar o bloqueio do cadastro.`;
});

const pedida = ref(false);

function trocarDocumento() {
  complemento.irPara(2);
  void router.push('/operador');
}

// Exemplo inventado, no formato real.
const NOTAS = [
  { numero: '000.481', emissao: '09/12/2026', comprador: 'Plastgoiás Indústria de Embalagens', material: 'Plástico', massa: '3,2 t' },
  { numero: '000.476', emissao: '02/12/2026', comprador: 'Papelão Cerrado Ltda', material: 'Papel e papelão', massa: '5,8 t' },
  { numero: '000.469', emissao: '25/11/2026', comprador: 'Vidraria Central Goiana', material: 'Vidro', massa: '2,1 t' },
  { numero: '000.455', emissao: '18/11/2026', comprador: 'Metais Anápolis Reciclagem', material: 'Metal', massa: '1,4 t' },
];
</script>

<template>
  <GestoraShell secao-ativa="Notas Fiscais" :itens-do-menu="menuDoOperadorAprovado(false)" :explorador="false">
    <header class="nf__cabecalho">
      <div>
        <h1 class="nf__titulo">Notas Fiscais</h1>
        <p class="nf__subtitulo">Notas fiscais de venda de material reciclável incluídas pela cooperativa.</p>
      </div>
      <RgButton variant="primary" :disabled="suspensa" aria-describedby="nf-suspensa" @click="pedida = true">
        Incluir nota fiscal
      </RgButton>
    </header>

    <div v-if="suspensa" id="nf-suspensa" class="nf__suspensa">
      <OxAviso tom="danger" titulo="Inclusão de notas fiscais suspensa" :texto="textoDaSuspensao" />
      <RgButton v-if="!complemento.emConferencia" variant="secondary" @click="trocarDocumento">Trocar o documento</RgButton>
    </div>
    <p v-else-if="pedida" class="nf__nota" role="status">
      A inclusão de nota fiscal usa a tela que já existe no sistema e não faz parte deste protótipo.
    </p>

    <section class="nf__lista" aria-labelledby="nf-lista-titulo">
      <h2 id="nf-lista-titulo" class="nf__lista-titulo">Notas incluídas</h2>
      <table class="nf__tabela">
        <thead>
          <tr>
            <th scope="col">Número</th>
            <th scope="col">Emissão</th>
            <th scope="col">Comprador</th>
            <th scope="col">Material</th>
            <th scope="col" class="nf__num">Massa</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in NOTAS" :key="n.numero">
            <td>{{ n.numero }}</td>
            <td>{{ n.emissao }}</td>
            <td>{{ n.comprador }}</td>
            <td>{{ n.material }}</td>
            <td class="nf__num">{{ n.massa }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </GestoraShell>
</template>

<style scoped>
.nf__cabecalho {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--rg-space-6);
}

.nf__titulo {
  margin: 0;
  font-size: 28px;
  line-height: 34px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

.nf__subtitulo {
  margin: var(--rg-space-1) 0 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.nf__suspensa {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--rg-space-3);
}

.nf__suspensa > :first-child {
  align-self: stretch;
}

.nf__nota {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.nf__lista {
  padding: var(--rg-space-6);
  background: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
}

.nf__lista-titulo {
  margin: 0 0 var(--rg-space-4);
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.nf__tabela {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-primary);
}

.nf__tabela th {
  padding: var(--rg-space-2) var(--rg-space-3);
  border-bottom: 1px solid var(--rg-color-border-subtle);
  text-align: left;
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-secondary);
}

.nf__tabela td {
  padding: var(--rg-space-3);
  border-bottom: 1px solid var(--rg-color-border-subtle);
}

.nf__tabela .nf__num {
  text-align: right;
}

@media (max-width: 720px) {
  .nf__cabecalho {
    flex-direction: column;
    align-items: stretch;
  }

  .nf__lista {
    overflow-x: auto;
  }
}
</style>
