import {
  FaCar,
  FaCalendarAlt,
  FaClipboardList,
  FaFileAlt,
  FaHashtag,
  FaIdCard,
  FaMapMarkerAlt,
  FaPhone,
  FaRegUser,
  FaShieldAlt,
  FaTools,
  FaUserTie,
} from 'react-icons/fa'

export const FORM_TYPES = {
  participacao: {
    id: 'participacao',
    label: 'Participação de Sinistro',
    shortLabel: 'Participação',
    description: 'Formulário principal de participação de sinistro automóvel.',
    pdfFile: '/formularios/participacao-sinistros.pdf',
    icon: FaFileAlt,
    color: '#1f8f5f',
    isPrimary: true,
  },
  roubo_acessorios: {
    id: 'roubo_acessorios',
    label: 'Roubo de Acessórios',
    shortLabel: 'Roubo Acessórios',
    description: 'Declaração complementar para roubo de acessórios do veículo.',
    pdfFile: '/formularios/Formulario Roubo Acessorios (2).pdf',
    icon: FaShieldAlt,
    color: '#c0392b',
    isPrimary: false,
  },
  vidro_parabrisas: {
    id: 'vidro_parabrisas',
    label: 'Sinistro Vidro / Parabrisas',
    shortLabel: 'Vidro / Parabrisas',
    description: 'Participação específica para danos em vidros e parabrisas.',
    pdfFile: '/formularios/FORMULARIO DE SINISTRO VIDRO PARABRISAS.PDF',
    icon: FaCar,
    color: '#2980b9',
    isPrimary: false,
  },
  acidentes_trabalho: {
    id: 'acidentes_trabalho',
    label: 'Acidentes de Trabalho',
    shortLabel: 'Acid. Trabalho',
    description: 'Formulário para acidentes de trabalho relacionados ao sinistro.',
    pdfFile: '/formularios/FORMULARIO DE ACIDENTES DE TRABALHO.PDF',
    icon: FaUserTie,
    color: '#8e44ad',
    isPrimary: false,
  },
}

const TIPO_SINISTRO_OPTS = [
  'Colisão',
  'Capotamento',
  'Roubo / Furto',
  'Incêndio',
  'Vidros / Parabrisas',
  'Danos por terceiros',
  'Outro',
]

const SIM_NAO = ['Sim', 'Não']

const DELEGACIA_OPTS = [
  '1ª Esquadra — Maputo Cidade',
  '2ª Esquadra — Maputo Cidade',
  '3ª Esquadra — Matola',
  'Delegacia Provincial — Gaza',
  'Delegacia Provincial — Inhambane',
  'Outra',
]

const TIPO_VIDRO_OPTS = [
  'Parabrisas dianteiro',
  'Vidro traseiro',
  'Vidro lateral esquerdo',
  'Vidro lateral direito',
  'Retrovisor',
  'Outro',
]

const OFICINA_OPTS = [
  'Oficina Imperial — Maputo',
  'Vidro Center — Matola',
  'Auto Glass MZ',
  'Outra oficina autorizada',
]

import { createEmptyParticipacaoMotorData } from './participacaoMotorSchema'

const GRAVIDADE_OPTS = ['Leve', 'Moderada', 'Grave', 'Muito grave']

function field(id, label, type, extra = {}) {
  return { id, label, type, ...extra }
}

