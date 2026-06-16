export const COMBUSTIVEIS = ['Diesel', 'Gasolina', 'Gás']

export const CATEGORIAS_CARTA = ['AM', 'A1', 'A2', 'A', 'B1', 'B', 'C', 'C+E', 'C1', 'D1+E', 'D', 'D1', 'D+E', 'D1+E']

export function buildYearOptions(start = 1920, extraFuture = 15) {
  const current = new Date().getFullYear()
  const end = current + extraFuture
  const years = []
  for (let y = end; y >= start; y -= 1) years.push(y)
  return years
}

export function onlyDigits(value = '') {
  return String(value).replace(/\D/g, '')
}

export function onlyDecimal(value = '') {
  const cleaned = String(value).replace(/[^\d.,]/g, '')
  const parts = cleaned.replace(/,/g, '.').split('.')
  if (parts.length <= 1) return cleaned.replace(/,/g, '.')
  return `${parts[0]}.${parts.slice(1).join('')}`
}

export function isValidEmail(value = '') {
  if (!value.trim()) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function parseDecimalAmount(value = '') {
  const normalized = String(value).trim().replace(/\s/g, '').replace(',', '.')
  if (!normalized) return 0
  const parsed = parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatDecimalAmount(value) {
  if (value === '' || value === null || value === undefined) return ''
  const num = typeof value === 'number' ? value : parseDecimalAmount(value)
  if (!num && num !== 0) return ''
  return num.toFixed(2)
}

/** Total a Liquidar = Cotação Inicial − Franquia */
export function calcTotalLiquidar(cotacaoInicial, franquia) {
  const cotacao = parseDecimalAmount(cotacaoInicial)
  const deducao = parseDecimalAmount(franquia)
  if (!cotacao && !deducao) return ''
  return formatDecimalAmount(Math.max(0, cotacao - deducao))
}
