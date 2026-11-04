<script setup lang="ts">
/**
 * Visualização do cadastro em acordeão, um bloco por etapa.
 *
 * Decisão de 18/10: visualização e edição são instâncias separadas. A revisão
 * (L2·2), o cadastro enviado (L2·4) e o em análise (L8·2) usam esta mesma
 * peça: rótulo e valor em texto, organizados como na etapa, nunca campo
 * desativado. Abre com o primeiro bloco expandido; cada bloco tem o Editar que
 * leva à etapa, enquanto a edição for permitida.
 *
 * Figma: seção do operador, L2·2, L2·4, L3·4, L7·1 e L8·2.
 */
import { computed, ref } from 'vue';

import { DOCUMENTOS_EXIGIDOS } from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

const props = withDefaults(defineProps<{ editavel?: boolean; aberto?: number }>(), {
  editavel: false,
  aberto: 1,
});
const emit = defineEmits<{ (e: 'editar', etapa: number): void }>();

const c = useComplementoStore();
const abertos = ref<number[]>([props.aberto]);

function alternar(n: number) {
  abertos.value = abertos.value.includes(n) ? abertos.value.filter((x) => x !== n) : [...abertos.value, n];
}

interface Bloco {
  etapa: number;
  titulo: string;
  resumo: string;
  tom: 'ok' | 'warning' | 'danger' | 'info';
  grupos: { titulo: string; itens: { rotulo: string; valor: string }[] }[];
}

/** O que falta ou o que foi devolvido, pelo nome, na linha do bloco. */
function resumoCampos(n: number): Pick<Bloco, 'resumo' | 'tom'> {
  const lista = c.campos(n);
  const falta = lista.filter((x) => !x.ok);
  const devolvidos = c.devolvidosNaEtapa(n);
  if (devolvidos.length && c.situacao === 'devolvido') {
    const pendentes = devolvidos.filter((id) => !c.itemCorrigido(id));
    return pendentes.length
      ? { resumo: `${lista.length} campos · corrigir ${pendentes.map(c.rotuloDoItem).join(', ')}`, tom: 'danger' }
      : { resumo: `${lista.length} campos · ${devolvidos.map(c.rotuloDoItem).join(', ')} corrigido`, tom: 'info' };
  }
  if (falta.length) {
    return {
      resumo: `${lista.length - falta.length} de ${lista.length} campos · falta ${falta.map((x) => x.rotulo).join(', ')}`,
      tom: 'warning',
    };
  }
  return { resumo: `${lista.length} campos`, tom: 'ok' };
}

function resumoDocumentos(): Pick<Bloco, 'resumo' | 'tom'> {
  const devolvidos = c.devolvidosNaEtapa(2);
  if (devolvidos.length && c.situacao === 'devolvido') {
    const pendentes = devolvidos.filter((id) => !c.itemCorrigido(id));
    return pendentes.length
      ? { resumo: `corrigir ${pendentes.map(c.rotuloDoItem).join(', ')}`, tom: 'danger' }
      : { resumo: `${devolvidos.map(c.rotuloDoItem).join(', ')} corrigido`, tom: 'info' };
  }
  const sem = c.documentosSemArquivo;
  if (sem.length) {
    return {
      resumo: `${c.documentosAnexados} de ${c.totalDocumentos} documentos · falta ${sem.map((d) => d.rotulo).join(', ')}`,
      tom: 'warning',
    };
  }
  const obs = c.formulario.observacaoDocumentos.trim() ? ' e a observação' : '';
  return { resumo: `${c.totalDocumentos} documentos anexados${obs}`, tom: 'ok' };
}

function agrupar(n: number) {
  const grupos: Bloco['grupos'] = [];
  for (const campo of c.campos(n)) {
    let g = grupos.find((x) => x.titulo === campo.grupo);
    if (!g) grupos.push((g = { titulo: campo.grupo, itens: [] }));
    g.itens.push({ rotulo: campo.rotulo, valor: campo.valor || 'Não preenchido' });
  }
  return grupos;
}

