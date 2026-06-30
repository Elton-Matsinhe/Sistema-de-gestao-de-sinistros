/** Títulos numerados alinhados ao formulário PDF original (Motor Claim). */
export const MOTOR_PDF_SECTION_ORDER = [
  'referencia',
  'sec1',
  'sec2',
  'sec3',
  'sec4',
  'sec5',
  'sec6',
  'sec7',
  'sec8',
  'sec9',
  'sec10',
  'sec11',
  'sec12',
  'sec13',
  'sec14',
]

export const MOTOR_PDF_SECTION_TITLES = {
  referencia: 'Referência',
  sec1: '1. Data do acidente, hora, número e veículos envolvidos',
  sec2: '2. Local do acidente (estrada/rua, localidade e distrito)',
  sec3: '3. Houve feridos, mesmo ligeiros?',
  sec4: '4. Feridos / envolvidos',
  sec5: '5. Circunstâncias aplicáveis — marque (X) para cada veículo',
  sec6: '6. Segurado (documento de seguro)',
  sec7: '7. Veículo A / Veículo B',
  sec8: '8. Seguro do veículo A / Seguro do veículo B',
  sec9: '9. Condutor do veículo A / Condutor do veículo B',
  sec10: '10. Pontos de embate, danos visíveis e observações',
  sec11: '11. Assinaturas dos condutores',
  sec12: '12. Testemunhas e veículos envolvidos',
  sec13: '13. Descrição pormenorizada e dados complementares',
  sec14: '14. Características do veículo, feridos e autoridades',
}

export const MOTOR_FORM_ACCORDION_SECTIONS = {
  referencia: {
    number: null,
    title: 'Referência do sinistro',
    pdfKey: 'referencia',
  },
  acidente: {
    number: '1–2',
    title: 'Data, hora, local e feridos do acidente',
    pdfKeys: ['sec1', 'sec2', 'sec3'],
  },
  feridos: {
    number: '4',
    title: 'Feridos / envolvidos',
    pdfKey: 'sec4',
  },
  circunstancias: {
    number: '5',
    title: 'Circunstâncias aplicáveis',
    subtitle: 'Marque (X) para cada veículo',
    pdfKey: 'sec5',
  },
  segurado: {
    number: '6',
    title: 'Segurado (documento de seguro)',
    pdfKey: 'sec6',
  },
  veiculos: {
    number: '7–9',
    title: 'Veículos, seguros e condutores',
    pdfKeys: ['sec7', 'sec8', 'sec9'],
  },
  embate: {
    number: '10–11',
    title: 'Pontos de embate, danos e assinaturas',
    pdfKeys: ['sec10', 'sec11'],
  },
  testemunhas: {
    number: '12',
    title: 'Testemunhas e veículos envolvidos',
    pdfKey: 'sec12',
  },
  complementos: {
    number: '13–14',
    title: 'Descrição, feridos, veículo e autoridades',
    pdfKeys: ['sec13', 'sec14'],
  },
}
