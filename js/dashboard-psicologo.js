/* ==========================================================================
   CLAREZA v1.07 — js/dashboard-psicologo.js
   Calcula as métricas do Dashboard do Psicólogo a partir dos dados
   simulados (js/mock-data.js) e desenha os gráficos (js/charts.js).
   ========================================================================== */

(function (window, document) {
  'use strict';

  const WEEKDAY_LABELS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const STATUS_LABELS = { confirmada: 'Confirmada', pendente: 'Pendente', realizada: 'Realizada', cancelada: 'Cancelada' };
  const STATUS_BADGE = { confirmada: 'success', pendente: 'warning', realizada: 'info', cancelada: 'danger' };

  function currency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  function computeMetrics(appointments, patients) {
    const { isoDate } = window.ClarezaMockData;
    const todayISO = isoDate(new Date());
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const consultasHoje = appointments.filter((a) => a.date === todayISO && a.status !== 'cancelada').length;

    const proximasConsultas = appointments.filter((a) => {
      const dt = new Date(`${a.date}T${a.time}`);
      return dt >= now && (a.status === 'confirmada' || a.status === 'pendente');
    }).length;

    const consultasRealizadas = appointments.filter((a) => a.status === 'realizada').length;
    const consultasPendentes = appointments.filter((a) => a.status === 'pendente').length;

    const receitaMes = consultasRealizadas * 180 + 3200;

    return {
      consultasHoje,
      proximasConsultas,
      totalPacientes: patients.length,
      receitaMes,
      consultasRealizadas,
      consultasPendentes,
    };
  }

  function last7DaysVolume(appointments) {
    const { isoDate, addDays } = window.ClarezaMockData;
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = addDays(today, -i);
      const iso = isoDate(date);
      const count = appointments.filter((a) => a.date === iso && a.status !== 'cancelada').length;
      days.push({ label: WEEKDAY_LABELS[date.getDay()], value: count });
    }

    return days;
  }

  function monthlyStatusBreakdown(appointments) {
    const now = new Date();
    const monthAppointments = appointments.filter((a) => {
      const dt = new Date(`${a.date}T00:00:00`);
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
    });

    const counts = { confirmada: 0, pendente: 0, realizada: 0, cancelada: 0 };
    monthAppointments.forEach((a) => {
      if (counts[a.status] !== undefined) counts[a.status] += 1;
    });

    return counts;
  }

  function renderStats(metrics) {
    const C = window.ClarezaComponents;
    const { qs } = window.ClarezaUtils;

    qs('#statsGrid').innerHTML = [
      C.renderStatCard({ label: 'Consultas hoje', value: String(metrics.consultasHoje) }),
      C.renderStatCard({ label: 'Próximas consultas', value: String(metrics.proximasConsultas) }),
      C.renderStatCard({ label: 'Total de pacientes', value: String(metrics.totalPacientes) }),
      C.renderStatCard({ label: 'Receita do mês', value: currency(metrics.receitaMes), delta: 'Estimativa com base em sessões realizadas', positive: true }),
      C.renderStatCard({ label: 'Consultas realizadas', value: String(metrics.consultasRealizadas) }),
      C.renderStatCard({ label: 'Consultas pendentes', value: String(metrics.consultasPendentes), delta: metrics.consultasPendentes > 0 ? 'Aguardando confirmação' : 'Tudo em dia', positive: metrics.consultasPendentes === 0 }),
    ].join('');
  }

  function renderCharts(appointments) {
    const barCanvas = document.getElementById('weeklyVolumeChart');
    const donutCanvas = document.getElementById('statusDonutChart');
    if (!barCanvas || !donutCanvas) return;

    const draw = () => {
      const week = last7DaysVolume(appointments);
      window.ClarezaCharts.renderBarChart(barCanvas, {
        labels: week.map((d) => d.label),
        values: week.map((d) => d.value),
        height: 200,
      });

      const breakdown = monthlyStatusBreakdown(appointments);
      const colors = {
        confirmada: getComputedStyle(document.documentElement).getPropertyValue('--color-success').trim(),
        pendente: getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim(),
        realizada: getComputedStyle(document.documentElement).getPropertyValue('--color-info').trim(),
        cancelada: getComputedStyle(document.documentElement).getPropertyValue('--color-danger').trim(),
      };

      window.ClarezaCharts.renderDonutChart(donutCanvas, {
        height: 180,
        segments: Object.keys(breakdown)
          .filter((key) => breakdown[key] > 0)
          .map((key) => ({ label: STATUS_LABELS[key], value: breakdown[key], color: colors[key] })),
      });

      const legend = document.getElementById('statusDonutLegend');
      if (legend) {
        legend.innerHTML = Object.keys(breakdown)
          .map(
            (key) => `
          <div class="chart-card__legend-item">
            <span class="chart-card__legend-dot" style="background-color:${colors[key]}"></span>
            ${STATUS_LABELS[key]} (${breakdown[key]})
          </div>`
          )
          .join('');
      }
    };

    draw();
    window.ClarezaCharts.onResizeRedraw([draw]);
  }

  function renderTodayTable(appointments) {
    const { qs, formatDate } = window.ClarezaUtils;
    const { isoDate } = window.ClarezaMockData;
    const todayISO = isoDate(new Date());

    const todayAppointments = appointments
      .filter((a) => a.date === todayISO)
      .sort((a, b) => a.time.localeCompare(b.time));

    const tbody = qs('#sessionsTableBody');
    if (!tbody) return;

    if (!todayAppointments.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted" style="padding: var(--space-6);">Nenhuma consulta agendada para hoje.</td></tr>`;
      return;
    }

    tbody.innerHTML = todayAppointments
      .map(
        (a) => `
      <tr>
        <td class="text-mono">${a.time}</td>
        <td>${a.patientName}</td>
        <td>${a.modality}</td>
        <td><span class="badge badge--${STATUS_BADGE[a.status]}">${STATUS_LABELS[a.status]}</span></td>
      </tr>`
      )
      .join('');
  }

  function renderRecentPatients(patients) {
    const { qs, getInitials, formatDate } = window.ClarezaUtils;
    const list = [...patients]
      .sort((a, b) => (a.lastSession < b.lastSession ? 1 : -1))
      .slice(0, 4);

    const container = qs('#patientsList');
    if (!container) return;

    container.innerHTML = list
      .map(
        (p) => `
      <div class="flex flex-gap-3" style="align-items:center;">
        <div class="avatar avatar--sm">${getInitials(p.name)}</div>
        <div>
          <div style="font-weight: var(--fw-medium); font-size: var(--fs-sm);">${p.name}</div>
          <div class="text-faint text-xs">Última sessão em ${formatDate(p.lastSession)}</div>
        </div>
      </div>`
      )
      .join('');
  }

  function renderNewAppointmentModal(patients) {
    const { qs } = window.ClarezaUtils;
    const slot = qs('#modalSlot');
    if (!slot) return;

    const optionsHtml = patients.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');

    slot.outerHTML = window.ClarezaComponents.renderModal({
      id: 'modalNovaSessao',
      title: 'Agendar nova consulta',
      bodyHtml: `
        <div id="novaSessaoFeedback"></div>
        <div class="field">
          <label class="field__label" for="novaSessaoPaciente">Paciente</label>
          <select class="select" id="novaSessaoPaciente">${optionsHtml}</select>
        </div>
        <div class="grid grid-2" style="gap: var(--space-4);">
          <div class="field">
            <label class="field__label" for="novaSessaoData">Data</label>
            <input class="input" type="date" id="novaSessaoData" />
          </div>
          <div class="field">
            <label class="field__label" for="novaSessaoHora">Horário</label>
            <input class="input" type="time" id="novaSessaoHora" />
          </div>
        </div>
        <div class="field" style="margin-bottom:0;">
          <label class="field__label" for="novaSessaoModalidade">Modalidade</label>
          <select class="select" id="novaSessaoModalidade">
            <option>Online</option>
            <option>Presencial</option>
          </select>
        </div>`,
      footerHtml: `
        <button class="btn btn--secondary" data-modal-close>Cancelar</button>
        <button class="btn btn--primary" id="confirmarNovaSessao">Agendar consulta</button>`,
    });

    const { on } = window.ClarezaUtils;
    on(document, 'click', (event) => {
      if (event.target.id !== 'confirmarNovaSessao') return;

      const patientSelect = document.getElementById('novaSessaoPaciente');
      const dateInput = document.getElementById('novaSessaoData');
      const timeInput = document.getElementById('novaSessaoHora');
      const modalitySelect = document.getElementById('novaSessaoModalidade');
      const feedback = document.getElementById('novaSessaoFeedback');

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

      window.ClarezaModal.closeModal('modalNovaSessao');
      window.location.reload();
    });
  }

  function init() {
    if (!window.ClarezaMockData || !document.getElementById('statsGrid')) return;

    const appointments = window.ClarezaMockData.getAppointments();
    const patients = window.ClarezaMockData.getPatients();

    renderStats(computeMetrics(appointments, patients));
    renderCharts(appointments);
    renderTodayTable(appointments);
    renderRecentPatients(patients);
    renderNewAppointmentModal(patients);
  }

  document.addEventListener('clareza:ready', init);
})(window, document);
