import logoAsset from '../../imagens/logo.png?url'

export const LETTERHEAD_URL = new URL('../../Papel Timbrado.png', import.meta.url).href

const GREEN = [31, 143, 95]
const GREEN_DARK = [17, 97, 66]

export const PDF_TABLE_HEAD = {
  fillColor: GREEN,
  textColor: [255, 255, 255],
  fontStyle: 'bold',
  halign: 'left',
  fontSize: 9,
}

export const PDF_TABLE_BODY = {
  fontSize: 9,
  cellPadding: 2.8,
  lineColor: [210, 225, 218],
  lineWidth: 0.2,
  textColor: [55, 65, 60],
  overflow: 'linebreak',
}

export const PDF_LABEL_COL = { cellWidth: 78, fontStyle: 'bold', textColor: [45, 55, 50] }
export const PDF_VALUE_COL = { cellWidth: 'auto', textColor: [72, 82, 76] }

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
      })
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export async function loadLetterheadDataUrl() {
  try {
    const blob = await fetch(LETTERHEAD_URL).then((r) => r.blob())
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function loadLogoForPdf(maxWidthMm = 20) {
  const bundled = await loadImageElement(logoAsset)
  const logo = bundled || await loadImageElement('/imagens/logo.png')
  if (!logo) return null
  return { ...logo, maxWidthMm }
}

export function drawLetterheadPage(doc, letterheadDataUrl) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  if (letterheadDataUrl) {
    doc.addImage(letterheadDataUrl, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'MEDIUM')
  } else {
    doc.setFillColor(236, 247, 240)
    doc.rect(0, 0, pageWidth, 40, 'F')
  }
}

export function drawCenteredLogo(doc, logo, centerY = 42) {
  if (!logo?.dataUrl) return centerY
  const pageWidth = doc.internal.pageSize.getWidth()
  const w = logo.maxWidthMm || 20
  const h = w * logo.aspect
  doc.addImage(logo.dataUrl, 'PNG', (pageWidth - w) / 2, centerY - h / 2, w, h, undefined, 'NONE')
  return centerY + h / 2 + 4
}

export function drawTitlePill(doc, title, y, margin = 12) {
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  const textWidth = doc.getTextWidth(title) + 16
  const pillW = Math.min(textWidth, pageWidth - margin * 2)
  const pillX = (pageWidth - pillW) / 2
  doc.setFillColor(...GREEN)
  doc.roundedRect(pillX, y, pillW, 10, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text(title, pageWidth / 2, y + 6.8, { align: 'center' })
  return y + 14
}

export function drawSectionBar(doc, title, y, margin = 12) {
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.setFillColor(...GREEN_DARK)
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text(title, margin + 3, y + 5)
  return y + 10
}

/** Texto justificado com espaçamento ~1.5 (lineHeight em mm). */
export function drawJustifiedBlock(doc, text, x, y, maxWidth, lineHeight = 5.2) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(40, 48, 44)
  const lines = doc.splitTextToSize(text, maxWidth)
  lines.forEach((line, i) => {
    doc.text(line, x, y + i * lineHeight, { align: 'justify', maxWidth })
  })
  return y + lines.length * lineHeight + 3
}
