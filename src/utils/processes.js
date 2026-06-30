import { getSession } from './auth'

export const PROCESSOS_KEY = 'sgs_processos'
export const HISTORICO_KEY = 'sgs_historico_processos'
export const APOLICE_SEQ_KEY = 'sgs_apolice_seq'
const APOLICE_PREFIX = 'CLAIM'

function parseClaimSequence(numeroApolice) {
  const match = String(numeroApolice || '').match(/^CLAIM-(\d+)$/i)
  return match ? parseInt(match[1], 10) : 0
}

function syncApoliceSequence() {
  const stored = parseInt(localStorage.getItem(APOLICE_SEQ_KEY) || '0', 10)
  const raw = localStorage.getItem(PROCESSOS_KEY)
  let max = Number.isFinite(stored) ? stored : 0
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          const value = parseClaimSequence(item?.numeroApolice)
          if (value > max) max = value
        })
      }
    } catch {
      // ignora JSON inválido
    }
  }
  localStorage.setItem(APOLICE_SEQ_KEY, String(max))
  return max
}

export function peekNextNumeroApolice() {
  const next = syncApoliceSequence() + 1
  return `${APOLICE_PREFIX}-${String(next).padStart(4, '0')}`
}

export function allocateNumeroApolice() {
  const next = syncApoliceSequence() + 1
  localStorage.setItem(APOLICE_SEQ_KEY, String(next))
  return `${APOLICE_PREFIX}-${String(next).padStart(4, '0')}`
}

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function withProcessDefaults(item) {
  return {
    numeroApolice: '',
    peritoSolicitado: false,
    peritoNome: '',
    peritagemRelatorio: null,
    peritagemData: '',
    peritagemFormulario: null,
    peritagemMateriais: null,
    peritagemFotos: null,
    peritagemEnviado: false,
    peritagemEnviadoData: '',
    ordemReparacaoDocumento: null,
    ordemReparacaoDataUpload: '',
    enviadoGestor: false,
    enviadoGestorData: '',
    gestorAssinaturaMeta: null,
    gestorAssinadoDocumento: null,
    gestorAssinadoData: '',
    gestorAssinadoPor: '',
    aprovacaoGestorNome: '',
    aprovacaoGestorData: '',
    enviadoContabilidade: false,
    enviadoContabilidadeData: '',
    comprovativoPagamentoDocumento: null,
    comprovativoPagamentoData: '',
    comprovativoPagamentoPor: '',
    juridicoMotivo: '',
    juridicoCartaResumo: '',
    juridicoDataCarta: '',
    juridicoCartaDocumento: null,
    juridicoCartaEmitida: false,
    ...item,
  }
}

function normalizeHeavySignedPayload(item) {
  const next = { ...item }
  const signed = next.gestorAssinadoDocumento
  const original = next.ordemReparacaoDocumento
  if (!signed) return next
  if (signed?.dataUrl && original?.dataUrl && signed.dataUrl === original.dataUrl) {
    const { dataUrl, ...signedWithoutData } = signed
    next.gestorAssinadoDocumento = signedWithoutData
  }
  if (
    next.gestorAssinaturaMeta?.assinaturaImagem &&
    next.gestorAssinadoDocumento?.assinaturaDigital?.imagemDataUrl &&
    next.gestorAssinaturaMeta.assinaturaImagem === next.gestorAssinadoDocumento.assinaturaDigital.imagemDataUrl
  ) {
    const { imagemDataUrl, ...signatureWithoutImage } = next.gestorAssinadoDocumento.assinaturaDigital
    next.gestorAssinadoDocumento = {
      ...next.gestorAssinadoDocumento,
      assinaturaDigital: signatureWithoutImage,
    }
  }
  return next
}

export function getProcesses() {
  const raw = localStorage.getItem(PROCESSOS_KEY)
  if (!raw) return []
  const parsed = safeParse(raw)
  if (!Array.isArray(parsed)) return []
  const normalized = parsed.map((item) => normalizeHeavySignedPayload(withProcessDefaults(item)))
  const changed = normalized.some((item, index) => JSON.stringify(item) !== JSON.stringify(parsed[index]))
  if (changed) saveProcesses(normalized)
  return normalized
}

