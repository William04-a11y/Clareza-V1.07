/* ==========================================================================
   CLAREZA v1.07 — components/sidebar.js
   Gera o HTML da sidebar de navegação interna, variando por perfil.
   ========================================================================== */

(function (window) {
  'use strict';

  const ICONS = {
    home: '<svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 9.5 10 3l7 6.5M5 8v8h10V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    calendar: '<svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3 8.5h14M7 2.5v3M13 2.5v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    patients: '<svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M2 17c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" stroke-width="1.5"/><circle cx="15" cy="6" r="2.4" stroke="currentColor" stroke-width="1.5"/><path d="M12.6 12.5c2.6.4 4.4 2.3 4.4 4.5" stroke="currentColor" stroke-width="1.5"/></svg>',
    notes: '<svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 3h7l3 3v11H5V3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M7.5 9h5M7.5 12h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    chat: '<svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 4h14v9H8l-3.5 3V13H3V4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    tasks: '<svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 6h12M4 10h12M4 14h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    profile: '<svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="7" r="3.2" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 17c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" stroke="currentColor" stroke-width="1.5"/></svg>',
    settings: '<svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="2.6" stroke="currentColor" stroke-width="1.5"/><path d="M10 3v1.6M10 15.4V17M17 10h-1.6M4.6 10H3M14.9 5.1l-1.1 1.1M6.2 13.7l-1.1 1.1M14.9 14.9l-1.1-1.1M6.2 6.2 5.1 5.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    money: '<svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M10 6v8M12.3 8.1c0-1-1-1.6-2.3-1.6-1.4 0-2.4.7-2.4 1.7 0 2.5 4.7 1.2 4.7 3.6 0 1-1 1.7-2.4 1.7-1.3 0-2.3-.6-2.3-1.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    ai: '<svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2.5 11.3 7l4.5 1.3-4.5 1.3L10 14l-1.3-4.4L4.2 8.3l4.5-1.3L10 2.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M15.8 13.5l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>',
    reports: '<svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 17V9M10 17V3M16 17v-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    documents: '<svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 2.5h7l3 3v12H5V2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 2.5V6h3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M7.5 10.5h5M7.5 13.5h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    logout: '<svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M8 17H4.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 13.5 17 10l-4-3.5M17 10H7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  /**
   * Gera o mapa de navegação por perfil, prefixando cada href com `base`
   * (caminho relativo até a raiz do projeto — necessário em file://).
   */
  function buildNavByRole(base) {
    return {
      psicologo: [
        {
          section: 'Clínico',
          links: [
            { label: 'Dashboard', href: `${base}pages/psicologo/dashboard.html`, icon: 'home', key: 'dashboard' },
            { label: 'Agenda', href: `${base}pages/psicologo/agenda.html`, icon: 'calendar', key: 'agenda' },
            { label: 'Pacientes', href: `${base}pages/psicologo/pacientes.html`, icon: 'patients', key: 'pacientes' },
            { label: 'Prontuários', href: `${base}pages/psicologo/prontuarios.html`, icon: 'notes', key: 'prontuarios' },
          ],
        },
        {
          section: 'Gestão',
          links: [
            { label: 'Financeiro', href: `${base}pages/psicologo/financeiro.html`, icon: 'money', key: 'financeiro' },
            { label: 'IA', href: `${base}pages/psicologo/ia.html`, icon: 'ai', key: 'ia' },
            { label: 'Relatórios', href: `${base}pages/psicologo/relatorios.html`, icon: 'reports', key: 'relatorios' },
            { label: 'Documentos', href: `${base}pages/psicologo/documentos.html`, icon: 'documents', key: 'documentos' },
          ],
        },
        {
          section: 'Conta',
          links: [
            { label: 'Configurações', href: `${base}pages/psicologo/configuracoes.html`, icon: 'settings', key: 'configuracoes' },
            { label: 'Sair', href: '#', icon: 'logout', key: 'logout', action: 'logout' },
          ],
        },
      ],
      paciente: [
        {
          section: 'Acompanhamento',
          links: [
            { label: 'Dashboard', href: `${base}pages/paciente/dashboard.html`, icon: 'home', key: 'dashboard' },
            { label: 'Minhas consultas', href: `${base}pages/paciente/consultas.html`, icon: 'notes', key: 'consultas' },
            { label: 'Agenda', href: `${base}pages/paciente/agenda.html`, icon: 'calendar', key: 'agenda' },
            { label: 'Meu psicólogo', href: `${base}pages/paciente/meu-psicologo.html`, icon: 'profile', key: 'psicologo' },
          ],
        },
        {
          section: 'Gestão',
          links: [
            { label: 'Documentos', href: `${base}pages/paciente/documentos.html`, icon: 'documents', key: 'documentos' },
            { label: 'Pagamentos', href: `${base}pages/paciente/pagamentos.html`, icon: 'money', key: 'pagamentos' },
            { label: 'Relatórios', href: `${base}pages/paciente/relatorios.html`, icon: 'reports', key: 'relatorios' },
            { label: 'Mensagens', href: `${base}pages/paciente/mensagens.html`, icon: 'chat', key: 'mensagens' },
          ],
        },
        {
          section: 'Conta',
          links: [
            { label: 'Configurações', href: `${base}pages/paciente/configuracoes.html`, icon: 'settings', key: 'configuracoes' },
            { label: 'Sair', href: '#', icon: 'logout', key: 'logout', action: 'logout' },
          ],
        },
      ],
    };
  }

  const LOGO_MARK = `
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="14" cy="14" r="13" stroke="currentColor" stroke-width="1.4" opacity="0.35"/>
      <circle cx="14" cy="14" r="8.5" stroke="currentColor" stroke-width="1.4" opacity="0.65"/>
      <circle cx="14" cy="14" r="4" fill="currentColor"/>
    </svg>`;

  /**
   * Renderiza a sidebar para um perfil ("psicologo" | "paciente").
   * @param {string} role
   * @param {string} activeKey - chave do link ativo (ex.: "dashboard")
   * @param {string} base - caminho relativo até a raiz do projeto
   */
  function renderSidebar(role, activeKey = '', base = '') {
    const sections = buildNavByRole(base)[role] || [];

    const sectionsHtml = sections
      .map(
        (section) => `
        <div class="sidebar__section-label">${section.section}</div>
        ${section.links
          .map(
            (link) => `
          <a href="${link.href}" class="sidebar__link${link.key === activeKey ? ' is-active' : ''}"${link.action === 'logout' ? ' data-logout' : ''}>
            ${ICONS[link.icon] || ''}
            <span>${link.label}</span>
          </a>`
          )
          .join('')}
      `
      )
      .join('');

    return `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar__brand">
          ${LOGO_MARK}
          <span>Clareza</span>
        </div>
        <nav class="sidebar__nav" aria-label="Navegação lateral">
          ${sectionsHtml}
        </nav>
        <div class="sidebar__footer">
          <span class="badge badge--neutral" style="background-color: rgba(245,247,245,0.1); color: rgba(245,247,245,0.7);">
            v1.07 · demonstração
          </span>
        </div>
      </aside>
      <div class="sidebar-overlay" id="sidebarOverlay"></div>`;
  }

  window.ClarezaComponents = window.ClarezaComponents || {};
  window.ClarezaComponents.renderSidebar = renderSidebar;
})(window);
