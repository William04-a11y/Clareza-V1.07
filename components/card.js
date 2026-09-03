/* ==========================================================================
   CLAREZA v1.07 — components/card.js
   Gera markup de cards genéricos e cards de estatística (stat-card).
   ========================================================================== */

(function (window) {
  'use strict';

  /**
   * @param {Object} opts - { title, subtitle, bodyHtml, footerHtml }
   */
  function renderCard({ title = '', subtitle = '', bodyHtml = '', footerHtml = '', hover = true } = {}) {
    return `
      <div class="card${hover ? ' card--hover' : ''}">
        ${title ? `
        <div class="card__header">
          <div>
            <div class="card__title">${title}</div>
            ${subtitle ? `<div class="card__subtitle">${subtitle}</div>` : ''}
          </div>
        </div>` : ''}
        <div class="card__body">${bodyHtml}</div>
        ${footerHtml ? `<div class="card__footer">${footerHtml}</div>` : ''}
      </div>`;
  }

  /**
   * @param {Object} opts - { label, value, delta, positive }
   */
  function renderStatCard({ label = '', value = '', delta = '', positive = true } = {}) {
    return `
      <div class="stat-card">
        <div class="stat-card__label">${label}</div>
        <div class="stat-card__value">${value}</div>
        ${delta ? `<div class="stat-card__delta ${positive ? 'is-positive' : 'is-negative'}">${delta}</div>` : ''}
      </div>`;
  }

  window.ClarezaComponents = window.ClarezaComponents || {};
  window.ClarezaComponents.renderCard = renderCard;
  window.ClarezaComponents.renderStatCard = renderStatCard;
})(window);
