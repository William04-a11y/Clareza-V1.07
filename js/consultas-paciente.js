/* ==========================================================================
   CLAREZA v1.07 — js/consultas-paciente.js
   Página "Minhas consultas": tabs (próximas/anteriores/todas), filtro por
   status, busca textual e modal de detalhes.
   ========================================================================== */

(function (window, document) {
  'use strict';

  const STATUS_LABELS = { confirmada: 'Confirmada', pendente: 'Pendente', concluida: 'Concluída', cancelada: 'Cancelada' };
  const STATUS_BADGE = { confirmada: 'success', pendente: 'warning', concluida: 'info', cancelada: 'danger' };

  let activeTab = 'proximas';
  let statusFilter = 'todos';
  let searchTerm = '';

  function isFuture(consulta) {
    return new Date(`${consulta.date}T${consulta.time}`) >= new Date() && consulta.status !== 'concluida' && consulta.status !== 'cancelada';
  }

  function getFiltered() {
    const term = searchTerm.trim().toLowerCase();
    let list = window.ClarezaPacienteData.getConsultas();

    if (activeTab === 'proximas') {
      list = list.filter(isFuture);
    } else if (activeTab === 'anteriores') {
      list = list.filter((c) => !isFuture(c));
    }

    if (statusFilter !== 'todos') {
      list = list.filter((c) => c.status === statusFilter);
    }

    if (term) {
      list = list.filter(
        (c) => c.professional.toLowerCase().includes(term) || c.modality.toLowerCase().includes(term) || (c.notes || '').toLowerCase().includes(term)
      );
    }

    const sortAsc = activeTab === 'proximas';
    return list.sort((a, b) => {
      const cmp = (a.date + a.time).localeCompare(b.date + b.time);
      return sortAsc ? cmp : -cmp;
    });
  }

  function renderTable() {
    const { qs, formatDate } = window.ClarezaUtils;
    const tbody = qs('#consultasTableBody');
    const countEl = qs('#consultasCount');
    if (!tbody) return;

    const consultas = getFiltered();
    if (countEl) countEl.textContent = `${consultas.length} consulta${consultas.length === 1 ? '' : 's'}`;

    if (!consultas.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <div class="empty-state__icon">
                <svg width="26" height="26" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3 8.5h14M7 2.5v3M13 2.5v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </div>
              <div class="empty-state__title">Nenhuma consulta encontrada</div>
              <p class="text-muted text-sm">Ajuste os filtros ou solicite uma nova consulta na Agenda.</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = consultas
      .map(
        (c) => `
      <tr>
        <td>${formatDate(c.date)}</td>
        <td class="text-mono">${c.time}</td>
        <td>${c.professional}</td>
        <td>${c.modality}</td>
        <td><span class="badge badge--${STATUS_BADGE[c.status]}">${STATUS_LABELS[c.status]}</span></td>
        <td><button class="btn btn--ghost btn--sm" data-view-consulta="${c.id}">Ver detalhes</button></td>
      </tr>`
      )
      .join('');
  }

  function openConsultaModal(id) {
    const { qs, formatDate } = window.ClarezaUtils;
    const consulta = window.ClarezaPacienteData.getConsultaById(id);
    if (!consulta) return;

    qs('#modalConsultaTitle').textContent = `Consulta em ${formatDate(consulta.date)}`;
    qs('#modalConsultaBody').innerHTML = `
      <div class="grid grid-2" style="gap: var(--space-4); margin-bottom: var(--space-4);">
        <div><div class="text-faint text-xs">Data</div><div>${formatDate(consulta.date)}</div></div>
        <div><div class="text-faint text-xs">Horário</div><div class="text-mono">${consulta.time}</div></div>
        <div><div class="text-faint text-xs">Profissional</div><div>${consulta.professional}</div></div>
        <div><div class="text-faint text-xs">Modalidade</div><div>${consulta.modality}</div></div>
        <div><div class="text-faint text-xs">Status</div><span class="badge badge--${STATUS_BADGE[consulta.status]}">${STATUS_LABELS[consulta.status]}</span></div>
      </div>
      ${consulta.notes ? `<div><div class="text-faint text-xs" style="margin-bottom: var(--space-1);">Observações</div><p class="text-sm">${consulta.notes}</p></div>` : ''}
    `;

    window.ClarezaModal.openModal('modalDetalhesConsulta');
  }

  function init() {
    const { qs, qsa, on, debounce } = window.ClarezaUtils;
    if (!window.ClarezaPacienteData || !qs('#consultasTableBody')) return;

    renderTable();

    qsa('.tabs [data-tab]').forEach((tab) => {
      on(tab, 'click', () => {
        activeTab = tab.getAttribute('data-tab');
        qsa('.tabs [data-tab]').forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        renderTable();
      });
    });

    qsa('.filter-chip[data-status-filter]').forEach((chip) => {
      on(chip, 'click', () => {
        statusFilter = chip.getAttribute('data-status-filter');
        qsa('.filter-chip[data-status-filter]').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        renderTable();
      });
    });

    const searchInput = qs('#consultaSearch');
    on(searchInput, 'input', debounce((event) => {
      searchTerm = event.target.value;
      renderTable();
    }, 200));

    on(document, 'click', (event) => {
      const trigger = event.target.closest('[data-view-consulta]');
      if (trigger) openConsultaModal(trigger.getAttribute('data-view-consulta'));
    });
  }

  document.addEventListener('clareza:ready', init);
})(window, document);
