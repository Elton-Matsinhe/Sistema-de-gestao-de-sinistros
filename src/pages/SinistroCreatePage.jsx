import { useEffect, useState } from 'react'
import { FaCalendarAlt, FaCar, FaFileAlt, FaHashtag, FaRegUser, FaSave } from 'react-icons/fa'
import { createProcess, peekNextNumeroApolice } from '../utils/processes'

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
      <h1 className="dash-title">Criar Processo</h1>
      <p className="form-subtitle">Registo inicial do sinistro para iniciar o fluxo interno.</p>

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

        <label className="field-group">
          <FaCar className="field-icon" />
          <input
            type="text"
            placeholder="Matrícula"
            required
            value={matricula}
            onChange={(event) => setMatricula(event.target.value)}
          />
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

        <div className="form-section-title field-full">Datas e descrição</div>

        <label className="field-group">
          <FaCalendarAlt className="field-icon" />
          <input type="date" required value={dataAcidente} onChange={(event) => setDataAcidente(event.target.value)} />
        </label>

        <label className="field-group">
          <FaCalendarAlt className="field-icon" />
          <input
            type="date"
            required
            value={dataNotificacao}
            onChange={(event) => setDataNotificacao(event.target.value)}
          />
        </label>

        <label className="field-group field-full">
          <FaFileAlt className="field-icon" />
          <input
            type="text"
            placeholder="Descrição do acidente"
            required
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
          />
        </label>

        <button type="submit" className="primary-btn form-btn field-full">
          <FaSave />
          Guardar processo
        </button>

        {message && <p className="form-message field-full">{message}</p>}
      </form>
    </div>
  )
}

