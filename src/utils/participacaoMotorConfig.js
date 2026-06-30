export const CIRCUNSTANCIAS_OPCOES = [
  { id: 'estacionado', label: 'Estava Estacionado' },
  { id: 'saida_estacionamento', label: 'Saía do Estacionamento' },
  { id: 'ia_estacionar', label: 'Ia estacionar' },
  { id: 'saida_parque', label: 'Saía de um parque de estacionamento, de local privado ou um caminho particular' },
  { id: 'entrava_parque', label: 'Entrava num parque de estacionamento, de local privado ou um caminho particular' },
  { id: 'entrava_rotunda', label: 'Entrava numa rotunda ou praça de sentido giratório' },
  { id: 'circulava_rotunda', label: 'Circulava numa rotunda ou praça de sentido giratório' },
  { id: 'embateu_traseira', label: 'Embateu na traseira de outro veículo que circulava no mesmo sentido e na mesma fila' },
  { id: 'mesmo_sentido_fila_diferente', label: 'Circulava no mesmo sentido mas numa fila diferente' },
  { id: 'mudava_fila', label: 'Mudava de fila' },
  { id: 'ultrapassava', label: 'Ultrapassava' },
  { id: 'virava_direita', label: 'Virava à direita' },
  { id: 'virava_esquerda', label: 'Virava à esquerda' },
  { id: 'recuava', label: 'Recuava' },
  { id: 'sentido_contrario', label: 'Circulava na parte da faixa de rodagem reservada à circulação em sentido contrário' },
  { id: 'apresentava_direita', label: 'Apresentava-se pela direita (num cruzamento ou entroncamento)' },
  { id: 'nao_respeitou_sinal', label: 'Não respeitou um sinal de dar prioridade ou um semáforo vermelho' },
]

/** Zonas de embate — posições em % dentro de cada vista do diagrama */
export const PONTOS_EMBATE_ZONAS = {
  esquerda: [
    { id: 'esq_para_f', x: 6, y: 44, w: 10, h: 9 },
    { id: 'esq_porta_f', x: 24, y: 40, w: 12, h: 11 },
    { id: 'esq_porta_t', x: 42, y: 40, w: 12, h: 11 },
    { id: 'esq_para_t', x: 58, y: 44, w: 10, h: 9 },
    { id: 'esq_teto', x: 30, y: 28, w: 28, h: 8 },
    { id: 'esq_roda_f', x: 18, y: 52, w: 8, h: 8 },
    { id: 'esq_roda_t', x: 52, y: 52, w: 8, h: 8 },
  ],
  direita: [
    { id: 'dir_para_f', x: 58, y: 44, w: 10, h: 9 },
    { id: 'dir_porta_f', x: 40, y: 40, w: 12, h: 11 },
    { id: 'dir_porta_t', x: 22, y: 40, w: 12, h: 11 },
    { id: 'dir_para_t', x: 6, y: 44, w: 10, h: 9 },
    { id: 'dir_teto', x: 24, y: 28, w: 28, h: 8 },
    { id: 'dir_roda_f', x: 48, y: 52, w: 8, h: 8 },
    { id: 'dir_roda_t', x: 14, y: 52, w: 8, h: 8 },
  ],
  frente: [
    { id: 'fr_opt_esq', x: 18, y: 42, w: 10, h: 10 },
    { id: 'fr_capo_esq', x: 30, y: 38, w: 12, h: 12 },
    { id: 'fr_capo_dir', x: 48, y: 38, w: 12, h: 12 },
    { id: 'fr_opt_dir', x: 62, y: 42, w: 10, h: 10 },
    { id: 'fr_para', x: 38, y: 52, w: 20, h: 8 },
  ],
  traseira: [
    { id: 'tr_opt_esq', x: 18, y: 42, w: 10, h: 10 },
    { id: 'tr_porta_esq', x: 30, y: 38, w: 12, h: 12 },
    { id: 'tr_porta_dir', x: 48, y: 38, w: 12, h: 12 },
    { id: 'tr_opt_dir', x: 62, y: 42, w: 10, h: 10 },
    { id: 'tr_para', x: 38, y: 52, w: 20, h: 8 },
  ],
}

/** Mapeamento zona → coordenadas PDF (página 1, coluna A ou B) */
export const PONTOS_EMBATE_PDF = {
  A: {
    esquerda: { ox: 42, oy: 680, scale: 0.55 },
    direita: { ox: 42, oy: 520, scale: 0.55 },
    frente: { ox: 155, oy: 680, scale: 0.55 },
    traseira: { ox: 155, oy: 520, scale: 0.55 },
  },
  B: {
    esquerda: { ox: 520, oy: 680, scale: 0.55 },
    direita: { ox: 520, oy: 520, scale: 0.55 },
    frente: { ox: 633, oy: 680, scale: 0.55 },
    traseira: { ox: 633, oy: 520, scale: 0.55 },
  },
}

const SIM_NAO = ['Sim', 'Não']
const FERIDO_TIPO = ['Peão', 'Ocupante do veículo A', 'Ocupante do veículo B', 'Segurado']

