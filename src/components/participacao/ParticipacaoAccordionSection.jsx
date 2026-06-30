import { FaChevronDown } from 'react-icons/fa'

export default function ParticipacaoAccordionSection({
  id,
  title,
  number,
  icon: Icon,
  open,
  onToggle,
  children,
  subtitle,
  filledCount = 0,
}) {
  const displayTitle = number ? `${number}. ${title}` : title

  return (
    <section className={`participacao-accordion ${open ? 'is-open' : ''}`} id={id}>
      <button type="button" className="participacao-accordion__head" onClick={onToggle} aria-expanded={open}>
        <span className="participacao-accordion__chevron" aria-hidden="true">
          <FaChevronDown />
        </span>
        {Icon && <span className="participacao-accordion__icon"><Icon /></span>}
        <span className="participacao-accordion__text">
          <strong>{displayTitle}</strong>
          {subtitle && <small>{subtitle}</small>}
        </span>
        {filledCount > 0 && (
          <span className="participacao-accordion__badge">{filledCount} preenchido{filledCount > 1 ? 's' : ''}</span>
        )}
      </button>
      <div className={`participacao-accordion__body-wrap ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="participacao-accordion__body">{children}</div>
      </div>
    </section>
  )
}
