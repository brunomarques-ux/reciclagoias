/** Dados da apresentação web do Recicla Goiás. */

export type ProfileKey = 'eg' | 'admin' | 'vr' | 'op';

export const PROFILES: Record<ProfileKey, { label: string; icon: string }> = {
  eg: {
    label: 'ENTIDADE GESTORA',
    icon: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  },
  admin: {
    label: 'ADMINISTRADOR',
    icon: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  },
  vr: {
    label: 'VERIFICADOR DE RESULTADOS',
    icon: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  },
  op: {
    label: 'OPERADOR LOGÍSTICO',
    icon: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  },
};

/** Ícones (inner SVG) dos perfis no slide de Perfis. */
export const PERFIS = [
  { name: 'Entidade Gestora', role: 'Orquestra o sistema coletivo e cria os planos de logística reversa.', icon: PROFILES.eg.icon },
  { name: 'Admin', role: 'Governa o sistema: aprova cadastros, perfis e desbloqueia empresas.', icon: PROFILES.admin.icon },
  { name: 'Verificador de Resultados', role: 'Audita e homologa as notas fiscais, garantindo a unicidade das massas.', icon: PROFILES.vr.icon },
  { name: 'Operador Logístico', role: 'Registra a operação e a rastreabilidade do material até o destino final.', icon: PROFILES.op.icon },
];

/** Ícones (inner SVG) dos nós da linha do tempo, por marco. */
export const TL_ICONS = [
  '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 18v-2"/><path d="M12 18v-4"/><path d="M16 18v-6"/>',
  '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
];
export const TL_LABELS = ['Mapeamento', 'Módulo Planos', 'Módulo Admin', 'Relatório · VR', 'Operador Logístico'];
export const TL_DATES = ['Out–Dez 2023', 'Out 2024', 'Jan 2025', 'Fev 2025', 'Jan 2026'];

export interface Bullet { name: string; desc?: string; hi?: boolean; tag?: string }
export interface Marco { eyebrow: string; title: string; accent: string; dateShort: string; lede: string; bullets: Bullet[] }

export const MARCOS: Marco[] = [
  { eyebrow: 'MARCO 01 · OUTUBRO A DEZEMBRO DE 2023', title: 'Mapeamento do processo', accent: 'processo', dateShort: 'Out–Dez 2023',
    lede: 'O entendimento ponta a ponta da logística reversa em Goiás e o desenho do sistema.',
    bullets: [{ name: 'Mapeamento e entendimento do processo', desc: 'da logística reversa do estado' }, { name: 'Prototipação de todo o sistema inicial', hi: true, tag: 'DESTAQUE' }] },
  { eyebrow: 'MARCO 02 · OUTUBRO DE 2024', title: 'Módulo Planos', accent: 'Planos', dateShort: 'Out 2024',
    lede: 'O primeiro módulo do sistema: onde a entidade gestora cria o seu plano de logística reversa.',
    bullets: [{ name: 'Criação do plano de logística reversa', desc: 'pela entidade gestora', hi: true, tag: 'O QUE É' }, { name: 'Reúne metas, ações e empresas aderentes', desc: 'em um único fluxo' }] },
  { eyebrow: 'MARCO 03 · JANEIRO DE 2025', title: 'Módulo Admin', accent: 'Admin', dateShort: 'Jan 2025',
    lede: 'O painel de governança do sistema e suas funcionalidades de controle.',
    bullets: [{ name: 'Aprovação de empresas e perfis de acesso' }, { name: 'Autorização de empresas bloqueadas', desc: 'e demais ações administrativas' }, { name: 'Configuração dos parâmetros gerais', desc: 'do sistema' }] },
  { eyebrow: 'MARCO 04 · FEVEREIRO DE 2025', title: 'Relatório e Verificador', accent: 'Verificador', dateShort: 'Fev 2025',
    lede: 'O modelo de relatório anual e a chegada do perfil de Verificador de Resultados.',
    bullets: [{ name: 'Modelo de relatório anual de desempenho' }, { name: 'Perfil do Verificador de Resultados', desc: 'audita e homologa as notas', hi: true, tag: 'NOVO PERFIL' }] },
  { eyebrow: 'MARCO 05 · JANEIRO DE 2026', title: 'Operador Logístico', accent: 'Logístico', dateShort: 'Jan 2026',
    lede: 'O marco mais recente: o perfil de Operador Logístico, que devolve o material ao ciclo.',
    bullets: [{ name: 'Perfil do Operador Logístico', hi: true, tag: 'NOVO PERFIL' }, { name: 'Registro da operação e rastreabilidade', desc: 'do material até o destino final' }] },
];

const NADM = 'Mesma visualização no perfil Admin.';
const NPDF = 'Nesta tela é possível exportar o PDF do resumo.';
const B = '/apresentacao/';

export type Slide =
  | { kind: 'capa' | 'intro' | 'perfis' | 'agradecimento'; steps?: number }
  | { kind: 'timeline'; steps: number }
  | { kind: 'screen'; profile: ProfileKey; image: string; title: string; desc: string; notes?: string[]; portrait?: boolean; steps?: number };

