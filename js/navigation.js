/* ==========================================================================
   CLAREZA v1.07 — js/navigation.js
   Injeta navbar/sidebar/footer nos placeholders da página e controla
   a abertura/fechamento do menu lateral em telas menores.
   ========================================================================== */

(function (window) {
  'use strict';

  const { qs, on, storage } = window.ClarezaUtils;
  const C = window.ClarezaComponents;

  /**
   * Lê os dados da página a partir de atributos data-* no <body>:
   *   data-layout="public" | "app"
   *   data-role="psicologo" | "paciente"
   *   data-active="dashboard"
   *   data-page-title="Visão geral"
   */
  function renderLayout() {
    const body = document.body;
    const layout = body.dataset.layout || 'public';
    // Caminho relativo até a raiz do projeto (ex.: "../../" dentro de
    // pages/auth/). Definido em cada página via <body data-base="...">.
    const base = body.dataset.base || '';

    if (layout === 'public') {
      const navSlot = qs('#navbarSlot');
      const footerSlot = qs('#footerSlot');
      if (navSlot) navSlot.outerHTML = C.renderPublicNavbar({ base });
      if (footerSlot) footerSlot.outerHTML = C.renderFooter({ base });
      return;
    }

    if (layout === 'app') {
      const role = body.dataset.role || 'paciente';
      const activeKey = body.dataset.active || '';
      const pageTitle = body.dataset.pageTitle || '';

      const user = storage.get('session', { name: 'Usuário Demonstração', role });

      const sidebarSlot = qs('#sidebarSlot');
      const navSlot = qs('#navbarSlot');

      if (sidebarSlot) sidebarSlot.outerHTML = C.renderSidebar(role, activeKey, base);
      if (navSlot) navSlot.outerHTML = C.renderAppNavbar({ user, pageTitle, base });

      initSidebarToggle();
    }
  }

  function initSidebarToggle() {
    const toggle = qs('#sidebarToggle');
    const sidebar = qs('#sidebar');
    const overlay = qs('#sidebarOverlay');

    if (!toggle || !sidebar) return;

    const setOpen = (isOpen) => {
      sidebar.classList.toggle('is-open', isOpen);
      overlay?.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    };

    on(toggle, 'click', () => setOpen(!sidebar.classList.contains('is-open')));
    on(overlay, 'click', () => setOpen(false));
  }

  function initLogoutHandlers() {
    on(document, 'click', (event) => {
      const trigger = event.target.closest('[data-logout]');
      if (!trigger) return;
      event.preventDefault();
      const base = document.body.dataset.base || '';
      storage.remove('session');
      window.location.href = `${base}pages/auth/login.html`;
    });
  }

  /* Marca o link ativo na navbar pública (login/cadastro/landing).
     A sidebar interna já recebe o item ativo diretamente via
     renderSidebar(role, activeKey, base), então não precisa disso.
     Usamos a propriedade .pathname (resolvida pelo navegador) em vez de
     getAttribute('href'), pois os links do projeto são relativos. */
  function highlightActiveLink() {
    const links = document.querySelectorAll('.navbar__links a');
    links.forEach((link) => {
      if (link.pathname === window.location.pathname) {
        link.classList.add('is-active');
      }
    });
  }

  window.ClarezaNavigation = { renderLayout, highlightActiveLink, initLogoutHandlers };
})(window);
