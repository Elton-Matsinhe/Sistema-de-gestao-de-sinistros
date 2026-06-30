import { getSession } from './auth'
import { createProcess, updateProcess, peekNextNumeroApolice } from './processes'
import {
  createEmptyFormData,
  extractProcessDataFromForms,
  FORM_TYPES,
  getPrimaryFormType,
} from './participacaoFormConfig'

export const PARTICIPACOES_KEY = 'sgs_participacoes'

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getParticipacoes() {
  const raw = localStorage.getItem(PARTICIPACOES_KEY)
  if (!raw) return []
  const parsed = safeParse(raw)
  return Array.isArray(parsed) ? parsed : []
}

function saveParticipacoes(list) {
  localStorage.setItem(PARTICIPACOES_KEY, JSON.stringify(list))
}

export function getParticipacaoById(id) {
  return getParticipacoes().find((p) => p.id === id) || null
}

export function createParticipacaoDraft() {
  const primary = getPrimaryFormType()
  const apolice = peekNextNumeroApolice()
  const empty = createEmptyFormData(primary.id, apolice)

  return {
    id: `part_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: 'rascunho',
    processoId: null,
    numeroSinistro: '',
    forms: [
      {
        id: `form_${Date.now()}_main`,
        typeId: primary.id,
        data: empty,
        assinaturaCliente: null,
        assinadoEm: '',
      },
    ],
    criadoPor: getSession()?.name || getSession()?.email || 'Utilizador',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  }
}

export function addFormToParticipacao(participacao, typeId) {
  if (participacao.forms.some((f) => f.typeId === typeId)) {
    return participacao
  }
  const apolice = participacao.forms[0]?.data?.numeroApolice || peekNextNumeroApolice()
  const empty = createEmptyFormData(typeId)
  empty.numeroApolice = apolice
  empty.numeroSinistro = participacao.numeroSinistro || participacao.forms[0]?.data?.numeroSinistro || ''

  return {
    ...participacao,
    forms: [
      ...participacao.forms,
      {
        id: `form_${Date.now()}_${typeId}`,
        typeId,
        data: empty,
        assinaturaCliente: null,
        assinadoEm: '',
      },
    ],
    atualizadoEm: new Date().toISOString(),
  }
}

export function removeFormFromParticipacao(participacao, formId) {
  const form = participacao.forms.find((f) => f.id === formId)
  if (!form || FORM_TYPES[form.typeId]?.isPrimary) return participacao
  return {
    ...participacao,
    forms: participacao.forms.filter((f) => f.id !== formId),
    atualizadoEm: new Date().toISOString(),
  }
}

export function updateParticipacaoFormData(participacao, formId, fieldId, value) {
  return {
    ...participacao,
    forms: participacao.forms.map((f) => {
      if (f.id !== formId) return f
      return { ...f, data: { ...f.data, [fieldId]: value } }
    }),
    atualizadoEm: new Date().toISOString(),
  }
}

export function updateParticipacaoAssinatura(participacao, formId, assinaturaCliente) {
  return {
    ...participacao,
    forms: participacao.forms.map((f) => {
      if (f.id !== formId) return f
      return {
        ...f,
        assinaturaCliente,
        assinadoEm: assinaturaCliente ? new Date().toISOString() : '',
      }
    }),
    atualizadoEm: new Date().toISOString(),
  }
}

export function setParticipacaoNumeroSinistro(participacao, numeroSinistro) {
  return {
    ...participacao,
    numeroSinistro,
    forms: participacao.forms.map((f) => ({
      ...f,
      data: { ...f.data, numeroSinistro },
    })),
    atualizadoEm: new Date().toISOString(),
  }
}

export function saveParticipacao(participacao) {
  const current = getParticipacoes()
  const idx = current.findIndex((p) => p.id === participacao.id)
  const next = { ...participacao, atualizadoEm: new Date().toISOString() }
  if (idx >= 0) {
    const updated = [...current]
    updated[idx] = next
    saveParticipacoes(updated)
  } else {
    saveParticipacoes([next, ...current])
  }
  return next
}

export function finalizeParticipacao(participacao) {
  const numeroSinistro =
    participacao.numeroSinistro ||
    participacao.forms[0]?.data?.numeroSinistro ||
    `SIN-${Date.now().toString().slice(-6)}`

  const withSinistro = setParticipacaoNumeroSinistro(participacao, numeroSinistro)
  const processPayload = extractProcessDataFromForms(withSinistro.forms)

  let processoId = withSinistro.processoId
  if (!processoId && processPayload) {
    const proc = createProcess({
      ...processPayload,
      numeroSinistro,
      descricao: `[Participação] ${processPayload.descricao || 'Registo via formulário de participação.'}`,
    })
    processoId = proc.id
  } else if (processoId && processPayload) {
    updateProcess(processoId, {
      numeroSinistro,
      matricula: processPayload.matricula,
      cliente: processPayload.cliente,
      dataAcidente: processPayload.dataAcidente,
      dataNotificacao: processPayload.dataNotificacao,
      descricao: `[Participação] ${processPayload.descricao || ''}`,
    })
  }

  const finalized = {
    ...withSinistro,
    processoId,
    status: 'submetida',
    submetidaEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  }
  saveParticipacao(finalized)
  return finalized
}

export function deleteParticipacao(id) {
  const current = getParticipacoes()
  saveParticipacoes(current.filter((p) => p.id !== id))
}

export function getParticipacaoSummary(participacao) {
  const primary = participacao.forms.find((f) => FORM_TYPES[f.typeId]?.isPrimary) || participacao.forms[0]
  const d = primary?.data || {}
  const tipos = participacao.forms.map((f) => FORM_TYPES[f.typeId]?.shortLabel || f.typeId).join(', ')

  let cliente = '—'
  let matricula = '—'
  if (primary?.typeId === 'participacao' && d.seguradoA) {
    cliente = [d.seguradoA.apelidos, d.seguradoA.nomes].filter(Boolean).join(' ') || '—'
    matricula = d.matriculaA || '—'
  } else {
    cliente = d.nomeSegurado || d.nomeTrabalhador || '—'
    matricula = d.matricula || '—'
  }

  return {
    numeroSinistro: participacao.numeroSinistro || d.numeroSinistro || '—',
    cliente,
    matricula,
    tiposFormulario: tipos,
    status: participacao.status,
    criadoEm: participacao.criadoEm,
    submetidaEm: participacao.submetidaEm || '',
    processoId: participacao.processoId,
    formCount: participacao.forms.length,
  }
}
