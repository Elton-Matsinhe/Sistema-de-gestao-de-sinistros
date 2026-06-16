import { PDFDocument } from 'pdf-lib'

async function dataUrlToUint8Array(dataUrl) {
  const response = await fetch(dataUrl)
  const buffer = await response.arrayBuffer()
  return new Uint8Array(buffer)
}

function uint8ArrayToDataUrl(bytes, mimeType) {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  const base64 = btoa(binary)
  return `data:${mimeType};base64,${base64}`
}

export async function createStampedPdfDataUrl({
  pdfDataUrl,
  signatureImageDataUrl,
  x = 40,
  y = 40,
  opacity = 0.75,
  previewWidth = 900,
  previewHeight = 520,
}) {
  if (!pdfDataUrl || !signatureImageDataUrl) return pdfDataUrl

  const pdfBytes = await dataUrlToUint8Array(pdfDataUrl)
  const signatureBytes = await dataUrlToUint8Array(signatureImageDataUrl)
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const page = pdfDoc.getPage(0)
  const { width: pageWidth, height: pageHeight } = page.getSize()

  const lowerSigData = signatureImageDataUrl.toLowerCase()
  const sigImage = lowerSigData.includes('image/jpeg') || lowerSigData.includes('image/jpg')
    ? await pdfDoc.embedJpg(signatureBytes)
    : await pdfDoc.embedPng(signatureBytes)

  const scaleX = pageWidth / previewWidth
  const scaleY = pageHeight / previewHeight

  const sigWidth = Math.min(180 * scaleX, pageWidth * 0.45)
  const sigHeight = sigWidth * (sigImage.height / sigImage.width)
  const drawX = Math.max(0, Math.min(x * scaleX, pageWidth - sigWidth))
  const drawY = Math.max(0, Math.min(pageHeight - (y * scaleY) - sigHeight, pageHeight - sigHeight))

  page.drawImage(sigImage, {
    x: drawX,
    y: drawY,
    width: sigWidth,
    height: sigHeight,
    opacity,
  })

  const stampedBytes = await pdfDoc.save()
  return uint8ArrayToDataUrl(stampedBytes, 'application/pdf')
}
