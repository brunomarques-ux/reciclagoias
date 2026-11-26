<script setup lang="ts">
/**
 * /apresentacao-validade · a apresentação em slides das regras de validade de 19/11 (camada do protótipo, fora do
 * produto). Feita para a reunião de 26/11/2026 com a SEMAD: quem apresenta é o narrador, como no vídeo.
 *
 * Alterna três coisas num palco de 1920 x 1080:
 *   slides        capa, a mensagem, o caso, as decisões, o que segue em aberto;
 *   o quadro      os seis ajustes, riscados um a um conforme são mostrados (QuadroDeAjustes.vue);
 *   a tela ao vivo  o protótipo embutido num quadro, que reproduz um capítulo da jornada quando se dá play. O
 *                   quadro aproxima o ponto que a jornada destaca e volta.
 * A régua de datas no pé acompanha tudo. Direção de arte "calendário editorial", a mesma do vídeo de 26/11
 * (docs/sistema/video-validade-19nov): papel claro, datas grandes em Roboto Flex condensada, marca-texto à mão.
 *
 * O protótipo embutido é a própria aplicação, na mesma origem: a página fala com ele por window.__fluxos
 * (src/prototipo/fluxos/api.ts). Lá dentro o painel da jornada some (html[data-palco], prototipo/index.ts).
 *
 * Teclas: seta para a direita, Espaço ou Enter avançam (numa tela ao vivo, o primeiro toque dá play); seta para a
 * esquerda volta; Shift + seta pula a tela sem reproduzir; R repete o capítulo; P pausa; Z liga e desliga a
 * aproximação; N mostra a cola da fala; F tela cheia. `?cena=N` abre direto numa cena.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWindowSize } from '@vueuse/core';
// A Roboto Flex com o eixo de largura (as datas condensadas). Entra com outro nome de família: a 'Roboto Flex
// Variable' do app é só de peso e ganharia a disputa pelo nome.
import flexEstreita from '@fontsource-variable/roboto-flex/files/roboto-flex-latin-wdth-normal.woff2?url';

import type { EstadoParaFora } from '../fluxos/api';
import QuadroDeAjustes from './QuadroDeAjustes.vue';
import { AJUSTES, CENAS, DECISOES, EM_ABERTO, FLUXO, INICIO_DA_TELA, MARCOS, MENSAGEM } from './roteiro';

const route = useRoute();
const router = useRouter();

// ── as cenas ─────────────────────────────────────────────────────────────────────────────────────
const total = CENAS.length;
const limitar = (n: number) => Math.min(Math.max(n, 0), total - 1);
const cenaInicial = Number.parseInt(String(route.query.cena ?? ''), 10);
const idx = ref(Number.isFinite(cenaInicial) ? limitar(cenaInicial - 1) : 0);
const dir = ref(1);
const cena = computed(() => CENAS[idx.value]);
const tela = computed(() => (cena.value.tipo === 'tela' ? cena.value : null));
const marcoAtivo = computed(() => ('marco' in cena.value ? cena.value.marco : null));
const dataEhData = computed(() => /^\d{2}\/\d{2}$/.test(tela.value?.data ?? ''));

// ── a tela ao vivo ───────────────────────────────────────────────────────────────────────────────
type Situacao = 'carregando' | 'pronto' | 'tocando' | 'pausado' | 'feito' | 'erro';
const quadro = ref<HTMLIFrameElement | null>(null);
const est = ref<EstadoParaFora | null>(null);
const situacao = ref<Situacao>('carregando');
const zoomLigado = ref(true);
const camera = ref('translate(0px, 0px) scale(1)');
let sincronizando = false;
let pedidoEm = 0;
let tocouEm = 0;
let relogio: number | undefined;

const api = () => {
  try {
    return quadro.value?.contentWindow?.__fluxos;
  } catch {
    return undefined;
  }
};
const capitulo = computed(() => (tela.value ? est.value?.capitulos[tela.value.capitulo] : undefined));

function sincronizar(): void {
  const c = capitulo.value;
  const a = api();
  if (!c || !a) return;
  sincronizando = true;
  pedidoEm = Date.now();
  void a.cancelar().then(() => a.irPara(c.inicio));
}

/** Lê o estado do protótipo embutido e decide a situação da tela desta cena. */
async function acompanhar(): Promise<void> {
  try {
    est.value = (await api()?.estado()) ?? null;
  } catch {
    est.value = null;
  }
  if (!tela.value) return;
  const e = est.value;
  const c = capitulo.value;
  if (!e || e.id !== FLUXO || !c || e.preparando) {
    situacao.value = 'carregando';
    return;
  }
  const noInicio = (e.passo === c.inicio && !e.feito) || (c.inicio > 0 && e.passo === c.inicio - 1 && e.feito);
  const noFim = e.passo === c.fim && e.feito;
  if (sincronizando) {
    if (e.fase === 'parado' && noInicio) sincronizando = false;
    else {
      // o pedido se perdeu numa recarga do quadro: pede de novo
      if (e.fase === 'parado' && Date.now() - pedidoEm > 6000) sincronizar();
      situacao.value = 'carregando';
      return;
    }
  }
  if (e.fase === 'executando') situacao.value = 'tocando';
  else if (e.fase === 'pausado') situacao.value = 'pausado';
  else if (e.erro) situacao.value = 'erro';
  else if (Date.now() - tocouEm < 1500) situacao.value = 'tocando'; // o play acabou de ser dado
  else if (noFim) situacao.value = 'feito';
  else if (noInicio) situacao.value = 'pronto';
  else {
    situacao.value = 'carregando';
    sincronizar(); // o protótipo está em outro ponto da história: leva ao começo do capítulo desta cena
  }
  mirar();
}

