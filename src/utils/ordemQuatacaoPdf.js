import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  ORDEM_DOC_TYPES,
  ORDEM_NOTA_FRANQUIA,
  QUITACAO_DECLARACAO,
  QUITACAO_FIELDS,
  QUITACAO_IMPORTANTE,
  collectFilledRows,
} from './ordemQuatacaoConfig'
import {
  PDF_LABEL_COL,
  PDF_TABLE_BODY,
  PDF_TABLE_HEAD,
  PDF_VALUE_COL,
  drawJustifiedBlock,
  drawLetterheadPage,
  drawSectionBar,
  drawTitlePill,
  loadLetterheadDataUrl,
} from './pdfLetterhead'

const MARGIN = 12
const CONTENT_TOP = 38
const LINE_H = 5.4

const MESES_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

function formatCurrency(val) {
  if (!val) return ''
  const n = Number(String(val).replace(/[^\d.,-]/g, '').replace(',', '.'))
  if (Number.isNaN(n)) return String(val)
  return n.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MZN'
}

function formatDatePt(value) {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleDateString('pt-PT')
  } catch {
    return String(value)
  }
}

function formatLongDatePt(value) {
  if (!value) {
    return new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return String(value)
  }
}

function formatQuitacaoCellValue(field, raw) {
  if (!raw) return ''
  if (field?.type === 'currency') return formatCurrency(raw)
  if (field?.type === 'date') return formatDatePt(raw)
  return String(raw).trim()
}

function quitacaoFieldByLabel() {
  return Object.fromEntries(QUITACAO_FIELDS.map((f) => [f.label, f]))
}

function groupRowsBySection(rows) {
  const map = new Map()
  rows.forEach((r) => {
    if (!map.has(r.section)) map.set(r.section, [])
    map.get(r.section).push([r.label, r.value])
  })
  return map
}

function mesAssinaturaLabel(mes) {
  if (!mes) return '________'
  const n = Number(mes)
  if (!Number.isNaN(n) && n >= 1 && n <= 12) return MESES_PT[n - 1]
  return String(mes)
}

function drawSignatureImage(doc, imageDataUrl, x, y, width, height = 22) {
  if (!imageDataUrl) return false
  try {
    const format = imageDataUrl.includes('image/jpeg') ? 'JPEG' : 'PNG'
    doc.addImage(imageDataUrl, format, x, y, width, height, undefined, 'NONE')
    return true
  } catch {
    return false
  }
}

function drawCenteredSignatureBlock(doc, title, signature, x, y, width) {
  const centerX = x + width / 2
  const lineW = Math.min(width * 0.88, 88)
  const lineX = centerX - lineW / 2

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(35, 45, 40)
  doc.text(title, centerX, y, { align: 'center' })

  const sigY = y + 3
  const sigH = 14
  const lineY = sigY + sigH + 0.5

  if (signature?.imagemDataUrl) {
    drawSignatureImage(doc, signature.imagemDataUrl, lineX, sigY, lineW, sigH)
  }

  doc.setDrawColor(70, 70, 70)
  doc.setLineWidth(0.25)
  doc.line(lineX, lineY, lineX + lineW, lineY)

  return lineY + 5
}

function drawDualSignaturesBlock(doc, declarante, gestor, x, y, totalWidth) {
  const gap = 6
  const colWidth = (totalWidth - gap) / 2
  const leftEnd = drawCenteredSignatureBlock(
    doc,
    'Assinatura do Declarante',
    declarante,
    x,
    y,
    colWidth,
  )
  const rightEnd = drawCenteredSignatureBlock(
    doc,
    'Assinatura do Gestor de Sinistro',
    gestor,
    x + colWidth + gap,
    y,
    colWidth,
  )
  return Math.max(leftEnd, rightEnd)
}

function drawDeclaranteSignature(doc, signature, gestor, x, y, width) {
  return drawDualSignaturesBlock(doc, signature, gestor, x, y, width)
}

