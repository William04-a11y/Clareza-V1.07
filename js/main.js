/* ==========================================================================
   CLAREZA v1.07 — js/main.js
   Ponto de entrada. Roda em toda página (basta incluir este script após
   os arquivos de components/ e js/*.js listados no HTML).
   ========================================================================== */

(function (window, document) {
  'use strict';

  function bootstrap() {
    window.ClarezaAuth.seedMockUsers();
    window.ClarezaAuth.guardPrivatePage();

    // Disponível apenas nas páginas do psicólogo que incluem mock-data.js
    if (window.ClarezaMockData) {
      window.ClarezaMockData.seedAll();
    }

    // Disponível apenas nas páginas do paciente que incluem mock-data-paciente.js
    if (window.ClarezaPacienteData) {
      window.ClarezaPacienteData.seedAll();
    }

    // Disponível apenas nas páginas que incluem mock-data-prontuarios.js
    if (window.ClarezaProntuarios) {
      window.ClarezaProntuarios.seedAll();
    }

    window.ClarezaNavigation.renderLayout();
    window.ClarezaNavigation.highlightActiveLink();
    window.ClarezaNavigation.initLogoutHandlers();

    window.ClarezaModal.init();
    window.ClarezaDropdown.init();

    // Inicializadores específicos de formulário (no-op se o form não existir)
    window.ClarezaAuth.initLoginForm();
    window.ClarezaAuth.initCadastroPacienteForm();
    window.ClarezaAuth.initCadastroPsicologoForm();
    window.ClarezaAuth.initRecuperacaoForm();

    // Liga os botões de mostrar/ocultar senha presentes na página.
    window.ClarezaUtils.initPasswordToggles();

    // Fecha alertas dispensáveis (data-alert-close) em qualquer página.
    document.addEventListener('click', (event) => {
      const closeBtn = event.target.closest('[data-alert-close]');
      if (closeBtn) {
        closeBtn.closest('.alert')?.remove();
      }
    });

    document.dispatchEvent(new CustomEvent('clareza:ready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})(window, document);
