<script setup lang="ts">
/**
 * Saldo do operador logístico, só no que as regras de validade de 19/11/2026 mexem.
 *
 * Regras de 19/11 (Figma: página `Novembro 2026 · Validade e bloqueio · Regras de 19/11`, seção `6558:1924`): nos
 * 10 dias de regularização a transferência de créditos continua liberada. A tela mostra o botão ativo e um aviso
 * curto, para o contraste com Notas Fiscais. Com o cadastro bloqueado, a tela não abre: volta para a Minha Conta.
 *
 * Nasceu em código, sem frame. A transferência em si usa a tela que já existe no sistema.
 */
import { computed, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import GestoraShell from '@/components/gestora/GestoraShell.vue';
import OxAviso from '@/components/operador/OxAviso.vue';
import RgButton from '@/components/RgButton.vue';
import { menuDoOperadorAprovado } from '@/data/mocks/sessao';
import { useComplementoStore } from '@/stores/complemento';

const router = useRouter();
const complemento = useComplementoStore();

watchEffect(() => {
  if (complemento.acesso === null || complemento.acesso === 'bloqueado') void router.replace('/operador');
});

const parcial = computed(() => complemento.acesso === 'parcial');
const pedida = ref(false);

// Exemplo inventado, no formato real.
const SALDOS = [
  { material: 'Papel e papelão', massa: '18,4 t' },
  { material: 'Plástico', massa: '9,7 t' },
  { material: 'Vidro', massa: '6,2 t' },
  { material: 'Metal', massa: '3,1 t' },
];
</script>

<template>
  <GestoraShell secao-ativa="Saldo" :itens-do-menu="menuDoOperadorAprovado(false)" :explorador="false">
    <header class="sd__cabecalho">
      <div>
        <h1 class="sd__titulo">Saldo</h1>
        <p class="sd__subtitulo">Créditos de massa disponíveis para transferência, por material.</p>
      </div>
      <RgButton variant="primary" @click="pedida = true">Transferir créditos</RgButton>
    </header>

    <OxAviso
      v-if="parcial"
      tom="info"
      titulo="Transferência de créditos liberada"
      :texto="`Mesmo com o documento vencido, a transferência de créditos continua operando até ${complemento.prazos?.prazoAte ?? ''}. A inclusão de notas fiscais segue suspensa até a atualização do documento.`"
    />
    <p v-if="pedida" class="sd__nota" role="status">
      A transferência usa a tela que já existe no sistema e não faz parte deste protótipo.
    </p>

    <ul class="sd__cards">
      <li v-for="s in SALDOS" :key="s.material" class="sd__card">
        <span class="sd__material">{{ s.material }}</span>
        <span class="sd__massa">{{ s.massa }}</span>
      </li>
    </ul>
  </GestoraShell>
</template>

<style scoped>
.sd__cabecalho {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--rg-space-6);
}

.sd__titulo {
  margin: 0;
  font-size: 28px;
  line-height: 34px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

.sd__subtitulo,
.sd__nota {
  margin: var(--rg-space-1) 0 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.sd__cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--rg-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.sd__card {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  padding: var(--rg-space-6);
  background: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
}

.sd__material {
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-secondary);
}

.sd__massa {
  font-size: 24px;
  line-height: 30px;
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
}

@media (max-width: 720px) {
  .sd__cabecalho {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