function drawGestorAuthorization(doc, data, x, y, contentWidth) {
  const labelW = 38
  const valueX = x + labelW + 3
  const valueW = contentWidth - labelW - 3
  const autorizado = data.autorizadoPor || data.assinaturaGestor?.nome || ''
  const dataAuth = formatDatePt(data.dataAutorizacao)
  let cy = y

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(35, 45, 40)
  doc.text('AUTORIZADO POR', x, cy)
  doc.text(':', x + labelW, cy)
  doc.setFont('helvetica', 'normal')
  if (autorizado) {
    doc.text(autorizado, valueX, cy)
  } else {
    doc.setDrawColor(31, 143, 95)
    doc.setLineWidth(0.2)
    doc.line(valueX, cy + 1, valueX + valueW * 0.55, cy + 1)
  }
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.text('( GESTOR DE SINISTRO )', x + contentWidth, cy, { align: 'right' })
  cy += 8

  cy = drawDualSignaturesBlock(
    doc,
    data.assinaturaDeclarante,
    data.assinaturaGestor,
    x,
    cy,
    contentWidth,
  )
  cy += 4

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('DATA', x, cy)
  doc.text(':', x + labelW, cy)
  doc.setFont('helvetica', 'normal')
  if (dataAuth) {
    doc.text(dataAuth, valueX, cy)
  } else {
    doc.setDrawColor(31, 143, 95)
    doc.line(valueX, cy + 1, valueX + valueW * 0.35, cy + 1)
  }
  return cy + 10
}

async function buildOrdemReparacaoDoc(data) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const letterhead = await loadLetterheadDataUrl()

  drawLetterheadPage(doc, letterhead)
  let y = CONTENT_TOP
  y = drawTitlePill(doc, ORDEM_DOC_TYPES.ordem_reparacao.pdfTitle, y, MARGIN)

  const rows = collectFilledRows('ordem_reparacao', data)
  const grouped = groupRowsBySection(rows)

  grouped.forEach((tableRows, sectionTitle) => {
    if (y > pageHeight - 40) {
      doc.addPage()
      drawLetterheadPage(doc, letterhead)
      y = CONTENT_TOP
    }
    y = drawSectionBar(doc, sectionTitle.toUpperCase(), y, MARGIN)
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      tableWidth: pageWidth - MARGIN * 2,
      head: [['Campo', 'Valor']],
      body: tableRows,
      theme: 'grid',
      styles: PDF_TABLE_BODY,
      headStyles: PDF_TABLE_HEAD,
      columnStyles: { 0: PDF_LABEL_COL, 1: PDF_VALUE_COL },
      alternateRowStyles: { fillColor: [252, 253, 252] },
    })
    y = doc.lastAutoTable.finalY + 6
  })

  if (y > pageHeight - 35) {
    doc.addPage()
    drawLetterheadPage(doc, letterhead)
    y = CONTENT_TOP
  }

  y = drawJustifiedBlock(doc, ORDEM_NOTA_FRANQUIA, MARGIN, y, pageWidth - MARGIN * 2, LINE_H)

  if (y > pageHeight - 60) {
    doc.addPage()
    drawLetterheadPage(doc, letterhead)
    y = CONTENT_TOP
  }

  y = drawSectionBar(doc, 'AUTORIZAÇÃO', y + 6, MARGIN)
  y += 4
  drawGestorAuthorization(doc, data, MARGIN, y, pageWidth - MARGIN * 2)

  return doc
}