export const FORM_FIELDS = {
  participacao: [],

  roubo_acessorios: [
    { section: 'Referência', icon: FaHashtag },
    field('numeroSinistro', 'Nº do sinistro', 'text', { icon: FaHashtag, required: true }),
    field('numeroApolice', 'Nº da apólice', 'text', { icon: FaHashtag, readOnly: true }),
    field('dataRoubo', 'Data do roubo', 'date', { icon: FaCalendarAlt, required: true }),
    field('horaRoubo', 'Hora aproximada', 'time', { icon: FaCalendarAlt }),

    { section: 'Segurado e veículo', icon: FaCar },
    field('nomeSegurado', 'Nome do segurado', 'text', { icon: FaRegUser, required: true }),
    field('matricula', 'Matrícula', 'text', { icon: FaCar, required: true }),
    field('marcaModelo', 'Marca / Modelo', 'text', { icon: FaCar }),

    { section: 'Acessórios roubados', icon: FaShieldAlt },
    field('localRoubo', 'Local do roubo', 'text', { icon: FaMapMarkerAlt, required: true }),
    field('listaAcessorios', 'Lista de acessórios roubados', 'textarea', { icon: FaClipboardList, required: true }),
    field('valorEstimado', 'Valor estimado (MT)', 'number', { icon: FaHashtag, numeric: true, min: 0 }),
    field('descricaoCircunstancias', 'Circunstâncias do roubo', 'textarea', { icon: FaClipboardList }),

    { section: 'Autoridades', icon: FaFileAlt },
    field('boletimOcorrencia', 'Registou B.O.?', 'select', { icon: FaFileAlt, options: SIM_NAO }),
    field('numeroBO', 'Nº do B.O.', 'text', { icon: FaHashtag }),
    field('delegacia', 'Delegacia', 'select', { icon: FaMapMarkerAlt, options: DELEGACIA_OPTS }),
  ],

  vidro_parabrisas: [
    { section: 'Referência', icon: FaHashtag },
    field('numeroSinistro', 'Nº do sinistro', 'text', { icon: FaHashtag, required: true }),
    field('numeroApolice', 'Nº da apólice', 'text', { icon: FaHashtag, readOnly: true }),
    field('dataDanos', 'Data dos danos', 'date', { icon: FaCalendarAlt, required: true }),

    { section: 'Segurado', icon: FaRegUser },
    field('nomeSegurado', 'Nome do segurado', 'text', { icon: FaRegUser, required: true }),
    field('contacto', 'Contacto', 'tel', { icon: FaPhone, numeric: true }),
    field('matricula', 'Matrícula', 'text', { icon: FaCar, required: true }),

    { section: 'Danos no vidro', icon: FaCar },
    field('tipoVidro', 'Tipo de vidro danificado', 'select', { icon: FaCar, options: TIPO_VIDRO_OPTS, required: true }),
    field('localDanos', 'Local dos danos', 'text', { icon: FaMapMarkerAlt }),
    field('descricaoDanos', 'Descrição dos danos', 'textarea', { icon: FaClipboardList, required: true }),
    field('causaDanos', 'Causa provável', 'select', { icon: FaClipboardList, options: ['Pedra / Detrito', 'Colisão', 'Vandalismo', 'Outro'] }),
    field('oficinaReparacao', 'Oficina de reparação', 'select', { icon: FaTools, options: OFICINA_OPTS }),
    field('valorEstimado', 'Valor estimado (MT)', 'number', { icon: FaHashtag, numeric: true, min: 0 }),
  ],

  acidentes_trabalho: [
    { section: 'Referência', icon: FaHashtag },
    field('numeroSinistro', 'Nº do sinistro', 'text', { icon: FaHashtag, required: true }),
    field('numeroApolice', 'Nº da apólice', 'text', { icon: FaHashtag, readOnly: true }),
    field('dataAcidente', 'Data do acidente', 'date', { icon: FaCalendarAlt, required: true }),
    field('horaAcidente', 'Hora do acidente', 'time', { icon: FaCalendarAlt }),

    { section: 'Empresa e trabalhador', icon: FaUserTie },
    field('empresa', 'Empresa / Entidade empregadora', 'text', { icon: FaUserTie, required: true }),
    field('nomeTrabalhador', 'Nome do trabalhador', 'text', { icon: FaRegUser, required: true }),
    field('cargo', 'Cargo / Função', 'text', { icon: FaUserTie }),
    field('biTrabalhador', 'BI do trabalhador', 'text', { icon: FaIdCard }),

    { section: 'Acidente', icon: FaClipboardList },
    field('localTrabalho', 'Local de trabalho', 'text', { icon: FaMapMarkerAlt, required: true }),
    field('descricaoAcidente', 'Descrição do acidente', 'textarea', { icon: FaClipboardList, required: true }),
    field('gravidadeLesao', 'Gravidade da lesão', 'select', { icon: FaClipboardList, options: GRAVIDADE_OPTS }),
    field('parteCorpo', 'Parte do corpo afetada', 'text', { icon: FaRegUser }),
    field('hospital', 'Hospital / Centro de saúde', 'text', { icon: FaMapMarkerAlt }),
    field('testemunhas', 'Testemunhas (nomes e contactos)', 'textarea', { icon: FaRegUser }),
    field('medidasTomadas', 'Medidas tomadas', 'textarea', { icon: FaClipboardList }),
  ],
}

