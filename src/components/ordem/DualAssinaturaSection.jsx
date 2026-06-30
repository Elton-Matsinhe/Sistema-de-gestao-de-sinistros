import DocumentoAssinaturaPanel from './DocumentoAssinaturaPanel'

export default function DualAssinaturaSection({
  declaranteValue,
  onDeclaranteChange,
  declaranteNomeDefault = '',
  declaranteReadOnly = false,
  gestorValue,
  onGestorChange,
  gestorNomeDefault = '',
  gestorReadOnly = false,
  showGestorDate = false,
  dataAutorizacao,
  onDataAutorizacaoChange,
}) {
  return (
    <section className="ordem-dual-assinatura field-full">
      <div className="ordem-dual-assinatura__grid">
        <div className="ordem-dual-assinatura__col ordem-dual-assinatura__col--left">
          <DocumentoAssinaturaPanel
            title="Assinatura do Declarante"
            subtitle="Lado esquerdo do documento PDF"
            value={declaranteValue}
            nomeDefault={declaranteNomeDefault}
            onChange={onDeclaranteChange}
            readOnly={declaranteReadOnly}
          />
        </div>
        <div className="ordem-dual-assinatura__col ordem-dual-assinatura__col--right">
          <DocumentoAssinaturaPanel
            title="Assinatura do Gestor de Sinistro"
            subtitle={
              gestorReadOnly
                ? 'Reservado — o gestor assina ao receber o documento'
                : 'Assine no lado direito do documento PDF'
            }
            value={gestorValue}
            nomeDefault={gestorNomeDefault}
            onChange={onGestorChange}
            readOnly={gestorReadOnly}
            reservedPlaceholder={gestorReadOnly && !gestorValue?.imagemDataUrl}
          />
          {showGestorDate && onDataAutorizacaoChange && (
            <label className="field-group ordem-gestor-data-field">
              <span className="field-label">Data da autorização (gestor)</span>
              <input
                type="date"
                value={dataAutorizacao || ''}
                onChange={(e) => onDataAutorizacaoChange(e.target.value)}
                disabled={gestorReadOnly}
              />
            </label>
          )}
        </div>
      </div>
    </section>
  )
}
