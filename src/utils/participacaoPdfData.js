import { CIRCUNSTANCIAS_OPCOES, IMPACT_VIEWS, IMPACT_ZONES } from './participacaoMotorSchema'
import { FORM_FIELDS, FORM_TYPES, mergeParticipacaoMotorData } from './participacaoFormConfig'
import { MOTOR_PDF_SECTION_ORDER, MOTOR_PDF_SECTION_TITLES } from './participacaoMotorPdfSections'

const VIEW_LABELS = {
  esquerda: 'Lado esquerdo',
  direita: 'Lado direito',
  frente: 'Frente',
  traseira: 'Traseira',
}

const PERSON_FIELDS = [
  ['apelidos', 'Apelidos'],
  ['nomes', 'Nomes'],
  ['morada', 'Morada'],
  ['telefone', 'Telefone'],
  ['profissao', 'Profissão'],
  ['email', 'Email'],
]

const CONDUTOR_EXTRA = [
  ['souSegurado', 'Sou o segurado'],
  ['condutorHabitual', 'Condutor habitual'],
  ['idade', 'Idade'],
  ['licencaNum', 'Licença de condução nº'],
  ['categoria', 'Categoria'],
  ['emitidoPor', 'Emitido por'],
  ['emitidoEm', 'Emitido em'],
  ['validaDe', 'Válida de'],
  ['validaA', 'Válida a'],
]

function normalizePontosEmbate(pontos) {
  if (!pontos || typeof pontos !== 'object' || Array.isArray(pontos)) return {}
  return pontos
}

function isMarked(value) {
  return value === true || value === 'X' || value === 'x' || value === 1 || value === '1'
}

function hasMarkedPontos(pontos) {
  const map = normalizePontosEmbate(pontos)
  return Object.values(map).some(isMarked)
}

function collectPontosEmbateRows(rows, sectionKey, vehicleLabel, pontos) {
  const map = normalizePontosEmbate(pontos)
  const seen = new Set()

  IMPACT_VIEWS.forEach((view) => {
    IMPACT_ZONES[view].forEach((zone) => {
      const key = `${view}_${zone.id}`
      if (!isMarked(map[key])) return
      seen.add(key)
      pushField(rows, sectionKey, zone.label, 'X', `${vehicleLabel} — ${VIEW_LABELS[view]}`)
    })
  })

  Object.entries(map).forEach(([key, value]) => {
    if (!isMarked(value) || seen.has(key)) return
    pushField(rows, sectionKey, key.replace(/_/g, ' '), 'X', vehicleLabel)
  })
}

function motorSectionHasExtras(data, key) {
  if (key === 'sec10') {
    return hasMarkedPontos(data.pontosEmbateA) || hasMarkedPontos(data.pontosEmbateB)
  }
  if (key === 'sec11') {
    return Boolean(
      data.ambosCondutoresAssinaram ||
      data.assinaturaCondutorA?.imagemDataUrl ||
      data.assinaturaCondutorB?.imagemDataUrl,
    )
  }
  return false
}

function isFilled(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'boolean') return value
  if (typeof value === 'object') return Object.values(value).some(isFilled)
  return String(value).trim() !== ''
}

function pushField(rows, sectionKey, label, value, subsection = '') {
  if (!isFilled(value)) return
  if (typeof value === 'boolean') {
    rows.push({ sectionKey, subsection, label, value: value ? 'Sim' : 'Não' })
    return
  }
  rows.push({ sectionKey, subsection, label, value: String(value).trim() })
}

function collectPerson(rows, sectionKey, prefix, person, extra = []) {
  if (!person) return
  PERSON_FIELDS.forEach(([key, label]) => {
    pushField(rows, sectionKey, label, person[key], prefix)
  })
  extra.forEach(([key, label]) => {
    pushField(rows, sectionKey, label, person[key], prefix)
  })
}

