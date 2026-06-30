import { useEffect, useState } from 'react'
import { FaCalendarAlt, FaCar, FaFileAlt, FaHashtag, FaPlusCircle, FaRegUser, FaSave } from 'react-icons/fa'
import SinistroDateField from '../components/sinistro/SinistroDateField'
import { createProcess, peekNextNumeroApolice } from '../utils/processes'
import { normalizeMatricula } from '../utils/matriculaInput'

export default function SinistroCreatePage() {
  const [numeroSinistro, setNumeroSinistro] = useState('')
  const [proximaApolice, setProximaApolice] = useState(() => peekNextNumeroApolice())
  const [matricula, setMatricula] = useState('')
  const [cliente, setCliente] = useState('')
  const [dataAcidente, setDataAcidente] = useState('')
  const [dataNotificacao, setDataNotificacao] = useState('')
  const [descricao, setDescricao] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setProximaApolice(peekNextNumeroApolice())
  }, [message])

  const handleSubmit = (event) => {
    event.preventDefault()
    const process = createProcess({
      numeroSinistro,
      matricula,
      cliente,
      dataAcidente,
      dataNotificacao,
      descricao,
    })
    setNumeroSinistro('')
    setProximaApolice(peekNextNumeroApolice())
    setMatricula('')
    setCliente('')
    setDataAcidente('')
    setDataNotificacao('')
    setDescricao('')
    setMessage(
      `Processo ${process.numeroSinistro} criado com sucesso. Apólice: ${process.numeroApolice}. Status inicial: Iniciado.`,
    )
  }

  return (
    <div className="form-page">
      <div className="sinistro-page-hero">
        <div className="sinistro-page-hero__icon"><FaPlusCircle /></div>
        <div>
          <h1 className="dash-title sinistro-page-hero__title">Criar Processo</h1>
          <p className="form-subtitle">Registo inicial do sinistro para iniciar o fluxo interno.</p>
        </div>
      </div>

      <form className="form-card form-card--wide sinistro-create-grid" onSubmit={handleSubmit}>
        <div className="form-section-title field-full">Dados do processo</div>

        <label className="field-group">
          <FaHashtag className="field-icon" />
          <input
            type="text"
            placeholder="Nº do sinistro"
            required
            value={numeroSinistro}
            onChange={(event) => setNumeroSinistro(event.target.value)}
          />
        </label>

        <label className="field-group field-readonly">
          <FaHashtag className="field-icon" />
          <input type="text" value={proximaApolice} readOnly aria-label="Nº da apólice (gerado automaticamente)" />
          <small></small>
        </label>

        <label className="field-group sinistro-matricula-field">
          <FaCar className="field-icon" />
          <input
            type="text"
            placeholder="Matrícula (ex: ABC-123-XY)"
            required
            value={matricula}
            onChange={(event) => setMatricula(normalizeMatricula(event.target.value))}
            style={{ textTransform: 'uppercase' }}
            autoComplete="off"
            spellCheck={false}
          />
          <small></small>
        </label>

        <label className="field-group">
          <FaRegUser className="field-icon" />
          <input
            type="text"
            placeholder="Nome do cliente"
            required
            value={cliente}
            onChange={(event) => setCliente(event.target.value)}
          />
        </label>

        <div className="sinistro-dates-card field-full">
          <div className="sinistro-dates-card__head">
            <FaCalendarAlt aria-hidden="true" />
            <div>
              <h4>Datas e descrição</h4>
              <p>Indique quando ocorreu o sinistro e quando foi notificado à seguradora.</p>
            </div>
          </div>
          <div className="sinistro-dates-grid">
            <SinistroDateField
              label="Data do acidente"
              hint="Data em que o sinistro ocorreu"
              value={dataAcidente}
              onChange={(event) => setDataAcidente(event.target.value)}
              required
            />
            <SinistroDateField
              label="Data da notificação"
              hint="Data em que o sinistro foi comunicado"
              value={dataNotificacao}
              onChange={(event) => setDataNotificacao(event.target.value)}
              required
            />
          </div>
          <label className="field-group field-full sinistro-descricao-field">
            <FaFileAlt className="field-icon" />
            <input
              type="text"
              placeholder="Descrição do acidente"
              required
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
            />
          </label>
        </div>

        <button type="submit" className="primary-btn form-btn field-full">
          <FaSave />
          Guardar processo
        </button>

        {message && <p className="form-message field-full">{message}</p>}
      </form>
    </div>
  )
}
