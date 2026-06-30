/** Fontes Google para assinatura tipográfica / rubrica (16 opções). */
export const SIGNATURE_FONT_OPTIONS = [
  { id: 'caveat', label: '1. Manuscrito — Caveat', family: '"Caveat", cursive', google: 'Caveat' },
  { id: 'dancing', label: '2. Elegante — Dancing Script', family: '"Dancing Script", cursive', google: 'Dancing+Script' },
  { id: 'great-vibes', label: '3. Fluidez — Great Vibes', family: '"Great Vibes", cursive', google: 'Great+Vibes' },
  { id: 'pacifico', label: '4. Casual — Pacifico', family: '"Pacifico", cursive', google: 'Pacifico' },
  { id: 'satisfy', label: '5. Rubrica suave — Satisfy', family: '"Satisfy", cursive', google: 'Satisfy' },
  { id: 'sacramento', label: '6. Formal manuscrito — Sacramento', family: '"Sacramento", cursive', google: 'Sacramento' },
  { id: 'parisienne', label: '7. Sofisticada — Parisienne', family: '"Parisienne", cursive', google: 'Parisienne' },
  { id: 'tangerine', label: '8. Leve — Tangerine', family: '"Tangerine", cursive', google: 'Tangerine' },
  { id: 'allura', label: '9. Caligráfica — Allura', family: '"Allura", cursive', google: 'Allura' },
  { id: 'marck', label: '10. Rubrica marcante — Marck Script', family: '"Marck Script", cursive', google: 'Marck+Script' },
  { id: 'poppins', label: '11. Formal — Poppins', family: '"Poppins", sans-serif', google: 'Poppins' },
  { id: 'playfair', label: '12. Serif elegante — Playfair', family: '"Playfair Display", serif', google: 'Playfair+Display' },
  { id: 'merriweather', label: '13. Clássica — Merriweather', family: '"Merriweather", serif', google: 'Merriweather' },
  { id: 'lora', label: '14. Serif moderna — Lora', family: '"Lora", serif', google: 'Lora' },
  { id: 'raleway', label: '15. Sans leve — Raleway', family: '"Raleway", sans-serif', google: 'Raleway' },
  { id: 'josefin', label: '16. Geométrica — Josefin Sans', family: '"Josefin Sans", sans-serif', google: 'Josefin+Sans' },
]

export const SIGNATURE_GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Allura&family=Caveat:wght@400;600&family=Dancing+Script&family=Great+Vibes&family=Josefin+Sans&family=Lora&family=Marck+Script&family=Merriweather&family=Pacifico&family=Parisienne&family=Playfair+Display&family=Poppins:wght@400;600&family=Raleway&family=Sacramento&family=Satisfy&family=Tangerine:wght@400;700&display=swap'

export function renderSignatureToDataUrl(nome, fontFamily, fontSize = 42) {
  const canvas = document.createElement('canvas')
  canvas.width = 520
  canvas.height = 120
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1a3d2e'
  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.textBaseline = 'middle'
  ctx.fillText(String(nome).trim(), 20, canvas.height / 2)
  return canvas.toDataURL('image/png')
}
