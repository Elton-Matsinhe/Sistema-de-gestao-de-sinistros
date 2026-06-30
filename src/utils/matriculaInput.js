/** Normaliza matrícula: apenas maiúsculas, números e hífen. */
export function normalizeMatricula(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
}
