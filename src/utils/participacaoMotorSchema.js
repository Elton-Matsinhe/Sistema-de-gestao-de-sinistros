export const CIRCUNSTANCIAS_OPCOES = [
  { id: 'estavaEstacionado', label: 'Estava estacionado' },
  { id: 'saiaEstacionamento', label: 'Saía do estacionamento' },
  { id: 'iaEstacionar', label: 'Ia estacionar' },
  { id: 'saiaParquePrivado', label: 'Saía de um parque de estacionamento, de local privado ou um caminho particular' },
  { id: 'entravaParquePrivado', label: 'Entrava num parque de estacionamento, de local privado ou um caminho particular' },
  { id: 'entravaRotunda', label: 'Entrava numa rotunda ou praça de sentido giratório' },
  { id: 'circulavaRotunda', label: 'Circulava numa rotunda ou praça de sentido giratório' },
  { id: 'embateuTraseira', label: 'Embateu na traseira de outro veículo que circulava no mesmo sentido e na mesma fila' },
  { id: 'mesmoSentidoFilaDiferente', label: 'Circulava no mesmo sentido mas numa fila diferente' },
  { id: 'mudavaFila', label: 'Mudava de fila' },
  { id: 'ultrapassava', label: 'Ultrapassava' },
  { id: 'viravaDireita', label: 'Virava à direita' },
  { id: 'viravaEsquerda', label: 'Virava à esquerda' },
  { id: 'recuava', label: 'Recuava' },
  { id: 'sentidoContrario', label: 'Circulava na parte da faixa de rodagem reservada à circulação em sentido contrário' },
  { id: 'apresentavaDireita', label: 'Apresentava-se pela direita (num cruzamento ou entroncamento)' },
  { id: 'naoRespeitouPrioridade', label: 'Não respeitou um sinal de dar prioridade ou um semáforo vermelho' },
]

export const IMPACT_VIEWS = ['esquerda', 'direita', 'frente', 'traseira']

export const IMPACT_ZONES = {
  esquerda: [
    { id: 'pc_frente', x: 6, y: 52, label: 'Para-choques dianteiro' },
    { id: 'capo', x: 16, y: 44, label: 'Capô' },
    { id: 'para_brisas', x: 28, y: 38, label: 'Para-brisas' },
    { id: 'tejadilho', x: 42, y: 34, label: 'Tejadilho' },
    { id: 'porta_frente', x: 50, y: 46, label: 'Porta dianteira' },
    { id: 'porta_traseira', x: 62, y: 46, label: 'Porta traseira' },
    { id: 'mala', x: 74, y: 44, label: 'Mala' },
    { id: 'pc_traseiro', x: 86, y: 52, label: 'Para-choques traseiro' },
    { id: 'roda_frente', x: 26, y: 66, label: 'Roda dianteira' },
    { id: 'roda_traseira', x: 70, y: 66, label: 'Roda traseira' },
    { id: 'farol_frente', x: 10, y: 50, label: 'Farol dianteiro' },
    { id: 'farol_traseiro', x: 88, y: 50, label: 'Farol traseiro' },
  ],
  direita: [
    { id: 'pc_frente', x: 86, y: 52, label: 'Para-choques dianteiro' },
    { id: 'capo', x: 72, y: 44, label: 'Capô' },
    { id: 'para_brisas', x: 58, y: 38, label: 'Para-brisas' },
    { id: 'tejadilho', x: 42, y: 34, label: 'Tejadilho' },
    { id: 'porta_frente', x: 38, y: 46, label: 'Porta dianteira' },
    { id: 'porta_traseira', x: 26, y: 46, label: 'Porta traseira' },
    { id: 'mala', x: 14, y: 44, label: 'Mala' },
    { id: 'pc_traseiro', x: 4, y: 52, label: 'Para-choques traseiro' },
    { id: 'roda_frente', x: 64, y: 66, label: 'Roda dianteira' },
    { id: 'roda_traseira', x: 20, y: 66, label: 'Roda traseira' },
    { id: 'farol_frente', x: 82, y: 50, label: 'Farol dianteiro' },
    { id: 'farol_traseiro', x: 2, y: 50, label: 'Farol traseiro' },
  ],
  frente: [
    { id: 'pc_frente', x: 38, y: 72, label: 'Para-choques' },
    { id: 'capo', x: 36, y: 58, label: 'Capô' },
    { id: 'para_brisas', x: 34, y: 44, label: 'Para-brisas' },
    { id: 'tejadilho', x: 34, y: 30, label: 'Tejadilho' },
    { id: 'farol_esq', x: 22, y: 56, label: 'Farol esquerdo' },
    { id: 'farol_dir', x: 66, y: 56, label: 'Farol direito' },
    { id: 'roda_esq', x: 14, y: 68, label: 'Roda esquerda' },
    { id: 'roda_dir', x: 74, y: 68, label: 'Roda direita' },
  ],
  traseira: [
    { id: 'pc_traseiro', x: 38, y: 72, label: 'Para-choques' },
    { id: 'mala', x: 36, y: 58, label: 'Mala' },
    { id: 'vidro_traseiro', x: 34, y: 44, label: 'Vidro traseiro' },
    { id: 'tejadilho', x: 34, y: 30, label: 'Tejadilho' },
    { id: 'farol_esq', x: 22, y: 56, label: 'Farol esquerdo' },
    { id: 'farol_dir', x: 66, y: 56, label: 'Farol direito' },
    { id: 'roda_esq', x: 14, y: 68, label: 'Roda esquerda' },
    { id: 'roda_dir', x: 74, y: 68, label: 'Roda direita' },
  ],
}

