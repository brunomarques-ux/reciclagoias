<script setup lang="ts">
/**
 * Os e-mails do complemento dentro de uma moldura de cliente de e-mail.
 *
 * É só visual: um frame para mostrar o e-mail como ele chega, com as proporções
 * reais (corpo de 680 px), igual ao mockup do Figma. Nada aqui funciona como caixa
 * de entrada. O e-mail de correção lê os motivos que o analista escreveu na
 * análise, quando existem; sem análise feita, mostra o exemplo do Figma.
 */
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { DOCUMENTOS_EXIGIDOS, PRE_CADASTRO } from '@/data/mocks/operador';
import { useComplementoStore } from '@/stores/complemento';

const route = useRoute();
const router = useRouter();
const c = useComplementoStore();

type Qual = 'ativacao' | 'correcao' | 'aprovado';
const qual = computed<Qual>(() => {
  const q = route.query.email;
  return q === 'correcao' || q === 'aprovado' ? q : 'ativacao';
});

const ASSUNTO: Record<Qual, string> = {
  ativacao: 'Confirme seu e-mail para continuar o cadastro',
  correcao: 'Seu cadastro precisa de correção',
  aprovado: 'Cadastro aprovado no Recicla Goiás',
};
const QUANDO: Record<Qual, string> = {
  ativacao: '08:02 (há 34 minutos)',
  correcao: '4 de set. de 2026, 16:20',
  aprovado: '8 de set. de 2026, 10:05',
};

const itensCorrecao = computed(() => {
  const ids = Object.keys(c.devolvidos);
  if (!ids.length) {
    return [
      { nome: 'Alvará de funcionamento', motivo: 'o documento apresentado está vencido desde março de 2026.' },
      { nome: 'Declaração de capacidade de operação/produção', motivo: 'documento não enviado.' },
    ];
  }
  return ids.map((id) => ({
    nome: DOCUMENTOS_EXIGIDOS.find((d) => d.id === id)?.rotulo ?? id,
    motivo: c.devolvidos[id] ?? '',
  }));
});

const PASTAS = ['Caixa de entrada', 'Com estrela', 'Adiados', 'Importante', 'Enviados', 'Rascunhos', 'Lixeira'];

/** Primeiro clique confirma; os seguintes dizem que já está confirmado (sessão da aba). */
function confirmarEmail() {
  let ja = false;
  try {
    ja = sessionStorage.getItem('rg:email-confirmado') === '1';
    sessionStorage.setItem('rg:email-confirmado', '1');
  } catch {
    /* ok */
  }
  void router.push({ name: 'entrar', query: { perfil: 'operador', destino: '/operador', confirmacao: ja ? 'ja' : 'ok' } });
}

function trocar(q: Qual) {
  void router.replace({ query: { email: q } });
}
</script>

