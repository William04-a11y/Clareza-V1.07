/* ==========================================================================
   CLAREZA v1.07 — js/pacientes.js
   Listagem de pacientes com busca, filtro por status e modal de
   visualização com histórico recente de consultas.
   ========================================================================== */

(function (window, document) {
  'use strict';

  const STATUS_LABELS = { confirmada: 'Confirmada', pendente: 'Pendente', realizada: 'Realizada', cancelada: 'Cancelada' };
  const STATUS_BADGE = { confirmada: 'success', pendente: 'warning', realizada: 'info', cancelada: 'danger' };

  let searchTerm = '';
  let statusFilter = 'todos';

  function statusBadge(status) {
    return status === 'ativo'
      ? '<span class="badge badge--success">Ativo</span>'
      : '<span class="badge badge--neutral">Inativo</span>';
  }

  function getFilteredPatients() {
    const { formatDate } = window.ClarezaUtils;
    const term = searchTerm.trim().toLowerCase();

    return window.ClarezaMockData.getPatients()
      .filter((p) => statusFilter === 'todos' || p.status === statusFilter)
      .filter((p) => !term || p.name.toLowerCase().includes(term) || p.email.toLowerCase().includes(term))
      .sort((a, b) => (a.lastSession < b.lastSession ? 1 : -1));
  }

  function renderTable() {
    const { qs, getInitials, formatDate } = window.ClarezaUtils;
    const tbody = qs('#patientsTableBody');
    const countEl = qs('#patientsCount');
    if (!tbody) return;

    const patients = getFilteredPatients();
    if (countEl) countEl.textContent = `${patients.length} paciente${patients.length === 1 ? '' : 's'}`;

    if (!patients.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <div class="empty-state__icon">
                <svg width="26" height="26" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M7 12.5c.7-1 1.8-1.5 3-1.5s2.3.5 3 1.5M7.5 8h.01M12.5 8h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </div>
              <div class="empty-state__title">Nenhum paciente encontrado</div>
              <p class="text-muted text-sm">Tente ajustar a busca ou o filtro selecionado.</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = patients
      .map(
        (p) => `
      <tr>
        <td>
          <div class="flex flex-gap-3" style="align-items:center;">
            <div class="avatar avatar--sm">${getInitials(p.name)}</div>
            <span style="font-weight: var(--fw-medium);">${p.name}</span>
          </div>
        </td>
        <td class="text-muted">${p.email}</td>
        <td class="text-muted text-mono">${p.phone}</td>
        <td class="text-muted">${formatDate(p.lastSession)}</td>
        <td>${statusBadge(p.status)}</td>
        <td>
          <button class="btn btn--ghost btn--sm" data-view-patient="${p.id}">Visualizar</button>
        </td>
      </tr>`
      )
      .join('');
  }

  function renderFilterChips() {
    const { qs, qsa, on } = window.ClarezaUtils;
    qsa('.filter-chip[data-status-filter]').forEach((chip) => {
      on(chip, 'click', () => {
        statusFilter = chip.getAttribute('data-status-filter');
        qsa('.filter-chip[data-status-filter]').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        renderTable();
      });
    });
  }

  function renderSearch() {
    const { qs, on, debounce } = window.ClarezaUtils;
    const searchInput = qs('#patientSearch');
    if (!searchInput) return;

    on(searchInput, 'input', debounce((event) => {
      searchTerm = event.target.value;
      renderTable();
    }, 200));
  }

  function openPatientModal(patientId) {
    const { qs, getInitials, formatDate } = window.ClarezaUtils;
    const patient = window.ClarezaMockData.getPatientById(patientId);
    if (!patient) return;

    const history = window.ClarezaMockData.getAppointments()
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1))
      .slice(0, 5);

    qs('#modalPacienteTitle').textContent = patient.name;

    const historyHtml = history.length
      ? history
          .map(
            (a) => `
        <div class="flex-between" style="padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border);">
          <div>
            <div class="text-sm" style="font-weight: var(--fw-medium);">${formatDate(a.date)} · ${a.time}</div>
            <div class="text-faint text-xs">${a.modality}</div>
          </div>
          <span class="badge badge--${STATUS_BADGE[a.status]}">${STATUS_LABELS[a.status]}</span>
        </div>`
          )
          .join('')
      : '<p class="text-muted text-sm">Nenhuma consulta registrada ainda.</p>';

    const prontuarioLink = qs('#modalPacienteProntuarioLink');
    if (prontuarioLink) prontuarioLink.href = `prontuarios.html?paciente=${patientId}`;

    qs('#modalPacienteBody').innerHTML = `
      <div class="flex flex-gap-4" style="align-items:center; margin-bottom: var(--space-5);">
        <div class="avatar avatar--lg">${getInitials(patient.name)}</div>
        <div>
          <div style="font-weight: var(--fw-semibold); font-size: var(--fs-md);">${patient.name}</div>
          ${statusBadge(patient.status)}
        </div>
      </div>
      <div class="grid grid-2" style="gap: var(--space-4); margin-bottom: var(--space-5);">
        <div>
          <div class="text-faint text-xs">E-mail</div>
          <div class="text-sm">${patient.email}</div>
        </div>
        <div>
          <div class="text-faint text-xs">Telefone</div>
          <div class="text-sm text-mono">${patient.phone}</div>
        </div>
        <div>
          <div class="text-faint text-xs">Última consulta</div>
          <div class="text-sm">${formatDate(patient.lastSession)}</div>
        </div>
      </div>
      <h4 style="font-size: var(--fs-sm); margin-bottom: var(--space-2);">Histórico recente</h4>
      <div>${historyHtml}</div>
    `;

    window.ClarezaModal.openModal('modalDetalhesPaciente');
  }

  function init() {
    const { qs, on } = window.ClarezaUtils;
    if (!window.ClarezaMockData || !qs('#patientsTableBody')) return;

    renderTable();
    renderFilterChips();
    renderSearch();

    on(document, 'click', (event) => {
      const trigger = event.target.closest('[data-view-patient]');
      if (trigger) openPatientModal(trigger.getAttribute('data-view-patient'));
    });
  }

  document.addEventListener('clareza:ready', init);
})(window, document);