export const TIPO_FERIDO_OPTS = [
  'Peão',
  'Ocupante do veículo A',
  'Ocupante do veículo B',
  'Segurado',
]

export const SIM_NAO = ['Sim', 'Não']

function emptyCircunstancias() {
  const map = {}
  CIRCUNSTANCIAS_OPCOES.forEach((opt) => {
    map[opt.id] = false
  })
  return map
}

function emptyPontosEmbate() {
  const map = {}
  IMPACT_VIEWS.forEach((view) => {
    IMPACT_ZONES[view].forEach((zone) => {
      map[`${view}_${zone.id}`] = false
    })
  })
  return map
}

function emptyPessoa() {
  return {
    apelidos: '',
    nomes: '',
    morada: '',
    telefone: '',
    profissao: '',
    email: '',
  }
}

export function createEmptyParticipacaoMotorData(apolice = '') {
  return {
    numeroSinistro: '',
    numeroApolice: apolice,

    dataAcidente: '',
    localAcidente: '',
    horaAcidente: '',
    houveFeridos: '',

    feridoA: emptyPessoa(),
    feridoB: emptyPessoa(),

    circunstanciasA: emptyCircunstancias(),
    circunstanciasB: emptyCircunstancias(),

    seguradoA: emptyPessoa(),
    seguradoB: emptyPessoa(),

    marcaA: '',
    modeloA: '',
    matriculaA: '',
    marcaB: '',
    modeloB: '',
    matriculaB: '',

    seguroNomeA: '',
    seguroApoliceA: '',
    seguroBalcaoA: '',
    seguroValidaAteA: '',
    seguroDanosCobertosA: '',

    seguroNomeB: '',
    seguroApoliceB: '',
    seguroBalcaoB: '',
    seguroValidaAteB: '',
    seguroDanosCobertosB: '',

    condutorA: {
      ...emptyPessoa(),
      souSegurado: '',
      condutorHabitual: '',
      idade: '',
      licencaNum: '',
      categoria: '',
      emitidoPor: '',
      emitidoEm: '',
      validaDe: '',
      validaA: '',
    },
    condutorB: {
      ...emptyPessoa(),
      souSegurado: '',
      condutorHabitual: '',
      idade: '',
      licencaNum: '',
      categoria: '',
      emitidoPor: '',
      emitidoEm: '',
      validaDe: '',
      validaA: '',
    },

    pontosEmbateA: emptyPontosEmbate(),
    pontosEmbateB: emptyPontosEmbate(),

    danosVisiveisA: '',
    danosVisiveisB: '',
    observacoesA: '',
    observacoesB: '',

    testemunhas: '',
    numVeiculosEnvolvidos: '',

    descricaoPormenorizada: '',
    outrosDanosMateriais: '',
    relacaoTitularApolice: '',
    relacaoTitularApoliceDetalhe: '',
    localParticipacao: '',
    dataParticipacao: '',

    feridosDetalhe: {
      nome: '',
      morada: '',
      profissaoIdade: '',
      lesoes: '',
      primeirosSocorros: '',
      hospitalizado: '',
      tipo: '',
    },

    veiculoCaracteristicas: {
      cor: '',
      titularRegisto: '',
      danosAnteriores: '',
      danosAnterioresQuais: '',
      podeCircular: '',
      rebocavaAtrelado: '',
      oficina: '',
      enderecoOficina: '',
      dataPeritagem: '',
      terceiro: '',
    },

    outrasTestemunhas: '',
    culpadoOpiniao: '',
    autoAutoridades: '',
    autoAutoridadesDetalhe: '',
    testeAlcool: '',
    testeAlcoolQual: '',
    testeAlcoolResultado: '',
    postoBrigada: '',
    nomeAgente: '',
    numeroProcesso: '',
    velocidadeKmH: '',

    esquemaAcidente: '',
    ambosCondutoresAssinaram: '',
    assinaturaCondutorA: null,
    assinaturaCondutorB: null,
  }
}

export function getMotorFlatFields(data) {
  const flat = {}
  const assign = (prefix, obj) => {
    if (!obj || typeof obj !== 'object') return
    Object.entries(obj).forEach(([k, v]) => {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) return
      flat[`${prefix}_${k}`] = v === true ? 'X' : v === false ? '' : String(v ?? '')
    })
  }

  Object.entries(data).forEach(([key, val]) => {
    if (val && typeof val === 'object' && !Array.isArray(val) && key !== 'assinaturaCondutorA' && key !== 'assinaturaCondutorB') {
      assign(key, val)
    } else if (typeof val === 'string' || typeof val === 'number') {
      flat[key] = String(val)
    }
  })

  return flat
}
