/* ==========================================================================
   CLAREZA v1.07 — components/navbar.js
   Gera o HTML da navbar. Como o projeto roda sem servidor (file://),
   os componentes são funções JS que retornam strings HTML, em vez de
   partials .html carregados via fetch (que falhariam por CORS local).
   ========================================================================== */

(function (window) {
  'use strict';

  const LOGO_MARK = `
    <svg class="navbar__logo" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="14" cy="14" r="13" stroke="currentColor" stroke-width="1.4" opacity="0.35"/>
      <circle cx="14" cy="14" r="8.5" stroke="currentColor" stroke-width="1.4" opacity="0.65"/>
      <circle cx="14" cy="14" r="4" fill="currentColor"/>
    </svg>`;

  /**
   * Renderiza a navbar pública (landing / auth).
   * @param {Object} opts - { base } caminho relativo até a raiz do projeto
   *   (ex.: "" na raiz, "../../" dentro de pages/auth/). Necessário porque
   *   o projeto roda via file:// e não pode usar caminhos absolutos "/".
   */
  function renderPublicNavbar({ base = '' } = {}) {
    return `
      <header class="navbar navbar--public">
        <div class="container flex-between" style="width:100%;">
          <a href="${base}index.html" class="navbar__brand">
            ${LOGO_MARK}
            Clareza
          </a>
          <nav class="navbar__links" aria-label="Navegação principal">
            <a href="${base}index.html#sobre">Sobre</a>
            <a href="${base}index.html#recursos">Recursos</a>
            <a href="${base}index.html#planos">Planos</a>
          </nav>
          <div class="navbar__actions">
            <a href="${base}pages/auth/login.html" class="btn btn--ghost btn--sm">Entrar</a>
            <a href="${base}pages/auth/cadastro.html" class="btn btn--primary btn--sm">Criar conta</a>
          </div>
        </div>
      </header>`;
  }

  /**
   * Renderiza a navbar interna (áreas logadas de psicólogo/paciente).
   * @param {Object} user - { name, email, role }
   * @param {string} base - caminho relativo até a raiz do projeto
   */
  function renderAppNavbar({ user = { name: 'Usuário', role: 'paciente' }, pageTitle = '', base = '' } = {}) {
    const initials = window.ClarezaUtils.getInitials(user.name);

    const NOTIFICATIONS_BY_ROLE = {
      psicologo: [
        { title: 'Nova mensagem de Fernanda Souza', time: 'Há 12 minutos', read: false },
        { title: 'Sessão com Carlos Eduardo confirmada', time: 'Há 1 hora', read: false },
        { title: 'Lembrete: prontuário pendente', time: 'Ontem', read: true },
      ],
      paciente: [
        { title: 'Sua consulta de quinta-feira foi confirmada', time: 'Há 2 horas', read: false },
        { title: 'Novo documento disponível: Declaração de comparecimento', time: 'Ontem', read: false },
        { title: 'Pagamento da sessão de 04/08 está em atraso', time: 'Há 3 dias', read: true },
      ],
    };

    const notifications = NOTIFICATIONS_BY_ROLE[user.role] || NOTIFICATIONS_BY_ROLE.paciente;
    const unreadCount = notifications.filter((n) => !n.read).length;

    const notificationsHtml = notifications
      .map(
        (n) => `
      <div class="notification-item${n.read ? ' is-read' : ''}">
        <span class="notification-item__dot"></span>
        <div>
          <div class="notification-item__title">${n.title}</div>
          <div class="notification-item__time">${n.time}</div>
        </div>
      </div>`
      )
      .join('');

    const settingsHref =
      user.role === 'psicologo' ? `${base}pages/psicologo/configuracoes.html` : `${base}pages/paciente/configuracoes.html`;

    return `
      <header class="navbar">
        <div class="flex-gap-3" style="display:flex; align-items:center;">
          <button class="navbar__toggle btn btn--ghost btn--icon" id="sidebarToggle" aria-label="Abrir menu" aria-controls="sidebar" aria-expanded="false">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </button>
          <h1 style="font-size: var(--fs-md); font-family: var(--font-display); color: var(--color-primary-900);">${pageTitle}</h1>
        </div>
        <div class="navbar__user">

          <div class="dropdown">
            <button class="btn btn--ghost btn--icon navbar__icon-btn" aria-label="Notificações" aria-haspopup="true" aria-expanded="false" data-dropdown-toggle="notificationsPanel">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2a5 5 0 0 0-5 5v2.6c0 .5-.2 1-.5 1.4L3 13.5c-.4.5 0 1.3.7 1.3h12.6c.7 0 1.1-.8.7-1.3l-1.5-2.5a2.3 2.3 0 0 1-.5-1.4V7a5 5 0 0 0-5-5Z" stroke="currentColor" stroke-width="1.4"/><path d="M8 16.5a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.4"/></svg>
              ${unreadCount > 0 ? '<span class="navbar__icon-btn__badge" aria-hidden="true"></span>' : ''}
            </button>
            <div class="dropdown__panel" id="notificationsPanel" role="menu" aria-label="Notificações" style="right:0; width: 320px;">
              <div class="dropdown__header flex-between">
                <strong class="text-sm">Notificações</strong>
                ${unreadCount > 0 ? `<span class="badge badge--info">${unreadCount} nova${unreadCount > 1 ? 's' : ''}</span>` : ''}
              </div>
              ${notificationsHtml}
              <div class="dropdown__divider"></div>
              <a href="#" class="dropdown__item" style="justify-content:center; color: var(--color-primary-700); font-weight: var(--fw-medium);">Ver todas</a>
            </div>
          </div>

          <div class="dropdown">
            <button class="flex flex-gap-2" style="align-items:center; padding: var(--space-1); border-radius: var(--radius-md);" aria-haspopup="true" aria-expanded="false" data-dropdown-toggle="userMenuPanel">
              <div class="avatar avatar--sm" title="${user.name}">${initials}</div>
              <span class="text-sm" style="font-weight: var(--fw-medium); color: var(--color-text);">${user.name}</span>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 8l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="dropdown__panel" id="userMenuPanel" role="menu" aria-label="Menu do usuário" style="right:0; width: 240px;">
              <div class="dropdown__header">
                <div style="font-weight: var(--fw-semibold); font-size: var(--fs-sm);">${user.name}</div>
                <div class="text-faint text-xs">${user.email || ''}</div>
              </div>
              <a href="${settingsHref}" class="dropdown__item">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="2.6" stroke="currentColor" stroke-width="1.5"/><path d="M10 3v1.6M10 15.4V17M17 10h-1.6M4.6 10H3M14.9 5.1l-1.1 1.1M6.2 13.7l-1.1 1.1M14.9 14.9l-1.1-1.1M6.2 6.2 5.1 5.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                Configurações
              </a>
              <div class="dropdown__divider"></div>
              <button type="button" class="dropdown__item dropdown__item--danger" data-logout>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M8 17H4.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 13.5 17 10l-4-3.5M17 10H7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Sair
              </button>
            </div>
          </div>

        </div>
      </header>`;
  }

  window.ClarezaComponents = window.ClarezaComponents || {};
  window.ClarezaComponents.renderPublicNavbar = renderPublicNavbar;
  window.ClarezaComponents.renderAppNavbar = renderAppNavbar;
})(window);