<template>
  <div class="gm">
    <header class="gm__topo">
      <v-icon icon="mdi-menu" size="22" class="gm__ico" aria-hidden="true" />
      <span class="gm__logo" aria-hidden="true">
        <svg viewBox="0 0 48 36" width="28" height="21"><path d="M4 36h8V17L0 8v24a4 4 0 0 0 4 4z" fill="#4285f4" /><path d="M36 36h8a4 4 0 0 0 4-4V8l-12 9z" fill="#34a853" /><path d="M36 2v15l12-9V4c0-3.7-4.2-5.8-7.2-3.6z" fill="#fbbc04" /><path d="M12 17V2l12 9 12-9v15L24 26z" fill="#ea4335" /><path d="M0 4v4l12 9V2L7.2.4C4.2-1.8 0 .3 0 4z" fill="#c5221f" /></svg>
        Gmail
      </span>
      <div class="gm__busca"><v-icon icon="mdi-magnify" size="20" aria-hidden="true" /> Pesquisar e-mail</div>
      <span class="gm__avatar" aria-hidden="true">RC</span>
    </header>

    <div class="gm__corpo">
      <aside class="gm__lateral" aria-hidden="true">
        <span class="gm__escrever"><v-icon icon="mdi-pencil-outline" size="20" /> Escrever</span>
        <span v-for="(p, i) in PASTAS" :key="p" class="gm__pasta" :class="{ 'gm__pasta--ativa': i === 0 }">
          {{ p }}<small v-if="i === 0">3</small>
        </span>
      </aside>

      <main class="gm__painel">
        <div class="gm__acoes" aria-hidden="true">
          <v-icon icon="mdi-arrow-left" size="18" /><v-icon icon="mdi-archive-outline" size="18" /><v-icon icon="mdi-alert-octagon-outline" size="18" /><v-icon icon="mdi-delete-outline" size="18" />
          <span class="gm__pag">1 de 3</span>
        </div>

        <div class="gm__assunto">
          <h1>{{ ASSUNTO[qual] }}</h1>
          <span class="gm__etiqueta">Caixa de entrada ×</span>
        </div>

        <div class="gm__remetente">
          <span class="gm__foto" aria-hidden="true"><v-icon icon="mdi-account" size="22" /></span>
          <div>
            <p><strong>Recicla Goiás</strong> &lt;nao-responda@goias.gov.br&gt;</p>
            <p class="gm__para">para mim ▾</p>
          </div>
          <span class="gm__quando">{{ QUANDO[qual] }}</span>
        </div>

        <!-- o e-mail em tamanho real -->
        <div class="em">
          <article class="em__card">
            <img class="em__brasao" src="/img/emails/brasao-goias-transparente.png" alt="Brasão do Estado de Goiás" width="89" height="119" />

            <template v-if="qual === 'ativacao'">
              <h2 class="em__titulo">Confirme seu e-mail para continuar o cadastro</h2>
              <p class="em__saudacao">Prezado(a) representante da {{ PRE_CADASTRO.razaoSocial }},</p>
              <p>Seu pré-cadastro como operador logístico foi realizado no Recicla Goiás. Depois da confirmação, você poderá acessar o sistema e continuar com o preenchimento do cadastro.</p>
              <dl class="em__resumo">
                <div><dt>Organização</dt><dd>{{ PRE_CADASTRO.razaoSocial }}</dd></div>
                <div><dt>CNPJ</dt><dd>{{ PRE_CADASTRO.cnpj }}</dd></div>
                <div><dt>Perfil</dt><dd>Operador logístico</dd></div>
              </dl>
              <div class="em__caixa em__caixa--info">
                <strong>Documentos necessários</strong>
                <ul><li v-for="d in DOCUMENTOS_EXIGIDOS" :key="d.id">{{ d.rotulo }}</li></ul>
              </div>
              <p><strong class="em__forte">Não é necessário enviar esses documentos por e-mail.</strong> O envio é feito pelo sistema, no complemento de cadastro, em arquivos PDF.</p>
              <p>Para continuar, confirme o endereço de e-mail informado. O botão abre o módulo Operador Logístico; se o e-mail já estiver confirmado, ele leva direto ao acesso. Até a aprovação, o acesso fica restrito ao complemento de cadastro.</p>
              <a class="em__botao" href="#" @click.prevent="confirmarEmail">Confirmar e-mail</a>
            </template>

            <template v-else-if="qual === 'correcao'">
              <h2 class="em__titulo">Seu cadastro precisa de correção</h2>
              <p class="em__saudacao">Prezado(a) representante da {{ PRE_CADASTRO.razaoSocial }},</p>
              <p>Após a análise, identificamos pendências no cadastro da cooperativa como operador logístico.</p>
              <dl class="em__resumo">
                <div><dt>Organização</dt><dd>{{ PRE_CADASTRO.razaoSocial }}</dd></div>
                <div><dt>CNPJ</dt><dd>{{ PRE_CADASTRO.cnpj }}</dd></div>
                <div><dt>Protocolo</dt><dd>{{ c.protocolo }}</dd></div>
              </dl>
              <div class="em__caixa em__caixa--erro">
                <strong>O que precisa ser corrigido</strong>
                <ul><li v-for="i in itensCorrecao" :key="i.nome"><b>{{ i.nome }}:</b> {{ i.motivo }}</li></ul>
              </div>
              <p class="em__saudacao">O que você deve fazer</p>
              <ol class="em__passos">
                <li>Providencie os documentos válidos e atualizados.</li>
                <li>Atualize os documentos no sistema.</li>
                <li>Envie o cadastro novamente para uma nova análise.</li>
              </ol>
              <RouterLink class="em__botao" to="/operador">Corrigir o cadastro</RouterLink>
              <p>Após o reenvio, o cadastro é analisado novamente.</p>
            </template>

            <template v-else>
              <h2 class="em__titulo">Cadastro aprovado</h2>
              <p class="em__saudacao">Prezado(a) representante da {{ PRE_CADASTRO.razaoSocial }},</p>
              <p><strong class="em__forte">O cadastro da cooperativa como operador logístico foi aprovado.</strong> A documentação enviada foi analisada e está de acordo com os requisitos para o cadastro.</p>
              <dl class="em__resumo">
                <div><dt>Organização</dt><dd>{{ PRE_CADASTRO.razaoSocial }}</dd></div>
                <div><dt>CNPJ</dt><dd>{{ PRE_CADASTRO.cnpj }}</dd></div>
                <div><dt>Protocolo</dt><dd>{{ c.protocolo }}</dd></div>
                <div><dt>Aprovado em</dt><dd>08/09/2026</dd></div>
              </dl>
              <p class="em__saudacao">Próximo passo</p>
              <p>Já é possível acessar o sistema e usar as funcionalidades do operador logístico. O manual em anexo mostra, passo a passo, como incluir notas fiscais e fazer transferências. Se preferir, o mesmo passo a passo está no <a href="#" @click.prevent>tutorial em vídeo</a>.</p>
              <RouterLink class="em__botao" to="/operador">Acessar o sistema</RouterLink>
              <p>Agradecemos a parceria e a contribuição para o fortalecimento da reciclagem e da gestão de resíduos sólidos em Goiás.</p>
            </template>

            <p>Em caso de dúvidas ou dificuldades, entre em contato pelo canal de atendimento: <a href="#" @click.prevent>logisticareversa.meioambiente@goias.gov.br</a>.</p>
            <p>Atenciosamente,<br />Equipe Recicla Goiás</p>
            <p class="em__rodape">Mensagem automática, não é necessário responder.</p>
          </article>
        </div>

        <div v-if="qual === 'aprovado'" class="gm__anexos">
          <p>Um anexo · Verificado pelo Gmail</p>
          <div class="gm__anexo">
            <div class="gm__miniatura"><span>PDF</span></div>
            <span class="gm__nomearq">Manual do operador logístico.pdf</span>
          </div>
        </div>
      </main>
    </div>

    <!-- ferramenta de protótipo, fora da moldura -->
    <nav class="gm__troca" aria-label="Qual e-mail mostrar">
      <button v-for="q in (['ativacao', 'correcao', 'aprovado'] as Qual[])" :key="q" type="button" :class="{ ativo: q === qual }" @click="trocar(q)">
        {{ q === 'ativacao' ? 'Ativação' : q === 'correcao' ? 'Correção' : 'Aprovado' }}
      </button>
    </nav>
  </div>
