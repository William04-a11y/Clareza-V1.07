/* ==========================================================================
   CLAREZA v1.07 — js/dropdown.js
   Controlador genérico de menus suspensos (dropdowns): notificações,
   menu do usuário, filtros, etc. Funciona por delegação de eventos, então
   cobre painéis injetados dinamicamente pelos componentes.
   ========================================================================== */

(function (window) {
  'use strict';

  const { qsa, on } = window.ClarezaUtils;

  function closeAll(exceptPanel) {
    qsa('.dropdown__panel.is-open').forEach((panel) => {
      if (panel === exceptPanel) return;
      panel.classList.remove('is-open');
      const trigger = document.querySelector(`[data-dropdown-toggle="${panel.id}"]`);
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function init() {
    on(document, 'click', (event) => {
      const trigger = event.target.closest('[data-dropdown-toggle]');

      if (trigger) {
        const panel = document.getElementById(trigger.getAttribute('data-dropdown-toggle'));
        if (!panel) return;

        const willOpen = !panel.classList.contains('is-open');
        closeAll();
        panel.classList.toggle('is-open', willOpen);
        trigger.setAttribute('aria-expanded', String(willOpen));
        return;
      }

      // Clique fora de qualquer dropdown fecha todos os painéis abertos.
      if (!event.target.closest('.dropdown__panel')) {
        closeAll();
      }
    });

    on(document, 'keydown', (event) => {
      if (event.key === 'Escape') closeAll();
    });
  }

  window.ClarezaDropdown = { init, closeAll };
})(window);
