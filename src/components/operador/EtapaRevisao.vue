<script setup lang="ts">
/**
 * Etapa 5 · Revisão e envio — tudo conferível e editável antes de enviar.
 *
 * Os resumos são calculados do estado real do formulário (não são texto fixo):
 * a linha de documentos conta anexados, aguardando arquivo e marcados como
 * "Não", e a pendência aparece dita, não escondida — dá para enviar assim
 * mesmo, e o aviso explica o que acontece depois. Em `somenteLeitura` (aberta
 * pelo lobby) some o Editar e a declaração.
 */
import { computed } from 'vue';

import OxOpcao from '@/components/operador/OxOpcao.vue';
import { MODOS_TRIAGEM, PRE_CADASTRO, ROTULO_TIPO, SITUACOES_AREA } from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

withDefaults(defineProps<{ somenteLeitura?: boolean }>(), { somenteLeitura: false });
const emit = defineEmits<{ (e: 'editar', etapa: number): void }>();

const complemento = useComplementoStore();
const f = complemento.formulario;

const resumoDocumentos = computed(() => {
  const partes = [`${complemento.documentosAnexados} de ${complemento.totalDocumentos} anexados`];
  for (const doc of complemento.documentosAguardandoArquivo) {
    partes.push(`"${doc.rotulo}" aguardando arquivo`);
  }
  for (const doc of complemento.documentosSemPossuir) {
    partes.push(`"${doc.rotulo}" marcada como "Não"`);
  }
  return partes.join(' · ');
});

const resumoOperacao = computed(() => {
  const partes: string[] = [];
  if (f.coleta === 'sim') partes.push('coleta');
  const beneficiamentos = f.beneficiamentos.length;
  if (beneficiamentos > 0)
    partes.push(`${beneficiamentos} ${beneficiamentos === 1 ? 'beneficiamento' : 'beneficiamentos'}`);
  const equipamentos = f.equipamentos.length;
  if (equipamentos > 0)
    partes.push(`${equipamentos} ${equipamentos === 1 ? 'equipamento' : 'equipamentos'}`);
  if (f.outrosMunicipios === 'sim') partes.push('resíduos vindos de outros municípios');
  const texto = partes.join(', ');
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) + '.' : 'Sem serviços marcados.';
});

const resumoEstrutura = computed(() => {
  const situacao = SITUACOES_AREA.find((s) => s.id === f.situacaoArea)?.rotulo ?? 'Área sem situação';
  const triagem = MODOS_TRIAGEM.find((m) => m.id === f.triagem)?.rotulo.toLowerCase() ?? '';
  const vidro = f.beneficiaVidro === 'sim' ? 'beneficia vidro' : 'não beneficia vidro';
  return `${situacao}, triagem ${triagem}, ${vidro}.`;
});

/** SEMAD-15: quantos campos foram preenchidos e quais ficaram em branco, sem bloquear. */
function contagem(n: number, extra: string) {
  const c = complemento.campos(n);
  const ok = c.filter((x) => x.ok).length;
  const brancos = c.filter((x) => !x.ok).map((x) => `"${x.rotulo}"`);
  const base = `${ok} de ${c.length} campos preenchidos`;
  return {
    resumo: brancos.length ? `${base} · ${brancos.join(', ')} em branco.` : `${base}${extra ? ' · ' + extra : '.'}`,
    brancos: brancos.length,
  };
}

const minusculo = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

const linhas = computed(() => {
  const l1 = contagem(1, '');
  const l3 = contagem(3, minusculo(resumoOperacao.value));
  const l4 = contagem(4, minusculo(resumoEstrutura.value));
  const corrigidos = complemento.idsDevolvidos.filter((id) => complemento.docCorrigido(id)).length;
  const doc = complemento.emCorrecao
    ? {
        resumo: `${complemento.documentosAnexados} de ${complemento.totalDocumentos} anexados · ${corrigidos} de ${complemento.idsDevolvidos.length} devolvidos atualizados na correção.`,
        chip: complemento.faltaCorrigir.length ? `${complemento.faltaCorrigir.length} para corrigir` : `${corrigidos} corrigidos`,
        tom: complemento.faltaCorrigir.length ? 'danger' : 'info',
      }
    : {
        resumo: resumoDocumentos.value,
        chip: complemento.totalPendencias ? `${complemento.totalPendencias} ${complemento.totalPendencias === 1 ? 'pendência' : 'pendências'}` : 'Completo',
        tom: complemento.totalPendencias ? 'warning' : 'ok',
      };
  const linhaCampos = (etapa: number, titulo: string, c: { resumo: string; brancos: number }) => ({
    etapa,
    titulo,
    resumo: c.resumo,
    chip: c.brancos ? `${c.brancos} em branco` : 'Completo',
    tom: c.brancos ? 'warning' : 'ok',
  });
  return [
    linhaCampos(1, 'Dados gerais', l1),
    { etapa: 2, titulo: 'Documentos', ...doc },
    linhaCampos(3, 'Operação', l3),
    linhaCampos(4, 'Estrutura e capacidade', l4),
  ];
});

const brancosTotal = computed(() => [1, 3, 4].reduce((s, n) => s + complemento.campos(n).filter((x) => !x.ok).length, 0));

const aviso = computed(() => {
  const partes: string[] = [];
  if (!complemento.emCorrecao && complemento.totalPendencias)
    partes.push(`${complemento.totalPendencias} ${complemento.totalPendencias === 1 ? 'documento com pendência' : 'documentos com pendência'}`);
  if (brancosTotal.value) partes.push(`${brancosTotal.value} ${brancosTotal.value === 1 ? 'campo em branco' : 'campos em branco'}`);
  return partes.length ? `Há ${partes.join(' e ')}.` : '';
});
</script>

