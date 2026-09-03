/* ==========================================================================
   CLAREZA v1.07 — components/alert.js
   Gera markup de alertas inline e toasts flutuantes.
   ========================================================================== */

(function (window) {
  'use strict';

  const ICONS = {
    success: '<svg class="alert__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M6.5 10.3 8.7 12.5 13.5 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    warning: '<svg class="alert__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2.5 18 16.5H2L10 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 8v3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="14" r="0.9" fill="currentColor"/></svg>',
    danger: '<svg class="alert__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M7.5 7.5 12.5 12.5M12.5 7.5 7.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    info: '<svg class="alert__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M10 9v4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="6.5" r="0.9" fill="currentColor"/></svg>',
  };

  /**
   * @param {"success"|"warning"|"danger"|"info"} type
   * @param {Object} opts - { title, message, dismissible }
   */
  function renderAlert(type, { title = '', message = '', dismissible = false } = {}) {
    return `
      <div class="alert alert--${type}${dismissible ? ' alert--dismissible' : ''}" role="alert">
        ${ICONS[type] || ''}
        <div>
          ${title ? `<div class="alert__title">${title}</div>` : ''}
          <div>${message}</div>
        </div>
        ${dismissible ? '<button class="alert__close" aria-label="Fechar alerta" data-alert-close>&times;</button>' : ''}
      </div>`;
  }

  /**
   * @param {"success"|"warning"|"danger"|"info"} type
   */
  function renderToast(type, message) {
    return `
      <div class="toast toast--${type}" role="status">
        ${message}
      </div>`;
  }

  window.ClarezaComponents = window.ClarezaComponents || {};
  window.ClarezaComponents.renderAlert = renderAlert;
  window.ClarezaComponents.renderToast = renderToast;
})(window);
