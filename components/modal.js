/* ==========================================================================
   CLAREZA v1.07 — components/modal.js
   Gera o markup de um modal (backdrop + caixa). O comportamento de
   abrir/fechar/focus-trap fica em js/modal.js (ClarezaModal).
   ========================================================================== */

(function (window) {
  'use strict';

  /**
   * @param {Object} opts - { id, title, bodyHtml, footerHtml }
   */
  function renderModal({ id, title = '', bodyHtml = '', footerHtml = '' }) {
    return `
      <div class="modal-backdrop" id="${id}" data-modal>
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="${id}Title">
          <div class="modal__header">
            <h2 class="modal__title" id="${id}Title">${title}</h2>
            <button class="modal__close" data-modal-close aria-label="Fechar">&times;</button>
          </div>
          <div class="modal__body">${bodyHtml}</div>
          ${footerHtml ? `<div class="modal__footer">${footerHtml}</div>` : ''}
        </div>
      </div>`;
  }

  /**
   * Atalho para um modal de confirmação (ex.: excluir registro, cancelar sessão).
   */
  function renderConfirmModal({ id, title = 'Confirmar ação', message = '', confirmLabel = 'Confirmar', cancelLabel = 'Cancelar' }) {
    return renderModal({
      id,
      title,
      bodyHtml: `<p class="text-muted">${message}</p>`,
      footerHtml: `
        <button class="btn btn--secondary" data-modal-close>${cancelLabel}</button>
        <button class="btn btn--danger" data-modal-confirm>${confirmLabel}</button>`,
    });
  }

  window.ClarezaComponents = window.ClarezaComponents || {};
  window.ClarezaComponents.renderModal = renderModal;
  window.ClarezaComponents.renderConfirmModal = renderConfirmModal;
})(window);