export function getFormTypeList() {
  return Object.values(FORM_TYPES)
}

export function getPrimaryFormType() {
  return FORM_TYPES.participacao
}

export function getSupplementaryFormTypes() {
  return Object.values(FORM_TYPES).filter((f) => !f.isPrimary)
}

export function getFieldsForType(typeId) {
  return FORM_FIELDS[typeId] || []
}

export function createEmptyFormData(typeId, apolice = '') {
  if (typeId === 'participacao') {
    return createEmptyParticipacaoMotorData(apolice)
  }
  const fields = getFieldsForType(typeId)
  const data = {}
  fields.forEach((item) => {
    if (item.id) data[item.id] = ''
  })
  if (apolice) data.numeroApolice = apolice
  return data
}

export function mergeParticipacaoMotorData(existing = {}, apolice = '') {
  const empty = createEmptyParticipacaoMotorData(apolice || existing.numeroApolice || '')
  const mergeObj = (a, b) => ({ ...a, ...(b || {}) })
  const normalizePontosEmbate = (pontos) => (
    pontos && typeof pontos === 'object' && !Array.isArray(pontos) ? pontos : {}
  )
  return {
    ...empty,
    ...existing,
    feridoA: mergeObj(empty.feridoA, existing.feridoA),
    feridoB: mergeObj(empty.feridoB, existing.feridoB),
    seguradoA: mergeObj(empty.seguradoA, existing.seguradoA),
    seguradoB: mergeObj(empty.seguradoB, existing.seguradoB),
    condutorA: mergeObj(empty.condutorA, existing.condutorA),
    condutorB: mergeObj(empty.condutorB, existing.condutorB),
    circunstanciasA: mergeObj(empty.circunstanciasA, existing.circunstanciasA),
    circunstanciasB: mergeObj(empty.circunstanciasB, existing.circunstanciasB),
    pontosEmbateA: mergeObj(empty.pontosEmbateA, normalizePontosEmbate(existing.pontosEmbateA)),
    pontosEmbateB: mergeObj(empty.pontosEmbateB, normalizePontosEmbate(existing.pontosEmbateB)),
    feridosDetalhe: mergeObj(empty.feridosDetalhe, existing.feridosDetalhe),
    veiculoCaracteristicas: mergeObj(empty.veiculoCaracteristicas, existing.veiculoCaracteristicas),
  }
}

export function extractProcessDataFromForms(forms) {
  const primary = forms.find((f) => FORM_TYPES[f.typeId]?.isPrimary) || forms[0]
  if (!primary) return null
  const d = primary.data || {}

  if (primary.typeId === 'participacao' && d.dataAcidente !== undefined) {
    const cliente = [d.seguradoA?.apelidos, d.seguradoA?.nomes].filter(Boolean).join(' ')
      || [d.condutorA?.apelidos, d.condutorA?.nomes].filter(Boolean).join(' ')
    return {
      numeroSinistro: d.numeroSinistro || '',
      matricula: d.matriculaA || '',
      cliente,
      dataAcidente: d.dataAcidente || '',
      dataNotificacao: d.dataParticipacao || new Date().toISOString().slice(0, 10),
      descricao: (d.descricaoPormenorizada || '').slice(0, 500),
    }
  }

  return {
    numeroSinistro: d.numeroSinistro || '',
    matricula: d.matricula || '',
    cliente: d.nomeSegurado || d.nomeTrabalhador || '',
    dataAcidente: d.dataSinistro || d.dataRoubo || d.dataDanos || d.dataAcidente || '',
    dataNotificacao: d.dataNotificacao || new Date().toISOString().slice(0, 10),
    descricao: [
      d.descricaoSinistro,
      d.descricaoCircunstancias,
      d.descricaoDanos,
      d.descricaoAcidente,
      d.listaAcessorios,
    ]
      .filter(Boolean)
      .join(' | ')
      .slice(0, 500),
  }
}
