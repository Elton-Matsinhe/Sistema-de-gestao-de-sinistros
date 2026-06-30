import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoAsset from '../../imagens/logo.png?url'
import { collectParticipacaoPdfSections, collectSingleFormPdfSections } from './participacaoPdfData'

const GREEN = [31, 143, 95]
const GREEN_DARK = [17, 97, 66]
const RED = [192, 40, 40]
const TEXT_LABEL = [45, 55, 50]
const TEXT_VALUE = [72, 82, 76]
const LOGO_MAX_WIDTH_MM = 22

const TABLE_HEAD_STYLES = {
  fillColor: GREEN,
  textColor: [255, 255, 255],
  fontStyle: 'bold',
  halign: 'left',
  fontSize: 9,
}

const TABLE_BODY_STYLES = {
  fontSize: 8.5,
  cellPadding: 2.8,
  lineColor: [210, 225, 218],
  lineWidth: 0.2,
  textColor: TEXT_VALUE,
  overflow: 'linebreak',
}

function loadImageElement(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0)
      resolve({
        dataUrl: canvas.toDataURL('image/png'),
        aspect: img.naturalHeight / img.naturalWidth,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}

async function resolveLogoForPdf() {
  const bundled = await loadImageElement(logoAsset)
  if (bundled) return bundled
  return loadImageElement('/imagens/logo.png')
}

function groupBySubsection(fields) {
  const map = new Map()
  fields.forEach((f) => {
    const key = f.subsection || ''
    if (!map.has(key)) map.set(key, [])
    map.get(key).push([f.label, f.value])
  })
  return map
}

function drawPageHeader(doc, logo, pageWidth) {
  const margin = 14
  let headerBottom = 36

  if (logo?.dataUrl) {
    const w = LOGO_MAX_WIDTH_MM
    const h = w * logo.aspect
    doc.addImage(logo.dataUrl, 'PNG', margin, 3, w, h, undefined, 'NONE')
    headerBottom = Math.max(headerBottom, 3 + h + 4)
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(...GREEN_DARK)
  doc.text('Participação de Sinistro', pageWidth - margin, 16, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...RED)
  doc.text('Ramo Automóvel / Motor Claim Form', pageWidth - margin, 24, { align: 'right' })

  doc.setDrawColor(...GREEN)
  doc.setLineWidth(1)
  doc.line(margin, headerBottom, pageWidth - margin, headerBottom)

  return headerBottom + 6
}

function drawSectionTitle(doc, title, y, margin, pageWidth) {
  doc.setFillColor(...GREEN)
  doc.rect(margin, y, pageWidth - margin * 2, 9, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(255, 255, 255)
  const lines = doc.splitTextToSize(title, pageWidth - margin * 2 - 6)
  lines.forEach((line, i) => {
    doc.text(line, margin + 3, y + 5.5 + i * 4.2)
  })
  return y + 9 + Math.max(0, lines.length - 1) * 4.2 + 3
}

function addSignatureBlock(doc, label, imageDataUrl, x, y, w = 55, h = 22) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_LABEL)
  doc.text(label, x, y)
  doc.setDrawColor(...GREEN)
  doc.setLineWidth(0.3)
  doc.rect(x, y + 2, w, h)
  if (imageDataUrl) {
    try {
      const format = imageDataUrl.includes('image/jpeg') ? 'JPEG' : 'PNG'
      doc.addImage(imageDataUrl, format, x + 1, y + 3, w - 2, h - 2, undefined, 'NONE')
    } catch {
      // ignora
    }
  }
}

function renderFieldsTable(doc, fields, y, margin) {
  const grouped = groupBySubsection(fields)

  grouped.forEach((rows, subsection) => {
    if (subsection) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(...GREEN_DARK)
      doc.text(subsection, margin, y)
      y += 4
    }

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Campo', 'Valor']],
      body: rows,
      theme: 'grid',
      styles: TABLE_BODY_STYLES,
      headStyles: TABLE_HEAD_STYLES,
      columnStyles: {
        0: { cellWidth: 74, fontStyle: 'bold', textColor: TEXT_LABEL },
        1: { cellWidth: 'auto', textColor: TEXT_VALUE },
      },
      alternateRowStyles: { fillColor: [252, 253, 252] },
    })

    y = doc.lastAutoTable.finalY + 5
  })

  return y
}

