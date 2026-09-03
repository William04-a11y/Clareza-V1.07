/* ==========================================================================
   CLAREZA v1.07 — js/relatorios-paciente.js
   Relatórios simples do paciente: frequência de consultas por mês e
   distribuição por status, usando os gráficos em canvas (js/charts.js).
   ========================================================================== */

(function (window, document) {
  'use strict';

  const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const STATUS_LABELS = { confirmada: 'Confirmada', pendente: 'Pendente', concluida: 'Concluída', cancelada: 'Cancelada' };

  function last6MonthsVolume(consultas) {
    const today = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const ref = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const count = consultas.filter((c) => {
        const cd = new Date(`${c.date}T00:00:00`);
        return cd.getFullYear() === ref.getFullYear() && cd.getMonth() === ref.getMonth();
      }).length;
      months.push({ label: MONTH_LABELS[ref.getMonth()], value: count });
    }

    return months;
  }

  function statusBreakdown(consultas) {
    const counts = { confirmada: 0, pendente: 0, concluida: 0, cancelada: 0 };
    consultas.forEach((c) => {
      if (counts[c.status] !== undefined) counts[c.status] += 1;
    });
    return counts;
  }

  function renderStats(consultas) {
    const { qs } = window.ClarezaUtils;
    const total = consultas.length;
    const concluidas = consultas.filter((c) => c.status === 'concluida').length;
    const canceladas = consultas.filter((c) => c.status === 'cancelada').length;
    const base = concluidas + canceladas;
    const taxa = base > 0 ? Math.round((concluidas / base) * 100) : 100;

    qs('#relatoriosStats').innerHTML = [
      window.ClarezaComponents.renderStatCard({ label: 'Total de sessões', value: String(total) }),
      window.ClarezaComponents.renderStatCard({ label: 'Sessões concluídas', value: String(concluidas) }),
      window.ClarezaComponents.renderStatCard({ label: 'Taxa de comparecimento', value: `${taxa}%`, delta: taxa >= 80 ? 'Ótima frequência' : 'Pode melhorar', positive: taxa >= 80 }),
    ].join('');
  }

  function renderCharts(consultas) {
    const barCanvas = document.getElementById('monthlyVolumeChart');
    const donutCanvas = document.getElementById('statusDonutChart');
    if (!barCanvas || !donutCanvas) return;

    const draw = () => {
      const months = last6MonthsVolume(consultas);
      window.ClarezaCharts.renderBarChart(barCanvas, {
        labels: months.map((m) => m.label),
        values: months.map((m) => m.value),
        height: 200,
      });

      const breakdown = statusBreakdown(consultas);
      const colors = {
        confirmada: getComputedStyle(document.documentElement).getPropertyValue('--color-success').trim(),
        pendente: getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim(),
        concluida: getComputedStyle(document.documentElement).getPropertyValue('--color-info').trim(),
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
          .filter((key) => breakdown[key] > 0)
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

  function init() {
    const { qs } = window.ClarezaUtils;
    if (!window.ClarezaPacienteData || !qs('#relatoriosStats')) return;

    const consultas = window.ClarezaPacienteData.getConsultas();
    renderStats(consultas);
    renderCharts(consultas);
  }

  document.addEventListener('clareza:ready', init);
})(window, document);
