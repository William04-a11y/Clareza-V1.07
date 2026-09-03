/* ==========================================================================
   CLAREZA v1.07 — js/psicologo-paciente.js
   Preenche a página "Meu psicólogo" com os dados do profissional
   responsável (dado simulado em js/mock-data-paciente.js).
   ========================================================================== */

(function (window, document) {
  'use strict';

  function init() {
    const { qs, getInitials } = window.ClarezaUtils;
    if (!window.ClarezaPacienteData || !qs('#psicologoNome')) return;

    const p = window.ClarezaPacienteData.psicologo;

    qs('#psicologoAvatar').textContent = getInitials(p.name);
    qs('#psicologoNome').textContent = p.name;
    qs('#psicologoCrp').textContent = `CRP ${p.crp}`;
    qs('#psicologoEspecialidade').textContent = p.especialidade;
    qs('#psicologoBio').textContent = p.bio;

    qs('#psicologoContato').innerHTML = `
      <div class="flex-between" style="padding: var(--space-3) 0; border-bottom: 1px solid var(--color-border);">
        <span class="text-faint text-sm">E-mail</span>
        <span class="text-sm">${p.email}</span>
      </div>
      <div class="flex-between" style="padding: var(--space-3) 0; border-bottom: 1px solid var(--color-border);">
        <span class="text-faint text-sm">Telefone</span>
        <span class="text-sm text-mono">${p.phone}</span>
      </div>
      <div class="flex-between" style="padding: var(--space-3) 0; border-bottom: 1px solid var(--color-border); gap: var(--space-4);">
        <span class="text-faint text-sm">Endereço</span>
        <span class="text-sm" style="text-align:right;">${p.address}</span>
      </div>
      <div class="flex-between" style="padding: var(--space-3) 0;">
        <span class="text-faint text-sm">Atendimento</span>
        <span class="text-sm" style="text-align:right;">${p.horarios}</span>
      </div>
    `;
  }

  document.addEventListener('clareza:ready', init);
})(window, document);
