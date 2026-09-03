/* ==========================================================================
   CLAREZA v1.07 — js/prontuarios.js
   Listagem de prontuários eletrônicos: busca, filtro por paciente/data/
   status e criação de um novo prontuário (RF11). Toda a "persistência"
   é simulada via window.ClarezaProntuarios (mock-data-prontuarios.js).
   ========================================================================== */

(function (window, document) {
  'use strict';

  let searchTerm = '';
  let statusFilter = 'todos';
  let patientFilter = 'todos';
  let dateFilter = '';

  function statusBadge(status) {
    return status === 'ativo'
      ? '<span class="badge badge--success">Ativo</span>'
      : '<span class="badge badge--neutral">Arquivado</span>';
  }

  function lastSessionOf(record) {
    if (!record.sessions.length) return null;
    return record.sessions.reduce((latest, s) => (s.date > latest.date ? s : latest), record.sessions[0]);
  }

  function getFilteredRecords() {
    const term = searchTerm.trim().toLowerCase();
    return window.ClarezaProntuarios.getRecords()
      .filter((r) => statusFilter === 'todos' || r.status === statusFilter)
      .filter((r) => patientFilter === 'todos' || r.patientId === patientFilter)
      .filter((r) => !dateFilter || (lastSessionOf(r) && lastSessionOf(r).date === dateFilter))
      .filter((r) => !term || r.patientName.toLowerCase().includes(term) || r.recordNumber.toLowerCase().includes(term))
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }

  function renderTable() {
    const { qs, getInitials, formatDate } = window.ClarezaUtils;
    const tbody = qs('#recordsTableBody');
    const countEl = qs('#recordsCount');
    if (!tbody) return;

    const records = getFilteredRecords();
    if (countEl) countEl.textContent = `${records.length} prontuário${records.length === 1 ? '' : 's'}`;

    if (!records.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <div class="empty-state__icon">
                <svg width="26" height="26" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 2.5h7l3 3v12H5V2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M7.5 9h5M7.5 12h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </div>
              <div class="empty-state__title">Nenhum prontuário encontrado</div>
              <p class="text-muted text-sm">Tente ajustar a busca ou os filtros selecionados.</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = records
      .map((r) => {
        const last = lastSessionOf(r);
        return `
      <tr>
        <td>
          <div class="flex flex-gap-3" style="align-items:center;">
            <div class="avatar avatar--sm">${getInitials(r.patientName)}</div>
            <span style="font-weight: var(--fw-medium);">${r.patientName}</span>
          </div>
        </td>
        <td class="text-muted text-mono">${r.recordNumber}</td>
        <td class="text-muted">${last ? formatDate(last.date) : '—'}</td>
        <td class="text-muted">${formatDate(r.updatedAt)}</td>
        <td>${statusBadge(r.status)}</td>
        <td>
          <div class="flex flex-gap-2">
            <a class="btn btn--ghost btn--sm" href="prontuario-detalhe.html?id=${r.id}">Visualizar</a>
            <a class="btn btn--secondary btn--sm" href="prontuario-detalhe.html?id=${r.id}&editar=1">Editar</a>
          </div>
        </td>
      </tr>`;
      })
      .join('');
  }

  function renderFilterChips() {
    const { qsa, on } = window.ClarezaUtils;
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
    const searchInput = qs('#recordSearch');
    if (searchInput) {
      on(searchInput, 'input', debounce((event) => {
        searchTerm = event.target.value;
        renderTable();
      }, 200));
    }

    const dateInput = qs('#recordDateFilter');
    if (dateInput) {
      on(dateInput, 'change', () => {
        dateFilter = dateInput.value;
        renderTable();
      });
    }

    const patientSelect = qs('#recordPatientFilter');
    if (patientSelect) {
      on(patientSelect, 'change', () => {
        patientFilter = patientSelect.value;
        renderTable();
      });
    }
  }

  function populatePatientFilter() {
    const { qs } = window.ClarezaUtils;
    const select = qs('#recordPatientFilter');
    if (!select || !window.ClarezaMockData) return;

    window.ClarezaMockData.getPatients().forEach((p) => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.name;
      select.appendChild(option);
    });
  }

  function populateNewRecordPatientSelect() {
    const { qs } = window.ClarezaUtils;
    const select = qs('#novoProntuarioPaciente');
    if (!select || !window.ClarezaMockData) return;

    const existingPatientIds = window.ClarezaProntuarios.getRecords().map((r) => r.patientId);

    window.ClarezaMockData.getPatients().forEach((p) => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = existingPatientIds.includes(p.id) ? `${p.name} (já possui prontuário)` : p.name;
      select.appendChild(option);
    });
  }

  function initNewRecordForm() {
    const { qs, on, validators, validateForm, showToast } = window.ClarezaUtils;
    const form = qs('#formNovoProntuario');
    if (!form) return;

    const numeroInput = qs('#novoProntuarioNumero');
    const dataInput = qs('#novoProntuarioSessaoData');

    // Preenche a data padrão com "hoje" e mostra o próximo número previsto.
    const today = window.ClarezaProntuarios.isoDate(new Date());
    if (dataInput && !dataInput.value) dataInput.value = today;
    if (numeroInput) numeroInput.value = window.ClarezaProntuarios.recordNumber();

    on(form, 'submit', (event) => {
      event.preventDefault();

      const isValid = validateForm(form, {
        patientId: [validators.required],
        sessionDate: [validators.required],
      });
      if (!isValid) return;

      const select = qs('#novoProntuarioPaciente');
      const patientId = select.value;
      const patient = window.ClarezaMockData.getPatientById(patientId);
      const sessionDate = form.elements.sessionDate.value;

      const record = window.ClarezaProntuarios.createRecord({
        patientId,
        patientName: patient ? patient.name : 'Paciente',
        sessionDate,
      });

      window.ClarezaModal.closeModal('modalNovoProntuario');
      showToast('success', `Prontuário ${record.recordNumber} criado com sucesso.`);

      window.location.href = `prontuario-detalhe.html?id=${record.id}&editar=1`;
    });
  }

  function applyPatientFromQueryString() {
    const { qs } = window.ClarezaUtils;
    const params = new URLSearchParams(window.location.search);
    const patientId = params.get('paciente');
    if (!patientId) return;

    const select = qs('#recordPatientFilter');
    if (select && [...select.options].some((o) => o.value === patientId)) {
      select.value = patientId;
      patientFilter = patientId;
    }
  }

  function init() {
    const { qs } = window.ClarezaUtils;
    if (!window.ClarezaProntuarios || !qs('#recordsTableBody')) return;

    populatePatientFilter();
    populateNewRecordPatientSelect();
    applyPatientFromQueryString();
    renderTable();
    renderFilterChips();
    renderSearch();
    initNewRecordForm();
  }

  document.addEventListener('clareza:ready', init);
})(window, document);
