/* ==========================================================================
   CLAREZA v1.07 — js/prontuario-detalhe.js
   Tela de detalhe do prontuário eletrônico: informações gerais, sessões
   (RF11/RF12), acesso do psicólogo responsável (RF13), autorização do
   paciente (RF14), histórico de alterações (RF15), histórico de versões
   (RF16), logs de acesso (RF17) e documentos/anexos (RF18).
   Tudo simulado em Front-End puro, sem backend/banco de dados.
   ========================================================================== */

(function (window, document) {
  'use strict';

  const FIELD_LABELS = {
    number: 'Número da sessão',
    date: 'Data da sessão',
    patientReport: 'Relato do paciente',
    clinicalAnalysis: 'Análise clínica',
    therapeuticIntervention: 'Intervenção terapêutica',
    observations: 'Observações relevantes',
    nextSessionPlan: 'Planos para a próxima sessão',
    therapeuticTasks: 'Tarefas terapêuticas',
    evolution: 'Evolução terapêutica',
    freeNotes: 'Campo de texto livre',
  };

  const CHANGE_TYPE_TEXT = {
    number: 'Número da sessão alterado',
    date: 'Data da sessão alterada',
    patientReport: 'Relato do paciente atualizado',
    clinicalAnalysis: 'Análise clínica alterada',
    therapeuticIntervention: 'Intervenção terapêutica alterada',
    observations: 'Observações relevantes atualizadas',
    nextSessionPlan: 'Planos para a próxima sessão atualizados',
    therapeuticTasks: 'Tarefas terapêuticas atualizadas',
    evolution: 'Evolução terapêutica atualizada',
    freeNotes: 'Anotações livres atualizadas',
  };

  const ACCESS_TYPE_BADGE = {
    Criação: 'success',
    Edição: 'info',
    Visualização: 'neutral',
    Consulta: 'neutral',
  };

  /* Estado da página ------------------------------------------------------ */
  let recordId = null;
  let record = null;
  let activeTab = 'informacoes';
  let activeSessionId = null;
  let sessionEditing = false;
  let visitedTabs = new Set(['informacoes']);

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function reloadRecord() {
    record = window.ClarezaProntuarios.getRecordById(recordId);
    return record;
  }

  function currentUserName() {
    const session = window.ClarezaAuth && window.ClarezaAuth.getSession && window.ClarezaAuth.getSession();
    return (session && session.name) || 'Dra. Marina Costa';
  }

  function nowParts() {
    const { formatDate } = window.ClarezaUtils;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return { date: window.ClarezaProntuarios.isoDate(now), time: `${pad(now.getHours())}:${pad(now.getMinutes())}` };
  }

  /* ------------------------------------------------------------------
     Cabeçalho + banner de permissões (RF13)
     ------------------------------------------------------------------ */
  function statusBadgeHtml(status) {
    return status === 'ativo'
      ? '<span class="badge badge--success">Ativo</span>'
      : '<span class="badge badge--neutral">Arquivado</span>';
  }

  function renderHeader() {
    const { qs, getInitials } = window.ClarezaUtils;
    qs('#recordHeader').innerHTML = `
      <div class="flex flex-gap-4" style="align-items:center;">
        <div class="avatar avatar--lg">${getInitials(record.patientName)}</div>
        <div>
          <span class="eyebrow">Prontuário ${record.recordNumber}</span>
          <h2 style="margin-top: var(--space-1); margin-bottom: var(--space-1);">${record.patientName}</h2>
          <div>${statusBadgeHtml(record.status)}</div>
        </div>
      </div>
    `;
    qs('#permissionResponsibleName').textContent = record.psychologist;
  }

  /* ------------------------------------------------------------------
     Aba: Informações Gerais
     ------------------------------------------------------------------ */
  function renderInformacoes() {
    const { qs, formatDate } = window.ClarezaUtils;

    qs('#panelInformacoes').innerHTML = `
      <div class="record-section">
        <h3 class="record-section__title">Informações Gerais</h3>
        <p class="record-section__hint">Dados de identificação do paciente e do prontuário.</p>
        <div class="grid grid-2" style="gap: var(--space-4);">
          <div class="field record-field" data-readonly="true">
            <label class="field__label">Nome do paciente</label>
            <input class="input" type="text" value="${record.patientName}" readonly />
          </div>
          <div class="field record-field" data-readonly="true">
            <label class="field__label">Número do prontuário</label>
            <input class="input text-mono" type="text" value="${record.recordNumber}" readonly />
          </div>
          <div class="field record-field" data-readonly="true">
            <label class="field__label">Psicólogo responsável</label>
            <input class="input" type="text" value="${record.psychologist}" readonly />
          </div>
          <div class="field record-field" data-readonly="true">
            <label class="field__label">Criado em</label>
            <input class="input" type="text" value="${formatDate(record.createdAt)}" readonly />
          </div>
        </div>
      </div>

      <div class="record-section">
        <h3 class="record-section__title">Status do prontuário</h3>
        <p class="record-section__hint">Controla se o prontuário aparece como ativo ou arquivado na listagem.</p>
        <div class="flex flex-gap-3" style="align-items:center;">
          <select class="select" id="statusSelect" style="max-width: 220px;" ${record.status ? '' : ''}>
            <option value="ativo" ${record.status === 'ativo' ? 'selected' : ''}>Ativo</option>
            <option value="arquivado" ${record.status === 'arquivado' ? 'selected' : ''}>Arquivado</option>
          </select>
          <button type="button" class="btn btn--secondary btn--sm" id="btnSalvarStatus">Salvar status</button>
        </div>
      </div>
    `;

    const { on } = window.ClarezaUtils;
    on(qs('#btnSalvarStatus'), 'click', () => {
      const select = qs('#statusSelect');
      const novoStatus = select.value;
      if (novoStatus === record.status) return;

      window.ClarezaProntuarios.updateRecord(record.id, { status: novoStatus });
      window.ClarezaProntuarios.addChangeEntry(record.id, {
        ...nowParts(), user: currentUserName(), field: 'Status do prontuário', type: `Status alterado para "${novoStatus === 'ativo' ? 'Ativo' : 'Arquivado'}"`,
      });
      reloadRecord();
      renderHeader();
      window.ClarezaUtils.showToast('success', 'Status do prontuário atualizado.');
    });
  }

  /* ------------------------------------------------------------------
     Aba: Sessões (RF11 / RF12)
     ------------------------------------------------------------------ */
  function getActiveSession() {
    return record.sessions.find((s) => s.id === activeSessionId) || record.sessions[record.sessions.length - 1];
  }

  function renderSessionPills() {
    const pills = record.sessions
      .map((s) => `<button type="button" class="session-pill ${s.id === activeSessionId ? 'is-active' : ''}" data-session-pill="${s.id}">Sessão ${s.number}</button>`)
      .join('');
    return `<div class="session-pills">${pills}<button type="button" class="session-pill" id="btnNovaSessao">+ Nova sessão</button></div>`;
  }

  function textareaField(id, label, value, editing) {
    return `
      <div class="field">
        <label class="field__label" for="${id}">${label}</label>
        <textarea class="textarea" id="${id}" ${editing ? '' : 'readonly'}>${value || ''}</textarea>
      </div>`;
  }

  function renderSessoes() {
    const { qs, on, formatDate } = window.ClarezaUtils;

    if (!record.sessions.length) {
      qs('#panelSessoes').innerHTML = `${renderSessionPills()}<p class="text-muted text-sm">Nenhuma sessão registrada ainda. Clique em "+ Nova sessão" para começar.</p>`;
      bindNovaSessao();
      return;
    }

    if (!activeSessionId || !record.sessions.some((s) => s.id === activeSessionId)) {
      activeSessionId = record.sessions[record.sessions.length - 1].id;
    }
    const session = getActiveSession();
    const editing = sessionEditing;

    qs('#panelSessoes').innerHTML = `
      ${renderSessionPills()}

      <div class="flex-between" style="margin-bottom: var(--space-5); flex-wrap: wrap; gap: var(--space-3);">
        <h3 class="record-section__title" style="margin-bottom:0;">Registro clínico — Sessão ${session.number}</h3>
        <div class="flex flex-gap-2" id="sessionActionButtons">
          ${editing
            ? `<button type="button" class="btn btn--secondary btn--sm" id="btnCancelarSessao">Cancelar</button>
               <button type="button" class="btn btn--primary btn--sm" id="btnSalvarSessao">Salvar alterações</button>`
            : `<button type="button" class="btn btn--secondary btn--sm" id="btnEditarSessao">Editar</button>`}
        </div>
      </div>

      <div class="record-section">
        <h4 class="record-section__title" style="font-size: var(--fs-sm);">Informações da Sessão</h4>
        <div class="grid grid-2" style="gap: var(--space-4);">
          <div class="field">
            <label class="field__label" for="fieldNumeroSessao">Número da sessão</label>
            <input class="input" type="number" id="fieldNumeroSessao" min="1" value="${session.number}" ${editing ? '' : 'readonly'} />
          </div>
          <div class="field">
            <label class="field__label" for="fieldDataSessao">Data da sessão</label>
            <input class="input" type="date" id="fieldDataSessao" value="${session.date}" ${editing ? '' : 'readonly'} />
          </div>
        </div>
      </div>

      <div class="record-section">
        <h4 class="record-section__title" style="font-size: var(--fs-sm);">Registro da Sessão</h4>
        ${textareaField('fieldPatientReport', 'Relato do paciente', session.patientReport, editing)}
        ${textareaField('fieldClinicalAnalysis', 'Análise clínica', session.clinicalAnalysis, editing)}
        ${textareaField('fieldTherapeuticIntervention', 'Intervenção terapêutica', session.therapeuticIntervention, editing)}
      </div>

      <div class="record-section">
        <h4 class="record-section__title" style="font-size: var(--fs-sm);">Evolução e Planejamento</h4>
        ${textareaField('fieldObservations', 'Observações relevantes', session.observations, editing)}
        ${textareaField('fieldNextSessionPlan', 'Planos para a próxima sessão', session.nextSessionPlan, editing)}
        ${textareaField('fieldTherapeuticTasks', 'Tarefas terapêuticas', session.therapeuticTasks, editing)}
        ${textareaField('fieldEvolution', 'Evolução terapêutica', session.evolution, editing)}
      </div>

      <div class="record-section">
        <h4 class="record-section__title" style="font-size: var(--fs-sm);">Anotações Livres</h4>
        ${textareaField('fieldFreeNotes', 'Campo de texto livre', session.freeNotes, editing)}
      </div>
    `;

    on(qs('#btnEditarSessao'), 'click', () => {
      sessionEditing = true;
      renderSessoes();
    });

    const cancelBtn = qs('#btnCancelarSessao');
    if (cancelBtn) {
      on(cancelBtn, 'click', () => {
        sessionEditing = false;
        renderSessoes();
        window.ClarezaUtils.showToast('info', 'Alterações descartadas.');
      });
    }

    const saveBtn = qs('#btnSalvarSessao');
    if (saveBtn) {
      on(saveBtn, 'click', () => saveActiveSession());
    }

    qs('#panelSessoes').querySelectorAll('[data-session-pill]').forEach((pill) => {
      on(pill, 'click', () => {
        if (sessionEditing && !window.confirm('Existem alterações não salvas nesta sessão. Deseja descartá-las e trocar de sessão?')) return;
        activeSessionId = pill.getAttribute('data-session-pill');
        sessionEditing = false;
        renderSessoes();
      });
    });

    bindNovaSessao();
  }

  function bindNovaSessao() {
    const { qs, on, showToast } = window.ClarezaUtils;
    const btn = qs('#btnNovaSessao');
    if (!btn) return;
    on(btn, 'click', () => {
      const nextNumber = record.sessions.length ? Math.max(...record.sessions.map((s) => s.number)) + 1 : 1;
      const novaSessao = window.ClarezaProntuarios.blankSession(nextNumber, window.ClarezaProntuarios.isoDate(new Date()));
      window.ClarezaProntuarios.addSession(record.id, novaSessao);
      window.ClarezaProntuarios.addChangeEntry(record.id, {
        ...nowParts(), user: currentUserName(), field: 'Registro da sessão', type: 'Nova sessão adicionada',
      });
      window.ClarezaProntuarios.addAccessLog(record.id, {
        ...nowParts(), user: currentUserName(), type: 'Criação', action: 'Criação de nova sessão',
      });

      reloadRecord();
      activeSessionId = novaSessao.id;
      sessionEditing = true;
      renderSessoes();
      showToast('success', `Sessão ${nextNumber} criada. Preencha os campos e salve para registrar.`);
    });
  }

  function saveActiveSession() {
    const { qs, showToast } = window.ClarezaUtils;
    const session = getActiveSession();

    const newValues = {
      number: Number(qs('#fieldNumeroSessao').value) || session.number,
      date: qs('#fieldDataSessao').value || session.date,
      patientReport: qs('#fieldPatientReport').value,
      clinicalAnalysis: qs('#fieldClinicalAnalysis').value,
      therapeuticIntervention: qs('#fieldTherapeuticIntervention').value,
      observations: qs('#fieldObservations').value,
      nextSessionPlan: qs('#fieldNextSessionPlan').value,
      therapeuticTasks: qs('#fieldTherapeuticTasks').value,
      evolution: qs('#fieldEvolution').value,
      freeNotes: qs('#fieldFreeNotes').value,
    };

    const changedFields = Object.keys(newValues).filter((key) => String(newValues[key]) !== String(session[key]));

    if (!changedFields.length) {
      sessionEditing = false;
      renderSessoes();
      showToast('info', 'Nenhuma alteração para salvar.');
      return;
    }

    // Guarda uma versão com o estado ANTERIOR à edição (RF16).
    const previousSnapshot = {};
    changedFields.forEach((key) => { previousSnapshot[key] = session[key]; });

    window.ClarezaProntuarios.updateSession(record.id, session.id, newValues);

    changedFields.forEach((key) => {
      window.ClarezaProntuarios.addChangeEntry(record.id, {
        ...nowParts(),
        user: currentUserName(),
        field: FIELD_LABELS[key] || key,
        type: CHANGE_TYPE_TEXT[key] || `${FIELD_LABELS[key] || key} atualizado(a)`,
      });
    });

    window.ClarezaProntuarios.addVersion(record.id, {
      ...nowParts(),
      responsible: currentUserName(),
      description: `Alteração de: ${changedFields.map((k) => FIELD_LABELS[k] || k).join(', ')}.`,
      sessionId: session.id,
      snapshot: previousSnapshot,
    });

    window.ClarezaProntuarios.addAccessLog(record.id, {
      ...nowParts(), user: currentUserName(), type: 'Edição', action: 'Edição do prontuário',
    });

    reloadRecord();
    sessionEditing = false;
    renderSessoes();
    renderHeader();
    showToast('success', 'Alterações salvas com sucesso.');
  }

  /* ------------------------------------------------------------------
     Aba: Histórico de Alterações (RF15)
     ------------------------------------------------------------------ */
  function renderAlteracoes() {
    const { qs, formatDate } = window.ClarezaUtils;
    const entries = record.changeHistory;

    if (!entries.length) {
      qs('#panelAlteracoes').innerHTML = emptyStateHtml('Nenhuma alteração registrada ainda.');
      return;
    }

    qs('#panelAlteracoes').innerHTML = `
      <div class="record-section">
        <h3 class="record-section__title">Histórico de Alterações</h3>
        <p class="record-section__hint">Registro cronológico das modificações realizadas neste prontuário.</p>
        <div class="timeline">
          ${entries.map((e) => `
            <div class="timeline-item">
              <span class="timeline-item__dot"></span>
              <div class="timeline-item__meta">${formatDate(e.date)} · ${e.time} · ${e.user}</div>
              <div class="timeline-item__title">${e.type}</div>
              <div class="timeline-item__sub">Campo: ${e.field}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------
     Aba: Histórico de Versões (RF16)
     ------------------------------------------------------------------ */
  function renderVersoes() {
    const { qs, on, formatDate } = window.ClarezaUtils;
    const versions = [...record.versions].sort((a, b) => b.version - a.version);

    if (!versions.length) {
      qs('#panelVersoes').innerHTML = emptyStateHtml('Nenhuma versão registrada ainda.');
      return;
    }

    qs('#panelVersoes').innerHTML = `
      <div class="record-section">
        <h3 class="record-section__title">Histórico de Versões</h3>
        <p class="record-section__hint">Compare qualquer versão anterior com o conteúdo atual da sessão correspondente.</p>
        <div class="version-list">
          ${versions.map((v) => `
            <div class="version-item">
              <div>
                <div class="version-item__label">Versão ${v.version}${v.isCurrent ? ' · atual' : ''}</div>
                <div class="version-item__desc">${v.description}</div>
                <div class="text-faint text-xs" style="margin-top:4px;">${formatDate(v.date)} · ${v.time} · ${v.responsible}</div>
              </div>
              ${v.isCurrent
                ? '<span class="badge badge--info">Versão atual</span>'
                : `<button type="button" class="btn btn--ghost btn--sm" data-compare-version="${v.id}">Comparar com atual</button>`}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    qs('#panelVersoes').querySelectorAll('[data-compare-version]').forEach((btn) => {
      on(btn, 'click', () => openVersionCompare(btn.getAttribute('data-compare-version')));
    });
  }

  function openVersionCompare(versionId) {
    const { qs } = window.ClarezaUtils;
    const version = record.versions.find((v) => v.id === versionId);
    if (!version) return;

    const session = record.sessions.find((s) => s.id === version.sessionId) || getActiveSession();
    const snapshot = version.snapshot || {};
    const fieldKeys = Object.keys(snapshot).length ? Object.keys(snapshot) : ['clinicalAnalysis', 'evolution', 'observations'];

    const oldColumn = fieldKeys.map((key) => `
      <div class="version-compare__field is-diff">
        <div class="version-compare__field-label">${FIELD_LABELS[key] || key}</div>
        <div class="version-compare__field-value">${snapshot[key] || '<span class="text-faint">Vazio</span>'}</div>
      </div>`).join('');

    const newColumn = fieldKeys.map((key) => `
      <div class="version-compare__field ${snapshot[key] !== session[key] ? 'is-diff' : ''}">
        <div class="version-compare__field-label">${FIELD_LABELS[key] || key}</div>
        <div class="version-compare__field-value">${session[key] || '<span class="text-faint">Vazio</span>'}</div>
      </div>`).join('');

    qs('#modalCompararVersaoTitle').textContent = `Comparar Versão ${version.version} com a versão atual`;
    qs('#modalCompararVersaoBody').innerHTML = `
      <div class="version-compare">
        <div class="version-compare__col">
          <div class="version-compare__heading">Versão ${version.version} (${window.ClarezaUtils.formatDate(version.date)})</div>
          ${oldColumn}
        </div>
        <div class="version-compare__col version-compare__col--current">
          <div class="version-compare__heading">Versão atual</div>
          ${newColumn}
        </div>
      </div>
    `;

    window.ClarezaModal.openModal('modalCompararVersao');
  }

  /* ------------------------------------------------------------------
     Aba: Logs de Acesso (RF17)
     ------------------------------------------------------------------ */
  function renderLogs() {
    const { qs, formatDate } = window.ClarezaUtils;
    const logs = record.accessLogs;

    if (!logs.length) {
      qs('#panelLogs').innerHTML = emptyStateHtml('Nenhum acesso registrado ainda.');
      return;
    }

    qs('#panelLogs').innerHTML = `
      <div class="record-section">
        <h3 class="record-section__title">Logs de Acesso</h3>
        <p class="record-section__hint">Registro de todos os acessos e ações realizadas neste prontuário.</p>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr><th>Data</th><th>Horário</th><th>Usuário</th><th>Tipo</th><th>Ação realizada</th></tr>
            </thead>
            <tbody>
              ${logs.map((l) => `
                <tr>
                  <td class="text-muted">${formatDate(l.date)}</td>
                  <td class="text-muted text-mono">${l.time}</td>
                  <td>${l.user}</td>
                  <td><span class="badge badge--${ACCESS_TYPE_BADGE[l.type] || 'neutral'}">${l.type}</span></td>
                  <td class="text-muted">${l.action}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------
     Aba: Documentos e Anexos (RF18)
     ------------------------------------------------------------------ */
  const DOC_ICONS = {
    PDF: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 2.5h7l3 3v12H5V2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M7.5 9h5M7.5 12h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    DOCX: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 2.5h7l3 3v12H5V2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M7.5 9h5M7.5 12h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    IMG: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" stroke-width="1.5"/><circle cx="7.5" cy="8.5" r="1.3" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 14 8.5 10.5 11 12.5 13 10.5 15.5 13" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    OUTRO: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 2.5h7l3 3v12H5V2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  };

  function docTypeFromName(name) {
    const ext = (name.split('.').pop() || '').toUpperCase();
    if (ext === 'PDF') return 'PDF';
    if (['DOC', 'DOCX'].includes(ext)) return 'DOCX';
    if (['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP'].includes(ext)) return 'IMG';
    return ext || 'OUTRO';
  }

  function renderDocumentos() {
    const { qs, on, formatDate, formatFileSize, showToast } = window.ClarezaUtils;
    const docs = record.documents;

    qs('#panelDocumentos').innerHTML = `
      <div class="record-section">
        <h3 class="record-section__title">Documentos e Anexos</h3>
        <p class="record-section__hint">Anexe laudos, atestados ou outros documentos relacionados ao acompanhamento. Nesta versão, o upload é apenas uma simulação Front-End — nenhum arquivo é armazenado em servidor.</p>

        <div class="dropzone" id="dropzone" tabindex="0" role="button" aria-label="Selecionar ou arrastar um documento">
          <div class="dropzone__icon">
            <svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 13V4M10 4 6.5 7.5M10 4l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 13.5V15a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </div>
          <div class="dropzone__title">Arraste um arquivo aqui ou clique para selecionar</div>
          <div class="dropzone__hint">Simulação Front-End — apenas o nome, tipo e tamanho do arquivo são exibidos.</div>
          <input type="file" id="fileInput" style="display:none;" multiple />
        </div>

        <div class="document-list" id="documentList">
          ${docs.length ? docs.map((d) => documentItemHtml(d)).join('') : '<p class="text-muted text-sm" style="margin-top: var(--space-4);">Nenhum documento anexado ainda.</p>'}
        </div>
      </div>
    `;

    function documentItemHtml(d) {
      return `
        <div class="document-item" data-doc-id="${d.id}">
          <div class="document-item__icon">${DOC_ICONS[d.type] || DOC_ICONS.OUTRO}</div>
          <div>
            <div class="document-item__name">${d.name}</div>
            <div class="document-item__meta">${d.type} · ${formatDate(d.date)} · ${formatFileSize(d.size)}</div>
          </div>
          <div class="document-item__actions">
            <button type="button" class="btn btn--ghost btn--sm" data-doc-view="${d.id}">Visualizar</button>
            <button type="button" class="btn btn--ghost btn--sm" data-doc-download="${d.id}">Baixar</button>
            <button type="button" class="btn btn--ghost btn--sm" data-doc-remove="${d.id}" style="color: var(--color-danger);">Remover</button>
          </div>
        </div>`;
    }

    function handleFiles(fileList) {
      const files = Array.from(fileList || []);
      if (!files.length) return;

      files.forEach((file) => {
        window.ClarezaProntuarios.addDocument(record.id, {
          name: file.name,
          type: docTypeFromName(file.name),
          date: window.ClarezaProntuarios.isoDate(new Date()),
          size: file.size,
        });
      });

      window.ClarezaProntuarios.addAccessLog(record.id, {
        ...nowParts(), user: currentUserName(), type: 'Edição', action: `Documento${files.length > 1 ? 's' : ''} anexado${files.length > 1 ? 's' : ''} ao prontuário`,
      });

      reloadRecord();
      renderDocumentos();
      showToast('success', `${files.length} documento${files.length > 1 ? 's' : ''} anexado${files.length > 1 ? 's' : ''} com sucesso.`);
    }

    const dropzone = qs('#dropzone');
    const fileInput = qs('#fileInput');

    on(dropzone, 'click', () => fileInput.click());
    on(dropzone, 'keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); fileInput.click(); }
    });
    on(fileInput, 'change', () => handleFiles(fileInput.files));

    ['dragenter', 'dragover'].forEach((evt) => on(dropzone, evt, (event) => {
      event.preventDefault();
      dropzone.classList.add('is-dragover');
    }));
    ['dragleave', 'drop'].forEach((evt) => on(dropzone, evt, (event) => {
      event.preventDefault();
      dropzone.classList.remove('is-dragover');
    }));
    on(dropzone, 'drop', (event) => {
      if (event.dataTransfer && event.dataTransfer.files) handleFiles(event.dataTransfer.files);
    });

    qs('#documentList').querySelectorAll('[data-doc-view]').forEach((btn) => {
      on(btn, 'click', () => {
        const doc = docs.find((d) => d.id === btn.getAttribute('data-doc-view'));
        if (!doc) return;
        qs('#modalDocumentoTitle').textContent = doc.name;
        qs('#modalDocumentoBody').innerHTML = `
          <div class="grid grid-2" style="gap: var(--space-4);">
            <div><div class="text-faint text-xs">Tipo</div><div class="text-sm">${doc.type}</div></div>
            <div><div class="text-faint text-xs">Tamanho</div><div class="text-sm">${formatFileSize(doc.size)}</div></div>
            <div><div class="text-faint text-xs">Data</div><div class="text-sm">${formatDate(doc.date)}</div></div>
          </div>
          <p class="text-muted text-sm" style="margin-top: var(--space-4);">Pré-visualização não disponível nesta versão de demonstração — apenas metadados do arquivo são simulados.</p>
        `;
        window.ClarezaModal.openModal('modalDocumento');
      });
    });

    qs('#documentList').querySelectorAll('[data-doc-download]').forEach((btn) => {
      on(btn, 'click', () => showToast('info', 'Download simulado — esta versão não realiza armazenamento real de arquivos.'));
    });

    qs('#documentList').querySelectorAll('[data-doc-remove]').forEach((btn) => {
      on(btn, 'click', () => {
        const docId = btn.getAttribute('data-doc-remove');
        if (!window.confirm('Remover este documento do prontuário?')) return;
        window.ClarezaProntuarios.removeDocument(record.id, docId);
        window.ClarezaProntuarios.addAccessLog(record.id, {
          ...nowParts(), user: currentUserName(), type: 'Edição', action: 'Documento removido do prontuário',
        });
        reloadRecord();
        renderDocumentos();
        showToast('success', 'Documento removido.');
      });
    });
  }

  /* ------------------------------------------------------------------
     Aba: Controle de Acesso do paciente (RF14)
     ------------------------------------------------------------------ */
  function renderAcesso() {
    const { qs, on, showToast } = window.ClarezaUtils;
    const authorized = record.accessAuthorized;

    qs('#panelAcesso').innerHTML = `
      <div class="record-section">
        <h3 class="record-section__title">Controle de Acesso</h3>
        <p class="record-section__hint">O paciente só pode visualizar este prontuário mediante autorização explícita do psicólogo responsável. Simulação — não há compartilhamento real de dados nesta versão.</p>

        <div class="access-status-card">
          <div class="flex flex-gap-4" style="align-items:center;">
            <span class="badge badge--${authorized ? 'success' : 'neutral'}" id="accessStatusBadge">
              ${authorized ? 'Paciente autorizado' : 'Paciente sem autorização'}
            </span>
            <span class="text-muted text-sm">${record.patientName}</span>
          </div>
          <label class="flex flex-gap-3" style="align-items:center; cursor:pointer;">
            <span class="text-sm text-muted">${authorized ? 'Revogar acesso ao paciente' : 'Autorizar acesso ao paciente'}</span>
            <span class="switch">
              <input type="checkbox" id="accessToggle" ${authorized ? 'checked' : ''} />
              <span class="switch__track"></span>
            </span>
          </label>
        </div>
      </div>
    `;

    on(qs('#accessToggle'), 'change', (event) => {
      const novoValor = event.target.checked;
      window.ClarezaProntuarios.setAccessAuthorization(record.id, novoValor);
      window.ClarezaProntuarios.addAccessLog(record.id, {
        ...nowParts(),
        user: currentUserName(),
        type: 'Edição',
        action: novoValor ? 'Acesso do paciente autorizado' : 'Acesso do paciente revogado',
      });

      reloadRecord();
      renderAcesso();
      showToast('success', novoValor ? 'Acesso do paciente autorizado.' : 'Acesso do paciente revogado.');
    });
  }

  /* ------------------------------------------------------------------
     Utilidades gerais
     ------------------------------------------------------------------ */
  function emptyStateHtml(message) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg width="26" height="26" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M10 6.5v4M10 13.2h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <div class="empty-state__title">${message}</div>
      </div>`;
  }

  const TAB_RENDERERS = {
    informacoes: renderInformacoes,
    sessoes: renderSessoes,
    alteracoes: renderAlteracoes,
    versoes: renderVersoes,
    logs: renderLogs,
    documentos: renderDocumentos,
    acesso: renderAcesso,
  };

  const TAB_VISIT_LOG_ACTION = {
    sessoes: 'Consulta às sessões do prontuário',
    alteracoes: 'Consulta ao histórico de alterações',
    versoes: 'Consulta ao histórico de versões',
    logs: 'Consulta aos logs de acesso',
    documentos: 'Consulta aos documentos e anexos',
    acesso: 'Consulta ao controle de acesso',
  };

  function switchTab(tab) {
    if (sessionEditing && activeTab === 'sessoes' && tab !== 'sessoes') {
      if (!window.confirm('Existem alterações não salvas na sessão. Deseja sair sem salvar?')) return;
      sessionEditing = false;
    }

    activeTab = tab;
    const { qsa, qs } = window.ClarezaUtils;

    qsa('.tab[data-tab]').forEach((btn) => btn.classList.toggle('is-active', btn.getAttribute('data-tab') === tab));
    qsa('.tab-panel[data-tab-panel]').forEach((panel) => {
      panel.hidden = panel.getAttribute('data-tab-panel') !== tab;
    });

    // RF17 — registra dinamicamente a primeira visita a cada aba na sessão de demonstração.
    if (!visitedTabs.has(tab) && TAB_VISIT_LOG_ACTION[tab]) {
      visitedTabs.add(tab);
      window.ClarezaProntuarios.addAccessLog(record.id, {
        ...nowParts(), user: currentUserName(), type: 'Visualização', action: TAB_VISIT_LOG_ACTION[tab],
      });
      reloadRecord();
    }

    if (TAB_RENDERERS[tab]) TAB_RENDERERS[tab]();
  }

  function bindTabs() {
    const { qsa, on } = window.ClarezaUtils;
    qsa('.tab[data-tab]').forEach((btn) => {
      on(btn, 'click', () => switchTab(btn.getAttribute('data-tab')));
    });
  }

  /* ------------------------------------------------------------------
     Inicialização
     ------------------------------------------------------------------ */
  function init() {
    const { qs } = window.ClarezaUtils;
    if (!window.ClarezaProntuarios || !qs('#recordHeader')) return;

    recordId = getParam('id');
    record = window.ClarezaProntuarios.getRecordById(recordId);

    if (!record) {
      qs('#recordNotFound').hidden = false;
      qs('#recordHeader').hidden = true;
      qs('#permissionBanner').hidden = true;
      qs('#recordTabs').hidden = true;
      qs('#recordPanels').hidden = true;
      return;
    }

    // Loga a visualização inicial do prontuário (RF17).
    window.ClarezaProntuarios.addAccessLog(record.id, {
      ...nowParts(), user: currentUserName(), type: 'Visualização', action: 'Visualização do prontuário',
    });
    reloadRecord();

    renderHeader();
    bindTabs();
    renderInformacoes();

    if (getParam('editar') === '1') {
      switchTab('sessoes');
      sessionEditing = true;
      renderSessoes();
    }
  }

  document.addEventListener('clareza:ready', init);
})(window, document);