function buildParticipacaoDoc(participacao, logo, sectionsOverride = null) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  const sections = sectionsOverride || collectParticipacaoPdfSections(participacao)

  if (sections.length === 0) {
    throw new Error('Não há campos preenchidos para gerar o PDF.')
  }

  let y = drawPageHeader(doc, logo, pageWidth)

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage()
      y = drawPageHeader(doc, logo, pageWidth)
    }
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...TEXT_VALUE)
  const meta = [
    participacao.numeroSinistro ? `Nº Sinistro: ${participacao.numeroSinistro}` : null,
    participacao.forms?.[0]?.data?.numeroApolice
      ? `Apólice: ${participacao.forms[0].data.numeroApolice}`
      : null,
    participacao.submetidaEm
      ? `Submetida: ${new Date(participacao.submetidaEm).toLocaleString('pt-PT')}`
      : null,
  ].filter(Boolean)
  if (meta.length) {
    doc.text(meta.join('   |   '), margin, y)
    y += 8
  }

  sections.forEach((section, sectionIndex) => {
    if (sectionIndex > 0) {
      ensureSpace(20)
      y += 3
    }

    ensureSpace(18)
    y = drawSectionTitle(doc, section.title, y, margin, pageWidth)
    y = renderFieldsTable(doc, section.fields, y, margin)

    const sigs = []
    if (section.assinaturaCondutorA?.imagemDataUrl) {
      sigs.push(['Assinatura Condutor A', section.assinaturaCondutorA.imagemDataUrl])
    }
    if (section.assinaturaCondutorB?.imagemDataUrl) {
      sigs.push(['Assinatura Condutor B', section.assinaturaCondutorB.imagemDataUrl])
    }
    if (section.assinaturaCliente?.imagemDataUrl) {
      sigs.push(['Assinatura do Segurado', section.assinaturaCliente.imagemDataUrl])
    }

    if (sigs.length) {
      ensureSpace(36)
      y += 2
      sigs.forEach(([label, img], i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        addSignatureBlock(doc, label, img, margin + col * 92, y + row * 28, 85, 24)
      })
      y += Math.ceil(sigs.length / 2) * 28 + 4
    }
  })

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(
      `Imperial Seguros — Participação de Sinistro — Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' },
    )
  }

  return doc
}

export async function generateParticipacaoPdfBlob(participacao) {
  const logo = await resolveLogoForPdf()
  const doc = buildParticipacaoDoc(participacao, logo)
  return doc.output('blob')
}

export async function generateSingleFormPdfBlob(participacao, formId) {
  const sections = collectSingleFormPdfSections(participacao, formId)
  if (sections.length === 0) {
    throw new Error('Não há campos preenchidos neste formulário para gerar o PDF.')
  }
  const logo = await resolveLogoForPdf()
  const doc = buildParticipacaoDoc(participacao, logo, sections)
  return doc.output('blob')
}

export async function downloadSingleFormPdf(participacao, formId) {
  const form = participacao.forms?.find((f) => f.id === formId)
  const typeLabel = form?.typeId || 'formulario'
  const blob = await generateSingleFormPdfBlob(participacao, formId)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${typeLabel}-${participacao.numeroSinistro || participacao.id}.pdf`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export async function printSingleFormPdf(participacao, formId) {
  const blob = await generateSingleFormPdfBlob(participacao, formId)
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) return
  win.addEventListener('load', () => {
    win.focus()
    win.print()
  })
}

export async function previewSingleFormPdf(participacao, formId) {
  const blob = await generateSingleFormPdfBlob(participacao, formId)
  return URL.createObjectURL(blob)
}

export async function generateParticipacaoPdfDataUrl(participacao) {
  const blob = await generateParticipacaoPdfBlob(participacao)
  return URL.createObjectURL(blob)
}

export async function downloadParticipacaoPdf(participacao, filename) {
  const blob = await generateParticipacaoPdfBlob(participacao)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `participacao-${participacao.numeroSinistro || participacao.id}.pdf`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export async function printParticipacaoPdf(participacao) {
  const blob = await generateParticipacaoPdfBlob(participacao)
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')

  if (!win) {
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;inset:0;width:0;height:0;border:0'
    iframe.src = url
    document.body.appendChild(iframe)
    iframe.onload = () => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      setTimeout(() => {
        document.body.removeChild(iframe)
        URL.revokeObjectURL(url)
      }, 1500)
    }
    return
  }

  win.addEventListener('load', () => {
    win.focus()
    win.print()
  })
}

export async function shareParticipacaoPdf(participacao) {
  const blob = await generateParticipacaoPdfBlob(participacao)
  const file = new File(
    [blob],
    `participacao-${participacao.numeroSinistro || 'sinistro'}.pdf`,
    { type: 'application/pdf' },
  )
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: 'Participação de Sinistro — Imperial Seguros',
      files: [file],
    })
    return true
  }
  await downloadParticipacaoPdf(participacao)
  return false
}

export async function generateSingleFormPdfDataUrl(form) {
  const blob = await generateSingleFormPdfBlob(
    { forms: [form], numeroSinistro: form.data?.numeroSinistro },
    form.id,
  )
  return URL.createObjectURL(blob)
}

export function getFormPreviewEntries() {
  return []
}
