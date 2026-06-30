import { useState } from 'react'
import {
  FaCalendarAlt,
  FaCar,
  FaClipboardList,
  FaHashtag,
  FaIdCard,
  FaMapMarkerAlt,
  FaPhone,
  FaRegUser,
  FaShieldAlt,
} from 'react-icons/fa'
import CircunstanciasVeiculos from './CircunstanciasVeiculos'
import CondutoresAssinaturaCentro from './CondutoresAssinaturaCentro'
import ParticipacaoAccordionSection from './ParticipacaoAccordionSection'
import ParticipacaoField from './ParticipacaoField'
import PontosEmbateVeiculo from './PontosEmbateVeiculo'
import { SIM_NAO, TIPO_FERIDO_OPTS } from '../../utils/participacaoMotorSchema'

function PessoaFields({ prefix, data, onChange, extra = [] }) {
  const set = (key, val) => onChange({ ...data, [key]: val })
  const fields = [
    { id: 'apelidos', label: 'Apelidos', icon: FaRegUser },
    { id: 'nomes', label: 'Nomes', icon: FaRegUser },
    { id: 'telefone', label: 'Telefone', icon: FaPhone, numeric: true, type: 'tel' },
    { id: 'profissao', label: 'Profissão', icon: FaIdCard },
    { id: 'email', label: 'Email', icon: FaRegUser, type: 'email' },
    { id: 'morada', label: 'Morada', icon: FaMapMarkerAlt, type: 'textarea' },
    ...extra,
  ]

  return (
    <div className="participacao-form-section participacao-form-section--person">
      {fields.map((f) => (
        <ParticipacaoField
          key={`${prefix}-${f.id}`}
          field={{ ...f, id: `${prefix}_${f.id}` }}
          value={data?.[f.id] ?? ''}
          onChange={(v) => set(f.id, v)}
          span={f.type === 'textarea' ? 'full' : 1}
        />
      ))}
    </div>
  )
}

function DualColumn({ titleA, titleB, childrenA, childrenB, number }) {
  return (
    <div className="participacao-dual-columns">
      <div className="participacao-dual-col participacao-dual-col--a">
        <h4>{number ? `${number} — ` : ''}{titleA}</h4>
        {childrenA}
      </div>
      <div className="participacao-dual-col participacao-dual-col--b">
        <h4>{number ? `${number} — ` : ''}{titleB}</h4>
        {childrenB}
      </div>
    </div>
  )
}

const INITIAL_OPEN = {
  referencia: true,
  acidente: false,
  feridos: false,
  circunstancias: false,
  segurado: false,
  veiculos: false,
  embate: false,
  testemunhas: false,
  complementos: false,
}

