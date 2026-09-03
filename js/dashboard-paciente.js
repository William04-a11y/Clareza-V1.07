/* ==========================================================================
   CLAREZA v1.07 — js/dashboard-paciente.js
   Monta o Dashboard do paciente a partir dos dados simulados
   (js/mock-data-paciente.js): próxima consulta, histórico, avisos,
   documentos recentes e situação financeira.
   ========================================================================== */

(function (window, document) {
  'use strict';

  const STATUS_LABELS = { confirmada: 'Confirmada', pendente: 'Pendente', concluida: 'Concluída', cancelada: 'Cancelada' };
  const STATUS_BADGE = { confirmada: 'success', pendente: 'warning', concluida: 'info', cancelada: 'danger' };
  const DOC_STATUS_LABELS = { disponivel: 'Disponível', pendente: 'Pendente' };
  const DOC_STATUS_BADGE = { disponivel: 'success', pendente: 'warning' };

  function currency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  function getNextConsulta(consultas) {
    const now = new Date();
    return consultas
      .filter((c) => (c.status === 'confirmada' || c.status === 'pendente') && new Date(`${c.date}T${c.time}`) >= now)
      .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))[0] || null;
  }

  function renderNextConsulta(consulta) {
    const { qs, getInitials, formatDate } = window.ClarezaUtils;
    const card = qs('#nextConsultaCard');
    if (!card) return;

    if (!consulta) {
      card.innerHTML = `
        <div class="empty-state" style="padding: var(--space-6);">
          <div class="empty-state__title">Nenhuma consulta agendada</div>
          <p class="text-muted text-sm">Solicite uma nova consulta na página de Agenda.</p>
          <a href="agenda.html" class="btn btn--primary" style="margin-top: var(--space-4);">Ir para a agenda</a>
        </div>`;
      return;
    }

    const psicologo = window.ClarezaPacienteData.psicologo;

    card.innerHTML = `
      <div class="flex-between" style="align-items:flex-start; margin-bottom: var(--space-5); flex-wrap: wrap; gap: var(--space-3);">
        <div>
          <span class="eyebrow">Próxima consulta</span>
          <h3 style="margin-top: var(--space-2);">${formatDate(consulta.date, { weekday: 'long', day: '2-digit', month: 'long' })}</h3>
        </div>
        <span class="badge badge--${STATUS_BADGE[consulta.status]}">${STATUS_LABELS[consulta.status]}</span>
      </div>

      <div class="flex flex-gap-4" style="align-items:center;">
        <div class="avatar avatar--lg">${getInitials(psicologo.name)}</div>
        <div style="flex:1;">
          <div style="font-weight: var(--fw-semibold); font-size: var(--fs-md);">${psicologo.name}</div>
          <div class="text-muted text-sm">${psicologo.especialidade}</div>
        </div>
        <div class="text-center">
          <div class="text-mono" style="font-size: var(--fs-xl); font-weight: var(--fw-semibold); color: var(--color-primary-700);">${consulta.time}</div>
          <div class="text-faint text-xs">${consulta.modality}</div>
        </div>
      </div>

      <div class="card__footer" style="border-top: none; margin-top: var(--space-5); padding-top: 0;">
        <button class="btn btn--secondary" data-view-consulta="${consulta.id}">Ver detalhes</button>
        ${consulta.modality === 'Online' ? '<button class="btn btn--primary">Entrar na sessão</button>' : ''}
      </div>
    `;
  }

  function renderHistorico(consultas) {
    const { qs, formatDate } = window.ClarezaUtils;
    const tbody = qs('#historicoTableBody');
    if (!tbody) return;

    const historico = consultas
      .filter((c) => c.status === 'concluida' || c.status === 'cancelada')
      .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1))
      .slice(0, 5);

    if (!historico.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted" style="padding: var(--space-6);">Nenhuma consulta no histórico ainda.</td></tr>`;
      return;
    }

    tbody.innerHTML = historico
      .map(
        (c) => `
      <tr>
        <td>${formatDate(c.date)}</td>
        <td class="text-mono">${c.time}</td>
        <td>${c.professional}</td>
        <td><span class="badge badge--${STATUS_BADGE[c.status]}">${STATUS_LABELS[c.status]}</span></td>
      </tr>`
      )
      .join('');
  }

  function renderAvisos(avisos) {
    const { qs } = window.ClarezaUtils;
    const container = qs('#avisosArea');
    if (!container) return;

    container.innerHTML = avisos
      .map((a) => window.ClarezaComponents.renderAlert(a.type, { title: a.title, message: a.message, dismissible: true }))
      .join('');
  }

  function renderDocumentosRecentes(documentos) {
    const { qs, formatDate } = window.ClarezaUtils;
    const container = qs('#documentosRecentesList');
    if (!container) return;

    const recentes = [...documentos].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 4);

    container.innerHTML = recentes
      .map(
        (d) => `
      <div class="flex-between" style="padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border);">
        <div>
          <div class="text-sm" style="font-weight: var(--fw-medium);">${d.name}</div>
          <div class="text-faint text-xs">${d.type} · ${formatDate(d.date)}</div>
        </div>
        <span class="badge badge--${DOC_STATUS_BADGE[d.status]}">${DOC_STATUS_LABELS[d.status]}</span>
      </div>`
      )
      .join('');
  }

  function renderSituacaoFinanceira(pagamentos) {
    const { qs } = window.ClarezaUtils;
    const container = qs('#situacaoFinanceira');
    if (!container) return;

    const totalPago = pagamentos.filter((p) => p.status === 'pago').reduce((sum, p) => sum + p.value, 0);
    const totalPendente = pagamentos
      .filter((p) => p.status === 'pendente' || p.status === 'atrasado')
      .reduce((sum, p) => sum + p.value, 0);
    const temAtraso = pagamentos.some((p) => p.status === 'atrasado');

    container.innerHTML = `
      <div class="grid grid-2" style="gap: var(--space-4);">
        <div>
          <div class="text-faint text-xs">Pago este mês</div>
          <div style="font-family: var(--font-display); font-size: var(--fs-lg); color: var(--color-primary-900);">${currency(totalPago)}</div>
        </div>
        <div>
          <div class="text-faint text-xs">Em aberto</div>
          <div style="font-family: var(--font-display); font-size: var(--fs-lg); color: ${temAtraso ? 'var(--color-danger)' : 'var(--color-primary-900)'};">${currency(totalPendente)}</div>
        </div>
      </div>
      ${temAtraso ? '<p class="text-sm" style="color: var(--color-danger); margin-top: var(--space-3);">Há um pagamento em atraso.</p>' : ''}
    `;
  }

  function openConsultaModal(id) {
    const { qs, getInitials, formatDate } = window.ClarezaUtils;
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
    const { qs, on } = window.ClarezaUtils;
    if (!window.ClarezaPacienteData || !qs('#nextConsultaCard')) return;

    const consultas = window.ClarezaPacienteData.getConsultas();
    const documentos = window.ClarezaPacienteData.getDocumentos();
    const pagamentos = window.ClarezaPacienteData.getPagamentos();
    const avisos = window.ClarezaPacienteData.getAvisos();

    renderNextConsulta(getNextConsulta(consultas));
    renderHistorico(consultas);
    renderAvisos(avisos);
    renderDocumentosRecentes(documentos);
    renderSituacaoFinanceira(pagamentos);

    on(document, 'click', (event) => {
      const trigger = event.target.closest('[data-view-consulta]');
      if (trigger) openConsultaModal(trigger.getAttribute('data-view-consulta'));
    });
  }

  document.addEventListener('clareza:ready', init);
})(window, document);