</template>

<style scoped>
.gm { min-height: 100vh; background: #f6f8fc; font-family: Roboto, Arial, sans-serif; color: #1f1f1f; }
.gm__topo { display: flex; align-items: center; gap: 16px; height: 64px; padding: 0 16px; }
.gm__ico { color: #444746; }
.gm__logo { display: flex; align-items: center; gap: 8px; width: 170px; font-size: 22px; color: #444746; }
.gm__busca { display: flex; align-items: center; gap: 12px; flex: 0 1 720px; height: 48px; padding: 0 16px; border-radius: 24px; background: #eaf1fb; color: #444746; font-size: 16px; }
.gm__avatar { margin-left: auto; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: #1f8344; color: #fff; font-size: 13px; font-weight: 600; }
.gm__corpo { display: flex; }
.gm__lateral { flex: 0 0 256px; display: flex; flex-direction: column; gap: 2px; padding: 8px 16px 8px 8px; }
.gm__escrever { display: inline-flex; align-self: flex-start; align-items: center; gap: 12px; height: 56px; margin: 0 0 16px 8px; padding: 0 20px; border-radius: 16px; background: #c2e7ff; font-size: 14px; font-weight: 500; }
.gm__pasta { display: flex; justify-content: space-between; height: 32px; align-items: center; padding: 0 12px 0 26px; border-radius: 0 16px 16px 0; font-size: 14px; }
.gm__pasta--ativa { background: #d3e3fd; font-weight: 700; }
.gm__pasta small { font-size: 12px; }
.gm__painel { flex: 1; min-width: 0; margin: 0 16px 16px 0; padding-bottom: 32px; border-radius: 16px; background: #fff; }
.gm__acoes { display: flex; align-items: center; gap: 22px; height: 48px; padding: 0 16px; color: #444746; }
.gm__pag { margin-left: auto; font-size: 12px; }
.gm__assunto { display: flex; align-items: center; gap: 12px; padding: 12px 16px 12px 72px; }
.gm__assunto h1 { margin: 0; font-size: 22px; font-weight: 400; }
.gm__etiqueta { padding: 0 6px; border-radius: 4px; background: #ddd; font-size: 12px; color: #444746; }
.gm__remetente { display: flex; align-items: flex-start; gap: 12px; padding: 8px 24px 16px 16px; font-size: 14px; }
.gm__remetente p { margin: 0; }
.gm__foto { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: #e8eaed; color: #9aa0a6; }
.gm__para { font-size: 12px; color: #5e5e5e; }
.gm__quando { margin-left: auto; font-size: 12px; color: #5e5e5e; }

.gm__anexos { margin: 24px 0 0 72px; font-size: 14px; color: #444746; }
.gm__anexos p { margin: 0 0 12px; }
.gm__anexo { width: 220px; border: 1px solid #dadce0; border-radius: 8px; overflow: hidden; }
.gm__miniatura { display: grid; place-items: center; height: 96px; background: #f1f3f4; }
.gm__miniatura span { padding: 4px 12px; border-radius: 6px; background: #dc2626; color: #fff; font-size: 13px; font-weight: 700; }
.gm__nomearq { display: block; padding: 8px 12px; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.gm__troca { position: fixed; left: 16px; bottom: 16px; display: flex; gap: 4px; padding: 4px; border-radius: 999px; background: #1f1f1f; box-shadow: 0 4px 16px rgb(0 0 0 / 0.2); }
.gm__troca button { border: none; border-radius: 999px; padding: 6px 14px; background: none; color: #fff; font: 500 13px Roboto, Arial, sans-serif; cursor: pointer; }
.gm__troca button.ativo { background: #fff; color: #1f1f1f; }

/* e-mail: as mesmas medidas e cores do frame do Figma, com os tokens do protótipo */
.em { width: 680px; margin: 8px auto 0; padding: 40px; background: var(--rg-color-surface-muted); font-family: 'Inter Variable', Inter, sans-serif; }
.em__card { display: flex; flex-direction: column; gap: 20px; padding: 40px 40px 32px; background: var(--rg-color-surface-raised); border: 1px solid var(--rg-color-border-subtle); border-radius: 14px; font-size: 14px; line-height: 20px; color: var(--rg-color-text-secondary); }
.em__card p { margin: 0; }
.em__card a { color: var(--rg-color-text-brand); }
.em__brasao { align-self: center; }
.em__titulo { margin: 0; text-align: center; font-size: 20px; line-height: 26px; font-weight: 700; color: var(--rg-color-text-brand); }
.em__saudacao { font-weight: 600; color: var(--rg-color-text-primary); }
.em__forte { color: var(--rg-color-text-primary); }
.em__resumo { margin: 0; padding: 8px 20px; border-radius: 10px; background: var(--rg-color-surface-subtle); }
.em__resumo div { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; }
.em__resumo div + div { border-top: 1px solid var(--rg-color-border-subtle); }
.em__resumo dt { color: var(--rg-color-text-muted); }
.em__resumo dd { margin: 0; font-weight: 600; color: var(--rg-color-text-primary); text-align: right; }
.em__caixa { display: flex; flex-direction: column; gap: 8px; padding: 16px; border-radius: 10px; }
.em__caixa ul { margin: 0; padding-left: 20px; }
.em__caixa--info { background: var(--rg-color-feedback-info-soft); }
.em__caixa--info strong { color: var(--rg-color-feedback-info); }
.em__caixa--erro { background: var(--rg-color-feedback-danger-soft); }
.em__caixa--erro strong { color: var(--rg-primitive-red-700); }
.em__caixa--erro b { color: var(--rg-color-text-primary); }
.em__passos { margin: -12px 0 0; padding-left: 20px; }
.em__botao { display: grid; place-items: center; height: 48px; border-radius: 10px; background: var(--rg-color-action-primary); color: var(--rg-color-text-on-brand) !important; font-size: 15px; font-weight: 600; text-decoration: none; }
.em__rodape { text-align: center; font-size: 12px; color: var(--rg-color-text-muted); }
</style>
