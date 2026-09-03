/* ==========================================================================
   CLAREZA v1.07 — js/agenda-paciente.js
   Visualização semanal da agenda do paciente (somente as próprias
   consultas) e modal para solicitar uma nova consulta (simulado).
   ========================================================================== */

(function (window, document) {
  'use strict';

  const WEEKDAY_LABELS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const HOURS = Array.from({ length: 12 }, (_, i) => 8 + i);
  const STATUS_LABELS = { confirmada: 'Confirmada', pendente: 'Pendente', concluida: 'Concluída', cancelada: 'Cancelada' };
  const STATUS_BADGE = { confirmada: 'success', pendente: 'warning', concluida: 'info', cancelada: 'danger' };
  const STATUS_EVENT_CLASS = { pendente: 'pendente', cancelada: 'cancelada', concluida: 'realizada' };

  let referenceDate = new Date();

  function getWeekStart(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }

  function formatWeekLabel(start, end) {
    const sameMonth = start.getMonth() === end.getMonth();
    const startLabel = new Intl.DateTimeFormat('pt-BR', sameMonth ? { day: '2-digit' } : { day: '2-digit', month: 'long' }).format(start);
    const endLabel = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(end);
    return `${startLabel} – ${endLabel}`;
  }

  function eventClass(consulta) {
    return STATUS_EVENT_CLASS[consulta.status] ? `calendar-event--${STATUS_EVENT_CLASS[consulta.status]}` : '';
  }

  function renderWeek() {
    const { qs } = window.ClarezaUtils;
    const { isoDate, addDays } = window.ClarezaPacienteData;
    const consultas = window.ClarezaPacienteData.getConsultas();

    const weekStart = getWeekStart(referenceDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const todayISO = isoDate(new Date());

    qs('#agendaLabel').textContent = formatWeekLabel(weekStart, addDays(weekStart, 6));

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
        const cellConsultas = consultas.filter((c) => c.date === iso && parseInt(c.time.split(':')[0], 10) === hour);

        html += `<div class="calendar-week__cell">`;
        cellConsultas.forEach((c) => {
          html += `
            <div class="calendar-event ${eventClass(c)}" data-consulta-id="${c.id}" tabindex="0" role="button">
              <span class="calendar-event__time">${c.time}</span> ${c.professional.split(' ').slice(0, 2).join(' ')}
            </div>`;
        });
        html += `</div>`;
      });
    });

    html += '</div>';
    qs('#agendaContent').innerHTML = html;
  }

  function navigate(step) {
    referenceDate = window.ClarezaPacienteData.addDays(referenceDate, 7 * step);
    renderWeek();
  }

  function openDetails(id) {
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

  function handleNewRequest() {
    const { qs } = window.ClarezaUtils;
    const dateInput = qs('#solicitarData');
    const timeInput = qs('#solicitarHora');
    const modalitySelect = qs('#solicitarModalidade');
    const notesInput = qs('#solicitarObservacao');
    const feedback = qs('#solicitarConsultaFeedback');

    if (!dateInput.value || !timeInput.value) {
      feedback.innerHTML = window.ClarezaComponents.renderAlert('danger', {
        message: 'Selecione a data e o horário desejados.',
      });
      return;
    }

    window.ClarezaPacienteData.addConsulta({
      date: dateInput.value,
      time: timeInput.value,
      modality: modalitySelect.value,
      status: 'pendente',
      notes: notesInput.value.trim(),
    });

    window.ClarezaModal.closeModal('modalSolicitarConsulta');
    referenceDate = new Date(`${dateInput.value}T00:00:00`);
    renderWeek();

    qs('#agendaContent').insertAdjacentHTML(
      'beforebegin',
      window.ClarezaComponents.renderAlert('success', {
        title: 'Solicitação enviada',
        message: 'Sua solicitação foi enviada à Dra. Marina Costa e aguarda confirmação.',
        dismissible: true,
      })
    );

    dateInput.value = '';
    timeInput.value = '';
    notesInput.value = '';
    feedback.innerHTML = '';
  }

  function init() {
    const { qs, on } = window.ClarezaUtils;
    if (!window.ClarezaPacienteData || !qs('#agendaContent')) return;

    renderWeek();

    on(qs('#agendaPrev'), 'click', () => navigate(-1));
    on(qs('#agendaNext'), 'click', () => navigate(1));
    on(qs('#agendaToday'), 'click', () => {
      referenceDate = new Date();
      renderWeek();
    });

    on(document, 'click', (event) => {
      const eventEl = event.target.closest('[data-consulta-id]');
      if (eventEl) {
        openDetails(eventEl.getAttribute('data-consulta-id'));
        return;
      }

      if (event.target.id === 'confirmarSolicitacao') {
        handleNewRequest();
      }
    });
  }

  document.addEventListener('clareza:ready', init);
})(window, document);
