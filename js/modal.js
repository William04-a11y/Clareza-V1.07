/* ==========================================================================
   CLAREZA v1.07 — js/modal.js
   Controlador genérico de modais: abrir, fechar, clique fora, tecla ESC
   e retenção de foco (acessibilidade).
   ========================================================================== */

(function (window) {
  'use strict';

  const { qs, qsa, on } = window.ClarezaUtils;
  let lastFocusedElement = null;

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    lastFocusedElement = document.activeElement;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    const focusable = qs('button, [href], input, select, textarea', modal);
    if (focusable) focusable.focus();
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('is-open');
    document.body.style.overflow = '';

    if (lastFocusedElement) lastFocusedElement.focus();
  }

  function closeAllModals() {
    qsa('.modal-backdrop.is-open').forEach((modal) => closeModal(modal.id));
  }

  function trapFocus(event, modal) {
    const focusables = qsa('button, [href], input, select, textarea', modal).filter(
      (el) => !el.disabled && el.tabIndex !== -1
    );
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function init() {
    // Delegação de eventos: funciona mesmo para modais injetados depois.
    on(document, 'click', (event) => {
      const opener = event.target.closest('[data-modal-open]');
      if (opener) {
        openModal(opener.getAttribute('data-modal-open'));
        return;
      }

      const closer = event.target.closest('[data-modal-close]');
      if (closer) {
        const modal = closer.closest('.modal-backdrop');
        if (modal) closeModal(modal.id);
        return;
      }

      // Clique no backdrop (fora da caixa do modal) fecha.
      if (event.target.classList.contains('modal-backdrop')) {
        closeModal(event.target.id);
      }
    });

    on(document, 'keydown', (event) => {
      const openModalEl = qs('.modal-backdrop.is-open');
      if (!openModalEl) return;

      if (event.key === 'Escape') {
        closeModal(openModalEl.id);
      } else if (event.key === 'Tab') {
        trapFocus(event, openModalEl);
      }
    });
  }

  window.ClarezaModal = { init, openModal, closeModal, closeAllModals };
})(window);