async function buildQuitacaoDoc(data) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = pageWidth - MARGIN * 2
  const letterhead = await loadLetterheadDataUrl()
  const fieldMap = quitacaoFieldByLabel()

  drawLetterheadPage(doc, letterhead)
  let y = CONTENT_TOP

  const local = data.localDocumento || 'Maputo'
  const dataLinha = formatLongDatePt(data.dataDocumento)

  if (ORDEM_DOC_TYPES.quitacao.subtitle) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(45, 55, 50)
    doc.text(ORDEM_DOC_TYPES.quitacao.subtitle, pageWidth / 2, y, { align: 'center' })
    y += 6
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.setTextColor(35, 45, 40)
  doc.text(`${local}, ${dataLinha}`, pageWidth / 2, y, { align: 'center' })
  y += 8

  y = drawTitlePill(doc, ORDEM_DOC_TYPES.quitacao.pdfTitle, y, MARGIN)

  const rows = collectFilledRows('quitacao', data)
  const tableRows = rows.map((r) => {
    const field = fieldMap[r.label]
    return [r.label, formatQuitacaoCellValue(field, r.value)]
  })

  if (tableRows.length) {
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      tableWidth: contentWidth,
      head: [['Campo', 'Valor']],
      body: tableRows,
      theme: 'grid',
      styles: PDF_TABLE_BODY,
      headStyles: PDF_TABLE_HEAD,
      columnStyles: {
        0: { ...PDF_LABEL_COL, cellWidth: contentWidth * 0.38 },
        1: { ...PDF_VALUE_COL, cellWidth: contentWidth * 0.62 },
      },
      alternateRowStyles: { fillColor: [252, 253, 252] },
    })
    y = doc.lastAutoTable.finalY + 5
  }

  if (y > pageHeight - 85) {
    doc.addPage()
    drawLetterheadPage(doc, letterhead)
    y = CONTENT_TOP
  }

  y = drawSectionBar(doc, 'DECLARAÇÃO', y, MARGIN)
  y += 1
  const valorFmt = data.valorIndemnizar ? formatCurrency(data.valorIndemnizar) : ''
  y = drawJustifiedBlock(doc, QUITACAO_DECLARACAO(valorFmt), MARGIN, y, contentWidth, 5.1)

  y = drawSectionBar(doc, 'IMPORTANTE', y + 1, MARGIN)
  y += 1
  y = drawJustifiedBlock(doc, QUITACAO_IMPORTANTE, MARGIN, y, contentWidth, 5.0)

  const dia = data.diaAssinatura || '________'
  const mes = mesAssinaturaLabel(data.mesAssinatura)
  const ano = data.anoAssinatura || String(new Date().getFullYear())
  y += 1
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(35, 45, 40)
  doc.text(`Datado em ${local} aos ${dia} de ${mes} de ${ano}`, MARGIN, y, { maxWidth: contentWidth })
  y += 4
  y = drawDeclaranteSignature(doc, data.assinaturaDeclarante, data.assinaturaGestor, MARGIN, y, contentWidth)

  return doc
}

export async function generateOrdemQuatacaoPdfBlob(typeId, data) {
  const doc = typeId === 'quitacao'
    ? await buildQuitacaoDoc(data || {})
    : await buildOrdemReparacaoDoc(data || {})
  return doc.output('blob')
}

export async function generateOrdemQuatacaoPdfDataUrl(typeId, data) {
  const blob = await generateOrdemQuatacaoPdfBlob(typeId, data)
  return URL.createObjectURL(blob)
}

export async function downloadOrdemQuatacaoPdf(typeId, data, numeroSinistro) {
  const meta = ORDEM_DOC_TYPES[typeId]
  const blob = await generateOrdemQuatacaoPdfBlob(typeId, data)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${meta?.filePrefix || 'Documento'}-${numeroSinistro || 'sinistro'}.pdf`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export async function printOrdemQuatacaoPdf(typeId, data) {
  const blob = await generateOrdemQuatacaoPdfBlob(typeId, data)
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (win) {
    win.addEventListener('load', () => {
      win.focus()
      win.print()
    })
  }
}

export async function ordemQuatacaoPdfToDataUrl(typeId, data) {
  const blob = await generateOrdemQuatacaoPdfBlob(typeId, data)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