<template>
  <div class="ox-etapa">
    <section class="ox-resumo" aria-label="Resumo da cooperativa">
      <div v-for="dado in [
          { rotulo: ROTULO_TIPO[PRE_CADASTRO.tipoOrganizacao], valor: PRE_CADASTRO.razaoSocial },
          { rotulo: 'CNPJ', valor: PRE_CADASTRO.cnpj },
          { rotulo: 'Município', valor: `${f.municipio} · ${f.estado}` },
          ...(PRE_CADASTRO.tipoOrganizacao === 'cooperativa'
            ? [{ rotulo: 'Cooperados', valor: f.cooperados }]
            : []),
          { rotulo: 'Criada em', valor: f.anoCriacao },
        ]" :key="dado.rotulo" class="ox-resumo__dado">
        <span class="ox-resumo__rotulo">{{ dado.rotulo }}</span>
        <span class="ox-resumo__valor">{{ dado.valor }}</span>
      </div>
    </section>

    <ul class="ox-linhas">
      <li v-for="linha in linhas" :key="linha.etapa">
        <article class="ox-linha">
          <span
            class="ox-linha__marcador"
            :class="{ 'ox-linha__marcador--pendencia': linha.tom === 'warning', 'ox-linha__marcador--erro': linha.tom === 'danger' }"
            aria-hidden="true"
          >
            <v-icon :icon="linha.tom === 'warning' || linha.tom === 'danger' ? 'mdi-exclamation' : 'mdi-check'" size="15" />
          </span>

          <div class="ox-linha__texto">
            <h3 class="ox-linha__titulo">{{ linha.titulo }}</h3>
            <p class="ox-linha__resumo">{{ linha.resumo }}</p>
          </div>

          <button
            v-if="!somenteLeitura && (!complemento.emCorrecao || linha.etapa === 2)"
            type="button"
            class="ox-linha__editar"
            @click="emit('editar', linha.etapa)"
          >
            Editar
          </button>

          <span class="ox-linha__chip" :class="`ox-linha__chip--${linha.tom}`">
            {{ linha.chip }}
          </span>
        </article>
      </li>
    </ul>

    <div v-if="aviso" class="ox-aviso" role="status">
      <v-icon icon="mdi-information" size="18" aria-hidden="true" />
      <div>
        <p class="ox-aviso__titulo">{{ aviso }}</p>
        <p class="ox-aviso__texto">
          {{
            complemento.emCorrecao
              ? 'Dá para reenviar assim mesmo: a nova análise confere os documentos corrigidos.'
              : 'Dá para enviar assim mesmo: a pendência fica registrada e a análise pode pedir o arquivo depois, sem recomeçar o cadastro.'
          }}
        </p>
      </div>
    </div>

    <OxOpcao
      v-if="!somenteLeitura"
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

.ox-resumo {
  display: flex;
  flex-wrap: wrap;
  gap: var(--rg-space-6) var(--rg-space-10);
  padding: var(--rg-space-6);
  background: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
}

.ox-resumo__dado {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
}

.ox-resumo__rotulo {
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
}

.ox-resumo__valor {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.ox-linhas {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ox-linha {
  display: flex;
  align-items: center;
  gap: var(--rg-space-4);
  padding: var(--rg-space-5) var(--rg-space-6);
  background: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
}

.ox-linha__marcador {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: var(--rg-radius-pill);
  background: var(--rg-color-action-primary);
  color: var(--rg-color-text-on-brand);
}

.ox-linha__marcador--pendencia {
  background: var(--rg-color-feedback-warning-soft);
  color: var(--rg-primitive-amber-700);
}

.ox-linha__texto {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ox-linha__titulo {
  margin: 0;
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.ox-linha__resumo {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-secondary);
  line-height: var(--rg-line-height-base);
}

.ox-linha__editar {
  border: none;
  background: none;
  padding: var(--rg-space-1) var(--rg-space-2);
  font-family: inherit;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-brand);
  cursor: pointer;
  border-radius: var(--rg-radius-sm);
}

.ox-linha__editar:hover {
  background: var(--rg-color-surface-brand);
}

.ox-linha__editar:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.ox-linha__chip {
  flex-shrink: 0;
  padding: var(--rg-space-1) var(--rg-space-3);
  border-radius: var(--rg-radius-pill);
  background: var(--rg-color-surface-brand);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-brand);
}

.ox-linha__chip--warning {
  background: var(--rg-color-feedback-warning-soft);
  color: var(--rg-primitive-amber-700);
}

.ox-linha__chip--danger {
  background: var(--rg-color-feedback-danger-soft);
  color: var(--rg-primitive-red-700);
}

.ox-linha__chip--info {
  background: var(--rg-color-feedback-info-soft);
  color: var(--rg-color-feedback-info);
}

.ox-linha__marcador--erro {
  background: var(--rg-color-feedback-danger-soft);
  color: var(--rg-primitive-red-700);
}

.ox-aviso {
  display: flex;
  gap: var(--rg-space-3);
  padding: var(--rg-space-4);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-feedback-info-soft);
  color: var(--rg-color-feedback-info);
}

.ox-aviso__titulo {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-feedback-info);
}

.ox-aviso__texto {
  margin: var(--rg-space-1) 0 0;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-secondary);
  line-height: var(--rg-line-height-base);
}

@media (max-width: 720px) {
  .ox-linha {
    flex-wrap: wrap;
  }
}
</style>