export const SLIDES: Slide[] = [
  { kind: 'capa' },
  { kind: 'intro' },
  { kind: 'perfis' },
  { kind: 'timeline', steps: 5 },
  // Entidade Gestora
  { kind: 'screen', profile: 'eg', image: B + 'home-eg.png', title: 'Painel inicial', desc: 'A tela inicial reúne prazos, status de planos, relatórios e certificados em um só lugar, com gráficos de acompanhamento.' },
  { kind: 'screen', profile: 'eg', image: B + 'listagem-planos.png', title: 'Listagem de planos', desc: 'Todos os planos da gestora, com ano, status e ações disponíveis.', notes: [NADM] },
  { kind: 'screen', profile: 'eg', image: B + 'incluir-plano.png', title: 'Incluir plano', desc: 'Assistente em 6 etapas para a gestora criar um plano: dados gerais, responsável, ações, empresas e metas.' },
  { kind: 'screen', profile: 'eg', image: B + 'resumo-plano-1.png', title: 'Resumo do plano · 1/2', desc: 'Síntese consolidada do plano de logística reversa, com dados e imagens, para conferência.', notes: [NPDF], portrait: true },
  { kind: 'screen', profile: 'eg', image: B + 'resumo-plano-2.png', title: 'Resumo do plano · 2/2', desc: 'Continuação do resumo consolidado do plano.', notes: [NPDF], portrait: true },
  { kind: 'screen', profile: 'eg', image: B + 'listagem-relatorios.png', title: 'Listagem de relatórios', desc: 'Relatórios anuais enviados, organizados por ano-base e situação.' },
  { kind: 'screen', profile: 'eg', image: B + 'incluir-relatorio.png', title: 'Incluir relatório', desc: 'Preenchimento do relatório anual de desempenho, passo a passo.' },
  { kind: 'screen', profile: 'eg', image: B + 'detalhes-relatorio.png', title: 'Detalhes do relatório', desc: 'As notas fiscais e os certificados vinculados ao relatório anual de desempenho.' },
  { kind: 'screen', profile: 'eg', image: B + 'resumo-relatorio-1.png', title: 'Resumo do relatório · 1/2', desc: 'Síntese consolidada do relatório anual para conferência final.', notes: [NADM, NPDF], portrait: true },
  { kind: 'screen', profile: 'eg', image: B + 'resumo-relatorio-2.png', title: 'Resumo do relatório · 2/2', desc: 'Continuação do resumo consolidado do relatório anual.', notes: [NADM, NPDF], portrait: true },
  { kind: 'screen', profile: 'eg', image: B + 'certificados-massa.png', title: 'Certificados de massa', desc: 'Certificados RECICLAGOIÁS de massa emitidos, com quantidade e situação.' },
  { kind: 'screen', profile: 'eg', image: B + 'visualizacao-certificado.png', title: 'Visualização do certificado', desc: 'O certificado RECICLAGOIÁS emitido, pronto para conferência e download.', portrait: true },
  { kind: 'screen', profile: 'eg', image: B + 'nao-conformidade.png', title: 'Não conformidade', desc: 'Apontamentos e justificativas de não conformidade do plano ou do relatório.', notes: [NADM] },
  { kind: 'screen', profile: 'eg', image: B + 'operadores-massa.png', title: 'Operadores e massa', desc: 'Operadores vinculados ao plano e a massa recuperada por cada um.', notes: [NADM] },
  // Admin
  { kind: 'screen', profile: 'admin', image: B + 'home-admin.png', title: 'Painel do administrador', desc: 'Visão geral de governança do sistema: cadastros, aprovações, indicadores e prazos.' },
  { kind: 'screen', profile: 'admin', image: B + 'parametros-admin.png', title: 'Parâmetros gerais', desc: 'Configuração dos parâmetros gerais do sistema, como prazos e regras de operação.' },
  { kind: 'screen', profile: 'admin', image: B + 'justificativa-admin.png', title: 'Detalhe da justificativa', desc: 'Análise da justificativa enviada, para aprovação ou recusa pelo administrador.', portrait: true },
  // Verificador
  { kind: 'screen', profile: 'vr', image: B + 'home-vr.png', title: 'Painel do verificador', desc: 'Visão geral das notas a homologar e do andamento da verificação.' },
  { kind: 'screen', profile: 'vr', image: B + 'listagem-notas-vr.png', title: 'Listagem de notas', desc: 'Notas fiscais para validação e homologação, com a situação de cada uma.' },
  { kind: 'screen', profile: 'vr', image: B + 'resumo-relatorio-vr.png', title: 'Resumo do relatório', desc: 'O relatório sob análise do verificador para a emissão do parecer.', portrait: true },
  // Operador
  { kind: 'screen', profile: 'op', image: B + 'home-op.png', title: 'Painel do operador', desc: 'Visão geral da operação: saldo de massa, certificados e movimentações recentes.' },
  { kind: 'screen', profile: 'op', image: B + 'emitir-certificado-op.png', title: 'Emitir certificado', desc: 'Emissão do certificado a partir da massa recuperada e das notas fiscais.' },
  { kind: 'screen', profile: 'op', image: B + 'visualizar-certificado-op.png', title: 'Visualizar certificado', desc: 'Detalhe do certificado emitido pelo operador.', notes: [NADM], portrait: true },
  { kind: 'screen', profile: 'op', image: B + 'extrato-op.png', title: 'Extrato', desc: 'Extrato de movimentações de massa e de certificados do operador.', portrait: true },
  { kind: 'screen', profile: 'op', image: B + 'visualizar-saldo-op.png', title: 'Visualizar saldo', desc: 'Saldo de massa disponível do operador, por material reciclável.' },
  { kind: 'agradecimento' },
];
