/* ==========================================================================
   CLAREZA v1.07 — js/mock-data.js
   Fonte única de dados simulados (pacientes e agendamentos) usada pelas
   páginas do psicólogo (Dashboard, Agenda, Pacientes). Persistido em
   localStorage para que ações do usuário (nova consulta, etc.) sejam
   refletidas de forma consistente entre as páginas, sem qualquer backend.
   ========================================================================== */

(function (window) {
  'use strict';

  const { storage, uid } = window.ClarezaUtils;

  const PATIENTS_KEY = 'patients';
  const APPOINTMENTS_KEY = 'appointments';

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

  /* Seeds ------------------------------------------------------------------
     Gerados com datas relativas a "hoje" para que a agenda e o dashboard
     sempre mostrem uma semana plausível, não importa quando o navegador
     abrir o projeto. */
  function seedPatients() {
    if (storage.get(PATIENTS_KEY, []).length) return;

    const today = new Date();

    storage.set(PATIENTS_KEY, [
      { id: 'pac_1', name: 'Ana Beatriz Lima', email: 'ana.lima@email.com', phone: '(11) 98221-4455', lastSession: isoDate(addDays(today, -3)), status: 'ativo' },
      { id: 'pac_2', name: 'Carlos Eduardo Melo', email: 'carlos.melo@email.com', phone: '(11) 99887-2210', lastSession: isoDate(addDays(today, -7)), status: 'ativo' },
      { id: 'pac_3', name: 'Fernanda Souza', email: 'fernanda.souza@email.com', phone: '(21) 98123-7788', lastSession: isoDate(today), status: 'ativo' },
      { id: 'pac_4', name: 'João Pedro Alves', email: 'joao.alves@email.com', phone: '(31) 99456-1122', lastSession: isoDate(addDays(today, -14)), status: 'ativo' },
      { id: 'pac_5', name: 'Rafael Andrade', email: 'paciente@clareza.demo', phone: '(11) 97744-3321', lastSession: isoDate(addDays(today, -1)), status: 'ativo' },
      { id: 'pac_6', name: 'Beatriz Nogueira', email: 'beatriz.nogueira@email.com', phone: '(41) 98776-5544', lastSession: isoDate(addDays(today, -30)), status: 'inativo' },
      { id: 'pac_7', name: 'Lucas Martins', email: 'lucas.martins@email.com', phone: '(51) 99221-8890', lastSession: isoDate(addDays(today, -21)), status: 'inativo' },
      { id: 'pac_8', name: 'Camila Ribeiro', email: 'camila.ribeiro@email.com', phone: '(11) 98899-4432', lastSession: isoDate(addDays(today, -2)), status: 'ativo' },
    ]);
  }

  function seedAppointments() {
    if (storage.get(APPOINTMENTS_KEY, []).length) return;

    const today = new Date();

    storage.set(APPOINTMENTS_KEY, [
      { id: uid('apt'), patientId: 'pac_1', patientName: 'Ana Beatriz Lima', date: isoDate(today), time: '09:00', modality: 'Online', status: 'confirmada', notes: 'Sessão de acompanhamento semanal.' },
      { id: uid('apt'), patientId: 'pac_2', patientName: 'Carlos Eduardo Melo', date: isoDate(today), time: '10:30', modality: 'Presencial', status: 'confirmada', notes: 'Retorno após pausa de 2 semanas.' },
      { id: uid('apt'), patientId: 'pac_3', patientName: 'Fernanda Souza', date: isoDate(today), time: '13:00', modality: 'Online', status: 'pendente', notes: 'Aguardando confirmação do paciente.' },
      { id: uid('apt'), patientId: 'pac_4', patientName: 'João Pedro Alves', date: isoDate(today), time: '15:30', modality: 'Online', status: 'confirmada', notes: '' },
      { id: uid('apt'), patientId: 'pac_5', patientName: 'Rafael Andrade', date: isoDate(today), time: '17:00', modality: 'Presencial', status: 'cancelada', notes: 'Paciente pediu para remarcar.' },
      { id: uid('apt'), patientId: 'pac_8', patientName: 'Camila Ribeiro', date: isoDate(addDays(today, 1)), time: '09:30', modality: 'Online', status: 'confirmada', notes: '' },
      { id: uid('apt'), patientId: 'pac_1', patientName: 'Ana Beatriz Lima', date: isoDate(addDays(today, 1)), time: '11:00', modality: 'Online', status: 'pendente', notes: '' },
      { id: uid('apt'), patientId: 'pac_2', patientName: 'Carlos Eduardo Melo', date: isoDate(addDays(today, 2)), time: '14:00', modality: 'Presencial', status: 'confirmada', notes: '' },
      { id: uid('apt'), patientId: 'pac_4', patientName: 'João Pedro Alves', date: isoDate(addDays(today, 3)), time: '10:00', modality: 'Online', status: 'confirmada', notes: '' },
      { id: uid('apt'), patientId: 'pac_3', patientName: 'Fernanda Souza', date: isoDate(addDays(today, -1)), time: '16:00', modality: 'Online', status: 'realizada', notes: 'Sessão concluída, prontuário atualizado.' },
      { id: uid('apt'), patientId: 'pac_5', patientName: 'Rafael Andrade', date: isoDate(addDays(today, -2)), time: '09:00', modality: 'Presencial', status: 'realizada', notes: '' },
      { id: uid('apt'), patientId: 'pac_1', patientName: 'Ana Beatriz Lima', date: isoDate(addDays(today, -4)), time: '13:30', modality: 'Online', status: 'realizada', notes: '' },
      { id: uid('apt'), patientId: 'pac_8', patientName: 'Camila Ribeiro', date: isoDate(addDays(today, 4)), time: '15:00', modality: 'Online', status: 'confirmada', notes: '' },
      { id: uid('apt'), patientId: 'pac_2', patientName: 'Carlos Eduardo Melo', date: isoDate(addDays(today, -6)), time: '11:30', modality: 'Presencial', status: 'cancelada', notes: 'Paciente cancelou por motivo pessoal.' },
    ]);
  }

  function seedAll() {
    seedPatients();
    seedAppointments();
  }

  /* Pacientes --------------------------------------------------------------- */
  function getPatients() {
    return storage.get(PATIENTS_KEY, []);
  }

  function getPatientById(id) {
    return getPatients().find((p) => p.id === id) || null;
  }

  /* Agendamentos -------------------------------------------------------------- */
  function getAppointments() {
    return storage.get(APPOINTMENTS_KEY, []);
  }

  function getAppointmentById(id) {
    return getAppointments().find((a) => a.id === id) || null;
  }

  function addAppointment(appointment) {
    const list = getAppointments();
    const newAppointment = Object.assign({ id: uid('apt'), status: 'confirmada' }, appointment);
    list.push(newAppointment);
    storage.set(APPOINTMENTS_KEY, list);
    return newAppointment;
  }

  function updateAppointment(id, patch) {
    const list = getAppointments();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) return null;
    list[index] = Object.assign({}, list[index], patch);
    storage.set(APPOINTMENTS_KEY, list);
    return list[index];
  }

  function deleteAppointment(id) {
    storage.set(APPOINTMENTS_KEY, getAppointments().filter((a) => a.id !== id));
  }

  window.ClarezaMockData = {
    seedAll,
    isoDate,
    addDays,
    getPatients,
    getPatientById,
    getAppointments,
    getAppointmentById,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  };
})(window);
