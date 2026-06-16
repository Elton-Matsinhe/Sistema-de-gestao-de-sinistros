function openPrintWindow(title, bodyHtml) {
  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return
  win.document.write(`
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #1a4d38; }
        h1 { font-size: 18px; margin-bottom: 8px; }
        h2 { font-size: 14px; margin: 18px 0 8px; color: #1f8f5f; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 12px; }
        th, td { border: 1px solid #cfe5da; padding: 6px 8px; text-align: left; }
        th { background: #edf8f2; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .item { border: 1px solid #e2eee8; border-radius: 6px; padding: 8px; }
        .label { font-size: 10px; text-transform: uppercase; color: #5f7a6d; }
        .value { font-weight: 600; margin-top: 2px; }
        img { max-width: 140px; max-height: 100px; object-fit: cover; border-radius: 6px; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>${bodyHtml}</body>
    </html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 400)
}

function fieldBlock(label, value) {
  return `<div class="item"><div class="label">${label}</div><div class="value">${value || '—'}</div></div>`
}

export function printPeritagemFormulario(item) {
  const f = item.peritagemFormulario || {}
  const html = `
    <h1>Formulário de Peritagem — ${item.numeroSinistro}</h1>
    <p><strong>Cliente:</strong> ${item.cliente}</p>
    <h2>Dados Processo</h2>
    <div class="grid">
      ${fieldBlock('Data Sinistro', f.dataSinistro)}
      ${fieldBlock('N.º Processo', f.numeroProcesso)}
      ${fieldBlock('N.º Apólice', f.numeroApolice)}
      ${fieldBlock('Tipo Sinistro', f.tipoSinistro)}
      ${fieldBlock('Peritagem', f.dataPeritagem)}
      ${fieldBlock('Capital Seguro', f.capitalSeguro)}
    </div>
    <h2>Veículo</h2>
    <div class="grid">
      ${fieldBlock('Matrícula', f.veiculoMatricula)}
      ${fieldBlock('Marca', f.veiculoMarca)}
      ${fieldBlock('Modelo', f.veiculoModelo)}
      ${fieldBlock('Ano', f.veiculoAno)}
      ${fieldBlock('Combustível', f.veiculoCombustivel)}
      ${fieldBlock('Cor', f.veiculoCor)}
    </div>
    <h2>Resumo Financeiro</h2>
    <div class="grid">
      ${fieldBlock('Cotação Inicial', f.resumoCotacaoInicial)}
      ${fieldBlock('Franquia', f.resumoFranquia)}
      ${fieldBlock('Total a Liquidar', f.resumoTotalLiquidar)}
    </div>
    <h2>Perito</h2>
    <p>${f.peritoAvaliador || '—'} — ${f.peritoLocal || ''} ${f.peritoDataAssinatura || ''}</p>
  `
  openPrintWindow(`Peritagem ${item.numeroSinistro}`, html)
}

export function printPeritagemMateriais(item) {
  const m = item.peritagemMateriais || {}
  const pecasRows = (m.pecas || [])
    .map((p) => `<tr><td>${p.descricao || ''}</td><td>${p.quantidade || ''}</td><td>${p.custoUnitario || ''}</td><td>${p.valorTotal || ''}</td></tr>`)
    .join('')
  const moRows = (m.maoObra || [])
    .map((r) => `<tr><td>${r.descricao || ''}</td><td>${r.horas || ''}</td><td>${r.valorHora || ''}</td><td>${r.valor || ''}</td></tr>`)
    .join('')
  const html = `
    <h1>Materiais e Mão de Obra — ${item.numeroSinistro}</h1>
    <h2>Peças</h2>
    <table><thead><tr><th>Peça</th><th>Qtd</th><th>Custo Unit.</th><th>Total</th></tr></thead><tbody>${pecasRows}</tbody></table>
    <p><strong>Total Peças:</strong> ${m.totalPecas || '—'} MTS</p>
    <h2>Mão de Obra</h2>
    <table><thead><tr><th>Serviço</th><th>Horas</th><th>Valor/Hora</th><th>Total</th></tr></thead><tbody>${moRows}</tbody></table>
    <p><strong>Total Geral:</strong> ${m.totalGeral || '—'} MTS</p>
  `
  openPrintWindow(`Materiais ${item.numeroSinistro}`, html)
}

export function printPeritagemFotos(item) {
  const fotos = item.peritagemFotos?.fotos || []
  const imgs = fotos
    .map((f) => `<div class="item"><div class="label">${f.label || f.slotId}</div><img src="${f.dataUrl}" alt="" /></div>`)
    .join('')
  const html = `<h1>Fotos da Peritagem — ${item.numeroSinistro}</h1><div class="grid">${imgs}</div>`
  openPrintWindow(`Fotos ${item.numeroSinistro}`, html)
}

export function printPeritagemRelatorioCompleto(item) {
  printPeritagemFormulario(item)
}
