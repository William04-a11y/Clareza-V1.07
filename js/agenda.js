/* ==========================================================================
   CLAREZA v1.07 — js/agenda.js
   Visualização de agenda (semana/dia) a partir dos dados simulados,
   com modal de detalhes da consulta e agendamento de novas consultas.
   ========================================================================== */

(function (window, document) {
  'use strict';

  const WEEKDAY_LABELS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const HOURS = Array.from({ length: 12 }, (_, i) => 8 + i); // 08h às 19h
  const STATUS_LABELS = { confirmada: 'Confirmada', pendente: 'Pendente', realizada: 'Realizada', cancelada: 'Cancelada' };
  const STATUS_BADGE = { confirmada: 'success', pendente: 'warning', realizada: 'info', cancelada: 'danger' };
  const STATUS_EVENT_CLASS = { pendente: 'pendente', cancelada: 'cancelada', realizada: 'realizada' };

  let currentView = 'semana';
  let referenceDate = new Date();

  function getWeekStart(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }

  function formatWeekLabel(start, end) {
    const sameMonth = start.getMonth() === end.getMonth();
    const optsDay = { day: '2-digit' };
    const optsFull = { day: '2-digit', month: 'long', year: 'numeric' };
    const startLabel = new Intl.DateTimeFormat('pt-BR', sameMonth ? optsDay : optsFull).format(start);
    const endLabel = new Intl.DateTimeFormat('pt-BR', optsFull).format(end);
    return `${startLabel} – ${endLabel}`;
  }

  function formatDayLabel(date) {
    const label = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  function eventClass(appointment) {
    return STATUS_EVENT_CLASS[appointment.status] ? `calendar-event--${STATUS_EVENT_CLASS[appointment.status]}` : '';
  }

  /* ------------------------------------------------------------------
     Renderização das visualizações
     ------------------------------------------------------------------ */
  function renderWeekView(weekStart, appointments) {
    const { isoDate, addDays } = window.ClarezaMockData;
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const todayISO = isoDate(new Date());

    let html = '<div class="calendar-week">';
    html += '<div class="calendar-week__corner"></div>';

    days.forEach((day) => {
      const iso = isoDate(day);
      html += `
        <div class="calendar-week__day-head${iso === todayISO ? ' is-today' : ''}">
          <div class="weekday">${WEEKDAY_LABELS[day.getDay()]}</div>
          <div class="daynum">${day.getDate()}</div>
        </div>`;
    });

    HOURS.forEach((hour) => {
      html += `<div class="calendar-week__hour-label">${String(hour).padStart(2, '0')}:00</div>`;

      days.forEach((day) => {
        const iso = isoDate(day);
        const cellAppointments = appointments.filter(
          (a) => a.date === iso && parseInt(a.time.split(':')[0], 10) === hour
        );

        html += `<div class="calendar-week__cell">`;
        cellAppointments.forEach((a) => {
          html += `
            <div class="calendar-event ${eventClass(a)}" data-appointment-id="${a.id}" tabindex="0" role="button">
              <span class="calendar-event__time">${a.time}</span> ${a.patientName}
            </div>`;
        });
        html += `</div>`;
      });
    });

    html += '</div>';
    return html;
  }

  function renderDayView(day, appointments) {
    const { isoDate } = window.ClarezaMockData;
    const iso = isoDate(day);
    const dayAppointments = appointments
      .filter((a) => a.date === iso)
      .sort((a, b) => a.time.localeCompare(b.time));

    if (!dayAppointments.length) {
      return `
        <div class="empty-state">
          <div class="empty-state__icon">
            <svg width="28" height="28" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3 8.5h14M7 2.5v3M13 2.5v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </div>
          <div class="empty-state__title">Nenhuma consulta neste dia</div>
          <p class="text-muted text-sm">Use o botão "Nova consulta" para agendar um horário.</p>
        </div>`;
    }

    return (
      `<div class="agenda-day-list">` +
      dayAppointments
        .map(
          (a) => `
        <div class="agenda-day-item" data-appointment-id="${a.id}" tabindex="0" role="button">
          <div class="agenda-day-item__time">${a.time}</div>
          <div style="flex:1;">
            <div style="font-weight: var(--fw-medium);">${a.patientName}</div>
            <div class="text-muted text-sm">${a.modality}</div>
          </div>
          <span class="badge badge--${STATUS_BADGE[a.status]}">${STATUS_LABELS[a.status]}</span>
        </div>`
        )
        .join('') +
      `</div>`
    );
  }

  function render() {
    const { qs } = window.ClarezaUtils;
    const { addDays } = window.ClarezaMockData;
    const appointments = window.ClarezaMockData.getAppointments();

    const content = qs('#agendaContent');
    const label = qs('#agendaLabel');
    if (!content || !label) return;

    if (currentView === 'semana') {
      const weekStart = getWeekStart(referenceDate);
      const weekEnd = addDays(weekStart, 6);
      label.textContent = formatWeekLabel(weekStart, weekEnd);
      content.innerHTML = renderWeekView(weekStart, appointments);
    } else {
      label.textContent = formatDayLabel(referenceDate);
      content.innerHTML = renderDayView(referenceDate, appointments);
    }
  }

  function navigate(step) {
    const { addDays } = window.ClarezaMockData;
    const days = currentView === 'semana' ? 7 * step : step;
    referenceDate = addDays(referenceDate, days);
    render();
  }

  /* ------------------------------------------------------------------
     Modal de detalhes da consulta
     ------------------------------------------------------------------ */
  function openDetails(appointmentId) {
    const { qs, getInitials, formatDate } = window.ClarezaUtils;
    const appointment = window.ClarezaMockData.getAppointmentById(appointmentId);
    if (!appointment) return;

    const patient = window.ClarezaMockData.getPatientById(appointment.patientId);

    qs('#modalDetalhesConsultaTitle').textContent = `Consulta com ${appointment.patientName}`;

    qs('#detalheConsultaBody').innerHTML = `
      <div class="flex flex-gap-4" style="align-items:center; margin-bottom: var(--space-5);">
        <div class="avatar avatar--lg">${getInitials(appointment.patientName)}</div>
        <div>
          <div style="font-weight: var(--fw-semibold); font-size: var(--fs-md);">${appointment.patientName}</div>
          <div class="text-muted text-sm">${patient ? patient.email : ''}</div>
        </div>
      </div>
      <div class="grid grid-2" style="gap: var(--space-4); margin-bottom: var(--space-4);">
        <div><div class="text-faint text-xs">Data</div><div>${formatDate(appointment.date)}</div></div>
        <div><div class="text-faint text-xs">Horário</div><div class="text-mono">${appointment.time}</div></div>
        <div><div class="text-faint text-xs">Modalidade</div><div>${appointment.modality}</div></div>
        <div><div class="text-faint text-xs">Status</div><span class="badge badge--${STATUS_BADGE[appointment.status]}">${STATUS_LABELS[appointment.status]}</span></div>
      </div>
      ${appointment.notes ? `<div><div class="text-faint text-xs" style="margin-bottom: var(--space-1);">Observações</div><p class="text-sm">${appointment.notes}</p></div>` : ''}
    `;

    const actions = [];
    if (appointment.status === 'pendente') {
      actions.push(`<button class="btn btn--primary" data-action="confirmar" data-id="${appointment.id}">Confirmar consulta</button>`);
    }
    if (appointment.status === 'confirmada') {
      actions.push(`<button class="btn btn--primary" data-action="realizada" data-id="${appointment.id}">Marcar como realizada</button>`);
    }
    if (appointment.status === 'confirmada' || appointment.status === 'pendente') {
      actions.push(`<button class="btn btn--secondary" data-action="cancelar" data-id="${appointment.id}">Cancelar consulta</button>`);
    }

    qs('#detalheConsultaFooter').innerHTML = actions.join('');

    window.ClarezaModal.openModal('modalDetalhesConsulta');
  }

  function handleDetailAction(action, id) {
    const patch = { confirmar: { status: 'confirmada' }, realizada: { status: 'realizada' }, cancelar: { status: 'cancelada' } }[action];
    if (!patch) return;
    window.ClarezaMockData.updateAppointment(id, patch);
    window.ClarezaModal.closeModal('modalDetalhesConsulta');
    render();
  }

  /* ------------------------------------------------------------------
     Modal de nova consulta
     ------------------------------------------------------------------ */
  function renderNewAppointmentModal(patients) {
    const { qs } = window.ClarezaUtils;
    const slot = qs('#modalSlot');
    if (!slot) return;

    const optionsHtml = patients.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');

    slot.outerHTML = window.ClarezaComponents.renderModal({
      id: 'modalNovaConsulta',
      title: 'Agendar nova consulta',
      bodyHtml: `
        <div id="novaConsultaFeedback"></div>
        <div class="field">
          <label class="field__label" for="novaConsultaPaciente">Paciente</label>
          <select class="select" id="novaConsultaPaciente">${optionsHtml}</select>
        </div>
        <div class="grid grid-2" style="gap: var(--space-4);">
          <div class="field">
            <label class="field__label" for="novaConsultaData">Data</label>
            <input class="input" type="date" id="novaConsultaData" />
          </div>
          <div class="field">
            <label class="field__label" for="novaConsultaHora">Horário</label>
            <input class="input" type="time" id="novaConsultaHora" />
          </div>
        </div>
        <div class="field" style="margin-bottom:0;">
          <label class="field__label" for="novaConsultaModalidade">Modalidade</label>
          <select class="select" id="novaConsultaModalidade">
            <option>Online</option>
            <option>Presencial</option>
          </select>
        </div>`,
      footerHtml: `
        <button class="btn btn--secondary" data-modal-close>Cancelar</button>
        <button class="btn btn--primary" data-action="salvar-consulta">Agendar consulta</button>`,
    });
  }

  function handleNewAppointmentSubmit(patients) {
    const { qs } = window.ClarezaUtils;
    const patientSelect = qs('#novaConsultaPaciente');
    const dateInput = qs('#novaConsultaData');
    const timeInput = qs('#novaConsultaHora');
    const modalitySelect = qs('#novaConsultaModalidade');
    const feedback = qs('#novaConsultaFeedback');

    if (!dateInput.value || !timeInput.value) {
      feedback.innerHTML = window.ClarezaComponents.renderAlert('danger', {
        message: 'Selecione a data e o horário da consulta.',
      });
      return;
    }

    const patient = patients.find((p) => p.id === patientSelect.value);

    window.ClarezaMockData.addAppointment({
      patientId: patient.id,
      patientName: patient.name,
      date: dateInput.value,
      time: timeInput.value,
      modality: modalitySelect.value,
      status: 'confirmada',
      notes: '',
    });

    window.ClarezaModal.closeModal('modalNovaConsulta');
    referenceDate = new Date(`${dateInput.value}T00:00:00`);
    render();

    const content = document.getElementById('agendaContent');
    if (content) {
      content.insertAdjacentHTML(
        'beforebegin',
        window.ClarezaComponents.renderAlert('success', { message: 'Consulta agendada com sucesso.', dismissible: true })
      );
    }
  }

  /* ------------------------------------------------------------------
     Inicialização
     ------------------------------------------------------------------ */
  function init() {
    const { qs, qsa, on } = window.ClarezaUtils;
    if (!window.ClarezaMockData || !qs('#agendaContent')) return;

    const patients = window.ClarezaMockData.getPatients();
    renderNewAppointmentModal(patients);
    render();

    on(qs('#agendaPrev'), 'click', () => navigate(-1));
    on(qs('#agendaNext'), 'click', () => navigate(1));
    on(qs('#agendaToday'), 'click', () => {
      referenceDate = new Date();
      render();
    });

    qsa('#viewSwitch .view-switch__btn').forEach((btn) => {
      on(btn, 'click', () => {
        currentView = btn.getAttribute('data-view');
        qsa('#viewSwitch .view-switch__btn').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        render();
      });
    });

    on(document, 'click', (event) => {
      const eventEl = event.target.closest('[data-appointment-id]');
      if (eventEl) {
        openDetails(eventEl.getAttribute('data-appointment-id'));
        return;
      }

      const actionEl = event.target.closest('[data-action]');
      if (actionEl && actionEl.getAttribute('data-action') === 'salvar-consulta') {
        handleNewAppointmentSubmit(patients);
        return;
      }

      if (actionEl && actionEl.closest('#modalDetalhesConsulta')) {
        handleDetailAction(actionEl.getAttribute('data-action'), actionEl.getAttribute('data-id'));
      }
    });

    on(document, 'keydown', (event) => {
      if (event.key !== 'Enter') return;
      const focused = document.activeElement;
      if (focused && focused.hasAttribute('data-appointment-id')) {
        openDetails(focused.getAttribute('data-appointment-id'));
      }
    });
  }

  document.addEventListener('clareza:ready', init);
})(window, document);