export default function ParticipacaoMotorClaimForm({ data, onChange }) {
  const [openSections, setOpenSections] = useState(INITIAL_OPEN)
  const toggle = (id) => setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }))

  const set = (key, value) => onChange(key, value)
  const setNested = (parent, key, value) => {
    onChange(parent, { ...data[parent], [key]: value })
  }

  const condutorExtra = () => [
    { id: 'souSegurado', label: 'Sou o segurado', type: 'select', icon: FaShieldAlt, options: SIM_NAO },
    { id: 'condutorHabitual', label: 'É o condutor habitual da viatura?', type: 'select', icon: FaCar, options: SIM_NAO },
    { id: 'idade', label: 'Idade', type: 'number', icon: FaIdCard, numeric: true },
    { id: 'licencaNum', label: 'Licença de condução nº', icon: FaIdCard },
    { id: 'categoria', label: 'Categoria', icon: FaIdCard },
    { id: 'emitidoPor', label: 'Emitido por', icon: FaMapMarkerAlt },
    { id: 'emitidoEm', label: 'Em', type: 'date', icon: FaCalendarAlt },
    { id: 'validaDe', label: 'Válida de', type: 'date', icon: FaCalendarAlt },
    { id: 'validaA', label: 'Válida a', type: 'date', icon: FaCalendarAlt },
  ]

  return (
    <div className="participacao-motor-form participacao-motor-form--accordion">
      <div className="participacao-motor-banner">
        <strong>Participação de Sinistro</strong>
        <span>Ramo Automóvel / Motor Claim Form</span>
      </div>

      <p className="participacao-accordion-hint">Clique em cada secção para abrir ou fechar o formulário.</p>

      <ParticipacaoAccordionSection
        id="referencia"
        title="Referência do sinistro"
        icon={FaHashtag}
        open={openSections.referencia}
        onToggle={() => toggle('referencia')}
        number={null}
      >
        <div className="participacao-form-section participacao-form-section--inline">
          <ParticipacaoField field={{ id: 'numeroSinistro', label: 'Nº do sinistro', icon: FaHashtag, placeholder: 'Editável' }} value={data.numeroSinistro} onChange={(v) => set('numeroSinistro', v)} />
          <ParticipacaoField field={{ id: 'numeroApolice', label: 'Nº da apólice', icon: FaHashtag, readOnly: true }} value={data.numeroApolice} onChange={() => {}} readOnly />
        </div>
      </ParticipacaoAccordionSection>

      <ParticipacaoAccordionSection
        id="acidente"
        number="1–3"
        title="Data, hora, local, veículos envolvidos e feridos"
        icon={FaCalendarAlt}
        open={openSections.acidente}
        onToggle={() => toggle('acidente')}
      >
        <div className="participacao-form-section">
          <ParticipacaoField field={{ id: 'dataAcidente', label: '1. Data do acidente', type: 'date', icon: FaCalendarAlt, required: true }} value={data.dataAcidente} onChange={(v) => set('dataAcidente', v)} />
          <ParticipacaoField field={{ id: 'horaAcidente', label: 'Hora', type: 'time', icon: FaCalendarAlt }} value={data.horaAcidente} onChange={(v) => set('horaAcidente', v)} />
          <ParticipacaoField field={{ id: 'numVeiculos', label: 'Nº veículos envolvidos', type: 'number', icon: FaCar, numeric: true }} value={data.numVeiculosEnvolvidos} onChange={(v) => set('numVeiculosEnvolvidos', v)} />
          <ParticipacaoField span="full" field={{ id: 'localAcidente', label: '2. Local (estrada/rua, localidade e distrito)', icon: FaMapMarkerAlt, required: true }} value={data.localAcidente} onChange={(v) => set('localAcidente', v)} />
          <ParticipacaoField field={{ id: 'houveFeridos', label: '3. Houve feridos, mesmo ligeiros?', type: 'select', icon: FaRegUser, options: SIM_NAO }} value={data.houveFeridos} onChange={(v) => set('houveFeridos', v)} />
        </div>
      </ParticipacaoAccordionSection>

      <ParticipacaoAccordionSection
        id="feridos"
        number="4"
        title="Feridos / envolvidos"
        icon={FaRegUser}
        open={openSections.feridos}
        onToggle={() => toggle('feridos')}
      >
        <DualColumn
          titleA="Ferido / Envolvido A"
          titleB="Ferido / Envolvido B"
          childrenA={<PessoaFields prefix="feridoA" data={data.feridoA} onChange={(v) => set('feridoA', v)} />}
          childrenB={<PessoaFields prefix="feridoB" data={data.feridoB} onChange={(v) => set('feridoB', v)} />}
        />
      </ParticipacaoAccordionSection>

      <ParticipacaoAccordionSection
        id="circunstancias"
        number="5"
        title="Circunstâncias aplicáveis"
        icon={FaClipboardList}
        subtitle="Marque (X) para cada veículo"
        open={openSections.circunstancias}
        onToggle={() => toggle('circunstancias')}
      >
        <CircunstanciasVeiculos
          circunstanciasA={data.circunstanciasA}
          circunstanciasB={data.circunstanciasB}
          onChangeA={(v) => set('circunstanciasA', v)}
          onChangeB={(v) => set('circunstanciasB', v)}
        />
      </ParticipacaoAccordionSection>

      <ParticipacaoAccordionSection
        id="segurado"
        number="6"
        title="Segurado (documento de seguro)"
        icon={FaRegUser}
        open={openSections.segurado}
        onToggle={() => toggle('segurado')}
      >
        <DualColumn
          titleA="Segurado A"
          titleB="Segurado B"
          number="6"
          childrenA={<PessoaFields prefix="segA" data={data.seguradoA} onChange={(v) => set('seguradoA', v)} />}
          childrenB={<PessoaFields prefix="segB" data={data.seguradoB} onChange={(v) => set('seguradoB', v)} />}
        />
      </ParticipacaoAccordionSection>

      <ParticipacaoAccordionSection
        id="veiculos"
        number="7–9"
        title="Veículos, seguros e condutores"
        icon={FaCar}
        open={openSections.veiculos}
        onToggle={() => toggle('veiculos')}
      >
        <DualColumn
          titleA="Veículo A"
          titleB="Veículo B"
          number="7"
          childrenA={(
            <div className="participacao-form-section">
              <ParticipacaoField field={{ id: 'marcaA', label: 'Marca', icon: FaCar }} value={data.marcaA} onChange={(v) => set('marcaA', v)} />
              <ParticipacaoField field={{ id: 'modeloA', label: 'Modelo', icon: FaCar }} value={data.modeloA} onChange={(v) => set('modeloA', v)} />
              <ParticipacaoField field={{ id: 'matriculaA', label: 'Nº de matrícula ou do motor', icon: FaHashtag, required: true }} value={data.matriculaA} onChange={(v) => set('matriculaA', v)} />
            </div>
          )}
          childrenB={(
            <div className="participacao-form-section">
              <ParticipacaoField field={{ id: 'marcaB', label: 'Marca', icon: FaCar }} value={data.marcaB} onChange={(v) => set('marcaB', v)} />
              <ParticipacaoField field={{ id: 'modeloB', label: 'Modelo', icon: FaCar }} value={data.modeloB} onChange={(v) => set('modeloB', v)} />
              <ParticipacaoField field={{ id: 'matriculaB', label: 'Nº de matrícula ou do motor', icon: FaHashtag }} value={data.matriculaB} onChange={(v) => set('matriculaB', v)} />
            </div>
          )}
        />
        <DualColumn
          titleA="Seguro Veículo A"
          titleB="Seguro Veículo B"
          number="8"
          childrenA={(
            <div className="participacao-form-section">
              <ParticipacaoField field={{ id: 'sna', label: 'Nome', icon: FaShieldAlt }} value={data.seguroNomeA} onChange={(v) => set('seguroNomeA', v)} />
              <ParticipacaoField field={{ id: 'saa', label: 'Apólice Nº', icon: FaHashtag }} value={data.seguroApoliceA} onChange={(v) => set('seguroApoliceA', v)} />
              <ParticipacaoField field={{ id: 'sba', label: 'Balcão', icon: FaMapMarkerAlt }} value={data.seguroBalcaoA} onChange={(v) => set('seguroBalcaoA', v)} />
              <ParticipacaoField field={{ id: 'sva', label: 'Apólice válida até', type: 'date', icon: FaCalendarAlt }} value={data.seguroValidaAteA} onChange={(v) => set('seguroValidaAteA', v)} />
              <ParticipacaoField field={{ id: 'sda', label: 'Os danos deste veículo estão seguros?', type: 'select', icon: FaShieldAlt, options: SIM_NAO }} value={data.seguroDanosCobertosA} onChange={(v) => set('seguroDanosCobertosA', v)} />
            </div>
          )}
          childrenB={(
            <div className="participacao-form-section">
              <ParticipacaoField field={{ id: 'snb', label: 'Nome', icon: FaShieldAlt }} value={data.seguroNomeB} onChange={(v) => set('seguroNomeB', v)} />
              <ParticipacaoField field={{ id: 'sab', label: 'Apólice Nº', icon: FaHashtag }} value={data.seguroApoliceB} onChange={(v) => set('seguroApoliceB', v)} />
              <ParticipacaoField field={{ id: 'sbb', label: 'Balcão', icon: FaMapMarkerAlt }} value={data.seguroBalcaoB} onChange={(v) => set('seguroBalcaoB', v)} />
              <ParticipacaoField field={{ id: 'svb', label: 'Apólice válida até', type: 'date', icon: FaCalendarAlt }} value={data.seguroValidaAteB} onChange={(v) => set('seguroValidaAteB', v)} />
              <ParticipacaoField field={{ id: 'sdb', label: 'Os danos deste veículo estão seguros?', type: 'select', icon: FaShieldAlt, options: SIM_NAO }} value={data.seguroDanosCobertosB} onChange={(v) => set('seguroDanosCobertosB', v)} />
            </div>
          )}
        />
        <DualColumn
          titleA="Condutor Veículo A"
          titleB="Condutor Veículo B"
          number="9"
          childrenA={<PessoaFields prefix="cA" data={data.condutorA} onChange={(v) => set('condutorA', v)} extra={condutorExtra()} />}
          childrenB={<PessoaFields prefix="cB" data={data.condutorB} onChange={(v) => set('condutorB', v)} extra={condutorExtra()} />}
        />
      </ParticipacaoAccordionSection>

      <ParticipacaoAccordionSection
        id="embate"
        number="10–11"
        title="Pontos de embate, danos e assinaturas"
        icon={FaShieldAlt}
        open={openSections.embate}
        onToggle={() => toggle('embate')}
      >
        <div className="participacao-embate-triple">
          <div className="participacao-embate-col">
            <PontosEmbateVeiculo label="Veículo A" value={data.pontosEmbateA} onChange={(v) => set('pontosEmbateA', v)} />
            <ParticipacaoField span="full" field={{ id: 'danosA', label: 'Danos visíveis — Veículo A', type: 'textarea', icon: FaClipboardList }} value={data.danosVisiveisA} onChange={(v) => set('danosVisiveisA', v)} />
            <ParticipacaoField span="full" field={{ id: 'obsA', label: 'Observações — Veículo A', type: 'textarea', icon: FaClipboardList }} value={data.observacoesA} onChange={(v) => set('observacoesA', v)} />
          </div>
          <CondutoresAssinaturaCentro
            ambosCondutoresAssinaram={data.ambosCondutoresAssinaram}
            assinaturaA={data.assinaturaCondutorA}
            assinaturaB={data.assinaturaCondutorB}
            onChange={set}
          />
          <div className="participacao-embate-col">
            <PontosEmbateVeiculo label="Veículo B" value={data.pontosEmbateB} onChange={(v) => set('pontosEmbateB', v)} />
            <ParticipacaoField span="full" field={{ id: 'danosB', label: 'Danos visíveis — Veículo B', type: 'textarea', icon: FaClipboardList }} value={data.danosVisiveisB} onChange={(v) => set('danosVisiveisB', v)} />
            <ParticipacaoField span="full" field={{ id: 'obsB', label: 'Observações — Veículo B', type: 'textarea', icon: FaClipboardList }} value={data.observacoesB} onChange={(v) => set('observacoesB', v)} />
          </div>
        </div>
      </ParticipacaoAccordionSection>

      <ParticipacaoAccordionSection
        id="testemunhas"
        number="12"
        title="Testemunhas"
        icon={FaRegUser}
        open={openSections.testemunhas}
        onToggle={() => toggle('testemunhas')}
      >
        <div className="participacao-form-section">
          <ParticipacaoField span="full" field={{ id: 'testemunhas', label: 'Nomes, morada e telefone — passageiros A ou B', type: 'textarea', icon: FaRegUser }} value={data.testemunhas} onChange={(v) => set('testemunhas', v)} />
        </div>
      </ParticipacaoAccordionSection>

      <ParticipacaoAccordionSection
        id="complementos"
        number="13–14"
        title="Descrição, feridos, veículo e autoridades"
        icon={FaClipboardList}
        open={openSections.complementos}
        onToggle={() => toggle('complementos')}
      >
        <div className="participacao-form-section">
          <ParticipacaoField span="full" field={{ id: 'desc', label: 'Descrição pormenorizada do acidente', type: 'textarea', icon: FaClipboardList, required: true }} value={data.descricaoPormenorizada} onChange={(v) => set('descricaoPormenorizada', v)} />
          <ParticipacaoField span="full" field={{ id: 'outros', label: 'Outros danos materiais', type: 'textarea', icon: FaClipboardList }} value={data.outrosDanosMateriais} onChange={(v) => set('outrosDanosMateriais', v)} />
          <ParticipacaoField field={{ id: 'rel', label: 'Relação com titular da apólice?', type: 'select', icon: FaRegUser, options: SIM_NAO }} value={data.relacaoTitularApolice} onChange={(v) => set('relacaoTitularApolice', v)} />
          <ParticipacaoField field={{ id: 'reld', label: 'Se sim, indique qual', icon: FaRegUser }} value={data.relacaoTitularApoliceDetalhe} onChange={(v) => set('relacaoTitularApoliceDetalhe', v)} />
          <ParticipacaoField field={{ id: 'locP', label: 'Local desta participação', icon: FaMapMarkerAlt }} value={data.localParticipacao} onChange={(v) => set('localParticipacao', v)} />
          <ParticipacaoField field={{ id: 'datP', label: 'Data desta participação', type: 'date', icon: FaCalendarAlt }} value={data.dataParticipacao} onChange={(v) => set('dataParticipacao', v)} />
        </div>
        <div className="participacao-form-section">
          <ParticipacaoField field={{ id: 'fdn', label: 'Ferido — Nome', icon: FaRegUser }} value={data.feridosDetalhe?.nome} onChange={(v) => setNested('feridosDetalhe', 'nome', v)} />
          <ParticipacaoField field={{ id: 'fdm', label: 'Ferido — Morada', icon: FaMapMarkerAlt }} value={data.feridosDetalhe?.morada} onChange={(v) => setNested('feridosDetalhe', 'morada', v)} />
          <ParticipacaoField field={{ id: 'fdp', label: 'Profissão e idade', icon: FaIdCard }} value={data.feridosDetalhe?.profissaoIdade} onChange={(v) => setNested('feridosDetalhe', 'profissaoIdade', v)} />
          <ParticipacaoField span="full" field={{ id: 'fdl', label: 'Lesões sofridas', type: 'textarea', icon: FaClipboardList }} value={data.feridosDetalhe?.lesoes} onChange={(v) => setNested('feridosDetalhe', 'lesoes', v)} />
          <ParticipacaoField field={{ id: 'fdps', label: 'Primeiros socorros', icon: FaClipboardList }} value={data.feridosDetalhe?.primeirosSocorros} onChange={(v) => setNested('feridosDetalhe', 'primeirosSocorros', v)} />
          <ParticipacaoField field={{ id: 'fdh', label: 'Hospitalizado em', icon: FaMapMarkerAlt }} value={data.feridosDetalhe?.hospitalizado} onChange={(v) => setNested('feridosDetalhe', 'hospitalizado', v)} />
          <ParticipacaoField field={{ id: 'fdt', label: 'Indique se era', type: 'select', icon: FaRegUser, options: TIPO_FERIDO_OPTS }} value={data.feridosDetalhe?.tipo} onChange={(v) => setNested('feridosDetalhe', 'tipo', v)} />
        </div>
        <div className="participacao-form-section">
          <ParticipacaoField field={{ id: 'vcor', label: 'Cor do veículo', icon: FaCar }} value={data.veiculoCaracteristicas?.cor} onChange={(v) => setNested('veiculoCaracteristicas', 'cor', v)} />
          <ParticipacaoField field={{ id: 'vtit', label: 'Titular do registo', icon: FaRegUser }} value={data.veiculoCaracteristicas?.titularRegisto} onChange={(v) => setNested('veiculoCaracteristicas', 'titularRegisto', v)} />
          <ParticipacaoField field={{ id: 'vdan', label: 'Danos anteriores?', type: 'select', icon: FaCar, options: SIM_NAO }} value={data.veiculoCaracteristicas?.danosAnteriores} onChange={(v) => setNested('veiculoCaracteristicas', 'danosAnteriores', v)} />
          <ParticipacaoField field={{ id: 'vdanq', label: 'Quais danos anteriores?', icon: FaClipboardList }} value={data.veiculoCaracteristicas?.danosAnterioresQuais} onChange={(v) => setNested('veiculoCaracteristicas', 'danosAnterioresQuais', v)} />
          <ParticipacaoField field={{ id: 'vcirc', label: 'Pode circular?', type: 'select', icon: FaCar, options: SIM_NAO }} value={data.veiculoCaracteristicas?.podeCircular} onChange={(v) => setNested('veiculoCaracteristicas', 'podeCircular', v)} />
          <ParticipacaoField field={{ id: 'vreb', label: 'Rebocava atrelado?', type: 'select', icon: FaCar, options: SIM_NAO }} value={data.veiculoCaracteristicas?.rebocavaAtrelado} onChange={(v) => setNested('veiculoCaracteristicas', 'rebocavaAtrelado', v)} />
          <ParticipacaoField field={{ id: 'vof', label: 'Oficina reparadora', icon: FaCar }} value={data.veiculoCaracteristicas?.oficina} onChange={(v) => setNested('veiculoCaracteristicas', 'oficina', v)} />
          <ParticipacaoField field={{ id: 'vend', label: 'Endereço e telefone da oficina', icon: FaPhone }} value={data.veiculoCaracteristicas?.enderecoOficina} onChange={(v) => setNested('veiculoCaracteristicas', 'enderecoOficina', v)} />
          <ParticipacaoField field={{ id: 'vper', label: 'Data da peritagem', type: 'date', icon: FaCalendarAlt }} value={data.veiculoCaracteristicas?.dataPeritagem} onChange={(v) => setNested('veiculoCaracteristicas', 'dataPeritagem', v)} />
          <ParticipacaoField field={{ id: 'vter', label: 'Terceiro', icon: FaRegUser }} value={data.veiculoCaracteristicas?.terceiro} onChange={(v) => setNested('veiculoCaracteristicas', 'terceiro', v)} />
        </div>
        <div className="participacao-form-section">
          <ParticipacaoField span="full" field={{ id: 'ot', label: 'Outras testemunhas', type: 'textarea', icon: FaRegUser }} value={data.outrasTestemunhas} onChange={(v) => set('outrasTestemunhas', v)} />
          <ParticipacaoField span="full" field={{ id: 'cul', label: 'Quem foi o culpado e porque?', type: 'textarea', icon: FaClipboardList }} value={data.culpadoOpiniao} onChange={(v) => set('culpadoOpiniao', v)} />
          <ParticipacaoField field={{ id: 'auto', label: 'Auto pelas autoridades?', type: 'select', icon: FaClipboardList, options: SIM_NAO }} value={data.autoAutoridades} onChange={(v) => set('autoAutoridades', v)} />
          <ParticipacaoField field={{ id: 'autod', label: 'Detalhe do auto', icon: FaClipboardList }} value={data.autoAutoridadesDetalhe} onChange={(v) => set('autoAutoridadesDetalhe', v)} />
          <ParticipacaoField field={{ id: 'alc', label: 'Teste anti-álcool?', type: 'select', icon: FaClipboardList, options: SIM_NAO }} value={data.testeAlcool} onChange={(v) => set('testeAlcool', v)} />
          <ParticipacaoField field={{ id: 'alcq', label: 'Qual interveniente', icon: FaRegUser }} value={data.testeAlcoolQual} onChange={(v) => set('testeAlcoolQual', v)} />
          <ParticipacaoField field={{ id: 'alcr', label: 'Resultado do teste', icon: FaClipboardList }} value={data.testeAlcoolResultado} onChange={(v) => set('testeAlcoolResultado', v)} />
          <ParticipacaoField field={{ id: 'posto', label: 'Posto / brigada / esquadra', icon: FaMapMarkerAlt }} value={data.postoBrigada} onChange={(v) => set('postoBrigada', v)} />
          <ParticipacaoField field={{ id: 'agente', label: 'Nome do agente', icon: FaRegUser }} value={data.nomeAgente} onChange={(v) => set('nomeAgente', v)} />
          <ParticipacaoField field={{ id: 'nproc', label: 'Número do processo', icon: FaHashtag }} value={data.numeroProcesso} onChange={(v) => set('numeroProcesso', v)} />
          <ParticipacaoField field={{ id: 'vel', label: 'Velocidade (Km/h)', type: 'number', icon: FaCar, numeric: true }} value={data.velocidadeKmH} onChange={(v) => set('velocidadeKmH', v)} />
        </div>
      </ParticipacaoAccordionSection>
    </div>
  )
}
