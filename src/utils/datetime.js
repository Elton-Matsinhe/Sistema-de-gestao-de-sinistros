export const APP_TIMEZONE = 'Africa/Maputo'

function getParts(date, options) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIMEZONE,
    ...options,
  })
  return Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]))
}

/** Data e hora local (Moçambique) para registo de confirmações: YYYY-MM-DD HH:mm:ss */
export function getLocalDateTimeNow(date = new Date()) {
  const parts = getParts(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`
}

/** Apenas data local: YYYY-MM-DD */
export function getLocalDateNow(date = new Date()) {
  const parts = getParts(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return `${parts.year}-${parts.month}-${parts.day}`
}

/** Texto legível para exibir no formulário */
export function formatLocalDateTimeLabel(date = new Date()) {
  const parts = getParts(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}:${parts.second}`
}