export function saveProcesses(processes) {
  try {
    localStorage.setItem(PROCESSOS_KEY, JSON.stringify(processes))
  } catch (error) {
    const message = String(error?.message || '')
    if (message.toLowerCase().includes('quota')) {
      throw new Error('Storage quota exceeded')
    }
    throw error
  }
}

export function getHistory() {
  const raw = localStorage.getItem(HISTORICO_KEY)
  if (!raw) return []
  const parsed = safeParse(raw)
  return Array.isArray(parsed) ? parsed : []
}

function appendHistory(acao, processoId) {
  const session = getSession()
  const current = getHistory()
  const item = {
    id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    processoId,
    acao,
    usuario: session?.name || session?.email || 'Utilizador',
    data: new Date().toISOString(),
  }
  localStorage.setItem(HISTORICO_KEY, JSON.stringify([item, ...current]))
}

export function createProcess(payload) {
  const current = getProcesses()
  const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const numeroApolice = payload.numeroApolice || allocateNumeroApolice()
  const process = {
    id,
    numeroSinistro: payload.numeroSinistro,
    numeroApolice,
    matricula: payload.matricula,
    cliente: payload.cliente,
    dataAcidente: payload.dataAcidente,
    dataNotificacao: payload.dataNotificacao,
    descricao: payload.descricao,
    oficina: '',
    numeroFactura: '',
    dataFactura: '',
    perito: '',
    premioPago: '',
    dataPagamento: '',
    responsavelCredit: '',
    dataRegistoCredit: '',
    peritoSolicitado: false,
    peritoNome: '',
    peritagemRelatorio: null,
    peritagemData: '',
    peritagemFormulario: null,
    peritagemMateriais: null,
    peritagemFotos: null,
    peritagemEnviado: false,
    peritagemEnviadoData: '',
    ordemReparacaoDocumento: null,
    ordemReparacaoDataUpload: '',
    enviadoGestor: false,
    enviadoGestorData: '',
    gestorAssinaturaMeta: null,
    gestorAssinadoDocumento: null,
    gestorAssinadoData: '',
    gestorAssinadoPor: '',
    aprovacaoGestorNome: '',
    aprovacaoGestorData: '',
    enviadoContabilidade: false,
    enviadoContabilidadeData: '',
    comprovativoPagamentoDocumento: null,
    comprovativoPagamentoData: '',
    comprovativoPagamentoPor: '',
    juridicoMotivo: '',
    juridicoCartaResumo: '',
    juridicoDataCarta: '',
    juridicoCartaDocumento: null,
    juridicoCartaEmitida: false,
    status: 'Iniciado',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  saveProcesses([process, ...current])
  appendHistory(`Sinistro criou processo ${payload.numeroSinistro}`, id)
  return process
}

export function updateProcess(id, updates) {
  const current = getProcesses()
  const next = current.map((p) =>
    p.id === id
      ? {
          ...p,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      : p,
  )
  saveProcesses(next)
  if (updates?.numeroSinistro) {
    appendHistory(`Sinistro atualizou processo ${updates.numeroSinistro}`, id)
  } else {
    appendHistory('Sinistro atualizou processo', id)
  }
}

export function ensureSinistroDemoProcess() {
  const current = getProcesses()
  const existing = current.find((item) => item.numeroSinistro === 'SIN-2026-0001')
  if (existing) {
    const needsApolice = !existing.numeroApolice || !/^CLAIM-\d+$/i.test(existing.numeroApolice)
    if (!needsApolice) return null
    const demoApolice = 'CLAIM-0001'
    syncApoliceSequence()
    const currentSeq = parseInt(localStorage.getItem(APOLICE_SEQ_KEY) || '0', 10)
    if (currentSeq < 1) localStorage.setItem(APOLICE_SEQ_KEY, '1')
    updateProcess(existing.id, { numeroApolice: demoApolice })
    return { ...existing, numeroApolice: demoApolice }
  }

  const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const now = new Date().toISOString()
  const process = {
    id,
    numeroSinistro: 'SIN-2026-0001',
    numeroApolice: 'CLAIM-0001',
    matricula: 'ABB-120-MP',
    cliente: 'Cliente Demonstração',
    dataAcidente: '2026-04-10',
    dataNotificacao: '2026-04-11',
    descricao: 'Sinistro de demonstração para testes do fluxo entre departamentos.',
    oficina: 'Oficina Central',
    numeroFactura: 'FAC-2026-090',
    dataFactura: '2026-04-12',
    perito: 'Edminilson',
    premioPago: '',
    dataPagamento: '',
    responsavelCredit: '',
    dataRegistoCredit: '',
    peritoSolicitado: false,
    peritoNome: '',
    peritagemRelatorio: null,
    peritagemData: '',
    peritagemFormulario: null,
    peritagemMateriais: null,
    peritagemFotos: null,
    peritagemEnviado: false,
    peritagemEnviadoData: '',
    ordemReparacaoDocumento: null,
    ordemReparacaoDataUpload: '',
    enviadoGestor: false,
    enviadoGestorData: '',
    gestorAssinaturaMeta: null,
    gestorAssinadoDocumento: null,
    gestorAssinadoData: '',
    gestorAssinadoPor: '',
    aprovacaoGestorNome: '',
    aprovacaoGestorData: '',
    enviadoContabilidade: false,
    enviadoContabilidadeData: '',
    comprovativoPagamentoDocumento: null,
    comprovativoPagamentoData: '',
    comprovativoPagamentoPor: '',
    juridicoMotivo: '',
    juridicoCartaResumo: '',
    juridicoDataCarta: '',
    juridicoCartaDocumento: null,
    juridicoCartaEmitida: false,
    status: 'Em andamento',
    createdAt: now,
    updatedAt: now,
  }

  saveProcesses([process, ...current])
  localStorage.setItem(APOLICE_SEQ_KEY, '1')

  const history = getHistory()
  const baseUser = getSession()?.name || 'Sinistro'
  const demoHistory = [
    {
      id: `h_${Date.now()}_a`,
      processoId: id,
      acao: 'Sinistro criou processo SIN-2026-0001',
      usuario: baseUser,
      data: now,
    },
    {
      id: `h_${Date.now()}_b`,
      processoId: id,
      acao: 'Sinistro iniciou peritagem e ordem de reparação',
      usuario: baseUser,
      data: now,
    },
  ]
  localStorage.setItem(HISTORICO_KEY, JSON.stringify([...demoHistory, ...history]))
  return process
}

export function getCreditPendingProcesses() {
  const processes = getProcesses()
  return processes.filter((item) => !item.premioPago)
}

export function getCreditReceivedProcesses() {
  return getProcesses()
}

export function requestPeritagem(processoId, peritoNome = 'Edmilson') {
  const current = getProcesses()
  const next = current.map((item) =>
    item.id === processoId
      ? {
          ...item,
          peritoSolicitado: true,
          peritoNome,
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  saveProcesses(next)
  const updated = next.find((item) => item.id === processoId)
  if (!updated) return null
  appendHistory(`Sinistro solicitou peritagem para ${peritoNome} (${updated.numeroSinistro})`, processoId)
  return updated
}

function isPeritagemConcluida(item) {
  if (item.peritagemEnviado) return true
  if (item.peritagemRelatorio?.dataUrl) return true
  return false
}

export function getPeritoPendingProcesses() {
  return getProcesses().filter(
    (item) => item.premioPago === 'Sim' && item.peritoSolicitado && !isPeritagemConcluida(item),
  )
}

export function getPeritoCompletedProcesses() {
  return getProcesses().filter(
    (item) => item.premioPago === 'Sim' && item.peritoSolicitado && isPeritagemConcluida(item),
  )
}

export function getPeritoFormulariosGuardados() {
  return getProcesses().filter((item) => Boolean(item.peritagemFormulario))
}

export function getPeritoMateriaisGuardados() {
  return getProcesses().filter((item) => Boolean(item.peritagemMateriais))
}

export function getPeritoFotosGuardadas() {
  return getProcesses().filter((item) => Boolean(item.peritagemFotos))
}

export function getSinistroDocumentProcesses() {
  return getProcesses().filter((item) => Boolean(item.peritagemEnviado || item.peritagemRelatorio))
}

/** Peritagens já enviadas pelo Perito e disponíveis para o Sinistro */
export function getSinistroPeritagensRecebidas() {
  return getProcesses().filter((item) => Boolean(item.peritagemEnviado))
}

export function getGestorPendingProcesses() {
  return getProcesses().filter((item) => item.enviadoGestor && !item.gestorAssinadoDocumento)
}

export function getGestorSignedProcesses() {
  return getProcesses().filter((item) => Boolean(item.gestorAssinadoDocumento))
}

export function getContabilidadePendingProcesses() {
  return getProcesses().filter(
    (item) => item.enviadoContabilidade && !item.comprovativoPagamentoDocumento,
  )
}

export function getContabilidadePaidProcesses() {
  return getProcesses().filter((item) => Boolean(item.comprovativoPagamentoDocumento))
}

export function getJuridicoPendingProcesses() {
  return getProcesses().filter((item) => item.premioPago === 'Não' && !item.juridicoCartaEmitida)
}

export function getJuridicoClosedProcesses() {
  return getProcesses().filter((item) => item.juridicoCartaEmitida)
}

function patchProcess(processoId, patch) {
  const current = getProcesses()
  const next = current.map((item) =>
    item.id === processoId
      ? { ...item, ...patch, updatedAt: new Date().toISOString() }
      : item,
  )
  saveProcesses(next)
  return next.find((item) => item.id === processoId) || null
}

export function savePeritagemFormulario(processoId, formulario) {
  const updated = patchProcess(processoId, {
    peritagemFormulario: { ...formulario, savedAt: new Date().toISOString() },
  })
  if (updated) appendHistory(`Perito guardou formulário de peritagem (${updated.numeroSinistro})`, processoId)
  return updated
}

export function savePeritagemMateriais(processoId, materiais) {
  const updated = patchProcess(processoId, {
    peritagemMateriais: { ...materiais, savedAt: new Date().toISOString() },
  })
  if (updated) appendHistory(`Perito guardou materiais e mão de obra (${updated.numeroSinistro})`, processoId)
  return updated
}

export function savePeritagemFotos(processoId, fotos) {
  const updated = patchProcess(processoId, {
    peritagemFotos: { ...fotos, savedAt: new Date().toISOString() },
  })
  if (updated) appendHistory(`Perito guardou fotos da peritagem (${updated.numeroSinistro})`, processoId)
  return updated
}

export function deletePeritagemFormulario(processoId) {
  const updated = patchProcess(processoId, { peritagemFormulario: null })
  if (updated) appendHistory(`Perito eliminou formulário de peritagem (${updated.numeroSinistro})`, processoId)
  return updated
}

export function deletePeritagemMateriais(processoId) {
  const updated = patchProcess(processoId, { peritagemMateriais: null })
  if (updated) appendHistory(`Perito eliminou materiais da peritagem (${updated.numeroSinistro})`, processoId)
  return updated
}

export function deletePeritagemFotos(processoId) {
  const updated = patchProcess(processoId, { peritagemFotos: null })
  if (updated) appendHistory(`Perito eliminou fotos da peritagem (${updated.numeroSinistro})`, processoId)
  return updated
}

export function enviarPeritagemRelatorio(processoId, peritagemData) {
  const process = getProcesses().find((item) => item.id === processoId)
  if (!process) return null
  if (!process.peritagemFormulario || !process.peritagemMateriais || !process.peritagemFotos) {
    return null
  }
  const fotosCount = process.peritagemFotos?.fotos?.filter((f) => f?.dataUrl)?.length || 0
  if (fotosCount < 6) return null

  const updated = patchProcess(processoId, {
    peritagemEnviado: true,
    peritagemEnviadoData: peritagemData,
    peritagemData,
    peritagemRelatorio: {
      tipo: 'formulario-digital',
      nome: `Peritagem-${process.numeroSinistro}.pdf`,
      formulario: process.peritagemFormulario,
      materiais: process.peritagemMateriais,
      fotos: process.peritagemFotos,
    },
    status: 'Em andamento',
  })
  if (updated) appendHistory(`Perito enviou relatório completo ao Sinistro (${updated.numeroSinistro})`, processoId)
  return updated
}

export function submitPeritagem(processoId, payload) {
  return enviarPeritagemRelatorio(processoId, payload.peritagemData) || patchProcess(processoId, {
    peritagemRelatorio: payload.peritagemRelatorio,
    peritagemData: payload.peritagemData,
    status: 'Em andamento',
  })
}

export function upsertCreditControl(processoId, payload) {
  const current = getProcesses()
  const next = current.map((item) => {
    if (item.id !== processoId) return item
    const paid = payload.premioPago === 'Sim'
    return {
      ...item,
      premioPago: payload.premioPago,
      dataPagamento: payload.dataPagamento,
      responsavelCredit: payload.responsavelCredit,
      dataRegistoCredit: payload.dataRegistoCredit,
      status: 'Em andamento',
      updatedAt: new Date().toISOString(),
    }
  })
  saveProcesses(next)
  const updated = next.find((item) => item.id === processoId)
  if (!updated) return null
  appendHistory(
    `Credit Control marcou prémio ${updated.premioPago === 'Sim' ? 'como pago' : 'como não pago'} (${updated.numeroSinistro})`,
    processoId,
  )
  return updated
}

export function emitJuridicoCarta(processoId, payload) {
  const current = getProcesses()
  const next = current.map((item) =>
    item.id === processoId
      ? {
          ...item,
          juridicoMotivo: payload.juridicoMotivo,
          juridicoCartaResumo: payload.juridicoCartaResumo,
          juridicoDataCarta: payload.juridicoDataCarta,
          juridicoCartaDocumento: payload.juridicoCartaDocumento,
          juridicoCartaEmitida: true,
          status: 'Encerrado',
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  saveProcesses(next)
  const updated = next.find((item) => item.id === processoId)
  if (!updated) return null
  appendHistory(`Jurídico emitiu carta e encerrou (${updated.numeroSinistro})`, processoId)
  return updated
}

export function sendToContabilidade(processoId, payload) {
  const current = getProcesses()
  const next = current.map((item) =>
    item.id === processoId
      ? {
          ...item,
          aprovacaoGestorNome: payload.aprovacaoGestorNome,
          aprovacaoGestorData: payload.aprovacaoGestorData,
          enviadoContabilidade: true,
          enviadoContabilidadeData: payload.enviadoContabilidadeData,
          status: 'Em andamento',
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  saveProcesses(next)
  const updated = next.find((item) => item.id === processoId)
  if (!updated) return null
  appendHistory(`Sinistro enviou processo para Contabilidade (${updated.numeroSinistro})`, processoId)
  return updated
}

export function sendDocumentoToGestor(processoId, payload) {
  const current = getProcesses()
  const next = current.map((item) =>
    item.id === processoId
      ? {
          ...item,
          ordemReparacaoDocumento: payload.ordemReparacaoDocumento,
          ordemReparacaoDataUpload: payload.ordemReparacaoDataUpload,
          ordemFormularioTipo: payload.ordemFormularioTipo ?? item.ordemFormularioTipo ?? null,
          ordemFormularioData: payload.ordemFormularioData ?? item.ordemFormularioData ?? null,
          ordemFormularioOrigem: payload.ordemFormularioOrigem ?? item.ordemFormularioOrigem ?? 'upload',
          enviadoGestor: true,
          enviadoGestorData: payload.enviadoGestorData,
          gestorAssinaturaMeta: null,
          gestorAssinadoDocumento: null,
          gestorAssinadoData: '',
          gestorAssinadoPor: '',
          status: 'Em andamento',
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  saveProcesses(next)
  const updated = next.find((item) => item.id === processoId)
  if (!updated) return null
  appendHistory(`Sinistro enviou documento para assinatura do gestor (${updated.numeroSinistro})`, processoId)
  return updated
}

export function saveOrdemFormularioDraft(processoId, payload) {
  const current = getProcesses()
  const next = current.map((item) =>
    item.id === processoId
      ? {
          ...item,
          ordemFormularioTipo: payload.ordemFormularioTipo,
          ordemFormularioData: payload.ordemFormularioData,
          ordemFormularioOrigem: 'sistema',
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  saveProcesses(next)
  return next.find((item) => item.id === processoId) || null
}

export function clearOrdemDocumento(processoId) {
  const current = getProcesses()
  const next = current.map((item) =>
    item.id === processoId
      ? {
          ...item,
          ordemReparacaoDocumento: null,
          ordemReparacaoDataUpload: '',
          ordemFormularioTipo: null,
          ordemFormularioData: null,
          ordemFormularioOrigem: null,
          enviadoGestor: false,
          enviadoGestorData: '',
          gestorAssinaturaMeta: null,
          gestorAssinadoDocumento: null,
          gestorAssinadoData: '',
          gestorAssinadoPor: '',
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  saveProcesses(next)
  const updated = next.find((item) => item.id === processoId)
  if (!updated) return null
  appendHistory(`Documento Ordem/Quitação removido (${updated.numeroSinistro})`, processoId)
  return updated
}

export function assinarComoGestor(processoId, payload) {
  const current = getProcesses()
  const next = current.map((item) =>
    item.id === processoId
      ? {
          ...item,
          gestorAssinaturaMeta: payload.gestorAssinaturaMeta,
          gestorAssinadoDocumento: payload.gestorAssinadoDocumento,
          gestorAssinadoData: payload.gestorAssinadoData,
          gestorAssinadoPor: payload.gestorAssinadoPor,
          ordemFormularioData: payload.ordemFormularioData ?? item.ordemFormularioData,
          ordemReparacaoDocumento: payload.ordemReparacaoDocumento ?? item.ordemReparacaoDocumento,
          status: 'Em andamento',
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  saveProcesses(next)
  const updated = next.find((item) => item.id === processoId)
  if (!updated) return null
  appendHistory(`Gestor assinou digitalmente o documento (${updated.numeroSinistro})`, processoId)
  return updated
}

export function registerComprovativoPagamento(processoId, payload) {
  const current = getProcesses()
  const next = current.map((item) =>
    item.id === processoId
      ? {
          ...item,
          comprovativoPagamentoDocumento: payload.comprovativoPagamentoDocumento,
          comprovativoPagamentoData: payload.comprovativoPagamentoData,
          comprovativoPagamentoPor: payload.comprovativoPagamentoPor,
          status: 'Finalizado',
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  saveProcesses(next)
  const updated = next.find((item) => item.id === processoId)
  if (!updated) return null
  appendHistory(`Contabilidade anexou comprovativo e finalizou (${updated.numeroSinistro})`, processoId)
  return updated
}

export function clearHeavyLocalCache() {
  const current = getProcesses()
  let changed = false
  const compacted = current.map((item) => {
    const next = { ...item }

    // Mantém o histórico do processo, mas remove anexos pesados já finalizados/encerrados.
    if (next.status === 'Finalizado' || next.status === 'Encerrado') {
      if (next.peritagemRelatorio?.dataUrl) {
        next.peritagemRelatorio = {
          ...next.peritagemRelatorio,
          dataUrl: '',
          wasCleared: true,
        }
        changed = true
      }
      if (next.ordemReparacaoDocumento?.dataUrl) {
        next.ordemReparacaoDocumento = {
          ...next.ordemReparacaoDocumento,
          dataUrl: '',
          wasCleared: true,
        }
        changed = true
      }
      if (next.oficinaFacturacaoDocumento?.dataUrl) {
        next.oficinaFacturacaoDocumento = {
          ...next.oficinaFacturacaoDocumento,
          dataUrl: '',
          wasCleared: true,
        }
        changed = true
      }
      if (next.comprovativoPagamentoDocumento?.dataUrl) {
        next.comprovativoPagamentoDocumento = {
          ...next.comprovativoPagamentoDocumento,
          dataUrl: '',
          wasCleared: true,
        }
        changed = true
      }
      if (next.juridicoCartaDocumento?.dataUrl) {
        next.juridicoCartaDocumento = {
          ...next.juridicoCartaDocumento,
          dataUrl: '',
          wasCleared: true,
        }
        changed = true
      }
    }

    // A assinatura deve permanecer disponível em todo o fluxo, mesmo após finalização.
    // Por isso, não limpamos os dados de assinatura aqui.

    return next
  })

  if (!changed) return { changed: false, processesUpdated: 0 }
  saveProcesses(compacted)
  return { changed: true, processesUpdated: compacted.length }
}

export function getRoleNotifications(role) {
  const processes = getProcesses()
  if (role === 'credit') {
    const pendings = getCreditPendingProcesses()
    return pendings.slice(0, 6).map((item) => ({
      id: `credit_${item.id}`,
      title: `Processo pendente: ${item.numeroSinistro}`,
      meta: `${item.cliente} • aguardando validação do prémio`,
      status: 'pendente',
    }))
  }
  if (role === 'perito') {
    const pendings = getPeritoPendingProcesses()
    return pendings.slice(0, 6).map((item) => ({
      id: `perito_${item.id}`,
      title: `Solicitação de peritagem: ${item.numeroSinistro}`,
      meta: `${item.cliente} • upload de relatório e cotações`,
      status: 'pendente',
    }))
  }
  if (role === 'contabilidade') {
    const pendings = getContabilidadePendingProcesses()
    return pendings.slice(0, 6).map((item) => ({
      id: `contab_${item.id}`,
      title: `Pagamento pendente: ${item.numeroSinistro}`,
      meta: `${item.cliente} • aguardando comprovativo`,
      status: 'pendente',
    }))
  }
  if (role === 'juridico') {
    const pendings = getJuridicoPendingProcesses()
    return pendings.slice(0, 6).map((item) => ({
      id: `juridico_${item.id}`,
      title: `Ação jurídica: ${item.numeroSinistro}`,
      meta: `${item.cliente} • não pagamento / repúdio`,
      status: 'pendente',
    }))
  }
  if (role === 'gestor') {
    const pendings = getGestorPendingProcesses()
    return pendings.slice(0, 6).map((item) => ({
      id: `gestor_${item.id}`,
      title: `Assinatura pendente: ${item.numeroSinistro}`,
      meta: `${item.cliente} • documento aguardando assinatura`,
      status: 'pendente',
    }))
  }
  if (role === 'sinistro') {
    const recebidas = getSinistroPeritagensRecebidas()
    const docsAssinados = processes.filter(
      (item) => item.gestorAssinadoDocumento && item.enviadoGestor && !item.enviadoContabilidade,
    )
    return [
      ...docsAssinados.slice(0, 4).map((item) => ({
        id: `sinistro_gestor_${item.id}`,
        title: `Documento assinado pelo gestor: ${item.numeroSinistro}`,
        meta: `${item.cliente} • ${item.gestorAssinadoPor || 'Gestor'} • ver ou baixar`,
        status: 'pendente',
        link: `/Sinistro/Ordem?id=${encodeURIComponent(item.id)}`,
      })),
      ...recebidas.slice(0, 4).map((item) => ({
        id: `sinistro_peritagem_${item.id}`,
        title: `Peritagem recebida: ${item.numeroSinistro}`,
        meta: `${item.cliente} • formulário, materiais e 6 fotos`,
        status: 'pendente',
      })),
    ]
  }

  const finalized = processes.filter((item) => item.status === 'Finalizado')
  const pending = processes.filter((item) => item.status === 'Iniciado' || item.status === 'Em andamento')
  return [
    ...pending.slice(0, 2).map((item) => ({
      id: `gen_p_${item.id}`,
      title: `Fluxo ativo: ${item.numeroSinistro}`,
      meta: `${item.cliente} • ${item.status}`,
      status: 'pendente',
    })),
    ...finalized.slice(0, 1).map((item) => ({
      id: `gen_h_${item.id}`,
      title: `Processo finalizado`,
      meta: `${item.numeroSinistro} • ${item.cliente}`,
      status: 'histórico',
    })),
  ]
}

