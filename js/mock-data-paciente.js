/* ==========================================================================
   CLAREZA v1.07 — js/mock-data-paciente.js
   Fonte única de dados simulados do ambiente do paciente: consultas,
   documentos, pagamentos e avisos. Persistido em localStorage para que
   ações do usuário (solicitar consulta, etc.) fiquem consistentes entre
   as páginas, sem qualquer backend.
   ========================================================================== */

(function (window) {
  'use strict';

  const { storage, uid } = window.ClarezaUtils;

  const CONSULTAS_KEY = 'paciente_consultas';
  const DOCUMENTOS_KEY = 'paciente_documentos';
  const PAGAMENTOS_KEY = 'paciente_pagamentos';
  const AVISOS_KEY = 'paciente_avisos';

  /* Helpers de data ------------------------------------------------------- */
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function isoDate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /* Psicólogo responsável (dado estático de demonstração) ----------------- */
  const psicologo = {
    name: 'Dra. Marina Costa',
    crp: '06/123456',
    especialidade: 'Terapia Cognitivo-Comportamental (TCC)',
    bio: 'Psicóloga clínica com mais de 10 anos de experiência no acompanhamento de ansiedade, estresse e transições de vida. Atendimentos online e presenciais.',
    email: 'marina.costa@clareza.demo',
    phone: '(11) 4002-8899',
    address: 'Av. Paulista, 1000 — Conjunto 1204, São Paulo/SP',
    horarios: 'Segunda a sexta, das 08h às 19h',
  };

  /* Seeds ------------------------------------------------------------------- */
  function seedConsultas() {
    if (storage.get(CONSULTAS_KEY, []).length) return;

    const today = new Date();

    storage.set(CONSULTAS_KEY, [
      { id: uid('cst'), date: isoDate(addDays(today, 3)), time: '15:30', professional: psicologo.name, modality: 'Online', status: 'confirmada', notes: 'Sessão de acompanhamento quinzenal.' },
      { id: uid('cst'), date: isoDate(addDays(today, 10)), time: '15:30', professional: psicologo.name, modality: 'Online', status: 'confirmada', notes: '' },
      { id: uid('cst'), date: isoDate(addDays(today, -1)), time: '15:30', professional: psicologo.name, modality: 'Presencial', status: 'concluida', notes: 'Sessão concluída. Tema: manejo de ansiedade no trabalho.' },
      { id: uid('cst'), date: isoDate(addDays(today, -8)), time: '15:30', professional: psicologo.name, modality: 'Online', status: 'concluida', notes: 'Sessão concluída. Revisão de metas do mês.' },
      { id: uid('cst'), date: isoDate(addDays(today, -15)), time: '10:00', professional: psicologo.name, modality: 'Presencial', status: 'concluida', notes: 'Sessão concluída.' },
      { id: uid('cst'), date: isoDate(addDays(today, -22)), time: '10:00', professional: psicologo.name, modality: 'Online', status: 'cancelada', notes: 'Consulta cancelada a pedido do paciente.' },
      { id: uid('cst'), date: isoDate(addDays(today, -29)), time: '10:00', professional: psicologo.name, modality: 'Presencial', status: 'concluida', notes: 'Primeira sessão de avaliação.' },
    ]);
  }

  function seedDocumentos() {
    if (storage.get(DOCUMENTOS_KEY, []).length) return;

    const today = new Date();

    storage.set(DOCUMENTOS_KEY, [
      { id: uid('doc'), name: 'Declaração de comparecimento — Agosto', type: 'Declaração', date: isoDate(addDays(today, -1)), status: 'disponivel' },
      { id: uid('doc'), name: 'Recibo de pagamento — Sessão 12/08', type: 'Recibo', date: isoDate(addDays(today, -8)), status: 'disponivel' },
      { id: uid('doc'), name: 'Plano terapêutico inicial', type: 'Laudo', date: isoDate(addDays(today, -29)), status: 'disponivel' },
      { id: uid('doc'), name: 'Recibo de pagamento — Sessão 29/07', type: 'Recibo', date: isoDate(addDays(today, -29)), status: 'disponivel' },
      { id: uid('doc'), name: 'Atestado de acompanhamento psicológico', type: 'Atestado', date: isoDate(addDays(today, -22)), status: 'pendente' },
    ]);
  }

  function seedPagamentos() {
    if (storage.get(PAGAMENTOS_KEY, []).length) return;

    const today = new Date();

    storage.set(PAGAMENTOS_KEY, [
      { id: uid('pag'), reference: 'Sessão de 25/08', value: 180, date: isoDate(addDays(today, -1)), status: 'pago' },
      { id: uid('pag'), reference: 'Sessão de 18/08', value: 180, date: isoDate(addDays(today, -8)), status: 'pago' },
      { id: uid('pag'), reference: 'Sessão de 11/08', value: 180, date: isoDate(addDays(today, -15)), status: 'pago' },
      { id: uid('pag'), reference: 'Sessão de 31/08', value: 180, date: isoDate(addDays(today, 3)), status: 'pendente' },
      { id: uid('pag'), reference: 'Sessão de 04/08', value: 180, date: isoDate(addDays(today, -22)), status: 'atrasado' },
    ]);
  }

  function seedAvisos() {
    if (storage.get(AVISOS_KEY, []).length) return;

    storage.set(AVISOS_KEY, [
      { id: uid('avi'), type: 'info', title: 'Consulta confirmada', message: 'Sua próxima consulta foi confirmada pela Dra. Marina Costa.' },
      { id: uid('avi'), type: 'warning', title: 'Pagamento em aberto', message: 'Há um pagamento pendente referente à sessão de 04/08. Regularize para manter seu histórico em dia.' },
      { id: uid('avi'), type: 'success', title: 'Novo documento disponível', message: 'A declaração de comparecimento de agosto já está disponível para download.' },
    ]);
  }

  function seedAll() {
    seedConsultas();
    seedDocumentos();
    seedPagamentos();
    seedAvisos();
  }

  /* Consultas ----------------------------------------------------------------- */
  function getConsultas() {
    return storage.get(CONSULTAS_KEY, []);
  }

  function getConsultaById(id) {
    return getConsultas().find((c) => c.id === id) || null;
  }

  function addConsulta(consulta) {
    const list = getConsultas();
    const newConsulta = Object.assign({ id: uid('cst'), professional: psicologo.name, status: 'pendente' }, consulta);
    list.push(newConsulta);
    storage.set(CONSULTAS_KEY, list);
    return newConsulta;
  }

  function updateConsulta(id, patch) {
    const list = getConsultas();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) return null;
    list[index] = Object.assign({}, list[index], patch);
    storage.set(CONSULTAS_KEY, list);
    return list[index];
  }

  /* Documentos ------------------------------------------------------------------ */
  function getDocumentos() {
    return storage.get(DOCUMENTOS_KEY, []);
  }

  function getDocumentoById(id) {
    return getDocumentos().find((d) => d.id === id) || null;
  }

  /* Pagamentos -------------------------------------------------------------------- */
  function getPagamentos() {
    return storage.get(PAGAMENTOS_KEY, []);
  }

  function getPagamentoById(id) {
    return getPagamentos().find((p) => p.id === id) || null;
  }

  /* Avisos ------------------------------------------------------------------------- */
  function getAvisos() {
    return storage.get(AVISOS_KEY, []);
  }

  window.ClarezaPacienteData = {
    seedAll,
    isoDate,
    addDays,
    psicologo,
    getConsultas,
    getConsultaById,
    addConsulta,
    updateConsulta,
    getDocumentos,
    getDocumentoById,
    getPagamentos,
    getPagamentoById,
    getAvisos,
  };
})(window);