const blocos = computed<Bloco[]>(() => [
  { etapa: 1, titulo: 'Dados gerais', ...resumoCampos(1), grupos: agrupar(1) },
  { etapa: 2, titulo: 'Documentos', ...resumoDocumentos(), grupos: [] },
  { etapa: 3, titulo: 'Operação', ...resumoCampos(3), grupos: agrupar(3) },
  { etapa: 4, titulo: 'Estrutura e capacidade', ...resumoCampos(4), grupos: agrupar(4) },
]);

const arquivoDe = (id: string) => c.arquivoNovo(id) ?? c.formulario.documentos[id]?.arquivo ?? 'Não anexado';
/** Na correção, só a etapa com devolução leva o Editar. */
const mostraEditar = (n: number) => props.editavel && (c.situacao !== 'devolvido' || c.devolvidosNaEtapa(n).length > 0);
</script>

<template>
  <ul class="ox-vis">
    <li v-for="b in blocos" :key="b.etapa" class="ox-vis__bloco">
      <div class="ox-vis__cabeca">
        <span class="ox-vis__marca" :class="`ox-vis__marca--${b.tom}`" aria-hidden="true">
          <v-icon :icon="b.tom === 'ok' || b.tom === 'info' ? 'mdi-check' : 'mdi-exclamation'" size="15" />
        </span>
        <button
          type="button"
          class="ox-vis__alternar"
          :aria-expanded="abertos.includes(b.etapa)"
          :aria-controls="`ox-vis-${b.etapa}`"
          @click="alternar(b.etapa)"
        >
          <span class="ox-vis__titulo">{{ b.titulo }}</span>
          <span class="ox-vis__resumo" :class="`ox-vis__resumo--${b.tom}`">{{ b.resumo }}</span>
        </button>
        <button v-if="mostraEditar(b.etapa)" type="button" class="ox-vis__editar" @click="emit('editar', b.etapa)">
          Editar<span class="ox-oculto"> {{ b.titulo }}</span>
        </button>
        <button
          type="button"
          class="ox-vis__seta"
          :aria-expanded="abertos.includes(b.etapa)"
          :aria-controls="`ox-vis-${b.etapa}`"
          :aria-label="`${abertos.includes(b.etapa) ? 'Recolher' : 'Expandir'} ${b.titulo}`"
          @click="alternar(b.etapa)"
        >
          <v-icon :icon="abertos.includes(b.etapa) ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="20" aria-hidden="true" />
        </button>
      </div>

      <div v-if="abertos.includes(b.etapa)" :id="`ox-vis-${b.etapa}`" class="ox-vis__corpo">
        <template v-if="b.etapa === 2">
          <dl class="ox-vis__docs">
            <div v-for="d in DOCUMENTOS_EXIGIDOS" :key="d.id" class="ox-vis__doc">
              <dt>{{ d.rotulo }}</dt>
              <dd>
                <v-icon icon="mdi-paperclip" size="14" aria-hidden="true" />
                {{ arquivoDe(d.id) }}
                <span v-if="c.situacao === 'devolvido' && c.corrigidos[d.id]" class="ox-vis__selo">Corrigido</span>
              </dd>
            </div>
          </dl>
          <div v-if="c.formulario.observacaoDocumentos.trim()" class="ox-vis__obs">
            <span class="ox-vis__rotulo">Observações sobre os documentos</span>
            <p>{{ c.formulario.observacaoDocumentos }}</p>
          </div>
        </template>

        <section v-for="g in b.grupos" v-else :key="g.titulo" class="ox-vis__grupo">
          <h3 class="ox-vis__grupo-titulo">{{ g.titulo }}</h3>
          <dl class="ox-vis__grade">
            <div v-for="i in g.itens" :key="i.rotulo" class="ox-vis__item">
              <dt class="ox-vis__rotulo">{{ i.rotulo }}</dt>
              <dd class="ox-vis__valor" :class="{ 'ox-vis__valor--vazio': i.valor === 'Não preenchido' }">{{ i.valor }}</dd>
            </div>
          </dl>
        </section>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.ox-vis {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ox-vis__bloco {
  background: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
}

.ox-vis__cabeca {
  display: flex;
  align-items: center;
  gap: var(--rg-space-4);
  padding: var(--rg-space-5) var(--rg-space-6);
}

.ox-vis__marca {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: var(--rg-radius-pill);
  background: var(--rg-color-action-primary);
  color: var(--rg-color-text-on-brand);
}

.ox-vis__marca--warning {
  background: var(--rg-color-feedback-warning-soft);
  color: var(--rg-primitive-amber-700);
}

.ox-vis__marca--danger {
  background: var(--rg-color-feedback-danger-soft);
  color: var(--rg-primitive-red-700);
}

.ox-vis__alternar {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.ox-vis__titulo {
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.ox-vis__resumo {
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-secondary);
}

.ox-vis__resumo--warning {
  color: var(--rg-primitive-amber-700);
}

.ox-vis__resumo--danger {
  color: var(--rg-primitive-red-700);
}

.ox-vis__editar {
  padding: var(--rg-space-1) var(--rg-space-2);
  border: none;
  border-radius: var(--rg-radius-sm);
  background: none;
  font-family: inherit;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-brand);
  cursor: pointer;
}

.ox-vis__editar:hover {
  background: var(--rg-color-surface-brand);
}

.ox-vis__seta {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--rg-radius-sm);
  background: none;
  color: var(--rg-color-text-secondary);
  cursor: pointer;
}

