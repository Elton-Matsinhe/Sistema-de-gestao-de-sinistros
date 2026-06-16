import { useEffect, useState } from 'react'
import { FaRegClock } from 'react-icons/fa'
import { formatLocalDateTimeLabel } from '../utils/datetime'

export default function AutoDateTimeNotice({ label = 'Data e hora de confirmação' }) {
  const [display, setDisplay] = useState(() => formatLocalDateTimeLabel())

  useEffect(() => {
    const timer = setInterval(() => setDisplay(formatLocalDateTimeLabel()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="auto-datetime-card field-full">
      <div className="auto-datetime-card__icon">
        <FaRegClock />
      </div>
      <div className="auto-datetime-card__body">
        <span className="auto-datetime-card__label">{label}</span>
        <strong className="auto-datetime-card__value">{display}</strong>
      </div>
      <span className="auto-datetime-card__pulse" aria-hidden="true" />
    </div>
  )
}