export function createMotorEmptyData(apolice = '') {
  return {
    numeroSinistro: '',
    numeroApolice: apolice,

    dataAcidente: '',
    localAcidente: '',
    horaAcidente: '',
    houveFeridos: '',
    descricaoPormenorizada: '',

    nVeiculosEnvolvidos: '',

    a_seg_apelidos: '',
    a_seg_nomes: '',
    a_seg_morada: '',
    a_seg_telefone: '',
    a_seg_profissao: '',
    a_seg_email: '',

    b_seg_apelidos: '',
    b_seg_nomes: '',
    b_seg_morada: '',
    b_seg_telefone: '',
    b_seg_profissao: '',
    b_seg_email: '',

    a_marca: '',
    a_modelo: '',
    a_matricula: '',

    b_marca: '',
    b_modelo: '',
    b_matricula: '',

    a_seguro_nome: '',
    a_seguro_apolice: '',
    a_seguro_balcao: '',
    a_seguro_validade: '',
    a_seguro_danos_seguros: '',

    b_seguro_nome: '',
    b_seguro_apolice: '',
    b_seguro_balcao: '',
    b_seguro_validade: '',
    b_seguro_danos_seguros: '',

    a_cond_sou_segurado: '',
    a_cond_apelidos: '',
    a_cond_nomes: '',
    a_cond_morada: '',
    a_cond_telefone: '',
    a_cond_profissao: '',
    a_cond_email: '',
    a_cond_habitual: '',
    a_cond_idade: '',
    a_cond_carta_num: '',
    a_cond_categoria: '',
    a_cond_emitido_por: '',
    a_cond_emitido_em: '',
    a_cond_valida_de: '',
    a_cond_valida_a: '',

    b_cond_sou_segurado: '',
    b_cond_apelidos: '',
    b_cond_nomes: '',
    b_cond_morada: '',
    b_cond_telefone: '',
    b_cond_profissao: '',
    b_cond_email: '',
    b_cond_habitual: '',
    b_cond_idade: '',
    b_cond_carta_num: '',
    b_cond_categoria: '',
    b_cond_emitido_por: '',
    b_cond_emitido_em: '',
    b_cond_valida_de: '',
    b_cond_valida_a: '',

    circunstanciasA: [],
    circunstanciasB: [],

    pontosEmbateA: [],
    pontosEmbateB: [],

    a_danos_visiveis: '',
    b_danos_visiveis: '',
    a_observacoes: '',
    b_observacoes: '',

    esquemaAcidente: '',

    ambosCondutoresAssinaram: '',

    testemunhas: '',
    outrasTestemunhas: '',

    outrosDanosMateriais: '',
    existeRelacaoTitular: '',
    localParticipacao: '',
    dataParticipacao: '',

    ferido_nome: '',
    ferido_morada: '',
    ferido_profissao_idade: '',
    ferido_lesoes: '',
    ferido_primeiros_socorros: '',
    ferido_hospitalizado: '',
    ferido_tipo: '',

    prop_nome: '',
    prop_morada: '',
    prop_natureza_danos: '',

    cor: '',
    titular_registo: '',
    danos_anteriores: '',
    pode_circular: '',
    rebocava_atrelado: '',
    oficina_reparadora: '',
    oficina_endereco: '',
    data_peritagem: '',

    opiniao_culpado: '',
    levantou_auto: '',
    teste_alcool: '',
    teste_alcool_qual: '',
    resultado_teste: '',
    posto_brigada: '',
    nome_agente: '',
    numero_processo: '',
    velocidade_kmh: '',
  }
}

export const MOTOR_SECTIONS = [
  { id: 'acidente', label: '1. Acidente', step: 1 },
  { id: 'veiculos', label: '5–9. Veículos A e B', step: 2 },
  { id: 'circunstancias', label: 'Circunstâncias', step: 3 },
  { id: 'embate', label: '10–15. Embate e Assinaturas', step: 4 },
  { id: 'complementar', label: 'Testemunhas e Autoridades', step: 5 },
  { id: 'feridos', label: 'Feridos e Danos', step: 6 },
]

export { SIM_NAO, FERIDO_TIPO }

export function extractMotorProcessData(data) {
  const nome = [data.a_seg_nomes, data.a_seg_apelidos].filter(Boolean).join(' ').trim()
  return {
    numeroSinistro: data.numeroSinistro || '',
    matricula: data.a_matricula || '',
    cliente: nome || data.a_cond_nomes || '',
    dataAcidente: data.dataAcidente || '',
    dataNotificacao: data.dataParticipacao || new Date().toISOString().slice(0, 10),
    descricao: [
      data.descricaoPormenorizada,
      data.a_danos_visiveis && `Danos A: ${data.a_danos_visiveis}`,
      data.b_danos_visiveis && `Danos B: ${data.b_danos_visiveis}`,
    ]
      .filter(Boolean)
      .join(' | ')
      .slice(0, 500),
  }
}
