<script setup lang="ts">
/**
 * Slide do fluxograma da proposta: o complemento de cadastro do Operador
 * Logístico. Mostra numa imagem só o que fica como está (pré-cadastro e login)
 * e o que nasce (e-mail de ativação, complemento em 5 etapas, análise e os
 * dois desfechos), com as três regras que sustentam a proposta embaixo.
 */
import SlideFrame from '@/components/presentation/SlideFrame.vue';

interface No {
  numero: string;
  titulo: string;
  desc: string;
  selo: 'existe' | 'novo';
  icon: string;
}

const NOS: No[] = [
  {
    numero: '1',
    titulo: 'Pré-cadastro',
    desc: 'CNPJ, razão social, nome fantasia, cooperativa ou empresa, e-mail e senha.',
    selo: 'existe',
    icon: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  },
  {
    numero: '2',
    titulo: 'E-mail de ativação',
    desc: 'Confirma o endereço e já avisa: separe os documentos da cooperativa.',
    selo: 'novo',
    icon: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  },
  {
    numero: '3',
    titulo: 'Login',
    desc: 'A conta nasce "em complementação": só Minha Conta e o complemento no menu.',
    selo: 'existe',
    icon: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>',
  },
  {
    numero: '4',
    titulo: 'Complemento em 5 etapas',
    desc: 'Dados, documentos, operação, estrutura e revisão. Um assunto por etapa.',
    selo: 'novo',
    icon: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  },
  {
    numero: '5',
    titulo: 'Em análise',
    desc: 'Lobby com a situação e uma cópia de leitura do que foi enviado.',
    selo: 'novo',
    icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  },
];

const REGRAS = [
  {
    titulo: 'O que existe fica como está',
    desc: 'O pré-cadastro serve três perfis e está em produção. A proposta não mexe nele: aproveita.',
  },
  {
    titulo: 'Pendência não bloqueia',
    desc: 'Documento marcado como "Não" vira pendência declarada na revisão. Bloquear faria a cooperativa abandonar o cadastro.',
  },
  {
    titulo: 'O resultado chega por e-mail',
    desc: 'Aprovado libera o acesso completo. Reprovado encerra o acesso, com o motivo escrito e o suporte como canal de recurso.',
  },
];
</script>

<template>
  <SlideFrame foot-right="PROPOSTA · OPERADOR LOGÍSTICO">
    <div class="fx">
      <header class="fx__cabecalho">
        <span class="fx__eyebrow">PROPOSTA · CADASTRO DO OPERADOR LOGÍSTICO</span>
        <h2 class="fx__titulo">Complemento de cadastro</h2>
        <p class="fx__lede">
          O formulário recebido vira a segunda parte do registro que já existe: o operador ativa a
          conta por e-mail, entra no sistema e completa o cadastro em 5 etapas.
        </p>
      </header>

      <div class="fx__fluxo">
        <template v-for="(no, i) in NOS" :key="no.numero">
          <svg v-if="i > 0" class="fx__seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
          </svg>

          <article class="fx__no">
            <span class="fx__selo" :class="`fx__selo--${no.selo}`">
              {{ no.selo === 'existe' ? 'JÁ EXISTE' : 'NOVO' }}
            </span>
            <span class="fx__icone" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="no.icon" />
            </span>
            <h3 class="fx__no-titulo">{{ no.titulo }}</h3>
            <p class="fx__no-desc">{{ no.desc }}</p>
          </article>
        </template>

        <div class="fx__desfechos">
          <div class="fx__desfecho fx__desfecho--aprovado">
            <span class="fx__desfecho-titulo">Aprovado</span>
            <span class="fx__desfecho-desc">Acesso completo ao sistema</span>
          </div>
          <div class="fx__desfecho fx__desfecho--reprovado">
            <span class="fx__desfecho-titulo">Reprovado</span>
            <span class="fx__desfecho-desc">Acesso encerrado · motivo no e-mail</span>
          </div>
        </div>
      </div>

      <div class="fx__regras">
        <article v-for="regra in REGRAS" :key="regra.titulo" class="fx__regra">
          <h3 class="fx__regra-titulo">{{ regra.titulo }}</h3>
          <p class="fx__regra-desc">{{ regra.desc }}</p>
        </article>
      </div>
    </div>
  </SlideFrame>
</template>

<style scoped>
.fx {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 56px;
  min-width: 0;
}

.fx__cabecalho {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 1100px;
}

.fx__eyebrow {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--rg-primitive-brand-700);
}

.fx__titulo {
  margin: 0;
  font-size: 54px;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--rg-primitive-neutral-900);
}

.fx__lede {
  margin: 0;
  font-size: 21px;
  line-height: 1.5;
  color: var(--rg-primitive-neutral-600);
}

.fx__fluxo {
  display: flex;
  align-items: stretch;
  gap: 14px;
}

.fx__seta {
  width: 26px;
  flex-shrink: 0;
  align-self: center;
  color: var(--rg-primitive-neutral-400);
}

.fx__no {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px 22px;
  background: #fff;
  border: 1px solid var(--rg-primitive-neutral-200);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.fx__selo {
  align-self: flex-start;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.fx__selo--existe {
  background: var(--rg-primitive-neutral-100);
  color: var(--rg-primitive-neutral-600);
}

.fx__selo--novo {
  background: var(--rg-primitive-brand-50);
  color: var(--rg-primitive-brand-700);
}

.fx__icone {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--rg-primitive-brand-50);
  color: var(--rg-primitive-brand-700);
}

.fx__icone svg {
  width: 24px;
  height: 24px;
}

.fx__no-titulo {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--rg-primitive-neutral-900);
}

.fx__no-desc {
  margin: 0;
  font-size: 15px;
  line-height: 1.45;
  color: var(--rg-primitive-neutral-600);
}

.fx__desfechos {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  flex-shrink: 0;
  width: 250px;
  padding-left: 14px;
  border-left: 2px dashed var(--rg-primitive-neutral-300);
}

.fx__desfecho {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px 18px;
  border-radius: 14px;
}

.fx__desfecho--aprovado {
  background: var(--rg-primitive-brand-50);
  border: 1px solid var(--rg-primitive-brand-200);
}

.fx__desfecho--reprovado {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.fx__desfecho-titulo {
  font-size: 17px;
  font-weight: 700;
}

.fx__desfecho--aprovado .fx__desfecho-titulo { color: var(--rg-primitive-brand-700); }
.fx__desfecho--reprovado .fx__desfecho-titulo { color: #b91c1c; }

.fx__desfecho-desc {
  font-size: 13.5px;
  line-height: 1.4;
  color: var(--rg-primitive-neutral-600);
}

.fx__regras {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.fx__regra {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 24px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--rg-primitive-neutral-200);
}

.fx__regra-titulo {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--rg-primitive-brand-700);
}

.fx__regra-desc {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--rg-primitive-neutral-600);
}
</style>
