/**
 * Consulta de Regularidade por CNPJ — dados mockados do protótipo.
 *
 * A "base" tem duas empresas fictícias (uma regular, uma com pendências);
 * qualquer outro CNPJ válido resulta em "não encontrado". As certidões
 * são indexadas pelo código de autenticação pra tela de validação
 * (/consulta/validar), que também recebe o código via QR (query ?codigo=).
 */

export type ConsultaStatus = 'regular' | 'pendencia' | 'nao-encontrado';

export interface Pendencia {
  icon: string;
  title: string;
  description: string;
  /** Texto após o prefixo "Como resolver:" (o prefixo é fixo no layout). */
  howToFix: string;
}

export interface ConsultaEmpresa {
  cnpj: string;
  razaoSocial: string;
  municipioUf: string;
  perfil: string;
  status: Exclude<ConsultaStatus, 'nao-encontrado'>;
  /** Código de autenticação da certidão/relatório emitido pra esta empresa. */
  codigoAutenticacao: string;
  pendencias?: Pendencia[];
}

export interface CertidaoInfo {
  codigo: string;
  tipo: 'certidao-regular' | 'relatorio-pendencias';
  empresa: ConsultaEmpresa;
}

// ============ Empresas na base ============

export const empresaRegular: ConsultaEmpresa = {
  cnpj: '12.345.678/0001-90',
  razaoSocial: 'EMBALAGENS GOIÁS INDÚSTRIA E COMÉRCIO LTDA',
  municipioUf: 'Goiânia/GO',
  perfil: 'Empresa aderente',
  status: 'regular',
  codigoAutenticacao: 'RG-2026-4F8A-2C7B-90D1',
};

export const empresaPendencia: ConsultaEmpresa = {
  cnpj: '98.765.432/0001-10',
  razaoSocial: 'EMBALAGENS CERRADO INDÚSTRIA E COMÉRCIO LTDA',
  municipioUf: 'Anápolis/GO',
  perfil: 'Empresa aderente',
  status: 'pendencia',
  codigoAutenticacao: 'RG-2026-9B12-7E44-AA03',
  pendencias: [
    {
      icon: 'mdi-file-alert-outline',
      title: 'Adesão não localizada para o ano base vigente',
      description:
        'Não há adesão ativa a um sistema de logística reversa, coletivo ou individual, registrado na SEMAD para o ano base atual (2025).',
      howToFix:
        'adira a uma entidade gestora ou estruture um sistema individual e registre na SEMAD.',
    },
    {
      icon: 'mdi-chart-bar',
      title: 'Metas de recuperação do ano base 2024 não comprovadas',
      description:
        'A massa equivalente de embalagens exigida para o ano-base ainda não foi comprovada por certificados RECICLAGOIÁS.',
      howToFix:
        'adquira certificados RECICLAGOIÁS suficientes junto à sua entidade gestora.',
    },
    {
      icon: 'mdi-calendar-clock',
      title: 'Relatório anual em atraso',
      description:
        'O relatório anual de desempenho consolida as comprovações do ano e deve ser entregue até 31 de março. Consta como não entregue.',
      howToFix: 'gere e envie o relatório anual dentro do sistema.',
    },
    {
      icon: 'mdi-file-document-outline',
      title: 'Certificados RECICLAGOIÁS insuficientes para as metas',
      description:
        'A quantidade de certificados vinculados à empresa não cobre a meta do ano-base. Cada certificado só pode ser usado uma vez.',
      howToFix: 'complete o volume de certificados antes do fechamento do ano-base.',
    },
  ],
};

// ============ Lookups ============

/** Remove tudo que não é dígito — busca e comparação usam só números. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Aplica a máscara 00.000.000/0000-00 progressivamente (pra digitação). */
export function maskCnpj(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  let out = d;
  if (d.length > 2) out = `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length > 5) out = `${out.slice(0, 6)}.${d.slice(5)}`;
  if (d.length > 8) out = `${out.slice(0, 10)}/${d.slice(8)}`;
  if (d.length > 12) out = `${out.slice(0, 15)}-${d.slice(12)}`;
  return out;
}

const empresas: ConsultaEmpresa[] = [empresaRegular, empresaPendencia];

/** Busca por CNPJ (qualquer formatação). Null = não consta na base. */
export function findEmpresaByCnpj(cnpj: string): ConsultaEmpresa | null {
  const digits = onlyDigits(cnpj);
  return empresas.find((e) => onlyDigits(e.cnpj) === digits) ?? null;
}

/** Normaliza código de autenticação: caixa alta, sem espaços. */
export function normalizeCodigo(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

/** Valida um código de autenticação. Null = documento não localizado. */
export function findCertidaoByCodigo(codigo: string): CertidaoInfo | null {
  const code = normalizeCodigo(codigo);
  for (const empresa of empresas) {
    if (normalizeCodigo(empresa.codigoAutenticacao) === code) {
      return {
        codigo: empresa.codigoAutenticacao,
        tipo: empresa.status === 'regular' ? 'certidao-regular' : 'relatorio-pendencias',
        empresa,
      };
    }
  }
  return null;
}

// ============ Etapas da varredura (loading) ============

export interface VarreduraStep {
  icon: string;
  title: string;
  helper: string;
}

export const varreduraSteps: VarreduraStep[] = [
  {
    icon: 'mdi-office-building-outline',
    title: 'Localizando a empresa',
    helper: 'Buscando o CNPJ na base do Recicla Goiás.',
  },
  {
    icon: 'mdi-shield-check-outline',
    title: 'Verificando a adesão',
    helper: 'Conferindo o vínculo a um sistema de logística reversa registrado na SEMAD.',
  },
  {
    icon: 'mdi-file-document-outline',
    title: 'Conferindo metas e certificados',
    helper: 'Checando as metas de recuperação e os certificados RECICLAGOIÁS.',
  },
  {
    icon: 'mdi-check-circle-outline',
    title: 'Emitindo o resultado',
    helper: 'Preparando a situação cadastral da empresa.',
  },
];