/** A câmera: aproxima o ponto que a jornada destaca ("olhar") e volta ao quadro inteiro nos gestos. */
function mirar(): void {
  let z = 1;
  let x = 0;
  let y = 0;
  if (zoomLigado.value && situacao.value === 'tocando' && est.value?.acao === 'olhar') {
    try {
      const caixa = quadro.value?.contentDocument?.querySelector<HTMLElement>('.fx-camada__caixa');
      if (caixa && !caixa.hidden) {
        const r = caixa.getBoundingClientRect();
        if (r.width > 0 && r.top >= 0 && r.bottom <= 864) {
          z = r.width > 900 ? 1.12 : 1.3;
          x = (r.left + r.width / 2) * (1 - z);
          y = (r.top + r.height / 2) * (1 - z);
        }
      }
    } catch {
      /* o quadro está no meio de uma carga */
    }
  }
  camera.value = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${z})`;
}

function tocar(): void {
  const a = api();
  if (!a || situacao.value !== 'pronto') return;
  tocouEm = Date.now();
  situacao.value = 'tocando';
  void a.reproduzirCapitulo();
}
function repetir(): void {
  if (!tela.value) return;
  situacao.value = 'carregando';
  sincronizar();
}
function pausarOuContinuar(): void {
  const a = api();
  if (!a) return;
  if (situacao.value === 'tocando') void a.pausar();
  else if (situacao.value === 'pausado') void a.continuar();
}

// ── navegar ──────────────────────────────────────────────────────────────────────────────────────
function irPara(n: number): void {
  const novo = limitar(n);
  if (novo === idx.value) return;
  // sair de uma tela no meio do capítulo para a jornada: ao voltar, ela recomeça do início do capítulo
  if (tela.value && (situacao.value === 'tocando' || situacao.value === 'pausado')) void api()?.cancelar();
  dir.value = novo > idx.value ? 1 : -1;
  idx.value = novo;
}
function avancar(pular = false): void {
  if (tela.value && !pular) {
    if (situacao.value === 'pronto') return tocar();
    if (situacao.value === 'pausado') return pausarOuContinuar();
    if (situacao.value === 'tocando' || situacao.value === 'carregando') return;
  }
  irPara(idx.value + 1);
}
const voltar = () => irPara(idx.value - 1);

watch(idx, (n) => {
  sincronizando = false;
  tocouEm = 0;
  situacao.value = 'carregando';
  camera.value = 'translate(0px, 0px) scale(1)';
  void router.replace({ query: { ...route.query, cena: String(n + 1) } });
  void acompanhar();
});

const raiz = ref<HTMLElement | null>(null);
const telaCheia = ref(false);
const cola = ref(false);
const dica = ref(true);
function alternarTelaCheia(): void {
  if (!document.fullscreenElement) void raiz.value?.requestFullscreen?.();
  else void document.exitFullscreen?.();
}
function aoTeclar(e: KeyboardEvent): void {
  if (!e.isTrusted || e.ctrlKey || e.metaKey || e.altKey) return; // as teclas que a jornada simula não navegam
  const k = e.key;
  if (['ArrowRight', ' ', 'Enter', 'PageDown'].includes(k)) {
    e.preventDefault();
    avancar(e.shiftKey);
  } else if (['ArrowLeft', 'PageUp'].includes(k)) {
    e.preventDefault();
    voltar();
  } else if (k === 'Home') irPara(0);
  else if (k === 'End') irPara(total - 1);
  else if (k === 'f' || k === 'F') alternarTelaCheia();
  else if (k === 'n' || k === 'N') cola.value = !cola.value;
  else if (k === 'z' || k === 'Z') zoomLigado.value = !zoomLigado.value;
  else if (k === 'r' || k === 'R') repetir();
  else if (k === 'p' || k === 'P') pausarOuContinuar();
  dica.value = false;
}
const aoMudarTelaCheia = () => (telaCheia.value = !!document.fullscreenElement);
/** A jornada põe o foco em campos dentro do quadro: as teclas de lá também navegam a apresentação. */
function aoCarregarQuadro(): void {
  try {
    quadro.value?.contentWindow?.addEventListener('keydown', aoTeclar, true);
  } catch {
    /* sem acesso ao quadro: as teclas valem só com o foco na apresentação */
  }
}

const { width, height } = useWindowSize();
const escala = computed(() => Math.min(width.value / 1920, height.value / 1080));

const enderecoDoQuadro = ref('about:blank');
let tDica: number | undefined;
onMounted(() => {
  // a jornada começa limpa a cada abertura da apresentação (o estado dela mora na sessão da aba)
  try {
    window.sessionStorage.removeItem('rg-proto:v1:fluxo');
  } catch {
    /* sem sessionStorage: segue */
  }
  enderecoDoQuadro.value = INICIO_DA_TELA;
  document.documentElement.classList.add('pv-aberta'); // sem a barra de rolagem da página
  const fonte = new FontFace('Recicla Flex Estreita', `url(${flexEstreita})`, { weight: '100 1000', stretch: '25% 151%' });
  void fonte.load().then((f) => document.fonts.add(f));
  window.addEventListener('keydown', aoTeclar);
  document.addEventListener('fullscreenchange', aoMudarTelaCheia);
  relogio = window.setInterval(() => void acompanhar(), 200);
  tDica = window.setTimeout(() => (dica.value = false), 9000);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', aoTeclar);
  document.removeEventListener('fullscreenchange', aoMudarTelaCheia);
  window.clearInterval(relogio);
  window.clearTimeout(tDica);
  document.documentElement.classList.remove('pv-aberta');
});

const textoDoBotao = computed(() => {
  if (!tela.value) return 'Avançar';
  return { carregando: 'Preparando', pronto: 'Reproduzir', tocando: 'Reproduzindo', pausado: 'Continuar', feito: 'Avançar', erro: 'Avançar' }[situacao.value];
});
</script>

<template>
  <div ref="raiz" class="pv" data-prototipo>
    <div class="pv__palco" :style="{ transform: `scale(${escala})` }">
      <svg class="pv__grao" width="1920" height="1080" aria-hidden="true">
        <filter id="pv-ruido">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 .1  0 0 0 0 .12  0 0 0 0 .1  0 0 0 .06 0" />
        </filter>
        <rect width="1920" height="1080" filter="url(#pv-ruido)" />
      </svg>

      <header class="pv__cab">
        <span><b>Recicla Goiás</b> · Validade dos documentos do operador logístico</span>
        <span v-if="tela">Ajuste {{ tela.ajuste + 1 }} de {{ AJUSTES.length }}</span>
        <span v-else>Regras de 19/11/2026</span>
      </header>

      <!-- os slides e a coluna ao lado da tela -->
      <Transition :name="dir > 0 ? 'pv-vai' : 'pv-volta'" mode="out-in">
        <section v-if="cena.tipo === 'capa'" key="capa" class="pv-cena pv-capa">
          <div class="pv-capa__texto">
            <p class="pv-rot">Apresentação · 26/11/2026</p>
            <h1 class="pv-capa__titulo">Validade dos documentos do operador logístico</h1>
            <p class="pv-sub">Como ficaram as regras de aviso e de bloqueio enviadas em 19/11, do primeiro lembrete ao acesso de volta.</p>
          </div>
          <div class="pv-folhas" aria-hidden="true">
            <div class="pv-folha pv-folha--1"><span>Outubro</span><b>15</b><small>1º lembrete</small></div>
            <div class="pv-folha pv-folha--2"><span>Novembro</span><b>14</b><small>2º lembrete</small></div>
            <div class="pv-folha pv-folha--3">
              <span>Dezembro 2026</span><b>14</b><small>vence o alvará</small>
              <svg class="pv-circulo" viewBox="0 0 300 300"><path d="M150,22 C232,14 286,74 280,150 C274,236 208,284 140,278 C60,270 14,212 22,138 C30,62 96,18 178,30" pathLength="1" /></svg>
            </div>
          </div>
        </section>

        <section v-else-if="cena.tipo === 'origem'" key="origem" class="pv-cena pv-origem">
          <div class="pv-origem__antes">
            <p class="pv-rot pv-rot--verm">Combinado em 13/11</p>
            <p class="pv-origem__velho"><span>Um aviso só, 30 dias antes</span></p>
            <p class="pv-origem__velho"><span>Bloqueio no dia do vencimento</span></p>
            <p class="pv-origem__nota">A mensagem de 19/11 troca essas duas regras.</p>
          </div>
          <div class="pv-origem__agora">
            <p class="pv-rot">O que a mensagem de 19/11 pede</p>
            <ol class="pv-origem__lista">
              <li v-for="(m, i) in MENSAGEM" :key="i"><b>{{ i + 1 }}</b><span>{{ m }}</span></li>
            </ol>
          </div>
        </section>

        <section v-else-if="cena.tipo === 'caso'" key="caso" class="pv-cena pv-caso">
          <div class="pv-caso__texto">
            <p class="pv-rot">O caso que vamos seguir</p>
            <p class="pv-caso__data">14/12</p>
            <h2 class="pv-titulo">O alvará de funcionamento da cooperativa Recicla Cerrado vence em 14/12/2026</h2>
            <p class="pv-sub">O cadastro está aprovado. Vamos seguir esse documento no tempo e ver o que o sistema faz em cada data.</p>
            <p class="pv-caso__exemplo">Dados de exemplo</p>
          </div>
          <ol class="pv-caso__estados">
            <li data-tom="verde">
              <b>Aprovado</b><span>Até o vencimento</span>
              <p>Tudo liberado. Os lembretes saem 60 e 30 dias antes, e o documento já pode ser trocado.</p>
            </li>
            <li data-tom="ambar">
              <b>Parcialmente ativo</b><span>10 dias corridos depois de vencer</span>
              <p>Transfere créditos. Não inclui nota fiscal nova.</p>
            </li>
            <li data-tom="verm">
              <b>Bloqueado</b><span>A partir do 11º dia</span>
              <p>Nenhuma operação. Só a troca do documento abre.</p>
            </li>
          </ol>
          <p class="pv-caso__seta">a régua acompanha a apresentação <span aria-hidden="true">↓</span></p>
        </section>

        <section v-else-if="cena.tipo === 'quadro'" :key="`quadro-${idx}`" class="pv-cena">
          <QuadroDeAjustes :ajustes="AJUSTES" :foco="cena.foco" />
        </section>

        <section v-else-if="cena.tipo === 'tela'" :key="`tela-${idx}`" class="pv-cena pv-lado">
          <p class="pv-rot">{{ AJUSTES[cena.ajuste].titulo }}</p>
          <p class="pv-lado__data" :data-palavra="!dataEhData || undefined">{{ cena.data }}</p>
          <h2 class="pv-lado__titulo">{{ cena.titulo }}</h2>
          <p class="pv-lado__nota">{{ cena.nota }}</p>
          <p class="pv-lado__quem" :data-admin="cena.quem === 'Administrador' || undefined">{{ cena.quem }}</p>
        </section>

        <section v-else-if="cena.tipo === 'decisoes'" key="decisoes" class="pv-cena pv-decisoes">
          <p class="pv-rot">Decidido em 26/11</p>
          <h2 class="pv-titulo">Três pontos da mensagem pediam leitura. Adotamos o mais usado.</h2>
          <ol class="pv-decisoes__lista">
            <li v-for="(d, i) in DECISOES" :key="d.titulo">
              <b class="pv-decisoes__n">{{ i + 1 }}</b>
              <h3>{{ d.titulo }}</h3>
              <p>{{ d.texto }}</p>
              <span>{{ d.exemplo }}</span>
            </li>
          </ol>
          <p class="pv-decisoes__pe">O protótipo já está assim. Se a SEMAD preferir outro caminho, ajustamos.</p>
        </section>

        <section v-else-if="cena.tipo === 'aberto'" key="aberto" class="pv-cena pv-aberto">
          <div class="pv-aberto__lado">
            <p class="pv-rot pv-rot--ambar">Segue em aberto</p>
            <p class="pv-aberto__n">4</p>
            <p class="pv-sub">perguntas para a SEMAD</p>
          </div>
          <ol class="pv-aberto__lista">
            <li v-for="(p, i) in EM_ABERTO" :key="i"><b>{{ i + 1 }}</b><span>{{ p }}</span></li>
          </ol>
        </section>

        <section v-else key="fim" class="pv-cena pv-fim">
          <p class="pv-rot">Para conferir depois</p>
          <h2 class="pv-titulo">O que for decidido aqui entra no protótipo e no Figma</h2>
          <ul class="pv-fim__links">
            <li><b>Jornadas guiadas</b><span>reciclagoias.vercel.app/fluxos/validade-19nov</span></li>
            <li><b>Esta apresentação</b><span>reciclagoias.vercel.app/apresentacao-validade</span></li>
            <li><b>Figma</b><span>Recicla Goiás, página Novembro 2026 · Validade e bloqueio · Regras de 19/11</span></li>
          </ul>
        </section>
      </Transition>

      <!-- a tela ao vivo: fica sempre montada (guarda a história entre uma cena e outra) e entra só nas cenas dela -->
      <div class="pv-tela" :data-visivel="!!tela || undefined" :data-situacao="situacao" :aria-hidden="!tela">
        <div class="pv-tela__barra">
          <span class="pv-tela__bolas" aria-hidden="true"><i /><i /><i /></span>
          <span class="pv-tela__endereco">reciclagoias.vercel.app</span>
          <span class="pv-tela__vivo"><i aria-hidden="true" /> protótipo ao vivo</span>
        </div>
        <div class="pv-tela__janela">
          <div class="pv-tela__escala">
            <div class="pv-tela__camera" :style="{ transform: camera }">
              <iframe
                ref="quadro"
                class="pv-tela__quadro"
                :src="enderecoDoQuadro"
                title="Protótipo do Recicla Goiás, ao vivo"
                tabindex="-1"
                @load="aoCarregarQuadro"
              />
            </div>
          </div>
          <Transition name="pv-veu">
            <button v-if="tela && situacao === 'pronto'" type="button" class="pv-veu" @click="tocar">
              <span class="pv-veu__play" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="56" height="56"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
              </span>
              <span class="pv-veu__texto">Reproduzir</span>
              <span class="pv-veu__tecla">Espaço ou seta para a direita</span>
            </button>
            <div v-else-if="tela && situacao === 'carregando'" class="pv-veu pv-veu--espera">
              <span class="pv-veu__roda" aria-hidden="true" />
              <span class="pv-veu__texto">Preparando a tela</span>
            </div>
            <div v-else-if="tela && situacao === 'erro'" class="pv-veu pv-veu--espera">
              <span class="pv-veu__texto">A tela não respondeu neste ponto</span>
              <button type="button" class="pv-veu__botao" @click="repetir">Repetir o capítulo (R)</button>
            </div>
          </Transition>
        </div>
        <p class="pv-tela__legenda" aria-live="polite">
          <template v-if="situacao === 'tocando' && est?.fazer"><b>Agora</b> {{ est.fazer }}</template>
          <template v-else-if="situacao === 'pausado'"><b>Pausado</b> Espaço para continuar</template>
          <template v-else-if="situacao === 'feito'"><b class="pv-ok">Mostrado</b> Seta para a direita para seguir</template>
        </p>
      </div>

      <!-- a régua de datas: acompanha a apresentação inteira -->
      <footer class="pv-regua" :data-quieta="cena.tipo === 'fim' || undefined">
        <div class="pv-regua__faixa">
          <span data-tom="verde" style="left: 0; width: 46%">aprovado</span>
          <span data-tom="ambar" style="left: 46%; width: 44%">parcialmente ativo · 10 dias corridos</span>
          <span data-tom="verm" style="left: 90%; width: 10%">bloqueado</span>
        </div>
        <ol class="pv-regua__marcos">
          <li v-for="m in MARCOS" :key="m.id" :style="{ left: `${m.pos}%` }" :data-ativo="m.id === marcoAtivo || undefined">
            <i aria-hidden="true" /><b>{{ m.data }}</b><small>{{ m.rotulo }}</small>
          </li>
        </ol>
        <svg
          class="pv-regua__anel"
          :data-visivel="!!marcoAtivo || undefined"
          :style="{ left: `${MARCOS.find((m) => m.id === marcoAtivo)?.pos ?? 46}%` }"
          viewBox="0 0 200 100"
          aria-hidden="true"
        >
          <path d="M100,8 C160,4 194,26 190,52 C186,82 140,94 96,92 C44,90 8,74 10,48 C12,20 60,6 124,12" />
        </svg>
      </footer>
    </div>

    <!-- fora do palco: os controles, a cola da fala e a dica das teclas -->
    <Transition name="pv-veu">
      <aside v-if="cola" class="pv-cola"><b>Fala</b> {{ cena.fala }}</aside>
    </Transition>
    <nav class="pv-controles" aria-label="Controles da apresentação">
      <button type="button" title="Voltar (seta para a esquerda)" aria-label="Voltar" :disabled="idx === 0" @click="voltar">‹</button>
      <span class="pv-controles__conta">{{ idx + 1 }} / {{ total }}</span>
      <button type="button" class="pv-controles__principal" :disabled="!!tela && (situacao === 'tocando' || situacao === 'carregando')" @click="avancar()">
        {{ textoDoBotao }}
      </button>
      <button type="button" title="Pular sem reproduzir (Shift + seta)" aria-label="Pular" :disabled="idx === total - 1" @click="avancar(true)">›</button>
      <button type="button" :aria-pressed="cola" title="Cola da fala (N)" @click="cola = !cola">N</button>
      <button type="button" :aria-pressed="telaCheia" title="Tela cheia (F)" @click="alternarTelaCheia">F</button>
    </nav>
    <Transition name="pv-veu">
      <p v-if="dica" class="pv-dica">
        <b>→</b> ou <b>Espaço</b> avança e dá play · <b>←</b> volta · <b>F</b> tela cheia · <b>N</b> cola da fala · <b>R</b> repete a tela
      </p>
    </Transition>
  </div>
</template>

<style scoped>
/* Paleta do "calendário editorial" (a do vídeo de 26/11). É de apresentação, não de tela do sistema: fica local. */
.pv {
  --pv-papel: #f3eee4; --pv-papel-claro: #faf7f0; --pv-linha: #ddd5c5; --pv-tinta: #1b2420; --pv-tinta2: #4a5550; --pv-apagado: #8c918b;
  --pv-verde: #1f8449; --pv-verde-claro: #dcefe2; --pv-verm: #cf4426; --pv-verm-claro: #f6dcd3; --pv-ambar: #c27c0e; --pv-ambar-claro: #f6e7c8;
  --pv-flex: 'Recicla Flex Estreita', 'Roboto Flex Variable', 'Inter Variable', sans-serif;
  --pv-inter: 'Inter Variable', Inter, system-ui, sans-serif;
  position: fixed; inset: 0; z-index: 50; overflow: hidden; background: #14110c;
  display: flex; align-items: center; justify-content: center;
}
.pv :where(p, h1, h2, h3, ol, ul) { margin: 0; padding: 0; }
.pv :where(ol, ul) { list-style: none; }
.pv__palco {
  position: relative; flex: none; width: 1920px; height: 1080px; overflow: hidden; transform-origin: center center;
  background: var(--pv-papel); color: var(--pv-tinta); font-family: var(--pv-inter);
}
.pv__grao { position: absolute; inset: 0; opacity: .5; pointer-events: none; }
.pv__cab {
  position: absolute; left: 80px; right: 80px; top: 40px; display: flex; justify-content: space-between; align-items: center;
  font: 600 19px/1 var(--pv-inter); letter-spacing: .14em; text-transform: uppercase; color: var(--pv-tinta2);
}
.pv__cab b { color: var(--pv-verde); font-weight: 800; }

.pv-cena { position: absolute; inset: 0; }
.pv-rot { font: 700 22px/1.2 var(--pv-inter); letter-spacing: .14em; text-transform: uppercase; color: var(--pv-verde); }
.pv-rot--verm { color: var(--pv-verm); }
.pv-rot--ambar { color: var(--pv-ambar); }
.pv-titulo { font: 800 56px/1.08 var(--pv-inter); letter-spacing: -.02em; text-wrap: balance; }
.pv-sub { font: 400 32px/1.4 var(--pv-inter); color: var(--pv-tinta2); text-wrap: pretty; }

.pv-vai-enter-active, .pv-vai-leave-active, .pv-volta-enter-active, .pv-volta-leave-active { transition: opacity .32s ease, transform .4s cubic-bezier(.2, 0, 0, 1); }
.pv-vai-enter-from, .pv-volta-leave-to { opacity: 0; transform: translateX(36px); }
.pv-vai-leave-to, .pv-volta-enter-from { opacity: 0; transform: translateX(-36px); }

/* ── capa ── */
.pv-capa__texto { position: absolute; left: 80px; top: 250px; width: 900px; }
.pv-capa__titulo { margin-top: 28px; font: 800 104px/1 var(--pv-inter); letter-spacing: -.035em; text-wrap: balance; }
.pv-capa .pv-sub { margin-top: 36px; max-width: 780px; }
.pv-folhas { position: absolute; right: 120px; top: 150px; width: 700px; height: 720px; }
.pv-folha {
  position: absolute; width: 380px; height: 470px; border-radius: 10px; background: #fff; overflow: hidden; text-align: center;
  box-shadow: 0 2px 0 rgba(27, 36, 32, .06), 0 30px 60px -24px rgba(27, 36, 32, .35);
}
.pv-folha span { display: block; padding: 16px 0 14px; background: var(--pv-tinta2); color: #fff; font: 700 22px/1 var(--pv-inter); letter-spacing: .16em; text-transform: uppercase; }
.pv-folha b { display: block; margin-top: 26px; font-family: var(--pv-flex) !important; font-weight: 1000; font-variation-settings: 'wdth' 25; font-size: 330px; line-height: .82; letter-spacing: -.02em; color: var(--pv-tinta); }
.pv-folha small { display: block; margin-top: 18px; font: 600 24px/1 var(--pv-inter); color: var(--pv-tinta2); }
.pv-folha--1 { left: 0; top: 30px; transform: rotate(-9deg); opacity: .9; }
.pv-folha--2 { left: 150px; top: 90px; transform: rotate(4deg); }
.pv-folha--3 { left: 300px; top: 200px; transform: rotate(-3deg); overflow: visible; }
.pv-folha--3 span { background: var(--pv-verm); border-radius: 10px 10px 0 0; }
.pv-circulo { position: absolute; left: 38px; top: 58px; width: 304px; height: 304px; overflow: visible; }
.pv-circulo path, .pv-regua__anel path { fill: none; stroke: var(--pv-verm); stroke-width: 7; stroke-linecap: round; }
.pv-circulo path { stroke-dasharray: 1; animation: pv-desenha 1.1s .5s cubic-bezier(.3, 0, .1, 1) both; }
@keyframes pv-desenha { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }

/* ── a mensagem ── */
.pv-origem__antes { position: absolute; left: 80px; top: 190px; width: 520px; }
.pv-origem__velho { margin-top: 30px; font: 700 44px/1.15 var(--pv-inter); letter-spacing: -.015em; color: var(--pv-apagado); }
.pv-origem__velho span { background: linear-gradient(transparent 46%, var(--pv-verm) 46%, var(--pv-verm) 54%, transparent 54%); }
.pv-origem__nota { margin-top: 44px; font: 500 28px/1.4 var(--pv-inter); color: var(--pv-tinta2); }
.pv-origem__agora { position: absolute; left: 700px; right: 80px; top: 190px; }
.pv-origem__lista { margin-top: 24px; }
.pv-origem__lista li { display: flex; gap: 28px; align-items: flex-start; padding: 22px 0; border-top: 2px solid var(--pv-linha); }
.pv-origem__lista b, .pv-aberto__lista b, .pv-decisoes__n { flex: none; width: 64px; font-family: var(--pv-flex) !important; font-weight: 900; font-variation-settings: 'wdth' 30; font-size: 84px; line-height: .86; color: var(--pv-verde); }
.pv-origem__lista span { font: 500 32px/1.34 var(--pv-inter); text-wrap: pretty; }

/* ── o caso ── */
.pv-caso__texto { position: absolute; left: 80px; top: 150px; width: 800px; }
.pv-caso__data { margin-top: 10px; font-family: var(--pv-flex) !important; font-weight: 1000; font-variation-settings: 'wdth' 25; font-size: 330px; line-height: .84; letter-spacing: -.02em; color: var(--pv-verm); }
.pv-caso .pv-titulo { margin-top: 18px; font-size: 50px; }
.pv-caso .pv-sub { margin-top: 22px; font-size: 29px; }
.pv-caso__exemplo { margin-top: 18px; font: 600 18px/1 var(--pv-inter); letter-spacing: .12em; text-transform: uppercase; color: var(--pv-apagado); }
.pv-caso__estados { position: absolute; left: 980px; right: 80px; top: 170px; display: flex; flex-direction: column; gap: 18px; }
.pv-caso__estados li { padding: 26px 30px 28px; border-radius: 12px; background: var(--pv-papel-claro); box-shadow: inset 10px 0 0 var(--tom); }
.pv-caso__estados li[data-tom='verde'] { --tom: var(--pv-verde); }
.pv-caso__estados li[data-tom='ambar'] { --tom: var(--pv-ambar); }
.pv-caso__estados li[data-tom='verm'] { --tom: var(--pv-verm); }
.pv-caso__estados b { font: 800 38px/1.1 var(--pv-inter); letter-spacing: -.015em; color: var(--tom); }
.pv-caso__estados span { margin-left: 16px; font: 600 20px/1 var(--pv-inter); letter-spacing: .08em; text-transform: uppercase; color: var(--pv-apagado); }
.pv-caso__estados p { margin-top: 10px; font: 500 27px/1.35 var(--pv-inter); color: var(--pv-tinta2); }
.pv-caso__seta { position: absolute; right: 80px; top: 872px; font: 600 22px/1 var(--pv-inter); color: var(--pv-tinta2); }

/* ── a coluna ao lado da tela ── */
.pv-lado { inset: 122px auto 150px 80px; width: 410px; }
.pv-lado .pv-rot { font-size: 19px; }
.pv-lado__data { margin-top: 26px; font-family: var(--pv-flex) !important; font-weight: 1000; font-variation-settings: 'wdth' 25; font-size: 184px; line-height: .86; letter-spacing: -.02em; color: var(--pv-tinta); }
.pv-lado__data[data-palavra] { font-size: 112px; line-height: .9; font-variation-settings: 'wdth' 30; }
.pv-lado__titulo { margin-top: 26px; font: 800 42px/1.1 var(--pv-inter); letter-spacing: -.02em; text-wrap: balance; }
.pv-lado__nota { margin-top: 18px; font: 500 26px/1.38 var(--pv-inter); color: var(--pv-tinta2); text-wrap: pretty; }
.pv-lado__quem { display: inline-block; margin-top: 28px; padding: 10px 18px; border-radius: 999px; background: var(--pv-verde-claro); color: var(--pv-verde); font: 700 19px/1 var(--pv-inter); letter-spacing: .08em; text-transform: uppercase; }
.pv-lado__quem[data-admin] { background: var(--pv-tinta); color: var(--pv-papel); }

/* ── a tela ao vivo ── */
.pv-tela {
  position: absolute; left: 544px; top: 96px; width: 1296px; opacity: 0; pointer-events: none;
  transform: translateY(26px) scale(.955); transform-origin: 50% 40%;
  transition: opacity .35s ease, transform .55s cubic-bezier(.2, 0, 0, 1);
}
.pv-tela[data-visivel] { opacity: 1; transform: none; pointer-events: auto; }
.pv-tela__barra {
  display: flex; align-items: center; gap: 18px; height: 36px; padding: 0 16px; border-radius: 12px 12px 0 0;
  background: var(--pv-tinta); color: #c9cfc9; font: 500 15px/1 var(--pv-inter);
}
.pv-tela__bolas { display: flex; gap: 7px; }
.pv-tela__bolas i { width: 11px; height: 11px; border-radius: 50%; background: #5c6660; }
.pv-tela__endereco { flex: 1; text-align: center; letter-spacing: .02em; }
.pv-tela__vivo { display: flex; align-items: center; gap: 8px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; font-size: 13px; color: #fff; }
.pv-tela__vivo i { width: 9px; height: 9px; border-radius: 50%; background: #58d68d; }
.pv-tela[data-situacao='tocando'] .pv-tela__vivo i { background: #ff6b4a; animation: pv-pisca 1.2s ease-in-out infinite; }
@keyframes pv-pisca { 50% { opacity: .25; } }
.pv-tela__janela {
  position: relative; width: 1296px; height: 778px; overflow: hidden; border-radius: 0 0 12px 12px; background: #fff;
  box-shadow: 0 2px 0 rgba(27, 36, 32, .06), 0 34px 70px -26px rgba(27, 36, 32, .45);
}
/* o protótipo roda a 1440 x 864 (a largura do Figma) e é reduzido para caber no palco */
.pv-tela__escala { width: 1440px; height: 864px; transform: scale(.9); transform-origin: 0 0; }
.pv-tela__camera { width: 1440px; height: 864px; transform-origin: 0 0; transition: transform .8s cubic-bezier(.3, 0, .1, 1); }
.pv-tela__quadro { display: block; width: 1440px; height: 864px; border: 0; pointer-events: none; background: #fff; }
.pv-tela__legenda { margin-top: 12px; min-height: 30px; font: 500 22px/1.35 var(--pv-inter); color: var(--pv-tinta2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pv-tela__legenda b { margin-right: 10px; font: 700 16px/1 var(--pv-inter); letter-spacing: .12em; text-transform: uppercase; color: var(--pv-verm); }
.pv-tela__legenda b.pv-ok { color: var(--pv-verde); }

.pv-veu {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
  border: 0; background: rgba(27, 36, 32, .78); backdrop-filter: blur(3px); color: #fff; font-family: var(--pv-inter); cursor: pointer;
}
.pv-veu--espera { cursor: default; background: rgba(243, 238, 228, .9); color: var(--pv-tinta); }
.pv-veu__play { display: grid; place-items: center; width: 132px; height: 132px; border-radius: 50%; background: var(--pv-verde); box-shadow: 0 18px 44px -12px rgba(0, 0, 0, .5); transition: transform .2s; }
.pv-veu__play svg { margin-left: 8px; }
.pv-veu:hover .pv-veu__play { transform: scale(1.06); }
.pv-veu:focus-visible { outline: 4px solid #fff; outline-offset: -8px; }
.pv-veu__texto { font: 700 30px/1 var(--pv-inter); }
.pv-veu__tecla { font: 500 19px/1 var(--pv-inter); opacity: .8; }
.pv-veu__roda { width: 46px; height: 46px; border-radius: 50%; border: 5px solid var(--pv-linha); border-top-color: var(--pv-verde); animation: pv-gira .9s linear infinite; }
@keyframes pv-gira { to { transform: rotate(360deg); } }
.pv-veu__botao { padding: 12px 22px; border: 0; border-radius: 8px; background: var(--pv-tinta); color: #fff; font: 700 20px/1 var(--pv-inter); cursor: pointer; }
.pv-veu-enter-active, .pv-veu-leave-active { transition: opacity .28s ease; }
.pv-veu-enter-from, .pv-veu-leave-to { opacity: 0; }

/* ── decisões, em aberto e fim ── */
.pv-decisoes { inset: 150px 80px 150px; }
.pv-decisoes .pv-titulo { margin-top: 20px; max-width: 1300px; }
.pv-decisoes__lista { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-top: 50px; }
.pv-decisoes__lista li { padding: 30px 32px 32px; border-radius: 12px; background: var(--pv-papel-claro); box-shadow: 0 2px 0 rgba(27, 36, 32, .06), 0 24px 44px -30px rgba(27, 36, 32, .4); }
.pv-decisoes__n { display: block; }
.pv-decisoes__lista h3 { margin: 16px 0 0; font: 800 34px/1.1 var(--pv-inter); letter-spacing: -.015em; }
.pv-decisoes__lista p { margin-top: 14px; font: 500 25px/1.4 var(--pv-inter); color: var(--pv-tinta2); min-height: 176px; }
.pv-decisoes__lista span { display: inline-block; margin-top: 18px; padding: 10px 16px; border-radius: 8px; background: var(--pv-verde-claro); color: var(--pv-verde); font: 700 20px/1.2 var(--pv-inter); }
.pv-decisoes__pe { margin-top: 34px; font: 500 26px/1.3 var(--pv-inter); color: var(--pv-tinta2); }

.pv-aberto__lado { position: absolute; left: 80px; top: 150px; width: 420px; }
.pv-aberto__n { margin-top: 20px; font-family: var(--pv-flex) !important; font-weight: 1000; font-variation-settings: 'wdth' 25; font-size: 420px; line-height: .8; color: var(--pv-ambar); }
.pv-aberto__lado .pv-sub { margin-top: 26px; }
.pv-aberto__lista { position: absolute; left: 600px; right: 80px; top: 150px; }
.pv-aberto__lista li { display: flex; gap: 28px; align-items: flex-start; padding: 28px 0; border-top: 2px solid var(--pv-linha); }
.pv-aberto__lista li:last-child { border-bottom: 2px solid var(--pv-linha); }
.pv-aberto__lista b { color: var(--pv-ambar); }
.pv-aberto__lista span { font: 500 34px/1.32 var(--pv-inter); text-wrap: pretty; }

.pv-fim { inset: 210px 80px 150px; }
.pv-fim .pv-titulo { margin-top: 22px; font-size: 76px; max-width: 1300px; }
.pv-fim__links { margin-top: 64px; max-width: 1400px; }
.pv-fim__links li { display: flex; align-items: baseline; gap: 32px; padding: 24px 0; border-top: 2px solid var(--pv-linha); }
.pv-fim__links b { flex: none; width: 320px; font: 700 22px/1 var(--pv-inter); letter-spacing: .12em; text-transform: uppercase; color: var(--pv-verde); }
.pv-fim__links span { font: 600 34px/1.25 var(--pv-inter); }

/* ── a régua de datas ── */
.pv-regua { position: absolute; left: 80px; right: 80px; top: 962px; height: 104px; transition: opacity .4s; }
.pv-regua[data-quieta] { opacity: .45; }
.pv-regua__faixa { position: absolute; left: 0; right: 0; top: 0; height: 26px; }
.pv-regua__faixa span {
  position: absolute; top: 0; height: 26px; box-sizing: border-box; padding: 0 12px; border-bottom: 6px solid var(--tom); color: var(--tom);
  font: 700 14px/18px var(--pv-inter); letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; overflow: hidden;
}
.pv-regua__faixa span[data-tom='verde'] { --tom: var(--pv-verde); }
.pv-regua__faixa span[data-tom='ambar'] { --tom: var(--pv-ambar); }
.pv-regua__faixa span[data-tom='verm'] { --tom: var(--pv-verm); }
.pv-regua__marcos { position: absolute; left: 0; right: 0; top: 20px; height: 84px; }
.pv-regua__marcos li { position: absolute; top: 0; width: 180px; margin-left: -90px; text-align: center; color: var(--pv-apagado); transition: color .5s; }
.pv-regua__marcos i { display: block; width: 4px; height: 16px; margin: 0 auto; border-radius: 2px; background: var(--pv-tinta2); }
.pv-regua__marcos b { display: block; margin-top: 2px; font-family: var(--pv-flex) !important; font-weight: 900; font-variation-settings: 'wdth' 30; font-size: 44px; line-height: 1; letter-spacing: -.01em; }
.pv-regua__marcos small { display: block; font: 600 15px/1.1 var(--pv-inter); letter-spacing: .06em; text-transform: uppercase; }
.pv-regua__marcos li[data-ativo] { color: var(--pv-tinta); }
.pv-regua__anel {
  position: absolute; top: 24px; width: 196px; height: 92px; margin-left: -98px; overflow: visible; opacity: 0; pointer-events: none;
  transition: left .9s cubic-bezier(.3, 0, .1, 1), opacity .4s;
}
.pv-regua__anel[data-visivel] { opacity: 1; }
.pv-regua__anel path { stroke-width: 5; vector-effect: non-scaling-stroke; }

/* ── fora do palco ── */
.pv-controles {
  position: fixed; left: 50%; bottom: 14px; z-index: 5; transform: translateX(-50%); display: flex; align-items: center; gap: 8px;
  padding: 7px 9px; border-radius: 999px; background: rgba(20, 17, 12, .82); border: 1px solid rgba(255, 255, 255, .16);
  opacity: 0; transition: opacity .25s;
}
.pv:hover .pv-controles, .pv-controles:focus-within { opacity: 1; }
.pv-controles button {
  min-width: 38px; height: 38px; padding: 0 12px; border: 0; border-radius: 999px; background: rgba(255, 255, 255, .12); color: #fff;
  font: 700 16px/1 'Inter Variable', Inter, sans-serif; cursor: pointer;
}
.pv-controles button:disabled { opacity: .4; cursor: default; }
.pv-controles button[aria-pressed='true'] { background: #fff; color: #14110c; }
.pv-controles button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.pv-controles .pv-controles__principal { min-width: 132px; background: #1f8449; }
.pv-controles__conta { min-width: 64px; text-align: center; color: #d8d3c8; font: 600 14px/1 'Inter Variable', Inter, sans-serif; font-variant-numeric: tabular-nums; }
.pv-cola {
  position: fixed; left: 50%; top: 14px; z-index: 5; transform: translateX(-50%); width: min(1100px, calc(100vw - 32px)); box-sizing: border-box;
  padding: 14px 20px; border-radius: 12px; background: rgba(20, 17, 12, .92); color: #f3eee4; font: 500 18px/1.45 'Inter Variable', Inter, sans-serif;
}
.pv-cola b { margin-right: 8px; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: #8fd3a8; }
.pv-dica {
  position: fixed; left: 50%; top: 14px; z-index: 5; transform: translateX(-50%); margin: 0; padding: 10px 18px; border-radius: 999px;
  background: rgba(20, 17, 12, .82); color: #d8d3c8; font: 500 14px/1.3 'Inter Variable', Inter, sans-serif; white-space: nowrap;
}
.pv-dica b { color: #fff; }

@media (prefers-reduced-motion: reduce) {
  .pv-tela, .pv-tela__camera, .pv-regua__anel, .pv-vai-enter-active, .pv-vai-leave-active, .pv-volta-enter-active, .pv-volta-leave-active { transition: none; }
  .pv-circulo path, .pv-tela__vivo i, .pv-veu__roda { animation: none; }
}
</style>

<style>
/* a apresentação ocupa a janela: a página por baixo não rola (o Vuetify deixa a barra sempre à vista) */
html.pv-aberta,
html.pv-aberta body { overflow: hidden !important; scrollbar-width: none; }
html.pv-aberta::-webkit-scrollbar { display: none; }
</style>