function collectMotorParticipacao(data) {
  const rows = []

  pushField(rows, 'referencia', 'Nº do sinistro', data.numeroSinistro)
  pushField(rows, 'referencia', 'Nº da apólice', data.numeroApolice)

  pushField(rows, 'sec1', 'Data do acidente', data.dataAcidente)
  pushField(rows, 'sec1', 'Hora', data.horaAcidente)
  pushField(rows, 'sec1', 'Nº veículos envolvidos', data.numVeiculosEnvolvidos)

  pushField(rows, 'sec2', 'Local (estrada/rua, localidade e distrito)', data.localAcidente)

  pushField(rows, 'sec3', 'Houve feridos, mesmo ligeiros?', data.houveFeridos)

  collectPerson(rows, 'sec4', 'Ferido / Envolvido A', data.feridoA)
  collectPerson(rows, 'sec4', 'Ferido / Envolvido B', data.feridoB)

  CIRCUNSTANCIAS_OPCOES.forEach((opt) => {
    if (data.circunstanciasA?.[opt.id]) {
      pushField(rows, 'sec5', opt.label, 'X', 'Veículo A')
    }
    if (data.circunstanciasB?.[opt.id]) {
      pushField(rows, 'sec5', opt.label, 'X', 'Veículo B')
    }
  })

  collectPerson(rows, 'sec6', 'Segurado A', data.seguradoA)
  collectPerson(rows, 'sec6', 'Segurado B', data.seguradoB)

  pushField(rows, 'sec7', 'Marca', data.marcaA, 'Veículo A')
  pushField(rows, 'sec7', 'Modelo', data.modeloA, 'Veículo A')
  pushField(rows, 'sec7', 'Nº de matrícula ou do motor', data.matriculaA, 'Veículo A')
  pushField(rows, 'sec7', 'Marca', data.marcaB, 'Veículo B')
  pushField(rows, 'sec7', 'Modelo', data.modeloB, 'Veículo B')
  pushField(rows, 'sec7', 'Nº de matrícula ou do motor', data.matriculaB, 'Veículo B')

  pushField(rows, 'sec8', 'Nome da companhia', data.seguroNomeA, 'Seguro Veículo A')
  pushField(rows, 'sec8', 'Apólice nº', data.seguroApoliceA, 'Seguro Veículo A')
  pushField(rows, 'sec8', 'Balcão', data.seguroBalcaoA, 'Seguro Veículo A')
  pushField(rows, 'sec8', 'Apólice válida até', data.seguroValidaAteA, 'Seguro Veículo A')
  pushField(rows, 'sec8', 'Os danos deste veículo estão seguros?', data.seguroDanosCobertosA, 'Seguro Veículo A')
  pushField(rows, 'sec8', 'Nome da companhia', data.seguroNomeB, 'Seguro Veículo B')
  pushField(rows, 'sec8', 'Apólice nº', data.seguroApoliceB, 'Seguro Veículo B')
  pushField(rows, 'sec8', 'Balcão', data.seguroBalcaoB, 'Seguro Veículo B')
  pushField(rows, 'sec8', 'Apólice válida até', data.seguroValidaAteB, 'Seguro Veículo B')
  pushField(rows, 'sec8', 'Os danos deste veículo estão seguros?', data.seguroDanosCobertosB, 'Seguro Veículo B')

  collectPerson(rows, 'sec9', 'Condutor Veículo A', data.condutorA, CONDUTOR_EXTRA)
  collectPerson(rows, 'sec9', 'Condutor Veículo B', data.condutorB, CONDUTOR_EXTRA)

  collectPontosEmbateRows(rows, 'sec10', 'Veículo A', data.pontosEmbateA)
  collectPontosEmbateRows(rows, 'sec10', 'Veículo B', data.pontosEmbateB)

  pushField(rows, 'sec10', 'Danos visíveis', data.danosVisiveisA, 'Veículo A')
  pushField(rows, 'sec10', 'Danos visíveis', data.danosVisiveisB, 'Veículo B')
  pushField(rows, 'sec10', 'Observações', data.observacoesA, 'Veículo A')
  pushField(rows, 'sec10', 'Observações', data.observacoesB, 'Veículo B')

  pushField(rows, 'sec11', 'Ambos os condutores assinaram?', data.ambosCondutoresAssinaram)

  pushField(rows, 'sec12', 'Testemunhas (nomes, morada e telefone)', data.testemunhas)
  pushField(rows, 'sec12', 'Outras testemunhas', data.outrasTestemunhas)

  pushField(rows, 'sec13', 'Descrição pormenorizada do acidente', data.descricaoPormenorizada)
  pushField(rows, 'sec13', 'Outros danos materiais', data.outrosDanosMateriais)
  pushField(rows, 'sec13', 'Relação com titular da apólice?', data.relacaoTitularApolice)
  pushField(rows, 'sec13', 'Se sim, indique qual', data.relacaoTitularApoliceDetalhe)
  pushField(rows, 'sec13', 'Local desta participação', data.localParticipacao)
  pushField(rows, 'sec13', 'Data desta participação', data.dataParticipacao)

  const fd = data.feridosDetalhe || {}
  pushField(rows, 'sec14', 'Nome do ferido', fd.nome, 'Feridos')
  pushField(rows, 'sec14', 'Morada', fd.morada, 'Feridos')
  pushField(rows, 'sec14', 'Profissão e idade', fd.profissaoIdade, 'Feridos')
  pushField(rows, 'sec14', 'Lesões sofridas', fd.lesoes, 'Feridos')
  pushField(rows, 'sec14', 'Primeiros socorros', fd.primeirosSocorros, 'Feridos')
  pushField(rows, 'sec14', 'Hospitalizado em', fd.hospitalizado, 'Feridos')
  pushField(rows, 'sec14', 'Indique se era', fd.tipo, 'Feridos')

  const vc = data.veiculoCaracteristicas || {}
  pushField(rows, 'sec14', 'Cor do veículo', vc.cor, 'Características do veículo')
  pushField(rows, 'sec14', 'Titular do registo', vc.titularRegisto, 'Características do veículo')
  pushField(rows, 'sec14', 'Danos anteriores?', vc.danosAnteriores, 'Características do veículo')
  pushField(rows, 'sec14', 'Quais danos anteriores?', vc.danosAnterioresQuais, 'Características do veículo')
  pushField(rows, 'sec14', 'Pode circular?', vc.podeCircular, 'Características do veículo')
  pushField(rows, 'sec14', 'Rebocava atrelado?', vc.rebocavaAtrelado, 'Características do veículo')
  pushField(rows, 'sec14', 'Oficina reparadora', vc.oficina, 'Características do veículo')
  pushField(rows, 'sec14', 'Endereço e telefone da oficina', vc.enderecoOficina, 'Características do veículo')
  pushField(rows, 'sec14', 'Data da peritagem', vc.dataPeritagem, 'Características do veículo')
  pushField(rows, 'sec14', 'Terceiro', vc.terceiro, 'Características do veículo')

  pushField(rows, 'sec14', 'Quem foi o culpado e porque?', data.culpadoOpiniao, 'Autoridades')
  pushField(rows, 'sec14', 'Auto pelas autoridades?', data.autoAutoridades, 'Autoridades')
  pushField(rows, 'sec14', 'Detalhe do auto', data.autoAutoridadesDetalhe, 'Autoridades')
  pushField(rows, 'sec14', 'Teste anti-álcool?', data.testeAlcool, 'Autoridades')
  pushField(rows, 'sec14', 'Qual interveniente', data.testeAlcoolQual, 'Autoridades')
  pushField(rows, 'sec14', 'Resultado do teste', data.testeAlcoolResultado, 'Autoridades')
  pushField(rows, 'sec14', 'Posto / brigada / esquadra', data.postoBrigada, 'Autoridades')
  pushField(rows, 'sec14', 'Nome do agente', data.nomeAgente, 'Autoridades')
  pushField(rows, 'sec14', 'Número do processo', data.numeroProcesso, 'Autoridades')
  pushField(rows, 'sec14', 'Velocidade (Km/h)', data.velocidadeKmH, 'Autoridades')

  return rows
}

