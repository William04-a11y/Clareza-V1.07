/* ==========================================================================
   CLAREZA v1.07 — js/documentos-paciente.js
   Listagem de documentos do paciente com busca, filtro por tipo/status
   e modal de visualização (download simulado, sem arquivo real).
   ========================================================================== */

(function (window, document) {
  'use strict';

  const STATUS_LABELS = { disponivel: 'Disponível', pendente: 'Pendente' };
  const STATUS_BADGE = { disponivel: 'success', pendente: 'warning' };

  const TYPE_ICONS = {
    Declaração: '<path d="M5 2.5h7l3 3v12H5V2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M7.5 9h5M7.5 12h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
    Recibo: '<path d="M5 2.5h10v15l-2-1.3-1.5 1.3-1.5-1.3L8.5 17.5 7 16.2l-2 1.3v-15Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M7.5 7h5M7.5 10h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
    Laudo: '<path d="M5 2.5h7l3 3v12H5V2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 2.5V6h3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    Atestado: '<path d="M5 2.5h7l3 3v12H5V2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="m7.5 10.5 1.8 1.8L13 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  };

  let searchTerm = '';
  let typeFilter = 'todos';
  let statusFilter = 'todos';

  function getFiltered() {
    const term = searchTerm.trim().toLowerCase();
    return window.ClarezaPacienteData.getDocumentos()
      .filter((d) => typeFilter === 'todos' || d.type === typeFilter)
      .filter((d) => statusFilter === 'todos' || d.status === statusFilter)
      .filter((d) => !term || d.name.toLowerCase().includes(term))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  function renderTable() {
    const { qs, formatDate } = window.ClarezaUtils;
    const tbody = qs('#documentosTableBody');
    const countEl = qs('#documentosCount');
    if (!tbody) return;

    const documentos = getFiltered();
    if (countEl) countEl.textContent = `${documentos.length} documento${documentos.length === 1 ? '' : 's'}`;

    if (!documentos.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-state">
              <div class="empty-state__icon">
                <svg width="26" height="26" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 2.5h7l3 3v12H5V2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
              </div>
              <div class="empty-state__title">Nenhum documento encontrado</div>
              <p class="text-muted text-sm">Tente ajustar a busca ou os filtros selecionados.</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = documentos
      .map(
        (d) => `
      <tr>
        <td>
          <div class="flex flex-gap-3" style="align-items:center;">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">${TYPE_ICONS[d.type] || TYPE_ICONS['Declaração']}</svg>
            <span style="font-weight: var(--fw-medium);">${d.name}</span>
          </div>
        </td>
        <td class="text-muted">${d.type}</td>
        <td class="text-muted">${formatDate(d.date)}</td>
        <td><span class="badge badge--${STATUS_BADGE[d.status]}">${STATUS_LABELS[d.status]}</span></td>
        <td><button class="btn btn--ghost btn--sm" data-view-documento="${d.id}">Visualizar</button></td>
      </tr>`
      )
      .join('');
  }

  function openDocumentoModal(id) {
    const { qs, formatDate } = window.ClarezaUtils;
    const documento = window.ClarezaPacienteData.getDocumentoById(id);
    if (!documento) return;

    qs('#modalDocumentoTitle').textContent = documento.name;
    qs('#modalDocumentoBody').innerHTML = `
      <div class="flex flex-gap-4" style="align-items:center; margin-bottom: var(--space-5); padding: var(--space-5); background-color: var(--color-bg-alt); border-radius: var(--radius-md);">
        <svg width="32" height="32" viewBox="0 0 20 20" fill="none" aria-hidden="true" style="color: var(--color-primary-700); flex-shrink:0;">${TYPE_ICONS[documento.type] || TYPE_ICONS['Declaração']}</svg>
        <div>
          <div style="font-weight: var(--fw-semibold);">${documento.name}</div>
          <div class="text-faint text-xs">Pré-visualização simulada — sem arquivo real nesta demonstração</div>
        </div>
      </div>
      <div class="grid grid-2" style="gap: var(--space-4);">
        <div><div class="text-faint text-xs">Tipo</div><div>${documento.type}</div></div>
        <div><div class="text-faint text-xs">Data</div><div>${formatDate(documento.date)}</div></div>
        <div><div class="text-faint text-xs">Status</div><span class="badge badge--${STATUS_BADGE[documento.status]}">${STATUS_LABELS[documento.status]}</span></div>
      </div>
      <div id="documentoDownloadFeedback" style="margin-top: var(--space-4);"></div>
    `;

    qs('#modalDocumentoFooter').innerHTML = `
      <button class="btn btn--secondary" data-modal-close>Fechar</button>
      <button class="btn btn--primary" id="btnBaixarDocumento" ${documento.status !== 'disponivel' ? 'disabled' : ''}>Baixar documento</button>
    `;

    window.ClarezaModal.openModal('modalDetalhesDocumento');
  }

  function init() {
    const { qs, qsa, on, debounce } = window.ClarezaUtils;
    if (!window.ClarezaPacienteData || !qs('#documentosTableBody')) return;

    renderTable();

    const searchInput = qs('#documentoSearch');
    on(searchInput, 'input', debounce((event) => {
      searchTerm = event.target.value;
      renderTable();
    }, 200));

    const typeSelect = qs('#documentoTypeFilter');
    on(typeSelect, 'change', () => {
      typeFilter = typeSelect.value;
      renderTable();
    });

    qsa('.filter-chip[data-status-filter]').forEach((chip) => {
      on(chip, 'click', () => {
        statusFilter = chip.getAttribute('data-status-filter');
        qsa('.filter-chip[data-status-filter]').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        renderTable();
      });
    });

    on(document, 'click', (event) => {
      const viewTrigger = event.target.closest('[data-view-documento]');
      if (viewTrigger) {
        openDocumentoModal(viewTrigger.getAttribute('data-view-documento'));
        return;
      }

      if (event.target.id === 'btnBaixarDocumento') {
        qs('#documentoDownloadFeedback').innerHTML = window.ClarezaComponents.renderAlert('info', {
          message: 'Nesta demonstração o download é simulado — nenhum arquivo real é gerado.',
        });
      }
    });
  }

  document.addEventListener('clareza:ready', init);
})(window, document);
