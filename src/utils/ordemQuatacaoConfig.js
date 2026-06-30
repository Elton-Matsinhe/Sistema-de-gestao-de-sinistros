export const ORDEM_DOC_TYPES = {
  ordem_reparacao: {
    id: 'ordem_reparacao',
    label: 'Autorização de Reparação',
    shortLabel: 'Ordem de Reparação',
    pdfTitle: 'AUTORIZAÇÃO DE REPARAÇÃO',
    filePrefix: 'Ordem-Reparacao',
    color: '#1f8f5f',
  },
  quitacao: {
    id: 'quitacao',
    label: 'Quitação',
    shortLabel: 'Quitação',
    pdfTitle: 'QUITAÇÃO',
    subtitle: 'SEM PREJUÍZO',
    filePrefix: 'Quitacao',
    color: '#116142',
  },
}

export const ORDEM_REPARACAO_SECTIONS = [
  {
    title: 'Oficina',
    fields: [
      { id: 'oficina', label: 'Oficina' },
    ],
  },
  {
    title: 'Detalhes da cotação',
    fields: [
      { id: 'numeroReferencia', label: 'Número de referência' },
      { id: 'dataCotacao', label: 'Data da cotação', type: 'date' },
    ],
  },
  {
    title: 'Detalhes do cliente',
    fields: [
      { id: 'pessoaContacto', label: 'Pessoa de contacto' },
      { id: 'numeroApolice', label: 'Número da apólice' },
    ],
  },
  {
    title: 'Detalhes do veículo',
    fields: [
      { id: 'marcaModelo', label: 'Marca / Modelo' },
      { id: 'numeroRegistro', label: 'Número de registo' },
    ],
  },
  {
    title: 'Detalhes da reivindicação',
    fields: [
      { id: 'numeroSinistro', label: 'Número do sinistro' },
      { id: 'franquia', label: 'Franquia' },
    ],
  },
  {
    title: 'Valor acordado para reparação',
    fields: [
      { id: 'valorCotacao', label: 'Valor da cotação', type: 'currency' },
      { id: 'valorLiquidoUnicar', label: 'Valor líquido a pagar UNICAR', type: 'currency' },
    ],
  },
]

export const QUITACAO_FIELDS = [
  { id: 'segurado', label: 'Segurado' },
  { id: 'beneficiario', label: 'Beneficiário' },
  { id: 'numeroSinistro', label: 'Número do sinistro' },
  { id: 'dataSinistro', label: 'Data do sinistro', type: 'date' },
  { id: 'circunstancias', label: 'Circunstâncias', type: 'textarea' },
  { id: 'marcaMatricula', label: 'Marca / Matrícula' },
  { id: 'valorFatura', label: 'Valor da fatura', type: 'currency' },
  { id: 'valorFranquia', label: 'Valor da franquia', type: 'currency' },
  { id: 'valorIndemnizar', label: 'Valor a indemnizar', type: 'currency' },
  { id: 'localDocumento', label: 'Local do documento', default: 'Maputo' },
  { id: 'dataDocumento', label: 'Data do documento', type: 'date' },
]

export const QUITACAO_DECLARACAO = (valorFormatado) => {
  const montante = valorFormatado?.trim() || '___________'
  const sufixo = /mzn/i.test(montante) ? '' : ' MZN'
  return `Com base na presente quitação emitida pela Imperial Insurance Moçambique, S.A., cujo montante é de ${montante}${sufixo}, o segurado declara aceitar o pagamento da mesma.`
}

export const QUITACAO_IMPORTANTE =
  'A Imperial Insurance Moçambique S.A. fica por esta forma desobrigada de toda e qualquer responsabilidade adveniente dos danos sofridos e de toda e qualquer despesa suportada ou a suportar em virtude do sinistro acima referido ou das suas consequências.'

export const ORDEM_NOTA_FRANQUIA =
  'Nota: O pagamento da franquia deverá ser feito directamente na oficina pelo cliente.'

export function createEmptyOrdemReparacaoData(process = {}) {
  return {
    oficina: process.oficina || '',
    numeroReferencia: '',
    dataCotacao: '',
    pessoaContacto: process.cliente || '',
    numeroApolice: process.numeroApolice || '',
    marcaModelo: '',
    numeroRegistro: process.matricula || '',
    numeroSinistro: process.numeroSinistro || '',
    franquia: '',
    valorCotacao: '',
    valorLiquidoUnicar: '',
    autorizadoPor: '',
    dataAutorizacao: new Date().toISOString().slice(0, 10),
    assinaturaGestor: null,
    assinaturaDeclarante: null,
  }
}

export function createEmptyQuitacaoData(process = {}) {
  return {
    segurado: process.cliente || '',
    beneficiario: process.cliente || '',
    numeroSinistro: process.numeroSinistro || '',
    dataSinistro: process.dataAcidente || '',
    circunstancias: '',
    marcaMatricula: process.matricula || '',
    valorFatura: '',
    valorFranquia: '',
    valorIndemnizar: '',
    localDocumento: 'Maputo',
    dataDocumento: new Date().toISOString().slice(0, 10),
    diaAssinatura: '',
    mesAssinatura: '',
    anoAssinatura: String(new Date().getFullYear()),
    assinaturaDeclarante: null,
    assinaturaGestor: null,
    autorizadoPor: '',
    dataAutorizacao: new Date().toISOString().slice(0, 10),
  }
}

export function getOrdemSectionsForType(typeId) {
  if (typeId === 'ordem_reparacao') return ORDEM_REPARACAO_SECTIONS
  return null
}

export function collectFilledRows(typeId, data) {
  const rows = []
  const push = (section, label, value) => {
    if (value === null || value === undefined || String(value).trim() === '') return
    rows.push({ section, label, value: String(value).trim() })
  }

  if (typeId === 'ordem_reparacao') {
    ORDEM_REPARACAO_SECTIONS.forEach((sec) => {
      sec.fields.forEach((f) => push(sec.title, f.label, data[f.id]))
    })
    return rows
  }

  if (typeId === 'quitacao') {
    QUITACAO_FIELDS.forEach((f) => push('Dados da quitação', f.label, data[f.id]))
    return rows
  }

  return rows
}