function collectGenericForm(typeId, data) {
  const schema = FORM_FIELDS[typeId] || []
  const rows = []
  let currentSection = 'Dados do formulário'
  schema.forEach((item) => {
    if (item.section) {
      currentSection = item.section
      return
    }
    if (!item.id) return
    pushField(rows, 'geral', item.label, data[item.id], currentSection)
  })
  return rows
}

export function collectFilledFieldsForForm(form) {
  if (!form?.typeId) return []
  if (form.typeId === 'participacao') {
    const data = mergeParticipacaoMotorData(form.data || {})
    return collectMotorParticipacao(data)
  }
  return collectGenericForm(form.typeId, form.data || {})
}

function groupMotorFieldsBySection(fields) {
  const map = new Map()
  fields.forEach((f) => {
    if (!map.has(f.sectionKey)) map.set(f.sectionKey, [])
    map.get(f.sectionKey).push(f)
  })
  return map
}

export function collectParticipacaoPdfSections(participacao) {
  const forms = participacao?.forms || []
  const sections = []

  forms.forEach((form) => {
    const normalizedForm = form.typeId === 'participacao'
      ? { ...form, data: mergeParticipacaoMotorData(form.data || {}) }
      : form
    const data = normalizedForm.data || {}
    const fields = collectFilledFieldsForForm(normalizedForm)
    if (fields.length === 0 && form.typeId !== 'participacao') return

    if (form.typeId === 'participacao') {
      const grouped = groupMotorFieldsBySection(fields)
      MOTOR_PDF_SECTION_ORDER.forEach((key) => {
        const sectionFields = grouped.get(key) || []
        if (!sectionFields.length && !motorSectionHasExtras(data, key)) return
        sections.push({
          formType: form.typeId,
          title: MOTOR_PDF_SECTION_TITLES[key],
          fields: sectionFields,
          assinaturaCondutorA: key === 'sec11' ? data.assinaturaCondutorA : null,
          assinaturaCondutorB: key === 'sec11' ? data.assinaturaCondutorB : null,
          assinaturaCliente: key === 'sec6' ? form.assinaturaCliente : null,
        })
      })
      if (form.assinaturaCliente?.imagemDataUrl && !sections.some((s) => s.assinaturaCliente)) {
        const last = sections[sections.length - 1]
        if (last) last.assinaturaCliente = form.assinaturaCliente
      }
      return
    }

    const typeMeta = FORM_TYPES[form.typeId]
    sections.push({
      formType: form.typeId,
      title: typeMeta?.label || form.typeId,
      fields,
      assinaturaCliente: form.assinaturaCliente,
    })
  })

  return sections
}

export function collectSingleFormPdfSections(participacao, formId) {
  const form = participacao?.forms?.find((f) => f.id === formId)
  if (!form) return []
  return collectParticipacaoPdfSections({ ...participacao, forms: [form] })
}
