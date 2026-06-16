export const PHOTO_SLOTS = [
  { id: 'frontal', label: 'Parte frontal', view: 'front' },
  { id: 'lateral-esq', label: 'Danos na lateral esquerda', view: 'left' },
  { id: 'porta-espelho', label: 'Porta frontal esquerda e espelho retrovisor danificados', view: 'door-left' },
  { id: 'para-choques', label: 'Danos no para-choques, farol e guarda lamas', view: 'bumper' },
  { id: 'lateral-tras', label: 'Lateral esquerda traseira sem danos do sinistro', view: 'rear-left' },
  { id: 'traseira', label: 'Parte traseira sem danos do sinistro', view: 'rear' },
]

export const ZONAS_ACIDENTADAS = [
  { id: 'frente', label: 'Frente' },
  { id: 'frente-esq', label: 'Frente esquerda' },
  { id: 'frente-dir', label: 'Frente direita' },
  { id: 'lateral-esq', label: 'Lateral esquerda' },
  { id: 'lateral-dir', label: 'Lateral direita' },
  { id: 'traseira-esq', label: 'Traseira esquerda' },
  { id: 'traseira-dir', label: 'Traseira direita' },
  { id: 'traseira', label: 'Traseira' },
  { id: 'tejadilho', label: 'Tejadilho' },
]

export function emptyPecaRow() {
  return { id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, descricao: '', quantidade: '', custoUnitario: '', valorTotal: '' }
}

export function emptyMaoObraRow() {
  return { id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, descricao: '', horas: '', valorHora: '', valor: '' }
}

export function buildFormularioFromProcess(process, peritoNome = '') {
  return {
    dataSinistro: process?.dataAcidente || '',
    numeroProcesso: process?.numeroSinistro || '',
    numeroApolice: process?.numeroApolice || '',
    tipoSinistro: '',
    dataPeritagem: '',
    capitalSeguro: '',
    seguradoNome: process?.cliente || '',
    seguradoContacto: '',
    seguradoMorada: '',
    seguradoLocalidade: '',
    seguradoObservacoes: '',
    veiculoMatricula: process?.matricula || '',
    veiculoQuadro: '',
    veiculoCilindrada: '',
    veiculoMarca: '',
    veiculoMotor: '',
    veiculoKm: '',
    veiculoModelo: '',
    veiculoCilindros: '',
    veiculoCombustivel: '',
    veiculoLotacao: '',
    veiculoCor: '',
    veiculoAno: '',
    veiculoOutros: '',
    condutorNome: process?.cliente || '',
    condutorContacto: '',
    condutorMorada: '',
    condutorLocalidade: '',
    condutorCarta: '',
    condutorCategoria: '',
    condutorDataCarta: '',
    condutorRelacao: '',
    condutorIdade: '',
    oficinaNome: process?.oficina || '',
    oficinaTelefone: '',
    oficinaMorada: '',
    oficinaFax: '',
    oficinaLocalidade: '',
    oficinaTelemovel: '',
    oficinaNuit: '',
    oficinaEmail: '',
    observacoes: process?.descricao || '',
    dataCotacao: '',
    inicioReparacao: '',
    diasReparacao: '',
    zonasAcidentadas: [],
    danosMateriais: '',
    resumoCapitalSeguro: '',
    resumoNumeroCotacao: '',
    resumoCotacaoInicial: '',
    resumoFranquia: '',
    resumoTotalLiquidar: '',
    peritoAvaliador: peritoNome,
    peritoLocal: 'Maputo',
    peritoDataAssinatura: '',
  }
}

export function emptyMateriaisForm() {
  return {
    pecas: [emptyPecaRow(), emptyPecaRow(), emptyPecaRow()],
    descontoPecas: '',
    maoObra: [emptyMaoObraRow(), emptyMaoObraRow()],
    descontoMaoObra: '',
  }
}

export function calcMateriaisTotals(data) {
  const pecas = (data.pecas || []).map((row) => {
    const q = parseFloat(String(row.quantidade).replace(',', '.')) || 0
    const u = parseFloat(String(row.custoUnitario).replace(',', '.')) || 0
    const valorTotal = q * u
    return { ...row, valorTotal: valorTotal ? valorTotal.toFixed(2) : '' }
  })
  const subTotalPecas = pecas.reduce((sum, row) => sum + (parseFloat(row.valorTotal) || 0), 0)
  const descontoPecas = parseFloat(String(data.descontoPecas).replace(',', '.')) || 0
  const totalPecas = Math.max(0, subTotalPecas - descontoPecas)

  const maoObra = data.maoObra || []
  const subTotalMaoObra = maoObra.reduce(
    (sum, row) => sum + (parseFloat(String(row.valor || '').replace(',', '.')) || 0),
    0,
  )
  const descontoMaoObra = parseFloat(String(data.descontoMaoObra).replace(',', '.')) || 0
  const totalMaoObra = Math.max(0, subTotalMaoObra - descontoMaoObra)
  const totalGeral = totalPecas + totalMaoObra

  return {
    pecas,
    maoObra,
    subTotalPecas: subTotalPecas.toFixed(2),
    totalPecas: totalPecas.toFixed(2),
    subTotalMaoObra: subTotalMaoObra.toFixed(2),
    totalMaoObra: totalMaoObra.toFixed(2),
    totalGeral: totalGeral.toFixed(2),
  }
}

export function compressImageDataUrl(dataUrl, maxWidth = 1100, quality = 0.72) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const ratio = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}
