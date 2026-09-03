/* ==========================================================================
   CLAREZA v1.07 — js/pagamentos-paciente.js
   Página "Pagamentos": resumo financeiro, listagem filtrável por status
   e modal de comprovante simulado.
   ========================================================================== */

(function (window, document) {
  'use strict';

  const STATUS_LABELS = { pago: 'Pago', pendente: 'Pendente', atrasado: 'Atrasado' };
  const STATUS_BADGE = { pago: 'success', pendente: 'warning', atrasado: 'danger' };
  const PAYMENT_METHODS = ['Pix', 'Cartão de crédito', 'Cartão de débito'];

  let statusFilter = 'todos';

  function currency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  function renderSummary(pagamentos) {
    const { qs } = window.ClarezaUtils;
    const container = qs('#pagamentosSummary');
    if (!container) return;

    const totalPago = pagamentos.filter((p) => p.status === 'pago').reduce((sum, p) => sum + p.value, 0);
    const totalPendente = pagamentos.filter((p) => p.status === 'pendente').reduce((sum, p) => sum + p.value, 0);
    const totalAtrasado = pagamentos.filter((p) => p.status === 'atrasado').reduce((sum, p) => sum + p.value, 0);

    container.innerHTML = [
      window.ClarezaComponents.renderStatCard({ label: 'Total pago', value: currency(totalPago) }),
      window.ClarezaComponents.renderStatCard({ label: 'Pendente', value: currency(totalPendente), delta: totalPendente > 0 ? 'Aguardando pagamento' : 'Nenhum pendente', positive: totalPendente === 0 }),
      window.ClarezaComponents.renderStatCard({ label: 'Em atraso', value: currency(totalAtrasado), delta: totalAtrasado > 0 ? 'Regularize o quanto antes' : 'Tudo em dia', positive: totalAtrasado === 0 }),
    ].join('');
  }

  function getFiltered() {
    const list = window.ClarezaPacienteData.getPagamentos();
    return (statusFilter === 'todos' ? list : list.filter((p) => p.status === statusFilter)).sort((a, b) =>
      a.date < b.date ? 1 : -1
    );
  }

  function renderTable() {
    const { qs, formatDate } = window.ClarezaUtils;
    const tbody = qs('#pagamentosTableBody');
    if (!tbody) return;

    const pagamentos = getFiltered();

    if (!pagamentos.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding: var(--space-6);">Nenhum pagamento encontrado para este filtro.</td></tr>`;
      return;
    }

    tbody.innerHTML = pagamentos
      .map(
        (p) => `
      <tr>
        <td style="font-weight: var(--fw-medium);">${p.reference}</td>
        <td class="text-muted">${formatDate(p.date)}</td>
        <td class="text-mono">${currency(p.value)}</td>
        <td><span class="badge badge--${STATUS_BADGE[p.status]}">${STATUS_LABELS[p.status]}</span></td>
        <td>
          ${p.status === 'pago' ? `<button class="btn btn--ghost btn--sm" data-view-pagamento="${p.id}">Ver comprovante</button>` : '<span class="text-faint text-sm">—</span>'}
        </td>
      </tr>`
      )
      .join('');
  }

  function openComprovanteModal(id) {
    const { qs, formatDate } = window.ClarezaUtils;
    const pagamento = window.ClarezaPacienteData.getPagamentoById(id);
    if (!pagamento) return;

    const method = PAYMENT_METHODS[pagamento.id.length % PAYMENT_METHODS.length];
    const transactionId = pagamento.id.toUpperCase().replace('PAG_', 'CLZ-');

    qs('#modalComprovanteTitle').textContent = `Comprovante — ${pagamento.reference}`;
    qs('#modalComprovanteBody').innerHTML = `
      <div class="flex-between" style="align-items:flex-start; padding: var(--space-5); background-color: var(--color-success-bg); border-radius: var(--radius-md); margin-bottom: var(--space-5);">
        <div>
          <div class="text-sm" style="color: var(--color-success); font-weight: var(--fw-semibold);">Pagamento confirmado</div>
          <div class="text-faint text-xs" style="margin-top: var(--space-1);">ID da transação: ${transactionId}</div>
        </div>
        <span class="badge badge--success">Pago</span>
      </div>
      <div class="grid grid-2" style="gap: var(--space-4);">
        <div><div class="text-faint text-xs">Referente a</div><div>${pagamento.reference}</div></div>
        <div><div class="text-faint text-xs">Data do pagamento</div><div>${formatDate(pagamento.date)}</div></div>
        <div><div class="text-faint text-xs">Valor</div><div class="text-mono">${currency(pagamento.value)}</div></div>
        <div><div class="text-faint text-xs">Forma de pagamento</div><div>${method}</div></div>
      </div>
    `;

    window.ClarezaModal.openModal('modalComprovante');
  }

  function init() {
    const { qs, qsa, on } = window.ClarezaUtils;
    if (!window.ClarezaPacienteData || !qs('#pagamentosTableBody')) return;

    const pagamentos = window.ClarezaPacienteData.getPagamentos();
    renderSummary(pagamentos);
    renderTable();

    qsa('.filter-chip[data-status-filter]').forEach((chip) => {
      on(chip, 'click', () => {
        statusFilter = chip.getAttribute('data-status-filter');
        qsa('.filter-chip[data-status-filter]').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        renderTable();
      });
    });

    on(document, 'click', (event) => {
      const trigger = event.target.closest('[data-view-pagamento]');
      if (trigger) openComprovanteModal(trigger.getAttribute('data-view-pagamento'));
    });
  }

  document.addEventListener('clareza:ready', init);
})(window, document);