.ox-vis__seta:hover {
  background: var(--rg-color-surface-subtle);
}

.ox-vis__alternar:focus-visible,
.ox-vis__editar:focus-visible,
.ox-vis__seta:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
  border-radius: var(--rg-radius-sm);
}

.ox-vis__corpo {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
  margin: 0 var(--rg-space-6);
  padding: var(--rg-space-5) 0 var(--rg-space-6);
  border-top: 1px solid var(--rg-color-border-subtle);
}

.ox-vis__grupo-titulo {
  margin: 0 0 var(--rg-space-3);
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
}

.ox-vis__grade {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 var(--rg-space-6);
  margin: 0;
}

.ox-vis__item {
  padding: var(--rg-space-3) 0;
  border-bottom: 1px solid var(--rg-color-border-subtle);
}

.ox-vis__rotulo {
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
}

.ox-vis__valor {
  margin: var(--rg-space-1) 0 0;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-primary);
  overflow-wrap: anywhere;
}

.ox-vis__valor--vazio {
  color: var(--rg-primitive-amber-700);
  font-style: italic;
}

.ox-vis__docs {
  display: flex;
  flex-direction: column;
  margin: 0;
}

.ox-vis__doc {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: var(--rg-space-4);
  padding: var(--rg-space-3) 0;
  border-bottom: 1px solid var(--rg-color-border-subtle);
  font-size: var(--rg-font-size-sm);
}

.ox-vis__doc dt {
  color: var(--rg-color-text-secondary);
}

.ox-vis__doc dd {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin: 0;
  color: var(--rg-color-text-primary);
  overflow-wrap: anywhere;
}

.ox-vis__selo {
  padding: 1px var(--rg-space-2);
  border-radius: var(--rg-radius-pill);
  background: var(--rg-color-feedback-info-soft);
  color: var(--rg-color-feedback-info);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
}

.ox-vis__obs p {
  margin: var(--rg-space-1) 0 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-base);
  color: var(--rg-color-text-primary);
}

.ox-oculto {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 900px) {
  .ox-vis__grade {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .ox-vis__grade,
  .ox-vis__doc {
    grid-template-columns: 1fr;
  }

  .ox-vis__cabeca {
    flex-wrap: wrap;
  }
}
</style>
