/* ==========================================================================
   CLAREZA v1.07 — components/footer.js
   Gera o HTML do rodapé institucional (usado nas páginas públicas).
   ========================================================================== */

(function (window) {
  'use strict';

  /**
   * @param {Object} opts - { base } caminho relativo até a raiz do projeto
   */
  function renderFooter({ base = '' } = {}) {
    const year = new Date().getFullYear();
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer__grid">
            <div class="footer__col">
              <div class="footer__brand">Clareza</div>
              <p style="max-width: 32ch; font-size: var(--fs-sm);">
                Uma plataforma para organizar a jornada entre psicólogos e pacientes com clareza e cuidado.
              </p>
            </div>
            <div class="footer__col">
              <div class="footer__col-title">Plataforma</div>
              <a href="${base}index.html#recursos">Recursos</a>
              <a href="${base}index.html#planos">Planos</a>
              <a href="${base}pages/auth/cadastro.html">Criar conta</a>
            </div>
            <div class="footer__col">
              <div class="footer__col-title">Perfis</div>
              <a href="${base}pages/auth/cadastro-psicologo.html">Para psicólogos</a>
              <a href="${base}pages/auth/cadastro-paciente.html">Para pacientes</a>
            </div>
            <div class="footer__col">
              <div class="footer__col-title">Suporte</div>
              <a href="#">Central de ajuda</a>
              <a href="#">Privacidade</a>
              <a href="#">Termos de uso</a>
            </div>
          </div>
          <div class="footer__bottom">
            <span>&copy; ${year} Clareza. Versão de demonstração 1.07 — dados fictícios.</span>
            <span class="text-mono">Front-end estático · sem backend</span>
          </div>
        </div>
      </footer>`;
  }

  window.ClarezaComponents = window.ClarezaComponents || {};
  window.ClarezaComponents.renderFooter = renderFooter;
})(window);
