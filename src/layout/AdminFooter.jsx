import { FaArrowUp, FaLifeRing, FaMapMarkedAlt, FaWhatsapp } from 'react-icons/fa'

function waLink(number, message) {
  const msg = encodeURIComponent(message)
  const digits = number.replace(/[^\d]/g, '')
  return `https://wa.me/${digits}?text=${msg}`
}

export default function AdminFooter() {
  const msg = 'Olá! Preciso de suporte no sistema de Gestão de Sinistro.'

  const goTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="admin-footer">
      <div className="footer-top footer-top--two">
        <div className="footer-block">
          <div className="footer-block-title">
            <FaWhatsapp aria-hidden="true" />
            <span>Solicitar suporte</span>
          </div>
          <div className="support-list">
            <a href={waLink('+258 845625067', msg)} target="_blank" rel="noreferrer">
              <FaWhatsapp aria-hidden="true" />
              Antonio Zimila
            </a>
            <a href={waLink('+258 849534836', msg)} target="_blank" rel="noreferrer">
              <FaWhatsapp aria-hidden="true" />
              Edna Mavie
            </a>
            <a href={waLink('+258 841644096', msg)} target="_blank" rel="noreferrer">
              <FaWhatsapp aria-hidden="true" />
              Elton Matsinhe
            </a>
            <a href={waLink('+258 848002001', msg)} target="_blank" rel="noreferrer">
              <FaWhatsapp aria-hidden="true" />
              Octavio Manhica
            </a>
          </div>
        </div>

        <div className="footer-block">
          <div className="footer-block-title">
            <FaMapMarkedAlt aria-hidden="true" />
            <span>Localização</span>
          </div>
          <div className="mini-map">
            <iframe
              title="Localização Imperial Seguros"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3246.365697737023!2d32.59060237899461!3d-25.956530695200193!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee69bb33c3c2efd%3A0x4ae08f7c83468c8e!2sImperial%20Seguros!5e1!3m2!1spt-PT!2smz!4v1776340237497!5m2!1spt-PT!2smz"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      <div className="footer-divider" />

      <div className="footer-bottom">
        <div className="footer-copy">
          Copyright@ 2026 Todos direitos reservados | Criado pelo Departamento de IT
        </div>
        <button type="button" className="to-top" onClick={goTop} aria-label="Voltar ao topo">
          <FaArrowUp />
        </button>
      </div>
    </footer>
  )
}

